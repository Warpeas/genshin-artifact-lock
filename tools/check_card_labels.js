// Focused, dependency-free checks for character-card build labels.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'src/app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8');
const ctx = vm.createContext({});
vm.runInContext(`const {BUILD_ROLES, BUILD_CATS, BUILD_KWS} = (() => {
${fs.readFileSync(path.join(root, 'src/data.js'), 'utf8')}
return {BUILD_ROLES, BUILD_CATS, BUILD_KWS};
})();`, ctx);
const start = app.indexOf('const ROLE_RANK =');
const end = app.indexOf('function buildRoleInline(', start);
assert(start >= 0 && end > start);
vm.runInContext(`
let english = false;
const isDataEn = () => english;
const t = x => ({'输出':'DPS','攻击':'ATK'}[x] || x);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
${app.slice(start, end)}
`, ctx);
const run = code => vm.runInContext(code, ctx);
assert.equal(run('buildTagInline({}, 2)'), '');
assert.equal(run("buildTagInline({cats:['输出'],kws:[]},2)"), '<span class="bt-w bt-cat">输出</span>');
const label = run("buildTagInline({cats:['输出'],kws:['攻击']},2)");
assert(label.includes('bt-cat') && label.includes('bt-kw'));
assert(label.includes('｜</span></span><wbr>'));   // 「｜」留在上一个单元内，断行点在其后
assert(!/[（）]/.test(label));
assert(!run("buildTagInline({cats:[],kws:['攻击']},2)").includes('bt-sep'));
assert(run("buildTagInline({cats:['<img>'],kws:[]},2)").includes('&lt;img&gt;'));
assert.equal((run("buildTagInline({cats:['输出','辅助','生存'],kws:[]},2)").match(/bt-cat/g) || []).length, 2);
// 行首禁则：分隔符（·｜）必须落在它前面那个词的 span 内，不能单独成段挂在断行点之后
const cells = [...label.matchAll(/<span class="bt-w ([a-z-]+)">([\s\S]*?)<\/span>/g)].map(m => ({ cls: m[1], body: m[2] }));
assert.equal(cells.length, 2);
assert(cells[0].body.includes('｜'));                       // 「｜」属于前一个单元
assert(!/<span class="bt-sep">｜<\/span><wbr>/.test(label)); // 不再单独成段
const three = run("buildTagInline({cats:['输出','辅助'],kws:['攻击','暴击']},2)");
const t3 = [...three.matchAll(/<span class="bt-w ([a-z-]+)">([\s\S]*?)<\/span>/g)].map(m => m[2]);
assert.equal(t3.length, 4);
assert(t3[0].includes('·') && t3[1].includes('｜') && t3[2].includes('·')); // 分隔符各归其前一个词
assert(!t3[3].includes('·') && !t3[3].includes('｜'));                   // 末词不带尾巴
run('english = true');
assert(run("buildTagInline({cats:['输出'],kws:['攻击']},2)").includes('DPS'));
assert(run("buildTagInline({cats:['输出'],kws:['攻击']},2)").includes('ATK'));
assert(run("nameBreakW2('苍白之火')"));
assert(run("nameBreakW2('乐团')"));
assert(!run("nameBreakW2('如雷 + 宗室')"));
assert(app.includes('aria-pressed="${i === viewIdx}"'));
assert(css.includes('.cc-bp-tag .bt-w{white-space:nowrap;}'));
assert(css.includes('.cc-bp-tag .bt-sep{opacity:.62;font-weight:400;}'));
assert(app.includes(".replace(/ \\/ /g, '&nbsp;/ ')"));            // 「 / 」绑前名（断行只在斜杠之后）
assert(!app.includes(".replace(/ \\+ /g, '&nbsp;+ ')"));          // 「 + 」不绑（保持内置行为）
assert(css.includes('.cc-bp-name.n2{width:auto;word-break:normal;overflow-wrap:normal;white-space:nowrap;}'));

/* ---- 配装条长度分档（data-lad）：与 styles.css 的档位声明是一对 ---- */
assert.equal(run("nameLadder('乐团')"), '1');        // 2 汉字 → lad1
assert.equal(run("nameLadder('追忆')"), '1');
assert.equal(run("nameLadder('苍白之火')"), '2');    // 4 汉字 → lad2
assert.equal(run("nameLadder('如雷 + 宗室')"), '2'); // 总字符 7 但纯中文 4 字 → 仍 lad2（只数汉字）
assert.equal(run("nameLadder('纺月 + 绝缘')"), '2');
assert.equal(run("nameLadder('磐岩')"), '1');             // 2 汉字 → lad1
assert.equal(run("nameLadder('风起之日')"), '2');       // 4 汉字 → lad2
assert.equal(run("nameLadder('磐岩 / 角斗士 / 追忆')"), '3');  // 8 汉字 → lad3
assert.equal(run("nameLadder('少女 / 海染 / 昔时（任选2套）')"), '3');
assert.equal(run('nameLadder("")'), '1');           // 空名兜底，不抛错
// 档位标记必须真的写进按钮 HTML
assert(app.includes('data-lad="${nameLadder(setTxt)}"'));
// 宽屏才收缩：min-width 三档必须都在 @media(min-width:561px) 内，且必须同时把 width 改成 auto
// （align-self 只在 width:auto 时生效，留着 width:100% 会让 min-width 完全失效 —— 实测 12 档全退回等宽）
const wide = css.slice(css.indexOf('@media (min-width:561px){'));
['.cc-bp{width:auto;align-self:flex-start;}',
 '.cc-bp[data-lad="1"]{min-width:min(100%,10em);}',
 '.cc-bp[data-lad="2"]{min-width:min(100%,13.5em);}',
 '.cc-bp[data-lad="3"]{min-width:min(100%,17.5em);}'].forEach(sel => {
  assert(wide.includes(sel), 'wide-screen ladder rule missing: ' + sel);
});
assert(!css.slice(0, css.indexOf('@media (min-width:561px){')).includes('data-lad="1"'),
  'ladder must NOT apply on narrow screens (卡内容区仅 140–155px，下限会退化成恒等于卡宽)');
// .wide 长名行恒整宽、不参与分档（否则长多套名被逐字折行：实测 62px → 281px）
assert(wide.includes('.cc-bp.wide{width:100%;}'));
assert(css.includes('.cc-bp.wide{flex-wrap:wrap;row-gap:4px;width:100%;}'));
// 基础档（窄屏）仍是一律等宽
assert(/\.cc-bp\{[^}]*width:100%;[^}]*\}/.test(css), 'base .cc-bp must stay width:100%');
// 宽屏名称↔定位的额外留白：定位段补 8px 左外边距（column-gap 只有 4px，收缩后太贴）。
// ⚠️ .wide 的定位段在下一行且自带 margin-left:0，必须显式排除，否则整段右移 8px。
assert(wide.includes('.cc-bp-tag{margin-left:8px;}'));
assert(wide.includes('.cc-bp.wide .cc-bp-tag{margin-left:0;}'));

/* ---- 名段折行时定位独占下行（.nmwrap） ---- */
assert(app.includes('function markWrappedBuildNames(root)'));
assert(app.includes('function resetWrappedBuildNames(root)'));
// 只增不减：已标记的行跳过，不再撤销（二态循环会让「按当前行数切换」永远摆动）
assert(/if \(b\.classList\.contains\('nmwrap'\)\) continue;/.test(app),
  'markWrappedBuildNames must be add-only (二态循环下切换会死循环)');
assert(app.includes("b.classList.add('nmwrap')"));
// renderChars 里累加两轮；resize / 字体就绪走「先清后算」（宽度、字体变了旧判定作废）
assert(app.includes('markWrappedBuildNames(grid); markWrappedBuildNames(grid);'));
assert(/resetWrappedBuildNames\(document\); markWrappedBuildNames\(document\); markWrappedBuildNames\(document\);/.test(app));
// 样式：.nmwrap 放开换行 + 定位段占满整行并归零左外边距（否则不靠右贴边）
assert(css.includes('.cc-bp.nmwrap{flex-wrap:wrap;row-gap:2px;}'));
assert(css.includes('.cc-bp.nmwrap .cc-bp-tag{flex:1 1 100%;margin-left:0;text-align:right;}'));
// ⚠️ .nmwrap 必须限定在【宽屏】：窄屏另有「全部两行」版式，若窄屏也吃这条，
//    它的 row-gap:2px 会覆盖窄屏段的 row-gap:0（两段必须按断点分开）。
const nmBlock = css.indexOf('.cc-bp.nmwrap{flex-wrap:wrap;row-gap:2px;}');
const nmMedia = css.lastIndexOf('@media (min-width:561px){', nmBlock);
assert(nmMedia >= 0 && nmMedia < nmBlock, '.nmwrap must live inside @media(min-width:561px)');

/* ---- 窄屏（≤560px）：强制两行 + 容器查询按卡宽收缩 ---- */
assert(css.includes('.cc-bp{flex-wrap:wrap;row-gap:0;padding-left:4px;padding-right:4px;}'),
  '窄屏必须允许换行、行间无硬间隔，且横向内边距收到 4px（多 4px 让定位整段放得下，360 档折行 63→0）');
// 窄屏定位段「能同行就同行」（2026-10-05 .2 起取代强制两行）：
// basis 必须是 auto —— 100% 会让它无条件独占下行，短名短定位时上行整行白掉。
/* ⚠️ 用正则断言而不是整串 includes：这条规则后面还跟着 text-wrap:balance（多行写法），
   整串匹配会随格式变化而误报（踩过一次）。 */
assert(/\.cc-bp \.cc-bp-tag\{[^}]*flex:1 1 auto;/.test(css),
  '窄屏定位段必须 flex:1 1 auto（能同行就同行）；flex-basis:100% 会退回强制两行');
assert(/\.cc-bp \.cc-bp-tag\{[^}]*text-align:right;/.test(css), '窄屏定位段必须右对齐');
// S2 + balance（2026-10-05 .3）：定位折行时摊匀两行长度，Chromium 114+ / Safari 17.5+
assert(/\.cc-bp \.cc-bp-tag\{[^}]*text-wrap:balance;/.test(css),
  '窄屏定位段应有 text-wrap:balance（S2 + balance）；缺失则折行长度不匀');
assert(!/\.cc-bp \.cc-bp-tag\{flex:1 1 100%/.test(css),
  '窄屏不得再有定位段 basis:100%（强制两行）—— 实测短名短定位时上行整行白掉');
assert(css.includes('.cc-bp .cc-bp-name{flex:0 1 auto;min-width:0;}'),
  '窄屏名段必须 flex:0 1 auto —— flex-basis:100% 会把编号徽标挤到下一行、造成压编号（实测 468 条）');
// 窄屏 .nfull 宽度上限必须扣掉编号列，否则窄卡（340 档 130px）长名会把编号从 1.5ch 挤扁到 10.2px
// 末项的 8px 必须与窄屏 padding 左右和一致（4+4），写成 12px 会让长名多让 4px、右侧留白不均
assert(css.includes('.cc-bp-name.nfull{max-width:calc(100% - 1.5ch - 4px - 8px);}'),
  '窄屏 .nfull 宽度上限的 padding 项须与 padding-left/right 之和一致（4+4=8）');
// 名段一律整段保留（2026-10-05）：窄屏不得再套「恒 2.2em 名列 + 按字断行」。
// 那条规则是「名段与定位同行」时代的产物；T4 强制两行后名段独占第一行、可用宽 ≈124px，
// 四字名（44px）一行放得下却被切成 2+2，而 5 字以上走 .nfull 整段保留不折 ——
// 造成「字少的反而折、字多的反而不折」。实测放开后名段折行 560 档 123→24、390 档 121→22、320 档 103→4。
assert(/\.cc-bp \.cc-bp-name\.n2\{[^}]*width:auto;[^}]*\}/.test(css),
  '窄屏 .n2 必须 width:auto —— 保留 2.2em 定宽会让四字名被强制 2+2 折行');
assert(/\.cc-bp \.cc-bp-name\.n2\{[^}]*max-width:calc\(100% - 1\.5ch - 4px - 8px\);[^}]*\}/.test(css),
  '窄屏 .n2 的 max-width 须与 .nfull 同口径（扣掉编号列，否则窄卡压编号）');
// 反向锁：基础 .n2 的 2 字定宽仍留着（宽屏 media 会放开），但窄屏必须被上面那条覆盖
const n2OverrideAt = css.indexOf('.cc-bp .cc-bp-name.n2{width:auto;');
assert(n2OverrideAt > css.indexOf('@media (max-width:560px){'),
  'narrow-screen .n2 override must live inside @media(max-width:560px)');
// 容器查询：直接量卡内容区宽，≥145px 才收缩；≤136px 自动回退等宽（阈值来自逐 10px 扫描）
// ⚠️ @container 必须【嵌在窄屏 @media 之内】—— @container 自身没有断点，宽屏（卡宽 199–258px）
// 也会匹配，它的百分比下限会覆盖宽屏 media 段的 em 档位，实测 1440 撞档 18.9% → 40%。
const cqStart = css.indexOf('@container (min-width:145px){');
assert(cqStart > 0, '@container 段必须存在');
const narrowStart = css.indexOf('@media (max-width:560px){');
assert(narrowStart >= 0 && cqStart > narrowStart, '@container 必须写在窄屏 @media 段内');
// 确认它落在窄屏 media 的闭合花括号之前（不是兄弟规则）
const narrowClose = css.indexOf('\n}\n', narrowStart);
const narrowTail = css.slice(narrowStart, narrowClose > 0 ? narrowClose : css.length);
assert(narrowTail.includes('@container (min-width:145px){'), '@container 必须嵌套在窄屏 media 内（不能是兄弟规则）');
assert(css.includes('.cc-bp[data-lad="1"]{min-width:72%;}'));
assert(css.includes('.cc-bp[data-lad="2"]{min-width:88%;}'));
assert(css.includes('.cc-bp[data-lad="3"]{min-width:100%;}'));
// 容器查询段里必须保留 .wide 恒 100%（长多套名不能收缩，否则逐字折行）
const cq = css.slice(cqStart);
assert(cq.includes('.cc-bp.wide{width:100%;}'));
if (process.argv.includes('--built')) {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert(html.includes(css.trim()), 'Built CSS must match source');
  assert(html.includes(app.trim()), 'Built application must match source');
}
console.log('Character-card label checks passed (empty, layers, wrapping markers, escaping, truncation, English, name rules, pressed state, length ladder).');
