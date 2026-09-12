# -*- coding: utf-8 -*-
"""
把 tools/out/wiki_builds.json 的解析结果写回 src/data.js 的 RAW_CHARS。

新数据格式（每组配装独立携带 套装 + 主词条 + 副词条 + 功能定位）：
  ['名', '元素', [
     {sets:[...], sands:[...], goblet:[...], circlet:[...], subs:[...], roles:['输出','增伤']},
     ...
   ], [['url','观测枢词条'], ['url','作者'], ...], 'note'],

- 副词条（subs）直接来自 wiki「推荐装备」表，不再走粗预设桶 SUB_PRESETS。
- 来源链接：第 1 条固定观测枢词条（真数据源），后面挂筛选过的攻略文章。
- 保留全部去重后的五星配装（不再截断为前 3）。

用法：
  python tools/apply_wiki_builds.py            # 仅预览，不改文件
  python tools/apply_wiki_builds.py --apply    # 写回 src/data.js
  python tools/apply_wiki_builds.py --no-links # 不更新来源链接
"""
import io
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from role_infer import infer_roles  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "src", "data.js")
OUT = os.path.join(ROOT, "tools", "out")


def find_matching(s, start):
    """给定 s[start] in '(['，返回配对的闭合下标"""
    open_ch = s[start]
    close_ch = "]" if open_ch == "[" else ")"
    depth, i, n = 0, start, len(s)
    instr = None
    while i < n:
        c = s[i]
        if instr:
            if c == "\\":
                i += 2
                continue
            if c == instr:
                instr = None
        elif c in "'\"`":
            instr = c
        elif c == open_ch:
            depth += 1
        elif c == close_ch:
            depth -= 1
            if depth == 0:
                return i
        i += 1
    return -1


def split_top(s):
    """按顶层逗号切分，返回 (items, spans)。span 为 (start, end) 便于原地替换"""
    items, spans, depth, last, i, n = [], [], 0, 0, 0, len(s)
    instr = None
    while i < n:
        c = s[i]
        if instr:
            if c == "\\":
                i += 2
                continue
            if c == instr:
                instr = None
        elif c in "'\"`":
            instr = c
        elif c in "([":
            depth += 1
        elif c in ")]":
            depth -= 1
        elif c == "," and depth == 0:
            items.append(s[last:i])
            spans.append((last, i))
            last = i + 1
        i += 1
    items.append(s[last:])
    spans.append((last, n))
    return items, spans


def _net_depth(s):
    """统计字符串里未配平的 [] 净深度（尊重引号；忽略 () 与 {}）"""
    depth = 0
    instr = None
    for c in s:
        if instr:
            if c == "\\":
                continue
            if c == instr:
                instr = None
        elif c in "'\"`":
            instr = c
        elif c == "[":
            depth += 1
        elif c == "]":
            depth -= 1
    return depth


def parse_entry_line(lines, start):
    """解析 RAW_CHARS 的一条目（可能跨多行）。
    返回 (indent, body, items, spans, tail, end_idx) 或 None；end_idx 为条目结束行下标。"""
    line = lines[start]
    m = re.match(r"^(\s*)(\[)", line)
    if not m:
        return None
    # 跨行拼到 ] 配平为止
    buf = [line]
    depth = _net_depth(line[m.start(2):])
    i = start
    while depth > 0 and i + 1 < len(lines):
        i += 1
        buf.append(lines[i])
        depth += _net_depth(lines[i])
    if depth != 0:
        return None
    full = "\n".join(buf)
    at = m.end(2) - 1
    end = find_matching(full, at)
    if end < 0:
        return None
    body = full[at + 1:end]
    tail = full[end + 1:]            # 形如 ",\n" 或 ", // 注释\n"
    items, spans = split_top(body)
    if len(items) < 5:
        return None
    base = at + 1
    spans = [(a + base, b + base) for a, b in spans]
    return m.group(1), body, items, spans, tail, i


def q(x):
    return "'%s'" % x


def fmt_src(rows):
    """rows = [(url, title), ...] —— data.js 的 src 支持 [url, title] 二元组"""
    return "[" + ", ".join("['%s', '%s']" % (u, t) for u, t in rows) + "]"


def build_src_rows(g):
    """按「观测枢词条 → 攻略文章」顺序拼出来源列表"""
    rows = []
    if g.get("wiki_url"):
        rows.append((g["wiki_url"], "观测枢词条"))
    for r in g.get("guides", []):
        if not r.get("url"):
            continue
        # 标题只放作者名：卡片上来源位窄，作者比长标题更好认
        rows.append((r["url"], r.get("author") or "米游社"))
    return rows


def fmt_build(b):
    parts = [
        "sets:[" + ", ".join(q(s) for s in (b.get("sets") or [])) + "]",
        "sands:[" + ", ".join(q(s) for s in ((b.get("mains") or {}).get("sands") or [])) + "]",
        "goblet:[" + ", ".join(q(s) for s in ((b.get("mains") or {}).get("goblet") or [])) + "]",
        "circlet:[" + ", ".join(q(s) for s in ((b.get("mains") or {}).get("circlet") or [])) + "]",
        "subs:[" + ", ".join(q(s) for s in (b.get("subs") or [])) + "]",
    ]
    # 功能定位：优先用 wiki 已推断的 roles；没有就当场按推荐理由文本推断（best-effort）
    roles = b.get("roles")
    if not roles:
        roles = infer_roles(b.get("reason", ""), b.get("mains", {}), b.get("subs", []), b.get("label", ""))
    parts.append("roles:[" + ", ".join(q(s) for s in roles) + "]")
    return "{" + ", ".join(parts) + "}"


def fmt_builds_block(rows):
    if not rows:
        return "[]"
    return "[\n" + "\n".join("    %s," % fmt_build(r) for r in rows) + "\n  ]"


def main():
    apply_ = "--apply" in sys.argv
    use_links = "--no-links" not in sys.argv
    wiki = json.load(open(os.path.join(OUT, "wiki_builds.json"), encoding="utf-8"))
    gp = os.path.join(OUT, "guides.json")
    guides = json.load(open(gp, encoding="utf-8")) if (use_links and os.path.exists(gp)) else {}
    if use_links and not guides:
        print("! 没读到 tools/out/guides.json，跳过链接更新（先跑 python tools/fetch_guides.py）")
    src = open(DATA, encoding="utf-8").read()
    lines = src.split("\n")

    i0 = next(i for i, l in enumerate(lines) if l.startswith("const RAW_CHARS"))
    i1 = next(i for i, l in enumerate(lines) if "展开为完整结构" in l)

    out = lines[:i0 + 1]            # 含 "const RAW_CHARS = ["
    i = i0 + 1
    report = []
    n_write, n_skip, n_src, n_note = 0, 0, 0, 0

    while i < i1:
        p = parse_entry_line(lines, i)
        if not p:
            out.append(lines[i]); i += 1; continue
        indent, body, items, spans, tail, end_idx = p
        name = items[0].strip().strip("'\"")
        # 旧格式 9 项（subPreset + 套装 + 主词条*3 + 来源 + 备注），新格式 5 项
        if len(items) >= 9:
            old_src, old_note = items[7], items[8]
        else:
            old_src, old_note = items[3], items[4]

        w = wiki.get(name)
        if not w or not w.get("ok"):
            n_skip += 1
            report.append("### %s —— 跳过（wiki 无数据）" % name)
            out.extend(lines[i:end_idx + 1]); i = end_idx + 1; continue

        # 取全部去重后的配装组；丢弃完全空的残行（无主词条也无副词条）
        rows = [r for r in w.get("rows", []) if r.get("sets")]
        rows = [r for r in rows if
                ((r.get("mains") or {}).get("sands") or
                 (r.get("mains") or {}).get("goblet") or
                 (r.get("mains") or {}).get("circlet") or
                 r.get("subs"))]
        if not rows:
            n_skip += 1
            report.append("### %s —— 跳过（无有效配装）" % name)
            out.extend(lines[i:end_idx + 1]); i = end_idx + 1; continue

        builds_block = fmt_builds_block(rows)

        # 来源链接：默认更新（wiki + 攻略）
        src_text = old_src
        g = guides.get(name)
        if g:
            rows_src = build_src_rows(g)
            if rows_src:
                new_src = fmt_src(rows_src)
                if re.sub(r"\s", "", new_src) != re.sub(r"\s", "", old_src):
                    src_text = new_src
                    n_src += 1

        # 备注：有数据后清掉「暂无专属攻略来源」；数组形式的脏备注（早期格式错配进来的词条列表）归零
        note_text = old_note
        if note_text.strip().startswith("["):
            note_text = "''"
            n_note += 1
        elif "暂无专属攻略来源" in note_text:
            note_text = "''"
            n_note += 1

        new_inner = items[0] + ", " + items[1] + ", " + builds_block + ", " + src_text + ", " + note_text
        new_entry = indent + "[" + new_inner + "]" + tail
        out.extend(new_entry.split("\n"))
        i = end_idx + 1
        n_write += 1
        report.append("### %s —— 写入 %d 组配装（%s）" % (
            name, len(rows),
            " / ".join(("·".join(infer_roles(r.get("reason", ""), r.get("mains", {}), r.get("subs", []), r.get("label", "")) or []) or "—") for r in rows)))

    out.extend(lines[i1:])          # 收尾的 ]; 与「展开为完整结构」注释等

    if apply_:
        open(DATA, "w", encoding="utf-8", newline="\n").write("\n".join(out))
        print("已写回 src/data.js")
    else:
        print("（未加 --apply，仅预览；加 --apply 写回）")

    os.makedirs(OUT, exist_ok=True)
    with io.open(os.path.join(OUT, "report.md"), "w", encoding="utf-8") as f:
        f.write("# 观测枢 wiki 配装同步报告（新格式：每组独立 套装+主词条+副词条+功能定位）\n\n")
        f.write("- 写入配装角色：**%d** 条\n- 来源链接更新：**%d** 条\n"
                "- 清除「暂无专属攻略来源」备注：**%d** 条\n- 跳过：**%d** 条\n\n"
                % (n_write, n_src, n_note, n_skip))
        f.write("## 逐角色明细\n\n")
        f.write("\n".join(report))
    print("写入 %d / 来源 %d / 清备注 %d / 跳过 %d" % (n_write, n_src, n_note, n_skip))


if __name__ == "__main__":
    main()
