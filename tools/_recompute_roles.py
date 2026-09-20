# -*- coding: utf-8 -*-
"""P1 存量修复（幂等）：用收窄后的 role_infer.infer_roles 重算 data.js 每套配装的
build-level roles，仅就地替换 `roles:[...]` 字段，不动 subRules / optional(optNote)
/ subs（含对象形式 subs），也不动角色级 c.roles（CHAR_META）。

匹配方式：按 (sets, sands, goblet, circlet, subs) 的 id 签名把 data.js 配装行对齐到
wiki_builds.json 的快照行（signature 兼容对象形式 subs 的 id 提取），再用快照里的
推荐理由文本 + mains + subs + label 当场重算 roles。因为收窄规则只「删」不「加」，
重算结果一定是旧 roles 的子集，只会清掉被过度标上的 输出/辅助。

用法：
  python tools/_recompute_roles.py            # 写回 src/data.js
"""
import json
import re
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from role_infer import CHAR_ROLES, infer_roles, ROLE_ORDER
from apply_wiki_builds import parse_entry_line

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "src", "data.js")


def q(x):
    return "'%s'" % x


def iter_object_spans(text):
    """返回 text 中顶层对象 {…} 的 (start, end) 下标（忽略嵌套对象）。"""
    spans, depth, start, quote, escape = [], 0, None, None, False
    for i, c in enumerate(text):
        if quote:
            if escape:
                escape = False
            elif c == "\\":
                escape = True
            elif c == quote:
                quote = None
            continue
        if c in "'\"`":
            quote = c
        elif c == "{":
            if depth == 0:
                start = i
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0 and start is not None:
                spans.append((start, i))
                start = None
    return spans


def extract_ids(field_text):
    if field_text is None:
        return ()
    ids = re.findall(r"id:'([^']+)'", field_text)
    if not ids:
        ids = re.findall(r"'([^']+)'", field_text)
    return tuple(ids)


def field_block(text, field):
    m = re.search(r"\b%s\s*:\s*\[([^\]]*)\]" % re.escape(field), text, re.S)
    return m.group(1) if m else None


def sig(block):
    return tuple(extract_ids(field_block(block, f))
                for f in ("sets", "sands", "goblet", "circlet", "subs"))


def build_index(wiki):
    idx = {}
    for name, w in wiki.items():
        if not w.get("ok"):
            continue
        for row in w.get("rows", []):
            if not row.get("sets"):
                continue
            mains = row.get("mains") or {}
            key = tuple(tuple(x or []) for x in (
                row.get("sets") or [],
                mains.get("sands") or [],
                mains.get("goblet") or [],
                mains.get("circlet") or [],
                row.get("subs") or [],
            ))
            idx.setdefault(name, {}).setdefault(key, []).append(row)
    return idx


def main():
    wiki_path = os.path.join(ROOT, "tools", "out", "wiki_builds.json")
    wiki = json.load(open(wiki_path, encoding="utf-8"))
    idx = build_index(wiki)

    src = open(DATA, encoding="utf-8", newline="").read()  # newline="" 保留原换行符（CRLF/LF）
    lines = src.split("\n")
    i0 = next(i for i, l in enumerate(lines) if l.startswith("const RAW_CHARS"))
    i1 = next(i for i, l in enumerate(lines) if "展开为完整结构" in l)

    out = lines[:i0 + 1]  # 含 "const RAW_CHARS = [" 及之前全部头部（license/APP_VERSION/CHANGELOG…）
    n_changed = 0
    n_matched = 0
    n_unmatched = 0
    unmatched = {}
    examples = []

    i = i0 + 1
    while i < i1:
        p = parse_entry_line(lines, i)
        if not p:
            out.append(lines[i])
            i += 1
            continue
        end_idx = p[5]
        buf = "\n".join(lines[i:end_idx + 1])
        nm = re.search(r"\[\s*'([^']+)'", buf)
        name = nm.group(1) if nm else ""
        rows_by_sig = idx.get(name, {})

        spans = iter_object_spans(buf)
        replacements = []
        for (s, e) in spans:
            block = buf[s:e + 1]
            matched = rows_by_sig.get(sig(block))
            if not matched:
                n_unmatched += 1
                unmatched[name] = unmatched.get(name, 0) + 1
                continue
            n_matched += 1
            role_set = set()
            for r in matched:
                role_set |= set(infer_roles(
                    r.get("reason", "") or "", r.get("mains", {}) or {},
                    r.get("subs", []) or [], r.get("label", "") or "",
                    CHAR_ROLES.get(name)))
            new_roles = sorted(role_set, key=lambda x: ROLE_ORDER.get(x, 99))
            old = re.search(r"roles\s*:\s*\[([^\]]*)\]", block)
            old_roles = re.findall(r"'([^']+)'", old.group(1)) if old else []
            new_block = re.sub(
                r"roles\s*:\s*\[[^\]]*\]",
                "roles:[" + ", ".join(q(x) for x in new_roles) + "]",
                block, count=1)
            if new_block != block:
                replacements.append((s, e, new_block))
                if len(examples) < 25:
                    examples.append((name, old_roles, new_roles))
        for (s, e, nb) in sorted(replacements, key=lambda t: -t[0]):
            buf = buf[:s] + nb + buf[e + 1:]
        if replacements:
            n_changed += len(replacements)
        out.extend(buf.split("\n"))
        i = end_idx + 1

    out.extend(lines[i1:])

    new_text = "\n".join(out)
    # ---- 安全校验（防再次把头部写飞）----
    def count_entries(t):
        return sum(1 for ln in t.split("\n")
                   if re.match(r"^\s*\['[^\']+',\s*'[a-z]+',\s*\[", ln))
    if "const RAW_CHARS" not in new_text or "展开为完整结构" not in new_text:
        print("! 结构标记缺失，中止写回（防损坏）")
        sys.exit(1)
    if count_entries(new_text) != count_entries(src):
        print("! 角色条目数与原文不一致（%d vs %d），中止写回"
              % (count_entries(new_text), count_entries(src)))
        sys.exit(1)

    tmp = DATA + ".new"
    open(tmp, "w", encoding="utf-8", newline="").write(new_text)  # 同保留原换行符
    os.replace(tmp, DATA)  # 原子替换，避免半截文件

    print("roles 改写 %d 处；命中 %d；未命中 %d" % (n_changed, n_matched, n_unmatched))
    if examples:
        print("\n示例（角色 / 旧 roles / 新 roles）：")
        for nm, o, nw in examples:
            print("  %s: %s -> %s" % (nm, o, nw))
    if unmatched:
        print("\n未命中签名的配装（roles 保持不变）：")
        for k in sorted(unmatched):
            print("  %s: %d" % (k, unmatched[k]))


if __name__ == "__main__":
    main()
