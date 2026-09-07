#!/usr/bin/env node
/* 构建脚本：把 src/ 下的分离源码打包成单文件版 index.html
 * 用法：node build.js   （在 src 同级目录执行） */
const fs = require('fs');
const path = require('path');

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

// 校验：内联后关键标识符必须原样存在
['const $$', 'const $ ', '$$(', 'querySelectorAll(s)'].forEach(sig => {
  if (!out.includes(sig)) throw new Error('内联校验失败，签名缺失: ' + sig);
});

if (out === html) throw new Error('未找到替换锚点，检查 src/template.html 结构');

fs.writeFileSync(path.join(__dirname, 'index.html'), out);
console.log('构建完成：index.html（单文件版，' + (out.length / 1024).toFixed(0) + ' KB）');
