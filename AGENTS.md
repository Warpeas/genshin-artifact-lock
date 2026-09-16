# AGENTS.md —— 给接手本仓库的 AI Agent

> 面向代码的开发文档。**给人看的项目说明在 [`README.md`](README.md)，设计思路与算法取舍在 [`docs/DESIGN.md`](docs/DESIGN.md)。**
> 本文件只讲「怎么改、改哪里、别踩什么坑」。动手前请读完，尤其是**红线**与**验收清单**两节。

---

## 0. 一句话定位

纯前端**单文件**工具：输入每个角色的推荐套装 + 主要/追加属性，汇总出「每个圣遗物套装该锁什么、锁几件、给谁用」，并生成可直接照抄进游戏的锁定方案。

- 无依赖、无构建框架、无网络请求。**唯一可运行产物是根目录 `index.html`**（CSS/JS 全内联，双击即用）。
- 在线地址：https://warpeas.github.io/genshin-artifact-lock/

---

## 1. 快速开始

```bash
node build.js          # 在仓库根目录执行：src/ → index.html
node --check src/data.js && node --check src/app.js   # 改完逻辑先语法自检
```

打开根目录 `index.html` 即可验证。**没有 npm 依赖、没有 package.json**，只有 Node 内置模块。

`build.js` 做的事（顺序即源码顺序）：

1. 读 `src/{template.html, styles.css, data.js, app.js}`。
2. **安全校验**：`data.js` / `app.js` 里若出现 `</script` 直接抛错（会提前闭合内联 script 标签）。**注释里也不能写**。
3. 注入：把 `<link rel="stylesheet" href="styles.css">` 换成内联 `<style>`，两个 `<script src=...>` 换成内联 `<script>`。
   > 替换必须用**函数形式** `() => ...`，否则内容里的 `$$` / `$&` / `$'` 会被 `replace` 当转义序列吃掉。
4. **版本号注入**：执行 `git log -1 --format=%cs` 取最新提交时间，改写 `APP_VERSION` 与 `CHANGELOG[0]` 的 `v`（点分隔）/ `date`（横杠分隔）。
5. **内联签名校验**：`['const $$', 'const $ ', '$$(', 'querySelectorAll(s)']` 必须全部存在，否则判定内联失败。
6. 写出根目录 `index.html`。

---

## 2. 目录结构（真实）

```
genshin-artifact-lock/
├── index.html          ★ 构建产物 + Pages 发布物。双击即用，但【不要直接编辑】，下次 build 会覆盖
├── build.js            构建脚本（根目录，不在 src/）
├── README.md           给人看的项目说明
├── AGENTS.md           本文件（给 agent）
├── docs/DESIGN.md      设计文档：架构 / 算法 / 取舍 / 局限
├── .nojekyll           GitHub Pages 跳过 Jekyll，勿删
├── .gitignore          只忽略 tools/out/*cache*/
├── preview/            界面截图（仅文档用）
│
├── src/                源码。所有改动都在这里，改完跑 node build.js
│   ├── data.js         ★ 内置数据：套装库 / 角色库 / 属性库 / 枚举 / 版本与 CHANGELOG
│   ├── app.js          汇总引擎 + 交互（权重、聚类、合并、i18n、存档）
│   ├── styles.css      样式（含打印与 ≤560px 手机端适配）
│   └── template.html   页面骨架（构建时被注入 css/js）
│
└── tools/              Python 抓取/回写工具链（仅维护内置数据用，运行时不参与）
    ├── fetch_wiki_builds.py   抓观测枢 wiki 配装
    ├── fetch_guides.py        挑米游社攻略链接
    ├── fetch_set_effects.py   抓套装 2 / 4 件套效果并回写 bonus4
    ├── apply_wiki_builds.py   回写 src/data.js
    ├── role_infer.py          从 wiki 描述推断「配装功能定位」
    ├── gen_sources.py         生成人读的来源清单
    ├── README.md              工具链说明
    └── out/                   产物与缓存（*cache*/ 已 gitignore）
```

> **只有根目录一个 `index.html`。** 源码骨架刻意叫 `src/template.html`，单独打开没有样式，别当成页面用。

---

## 3. 改数据的正确姿势（最重要）

### 3.1 `RAW_CHARS` 角色库格式

```js
// [ 名称, 元素, [配装组...], 来源链接, 备注 ]
['胡桃', 'pyro', [
    { sets:['炽烈的炎之魔女'],                       // 1 个 = 4件套；2 个 = 2+2
      sands:['hpP','em'], goblet:['pyro'], circlet:['cr','cd'],   // 各部位主词条，按优先级降序
      subs:['cr','cd','hpP','em','atkP'],            // 追加属性（来自 wiki 精确值）
      subRules:{required:['cr'], equal:[['cr','cd']], source:'manual'}, // 语义校准
      roles:['增伤','精通','增幅反应'] },             // 配装级「功能定位」，多选
    { sets:['追忆之注连'], ... },                    // 第 0 组 = 主推
  ],
  [ ['https://baike.mihoyo.com/ys/obc/content/1627/detail','观测枢词条'],
    ['https://www.miyoushe.com/ys/article/4762213','Asgater'] ],   // [url, title]
  ''],
```

- **第 0 组是主推**，其余为备选。
- `src` 第 1 条固定是**观测枢词条**（真数据源），后 1–2 条是米游社攻略（title = 作者名）。
- 元素取值：`pyro/hydro/cryo/electro/anemo/geo/dendro`。
- 回写脚本与 `buildDefaultCharacters` 都按这个格式读写。
- `subs` 是 wiki 原始顺序，不自动表示必需；`subRules.required/equal` 才表达 ★必需和 `=` 同等优先。
- `source:'manual'` 的规则由人工维护，离线回写不会覆盖；`source:'heuristic'` 是根据定位生成的可重算规则。
- 当前：**125 个角色**（118 具名 + 旅行者 7 形态）、**46 套**圣遗物。

### 3.2 其他数据位置（`src/data.js`）

| 想改什么 | 常量 |
|---|---|
| 套装清单（含官方英文名 `en`、2 件套 `bonus`） | `SETS`（`SET_NAMES`/`SET_BONUS` 自动派生，**别手改**） |
| 角色英文名 / 国度 / 队伍定位 | `CHAR_META`：`'角色名': { en, region, roles, catalog }` |
| 主要属性可选范围（按部位） | `MAIN_STATS` |
| 追加属性种类 | `SUB_STATS` |
| 追加属性预设（fallback） | `SUB_PRESETS` |
| 元素 / 国度 / 定位枚举 | `ELEMENTS` / `REGIONS` / `ROLES` |
| **配装功能定位**词表 | `BUILD_ROLES`（输出/增伤/减抗/治疗/护盾/副C/辅助/精通/充能/聚怪/增幅反应/剧变反应） |
| 更新公告 / 更新日志 | `APP_VERSION` / `CHANGELOG` |

### 3.3 版本号与 CHANGELOG —— 有个反直觉的约定

- `APP_VERSION` 必须与 `CHANGELOG[0].v` **完全相等**（字符串相等），否则更新公告不会弹或重复弹。
- ⚠️ **`src/data.js` 里的 `APP_VERSION` 与 `CHANGELOG[0]` 是占位值**——每次 `node build.js` 都会被 git 提交时间覆盖。**不要手改它们。**
- 同日多次发布需要区分时，才在 `APP_VERSION` 手填子版本 `.n`（如 `2026.09.13.2`）；build 只覆盖日期部分、**保留 `.n`**，跨天自动归零。
- 历史 CHANGELOG 条目**同日合并**：同一天多条要合并成一条并按语义去重（只留最终效果），日期按各自 git 提交时间。
- 新增条目放在 `CHANGELOG` **数组最前面**。

### 3.4 逻辑常量（`src/app.js`）

| 常量 | 值 | 含义 |
|---|---|---|
| `W_PRIORITY` | `{main:1.0, alt:0.55}` | 主推 / 备选配装 |
| `W_SET_COUNT` | `{1:1.0, 2:0.8}` | 4 件套 / 2+2 |
| `TIER_KEEP` / `TIER_TRANS` | `0.8` / `0.4` | 必留 / 过渡阈值 |
| `KEEP_MAX` | `4` | 建议保留件数上限 |
| `SUB_RANK_DECAY` | `0.72` | 追加属性名次衰减（`>` 降权；`=` 同权；★ ×1.25） |
| `SUB_POOL_TOP` / `SUB_POOL_MAX` | `5` / `5` | 单人贡献上限 / 合并后池上限 |
| `MAIN_MAX` / `MAIN_COVER` | `3` / `0.7` | 单部位主属性上限 / 累计覆盖率 |
| `SUB_MIN_HIT_DEFAULT` / `SUB_MIN_HIT_MAX` | `2` / `4` | 命中条数默认值 / 上限 |

改这些会影响所有人的输出，动之前先想清楚（设计理由见 `docs/DESIGN.md`）。

---

## 4. 关键机制（改交互前必读）

### 4.1 存档

- `localStorage` key：`genshin_artifact_lock_v1`（`STORE_KEY`）。
- 已读公告是**独立 key**，避免「恢复内置默认库」时把已读标记一起清掉。
- 存档加载时自动迁移：历史格式统一转换成当前的排序 + `state.sets` 结构。**不需要手写迁移代码。**

### 4.2 编辑保存边界

- 角色编辑浮窗中的名称、元素、国度、队伍定位、备注、攻略来源修改后立即写入存档；关闭角色浮窗不会撤销这些基础字段修改。
- 新建角色首次填写名称后会立即建立记录，后续基础字段同样即时保存。
- 配装编辑必须继续遵守草稿机制：第二层浮窗使用 `bmDraft`，套装、主推、主要属性、追加属性和功能定位只有点击配装浮窗的「保存」才生效；取消 / 关闭 / 点击遮罩会放弃未保存修改。
- 角色浮窗底部「保存配装修改」用于写回配装草稿；不要把角色基础字段重新改回统一的“点保存才生效”。
- 配装浮窗内新增主要属性 / 追加属性时，直接取对应属性库中第一个未使用项；不要恢复成打开选择浮窗的流程。用户随后可用行内下拉框改成目标属性，重复项必须继续拦截。
- 套装管理中的 2 件套 / 4 件套效果都直接在列表行内编辑并即时保存；新增自定义套装通过弹窗填写后使用 `unshift` 放到列表第一项。
- `恢复内置顺序` 必须保持自定义套装在前、内置套装按 `SETS` 顺序在后；`恢复全部内置套装显示` 只取消隐藏状态，不负责重排或覆盖用户修改。

### 4.3 三个锚点：改坏了还能还原

| 锚点 | 含义 | 用途 |
|---|---|---|
| `bkey` | `角色名#序号`（出厂指纹） | 还原的判定锚点，**改名后照样能还原** |
| `fcanon` | 配装组内容指纹 | 「内置数据自动跟随」：内容指纹 == `fcanon` 说明用户没改过 → 用新出厂覆盖；改过则一律不动 |
| `skey` | 出厂名 | 存档兼容 |

- 存档缺 `bkey` 时会自动补写（只写 `bkey`，不要求内容相同，否则「改过 → 还原」就没落点了）。
- 后台**新增**的配装组不会自动塞进用户存档（避免打乱已排好的组合），走「＋ 从预置添加」。

### 4.3 追加属性重要度 `=` / `>`

```js
[{ id:'cr', req:true, op:'>' }, { id:'cd', req:true, op:'=' }, { id:'atkP', op:'>' }]
```

- 第 1 条最想要（1.0），其后 `=` 与上一条同权、`>` 降权 ×0.72。
- **重要属性块** = 从第 1 条沿 `op='='` 延伸的前缀块 ∪ 所有 ★必选（`coreSetOf`）——**直接由数据读出，不设阈值**。
- 存档里缺失 `op` 的条目统一按 `>` 处理。

### 4.4 合并：按「重要属性」，不是按相似度阈值

- 两组能否合并 = **重要属性重合度**够不够；**全量余弦相似度只决定「先合谁」**（排序）。
- 合并后组核心 = 两边核心的**交集**（保证组内每个人都认这些是重要属性）。
- 次要属性（攻击%/生命%/防御%）不同**可以**合并——重要属性已满足「至少两条」，具体件数再按实际圣遗物分配。
- 界面上不暴露任何阈值，也不需要调参。

### 4.5 i18n

- 机制：`applyI18n()` 扫 DOM —— ① 文本节点按词典**精确整串**匹配（trim 后相等才翻）；② `placeholder` / `title` / `aria-label` 属性；③ `[data-en]` / `[data-en-key]` 整段替换。动态插入的节点靠 `MutationObserver` 自动补扫。
- 词典两张：`T_UI_EN`（界面文案）/ `T_DATA_EN`（角色 / 套装 / 国度 / 定位 / 部位 / 词条 / 预设等数据名）；`currentDict()` 合并，`t(zh)` 查不到就保留中文。
- ⚠️ **JS 里拼接出来的复合文案（带数字 / 变量）永远不会被整串匹配到**，必须在生成时就包 `t()`（如 `t('配装') + ' ' + (i + 1)`）；配装功能定位、部位名这类**数据名**用 `t(r)` / `slotShortName(id)`，别硬写中文。
- ⚠️ 别让局部变量 `t`（循环里的 `const t = …`）**遮蔽全局 `t()` 函数**，否则静默不翻译。
- 后端保留 `setLang('ui', …)` / `setLang('data', …)` **两个独立入口**（界面文案 / 数据名）。
- 界面上是**一个单按钮** `#btnLang`（「中 / EN」，当前态金色高亮），点一下**同时**切 `ui` + `data`。
- 复制/导出文本**始终保持中文**（游戏内锁定界面是中文）；更新日志是历史记录，保留中文。
- ⚠️ 数据名切换英文后会**变长**（Sands / Goblet / Circlet、DPS / Transform…），容器要能收缩 / 换行，否则会把卡片顶宽、文字重叠。
- ⚠️ `applyI18n` 是**整段替换**，会重置动态计数；改这块时注意别把计数清掉。
- ⚠️ 调试 i18n 时每个场景要**重新构造一份 DOM**——`_i18nOrigHtml` 用 WeakMap 缓存，跨场景会串味导致误判。

---

## 5. 工具链（维护内置数据时才需要）

配装数据的**唯一数据源**是米游社「观测枢」wiki 角色词条里的 **「推荐装备 → 圣遗物推荐」结构化表格**（wiki 编辑手填的文本）。
词条「攻略推荐」外链的那些米游社文章**几乎全是图片一图流，本项目从不读取**——只在 `out/sources.*` 里作为人工延伸阅读列出。

```bash
python tools/fetch_wiki_builds.py          # 1. 抓配装（约 3 分钟）
python tools/fetch_guides.py               # 2. 挑攻略链接（约 15 分钟）
python tools/apply_wiki_builds.py          # 3. 先出报告预览
python tools/apply_wiki_builds.py --apply  #    确认后写回 src/data.js
python tools/fetch_set_effects.py          # 4. 抓套装 2 / 4 件套效果
python tools/fetch_set_effects.py --apply  #    确认后写回 src/data.js 的 bonus4
python tools/gen_sources.py                # 5. 生成来源清单
node tools/check_data.js                   # 6. 数据自检
node build.js                              # 7. 打包
```

- `apply_wiki_builds.py` 只有两个开关：`--apply`（写回）、`--no-links`（不同步来源链接）。
- `role_infer.py` 提供 `infer_roles(text, mains, subs, label)`，从 wiki 描述前缀推断配装功能定位，被上面两个脚本 import。
- `out/cache/`、`out/guides_cache/` 已 gitignore，删掉即重新联网，不删则脚本可离线重跑。
- 单次调试：`python tools/fetch_wiki_builds.py 胡桃 钟离`。
- 详见 `tools/README.md`。

### 5.1 属性别名表 `STAT_ALIAS`（踩过坑，改前必读）

`fetch_wiki_builds.py` 靠 `STAT_ALIAS` 把 wiki 原文的中文属性名映射成 id。
wiki 编辑**大量使用简写**，简写没收录就会**静默**丢属性——不报错，只是主词条悄悄少一项或变空。

历史 bug（已修）：只收了「元素充能效率 / 雷元素伤害加成 / 治疗加成」，
于是原文写「充能效率」「雷伤加成」「治疗量加成」的条目全部漏解析，
导致欧洛伦时之沙与空之杯变空、阿罗夏时之沙变空、希诺宁漏充能/岩伤杯、温迪漏风伤杯等 8 角色 18 处。

规则：
- **全称与简写都要收**。长别名优先（`_ALIAS_RE` 按长度倒序），所以共存安全。
- **别收太短的泛词**——「精通」在描述和 roles 里到处都是，收了会大面积误判。
- 改完别名**不用重新联网抓**，走离线重解析：

```bash
python tools/fetch_wiki_builds.py --reparse --dry   # 预览变更
python tools/fetch_wiki_builds.py --reparse         # 写回 out/wiki_builds.json
python tools/apply_wiki_builds.py --apply
node build.js
```

`--reparse` 读 `out/wiki_builds.json` 里已保存的 `rows[].reason` 原文重算，几秒完成。

### 5.2 数据自检 `check_data.js`

```bash
node tools/check_data.js   # 结果写 tools/out/_scan_result.md
```

扫 `RAW_CHARS`，报主词条空 / 缺字段 / 值不在 `MAIN_STATS` 里、副词条非法、套装为空。
**动过数据或抓取脚本后必跑。**

⚠️ 主词条为空**不一定**是 bug——wiki 写「空之杯：不强求」时空就是正确结果
（当前仅欧洛伦 #0 辅助向配装属此类）。判断真漏要回看 `out/wiki_builds.json` 的 `reason` 原文。

### 5.3 回写格式的坑

`apply_wiki_builds.py` 重建条目时，`items[1]/src/note` 都带着原文前导空格，
用 `", "` 拼接会各多出 1 个空格 → 全表 diff。代码里已用「记住原 pad 再还原」处理，
`--apply` 后 `git diff src/data.js` 应**只有真正变了的字段**。若发现满屏空白 diff，就是这里坏了。

`--reparse` 写 `wiki_builds.json` 必须 `indent=1`（与 fetch 输出一致），否则 diff 炸成几万行。

---

## 6. 红线（不要做）

1. **不要直接编辑根目录 `index.html`** —— 它是构建产物，下次 `node build.js` 会被覆盖。
2. **不要手改 `src/data.js` 的 `APP_VERSION` / `CHANGELOG[0]`** —— 是占位，build 会覆盖（需要子版本 `.n` 除外）。
3. **不要编造游戏数据** —— 角色/套装/配装必须能溯源到观测枢 wiki 或官方公告；历史上清理过编造角色与编造套装，别再引入。
4. **不要把攻略文章当数据源解析** —— 它们是一图流，工具从不读取。
5. **源码（含注释）里不能出现 `</script`** —— build.js 会直接抛错。
6. **不要提交 `.workbuddy/`**。
7. **改了 `src/` 必须跑 `node build.js`**，否则线上 `index.html` 不会变。

---

## 7. 验收清单（改完逐条过）

- [ ] `node --check src/data.js && node --check src/app.js` 通过
- [ ] `node build.js` 成功，输出里出现「版本号 / 日期已由 git 提交时间注入：…」
- [ ] 打开 `index.html`：四个页面都能正常渲染，控制台无报错
- [ ] 若动了数据：`node tools/check_data.js` 无异常项（允许 wiki 原文写「不强求」导致的空主词条）
- [ ] 若动了数据：角色数 / 套装数符合预期（当前 125 / 46）
- [ ] 若动了合并或阈值：确认「② 锁定方案」输出仍合理（重要属性相同的能合并、不同的被拆开）
- [ ] 若动了 i18n：中英文各切一遍，动态计数没被 `applyI18n` 清掉；英文下无残留中文（含卡片配装按钮的定位标签、部位名、来源「数据源 / 攻略」标注），英文长词不撑破卡片（角色卡 `.cc-top` 可换行、沙杯冠标签不写死宽度）
- [ ] 手机端（≤560px）无横向滚动
- [ ] `git status` 里没有 `.workbuddy/`、没有临时脚本残留
