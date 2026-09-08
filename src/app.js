/* ============================================================
 * 原神圣遗物锁定方案生成器 —— 逻辑层
 * ============================================================ */
'use strict';

const STORE_KEY = 'genshin_artifact_lock_v1';

/* 权重常量 */
const W_PRIORITY   = { main: 1.0, alt: 0.55 };   // 主推 / 备选配装
const W_SET_COUNT  = { 1: 1.0, 2: 0.8 };         // 4件套 / 2+2
const W_RANK       = { 1: 1.0, 2: 0.5, 3: 0.25 };// 主词条优先级
const TIER_KEEP    = 0.8;                        // ≥ 视为必留
const TIER_TRANS   = 0.4;                        // ≥ 视为过渡
const KEEP_MAX     = 4;

/* 可互换主词条组：同一角色在这些词条里只需 1 件（掉到哪个用哪个） */
const SWAP_GROUPS = {
  circlet: [{ a: 'cr', b: 'cd' }],
};

let state = null;
let ui = { elem: 'all', search: '', onlyEnabled: false, planSet: 'all', planSlot: 'all' };
let editing = null;      // 正在编辑的角色副本
let editingIsNew = false;

/* ============================================================
 * 存储
 * ============================================================ */
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const o = JSON.parse(raw);
      if (o && Array.isArray(o.characters) && o.characters.length) return normalize(o);
    }
  } catch (e) { console.warn('读取本地数据失败', e); }
  return { characters: buildDefaultCharacters(), customSets: [] };
}

function normalize(o) {
  o.customSets = Array.isArray(o.customSets) ? o.customSets : [];
  o.characters = o.characters.map(c => ({
    id: c.id || ('c_' + Math.random().toString(36).slice(2)),
    name: c.name || '未命名',
    element: ELEMENTS[c.element] ? c.element : 'pyro',
    region: REGION_NAME[c.region] ? c.region : 'snezhnaya',
    roles: (Array.isArray(c.roles) && c.roles.length)
      ? c.roles.filter(r => ROLE_NAME[r]) : ['maindps'],
    enabled: !!c.enabled,
    note: c.note || '',
    custom: !!c.custom,
    builds: Array.isArray(c.builds) && c.builds.length
      ? c.builds.map(b => ({ sets: b.sets || [], priority: b.priority === 'alt' ? 'alt' : 'main' }))
      : [{ sets: [], priority: 'main' }],
    subs: Object.assign({}, SUB_PRESETS.crit, c.subs || {}),
    main: {
      sands:   (c.main && c.main.sands)   || [],
      goblet:  (c.main && c.main.goblet)  || [],
      circlet: (c.main && c.main.circlet) || [],
    },
  }));
  return o;
}

let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
      flash('已保存到本机');
    } catch (e) { toast('保存失败：' + e.message); }
  }, 300);
}

/* ============================================================
 * 通用
 * ============================================================ */
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

let toastTimer = null;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2200);
}
function flash(msg) {
  const el = $('#saveHint');
  if (!el) return;
  el.textContent = msg;
  setTimeout(() => { if (el.textContent === msg) el.textContent = '数据保存在本机浏览器'; }, 1800);
}

function allSets() {
  return SET_NAMES.concat(state.customSets.map(s => s.name));
}
function allSetBonus() {
  const extra = Object.fromEntries(state.customSets.map(s => [s.name, s.bonus]));
  return Object.assign({}, SET_BONUS, extra);
}

/* ============================================================
 * 汇总引擎
 * 返回 Map: set -> { users:Map<name,{alt}>, slots: { slot -> rows[] } }
 * ============================================================ */
function computePlan(includeAlt = true) {
  const sets = allSets();
  const out = new Map();
  sets.forEach(n => out.set(n, {
    users: new Map(),
    slots: { flower: new Map(), plume: new Map(), sands: new Map(), goblet: new Map(), circlet: new Map() },
  }));

  state.characters.filter(c => c.enabled).forEach(c => {
    c.builds.forEach(b => {
      if (!b.sets || !b.sets.length) return;
      if (!includeAlt && b.priority === 'alt') return;

      const w = W_PRIORITY[b.priority] * W_SET_COUNT[b.sets.length] || 0;
      const isAlt = b.priority === 'alt';

      b.sets.forEach(setName => {
        if (!out.has(setName)) return;
        const bucket = out.get(setName);

        // 记录使用者（主推覆盖备选）
        const prev = bucket.users.get(c.name);
        if (!prev || (prev.alt && !isAlt)) bucket.users.set(c.name, { alt: isAlt });

        // 花 / 羽：主词条固定
        ['flower', 'plume'].forEach(slot => {
          const key = '_fixed';
          const m = bucket.slots[slot];
          const rec = m.get(key) || { stat: key, score: 0, chars: new Map() };
          rec.score += w;
          rec.chars.set(c.name, { rank: 0, alt: isAlt });
          m.set(key, rec);
        });

        // 沙 / 杯 / 冠
        ['sands', 'goblet', 'circlet'].forEach(slot => {
          (c.main[slot] || []).forEach(mi => {
            const m = bucket.slots[slot];
            const rec = m.get(mi.stat) || { stat: mi.stat, score: 0, chars: new Map() };
            rec.score += w * (W_RANK[mi.rank] || 0.25);
            const old = rec.chars.get(c.name);
            if (!old || mi.rank < old.rank) rec.chars.set(c.name, { rank: mi.rank, alt: isAlt });
            m.set(mi.stat, rec);
          });
        });
      });
    });
  });

  // 整理成排序后的行
  out.forEach(bucket => {
    SLOTS.forEach(slotDef => {
      const slot = slotDef.id;
      const m = bucket.slots[slot];
      let rows = Array.from(m.values());

      rows.forEach(r => {
        r.charsArr = Array.from(r.chars.entries())
          .map(([name, info]) => ({ name, rank: info.rank, alt: info.alt }))
          .sort((a, b) => (a.rank - b.rank) || (a.alt ? 1 : 0) - (b.alt ? 1 : 0));
        r.tier = r.score >= TIER_KEEP ? 'keep' : (r.score >= TIER_TRANS ? 'trans' : 'low');

        if (slot === 'flower' || slot === 'plume') {
          r.keep = Math.min(Math.max(r.charsArr.length, 0), KEEP_MAX);
        } else {
          const firsts = r.charsArr.filter(x => x.rank === 1);
          const base = firsts.length ? firsts.length : Math.ceil(r.score);
          r.keep = Math.min(Math.max(base, 1), KEEP_MAX);
        }
      });

      rows = rows.filter(r => r.score >= TIER_TRANS);
      rows = mergeSwapGroup(slot, rows);
      rows.sort((a, b) => (b.score - a.score));
      bucket.slots[slot] = rows;
    });
  });

  return out;
}

/* 合并可互换主词条（如暴击率 / 暴击伤害冠） */
function mergeSwapGroup(slot, rows) {
  const groups = SWAP_GROUPS[slot] || [];
  if (!groups.length) return rows;

  groups.forEach(g => {
    const ra = rows.find(r => r.stat === g.a);
    const rb = rows.find(r => r.stat === g.b);
    if (!ra || !rb) return;

    // 合并角色列表（同名角色取更高优先级、主推优先）
    const map = new Map();
    [...rb.charsArr, ...ra.charsArr].forEach(x => {
      const old = map.get(x.name);
      if (!old || x.rank < old.rank || (x.rank === old.rank && !x.alt && old.alt)) map.set(x.name, x);
    });
    const charsArr = Array.from(map.values())
      .sort((x, y) => (x.rank - y.rank) || ((x.alt ? 1 : 0) - (y.alt ? 1 : 0)));

    const nameSet = new Set(charsArr.map(x => x.name));
    const firstSet = new Set(charsArr.filter(x => x.rank === 1).map(x => x.name));

    const merged = {
      stat: g.a,
      swap: g.b,
      score: Math.max(ra.score, rb.score),
      tier: (ra.score >= TIER_KEEP || rb.score >= TIER_KEEP) ? 'keep'
          : (Math.max(ra.score, rb.score) >= TIER_TRANS ? 'trans' : 'low'),
      keep: Math.min(Math.max(firstSet.size || nameSet.size, 1), KEEP_MAX),
      charsArr,
    };
    rows = rows.filter(r => r.stat !== g.a && r.stat !== g.b);
    rows.push(merged);
  });
  return rows;
}

/* 主词条显示名（含可互换标注） */
function statLabel(slot, r) {
  if (r.swap) return mainStatName(slot, r.stat) + ' / ' + mainStatName(slot, r.swap);
  if (r.stat === '_fixed') return slot === 'flower' ? '生命值（固定）' : '攻击力（固定）';
  return mainStatName(slot, r.stat);
}
function isSwap(r) { return !!r.swap; }

/* 各套装的副词条权重（需求角色平均） */
function computeSetWeights(includeAlt = true) {
  const acc = new Map(); // set -> { sum:{}, n:0 }
  state.characters.filter(c => c.enabled).forEach(c => {
    c.builds.forEach(b => {
      if (!includeAlt && b.priority === 'alt') return;
      if (!b.sets || !b.sets.length) return;
      b.sets.forEach(sn => {
        let o = acc.get(sn);
        if (!o) { o = { sum: {}, n: 0 }; acc.set(sn, o); }
        o.n++;
        SUB_STATS.forEach(s => { o.sum[s.id] = (o.sum[s.id] || 0) + (c.subs[s.id] || 0); });
      });
    });
  });
  const out = new Map();
  acc.forEach((o, sn) => {
    const w = {};
    SUB_STATS.forEach(s => { w[s.id] = o.sum[s.id] / o.n; });
    out.set(sn, w);
  });
  return out;
}

/* 全部启用角色的平均副词条权重（兜底） */
function globalWeights() {
  const list = state.characters.filter(c => c.enabled);
  const w = {};
  SUB_STATS.forEach(s => { w[s.id] = 0; });
  if (!list.length) return Object.assign({}, SUB_PRESETS.crit);
  list.forEach(c => SUB_STATS.forEach(s => { w[s.id] += (c.subs[s.id] || 0); }));
  SUB_STATS.forEach(s => { w[s.id] = w[s.id] / list.length; });
  return w;
}

/* ============================================================
 * 游戏内「套装锁定方案」生成
 *
 * 规则依据（社区攻略实测 + 游戏内界面）：
 *   - 每种圣遗物套装至多预设 3 个自定义方案，多个方案在锁定时共同生效
 *   - 每个部位（含花 / 羽）都可分别设定主要属性与追加属性
 *   - 追加属性支持「★必须」与「包含任意 N 条」
 *   - 仅有 3 条追加属性的圣遗物，所需数量相应减 1
 *   - 需求差异大的角色不宜合并到同一方案，否则会「存伪」（锁进无用件）
 *
 * 固定算法（每个套装 × 每个部位独立聚合，结果可复现）：
 *   ① 角色聚类：按需求相似度层次聚类，合并成 ≤ 槽位数 组
 *   ② 主属性：花/羽固定；沙/杯/冠按「票数 × 优先级」降序，
 *      取到累计覆盖 ≥ MAIN_COVER 为止，上限 MAIN_MAX
 *   ③ ★必须：组内全体角色共有的核心副词条，按平均权重降序，上限 2
 *   ④ 候选池：组内任一角色需要的副词条（剔除与唯一主词条冲突项）
 *   ⑤ 至少命中 N：round(组内平均核心词条数 × 部位严格度系数)，
 *      下限 = ★必须数量（否则★之外的候选形同虚设），上限 = min(4, 候选池-1)
 * ============================================================ */
const SUB_CORE_TH = 0.4;   // 副词条权重达到该值视为「核心需求」
const MERGE_SIM_TH = 0.95; // 需求「几乎一致」的两组自愿共用一个槽位（节省预设名额）
const MAIN_MAX    = 3;     // 单部位主属性上限（条件过宽会「存伪」）
const MAIN_COVER  = 0.7;   // 主属性取到累计覆盖该比例为止

/* 部位严格度系数：影响各部位「至少命中 N 条」的取值
 *   花 / 羽：主词条固定，副词条是唯一变量 → 要求最严（×1.2）
 *   沙 / 冠：主词条与副词条互补          → 标准（×1.0）
 *   杯    ：元素伤害杯本就稀有            → 放宽（×0.8）
 */
const SLOT_STRICT = { flower: 1.0, plume: 1.0, sands: 1.0, circlet: 0.95, goblet: 0.8 };

/* 角色的核心副词条集合 */
function coreSubs(ch) {
  return SUB_STATS.filter(s => (ch.subs[s.id] || 0) >= SUB_CORE_TH).map(s => s.id);
}

function jaccard(a, b) {
  const A = new Set(a), B = new Set(b);
  if (!A.size && !B.size) return 1;
  let inter = 0;
  A.forEach(x => { if (B.has(x)) inter++; });
  const uni = new Set([...A, ...B]).size;
  return uni ? inter / uni : 0;
}

function cosSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  SUB_STATS.forEach(s => {
    const x = a[s.id] || 0, y = b[s.id] || 0;
    dot += x * y; na += x * x; nb += y * y;
  });
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d ? dot / d : 0;
}

/* 角色需求相似度：主属性重合度为主，副词条倾向为辅 */
function roleSimilarity(a, b) {
  let ms = 0;
  ['sands', 'goblet', 'circlet'].forEach(slot => { ms += jaccard(a.mains[slot], b.mains[slot]); });
  return 0.65 * (ms / 3) + 0.35 * cosSim(a.subs, b.subs);
}

function groupSim(g1, g2) {
  let sum = 0, n = 0;
  g1.forEach(a => g2.forEach(b => { sum += roleSimilarity(a, b); n++; }));
  return n ? sum / n : 0;
}

/* 层次聚类：反复合并最相似的两组，直到组数 ≤ maxGroups
 *   注意：游戏内槽位是硬上限，组数超限时【强制】合并最相似的两组；
 *   之后进入「自愿合并」阶段：相似度 ≥ MERGE_SIM_TH 的组主动共用一个槽位；
 *   低于该阈值则不再合并，避免把需求无关的角色硬塞进同一方案造成「存伪」。
 */
function clusterRoles(roles, maxGroups) {
  const groups = roles.map(r => [r]);

  const bestPair = () => {
    let best = null;
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const s = groupSim(groups[i], groups[j]);
        if (!best || s > best.s) best = { s, i, j };
      }
    }
    return best;
  };

  while (groups.length > maxGroups) {
    const best = bestPair();
    if (!best) break;                       // 只剩一组，无法再合并
    groups[best.i] = groups[best.i].concat(groups[best.j]);
    groups.splice(best.j, 1);
  }

  // 自愿合并：需求几乎一致的两组可以共用一个槽位，把宝贵的预设名额让给差异更大的角色
  while (groups.length > 1) {
    const best = bestPair();
    if (!best || best.s < MERGE_SIM_TH) break;
    groups[best.i] = groups[best.i].concat(groups[best.j]);
    groups.splice(best.j, 1);
  }
  return groups;
}

/* ② 合并一组角色在某部位的主属性需求
 *   按「票数 × 优先级」降序，取到累计覆盖 ≥ MAIN_COVER 为止，上限 MAIN_MAX
 */
function mergeMain(group, slot) {
  const score = new Map();
  group.forEach(r => {
    (r.mains[slot] || []).forEach((st, i) => {
      score.set(st, (score.get(st) || 0) + 1 / (i + 1));
    });
  });
  const arr = [...score.entries()].sort((a, b) => b[1] - a[1]);
  const total = arr.reduce((s, x) => s + x[1], 0) || 1;
  const out = [];
  let acc = 0;
  for (const [st, w] of arr) {
    out.push(st);
    acc += w;
    if (out.length >= MAIN_MAX || acc / total >= MAIN_COVER) break;
  }
  return out;
}

/* 花/羽的主词条（固定值），该词条不可能作为同部位的副词条出现 */
const FIXED_MAIN = { flower: 'hp', plume: 'atk' };

/* ③④⑤ 合并一组角色在【某个部位】的追加属性条件 —— 每个部位独立计算
 *   ① 冲突剔除：副词条不可能与同部位主词条相同，任何已选主词条都必须从候选池剔除，
 *      否则把它设成★会导致该件【永远不满足】而无法锁定
 *   ② ★必须：组内「所有」角色都需要的核心词条（剔除冲突项后），按平均权重降序，最多 2 个
 *   ③ 候选池：组内任一角色需要的词条（剔除冲突项后）
 *   ④ 包含任意 N 条：以【未剔除的】组内平均核心词条数为基准 × 部位严格度系数，
 *      下限 = ★必须数量，上限 = min(4, 候选池-1, 3)
 */
function mergeSubSlot(group, slot, mainIds) {
  const n = group.length;
  const banned = new Set(mainIds || []);
  if (FIXED_MAIN[slot]) banned.add(FIXED_MAIN[slot]);   // 花/羽主词条固定，恒冲突

  /* 原始核心词条（用于统计需求广度） */
  const rawCores = group.map(r => r.core);
  const avgW = id => group.reduce((s, r) => s + (r.subs[id] || 0), 0) / n;

  /* 剔除冲突项后的核心词条 */
  const cores = rawCores.map(list => list.filter(id => !banned.has(id)));
  const cnt = new Map();
  cores.forEach(list => list.forEach(id => cnt.set(id, (cnt.get(id) || 0) + 1)));

  const required = [...cnt.entries()]
    .filter(([, c]) => c === n)          // 全员共有
    .map(([id]) => id)
    .sort((a, b) => avgW(b) - avgW(a))   // 权重高的优先
    .slice(0, 2);                        // 最多 2 个，避免条件过严

  const pool = [...cnt.keys()].sort((a, b) => avgW(b) - avgW(a));
  if (!pool.length) return { required: [], pool: [], minHit: 0 };  // 只挑主词条，副词条不限

  const rawCore = rawCores.reduce((s, l) => s + l.length, 0) / n;
  const strict = SLOT_STRICT[slot] || 1;
  const cap = Math.min(4, Math.max(required.length, Math.min(pool.length - 1, 3), 1));
  const minHit = Math.min(cap, Math.max(Math.round(rawCore * strict), required.length, 1));
  return { required, pool, minHit };
}

/* 生成某套装的游戏内锁定方案（≤ maxPlans 个） */
function buildGamePlans(charList, maxPlans) {
  const seen = new Set();
  const roles = charList
    .filter(c => { if (seen.has(c.name)) return false; seen.add(c.name); return true; })
    .map(c => ({
      name: c.name,
      mains: {
        sands:   (c.main.sands   || []).map(m => m.stat),
        goblet:  (c.main.goblet  || []).map(m => m.stat),
        circlet: (c.main.circlet || []).map(m => m.stat),
      },
      subs: c.subs || {},
      core: coreSubs(c),
    }));
  if (!roles.length) return [];

  return clusterRoles(roles, maxPlans).map(g => {
    const slots = {};
    SLOTS.forEach(sd => {
      // 花 / 羽 主词条固定，游戏内只能设追加属性
      const main = (sd.id === 'flower' || sd.id === 'plume') ? null : mergeMain(g, sd.id);
      // 每个部位独立聚合副词条规则
      slots[sd.id] = { main, sub: mergeSubSlot(g, sd.id, main || []) };
    });
    return { chars: g.map(r => r.name), slots };
  });
}

/* 单个方案转成游戏内操作步骤文本 */
function planToGameText(setName, plan, idx) {
  const L = [`  方案${idx + 1}（供 ${plan.chars.join('、')} 使用）`];
  SLOTS.forEach(sd => {
    const s = plan.slots[sd.id];
    const mainTxt = s.main && s.main.length
      ? s.main.map(id => mainStatName(sd.id, id)).join('、')
      : '（固定）';
    const stars = s.sub.required.map(id => '★' + subStatName(id)).join(' ');
    const rest = s.sub.pool.filter(id => !s.sub.required.includes(id))
      .map(id => subStatName(id)).join('、');
    const subTxt = [stars, rest].filter(Boolean).join(' / ');
    L.push(s.sub.minHit
      ? `  ${sd.name}：主属性 ${mainTxt}；追加 ${subTxt || '不限'}，包含任意 ${s.sub.minHit} 条`
      : `  ${sd.name}：主属性 ${mainTxt}；追加属性不限`);
  });
  return L.join('\n');
}

/* ============================================================
 * 页面 ①：角色配置
 * ============================================================ */
/* 当前筛选后的角色列表（批量操作与渲染共用） */
function filteredChars() {
  const kw = ui.search.trim().toLowerCase();
  return state.characters.filter(c => {
    if (ui.elem !== 'all' && c.element !== ui.elem) return false;
    if (ui.onlyEnabled && !c.enabled) return false;
    if (kw) {
      const hay = [
        c.name,
        c.builds.map(b => b.sets.join(' ')).join(' '),
        REGION_NAME[c.region] || '',
        c.roles.map(r => ROLE_NAME[r] || '').join(''),
      ].join(' ').toLowerCase();
      if (!hay.includes(kw)) return false;
    }
    return true;
  });
}

function renderChars() {
  const grid = $('#charGrid');
  const list = filteredChars();

  grid.innerHTML = list.map(c => {
    const el = ELEMENTS[c.element];
    const rg = c.region;
    const roleTxt = (c.roles || []).map(r => ROLE_NAME[r] || r).join('·');
    const sets = (c.builds[0] ? c.builds[0].sets : []);
    const mainRow = (slot) => {
      const arr = c.main[slot] || [];
      if (!arr.length) return '';
      return `<div class="cc-main-row"><span>${SLOTS.find(s => s.id === slot).short}</span><span class="ms">${
        arr.map(m => `<span class="ms r${m.rank}">${esc(mainStatName(slot, m.stat))}</span>`).join(' / ')
      }</span></div>`;
    };
    return `
    <div class="char-card ${c.enabled ? 'on' : ''}" data-id="${c.id}">
      <div class="cc-top">
        <span class="cc-elem" style="background:${el.color}22;color:${el.color};border:1px solid ${el.color}55">${el.name}</span>
        <span class="cc-name">${esc(c.name)}</span>
        <span class="cc-star ${c.enabled ? 'on' : ''}" data-toggle="${c.id}">${c.enabled ? '★' : '☆'}</span>
      </div>
      <div class="cc-meta">
        <span class="cc-region" style="color:${REGION_COLOR[rg] || '#9fb3c8'}">${esc(REGION_NAME[rg] || '其他')}</span>
        <span class="cc-dot">·</span>
        <span class="cc-role">${esc(roleTxt || '未分类')}</span>
      </div>
      <div class="cc-sets">
        ${sets.length
          ? sets.map(s => `<span class="set-tag ${c.builds[0].priority === 'main' ? 'main' : ''}">${esc(s)}${sets.length > 1 ? ' ·2+2' : ''}</span>`).join('')
          : '<span class="set-tag">未配置套装</span>'}
        ${c.builds.length > 1 ? `<span class="set-tag">+${c.builds.length - 1}备选</span>` : ''}
      </div>
      <div class="cc-main">
        ${mainRow('sands')}${mainRow('goblet')}${mainRow('circlet')}
      </div>
    </div>`;
  }).join('') || '<p class="muted">没有匹配的角色。</p>';

  $('#enabledCount').textContent = state.characters.filter(c => c.enabled).length;
  $('#statCharCount').textContent = state.characters.length;
  updateBatchState();

  grid.querySelectorAll('.char-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.dataset.toggle) {
        const c = state.characters.find(x => x.id === e.target.dataset.toggle);
        c.enabled = !c.enabled;
        save(); renderChars(); renderPlan(); renderSubs();
        return;
      }
      openDrawer(card.dataset.id);
    });
  });
}

/* ============================================================
 * 批量选择
 * ============================================================ */
/* 批量分组定义：属性 / 国度 / 定位，统一渲染、切换、刷新 */
const GROUPS = {
  element: {
    sel: '#elemBatch', attr: 'element',
    items: Object.entries(ELEMENTS).map(([id, e]) => ({ id, name: e.name, color: e.color })),
    match: (c, k) => c.element === k,
  },
  region: {
    sel: '#regionBatch', attr: 'region',
    items: REGIONS.map(r => ({ id: r.id, name: r.name, color: r.color })),
    match: (c, k) => c.region === k,
  },
  role: {
    sel: '#roleBatch', attr: 'role',
    items: ROLES.map(r => ({ id: r.id, name: r.name })),
    match: (c, k) => (c.roles || []).includes(k),
  },
};

function renderBatchBar() {
  Object.entries(GROUPS).forEach(([kind, g]) => {
    const box = $(g.sel);
    if (!box) return;
    box.innerHTML = g.items.map(it =>
      `<button class="btn sm ${it.color ? 'tag-btn' : ''}" data-${g.attr}="${it.id}"` +
      `${it.color ? ` style="--tc:${it.color}"` : ''}>${esc(it.name)}</button>`).join('');
    box.querySelectorAll(`[data-${g.attr}]`).forEach(b => {
      b.onclick = () => toggleGroup(kind, b.dataset[g.attr]);
    });
  });
  $$('[data-batch]').forEach(b => { b.onclick = () => applyBatch(b.dataset.batch); });
}

/* 按属性 / 国度 / 定位 整体切换：未全选 → 全选；已全选 → 取消 */
function toggleGroup(kind, key) {
  const g = GROUPS[kind];
  const list = state.characters.filter(c => g.match(c, key));
  if (!list.length) return toast('没有该分类的角色');
  const allOn = list.every(c => c.enabled);
  list.forEach(c => { c.enabled = !allOn; });
  const it = g.items.find(x => x.id === key);
  const label = (it ? it.name : key) + (kind === 'element' ? '属性' : '');
  afterBatch(label + (allOn ? `：已取消 ${list.length} 个` : `：已勾选 ${list.length} 个`));
}

/* 全选 / 全不选 / 反选 —— 作用于当前筛选结果 */
function applyBatch(mode) {
  const list = filteredChars();
  if (!list.length) return toast('当前筛选结果为空');
  if (mode === 'all')    list.forEach(c => { c.enabled = true; });
  if (mode === 'none')   list.forEach(c => { c.enabled = false; });
  if (mode === 'invert') list.forEach(c => { c.enabled = !c.enabled; });
  const scope = (ui.search.trim() || ui.elem !== 'all' || ui.onlyEnabled) ? '当前筛选结果' : '全部角色';
  afterBatch(scope + '：' + ({ all: '已全选', none: '已全不选', invert: '已反选' }[mode]));
}

function afterBatch(msg) {
  save(); renderChars(); renderPlan(); renderSubs();
  toast(msg);
}

/* 刷新批量按钮的高亮与计数 */
function updateBatchState() {
  Object.entries(GROUPS).forEach(([kind, g]) => {
    g.items.forEach(k => {
      const btn = document.querySelector(`${g.sel} [data-${g.attr}="${k.id}"]`);
      if (!btn) return;
      const list = state.characters.filter(c => g.match(c, k.id));
      const on = list.filter(c => c.enabled).length;
      btn.classList.toggle('on', list.length > 0 && on === list.length);
      btn.classList.toggle('partial', on > 0 && on < list.length);
      btn.title = `${k.name}：已启用 ${on} / ${list.length}`;
    });
  });
}

/* ============================================================
 * 编辑抽屉
 * ============================================================ */
function openDrawer(id) {
  const src = state.characters.find(c => c.id === id);
  if (!src) return;
  editing = JSON.parse(JSON.stringify(src));
  editingIsNew = false;
  $('#drawerTitle').textContent = '编辑 ' + src.name;
  $('#btnDeleteChar').classList.remove('hidden');
  drawDrawer();
  showDrawer(true);
}

function openNewChar() {
  editing = {
    id: 'c_new_' + Date.now(),
    name: '', element: 'pyro', region: 'liyue', roles: ['maindps'],
    enabled: true, note: '', custom: true,
    builds: [{ sets: [], priority: 'main' }],
    subs: Object.assign({}, SUB_PRESETS.crit),
    main: { sands: [], goblet: [], circlet: [] },
  };
  editingIsNew = true;
  $('#drawerTitle').textContent = '新增角色';
  $('#btnDeleteChar').classList.add('hidden');
  drawDrawer();
  showDrawer(true);
}

function showDrawer(show) {
  $('#charDrawer').classList.toggle('hidden', !show);
  $('#modalMask').classList.toggle('hidden', !show);
}

function setOptions(sel) {
  return allSets().map(n => `<option value="${esc(n)}"${n === sel ? ' selected' : ''}>${esc(n)}</option>`).join('');
}

function drawDrawer() {
  const c = editing;
  const body = $('#drawerBody');

  body.innerHTML = `
  <div class="fgroup">
    <label>角色名称</label>
    <input type="text" id="edName" value="${esc(c.name)}" placeholder="例：胡桃">
  </div>

  <div class="fgroup">
    <label>元素属性</label>
    <div class="seg" id="edElem">
      ${Object.entries(ELEMENTS).map(([k, v]) =>
        `<button type="button" class="seg-btn ${c.element === k ? 'active' : ''}" data-elem="${k}">${v.name}</button>`).join('')}
    </div>
  </div>

  <div class="fgroup">
    <label>所属国度</label>
    <div class="seg" id="edRegion">
      ${REGIONS.map(r => `<button type="button" class="seg-btn ${c.region === r.id ? 'active' : ''}" data-region="${r.id}">${r.name}</button>`).join('')}
    </div>
  </div>

  <div class="fgroup">
    <span class="glabel">队伍定位 <span class="hint">可多选，影响批量筛选</span></span>
    <div class="chk-row" id="edRoles">
      ${ROLES.map(r => `<label class="chk"><input type="checkbox" data-role="${r.id}" ${(c.roles || []).includes(r.id) ? 'checked' : ''}> ${r.name}</label>`).join('')}
    </div>
  </div>

  <div class="fgroup">
    <span class="glabel">圣遗物配装 <span class="hint">第 1 组为主推，其余为备选；单套=4件套，双套=2+2</span></span>
    <div id="edBuilds"></div>
    <button type="button" class="btn sm" id="edAddBuild">+ 添加一组配装</button>
  </div>

  ${['sands', 'goblet', 'circlet'].map(slot => `
    <div class="fgroup">
      <span class="glabel">${SLOTS.find(s => s.id === slot).name}主词条 <span class="hint">越靠前优先级越高</span></span>
      <div class="ms-list" id="edMain_${slot}"></div>
      <button type="button" class="btn sm" id="edAdd_${slot}">+ 添加主词条</button>
    </div>`).join('')}

  <div class="fgroup">
    <span class="glabel">副词条权重 <span class="hint">0 = 完全无用，1 = 核心词条</span></span>
    <div id="edSubs"></div>
    <button type="button" class="btn sm" id="edPreset">套用预设…</button>
  </div>

  <div class="fgroup">
    <label>备注</label>
    <input type="text" id="edNote" value="${esc(c.note)}" placeholder="例：主C，优先双暴；或用 2+2 过渡">
  </div>`;

  // 元素切换
  body.querySelectorAll('#edElem .seg-btn').forEach(b => {
    b.onclick = () => {
      editing.element = b.dataset.elem;
      body.querySelectorAll('#edElem .seg-btn').forEach(x => x.classList.toggle('active', x === b));
    };
  });

  // 国度
  body.querySelectorAll('#edRegion .seg-btn').forEach(b => {
    b.onclick = () => {
      editing.region = b.dataset.region;
      body.querySelectorAll('#edRegion .seg-btn').forEach(x => x.classList.toggle('active', x === b));
    };
  });
  // 定位（多选）
  body.querySelectorAll('#edRoles input[data-role]').forEach(cb => {
    cb.onchange = () => {
      const set = new Set(editing.roles || []);
      if (cb.checked) set.add(cb.dataset.role); else set.delete(cb.dataset.role);
      editing.roles = ROLES.map(r => r.id).filter(id => set.has(id));
      if (!editing.roles.length) { editing.roles = ['maindps']; cb.checked = true; toast('至少保留一个定位'); }
    };
  });

  // 名称
  body.querySelector('#edName').oninput = e => { editing.name = e.target.value; };
  body.querySelector('#edNote').oninput = e => { editing.note = e.target.value; };

  // 配装
  body.querySelector('#edAddBuild').onclick = () => {
    editing.builds.push({ sets: [], priority: 'alt' });
    drawBuilds();
  };
  // 主词条
  ['sands', 'goblet', 'circlet'].forEach(slot => {
    body.querySelector('#edAdd_' + slot).onclick = () => {
      const used = new Set(editing.main[slot].map(m => m.stat));
      const next = MAIN_STATS[slot].find(s => !used.has(s.id));
      if (!next) return toast('该部位主词条已全部添加');
      editing.main[slot].push({ stat: next.id, rank: editing.main[slot].length + 1 });
      drawMains();
    };
  });
  // 副词条
  body.querySelector('#edPreset').onclick = () => {
    const keys = Object.keys(SUB_PRESETS);
    const names = { crit: '双暴输出', critHp: '双暴+生命', critDef: '双暴+防御', em: '精通流', hp: '生命流', def: '防御流', er: '充能辅助', atk: '攻击流', heal: '治疗辅助' };
    const pick = prompt('输入预设：' + keys.map(k => `${k}(${names[k]})`).join('  '));
    if (pick && SUB_PRESETS[pick]) { editing.subs = Object.assign({}, SUB_PRESETS[pick]); drawSubs(); }
  };

  drawBuilds();
  drawMains();
  drawSubs();
}

function drawBuilds() {
  const box = $('#edBuilds');
  if (!box) return;
  box.innerHTML = editing.builds.map((b, i) => `
    <div class="build-item" data-bi="${i}">
      <div class="bi-head">
        <span class="prio-tag ${b.priority}">${b.priority === 'main' ? '主推' : '备选'}</span>
        <select data-set="0">${setOptions(b.sets[0])}<option value=""${!b.sets[0] ? ' selected' : ''}>（选择套装）</option></select>
        <span class="muted small">${b.sets.length > 1 ? '+' : '　'}</span>
        <select data-set="1">${setOptions(b.sets[1])}<option value=""${!b.sets[1] ? ' selected' : ''}>${b.sets.length > 1 ? '（第二套）' : '（2+2 可选）'}</option></select>
        <button type="button" class="rm" data-rmb="${i}" title="删除">×</button>
      </div>
      <div class="bi-head" style="margin:0">
        <label class="chk"><input type="checkbox" data-main="${i}" ${b.priority === 'main' ? 'checked' : ''}> 设为主推</label>
        <span class="muted small">${b.sets.filter(Boolean).length === 2 ? '2+2 组合' : (b.sets.filter(Boolean).length === 1 ? '4 件套' : '未选择套装')}</span>
      </div>
    </div>`).join('');

  box.querySelectorAll('select[data-set]').forEach(sel => {
    sel.onchange = () => {
      const i = +sel.closest('.build-item').dataset.bi;
      const k = +sel.dataset.set;
      editing.builds[i].sets[k] = sel.value || null;
      editing.builds[i].sets = editing.builds[i].sets.filter(Boolean);
      drawBuilds();
    };
  });
  box.querySelectorAll('[data-main]').forEach(cb => {
    cb.onchange = () => {
      const i = +cb.dataset.main;
      if (cb.checked) editing.builds.forEach((b, j) => { b.priority = (j === i) ? 'main' : 'alt'; });
      else editing.builds.forEach((b, j) => { b.priority = j === 0 ? 'main' : 'alt'; });
      drawBuilds();
    };
  });
  box.querySelectorAll('[data-rmb]').forEach(btn => {
    btn.onclick = () => {
      const i = +btn.dataset.rmb;
      if (editing.builds.length <= 1) return toast('至少保留一组配装');
      editing.builds.splice(i, 1);
      editing.builds[0].priority = 'main';
      drawBuilds();
    };
  });
}

function drawMains() {
  ['sands', 'goblet', 'circlet'].forEach(slot => {
    const box = $('#edMain_' + slot);
    if (!box) return;
    const arr = editing.main[slot];
    box.innerHTML = arr.map((m, i) => `
      <div class="ms-item" data-mi="${i}" data-slot="${slot}">
        <span class="ord">${i === 0 ? '最优' : '第' + (i + 1)}</span>
        <select>${MAIN_STATS[slot].map(s =>
          `<option value="${s.id}"${s.id === m.stat ? ' selected' : ''}>${s.name}</option>`).join('')}</select>
        <button type="button" class="up" data-up="${i}">↑</button>
        <button type="button" class="down" data-down="${i}">↓</button>
        <button type="button" class="rm" data-rmm="${i}">×</button>
      </div>`).join('') || '<p class="muted small">未设置</p>';

    box.querySelectorAll('select').forEach(sel => {
      sel.onchange = () => {
        const i = +sel.closest('.ms-item').dataset.mi;
        editing.main[slot][i].stat = sel.value;
      };
    });
    box.querySelectorAll('[data-up]').forEach(b => b.onclick = () => {
      const i = +b.dataset.up;
      if (i === 0) return;
      [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      renank(slot); drawMains();
    });
    box.querySelectorAll('[data-down]').forEach(b => b.onclick = () => {
      const i = +b.dataset.down;
      if (i === arr.length - 1) return;
      [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
      renank(slot); drawMains();
    });
    box.querySelectorAll('[data-rmm]').forEach(b => b.onclick = () => {
      editing.main[slot].splice(+b.dataset.rmm, 1);
      renank(slot); drawMains();
    });
  });
}
function renank(slot) { editing.main[slot].forEach((m, i) => { m.rank = i + 1; }); }

function drawSubs() {
  const box = $('#edSubs');
  if (!box) return;
  box.innerHTML = SUB_STATS.map(s => `
    <div class="w-row">
      <span class="wn">${s.name}</span>
      <input type="range" min="0" max="1" step="0.05" value="${editing.subs[s.id] || 0}" data-sub="${s.id}">
      <span class="wv" id="wv_${s.id}">${(editing.subs[s.id] || 0).toFixed(2)}</span>
    </div>`).join('');
  box.querySelectorAll('[data-sub]').forEach(r => {
    r.oninput = () => {
      editing.subs[r.dataset.sub] = +r.value;
      $('#wv_' + r.dataset.sub).textContent = (+r.value).toFixed(2);
    };
  });
}

function saveChar() {
  const c = editing;
  if (!c.name.trim()) return toast('请填写角色名称');
  c.name = c.name.trim();
  c.builds = c.builds.filter(b => b.sets && b.sets.length);
  if (!c.builds.length) c.builds = [{ sets: [], priority: 'main' }];

  if (editingIsNew) {
    state.characters.push(c);
  } else {
    const i = state.characters.findIndex(x => x.id === c.id);
    if (i >= 0) state.characters[i] = c;
  }
  save(); showDrawer(false);
  renderChars(); renderPlan(); renderSubs();
  toast('已保存 ' + c.name);
}

/* ============================================================
 * 页面 ②：锁定方案
 * ============================================================ */
function tierLabel(t) {
  return t === 'keep' ? '必留' : (t === 'trans' ? '过渡' : '低优先');
}
function tierClass(t) {
  return t === 'keep' ? 'keep' : (t === 'trans' ? 'trans' : 'fodder');
}

function renderPlan() {
  const includeAlt = $('#planAltBuild').checked;
  const hideUnused = $('#planHideUnused').checked;
  const plan = computePlan(includeAlt);
  const setFilter = $('#planSetFilter').value;
  const slotFilter = $('#planSlotFilter').value;

  // 下拉
  const sel = $('#planSetFilter');
  const cur = sel.value;
  sel.innerHTML = '<option value="all">全部套装</option>' +
    allSets().map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join('');
  sel.value = cur || 'all';

  const enabled = state.characters.filter(c => c.enabled).length;

  if (!enabled) {
    $('#planBody').innerHTML = '<div class="card"><p class="muted">请先在「① 角色配置」页勾选你要养的角色，这里会自动生成锁定方案。</p></div>';
    $('#planSummary').innerHTML = '';
    return;
  }

  let blocks = Array.from(plan.entries());
  // 统计
  let usedSets = 0, fodderSets = 0, planCount = 0;
  blocks.forEach(([name, b]) => {
    const has = b.users.size > 0;
    if (has) usedSets++; else fodderSets++;
  });

  const setWeights = computeSetWeights(includeAlt);
  const maxPlans = +($('#planSlots') ? $('#planSlots').value : 3) || 3;

  const html = blocks
    .filter(([name]) => setFilter === 'all' || name === setFilter)
    .filter(([name, b]) => !hideUnused || b.users.size > 0)
    .sort((a, b) => (b[1].users.size - a[1].users.size) || a[0].localeCompare(b[0], 'zh'))
    .map(([name, b]) => renderSetBlock(name, b, slotFilter, setWeights, maxPlans))
    .join('');

  blocks.forEach(([name, b]) => {
    if (!b.users.size) return;
    const chars = state.characters.filter(c => c.enabled && b.users.has(c.name));
    planCount += buildGamePlans(chars, maxPlans).length;
  });

  $('#planSummary').innerHTML = `
    <div class="stat-box"><div class="sv">${enabled}</div><div class="sl">启用角色</div></div>
    <div class="stat-box"><div class="sv">${usedSets}</div><div class="sl">涉及套装</div></div>
    <div class="stat-box"><div class="sv">${planCount}</div><div class="sl">锁定方案总数</div></div>
    <div class="stat-box"><div class="sv">${fodderSets}</div><div class="sl">可整套清理的套装</div></div>`;

  $('#printMeta').textContent =
    '启用角色：' + state.characters.filter(c => c.enabled).map(c => c.name).join('、') +
    '　|　生成时间：' + new Date().toLocaleString('zh-CN');

  $('#planBody').innerHTML = html || '<div class="card"><p class="muted">没有符合条件的套装。</p></div>';
}

const ELEM_DMG_STATS = ['pyro', 'hydro', 'cryo', 'electro', 'anemo', 'geo', 'dendro', 'phys'];

function renderSetBlock(name, b, slotFilter, setWeights, maxPlans = 3) {
  const bonus = allSetBonus()[name] || '';
  const users = Array.from(b.users.entries());
  const unused = users.length === 0;

  // 游戏内锁定方案：把该套装下的角色需求聚类合并成 ≤ maxPlans 组
  const charsForPlan = state.characters.filter(c => c.enabled && b.users.has(c.name));
  const plans = unused ? [] : buildGamePlans(charsForPlan, maxPlans);
  const gpHtml = plans.length ? renderGamePlans(name, plans, maxPlans, slotFilter) : '';

  // 该套装的核心副词条（用于花/羽行提示）
  const w = setWeights ? setWeights.get(name) : null;
  const topSubs = w
    ? SUB_STATS.map(s => ({ name: s.name, v: w[s.id] || 0 }))
        .sort((a, b) => b.v - a.v).filter(x => x.v >= 0.2).slice(0, 3)
        .map(x => x.name + x.v.toFixed(1)).join(' > ')
    : '';

  const slotsHtml = SLOTS
    .filter(sd => slotFilter === 'all' || sd.id === slotFilter)
    .map(sd => {
      const rows = b.slots[sd.id] || [];
      if (sd.id === 'flower' || sd.id === 'plume') {
        if (!rows.length) return slotRow(sd, '<span class="slot-none">无角色需要</span>');
        const r = rows[0];
        const inner = `
          <div class="stat-req">
            <span class="stat-badge t1">${esc(statLabel(sd.id, r))}</span>
            <span class="keep-n">建议保留 <b>${r.keep}</b> 件</span>
            <span class="tier-tag ${tierClass(r.tier)}">${tierLabel(r.tier)}</span>
          </div>
          ${topSubs ? `<div class="sub-hint-row">副词条优先：<b>${esc(topSubs)}</b></div>` : ''}
          <div class="req-from">${r.charsArr.map(x => `<span class="fn ${x.alt ? 'alt' : ''}">${esc(x.name)}${x.alt ? '·备选' : ''}</span>`).join('')}</div>`;
        return slotRow(sd, inner);
      }

      if (!rows.length) return slotRow(sd, '<span class="slot-none">无角色需要 · 可全喂</span>');

      const inner = rows.map(r => {
        const rare = sd.id === 'goblet' && ELEM_DMG_STATS.includes(r.stat);
        return `
        <div class="stat-req">
          <span class="stat-badge ${r.tier === 'keep' ? 't1' : (r.tier === 'trans' ? 't2' : 't3')}">${esc(statLabel(sd.id, r))}</span>
          <span class="tier-tag ${tierClass(r.tier)}">${tierLabel(r.tier)}</span>
          ${isSwap(r) ? '<span class="swap-tag">二选一</span>' : ''}
          ${rare ? '<span class="rare-tag">稀有·建议多留</span>' : ''}
          <span class="keep-n">建议保留 <b>${r.keep}</b> 件</span>
        </div>
        <div class="req-from">${r.charsArr.map(x => `<span class="fn ${x.alt ? 'alt' : ''}">${esc(x.name)}${x.rank > 1 ? '·次选' : ''}${x.alt ? '·备选' : ''}</span>`).join('')}</div>`;
      }).join('');
      return slotRow(sd, inner);
    }).join('');

  // 详细件数清单：默认折叠（勾选工具栏「显示详细件数」才展开）
  const detailHtml = showDetail()
    ? `<details class="set-detail" open><summary>详细件数清单</summary><div class="set-body">${slotsHtml}</div></details>`
    : '';

  return `
  <div class="set-block ${unused ? 'unused' : ''}">
    <div class="set-head">
      <h3>${esc(name)}</h3>
      <span class="set-bonus">${esc(bonus)}</span>
      <span class="set-users">
        ${unused
          ? '<span class="tier-tag fodder">无角色需要 · 可整套清理</span>'
          : users.map(([n, i]) => `<span class="user-pill ${i.alt ? 'alt' : ''}">${esc(n)}${i.alt ? '·备选' : ''}</span>`).join('')}
      </span>
    </div>
    ${gpHtml}
    ${detailHtml}
  </div>`;
}

/* 是否展开详细件数清单 */
function showDetail() {
  const el = $('#planDetail');
  return !!(el && el.checked);
}

/* 渲染「游戏内锁定方案」区块 */
function renderGamePlans(setName, plans, maxPlans, slotFilter = 'all') {
  const cards = plans.map((p, i) => {
    const rows = SLOTS
      .filter(sd => slotFilter === 'all' || sd.id === slotFilter)
      .map(sd => {
      const s = p.slots[sd.id];
      const mainTxt = s.main && s.main.length
        ? s.main.map(id => `<span class="gp-main">${esc(mainStatName(sd.id, id))}</span>`).join('')
        : '<span class="gp-fixed">主词条固定</span>';
      const stars = s.sub.required
        .map(id => `<span class="gp-star">★${esc(subStatName(id))}</span>`).join('');
      const rest = s.sub.pool.filter(id => !s.sub.required.includes(id))
        .map(id => `<span class="gp-sub">${esc(subStatName(id))}</span>`).join('');
      const subTxt = (stars || rest) ? stars + rest : '<span class="gp-fixed">不限</span>';
      const hitTxt = s.sub.minHit
        ? `任意 <b>${s.sub.minHit}</b> 条`
        : '<span class="gp-fixed">不限</span>';
      return `
        <tr>
          <td class="gp-slot">${sd.name}</td>
          <td>${mainTxt}</td>
          <td>${subTxt}</td>
          <td class="gp-hit">${hitTxt}</td>
        </tr>`;
    }).join('');

    return `
    <div class="gp-card">
      <div class="gp-ctitle">
        <span class="gp-idx">方案${i + 1}</span>
        <span class="gp-for">供 ${p.chars.map(n => esc(n)).join('、')} 使用</span>
        <button class="btn sm gp-copy" data-gp-copy="${esc(setName)}|${i}">复制</button>
      </div>
      <table class="gp-tbl">
        <thead><tr><th>部位</th><th>主要属性</th><th>追加属性</th><th>包含（★计入）</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }).join('');

  return `
  <div class="gp-wrap">
    <div class="gp-head">
      <span class="gp-title">🎮 游戏内锁定方案</span>
      <span class="gp-meta">${plans.length} / ${maxPlans} 个预设 · 多个方案共同生效</span>
    </div>
    <div class="gp-cards">${cards}</div>
    <p class="gp-tip">游戏内：背包 → 圣遗物 → 锁定功能 → 选中本套装 → 编辑，按上表逐部位设置；
      仅有 3 条追加属性的圣遗物，所需数量会自动减 1。</p>
  </div>`;
}
function slotRow(sd, inner) {
  return `<div class="slot-row">
    <div class="slot-name">${sd.name}</div>
    <div class="slot-cells">${inner}</div>
  </div>`;
}

/* 导出：游戏内锁定方案（可照搬进游戏） */
function gamePlansToText() {
  const includeAlt = $('#planAltBuild').checked;
  const maxPlans = +($('#planSlots') ? $('#planSlots').value : 3) || 3;
  const plan = computePlan(includeAlt);
  const L = ['原神 · 圣遗物套装锁定方案（游戏内照此设置）', ''];
  let total = 0, setCount = 0;

  Array.from(plan.entries())
    .filter(([, b]) => b.users.size > 0)
    .sort((a, b) => (b[1].users.size - a[1].users.size) || a[0].localeCompare(b[0], 'zh'))
    .forEach(([name, b]) => {
      const chars = state.characters.filter(c => c.enabled && b.users.has(c.name));
      const plans = buildGamePlans(chars, maxPlans);
      if (!plans.length) return;
      setCount++;
      L.push('━━━━━━━━━━━━━━━━━━━━━━━━');
      L.push(`【${name}】${plans.length} 个预设`);
      plans.forEach((p, i) => L.push(planToGameText(name, p, i)));
      L.push('');
      total += plans.length;
    });

  L.push(`合计：${setCount} 个套装、${total} 个锁定方案`);
  L.push('提示：每种套装在游戏内至多 3 个自定义方案，多个方案共同生效；');
  L.push('      仅有 3 条追加属性的圣遗物，所需数量会自动减 1。');
  return L.join('\n');
}

/* 导出：纯文本清单 */
function planToText() {
  const includeAlt = $('#planAltBuild').checked;
  const plan = computePlan(includeAlt);
  const lines = [];
  lines.push('原神圣遗物锁定清单');
  lines.push('生成时间：' + new Date().toLocaleString('zh-CN'));
  lines.push('启用角色：' + state.characters.filter(c => c.enabled).map(c => c.name).join('、'));
  lines.push('');

  Array.from(plan.entries())
    .filter(([, b]) => b.users.size > 0)
    .sort((a, b) => (b[1].users.size - a[1].users.size) || a[0].localeCompare(b[0], 'zh'))
    .forEach(([name, b]) => {
      lines.push('【' + name + '】' + (allSetBonus()[name] ? '（' + allSetBonus()[name] + '）' : ''));
      SLOTS.forEach(sd => {
        const rows = b.slots[sd.id] || [];
        if (!rows.length) { lines.push('  ' + sd.name + '：无需求，可全喂'); return; }
        if (sd.id === 'flower' || sd.id === 'plume') {
          lines.push(`  ${sd.name}：主词条固定，建议保留 ${rows[0].keep} 件（${rows[0].charsArr.map(x => x.name).join('、')}）`);
          return;
        }
        const parts = rows.map(r =>
          `${statLabel(sd.id, r)}${isSwap(r) ? '(二选一)' : ''}[${tierLabel(r.tier)}·留${r.keep}件：${r.charsArr.map(x => x.name + (x.rank > 1 ? '(次选)' : '') + (x.alt ? '(备选)' : '')).join('/')}]`
        );
        lines.push(`  ${sd.name}：${parts.join('  |  ')}`);
      });
      lines.push('');
    });
  return lines.join('\n');
}

/* 导出：CSV */
function planToCsv() {
  const includeAlt = $('#planAltBuild').checked;
  const plan = computePlan(includeAlt);
  const rows = [['套装', '部位', '主词条', '分级', '建议保留件数', '需求角色']];
  Array.from(plan.entries())
    .filter(([, b]) => b.users.size > 0)
    .sort((a, b) => (b[1].users.size - a[1].users.size) || a[0].localeCompare(b[0], 'zh'))
    .forEach(([name, b]) => {
      SLOTS.forEach(sd => {
        (b.slots[sd.id] || []).forEach(r => {
          const statName = statLabel(sd.id, r) + (isSwap(r) ? '(二选一)' : '');
          const who = r.charsArr.map(x => x.name + (x.rank > 1 ? '(次选)' : '') + (x.alt ? '(备选)' : '')).join(' / ');
          rows.push([name, sd.name, statName, tierLabel(r.tier), r.keep, who]);
        });
      });
    });
  const csv = rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\r\n');
  return '\ufeff' + csv;
}

function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ============================================================
 * 页面 ③：副词条规则
 * ============================================================ */
function renderSubs() {
  const n = state.characters.filter(c => c.enabled).length;
  const rules = $('#subRules');

  rules.innerHTML = `
    <div class="rule-block s">
      <h4>S 级 · 必锁</h4>
      <p>主词条命中「必留」列表，且副词条<b>同时含暴击率与暴击伤害</b>（或你方角色所需的核心双词条）。<br>操作：直接锁定，喂到 20 级。</p>
    </div>
    <div class="rule-block a">
      <h4>A 级 · 升级观察</h4>
      <p>主词条命中需求，副词条含<b>单个暴击词条 + 1 条有效词条</b>。<br>操作：升到 4 级看第 4 词条，出双暴继续喂，否则停手留作过渡。</p>
    </div>
    <div class="rule-block b">
      <h4>B 级 · 过渡件</h4>
      <p>主词条命中需求但副词条平庸。<br>操作：先用着，毕业胚子到位后当狗粮喂掉。</p>
    </div>
    <div class="rule-block c">
      <h4>C 级 · 狗粮</h4>
      <p>主词条不在任何已启用角色的需求列表中。<br>操作：直接喂。<span class="hint">例外：同套装的对应元素伤害杯极难出货，建议无脑保留。</span></p>
    </div>
    <p class="muted small" style="margin-top:14px">${n ? '当前已启用 ' + n + ' 个角色，下方评分器会按这些角色的副词条权重打分。' : '尚未启用角色，评分器暂用「双暴输出」默认权重。'}</p>`;

  // 评分器：初始化
  const sS = $('#scoreSet'), sL = $('#scoreSlot');
  if (sS.options.length <= 1) {
    sS.innerHTML = '<option value="">（不限套装）</option>' + allSets().map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join('');
  }
  if (!sL.options.length) {
    sL.innerHTML = SLOTS.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    sL.value = 'sands';
    sL.onchange = fillMainOptions;
    sS.onchange = runScore;
    fillMainOptions();
  }
  $('#scoreSubs').innerHTML = SUB_STATS.map(s => `
    <div class="sub-input">
      <label>${s.name}</label>
      <input type="number" step="0.1" min="0" data-sub="${s.id}" placeholder="0">
    </div>`).join('') + `
    <div class="sub-input">
      <label>当前等级</label>
      <input type="number" id="scoreLv" value="0" min="0" max="20" step="4">
    </div>`;
  $('#scoreSubs').querySelectorAll('input').forEach(i => { i.oninput = runScore; });
  runScore();

  renderSetSubTable();
}

function fillMainOptions() {
  const slot = $('#scoreSlot').value;
  const sel = $('#scoreMain');
  sel.innerHTML = MAIN_STATS[slot].map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  sel.onchange = runScore;
  runScore();
}

function runScore() {
  const box = $('#scoreResult');
  if (!box) return;
  const slot = $('#scoreSlot').value;
  const mainId = $('#scoreMain').value;
  const setName = $('#scoreSet').value;
  const lv = +($('#scoreLv') ? $('#scoreLv').value : 0) || 0;

  const vals = {};
  $('#scoreSubs').querySelectorAll('input[data-sub]').forEach(i => { vals[i.dataset.sub] = +i.value || 0; });

  const includeAlt = $('#planAltBuild') ? $('#planAltBuild').checked : true;
  const plan = computePlan(includeAlt);

  // 主词条需求判定
  let tier = null, keep = 0, who = [];
  if (setName && plan.has(setName)) {
    const rows = plan.get(setName).slots[slot] || [];
    const hit = rows.find(r => r.stat === mainId || r.swap === mainId || r.stat === '_fixed');
    if (hit) { tier = hit.tier; keep = hit.keep; who = hit.charsArr.map(x => x.name); }
  } else if (setName) {
    tier = null;
  }

  // 权重
  let w;
  if (setName) {
    const sw = computeSetWeights(includeAlt);
    w = sw.get(setName) || globalWeights();
  } else {
    w = globalWeights();
  }

  // 有效 roll 计算
  let eff = 0;
  const detail = [];
  SUB_STATS.forEach(s => {
    const v = vals[s.id] || 0;
    if (!v) return;
    const rolls = v / s.max;
    const ww = w[s.id] || 0;
    eff += rolls * ww;
    detail.push({ name: s.name, rolls, w: ww, part: rolls * ww });
  });
  detail.sort((a, b) => b.part - a.part);

  const maxRolls = 4 + Math.floor(lv / 4); // 初始词条 + 每 4 级 1 次强化
  const pct = maxRolls > 0 ? eff / maxRolls : 0;

  let grade, gcolor, advice;
  if (lv >= 16) {
    if (pct >= 0.62)      { grade = 'S 毕业级'; gcolor = 'var(--green)'; advice = '锁死，这件可以穿到关服。'; }
    else if (pct >= 0.48) { grade = 'A 优质';   gcolor = 'var(--blue)';   advice = '锁定，属于能用的主力件。'; }
    else if (pct >= 0.34) { grade = 'B 及格';   gcolor = 'var(--orange)'; advice = '先用着，遇到更好的就替换。'; }
    else                  { grade = 'C 一般';   gcolor = 'var(--red)';    advice = '过渡件，后期当狗粮。'; }
  } else if (lv >= 8) {
    if (pct >= 0.55)      { grade = 'A 值得拉满'; gcolor = 'var(--blue)';   advice = '继续喂到 20 级。'; }
    else if (pct >= 0.38) { grade = 'B 观察';     gcolor = 'var(--orange)'; advice = '再升 4 级看走势，走歪就停。'; }
    else                  { grade = 'C 建议止损'; gcolor = 'var(--red)';    advice = '停手，留作过渡或当狗粮。'; }
  } else {
    if (pct >= 0.62)      { grade = 'A 好胚子'; gcolor = 'var(--blue)';   advice = '值得拉到 20 级赌一把。'; }
    else if (pct >= 0.45) { grade = 'B 可试养'; gcolor = 'var(--orange)'; advice = '先升到 8 级，出有效词条再继续。'; }
    else                  { grade = 'C 狗粮';   gcolor = 'var(--red)';    advice = '直接喂，别浪费资源。'; }
  }

  const tierTxt = setName
    ? (tier ? `<span class="tier-tag ${tierClass(tier)}">主词条：${tierLabel(tier)}</span> 建议保留 ${keep} 件${who.length ? '（' + esc(who.join('、')) + '）' : ''}`
            : '<span class="tier-tag fodder">主词条：无角色需要</span> 当前配装用不上')
    : '<span class="muted small">未选择套装，只做副词条评分</span>';

  const top = detail.slice(0, 4).map(d =>
    `<span class="set-tag" style="margin-right:4px">${esc(d.name)} ${d.rolls.toFixed(1)}roll ×${d.w.toFixed(2)}</span>`).join('');

  box.innerHTML = `
    <div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap">
      <span class="big" style="color:${gcolor}">${grade}</span>
      <span class="muted small">有效权重 ${eff.toFixed(2)} / 约 ${maxRolls} 次词条 = ${(pct * 100).toFixed(0)}%</span>
    </div>
    <div style="margin:8px 0">${tierTxt}</div>
    <div style="margin-bottom:6px">${top || '<span class="muted small">尚未填写副词条</span>'}</div>
    <div class="muted small">建议：${advice}${tier === null && setName ? '　（若主词条无人需要，副词条再好也只能当狗粮）' : ''}</div>`;
}

function renderSetSubTable() {
  const sw = computeSetWeights($('#planAltBuild') ? $('#planAltBuild').checked : true);
  const rows = Array.from(sw.entries())
    .sort((a, b) => a[0].localeCompare(b[0], 'zh'))
    .map(([setName, w]) => {
      const top = SUB_STATS.map(s => ({ name: s.name, v: w[s.id] || 0 }))
        .sort((a, b) => b.v - a.v).slice(0, 5);
      const max = Math.max(0.001, top[0].v);
      return `<tr>
        <td style="white-space:nowrap">${esc(setName)}</td>
        <td>${top.map(t => `<span class="set-tag" style="margin-right:4px">${esc(t.name)} ${t.v.toFixed(2)}</span>`).join('')}</td>
        <td style="width:130px">${top.map(t => `<div style="display:flex;align-items:center;gap:5px;margin:2px 0"><span class="wbar" style="width:${Math.max(2, (t.v / max) * 90)}px"></span></div>`).join('')}</td>
      </tr>`;
    }).join('');

  $('#setSubTable').innerHTML = rows
    ? `<table class="tbl"><thead><tr><th>套装</th><th>核心副词条（权重 Top5）</th><th>相对强度</th></tr></thead><tbody>${rows}</tbody></table>`
    : '<p class="muted small">启用角色后这里会显示每个套装的核心副词条。</p>';
}

/* ============================================================
 * 页面 ④：数据管理
 * ============================================================ */
function renderCustomSets() {
  $('#customSetList').innerHTML = state.customSets.map((s, i) =>
    `<span class="chip">${esc(s.name)}<span class="muted small">${esc(s.bonus || '')}</span><span class="x" data-ds="${i}">×</span></span>`
  ).join('') || '<p class="muted small">暂无自定义套装。</p>';
  $('#customSetList').querySelectorAll('[data-ds]').forEach(x => {
    x.onclick = () => { state.customSets.splice(+x.dataset.ds, 1); save(); renderCustomSets(); renderPlan(); };
  });
}

/* ============================================================
 * 事件绑定
 * ============================================================ */
function bind() {
  // Tab
  $$('.tab').forEach(t => t.onclick = () => {
    $$('.tab').forEach(x => x.classList.toggle('active', x === t));
    $$('.tabpane').forEach(p => p.classList.toggle('active', p.id === 'tab-' + t.dataset.tab));
    if (t.dataset.tab === 'plan') renderPlan();
    if (t.dataset.tab === 'subs') renderSubs();
  });

  // 角色页筛选
  $('#charSearch').oninput = e => { ui.search = e.target.value; renderChars(); };
  $('#onlyEnabled').onchange = e => { ui.onlyEnabled = e.target.checked; renderChars(); };
  $('#elemFilter').querySelectorAll('.seg-btn').forEach(b => {
    b.onclick = () => {
      $('#elemFilter').querySelectorAll('.seg-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      ui.elem = b.dataset.elem;
      renderChars();
    };
  });
  $('#btnAddChar').onclick = openNewChar;

  // 抽屉
  $('#btnCloseDrawer').onclick = () => showDrawer(false);
  $('#btnCancelEdit').onclick = () => showDrawer(false);
  $('#modalMask').onclick = () => showDrawer(false);
  $('#btnSaveChar').onclick = saveChar;
  $('#btnDeleteChar').onclick = () => {
    if (!editing || editingIsNew) return;
    if (!confirm('确定删除角色「' + editing.name + '」？')) return;
    state.characters = state.characters.filter(c => c.id !== editing.id);
    save(); showDrawer(false); renderChars(); renderPlan(); renderSubs();
    toast('已删除');
  };

  // 方案页
  $('#planSetFilter').onchange = renderPlan;
  $('#planSlotFilter').onchange = renderPlan;
  $('#planHideUnused').onchange = renderPlan;
  $('#planDetail').onchange = renderPlan;
  $('#planAltBuild').onchange = () => { renderPlan(); if ($('#tab-subs').classList.contains('active')) renderSubs(); };
  $('#planSlots').onchange = renderPlan;
  $('#btnCopyGame').onclick = async () => {
    const txt = gamePlansToText();
    try { await navigator.clipboard.writeText(txt); toast('游戏内方案已复制'); }
    catch (e) { fallbackCopy(txt); }
  };
  // 单个方案卡的复制按钮（元素动态生成，用事件委托）
  $('#planBody').addEventListener('click', e => {
    const btn = e.target.closest('.gp-copy');
    if (!btn) return;
    const [ setName, idxStr ] = btn.dataset.gpCopy.split('|');
    const b = computePlan($('#planAltBuild').checked).get(setName);
    if (!b) return;
    const chars = state.characters.filter(c => c.enabled && b.users.has(c.name));
    const plans = buildGamePlans(chars, +($('#planSlots') ? $('#planSlots').value : 3) || 3);
    const p = plans[+idxStr];
    if (!p) return;
    const txt = `【${setName}】\n` + planToGameText(setName, p, +idxStr);
    navigator.clipboard.writeText(txt)
      .then(() => toast(`已复制「${setName} 方案${+idxStr + 1}」`))
      .catch(() => fallbackCopy(txt));
  });
  $('#btnCopyPlan').onclick = async () => {
    const txt = planToText();
    try { await navigator.clipboard.writeText(txt); toast('清单已复制到剪贴板'); }
    catch (e) { fallbackCopy(txt); }
  };
  $('#btnCsvPlan').onclick = () => {
    download('圣遗物锁定方案.csv', planToCsv(), 'text/csv;charset=utf-8');
    toast('CSV 已导出（Excel 可直接打开）');
  };
  $('#btnPrint').onclick = () => window.print();

  // 数据页
  $('#btnExportJson').onclick = () => {
    download('圣遗物配置备份.json', JSON.stringify(state, null, 2), 'application/json');
    toast('已导出配置');
  };
  $('#btnImportJson').onclick = () => $('#fileImport').click();
  $('#fileImport').onchange = e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const o = JSON.parse(r.result);
        state = normalize(o);
        save();
        renderChars(); renderPlan(); renderSubs(); renderCustomSets();
        toast('导入成功：' + state.characters.length + ' 个角色');
      } catch (err) { toast('导入失败：文件格式不正确'); }
    };
    r.readAsText(f);
    e.target.value = '';
  };
  $('#btnClearEnabled').onclick = () => {
    if (!confirm('清空所有角色的启用状态？（配装数据保留）')) return;
    state.characters.forEach(c => { c.enabled = false; });
    save(); renderChars(); renderPlan(); renderSubs();
    toast('已清空启用状态');
  };
  $('#btnReset').onclick = () => {
    if (!confirm('恢复内置默认角色库？你的自定义修改会丢失。')) return;
    state = { characters: buildDefaultCharacters(), customSets: [] };
    save(); renderChars(); renderPlan(); renderSubs(); renderCustomSets();
    toast('已恢复默认库');
  };
  $('#btnAddSet').onclick = () => {
    const n = $('#newSetName').value.trim();
    const b = $('#newSetBonus').value.trim();
    if (!n) return toast('请输入套装名称');
    if (allSets().includes(n)) return toast('该套装已存在');
    state.customSets.push({ name: n, bonus: b });
    $('#newSetName').value = ''; $('#newSetBonus').value = '';
    save(); renderCustomSets(); renderPlan();
    // 刷新评分器下拉
    $('#scoreSet').innerHTML = '<option value="">（不限套装）</option>' + allSets().map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join('');
    toast('已添加套装：' + n);
  };

  // 帮助
  const openHelp = () => { $('#helpBox').classList.remove('hidden'); $('#helpMask').classList.remove('hidden'); };
  const closeHelp = () => { $('#helpBox').classList.add('hidden'); $('#helpMask').classList.add('hidden'); };
  $('#btnHelp').onclick = openHelp;
  $('#btnCloseHelp').onclick = closeHelp;
  $('#helpMask').onclick = closeHelp;

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { showDrawer(false); closeHelp(); }
  });
}

function fallbackCopy(txt) {
  const ta = document.createElement('textarea');
  ta.value = txt;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); toast('清单已复制到剪贴板'); }
  catch (e) { toast('复制失败，请手动选择文本'); }
  document.body.removeChild(ta);
}

/* ============================================================
 * 启动
 * ============================================================ */
(function init() {
  state = load();
  bind();
  renderBatchBar();
  renderChars();
  renderPlan();
  renderSubs();
  renderCustomSets();
})();
