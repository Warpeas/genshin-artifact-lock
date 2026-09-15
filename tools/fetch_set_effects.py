# -*- coding: utf-8 -*-
"""
从观测枢 wiki 抓取每个五星圣遗物套装的「基础信息」模块，提取 2件套 / 4件套 效果，
补进 src/data.js 的 SETS（新增 bonus4 字段，bonus 维持 2件套）。

数据源（结构化 JSON，无需 OCR）：
  搜索  GET https://act-api-takumi-static.mihoyo.com/hoyowiki/genshin/wapi/search?keyword=<套装名>
  词条  GET https://act-api-takumi-static.mihoyo.com/hoyowiki/genshin/wapi/entry_page?entry_page_id=<id>

输出：
  tools/out/set_effects.json   —— 每个套装解析出的 {bonus2, bonus4_raw, bonus4}
  --apply                      —— 把 bonus4 写回 src/data.js 的 SETS（保留原 bonus 作 2件套）

用法：
  python tools/fetch_set_effects.py --probe "冰风迷途的勇士"   # 单套调试 + 打印原始结构
  python tools/fetch_set_effects.py            # 全量抓取（带缓存）
  python tools/fetch_set_effects.py --apply    # 抓取并写回 data.js
"""
import json
import os
import re
import sys
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
    return s.replace("&nbsp;", " ").replace("\u200b", "").strip()


def load_sets():
    """从 src/data.js 读出 (name, en) 列表"""
    src = open(os.path.join(ROOT, "src", "data.js"), encoding="utf-8").read()
    blk = src[src.index("const SETS = ["): src.index("const SET_NAMES")]
    return [(m.group(1), m.group(3))
            for m in re.finditer(r"\{ name: '([^']+)',\s*en: ([\"'])(.*?)\2", blk)]


def search_set_entry(name):
    """返回 (candidate_ids, matched_name)。只认「圣遗物」菜单下的词条。"""
    url = BASE + "/genshin/wapi/search?keyword=" + urllib.parse.quote(name) + "&page=1&size=20"
    cf = os.path.join(CACHE, "search_set_%s.json" % re.sub(r"[^\w一-龥]", "_", name))
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
        (exact if "圣遗物" in menus else loose).append(eid)
    return exact + loose, name


_SLOT_KEYS = ("2件套", "4件套", "二件套", "四件套")
_NUM_RE = re.compile(r"\d+%|\d+\s*%|提高|提升|增加|获得|\+?\d+")


def _slot_of(k):
    """基础信息里键名可能是 '2件套效果 '/' 4件套效果 '，用子串匹配并归一化。"""
    ks = (k or "").strip()
    for full, norm in (("2件套", "2件套"), ("4件套", "4件套"),
                       ("二件套", "2件套"), ("四件套", "4件套")):
        if full in ks:
            return norm
    return None


def _walk_for_bonuses(o, out):
    """在 基础信息 模块解析出的任意 JSON 结构里找 2件套/4件套 -> 文本。
    常见两种结构：
      (a) 直接 { "2件套": "..." } —— 槽位是 dict 的 key
      (b) 观测枢「基础信息」列表项 { "key": " 2件套效果 ", "value": [html...] } —— 槽位是 value 字段的内容
    """
    if isinstance(o, dict):
        if "key" in o and "value" in o:
            slot = _slot_of(o.get("key"))
            if slot and slot not in out:
                v = o["value"]
                if isinstance(v, list):
                    txt = strip_html(" ".join(str(x) for x in v))
                elif isinstance(v, dict):
                    txt = strip_html(v.get("value", ""))
                else:
                    txt = strip_html(v)
                if txt:
                    out[slot] = txt
        # 也兼容 (a)：槽位是 dict 的 key
        slot = _slot_of(o.get("name") or "")
        if slot and slot not in out and "value" in o and not isinstance(o.get("value"), (list, dict)):
            txt = strip_html(o["value"])
            if txt:
                out[slot] = txt
        for k, v in o.items():
            _walk_for_bonuses(v, out)
    elif isinstance(o, list):
        for x in o:
            _walk_for_bonuses(x, out)


_BUFF_RE = re.compile(r"提升|提高|增加|获得|降低|强化|加成|伤害|暴击|回复|治疗|护盾|抗性|概率")
_LIMIT_RE = re.compile(r"每\d|至多|不可叠加|移除|失效|清除|秒后")

# 展示用的简化文案。bonus4_raw 仍保留 wiki 原文，避免丢失可追溯信息。
# 通用规则负责删掉机械性的限制说明；这些条目还需要按语义重排或合并句子。
FOUR_SIMPLIFICATIONS = {
    "影中沉凝的幻灭": "超导反应造成的伤害提升80%，星超导反应造成的伤害提升40%；装备者攻击受到超导或星超导反应影响的敌人时，暴击率提高16%",
    "天之美赐": "施放元素战技后，队伍附近角色获得20%对应元素伤害加成，持续20秒；队伍拥有「魔导·秘仪」时，依据场上角色元素类型额外获得对应元素伤害加成，以上加成提升至40%",
    "风起之日": "普通攻击、重击、元素战技或元素爆发命中敌人后，持续6秒攻击力提高25%；若装备者已经完成了「魔女的课业」，暴击率提升20%",
    "穹境示现之夜": "队伍中附近的角色触发月曜反应时，将获得持续4秒的暴击率提升15%/30%",
    "长夜之誓": "下落攻击/重击/元素战技命中敌人后，获得1/2/2层效果：下落攻击造成的伤害提升15%，持续6秒，至多叠加5层",
    "昔时之歌": "治疗队友时记录6秒治疗回复量（含溢出）；结束后，队伍场上角色攻击命中时按记录量8%提高伤害，生效5次或10秒后移除",
    "水仙之梦": "普通攻击、重击、下落攻击、元素战技或元素爆发命中敌人后，将产生1层持续8秒的加成；处于1/2/3层时，攻击力将提高7%/16%/25%，水元素伤害加成提升4%/9%/15%",
    "饰金之梦": "触发元素反应后的8秒内：队伍中每存在1个和装备者同类元素的角色，攻击力提升14%；每存在1个和装备者不同元素类型的角色，元素精通提升50点",
    "辰砂往生录": "施放元素爆发后，将持续16秒攻击力提升8%；并在角色的生命值降低时，攻击力进一步提升10%，至多通过这种方式提升4次",
    "来歆余响": "普通攻击命中敌人时，有36%概率提高普通攻击造成的伤害，伤害提高值为攻击力的70%；未触发提高时，会使下次触发概率提升20%",
    "华馆梦醒形骸记": "在场上用岩元素攻击命中敌人后获得一层加成效果；在队伍后台中，每3秒获得一层；问答至多叠加4层，每层能提供6%防御力与6%岩元素伤害加成",
    "海染砗磲": "装备角色对队伍中的角色进行治疗时，将持续3秒记录治疗的生命值回复量（包括溢出值）；持续时间结束时，对周围的敌人造成90%累计回复量的伤害",
    "纺月的夜歌": "造成元素伤害时，持续8秒：队伍的月兆为初辉/满辉时，队伍中所有角色的元素精通提高60点/120点；每种不同的「月辉明光」效果使队伍触发的月曜反应伤害提升10%",
    "深廊终曲": "元素能量为0时，普通攻击与元素爆发造成的伤害提升60%；普通攻击造成伤害后元素爆发伤害加成失效6秒，元素爆发造成伤害后普通攻击伤害加成失效6秒",
    "烬城勇者绘卷": "触发对应元素类型的相关反应后，队伍中附近的所有角色该元素反应相关的元素伤害加成提升12%，持续15秒；夜魂加持状态下提升28%，持续20秒",
    "未竟的遐思": "脱离战斗状态3秒后，造成的伤害提升50%；战斗中附近无燃烧状态敌人超过6秒后每秒降低10%至0，有燃烧状态敌人时每秒恢复10%至50%",
    "回声之林夜话": "施放元素战技后10秒内，岩元素伤害加成提升20%；处于结晶反应护盾或附近存在月结晶反应形成的月笼时，上述效果提高150%，条件不满足1秒后移除",
    "乐园遗落之花": "绽放、超绽放、烈绽放反应伤害提升40%，月绽放反应伤害提升10%；触发上述反应后，上述加成提升25%，持续10秒，至多叠加4次",
    "如雷的盛怒": "超载、感电、超导、超绽放反应伤害提升40%，超激化反应伤害提升20%，月感电、星超导反应伤害提升20%；触发上述反应或原激化时，元素战技冷却时间减少1秒",
    "翠绿之影": "扩散反应伤害提升60%，星扩散反应伤害提升20%；扩散后降低受到影响的敌人40%对应元素抗性，持续10秒；触发星扩散时额外降低40%冰元素抗性",
}


def _is_buff_clause(p):
    """含数值、且不是纯冷却/上限/失效句，才算「数值加强描述」。"""
    if not _NUM_RE.search(p):
        return False
    if _LIMIT_RE.search(p) and not _BUFF_RE.search(p):
        return False
    return True


def simplify_four(text):
    """4件套过长时简化：拆句后只保留「数值加强描述」（含加成的条款），丢弃纯冷却/上限/失效句。
    注意：中文用「.」表示小数（0.5秒），不能按「.」切句，只按 ；（全/半角）和 。 切。"""
    if not text:
        return text
    text = text.rstrip("。")
    if len(text) <= 44:
        return text
    parts = [p.strip() for p in re.split(r"[；;。]", text) if p.strip()]
    if len(parts) <= 1:
        return text  # 单一长句，不强行截断
    buffs = [p for p in parts if _is_buff_clause(p)]
    if not buffs:
        return parts[-1]
    return "；".join(buffs)


def simplify_four_for_set(name, text):
    """先应用可解释的通用清理，再应用已人工校准的套装文案。"""
    result = FOUR_SIMPLIFICATIONS.get(name, simplify_four(text))
    # wiki 富文本偶尔在中文中插入换行/空格，展示文案不需要保留这些排版字符。
    return re.sub(r"\s+", "", result)


def find_basic_module(page):
    for m in page.get("modules", []):
        if (m.get("name") or "").strip() == "基础信息":
            return m
    return None


def parse_set_page(page):
    """返回 {2件套:.., 4件套:..}（已 strip_html）。找不到返回空 dict。"""
    mod = find_basic_module(page)
    if not mod:
        return {}
    out = {}
    for c in mod.get("components", []):
        try:
            data = json.loads(c.get("data") or "{}")
        except Exception:
            continue
        _walk_for_bonuses(data, out)
        if "2件套" in out and "4件套" in out:
            break
    # 归一化键名
    res = {}
    if "2件套" in out:
        res["2件套"] = out["2件套"]
    if "二件套" in out and "2件套" not in res:
        res["2件套"] = out["二件套"]
    if "4件套" in out:
        res["4件套"] = out["4件套"]
    if "四件套" in out and "4件套" not in res:
        res["4件套"] = out["四件套"]
    return res


def fetch_one(name):
    cands, _ = search_set_entry(name)
    if not cands:
        return {"ok": False, "why": "未找到词条"}
    page, eid = None, None
    for cid in cands:
        cf = os.path.join(CACHE, "page_%s.json" % cid)
        d = cached_get(BASE + "/genshin/wapi/entry_page?entry_page_id=%s" % cid, cf)
        if not d or d.get("retcode") != 0:
            continue
        pg = d["data"]["page"]
        b = parse_set_page(pg)
        if b:
            page, eid, bonus = pg, cid, b
            break
        if page is None:
            page, eid = pg, cid
    if not page:
        return {"ok": False, "why": "词条打开失败", "entry_id": eid, "candidates": cands}
    b = parse_set_page(page)
    if not b:
        return {"ok": False, "why": "无基础信息/套装效果", "entry_id": eid}
    return {
        "ok": True, "entry_id": eid,
        "bonus2": b.get("2件套"),
        "bonus4_raw": b.get("4件套"),
        "bonus4": simplify_four_for_set(name, b.get("4件套", "")),
        "url": "https://baike.mihoyo.com/ys/obc/content/%s/detail" % eid,
    }


def apply_to_data_js(effects):
    """把每个套装的 bonus4 写回 src/data.js 的 SETS 对象里。"""
    path = os.path.join(ROOT, "src", "data.js")
    src = open(path, encoding="utf-8").read()
    sets_blk_start = src.index("const SETS = [")
    sets_blk_end = src.index("const SET_NAMES")
    blk = src[sets_blk_start:sets_blk_end]
    lines = blk.splitlines(keepends=True)
    n_written = 0
    for name, eff in effects.items():
        if not eff.get("ok") or not eff.get("bonus4"):
            continue
        b4 = eff["bonus4"].replace("\\", "\\\\").replace("'", "\\'")
        name_pat = re.compile(r"\{\s*name:\s*'%s'," % re.escape(name))
        field_pat = re.compile(r"bonus4:\s*'(?:\\.|[^'])*'")
        for i, line in enumerate(lines):
            if not name_pat.search(line):
                continue
            if "bonus4:" in line:
                lines[i] = field_pat.sub("bonus4: '%s'" % b4, line, count=1)
            else:
                end = re.search(r"\s*\}\s*,?\s*$", line)
                if not end:
                    continue
                lines[i] = line[:end.start()] + ", bonus4: '%s'" % b4 + line[end.start():]
            n_written += 1
            break
    blk = ''.join(lines)
    new_src = src[:sets_blk_start] + blk + src[sets_blk_end:]
    open(path, "w", encoding="utf-8").write(new_src)
    return n_written


def main():
    args = sys.argv[1:]
    probe = None
    if "--probe" in args:
        i = args.index("--probe")
        probe = args[i + 1] if i + 1 < len(args) else None
    do_apply = "--apply" in args

    if probe:
        r = fetch_one(probe)
        print("[probe] %s => %s" % (probe, json.dumps(r, ensure_ascii=False, indent=1)))
        # 额外打印原始 基础信息 结构，便于校准解析
        cands, _ = search_set_entry(probe)
        if cands:
            import json as _j
            cf = os.path.join(CACHE, "page_%s.json" % cands[0])
            d = cached_get(BASE + "/genshin/wapi/entry_page?entry_page_id=%s" % cands[0], cf)
            if d:
                for m in d["data"]["page"].get("modules", []):
                    if (m.get("name") or "").strip() == "基础信息":
                        print("\n[raw 基础信息 components]")
                        for c in m.get("components", []):
                            print("  component_id=%s data=%s" % (c.get("component_id"), _j.dumps(c.get("data"), ensure_ascii=False)[:1200]))
        return

    sets = load_sets()
    os.makedirs(CACHE, exist_ok=True)
    results = {}
    for name, en in sets:
        r = fetch_one(name)
        results[name] = r
        tag = "ok" if r.get("ok") else "skip"
        print("[%s] %-10s %s" % (tag, name, r.get("bonus4") or r.get("why")))

    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, "set_effects.json"), "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=1)
    n_ok = sum(1 for r in results.values() if r.get("ok"))
    print("\n写入 tools/out/set_effects.json：%d/%d 成功" % (n_ok, len(results)))

    if do_apply:
        n = apply_to_data_js(results)
        print("已写回 src/data.js 的 bonus4：%d 套" % n)


if __name__ == "__main__":
    main()
