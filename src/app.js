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

/* 可互换主要属性组：同一角色在这些词条里只需 1 件（掉到哪个用哪个） */
const SWAP_GROUPS = {
  circlet: [{ a: 'cr', b: 'cd' }],
};

let state = null;
let pendingMigrate = null;   // load() 若从旧存档回填了数据，init 里据此回写本地存储
const SUB_EPOCH = 1;         // 追加属性预设重要度版本；递增即把精炼后的预设同步给旧存档
let ui = { elem: 'all', search: '', onlyEnabled: false, planSet: 'all', planSlot: 'all', buildIdx: 0 };

/* 把「追加属性 / 主要属性」项统一归一为 id 字符串：
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
 * 出厂（内置）数据缓存与「是否改动过」判定
 * ------------------------------------------------------------
 * 出厂缓存只算一次（112 个角色深拷贝不便宜），且**取用方必须自己深拷贝**，
 * 绝不能直接把缓存里的对象挂到 state 上，否则改的就是缓存。
 * ============================================================ */
let _defaultCharsCache = null;
function defaultCharacters() {
  if (!_defaultCharsCache) _defaultCharsCache = buildDefaultCharacters();
  return _defaultCharsCache;
}
/* 原始数据（可写）：调用方拿到的是副本，改它不会影响缓存 */
function freshDefaultCharacters() {
  return defaultCharacters().map(c => JSON.parse(JSON.stringify(c)));
}
/* 按出厂名取（出厂名唯一，实测 112 个无重复） */
function defaultCharByName(name) {
  if (!name) return null;
  return defaultCharacters().find(c => c.name === name) || null;
}

/* 一个角色的出厂版本：优先用 skey（改名后仍准），否则退回当前名字 */
function factoryCharOf(c) {
  if (!c || c.custom) return null;
  return defaultCharByName(c.skey || c.name);
}

/* 配装组「内容」指纹：固定字段顺序的数组，规避 key 顺序差异
 * 排除 rank（由下标派生，改内容必然改下标，重复计入没意义）、bkey（标识而非内容）
 * 以及 priority（主推单独判定 —— 只改主推不该让「整组还原」按钮冒出来） */
function canonBuild(b) {
  if (!b) return '[]';
  const mains = ['sands', 'goblet', 'circlet'].map(slot =>
    ((b.main && b.main[slot]) || []).map(m => [statIdOf(m && m.stat), m && m.op === '=' ? '=' : '>']));
  const subs = (b.subs || []).map(s => {
    const id = typeof s === 'object' ? (s.id != null ? s.id : s.stat) : s;
    const req = (s && s.req) ? '1' : '0';
    const op = (s && s.op === '=') ? '=' : '>';
    return [id, req, op];
  });
  return JSON.stringify({
    sets: (b.sets || []).filter(Boolean),
    mains, subs,
  });
}
/* 内容指纹 + 主推：整体比较（角色级「已修改」与草稿脏检查用这个） */
function canonBuildPrio(b) {
  return JSON.stringify([canonBuild(b), b && b.priority === 'alt' ? 'alt' : 'main']);
}
/* 角色指纹：排除 enabled / id / custom（用户启用与否、id 漂移都不算改了出厂数据） */
function canonCharWith(c, builds) {
  return JSON.stringify({
    name: c.name, element: c.element, region: c.region,
    roles: (c.roles || []).slice(),
    note: c.note || '', src: (c.src || []).map(s => [s.url, s.title || '']),
    builds: (builds || []).map(canonBuildPrio),
  });
}
function canonChar(c) { return canonCharWith(c, (c.builds || [])); }

/* 出厂配装组「内容 canon → 该组」的索引。
 * 只在「老存档缺 bkey 且套装组合有歧义」时用（罕见路径），所以不缓存 ——
 * 缓存会让出厂数据一旦变动就留下陈旧索引。 */
function factoryCanon(d) {
  const m = new Map();
  (d.builds || []).forEach(b => { if (b.bkey) m.set(canonBuild(b), b); });
  return m;
}

/* 某一组配装对应的出厂版本：
 * 1) 先按 bkey 命中（改名、改内容都还能命中）；
 * 2) 没有 bkey（老存档）时，用「角色内 sets 组合唯一命中」兜底。 */
function factoryBuildOf(c, b) {
  const d = factoryCharOf(c);
  if (!d) return null;
  if (b && b.bkey) {
    const hit = (d.builds || []).find(x => x.bkey === b.bkey);
    return hit || null;
  }
  if (!b) return null;
  const sig = (b.sets || []).filter(Boolean).join('+');
  if (sig) {
    const hits = (d.builds || []).filter(x => (x.sets || []).filter(Boolean).join('+') === sig);
    if (hits.length === 1) return hits[0];
  }
  // 再退一步：按内容精确匹配（内容仍是出厂原样时才能命中）
  return factoryCanon(d).get(canonBuild(b)) || null;
}
/* 这一组的「内容」是否和出厂不一样（无出厂对应 → 视为自定义组，不算「已修改」）
 * 只看套装 + 词条，主推单独由 priorityModified 判定 */
function buildModified(c, b) {
  const f = factoryBuildOf(c, b);
  if (!f) return false;
  return canonBuild(f) !== canonBuild(b);
}
/* 角色内「主推排布」是否和出厂不一样（谁主推、谁备选） */
function priorityModified(c) {
  const d = factoryCharOf(c);
  if (!d || !d.builds || !d.builds.length) return false;
  const cur = (c.builds || []).map(b => b.priority === 'alt' ? 'alt' : 'main');
  const fac = d.builds.slice(0, cur.length).map(b => b.priority === 'alt' ? 'alt' : 'main');
  return cur.join(',') !== fac.join(',');
}
/* 只还原主推排布（不动任何内容） */
function restorePriority(c) {
  const d = factoryCharOf(c);
  if (!d || !d.builds || !d.builds.length) return false;
  (c.builds || []).forEach((b, i) => {
    b.priority = (d.builds[i] ? d.builds[i].priority : 'alt') === 'main' ? 'main' : 'alt';
  });
  // 兜底：出厂第 1 组可能因删组而不在当前列表里，保证有且仅有一个主推
  if (!c.builds.some(b => b.priority === 'main')) c.builds[0].priority = 'main';
  let seen = false;
  c.builds.forEach(b => {
    if (b.priority === 'main') { if (seen) b.priority = 'alt'; else seen = true; }
  });
  return true;
}
/* 整个角色是否和出厂不一样。
 * 只比「当前拥有的这几组」—— 后台给角色新增了配装组时，不该把用户没动过的角色标成已修改 */
function charModified(c) {
  const d = factoryCharOf(c);
  if (!d) return false;
  const n = (c.builds || []).length;
  return canonChar(c) !== canonCharWith(d, (d.builds || []).slice(0, n));
}
/* 有没有值得还原的东西：用户改过，或者出厂里有这一角色还没用上的配装组 */
function charCanRestore(c) {
  const d = factoryCharOf(c);
  if (!d) return false;
  if (charModified(c)) return true;
  const used = new Set((c.builds || []).map(b => b.bkey).filter(Boolean));
  return (d.builds || []).some(b => b.bkey && !used.has(b.bkey));
}
/* 出厂里、当前角色没有用到的配装组（「从预置添加」的下拉项） */
function factoryPresetOptions(c) {
  const d = factoryCharOf(c);
  if (!d) return [];
  const used = new Set((c.builds || []).map(b => b.bkey).filter(Boolean));
  return (d.builds || []).filter(b => b.bkey && !used.has(b.bkey));
}
/* 出厂配装组的可用副本：深拷贝 + 过一遍归一化（出厂 main 项不带 op 等字段，
 * 不归一化的话还原出来的组与「全新安装」的存档长不一致） */
function factoryBuildCopy(f, c) {
  if (!f) return null;
  const b = normalizeBuild(JSON.parse(JSON.stringify(f)), c || {});
  b.bkey = f.bkey;
  b.fcanon = canonBuild(b);   // 记下锚点：之后内容一旦被改，就不再自动跟随出厂
  return b;
}

/* 整组还原：套装 + 词条 + 主推全部回到出厂原样，再修正「有且仅有一个主推」 */
function restoreBuild(c, i) {
  const b = c.builds[i];
  const f = factoryBuildOf(c, b);
  if (!f) return false;
  const copy = factoryBuildCopy(f, c);
  copy.priority = f.priority === 'main' ? 'main' : 'alt';
  c.builds[i] = copy;
  // 主推唯一：优先保留这一组的主推身份，否则取下标最小的
  let mainIdx = c.builds.findIndex(x => x.priority === 'main');
  if (mainIdx < 0) mainIdx = 0;
  c.builds.forEach((x, j) => { x.priority = j === mainIdx ? 'main' : 'alt'; });
  return true;
}
/* 整角色还原：名字 / 元素 / 国度 / 定位 / 备注 / 来源 / 全部配装，再补回 skey */
function restoreChar(c) {
  const d = factoryCharOf(c);
  if (!d) return false;
  const skey = c.skey || d.name;
  const keepEnabled = c.enabled;
  const copy = JSON.parse(JSON.stringify(d));
  copy.builds = (d.builds || []).map(b => factoryBuildCopy(b, copy));
  copy.skey = skey;
  copy.enabled = keepEnabled;
  Object.keys(c).forEach(k => { delete c[k]; });
  Object.assign(c, copy);
  return true;
}

/* 后台（仓库）更新内置数据后，让「用户没动过」的配装组自动跟上新版出厂。
 * 判定：内容指纹 == 上次同步时的指纹（fcanon）→ 用户确实没改过 → 用新出厂覆盖。
 * 主推是用户偏好，即使内容跟随也保留不动（主推归「还原主推」管）。
 * 老存档没有 fcanon 时，若内容恰好等于出厂就补上锚点，从这一版开始具备跟随能力。 */
function syncFactoryUpdates() {
  let n = 0;
  state.characters.forEach(c => {
    if (c.custom) return;
    (c.builds || []).forEach(b => {
      const f = factoryBuildOf(c, b);
      if (!f) return;
      const cur = canonBuild(b), fac = canonBuild(f);
      if (b.fcanon == null) { if (cur === fac) b.fcanon = cur; return; }
      if (cur !== b.fcanon) return;      // 用户改过 → 一律不动
      if (cur === fac) return;           // 已经是最新出厂
      const copy = factoryBuildCopy(f, c);
      b.sets = copy.sets; b.main = copy.main; b.subs = copy.subs;
      b.fcanon = canonBuild(b);
      n++;
    });
  });
  return n;
}

/* 老存档兜底：给缺 bkey 的出厂组补上指纹。
 * 只写 bkey、不要求内容相同 —— 否则「改过内容 → 还原这一组」就没落点了。
 * 匹配不上（多义 / 空套装）的不写，降级为自定义组。 */
function backfillBkeys() {
  let n = 0;
  state.characters.forEach(c => {
    if (c.custom) return;
    (c.builds || []).forEach(b => {
      if (b.bkey) return;
      const f = factoryBuildOf(c, b);
      if (f) { b.bkey = f.bkey; n++; }
    });
  });
  return n;
}

/* ============================================================
 * 存储
 * ============================================================ */
/* 把旧存档与内置默认对齐，解决「旧版本存档覆盖了带 src 的新默认数据，
   导致卡片/编辑抽屉看不到攻略链接」的问题：
   1) 若某内置角色的存档里没有来源、但内置默认有，则回填来源链接；
   2) 把内置默认里、存档没有的新角色补进来（按名字去重）。
   回填仅在首次迁移时执行（用 _srcMigrated 标记），不覆盖用户之后手动清空/自定义。 */
function migrateFromDefaults(o) {
  const defs = defaultCharacters();
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
  // 同步精炼后的追加属性预设重要度（epoch 防循环）：仅刷新「词条集合未改」的内置角色，
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
  // 全新出厂：直接把 epoch 打上。否则存档里没有 _subEpoch，
  // 下次加载会被当成「旧存档」触发预设刷新，把用户只调了顺序的改动冲掉
  return normalize({ characters: freshDefaultCharacters(), sets: defaultSets(), planCfg: {},
                     _subEpoch: SUB_EPOCH, _srcMigrated: true });
}

/* 默认套装列表（内置套装 + 空自定义列表） */
function defaultSets() {
  return SETS.map(s => ({ name: s.name, bonus: s.bonus, builtin: true, hidden: false }));
}

/* 命中条数钳位：只接受 1–SUB_MIN_HIT_MAX 的整数，其余回落到预设值 */
function clampHit(n) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return SUB_MIN_HIT_DEFAULT;
  return Math.min(SUB_MIN_HIT_MAX, Math.max(1, v));
}

/* planCfg 归一化：{ 套装名: { merge: [[key...]], hide: [key...], minHit: { key: 1-4 } } }
 *   只保留结构合法的条目；成员不足 2 个的 merge 组视为无效（已无意义） */
function normalizePlanCfg(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  Object.entries(raw).forEach(([setName, cfg]) => {
    if (!cfg || typeof cfg !== 'object') return;
    const merge = (Array.isArray(cfg.merge) ? cfg.merge : [])
      .map(g => (Array.isArray(g) ? g.filter(k => typeof k === 'string') : []))
      .filter(g => g.length >= 2);
    const hide = (Array.isArray(cfg.hide) ? cfg.hide : []).filter(k => typeof k === 'string');
    // 命中条数覆盖：{ 方案 key: N }，只留 1–4 的整数
    const minHit = {};
    if (cfg.minHit && typeof cfg.minHit === 'object') {
      Object.entries(cfg.minHit).forEach(([k, v]) => {
        const n = Math.round(Number(v));
        if (Number.isFinite(n) && n >= 1 && n <= SUB_MIN_HIT_MAX) minHit[k] = n;
      });
    }
    // 已并入某组的候选，不要再单独躺在 hide 里
    const mergedFlat = new Set(merge.flat());
    out[setName] = { merge, hide: hide.filter(k => !mergedFlat.has(k)), minHit };
  });
  return out;
}

/* 取某套装的 planCfg（不存在则返回空结构，调用方可安全读写后存回） */
function planCfgOf(setName) {
  if (!state.planCfg) state.planCfg = {};
  if (!state.planCfg[setName]) state.planCfg[setName] = { merge: [], hide: [], minHit: {} };
  const c = state.planCfg[setName];
  if (!Array.isArray(c.merge)) c.merge = [];
  if (!Array.isArray(c.hide)) c.hide = [];
  if (!c.minHit || typeof c.minHit !== 'object') c.minHit = {};
  return c;
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

  // 用户对候选方案的手动整理结果：{ 套装名: { merge: [[key,key,...]], hide: [key] } }
  //   merge = 若干个「并入同一套」的候选组合；hide = 弃用的候选（不采纳，也不参与导出）
  o.planCfg = normalizePlanCfg(o.planCfg);
  delete o.planAssign;   // 旧字段（组指纹 → 槽位下标），已被 3 槽位限制一同废弃
  // 散件 / 过渡 保留规则：enabled = 启用的规则 id 列表，custom = 用户自定义规则
  o.keepRules = normalizeKeepRules(o.keepRules);
  o.characters = o.characters.map(c => ({
    id: c.id || ('c_' + Math.random().toString(36).slice(2)),
    name: c.name || '未命名',
    skey: typeof c.skey === 'string' ? c.skey : '',   // 出厂角色名：改名后保持不变，是「还能还原」的唯一锚点
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

/* 配装组归一化：把主/追加属性需求从角色级迁移到配装组级
 *   旧结构：角色一个 subs（数值权重对象）+ 一个 main
 *   新结构：每组配装各自带 main + subs（有序数组 + 必选标记）
 */
function normalizeBuild(b, c) {
  const out = {
    sets: Array.isArray(b.sets) ? b.sets.filter(Boolean) : [],
    bkey: typeof b.bkey === 'string' ? b.bkey : '',   // 出厂指纹（「角色名#序号」），用来判断这一组是否还是内置原样
    // fcanon = 上次与出厂同步时的内容指纹；内容还等于它 → 说明用户没动过，可以自动跟随出厂更新
    fcanon: (b.fcanon == null ? null : String(b.fcanon)),
    priority: b.priority === 'alt' ? 'alt' : 'main',
  };
  // 主要属性：优先用组内的，缺失则回落到角色级旧数据
  const srcMain = b.main || c.main;
  out.main = {
    sands:   normalizeMains(srcMain && srcMain.sands, 'sands'),
    goblet:  normalizeMains(srcMain && srcMain.goblet, 'goblet'),
    circlet: normalizeMains(srcMain && srcMain.circlet, 'circlet'),
  };
  // 追加属性：优先用组内的，缺失则把角色级旧权重转成「排序 + 必选」
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

/* 追加属性归一化：
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

/* 散件 / 过渡 保留规则归一化：兼容旧存档（无此字段时按内置默认启用）
 *   enabled   —— 启用的规则 id 列表
 *   custom    —— 用户自建的规则
 *   overrides —— 对【内置】规则的修改覆盖：{ 内置id: { 被改的字段 } }，删掉即恢复默认
 */
function normalizeKeepRules(raw) {
  const r = (raw && typeof raw === 'object') ? raw : {};
  const validSlot = id => !!MAIN_STATS[id];
  const validSub = id => SUB_STATS.some(s => s.id === id);
  const builtinIds = new Set(KEEP_RULES.map(x => x.id));

  /* 可编辑字段白名单校验（内置覆盖与自定义规则共用）
   *   slot 变更后，主要属性要按【新部位】重新过滤，避免留下无效项 */
  const cleanFields = (x, slot) => ({
    name: (typeof x.name === 'string' && x.name.trim()) ? x.name.trim() : '',
    desc: (typeof x.desc === 'string') ? x.desc : '',
    slot,
    mains: (Array.isArray(x.mains) ? x.mains : []).filter(m => (MAIN_STATS[slot] || []).some(s => s.id === m)),
    required: (Array.isArray(x.required) ? x.required : []).filter(validSub),
    pool: (Array.isArray(x.pool) ? x.pool : []).filter(validSub),
  });

  const overrides = {};
  if (r.overrides && typeof r.overrides === 'object') {
    KEEP_RULES.forEach(b => {
      const ov = r.overrides[b.id];
      if (!ov || typeof ov !== 'object') return;
      const slot = validSlot(ov.slot) ? ov.slot : b.slot;
      const f = cleanFields(ov, slot);
      // 只存「真的被改过」的字段，恢复默认时整体删掉即可
      const patch = {};
      ['name', 'desc', 'slot', 'mains', 'required', 'pool'].forEach(k => {
        if (JSON.stringify(f[k]) !== JSON.stringify(b[k])) patch[k] = f[k];
      });
      if (Object.keys(patch).length) overrides[b.id] = patch;
    });
  }

  return {
    enabled: Array.isArray(r.enabled)
      ? r.enabled.filter(x => typeof x === 'string')
      : ['goblet_elem'],
    custom: (Array.isArray(r.custom) ? r.custom : [])
      .filter(x => x && x.id && validSlot(x.slot) && !builtinIds.has(String(x.id)))
      .map(x => ({
        id: String(x.id),
        builtin: false,
        ...cleanFields(x, x.slot),
        name: (typeof x.name === 'string' && x.name.trim()) ? x.name.trim() : '自定义规则',
      })),
    overrides,
    // 模块整体收起（只是不显示，enabled 里的规则照常生成候选方案）
    collapsed: !!r.collapsed,
  };
}

/* 「散件 / 过渡 保留规则」模块的收起 / 展开：只影响显示，不影响是否启用 */
function applyKrFold() {
  const on = !!(state && state.keepRules && state.keepRules.collapsed);
  const body = $('#krBody');
  if (body) body.classList.toggle('hidden', on);
  const btn = $('#krFold');
  if (btn) {
    btn.textContent = on ? '▸' : '▾';
    btn.setAttribute('aria-expanded', on ? 'false' : 'true');
    btn.title = on ? '展开这一模块' : '收起这一模块（只是不显示，启用的规则照常生效）';
  }
  const card = $('#krCard');
  if (card) card.classList.toggle('folded', on);
}
function setKrCollapsed(on) {
  if (!state || !state.keepRules) return;
  state.keepRules.collapsed = !!on;
  applyKrFold();
  save();
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
 * 追加属性「排序 + 必选」模型
 *   一份追加属性需求 = 有序数组 [{ id, req }]，越靠前越想要，req=true 表示 ★必须
 *   名次权重用于「相似度 / 评分 / 排序」等需要数值的场合（界面上不暴露给用户的内部量）
 * ============================================================ */
const SUB_RANK_DECAY = 0.72;  // 名次权重衰减：第 1 名 1.0，之后 ×0.72
const SUB_POOL_TOP   = 5;     // 每人最多贡献 N 条追加属性，避免追加属性池过宽
const SUB_POOL_MAX   = 5;     // 合并后的追加属性池上限（再宽就等同于「不限」，失去筛选意义）

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

/* 有序追加属性 → { id: 权重 }，★必选额外加权，保证它一定算核心需求 */
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

/* ★必选词条集合 */
function reqSubs(list) {
  return (list || []).filter(s => s.req).map(s => s.id);
}
/* 追加属性池：取前 SUB_POOL_TOP 名，并带上各自的算子权重（供合并时按重要度累加） */
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

        // 花 / 羽：主要属性固定
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

/* 合并可互换主要属性（如暴击率 / 暴击伤害冠） */
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

/* 主要属性显示名（含可互换标注） */
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

/* 各套装的追加属性权重（按【配装组】平均，名次权重制） */
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

/* 各套装的追加属性【需求排序】：按「名次权重」平均降序，并统计有多少角色标了★必选
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

/* 全部启用角色的平均追加属性权重（兜底） */
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
 *   - 追加属性支持「★必须」；命中条数预设「至少两条」，可逐方案调到 1–4
 *   - 仅有 3 条追加属性的圣遗物，所需数量相应减 1
 *   - 重要属性相同但次要属性不同的角色可以合并（次要属性再按实际圣遗物适配到某个角色），
 *     此时需求角色会按次要属性【颜色分组】显示，便于照搬时区分
 *
 * 固定算法（结果可复现）：
 *   ① 角色分组：按【重要属性】凝聚聚类——两组的重要属性重合度够高才合并，
 *      次要属性不同无所谓。追加属性需求相近的角色（主C / 副C 都要双暴）会自然
 *      并成一套；辅助（充能 / 生命 / 精通）的重要属性不同，自动被拆开
 *   ② 主属性：花/羽固定；沙/杯/冠【逐部位独立合并】——按「票数 × 优先级」
 *      降序，取到累计覆盖 ≥ MAIN_COVER 为止，上限 MAIN_MAX
 *   ③ ★必须：组内全体角色都标了「必选」的追加属性，按平均名次权重降序，上限 2
 *   ④ 追加属性池：组内任一角色前 SUB_POOL_TOP 条需求（剔除与唯一主要属性冲突项）
 *   ⑤ 命中条数：预设「至少两条」——圣遗物最终 4 条追加属性，至少 2 条符合要求
 *      才值得留下强化；用户可在该方案卡片上把它单独调到 1–4：
 *      调到 3 / 4 即重做更细的筛选，把次要属性也对上的圣遗物挑出来
 * ============================================================ */
const CAND_SOFT_CAP  = 24;   // 候选数保护上限（防止极端数据下列表过长，正常不会触发）
const GAME_MAX_PRESET = 3;   // 游戏内每种套装至多 3 个自定义预设（仅作提示，工具侧不再硬限制）
const MAIN_MAX    = 3;       // 单部位主属性上限（条件过宽会「存伪」）
const MAIN_COVER  = 0.7;     // 主属性取到累计覆盖该比例为止
const SUB_MIN_HIT_DEFAULT = 2; // 追加属性命中条数【预设】「至少两个」；圣遗物最终 4 条追加属性，
                               // 至少 2 条符合要求才值得留下强化；可在方案卡片上手动调到 1–4
const SUB_MIN_HIT_MAX = 4;     // 命中条数上限（游戏内 N 取 1–4；仅有 3 条追加属性时自动减 1）

function cosSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  SUB_STATS.forEach(s => {
    const x = a[s.id] || 0, y = b[s.id] || 0;
    dot += x * y; na += x * x; nb += y * y;
  });
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d ? dot / d : 0;
}

/* 角色需求相似度 = 纯【追加属性】余弦相似度（0–1）
 *   合并只看追加属性需求像不像：主C / 副C 都要双暴 + 攻击 → 相似度高，并为一套；
 *   辅助要充能 / 生命 / 精通 → 与输出流差异大，自动拆开。
 *   主要属性不参与相似度，而是【逐部位独立合并】（见 mergeMain）。
 *
 *   注：旧实现还掺了「三个部位主属性的 Jaccard」，但 mains[slot] 是 [{stat,op}]
 *   对象数组，new Set 按引用去重 → 不同角色的同名 stat 永不相等，该项恒为 0，
 *   等于从未生效。本次直接删掉，语义反而更干净。 */
function roleSimilarity(a, b) {
  return cosSim(a.subs, b.subs);
}

function groupSim(g1, g2) {
  let sum = 0, n = 0;
  g1.forEach(a => g2.forEach(b => { sum += roleSimilarity(a, b); n++; }));
  return n ? sum / n : 0;
}

/* ---------- 重要属性 / 次要属性 ----------
 * 角色的追加属性需求是【有序】数组，且用 op 显式表达了「与上一条是否同等重要」：
 *   op === '=' → 与上一条同重要（数据里双暴就是这样并列的）
 *   其余        → 比上一条更低
 * 所以「重要属性块」可以直接从数据里读出来，不需要另设阈值：
 *   从第 1 条起沿 op='=' 一直延伸的前缀块，再并入所有 ★必选。
 * 例：crit / critHp / critDef 三种预设的重要块都是 {暴击率, 暴击伤害}，
 *     次要属性则分别是 攻击力% / 生命值% / 防御力%。
 */
function coreSetOf(role) {
  const list = role.subList || [];
  const out = new Set();
  for (let i = 0; i < list.length; i++) {
    out.add(statIdOf(list[i]));
    if (i + 1 >= list.length || list[i + 1].op !== '=') break;
  }
  (role.req || []).forEach(id => { const s = statIdOf(id); if (s) out.add(s); });
  return out;
}
function coreIntersect(a, b) {
  const s = new Set();
  a.forEach(id => { if (b.has(id)) s.add(id); });
  return s;
}

/* 一组角色里可以分出几种「次要属性偏好」：返回 [{ sig, roles, minor }]，少于 2 种返回 null
 *   —— 重要属性之外的前 2 条追加属性就是这位角色的次要偏好；偏好不同意味着合到同一套之后，
 *   圣遗物还要按实际次要属性二次分配（给最适配的那个人）。
 *   「把一组角色拆成偏好小队」这件事在池保底（mergeSubUniform）与上色（planColorGroups）
 *   两处都要用，所以抽出来共用，避免两处口径漂移。 */
function minorPreferenceGroups(group) {
  if (!group || group.length < 2) return null;
  const core = group.map(coreSetOf).reduce((acc, c) => coreIntersect(acc, c));
  const bySig = new Map();
  group.forEach(r => {
    const sig = (r.subList || []).map(statIdOf).filter(id => id && !core.has(id))
      .slice(0, 2).join(',');
    if (!bySig.has(sig)) bySig.set(sig, []);
    bySig.get(sig).push(r);
  });
  if (bySig.size < 2) return null;
  return [...bySig.keys()].sort().map(sig => ({
    sig,
    roles: bySig.get(sig),
    minor: sig.split(',').filter(Boolean),
  }));
}

/* 两组能否合并 —— 【只看重要属性】：
 *   重要属性重合度够高就合，次要属性（攻击力% / 生命值% / 防御力% 等）不同没关系：
 *   反正「至少两条」的重要属性已经满足了，具体次要属性再按实际圣遗物给到适配的角色；
 *   想更细筛就把该方案的命中条数手动调大到 3 或 4。
 *   判据：交集 ≥ min(2, 较小的核心大小)（核心只有 1 条时要求相同），
 *         且交集各自占本组核心 ≥ 一半。
 *   {暴击,暴击伤害} vs {暴击,暴击伤害} → 合并；{暴击,暴击伤害,攻击%} vs {暴击,暴击伤害,生命%} → 合并；
 *   {精通} vs {精通} → 合并；{精通} vs {充能} → 分开；{暴击,暴击伤害} vs {充能} → 分开。
 */
function coreCanMerge(A, B) {
  if (!A.size || !B.size) return false;
  let inter = 0;
  A.forEach(id => { if (B.has(id)) inter++; });
  if (!inter) return false;
  const need = Math.min(2, Math.min(A.size, B.size));
  return inter >= need && (inter / A.size) >= 0.5 && (inter / B.size) >= 0.5;
}

/* ①-a 自然分组：按【重要属性】凝聚聚类
 *   每轮在「重要属性重合度达标」的组合里，挑追加属性需求【全量余弦相似度】最高的一对
 *   合并——判据管「能不能合」，相似度管「先合谁」，保留「按追加属性需求合并」的语义。
 *   合并后的组核心 = 两边核心的交集（保证组里每个人都认这些是重要属性）。
 *   全自动，不暴露任何阈值给界面。
 */
function naturalClusters(roles) {
  const groups = roles.map(r => ({ roles: [r], core: coreSetOf(r) }));

  /* 当前最值得合并的一对：先看重要属性能不能合，再按全量相似度排序 */
  const bestPair = (requireCore) => {
    let best = null;
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        if (requireCore && !coreCanMerge(groups[i].core, groups[j].core)) continue;
        const s = groupSim(groups[i].roles, groups[j].roles);
        if (!best || s > best.s) best = { s, i, j };
      }
    }
    return best;
  };

  while (groups.length > 1) {
    const best = bestPair(true);
    if (!best) break;
    groups[best.i] = {
      roles: groups[best.i].roles.concat(groups[best.j].roles),
      core: coreIntersect(groups[best.i].core, groups[best.j].core),
    };
    groups.splice(best.j, 1);
  }

  // 保护上限：极端数据下防止候选列表过长（此时不再要求重要属性重合，纯贪心兜底）
  while (groups.length > CAND_SOFT_CAP) {
    const best = bestPair(false);
    if (!best) break;
    groups[best.i] = {
      roles: groups[best.i].roles.concat(groups[best.j].roles),
      core: coreIntersect(groups[best.i].core, groups[best.j].core),
    };
    groups.splice(best.j, 1);
  }
  return groups.map(g => g.roles);
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

/* 花/羽的主要属性（固定值），该词条不可能作为同部位的追加属性出现 */
const FIXED_MAIN = { flower: 'hp', plume: 'atk' };

/* ③④⑤ 合并一组角色的追加属性条件 —— 【全方案唯一一份，五个部位共用】
 *   ① 冲突剔除：追加属性不可能与同部位主要属性相同。改为方案级统一后，只能剔除
 *      花 / 羽的固定主要属性（hp / atk，这两部位主要属性恒定）；其余部位的主要属性随
 *      方案而变，无法再逐部位剔除——这是「统一追加属性」换取一致性的固有取舍。
 *   ② ★必须：组内「所有」角色都标了必选的词条（交集），按平均名次权重降序，最多 2 个
 *   ③ 追加属性池：组内任一角色前 SUB_POOL_TOP 条需求，按「广度 × 名次」累加降序
 *   ④ 命中条数：预设「至少两个」（SUB_MIN_HIT_DEFAULT）。圣遗物最终 4 条追加属性，
 *      至少 2 条符合要求才值得留下强化——契合得越多越好；用户可在方案卡片上
 *      单独调到 1–4（重要属性相同、次要属性不同的大组，调大即可做更细的筛选）
 */
function mergeSubUniform(group) {
  const n = group.length;
  if (!n) return { required: [], pool: [], minHit: 0 };
  const banned = new Set([FIXED_MAIN.flower, FIXED_MAIN.plume]);  // 花/羽主要属性固定，恒冲突

  const avgW = id => group.reduce((s, r) => s + (r.subs[id] || 0), 0) / n;

  /* ② ★必须：组内全员必选的交集 */
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

  /* ③ 追加属性池：按「出现人数 × 算子权重」累加 */
  const poolScore = new Map();
  group.forEach(r => (r.pool || []).forEach(p => {
    const id = statIdOf(p);
    const w = (p && typeof p === 'object' && typeof p.w === 'number') ? p.w : 0;
    if (!id || banned.has(id)) return;
    poolScore.set(id, (poolScore.get(id) || 0) + w);
  }));
  let pool = [...poolScore.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
  // ★必须一定得在追加属性池里（可能排名在 SUB_POOL_TOP 之外）
  required.forEach(id => { if (!pool.includes(id)) pool.push(id); });

  // 追加属性池收口：太宽就等于「不限」，失去筛选意义
  if (pool.length > SUB_POOL_MAX) pool = pool.slice(0, SUB_POOL_MAX);

  /* 池的「次要偏好保底」——【必须排在收口之后】：合并放宽后，一组里可能同时有
   * 攻击% / 生命% / 防御% 好几种次要偏好，只按总分收口到 SUB_POOL_MAX 会把某条偏好
   * 赖以成型的追加属性挤掉（例：绝缘套 4 人的池收到双暴+攻击%+充能+精通，把夜兰的
   * 生命值% 挤在第 6 名砍掉），那样合并看着漂亮、实际没照顾到那位角色。
   * 所以这里给每种次要偏好补回 1 条代表词条（该组最想要、又还没进池的那条），
   * 池上限也随之多开一档——每多一种次要偏好 +1；嫌松就把命中条数调大到 3 / 4。 */
  const prefs = minorPreferenceGroups(group);
  if (prefs) {
    const extra = [];
    prefs.forEach(g => {
      const id = g.minor.find(x =>
        x && !banned.has(x) && !pool.includes(x) && !extra.includes(x) &&
        g.roles.some(r => (r.pool || []).some(y => statIdOf(y) === x)));
      if (id) extra.push(id);
    });
    const cap = SUB_POOL_MAX + prefs.length - 1;
    extra.forEach(id => { if (pool.length < cap && !pool.includes(id)) pool.push(id); });
  }

  if (!pool.length) return { required: [], pool: [], minHit: 0 };  // 只挑主要属性，追加属性不限

  // 预设「至少两个」，可在方案卡片上手动调整；池不足 N 条时退化为池长度
  return { required, pool, minHit: Math.min(SUB_MIN_HIT_DEFAULT, pool.length) };
}

/* 融合两份追加属性条件（手动合并方案时用）：
 *   ★必须取交集（两边都要才算必须）、追加属性池取并集；
 *   命中条数回到预设值（手动合并等于重新起一套，原先的细筛不再适用） */
function fuseSub(a, b) {
  if (!a) return b;
  if (!b) return a;
  const required = a.required.filter(id => b.required.includes(id));
  const pool = [...new Set([...a.pool, ...b.pool])];
  required.forEach(id => { if (!pool.includes(id)) pool.unshift(id); });
  const p = pool.slice(0, SUB_POOL_MAX);
  return { required, pool: p, minHit: Math.min(SUB_MIN_HIT_DEFAULT, p.length) };
}

/* 一组角色 -> 候选方案（追加属性条件全方案统一） */
function planFromGroup(group) {
  const mains = {};
  SLOTS.forEach(sd => {
    // 花 / 羽主要属性固定，游戏内只能设追加属性
    mains[sd.id] = (sd.id === 'flower' || sd.id === 'plume') ? null : mergeMain(group, sd.id);
  });
  const names = group.map(r => r.name);
  return {
    kind: 'chars',
    key: 'g:' + [...names].sort().join('+'),
    chars: names,
    sub: mergeSubUniform(group),
    mains,
    _group: group,          // 保留原始角色组，供手动合并时重算权重
  };
}

/* 把若干候选方案手动合并成一套（不再涉及槽位分配） */
function mergePlans(list) {
  const ps = list.filter(Boolean);
  if (!ps.length) return null;
  if (ps.length === 1) return ps[0];

  const groups = ps.flatMap(p => p._group || []);
  const nonGroup = ps.filter(p => !(p._group && p._group.length));

  // 角色类：用合并后的原始角色组重算，权重最准；规则类：按 fuseSub 逐份融合
  let acc = groups.length ? mergeSubUniform(groups) : null;
  const rest = acc ? nonGroup : nonGroup.slice(1);
  if (!acc && nonGroup.length) acc = nonGroup[0].sub;
  rest.forEach(p => { acc = fuseSub(acc, p.sub); });

  /* 主要属性【逐部位独立合并】：有角色组时按「票数 × 优先级」重算（与自动合并同一套
   * 规则，权重最准），再并入规则类方案指定的主要属性，最后统一截断到 MAIN_MAX——
   * 避免手动「并入…」越并越宽、最后宽到等于「不限」 */
  const mains = {};
  SLOTS.forEach(sd => {
    if (sd.id === 'flower' || sd.id === 'plume') { mains[sd.id] = null; return; }
    const seen = new Set(groups.length ? mergeMain(groups, sd.id) : []);
    ps.forEach(p => (p.mains[sd.id] || []).forEach(id => seen.add(id)));
    mains[sd.id] = [...seen].slice(0, MAIN_MAX);
  });

  const rules = ps.filter(p => p.kind === 'rule');
  return {
    kind: rules.length === ps.length ? 'rule' : 'chars',
    key: mergeResultKey(ps.map(p => p.key)),
    chars: ps.flatMap(p => p.chars || []),
    ruleName: rules.length ? rules.map(r => r.ruleName).join(' + ') : '',
    ruleDesc: '',
    mergedCount: ps.length,
    merged: ps.map(p => p.key),
    sub: acc || { required: [], pool: [], minHit: 0 },
    mains,
    _group: groups.length ? groups : null,
  };
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
        subList: b.subs || [],      // 原始词条（含 op），供追加属性池按重要度打分
        req:  reqSubs(b.subs),      // ★必选标记
        pool: poolSubs(b.subs),     // 追加属性池
      };
    });
}

/* ============================================================
 * 候选方案生成（本次改造的核心管道）
 *   不再有「几个槽位」的概念：按追加属性需求把角色聚成若干候选，
 *   散件 / 过渡规则也作为候选同权参与，之后由用户合并 / 挑选。
 * ============================================================ */

/* 生成某套装的全部候选方案 = 角色自然分组 + 启用的散件 / 过渡规则 */
function buildPlanCandidates(charList, setName) {
  const roles = toRoles(charList, setName);
  const cands = roles.length ? naturalClusters(roles).map(planFromGroup) : [];
  activeKeepRules().forEach(r => cands.push(ruleToPlan(r)));
  return cands;
}

/* 手动合并后生成的方案 key：由成员 key 排序拼接而成，可复算（拆回时靠它定位） */
function mergeResultKey(keys) {
  return 'm:' + [...keys].sort().join('|');
}
/* 一个候选的「原始成员 key」：已被合并过的方案展开回它的成员，方便继续往里并 */
function baseKeysOf(p) {
  return (p && p.merged && p.merged.length) ? p.merged.slice() : [p.key];
}

/* 套用用户的手工覆盖（把若干候选并为一套）→ 得到最终要展示的方案列表 */
function applyPlanOverlay(setName, cands) {
  const cfg = (state.planCfg && state.planCfg[setName]) || null;
  if (!cfg || !Array.isArray(cfg.merge) || !cfg.merge.length) return cands;
  const byKey = new Map(cands.map(c => [c.key, c]));
  const consumed = new Set();
  const out = [];
  cfg.merge.forEach(keys => {
    const members = (keys || []).map(k => byKey.get(k)).filter(Boolean);
    if (members.length < 2) return;   // 成员已不存在（改了配装 / 阈值）→ 该合并自动失效
    const merged = mergePlans(members);
    if (merged) {
      out.push(merged);
      members.forEach(m => consumed.add(m.key));
      byKey.set(merged.key, merged);   // 允许后续组再把它并进去（链式合并）
    }
  });
  cands.forEach(c => { if (!consumed.has(c.key)) out.push(c); });
  return out;
}

/* ============================================================
 * 散件 / 过渡 保留规则
 *   与具体角色无关，用于保留高价值散件（稀有主要属性）或过渡 2 件套胚子。
 *   每条启用的规则会转成一份候选方案，与角色聚类结果【同权】参与后续合并 / 采纳。
 * ============================================================ */
/* 规则可编辑字段（内置覆盖与自定义规则共用） */
const KR_EDITABLE = ['name', 'desc', 'slot', 'mains', 'required', 'pool'];
/* 取（必要时创建）内置规则的覆盖层 */
function krOverrides() {
  if (!state || !state.keepRules) return {};
  if (!state.keepRules.overrides || typeof state.keepRules.overrides !== 'object') {
    state.keepRules.overrides = {};
  }
  return state.keepRules.overrides;
}
/* 取某内置规则的用户覆盖（没有就是没改过） */
function keepRuleOverride(id) {
  return krOverrides()[id] || null;
}
function allKeepRules() {
  const custom = (state && state.keepRules && Array.isArray(state.keepRules.custom))
    ? state.keepRules.custom : [];
  // 内置规则先套用用户的修改覆盖（overrides 里没有该 id = 保持出厂设置）
  const builtin = KEEP_RULES.map(r => {
    const ov = keepRuleOverride(r.id);
    return ov ? { ...r, ...ov, builtin: true } : r;
  });
  return [...builtin, ...custom];
}
function keepRuleEnabled(id) {
  return !!(state && state.keepRules && Array.isArray(state.keepRules.enabled)
    && state.keepRules.enabled.includes(id));
}
/* 启用的散件 / 过渡 保留规则（不再有槽位预算限制，全部转为候选） */
function activeKeepRules() {
  if (!state || !state.keepRules) return [];
  return allKeepRules().filter(r => keepRuleEnabled(r.id));
}
/* 规则 -> 候选方案（规则本就是单份追加属性条件，天然符合「全方案统一」） */
function ruleToPlan(rule) {
  const banned = new Set([FIXED_MAIN.flower, FIXED_MAIN.plume]);  // 花/羽主要属性固定，恒冲突
  const mains = {};
  SLOTS.forEach(sd => {
    // 花 / 羽主要属性固定，游戏内只能设追加属性
    if (sd.id === 'flower' || sd.id === 'plume') { mains[sd.id] = null; return; }
    // 命中的部位取规则指定的主要属性，其余部位为「不限」（[]）
    mains[sd.id] = (rule.slot === sd.id) ? (rule.mains || []).slice() : [];
  });
  return {
    kind: 'rule',
    key: 'r:' + rule.id,
    chars: [],
    ruleName: rule.name,
    ruleDesc: rule.desc || '',
    sub: (() => {
      const required = (rule.required || []).filter(id => !banned.has(id));
      const pool = (rule.pool || []).filter(id => !banned.has(id));
      // 与角色方案一致：预设「至少两个」，可在方案卡片上单独调整
      return { required, pool, minHit: Math.min(SUB_MIN_HIT_DEFAULT, pool.length) };
    })(),
    mains,
    _group: null,
  };
}

/* 套用用户对「命中条数」的手动调整：{ 方案 key: N }
 *   挂在候选管道的出口，所以渲染 / 导出 / 事件三条路径拿到的都是同一份结果。
 *   实际生效值还要被该方案的追加属性池宽度钳住——池里只有 3 条时不可能要求命中 4 条。 */
function applyMinHit(setName, list) {
  const cfg = (state.planCfg && state.planCfg[setName]) || null;
  const map = (cfg && cfg.minHit) || null;
  list.forEach(p => {
    const pool = (p.sub && p.sub.pool) || [];
    if (!pool.length) { if (p.sub) p.sub.minHit = 0; return; }   // 只挑主要属性 → 追加属性不限
    const want = map && Object.prototype.hasOwnProperty.call(map, p.key) ? clampHit(map[p.key]) : SUB_MIN_HIT_DEFAULT;
    // 深拷贝一份再改，避免污染 buildPlanCandidates 缓存出来的同一对象
    p.sub = { ...p.sub, minHit: Math.min(want, pool.length) };
  });
  return list;
}

/* 取 / 算某套装：候选方案 →（套用手工合并）→（套用命中条数调整），渲染与导出共用同一结果 */
function setCandidates(chars, setName) {
  return applyMinHit(setName, applyPlanOverlay(setName, buildPlanCandidates(chars, setName)));
}
function adoptedPlans(chars, setName) {
  const cfg = (state.planCfg && state.planCfg[setName]) || null;
  const hide = new Set((cfg && cfg.hide) || []);
  return setCandidates(chars, setName).filter(p => !hide.has(p.key));
}
/* 便捷入口：按套装名 + 当前界面参数重算候选（界面事件与导出共用，保证与页面一致） */
function candsOfSet(setName) {
  const el = $('#planAltBuild');
  const b = computePlan(el ? el.checked : true).get(setName);
  if (!b) return [];
  const chars = state.characters.filter(c => c.enabled && b.users.has(c.name));
  return setCandidates(chars, setName);
}

/* 次要属性分组的配色（深色背景上可读的柔和色，按顺序稳定分配） */
const GROUP_COLORS = ['#5fa8e8', '#5fd39a', '#ff9f5a', '#b98cff',
                      '#f5dfa6', '#7fd6cf', '#ff8a9c', '#a5d66a'];

/* 把一个方案的需求角色按「次要属性偏好」分组，给每组分配一个稳定颜色
 *   背景：合并放宽后，重要属性（如双暴）相同、次要属性（攻击% / 生命% / 防御%）
 *   不同的角色会并进同一套方案——他们的圣遗物要按实际次要属性分别给到适配的角色。
 *   颜色同时用在【角色名】和【追加属性】上，两处同色即可对应，不需要额外图例。
 *   次要属性完全一致时不分组（返回 null），避免无意义的色块。
 *   _group 经 mergePlans 继续传递，所以手工合并后的方案同样能分组；
 *   散件规则方案 _group 为 null，自然不分组。
 */
function planColorGroups(p) {
  const g = p._group;
  const prefs = g ? minorPreferenceGroups(g) : null;
  if (!prefs) return null;
  return prefs.map((x, i) => ({
    color: GROUP_COLORS[i % GROUP_COLORS.length],
    roles: x.roles,
    names: x.roles.map(r => r.name),
    minor: x.minor.map(subStatName).join('、') || '无次要需求',
  }));
}

/* 追加属性的【展示顺序 + 着色】——颜色不再单独占一块图例，直接打在属性上。
 *   排序：① ★必须 → ② 全组共有（不着色）→ ③ 各组独占（着该组颜色）
 *   同一档内部按「相关角色对该属性的平均名次权重」降序，最想要的排最前。
 *   例：暴击率★ 暴击伤害★ 元素充能效率 | <蓝>攻击力%</蓝> <绿>生命值%</绿>
 *   —— 前面是全组都要的，后面才是只有部分角色要的，照搬时按颜色给到对应的人。 */
function planSubOrder(p) {
  const sub = (p && p.sub) || { required: [], pool: [] };
  const req = new Set(sub.required || []);
  const ids = (sub.pool || []).map(statIdOf).filter(Boolean);
  const groups = planColorGroups(p);
  if (!groups) return ids.map(id => ({ id, req: req.has(id), color: null, owners: null, shared: true }));

  const everyone = groups.flatMap(g => g.roles);
  const avgW = (roles, id) => roles.reduce((s, r) => s + (r.subs[id] || 0), 0) / (roles.length || 1);
  const items = ids.map(id => {
    const owners = [];
    groups.forEach((g, i) => {
      if (g.roles.some(r => (r.pool || []).some(x => statIdOf(x) === id))) owners.push(i);
    });
    // 没人「明确」要（例如并入散件规则带来的词条）时按共有处理，不给颜色
    const shared = owners.length === 0 || owners.length >= groups.length;
    return {
      id, req: req.has(id), shared,
      color: shared ? null : groups[owners[0]].color,
      owners: shared ? null : owners,
    };
  });
  // ★0 → 共有1 → 第 k 组独占 2+k
  const bucket = o => o.req ? 0 : (o.shared ? 1 : 2 + o.owners[0]);
  items.sort((a, b) => {
    const d = bucket(a) - bucket(b);
    if (d) return d;
    const ra = (a.shared || !a.owners) ? everyone : groups[a.owners[0]].roles;
    const rb = (b.shared || !b.owners) ? everyone : groups[b.owners[0]].roles;
    return avgW(rb, b.id) - avgW(ra, a.id);
  });
  return items;
}

/* 方案的「适用对象」标题：角色组 / 散件规则 / 手动合并后的混合
 *   次要属性不一致时角色名带上分组颜色，与下方追加属性的颜色一一对应 */
function planForText(p) {
  if (p.kind === 'rule') {
    return `<span class="gp-for gp-rule-for">🧩 散件 / 过渡保留：${esc(p.ruleName)}</span>`;
  }
  if (p.chars && p.chars.length) {
    const groups = planColorGroups(p);
    if (groups) {
      const chips = groups.map(g => g.names.map(n =>
        `<span class="gp-char-tag" style="--tc:${g.color}" title="次要属性偏好：${esc(g.minor)}（下方同色的追加属性优先给到这位角色）">${esc(n)}</span>`
      ).join('')).join('');
      return `<span class="gp-for gp-for-groups">${chips}</span>`;
    }
    const more = p.chars.length > 6 ? ` <span class="gp-more">等 ${p.chars.length} 人</span>`
      : (p.chars.length > 4 ? ` <span class="gp-more">共 ${p.chars.length} 人</span>` : '');
    return `<span class="gp-for">供 ${p.chars.slice(0, 6).map(n => esc(n)).join('、')}${more} 使用</span>`;
  }
  return '<span class="gp-for">（未指定角色）</span>';
}

/* 纯文本版的角色分组（导出 / 复制用，无法上色就写在括号里） */
function planCharsPlain(p) {
  const groups = planColorGroups(p);
  if (!groups) return (p.chars || []).join('、');
  return groups.map(g => `${g.names.join('、')}（${g.minor}）`).join(' / ');
}

/* 追加属性 chip 渲染：★必须 / 共有 / 分组专属（同色于对应角色，鼠标悬停看给谁） */
function planSubText(p) {
  const items = planSubOrder(p);
  if (!items.length) return '<span class="gp-fixed">不限</span>';
  const groups = planColorGroups(p) || [];
  return items.map(it => {
    const nm = esc(subStatName(it.id));
    if (it.req) return `<span class="gp-star">★${nm}</span>`;
    if (!it.color) return `<span class="gp-sub">${nm}</span>`;
    const who = it.owners.map(i => groups[i] && groups[i].names.join('、')).filter(Boolean).join('、');
    return `<span class="gp-sub gp-sub-g" style="--tc:${it.color}" title="只有 ${esc(who)} 需要，优先给到他">${nm}</span>`;
  }).join('');
}
/* 导出文本用的追加属性顺序：与页面一致（共有在前、分组在后），无法上色所以保持纯文本 */
function planSubPlain(p) {
  return planSubOrder(p).map(it => (it.req ? '★' : '') + subStatName(it.id)).join('、');
}
/* 命中条数文案：预设「至少两条」，用户可调 1–4；池为空 = 不限（返回空串） */
function subHitPlain(sub) {
  const n = sub.minHit || 0;
  if (!n) return '';
  return `至少${'一二三四'[n - 1]}条`;
}
function subHitText(sub) {
  const t = subHitPlain(sub);
  return t ? `<b>${t}</b>` : '<span class="gp-fixed">不限</span>';
}
/* 单部位主要属性：null = 固定（花 / 羽），[] = 不限 */
function mainCondText(slotId, list) {
  if (list === null || list === undefined) return '<span class="gp-fixed">主要属性固定</span>';
  return list.length
    ? list.map(id => `<span class="gp-main">${esc(mainStatName(slotId, id))}</span>`).join('')
    : '<span class="gp-fixed">不限</span>';
}

function planCopyText(setName, plan, idx) {
  const who = plan.kind === 'rule'
    ? `散件 / 过渡保留：${plan.ruleName}`
    : `供 ${planCharsPlain(plan)} 使用`;
  const L = [`  方案${idx + 1}（${who}）`];
  // 追加属性是全方案统一的一份，先说一遍，五个部位再各自列主要属性
  const subAll = planSubPlain(plan);
  const hitTxt = subHitPlain(plan.sub);
  L.push(`  追加属性（五个部位相同）：${subAll || '不限'}${hitTxt ? `　·　${hitTxt}` : ''}`);
  SLOTS.forEach(sd => {
    const list = plan.mains[sd.id];
    const mainTxt = list === null || list === undefined
      ? '主要属性固定'
      : (list.length ? list.map(id => mainStatName(sd.id, id)).join('、') : '不限');
    L.push(`  ${sd.name}：主要属性 ${mainTxt}`);
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
        ${charModified(c) ? '<span class="cc-mod" title="与内置数据不同；可在角色编辑里「还原为内置数据」">已修改</span>' : ''}
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
  // 自定义角色没有出厂数据，不给「还原为内置数据」
  $('#btnRestoreChar').classList.toggle('hidden', !charCanRestore(editing));
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
  $('#btnRestoreChar').classList.add('hidden');
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
    <p class="muted small" style="margin:-2px 0 10px">下面每组是一张<b>只读卡片</b>：要看 / 改词条（三部位主要属性与追加属性）请点「✎ 编辑」，在弹出窗口里点「保存」才生效。</p>
    <div id="edBuilds"></div>
    <div class="bm-row">
      <button type="button" class="btn sm primary" id="edAddBuild">+ 添加一组配装</button>
      <label class="fld">📋 新增时套用…
        <select id="edAddFrom">
          <option value="blank">空白（双暴默认词条）</option>
          ${editing.builds.map((b, i) => `<option value="b${i}">复制配装${i + 1}（${esc((b.sets || []).filter(Boolean).join(' + ') || '未选套装')}）</option>`).join('')}
        </select>
      </label>
      ${factoryPresetOptions(editing).length ? `<label class="fld">＋ 从预置添加
        <select id="edAddPreset">
          <option value="">（选择一个已删除的预置组）</option>
          ${factoryPresetOptions(editing).map(b => `<option value="${esc(b.bkey)}">${esc((b.sets || []).filter(Boolean).join(' + '))}</option>`).join('')}
        </select>
      </label>` : ''}
    </div>
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
        else if (e.key === 'Escape') {
          // 输入框里按 Esc 只取消这一行的编辑，别让冒泡去关掉整个角色浮窗
          e.preventDefault(); e.stopPropagation();
          srcEditIdx = null; renderSrcRows();
        }
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

  // 新增配装组：空白 / 复制现有组；新增后立刻打开编辑浮窗（避免留下空套装组）
  body.querySelector('#edAddBuild').onclick = () => {
    const sel = body.querySelector('#edAddFrom');
    const v = sel ? sel.value : 'blank';
    const nb = freshBuild('alt');
    if (v && v[0] === 'b') {
      const src = editing.builds[+v.slice(1)];
      if (src) {
        nb.main = JSON.parse(JSON.stringify(src.main || {}));
        nb.subs = JSON.parse(JSON.stringify(src.subs || []));
      }
    }
    editing.builds.push(nb);
    ui.buildIdx = editing.builds.length - 1;
    drawBuildCards();
    openBuildModal(ui.buildIdx, true);
  };
  // 从出厂预置添加：把删掉的内置组找回来
  const presetSel = body.querySelector('#edAddPreset');
  if (presetSel) presetSel.onchange = () => {
    const key = presetSel.value;
    if (!key) return;
    const fc = factoryCharOf(editing);
    const f = fc && (fc.builds || []).find(x => x.bkey === key);
    if (!f) return;
    editing.builds.push(factoryBuildCopy(f, editing));
    ui.buildIdx = editing.builds.length - 1;
    drawBuildCards();
    openBuildModal(ui.buildIdx, true);
    toast('已添加预置：' + (f.sets || []).filter(Boolean).join(' + '));
  };

  drawBuildCards();
}

/* 抽屉里正在编辑的配装组 */
function curBuild() {
  if (!editing.builds.length) editing.builds.push({ sets: [], priority: 'main' });
  if (ui.buildIdx >= editing.builds.length) ui.buildIdx = 0;
  return editing.builds[ui.buildIdx];
}

/* 卡片上「三部位主要属性」的一行摘要：只列前 2 条，多的用 +N 收尾 */
function buildMainBrief(b) {
  return ['sands', 'goblet', 'circlet'].map(slot => {
    const arr = (b.main && b.main[slot]) || [];
    if (!arr.length) return null;
    const names = arr.slice(0, 2).map(m => mainStatName(slot, m.stat));
    if (arr.length > 2) names.push('+' + (arr.length - 2));
    return { slot, name: SLOTS.find(s => s.id === slot).name, txt: names.join(' / ') };
  }).filter(Boolean);
}
/* 卡片上「追加属性」的一行摘要：★ 前缀表示必选 */
function buildSubBrief(b) {
  return (b.subs || []).map(s => (s.req ? '★' : '') + subStatName(s.id)).join('　');
}

/* 配装卡片（只读）：套装 + 三部位主要属性 + 追加属性 + 操作按钮
 * 改词条一律走二层浮窗（openBuildModal），卡片本身不直接改数据。 */
function drawBuildCards() {
  const box = $('#edBuilds');
  if (!box) return;
  // 主推排布与出厂不同时，给一个「只还原主推」的入口（不动任何词条内容）
  const prioMod = priorityModified(editing);
  box.innerHTML =
    (prioMod ? `<div class="bm-bar">
        <button type="button" class="btn sm" id="edRestorePrio">↩ 还原主推</button>
        <span class="muted small">当前「主推 / 备选」的排布与内置不同（词条内容没变）</span>
      </div>` : '') +
    editing.builds.map((b, i) => {
    const sets = (b.sets || []).filter(Boolean);
    const mod = buildModified(editing, b);
    const canRestore = !!factoryBuildOf(editing, b);
    return `
    <div class="bm-card" data-bi="${i}">
      <div class="bm-t">
        <span class="prio-tag ${b.priority}">${b.priority === 'main' ? '主推' : '备选'}</span>
        <span class="bm-name">配装 ${i + 1}　${esc(sets.join(' + ') || '未选套装')}</span>
        <span class="bm-kind">${sets.length === 2 ? '2+2 组合' : (sets.length === 1 ? '4 件套' : '未选择套装')}</span>
        ${mod ? '<span class="bm-mod">已修改</span>' : ''}
      </div>
      <div class="bm-sum">
        ${buildMainBrief(b).map(m => `<div><span class="k">${m.name}</span>${esc(m.txt)}</div>`).join('')}
        <div><span class="k">追加属性</span>${esc(buildSubBrief(b) || '未设置')}</div>
      </div>
      <div class="bm-ops">
        <button type="button" class="btn sm primary" data-bed="${i}">✎ 编辑</button>
        ${b.priority === 'main' ? '' : `<button type="button" class="btn sm" data-bmain="${i}">设为主推</button>`}
        ${canRestore && mod ? `<button type="button" class="btn sm" data-bres="${i}" title="套装 + 词条 + 主推全部回到内置原样">整组还原</button>` : ''}
        ${editing.builds.length > 1 ? `<button type="button" class="btn sm danger" data-bdel="${i}">删除</button>` : ''}
      </div>
    </div>`;
  }).join('');

  const rp = $('#edRestorePrio');
  if (rp) rp.onclick = () => {
    restorePriority(editing);
    drawBuildCards();
    toast('已还原主推排布，点「保存」后生效');
  };
  box.querySelectorAll('[data-bed]').forEach(btn => {
    btn.onclick = () => openBuildModal(+btn.dataset.bed);
  });
  box.querySelectorAll('[data-bmain]').forEach(btn => {
    btn.onclick = () => {
      const i = +btn.dataset.bmain;
      editing.builds.forEach((b, j) => { b.priority = j === i ? 'main' : 'alt'; });
      drawBuildCards();
    };
  });
  box.querySelectorAll('[data-bres]').forEach(btn => {
    btn.onclick = () => {
      const i = +btn.dataset.bres;
      if (!restoreBuild(editing, i)) return toast('这一组没有内置原样可还原');
      drawBuildCards();
      toast('已还原配装' + (i + 1) + '为内置数据');
    };
  });
  box.querySelectorAll('[data-bdel]').forEach(btn => {
    btn.onclick = () => {
      const i = +btn.dataset.bdel;
      if (editing.builds.length <= 1) return toast('至少保留一组配装');
      editing.builds.splice(i, 1);
      if (!editing.builds.some(b => b.priority === 'main')) editing.builds[0].priority = 'main';
      if (ui.buildIdx >= editing.builds.length) ui.buildIdx = 0;
      drawBuildCards();
    };
  });
}

/* ============================================================
 * 属性选择：三层浮窗（添加主要属性 / 追加属性共用）
 * 只列出「还没被用上」的项，从源头杜绝重复
 * ============================================================ */
let pickHandler = null;
function openPicker(title, opts, hint, onPick) {
  pickHandler = onPick;
  $('#pickTitle').textContent = title;
  $('#pickHint').textContent = hint || '';
  const list = $('#pickList');
  if (!opts.length) {
    list.innerHTML = '<p class="muted small pick-empty">可选的都已经在列表里了。</p>';
  } else {
    list.innerHTML = opts.map(o =>
      `<button type="button" class="pick-opt" data-pk="${esc(o.value)}">${esc(o.label)}</button>`).join('');
    list.querySelectorAll('[data-pk]').forEach(b => {
      b.onclick = () => { const v = b.dataset.pk; closePicker(); if (pickHandler) pickHandler(v); };
    });
  }
  $('#pickMask').classList.remove('hidden');
  $('#pickBox').classList.remove('hidden');
}
function closePicker() {
  $('#pickMask').classList.add('hidden');
  $('#pickBox').classList.add('hidden');
  pickHandler = null;
}

/* ============================================================
 * 配装编辑：二层浮窗（草稿机制，点「保存」才写回 editing）
 * ============================================================ */
let bmDraft = null;      // 当前草稿（深拷贝）
let bmOrig = '';         // 打开时的 canon 快照，用于脏检查
let bmIndex = -1;
let bmIsNew = false;

function openBuildModal(i, isNew) {
  if (!editing) return;
  bmIndex = i;
  bmIsNew = !!isNew;
  bmDraft = JSON.parse(JSON.stringify(editing.builds[i] || freshBuild('alt')));
  bmOrig = canonBuildPrio(bmDraft);
  $('#bmTitle').textContent = '编辑配装 ' + (i + 1) + (bmDraft.priority === 'main' ? '（主推）' : '（备选）');
  const btnRes = $('#bmRestore');
  // 新增的空组没有出厂对应，不给「还原这一组」
  btnRes.classList.toggle('hidden', !(bmDraft.bkey && factoryBuildOf(editing, bmDraft)));
  drawBuildForm();
  $('#buildMask').classList.remove('hidden');
  $('#buildBox').classList.remove('hidden');
}
function bmDirty() { return canonBuildPrio(bmDraft) !== bmOrig; }

function drawBuildForm() {
  const B = bmDraft;
  const sets = (B.sets || []).filter(Boolean);
  // 套装双下拉
  ['bmSet0', 'bmSet1'].forEach((id, k) => {
    const sel = $('#' + id);
    sel.innerHTML = '<option value="">' + (k === 0 ? '（选择套装）' : '（2+2 可选）') + '</option>' + setOptions(sets[k]);
    sel.value = sets[k] || '';
    sel.onchange = () => {
      const arr = (B.sets || []).filter(Boolean);
      arr[k] = sel.value || null;
      B.sets = arr.filter(Boolean);
      drawBuildForm();
    };
  });
  $('#bmKind').textContent = (B.sets || []).filter(Boolean).length === 2 ? '2+2 组合'
    : ((B.sets || []).filter(Boolean).length === 1 ? '4 件套' : '未选择套装');
  // 主推
  const prio = $('#bmPrio');
  prio.checked = B.priority === 'main';
  prio.onchange = () => { B.priority = prio.checked ? 'main' : 'alt'; };
  // 📋 套用：其他配装组 / 出厂预置 / 追加属性预设
  const cf = $('#bmCopyFrom');
  const presets = factoryPresetOptions(editing);
  cf.innerHTML =
    '<option value="">（不改，保持当前）</option>' +
    '<optgroup label="复制其他配装组">' +
      editing.builds.map((b, j) => j === bmIndex ? '' :
        `<option value="b${j}">配装${j + 1}（${esc((b.sets || []).filter(Boolean).join(' + ') || '未选套装')}）</option>`).join('') +
    '</optgroup>' +
    (presets.length ? '<optgroup label="出厂预置">' +
      presets.map(b => `<option value="f${esc(b.bkey)}">${esc((b.sets || []).filter(Boolean).join(' + '))}</option>`).join('') +
    '</optgroup>' : '') +
    '<optgroup label="追加属性预设（仅追加属性）">' +
      Object.keys(SUB_PRESETS).map(k => `<option value="p${k}">${esc(SUB_PRESET_NAMES[k])}</option>`).join('') +
    '</optgroup>';
  cf.onchange = () => {
    const v = cf.value;
    if (!v) return;
    if (v[0] === 'b') {
      const src = editing.builds[+v.slice(1)];
      if (!src) return;
      B.sets = (src.sets || []).filter(Boolean).slice();
      B.main = JSON.parse(JSON.stringify(src.main || {}));
      B.subs = JSON.parse(JSON.stringify(src.subs || []));
      toast('已复制配装' + (+v.slice(1) + 1) + '的套装与词条');
    } else if (v[0] === 'f') {
      const key = v.slice(1);
      const fc = factoryCharOf(editing);
      const f = fc && (fc.builds || []).find(x => x.bkey === key);
      if (!f) return;
      const fb = factoryBuildCopy(f, editing);
      B.sets = fb.sets;
      B.bkey = fb.bkey;
      B.main = fb.main;
      B.subs = fb.subs;
      toast('已套用出厂预置：' + B.sets.join(' + '));
      $('#bmRestore').classList.remove('hidden');
    } else {
      B.subs = toSubs(SUB_PRESETS[v.slice(1)] || SUB_PRESETS.crit);
      toast('已套用预设：' + SUB_PRESET_NAMES[v.slice(1)]);
    }
    drawBuildForm();
  };
  // 三部位主要属性：复用 drawMains，控件 id 前缀 bm
  const mbox = $('#bmMainBox');
  mbox.innerHTML = ['sands', 'goblet', 'circlet'].map(slot => `
    <div class="fgroup">
      <span class="glabel">${SLOTS.find(s => s.id === slot).name}主要属性 <span class="hint">越靠前优先级越高</span></span>
      <div class="ms-list" id="bmMain_${slot}"></div>
      <button type="button" class="btn sm" id="bmAdd_${slot}">+ 添加主要属性</button>
    </div>`).join('');
  ['sands', 'goblet', 'circlet'].forEach(slot => {
    $('#bmAdd_' + slot).onclick = () => {
      const used = new Set(B.main[slot].map(m => m.stat));
      const slotName = SLOTS.find(s => s.id === slot).name;
      openPicker('添加' + slotName + '主要属性',
        MAIN_STATS[slot].filter(s => !used.has(s.id)).map(s => ({ value: s.id, label: s.name })),
        '只列出还没添加过的属性；点一个即可加入。',
        id => {
          B.main[slot].push({ stat: id, rank: B.main[slot].length + 1, op: '>' });
          renank(B, slot); drawMains(B, 'bm');
        });
    };
  });
  drawMains(B, 'bm');
  // 追加属性：弹窗里挑一个还没加过的
  const add = $('#bmAddSub');
  add.onclick = () => {
    const used = new Set(B.subs.map(s => s.id));
    openPicker('添加追加属性',
      SUB_STATS.filter(s => !used.has(s.id)).map(s => ({ value: s.id, label: s.name })),
      '只列出还没添加过的属性；点一个即可加入。',
      id => { B.subs.push({ id, req: false, op: '>' }); drawSubs(B, 'bm'); });
  };
  drawSubs(B, 'bm');
}

/* 保存：写回 editing.builds，主推唯一，关浮窗并重绘卡片 */
function saveBuildModal() {
  const B = bmDraft;
  if (!(B.sets || []).filter(Boolean).length) return toast('请至少选择一个套装');
  editing.builds[bmIndex] = JSON.parse(JSON.stringify(B));
  if (B.priority === 'main') editing.builds.forEach((b, j) => { if (j !== bmIndex) b.priority = 'alt'; });
  else if (!editing.builds.some(b => b.priority === 'main')) editing.builds[0].priority = 'main';
  closeBuildModal(true);
  drawBuildCards();
  toast('已保存配装' + (bmIndex + 1));
}
/* 关闭：force=false 且有未保存改动时弹确认
 * 关键：如果这一组是刚「新增」出来的，放弃时必须把它撤掉 ——
 * 否则点取消后列表里会凭空多一组（之前就漏了这一步） */
function closeBuildModal(force) {
  if (!force && bmDirty() && !confirm('有未保存的修改，确定放弃吗？')) return;
  $('#buildMask').classList.add('hidden');
  $('#buildBox').classList.add('hidden');
  const wasNew = bmIsNew, idx = bmIndex;
  bmDraft = null; bmOrig = ''; bmIndex = -1; bmIsNew = false;
  if (wasNew && !force && editing && editing.builds.length > 1) {
    editing.builds.splice(idx, 1);
    if (!editing.builds.some(b => b.priority === 'main')) editing.builds[0].priority = 'main';
    if (ui.buildIdx >= editing.builds.length) ui.buildIdx = 0;
  }
  if (wasNew && !force) drawBuildCards();
}
/* ESC / 点遮罩走这里（不 force，保留确认提示） */
function cancelBuildModal() { closeBuildModal(false); }

/* 三部位主要属性编辑器：B = 要渲染的配装组，prefix = 控件 id 前缀（'ed' 或 'bm'）
 * 无参调用时回落到抽屉里的当前组，供老调用点兼容。 */
function drawMains(B, prefix) {
  if (!B) B = curBuild();
  prefix = prefix || 'ed';
  ['sands', 'goblet', 'circlet'].forEach(slot => {
    const box = $('#' + prefix + 'Main_' + slot);
    if (!box) return;
    const arr = B.main[slot];
    box.innerHTML = arr.map((m, i) => `
      <div class="ms-item" data-mi="${i}" data-slot="${slot}">
        ${i === 0
          ? '<span class="ord">最优</span>'
          : `<button type="button" class="op-btn ${m.op === '=' ? 'eq' : ''}" data-mop="${i}" title="与上一条的重要度关系：= 同为最想要，> 较次之">${m.op === '=' ? '=' : '>'}</button>`}
        <select data-msel="${i}">${MAIN_STATS[slot].map(s =>
          `<option value="${s.id}"${s.id === m.stat ? ' selected' : ''}>${s.name}</option>`).join('')}</select>
        <button type="button" class="up" data-up="${i}">↑</button>
        <button type="button" class="down" data-down="${i}">↓</button>
        <button type="button" class="rm" data-rmm="${i}">×</button>
      </div>`).join('') || '<p class="muted small">未设置</p>';

    box.querySelectorAll('[data-msel]').forEach(sel => {
      sel.onchange = () => {
        const i = +sel.dataset.msel;
        // 换到已存在的另一条会造成重复，直接回滚并提示
        if (arr.some((x, j) => j !== i && x.stat === sel.value)) {
          toast('该主要属性已在列表中');
          drawMains(B, prefix);
          return;
        }
        B.main[slot][i].stat = sel.value;
      };
    });
    box.querySelectorAll('[data-mop]').forEach(b => b.onclick = () => {
      const slot = b.closest('.ms-item').dataset.slot;
      const i = +b.dataset.mop;
      const it = B.main[slot][i];
      it.op = it.op === '=' ? '>' : '=';
      drawMains(B, prefix);
    });
    box.querySelectorAll('[data-up]').forEach(b => b.onclick = () => {
      const i = +b.dataset.up;
      if (i === 0) return;
      [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      renank(B, slot); drawMains(B, prefix);
    });
    box.querySelectorAll('[data-down]').forEach(b => b.onclick = () => {
      const i = +b.dataset.down;
      if (i === arr.length - 1) return;
      [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
      renank(B, slot); drawMains(B, prefix);
    });
    box.querySelectorAll('[data-rmm]').forEach(b => b.onclick = () => {
      B.main[slot].splice(+b.dataset.rmm, 1);
      renank(B, slot); drawMains(B, prefix);
    });
  });
}
function renank(B, slot) { (B || curBuild()).main[slot].forEach((m, i) => { m.rank = i + 1; }); }

/* 追加属性：与主要属性一致的「排序」编辑器，外加 ★必选 开关 */
function drawSubs(B, prefix) {
  if (!B) B = curBuild();
  prefix = prefix || 'ed';
  const box = $('#' + prefix + 'Subs');
  if (!box) return;
  const subs = B.subs;
  box.innerHTML = subs.map((s, i) => `
    <div class="ms-item" data-si="${i}">
      ${i === 0
        ? '<span class="ord">最优</span>'
        : `<button type="button" class="op-btn ${s.op === '=' ? 'eq' : ''}" data-op="${i}" title="与上一条的重要度关系：= 同为最想要，> 较次之">${s.op === '=' ? '=' : '>'}</button>`}
      <select data-ssel="${i}">${SUB_STATS.map(t =>
        `<option value="${t.id}"${t.id === s.id ? ' selected' : ''}>${t.name}</option>`).join('')}</select>
      <button type="button" class="star-btn ${s.req ? 'on' : ''}" data-st="${i}" title="★必须（游戏内锁定方案的「必须」）">${s.req ? '★' : '☆'}</button>
      <button type="button" class="up" data-su="${i}">↑</button>
      <button type="button" class="down" data-sd="${i}">↓</button>
      <button type="button" class="rm" data-sr="${i}">×</button>
    </div>`).join('') || '<p class="muted small">未设置，可在下方添加</p>';

  // 已选的追加属性也能直接换（与主要属性一致），换到重复项会回滚提示
  box.querySelectorAll('[data-ssel]').forEach(sel => {
    sel.onchange = () => {
      const i = +sel.dataset.ssel;
      if (subs.some((x, j) => j !== i && x.id === sel.value)) {
        toast('该追加属性已在列表中');
        drawSubs(B, prefix);
        return;
      }
      subs[i].id = sel.value;
      drawSubs(B, prefix);
    };
  });
  box.querySelectorAll('[data-st]').forEach(b => b.onclick = () => {
    const i = +b.dataset.st;
    subs[i].req = !subs[i].req;
    drawSubs(B, prefix);
  });
  box.querySelectorAll('[data-op]').forEach(b => b.onclick = () => {
    const i = +b.dataset.op;
    subs[i].op = subs[i].op === '=' ? '>' : '=';
    drawSubs(B, prefix);
  });
  box.querySelectorAll('[data-su]').forEach(b => b.onclick = () => {
    const i = +b.dataset.su;
    if (i === 0) return;
    [subs[i - 1], subs[i]] = [subs[i], subs[i - 1]];
    drawSubs(B, prefix);
  });
  box.querySelectorAll('[data-sd]').forEach(b => b.onclick = () => {
    const i = +b.dataset.sd;
    if (i === subs.length - 1) return;
    [subs[i + 1], subs[i]] = [subs[i], subs[i + 1]];
    drawSubs(B, prefix);
  });
  box.querySelectorAll('[data-sr]').forEach(b => b.onclick = () => {
    subs.splice(+b.dataset.sr, 1);
    drawSubs(B, prefix);
  });
  const add = $('#' + prefix + 'AddSub');
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
  const before = c.builds.length;
  c.builds = c.builds
    .filter(b => b.sets && b.sets.length)
    .map(b => normalizeBuild(b, c));
  if (before !== c.builds.length) toast(`已忽略 ${before - c.builds.length} 组未选套装的配装`);
  if (!c.builds.length) {
    // 兜底：优先用出厂第 1 组（带 bkey，之后还能「还原这一组」），没有就用空白组
    const fc = factoryCharOf(c);
    c.builds = fc && fc.builds && fc.builds.length
      ? [factoryBuildCopy(fc.builds[0], c)]
      : [freshBuild()];
  }
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
    $('#pickInfo').innerHTML = '';
    return;
  }

  let blocks = Array.from(plan.entries());
  // 统计
  let usedSets = 0, fodderSets = 0, planCount = 0, overSets = 0;
  blocks.forEach(([name, b]) => {
    const has = b.users.size > 0;
    if (has) usedSets++; else fodderSets++;
  });

  const setWeights = setSubRanking(includeAlt);
  renderKeepRules();   // 规则面板：启用状态 + 计数

  const html = blocks
    .filter(([name]) => setFilter === 'all' || name === setFilter)
    .filter(([name, b]) => !hideUnused || b.users.size > 0)
    .sort((a, b) => (b[1].users.size - a[1].users.size) || a[0].localeCompare(b[0], 'zh'))
    .map(([name, b]) => renderSetBlock(name, b, slotFilter, setWeights))
    .join('');

  blocks.forEach(([name, b]) => {
    if (!b.users.size) return;
    const chars = state.characters.filter(c => c.enabled && b.users.has(c.name));
    const res = adoptedPlans(chars, name);
    planCount += res.length;
    if (res.length > GAME_MAX_PRESET) overSets++;
  });

  const overTip = overSets
    ? `<div class="pick-warn">⚠️ 有 <b>${overSets}</b> 个套装采纳了超过 ${GAME_MAX_PRESET} 套方案（当前共 ${planCount} 套）。
       游戏内每种套装<b>至多 ${GAME_MAX_PRESET} 个自定义预设</b>，请在下方取消勾选或用「并入…」压缩到 ${GAME_MAX_PRESET} 套以内。</div>`
    : '';
  $('#pickInfo').innerHTML = overTip;

  $('#planSummary').innerHTML = `
    <div class="stat-box"><div class="sv">${enabled}</div><div class="sl">启用角色</div></div>
    <div class="stat-box"><div class="sv">${usedSets}</div><div class="sl">涉及套装</div></div>
    <div class="stat-box"><div class="sv">${planCount}</div><div class="sl">采纳方案总数</div></div>
    <div class="stat-box"><div class="sv">${fodderSets}</div><div class="sl">可整套清理的套装</div></div>`;

  $('#printMeta').textContent =
    '启用角色：' + state.characters.filter(c => c.enabled).map(c => c.name).join('、') +
    '　|　生成时间：' + new Date().toLocaleString('zh-CN');

  $('#planBody').innerHTML = html || '<div class="card"><p class="muted">没有符合条件的套装。</p></div>';
}

const ELEM_DMG_STATS = ['pyro', 'hydro', 'cryo', 'electro', 'anemo', 'geo', 'dendro', 'phys'];

/* 渲染「散件 / 过渡 保留规则」面板：开关 + 编辑
 *   内置规则也能改：改动存进 overrides 覆盖层，标「已修改」，可一键「恢复默认」。
 *   启用后每条规则会生成一份候选方案，与角色聚类结果同权出现在候选区 */
function renderKeepRules() {
  const wrap = $('#keepRuleList');
  if (!wrap || !state || !state.keepRules) return;
  const active = activeKeepRules();

  wrap.innerHTML = allKeepRules().map(r => {
    const on = keepRuleEnabled(r.id);
    const slotName = (SLOTS.find(s => s.id === r.slot) || {}).name || '';
    const mainsTxt = (r.mains || []).map(id => mainStatName(r.slot, id)).join(' / ') || '不限';
    const poolTxt = (r.pool || []).map(id => subStatName(id)).join('、');
    const reqTxt = (r.required || []).map(id => '★' + subStatName(id)).join('、');
    const modified = !!r.builtin && !!keepRuleOverride(r.id);
    return `
      <label class="kr-item${on ? ' on' : ''}">
        <input type="checkbox" data-kr-toggle="${esc(r.id)}"${on ? ' checked' : ''}>
        <span class="kr-name">${esc(r.name)}</span>
        <span class="kr-slot">${esc(slotName)}</span>
        ${modified ? '<span class="kr-mod" title="已改过，点「恢复默认」可还原">已修改</span>' : ''}
        <span class="kr-cond">主要属性：${esc(mainsTxt)}${poolTxt ? `　·　追加属性：${esc(poolTxt)}` : ''}${reqTxt ? `　·　★必须：${esc(reqTxt)}` : ''}</span>
        ${r.desc ? `<span class="kr-desc">${esc(r.desc)}</span>` : ''}
        <span class="kr-btns">
          <button type="button" class="kr-edit" data-kr-edit="${esc(r.id)}" title="修改这条规则">编辑</button>
          ${modified ? `<button type="button" class="kr-reset" data-kr-reset="${esc(r.id)}" title="放弃修改，恢复出厂设置">恢复默认</button>` : ''}
          ${r.builtin ? '' : `<button type="button" class="kr-del" data-kr-del="${esc(r.id)}" title="删除该自定义规则">删除</button>`}
        </span>
      </label>`;
  }).join('');

  const cnt = $('#krCount');
  if (cnt) {
    cnt.textContent = active.length
      ? `已启用 ${active.length} 条 · 生成 ${active.length} 个候选方案`
      : '未启用';
  }
}

function renderSetBlock(name, b, slotFilter, setWeights) {
  const bonus = allSetBonus()[name] || '';
  const users = Array.from(b.users.entries());
  const unused = users.length === 0;

  // 游戏内锁定方案：先把该套装下的角色按追加属性需求聚成若干候选，
  // 散件 / 过渡规则也作为候选加入，再由用户手动合并 / 勾选采纳
  const charsForPlan = state.characters.filter(c => c.enabled && b.users.has(c.name));
  const cands = charsForPlan.length
    ? setCandidates(charsForPlan, name) : [];
  const gpHtml = cands.length ? renderGamePlans(name, cands, slotFilter) : '';

  // 该套装的追加属性需求排序（用于花/羽行提示）
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
          ${topSubs ? `<div class="sub-hint-row">追加属性优先：<b>${esc(topSubs)}</b></div>` : ''}
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

/* 渲染「游戏内锁定方案」候选区
 *   设计要点：
 *   ① 没有槽位上限，列出全部候选（角色聚类 + 散件 / 过渡规则），由用户勾选「采纳」
 *   ② 每个方案的【五个部位共用同一份追加属性条件】，所以副属性只在卡片标题下写一次
 *   ③ 每个方案给出「并入…」下拉，可与任意其它候选合并；合并后的方案可「拆回」
 *   ④ 采纳数 > 游戏上限（3）时提示用户自行收敛
 */
function renderGamePlans(setName, cands, slotFilter = 'all') {
  const cfg = (state.planCfg && state.planCfg[setName]) || { merge: [], hide: [], minHit: {} };
  const hidden = new Set(cfg.hide || []);
  const slotsTodo = SLOTS.filter(sd => slotFilter === 'all' || sd.id === slotFilter);

  const cards = cands.map((p, i) => {
    const off = hidden.has(p.key);
    // 「并入…」的候选目标：除自己以外的其它候选
    const opts = cands.filter((q, j) => j !== i)
      .map(q => `<option value="${esc(q.key)}">${esc(mergeTargetLabel(q))}</option>`).join('');

    const rows = slotsTodo.map(sd => `
      <div class="gp-mini">
        <span class="gp-slot">${sd.name}</span>
        <span class="gp-cell">${mainCondText(sd.id, p.mains[sd.id])}</span>
      </div>`).join('');

    const subTxt = planSubText(p);
    // 命中条数：池有多宽就能调到几（上限 SUB_MIN_HIT_MAX）；池为空 = 追加属性不限，不给下拉
    const poolN = (p.sub && p.sub.pool) || [];
    const hitSel = poolN.length
      ? (() => {
          const max = Math.min(SUB_MIN_HIT_MAX, poolN.length);
          const cur = Math.min(p.sub.minHit || SUB_MIN_HIT_DEFAULT, max);
          let opts = '';
          for (let n = 1; n <= max; n++) {
            opts += `<option value="${n}"${n === cur ? ' selected' : ''}>至少${'一二三四'[n - 1]}条</option>`;
          }
          return `<select class="gp-hitsel" data-gp-minhit="${esc(setName)}|${esc(p.key)}"` +
                 ` title="追加属性池里命中任意 N 条就锁定（★计入）。默认「至少两条」；调大可做更细的筛选">${opts}</select>`;
        })()
      : '<span class="gp-fixed">不限</span>';

    return `
    <div class="gp-card${p.kind === 'rule' ? ' gp-card-rule' : ''}${off ? ' gp-card-off' : ''}">
      <div class="gp-ctitle">
        <label class="gp-adopt" title="取消勾选＝不采纳，不计入游戏内设置与导出">
          <input type="checkbox" data-gp-adopt="${esc(setName)}|${esc(p.key)}"${off ? '' : ' checked'}>
          <span>采纳</span>
        </label>
        <span class="gp-idx">${i + 1}</span>
        ${planForText(p)}
        ${p.mergedCount ? `<span class="gp-badge">已合并 ${p.mergedCount} 组</span>` : ''}
        <span class="gp-acts">
          ${opts
            ? `<select class="gp-mergesel" data-gp-merge="${esc(setName)}|${esc(p.key)}" title="把本方案并入另一个方案">
                 <option value="">并入…</option>${opts}
               </select>`
            : ''}
          ${p.mergedCount
            ? `<button class="btn sm gp-split" data-gp-split="${esc(setName)}|${esc(p.key)}" title="还原为合并前的各个候选">拆回</button>`
            : ''}
          <button class="btn sm gp-copy" data-gp-copy="${esc(setName)}|${esc(p.key)}">复制</button>
        </span>
      </div>
      ${(p.kind === 'rule' && p.ruleDesc) ? `<div class="gp-rule-desc">${esc(p.ruleDesc)}</div>` : ''}
      <div class="gp-subline">
        <span class="gp-lab">追加属性（五部位相同）</span>
        <span class="gp-val">${subTxt}</span>
        <span class="gp-lab">包含（★计入）</span>
        <span class="gp-val">${hitSel}</span>
      </div>
      <div class="gp-mains">${rows}</div>
    </div>`;
  }).join('');

  const picked = cands.filter(p => !hidden.has(p.key)).length;
  const over = picked > GAME_MAX_PRESET;
  const ruleCnt = cands.filter(p => p.kind === 'rule').length;
  const charCnt = cands.length - ruleCnt;

  return `
  <div class="gp-wrap">
    <div class="gp-head">
      <span class="gp-title">🎮 游戏内锁定方案候选</span>
      <span class="gp-meta${over ? ' warn' : ''}">
        共 ${cands.length} 个候选（角色组 ${charCnt} · 散件规则 ${ruleCnt}）　·
        已采纳 <b>${picked}</b> / 游戏上限 ${GAME_MAX_PRESET}${over ? ' ⚠️' : ''}
      </span>
    </div>
    <p class="gp-lead">候选按角色的<b>重要属性</b>（如双暴）自动合并——重要属性相同就并为一套，次要属性（攻击% / 生命% / 防御%）不同的角色用<b>颜色</b>区分标注；
      辅助（充能 / 生命 / 精通）重要属性不同，会自动拆开，<b>全自动、无需调参</b>。
      每个方案的<b>五个部位共用同一份追加属性条件</b>，主要属性逐部位独立合并；命中条数<b>默认「至少两条」</b>，可在下方单独调到 1–4 做更细的筛选；觉得候选多了就用「并入…」合并、或取消勾选「采纳」。</p>
    <div class="gp-cards">${cards}</div>
    <p class="gp-tip">游戏内：背包 → 圣遗物 → 锁定功能 → 选中本套装 → 编辑，按上方逐套设置；
      每种套装游戏内<b>至多 ${GAME_MAX_PRESET} 个自定义预设</b>，请自行收敛。仅有 3 条追加属性的圣遗物，所需数量会自动减 1。</p>
  </div>`;
}

/* 「并入…」下拉里的目标名：规则优先取规则名，角色组取前几个人名 */
function mergeTargetLabel(q) {
  if (q.kind === 'rule') return '🧩 ' + q.ruleName;
  const names = q.chars || [];
  const txt = names.length > 3 ? `${names.slice(0, 3).join('、')} 等 ${names.length} 人` : names.join('、');
  return (q.mergedCount ? `[合并${q.mergedCount}] ` : '') + (txt || '（空）');
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
  const plan = computePlan(includeAlt);
  const L = ['原神 · 圣遗物套装锁定方案（游戏内照此设置）',
    '说明：每个方案的【五个部位共用同一份追加属性条件】，照下方逐套设置即可。', ''];
  let total = 0, setCount = 0, over = 0;

  Array.from(plan.entries())
    .filter(([, b]) => b.users.size > 0)
    .sort((a, b) => (b[1].users.size - a[1].users.size) || a[0].localeCompare(b[0], 'zh'))
    .forEach(([name, b]) => {
      const chars = state.characters.filter(c => c.enabled && b.users.has(c.name));
      // 与页面完全一致：角色聚类候选 + 散件 / 过渡规则，套用手工合并，只导出「已采纳」的
      const plans = adoptedPlans(chars, name);
      if (!plans.length) return;
      setCount++;
      if (plans.length > GAME_MAX_PRESET) over++;
      L.push('━━━━━━━━━━━━━━━━━━━━━━━━');
      L.push(`【${name}】${plans.length} 个预设${plans.length > GAME_MAX_PRESET ? '（⚠️ 超过游戏上限 ' + GAME_MAX_PRESET + '）' : ''}`);
      plans.forEach((p, i) => L.push(planCopyText(name, p, i)));
      L.push('');
      total += plans.length;
    });

  L.push(`合计：${setCount} 个套装、${total} 个锁定方案`);
  if (over) L.push(`⚠️ 其中 ${over} 个套装超过 ${GAME_MAX_PRESET} 套，游戏内放不下，请在页面裡用「并入…」或取消勾选收敛后再复制。`);
  L.push(`提示：每种套装在游戏内至多 ${GAME_MAX_PRESET} 个自定义预设，多个预设共同生效；`);
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
          lines.push(`  ${sd.name}：主要属性固定，建议保留 ${rows[0].keep} 件（${rows[0].charsArr.map(x => x.name).join('、')}）`);
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
  const rows = [['套装', '部位', '主要属性', '分级', '建议保留件数', '需求角色']];
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
 * 页面 ③：追加属性规则
 * ============================================================ */
function renderSubs() {
  const n = state.characters.filter(c => c.enabled).length;
  const rules = $('#subRules');

  rules.innerHTML = `
    <div class="rule-block s">
      <h4>S 级 · 必锁</h4>
      <p>主要属性命中「必留」列表，且追加属性<b>同时含暴击率与暴击伤害</b>（或你方角色所需的核心双词条）。<br>操作：直接锁定，喂到 20 级。</p>
    </div>
    <div class="rule-block a">
      <h4>A 级 · 升级观察</h4>
      <p>主要属性命中需求，追加属性含<b>单个暴击词条 + 1 条有效词条</b>。<br>操作：升到 4 级看第 4 词条，出双暴继续喂，否则停手留作过渡。</p>
    </div>
    <div class="rule-block b">
      <h4>B 级 · 过渡件</h4>
      <p>主要属性命中需求但追加属性平庸。<br>操作：先用着，毕业胚子到位后当狗粮喂掉。</p>
    </div>
    <div class="rule-block c">
      <h4>C 级 · 狗粮</h4>
      <p>主要属性不在任何已启用角色的需求列表中。<br>操作：直接喂。<span class="hint">例外：同套装的对应元素伤害杯极难出货，建议无脑保留。</span></p>
    </div>
    <p class="muted small" style="margin-top:14px">${n ? '当前已启用 ' + n + ' 个角色，下方评分器按这些角色的追加属性<b>需求排序</b>打分（按配装组统计）。' : '尚未启用角色，评分器暂用「双暴输出」默认排序。'}</p>`;

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

  // 主要属性需求判定
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
    ? (tier ? `<span class="tier-tag ${tierClass(tier)}">主要属性：${tierLabel(tier)}</span> 建议保留 ${keep} 件${who.length ? '（' + esc(who.join('、')) + '）' : ''}`
            : '<span class="tier-tag fodder">主要属性：无角色需要</span> 当前配装用不上')
    : '<span class="muted small">未选择套装，只做追加属性评分</span>';

  const top = detail.slice(0, 4).map(d =>
    `<span class="set-tag" style="margin-right:4px">${esc(d.name)} ${d.rolls.toFixed(1)}roll ×${d.w.toFixed(2)}</span>`).join('');

  box.innerHTML = `
    <div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap">
      <span class="big" style="color:${gcolor}">${grade}</span>
      <span class="muted small">有效权重 ${eff.toFixed(2)} / 约 ${maxRolls} 次词条 = ${(pct * 100).toFixed(0)}%</span>
    </div>
    <div style="margin:8px 0">${tierTxt}</div>
    <div style="margin-bottom:6px">${top || '<span class="muted small">尚未填写追加属性</span>'}</div>
    <div class="muted small">建议：${advice}${tier === null && setName ? '　（若主要属性无人需要，追加属性再好也只能当狗粮）' : ''}</div>`;
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
    ? `<table class="tbl"><thead><tr><th>套装</th><th>追加属性需求排序 Top5（★= 多数角色标为必选）</th><th>相对强度</th></tr></thead><tbody>${rows}</tbody></table>`
    : '<p class="muted small">启用角色后这里会显示每个套装的追加属性需求排序。</p>';
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
  if (state.planCfg) delete state.planCfg[s.name];   // 连同该套装的手动合并记录一起清理
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

/* 散件 / 过渡规则的新增 / 编辑浮窗开关（表单 DOM 一次性建好，只切换显示） */
function openKrForm() {
  $('#krBox').classList.remove('hidden');
  $('#krMask').classList.remove('hidden');
}
function closeKrForm() {
  $('#krBox').classList.add('hidden');
  $('#krMask').classList.add('hidden');
}

/* ============================================================
 * 更新公告与更新日志
 * ------------------------------------------------------------
 * 已读标记用独立的 localStorage key：点「恢复内置默认库」会整个重建
 * state，把标记存在 state 里会被一起清掉，导致公告反复弹。
 * ============================================================ */
const NOTICE_KEY = 'genshin_artifact_lock_notice';
function noticeRead() {
  try { return localStorage.getItem(NOTICE_KEY) || ''; } catch (e) { return ''; }
}
function markNoticeRead(v) {
  try { localStorage.setItem(NOTICE_KEY, v); } catch (e) { /* 隐私模式下写不进就算了 */ }
}
/* 只在版本变化后弹一次；手动「查看更新公告」不清除已读标记 */
function maybeShowNotice() {
  if (noticeRead() === APP_VERSION) return;
  showNotice();
}
function showNotice() {
  renderChangelog($('#noticeBody'), [CHANGELOG[0]]);
  $('#noticeMask').classList.remove('hidden');
  $('#noticeBox').classList.remove('hidden');
  markNoticeRead(APP_VERSION);   // 打开即写：就算后面出异常也不会反复弹
}
function closeNotice() {
  $('#noticeMask').classList.add('hidden');
  $('#noticeBox').classList.add('hidden');
}

/* 渲染更新日志：不传 list 就渲染全部 */
function renderChangelog(box, list) {
  if (!box) return;
  const items = list || CHANGELOG;
  box.innerHTML = items.map(it => `
    <div class="chg-item">
      <div><span class="chg-v">${esc(it.v)}</span><span class="chg-date">${esc(it.date)}</span>
        <span class="chg-title">${esc(it.title)}</span></div>
      <ul>${(it.items || []).map(t => `<li>${esc(t)}</li>`).join('')}</ul>
    </div>`).join('');
}
/* 数据管理页：版本号 + 全部日志 */
function renderDataChangelog() {
  const v = $('#appVersion');
  if (v) v.textContent = '当前版本 ' + APP_VERSION;
  renderChangelog($('#chgLog'));
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

  // 角色编辑浮窗
  $('#btnCloseDrawer').onclick = () => showDrawer(false);
  $('#btnCancelEdit').onclick = () => showDrawer(false);
  $('#modalMask').onclick = () => showDrawer(false);
  $('#btnSaveChar').onclick = saveChar;
  $('#btnRestoreChar').onclick = () => {
    if (!editing) return;
    if (!confirm('确定把这个角色（名字 / 元素 / 国度 / 定位 / 备注 / 来源 / 全部配装）还原成内置数据吗？')) return;
    if (!restoreChar(editing)) return toast('这个角色没有内置数据可还原');
    drawDrawer();
    $('#btnRestoreChar').classList.add('hidden');
    toast('已还原为内置数据，点「保存」后生效');
  };

  /* 配装编辑：二层浮窗 */
  $('#bmX').onclick = cancelBuildModal;
  $('#bmCancel').onclick = cancelBuildModal;
  $('#buildMask').onclick = cancelBuildModal;
  $('#bmSave').onclick = saveBuildModal;
  $('#bmRestore').onclick = () => {
    if (!bmDraft) return;
    const f = factoryBuildOf(editing, bmDraft);
    if (!f) return toast('这一组没有内置原样可还原');
    const copy = factoryBuildCopy(f, editing);
    copy.priority = bmDraft.priority;
    bmDraft = copy;
    drawBuildForm();
    toast('已还原为内置原样，点「保存」后生效');
  };

  /* 属性选择（三层浮窗） */
  $('#pickX').onclick = closePicker;
  $('#pickCancel').onclick = closePicker;
  $('#pickMask').onclick = closePicker;

  /* 更新公告 */
  $('#btnCloseNotice').onclick = closeNotice;
  $('#btnNoticeOk').onclick = closeNotice;
  $('#noticeMask').onclick = closeNotice;
  $('#btnShowNotice').onclick = showNotice;
  renderDataChangelog();
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

  /* ---- 散件 / 过渡 保留规则面板 ---- */
  /* 三组多选框都可传「已选集合」回填（编辑态用），不传就是全空的新建态 */
  const krChk = (w, list, checked) => {
    if (!w) return;
    const set = new Set(checked || []);
    w.innerHTML = list.map(s =>
      `<label class="kr-chk-item"><input type="checkbox" value="${esc(s.id)}"${set.has(s.id) ? ' checked' : ''}> ${esc(s.name)}</label>`).join('');
  };
  function renderKrMains(checked) {
    const slot = $('#krSlot') ? $('#krSlot').value : 'goblet';
    krChk($('#krMains'), MAIN_STATS[slot] || [], checked);
  }
  function renderKrPool(checked) { krChk($('#krPool'), SUB_STATS, checked); }
  function renderKrRequired(checked) { krChk($('#krRequired'), SUB_STATS, checked); }

  /* 进入「编辑某条规则」模式：弹出浮窗并回填该规则当前值（内置规则同样可编辑） */
  function editKeepRule(id) {
    const r = allKeepRules().find(x => x.id === id);
    if (!r) return;
    $('#krEditing').value = id;
    $('#krName').value = r.name || '';
    $('#krDesc').value = r.desc || '';
    $('#krSlot').value = r.slot || 'goblet';
    renderKrMains(r.mains); renderKrPool(r.pool); renderKrRequired(r.required);
    $('#krFormTitle').textContent = `✏️ 正在编辑：${r.name}`;
    $('#btnKrAdd').textContent = '保存修改';
    $('#btnKrCancel').hidden = false;
    openKrForm();
    const nm = $('#krName');
    if (nm) nm.focus();
  }
  /* 退出编辑态，回到新建（不动浮窗本身的开合，由调用方决定） */
  function resetKrForm() {
    $('#krEditing').value = '';
    $('#krName').value = '';
    $('#krDesc').value = '';
    $('#krSlot').value = 'goblet';
    renderKrMains(); renderKrPool(); renderKrRequired();
    $('#krFormTitle').textContent = '＋ 新增自定义规则';
    $('#btnKrAdd').textContent = '添加规则';
    $('#btnKrCancel').hidden = true;
  }
  renderKrMains(); renderKrPool(); renderKrRequired();
  // 换部位要重渲染「主要属性」候选（各部位可选主要属性不同），此时清空已选
  if ($('#krSlot')) $('#krSlot').onchange = () => renderKrMains();
  // 模块整体的收起 / 展开
  if ($('#krFold')) $('#krFold').onclick = () => setKrCollapsed(!state.keepRules.collapsed);
  // 「＋ 新增自定义规则」→ 先清干净再开浮窗
  if ($('#btnKrNew')) $('#btnKrNew').onclick = () => { resetKrForm(); openKrForm(); $('#krName').focus(); };
  // 浮窗右上角 × 与点遮罩关闭时，同时把表单退回新建态，避免下次打开留着上一次的草稿
  const cancelKr = () => { resetKrForm(); closeKrForm(); };
  cancelKrHook = cancelKr;   // 供 ESC 分层表调用（分层表在模块作用域）
  if ($('#btnKrX')) $('#btnKrX').onclick = cancelKr;
  if ($('#krMask')) $('#krMask').onclick = cancelKr;

  const krList = $('#keepRuleList');
  if (krList) {
    krList.addEventListener('change', e => {
      const cb = e.target.closest('[data-kr-toggle]');
      if (!cb) return;
      const set = new Set(state.keepRules.enabled);
      if (cb.checked) set.add(cb.dataset.krToggle); else set.delete(cb.dataset.krToggle);
      state.keepRules.enabled = [...set];
      save(); renderKeepRules(); renderPlan();
    });
    krList.addEventListener('click', e => {
      const del = e.target.closest('[data-kr-del]');
      if (del) {
        const id = del.dataset.krDel;
        const rule = allKeepRules().find(r => r.id === id);
        if (!confirm(`删除自定义规则「${rule ? rule.name : id}」？`)) return;
        state.keepRules.custom = state.keepRules.custom.filter(r => r.id !== id);
        state.keepRules.enabled = state.keepRules.enabled.filter(x => x !== id);
        if ($('#krEditing').value === id) cancelKr();
        save(); renderKeepRules(); renderPlan();
        toast('已删除规则');
        return;
      }
      const ed = e.target.closest('[data-kr-edit]');
      if (ed) { editKeepRule(ed.dataset.krEdit); return; }
      const rs = e.target.closest('[data-kr-reset]');
      if (rs) {
        const id = rs.dataset.krReset;
        delete krOverrides()[id];            // 删掉覆盖层 = 恢复出厂设置
        if ($('#krEditing').value === id) cancelKr();
        save(); renderKeepRules(); renderPlan();
        toast('已恢复默认设置');
      }
    });
  }
  if ($('#btnKrCancel')) $('#btnKrCancel').onclick = cancelKr;

  if ($('#btnKrAdd')) $('#btnKrAdd').onclick = () => {
    const name = ($('#krName').value || '').trim();
    const desc = ($('#krDesc').value || '').trim();
    const slot = $('#krSlot').value;
    const mains = [...document.querySelectorAll('#krMains input:checked')].map(i => i.value);
    const pool = [...document.querySelectorAll('#krPool input:checked')].map(i => i.value);
    const required = [...document.querySelectorAll('#krRequired input:checked')].map(i => i.value);
    if (!name) return toast('请填写规则名称');
    if (!mains.length) return toast('请至少勾选一个要留的主要属性');

    const editingId = $('#krEditing').value;
    const fields = { name, desc, slot, mains, required, pool };

    if (editingId) {
      const builtin = KEEP_RULES.find(r => r.id === editingId);
      if (builtin) {
        // 内置规则：只把「与出厂值不同的字段」写进覆盖层，其余保持出厂
        const patch = {};
        KR_EDITABLE.forEach(k => {
          if (JSON.stringify(fields[k]) !== JSON.stringify(builtin[k])) patch[k] = fields[k];
        });
        if (Object.keys(patch).length) krOverrides()[editingId] = patch;
        else delete krOverrides()[editingId];
        toast(`已修改内置规则：${name}`);
      } else {
        // 自定义规则：就地更新
        const r = state.keepRules.custom.find(x => x.id === editingId);
        if (r) Object.assign(r, fields);
        toast(`已保存规则：${name}`);
      }
      cancelKr();
    } else {
      const id = 'custom_' + Date.now().toString(36);
      state.keepRules.custom.push({ id, builtin: false, ...fields });
      state.keepRules.enabled.push(id);
      resetKrForm();               // 浮窗不关，方便连着加下一条
      toast('已添加规则：' + name);
    }
    // 新加的规则可能落在收起的模块里，这里顺手展开，别让主人以为没生效
    if (state.keepRules.collapsed) setKrCollapsed(false);
    save(); renderKeepRules(); renderPlan();
  };
  renderKeepRules();
  applyKrFold();

  $('#btnCopyGame').onclick = async () => {
    const txt = gamePlansToText();
    try { await navigator.clipboard.writeText(txt); toast('游戏内方案已复制'); }
    catch (e) { fallbackCopy(txt); }
  };
  /* ---- 候选方案的手动整理：采纳勾选 / 并入… / 拆回 / 复制 ---- */
  /* 取某套装的候选（按当前界面参数重算，保证与页面展示一致） */
  const candsOf = candsOfSet;

  $('#planBody').addEventListener('change', e => {
    // ① 采纳勾选
    const cb = e.target.closest('[data-gp-adopt]');
    if (cb) {
      const setName = cb.dataset.gpAdopt.split('|')[0];
      const key = cb.dataset.gpAdopt.slice(setName.length + 1);
      const cfg = planCfgOf(setName);
      const set = new Set(cfg.hide);
      if (cb.checked) set.delete(key); else set.add(key);
      cfg.hide = [...set];
      save(); renderPlan();
      toast(cb.checked ? '已采纳该方案' : '已取消采纳');
      return;
    }
    // ② 并入…
    const sel = e.target.closest('[data-gp-merge]');
    if (sel && sel.value) {
      const raw = sel.dataset.gpMerge;
      const setName = raw.split('|')[0];
      const key = raw.slice(setName.length + 1);
      const targetKey = sel.value;
      sel.value = '';
      const cands = candsOf(setName);
      const src = cands.find(p => p.key === key);
      const dst = cands.find(p => p.key === targetKey);
      if (!src || !dst) return;
      const cfg = planCfgOf(setName);
      // 先把两边「原有的合并」都拆掉（含以它们为产物的组），再把成员摊平后作为一个新组，
      // 这样「已合并过的方案」也能继续往里并，且拆回时能一步还原
      const dropKeys = new Set([key, targetKey]);
      cfg.merge = cfg.merge.filter(g =>
        !dropKeys.has(mergeResultKey(g)) && !g.some(k => dropKeys.has(k)));
      cfg.merge.push([...baseKeysOf(src), ...baseKeysOf(dst)]);
      cfg.hide = cfg.hide.filter(k => k !== key && k !== targetKey);
      // 两边都成了新方案的成员，各自的命中条数调整随之作废
      cfg.minHit = Object.fromEntries(
        Object.entries(cfg.minHit).filter(([k]) => !dropKeys.has(k)));
      save(); renderPlan();
      toast('已合并为一个方案');
      return;
    }
    // ③ 命中条数（包含任意 N 条）
    const hs = e.target.closest('[data-gp-minhit]');
    if (hs) {
      const raw = hs.dataset.gpMinhit;
      const setName = raw.split('|')[0];
      const key = raw.slice(setName.length + 1);
      const cfg = planCfgOf(setName);
      cfg.minHit[key] = clampHit(hs.value);
      save(); renderPlan();
      toast(`命中条数已设为「至少${'一二三四'[clampHit(hs.value) - 1]}条」`);
    }
  });

  $('#planBody').addEventListener('click', e => {
    const copy = e.target.closest('[data-gp-copy]');
    if (copy) { copyOnePlan(copy.dataset.gpCopy); return; }

    const split = e.target.closest('[data-gp-split]');
    if (split) {
      const raw = split.dataset.gpSplit;
      const setName = raw.split('|')[0];
      const key = raw.slice(setName.length + 1);
      const cfg = planCfgOf(setName);
      // key 是「合并产物」的 key，而 cfg.merge 里存的是成员 → 用复算的产物 key 去匹配
      cfg.merge = cfg.merge.filter(g => mergeResultKey(g) !== key);
      delete cfg.minHit[key];   // 产物已不存在，它的命中条数调整随之作废
      save(); renderPlan();
      toast('已拆回为合并前的候选');
      return;
    }
  });

  function copyOnePlan(raw) {
    const setName = raw.split('|')[0];
    const key = raw.slice(setName.length + 1);
    const list = candsOf(setName);
    const idx = list.findIndex(p => p.key === key);
    if (idx < 0) return;
    const txt = `【${setName}】\n` + planCopyText(setName, list[idx], idx);
    navigator.clipboard.writeText(txt)
      .then(() => toast(`已复制「${setName}」的该方案`))
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
    if (!confirm('恢复内置默认角色库与套装列表、清除你的全部自定义修改（相当于硬刷新）？\n\n提示：浏览器普通「刷新」不会清本地存档，所以旧数据 / 乱码会一直留着；这个按钮能彻底重置。')) return;
    state = normalize({ characters: freshDefaultCharacters(), sets: defaultSets(), planCfg: {},
                         _subEpoch: SUB_EPOCH, _srcMigrated: true });
    save(); renderChars(); renderPlan(); renderSubs(); renderSets();
    toast('已恢复默认库');
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
  $('#btnHelp').onclick = openHelp;
  $('#btnCloseHelp').onclick = closeHelp;
  $('#helpMask').onclick = closeHelp;

  /* ESC 分层：从最上层往下找，一次只关一层（连按可逐层退出） */
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const layer = MODAL_LAYERS.find(l => !$(l.box).classList.contains('hidden'));
    if (!layer) return;
    e.preventDefault();
    layer.close();
  });
}

let cancelKrHook = null;   // 由 bind() 赋值：散件规则浮窗的「取消并复位」回调
const MODAL_LAYERS = [
  { box: '#pickBox',    close: () => closePicker() },
  { box: '#buildBox',   close: () => cancelBuildModal() },
  { box: '#charDrawer', close: () => showDrawer(false) },
  { box: '#noticeBox',  close: () => closeNotice() },
  { box: '#helpBox',    close: () => closeHelp() },
  { box: '#setMgrBox',  close: () => closeSetMgr() },
  { box: '#krBox',      close: () => { if (cancelKrHook) cancelKrHook(); } },
];

function openHelp() { $('#helpBox').classList.remove('hidden'); $('#helpMask').classList.remove('hidden'); }
function closeHelp() { $('#helpBox').classList.add('hidden'); $('#helpMask').classList.add('hidden'); }

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
  // 老存档补 bkey：没有指纹就没法判定「这一组还是不是内置原样」，也就没法单组还原
  const bfN = backfillBkeys();
  const syN = syncFactoryUpdates();   // 后台更新了内置数据 → 没动过的组自动跟上
  if (bfN || syN) save();
  renderBatchBar();
  renderChars();
  renderPlan();
  renderSubs();
  renderSets();
  renderDataChangelog();
  maybeShowNotice();
  syncTopbarHeight();
  window.addEventListener('resize', syncTopbarHeight);
  window.addEventListener('orientationchange', () => setTimeout(syncTopbarHeight, 120));
})();
