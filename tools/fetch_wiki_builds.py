# -*- coding: utf-8 -*-
"""
从米游社「观测枢」原神 wiki 抓取角色「推荐装备 → 圣遗物推荐」，产出可写入 src/data.js 的中间数据。

数据源（结构化 JSON，无需 OCR 攻略图）：
  搜索   GET https://act-api-takumi-static.mihoyo.com/hoyowiki/genshin/wapi/search?keyword=<名>
  词条   GET https://act-api-takumi-static.mihoyo.com/hoyowiki/genshin/wapi/entry_page?entry_page_id=<id>

输出：
  tools/out/wiki_builds.json   —— 每个角色解析出的套装 / 主词条 / 副词条
  tools/out/report.md          —— 人读的变更报告

用法：
  python tools/fetch_wiki_builds.py            # 全量
  python tools/fetch_wiki_builds.py 胡桃 甘雨   # 只跑指定角色（调试用）
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from role_infer import infer_roles
import time
import urllib.parse
import urllib.request

BASE = "https://act-api-takumi-static.mihoyo.com/hoyowiki"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
    "x-rpc-wiki_app": "ys_strategy",
    "x-rpc-app_version": "1.6.2",
    "x-rpc-language": "zh-cn",
    "Referer": "https://baike.mihoyo.com/",
}
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "tools", "out")
CACHE = os.path.join(OUT, "cache")

# 只认五星套装（与 src/data.js 的 SETS 对齐）；四星过渡套（战狂、教官等）丢弃
FIVE_STAR_SETS = None  # 运行时从 data.js 读取

STAT_ALIAS = {
    "攻击力": "atkP", "攻击力%": "atkP",
    "生命值": "hpP",  "生命值%": "hpP",
    "防御力": "defP", "防御力%": "defP",
    "元素精通": "em",
    "元素充能效率": "er",
    "火元素伤害加成": "pyro", "火元素伤害": "pyro",
    "水元素伤害加成": "hydro", "水元素伤害": "hydro",
    "冰元素伤害加成": "cryo", "冰元素伤害": "cryo",
    "雷元素伤害加成": "electro", "雷元素伤害": "electro",
    "风元素伤害加成": "anemo", "风元素伤害": "anemo",
    "岩元素伤害加成": "geo", "岩元素伤害": "geo",
    "草元素伤害加成": "dendro", "草元素伤害": "dendro",
    "物理伤害加成": "phys", "物理伤害": "phys",
    "暴击率": "cr", "暴击伤害": "cd", "治疗加成": "heal",
}


def get(url, retries=3):
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as e:
            if i == retries - 1:
                print("  ! 请求失败 %s -> %s" % (url, e))
                return None
            time.sleep(1.5 * (i + 1))
    return None


def cached_get(url, cachefile):
    if os.path.exists(cachefile):
        with open(cachefile, encoding="utf-8") as f:
            return json.load(f)
    d = get(url)
    if d is not None:
        os.makedirs(os.path.dirname(cachefile), exist_ok=True)
        with open(cachefile, "w", encoding="utf-8") as f:
            json.dump(d, f, ensure_ascii=False)
        time.sleep(0.35)
    return d


def strip_html(s):
    s = re.sub(r"<[^>]+>", "", s or "")
    return s.replace("&nbsp;", " ").strip()


def load_sets_and_names():
    """从 src/data.js 读出五星套装名 + 角色条目名"""
    src = open(os.path.join(ROOT, "src", "data.js"), encoding="utf-8").read()
    blk = src[src.index("const SETS = ["): src.index("const SET_NAMES")]
    sets = re.findall(r"\{ name: '([^']+)'", blk)
    blk2 = src[src.index("const RAW_CHARS = ["): src.index("/* ---------- 展开为完整结构")]
    names = re.findall(r"^\s*\['([^']+)'", blk2, re.M)
    return sets, names


def search_entry_ids(name):
    """返回 (candidate_ids, matched_name)。同名条目可能有多个（如「旅行者·风」两条），全部返回。"""
    url = BASE + "/genshin/wapi/search?keyword=" + urllib.parse.quote(name) + "&page=1&size=20"
    cf = os.path.join(CACHE, "search_%s.json" % re.sub(r"[^\w一-龥]", "_", name))
    d = cached_get(url, cf)
    if not d or d.get("retcode") != 0:
        return [], None
    exact, loose = [], []
    for it in d.get("data", {}).get("list", []):
        nm = re.sub(r"</?em>", "", (it.get("name") or "")).strip()
        eid = it.get("entry_page_id")
        menus = [m.get("name") for m in (it.get("menus") or [])]
        if nm != name or not eid:
            continue
        (exact if "角色" in menus else loose).append(eid)
    return exact + loose, name


def find_recommend_module(page):
    for m in page.get("modules", []):
        if (m.get("name") or "").strip() == "推荐装备":
            return m
    return None


MAX_BUILDS = 15  # wiki 单角色可达 11 组；保留全部去重后的五星配装，不做前 N 截断


def parse_sets_from_label(label, sets):
    """从「推荐圣遗物」单元格解析套装组合。
    规则：'+' 或 '＋' 表示 2+2 同时穿；'/' 表示同等备选，只取第一个。
    只保留五星套装（四星过渡套如战狂/教官/流放者直接丢弃）。
    """
    if not label:
        return []
    parts = re.split(r"[+＋]", label)
    picked = []
    for p in parts:
        alts = re.split(r"[/／、]", p)
        for a in alts:
            a = a.strip()
            if a in sets:
                picked.append(a)
                break
    out = []
    for s in picked:
        if s not in out:
            out.append(s)
    return out


def parse_artifact_tab(module, sets):
    """返回 (rows, raw_tab_name)。rows 已过滤掉无五星套装的过渡行。"""
    if not module:
        return [], None
    for c in module.get("components", []):
        try:
            data = json.loads(c.get("data") or "{}")
        except Exception:
            continue
        for t in data.get("tables", []):
            if "圣遗物" not in (t.get("tab_name") or ""):
                continue
            rows = []
            for r in t.get("row", []):
                cells = [strip_html(x) for x in r]
                name_cell = cells[0] if cells else ""
                reason = cells[1] if len(cells) > 1 else ""
                combos = parse_sets_from_label(name_cell, sets)
                if not combos:
                    continue  # 四星 / 过渡套，不进正式配装
                rows.append({
                    "sets": combos,
                    "label": name_cell,
                    "reason": reason,
                    "mains": parse_mains(reason),
                    "subs": parse_subs(reason),
                    "roles": infer_roles(reason, parse_mains(reason), parse_subs(reason), name_cell),
                })
            # 去重：仅当「套装组合 + 主词条 + 副词条」完全一致才算重复
            # （同一套装不同流派/主词条的情况要保留，如 久岐忍 少女套的副C/辅助两种）
            seen, uniq = set(), []
            for r in rows:
                k = (tuple(r["sets"]),
                     tuple(r["mains"]["sands"]), tuple(r["mains"]["goblet"]),
                     tuple(r["mains"]["circlet"]), tuple(r["subs"]))
                if k in seen:
                    continue
                seen.add(k)
                uniq.append(r)
            return uniq[:MAX_BUILDS], t.get("tab_name")
    return [], None


SLOT_KEYS = {"时之沙": "sands", "空之杯": "goblet", "理之冠": "circlet"}


def _slice_slot(text, key):
    """截取 时之沙：... 到下一个部位关键字或副词条之前"""
    i = text.find(key)
    if i < 0:
        return None
    seg = text[i + len(key):]
    seg = re.split(r"时之沙|空之杯|理之冠|副词[条缀性]|套装效果|二件套|四件套|$", seg)[0]
    return seg


_ALIAS_RE = re.compile("|".join(sorted((re.escape(a) for a in STAT_ALIAS), key=len, reverse=True)))


def _stats_in(seg):
    """按原文出现顺序抽出属性 id（长别名优先，避免「生命值」吃掉「生命值%」）"""
    out = []
    for m in _ALIAS_RE.finditer(seg):
        sid = STAT_ALIAS[m.group(0)]
        if sid not in out:
            out.append(sid)
    return out


def parse_mains(text):
    res = {}
    for key, slot in SLOT_KEYS.items():
        seg = _slice_slot(text, key)
        res[slot] = _stats_in(seg) if seg else []
    return res


def parse_subs(text):
    m = re.search(r"副词[条缀性]", text)
    if not m:
        return []
    seg = text[m.end():]
    seg = re.split(r"时之沙|空之杯|理之冠|套装效果|备注|说明", seg)[0]
    return _stats_in(seg)


def pick_preset(subs):
    """由副词条顺序推断 SUB_PRESETS 键；推断不出返回 None"""
    if not subs:
        return None
    head = subs[0]
    if head in ("cr", "cd"):
        if "hpP" in subs:
            return "critHp"
        if "defP" in subs:
            return "critDef"
        return "crit"
    return {"em": "em", "hpP": "hp", "defP": "def", "er": "er", "atkP": "atk"}.get(head)


def main():
    sets, names = load_sets_and_names()
    os.makedirs(CACHE, exist_ok=True)
    targets = sys.argv[1:] or names
    if targets and targets[0] == "--all":
        targets = names

    result = {}
    for name in targets:
        cands, _ = search_entry_ids(name)
        # 分形态角色（旅行者·风 等）在 data.js 里带「·」，wiki 词条名同名；
        # 找不到就退一步用「旅行者」这种基名再试一次。
        if not cands and "·" in name:
            cands, _ = search_entry_ids(name.split("·")[0])
        if not cands:
            print("[skip] %-8s 未找到词条" % name)
            result[name] = {"ok": False, "why": "词条未找到"}
            continue

        page, eid, rows, tab = None, None, [], None
        for cid in cands:
            cf = os.path.join(CACHE, "page_%s.json" % cid)
            d = cached_get(BASE + "/genshin/wapi/entry_page?entry_page_id=%s" % cid, cf)
            if not d or d.get("retcode") != 0:
                continue
            pg = d["data"]["page"]
            rr, tt = parse_artifact_tab(find_recommend_module(pg), sets)
            if rr:
                page, eid, rows, tab = pg, cid, rr, tt
                break
            if page is None:  # 记住第一个能打开的，便于报错
                page, eid = pg, cid
        if not rows:
            print("[skip] %-8s 无圣遗物推荐" % name)
            result[name] = {"ok": False, "why": "无圣遗物推荐", "entry_id": eid,
                            "candidates": cands}
            continue
        main_row = rows[0]
        # healer 特判：理之冠出现治疗加成 → 归到「治疗辅助」预设
        derived = pick_preset(main_row["subs"])
        if "heal" in (main_row["mains"].get("circlet") or []) and derived in ("hp", "atk", "er"):
            derived = "heal"
        result[name] = {
            "ok": True, "entry_id": eid, "tab": tab,
            "query": name,
            "builds": [r["sets"] for r in rows],
            "mains": main_row["mains"],
            "subs": main_row["subs"],
            "derived_preset": derived,
            "rows": rows,
            "url": "https://baike.mihoyo.com/ys/obc/content/%s/detail" % eid,
        }
        print("[ok]   %-8s %s -> %s" % (name, tab, " / ".join("/".join(r["sets"]) for r in rows)))

    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, "wiki_builds.json"), "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=1)
    print("\n写入 tools/out/wiki_builds.json（%d 条）" % len(result))


if __name__ == "__main__":
    main()
