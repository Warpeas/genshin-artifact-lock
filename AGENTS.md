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
- 当前：**124 个角色**（118 具名 + 旅行者 6 形态）、**46 套**圣遗物。

### 3.2 其他数据位置（`src/data.js`）

| 想改什么 | 常量 |
|---|---|
| 套装清单（含官方英文名 `en`、2 件套 `bonus`） | `SETS`（`SET_NAMES`/`SET_BONUS` 自动派生，**别手改**） |
| 角色国度 / 队伍定位 | `CH_META`：`'角色名': [国度, [定位...]]` |
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

### 4.2 三个锚点：改坏了还能还原

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

- 机制：DOM 上 `data-en` 属性 + `applyI18n()` 整段替换。
- 后端保留 `setLang('ui', …)` / `setLang('data', …)` **两个独立入口**（界面文案 / 数据名）。
- 界面上是**一个单按钮** `#btnLang`（「中 / EN」，当前态金色高亮），点一下**同时**切 `ui` + `data`。
- 复制/导出文本**始终保持中文**（游戏内锁定界面是中文）；更新日志是历史记录，保留中文。
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
python tools/gen_sources.py                # 4. 生成来源清单
node build.js                              # 5. 打包
```

- `apply_wiki_builds.py` 只有两个开关：`--apply`（写回）、`--no-links`（不同步来源链接）。
- `role_infer.py` 提供 `infer_roles(text, mains, subs, label)`，从 wiki 描述前缀推断配装功能定位，被上面两个脚本 import。
- `out/cache/`、`out/guides_cache/` 已 gitignore，删掉即重新联网，不删则脚本可离线重跑。
- 单次调试：`python tools/fetch_wiki_builds.py 胡桃 钟离`。
- 详见 `tools/README.md`。

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
- [ ] 若动了数据：角色数 / 套装数符合预期（当前 124 / 46）
- [ ] 若动了合并或阈值：确认「② 锁定方案」输出仍合理（重要属性相同的能合并、不同的被拆开）
- [ ] 若动了 i18n：中英文各切一遍，动态计数没被 `applyI18n` 清掉
- [ ] 手机端（≤560px）无横向滚动
- [ ] `git status` 里没有 `.workbuddy/`、没有临时脚本残留
