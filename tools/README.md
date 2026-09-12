# tools/ —— 配装数据抓取与回写工具链

配装数据**只**来自米游社「观测枢」wiki 角色词条里的结构化表格（wiki 编辑手填文本）。
词条里另外挂着的米游社攻略文章几乎全是图片一图流，本工具链**从不读取**，
只在 `out/sources.*` 里作为人工延伸阅读列出。

## 脚本

| 脚本 | 作用 | 输出 |
|---|---|---|
| `fetch_wiki_builds.py` | 抓角色词条的「推荐装备 → 圣遗物推荐」，解析出套装 / 主词条 / 副词条 | `out/wiki_builds.json` |
| `fetch_guides.py` | 按作者白名单 + 热度为每个角色挑攻略链接 | `out/guides.json` |
| `apply_wiki_builds.py` | 把上面两个结果写回 `src/data.js`（配装、主词条、来源链接） | `out/report.md` |
| `gen_sources.py` | 生成人读的来源清单（可点开） | `out/sources.md`、`out/sources.html` |

## 标准流程

```bash
python tools/fetch_wiki_builds.py          # 1. 抓配装（约 3 分钟）
python tools/fetch_guides.py               # 2. 挑攻略链接（约 15 分钟）
python tools/apply_wiki_builds.py          # 3. 先出报告，确认无误再加 --apply
python tools/apply_wiki_builds.py --apply  #    写回 src/data.js（同时更新链接）
python tools/gen_sources.py                # 4. 生成来源清单
node build.js                              # 5. 打包成单文件 index.html
```

`apply_wiki_builds.py` 默认会一并改来源链接；只想改配装就加 `--no-links`。
副词条预设默认不动（wiki 的副词条常是通用模板），确认后加 `--preset` 才改写。

单次调试：`python tools/fetch_wiki_builds.py 胡桃 钟离`（传角色名即只跑这些）。

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

1. 作者白名单优先 —— 见脚本里的 `AUTHORS`，当前是 Asgater / HoYo青枫（按 uid 匹配，比昵称可靠）
2. 尽量每位作者各一篇，视角不重样
3. 专帖（标题用「」或【】单独引出该角色）优先于多角色合集；合集帖直接不收
4. 同档内**较新优先**（配装随版本变），热度（`view + bookmark×20 + like×2`）作为次要参考
5. 白名单凑不满 2 篇才回退到观测枢词条「攻略推荐」挂的文章

换作者改 `AUTHORS` 字典即可；uid 用
`bbs-api.mihoyo.com/user/wapi/searchUser?keyword=<昵称>` 查。

## 缓存

`out/cache/`（wiki 原始响应）与 `out/guides_cache/`（米游社响应）都已 gitignore，
删掉会重新联网；不删则所有脚本都能离线重跑。
