# -*- coding: utf-8 -*-
"""
抓取「副词条分级顺序」——从米游社攻略图的圣遗物页里读主/副词条优先级。

背景
----
`src/data.js` 的词条数据真源是米游社观测枢 wiki 的「推荐装备 → 圣遗物推荐」结构化表格。
该表给出的是**平铺**的词条列表（顺序有意义，但没有严格分级）。攻略图（一图流）里给的
往往是带明确分级符号的顺序，可作为交叉校准来源。

已实测的两个模板
--------------
* **Asgater / 派蒙喵喵屋系**：固定 12 张模板，圣遗物区在 **image_list[5]**（1080×1336）。
  主/副词条用「/」分隔表示优先级。
* **HoYo青枫**：图为超长图（1772×6319 或 4607×3247），圣遗物区约在 **45%~56% 高度**，
  需按比例裁切放大。副词条用「↓」表示严格顺序。

链路
----
`post.content` 对一图流是**空字符串**，唯一入口是 `post.image_list`。
图片下载无需鉴权，仅需 User-Agent + Referer。

用法
----
    python tools/fetch_guide_subtiers.py# 抓默认批次，产物落在 tools/out/guide_subtiers/
    python tools/fetch_guide_subtiers.py 旅行者·冰 丝柯克        # 指定角色（调试）
    python tools/fetch_guide_subtiers.py --all# 全部有命中攻略的角色

产物
----
`tools/out/guide_subtiers/<角色>.json`
    {name, post_id, author, tier, image_index, image{url,width,height},
     crop{box:[l,t,r,b], scale}, file}
`tools/out/guide_subtiers/_manifest.json`
    批次清单 + 统计

**注意**：本脚本只负责「把图取到本地 + 记录裁切坐标」。
文字识别（把图里的词条文字读成结构化数据）由模型逐图完成，结果另行回写。
"""
import json
import os
import re
import sys
import time
import urllib.request

try:
    from PIL import Image
except ImportError:
    Image = None

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "tools", "out")
DST = os.path.join(OUT, "guide_subtiers")
CACHE = os.path.join(OUT, "guides_cache")

BBS = "https://bbs-api.mihoyo.com"
HEADERS = {
    "User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                   " Chrome/120.0 Safari/537.36"),
    "x-rpc-app_version": "2.71.1",
    "x-rpc-client_type": "5",
    "Referer": "https://www.miyoushe.com/",
}
# 图片 CDN 用 Referer 防盗链，必须带
IMG_HEADERS = {
    "User-Agent": HEADERS["User-Agent"],
    "Referer": "https://www.miyoushe.com/",
}

# 两个模板的定位方式。
#
# ⚠️ **不要硬编码 image 下标，也不要预设候选范围** —— 实测至少 4 种版式，
#    圣遗物页下标和图片尺寸都完全不固定：
#   · Asgater 标准篇 12 张（1080×~1800），圣遗物区在 index 5/7/8 各不相同；
#   · Asgater 长篇 25 张（桑多涅 76348139），index 5/6 是「参考面板」「武器期望」，
#     圣遗物区在 index 7；
#   · Asgater 短篇 4 张（刻晴 / 甘雨 / 神里绫华等12 个角色同款）——
#     **圣遗物页是 index 2 的 4902×3440 大图**，压根不在range(2,10) 的常见位置判断里；
#   · HoYo青枫 老版纯图长图 1772×63xx/7461，**下标也不固定**（实测 index 0 和 1 都有），
#     圣遗物区在 45%~56% 高度。
#
# 结论：**全量抓所有非窄条页**，靠联系表定位。太费磁盘时才按 min_size 过滤。
TEMPLATES = {
    # Asgater：全量抓（跳过 1080×270 这类窄条封面/尾条）
    "Asgater": {"all_but_strip": (900, 400), "sheet": True},
    # HoYo青枫：同样全量；只对「真长页」做比例裁切。
    # ⚠️ HoYo青枫 有**两种版式**，别混：
    #   · 老版纯图长图（1772×63xx / 7461）→ **有**主/副词条三级分级（↓ 箭头）。
    #   · 新版图文长文（2363×3147 + 1181×5496）→ **只有套装推荐，没有词条**，
    #     判据是image_list 里出现 1181×5496，可直接跳过。
    "HoYo青枫": {"all_but_strip": (900, 400), "ratio": (0.45, 0.56),
                 "min_long": (1000, 3000)},
}
PRIORITY = ("Asgater", "HoYo青枫")

# 默认批次：只做主C（`CHAR_META.roles` 含 `maindps`）—— 实测**分级只有主 C 才有**，
# 非主C 的攻略图给的是平铺并列列表，分级等于没有、拿不到增量。
# 完整 50 个主C 名单见 `tools/_list_main_c.py` 的输出；这里只放已跑过/优先的一批，
# 铺开用 `--all-main-c`。
DEFAULT_BATCH = ["沃雅妮莎", "薇斯纳", "旅行者·冰", "丝柯克",
                 "阿罗夏", "奥黛塔", "桑多涅"]

# 全部主C（CAT112达达利亚 ~ CAT125 薇斯纳，按上线序，不含已跑过的 7 个）
MAIN_C_BATCH = [
    "可莉", "诺艾尔", "雷泽", "迪卢克", "优菈", "法尔伽", "洛恩", "尼可",
    "凝光", "刻晴", "甘雨", "魈", "胡桃", "嘉明", "兹白", "神里绫华",
    "宵宫", "雷电将军", "珊瑚宫心海", "荒泷一斗", "神里绫人", "鹿野院平藏",
    "赛诺", "艾尔海森", "卡维", "赛索斯", "林尼", "菲米尼", "那维莱特",
    "莱欧斯利", "娜维娅", "克洛琳德", "玛拉妮", "基尼奇", "恰斯卡", "玛薇卡",
    "瓦雷莎", "叶洛亚", "奈芙尔", "菲林斯", "提纳里", "达达利亚", "阿蕾奇诺",
]


def get_json(url, retries=3):
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as e:
            if i == retries - 1:
                print("  ! %s -> %s" % (url, e))
                return None
            time.sleep(1.2 * (i + 1))


def post_full(pid):
    """取帖子详情。优先复用 guides_cache 里已有的缓存。"""
    fn = os.path.join(CACHE, "p_%s.json" % pid)
    if os.path.exists(fn):
        with open(fn, encoding="utf-8") as f:
            return json.load(f)
    d = get_json(BBS + "/post/wapi/getPostFull?post_id=%s" % pid)
    if d is not None:
        os.makedirs(CACHE, exist_ok=True)
        with open(fn, "w", encoding="utf-8") as f:
            json.dump(d, f, ensure_ascii=False)
        time.sleep(0.3)
    return d


def fetch_image(url, path):
    req = urllib.request.Request(url, headers=IMG_HEADERS)
    with urllib.request.urlopen(req, timeout=60) as r:
        b = r.read()
    with open(path, "wb") as f:
        f.write(b)
    return len(b)


def safe(name):
    return re.sub(r"[^\w一-龥]", "_", name)


def json_safe_tpl(tpl):
    """range 不可 JSON 序列化，统一转 list。"""
    return {k: (list(v) if isinstance(v, range) else v) for k, v in tpl.items()}


def pick_guide(name, guides_json):
    """选一篇攻略。

    作者优先级 Asgater > HoYo青枫；同一作者有多篇时选**结构最像标准模板**的那篇：
    图片张数多（≥12）且含 1181×1012 这类「武器期望」小图 —— 实测 Asgater 的
    「全面解析︱养成/配队/机制」长篇是标准模板（例：桑多涅 25 张、薇斯纳 23 张），
    而「一图流」短篇可能只有 3~6 张、没有独立圣遗物配装页。
    """
    gs = (guides_json.get(name) or {}).get("guides") or []
    best = None
    for author in PRIORITY:
        cands = [r for r in gs if r.get("author") == author and r.get("id")]
        if not cands:
            continue
        if len(cands) == 1:
            return author, cands[0]
        scored = []
        for r in cands:
            il = image_list(r["id"])
            n = len(il)
            has_std = any(abs((i.get("width") or 0) - 1181) <= 2 and
                          abs((i.get("height") or 0) - 1012) <= 2 for i in il)
            scored.append(((1 if (n >= 12 and has_std) else 0), n, r))
        scored.sort(key=lambda x: (-x[0], -x[1]))
        return author, scored[0][2]
    return None, None


def image_list(pid):
    d = post_full(pid)
    post = ((d or {}).get("data") or {}).get("post") or {}
    return post.get("image_list") or []


def handle(name, guides_json, out_dir):
    author, g = pick_guide(name, guides_json)
    if not g:
        print("[skip] %-10s 无 Asgater / HoYo青枫 攻略" % name)
        return None
    pid = g["id"]
    d = post_full(pid)
    post = ((d or {}).get("data") or {}).get("post") or {}
    il = post.get("image_list") or []
    if not il:
        print("[skip] %-10s post=%s image_list 为空" % (name, pid))
        return None

    tpl = TEMPLATES[author]
    os.makedirs(out_dir, exist_ok=True)

    # 候选下标：**全量非窄条页**。实测 4 种版式的圣遗物页下标/尺寸都不同，
    # 预设 range 会整批漏掉（刻晴等 12 个角色的圣遗物页在 index 2 的 4902×3440 大图）。
    # 代价是图多、磁盘大（见 tools/README.md），但比漏读划算。
    mw, mh = tpl.get("all_but_strip", (0, 0))
    cand = [i for i, im in enumerate(il)
            if (im.get("width") or 0) >= mw and (im.get("height") or 0) >= mh]
    if not cand:
        cand = [0] if il else []
    if not cand:
        print("[skip] %-10s post=%s 无可用图片" % (name, pid))
        return None

    pages = []
    for idx in cand:
        im = il[idx]
        ext = (im.get("format") or "jpg").lower()
        raw = os.path.join(out_dir, "%s_%s_p%d.%s" % (safe(name), pid, idx, ext))
        if os.path.exists(raw):
            nbytes = os.path.getsize(raw)
        else:
            nbytes = fetch_image(im["url"], raw)
        page = {
            "index": idx,
            "raw": os.path.relpath(raw, ROOT).replace("\\", "/"),
            "bytes": nbytes,
            "image": {"url": im["url"], "width": im.get("width"),
                      "height": im.get("height"), "format": ext},
        }
        # HoYo青枫 超长图：直接裁出圣遗物带，省得存 6MB 原图再读。
        # 只对真·长页裁（min_long = (最小宽, 最小高)），2363×3147 这类
        # 新版图文长文 / 1080×270窄条跳过 —— 它们要么没词条，要么不是长页。
        if "ratio" in tpl:
            lo, hi = tpl["ratio"]
            W, H = im["width"], im["height"]
            mw, mh = tpl.get("min_long", (0, 0))
            if W >= mw and H >= mh and Image is not None:
                box = [0, int(H * lo), W, int(H * hi)]
                crop = os.path.join(out_dir,
                                    "%s_%s_p%d_crop.jpg" % (safe(name), pid, idx))
                _crop(raw, crop, box, 1.8)
                page["crop"] = {
                    "box": box, "scale": 1.8,
                    "file": os.path.relpath(crop, ROOT).replace("\\", "/"),
                }
        pages.append(page)
        print("[ok]   %-10s %-9s post=%-9s p%-2d %dx%d %.0fKB"
              % (name, author, pid, idx, im.get("width"), im.get("height"),
                 nbytes / 1024))

    return {
        "name": name,
        "post_id": pid,
        "author": author,
        "title": g.get("title") or "",
        "url": g.get("url") or "",
        "tier": json_safe_tpl(tpl),
        "n_images": len(il),
        "pages": pages,
        # 圣遗物区落在哪一页由识别阶段回填（artifact_page）
        "artifact_page": None,
    }


def _crop(src, dst, box, scale):
    im = Image.open(src).convert("RGB")   # RGBA 不能存 jpg
    c = im.crop(tuple(box))
    c = c.resize((int(c.width * scale), int(c.height * scale)), Image.LANCZOS)
    c.save(dst, quality=93)


def main():
    argv = sys.argv[1:]
    guides_json = json.load(open(os.path.join(OUT, "guides.json"), encoding="utf-8"))

    if "--all" in argv:
        names = [n for n, v in guides_json.items() if pick_guide(n, guides_json)[0]]
    elif "--all-main-c" in argv:
        # 全部主C里有命中攻略的（跳过那3 个只捞到合集帖的：埃洛伊 / 烟绯 / 旅行者·火）
        names = [n for n in MAIN_C_BATCH if pick_guide(n, guides_json)[0]]
    elif argv:
        names = argv
    else:
        names = DEFAULT_BATCH

    if "--all-main-c" in argv or "--all" in argv:
        out_dir = os.path.join(DST, "main_c")
    else:
        out_dir = DST
    print("批次：%d 个角色（作者优先级 %s）→ %s\n"
          % (len(names), " > ".join(PRIORITY),
             os.path.relpath(out_dir, ROOT).replace("\\", "/")))
    recs = []
    for n in names:
        r = handle(n, guides_json, out_dir)
        if r:
            recs.append(r)

    os.makedirs(out_dir, exist_ok=True)
    for r in recs:
        with open(os.path.join(out_dir, "%s.json" % safe(r["name"])), "w",
                  encoding="utf-8") as f:
            json.dump(r, f, ensure_ascii=False, indent=1)

    mf = {
        "templates": {k: json_safe_tpl(v) for k, v in TEMPLATES.items()},
        "priority": list(PRIORITY),
        "count": len(recs),
        "items": [{"name": r["name"], "post_id": r["post_id"],
                   "author": r["author"], "n_images": r["n_images"],
                   "candidate_pages": [p["index"] for p in r["pages"]],
                   "artifact_page": r["artifact_page"]} for r in recs],
    }
    with open(os.path.join(out_dir, "_manifest.json"), "w", encoding="utf-8") as f:
        json.dump(mf, f, ensure_ascii=False, indent=1)
    print("\n写入 %s/：%d 个角色" % (os.path.relpath(out_dir, ROOT).replace("\\","/"), len(recs)))


if __name__ == "__main__":
    main()