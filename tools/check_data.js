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
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const _log = [];
const console = { log: (...a) => _log.push(a.join(' ')) };
const OUT = path.join(__dirname, 'out');
process.on('exit', () => {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, '_scan_result.md'), _log.join('\n'), 'utf8');
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
  SUB_STATS: typeof SUB_STATS !== 'undefined' ? SUB_STATS : null
};`, sandbox);

const EX = sandbox.__EXPORT || {};
const RAW = EX.RAW_CHARS;
if (!RAW) { console.log('RAW_CHARS not found'); process.exit(1); }

const SLOT_KEYS = ['sands', 'goblet', 'circlet'];
const valid = {};
for (const slot of Object.keys(EX.MAIN_STATS || {})) {
  valid[slot] = new Set((EX.MAIN_STATS[slot] || []).map(x => (x && x.id) ? x.id : x));
}
const validSub = new Set((EX.SUB_STATS || []).map(x => (x && x.id) ? x.id : x));

let totalBuilds = 0, badCount = 0;
const charHit = new Set();
const rows = [];

for (const c of RAW) {
  const name = c[0];
  const builds = c[2] || [];
  builds.forEach((b, i) => {
    totalBuilds++;
    const issues = [];
    for (const slot of SLOT_KEYS) {
      const v = b[slot];
      if (v === undefined || v === null) { issues.push(slot + '=<缺失字段>'); continue; }
      if (!Array.isArray(v)) { issues.push(slot + '=<非数组:' + JSON.stringify(v) + '>'); continue; }
      if (v.length === 0) { issues.push(slot + '=<空>'); continue; }
      if (valid[slot]) {
        const bad = v.filter(x => !valid[slot].has(x));
        if (bad.length) issues.push(slot + '=<非法值:' + bad.join('/') + '>');
      }
    }
    const subs = b.subs;
    if (subs === undefined || subs === null) issues.push('subs=<缺失>');
    else if (!Array.isArray(subs)) issues.push('subs=<非数组>');
    else {
      if (subs.length === 0) issues.push('subs=<空>');
      if (validSub.size) {
        const bad = subs.filter(x => !validSub.has(x));
        if (bad.length) issues.push('subs=<非法值:' + bad.join('/') + '>');
      }
    }
    if (!b.sets || !b.sets.length) issues.push('sets=<空>');

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
  console.log('注：主词条为空可能是 wiki 原文写了「不强求」，回看 out/wiki_builds.json 的 reason 确认。');
} else {
  console.log('无异常。');
}
