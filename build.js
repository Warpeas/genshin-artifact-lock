#!/usr/bin/env node
/* 构建脚本：把 src/ 下的分离源码打包成单文件版 index.html
 * 用法：node build.js   （在 src 同级目录执行） */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDir = path.join(__dirname, 'src');
const html = fs.readFileSync(path.join(srcDir, 'template.html'), 'utf8');
const css  = fs.readFileSync(path.join(srcDir, 'styles.css'), 'utf8');
const data = fs.readFileSync(path.join(srcDir, 'data.js'), 'utf8');
const app  = fs.readFileSync(path.join(srcDir, 'app.js'), 'utf8');

// 安全检查：内联内容不能包含 </script>（会提前闭合标签）
[data, app].forEach((s, i) => {
  if (s.includes('</script')) throw new Error('源码包含 </script>，需转义');
});

// 注意：必须用函数形式替换，否则替换内容里的 $$ / $& / $' 会被 replace 当转义序列解析
let out = html
  .replace('<link rel="stylesheet" href="styles.css">',
           () => '<style>\n' + css.trim() + '\n</style>')
  .replace('<script src="data.js"></script>',
           () => '<script>\n' + data.trim() + '\n</script>')
  .replace('<script src="app.js"></script>',
           () => '<script>\n' + app.trim() + '\n</script>');

// 版本号 / 更新日志日期由 git 提交时间驱动，避免手填日期跑偏（沙箱时钟可能滞后于真实日期）
// 同日多次发布用「子版本」YYYY.MM.DD.n 区分：dev 在 src/data.js 的 APP_VERSION 上手填 .n，
// 打包时只覆盖前面的日期部分、保留 .n（CHANGELOG[0].v 同步）；date 同步为本次提交时间。
try {
  const gd = execSync('git -C "' + __dirname + '" log -1 --format=%cs', { encoding: 'utf8' }).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(gd)) {
    const base = gd.replace(/-/g, '.'); // 2026-09-13 -> 2026.09.13
    // 取 dev 在源码里手填的子版本后缀 .n（同日多次发布时才有；一旦跨天则归零）
    const m0 = data.match(/const APP_VERSION = '(\d{4}\.\d{2}\.\d{2})(\.\d+)?'/);
    const oldBase = m0 ? m0[1] : '';
    const suf = (m0 && m0[2] && oldBase === base) ? m0[2] : '';
    const v = base + suf; // 2026.09.13 或 2026.09.13.2
    out = out.replace(/const APP_VERSION = '[^']*'/, "const APP_VERSION = '" + v + "'");
    // CHANGELOG[0] 的 v（点分隔）同步日期部分 + 保留 .n；date（横杠分隔）同步为本次提交时间
    out = out.replace(/(CHANGELOG = \[[\s\S]*?\{[\s\S]*?v: ')(\d{4}\.\d{2}\.\d{2})(\.\d+)?(',\s*date: ')([^']*)(')/,
      (m, p1, p2, p3, p4, p5, p6) => p1 + base + (p3 || '') + p4 + gd + p6);
    console.log('版本号 / 日期已由 git 提交时间注入：' + v + '（' + gd + '）');
  }
} catch (e) {
  console.log('（未检测到 git，沿用 data.js 内的静态版本号）');
}

// 校验：内联后关键标识符必须原样存在
['const $$', 'const $ ', '$$(', 'querySelectorAll(s)'].forEach(sig => {
  if (!out.includes(sig)) throw new Error('内联校验失败，签名缺失: ' + sig);
});

if (out === html) throw new Error('未找到替换锚点，检查 src/template.html 结构');

fs.writeFileSync(path.join(__dirname, 'index.html'), out);
console.log('构建完成：index.html（单文件版，' + (out.length / 1024).toFixed(0) + ' KB）');
