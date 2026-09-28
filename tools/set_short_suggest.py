# -*- coding: utf-8 -*-
"""
套装简称「半自动」工具：缺口检测 + 中英候选生成 + 回测。

背景：src/data.js 里 SET_SHORT（中文全称 -> 中文简称）与 SET_SHORT_EN（官方英文名 -> 英文简称）
是人工维护的表；本脚本只做「发现缺口 + 给候选 + 生成可粘贴片段」，**不写任何源文件**，
定稿仍由人工过一眼后写回 src/data.js。

规则说明：候选全部是「按名字字面量猜的」，仅供参考（尤其中文简称常靠语境，如
『影中沉凝的幻灭』->『幻灭』）。工具不联网：取数走本地 node/正则，失败即明确报错退出。

用法：
  python tools/set_short_suggest.py                 # 缺口报告 + 候选 + 可粘贴片段
  python tools/set_short_suggest.py --out FILE.md   # 额外写成 Markdown 清单（默认不落盘）
  python tools/set_short_suggest.py --backtest      # 拿现有 29+29 条人工值回测命中率
  python tools/set_short_suggest.py --demo          # 拿 3 套假装缺简称，跑通链路
"""
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_JS = os.path.join(ROOT, "src", "data.js")

# 英文候选里的停用词（虚词不参与取词）
EN_STOPWORDS = {
    "of", "the", "a", "an", "and", "in", "from", "for", "to", "on", "with",
}

# 中文候选的分段符（『的 / 之 / 与』把名字切成若干段）
ZH_SEPS = "的之与"

ZH_REMINDER = "中文简称常靠语境（如『影中沉凝的幻灭』->『幻灭』），规则只给候选，请人工定稿。"


# --------------------------------------------------------------------------
# 取数：优先 node + vm 载入 src/data.js（拿到派生出来的 SET_EN），失败回落正则
# --------------------------------------------------------------------------

def load_data_via_node(path):
    """在 node 里用 vm 载入 src/data.js，取回 SET_EN / SET_SHORT / SET_SHORT_EN。

    data.js 的 SET_EN 是 Object.fromEntries(SETS...) 派生出来的，正则拿不到，
    所以优先走这条路；顶层 const 不挂在 context 上，必须在同一 context 里再跑一段脚本。"""
    js = (
        "const fs=require('fs'),vm=require('vm');"
        "const c=vm.createContext({});"
        "vm.runInContext(fs.readFileSync(%s,'utf8'),c);"
        "process.stdout.write(vm.runInContext("
        "'JSON.stringify({SET_EN:SET_EN,SET_SHORT:SET_SHORT,SET_SHORT_EN:SET_SHORT_EN})',c));"
        % json.dumps(path)
    )
    p = subprocess.run(["node", "-e", js], cwd=ROOT, stdout=subprocess.PIPE,
                       stderr=subprocess.PIPE, timeout=60)
    if p.returncode != 0:
        raise RuntimeError("node 退出码 %d：%s" % (p.returncode, p.stderr.decode("utf-8", "replace")[:200]))
    out = p.stdout.decode("utf-8")
    data = json.loads(out)
    for k in ("SET_EN", "SET_SHORT", "SET_SHORT_EN"):
        if not isinstance(data.get(k), dict):
            raise RuntimeError("node 输出缺少 %s" % k)
    return data


def _obj_block(src, const_name):
    """抠出 `const NAME = { ... };` 的块内容（不含首尾括号）。"""
    i = src.index("const %s = {" % const_name)
    i = src.index("{", i) + 1
    j = src.index("\n};", i)
    return src[i:j]


def _pairs(block):
    """抠 `"K": "V"` 与 `'K': 'V'` 两种写法的键值对（值里可能含撇号，故按引号类型分别匹配）。"""
    out = {}
    for key_re, val_re in ((r'"([^"]+)"', r'"([^"]+)"'), (r"'([^']+)'", r"'([^']+)'")):
        for m in re.finditer(r"%s\s*:\s*%s" % (key_re, val_re), block):
            out.setdefault(m.group(1), m.group(2))
    return out


def load_data_via_regex(path):
    """兜底：正则从 src/data.js 抠 SETS 里的 (name, en) -> 等价 SET_EN，以及两张简称表。"""
    src = open(path, encoding="utf-8").read()
    sets_blk = src[src.index("const SETS = ["):src.index("const SET_NAMES")]
    set_en = {}
    for line in sets_blk.splitlines():
        m = re.search(r"\{\s*name:\s*'([^']+)',", line)
        if not m:
            continue
        e = re.search(r"\ben:\s*([\"'])(.*?)\1", line)
        if e:
            set_en[m.group(1)] = e.group(2)
    if not set_en:
        raise RuntimeError("正则未从 SETS 抠到任何 (name, en)")
    short_zh = _pairs(_obj_block(src, "SET_SHORT"))
    short_en = _pairs(_obj_block(src, "SET_SHORT_EN"))
    return {"SET_EN": set_en, "SET_SHORT": short_zh, "SET_SHORT_EN": short_en}


def load_data():
    """取数总入口：node -> 正则 -> 明确报错（绝不静默返回空）。"""
    errs = []
    if os.path.exists(DATA_JS):
        try:
            return load_data_via_node(DATA_JS)
        except Exception as e:
            errs.append("node 取数失败：%s" % e)
        try:
            return load_data_via_regex(DATA_JS)
        except Exception as e:
            errs.append("正则取数失败：%s" % e)
    else:
        errs.append("文件不存在：%s" % DATA_JS)
    raise RuntimeError("读取失败（需要可用的 node，或检查 src/data.js 路径）：" + "；".join(errs))


# --------------------------------------------------------------------------
# 候选生成规则（**仅供人工参考**，脚本不会自动写回源码）
# --------------------------------------------------------------------------

def _norm_en(name):
    """英文归一：去所有格（'s / ’s）、去标点、按空格分词。"""
    s = (name or "").replace("\u2019s", "").replace("’s", "").replace("'s", "")
    s = re.sub(r"[^0-9A-Za-z\u00c0-\u024f\s]", " ", s)
    return [w for w in s.split() if w]


def _content_words(words):
    return [w for w in words if w.lower() not in EN_STOPWORDS]


def suggest_en(en_name):
    """英文候选。

    规则（改名/新套装上线时按此给候选）：
      A = 首个实词（先去所有格）；B = 前两个实词以空格连接（如 Crimson Witch）。
      A 为推荐值；两者都超过 14 字符时降级为 A 的前 12 字符，并标注“截断”。
    返回 (候选列表, 备注)；备注为 '' 或 '(截断)'。"""
    words = _content_words(_norm_en(en_name))
    if not words:
        return [], ""
    a = words[0]
    b = " ".join(words[:2])
    cands, note = [], ""
    if len(a) > 14 and len(b) > 14:
        cands = [a[:12]]
        note = "(截断)"
    else:
        for c in (a, b):
            if c and c not in cands:
                cands.append(c)
    return cands, note


def _zh_segments(zh_name):
    """按『的 / 之 / 与』切成若干段，返回 (整名去连接词的串, 段列表)。"""
    parts = [p for p in re.split("[%s]" % ZH_SEPS, zh_name or "") if p]
    return (zh_name or ""), parts


def _head2(s):
    return s[:2] if len(s) >= 2 else s


def suggest_zh(zh_name):
    """中文候选（按优先级，去重后最多 3 个，第 1 个为推荐值）：

      1) 去掉『的/之/与』后整体取前 2 字（深林的记忆 -> 深林，未竟的遐思 -> 未竟）；
      2) 『的/之』前那一段取前 2 字（角斗士的终幕礼 -> 角斗士；前段本身只有 3 字时取整段，
         对齐规格 demo 的期望值）；
      3) 『的/之』后那段取前 2 字（深林的记忆 -> 记忆）；
      4) 末 2 字。
    返回 (候选列表, 备注)。"""
    name = zh_name or ""
    if not name:
        return [], ""
    joined, parts = _zh_segments(name)
    head = joined
    for ch in ZH_SEPS:
        head = head.replace(ch, "")
    cands = [_head2(head)]
    m = re.search("[的之]", name)
    if m:
        pre = name[:m.start()]
        if pre:
            cands.append(pre if len(pre) <= 3 else _head2(pre))
        cands.append(_head2(name[m.end():]))
    cands.append(name[-2:])
    out = []
    for c in cands:
        if c and c not in out:
            out.append(c)
    return out[:3], ""


def _fmt_cands(cands, note=""):
    return " / ".join(cands) + (("  " + note) if note else "")


# --------------------------------------------------------------------------
# 缺口检测
# --------------------------------------------------------------------------

def find_missing(data):
    """缺口检测。

    对 SET_EN 里每个 (中文名, 英文名) 判两门语言：中文名不在 SET_SHORT / 英文名不在
    SET_SHORT_EN 即为缺口；另外报出两边简称表里的**孤儿键**（SET_EN 里已无该套装，
    多为改名或删套装后的残留）。
    返回 {"rows": [(中文名, 英文名, 缺中文, 缺英文), ...], "orphan_zh": [...], "orphan_en": [...]}。"""
    set_en = data.get("SET_EN") or {}
    short_zh = data.get("SET_SHORT") or {}
    short_en = data.get("SET_SHORT_EN") or {}
    rows = []
    for zh, en in set_en.items():
        rows.append((zh, en, zh not in short_zh, en not in short_en))
    zh_names = set(set_en.keys())
    en_names = set(set_en.values())
    orphan_zh = [k for k in short_zh if k not in zh_names]
    orphan_en = [k for k in short_en if k not in en_names]
    return {"rows": rows, "orphan_zh": orphan_zh, "orphan_en": orphan_en}


def _counts(missing):
    n_zh = sum(1 for r in missing["rows"] if r[2])
    n_en = sum(1 for r in missing["rows"] if r[3])
    return n_zh, n_en


def _snippet_for(zh, en, miss_zh, miss_en, cand_zh, cand_en):
    """生成可直接粘贴进 src/data.js 的行（中文表用单引号，英文表用双引号）。"""
    lines = []
    if miss_zh and cand_zh:
        lines.append("  '%s': '%s'," % (zh, cand_zh[0]))
    if miss_en and cand_en:
        lines.append('  "%s": "%s",' % (en, cand_en[0]))
    return lines


def report_missing(quiet=False):
    """只打印一行摘要（供抓取脚本调用）：不联网、不写文件，返回该行文本。

    取数失败时抛异常，由调用方决定是否忽略（抓取脚本里已 try/except 跳过）。"""
    data = load_data()
    missing = find_missing(data)
    n_zh, n_en = _counts(missing)
    line = "[short] 简称缺口：中文 %d / 英文 %d" % (n_zh, n_en)
    if not quiet:
        print(line)
    return line


# --------------------------------------------------------------------------
# 报告输出
# --------------------------------------------------------------------------

def build_report_lines(data):
    """缺口报告正文（缺口 + 候选 + 可粘贴片段），返回 (文本行列表, 缺口数)。"""
    missing = find_missing(data)
    n_zh, n_en = _counts(missing)
    lines = []
    if not missing["rows"]:
        lines.append("[warn] SET_EN 为空，检查 src/data.js 是否解析成功")
        return lines, 0
    if n_zh == 0 and n_en == 0 and not missing["orphan_zh"] and not missing["orphan_en"]:
        lines.append("[OK] 全部 %d 套已有中英简称，无缺口" % len(missing["rows"]))
        lines.append("      新套装上线后重跑本脚本：python tools/set_short_suggest.py")
        return lines, 0

    lines.append("[gap] 简称缺口：中文 %d 套 / 英文 %d 套（共 %d 套）"
                 % (n_zh, n_en, len(missing["rows"])))
    lines.append("      候选仅为字面量猜测，仅供参考；" + ZH_REMINDER)
    snippets_zh, snippets_en = [], []
    for zh, en, miss_zh, miss_en in missing["rows"]:
        if not (miss_zh or miss_en):
            continue
        cand_zh, _ = suggest_zh(zh)
        cand_en, note_en = suggest_en(en)
        lines.append("")
        lines.append("  %s  [%s]" % (zh, " / ".join(
            x for x, f in (("缺中文", miss_zh), ("缺英文", miss_en)) if f)))
        lines.append("    英文名 : %s" % en)
        if miss_zh:
            lines.append("    中文候选: %s" % _fmt_cands(cand_zh))
        if miss_en:
            lines.append("    英文候选: %s" % _fmt_cands(cand_en, note_en))
        if miss_zh and cand_zh:
            snippets_zh.append("  '%s': '%s'," % (zh, cand_zh[0]))
        if miss_en and cand_en:
            snippets_en.append('  "%s": "%s",' % (en, cand_en[0]))

    if missing["orphan_zh"] or missing["orphan_en"]:
        lines.append("")
        lines.append("[orphan] 孤儿简称键（SET_EN 里已无对应套装，建议人工核对后删除）")
        if missing["orphan_zh"]:
            lines.append("  中文表: %s" % "、".join(missing["orphan_zh"]))
        if missing["orphan_en"]:
            lines.append("  英文表: %s" % "、".join(missing["orphan_en"]))

    if snippets_zh or snippets_en:
        lines.append("")
        lines.append("[paste] 人工确认后写回 src/data.js：")
        if snippets_zh:
            lines.append("  // SET_SHORT 内追加")
            lines.extend(snippets_zh)
        if snippets_en:
            lines.append("  // SET_SHORT_EN 内追加")
            lines.extend(snippets_en)
    return lines, n_zh + n_en


def write_markdown(path, data, lines):
    """把清单写成 Markdown（含人工确认勾选框 + 可粘贴片段），默认不调用。"""
    missing = find_missing(data)
    n_zh, n_en = _counts(missing)
    md = ["# 套装简称待确认清单", "",
          "生成工具：`tools/set_short_suggest.py`（离线，不会自动改源码）", "",
          "缺口：中文 %d 套 / 英文 %d 套" % (n_zh, n_en), "",
          "> 候选为字面量猜测，仅供参考；" + ZH_REMINDER, "",
          "## 待人工确认", ""]
    for zh, en, miss_zh, miss_en in missing["rows"]:
        if not (miss_zh or miss_en):
            continue
        cand_zh, _ = suggest_zh(zh)
        cand_en, note_en = suggest_en(en)
        tag = " / ".join(x for x, f in (("缺中文", miss_zh), ("缺英文", miss_en)) if f)
        md.append("- [ ] **%s**（%s）" % (zh, tag))
        md.append("  - 英文名：`%s`" % en)
        if miss_zh:
            md.append("  - 中文候选：%s" % _fmt_cands(cand_zh))
        if miss_en:
            md.append("  - 英文候选：%s" % _fmt_cands(cand_en, note_en))
    if missing["orphan_zh"] or missing["orphan_en"]:
        md += ["", "## 孤儿键（SET_EN 里已无对应套装）", ""]
        if missing["orphan_zh"]:
            md.append("- 中文表：%s" % "、".join(missing["orphan_zh"]))
        if missing["orphan_en"]:
            md.append("- 英文表：%s" % "、".join(missing["orphan_en"]))
    md += ["", "## 可粘贴片段（确认后写回 src/data.js）", "", "```js"]
    for zh, en, miss_zh, miss_en in missing["rows"]:
        if not (miss_zh or miss_en):
            continue
        cand_zh, _ = suggest_zh(zh)
        cand_en, _ = suggest_en(en)
        md.extend(_snippet_for(zh, en, miss_zh, miss_en, cand_zh, cand_en))
    md += ["```", ""]
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(md))
    return path


# --------------------------------------------------------------------------
# 回测 / 演示
# --------------------------------------------------------------------------

def _hit_stats(pairs):
    """pairs = [(名字, 人工简称, 候选列表, 备注)]，返回 (top1 命中数, 候选集命中数, 未命中清单)。"""
    top1 = sets_hit = 0
    miss = []
    for name, manual, cands, _note in pairs:
        if cands and cands[0] == manual:
            top1 += 1
        if manual in cands:
            sets_hit += 1
        else:
            miss.append(name)
    return top1, sets_hit, miss


def backtest(data):
    """拿现有 SET_SHORT / SET_SHORT_EN 的人工值回测：Top-1 命中率 与 候选集命中率。"""
    set_en = data.get("SET_EN") or {}
    short_zh = data.get("SET_SHORT") or {}
    short_en = data.get("SET_SHORT_EN") or {}

    zh_pairs = []
    for zh, manual in short_zh.items():
        cands, note = suggest_zh(zh)
        zh_pairs.append((zh, manual, cands, note))
    en_pairs = []
    for en, manual in short_en.items():
        cands, note = suggest_en(en)
        en_pairs.append((en, manual, cands, note))

    print("[backtest] 样本：中文 %d 条、英文 %d 条（取自 src/data.js 的人工简称表）"
          % (len(zh_pairs), len(en_pairs)))
    out = {}
    for lang, pairs in (("中文", zh_pairs), ("英文", en_pairs)):
        top1, hit, miss = _hit_stats(pairs)
        n = len(pairs) or 1
        print("[backtest] %s：Top-1 命中 %d/%d（%.1f%%），候选集命中 %d/%d（%.1f%%）"
              % (lang, top1, len(pairs), 100.0 * top1 / n, hit, len(pairs), 100.0 * hit / n))
        if miss:
            print("[backtest] %s 未命中规则（需人工定稿）：%s" % (lang, "、".join(miss)))
        else:
            print("[backtest] %s 全部命中" % lang)
        # 逐条明细（便于人工核对规则短板）
        for name, manual, cands, note in pairs:
            mark = "OK " if manual in cands else "MISS"
            print("  [%s] %-42s 人工=%-16s 候选=%s" % (mark, name, manual, _fmt_cands(cands, note)))
        out[lang] = {"top1": top1, "cand_hit": hit, "total": len(pairs), "miss": miss}
    return out


def demo(data, names=("深林的记忆", "谐律异想断章", "角斗士的终幕礼")):
    """演示链路：把现有 3 套临时当作缺简称（简称表置空），跑一遍完整报告（不写盘、不改数据）。"""
    set_en = data.get("SET_EN") or {}
    fake = {"SET_EN": {}, "SET_SHORT": {}, "SET_SHORT_EN": {}}
    for n in names:
        if n in set_en:
            fake["SET_EN"][n] = set_en[n]
    if not fake["SET_EN"]:
        print("[demo] 目标套装不在 SET_EN 里，无法演示")
        return None
    print("[demo] 模拟 %d 套缺中英简称，不改数据、不写盘" % len(fake["SET_EN"]))
    lines, _ = build_report_lines(fake)
    for ln in lines:
        print(ln)
    return lines


# --------------------------------------------------------------------------

def main():
    args = sys.argv[1:]
    out_path = None
    if "--out" in args:
        i = args.index("--out")
        out_path = args[i + 1] if i + 1 < len(args) else None
        if not out_path:
            print("[err] --out 需要一个文件路径")
            return 2

    try:
        data = load_data()
    except Exception as e:
        print("[err] %s" % e)
        return 1
    print("[short] 读取 src/data.js：套装 %d 套，中文简称 %d 条，英文简称 %d 条"
          % (len(data.get("SET_EN") or {}), len(data.get("SET_SHORT") or {}), len(data.get("SET_SHORT_EN") or {})))

    if "--backtest" in args:
        backtest(data)
        return 0
    if "--demo" in args:
        demo(data)
        return 0

    lines, _ = build_report_lines(data)
    for ln in lines:
        print(ln)
    if out_path:
        write_markdown(out_path, data, lines)
        print("\n[out] 已写出 Markdown 清单：%s" % out_path)
    elif lines and lines[0].startswith("[OK]"):
        print("      如需清单文件：python tools/set_short_suggest.py --out 简称待确认.md")
    return 0


if __name__ == "__main__":
    sys.exit(main())
