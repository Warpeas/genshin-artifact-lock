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
  python tools/fetch_wiki_builds.py            # 全量联网抓取
  python tools/fetch_wiki_builds.py 胡桃 甘雨   # 只跑指定角色（调试用）
  python tools/fetch_wiki_builds.py --merge    # 抓取失败的角色保留快照里的旧数据
  python tools/fetch_wiki_builds.py --reparse  # 不联网：用当前解析规则重放 tools/out/wiki_builds.json
                                               # （--dry 只预览；--allow-unrecognized 允许带未识别片段落盘）

抓取与解析共用同一套 parse_fields/infer_roles，所以「联网抓取」与「快照重放」
（--reparse）产出的结果一致；别名表/推断逻辑改动后无需重抓即可刷新数据。
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from role_infer import CHAR_ROLES, infer_roles
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

# 注意：wiki 原文存在大量简写（如「充能效率」「雷伤加成」「治疗量加成」），
# 简写必须一并收录，否则会静默解析为空/少解析（历史 bug：欧洛伦、阿罗夏、希诺宁等）。
# 长别名优先（_ALIAS_RE 按长度倒序），故全称与简写共存安全。
STAT_ALIAS = {
    "攻击力": "atkP", "攻击力%": "atkP", "百分比攻击力": "atkP",
    "生命值": "hpP",  "生命值%": "hpP",  "百分比生命值": "hpP",
    # 沃雅妮莎词条段写成「百分比生命 / 数值生命」，观测枢四星过渡行也偶见这种说法
    "百分比生命": "hpP", "数值生命": "hp",
    "防御力": "defP", "防御力%": "defP",
    "百分比防御力": "defP",
    "元素精通": "em",
    # 注：不收「精通」独字——roles 与描述里到处是「精通」，会大面积误判。
    "元素充能效率": "er", "充能效率": "er", "元素充能": "er",
    "火元素伤害加成": "pyro", "火元素伤害": "pyro", "火伤加成": "pyro",
    "水元素伤害加成": "hydro", "水元素伤害": "hydro", "水伤加成": "hydro",
    "冰元素伤害加成": "cryo", "冰元素伤害": "cryo", "冰伤加成": "cryo",
    "雷元素伤害加成": "electro", "雷元素伤害": "electro", "雷伤加成": "electro",
    "风元素伤害加成": "anemo", "风元素伤害": "anemo", "风伤加成": "anemo",
    "岩元素伤害加成": "geo", "岩元素伤害": "geo", "岩伤加成": "geo",
    "草元素伤害加成": "dendro", "草元素伤害": "dendro", "草伤加成": "dendro",
    "物理伤害加成": "phys", "物理伤害": "phys", "物伤加成": "phys",
    "暴击伤害": "cd", "暴伤": "cd", "暴击率": "cr",
    "治疗量加成": "heal", "治疗加成": "heal",
}

# 仅用于「词条清单 token」语境的补丁别名。
# STAT_ALIAS 里的条目会在长句上做正则扫描（scope 大），所以不能收「精通」「暴击」
# 这种会大面积误判的短词；而词条段已经被切成 token（每个 token 就是一个属性名），
# 此时「精通」只可能是元素精通、「暴击」只可能是暴击率，可以安全补全。
# （历史 bug：多莉/卡齐娜/瑶瑶的推荐理由写的是「精通 / 暴击 / 生命加成」，不在
#   STAT_ALIAS 里 → 静默丢词条，导致 7 处副词条缺失。）
TOKEN_ALIAS = {
    "精通": "em",
    "暴击": "cr",
    "暴击几率": "cr",
    "生命加成": "hpP",
    "攻击加成": "atkP",
    "防御加成": "defP",
    "攻击力百分比": "atkP",
    "生命值百分比": "hpP",
    "防御力百分比": "defP",
    "攻击百分比": "atkP",
    "生命百分比": "hpP",
    "防御百分比": "defP",
    "元素充能": "er",
    "充能": "er",
    "治疗量": "heal",
}

# 括号说明里的「条件」线索：出现这些字样的词条只在该条件下才需要
# （如「暴击率（携带西风剑时）」「防御力（六命可选防御力）」），
# 不能当成无条件推荐词条；而括号里只是流派出处的（输出/辅助/通用）按常规词条处理。
COND_CLUES = ("西风", "命", "可选", "携带", "触发", "特效", "推荐", "限定",
              "队伍中有", "视情况", "平时")
VARIANT_MARKS = {"输出", "辅助", "治疗", "副C", "主C", "通用", "物理", "站场", "后台", "散搭", "满命"}
# 整段都是噪音词（非属性名）时不算「未识别片段」，避免误报
NOISE_TOKENS = {"不强求", "推荐", "副词条", "主词条", "副词缀", "副词性", "无", "以上",
                "-", "—", "·", "等", "起",
                # 四星过渡行常直接写这句话，表示「前期副词条不用挑」
                "前期不需要考虑"}


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


WRAP_RE = re.compile(r'data-entry-name="([^"]+)"')
SET_ALT_RE = re.compile(r"[/／、|]")

# 单元格里认出的套装超过 2 套时的告警（wiki 把「战狂2/武人2/教官2」这类等价散搭写成
# 相邻标签，只能取前两套），由 main() 落到 tools/out/sets_warnings.json 留痕。
SET_WARNINGS = []


def _cell_set_seq(raw_html):
    """按出现顺序取单元格里的套装名 + 「到下一个套装标签之间的分隔文本」。

    wiki 的推荐单元格里每套都用
      <span class="custom-entry-wrapper" data-entry-name="战狂">…</span>
    包了一层；直接剥标签会把相邻套名粘成一串（「战狂武人」「纺月的夜歌绝缘之旗印」），
    所以先按 data-entry-name 切出顺序，再看标签之间的分隔符判断关系。
    返回 [(name, gap_to_next), ...]
    """
    marks = list(WRAP_RE.finditer(raw_html or ""))
    seq = []
    for i, m in enumerate(marks):
        close = raw_html.find(">", m.end())
        nxt = marks[i + 1].start() if i + 1 < len(marks) else len(raw_html)
        gap = strip_html(raw_html[close + 1:nxt]) if close >= 0 else ""
        seq.append((m.group(1).strip(), gap))
    return seq


def _dedupe(names):
    out = []
    for n in names:
        if n not in out:
            out.append(n)
    return out


def parse_sets_from_label(label, sets):
    """纯文本兜底（单元格没有 data-entry-name 包裹时）：
    '+'／'＋' = 同时穿；'/'／'、' = 同等备选，只取第一个命中 SETS 的。"""
    if not label:
        return []
    picked = []
    for p in re.split(r"[+＋]", label):
        for a in re.split(r"[/／、]", p):
            a = a.strip()
            if a in sets:
                picked.append(a)
                break
    return _dedupe(picked)


def parse_sets_from_cell(raw_html, sets, label="", char_name=None):
    """从「推荐圣遗物」单元格解析套装组合（四星过渡套只要在 SETS 里就照常收）。

    规则：
      - 标签之间是 '/'／'、'／'|' → 同等备选，只取第一个命中 SETS 的；
      - 标签之间是 '+'／'＋' 或直接相邻 → 同时穿，拆成多组
        （2+2 散搭「纺月的夜歌绝缘之旗印」就是靠这一步救回来的）；
      - 一组里认不出 SETS 就整组丢掉，不猜。
    最多保留 2 组（一个角色只有 5 个部位，3 组以上必然含备选关系），
    超出的写进 SET_WARNINGS。
    """
    seq = _cell_set_seq(raw_html)
    if not seq:
        return parse_sets_from_label(label or strip_html(raw_html), sets)

    groups = []                      # 每组 = 一个「同时穿」的位置，组内互为备选
    for name, gap in seq:
        if groups and SET_ALT_RE.search(gap or ""):
            groups[-1].append(name)
        else:
            groups.append([name])

    picked = []
    for g in groups:
        hit = next((n for n in g if n in sets), None)
        if hit:
            picked.append(hit)
    picked = _dedupe(picked)
    if len(picked) > 2:
        SET_WARNINGS.append({
            "char": char_name or "", "label": label or strip_html(raw_html),
            "kept": picked[:2], "dropped": picked[2:],
        })
        picked = picked[:2]
    return picked


def parse_artifact_tab(module, sets, char_roles=None, char_name=None):
    """返回 (rows, raw_tab_name)。rows 只保留「能认出 SETS 里套装」的行
    （五星 + 四星都在 SETS 里，1~3 星的游医 / 冒险家 / 幸运儿才会被丢）。

    char_roles：该角色的基础定位（CHAR_META），仅在理由文本推不出定位时兜底。
    char_name：仅用于把套装数超限的告警记到角色名下。
    """
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
                raw_name = r[0] if r else ""
                name_cell = cells[0] if cells else ""
                reason = cells[1] if len(cells) > 1 else ""
                combos = parse_sets_from_cell(raw_name, sets, name_cell, char_name)
                if not combos:
                    continue  # 认不出套装的过渡行（1~3 星或纯文字描述）
                # 单元格里并排两套不等于 2+2：wiki 常把「A4件套/B4件套」写成相邻两个图，
                # 那是二选一。理由里出现 4 件套且没有 2 件套 / 2+2 字样时只留第一套。
                if len(combos) > 1 and re.search(r"[4４]件套|四件套", reason) \
                        and not re.search(r"2\s*[+＋]\s*2|2件套|两件套", reason):
                    combos = combos[:1]
                mains, subs, cond, unknown = parse_fields(reason)
                rows.append({
                    "sets": combos,
                    "label": name_cell,
                    "reason": reason,
                    "mains": mains,
                    "subs": subs,
                    "conditional": cond,
                    "unknown": unknown,
                    "roles": infer_roles(reason, mains, subs, name_cell, char_roles),
                })
            # 去重：仅当「套装组合 + 主词条 + 副词条」完全一致才算重复
            # （同一套装不同流派/主词条的情况要保留，如 久岐忍 少女套的副C/辅助两种）
            seen, uniq = set(), []
            for r in rows:
                k = (tuple(r["sets"]),
                     tuple(r["mains"]["sands"]), tuple(r["mains"]["goblet"]),
                     tuple(r["mains"]["circlet"]), tuple(r["subs"]),
                     tuple((c["where"], c["stat"]) for c in r.get("conditional") or []))
                if k in seen:
                    continue
                seen.add(k)
                uniq.append(r)
            return uniq[:MAX_BUILDS], t.get("tab_name")
    return [], None


SLOT_KEYS = {"时之沙": "sands", "空之杯": "goblet", "理之冠": "circlet"}


def _slice_slot(text, key):
    """截取 时之沙：... 到下一个部位关键字或副词条之前

    优先认「理之冠：」这种带冒号的标签写法：理由正文里可能先出现
    「（理之冠的位置建议使用…）」这类括号说明，按首个出现切会把说明当词条。
    """
    m = re.search(re.escape(key) + r"\s*[：:]", text)
    i = m.start() if m else text.find(key)
    if i < 0:
        return None
    seg = text[i + len(key):]
    seg = re.split(r"时之沙|空之杯|理之冠|副词[条缀性]|套装效果|二件套|四件套|$", seg)[0]
    return seg


_ALIAS_RE = re.compile("|".join(sorted((re.escape(a) for a in STAT_ALIAS), key=len, reverse=True)))

# 词条切分符：/、顿号、逗号、分号、冒号、空白（含全角），以及「或者」
_SPLIT_RE = re.compile(r"[/／、,，;；:：\s]+|或者")
# 「副词条推荐：」这类前缀整体当分隔符，避免把「推荐」当成词条
_SUBS_HEAD_RE = re.compile(r"副词[条缀性](推?荐)?[：:]?")
_PAREN_RE = re.compile(r"[（(]([^（()）]*)[)）]")


def _split_tokens(seg):
    """把一段词条原文切成 token（每个 token 应是一个属性名 + 可能的括号说明）"""
    seg = _SUBS_HEAD_RE.sub("/", seg or "")
    return [t.strip() for t in _SPLIT_RE.split(seg) if t.strip()]


def _match_stat(token):
    """token → 属性 id；识别不出返回 None（调用方按「未识别片段」上报）"""
    token = (token or "").strip().strip("。.,，;；!！?？")
    if not token:
        return None
    if token in STAT_ALIAS:
        return STAT_ALIAS[token]
    if token in TOKEN_ALIAS:
        return TOKEN_ALIAS[token]
    # 兜底：剥掉数值性尾缀再试（如「生命值百分比%」「攻击力%」）
    for tail in ("百分比%", "百分比", "%"):
        if token.endswith(tail):
            base = token[:-len(tail)].strip()
            if base in STAT_ALIAS:
                return STAT_ALIAS[base]
            if base in TOKEN_ALIAS:
                return TOKEN_ALIAS[base]
    return None


def _is_conditional(note):
    """括号说明是否表示「有条件才需要」"""
    note = (note or "").strip()
    if not note or note in VARIANT_MARKS:
        return False
    return any(c in note for c in COND_CLUES)


def _match_stat_in_note(note):
    """纯括号 token（如「（六命可选防御力）」）里只有在说明文字里才写出属性名，
    用别名表在说明里扫一次，取最后一个匹配（属性名一般放在条件说明末尾）。"""
    hits = _ALIAS_RE.findall(note or "")
    return STAT_ALIAS[hits[-1]] if hits else None


def _parse_segment(seg):
    """解析一段词条原文 → (常规词条, 条件词条, 未识别片段)

    条件词条 = 括号说明里含条件线索的词条，返回 [(stat, note), ...]，
    由调用方决定去向：副词条段移出常规推荐、主词条段保留但排在末位。
    """
    stats, cond, unknown = [], [], []
    for raw in _split_tokens(seg):
        notes = [m.group(1).strip() for m in _PAREN_RE.finditer(raw)]
        plain = _PAREN_RE.sub("", raw).strip()
        sid = _match_stat(plain)
        if sid is None and not plain:
            # 纯括号 token：属性名写在括号里，如「时之沙：攻击力/（六命可选防御力）」
            note = next((n for n in notes if _is_conditional(n)), None) \
                or (notes[0] if notes else "")
            sid = _match_stat_in_note(note)
            if sid is not None:
                plain = sid
        if sid is None:
            if plain and plain not in NOISE_TOKENS:
                unknown.append(plain)
            continue
        if sid not in stats:
            stats.append(sid)
        hit = next((n for n in notes if _is_conditional(n)), None)
        if hit is not None:
            # 条件说明里另写了属性名时，条件词条是「说明里那个」而不是括号外的本体：
            # 「攻击力（六命可选防御力）」= 一般用攻击力，六命才考虑防御力。
            # 说明里没写属性名（「仅西风猎弓」「携带西风剑时」）→ 条件词条就是本体自己。
            named = _match_stat_in_note(hit)
            cid = named if (named and named != sid) else sid
            if cid not in [c[0] for c in cond]:
                cond.append((cid, hit))
    return stats, cond, unknown


def parse_mains(text):
    """兼容入口：只返回主词条（条件词条排在末位但保留，避免出现空槽）"""
    return parse_fields(text)[0]


def parse_subs(text):
    """兼容入口：只返回常规副词条（不含条件词条）"""
    return parse_fields(text)[1]


def parse_fields(text):
    """解析推荐理由 → (mains, subs, conditional, unknown)

    mains: {'sands': [...], 'goblet': [...], 'circlet': [...]}
           条件词条（如「防御力（六命可选防御力）」）保留在列表末位——
           主词条是「该部位可选池」，出现空槽比多一个末尾备选更糟。
    subs:  常规副词条（条件词条已剔除）
    conditional: [{'where': 'subs'|'sands'|'goblet'|'circlet', 'stat': id, 'note': 原文说明}]
    unknown:     [{'where': ..., 'text': 未识别片段}]，供人工复核（应为空）
    """
    text = text or ""
    mains, conditional, unknown = {}, [], []
    for key, slot in SLOT_KEYS.items():
        seg = _slice_slot(text, key)
        stats, cond, unk = _parse_segment(seg) if seg else ([], [], [])
        stats = [s for s in stats if s not in [c[0] for c in cond]] + [c[0] for c in cond]
        mains[slot] = stats
        conditional += [{"where": slot, "stat": s, "note": n} for s, n in cond]
        unknown += [{"where": slot, "text": t} for t in unk]

    m = re.search(r"副词[条缀性]", text)
    if not m:
        return mains, [], conditional, unknown
    seg = re.split(r"时之沙|空之杯|理之冠|套装效果|备注|说明", text[m.end():])[0]
    stats, cond, unk = _parse_segment(seg)
    cond_stats = [c[0] for c in cond]
    subs = [s for s in stats if s not in cond_stats]
    conditional += [{"where": "subs", "stat": s, "note": n} for s, n in cond]
    unknown += [{"where": "subs", "text": t} for t in unk]
    return mains, subs, conditional, unknown


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


def reparse(wb_path, dry=False, allow_unrecognized=False):
    """离线重解析（快照重放）：读已有 wiki_builds.json 的 rows[].reason 原文，
    用当前 STAT_ALIAS / TOKEN_ALIAS + 角色级定位兜底，重算
    mains / subs / conditional / unknown / roles / derived_preset 并写回。

    改了别名表或推断逻辑后无需重新联网抓取即可刷新解析结果；
    任何一次「联网抓取 → 重解析」的结果都与本函数一致（同一套解析代码）。

    未识别片段（应为空）默认阻止落盘，除非 --allow-unrecognized；
    诊断信息统一写到 tools/out/parse_warnings.json。
    """
    wb = json.load(open(wb_path, encoding="utf-8"))
    changed = []
    fixed_subs = 0          # 本次补回的词条数（旧快照里缺失、重解析后找回）
    lost_subs = 0           # 本次移除的词条数（旧快照里的误收/非词条）
    roles_filled = 0        # roles 由空补齐的配装数
    cond_total = 0          # 条件词条数
    empty_roles, unknown, not_ok = [], [], []
    for name, d in wb.items():
        if not d.get("ok") or not d.get("rows"):
            not_ok.append(name)
            continue
        char_roles = CHAR_ROLES.get(name)
        for i, r in enumerate(d["rows"]):
            reason = r.get("reason", "")
            old_m, old_s = r.get("mains"), r.get("subs")
            old_roles = r.get("roles") or []
            new_m, new_s, cond, unk = parse_fields(reason)
            roles = infer_roles(reason, new_m, new_s, r.get("label", ""), char_roles)
            fixed_subs += len([s for s in new_s if s not in (old_s or [])])
            lost_subs += len([s for s in (old_s or []) if s not in new_s])
            if not old_roles and roles:
                roles_filled += 1
            cond_total += len(cond)
            if not roles:
                empty_roles.append("%s #%d" % (name, i))
            unknown += [dict(w, char=name, row=i) for w in unk]
            if old_m != new_m or old_s != new_s or old_roles != roles \
                    or r.get("conditional") != cond:
                changed.append((name, i, old_m, new_m, old_s, new_s))
            r["mains"], r["subs"], r["roles"] = new_m, new_s, roles
            r["conditional"], r["unknown"] = cond, unk
        # 顶层 mains/subs/derived_preset 跟随第 0 组
        m0 = d["rows"][0]
        d["mains"], d["subs"] = m0["mains"], m0["subs"]
        derived = pick_preset(m0["subs"])
        if "heal" in (m0["mains"].get("circlet") or []) and derived in ("hp", "atk", "er"):
            derived = "heal"
        d["derived_preset"] = derived
    warned = {
        "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "unknown": unknown,
        "empty_roles": empty_roles,
        "no_rows": not_ok,
    }
    with open(os.path.join(OUT, "parse_warnings.json"), "w", encoding="utf-8") as f:
        json.dump(warned, f, ensure_ascii=False, indent=1)

    print("重解析完成，变更 %d 处（补回词条 %d / 移除词条 %d / roles 补齐 %d / 条件词条 %d）"
          % (len(changed), fixed_subs, lost_subs, roles_filled, cond_total))
    for name, i, om, nm, os_, ns in changed:
        print("  %s #%d  mains %s -> %s   subs %s -> %s"
              % (name, i, om, nm, os_, ns))
    print("未识别片段 %d 处 / 空定位 %d 处 / 无数据角色 %d 个 → tools/out/parse_warnings.json"
          % (len(unknown), len(empty_roles), len(not_ok)))
    for w in unknown:
        print("  ! 未识别：%s #%d [%s] %r" % (w["char"], w["row"], w["where"], w["text"]))
    for e in empty_roles:
        print("  ! 定位为空：%s" % e)

    if dry:
        return changed
    if unknown and not allow_unrecognized:
        print("\n[中止] 重解析出现未识别片段，未写回 %s。" % wb_path)
        print("       请补 STAT_ALIAS / TOKEN_ALIAS 后重跑；确认可忽略时加 --allow-unrecognized。")
        sys.exit(2)
    # indent=1：与 fetch 写出的原始格式保持一致，否则 diff 会炸成几万行
    with open(wb_path, "w", encoding="utf-8") as f:
        json.dump(wb, f, ensure_ascii=False, indent=1)
    print("已写回 %s" % wb_path)
    return changed


def main():
    args = sys.argv[1:]
    # --reparse：离线重解析已有 wiki_builds.json（改别名表后用它，不联网）
    if args and args[0] == "--reparse":
        wb = os.path.join(OUT, "wiki_builds.json")
        reparse(wb, dry="--dry" in args, allow_unrecognized="--allow-unrecognized" in args)
        return

    sets, names = load_sets_and_names()
    os.makedirs(CACHE, exist_ok=True)
    flags = {a for a in args if a.startswith("--")}
    targets = [a for a in args if not a.startswith("--")]
    if "--all" in flags:
        targets = names
    if not targets:
        targets = names

    # --merge：抓取失败的角色保留快照里的旧数据（部分角色 403/超时时不丢数据）。
    # 现在**默认**就是这个行为：只要 out/wiki_builds.json 已存在就以它为底，
    # 只有 --fresh 才从空开始。这样 wiki 挂掉/超时也不会把快照洗成残缺版。
    wb_path = os.path.join(OUT, "wiki_builds.json")
    prev = json.load(open(wb_path, encoding="utf-8")) if (
        "--fresh" not in flags and os.path.exists(wb_path)) else {}

    ok_before = len([d for d in prev.values() if (d or {}).get("ok")])
    ok_now = 0
    result = dict(prev)   # 以快照为底，只覆盖本次抓到的角色
    for name in targets:
        char_roles = CHAR_ROLES.get(name)
        cands, _ = search_entry_ids(name)
        # 分形态角色（旅行者·风 等）在 data.js 里带「·」，wiki 词条名同名；
        # 找不到就退一步用「旅行者」这种基名再试一次。
        if not cands and "·" in name:
            cands, _ = search_entry_ids(name.split("·")[0])
        if not cands:
            print("[skip] %-8s 未找到词条" % name)
            result[name] = prev.get(name) or {"ok": False, "why": "词条未找到"}
            continue

        page, eid, rows, tab = None, None, [], None
        for cid in cands:
            cf = os.path.join(CACHE, "page_%s.json" % cid)
            d = cached_get(BASE + "/genshin/wapi/entry_page?entry_page_id=%s" % cid, cf)
            if not d or d.get("retcode") != 0:
                continue
            pg = d["data"]["page"]
            rr, tt = parse_artifact_tab(find_recommend_module(pg), sets, char_roles, name)
            if rr:
                page, eid, rows, tab = pg, cid, rr, tt
                break
            if page is None:  # 记住第一个能打开的，便于报错
                page, eid = pg, cid
        if not rows:
            print("[skip] %-8s 无圣遗物推荐" % name)
            result[name] = prev.get(name) or {"ok": False, "why": "无圣遗物推荐", "entry_id": eid,
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
        ok_now += 1
        print("[ok]   %-8s %s -> %s" % (name, tab, " / ".join("/".join(r["sets"]) for r in rows)))

    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, "wiki_builds.json"), "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=1)
    # 套装组合超过 2 组的告警单独留痕（reparse 会覆盖 parse_warnings.json，所以分文件写）
    with open(os.path.join(OUT, "sets_warnings.json"), "w", encoding="utf-8") as f:
        json.dump(SET_WARNINGS, f, ensure_ascii=False, indent=1)
    if SET_WARNINGS:
        print("[套装告警] %d 行出现 3 套及以上，已只取前两套 → tools/out/sets_warnings.json" % len(SET_WARNINGS))
        for w in SET_WARNINGS:
            print("  ! %s %r 保留 %s / 丢弃 %s" % (w["char"], w["label"], " + ".join(w["kept"]), " + ".join(w["dropped"])))
    print("\n写入 tools/out/wiki_builds.json（%d 条，本次新抓到 %d 条，快照原有可用 %d 条）"
          % (len(result), ok_now, ok_before))
    if ok_now == 0 and ok_before:
        print("[警告] 本次抓取 0 个角色成功（wiki 不可达 / 全部超时）。快照已原样保留，"
              "可改用 `python tools/fetch_wiki_builds.py --reparse` 离线重放。")
    # 抓完立刻离线复核一遍：新抓/改写的词条都必须走同一套解析 + 非空校验，
    # 未识别片段会被 reparse 拦下（除非 --allow-unrecognized），杜绝静默丢词条。
    if "--no-reparse" not in flags:
        print("\n[post-fetch 复核] 用同一套别名表离线重解析快照")
        reparse(wb_path, dry=False, allow_unrecognized="--allow-unrecognized" in flags)


if __name__ == "__main__":
    main()
