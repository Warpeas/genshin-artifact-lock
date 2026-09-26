// tools/check_data.js —— 内置数据自检
//
// 扫 src/data.js 的 RAW_CHARS，报出有问题的配装组：
//   - 主词条字段缺失 / 非数组 / 为空 / 值不在 MAIN_STATS 里
//   - 副词条缺失 / 为空 / 值不在 SUB_STATS 里
//   - 套装为空
//
// 用法: node tools/check_data.js
// 产出: tools/out/_scan_result.md
//
// ⚠️ 主词条为空「不一定」是 bug：wiki 原文写「空之杯：不强求」时，空就是正确结果
//    （如欧洛伦辅助向配装）。判断是否真漏，回看 out/wiki_builds.json 的 reason 原文。
//
// ⚠️ subRules.optional（wiki 条件词条）支持两种写法：
//      旧：['cr']                   纯字符串列表
//      新：[['cr','携带西风秘典时']]  [stat, note] 元组，note 是「为什么是条件词条」的理由
//    本脚本直接复用 src/data.js 的 normalizeSubRules / subIdsToSubs 解析（见 optPairsOf），
//    不再自行按纯字符串处理 —— 否则元组会被当成 id，历史上曾误报 24 项「非法 id」。
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const _log = [];
const console = { log: (...a) => _log.push(a.join(' ')) };
const OUT = path.join(__dirname, 'out');
process.on('exit', () => {
  fs.mkdirSync(OUT, { recursive: true });
  const text = _log.join('\n');
  fs.writeFileSync(path.join(OUT, '_scan_result.md'), text, 'utf8');
  // 同时打到终端：便于 rebuild_data.py 之类上层脚本抓取统计行
  process.stdout.write(text + '\n');
});

const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'data.js'), 'utf8');
const sandbox = { console };
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(src + `
;globalThis.__EXPORT = {
  RAW_CHARS: typeof RAW_CHARS !== 'undefined' ? RAW_CHARS : null,
  MAIN_STATS: typeof MAIN_STATS !== 'undefined' ? MAIN_STATS : null,
  SUB_STATS: typeof SUB_STATS !== 'undefined' ? SUB_STATS : null,
  SETS: typeof SETS !== 'undefined' ? SETS : null,
  /* 配装定位改为由套装派生：校验口径直接复用运行端函数，避免两套实现漂移 */
  BUILD_CATS: typeof BUILD_CATS !== 'undefined' ? BUILD_CATS : null,
  BUILD_KWS: typeof BUILD_KWS !== 'undefined' ? BUILD_KWS : null,
  BUILD_ROLES: typeof BUILD_ROLES !== 'undefined' ? BUILD_ROLES : null,
  deriveBuildRoles: typeof deriveBuildRoles === 'function' ? deriveBuildRoles : null,
  deriveBuildTags: typeof deriveBuildTags === 'function' ? deriveBuildTags : null,
  /* 复用运行端解析逻辑：optional 的元组写法、条件词条落地判定都以 app 实际用的函数为准 */
  subIdsToSubs: typeof subIdsToSubs === 'function' ? subIdsToSubs : null,
  normalizeSubRules: typeof normalizeSubRules === 'function' ? normalizeSubRules : null
};`, sandbox);

const EX = sandbox.__EXPORT || {};
const RAW = EX.RAW_CHARS;
if (!RAW) { console.log('RAW_CHARS not found'); process.exit(1); }

const SLOT_KEYS = ['sands', 'goblet', 'circlet'];
const SLOT_CN = { sands: '时之沙', goblet: '空之杯', circlet: '理之冠' };
const valid = {};
for (const slot of Object.keys(EX.MAIN_STATS || {})) {
  valid[slot] = new Set((EX.MAIN_STATS[slot] || []).map(x => (x && x.id) ? x.id : x));
}
const validSub = new Set((EX.SUB_STATS || []).map(x => (x && x.id) ? x.id : x));

/* ---- 四星过渡行的识别 ----
 * 观测枢上「战狂/教官/流放者/武人…」这类四星过渡配装，表格里只写主词条
 * （时之沙/空之杯/理之冠），没有副词条一格——已回原始表格核实（out/cache）。
 * 因此 subs 为空是忠实原文，不是解析丢词：单独统计、不计入「有问题的配装组」。
 * 五星套装（含套装名无法识别者，按 5 星从严处理）若 subs 为空仍照常报错。
 */
const setRarity = {};
for (const s of (EX.SETS || [])) {
  if (s && s.name) setRarity[s.name] = (s.rarity === 4 ? 4 : 5);
}
const allFourStar = sets => (sets || []).length > 0 && sets.every(n => setRarity[n] === 4);

/* ---- 配装定位：由所选套装派生（复刻 src/data.js 的 deriveBuildTags / deriveBuildRoles） ----
 * 单套（4 件套）= 该套 pos2 ∪ pos4；两套（2+2）= 两套 pos2 的并集（吃不到 4 件套效果）。
 * 大类、关键词两层各自并集。运行端函数可用时直接复用（口径唯一），否则按同一口径本地兜底。
 */
function derivedTagsOf(sets) {
  if (typeof EX.deriveBuildTags === 'function' && EX.SETS) {
    try { return EX.deriveBuildTags((sets || []).filter(Boolean), EX.SETS) || { cats: [], kws: [] }; } catch (e) { /* 退回本地兜底 */ }
  }
  const names = (sets || []).filter(Boolean);
  const byName = new Map((EX.SETS || []).map(s => [s.name, s]));
  const pick = (n, k) => ((byName.get(n) || {})[k] || []);
  const cats = [], kws = [];
  const push = (arr, r) => { if (r && !arr.includes(r)) arr.push(r); };
  if (names.length === 1) {
    pick(names[0], 'pos2').concat(pick(names[0], 'pos4')).forEach(r => push(cats, r));
    pick(names[0], 'pos2kw').concat(pick(names[0], 'pos4kw')).forEach(r => push(kws, r));
  } else {
    names.forEach(n => {
      pick(n, 'pos2').forEach(r => push(cats, r));
      pick(n, 'pos2kw').forEach(r => push(kws, r));
    });
  }
  return { cats, kws };
}
function derivedRolesOf(sets) {
  const t = derivedTagsOf(sets);
  return t.cats.concat(t.kws);
}
/* 套装定位标签本身的自检：每套至少要有 pos2 或 pos4，否则任何用到它的配装都派生不出定位 */
const setsNoPos = [];
for (const s of (EX.SETS || [])) {
  const p2 = (s && s.pos2) || [], p4 = (s && s.pos4) || [];
  if (!p2.length && !p4.length) setsNoPos.push(s && s.name);
}
/* 二维词表外取值自检：大类必须来自 BUILD_CATS，关键词必须来自 BUILD_KWS（两层不得串位） */
const catPool = new Set(EX.BUILD_CATS || []);
const kwPool = new Set(EX.BUILD_KWS || []);
const tagsOffVocab = [];
for (const s of (EX.SETS || [])) {
  if (!s) continue;
  const bad = [];
  (s.pos2 || []).concat(s.pos4 || []).forEach(v => { if (!catPool.has(v)) bad.push('大类:' + v); });
  (s.pos2kw || []).concat(s.pos4kw || []).forEach(v => { if (!kwPool.has(v)) bad.push('关键词:' + v); });
  if (bad.length) tagsOffVocab.push({ name: s.name, bad: Array.from(new Set(bad)) });
}
/* 关键词是否只出现在 4 件套（2 件套在游戏里只有属性加成，不该带机制类关键词）——仅提示 */
const kwOnPos2 = [];
for (const s of (EX.SETS || [])) {
  if (s && (s.pos2kw || []).length) kwOnPos2.push(s.name);
}
/* 派生出的定位是否都在词表内（自定义定位不计错，仅提示） */
const rolePool = new Set(EX.BUILD_ROLES || []);
const rolesOffVocab = [];

/* ---- 回读 wiki 快照原文：判定主词条「不强求」用 ----
 * 键为角色名，值为该角色 wiki 配装行的 reason 列表；过滤规则与
 * tools/apply_wiki_builds.py 完全一致（有 sets 且至少一个主词条或副词条非空），
 * 保证与写入 src/data.js 的组下标一一对应。
 */
const REASON_ROWS = (() => {
  const map = {};
  const p = path.join(OUT, 'wiki_builds.json');
  if (!fs.existsSync(p)) return map;
  try {
    const wb = JSON.parse(fs.readFileSync(p, 'utf8'));
    for (const nm of Object.keys(wb)) {
      const v = wb[nm];
      if (!v || !v.ok) continue;
      const rows = (v.rows || []).filter(r => {
        const m = r.mains || {};
        return r.sets && ((m.sands || []).length || (m.goblet || []).length ||
                          (m.circlet || []).length || (r.subs || []).length);
      });
      map[nm] = rows.map(r => r.reason || '');
    }
  } catch (e) { /* 快照读不动就退回从严判据 */ }
  return map;
})();

/* ---- optional（wiki 条件词条）写法规整 ----
 * 直接复用 src/data.js 的 normalizeSubRules，把两种写法统一成 [[stat, note], ...]：
 *   旧 ['cr'] / 新 [['cr','携带西风秘典时']]
 * 拿不到运行端函数时用等价的本地兜底，保证脚本单独跑也不会退化成「把元组当 id」。
 */
function optPairsOf(rules) {
  const r = (rules && typeof rules === 'object') ? rules : {};
  if (typeof EX.normalizeSubRules === 'function') return EX.normalizeSubRules(r).optional;
  return (Array.isArray(r.optional) ? r.optional : [])
    .map(o => Array.isArray(o) ? [String(o[0] || ''), String(o[1] || '')] : [String(o), ''])
    .filter(p => p[0]);
}

/* ---- 派生字段：复刻 src/data.js 的 subIdsToSubs 展开逻辑 ----
 * 只做纯 JS 展开（不含「前缀块收紧」，那段逻辑已废弃），用于检查：
 *   1. subRules.required 写了却展开不出 ★（死字段）—— 必须为 0；
 *   2. subRules.optional（wiki 条件词条）的 id 是否合法、是否真能落到词条上；
 *   3. roles 为空 / subs 为空 / 未识别片段（读 out/parse_warnings.json）。
 */
function expandSubs(b) {
  const ids = b.subs || [];
  const out = ids.map(item => {
    if (Array.isArray(item)) return { id: item[0], req: !!item[1], op: item[2] || '>', opt: !!item[3] };
    if (item && typeof item === 'object') return { id: item.id != null ? item.id : item.stat, req: !!item.req, op: item.op || '>', opt: !!item.opt };
    return { id: item, req: false, op: '>', opt: false };
  });
  const rules = (b.subRules && typeof b.subRules === 'object') ? b.subRules : {};
  const required = new Set(Array.isArray(rules.required) ? rules.required : []);
  out.forEach(it => { if (required.has(it.id)) it.req = true; });
  (Array.isArray(rules.equal) ? rules.equal : []).forEach(group => {
    if (!Array.isArray(group) || group.length < 2) return;
    const pos = group.map(id => out.findIndex(it => it.id === id)).filter(i => i >= 0);
    pos.sort((a, b) => a - b).slice(1).forEach(i => { out[i].op = '='; });
  });
  const optPairs = optPairsOf(rules);
  const optional = new Set(optPairs.map(p => p[0]));
  const optNoteOf = Object.fromEntries(optPairs);
  out.forEach(it => { if (optional.has(it.id) && !it.req) it.opt = true; });
  optional.forEach(id => {
    if (out.some(it => it.id === id)) return;
    if (validSub.size && !validSub.has(id)) return;
    out.push({ id, req: false, op: '>', opt: true, optNote: optNoteOf[id] || '' });
  });
  return out;
}

let totalBuilds = 0, badCount = 0;
const charHit = new Set();
const rows = [];
const deadFields = [];      // required 非空但展开后无 ★
const starEmpty = [];       // 展开后一个 ★ 都没有
const badOptional = [];     // optional 里的非法 id
const emptyRoles = [];      // 功能定位为空
const unmarkedOptional = [];// optional 里重复/未生效的 id
const subsEmpty4 = [];      // 四星过渡行无副词条（wiki 原文未给，允许）

const slotsNotRequired = [];// 主词条=<不强求>（wiki 原文结论，允许）

for (const c of RAW) {
  const name = c[0];
  const builds = c[2] || [];
  /* src/data.js 的配装组不带 reason，判定「不强求」要回 out/wiki_builds.json 取原文；
   * 只有快照组数与该角色配装组数一致时才使用，避免错位误判（对不上就从严报错）。 */
  const reasonRows = REASON_ROWS[name];
  const aligned = !!(reasonRows && reasonRows.length === builds.length);
  builds.forEach((b, i) => {
    const reason = aligned ? (reasonRows[i] || '') : '';
    totalBuilds++;
    const issues = [];
    for (const slot of SLOT_KEYS) {
      const v = b[slot];
      if (v === undefined || v === null) { issues.push(slot + '=<缺失字段>'); continue; }
      if (!Array.isArray(v)) { issues.push(slot + '=<非数组:' + JSON.stringify(v) + '>'); continue; }
      if (v.length === 0) {
        /* wiki 原文写「不强求」（如欧洛伦 空之杯：不强求）时，空主词条就是原文结论 */
        const cn = SLOT_CN[slot] || slot;
        if (aligned && new RegExp(cn + '\\s*[:：]\\s*不强求').test(reason)) {
          slotsNotRequired.push(name + '  #' + i + '  ' + slot + '=<不强求>');
        } else issues.push(slot + '=<空>');
        continue;
      }
      if (valid[slot]) {
        const bad = v.filter(x => !valid[slot].has(x));
        if (bad.length) issues.push(slot + '=<非法值:' + bad.join('/') + '>');
      }
    }
    const subs = b.subs;
    if (subs === undefined || subs === null) issues.push('subs=<缺失>');
    else if (!Array.isArray(subs)) issues.push('subs=<非数组>');
    else {
      if (subs.length === 0) {
        if (allFourStar(b.sets)) subsEmpty4.push(name + '  #' + i + '  [' + (b.sets || []).join('+') + ']');
        else issues.push('subs=<空>');
      }
      if (validSub.size) {
        const bad = subs.filter(x => !validSub.has(x));
        if (bad.length) issues.push('subs=<非法值:' + bad.join('/') + '>');
      }
    }
    if (!b.sets || !b.sets.length) issues.push('sets=<空>');

    // ---- 派生字段检查 ----
    /* 功能定位：不再读 b.roles（该字段已降级为遗留兼容字段），改为校验「由套装派生」的结果 */
    const derivedRoles = derivedRolesOf(b.sets);
    if (!derivedRoles.length) emptyRoles.push(name + '  #' + i + '  [' + (b.sets || []).join('+') + ']');
    else {
      const off = derivedRoles.filter(r => rolePool.size && !rolePool.has(r));
      if (off.length) rolesOffVocab.push(name + '  #' + i + '  [' + derivedRoles.join('·') + ']  ' + off.join('/') + '=<词表外>');
    }
    const rules = (b.subRules && typeof b.subRules === 'object') ? b.subRules : {};
    const reqList = Array.isArray(rules.required) ? rules.required : [];
    const optPairs = optPairsOf(rules);   // [[stat, note], ...]，两种写法已规整
    const expanded = expandSubs(b);
    const stars = expanded.filter(it => it.req).length;
    if (reqList.length && stars === 0) deadFields.push(name + '  #' + i + '  required=[' + reqList.join(',') + ']');
    if (stars === 0) starEmpty.push(name + '  #' + i);
    const subIds = new Set(expanded.map(it => it.id));
    /* 条件词条是否真能落到词条上：以运行端 subIdsToSubs 的展开结果为准
     * （正常情况下合法 stat 一定会被补进结果并标 opt，因此「未落到词条」实际是
     *   运行端解析与数据约定脱钩时的哨兵）。 */
    let landed = expanded;
    if (typeof EX.subIdsToSubs === 'function') {
      try {
        const rt = EX.subIdsToSubs(b.subs || [], b.subRules);
        if (Array.isArray(rt)) landed = rt;
      } catch (e) { /* 运行端解析异常时退回本地展开 */ }
    }
    const landedIds = new Set(landed.map(it => it.id));
    for (const [id, note] of optPairs) {
      if (validSub.size && !validSub.has(id)) badOptional.push(name + '  #' + i + '  ' + id + '=<非法 id>');
      else if (!landedIds.has(id)) badOptional.push(name + '  #' + i + '  ' + id + '=<未落到词条>');
      if (optPairs.filter(p => p[0] === id).length > 1) badOptional.push(name + '  #' + i + '  ' + id + '=<重复>');
    }
    for (const [id] of optPairs) {
      const hit = landed.find(it => it.id === id);
      if (hit && !hit.opt && !hit.req) unmarkedOptional.push(name + '  #' + i + '  ' + id);
    }
    if (reqList.some(id => !subIds.has(id))) issues.push('required=<不在 subs 里:' + reqList.filter(id => !subIds.has(id)).join('/') + '>');

    if (issues.length) {
      badCount++;
      charHit.add(name);
      rows.push({ name, i, sets: (b.sets || []).join('+'), issues: issues.join(' | ') });
    }
  });
}

console.log('=== 内置数据自检 ===');
console.log('角色数: ' + RAW.length + '  配装组总数: ' + totalBuilds);
console.log('有问题的配装组: ' + badCount + '  涉及角色: ' + charHit.size);
console.log('');
if (rows.length) {
  console.log('=== 明细 ===');
  for (const r of rows) {
    console.log(`${r.name}  #${r.i}  [${r.sets}]  ${r.issues}`);
  }
  console.log('');
  console.log('注：(1) 主词条为空可能是 wiki 原文写了「不强求」；');
  console.log('    (2) 四星过渡行（战狂/教官/流放者/武人等）wiki 原文只给主词条、没有副词条一格，');
  console.log('        故 subs=<空> 不计入问题组，已单列在下方「四星过渡行无副词条」。');
} else {
  console.log('无异常。');
  console.log('');
}

/* ---- 派生字段 / 解析完整性汇总 ---- */
console.log('=== 派生字段自检 ===');
console.log('required 死字段（写了 required 却展开不出 ★）: ' + deadFields.length);
for (const x of deadFields) console.log('  ! ' + x);
console.log('★必选为空的组（无 ★ 约束，属正常分布）: ' + starEmpty.length);
console.log('optional（wiki 条件词条）异常: ' + badOptional.length);
for (const x of badOptional) console.log('  ! ' + x);
console.log('派生的角色配装定位（由套装派生）为空: ' + emptyRoles.length);
for (const x of emptyRoles) console.log('  ! ' + x);
console.log('套装定位标签缺失（pos2/pos4 全空的套装）: ' + setsNoPos.length);
for (const x of setsNoPos) console.log('  ! ' + x);
console.log('定位标签串位 / 词表外取值（大类必须在 BUILD_CATS、关键词必须在 BUILD_KWS）: ' + tagsOffVocab.length);
for (const x of tagsOffVocab) console.log('  ! ' + x.name + ' → ' + x.bad.join('、'));
console.log('2 件套带关键词的套装（正常：2 件套给的是属性类关键词，机制类关键词只应出现在 4 件套）: ' + kwOnPos2.length);
console.log('派生定位含词表外取值（自定义定位，仅提示）: ' + rolesOffVocab.length);
for (const x of rolesOffVocab) console.log('  · ' + x);
console.log('四星过渡行无副词条（wiki 原文只给主词条，允许）: ' + subsEmpty4.length);
for (const x of subsEmpty4) console.log('  · ' + x);
console.log('主词条「不强求」（wiki 原文结论，允许）: ' + slotsNotRequired.length);
for (const x of slotsNotRequired) console.log('  · ' + x);
console.log('optional 未标 opt（前端不会提示条件）: ' + unmarkedOptional.length);
for (const x of unmarkedOptional) console.log('  ! ' + x);

let unknown = [], emptyRolesSnapshot = [], noRows = [];
const warnPath = path.join(OUT, 'parse_warnings.json');
if (fs.existsSync(warnPath)) {
  try {
    const w = JSON.parse(fs.readFileSync(warnPath, 'utf8'));
    unknown = w.unknown || []; emptyRolesSnapshot = w.empty_roles || []; noRows = w.no_rows || [];
  } catch (e) { console.log('parse_warnings.json 读不动: ' + e.message); }
} else {
  console.log('（未找到 out/parse_warnings.json，先跑 tools/fetch_wiki_builds.py）');
}
console.log('');
console.log('=== 解析完整性（out/parse_warnings.json） ===');
console.log('未识别片段: ' + unknown.length + '  快照内空定位: ' + emptyRolesSnapshot.length + '  无数据角色: ' + noRows.length);
for (const u of unknown) console.log(`  ! 未识别: ${u.char} #${u.row} [${u.where}] ${JSON.stringify(u.text)}`);
for (const e of emptyRolesSnapshot) console.log('  ! 快照空定位: ' + e);

const hard = deadFields.length + badOptional.length + emptyRoles.length + setsNoPos.length + unmarkedOptional.length
  + unknown.length + emptyRolesSnapshot.length;
console.log('');
console.log(hard === 0
  ? '结论: 派生字段与解析链路无硬错误（★必选为空属正常分布）。'
  : '结论: 存在 ' + hard + ' 项硬错误，见上方明细。');
if (hard > 0) process.exitCode = 1;

