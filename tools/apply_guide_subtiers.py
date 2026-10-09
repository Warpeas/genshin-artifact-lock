# -*- coding: utf-8 -*-
"""
把攻略图读出的「低优 / 条件副词条」固化进 src/data.js 的 subRules.optional。

数据来源
--------
`tools/out/guide_subtiers/main_c/_read_result_*.json` —— 从 Asgater / HoYo青枫
攻略图的圣遗物页读出的原文（2026-10-09，43 个主C 批次）。

运行端已支持两种写法（见 src/data.js `subIdsToSubs`）：
  -旧 `['cr']`                 纯字符串
  - 新 `[['cr','携带西风秘典时']]`   [stat, note]，note 是「为什么是条件词条」的理由
本脚本统一写**新格式**，并保证 note 落在原文的限定语上。

两种语义（都写成 optional，note 区分）
------------------------------------
A. **图外词条**：攻略图建议的词条 wiki 常规 subs 里没有（如「可堆 20-30% 充能」，
   而 wiki subs 只有cd/cr/atkP）。`subIdsToSubs` 会把它补到末尾标 opt。
B. **给已有词条加条件**：词条已在 wiki subs 里，但攻略图明确它有前提
   （如「暴击率（西风长枪）」）。同样标 opt，note 写清前提。

只处理**wiki 给了 subs 的配装组**：像阿蕾奇诺「战狂+武人」、宵宫「武人」这类
wiki subs 为空的兜底行，词条本身来自 wiki 之外，攻略图的补充在那一行没有 wiki 依据，
硬加会变成「凭空多一条词条」—— 一律跳过。

用法
----
    python tools/apply_guide_subtiers.py            # 写入 src/data.js
    python tools/apply_guide_subtiers.py --dry      # 只打印将写入的内容
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "src", "data.js")
MC = os.path.join(ROOT, "tools", "out", "guide_subtiers", "main_c")
WIKI = os.path.join(ROOT, "tools", "out", "wiki_builds.json")

# 固化清单：每条 = (角色, 词条, note, 语义标签)
# note 全部取攻略图原文的限定语，不做改写。
PLAN = [
    # --- A. 图外词条：wiki subs 里没有，攻略图说「可少量堆 / 可优化循环」 ---
    ("基尼奇", "er", "堆叠20-30%充能效率可优化大招循环"),
    ("瓦雷莎", "er", "少量充能效率，用于优化大招循环"),
    ("阿蕾奇诺", "er", "可堆叠20-35%充能优化大招循环"),

    # --- B. 给已有词条加条件：词条已在 subs 里，但有前提 ---
    ("叶洛亚", "cr", "仅在携带西风长枪时可堆暴击率"),
    ("卡维", "cr", "仅在携带西风长枪时可堆暴击率"),
    ("宵宫", "em", "仅在蒸发队玩法下值得堆元素精通"),
]


def q(s):
    """data.js 里用的单引号字符串字面量。"""
    return "'" + str(s).replace("\\", "\\\\").replace("'", "\\'") + "'"


def fmt_optional(pairs):
    """[[id,note], ...] -> [['id','note'], ...] 的 data.js 字面量。"""
    return "[" + ", ".join("[" + q(i) + ", " + q(n) + "]" for i, n in pairs) + "]"


def locate_char_blocks(lines, name):
    """返回该角色配装块内每条 build 行的 (start, end) 下标区间。

    以`  ['名字',  '元素', [` 开头，到配装数组结束的 `  ],`（或 `  ],   `）为止。
    """
    head = None
    pat = re.compile(r"^\s*\['" + re.escape(name) + r"',\s*'")
    for i, ln in enumerate(lines):
        if pat.match(ln) and i + 1 < len(lines) and ln.rstrip().endswith(("[", ",")):
            # 确认下一行是 build 对象（以 {sets: 开头）
            if "{sets:" in lines[i + 1]:
                head = i
                break
    if head is None:
        return None
    end = None
    for j in range(head + 1, len(lines)):
        s = lines[j].lstrip()
        if s.startswith("],")or s.startswith("],"):
            end = j
            break
    if end is None:
        return None
    return head, end


def parse_pairs(body):
    """从 `optional:[...]` 字面量里取出 [(id, note), ...]。"""
    out = []
    inner = body[1:-1]
    depth, cur = 0, ""
    parts = []
    for ch in inner:
        if ch == "[":
            depth += 1
        elif ch == "]":
            depth -= 1
        if ch == "," and depth == 0:
            parts.append(cur)
            cur = ""
        else:
            cur += ch
    if cur.strip():
        parts.append(cur)
    for p in parts:
        p = p.strip()
        if not p:
            continue
        if p.startswith("["):
            ids = re.findall(r"'([^']*)'", p)
            out.append((ids[0] if ids else "",
                        ids[1] if len(ids) > 1 else ""))
        else:
            m = re.findall(r"'([^']*)'", p)
            if m:
                out.append((m[0], ""))
    return out


def load_skips(by_char):
    """(角色, 第几个build) -> True 表示 wiki subs 为空，该组跳过。

    行号按 RAW_CHARS 里的配装组顺序（0-based），与 wiki_builds.json 的 rows 顺序一致
    —— 两者都由 apply_wiki_builds.py 从同一份快照生成。
    """
    if not os.path.exists(WIKI):
        return {}
    w = json.load(open(WIKI, encoding="utf-8"))
    out = {}
    for name, pairs in by_char.items():
        e = w.get(name) or {}
        rows = e.get("rows") or []
        if not rows:
            out[name] = None      # wiki 没这角色 -> 全部跳过
            continue
        out[name] = [not (r.get("subs") or []) for r in rows]
    return out


def main():
    dry = "--dry" in sys.argv
    src = open(DATA, encoding="utf-8").read()
    lines = src.split("\n")

    by_char = {}
    for name, stat, note in PLAN:
        by_char.setdefault(name, []).append((stat, note))

    skips = load_skips(by_char)

    report, changed = [], 0
    for name, pairs in by_char.items():
        loc = locate_char_blocks(lines, name)
        if not loc:
            report.append("  [skip] %s 未定位到配装块" % name)
            continue
        head, end = loc
        empty = skips.get(name)
        if empty is None:
            report.append("  [skip] %s wiki 无此角色，全部跳过" % name)
            continue
        n_build = 0
        for k in range(head + 1, end):
            ln = lines[k]
            if "{sets:" not in ln:
                continue
            if n_build < len(empty) and empty[n_build]:
                report.append("  [skip] %s build%d: wiki subs 为空，跳过"
                              % (name, n_build + 1))
                n_build += 1
                continue
            n_build += 1
            m = re.search(r"subRules:\{", ln)
            if m:
                # 已有 subRules：就地改 optional
                j = ln.index("{", m.end() - 1)
                depth, e = 0, j
                while e < len(ln):
                    if ln[e] == "{":
                        depth += 1
                    elif ln[e] == "}":
                        depth -= 1
                        if depth == 0:
                            break
                    e += 1
                obj = ln[j:e + 1]
                mo = re.search(r"optional:\[", obj)
                if mo:
                    endb = obj.index("[", mo.end() - 1)
                    d2, k2 = 0, endb
                    while k2 < len(obj):
                        if obj[k2] == "[":
                            d2 += 1
                        elif obj[k2] == "]":
                            d2 -= 1
                            if d2 == 0:
                                break
                        k2 += 1
                    cur = parse_pairs(obj[endb:k2 + 1])
                else:
                    cur = []
                    # 插到 source: 之前
                merged = list(cur)
                added = []
                for st, nt in pairs:
                    hit = next((p for p in merged if p[0] == st), None)
                    if hit is None:
                        merged.append((st, nt))
                        added.append(st)
                    elif not hit[1]:
                        merged[merged.index(hit)] = (st, nt)
                        added.append(st + "(补note)")
                newobj = fmt_optional(merged)
                if mo:
                    obj2 = obj[:endb] + newobj + obj[k2 + 1:]
                    ln2 = ln[:j] + obj2 + ln[e + 1:]
                else:
                    ms = re.search(r"source:", obj)
                    if ms:
                        obj2 = obj[:ms.start()] + "optional:" + newobj + ", " \
                               + obj[ms.start():]
                    else:
                        obj2 = obj[:-1].rstrip().rstrip(",") \
                               + ", optional:" + newobj + "}"
                    ln2 = ln[:j] + obj2 + ln[e + 1:]
                if ln2 != ln:
                    lines[k] = ln2
                    changed += 1
                    report.append("  [ok] %s build%d: %s" % (name, n_build, added))
            else:
                # 无 subRules：插入一个带 optional 的
                # source 必须用 'manual' —— apply_wiki_builds.py 只保护 source=='manual'
                # 的规则不被重跑覆盖（tools/apply_wiki_builds.py:218），写别的值
                # （如 'heuristic' / 'guide-tiers'）下次 rebuild_data.py 会被重算抹掉。
                ins = "subRules:{required:[], equal:[], optional:" \
                      + fmt_optional(pairs) + ", source:'manual'}, "
                ln2 = ln.replace("subs:", ins + "subs:", 1) if "subs:" in ln \
                    else ln.replace("{sets:", "{sets:", 1)
                if ins not in ln2:
                    ln2 = re.sub(r"(\{sets:\[[^\]]*\],\s*)", r"\1" + ins, ln, count=1)
                lines[k] = ln2
                changed += 1
                report.append("  [new] %s build%d: 新建 subRules + optional %s"
                              % (name, n_build, [p[0] for p in pairs]))

    print("\n".join(report) or "（无改动）")
    print("\n共 %d 处改动" % changed)
    if dry:
        print("dry-run，未写入")
        return
    if not changed:
        print("无改动，未写入")
        return
    out = "\n".join(lines)
    with open(DATA, "w", encoding="utf-8") as f:
        f.write(out)
    print("已写入 src/data.js")
    # 立即校验语法
    import subprocess
    r = subprocess.run(["node", "--check", DATA], capture_output=True, text=True,
                       shell=False)
    print("node --check: %s" % ("OK" if r.returncode == 0 else r.stderr[:400]))
    if r.returncode != 0:
        print("!! 语法错误，请回滚")


if __name__ == "__main__":
    main()