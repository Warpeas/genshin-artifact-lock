/* ============================================================
 * 原神圣遗物锁定方案生成器 —— 逻辑层
 * ============================================================ */
'use strict';

const STORE_KEY = 'genshin_artifact_lock_v1';

/* 权重常量 */
const W_PRIORITY   = { main: 1.0, alt: 0.55 };   // 主推 / 备选配装
const W_SET_COUNT  = { 1: 1.0, 2: 0.8 };         // 4件套 / 2+2
const TIER_KEEP    = 0.8;                        // ≥ 视为必留
const TIER_TRANS   = 0.4;                        // ≥ 视为过渡
const KEEP_MAX     = 4;

/* 可互换主词条组：同一角色在这些词条里只需 1 件（掉到哪个用哪个） */
const SWAP_GROUPS = {
  circlet: [{ a: 'cr', b: 'cd' }],
};

let state = null;
let pendingMigrate = null;   // load() 若从旧存档回填了数据，init 里据此回写本地存储
const SUB_EPOCH = 1;         // 副词条预设重要度版本；递增即把精炼后的预设同步给旧存档
let ui = { elem: 'all', search: '', onlyEnabled: false, planSet: 'all', planSlot: 'all', buildIdx: 0 };

/* 把「副词条 / 主词条」项统一归一为 id 字符串：
 *   对象 {id} / {stat} / {id,w} → 取 id 或 stat；其余原样返回。
 *   防止旧存档 / 异常数据把对象当 id 传入，渲染出 [object Object]。 */
function statIdOf(x) {
  if (x == null) return '';
  if (typeof x === 'object') return x.id != null ? x.id : (x.stat != null ? x.stat : '');
  return x;
}
let editing = null;      // 正在编辑的角色副本
let editingIsNew = false;

/* ============================================================
 * 存储
 * ============================================================ */
/* 把旧存档与内置默认对齐，解决「旧版本存档覆盖了带 src 的新默认数据，
   导致卡片/编辑抽屉看不到攻略链接」的问题：
   1) 若某内置角色的存档里没有来源、但内置默认有，则回填来源链接；
   2) 把内置默认里、存档没有的新角色补进来（按名字去重）。
   回填仅在首次迁移时执行（用 _srcMigrated 标记），不覆盖用户之后手动清空/自定义。 */
function migrateFromDefaults(o) {
  const defs = buildDefaultCharacters();
  const byName = {};
  defs.forEach(d => { byName[d.name] = d; });
  if (!o._srcMigrated) {
    (o.characters || []).forEach(c => {
      if (c.custom) return;
      const d = byName[c.name];
      if (!d) return;
      const savedSrc = normSrcList(c.src);
      if (!savedSrc.length && Array.isArray(d.src) && d.src.length) {
        c.src = d.src.slice();
      }
    });
    o._srcMigrated = true;
  }
  // 同步精炼后的副词条预设重要度（epoch 防循环）：仅刷新「词条集合未改」的内置角色，
  // 不覆盖用户自定义增删过的词条；双暴等真正同等重要的词条在此标为 '=' 同权
  const subBy = {};
  RAW_CHARS.forEach(([name, , sp]) => { subBy[name] = sp; });
  if (o._subEpoch !== SUB_EPOCH) {
    (o.characters || []).forEach(c => {
      if (c.custom) return;
      const sp = subBy[c.name];
      if (!sp || !SUB_PRESETS[sp]) return;
      const preset = toSubs(SUB_PRESETS[sp]);
      const presetIds = preset.map(s => s.id).sort().join(',');
      (c.builds || []).forEach(b => {
        if (!Array.isArray(b.subs) || !b.subs.length) { b.subs = JSON.parse(JSON.stringify(preset)); return; }
        const curIds = b.subs.map(s => s.id).sort().join(',');
        if (curIds === presetIds) b.subs = JSON.parse(JSON.stringify(preset));  // 集合未改→刷新排序/算子
      });
    });
    o._subEpoch = SUB_EPOCH;
  }
  // 补齐存档缺失的内置新角色（天然幂等：已存在则不重复添加）
  defs.forEach(d => {
    if (!o.characters.some(c => c.name === d.name)) {
      o.characters.push(JSON.parse(JSON.stringify(d)));
    }
  });
  return o;
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const o = JSON.parse(raw);
      if (o && Array.isArray(o.characters) && o.characters.length) {
        const migrated = migrateFromDefaults(o);
        pendingMigrate = migrated;   // 让 init 在渲染后回写，把迁移固化到本地存储
        return normalize(migrated);
      }
    }
  } catch (e) { console.warn('读取本地数据失败', e); }
  return normalize({ characters: buildDefaultCharacters(), sets: defaultSets(), planAssign: {} });
}

/* 默认套装列表（内置套装 + 空自定义列表） */
function defaultSets() {
  return SETS.map(s => ({ name: s.name, bonus: s.bonus, builtin: true, hidden: false }));
}

function normalize(o) {
  // ---- 套装列表：旧存档只有 customSets，需要合并进统一列表 ----
  const legacyCustom = Array.isArray(o.customSets) ? o.customSets : [];
  if (!Array.isArray(o.sets) || !o.sets.length) {
    o.sets = defaultSets();
  }
  o.sets = o.sets.filter(s => s && s.name).map(s => ({
    name: s.name,
    bonus: s.bonus || '',
    builtin: !!s.builtin,
    hidden: !!s.hidden,
  }));
  // 内置套装若被旧版本删过（列表中缺失），补回来并标记为隐藏
  SETS.forEach(s => {
    if (!o.sets.some(x => x.name === s.name)) {
      o.sets.push({ name: s.name, bonus: s.bonus, builtin: true, hidden: false });
    }
  });
  // 旧存档的自定义套装
  legacyCustom.forEach(s => {
    if (s && s.name && !o.sets.some(x => x.name === s.name)) {
      o.sets.push({ name: s.name, bonus: s.bonus || '', builtin: false, hidden: false });
    }
  });
  delete o.customSets;

  // 用户对「哪些角色合并到哪个方案槽」的手动指定：{ 套装名: { 组指纹: 槽位下标 } }
  o.planAssign = (o.planAssign && typeof o.planAssign === 'object') ? o.planAssign : {};
  o.characters = o.characters.map(c => ({
    id: c.id || ('c_' + Math.random().toString(36).slice(2)),
    name: c.name || '未命名',
    element: ELEMENTS[c.element] ? c.element : 'pyro',
    region: REGION_NAME[c.region] ? c.region : 'other',
    roles: (Array.isArray(c.roles) && c.roles.length)
      ? c.roles.filter(r => ROLE_NAME[r]) : ['maindps'],
    enabled: !!c.enabled,
    note: c.note || '',
    src: normSrcList(c.src),
    custom: !!c.custom,
    builds: (Array.isArray(c.builds) && c.builds.length)
      ? c.builds.map(b => normalizeBuild(b, c))
      : [{ sets: [], priority: 'main' }].map(b => normalizeBuild(b, c)),
  }));
  return o;
}

/* 配装组归一化：把主/副词条需求从角色级迁移到配装组级
 *   旧结构：角色一个 subs（数值权重对象）+ 一个 main
 *   新结构：每组配装各自带 main + subs（有序数组 + 必选标记）
 */
function normalizeBuild(b, c) {
  const out = {
    sets: Array.isArray(b.sets) ? b.sets.filter(Boolean) : [],
    priority: b.priority === 'alt' ? 'alt' : 'main',
  };
  // 主词条：优先用组内的，缺失则回落到角色级旧数据
  const srcMain = b.main || c.main;
  out.main = {
    sands:   normalizeMains(srcMain && srcMain.sands, 'sands'),
    goblet:  normalizeMains(srcMain && srcMain.goblet, 'goblet'),
    circlet: normalizeMains(srcMain && srcMain.circlet, 'circlet'),
  };
  // 副词条：优先用组内的，缺失则把角色级旧权重转成「排序 + 必选」
  out.subs = normalizeSubs(b.subs || c.subs);
  return out;
}

function normalizeMains(list, slot) {
  const valid = new Set((MAIN_STATS[slot] || []).map(s => s.id));
  const arr = (Array.isArray(list) ? list : [])
    .map(m => (typeof m === 'string' ? { stat: m } : m))
    .filter(m => m && valid.has(m.stat));
  arr.forEach((m, i) => { m.rank = i + 1; m.op = (m.op === '=' || m.op === '>') ? m.op : '>'; });
  return arr;
}

/* 副词条归一化：
 *   新：[{ id, req }] 有序数组
 *   旧：{ cr: 1, cd: 0.7... } 数值权重对象 → 按值降序排序，≥0.9 视为必选
 */
function normalizeSubs(subs) {
  const valid = new Set(SUB_STATS.map(s => s.id));
  if (Array.isArray(subs)) {
    const seen = new Set();
    return subs
      .map(s => (typeof s === 'string' ? { id: s } : s))
      .filter(s => s && valid.has(s.id) && !seen.has(s.id) && seen.add(s.id))
      .map(s => ({ id: s.id, req: !!s.req, op: (s.op === '=' || s.op === '>') ? s.op : '>' }));
  }
  if (subs && typeof subs === 'object') {
    return Object.entries(subs)
      .filter(([id, v]) => valid.has(id) && +v >= 0.1)
      .sort((a, b) => b[1] - a[1])
      .map(([id, v]) => ({ id, req: +v >= 0.9, op: '>' }));
  }
  return toSubs(SUB_PRESETS.crit);
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

/* 从链接取主机名做可点击跳转标签（去掉 www. 前缀） */
function srcHost(u) {
  try { return new URL(u).host.replace(/^www\./, ''); } catch (e) { return '链接'; }
}
/* 链接无标题时，按域名给出可识别的来源平台名（不编造具体作者） */
function srcPlatformName(u) {
  const h = (u || '').toLowerCase();
  if (h.includes('miyoushe.com') || h.includes('bbs.mihoyo.com')) return '米游社';
  if (h.includes('bilibili.com') || h.includes('b23.tv')) return 'B站';
  if (h.includes('game8')) return 'Game8';
  if (h.includes('keqingmains')) return 'KQM';
  if (h.includes('yuanshen') || h.includes('genshin')) return '原神WIKI';
  return srcHost(u) || '链接';
}

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

/* 套装列表以 state.sets 为准（可在「⑤ 套装管理」里增删排序），未隐藏的按顺序返回 */
function allSets() {
  return state.sets.filter(s => !s.hidden).map(s => s.name);
}
function allSetBonus() {
  const o = {};
  state.sets.forEach(s => { o[s.name] = s.bonus || ''; });
  return o;
}
/* 内置套装名集合（用于判断能否硬删除） */
function isBuiltinSet(name) {
  const s = state.sets.find(x => x.name === name);
  return !!(s && s.builtin);
}

/* ============================================================
 * 副词条「排序 + 必选」模型
 *   一份副词条需求 = 有序数组 [{ id, req }]，越靠前越想要，req=true 表示 ★必须
 *   名次权重用于「相似度 / 评分 / 排序」等需要数值的场合（界面上不暴露给用户的内部量）
 * ============================================================ */
const SUB_RANK_DECAY = 0.72;  // 名次权重衰减：第 1 名 1.0，之后 ×0.72
const SUB_CORE_TOP   = 3;     // 前 N 名算「核心需求」（参与「包含任意 N 条」的基准）
const SUB_POOL_TOP   = 5;     // 每人最多贡献 N 条候选副词条，避免候选池过宽
const SUB_POOL_MAX   = 5;     // 合并后的候选池上限（再宽就等同于「不限」，失去筛选意义）

/* 重要度链：把「= / >」算子展开成每条词条的权重
 *   第 1 条最顶（权重 1.0）；其后每条：
 *     op === '='  → 与上一条【同重要】（权重不衰减，沿用上一条）
 *     op === '>' 或缺失 → 比上一条【更低】（× SUB_RANK_DECAY）
 *   这样「顺序 / 排序」由显式的相邻比较算子表达，而不是隐含的位置序号。
 *   旧存档没有 op 字段时一律视为 '>'，行为等价于改造前的 0.72^i 衰减。
 */
function opWeights(list, decay) {
  const d = (decay == null) ? SUB_RANK_DECAY : decay;
  const out = [];
  let prev = 1;
  (list || []).forEach((s, i) => {
    if (i === 0) prev = 1;
    else prev = (s.op === '=') ? prev : prev * d;
    out.push(prev);
  });
  return out;
}

/* 有序副词条 → { id: 权重 }，★必选额外加权，保证它一定算核心需求 */
function subWeights(list) {
  const w = {};
  SUB_STATS.forEach(s => { w[s.id] = 0; });
  const ws = opWeights(list);
  (list || []).forEach((s, i) => {
    if (!(s.id in w)) return;
    w[s.id] = ws[i] * (s.req ? 1.25 : 1);
  });
  return w;
}

/* 核心需求 = 前 SUB_CORE_TOP 名 ∪ 所有 ★必选 */
function coreSubs(list) {
  const seen = new Set();
  return (list || []).filter((s, i) => i < SUB_CORE_TOP || s.req)
    .map(s => s.id).filter(id => !seen.has(id) && seen.add(id));
}
/* ★必选词条集合 */
function reqSubs(list) {
  return (list || []).filter(s => s.req).map(s => s.id);
}
/* 候选池：取前 SUB_POOL_TOP 名，并带上各自的算子权重（供合并时按重要度累加） */
function poolSubs(list) {
  const ws = opWeights(list);
  return (list || []).slice(0, SUB_POOL_TOP).map((s, i) => ({ id: s.id, w: ws[i] }));
}

/* 角色的主推配装组（卡片展示 / 兜底取值用） */
function mainBuild(c) {
  const list = c.builds || [];
  return list.find(b => b.priority === 'main') || list[0] || { sets: [], main: {}, subs: [] };
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

        // 沙 / 杯 / 冠（词条需求取自【本组配装】，按「= / >」重要度链加权）
        ['sands', 'goblet', 'circlet'].forEach(slot => {
          const mws = opWeights(b.main[slot]);
          (b.main[slot] || []).forEach((mi, i) => {
            const m = bucket.slots[slot];
            const rec = m.get(mi.stat) || { stat: mi.stat, score: 0, chars: new Map() };
            rec.score += w * (mws[i] != null ? mws[i] : 0.25);
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

/* 遍历「已启用角色 × 有效配装组」 */
function walkEnabledBuilds(includeAlt, fn) {
  state.characters.filter(c => c.enabled).forEach(c => {
    (c.builds || []).forEach(b => {
      if (!includeAlt && b.priority === 'alt') return;
      if (!b.sets || !b.sets.length) return;
      fn(c, b);
    });
  });
}

/* 各套装的副词条权重（按【配装组】平均，名次权重制） */
function computeSetWeights(includeAlt = true) {
  const acc = new Map(); // set -> { sum:{}, n:0 }
  walkEnabledBuilds(includeAlt, (c, b) => {
    const sw = subWeights(b.subs);
    b.sets.forEach(sn => {
      let o = acc.get(sn);
      if (!o) { o = { sum: {}, n: 0 }; acc.set(sn, o); }
      o.n++;
      SUB_STATS.forEach(s => { o.sum[s.id] = (o.sum[s.id] || 0) + sw[s.id]; });
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

/* 各套装的副词条【需求排序】：按「名次权重」平均降序，并统计有多少角色标了★必选
 * 返回 Map: 套装 -> { n, list: [{ id, name, score, reqRatio, must }] }
 */
function setSubRanking(includeAlt = true) {
  const acc = new Map(); // set -> { n, sum:{}, req:{} }
  walkEnabledBuilds(includeAlt, (c, b) => {
    const sw = subWeights(b.subs);
    b.sets.forEach(sn => {
      let o = acc.get(sn);
      if (!o) { o = { n: 0, sum: {}, req: {} }; acc.set(sn, o); }
      o.n++;
      SUB_STATS.forEach(s => { o.sum[s.id] = (o.sum[s.id] || 0) + sw[s.id]; });
      reqSubs(b.subs).forEach(id => { o.req[id] = (o.req[id] || 0) + 1; });
    });
  });
  const out = new Map();
  acc.forEach((o, sn) => {
    const list = SUB_STATS.map(s => ({
      id: s.id,
      name: s.name,
      score: (o.sum[s.id] || 0) / o.n,
      reqRatio: (o.req[s.id] || 0) / o.n,
    })).filter(x => x.score > 0.01)
      .sort((a, b) => b.score - a.score)
      .map(x => Object.assign(x, { must: x.reqRatio >= 0.5 }));
    out.set(sn, { n: o.n, list });
  });
  return out;
}

/* 全部启用角色的平均副词条权重（兜底） */
function globalWeights() {
  const w = {};
  SUB_STATS.forEach(s => { w[s.id] = 0; });
  let n = 0;
  walkEnabledBuilds(true, (c, b) => {
    n++;
    const sw = subWeights(b.subs);
    SUB_STATS.forEach(s => { w[s.id] += sw[s.id]; });
  });
  if (!n) return subWeights(toSubs(SUB_PRESETS.crit));
  SUB_STATS.forEach(s => { w[s.id] = w[s.id] / n; });
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
 *   ① 角色分组：需求「几乎一致」的角色并为一组，组数不强行压到槽位数；
 *      超出槽位时出现「手动合并」面板，默认按相似度自动归入，可手动调整
 *   ② 主属性：花/羽固定；沙/杯/冠按「票数 × 优先级」降序，
 *      取到累计覆盖 ≥ MAIN_COVER 为止，上限 MAIN_MAX
 *   ③ ★必须：组内全体角色都标了「必选」的副词条，按平均名次权重降序，上限 2
 *   ④ 候选池：组内任一角色前 SUB_POOL_TOP 条需求（剔除与唯一主词条冲突项）
 *   ⑤ 至少命中 N：round(组内平均核心词条数 × 部位严格度系数)，
 *      下限 = ★必须数量（否则★之外的候选形同虚设），上限 = min(4, 候选池-1)
 * ============================================================ */
const MERGE_SIM_TH = 0.95; // 需求「几乎一致」的角色自动并为一组（节省预设名额）
const MANUAL_MAX_GROUPS = 9; // 单套装自然分组上限（再多就先强制合并，避免手动列表过长）
const MAIN_MAX    = 3;     // 单部位主属性上限（条件过宽会「存伪」）
const MAIN_COVER  = 0.7;   // 主属性取到累计覆盖该比例为止

/* 部位严格度系数：影响各部位「至少命中 N 条」的取值
 *   花 / 羽：主词条固定，副词条是唯一变量 → 要求最严（×1.2）
 *   沙 / 冠：主词条与副词条互补          → 标准（×1.0）
 *   杯    ：元素伤害杯本就稀有            → 放宽（×0.8）
 */
const SLOT_STRICT = { flower: 1.0, plume: 1.0, sands: 1.0, circlet: 0.95, goblet: 0.8 };

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

/* ①-a 自然分组
 *   只把「需求几乎一致」（相似度 ≥ MERGE_SIM_TH）的角色并为一组，其余保持独立。
 *   这样得到的分组保留最大差异度，供后续自动或手动归入方案槽。
 *   capGroups：组数上限保护（防止一个套装下几十个角色时列表过长）
 */
function naturalClusters(roles, capGroups) {
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

  // 自愿合并：需求几乎一致的角色共用一个槽位，把名额让给差异更大的角色
  while (groups.length > 1) {
    const best = bestPair();
    if (!best || best.s < MERGE_SIM_TH) break;
    groups[best.i] = groups[best.i].concat(groups[best.j]);
    groups.splice(best.j, 1);
  }

  // 组数保护：超出上限时强制合并最相似的两组
  while (capGroups && groups.length > capGroups) {
    const best = bestPair();
    if (!best) break;
    groups[best.i] = groups[best.i].concat(groups[best.j]);
    groups.splice(best.j, 1);
  }
  return groups;
}

/* 组的指纹：组内角色名排序后拼接，用于持久化用户的手动归属 */
function groupKey(g) {
  return g.map(r => r.name).sort().join('+');
}

/* ①-b 自动槽位分配：把若干组贪心归并到 ≤ maxPlans 个桶（每次合并最相似的桶），
 *      作为「手动合并」面板的预填值；返回「每组所属槽位下标」 */
function autoBuckets(groups, maxPlans) {
  const buckets = groups.map((g, i) => ({ ids: [i], roles: g.slice() }));
  while (buckets.length > maxPlans) {
    let best = null;
    for (let i = 0; i < buckets.length; i++) {
      for (let j = i + 1; j < buckets.length; j++) {
        const s = groupSim(buckets[i].roles, buckets[j].roles);
        if (!best || s > best.s) best = { s, i, j };
      }
    }
    if (!best) break;
    buckets[best.i].ids = buckets[best.i].ids.concat(buckets[best.j].ids);
    buckets[best.i].roles = buckets[best.i].roles.concat(buckets[best.j].roles);
    buckets.splice(best.j, 1);
  }
  const assign = new Array(groups.length).fill(0);
  buckets.forEach((b, k) => b.ids.forEach(id => { assign[id] = k; }));
  return assign;
}

/* ①-c 最终归属：以用户手动指定为准，未指定 / 越界的组回落到自动分配 */
function resolveAssign(setName, groups, maxPlans) {
  const auto = autoBuckets(groups, maxPlans);
  const saved = (state.planAssign && state.planAssign[setName]) || null;
  if (!saved) return auto;
  return groups.map((g, i) => {
    const v = saved[groupKey(g)];
    return (Number.isInteger(v) && v >= 0 && v < maxPlans) ? v : auto[i];
  });
}

/* ② 合并一组角色在某部位的主属性需求
 *   按「票数 × 优先级」降序，取到累计覆盖 ≥ MAIN_COVER 为止，上限 MAIN_MAX
 */
function mergeMain(group, slot) {
  const score = new Map();
  group.forEach(r => {
    const ws = opWeights(r.mains[slot] || []);
    (r.mains[slot] || []).forEach((m, i) => {
      score.set(m.stat, (score.get(m.stat) || 0) + ws[i]);
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
 *   ② ★必须：组内「所有」角色都勾选了必选的词条（剔除冲突项后），按平均名次权重降序，最多 2 个
 *   ③ 候选池：组内任一角色前 SUB_POOL_TOP 条需求（剔除冲突项），按「广度 × 名次」降序
 *   ④ 包含任意 N 条：以【未剔除的】组内平均核心词条数为基准 × 部位严格度系数，
 *      下限 = ★必须数量，上限 = min(4, 候选池-1, 3)
 */
function mergeSubSlot(group, slot, mainIds) {
  const n = group.length;
  const banned = new Set(mainIds || []);
  if (FIXED_MAIN[slot]) banned.add(FIXED_MAIN[slot]);   // 花/羽主词条固定，恒冲突

  /* 原始核心词条（用于统计需求广度，不做冲突剔除） */
  const rawCores = group.map(r => r.core);
  const avgW = id => group.reduce((s, r) => s + (r.subs[id] || 0), 0) / n;

  /* ② ★必须：全员共有的「必选」标记 */
  const reqCnt = new Map();
  group.forEach(r => new Set(r.req || []).forEach(raw => {
    const id = statIdOf(raw);
    if (!id || banned.has(id)) return;
    reqCnt.set(id, (reqCnt.get(id) || 0) + 1);
  }));
  const required = [...reqCnt.entries()]
    .filter(([, c]) => c === n)          // 全员都标了必选
    .map(([id]) => id)
    .sort((a, b) => avgW(b) - avgW(a))   // 名次靠前的优先
    .slice(0, 2);                        // 最多 2 个，避免条件过严

  /* ③ 候选池：按「出现人数 × 算子权重」累加 */
  const poolScore = new Map();
  group.forEach(r => (r.pool || []).forEach(p => {
    const id = statIdOf(p);
    const w = (p && typeof p === 'object' && typeof p.w === 'number') ? p.w : 0;
    if (!id || banned.has(id)) return;
    poolScore.set(id, (poolScore.get(id) || 0) + w);
  }));
  let pool = [...poolScore.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
  // ★必须一定得在候选池里（可能排名在 SUB_POOL_TOP 之外）
  required.forEach(id => { if (!pool.includes(id)) pool.push(id); });
  // 候选池收口：太宽就等于「不限」，失去筛选意义
  if (pool.length > SUB_POOL_MAX) pool = pool.slice(0, SUB_POOL_MAX);
  if (!pool.length) return { required: [], pool: [], minHit: 0 };  // 只挑主词条，副词条不限

  const rawCore = rawCores.reduce((s, l) => s + l.length, 0) / n;
  const strict = SLOT_STRICT[slot] || 1;
  const cap = Math.min(4, Math.max(required.length, Math.min(pool.length - 1, 3), 1));
  const minHit = Math.min(cap, Math.max(Math.round(rawCore * strict), required.length, 1));
  return { required, pool, minHit };
}

/* 把若干【自然分组】合并成一个方案 */
function mergeGroups(gs) {
  const g = gs.flat();
  const slots = {};
  SLOTS.forEach(sd => {
    // 花 / 羽 主词条固定，游戏内只能设追加属性
    const main = (sd.id === 'flower' || sd.id === 'plume') ? null : mergeMain(g, sd.id);
    // 每个部位独立聚合副词条规则
    slots[sd.id] = { main, sub: mergeSubSlot(g, sd.id, main || []) };
  });
  return { chars: g.map(r => r.name), slots };
}

/* 角色在某套装下，由「使用该套装的配装组」提供词条需求；
 * 若没有配装组用到该套装（例如只在别处被引用），回落到主推配装 */
function pickBuild(c, setName) {
  const list = c.builds || [];
  if (!list.length) return null;
  const use = setName ? list.filter(b => (b.sets || []).includes(setName)) : [];
  const pool = use.length ? use : list;
  return pool.find(b => b.priority === 'main') || pool[0];
}

function toRoles(charList, setName) {
  const seen = new Set();
  return charList
    .filter(c => { if (seen.has(c.name)) return false; seen.add(c.name); return true; })
    .map(c => {
      const b = pickBuild(c, setName) || { main: {}, subs: [] };
      return {
        name: c.name,
        mains: {
          sands:   (b.main.sands   || []).map(m => ({ stat: m.stat, op: m.op || '>' })),
          goblet:  (b.main.goblet  || []).map(m => ({ stat: m.stat, op: m.op || '>' })),
          circlet: (b.main.circlet || []).map(m => ({ stat: m.stat, op: m.op || '>' })),
        },
        subs: subWeights(b.subs),   // 名次权重向量（用于相似度 / 评分）
        subList: b.subs || [],      // 原始词条（含 op），供候选池按重要度打分
        core: coreSubs(b.subs),     // 核心需求，决定「包含任意 N 条」
        req:  reqSubs(b.subs),      // ★必选标记
        pool: poolSubs(b.subs),     // 候选池
      };
    });
}

/* 生成某套装的游戏内锁定方案（≤ maxPlans 个）
 * 返回 { plans, groups, assign }：
 *   plans  —— 下标即方案槽位号（可能跳号，空槽为 null）
 *   groups —— 自然分组结果（供用户手动指定归属）
 *   assign —— 每个组当前归入的槽位号
 */
function buildGamePlanInfo(charList, maxPlans, setName) {
  const roles = toRoles(charList, setName);
  if (!roles.length) return { plans: [], groups: [], assign: [] };

  const groups = naturalClusters(roles, MANUAL_MAX_GROUPS);
  const assign = resolveAssign(setName, groups, maxPlans);

  const bySlot = new Map();
  groups.forEach((g, i) => {
    const k = assign[i];
    if (!bySlot.has(k)) bySlot.set(k, []);
    bySlot.get(k).push(g);
  });
  const plans = new Array(maxPlans).fill(null);
  bySlot.forEach((gs, k) => { plans[k] = mergeGroups(gs); });
  return { plans, groups, assign, maxPlans };
}

/* 只要方案数组（跳过空槽，重新连续编号） */
function buildGamePlans(charList, maxPlans, setName) {
  return buildGamePlanInfo(charList, maxPlans, setName).plans.filter(Boolean);
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

/* 把 src（攻略链接数组）渲染成可点击来源；空数组不显示 */
function renderChars() {
  const grid = $('#charGrid');
  const list = filteredChars();

  grid.innerHTML = list.map(c => {
    const el = ELEMENTS[c.element];
    const rg = c.region;
    const roleTxt = (c.roles || []).map(r => ROLE_NAME[r] || r).join('·');
    const mb = mainBuild(c);
    const sets = mb.sets || [];
    const mainRow = (slot) => {
      const arr = (mb.main && mb.main[slot]) || [];
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
          ? sets.map(s => `<span class="set-tag ${mb.priority === 'main' ? 'main' : ''}">${esc(s)}${sets.length > 1 ? ' ·2+2' : ''}</span>`).join('')
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
  ui.buildIdx = 0;
  $('#drawerTitle').textContent = '编辑 ' + src.name;
  $('#btnDeleteChar').classList.remove('hidden');
  drawDrawer();
  showDrawer(true);
}

function openNewChar() {
  editing = {
    id: 'c_new_' + Date.now(),
    name: '', element: 'pyro', region: 'liyue', roles: ['maindps'],
    enabled: true, note: '', src: [], custom: true,
    builds: [freshBuild()],
  };
  editingIsNew = true;
  ui.buildIdx = 0;
  $('#drawerTitle').textContent = '新增角色';
  $('#btnDeleteChar').classList.add('hidden');
  drawDrawer();
  showDrawer(true);
}

function showDrawer(show) {
  $('#charDrawer').classList.toggle('hidden', !show);
  $('#modalMask').classList.toggle('hidden', !show);
  // 手机端分段按钮（元素 / 国度）可能横向溢出，把当前选中项滚到可见位置
  if (show) requestAnimationFrame(() => {
    $('#charDrawer').querySelectorAll('.seg').forEach(s => {
      const on = s.querySelector('.seg-btn.active');
      if (!on || s.scrollWidth <= s.clientWidth + 1) return;
      s.scrollLeft = on.offsetLeft - s.clientWidth / 2 + on.offsetWidth / 2;
    });
  });
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

  <div class="fgroup">
    <span class="glabel">词条需求归属 <span class="hint">主词条 / 副词条按配装组分别设置</span></span>
    <div class="seg" id="edBuildTabs">
      ${c.builds.map((b, i) => `<button type="button" class="seg-btn ${i === ui.buildIdx ? 'active' : ''}" data-bt="${i}">配装${i + 1}${b.priority === 'main' ? '·主推' : ''}</button>`).join('')}
    </div>
    <div class="copy-row">
      <select id="edCopyFrom">
        <option value="">📋 从…一键复制词条（主词条 + 副词条）</option>
        ${c.builds.map((b, i) => i === ui.buildIdx ? '' :
          `<option value="b${i}">配装${i + 1}（${esc((b.sets || []).join('+') || '未选套装')}）</option>`).join('')}
        ${Object.keys(SUB_PRESETS).map(k => `<option value="p${k}">预设 · ${SUB_PRESET_NAMES[k]}（仅副词条）</option>`).join('')}
      </select>
    </div>
  </div>

  ${['sands', 'goblet', 'circlet'].map(slot => `
    <div class="fgroup">
      <span class="glabel">${SLOTS.find(s => s.id === slot).name}主词条 <span class="hint">越靠前优先级越高</span></span>
      <div class="ms-list" id="edMain_${slot}"></div>
      <button type="button" class="btn sm" id="edAdd_${slot}">+ 添加主词条</button>
    </div>`).join('')}

  <div class="fgroup">
    <span class="glabel">副词条需求 <span class="hint">越靠前越想要；★ = 游戏内锁定方案的「必须」</span></span>
    <div class="ms-list" id="edSubs"></div>
    <select id="edAddSub">
      <option value="">+ 添加副词条…</option>
      ${SUB_STATS.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
    </select>
  </div>

  <div class="fgroup">
    <label>备注</label>
    <input type="text" id="edNote" value="${esc(c.note)}" placeholder="例：主C，优先双暴；或用 2+2 过渡">
  </div>
  <div class="fgroup">
    <label>攻略来源 <span class="hint">文章 URL 可直接点击跳转；右侧 ✎ 编辑、✓ 确认、× 取消、− 删除，支持多个来源；工具不作解析，仅存档你认可的配装攻略。留空表示暂无来源</span></label>
    <div id="edSrcList" class="src-list"></div>
    <button type="button" class="btn sm" id="edAddSrc">+ 添加链接</button>
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

  // 攻略来源：一行一链接 = 可点击直接跳转(锚) + 可编辑 + 可删除(−)，可加多源
  let srcEditIdx = null;   // 当前正在编辑的来源行；null = 全部为「可跳转链接」态
  function commitSrc(i) {   // 确认：把输入框当前值写回并退出编辑态
    const wrap = body.querySelector('#edSrcList');
    const uInp = wrap.querySelector(`.src-url[data-i="${i}"]`);
    const url = uInp ? uInp.value.trim() : '';
    const list = (editing.src = editing.src || []);
    if (!url) list.splice(i, 1);            // 清空 URL = 删除该行
    else list[i] = { url, title: '' };
    srcEditIdx = null;
    renderSrcRows();
  }
  function renderSrcRows() {
    const wrap = body.querySelector('#edSrcList');
    const arr = (editing.src || []).map(normSrcItem).filter(Boolean);
    wrap.innerHTML = arr.length ? arr.map((it, i) => {
      const u = it.url;
      const on = srcEditIdx === i;
      return `
      <div class="src-row" data-i="${i}">
        ${on
          ? `<input type="text" class="src-url" data-i="${i}" value="${esc(u)}" placeholder="https://..." spellcheck="false">
             <button type="button" class="src-ok" data-i="${i}" title="确认修改">✓</button>
             <button type="button" class="src-cancel" data-i="${i}" title="取消">×</button>`
          : `<a class="src-go" href="${esc(u)}" target="_blank" rel="noopener" title="点击打开：${esc(u)}">${esc(u)}</a>
             <button type="button" class="src-edit" data-i="${i}" title="编辑链接">✎</button>`}
        <button type="button" class="src-del" data-i="${i}" title="删除该链接">−</button>
      </div>`;
    }).join('') : '<div class="src-empty">暂无来源，点击下方「+ 添加链接」</div>';

    // 默认态：右侧「✎ 编辑」按钮 → 进入编辑态
    wrap.querySelectorAll('.src-edit').forEach(btn => {
      btn.onclick = () => {
        srcEditIdx = +btn.dataset.i;
        renderSrcRows();
        const inp = body.querySelector(`#edSrcList .src-url[data-i="${srcEditIdx}"]`);
        if (inp) inp.focus();
      };
    });
    // 编辑态：✓ 确认 / × 取消（mousedown 阻止输入框先失焦，交由 click 处理）
    wrap.querySelectorAll('.src-ok').forEach(btn => {
      btn.onmousedown = e => e.preventDefault();
      btn.onclick = () => commitSrc(+btn.dataset.i);
    });
    wrap.querySelectorAll('.src-cancel').forEach(btn => {
      btn.onmousedown = e => e.preventDefault();
      btn.onclick = () => { srcEditIdx = null; renderSrcRows(); };
    });
    // 编辑态：输入框失焦（焦点离开编辑区）= 确认；回车确认、Esc 取消
    wrap.querySelectorAll('.src-url').forEach(inp => {
      inp.onblur = e => {
        const rt = e.relatedTarget;
        if (rt && rt.classList && rt.classList.contains('src-url')) return;
        if (srcEditIdx === +inp.dataset.i) commitSrc(+inp.dataset.i);
      };
      inp.onkeydown = e => {
        if (e.key === 'Enter') { e.preventDefault(); commitSrc(+inp.dataset.i); }
        else if (e.key === 'Escape') { e.preventDefault(); srcEditIdx = null; renderSrcRows(); }
      };
    });
    // 删除（两种状态都可用）
    wrap.querySelectorAll('.src-del').forEach(btn => {
      btn.onclick = () => {
        (editing.src = editing.src || []).splice(+btn.dataset.i, 1);
        if (srcEditIdx === +btn.dataset.i) srcEditIdx = null;
        renderSrcRows();
      };
    });
  }
  renderSrcRows();
  body.querySelector('#edAddSrc').onclick = () => {
    (editing.src = editing.src || []).push({ url: '', title: '' });
    srcEditIdx = (editing.src || []).length - 1;   // 新增后直接进编辑态
    renderSrcRows();
    const inp = body.querySelector(`#edSrcList .src-url[data-i="${srcEditIdx}"]`);
    if (inp) inp.focus();
  };

  // 配装：新增一组时默认复制当前组的词条需求（也可稍后用下拉从别的组一键复制）
  body.querySelector('#edAddBuild').onclick = () => {
    const srcIdx = ui.buildIdx;
    const src = curBuild();
    editing.builds.push({
      sets: [],
      priority: 'alt',
      main: JSON.parse(JSON.stringify(src.main || {})),
      subs: JSON.parse(JSON.stringify(src.subs || [])),
    });
    const from = srcIdx + 1;
    ui.buildIdx = editing.builds.length - 1;
    drawDrawer();
    toast(`已新增配装${ui.buildIdx + 1}，词条需求复制自配装${from}`);
  };
  // 词条需求归属哪一组配装
  body.querySelectorAll('#edBuildTabs [data-bt]').forEach(b => {
    b.onclick = () => {
      ui.buildIdx = +b.dataset.bt;
      drawDrawer();
    };
  });
  // 一键复制词条
  body.querySelector('#edCopyFrom').onchange = e => {
    const v = e.target.value;
    if (!v) return;
    const cur = curBuild();
    if (v[0] === 'b') {
      const src = editing.builds[+v.slice(1)];
      if (!src) return;
      cur.main = JSON.parse(JSON.stringify(src.main || {}));
      cur.subs = JSON.parse(JSON.stringify(src.subs || []));
      toast('已复制配装' + (+v.slice(1) + 1) + '的词条需求');
    } else {
      cur.subs = toSubs(SUB_PRESETS[v.slice(1)] || SUB_PRESETS.crit);
      toast('已套用预设：' + SUB_PRESET_NAMES[v.slice(1)]);
    }
    drawDrawer();
  };
  // 主词条
  ['sands', 'goblet', 'circlet'].forEach(slot => {
    body.querySelector('#edAdd_' + slot).onclick = () => {
      const arr = curBuild().main[slot];
      const used = new Set(arr.map(m => m.stat));
      const next = MAIN_STATS[slot].find(s => !used.has(s.id));
      if (!next) return toast('该部位主词条已全部添加');
      arr.push({ stat: next.id, rank: arr.length + 1, op: '>' });
      drawMains();
    };
  });
  // 副词条
  body.querySelector('#edAddSub').onchange = e => {
    const id = e.target.value;
    if (!id) return;
    const subs = curBuild().subs;
    if (subs.some(s => s.id === id)) return toast('该副词条已在列表中');
    subs.push({ id, req: false, op: '>' });
    drawSubs();
  };

  drawBuilds();
  drawMains();
  drawSubs();
}

/* 抽屉里正在编辑的配装组 */
function curBuild() {
  if (!editing.builds.length) editing.builds.push({ sets: [], priority: 'main' });
  if (ui.buildIdx >= editing.builds.length) ui.buildIdx = 0;
  return editing.builds[ui.buildIdx];
}

function drawBuilds() {
  const box = $('#edBuilds');
  if (!box) return;
  box.innerHTML = editing.builds.map((b, i) => `
    <div class="build-item ${i === ui.buildIdx ? 'editing' : ''}" data-bi="${i}">
      <div class="bi-head">
        <span class="prio-tag ${b.priority}">${b.priority === 'main' ? '主推' : '备选'}</span>
        <select data-set="0">${setOptions(b.sets[0])}<option value=""${!b.sets[0] ? ' selected' : ''}>（选择套装）</option></select>
        <span class="muted small">${b.sets.length > 1 ? '+' : '　'}</span>
        <select data-set="1">${setOptions(b.sets[1])}<option value=""${!b.sets[1] ? ' selected' : ''}>${b.sets.length > 1 ? '（第二套）' : '（2+2 可选）'}</option></select>
        <button type="button" class="rm" data-rmb="${i}" title="删除">×</button>
      </div>
      <div class="bi-head" style="margin:0">
        <label class="chk"><input type="checkbox" data-main="${i}" ${b.priority === 'main' ? 'checked' : ''}> 设为主推</label>
        <button type="button" class="btn sm ${i === ui.buildIdx ? 'primary' : ''}" data-ed="${i}">${i === ui.buildIdx ? '✎ 正在编辑词条' : '✎ 编辑该组词条'}</button>
        <span class="muted small">${b.sets.filter(Boolean).length === 2 ? '2+2 组合' : (b.sets.filter(Boolean).length === 1 ? '4 件套' : '未选择套装')}</span>
      </div>
    </div>`).join('');

  box.querySelectorAll('[data-ed]').forEach(btn => {
    btn.onclick = () => { ui.buildIdx = +btn.dataset.ed; drawDrawer(); };
  });

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
  const B = curBuild();
  ['sands', 'goblet', 'circlet'].forEach(slot => {
    const box = $('#edMain_' + slot);
    if (!box) return;
    const arr = B.main[slot];
    box.innerHTML = arr.map((m, i) => `
      <div class="ms-item" data-mi="${i}" data-slot="${slot}">
        ${i === 0
          ? '<span class="ord">最优</span>'
          : `<button type="button" class="op-btn ${m.op === '=' ? 'eq' : ''}" data-mop="${i}" title="与上一条的重要度关系：= 同为最想要，> 较次之">${m.op === '=' ? '=' : '>'}</button>`}
        <select>${MAIN_STATS[slot].map(s =>
          `<option value="${s.id}"${s.id === m.stat ? ' selected' : ''}>${s.name}</option>`).join('')}</select>
        <button type="button" class="up" data-up="${i}">↑</button>
        <button type="button" class="down" data-down="${i}">↓</button>
        <button type="button" class="rm" data-rmm="${i}">×</button>
      </div>`).join('') || '<p class="muted small">未设置</p>';

    box.querySelectorAll('select').forEach(sel => {
      sel.onchange = () => {
        const i = +sel.closest('.ms-item').dataset.mi;
        B.main[slot][i].stat = sel.value;
      };
    });
    box.querySelectorAll('[data-mop]').forEach(b => b.onclick = () => {
      const slot = b.closest('.ms-item').dataset.slot;
      const i = +b.dataset.mop;
      const it = curBuild().main[slot][i];
      it.op = it.op === '=' ? '>' : '=';
      drawMains();
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
      B.main[slot].splice(+b.dataset.rmm, 1);
      renank(slot); drawMains();
    });
  });
}
function renank(slot) { curBuild().main[slot].forEach((m, i) => { m.rank = i + 1; }); }

/* 副词条：与主词条一致的「排序」编辑器，外加 ★必选 开关 */
function drawSubs() {
  const box = $('#edSubs');
  if (!box) return;
  const subs = curBuild().subs;
  box.innerHTML = subs.map((s, i) => `
    <div class="ms-item" data-si="${i}">
      ${i === 0
        ? '<span class="ord">最优</span>'
        : `<button type="button" class="op-btn ${s.op === '=' ? 'eq' : ''}" data-op="${i}" title="与上一条的重要度关系：= 同为最想要，> 较次之">${s.op === '=' ? '=' : '>'}</button>`}
      <span class="ss-name">${esc(subStatName(s.id))}</span>
      <button type="button" class="star-btn ${s.req ? 'on' : ''}" data-st="${i}" title="★必须（游戏内锁定方案的「必须」）">${s.req ? '★' : '☆'}</button>
      <button type="button" class="up" data-su="${i}">↑</button>
      <button type="button" class="down" data-sd="${i}">↓</button>
      <button type="button" class="rm" data-sr="${i}">×</button>
    </div>`).join('') || '<p class="muted small">未设置，可在下方添加</p>';

  box.querySelectorAll('[data-st]').forEach(b => b.onclick = () => {
    const i = +b.dataset.st;
    subs[i].req = !subs[i].req;
    drawSubs();
  });
  box.querySelectorAll('[data-op]').forEach(b => b.onclick = () => {
    const i = +b.dataset.op;
    subs[i].op = subs[i].op === '=' ? '>' : '=';
    drawSubs();
  });
  box.querySelectorAll('[data-su]').forEach(b => b.onclick = () => {
    const i = +b.dataset.su;
    if (i === 0) return;
    [subs[i - 1], subs[i]] = [subs[i], subs[i - 1]];
    drawSubs();
  });
  box.querySelectorAll('[data-sd]').forEach(b => b.onclick = () => {
    const i = +b.dataset.sd;
    if (i === subs.length - 1) return;
    [subs[i + 1], subs[i]] = [subs[i], subs[i + 1]];
    drawSubs();
  });
  box.querySelectorAll('[data-sr]').forEach(b => b.onclick = () => {
    subs.splice(+b.dataset.sr, 1);
    drawSubs();
  });
  const add = $('#edAddSub');
  if (add) add.value = '';
}

/* 一组空的配装（默认双暴输出词条需求） */
function freshBuild(priority) {
  return {
    sets: [],
    priority: priority || 'main',
    main: { sands: [], goblet: [], circlet: [] },
    subs: toSubs(SUB_PRESETS.crit),
  };
}

function saveChar() {
  const c = editing;
  if (!c.name.trim()) return toast('请填写角色名称');
  c.name = c.name.trim();
  c.builds = c.builds
    .filter(b => b.sets && b.sets.length)
    .map(b => normalizeBuild(b, c));
  if (!c.builds.length) c.builds = [freshBuild()];
  if (!c.builds.some(b => b.priority === 'main')) c.builds[0].priority = 'main';
  c.src = (c.src || []).map(normSrcItem).filter(x => x && x.url)   // 去空 + 转对象
    .filter((v, i, a) => a.findIndex(z => z.url === v.url) === i);  // 按 url 去重
  delete c.main; delete c.subs;   // 词条需求已完全下沉到配装组

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

  const setWeights = setSubRanking(includeAlt);
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
    planCount += buildGamePlans(chars, maxPlans, name).length;
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
  const info = unused ? { plans: [], groups: [], assign: [] }
                      : buildGamePlanInfo(charsForPlan, maxPlans, name);
  const gpHtml = info.plans.some(Boolean)
    ? renderGamePlans(name, info, maxPlans, slotFilter) : '';

  // 该套装的副词条需求排序（用于花/羽行提示）
  const rank = setWeights ? (setWeights.get(name) || {}).list : null;
  const topSubs = rank
    ? rank.slice(0, 3).map(x => x.name + (x.must ? '★' : '')).join(' > ')
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

/* 一组角色的需求摘要（用于手动合并面板辨认该组是谁、要什么） */
function groupBrief(g) {
  const part = slot => {
    const set = new Set();
    g.forEach(r => (r.mains[slot] || []).slice(0, 2).forEach(m => set.add(m.stat)));
    return [...set].slice(0, 3).map(id => mainStatName(slot, id)).join('/');
  };
  return `沙 ${part('sands')} · 杯 ${part('goblet')} · 冠 ${part('circlet')}`;
}

/* 一组的副词条需求摘要：★ = 组内全员都标了必选，其余按「出现人数 × 名次」取前 3
 * 与主属性并排展示，方便判断这两组到底能不能并进同一个方案 */
function groupSubBrief(g) {
  const n = g.length;
  const reqCnt = new Map();
  g.forEach(r => (r.req || []).forEach(raw => {
    const id = statIdOf(raw);
    if (id) reqCnt.set(id, (reqCnt.get(id) || 0) + 1);
  }));
  const must = [...reqCnt.entries()].filter(([, c]) => c === n).map(([id]) => id);

  const score = new Map();
  g.forEach(r => (r.pool || []).forEach(p => {
    const id = statIdOf(p);
    const w = (p && typeof p === 'object' && typeof p.w === 'number') ? p.w : 0;
    if (id) score.set(id, (score.get(id) || 0) + w);
  }));
  const rest = [...score.entries()]
    .filter(([id]) => !must.includes(id))
    .sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => id);

  if (!must.length && !rest.length) return '<span class="muted">不限</span>';
  const starTxt = must.map(id => `<b class="gp-mstar">★${esc(subStatName(id))}</b>`).join(' ');
  const restTxt = rest.map(id => esc(subStatName(id))).join(' > ');
  return [starTxt, restTxt].filter(Boolean).join((must.length && rest.length) ? ' > ' : '');
}

/* 渲染「手动合并」面板：自然分组数超过槽位时，让用户自己决定哪些组并到一个方案 */
function renderMergePanel(setName, info) {
  const { groups, assign, maxPlans } = info;
  const rows = groups.map((g, i) => {
    const opts = Array.from({ length: maxPlans }, (_, k) =>
      `<option value="${k}"${assign[i] === k ? ' selected' : ''}>方案${k + 1}</option>`).join('');
    return `
      <div class="gp-mrow">
        <span class="gp-mname">${g.map(r => esc(r.name)).join('、')}</span>
        <span class="gp-minfo">${esc(groupBrief(g))}</span>
        <span class="gp-msubs">${esc(groupSubBrief(g))}</span>
        <select class="gp-msel" data-gp-assign="${esc(setName)}|${i}">${opts}</select>
      </div>`;
  }).join('');

  return `
  <details class="gp-merge"${Object.keys(state.planAssign[setName] || {}).length ? ' open' : ''}>
    <summary>
      <span class="gp-merge-title">✂️ 手动合并：需求分为 <b>${groups.length}</b> 组，需合并到 <b>${maxPlans}</b> 个方案槽</span>
      <span class="gp-merge-hint">自动结果已预填，可自行调整每组归入哪个方案</span>
    </summary>
    <div class="gp-merge-body">
      <div class="gp-mhead">
        <span>角色组</span><span>主属性需求</span><span>副属性需求（★=全员必选）</span><span>归入</span>
      </div>
      ${rows}
      <div class="gp-mfoot">
        <button class="btn sm" data-gp-reset="${esc(setName)}">重置为自动合并</button>
        <span class="gp-mtip">改动会随本地存档一起保存　·　把主 / 副属性需求相近的组并到一起最划算</span>
      </div>
    </div>
  </details>`;
}

/* 渲染「游戏内锁定方案」区块 */
function renderGamePlans(setName, info, maxPlans, slotFilter = 'all') {
  const plans = info.plans;
  const cards = plans.map((p, i) => {
    if (!p) return '';
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

  const used = plans.filter(Boolean).length;
  const mergeHtml = (info.groups && info.groups.length > maxPlans)
    ? renderMergePanel(setName, info) : '';

  return `
  <div class="gp-wrap">
    <div class="gp-head">
      <span class="gp-title">🎮 游戏内锁定方案</span>
      <span class="gp-meta">${used} / ${maxPlans} 个预设 · 多个方案共同生效</span>
    </div>
    ${mergeHtml}
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
      const info = buildGamePlanInfo(chars, maxPlans, name);
      const used = info.plans.filter(Boolean).length;
      if (!used) return;
      setCount++;
      L.push('━━━━━━━━━━━━━━━━━━━━━━━━');
      L.push(`【${name}】${used} 个预设`);
      info.plans.forEach((p, i) => { if (p) L.push(planToGameText(name, p, i)); });
      L.push('');
      total += used;
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
    <p class="muted small" style="margin-top:14px">${n ? '当前已启用 ' + n + ' 个角色，下方评分器按这些角色的副词条<b>需求排序</b>打分（按配装组统计）。' : '尚未启用角色，评分器暂用「双暴输出」默认排序。'}</p>`;

  // 评分器：初始化
  const sS = $('#scoreSet'), sL = $('#scoreSlot');
  {
    const cur = sS.value;
    sS.innerHTML = '<option value="">（不限套装）</option>' + allSets().map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join('');
    sS.value = cur;
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
  const rank = setSubRanking($('#planAltBuild') ? $('#planAltBuild').checked : true);
  const rows = Array.from(rank.entries())
    .sort((a, b) => a[0].localeCompare(b[0], 'zh'))
    .map(([setName, o]) => {
      const top = o.list.slice(0, 5);
      if (!top.length) return '';
      const max = Math.max(0.001, top[0].score);
      const tags = top.map((t, i) =>
        `<span class="set-tag ${t.must ? 'main' : ''}" style="margin-right:4px">${i + 1}. ${esc(t.name)}${t.must ? '★' : ''}</span>`).join('');
      const bars = top.map(t =>
        `<div style="display:flex;align-items:center;gap:5px;margin:2px 0"><span class="wbar" style="width:${Math.max(2, (t.score / max) * 90)}px"></span></div>`).join('');
      return `<tr>
        <td style="white-space:nowrap">${esc(setName)}<span class="muted small"> ×${o.n}</span></td>
        <td>${tags}</td>
        <td style="width:130px">${bars}</td>
      </tr>`;
    }).join('');

  $('#setSubTable').innerHTML = rows
    ? `<table class="tbl"><thead><tr><th>套装</th><th>副词条需求排序 Top5（★= 多数角色标为必选）</th><th>相对强度</th></tr></thead><tbody>${rows}</tbody></table>`
    : '<p class="muted small">启用角色后这里会显示每个套装的副词条需求排序。</p>';
}

/* ============================================================
 * 套装管理（数据管理页浮窗，点「打开套装管理」弹出）
 * ============================================================ */
function renderSets() {
  const box = $('#setManager');
  if (!box) return;
  const showHidden = $('#setShowHidden') && $('#setShowHidden').checked;
  const hiddenCount = state.sets.filter(s => s.hidden).length;

  const rows = state.sets
    .map((s, i) => ({ s, i }))
    .filter(x => showHidden || !x.s.hidden)
    .map(({ s, i }) => `
      <div class="sm-row ${s.hidden ? 'off' : ''}">
        <span class="sm-no">${i + 1}</span>
        <input type="text" class="sm-name" data-smname="${i}" value="${esc(s.name)}"${s.builtin ? ' title="内置套装"' : ''}>
        <input type="text" class="sm-bonus" data-smbonus="${i}" value="${esc(s.bonus || '')}" placeholder="2 件套效果">
        <span class="sm-ops">
          <span class="sm-badge ${s.builtin ? 'bi' : 'cu'}">${s.builtin ? '内置' : '自定义'}</span>
          <button class="btn sm" data-smup="${i}" title="上移">↑</button>
          <button class="btn sm" data-smdown="${i}" title="下移">↓</button>
          ${s.hidden
            ? `<button class="btn sm" data-smshow="${i}">恢复</button>`
            : `<button class="btn sm ${s.builtin ? '' : 'danger'}" data-smhide="${i}">${s.builtin ? '隐藏' : '删除'}</button>`}
        </span>
      </div>`).join('');

  box.innerHTML = `
    <div class="sm-row sm-head">
      <span class="sm-no">#</span><span>套装名称</span><span>2 件套效果</span><span class="sm-ops">操作</span>
    </div>
    ${rows || '<p class="muted small">没有可显示的套装。</p>'}
    <p class="muted small" style="margin-top:10px">
      共 ${state.sets.length} 个套装${hiddenCount ? `（已隐藏 ${hiddenCount} 个）` : ''}；改名会自动同步到所有角色的配装。
    </p>`;

  // 改名（同步到角色配装）
  box.querySelectorAll('[data-smname]').forEach(inp => {
    inp.onchange = () => renameSet(+inp.dataset.smname, inp.value);
  });
  // 改 2 件套效果
  box.querySelectorAll('[data-smbonus]').forEach(inp => {
    inp.onchange = () => {
      const s = state.sets[+inp.dataset.smbonus];
      if (!s) return;
      s.bonus = inp.value.trim();
      save(); renderPlan();
    };
  });
  // 上移 / 下移
  box.querySelectorAll('[data-smup]').forEach(b => b.onclick = () => moveSet(+b.dataset.smup, -1));
  box.querySelectorAll('[data-smdown]').forEach(b => b.onclick = () => moveSet(+b.dataset.smdown, 1));
  // 隐藏 / 删除
  box.querySelectorAll('[data-smhide]').forEach(b => b.onclick = () => hideSet(+b.dataset.smhide));
  box.querySelectorAll('[data-smshow]').forEach(b => b.onclick = () => {
    const s = state.sets[+b.dataset.smshow];
    if (!s) return;
    s.hidden = false;
    save(); afterSetsChange();
    toast('已恢复：' + s.name);
  });

  const cnt = $('#statSetCount');
  if (cnt) cnt.textContent = state.sets.filter(s => !s.hidden).length;
}

/* 套装改名：同步替换所有角色配装里的引用 */
function renameSet(idx, newName) {
  const s = state.sets[idx];
  if (!s) return;
  const nn = (newName || '').trim();
  if (!nn) { renderSets(); return toast('套装名称不能为空'); }
  if (nn === s.name) return;
  if (state.sets.some((x, i) => i !== idx && x.name === nn)) {
    renderSets();
    return toast('已存在同名套装');
  }
  const old = s.name;
  let n = 0;
  state.characters.forEach(c => c.builds.forEach(b => {
    b.sets = (b.sets || []).map(x => { if (x === old) { n++; return nn; } return x; });
  }));
  s.name = nn;
  save(); afterSetsChange();
  toast(`已改名为「${nn}」${n ? `，同步更新 ${n} 处配装引用` : ''}`);
}

function moveSet(i, dir) {
  const j = i + dir;
  if (i < 0 || j < 0 || i >= state.sets.length || j >= state.sets.length) return;
  [state.sets[i], state.sets[j]] = [state.sets[j], state.sets[i]];
  save(); afterSetsChange();
}

function hideSet(i) {
  const s = state.sets[i];
  if (!s) return;
  if (s.builtin) {
    s.hidden = true;
    save(); afterSetsChange();
    return toast('已隐藏：' + s.name + '（角色配装引用保留）');
  }
  const used = state.characters.filter(c => (c.builds || []).some(b => (b.sets || []).includes(s.name)));
  if (!confirm(`删除自定义套装「${s.name}」？${used.length ? `\n有 ${used.length} 个角色的配装用到了它，会一并移除。` : ''}`)) return;
  state.characters.forEach(c => c.builds.forEach(b => {
    b.sets = (b.sets || []).filter(x => x !== s.name);
  }));
  state.sets.splice(i, 1);
  delete state.planAssign[s.name];
  save(); afterSetsChange();
  toast('已删除：' + s.name);
}

/* 套装列表变动后的联动刷新 */
function afterSetsChange() {
  renderSets(); renderChars(); renderPlan(); renderSubs();
}

/* 套装管理浮窗的开关（入口在数据管理页） */
function openSetMgr() {
  renderSets();
  $('#setMgrBox').classList.remove('hidden');
  $('#setMgrMask').classList.remove('hidden');
}
function closeSetMgr() {
  $('#setMgrBox').classList.add('hidden');
  $('#setMgrMask').classList.add('hidden');
}

/* ============================================================
 * 页面 ④：数据管理
 * ============================================================ */

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
  // 方案页内的动态元素（复制按钮 / 手动合并下拉 / 重置按钮），统一事件委托
  $('#planBody').addEventListener('click', e => {
    const btn = e.target.closest('.gp-copy');
    if (btn) { copyOnePlan(btn.dataset.gpCopy); return; }

    const reset = e.target.closest('[data-gp-reset]');
    if (reset) {
      const setName = reset.dataset.gpReset;
      delete state.planAssign[setName];
      save(); renderPlan();
      toast(`「${setName}」已重置为自动合并`);
    }
  });
  $('#planBody').addEventListener('change', e => {
    const sel = e.target.closest('[data-gp-assign]');
    if (!sel) return;
    const [ setName, idxStr ] = sel.dataset.gpAssign.split('|');
    const b = computePlan($('#planAltBuild').checked).get(setName);
    if (!b) return;
    const chars = state.characters.filter(c => c.enabled && b.users.has(c.name));
    const maxPlans = +($('#planSlots') ? $('#planSlots').value : 3) || 3;
    const info = buildGamePlanInfo(chars, maxPlans, setName);
    const g = info.groups[+idxStr];
    if (!g) return;
    if (!state.planAssign[setName]) state.planAssign[setName] = {};
    state.planAssign[setName][groupKey(g)] = +sel.value;
    save();
    renderPlan();
  });

  function copyOnePlan(dataset) {
    const [ setName, idxStr ] = dataset.split('|');
    const b = computePlan($('#planAltBuild').checked).get(setName);
    if (!b) return;
    const chars = state.characters.filter(c => c.enabled && b.users.has(c.name));
    const maxPlans = +($('#planSlots') ? $('#planSlots').value : 3) || 3;
    const plans = buildGamePlanInfo(chars, maxPlans, setName).plans;
    const p = plans[+idxStr];
    if (!p) return;
    const txt = `【${setName}】\n` + planToGameText(setName, p, +idxStr);
    navigator.clipboard.writeText(txt)
      .then(() => toast(`已复制「${setName} 方案${+idxStr + 1}」`))
      .catch(() => fallbackCopy(txt));
  }
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
        renderChars(); renderPlan(); renderSubs(); renderSets();
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
    if (!confirm('恢复内置默认角色库与套装列表？你的自定义修改会丢失。')) return;
    state = normalize({ characters: buildDefaultCharacters(), sets: defaultSets(), planAssign: {} });
    save(); renderChars(); renderPlan(); renderSubs(); renderSets();
    toast('已恢复默认库');
  };
  $('#btnHardReset').onclick = () => {
    if (!confirm('清空本机浏览器保存的全部配置（角色 / 套装 / 方案）并重新加载？\n\n提示：浏览器普通「刷新」只重载页面、不会清本地存档，所以旧数据或乱码会一直留着；这个按钮才是真正的硬刷新。')) return;
    try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
    location.reload();
  };
  $('#btnAddSet').onclick = () => {
    const n = $('#newSetName').value.trim();
    const b = $('#newSetBonus').value.trim();
    if (!n) return toast('请输入套装名称');
    if (allSets().includes(n)) return toast('该套装已存在');
    state.sets.push({ name: n, bonus: b, builtin: false, hidden: false });
    $('#newSetName').value = ''; $('#newSetBonus').value = '';
    save(); renderSets(); renderPlan(); renderChars();
    toast('已添加套装：' + n);
  };
  $('#setShowHidden').onchange = renderSets;
  $('#btnRestoreSets').onclick = () => {
    let n = 0;
    SETS.forEach(s => {
      const cur = state.sets.find(x => x.name === s.name);
      if (cur) { if (cur.hidden) { cur.hidden = false; n++; } }
      else { state.sets.push({ name: s.name, bonus: s.bonus, builtin: true, hidden: false }); n++; }
    });
    save(); renderSets(); renderPlan(); renderChars();
    toast(n ? `已恢复 ${n} 个内置套装` : '内置套装已全部在列表中');
  };
  // 套装管理浮窗
  $('#btnOpenSetMgr').onclick = openSetMgr;
  $('#btnCloseSetMgr').onclick = closeSetMgr;
  $('#setMgrMask').onclick = closeSetMgr;

  // 帮助
  const openHelp = () => { $('#helpBox').classList.remove('hidden'); $('#helpMask').classList.remove('hidden'); };
  const closeHelp = () => { $('#helpBox').classList.add('hidden'); $('#helpMask').classList.add('hidden'); };
  $('#btnHelp').onclick = openHelp;
  $('#btnCloseHelp').onclick = closeHelp;
  $('#helpMask').onclick = closeHelp;

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { showDrawer(false); closeHelp(); closeSetMgr(); }
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
/* 顶栏高度会随视口宽度变化（手机端会隐藏副标题），
 * 用 CSS 变量同步给 sticky 的标签栏，避免硬编码偏移导致重叠或空隙 */
function syncTopbarHeight() {
  const tb = document.querySelector('.topbar');
  if (tb) document.documentElement.style.setProperty('--tbh', tb.offsetHeight + 'px');
}

(function init() {
  state = load();
  if (pendingMigrate) { save(); pendingMigrate = null; }   // 固化从默认数据的回填
  bind();
  renderBatchBar();
  renderChars();
  renderPlan();
  renderSubs();
  renderSets();
  syncTopbarHeight();
  window.addEventListener('resize', syncTopbarHeight);
  window.addEventListener('orientationchange', () => setTimeout(syncTopbarHeight, 120));
})();
