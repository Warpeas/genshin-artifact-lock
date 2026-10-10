# -*- coding: utf-8 -*-
"""
把 subRules.optional 的 note 统一成一套格式，并给现有纯['id'] 的组补 note。

统一格式（2026-10-10 定，两轮收敛后）
------------------------------------
原为「值得堆 / 可作补充」这类描述性长句，偏长、每条都要另想措辞。
现收敛成**极简前缀式**——统一以「需要」收尾，读者一眼看出这是条件而非必堆：

| 类型 | 模板 | 例 |
|---|---|---|
| 武器条件 | `携带<武器>时需要` | 携带西风剑时需要 |
| 玩法 / 队伍 | `<玩法>需要` | 蒸发队需要 |
| 命座条件 | `<命座>后需要` | 六命后需要 |
| 数量 / 门槛 | `需少量…` / `需达到<数值>需要` | 需少量，用于优化大招循环 |
| 纯用途 | `<用途>` | 少量堆，用于优化大招循环 |

**为什么这样定**：note 挂在词条名旁显示（如「◇元素充能效率」+ 悬停理由），
理由只需回答「什么条件下才需要」——不必重复词条名，也不必写「值得堆」这类
评价性措辞。省下的字数让悬停浮窗更短，也更容易一眼扫完。

**武器名保留 wiki 原名**（西风剑 / 西风秘典 / 西风猎弓 / 西风弓 / 西风长枪
是不同武器，不可合并）。

用法
----
    python tools/backfill_optional_notes.py --dry    # 预览
    python tools/backfill_optional_notes.py          # 写入
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "src", "data.js")
WIKI = os.path.join(ROOT, "tools", "out", "wiki_builds.json")

# ---- note 归一表 ----
# 键 = wiki 原文精确值**或已归一过的值**（脚本幂等，重跑不二次改写）；值 = 统一格式。
WIKI_NOTE = {
    # --- 武器条件：统一成「携带<武器>时值得堆」 ---
    "携带西风秘典时": "携带西风秘典时需要",
    "携带西风剑时": "携带西风剑时需要",
    "携带西风弓时": "携带西风弓时需要",
    "搭配西风剑时": "携带西风剑时需要",
    "仅西风猎弓": "携带西风猎弓时需要",
    "西风猎弓": "携带西风猎弓时需要",
    "西风秘典": "携带西风秘典时需要",
    "西风剑推荐": "携带西风剑时需要",
    # --- 命座条件 ---
    "六命可选防御力": "六命后需要",
    # --- 攻略图补的（本轮固化），一并归一 ---
    "堆叠20-30%充能效率可优化大招循环": "需少量，用于优化大招循环",
    "可堆叠20-35%充能优化大招循环": "需少量，用于优化大招循环",
    "少量充能效率，用于优化大招循环": "需少量，用于优化大招循环",
    "仅在携带西风长枪时可堆暴击率": "携带西风长枪时需要",
    "仅在蒸发队玩法下值得堆元素精通": "蒸发队需要",
    # --- 幂等键：上一轮归一过的值，重跑时不再二次改写 ---
    "携带西风长枪时值得堆": "携带西风长枪时需要",
    "携带西风剑时值得堆": "携带西风剑时需要",
    "携带西风秘典时值得堆": "携带西风秘典时需要",
    "携带西风猎弓时值得堆": "携带西风猎弓时需要",
    "携带西风弓时值得堆": "携带西风弓时需要",
    "蒸发队值得堆": "蒸发队需要",
    "可少量堆，用于优化大招循环": "需少量，用于优化大招循环",
    "六命解锁后防御力可作补充": "六命后需要",
}

# 允许的措辞白名单：格式校验用（防止后续又写回自由格式）
PATTERNS = [
    r"^携带.+时需要$",        # 武器条件
    r"^六命后需要$",                # 命座条件
    r"^蒸发队需要$",                # 玩法 / 队伍条件
    r"^需少量，.+$",                 # 数量 + 用途
    r"^需达到.+需要$",              # 门槛型（预留）
]


def q(s):
    return "'" + str(s).replace("\\", "\\\\").replace("'", "\\'") + "'"


def norm(raw):
    """wiki 原文 → 统一格式；未登记的原样返回并标needs_review。"""
    return WIKI_NOTE.get(raw.strip(), raw.strip())


def build_wiki_note_index():
    """(角色, 词条) -> wiki 原文 list。"""
    w = json.load(open(WIKI, encoding="utf-8"))
    idx = {}
    for name, e in w.items():
        for r in e.get("rows") or []:
            for c in r.get("conditional") or []:
                if c.get("where") == "subs" and c.get("stat") and c.get("note"):
                    idx.setdefault((name, c["stat"]), set()).add(c["note"])
    return idx


def find_char(lines, line_no):
    for k in range(line_no, max(0, line_no - 80), -1):
        m = re.match(r"\s*\['([^']+)',\s*'(?:pyro|hydro|cryo|electro|anemo|geo|dendro)'",
                     lines[k - 1])
        if m:
            return m.group(1)
    return "?"


OPT_BLOCK = re.compile(r"optional:\[((?:[^\[\]]|\[[^\]]*\])*)\]")


def parse_optional(body):
    """-> [(id, note or'')]；支持纯 id 与 [id,note] 两种。"""
    out = []
    inner = body.strip()
    if inner.startswith("["):
        m = re.match(r"\[\s*'([^']*)'\s*(?:,\s*'([^']*)')?\s*\]$", inner)
        if m:
            return [(m.group(1), m.group(2) or "")]
        return []
    for part in re.findall(r"'([^']*)'", inner):
        out.append((part, ""))
    return out


def fmt(pairs):
    if not pairs:
        return "[]"
    if all(not n for _, n in pairs):
        return "[" + ", ".join(q(i) for i, _ in pairs) + "]"
    return "[" + ", ".join("[%s, %s]" % (q(i), q(n)) for i, n in pairs) + "]"


def main():
    dry = "--dry" in sys.argv
    lines = open(DATA, encoding="utf-8").read().split("\n")
    wiki_idx = build_wiki_note_index()

    report, changed, needs_review = [], 0, []
    for i, ln in enumerate(lines):
        if ln.lstrip().startswith("//") or ln.lstrip().startswith("*"):
            continue
        m = OPT_BLOCK.search(ln)
        if not m:
            continue
        who = find_char(lines, i + 1)
        pairs = parse_optional(m.group(1))
        if not pairs:
            continue

        new_pairs, changed_this = [], False
        for stat, note in pairs:
            if note:
                n = norm(note)
            else:
                cands = wiki_idx.get((who, stat)) or set()
                if len(cands) == 1:
                    n = norm(next(iter(cands)))
                elif len(cands) > 1:
                    # 同一角色同一词条有多种原文（措辞不同但语义同）→ 取归一后的众数
                    cnt = {}
                    for c in cands:
                        cnt[norm(c)] = cnt.get(norm(c), 0) + 1
                    n = max(cnt, key=cnt.get)
                else:
                    n = ""
                    needs_review.append((who, stat))
            if n != note:
                changed_this = True
            new_pairs.append((stat, n))

        if not changed_this:
            continue
        newline = ln[:m.start()] + "optional:" + fmt(new_pairs) + ln[m.end():]
        lines[i] = newline
        changed += 1
        report.append("  line %-6d %-9s %s" % (
            i + 1, who,
            " | ".join("%s→%s" % (s, n or "（无依据）") for s, n in new_pairs)))

    print("\n".join(report) or "（无改动）")
    print("\n改动%d 行" % changed)
    if needs_review:
        uniq = sorted(set(needs_review))
        print("⚠️ wiki 无conditional 原文，需人工判断：%s"
              % "、".join("%s/%s" % w for w in uniq))

    # 格式校验（跳过文档示例行[['id','note']] 这类占位）
    bad = []
    for i, ln in enumerate(lines):
        m = OPT_BLOCK.search(ln)
        if not m:
            continue
        for stat, note in parse_optional(m.group(1)):
            if not note or stat in ("id", "stat"):
                continue
            if not any(re.match(p, note) for p in PATTERNS):
                bad.append((find_char(lines, i + 1), stat, note))
    if bad:
        print("\n⚠️ 措辞不符合统一格式：")
        for w, s, n in bad:
            print("    %-9s %-6s %r" % (w, s, n))
    else:
        print("措辞校验：全部符合统一格式")

    if dry:
        print("\ndry-run，未写入")
        return
    open(DATA, "w", encoding="utf-8").write("\n".join(lines))
    print("已写入 src/data.js")
    import subprocess
    r = subprocess.run(["node", "--check", DATA], capture_output=True, text=True,
                       shell=False)
    print("node --check: %s" % ("OK" if r.returncode == 0 else r.stderr[:300]))


if __name__ == "__main__":
    main()