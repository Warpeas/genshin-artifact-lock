# -*- coding: utf-8 -*-
"""从 wiki「推荐装备」的推荐理由文本 + 主/副词条，启发式推断配装的功能定位（多选）。

基础词表与 app 端 BUILD_ROLES 对齐：
  输出 / 增伤 / 减抗 / 治疗 / 护盾 / 副C / 辅助 / 精通 / 充能 / 聚怪·控制 / 增幅反应 / 剧变反应

这是 best-effort：推断不出就返回空列表，由用户在编辑器里手填。
供 fetch_wiki_builds.py（写 wiki_builds.json）与 apply_wiki_builds.py（写回 data.js）共用。
"""
import os
import re
import sys

# 杯主词条是这些 id 之一 → 元素/物理伤害加成 → 增伤
ELEM_DMG = {"pyro", "hydro", "cryo", "electro", "anemo", "geo", "dendro", "phys", "physical"}
# 增幅反应 / 剧变反应 关键词
AMP = ("蒸发", "融化")
TRANSFORM = ("超载", "感电", "绽放", "激化", "扩散", "碎冰", "剧变")

# CHAR_META 的角色级定位（英文键）→ app 端中文定位
ROLE_KEY_MAP = {"maindps": "输出", "subdps": "副C", "support": "辅助"}


def load_char_roles(data_js=None):
    """从 src/data.js 的 CHAR_META 读出角色级基础定位，用于「推荐理由推断不出定位」时的兜底。

    wiki 的部分推荐理由只有一句效果描述（如「提供高额防御力加成。」），
    不含任何定位关键词，此时退回角色自身的 maindps/subdps/support 定位，
    避免出现 roles=[] 的空定位配装。
    """
    path = data_js or os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src", "data.js")
    out = {}
    try:
        with open(path, encoding="utf-8") as f:
            src = f.read()
    except OSError:
        return out
    i = src.find("const CHAR_META")
    if i < 0:
        return out
    for m in re.finditer(r'"([^"]+)":\s*\{[^{}]*?roles:\s*\[([^\]]*)\]', src[i:], re.S):
        keys = re.findall(r'"([^"]+)"', m.group(2))
        roles = [ROLE_KEY_MAP[k] for k in keys if k in ROLE_KEY_MAP]
        if roles:
            out[m.group(1)] = roles
    return out


CHAR_ROLES = load_char_roles()

# 展示顺序（与 app 端 BUILD_ROLES 一致），让推断结果稳定有序
ROLE_ORDER = {
    "输出": 0, "增伤": 1, "减抗": 2, "治疗": 3, "护盾": 4,
    "副C": 5, "辅助": 6, "精通": 7, "充能": 8, "聚怪/控制": 9,
    "增幅反应": 10, "剧变反应": 11,
}


def _has(text, *subs):
    return any(s in text for s in subs)


def infer_roles(text, mains=None, subs=None, label="", char_roles=None):
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
    # 输出：描述句里出现 输出 / 站场 / 前台 / 主C
    # （不再用「暴击」单独判定——副词条里几乎每套都提暴击，会误把副C/支援标成输出，见 audit）
    if _has(desc, "输出", "站场", "前台", "主C"):
        roles.add("输出")
    # 充能：描述句提到 充能 / 循环 / 能量回复
    if _has(desc, "充能", "循环", "能量回复"):
        roles.add("充能")
    # 精通：沙/杯主词条含元素精通，或描述句提到 元素精通 / 反应
    if "em" in (mains.get("sands", []) + goblet) or _has(desc, "元素精通", "反应"):
        roles.add("精通")
    # 辅助（只用字面「辅助」判定；「增益 / 全队 / 队伍 / 队友」过于宽泛，
    # 会误把自利主C标成辅助，仅污染定位展示，见 audit）
    if _has(desc, "辅助"):
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

    # 兜底：理由文本 + 主副词条都推不出定位时，退回角色级基础定位（CHAR_META），
    # 保证每组配装至少有 1 个定位（历史 bug：云堇/闲云/伊涅芙/莉奈娅 出现 roles=[]）。
    if not roles:
        roles |= {r for r in (char_roles or []) if r in ROLE_ORDER}

    return sorted(roles, key=lambda x: ROLE_ORDER.get(x, 99))


def infer_subrules(roles, subs, optional=None):
    """按配装功能定位生成 subRules；只使用本地已解析的 roles/subs。

    角色定位只能提供启发式证据，所以启发式不再把任何定位强标为 required
    （★必选）——重要性只经由 wiki 的 subs 顺序（位置权重）表达；双暴同时存在时
    标记为同等优先（equal）。返回 None 表示没有足够证据生成规则。

    ★ 修复（原 122 处 required 死字段）：
      旧实现额外做了一次「required 必须落在 = 首位核心块内」的收紧，把
      role 注入的必需项大量清成空数组，于是 data.js 里留下 `required:['em']`
      这类永远不可能生效的死字段（词条不在首位核心块 → 运行时又被清一遍）。
      现在生成端与运行端口径统一为：required ⊆ 该配装的 subs，写在 data.js 里的
      每一条 required 都必然能在运行时可标记为 ★必选。

    optional：带条件的词条（如「暴击率（携带西风剑时）」）由解析层单独传入，
    不计入 required/equal，只作为「条件词条」随配装展示。
    """
    roles = set(roles or [])
    subs = list(subs or [])
    available = set(subs)
    required = []

    # 启发式不再产出 required（★必选）。
    # 旧逻辑按角色定位把 em/er/hpP/defP 强标为必需——会把「主词条 em 备选」
    # 级联成「副词条必需」，过度收紧锁定方案（见 role_infer_audit.md）。
    # 现改为：重要性只通过 wiki 已有的 subs 顺序（位置权重）表达，不再生成 ★。
    # 双暴（cr/cd）标 ★ 也暂缓——先只保留 equal（同等优先），后续如需再开。
    # 若日后恢复必选，务必按「强证据 + 真刚需」收敛：双暴 / 纯反应核心 / 奶妈 hp%
    # 等，绝不用「主词条 em 备选」去反推副词条必需。

    equal = []
    if {"cr", "cd"}.issubset(available):
        equal.append(["cr", "cd"])

    # 条件词条只保留「不在常规副词条里」的部分，避免同一词条两处重复
    optional = [s for s in (optional or []) if s not in available]

    if not required and not equal and not optional:
        return None
    rules = {"required": required, "equal": equal, "source": "heuristic"}
    if optional:
        rules["optional"] = optional
    return rules


# 供其它脚本 `from role_infer import infer_roles` 时自动把本目录加入搜索路径
_THIS = os.path.dirname(os.path.abspath(__file__))
if _THIS not in sys.path:
    sys.path.insert(0, _THIS)
