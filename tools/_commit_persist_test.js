'use strict';
/* 临时回归脚本：验证抽屉里这些动作「点了就落盘」（关窗不丢）
 *   整组还原 / 重置顺序 / 还原内置 / 设为主推 / 删除
 * 并验证 persistEditingChar 之后 editing 仍是独立草稿（不与 state.characters 共享引用）。
 * 注：renderChars / renderPlan / renderSubs / toast 需要 DOM，这里在 VM 里替换成空桩。 */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dataSrc = fs.readFileSync(path.join(root, 'src', 'data.js'), 'utf8');
let appSrc = fs.readFileSync(path.join(root, 'src', 'app.js'), 'utf8');
const initIdx = appSrc.indexOf('(function init()');
if (initIdx >= 0) appSrc = appSrc.slice(0, initIdx);

const store = {};
let timers = [];
/* 假元素：只实现 classList，用来验抽屉按钮的显隐（app.js 的 $() 走 document.querySelector） */
const els = {};
function fakeEl() {
  const set = new Set();
  return {
    _cls: set,
    classList: {
      add: c => set.add(c), remove: c => set.delete(c), contains: c => set.has(c),
      toggle: (c, on) => { if (on === undefined) { set.has(c) ? set.delete(c) : set.add(c); } else if (on) set.add(c); else set.delete(c); },
    },
    textContent: '', innerHTML: '', dataset: {},
  };
}
const sandbox = {
  document: {
    addEventListener() {}, getElementById() { return null; },
    querySelector(s) { if (!els[s]) els[s] = fakeEl(); return els[s]; },
    querySelectorAll() { return []; }, createElement() { return fakeEl(); },
  },
  window: {},
  localStorage: {
    getItem: k => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
  },
  setTimeout: fn => { timers.push(fn); return timers.length; },
  clearTimeout: () => {},
  console, Math, JSON, Set, Map, Array, Object, String, Number, Date,
};
sandbox.$ = function () { return null; };
sandbox.escapeHtml = function (s) { return s; };
vm.createContext(sandbox);

const probe = `
;this.__X = {
  defaultCharacters, STORE_KEY,
  canonBuild, canonChar, canonCharWith, canonCharContentWith,
  charModified, charContentModified, factoryCharOf, factoryBuildOf,
  restoreBuild, restorePriority, restoreChar, priorityModified, buildModified,
  persistEditingChar, save, normalizeBuild,
  syncRestoreCharBtn, charCanRestore, charCardHtml, renameSet,
  setEnv(st, ed) { state = st; editing = ed; },
  getEnv() { return { state, editing, ui }; },
};`;
vm.runInContext(dataSrc + '\n' + appSrc + '\n' + probe, sandbox);
// 顶层 function 声明会挂到 context 全局，这里覆盖成空桩，避免渲染时碰 DOM 报错
['renderChars', 'renderPlan', 'renderSubs', 'renderBuilds', 'toast', 'flash', 'syncCharMeta', 'renderSets', 'afterSetsChange'].forEach(k => { sandbox[k] = () => {}; });
sandbox.confirm = () => true;
const X = sandbox.__X;

function flushSave() {
  const fns = timers; timers = [];
  fns.forEach(fn => { try { fn(); } catch (e) { /* flash 无 DOM，忽略 */ } });
}

let pass = 0, fail = 0;
function chk(name, cond) {
  console.log((cond ? 'PASS' : 'FAIL') + '  ' + name);
  cond ? pass++ : fail++;
}

const all = X.defaultCharacters();
const base = all.find(c => (c.builds || []).length >= 2 && !!X.factoryCharOf(c));
if (!base) { console.log('FAIL  找不到 ≥2 组配装的出厂角色'); process.exit(1); }
console.log('抽查角色：' + base.name + '（配装 ' + base.builds.length + ' 组）\n');
const clone = o => JSON.parse(JSON.stringify(o));

/* ① 整组还原 */
{
  const c0 = clone(base);
  const editing = clone(c0);
  const b0 = editing.builds[0];
  if (b0.subs && b0.subs.length) b0.subs[0].opt = true;
  else b0.subs = [{ id: 'cr', req: false, op: '=', opt: true }];
  X.setEnv({ characters: [clone(c0)] }, editing);
  chk('①a 草稿已改坏', X.charContentModified(editing) === true);
  chk('①b 还原前真实角色未被污染', X.charContentModified(X.getEnv().state.characters[0]) === false);
  chk('①c restoreBuild 成功', X.restoreBuild(editing, 0) === true);
  X.persistEditingChar();
  const st = X.getEnv().state;
  chk('①d 真实角色已同步还原', X.charContentModified(st.characters[0]) === false);
  chk('①e charModified 也回 false', X.charModified(st.characters[0]) === false);
  chk('①f editing 仍是独立草稿（不共享引用）', st.characters[0] !== X.getEnv().editing);
  flushSave();
  const saved = JSON.parse(store[X.STORE_KEY] || '{}');
  chk('①g 已写入 localStorage', !!saved.characters && saved.characters.length === 1);
  chk('①h 落盘内容同为还原后', X.charContentModified(saved.characters[0]) === false);
}

/* ② 重置顺序 */
{
  const editing = clone(base);
  editing.builds.forEach((b, i) => { b.priority = (i === 1 ? 'main' : 'alt'); });
  X.setEnv({ characters: [clone(base)] }, editing);
  chk('②a 顺序已改', X.priorityModified(editing) === true);
  chk('②b 顺序改动不算内容改动', X.charContentModified(editing) === false);
  X.restorePriority(editing);
  X.persistEditingChar();
  chk('②c 真实角色顺序已同步', X.priorityModified(X.getEnv().state.characters[0]) === false);
}

/* ③ 还原内置（整角色） */
{
  const editing = clone(base);
  editing.name = '改乱的名字';
  editing.builds.forEach((b, i) => { b.priority = (i === 1 ? 'main' : 'alt'); });
  X.setEnv({ characters: [clone(base)] }, editing);
  chk('③a 整角色已改乱', X.charModified(editing) === true);
  X.restoreChar(editing);
  X.persistEditingChar();
  chk('③b 真实角色已还原', X.charModified(X.getEnv().state.characters[0]) === false);
  chk('③c 名字也还原', X.getEnv().state.characters[0].name === base.name);
}

/* ④ 设为主推 —— 本轮报的 bug：此前改了内存草稿、关窗即丢 */
{
  const editing = clone(base);
  X.setEnv({ characters: [clone(base)] }, editing);
  chk('④a 初始主推是第 1 组', X.getEnv().state.characters[0].builds.findIndex(b => b.priority === 'main') === 0);
  editing.builds.forEach((b, j) => { b.priority = j === 1 ? 'main' : 'alt'; });
  chk('④b 草稿已切到配装 2', X.priorityModified(editing) === true);
  chk('④c 未落盘前真实角色仍是第 1 组主推', X.priorityModified(X.getEnv().state.characters[0]) === false);
  X.persistEditingChar();
  const st = X.getEnv().state;
  chk('④d 真实角色主推已切到配装 2', st.characters[0].builds.findIndex(b => b.priority === 'main') === 1);
  flushSave();
  const saved = JSON.parse(store[X.STORE_KEY] || '{}');
  chk('④e 主推已落盘', saved.characters[0].builds.findIndex(b => b.priority === 'main') === 1);
  chk('④f editing 独立草稿', st.characters[0] !== X.getEnv().editing);
}

/* ⑤ 删除配装 */
{
  const editing = clone(base);
  X.setEnv({ characters: [clone(base)] }, editing);
  const before = editing.builds.length;
  editing.builds.splice(0, 1);
  if (!editing.builds.some(b => b.priority === 'main')) editing.builds[0].priority = 'main';
  X.persistEditingChar();
  const st = X.getEnv().state;
  chk('⑤a 真实角色配装数已减少', st.characters[0].builds.length === before - 1);
  chk('⑤b 删除后仍有主推', st.characters[0].builds.some(b => b.priority === 'main'));
}

/* ⑥ 设为主推 → 角色卡片展示恒等于主推组（统一数据源：不再有独立展示下标，从源头杜绝遗漏） */
{
  const editing = clone(base);
  X.setEnv({ characters: [clone(base)] }, editing);
  chk('⑥a 初始卡片选中第 1 组', /class="cc-bp on" data-vi="0"/.test(X.charCardHtml(X.getEnv().state.characters[0])));
  editing.builds.forEach((b, j) => { b.priority = j === 2 ? 'main' : 'alt'; });
  X.persistEditingChar();
  const html = X.charCardHtml(X.getEnv().state.characters[0]);
  const onIdx = (html.match(/class="cc-bp on" data-vi="(\d+)"/) || [])[1];
  chk('⑥b 设为主推后卡片自动选中第 3 组', onIdx === '2');
  chk('⑥c 卡片不再选中旧的第 1 组', !/class="cc-bp on" data-vi="0"/.test(html));
}

/* ⑦ 「还原内置」按钮的显隐随改动重算（此前只在开抽屉时算一次，改完不会重新出现） */
{
  const editing = clone(base);
  X.setEnv({ characters: [clone(base)] }, editing);
  const btn = () => els['#btnRestoreChar']._cls.has('hidden');
  X.syncRestoreCharBtn();
  chk('⑦a 按钮显隐与 charCanRestore 一致（初始）', btn() === !X.charCanRestore(editing));
  const wasHidden = btn();
  editing.builds.forEach((b, j) => { b.priority = j === 1 ? 'main' : 'alt'; });
  chk('⑦b 改了主推后 charCanRestore 变 true', X.charCanRestore(editing) === true);
  X.syncRestoreCharBtn();
  chk('⑦c 改完后按钮重新出现（此前会一直不出现）', wasHidden === false || btn() === false);
  X.restorePriority(editing);
  X.persistEditingChar();
  X.syncRestoreCharBtn();
  chk('⑦d 顺序还原后按钮状态与 charCanRestore 一致', btn() === !X.charCanRestore(X.getEnv().editing));
}

/* ⑧ 套装改名：planCfg 以套装名为键，改名后配置必须迁到新键（否则变孤儿键、方案页展示与后台脱节） */
{
  const st = {
    characters: [],
    sets: [{ skey: '', name: '旧名', bonus: '', bonus4: '', builtin: false, hidden: false }],
    planCfg: { '旧名': { merge: [['a', 'b']], hide: ['c'], minHit: {} } },
    keepRules: { enabled: [], custom: [], overrides: {}, collapsed: false },
    lang: { ui: 'zh', data: 'zh' }, sortPref: {},
  };
  X.setEnv(st, null);
  X.renameSet(0, '新名');
  chk('⑧a 套装名已改', st.sets[0].name === '新名');
  chk('⑧b planCfg 旧键已迁到新键', !!st.planCfg['新名'] && st.planCfg['新名'].merge.length === 1);
  chk('⑧c 旧键已删除（不再有孤儿键）', !Object.prototype.hasOwnProperty.call(st.planCfg, '旧名'));
  chk('⑧d 改名后配置内容无损', st.planCfg['新名'] && st.planCfg['新名'].hide[0] === 'c');
}

console.log('\n合计：' + pass + ' PASS / ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);
