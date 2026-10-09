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

// 版本号 / 更新日志日期由源码声明，构建只校验其是否等于最新提交日期。
// 不能在构建时直接套用 HEAD 日期：新日志通常在提交前构建，旧 HEAD 会把新条目错写成旧日期。
try {
  const gd = execSync('git -C "' + __dirname + '" log -1 --format=%cs', { encoding: 'utf8' }).trim();
  const m0 = data.match(/const APP_VERSION = '([^']+)'/);
  const c0 = data.match(/CHANGELOG = \[[\s\S]*?v: '([^']+)',\s*date: '([^']+)'/);
  if (!m0 || !c0 || m0[1] !== c0[1]) {
    throw new Error('APP_VERSION 必须与 CHANGELOG[0].v 完全相等');
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(gd) && gd !== c0[2]) {
    console.warn('版本日期待提交校验：源码 ' + c0[2] + '，当前 HEAD ' + gd + '（保留源码日期）');
  } else {
    console.log('版本号 / 日期校验通过：' + m0[1] + '（' + c0[2] + '）');
  }
} catch (e) {
  if (e instanceof Error && e.message.includes('APP_VERSION')) throw e;
  console.log('（未检测到 git，跳过版本日期校验）');
}

// 校验：内联后关键标识符必须原样存在
['const $$', 'const $ ', '$$(', 'querySelectorAll(s)'].forEach(sig => {
  if (!out.includes(sig)) throw new Error('内联校验失败，签名缺失: ' + sig);
});

if (out === html) throw new Error('未找到替换锚点，检查 src/template.html 结构');

fs.writeFileSync(path.join(__dirname, 'index.html'), out);
console.log('构建完成：index.html（单文件版，' + (out.length / 1024).toFixed(0) + ' KB）');
