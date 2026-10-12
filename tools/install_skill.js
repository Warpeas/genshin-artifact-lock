/* tools/install_skill.js —— 把仓库内的 skills/ 装到 WorkBuddy 能自动发现的位置。
 *
 *   node tools/install_skill.js            # 装到用户级 ~/.workbuddy/skills/（默认）
 *   node tools/install_skill.js --project  # 装到项目级 <repo>/.workbuddy/skills/
 *   node tools/install_skill.js --list     # 只看装了什么
 *   node tools/install_skill.js --uninstall # 卸载（仅本工具装过的）
 *
 * 为什么要有这个脚本：仓库里的 `skills/` 才是单一事实源（跟着 git 走、能 review），
 * 而 WorkBuddy 只从 ~/.workbuddy/skills/ 或 <workspace>/.workbuddy/skills/ 发现技能。
 * 本仓库的 .gitignore 忽略 .workbuddy/，所以默认装用户级，仓库内留一份受控的源。
 *
 * 装完需**新开一个会话**才会被识别（技能清单在会话启动时扫描一次）。
 */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'skills');
const STAMP = '.installed-from-genshin-artifact-lock';

function rmrf(p) { fs.rmSync(p, { recursive: true, force: true }); }

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, e.name), d = path.join(to, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

const argv = process.argv.slice(2);
const destRoot = argv.includes('--project')
  ? path.join(ROOT, '.workbuddy', 'skills')
  : path.join(os.homedir(), '.workbuddy', 'skills');
const scope = argv.includes('--project') ? '项目级' : '用户级';

if (argv.includes('--list')) {
  console.log('来源：' + SRC);
  if (!fs.existsSync(destRoot)) { console.log('目标：' + destRoot + '（尚不存在）'); process.exit(0); }
  console.log('目标：' + destRoot);
  for (const d of fs.readdirSync(destRoot)) {
    const skill = path.join(destRoot, d, 'SKILL.md');
    if (!fs.existsSync(skill)) continue;
    const mine = fs.existsSync(path.join(destRoot, d, STAMP));
    console.log((mine ? '  ★ ' : '    ') + d + (mine ? '（本工具安装）' : '（其他来源，未动）'));
  }
  process.exit(0);
}

if (!fs.existsSync(SRC)) { console.error('仓库里没有 skills/ 目录'); process.exit(1); }
const ids = fs.readdirSync(SRC, { withFileTypes: true })
  .filter(e => e.isDirectory() && fs.existsSync(path.join(SRC, e.name, 'SKILL.md')))
  .map(e => e.name);

if (argv.includes('--uninstall')) {
  for (const id of ids) {
    const d = path.join(destRoot, id);
    if (fs.existsSync(path.join(d, STAMP))) { rmrf(d); console.log('已卸载 ' + id); }
    else console.log('跳过 ' + id + '（不是本工具装的）');
  }
  process.exit(0);
}

if (!ids.length) { console.error('skills/ 下没有含 SKILL.md 的技能'); process.exit(1); }
fs.mkdirSync(destRoot, { recursive: true });
for (const id of ids) {
  const to = path.join(destRoot, id);
  rmrf(to);                       // 整目录替换，避免残留旧版本的文件
  copyDir(path.join(SRC, id), to);
  fs.writeFileSync(path.join(to, STAMP), SRC, 'utf8');
  console.log('已安装 ' + id + '  →  ' + to);
}
console.log('\n' + scope + '安装完成：' + ids.length + ' 个技能。**新开一个会话**才会被识别。');