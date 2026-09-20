'use strict';
// 回归：撤销启发式 required 后，数据→subs 的真实变换（subIdsToSubs）不得再产出任何 req（★）。
// 理由：role_infer 不再吐 required，且 data.js 里 184 条 heuristic required 已撤空；manual required = 0。
// 若某 subs 项出现 req:true，就是泄漏。
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dataSrc = fs.readFileSync(path.join(root, 'src', 'data.js'), 'utf8');
let appSrc = fs.readFileSync(path.join(root, 'src', 'app.js'), 'utf8');
const initIdx = appSrc.indexOf('(function init()');
if (initIdx >= 0) appSrc = appSrc.slice(0, initIdx);

const sandbox = {
  document: { addEventListener() {}, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement() { return {}; } },
  window: {}, localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  console, Math, JSON, Set, Map, Array, Object, String, Number,
};
sandbox.$ = function () { return null; };
sandbox.escapeHtml = function (s) { return s; };
vm.createContext(sandbox);
const probe = `;this.__X = { RAW_CHARS, subIdsToSubs };`;
vm.runInContext(dataSrc + '\n' + appSrc + '\n' + probe, sandbox);
const X = sandbox.__X;

// 1) 全量：任何 heuristic 配装的 subs 出现 req:true 都是泄漏
let leak = 0, leakSamples = [];
X.RAW_CHARS.forEach(r => {
  const builds = r[2] || [];
  builds.forEach((b, i) => {
    const sr = b.subRules || {};
    if (sr.source !== 'heuristic') return;
    const subs = X.subIdsToSubs(b.subs, b.subRules);
    subs.forEach(s => { if (s.req) { leak++; if (leakSamples.length < 10) leakSamples.push(r[0] + '#' + i + ':' + s.id); } });
  });
});
console.log('启发式配装 req 泄漏数:', leak, leak ? (' 样例: ' + leakSamples.join(', ')) : '');

// 2) 玛薇卡：两配装 em 不应是 req
const mav = X.RAW_CHARS.find(r => r[0] === '玛薇卡');
let mavBad = [];
(mav[2] || []).forEach((b, i) => {
  const subs = X.subIdsToSubs(b.subs, b.subRules);
  const em = subs.find(s => s.id === 'em');
  if (em && em.req) mavBad.push('配装#' + i);
});
console.log('玛薇卡 em 仍标★(req) 的配装:', mavBad.length ? mavBad.join(', ') : '无');

// 3) 双暴（cr/cd）equal 保留：启发式配装只要 subs 同时含 cr&cd，subRules.equal 必须是 [['cr','cd']]（op='=' 由 subIdsToSubs 派生，仅标在靠后元素上，故直接校验源字段）
const eqChecks = [];
X.RAW_CHARS.forEach(r => {
  (r[2] || []).forEach((b, i) => {
    const sr = b.subRules || {};
    if (sr.source !== 'heuristic') return;
    const subs = b.subs || [];
    if (subs.includes('cr') && subs.includes('cd')) {
      const eq = sr.equal || [];
      const ok = eq.some(g => Array.isArray(g) && g.includes('cr') && g.includes('cd'));
      if (!ok) eqChecks.push(r[0] + '#' + i);
    }
  });
});
console.log('双暴 equal 该有却缺失 的配装数:', eqChecks.length, eqChecks.length ? eqChecks.slice(0, 8).join(',') : '');

const pass = leak === 0 && mavBad.length === 0 && eqChecks.length === 0;
console.log(pass ? 'PASS：无启发式 ★ 泄漏，双暴 equal 保留' : 'FAIL');
process.exit(pass ? 0 : 1);
