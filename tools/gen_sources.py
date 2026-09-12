# -*- coding: utf-8 -*-
"""
把每个角色「取数来源」整理成清单，同时出 Markdown 和可搜索的 HTML。

数据来源（都在 tools/out/cache/ 里，离线可重复生成）：
  - 词条页：本次配装数据的实际来源（推荐装备 → 圣遗物推荐）
  - 攻略合集：观测枢该角色的攻略聚合页
  - 推荐攻略：词条「攻略推荐」模块挂的文章链接（延伸阅读，非数据源）
  - 已选来源：真正写进 data.js 的那 1~3 条（读 guides.json）

用法：python tools/gen_sources.py
      →  tools/out/sources.md
      →  tools/out/sources.html
"""
import json
import os
import re
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "tools", "out")
CACHE = os.path.join(OUT, "cache")

RAW = open(os.path.join(ROOT, "src", "data.js"), encoding="utf-8").read()
blk = RAW[RAW.index("const RAW_CHARS = ["): RAW.index("/* ---------- 展开为完整结构")]
order, group, cur = [], {}, None
for line in blk.split("\n"):
    m = re.match(r"\s*\['([^']+)'", line)
    g = re.match(r"\s*/\* -+ (.+?) -+ \*/", line)
    if g:
        cur = g.group(1).strip()
    if m:
        order.append(m.group(1))
        group[m.group(1)] = cur or "未分组"

wiki = json.load(open(os.path.join(OUT, "wiki_builds.json"), encoding="utf-8"))
_gp = os.path.join(OUT, "guides.json")
guides = json.load(open(_gp, encoding="utf-8")) if os.path.exists(_gp) else {}


def page(eid):
    p = os.path.join(CACHE, "page_%s.json" % eid)
    return json.load(open(p, encoding="utf-8"))["data"]["page"] if os.path.exists(p) else None


def strategy_links(pg):
    """返回 (more_link, [(标题, 链接)])"""
    if not pg:
        return None, []
    for m in pg.get("modules", []):
        if (m.get("name") or "").strip() != "攻略推荐":
            continue
        for c in m.get("components", []):
            try:
                d = json.loads(c.get("data") or "{}")
            except Exception:
                continue
            more = (d.get("more_link") or "").split("?")[0] or None
            # 部分词条（旅行者·水/火 等）会塞一条 link 为空的「默认标题」占位
            arts = [(t, u) for t, u in
                    ((x.get("tab_name", "").strip(), (x.get("link") or "").strip())
                     for x in d.get("list", [])) if u]
            return more, arts
    return None, []


rows = []
for name in order:
    w = wiki.get(name) or {}
    eid = w.get("entry_id")
    entry = ("https://baike.mihoyo.com/ys/obc/content/%s/detail" % eid) if eid else ""
    more, arts = strategy_links(page(eid)) if eid else (None, [])
    if not more:
        more = ("https://baike.mihoyo.com/ys/strategy/search?keyword="
                + urllib.parse.quote(name))
        more_is_search = True
    else:
        more_is_search = False
    sel = []
    g = guides.get(name) or {}
    if g.get("wiki_url"):
        sel.append({"u": g["wiki_url"], "t": "观测枢词条"})
    for r in g.get("guides", []):
        if r.get("url"):
            sel.append({"u": r["url"], "t": r.get("author") or "米游社"})
    rows.append({
        "n": name, "g": group[name], "entry": entry, "more": more,
        "moreSearch": more_is_search, "sel": sel,
        "arts": [{"t": t, "u": u} for t, u in arts],
        "b": [" + ".join(x) for x in (w.get("builds") or [])],
    })

groups = []
for r in rows:
    if r["g"] not in groups:
        groups.append(r["g"])

# ---- Markdown ----
lines = ["# 角色配装数据来源清单（按 data.js 顺序）", "",
         "> **只有「词条页」是数据源。** "
         "配装 / 主词条全部取自词条「推荐装备 → 圣遗物推荐」的结构化表格"
         "（wiki 编辑手工填的文本，非图片、非 OCR）。",
         ">",
         "> 「推荐攻略」是词条顺带挂出的米游社文章，**本次抓取未读取其中任何内容**"
         "（那些文章多为图片一图流），仅作人工延伸阅读，与写入 data.js 的数据无关。",
         ">",
         "> 「攻略合集」= 观测枢该角色攻略聚合页，同样不是本次数据源。", ""]
for r in rows:
    lines.append("### %s" % r["n"])
    lines.append("- 词条页：%s" % (r["entry"] or "（未取到）"))
    lines.append("- 攻略合集：%s%s" % (r["more"], "（词条未挂入口，给的搜索页）"
                                      if r["moreSearch"] else ""))
    if r["sel"]:
        lines.append("- 已写入 data.js：%s"
                     % "、".join("[%s](%s)" % (a["t"], a["u"]) for a in r["sel"]))
    if r["arts"]:
        for a in r["arts"]:
            lines.append("- 推荐攻略：[%s](%s)" % (a["t"], a["u"]))
    else:
        lines.append("- 推荐攻略：（词条内未挂攻略文章）")
    lines.append("- 已写入配装：%s" % " ／ ".join(r["b"]))
    lines.append("")

open(os.path.join(OUT, "sources.md"), "w", encoding="utf-8").write("\n".join(lines))

# ---- HTML（可搜索 + 按元素分组筛选） ----
TPL = """<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>角色配装数据来源 · 观测枢</title>
<style>
:root{--bg:#f7f8fa;--card:#fff;--bd:#e3e6ea;--tx:#1f2328;--mu:#6b7280;--ac:#2563eb;--acbg:#eff6ff}
*{box-sizing:border-box}
body{margin:0;padding:24px;background:var(--bg);color:var(--tx);
 font:14px/1.6 -apple-system,"Segoe UI","Microsoft YaHei",sans-serif}
.wrap{max-width:1080px;margin:0 auto}
h1{font-size:20px;margin:0 0 4px}
.sub{color:var(--mu);font-size:13px;margin-bottom:16px}
.bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:center}
#q{flex:1;min-width:220px;padding:8px 12px;border:1px solid var(--bd);border-radius:8px;
 font-size:14px;background:var(--card);color:var(--tx)}
#q:focus{outline:none;border-color:var(--ac);box-shadow:0 0 0 3px var(--acbg)}
.gp{padding:6px 12px;border:1px solid var(--bd);border-radius:999px;background:var(--card);
 cursor:pointer;font-size:13px;color:var(--tx)}
.gp.on{background:var(--ac);border-color:var(--ac);color:#fff}
h2{font-size:15px;margin:22px 0 10px;padding-bottom:6px;border-bottom:1px solid var(--bd)}
.card{background:var(--card);border:1px solid var(--bd);border-radius:10px;padding:12px 14px;
 margin-bottom:10px}
.nm{font-weight:600;font-size:15px;margin-bottom:6px}
.bd{color:var(--mu);font-size:13px;margin-bottom:4px}
.bd b{color:#374151;font-weight:600}
a{color:var(--ac);text-decoration:none;word-break:break-all}
a:hover{text-decoration:underline}
ul{margin:4px 0 0;padding-left:18px}
li{margin:2px 0;font-size:13px}
.cnt{color:var(--mu);font-size:12px;margin-left:6px}
.tag{display:inline-block;padding:1px 7px;border-radius:999px;background:#fde68a;
 color:#92400e;font-size:11px;margin-left:6px}
</style></head><body><div class="wrap">
<h1>角色配装数据来源<span class="cnt" id="cnt"></span></h1>
<div class="sub"><b style="color:#b45309">只有「词条页」是数据源。</b>
配装 / 主词条全部取自词条「推荐装备 → 圣遗物推荐」的结构化表格 —— wiki 编辑手工填写的<b>文本</b>，不是图片、没做 OCR。<br>
「推荐攻略」是词条顺带挂出的米游社文章，<b>本次抓取未读取其中任何内容</b>（多为图片一图流），仅作人工延伸阅读，与写入 data.js 的数据无关。
「攻略合集」同理，不是本次数据源。</div>
<div class="bar"><input id="q" placeholder="搜索角色 / 套装…"><span id="gps"></span></div>
<div id="list"></div>
<script>
const DATA=__DATA__, GROUPS=__GROUPS__;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let kw='', gsel='';
const gps=document.getElementById('gps');
gps.innerHTML='<button class="gp on" data-g="">全部</button>'+GROUPS.map(g=>
 '<button class="gp" data-g="'+esc(g)+'">'+esc(g)+'</button>').join('');
gps.onclick=e=>{const b=e.target.closest('.gp'); if(!b)return;
 gsel=b.dataset.g; [...gps.children].forEach(x=>x.classList.toggle('on',x===b)); render();};
document.getElementById('q').oninput=e=>{kw=e.target.value.trim().toLowerCase(); render();};
function card(d){
 const arts=d.arts.length? '<ul>'+d.arts.map(a=>
  '<li><a href="'+esc(a.u)+'" target="_blank" rel="noopener">'+esc(a.t)+'</a></li>').join('')+'</ul>'
  : '<div class="bd">（词条内未挂攻略文章）</div>';
 return '<div class="card"><div class="nm">'+esc(d.n)+'</div>'
 +'<div class="bd"><b>词条页</b> <a href="'+esc(d.entry)+'" target="_blank" rel="noopener">'
   +esc(d.entry)+'</a><span class="tag">数据源</span></div>'
 +'<div class="bd"><b>攻略合集</b> <a href="'+esc(d.more)+'" target="_blank" rel="noopener">'
   +esc(d.more)+'</a>'+(d.moreSearch?' <span class="cnt">（词条未挂入口，搜索页）</span>':'')+'</div>'
 +'<div class="bd"><b>已写入配装</b> '+esc(d.b.join('　／　'))+'</div>'
 +(d.sel.length? '<div class="bd"><b>已写入 data.js 的来源</b>　'+d.sel.map(a=>
    '<a href="'+esc(a.u)+'" target="_blank" rel="noopener">'+esc(a.t)+'</a>').join('　')
   +'</div>':'')
 +'<div class="bd"><b>推荐攻略</b>（延伸阅读，非数据源）</div>'+arts+'</div>';
}
function render(){
 let n=0, h='';
 for(const g of GROUPS){
  const rows=DATA.filter(d=>d.g===g && (!gsel||d.g===gsel)
   && (!kw || d.n.toLowerCase().includes(kw) || d.b.join(' ').toLowerCase().includes(kw)));
  if(!rows.length) continue;
  n+=rows.length;
  h+='<h2>'+esc(g)+'<span class="cnt">'+rows.length+'</span></h2>'+rows.map(card).join('');
 }
 document.getElementById('cnt').textContent='　共 '+n+' / '+DATA.length+' 个角色';
 document.getElementById('list').innerHTML=h||'<div class="bd">没有匹配的角色</div>';
}
render();
</script></div></body></html>"""

html_out = (TPL.replace("__DATA__", json.dumps(rows, ensure_ascii=False))
               .replace("__GROUPS__", json.dumps(groups, ensure_ascii=False)))
open(os.path.join(OUT, "sources.html"), "w", encoding="utf-8").write(html_out)

print("写入 tools/out/sources.md / sources.html（%d 个角色，html %.0f KB）"
      % (len(order), len(html_out) / 1024))
