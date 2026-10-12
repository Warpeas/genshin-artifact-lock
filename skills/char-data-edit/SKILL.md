---
name: char-data-edit
description: genshin-artifact-lock 内置角色数据（src/data.js 的 RAW_CHARS）单条/少量手改的标准流程。调整角色配装套装、主要属性优先级、追加属性 subs 的顺序或数量、★必需 / ＝同等优先 / ◇条件词条（subRules），或为数据改动发版（APP_VERSION / CHANGELOG）时使用。给出「改哪个字段、什么时候必须标 source:'manual'、怎么验证」的判定表与一键门禁命令。触发词：改角色数据、RAW_CHARS、data.js、配装、套装、追加属性、词条、subRules、人工校准、更新日志、CHANGELOG、发版、genshin。
---

# 角色数据修改（genshin-artifact-lock）

单条 / 少量手改 `src/data.js` 里 `RAW_CHARS` 的**角色配装数据**。
批量重建走 `tools/rebuild_data.py`，不适用本 skill。

**先确认工作目录是本仓库**（`ls src/data.js docs/角色数据修改手册.md` 两个都命中）。

---

## 1. 三条不变式（先记住）

1. **第 0 组是主推**，其余备选。角色卡片展示的永远是第 0 组。
2. **`subs` 的数组顺序就是展示顺序**，是唯一顺序来源。想让 cd 排到 cr 前面，只能挪数组。
3. **人工判断出来的语义必须 `source:'manual'`**——这是能不能活过下次重建的唯一保险丝。

## 2. 改哪一个字段

| 诉求 | 改哪里 | 标 manual？ |
|---|---|---|
| 调整追加属性先后顺序 | `subs` 数组顺序 | ❗是 |
| 新增 / 删除追加属性 | `subs` 数组 | ❗是 |
| 标「两条同等优先」 | `subRules.equal: [[a,b]]` | 视来源，见 §3 |
| 标「★必需」 | `subRules.required: [...]` | 视来源 |
| 标「◇条件需要 + 理由」 | `subRules.optional: [[id,'理由']]` | ❗永远 |
| 主词条（沙/杯/冠）顺序 | `sands` / `goblet` / `circlet` | 不需要 |
| 换套装 | `sets` | 不需要 |
| 改「配装功能定位」 | **别改 `roles`** | 已改为由套装 2/4 件套效果**实时派生**，在「圣遗物套装管理」维护 |

⚠️ **只改 `subs` 不够**：要「cd 严格优先于 cr」而原来有 `equal: [['cr','cd']]` 时，
**必须同时删掉这一对 `equal`**。否则只是展示顺序变了，权重语义仍是「同权」，方案页与合并逻辑不跟着变。

## 3. 什么时候必须 `source:'manual'`（硬判据）

`tools/apply_wiki_builds.py` 的 `existing_subrules()` **只保护 `source=='manual'` 的组**；
heuristic 组在下次重建时会被重算规则**整个覆盖，且不报错**。

满足任一条件就写 `manual`：
1. 词条 / 顺序来自攻略图或人工判断，观测枢 wiki 结构化表格里没有；
2. 顺序是人工校准的（不是 wiki 原始顺序）；
3. 带 `optional` 理由（丢了无法复原）；
4. 任何你不想被下次重建抹平的东西。

`heuristic` 只留给：由定位自动推导、丢了能重算的规则。

## 4. `subRules` 语义速查

```js
subRules: {
  required: ['cr'],                               // ★ 必需，取并集后置池首（上限 4），权重 ×1.25
  equal:    [['cr','cd']],                        // ＝ 与上一条同权，不衰减
  optional: [['er','需少量，用于优化大招循环']],    // ◇ 条件需要，不进自动合并集合
  source:   'manual',                             // manual 人工 / heuristic 可重算
}
```

理由统一「需要」式短句：`携带<武器>时需要` / `<玩法>需要` / `<命座>后需要` / `需少量，<用途>`。

## 5. 版本号必须手改

`build.js` **只校验、不改写**：版本号不等 → 抛错；日期与 HEAD 不符 → 只 `console.warn`。
所以每次发布都要**手改** `APP_VERSION` 与 `CHANGELOG[0].v/date`：
新的一天填 `YYYY.MM.DD`；同日第二次发布起手填 `.2` / `.3`；新条目放数组**最前**；
`APP_VERSION` 与 `CHANGELOG[0].v` 必须字符串相等，否则更新公告不弹。
`items` 是纯文本会被 `esc`，**里面不能出现 `</script`**。

## 6. 流程

```bash
# 改之前：看清目标组现状
node tools/show_char.js 薇斯纳
node tools/show_char.js --count        # 127 角色 / 492 配装组 / manual 24 / heuristic 315
node tools/show_char.js --manual       # 发版前扫一遍全部人工校准组

# 改 src/data.js（唯一真源）

# 改之后：一键门禁（语法 + 回读 + 数据自检 + 构建 + 产物同步 + 配装条回归 + 工作区干净 + 版本三处一致）
node tools/verify_change.js 薇斯纳 梦见月瑞希
```

`verify_change.js` 全 PASS 才提交；要跑单项时用 `--no-build`（跳过打包，只验数据）。
回读要看全部配装组换 `--set 套装名` / `--sub cr` / `--heuristic`。

## 7. 红线

- **不要直接编辑根目录 `index.html`**——构建产物，下次 build 覆盖。
- **不要跳过 `verify_change.js`**——`git status` 里出现 `??` / `.workbuddy/` / `_` 前缀残留它会直接判 FAIL。
- **不要编造游戏数据**——角色 / 套装 / 配装必须能溯源到观测枢 wiki 或官方公告。
- **不要把攻略文章当数据源解析**——一图流，工具从不读取。

## 8. 提交

```bash
git --git-dir=.git --work-tree=. add src/data.js
git --git-dir=.git --work-tree=. commit -m "fix(data): <谁>的<哪一组>，<从什么改成什么>" -m "- 该组 subRules.source 置 manual；版本升至 YYYY.MM.DD"
git --git-dir=.git --work-tree=. push origin master
```

提交信息要写清「改了谁的哪一组、从什么改成什么」。

---

**完整版**（决策表展开、`optional` 写法、算法语义、已踩过的坑、历史实例）：
`docs/角色数据修改手册.md`。字段格式与枚举取值：`AGENTS.md` §3。