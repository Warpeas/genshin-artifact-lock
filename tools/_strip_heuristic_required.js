// 离线迁移（写盘版，幂等）：撤掉 data.js 里所有 source:'heuristic' 配装的 required（★必选）。
// 配套 role_infer.py 的改动（启发式不再产出 required）；重要性改由 wiki 的 subs 顺序（位置权重）表达。
// source:'manual' 的 required 原样保留——人工规则不被覆盖。
// 用法：node tools/_strip_heuristic_required.js
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const dataPath = path.join(ROOT, 'src', 'data.js');
const dataJs = fs.readFileSync(dataPath, 'utf8');

// 匹配「在某个 subRules 内、source:'heuristic'」且 required 非空的行：只改写这类，
// 且 required:[...] 仅当括号内至少 1 个字符（即非空）才命中，避免重复改写空壳。
// 每行最多一个 subRules，且 build 行内 required: 仅出现在 subRules 中，安全。
const reqRe = /required:\[[^\]]+\]/;
const heuRe = /source:\s*'heuristic'/;

const lines = dataJs.split('\n');
let changed = 0, skipped = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('subRules') && heuRe.test(line) && reqRe.test(line)) {
    lines[i] = line.replace(reqRe, 'required:[]');
    changed++;
  } else if (line.includes('subRules') && heuRe.test(line)) {
    // 已是空 required 的 heuristic 行：跳过
    skipped++;
  }
}

if (changed > 0) {
  fs.writeFileSync(dataPath, lines.join('\n'), 'utf8');
}
console.log(`改写(撤 required): ${changed}  跳过(已空/非heuristic): ${skipped}`);
if (changed > 0) console.log('已写回 src/data.js');
