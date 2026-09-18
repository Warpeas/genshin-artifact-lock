# tools/ —— 配装数据抓取与回写工具链

配装数据**只**来自米游社「观测枢」wiki 角色词条里的结构化表格（wiki 编辑手填文本）。
词条里另外挂着的米游社攻略文章几乎全是图片一图流，本工具链**从不读取**，
只在 `out/sources.*` 里作为人工延伸阅读列出。

> **一条命令重建**：`python tools/rebuild_data.py`。
> 联网抓取与离线快照重放走的是**同一套** `STAT_ALIAS` / `TOKEN_ALIAS` / `parse_fields()`，
> wiki 挂掉也能用 `--offline` 从 `tools/out/wiki_builds.json` 快照重放出一致结果。

## 脚本

| 脚本 | 作用 | 输出 |
|---|---|---|
| `rebuild_data.py` | **一键重建总入口**：抓取（或离线重放）→ 回写 → 回归测试 → 自检 → 打包，串成一条链 | —（调下面各脚本） |
| `fetch_wiki_builds.py` | 抓角色词条的「推荐装备 → 圣遗物推荐」，解析出套装 / 主词条 / 副词条 / 功能定位 / 条件词条；`--reparse` 可离线重放快照 | `out/wiki_builds.json`、`out/parse_warnings.json` |
| `test_parse.py` | 解析回归测试（离线）：别名覆盖 / 分词规则 / 条件词条 / 产物级断言 | 终端 PASS/FAIL 汇总，失败退出码非 0 |
| `apply_wiki_builds.py` | 把快照写回 `src/data.js`（配装、主词条、副词条、功能定位、`subRules.optional` 条件词条、来源链接） | `out/report.md` |
| `fetch_set_effects.py` | 抓套装「基础信息」中的 2 件套 / 4 件套效果，并把 4 件套效果写回 `src/data.js` | `out/set_effects.json` |
| `fetch_guides.py` | 按作者白名单 + 热度为每个角色挑攻略链接 | `out/guides.json` |
| `gen_sources.py` | 生成人读的来源清单（可点开） | `out/sources.md`、`out/sources.html` |
| `role_infer.py` | 提供 `infer_roles(...)` 推断功能定位、`infer_subrules(roles, subs, optional)` 生成 `subRules`；角色级定位兜底读 `src/data.js` 的 `CHAR_META` | —（被上面脚本 import，不直接跑） |
| `check_data.js` | 数据自检：主词条空 / 缺字段 / 非法值，配装组完整性，**派生字段门禁**（死字段 / 空 roles / optional 异常 / 未识别片段） | `out/_scan_result.md` |

## 标准流程（以 `rebuild_data.py` 为唯一入口）

日常重建**只需要跑这一条**：

```bash
python tools/rebuild_data.py               # 联网抓 125 角色 → 复核 → 回写 → 回归测试 → 自检 → 打包
```

它按固定顺序做 6 件事，任一步不通过即中止并返回非 0 退出码：

1. **联网抓取** `fetch_wiki_builds.py`（抓完自动跑一次 `--reparse` 复核，见「抓取门禁」）；
2. **回写** `apply_wiki_builds.py --no-links --apply`（写回 `src/data.js`）；
3. **解析回归测试** `test_parse.py`；
4. **数据自检** `check_data.js`（抓死字段 / 空 roles / optional 异常 / 未识别片段）；
5. **打包** `node build.js`；
6. **打印本次重建结果**（死字段 / 空定位 / 未识别片段 / optional 异常 / ★必选为空组数 / 自检退出码）。

最后仍会输出这四行门禁统计，只要非 0 就说明数据不干净。

### `rebuild_data.py` 常用开关

| 命令 | 含义 |
|---|---|
| `python tools/rebuild_data.py` | 默认：联网抓全部角色 → 复核 → 回写 → 自检 → 打包 |
| `python tools/rebuild_data.py --offline` | **不联网**：直接拿 `out/wiki_builds.json` 快照重放，结果与联网一致 |
| `python tools/rebuild_data.py --dry` | 只预览（不写 `src/data.js`，跳过自检与打包） |
| `python tools/rebuild_data.py --no-build` | 跳过 `node build.js` |
| `python tools/rebuild_data.py 胡桃 钟离` | **只重建指定角色**（联网时生效；离线时对快照整体重放） |
| `python tools/rebuild_data.py --allow-unrecognized` | 显式放行未识别片段（默认拦截，见下） |

**wiki 不可达不会损坏数据**：抓取默认以现有 `out/wiki_builds.json` 为底（只有 `--fresh` 才清空），
失败角色一律保留快照旧数据；若本次 0 个角色成功，会提示改用 `--offline`。
`--offline` 与联网抓取共用同一套解析代码，因此两条路产出的 `wiki_builds.json` / `data.js` 一致。

> 需要单独更新「攻略链接」「套装效果」「来源清单」时，仍可单独调 `fetch_guides.py` /
> `fetch_set_effects.py` / `gen_sources.py`（见下文），它们不参与配装主体重建。

## 抓取门禁与离线重放（`--reparse`）

`fetch_wiki_builds.py` 靠 `STAT_ALIAS`（长句正则扫描）与 `TOKEN_ALIAS`（词条 token 级）
把 wiki 原文里的中文属性名映射成 id。wiki 编辑**大量使用简写**，简写没收录就会**静默**丢词条。

**门禁规则**：每次联网抓取后会自动以同一套别名表 `--reparse` 复核；只要出现**未识别片段**，
脚本**直接以退出码 2 中止**，不写回快照，除非显式加 `--allow-unrecognized`。
所有诊断统一写入 `tools/out/parse_warnings.json`。

```bash
python tools/fetch_wiki_builds.py --reparse --dry   # 预览变更（不写回）
python tools/fetch_wiki_builds.py --reparse         # 离线重放并写回 out/wiki_builds.json
python tools/fetch_wiki_builds.py --reparse --allow-unrecognized   # 明知有片段未覆盖时放行
```

`--reparse` 直接读快照里已保存的 `rows[].reason` **原文**重算，**不联网**，几秒完成；
改别名表 / 分词逻辑后无需重跑 3 分钟的抓取。

> 写 `wiki_builds.json` 必须 `indent=1`（与 fetch 输出一致），否则 diff 会炸成几万行——脚本内已固定。

## 别名表：`STAT_ALIAS` 与 `TOKEN_ALIAS`

两张表分工不同，**别混用**：

| 表 | 生效范围 | 能收什么 | 不能收什么 |
|---|---|---|---|
| `STAT_ALIAS` | 整段长句做正则扫描（`_ALIAS_RE` 按长度倒序，长别名优先） | 全称与不会歧义的异写：`元素精通`、`暴击率`、`生命值`、`充能效率`、`雷伤加成`、`治疗量加成`…… | **不能收短泛词**——`精通` / `暴击` 在描述与 roles 里到处都是，收了会大面积误判 |
| `TOKEN_ALIAS` | 只作用于**已切分好的词条 token**（冒号后面的词条清单，一个 token 就是一个属性名） | 短简写：`精通`→em、`暴击`→cr、`暴击几率`→cr、`生命加成`→hpP、`攻击加成`、`防御加成`、`充能`、`治疗量`…… | 不该出现在词条清单里的词 |

历史 bug（本次已修）：多莉 / 卡齐娜 / 瑶瑶的推荐理由写的是「精通 / 暴击 / 生命加成」，
这三个简写不在任何别名表里 → 被**静默丢弃**，共造成 **7 处副词条缺失**。
修复方式是把简写收入 `TOKEN_ALIAS`（而非 `STAT_ALIAS`，避免长句误判），
并加上「未识别片段上报 + 非空校验」，禁止静默丢词条。

> 改完任一张别名表：`python tools/rebuild_data.py --offline` 即可（或 `--reparse` + `apply` + `build`）。

## 解析回归测试（`test_parse.py`）

守住本次修复的四类问题，防止日后改别名表 / 分词逻辑时回归，**离线运行、不联网**：

```bash
python tools/test_parse.py
```

覆盖四组断言：

- **A. 别名覆盖**：`STAT_ALIAS` 全称映射正确；`TOKEN_ALIAS` 收录 `精通/暴击/生命加成`；
  且断言这些简写**不进** `STAT_ALIAS`（防长句误判）。
- **B. 分词规则**：`/`、空格、`或者` 三种分隔符；`充能效率` 等简写不再落入 unknown。
- **C. 条件词条**：`（仅西风猎弓）`、`（六命可选防御力）` 单独成为 `conditional`，不并入常规推荐；
  说明里另写属性名时，常规取括号外、条件取说明内（`攻击力（六命可选防御力）` → 常规 `atkP` + 条件 `defP`）。
- **D. 产物级断言**：`out/wiki_builds.json` 未识别片段 / 快照空定位为空；7 处历史丢失副词条全部补齐；
  5 组历史空定位全部补齐；`src/data.js` required 死字段 / 空 roles / optional 异常均为 0。

失败项会逐条打印并以非 0 退出码结束，`rebuild_data.py` 检测到即中止，不产出数据。

## 解析完整性诊断（`out/parse_warnings.json`）

`fetch_wiki_builds.py`（含 `--reparse`）每次运行都会刷新该文件，三个数组**都应为空**：

| 字段 | 含义 |
|---|---|
| `unknown` | **未识别片段**：wiki 原文有、别名表覆盖不到、又不像噪音的文本（含 `char` / `row` / `where` / `text`） |
| `empty_roles` | **快照内空定位**：`roles` 推不出且角色级兜底也为空的配装 |
| `no_rows` | **无数据角色**：快照里 `ok=false` 或没有任何配装行的角色 |

出现 `unknown` 时，先补别名表再重跑；确认可忽略时才 `--allow-unrecognized` 放行。

## 数据自检（`check_data.js`）

```bash
node tools/check_data.js
```

扫 `src/data.js` 的 `RAW_CHARS`，结果写 `out/_scan_result.md`，同时打到终端供上层脚本抓取统计行。
除常规字段检查外，还有**派生字段门禁**，以下三项必须为 0、否则退出码非 0：

| 门禁项 | 判据 |
|---|---|
| `required 死字段` | 写了 `subRules.required` 却展开不出任何 ★必选（历史 122 处） |
| `roles（功能定位）为空` | 配装组没有任何功能定位（历史 5 组） |
| `optional（wiki 条件词条）异常` | `optional` 里的 id 非法 / 未落到词条 / 重复 / 未标 opt |

另外报告（**非**门禁）：
`★必选为空的组`（无 ★ 约束，属正常分布）、`optional 未标 opt`、
以及读 `out/parse_warnings.json` 得到的 `未识别片段 / 快照内空定位 / 无数据角色` 三项。

**每次改完数据或升级抓取脚本后跑一次。**

注意：主词条为空**不一定**是 bug——wiki 原文写「空之杯：不强求」时，空就是正确结果
（如欧洛伦 #0 辅助向配装：原文「如果纯当后台、不施放元素爆发，可以什么属性都不堆」）。
判断是否真漏，要回看 `wiki_builds.json` 里的 `reason` 原文。

**副词条直接写 wiki「推荐装备」里的精确值**：每组配装独立携带自己的 `subs`，`SUB_PRESETS` 只用于新建配装时的默认值与「套用预设」。

**功能定位 `roles`**：由 `role_infer.py` 从 wiki 描述前缀推断（`split("主词条")[0]`），
推断不出时退回 `src/data.js` 的 `CHAR_META` 角色级定位兜底，基础词表见 `src/data.js` 的 `BUILD_ROLES`。
注意它与角色级「队伍定位」（主C/副C/辅助）是两回事，别混。

单次调试：`python tools/fetch_wiki_builds.py 胡桃 钟离`（传角色名即只跑这些）。

## 根据定位生成 subRules（离线）

wiki 的追加属性列表没有稳定的必需/同等优先语义，`role_infer.py` 会基于已有的
`roles` 与 `subs` 做保守推断。

```bash
python tools/apply_wiki_builds.py --no-links          # 预览
python tools/apply_wiki_builds.py --apply --no-links  # 写回
```

回写规则：

- `source:'manual'` 或没有 `source` 的旧规则按人工规则保留；
- `source:'heuristic'` 是派生规则，允许后续再次计算；
- **`required` 必须 ⊆ 该配装的 `subs`**：生成端与运行端口径统一，写在 `data.js` 里的每一条
  `required` 都必然能在运行时可标记为 ★必选（历史 bug：旧实现额外做了「required 必须落在
  = 首位核心块内」的**收紧**，把 role 注入的必需项大量清成空数组，造成 122 处死字段）；
- **条件词条 `optional`**：wiki 原文带括号前提的词条（如「暴击率（携带西风剑时）」）由解析层
  单独传入，不计入 `required`/`equal`，只写进 `subRules.optional` 随配装展示；
- 预览报告会统计自动生成的规则组数量与「含条件词条（`subRules.optional`）的规则」组数；
- 写回后运行 `node tools/check_data.js` 和 `node build.js`。

## 套装效果抓取（fetch_set_effects.py）

`fetch_set_effects.py` 从观测枢 wiki 的「基础信息」模块读取结构化的 2 件套 / 4 件套效果：

```bash
python tools/fetch_set_effects.py
python tools/fetch_set_effects.py --apply
python tools/fetch_set_effects.py --probe "冰风迷途的勇士"
```

- `bonus` 保存 2 件套效果，`bonus4` 保存 4 件套效果；两者都是 `SETS` 的内置数据字段。
- 抓取结果保留 `bonus4_raw` 原文，同时用 `simplify_four()` 去掉纯上限 / 冷却 / 失效条款，生成较短的 `bonus4`；需要按语义重排的套装维护在脚本的 `FOUR_SIMPLIFICATIONS` 特例表中，避免后续抓取覆盖人工校准文案。
- `--apply` 只改写 `SETS` 对象中的 `bonus4`，不会改角色配装或来源链接；写回按单个套装行处理，避免长文本触发正则内存问题。
- 套装英文名可能使用单引号或双引号，工具两种格式都能读取；新增字段后要保留这个兼容性。
- 当前内置套装应达到 46 套，抓取输出应显示 `46/46` 成功；写回后运行 `node build.js`。

## 数据源

| 用途 | 接口 | 必需请求头 |
|---|---|---|
| 角色搜索 | `act-api-takumi-static.mihoyo.com/hoyowiki/genshin/wapi/search` | `x-rpc-wiki_app: ys_strategy` + `Referer: baike.mihoyo.com` |
| 角色词条 | 同上 `/hoyowiki/genshin/wapi/entry_page?entry_page_id=` | 同上 |
| 攻略搜索 | `bbs-api.mihoyo.com/post/wapi/searchPosts` | `x-rpc-app_version` + `x-rpc-client_type: 5` |
| 攻略详情 | `bbs-api.mihoyo.com/post/wapi/getPostFull?post_id=` | 同上 |

都不需要签名。基址取自 wiki 前端的 Nuxt chunk
（`/ys/strategy/_nuxt/77d1a9550af481a2b254.js` 里的 `editorApi`）；
blackboard 那套 `common/blackboard/ys_strategy` 已失效。

## 选稿规则（fetch_guides.py）

1. 作者白名单优先 —— 见脚本里的 `AUTHORS`（按 uid 匹配，比昵称可靠）。当前为 Asgater / HoYo青枫 / 幕陵 / 风伤幽冥 / 猫冬 / Sattle，对所有角色**统一**适用同一套选取逻辑。早期只有前两位时，水/火旅行者拉不到白名单稿、只能走热度回退（与冰不一致），已把覆盖水/火的作者并入同一白名单修正。
2. 尽量每位作者各一篇，视角不重样
3. 专帖（标题用「」或【】单独引出该角色）优先于多角色合集；合集帖直接不收
4. 同档内**较新优先**（配装随版本变），热度（`view + bookmark×20 + like×2`）作为次要参考
5. 白名单凑不满 2 篇才回退到观测枢词条「攻略推荐」挂的文章

换作者直接改 `AUTHORS` 字典即可（对所有角色统一生效，无需按角色特判）；uid 用
`bbs-api.mihoyo.com/user/wapi/searchUser?keyword=<昵称>` 查。

## 缓存

`out/cache/`（wiki 原始响应）与 `out/guides_cache/`（米游社响应）都已 gitignore，
删掉会重新联网；不删则所有脚本都能离线重跑。

## 回写格式的坑

`apply_wiki_builds.py` 重建条目时，`items[1]/src/note` 都带着原文前导空格，
用 `", "` 拼接会各多出 1 个空格 → 全表 diff。代码里已用「记住原 pad 再还原」处理，
`--apply` 后 `git diff src/data.js` 应**只有真正变了的字段**。
