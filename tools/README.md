# tools/ —— 配装数据抓取与回写工具链

配装数据**只**来自米游社「观测枢」wiki 角色词条里的结构化表格（wiki 编辑手填文本）。
词条里另外挂着的米游社攻略文章几乎全是图片一图流，本工具链**从不读取**，
只在 `out/sources.*` 里作为人工延伸阅读列出。

## 脚本

| 脚本 | 作用 | 输出 |
|---|---|---|
| `fetch_wiki_builds.py` | 抓角色词条的「推荐装备 → 圣遗物推荐」，解析出套装 / 主词条 / 副词条 / 功能定位 | `out/wiki_builds.json` |
| `fetch_set_effects.py` | 抓套装「基础信息」中的 2 件套 / 4 件套效果，并把 4 件套效果写回 `src/data.js` | `out/set_effects.json` |
| `fetch_guides.py` | 按作者白名单 + 热度为每个角色挑攻略链接 | `out/guides.json` |
| `apply_wiki_builds.py` | 把上面两个结果写回 `src/data.js`（配装、主词条、副词条、功能定位、来源链接） | `out/report.md` |
| `gen_sources.py` | 生成人读的来源清单（可点开） | `out/sources.md`、`out/sources.html` |
| `role_infer.py` | 提供 `infer_roles(text, mains, subs, label)`，从 wiki 描述前缀推断配装「功能定位」 | —（被上面两个脚本 import，不直接跑） |
| `check_data.js` | 数据自检：主词条空 / 缺字段 / 非法值，配装组完整性 | `out/_scan_result.md` |

## 标准流程

```bash
python tools/fetch_wiki_builds.py          # 1. 抓配装（约 3 分钟）
python tools/fetch_guides.py               # 2. 挑攻略链接（约 15 分钟）
python tools/apply_wiki_builds.py          # 3. 先出报告，确认无误再加 --apply
python tools/apply_wiki_builds.py --apply  #    写回 src/data.js（同时更新链接）
python tools/fetch_set_effects.py         # 4. 抓套装 2 / 4 件套效果（带缓存）
python tools/fetch_set_effects.py --apply  #    确认后写回 src/data.js 的 bonus4
python tools/gen_sources.py                # 5. 生成来源清单
node tools/check_data.js                   # 6. 数据自检
node build.js                              # 7. 打包成单文件 index.html
```

`apply_wiki_builds.py` 默认会一并改来源链接；只想改配装就加 `--no-links`。
脚本只有 `--apply` 和 `--no-links` 两个开关。

## 改了别名表？用 `--reparse` 离线重解析

`fetch_wiki_builds.py` 靠 `STAT_ALIAS` 把 wiki 原文里的中文属性名映射成 id。
wiki 编辑大量使用简写，**简写必须一并收录**，否则会**静默**解析为空或少解析
（不会报错，只会让主词条悄悄少一项）。

```bash
python tools/fetch_wiki_builds.py --reparse --dry   # 预览变更
python tools/fetch_wiki_builds.py --reparse         # 写回 out/wiki_builds.json
python tools/apply_wiki_builds.py --apply
node build.js
```

`--reparse` 直接读 `out/wiki_builds.json` 里已保存的 `rows[].reason` 原文重算，
**不联网**，几秒完成；改别名表后不必重跑 3 分钟的抓取。

## 数据自检

```bash
node tools/check_data.js
```

扫 `src/data.js` 的 `RAW_CHARS`，报出主词条为空 / 字段缺失 / 值不在 `MAIN_STATS` 里的配装组。
结果写 `out/_scan_result.md`。**每次改完数据或升级抓取脚本后跑一次。**

注意：主词条为空**不一定**是 bug——wiki 原文写「空之杯：不强求」时，空就是正确结果
（如欧洛伦辅助向配装）。判断是否真漏，要回看 `wiki_builds.json` 里的 `reason` 原文。

**副词条直接写 wiki「推荐装备」里的精确值**：每组配装独立携带自己的 `subs`，`SUB_PRESETS` 只用于新建配装时的默认值与「套用预设」。

**功能定位 `roles`**：由 `role_infer.py` 从 wiki 描述前缀推断（split("主词条")[0]），基础词表见 `src/data.js` 的 `BUILD_ROLES`。
注意它与角色级「队伍定位」（主C/副C/辅助）是两回事，别混。

单次调试：`python tools/fetch_wiki_builds.py 胡桃 钟离`（传角色名即只跑这些）。

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
