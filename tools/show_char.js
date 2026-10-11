/* tools/show_char.js —— 回读 src/data.js 里的角色配装组，用于「改完数据立刻验证」。
 *
 * 用法：
 *   node tools/show_char.js 薇斯纳 梦见月瑞希   # 按角色名打印全部配装组
 *   node tools/show_char.js --set 血红之证       # 打印所有用到该套装的配装组
 *   node tools/show_char.js --sub cd            # 打印追加属性里含 cd 的配装组
 *   node tools/show_char.js --manual            # 打印所有 source:'manual' 的配装组
 *   node tools/show_char.js --heuristic         # 打印所有 source:'heuristic' 的配装组
 *   node tools/show_char.js --count             # 只打统计（角色数 / 套装数 / manual 组数）
 *
 * 只读取源文件，不联网、不写文件、不构建。角色数据改动后的第 4 步回归（见
 * docs/角色数据修改手册.md）。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src', 'data.js');

// data.js 是「一堆 const 声明」，用 vm 载入后从 context 里取，避免正则解析派生常量。
const ctx = vm.createContext({});
vm.runInContext(fs.readFileSync(SRC, 'utf8') + '\n;__X={RAW_CHARS,SUB_STATS,SET_NAMES,APP_VERSION};', ctx);
const { RAW_CHARS, SUB_STATS, SET_NAMES, APP_VERSION } = ctx.__X;

const SUB_NAME = Object.fromEntries(SUB_STATS.map(s => [s.id, s.name]));
const nm = id => SUB_NAME[id] || id;
const subSeq = arr => (arr || []).map(nm).join(' → ') || '（无）';

function fmtRules(r) {
  if (!r) return '—';
  const parts = [];
  if (r.required && r.required.length) parts.push('★' + r.required.map(nm).join(' ★'));
  if (r.equal && r.equal.length) parts.push('＝' + r.equal.map(p => p.map(nm).join('=')).join(' ＝'));
  if (r.optional && r.optional.length) {
    parts.push('◇' + r.optional.map(o => Array.isArray(o) ? nm(o[0]) + '（' + o[1] + '）' : nm(o)).join(' ◇'));
  }
  const src = r.source || '（未标）';
  return (parts.join('　') || '（空规则）') + '　[' + src + ']';
}

const mains = b =>
  '沙:' + subSeq(b.sands) + ' 杯:' + subSeq(b.goblet) + ' 冠:' + subSeq(b.circlet);

function printGroup(c, i, b) {
  const tag = i === 0 ? '主推' : '备选' + i;
  console.log('  [' + tag + '] ' + (b.sets || []).join(' + ') + (b.need === 4 ? '（池内穿满4件）' : ''));
  console.log('        主词条 ' + mains(b));
  console.log('        追加  ' + subSeq(b.subs));
  console.log('        规则  ' + fmtRules(b.subRules));
  if (b.roles && b.roles.length) console.log('        定位  ' + b.roles.join(' / '));
}

const argv = process.argv.slice(2);
let hits = 0, groups = 0, manualGroups = 0, heurGroups = 0;

if (argv.includes('--count')) {
  let setIds = new Set();
  for (const c of RAW_CHARS) {
    for (const b of c[2] || []) {
      groups++;
      (b.sets || []).forEach(s => setIds.add(s));
      if (b.subRules && b.subRules.source === 'manual') manualGroups++;
      else if (b.subRules && b.subRules.source === 'heuristic') heurGroups++;
    }
  }
  console.log('角色 ' + RAW_CHARS.length + '　配装组 ' + groups +
    '　涉及套装 ' + setIds.size + '　（SETS 表 ' + (SET_NAMES ? SET_NAMES.length : '?') + ' 套）');
  console.log('manual 组 ' + manualGroups + '　heuristic 组 ' + heurGroups +
    '　无 subRules 组 ' + (groups - manualGroups - heurGroups));
  console.log('APP_VERSION ' + APP_VERSION);
  process.exit(0);
}

for (const c of RAW_CHARS) {
  let printed = false;
  const maybe = () => {
    if (!printed) { console.log('=== ' + c[0] + '（' + c[1] + '）'); printed = true; hits++; }
  };
  (c[2] || []).forEach((b, i) => {
    let ok = false;
    if (argv.includes('--set')) {
      const want = argv[argv.indexOf('--set') + 1];
      ok = (b.sets || []).includes(want);
    } else if (argv.includes('--sub')) {
      const want = argv[argv.indexOf('--sub') + 1];
      ok = (b.subs || []).includes(want);
    } else if (argv.includes('--manual')) {
      ok = !!(b.subRules && b.subRules.source === 'manual');
    } else if (argv.includes('--heuristic')) {
      ok = !!(b.subRules && b.subRules.source === 'heuristic');
    } else if (argv.length === 0) {
      ok = true;
    } else {
      ok = argv.some(a => !a.startsWith('--') && c[0] === a);
    }
    if (!ok) return;
    maybe();
    printGroup(c, i, b);
  });
}

if (hits === 0) {
  console.log('没有匹配的配装组。参数：' + (argv.join(' ') || '（无）'));
  console.log('提示：角色名要写全（如「梦见月瑞希」）；可用 --set / --sub / --manual / --count。');
} else {
  console.log('\n共 ' + hits + ' 个角色命中。');
}
