# -*- coding: utf-8 -*-
"""
为每个角色挑出「值得放进 data.js」的攻略链接。

选取规则（优先级从高到低）：
  1. 作者白名单（默认 Asgater / HoYo青枫）—— 主人指定信任的两位
  2. 专帖（标题里用「」或【】单独引出该角色）优先于多角色合集帖
  3. 同档内按 查看数 × 收藏数 排序，取较新、热度高的
  4. 白名单凑不满 2 篇时，回退到观测枢词条「攻略推荐」挂的文章

数据源：
  搜索  https://bbs-api.mihoyo.com/post/wapi/searchPosts?keyword=<k>&forum_id=43&page=1&size=30
  详情  https://bbs-api.mihoyo.com/post/wapi/getPostFull?post_id=<id>
  两者都只要 x-rpc-app_version / x-rpc-client_type 请求头，不需要签名。

输出：tools/out/guides.json
用法：
  python tools/fetch_guides.py            # 全量
  python tools/fetch_guides.py 胡桃 钟离   # 调试
"""
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

BBS = "https://bbs-api.mihoyo.com"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
    "x-rpc-app_version": "2.71.1",
    "x-rpc-client_type": "5",
    "Referer": "https://www.miyoushe.com/",
}
# 作者白名单：uid -> 昵称（uid 用 /user/wapi/searchUser 查得，比昵称可靠）
AUTHORS = {
    "79695828": "Asgater",
    "285802042": "HoYo青枫",
}
# 搜索 / 标题匹配用的短名（米游社标题常用简称）
ALIAS = {
    "珊瑚宫心海": ["心海"], "枫原万叶": ["万叶"], "神里绫华": ["绫华"],
    "神里绫人": ["绫人"], "荒泷一斗": ["一斗"], "鹿野院平藏": ["平藏"],
    "梦见月瑞希": ["瑞希"], "流浪者": ["流浪者", "散兵"],
    "旅行者·风": ["风主", "旅行者(风)", "旅行者（风）"],
    "旅行者·岩": ["岩主", "旅行者(岩)", "旅行者（岩）"],
    "旅行者·雷": ["雷主", "旅行者(雷)", "旅行者（雷）"],
    "旅行者·草": ["草主", "旅行者(草)", "旅行者（草）"],
    "旅行者·水": ["水主", "旅行者(水)", "旅行者（水）"],
    "旅行者·火": ["火主", "旅行者(火)", "旅行者（火）"],
}
# 多角色合集帖里常见的干扰名，命中即降权
NOISE = re.compile(r"卡池|合集|一图看懂|祈愿|加强角色")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "tools", "out")
CACHE = os.path.join(OUT, "guides_cache")
WANT_N = 2          # 每个角色最多留几篇攻略


def get(url, retries=3):
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
    return None


def cached(url, fn):
    if os.path.exists(fn):
        with open(fn, encoding="utf-8") as f:
            return json.load(f)
    d = get(url)
    if d is not None:
        os.makedirs(os.path.dirname(fn), exist_ok=True)
        with open(fn, "w", encoding="utf-8") as f:
            json.dump(d, f, ensure_ascii=False)
        time.sleep(0.3)
    return d


def search(kw, page=1, size=30):
    u = (BBS + "/post/wapi/searchPosts?keyword=" + urllib.parse.quote(kw)
         + "&forum_id=43&page=%d&size=%d&sort_type=2" % (page, size))
    fn = os.path.join(CACHE, "s_%s_%d.json" % (re.sub(r"[^\w一-龥]", "_", kw), page))
    d = cached(u, fn)
    return ((d or {}).get("data") or {}).get("posts", []) or []


def post_full(pid):
    u = BBS + "/post/wapi/getPostFull?post_id=%s" % pid
    d = cached(u, os.path.join(CACHE, "p_%s.json" % pid))
    return ((d or {}).get("data") or {}).get("post") or {}


def norm(it):
    """把搜索结果 / 详情统一成一条记录"""
    p = it.get("post") or {}
    u = it.get("user") or {}
    st = it.get("stat") or {}
    pid = str(p.get("post_id") or "")
    title = (p.get("subject") or "").strip()
    return {
        "id": pid,
        "title": title,
        "author": u.get("nickname") or "",
        "uid": str(u.get("uid") or ""),
        "url": "https://www.miyoushe.com/ys/article/%s" % pid if pid else "",
        "view": int(st.get("view_num") or 0),
        "bookmark": int(st.get("bookmark_num") or 0),
        "like": int(st.get("like_num") or 0),
        "created": int(p.get("created_at") or 0),
    }


def score(r):
    """热度分：查看为主，收藏加权（收藏更能说明「值得留存」）"""
    return r["view"] + r["bookmark"] * 20 + r["like"] * 2


def is_dedicated(title, name):
    """专帖判定：标题里该角色被「」或【】单独引出"""
    for n in [name] + ALIAS.get(name, []):
        if ("「%s」" % n) in title or ("【%s】" % n) in title:
            return True
    return False


def aliases_of(name):
    """形态名（旅行者·风）不能用父名「旅行者」去匹配，否则会收成「旅行者·冰」"""
    return ALIAS.get(name, [])


def mentions(title, name):
    for n in [name] + aliases_of(name):
        if n in title:
            return True
    return False


def pick(name, wiki_arts):
    """返回选中的最多 WANT_N 篇"""
    seen, pool = set(), []

    def harvest(kw, pages):
        for pg in pages:
            for it in search(kw, page=pg):
                r = norm(it)
                if not r["id"] or r["id"] in seen:
                    continue
                if r["uid"] not in AUTHORS or not mentions(r["title"], name):
                    continue
                seen.add(r["id"])
                r["dedicated"] = is_dedicated(r["title"], name)
                r["noisy"] = bool(NOISE.search(r["title"]))
                # 合集帖（纳西妲/胡桃/行秋…）对单角色参考价值低，直接不收
                if r["noisy"]:
                    continue
                r["from"] = "search"
                pool.append(r)

    # 阶段 1：主名 + 一图流 / 攻略，再按作者名定向搜（提高冷门角色命中率）
    for kw in ["%s 一图流" % name, "%s 攻略" % name] + \
               ["%s %s" % (name, nick) for nick in AUTHORS.values()]:
        harvest(kw, (1,))
    # 阶段 2：还不够就翻第二页 + 试简称 + 换关键词（只影响难找的角色）
    if len({r["uid"] for r in pool}) < min(WANT_N, len(AUTHORS)):
        for kw in ["%s 一图流" % name, "%s 攻略" % name] + \
                   ["%s %s" % (name, nick) for nick in AUTHORS.values()]:
            harvest(kw, (2,))
        for n in aliases_of(name):
            harvest("%s 一图流" % n, (1,))
        for kw in ["%s 养成" % name, "%s 解析" % name, "%s 角色指南" % name]:
            harvest(kw, (1,))

    def newest_first(sub):
        # 配装推荐随版本变，同一条件里「较新」优先于热度
        return sorted(sub, key=lambda r: -r["created"])

    chosen = []
    # 先每位作者各取一篇，保证视角不重样
    for uid in AUTHORS:
        cand = [r for r in pool if r["uid"] == uid]
        if not cand:
            continue
        grp = newest_first([r for r in cand if r.get("dedicated")]) or newest_first(cand)
        chosen.append(grp[0])
    # 还差就补：专帖优先、较新优先
    rest = [r for r in pool if all(r is not c for c in chosen)]
    rest.sort(key=lambda r: (0 if r.get("dedicated") else 1, -r["created"]))
    for r in rest:
        if len(chosen) >= WANT_N:
            break
        chosen.append(r)
    chosen = chosen[:WANT_N]

    # 2) 白名单不够，回退到观测枢词条挂的攻略（抓详情拿作者 + 热度）
    if len(chosen) < WANT_N:
        fb = []
        for idx, (t, url) in enumerate(wiki_arts):
            m = re.search(r"/article/(\d+)", url or "")
            if not m:
                continue
            d = post_full(m.group(1))
            if not d:
                continue
            r = norm(d)
            if not r["id"] or r["id"] in seen:
                continue
            seen.add(r["id"])
            r["dedicated"] = is_dedicated(r["title"], name)
            r["noisy"] = bool(NOISE.search(r["title"]))
            r["from"] = "wiki"
            r["wiki_rank"] = idx          # 观测枢编辑排的顺序
            fb.append(r)
        fb.sort(key=lambda r: (r["wiki_rank"], -score(r)))
        for r in fb:
            if len(chosen) >= WANT_N:
                break
            chosen.append(r)
        chosen.sort(key=lambda r: (0 if r["uid"] in AUTHORS else 1,
                                   r.get("wiki_rank", 99), -score(r)))
    return chosen


def wiki_recommend_arts(eid):
    p = os.path.join(OUT, "cache", "page_%s.json" % eid)
    if not os.path.exists(p):
        return []
    try:
        pg = json.load(open(p, encoding="utf-8"))["data"]["page"]
    except Exception:
        return []
    for m in pg.get("modules", []):
        if (m.get("name") or "").strip() != "攻略推荐":
            continue
        for c in m.get("components", []):
            try:
                d = json.loads(c.get("data") or "{}")
            except Exception:
                continue
            return [(x.get("tab_name", "").strip(), (x.get("link") or "").strip())
                    for x in d.get("list", []) if (x.get("link") or "").strip()]
    return []


def main():
    wiki = json.load(open(os.path.join(OUT, "wiki_builds.json"), encoding="utf-8"))
    names = sys.argv[1:] or list(wiki.keys())
    os.makedirs(CACHE, exist_ok=True)

    res, stat = {}, {"authors": 0, "wiki_fallback": 0, "empty": 0}
    for name in names:
        w = wiki.get(name) or {}
        eid = w.get("entry_id")
        arts = wiki_recommend_arts(eid) if eid else []
        chosen = pick(name, arts)
        res[name] = {
            "entry_id": eid,
            "wiki_url": ("https://baike.mihoyo.com/ys/obc/content/%s/detail" % eid) if eid else "",
            "guides": chosen,
        }
        n_au = sum(1 for r in chosen if r["uid"] in AUTHORS)
        if not chosen:
            stat["empty"] += 1
        elif n_au < len(chosen):
            stat["wiki_fallback"] += 1
        else:
            stat["authors"] += 1
        print("[%s] %-8s %s" % ("作者" if n_au == len(chosen) and chosen else
                                ("混合" if chosen else "空"), name,
                                " | ".join("%s/%.0fw" % (r["author"] or "?", r["view"] / 1000)
                                           for r in chosen)))

    with open(os.path.join(OUT, "guides.json"), "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, indent=1)
    print("\n写入 tools/out/guides.json：作者稿 %d / 含回退 %d / 空 %d"
          % (stat["authors"], stat["wiki_fallback"], stat["empty"]))


if __name__ == "__main__":
    main()
