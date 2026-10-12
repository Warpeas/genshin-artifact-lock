/* tools/verify_change.js —— 「改完角色数据」的一键门禁。
 *
 *   node tools/verify_change.js                # 只跑门禁
 *   node tools/verify_change.js 薇斯纳 梦见月瑞希   # 门禁 + 回读这两个角色
 *   node tools/verify_change.js --no-build     # 跳过打包（只想快速验数据）
 *
 * 按顺序跑完 SOP（docs/角色数据修改手册.md 第 5 节）的全部关卡，末尾给一张
 * PASS/FAIL 表，任何一关 FAIL 则退出码为 1。只读源码 + 构建，不联网、不改数据。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const NODE = process.execPath;
const args = process.argv.slice(2);
const names = args.filter(a => !a.startsWith('--'));
const doBuild = !args.includes('--no-build');

const rows = [];
let failed = 0;

function step(label, fn) {
  let out = '', err = '', code = 0;
  if (fn.run) {
    // 纯函数关卡：不spawn 子进程，直接给判定
    try { out = fn.run() || ''; } catch (e) { err = String(e.message); code = 1; }
  } else {
    try {
      out = execFileSync(NODE, fn.cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e) {
      code = e.status === undefined ? 1 : e.status;
      out = (e.stdout || '') + (e.stdout && e.stderr ? '\n' : '');
      err = e.stderr || String(e.message);
    }
  }
  const res = fn.check ? fn.check(out, err, code) : (code !== 0);
  const bad = res === true ? true : (typeof res === 'string' ? true : !!res);
  if (bad) failed++;
  const detail = typeof res === 'string' ? res
    : bad ? (err || out).trim().split('\n').slice(-3).join(' ⏎ ')
    : (fn.ok || '');
  rows.push({ label, ok: !bad, detail });
}

const HITS = '共 (\\d+) 个角色命中';

// ── 1. 语法自检（中文长字符串最常见的翻车点是漏引号）
step('node --check src/data.js', { cmd: ['--check', 'src/data.js'], ok: '语法通过' });
step('node --check src/app.js', { cmd: ['--check', 'src/app.js'], ok: '语法通过' });

// ── 2. 回读验证：确认改动落在目标配装组，而不是改错角色 / 改错备选组
step('tools/show_char.js 回读', {
  cmd: [path.join(__dirname, 'show_char.js')].concat(names.length ? names : ['--count']),
  ok: names.length ? '回读见下方输出' : '统计见下方输出',
  check: (out) => {
    if (names.length && !new RegExp(HITS).test(out)) return true;   // 一个都没命中 → 角色名可能写错
    if (!new RegExp(HITS).test(out) && names.length === 0) return false;
    return false;
  }
});

// ── 3. 数据自检：check_data.js 恒返回 0，只能按「硬门禁项必须为 0」解析
const GATES = [
  '有问题的配装组',
  'required 死字段',
  'optional（wiki 条件词条）异常',
  '派生的角色配装定位',
  '套装定位标签缺失',
  '定位标签串位',
  '派生定位含词表外取值',
  '四星过渡行无副词条',
  'optional 未标 opt',
  '未识别片段', '快照内空定位', '无数据角色'
];
step('tools/check_data.js 数据自检', {
  cmd: [path.join(__dirname, 'check_data.js')],
  ok: '硬门禁项全为 0',
  check: (out) => {
    for (const line of out.split('\n')) {
      const m = line.match(/^([^:：]+)[:：]\s*(\d+)/);
      if (!m) continue;
      const label = m[1].trim(), n = +m[2];
      if (GATES.some(g => label.includes(g)) && n > 0) return true;
    }
    return false;
  }
});

// ── 4. 构建：版本号必须手改，build 只 warn 不改写（见 AGENTS.md §3.3）
if (doBuild) {
  step('node build.js', {
    cmd: [path.join(ROOT, 'build.js')],
    ok: '版本号 / 日期校验通过',
    check: (out, err) => {
      const all = out + err;
      const warn = all.match(/版本日期待提交校验：.*/);
      if (warn) return warn[0] + '（CHANGELOG[0].date 还没改成当天）';
      if (/内联校验失败/.test(all)) return '内联校验失败，产物与 src 不同步';
      if (!/版本号 \/ 日期校验通过/.test(out)) return 'build 未输出版本校验通过';
      return false;
    }
  });

  // 4b. 产物是否比源码新（build 跑过就一定新）
  step('index.html 比 src 新', {
    run: () => {
      const built = path.join(ROOT, 'index.html');
      const newest = ['src/data.js', 'src/app.js', 'src/styles.css', 'src/template.html']
        .map(f => path.join(ROOT, f))
        .reduce((a, b) => (fs.statSync(a).mtimeMs >= fs.statSync(b).mtimeMs ? a : b));
      if (fs.statSync(built).mtimeMs < fs.statSync(newest).mtimeMs) {
        throw new Error('index.html 比 src 旧，先跑 node build.js');
      }
      return '产物已同步';
    },
    ok: '产物已同步'
  });
}

// ── 5. 角色卡配装条聚焦回归（含 index.html 与 src/ 逐字比对）
step('tools/check_card_labels.js --built', {
  cmd: [path.join(__dirname, 'check_card_labels.js'), '--built'],
  ok: '配装条回归通过'
});

// ── 6. 工作区干净：无 ??、无 .workbuddy/、无 _ 前缀残留
step('工作区无临时残留', {
  cmd: ['-e', `
    const {execFileSync}=require('child_process');
    const out=execFileSync('git',['--git-dir=.git','--work-tree=.','status','--short'],{encoding:'utf8'});
    const bad=out.split('\\n').filter(l=>/\\?\\?|\\.workbuddy|[\\/]\\s*_/.test(l));
    if(bad.length){console.error(bad.join('\\n'));process.exit(1)}
  `],
  ok: 'git status 干净'
});

// ── 7. 版本三处一致（APP_VERSION / CHANGELOG[0].v / 构建产物）
if (doBuild) {
  step('版本号三处一致', {
    cmd: ['-e', `
      const fs=require('fs'),vm=require('vm');
      const src=fs.readFileSync('src/data.js','utf8');
      const ctx=vm.createContext({});vm.runInContext(src+';__V=APP_VERSION;',ctx);
      const built=fs.readFileSync('index.html','utf8');
      const m=built.match(/const APP_VERSION = '([^']+)'/);
      const c0=src.match(/CHANGELOG = \\[[\\s\\S]*?v: '([^']+)'/);
      if(!m||!c0||m[1]!==c0[1]||ctx.__V!==c0[1]){
        console.error('src='+ctx.__V+' changelog[0].v='+(c0&&c0[1])+' built='+(m&&m[1]));
        process.exit(1);
      }
    `],
    ok: 'APP_VERSION = CHANGELOG[0].v = 产物内声明'
  });
}

// ── 输出
console.log('\n══════════ 改后门禁 ══════════');
const w = Math.max(...rows.map(r => r.label.length)) + 2;
for (const r of rows) {
  const mark = r.ok ? '\u2714 PASS' : '\u2716 FAIL';
  console.log(mark.padEnd(8) + ' ' + r.label.padEnd(w) + r.detail);
}
console.log('═══════════════════════════════');
console.log(failed === 0 ? '全部通过。' : failed + ' 关失败，先修再提交。');

// show_char 的原始输出（回读用），仅在指定了角色名时打出来
if (names.length) {
  console.log('\n──── 回读明细 ────');
  process.stdout.write(execFileSync(NODE, [path.join(__dirname, 'show_char.js')].concat(names), { cwd: ROOT, encoding: 'utf8' }));
}
process.exit(failed === 0 ? 0 : 1);