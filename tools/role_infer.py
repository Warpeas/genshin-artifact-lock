# -*- coding: utf-8 -*-
"""从 wiki「推荐装备」的推荐理由文本 + 主/副词条，启发式推断配装的功能定位（多选）。

基础词表与 app 端 BUILD_ROLES 对齐：
  输出 / 增伤 / 减抗 / 治疗 / 护盾 / 副C / 辅助 / 精通 / 充能 / 聚怪·控制 / 增幅反应 / 剧变反应

这是 best-effort：推断不出就返回空列表，由用户在编辑器里手填。
供 fetch_wiki_builds.py（写 wiki_builds.json）与 apply_wiki_builds.py（写回 data.js）共用。
"""
import os
import sys

# 杯主词条是这些 id 之一 → 元素/物理伤害加成 → 增伤
ELEM_DMG = {"pyro", "hydro", "cryo", "electro", "anemo", "geo", "dendro", "phys", "physical"}
# 增幅反应 / 剧变反应 关键词
AMP = ("蒸发", "融化")
TRANSFORM = ("超载", "感电", "绽放", "激化", "扩散", "碎冰", "剧变")

# 展示顺序（与 app 端 BUILD_ROLES 一致），让推断结果稳定有序
ROLE_ORDER = {
    "输出": 0, "增伤": 1, "减抗": 2, "治疗": 3, "护盾": 4,
    "副C": 5, "辅助": 6, "精通": 7, "充能": 8, "聚怪/控制": 9,
    "增幅反应": 10, "剧变反应": 11,
}


def _has(text, *subs):
    return any(s in text for s in subs)


def infer_roles(text, mains=None, subs=None, label=""):
    mains = mains or {}
    subs = subs or []
    full = (label or "") + " " + (text or "")
    # 关键词只扫「描述句」部分：推荐理由里「主词条时之沙：…」之后是结构化词条清单，
    # 暴击率/元素充能效率/元素精通 几乎每套都有，扫全文本会大量误判。取首个「主词条」之前。
    desc = full.split("主词条")[0]
    roles = set()

    # 治疗
    if _has(desc, "治疗", "回复生命", "群奶", "奶"):
        roles.add("治疗")
    # 护盾
    if _has(desc, "护盾", "盾"):
        roles.add("护盾")
    # 增伤：杯主词条是元素/物理伤害，或描述句提到「伤害加成 / 增伤」
    goblet = mains.get("goblet") or []
    if any(g in ELEM_DMG for g in goblet) or _has(desc, "伤害加成", "增伤", "提升伤害"):
        roles.add("增伤")
    # 输出：描述句里出现 输出 / 站场 / 前台 / 主C（暴击只在描述句里算，副词条里的不算）
    if _has(desc, "暴击", "输出", "站场", "前台", "主C"):
        roles.add("输出")
    # 充能：描述句提到 充能 / 循环 / 能量回复
    if _has(desc, "充能", "循环", "能量回复"):
        roles.add("充能")
    # 精通：沙/杯主词条含元素精通，或描述句提到 元素精通 / 反应
    if "em" in (mains.get("sands", []) + goblet) or _has(desc, "元素精通", "反应"):
        roles.add("精通")
    # 辅助 / 增益
    if _has(desc, "辅助", "增益", "提升队友", "全队", "队伍"):
        roles.add("辅助")
    # 副C：后台 / 脱手
    if _has(desc, "后台", "脱手", "副C", "副c"):
        roles.add("副C")
    # 减抗
    if _has(desc, "减抗", "抗性降低", "降低敌人", "削减抗性"):
        roles.add("减抗")
    # 聚怪 / 控制
    if _has(desc, "聚怪", "控制", "牵引", "聚拢", "击飞"):
        roles.add("聚怪/控制")
    # 增幅反应
    if _has(desc, *AMP):
        roles.add("增幅反应")
        roles.add("精通")
    # 剧变反应
    if _has(desc, *TRANSFORM):
        roles.add("剧变反应")
        roles.add("精通")

    return sorted(roles, key=lambda x: ROLE_ORDER.get(x, 99))


# 供其它脚本 `from role_infer import infer_roles` 时自动把本目录加入搜索路径
_THIS = os.path.dirname(os.path.abspath(__file__))
if _THIS not in sys.path:
    sys.path.insert(0, _THIS)
