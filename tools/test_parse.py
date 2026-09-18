#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""tools/test_parse.py —— 配装解析回归测试（离线，不联网）

守住 2026-09 那次修复的四类问题，防止日后改别名表 / 改分词逻辑时回归：

  A. 别名覆盖：`精通`→em、`暴击`→cr、`生命加成`→hpP（历史上漏掉 → 7 处副词条静默丢失）
  B. 分词规则：`/`、空格、`或者`、括号条件说明
  C. 条件词条：`（仅西风猎弓）`、`（六命可选防御力）` 要单独成 conditional，不并进常规推荐，
     且说明里另写属性名时取「说明里那个」（攻击力（六命可选防御力）→ 常规 atkP + 条件 defP）
  D. 产物级断言：out/wiki_builds.json 无未识别片段 / 无空定位，
     src/data.js 无 required 死字段、roles 不为空

用法: python tools/test_parse.py
"""
import json
import os
import re
import subprocess
import sys

TOOLS = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(TOOLS)
OUT = os.path.join(TOOLS, "out")
sys.path.insert(0, TOOLS)

import fetch_wiki_builds as F   # noqa: E402

PASS, FAIL = [], []


def check(title, cond, detail=""):
    (PASS if cond else FAIL).append(title + (("  " + detail) if detail else ""))
    print(("  [PASS] " if cond else "  [FAIL] ") + title + (("  " + detail) if detail else ""))


def fields(text):
    return F.parse_fields(text)


# ---------- A. 别名覆盖 ----------
print("A. 别名覆盖（STAT_ALIAS / TOKEN_ALIAS）")
# STAT_ALIAS：会在长句上做正则扫描，只能收不会歧义的全称
for word, want in [("元素精通", "em"), ("暴击率", "cr"), ("暴击伤害", "cd"),
                   ("生命值", "hpP"), ("元素充能效率", "er"), ("防御力", "defP")]:
    check("STAT_ALIAS %s -> %s" % (word, want), F.STAT_ALIAS.get(word) == want,
          "实际 %r" % F.STAT_ALIAS.get(word))
# TOKEN_ALIAS：只在「冒号后面的词条列表」这种已切分好的短语上生效，
# 所以可以收「精通」这类在长句里会误判的简写（历史上漏收 → 7 处副词条静默丢失）
for word, want in [("精通", "em"), ("暴击", "cr"), ("生命加成", "hpP")]:
    check("TOKEN_ALIAS %s -> %s" % (word, want), F.TOKEN_ALIAS.get(word) == want,
          "实际 %r" % F.TOKEN_ALIAS.get(word))
    check("简写 %s 不进 STAT_ALIAS（防长句误判）" % word, word not in F.STAT_ALIAS)

# ---------- B. 分词规则 ----------
print("B. 分词规则")
_, subs, _, unk = fields("副词条：生命值/元素充能效率/精通")
check("斜杠分隔 + 精通", subs == ["hpP", "er", "em"], "subs=%s" % subs)

_, subs, _, unk = fields("副词条：暴击/暴击伤害/元素充能效率/防御力")
check("暴击 -> cr", subs == ["cr", "cd", "er", "defP"], "subs=%s" % subs)

_, subs, _, unk = fields("副词条：元素精通/元素充能效率/生命加成/攻击力")
check("生命加成 -> hpP", subs == ["em", "er", "hpP", "atkP"], "subs=%s" % subs)

_, subs, _, unk = fields("副词条：暴击伤害 暴击率 攻击力 元素精通")
check("空格分隔", subs == ["cd", "cr", "atkP", "em"], "subs=%s" % subs)

mains, _, _, unk = fields("时之沙：元素充能效率或者攻击力")
check("「或者」分隔", mains.get("sands") == ["er", "atkP"], "sands=%s" % mains.get("sands"))

_, _, _, unk = fields("副词条：充能效率/暴击率/攻击力")
check("简写「充能效率」", unk == [], "unknown=%s" % unk)

# ---------- C. 条件词条 ----------
print("C. 条件词条（括号说明）")
mains, subs, cond, unk = fields("时之沙：攻击力（六命可选防御力）")
check("条件说明另写属性：常规取括号外", mains.get("sands") == ["atkP", "defP"], "sands=%s" % mains.get("sands"))
check("条件说明另写属性：条件取说明内", ("sands", "defP") in [(c["where"], c["stat"]) for c in cond],
      "cond=%s" % [(c["where"], c["stat"]) for c in cond])

mains, subs, cond, unk = fields("理之冠：暴击率（仅西风猎弓）")
check("仅西风猎弓：理之冠仍为 cr", mains.get("circlet") == ["cr"], "circlet=%s" % mains.get("circlet"))
check("仅西风猎弓：记入 conditional", ("circlet", "cr") in [(c["where"], c["stat"]) for c in cond])

mains, subs, cond, unk = fields("副词条：充能效率/暴击率（仅西风猎弓）")
check("条件词条不并入常规副词条", subs == ["er"], "subs=%s" % subs)
check("条件词条进 conditional(subs)",
      ("subs", "cr") in [(c["where"], c["stat"]) for c in cond], "cond=%s" % cond)

mains, subs, cond, unk = fields("副词条：暴击率/暴击伤害/攻击力/元素充能效率/（六命可选防御力）")
check("纯括号条件词条被识别", subs == ["cr", "cd", "atkP", "er"] and ("subs", "defP") in
      [(c["where"], c["stat"]) for c in cond], "subs=%s cond=%s" % (subs, cond))

# ---------- D. 产物级断言 ----------
print("D. 产物级断言")
wb_path = os.path.join(OUT, "wiki_builds.json")
if not os.path.exists(wb_path):
    check("out/wiki_builds.json 存在", False)
else:
    wb = json.load(open(wb_path, encoding="utf-8"))
    warn = os.path.join(OUT, "parse_warnings.json")
    w = json.load(open(warn, encoding="utf-8")) if os.path.exists(warn) else {}
    check("未识别片段为空", not (w.get("unknown") or []), "unknown=%d" % len(w.get("unknown") or []))
    check("快照空定位为空", not (w.get("empty_roles") or []), "empty_roles=%s" % (w.get("empty_roles") or [])[:5])
    check("无数据角色为空", not (w.get("no_rows") or []), "no_rows=%s" % (w.get("no_rows") or [])[:5])

    # 7 处历史丢失词条必须补齐
    lost = [("多莉", 0, "em"), ("多莉", 2, "em"), ("卡齐娜", 0, "cr"), ("卡齐娜", 1, "cr"),
            ("瑶瑶", 0, "hpP"), ("瑶瑶", 1, "hpP"), ("瑶瑶", 2, "hpP")]
    miss = []
    for name, i, sid in lost:
        rows = (wb.get(name) or {}).get("rows") or []
        if i >= len(rows) or sid not in (rows[i].get("subs") or []):
            miss.append("%s#%d:%s" % (name, i, sid))
    check("7 处历史丢失副词条全部补齐", not miss, "仍缺 %s" % miss)

    # 5 组历史空定位必须补齐
    roles5 = [("闲云", 1), ("云堇", 0), ("云堇", 1), ("伊涅芙", 2), ("莉奈娅", 1)]
    empty5 = []
    for name, i in roles5:
        rows = (wb.get(name) or {}).get("rows") or []
        if i >= len(rows) or not (rows[i].get("roles") or []):
            empty5.append("%s#%d" % (name, i))
    check("5 组历史空定位全部补齐", not empty5, "仍空 %s" % empty5)

    cond_n = sum(len(r.get("conditional") or []) for d in wb.values() for r in (d.get("rows") or []))
    check("条件词条已结构化为 conditional", cond_n > 0, "共 %d 条" % cond_n)
    unknown_n = sum(len(r.get("unknown") or []) for d in wb.values() for r in (d.get("rows") or []))
    check("快照内 unknown 条目为空", unknown_n == 0, "unknown=%d" % unknown_n)

# src/data.js 侧：跑 check_data.js，抓统计行
data_js = os.path.join(ROOT, "src", "data.js")
check("src/data.js 存在", os.path.exists(data_js))
if os.path.exists(data_js):
    p = subprocess.run(["node", os.path.join(TOOLS, "check_data.js")], cwd=ROOT,
                       stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    text = p.stdout.decode("utf-8", "replace")
    m = re.search(r"required 死字段[^:]*:\s*(\d+)", text)
    check("src/data.js 无 required 死字段", bool(m) and m.group(1) == "0",
          "got %s" % (m.group(1) if m else "N/A"))
    m = re.search(r"roles（功能定位）为空:\s*(\d+)", text)
    check("src/data.js 无空 roles", bool(m) and m.group(1) == "0",
          "got %s" % (m.group(1) if m else "N/A"))
    m = re.search(r"optional（wiki 条件词条）异常:\s*(\d+)", text)
    check("src/data.js optional 无异常", bool(m) and m.group(1) == "0",
          "got %s" % (m.group(1) if m else "N/A"))

print("\n=== 回归测试结果：通过 %d / 失败 %d ===" % (len(PASS), len(FAIL)))
for f in FAIL:
    print("  ! " + f)
sys.exit(1 if FAIL else 0)
