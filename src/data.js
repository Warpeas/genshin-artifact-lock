/* ============================================================
 * 原神圣遗物锁定方案生成器 —— 内置数据
 * 说明：内置配装整理自社区常见推荐思路，仅作为初始化参考。
 *      版本更迭后请在「角色配置」页自行增删改，所有改动保存在本地浏览器。
 * ============================================================ */

/* ---------- 版本与更新日志 ----------
 * APP_VERSION：用于「更新公告」是否已读的判定，改版本就会自动弹一次公告。
 * CHANGELOG：新在前，CHANGELOG[0].v 必须等于 APP_VERSION。items 为纯文本（渲染时会 esc）。
 * 注意：本文件所有字符串都不得出现 script 结束标签（build.js 有检查，注释里也别写）。
 * ---------------------------------- */
const APP_VERSION = '2026.09.15';
const CHANGELOG = [
  {
    v: '2026.09.15', date: '2026-09-15',
    title: '中英文切换（显示语言 / 数据语言）+ 角色与圣遗物按图鉴核对',
    items: [
      '顶栏右上角新增两个独立开关：显示语言管界面文案，数据语言管角色 / 套装 / 属性等数据本身，两者可分别设置并记住。',
      '数据语言切 English 后显示官方英文名（胡桃 → Hu Tao、逐影猎人 → Marechaussee Hunter），元素 / 国度 / 定位 / 部位 / 词条 / 预设同步跟随。',
      '搜索框中英文都认：不管当前显示哪种，输入「胡桃」或「Hu Tao」、「Marechaussee」都能搜到。',
      '复制 / 导出的文本始终保持中文，与游戏内锁定界面一致；更新日志是历史记录，保留中文不翻译。',
      '按米游社图鉴核对圣遗物：五星套装由 45 套订正为 46 套，顺序改为网页顺序（最新版本在前，血红之证 → … → 冰风迷途的勇士）。',
      '订正两个套装名：「水仙十字之圣遗物」→ 逐影猎人（2 件套同为普攻/重击+15%），「戍卫之誓」→ 角斗士的终幕礼（开服套装，攻击力+18%），并新增图鉴里的「水仙之梦」。',
      '老存档里配装引用到的旧套装名会自动改成新名，你自己改过的配装不受影响。',
      '按《原神全角色列表（按国度）》核对 124 条角色：数量一致，顺序改为图鉴顺序（国度 → 版本登场先后），兹白按实装版本 6.3 排到蓝砚之后；全部角色补录官方英文名。',
      '② 方案页里混着数字 / 角色名的动态文案也跟着走英文：候选计数、「供 X 使用」、散件规则名（元素伤害杯 → Elemental DMG Goblet）、2 件套说明（攻击力+18% → ATK +18%）。',
      '英文态窄屏不再被长套装名撑出横向滚动条：③ 表格自带横向滚动，手机宽度下还会自动让出「相对强度」那列。',
    ],
  },
  {
    v: '2026.09.14', date: '2026-09-14',
    title: '套装列表可切换「图鉴 / 推荐」两种排序依据',
    items: [
      '② 锁定方案页和 ③「各套装推荐追加属性」表格都加了「图鉴 / 推荐」两档切换，和旁边的「↓ 正序 / ↑ 倒序」按钮配合使用。',
      '图鉴顺序 = 套装库顺序（米游社图鉴），稳定不跳动；推荐顺序 = 用的人多的排前面，会随你勾选的角色变化。',
      '说明文字跟着档位走：图鉴档显示「排序顺序来自米游社图鉴」，推荐档显示「按使用人数排序：用得多的在前」。',
    ],
  },
  {
    v: '2026.09.13', date: '2026-09-13',
    title: '列表可切正序 / 倒序，排序顺序来自米游社图鉴',
    items: [
      '角色配置页、② 锁定方案页、③ 追加属性规则页都加了「↓ 正序 / ↑ 倒序」切换按钮，点一下换方向，选择会记住。',
      '角色卡默认顺序改为按国度排列（蒙德 → 璃月 → 稻妻 → 须弥 → 枫丹 → 纳塔 → 挪德卡莱 → 至冬 → 其他·旅行者）。',
      '② 方案页的套装顺序改为按套装库排列，不再随你勾选的角色多少来回跳动，翻找更稳。',
      '每处排序按钮旁都标注了「排序顺序来自米游社图鉴」，说明这套顺序的出处。',
    ],
  },
  {
    v: '2026.09.12', date: '2026-09-12',
    title: '角色库补全到 124 条 + 国度 / 定位筛选 + 旅行者按形态拆分',
    items: [
      '按《原神全角色列表（按国度）》逐条核对：修正烟绯、神里绫人、流浪者、千织、埃洛伊的国度归属（原来分别被放错到蒙德 / 璃月 / 稻妻 / 稻妻 / 其他）。',
      '新增「挪德卡莱」国度，与至冬分开；把伊涅芙、菈乌玛、菲林斯、爱诺、奈芙尔、哥伦比娅归回挪德卡莱。',
      '补上缺了的角色：洛恩、尼可、布伦妮（蒙德）、莉奈娅、叶洛亚、雅珂达（挪德卡莱），角色库从 112 条增至 124 条。',
      '旅行者按元素形态拆成 6 个独立条目（旅行者·风 / 岩 / 雷 / 草 / 水 / 火），各形态可分别启用、分别配装。',
      '角色配置页新增「国度」下拉筛选和「定位」筛选（主C / 副C / 辅助），可与元素筛选、搜索、只看已启用叠加；筛选时右上角显示「筛出 N / 总数」。',
      '新补角色暂无稳定攻略来源，配装是按元素 / 武器的通用推荐，备注里已标注，请按实际玩法调整。',
    ],
  },
  {
    v: '2026.09.11', date: '2026-09-11',
    title: '属性改用选择浮窗、还原拆分主推 / 整组、内置数据自动跟随更新',
    items: [
      '添加主要属性 / 追加属性改为弹出选择浮窗，只列出还没加过的属性；已选的追加属性和主要属性一样可以直接改成别的。',
      '「还原」拆成三种：只改乱了主推 → 「↩ 还原主推」（只动主推不碰词条）；单组改坏 → 「整组还原」；整个角色改乱 → 「还原内置」。',
      '修掉「只改了主推却提示整组已修改」的问题。',
      '修掉新增配装组后点「取消」仍会多出一组的 bug。',
      '内置数据现在会随版本自动更新：你没动过的配装组自动跟上仓库新数据，你自己改过的组一律保留不动。',
      '修掉「只调整了追加属性顺序，刷新页面后又被改回去」的问题。',
    ],
  },
  {
    v: '2026.09.10', date: '2026-09-10',
    title: '角色编辑浮窗化、内置数据可按角色还原、新增更新公告',
    items: [
      '角色编辑由右侧抽屉改为居中浮窗，配装改为卡片式展示：一眼看全套装、三部位主要属性、追加属性。',
      '配装编辑独立为第二层浮窗，点「保存」才生效；点取消 / 关闭 / 浮窗外会提示「有未保存的修改」确认后放弃。',
      '新增「还原这一组」：被你改过或删掉的配装组，都能单独还原成内置原样（预置方案可在「从预置添加」里选回来）。',
      '新增「还原为内置数据」：整个角色（名字、元素、国度、定位、备注、来源、全部配装）一键还原。',
      '角色卡片上会显示「已修改」小徽标，提醒你这一项已经和内置数据不一样了。',
      '新增更新公告与数据管理页的「更新日志」；内置角色 / 圣遗物会随版本手工维护，可在日志里看到改了什么。',
    ],
  },
  {
    v: '2026.09.10', date: '2026-09-10',
    title: '追加属性颜色分组并入同一行',
    items: [
      '去掉了多余的颜色图例框，颜色直接打在角色名和它专属的追加属性上。',
      '追加属性改为「先显示共有的，再显示各分组单独想要的」，顺序大致按角色重要度。',
      '修掉「明明大家都要元素充能效率却合不到一起」以及次要属性被静默砍掉的问题。',
    ],
  },
  {
    v: '2026.09.10', date: '2026-09-10',
    title: '合并判定改按「重要属性」+ 命中条数可调',
    items: [
      '是否合并只看最重要的那几条属性是否重合，不再被次要属性干扰。',
      '每个锁定方案都能单独调「命中至少几条」（1 到 4 条），默认至少两条。',
      '「散件 / 过渡 保留规则」改为浮窗编辑，整块可以收起。',
    ],
  },
  {
    v: '2026.09.10', date: '2026-09-10',
    title: '合并规则重做 + 内置散件规则可编辑',
    items: [
      '合并判断改为纯追加属性相似度自动完成，不再依赖手动分组。',
      '命中条件固定为「至少两条」，避免只中一条就锁定。',
      '内置的散件 / 过渡保留规则支持自己增删改。',
    ],
  },
  {
    v: '2026.09.09', date: '2026-09-09',
    title: '统一圣遗物属性用词',
    items: [
      '主词条改称「主要属性」，副词条 / 候选属性统一改称「追加属性」。',
    ],
  },
  {
    v: '2026.09.09', date: '2026-09-09',
    title: '锁定方案重构：去掉 3 槽位限制',
    items: [
      '候选方案不再受 3 个槽位限制，按追加属性需求自动聚类。',
      '追加属性改为方案级统一，同一方案内不再各角色一套。',
      '新增「散件 / 过渡 保留规则」，可额外预置高价值散件的保留条件。',
    ],
  },
];

/* ---------- 元素 ---------- */
const ELEMENTS = {
  pyro:    { name: '火', color: '#ff7a59' },
  hydro:   { name: '水', color: '#4fc3f7' },
  cryo:    { name: '冰', color: '#8ad8ff' },
  electro: { name: '雷', color: '#b98cff' },
  anemo:   { name: '风', color: '#5fe0c0' },
  geo:     { name: '岩', color: '#ffd166' },
  dendro:  { name: '草', color: '#a5d66a' },
};

/* ---------- 国度 ---------- */
const REGIONS = [
  { id: 'mondstadt', name: '蒙德',      color: '#7fb3d5' },
  { id: 'liyue',     name: '璃月',      color: '#d9a441' },
  { id: 'inazuma',   name: '稻妻',      color: '#b98cff' },
  { id: 'sumeru',    name: '须弥',      color: '#a5d66a' },
  { id: 'fontaine',  name: '枫丹',      color: '#5fc9d8' },
  { id: 'natlan',    name: '纳塔',      color: '#ff8a5c' },
  { id: 'nodkrai',   name: '挪德卡莱',  color: '#c9a0dc' },
  { id: 'snezhnaya', name: '至冬',      color: '#9fb3c8' },
  { id: 'other',     name: '其他',      color: '#7d8a99' },
];
const REGION_NAME  = Object.fromEntries(REGIONS.map(r => [r.id, r.name]));
const REGION_COLOR = Object.fromEntries(REGIONS.map(r => [r.id, r.color]));

/* ---------- 队伍定位（一个角色可有多个） ---------- */
const ROLES = [
  { id: 'maindps', name: '主C' },
  { id: 'subdps',  name: '副C' },
  { id: 'support', name: '辅助' },
];
const ROLE_NAME = Object.fromEntries(ROLES.map(r => [r.id, r.name]));

/* ---------- 部位 ---------- */
const SLOTS = [
  { id: 'flower',  name: '生之花', short: '花' },
  { id: 'plume',   name: '死之羽', short: '羽' },
  { id: 'sands',   name: '时之沙', short: '沙' },
  { id: 'goblet',  name: '空之杯', short: '杯' },
  { id: 'circlet', name: '理之冠', short: '冠' },
];

/* ---------- 主要属性库 ---------- */
const MAIN_STATS = {
  flower:  [{ id: 'hp',  name: '生命值', fixed: true }],
  plume:   [{ id: 'atk', name: '攻击力', fixed: true }],
  sands:   [
    { id: 'atkP', name: '攻击力%' },
    { id: 'hpP',  name: '生命值%' },
    { id: 'defP', name: '防御力%' },
    { id: 'em',   name: '元素精通' },
    { id: 'er',   name: '元素充能效率' },
  ],
  goblet:  [
    { id: 'pyro',    name: '火元素伤害加成' },
    { id: 'hydro',   name: '水元素伤害加成' },
    { id: 'cryo',    name: '冰元素伤害加成' },
    { id: 'electro', name: '雷元素伤害加成' },
    { id: 'anemo',   name: '风元素伤害加成' },
    { id: 'geo',     name: '岩元素伤害加成' },
    { id: 'dendro',  name: '草元素伤害加成' },
    { id: 'phys',    name: '物理伤害加成' },
    { id: 'atkP',    name: '攻击力%' },
    { id: 'hpP',     name: '生命值%' },
    { id: 'defP',    name: '防御力%' },
    { id: 'em',      name: '元素精通' },
  ],
  circlet: [
    { id: 'cr',   name: '暴击率' },
    { id: 'cd',   name: '暴击伤害' },
    { id: 'heal', name: '治疗加成' },
    { id: 'atkP', name: '攻击力%' },
    { id: 'hpP',  name: '生命值%' },
    { id: 'defP', name: '防御力%' },
    { id: 'em',   name: '元素精通' },
  ],
};

/* ---------- 追加属性库 ---------- */
const SUB_STATS = [
  { id: 'cr',   name: '暴击率',     max: 3.9  },
  { id: 'cd',   name: '暴击伤害',   max: 7.8  },
  { id: 'atkP', name: '攻击力%',    max: 5.8  },
  { id: 'hpP',  name: '生命值%',    max: 5.8  },
  { id: 'defP', name: '防御力%',    max: 7.3  },
  { id: 'em',   name: '元素精通',   max: 23   },
  { id: 'er',   name: '元素充能效率', max: 6.5 },
  { id: 'atk',  name: '攻击力',     max: 19   },
  { id: 'hp',   name: '生命值',     max: 299  },
  { id: 'def',  name: '防御力',     max: 23   },
];

/* ---------- 散件 / 过渡 保留规则（内置预置） ----------
 * 与具体角色无关，用于「无条件保留」的高价值散件或过渡 2 件套胚子。
 * 这类圣遗物的价值来自主要属性本身稀有（如元素伤害杯），或能当 2+2 过渡件，
 * 因此即便当前没有角色需要，也值得单独占一个锁定预设把它留住。
 *
 *   slot     —— 生效部位（sands / goblet / circlet；花 / 羽主要属性固定，不参与）
 *   mains    —— 要留的主要属性 id 列表（多个 = 任一即可）
 *   required —— ★必须追加属性（金标）
 *   pool     —— 追加属性池
 *
 * 命中条数不再由规则自带：所有方案统一预设「至少两条」，并可在每个方案卡片上单独调到 1–4
 *（见 app.js 的 SUB_MIN_HIT_DEFAULT / planCfg.minHit）。
 */
const KEEP_RULES = [
  {
    id: 'goblet_elem', name: '元素伤害杯', builtin: true,
    desc: '空之杯主要属性为任意元素 / 物理伤害加成——掉率极低，是公认必留的稀有胚子',
    slot: 'goblet',
    mains: ['pyro', 'hydro', 'cryo', 'electro', 'anemo', 'geo', 'dendro', 'phys'],
    required: [], pool: ['cr', 'cd', 'atkP', 'em', 'er'],
  },
  {
    id: 'circlet_crit', name: '双暴头', builtin: true,
    desc: '理之冠主要属性为暴击率 / 暴击伤害，追加属性带双暴等好词条即留',
    slot: 'circlet',
    mains: ['cr', 'cd'],
    required: [], pool: ['cr', 'cd', 'atkP', 'em', 'er'],
  },
  {
    id: 'sands_er', name: '充能沙', builtin: true,
    desc: '时之沙主要属性为元素充能效率，追加属性带双暴 / 攻击等即留',
    slot: 'sands',
    mains: ['er'],
    required: [], pool: ['cr', 'cd', 'atkP', 'em'],
  },
  {
    id: 'goblet_em', name: '精通杯', builtin: true,
    desc: '空之杯主要属性为元素精通——草系反应队常用，同样稀有',
    slot: 'goblet',
    mains: ['em'],
    required: [], pool: ['cr', 'cd', 'er', 'atkP'],
  },
];

/* 内置散件 / 过渡规则的英文名（自定义规则原样显示） */
const KEEP_RULE_EN = {
  '元素伤害杯': 'Elemental DMG Goblet',
  '双暴头': 'CRIT Circlet',
  '充能沙': 'Energy Recharge Sands',
  '精通杯': 'Elemental Mastery Goblet',
};

/* ---------- 圣遗物套装 ----------
 * 共 46 套（五星 / 金色），顺序 = 米游社观测枢「圣遗物图鉴」筛选五星后的网页顺序，
 * 即收录时间倒序：最新版本在最前（至冬 7.0 血红之证）→ 开服老套装在最后（冰风迷途的勇士）。
 *   name  中文名（官方）
 *   en    英文名（官方英文本地化）
 *   bonus 2件套效果简述（用于 2+2 搭配参考）
 */
const SETS = [
  /* ---- 至冬 7.0「无神怜爱的雪国」 ---- */
  { name: '血红之证',           en: 'Scarlet Proof',                        bonus: '攻击力+18%' },
  { name: '炉火融炼之心',       en: 'Heart of the Furnace',                 bonus: '攻击力+18%' },
  /* ---- 6.6「虚空劫灰往世书」 ---- */
  { name: '影中沉凝的幻灭',     en: 'Disenchantment in Deep Shadow',        bonus: '攻击力+18%' },
  { name: '天之美赐',           en: 'Celestial Gift',                       bonus: '元素充能效率+20%' },
  /* ---- 6.3「月之四」 ---- */
  { name: '晨星与月的晓歌',     en: 'Aubade of Morningstar and Moon',       bonus: '元素精通+80' },
  { name: '风起之日',           en: 'A Day Carved From Rising Winds',       bonus: '攻击力+18%' },
  /* ---- 6.0「月之一」挪德卡莱 ---- */
  { name: '穹境示现之夜',       en: "Night of the Sky's Unveiling",         bonus: '元素精通+80' },
  { name: '纺月的夜歌',         en: "Silken Moon's Serenade",               bonus: '元素充能效率+20%' },
  /* ---- 5.x 纳塔 ---- */
  { name: '长夜之誓',           en: "Long Night's Oath",                    bonus: '下落攻击伤害+25%' },
  { name: '深廊终曲',           en: 'Finale of the Deep Galleries',         bonus: '冰元素伤害+15%' },
  { name: '黑曜秘典',           en: 'Obsidian Codex',                       bonus: '夜魂加持下伤害+15%' },
  { name: '烬城勇者绘卷',       en: 'Scroll of the Hero of Cinder City',    bonus: '元素战技/爆发伤害+15%' },
  /* ---- 4.x 枫丹 ---- */
  { name: '未竟的遐思',         en: 'Unfinished Reverie',                   bonus: '攻击力+18%' },
  { name: '谐律异想断章',       en: 'Fragment of Harmonic Whimsy',          bonus: '攻击力+18%' },
  { name: '回声之林夜话',       en: 'Nighttime Whispers in the Echoing Woods', bonus: '攻击力+18%' },
  { name: '昔时之歌',           en: 'Song of Days Past',                    bonus: '治疗加成+15%' },
  { name: '逐影猎人',           en: 'Marechaussee Hunter',                  bonus: '普通攻击/重击伤害+15%' },
  { name: '黄金剧团',           en: 'Golden Troupe',                        bonus: '元素战技伤害+20%' },
  /* ---- 3.x 须弥 ---- */
  { name: '花海甘露之光',       en: "Vourukasha's Glow",                    bonus: '生命值+20%' },
  { name: '水仙之梦',           en: "Nymph's Dream",                        bonus: '水元素伤害+15%' },
  { name: '乐园遗落之花',       en: 'Flower of Paradise Lost',              bonus: '元素精通+80' },
  { name: '沙上楼阁史话',       en: 'Desert Pavilion Chronicle',            bonus: '风元素伤害+15%' },
  { name: '深林的记忆',         en: 'Deepwood Memories',                    bonus: '草元素伤害+15%' },
  { name: '饰金之梦',           en: 'Gilded Dreams',                        bonus: '元素精通+80' },
  /* ---- 2.x 稻妻 / 璃月 ---- */
  { name: '辰砂往生录',         en: 'Vermillion Hereafter',                 bonus: '攻击力+18%' },
  { name: '来歆余响',           en: 'Echoes of an Offering',                bonus: '攻击力+18%' },
  { name: '华馆梦醒形骸记',     en: 'Husk of Opulent Dreams',               bonus: '防御力+30%' },
  { name: '海染砗磲',           en: 'Ocean-Hued Clam',                      bonus: '治疗加成+15%' },
  { name: '绝缘之旗印',         en: 'Emblem of Severed Fate',               bonus: '元素充能效率+20%' },
  { name: '追忆之注连',         en: "Shimenawa's Reminiscence",             bonus: '攻击力+18%' },
  /* ---- 1.x 开服系列（含 1.5） ---- */
  { name: '千岩牢固',           en: 'Tenacity of the Millelith',            bonus: '生命值+20%' },
  { name: '苍白之火',           en: 'Pale Flame',                           bonus: '物理伤害+25%' },
  { name: '平息鸣雷的尊者',     en: 'Thundersoother',                       bonus: '受到的雷元素伤害-40%' },
  { name: '炽烈的炎之魔女',     en: 'Crimson Witch of Flames',              bonus: '火元素伤害+15%' },
  { name: '流浪大地的乐团',     en: "Wanderer's Troupe",                    bonus: '元素精通+80' },
  { name: '染血的骑士道',       en: 'Bloodstained Chivalry',                bonus: '物理伤害+25%' },
  { name: '被怜爱的少女',       en: 'Maiden Beloved',                       bonus: '治疗加成+15%' },
  { name: '角斗士的终幕礼',     en: "Gladiator's Finale",                   bonus: '攻击力+18%' },
  { name: '渡过烈火的贤人',     en: 'Lavawalker',                           bonus: '受到的火元素伤害-40%' },
  { name: '悠古的磐岩',         en: 'Archaic Petra',                        bonus: '岩元素伤害+15%' },
  { name: '如雷的盛怒',         en: 'Thundering Fury',                      bonus: '雷元素伤害+15%' },
  { name: '沉沦之心',           en: 'Heart of Depth',                       bonus: '水元素伤害+15%' },
  { name: '逆飞的流星',         en: 'Retracing Bolide',                     bonus: '护盾强效+35%' },
  { name: '昔日宗室之仪',       en: 'Noblesse Oblige',                      bonus: '元素爆发伤害+20%' },
  { name: '翠绿之影',           en: 'Viridescent Venerer',                  bonus: '风元素伤害+15%' },
  { name: '冰风迷途的勇士',     en: 'Blizzard Strayer',                     bonus: '冰元素伤害+15%' },
];
const SET_NAMES = SETS.map(s => s.name);
const SET_BONUS = Object.fromEntries(SETS.map(s => [s.name, s.bonus]));
/* 中文名 → 官方英文名（自定义套装没有英文名，显示时回退到原名） */
const SET_EN = Object.fromEntries(SETS.filter(s => s.en).map(s => [s.name, s.en]));

/* 套装改名对照（内置库订正用，老存档里的引用靠它一次性改过来）
 *  - 水仙十字之圣遗物 → 逐影猎人：图鉴官方名为「逐影猎人」Marechaussee Hunter，
 *    2 件套同为「普通攻击与重击伤害+15%」，此前误用了剧情道具名。
 *  - 戍卫之誓 → 角斗士的终幕礼：图鉴 46 套中并无「戍卫之誓」，
 *    其 2 件套「攻击力+18%」与开服套装「角斗士的终幕礼」Gladiator's Finale 一致。
 */
const SET_RENAME = {
  '水仙十字之圣遗物': '逐影猎人',
  '戍卫之誓': '角斗士的终幕礼',
};
/* 改名的 epoch：老存档首次加载时把引用里的旧名换成新名（只跑一次） */
const SET_EPOCH = 1;

/* ---------- 追加属性需求预设 ----------
 * 用【排序 + 必选 + 重要度算子】表达，不再使用数值权重：
 *   数组顺序 = 想要程度（越靠前越想要）
 *   第 2 项为 true = 「必选」，对应游戏内锁定方案的 ★必须
 *   第 3 项 op：'=' 表示与上一条同等重要（同权），缺省 '>' 表示比上一条更低（逐级降权 0.72×）
 *   重要度原则依据社区攻略共识整理（双暴并列最优先、攻击%/精通按反应定位排序等），非逐角色编造
 * 例：crit → [暴击率(必选), 暴击伤害(必选,=暴击率), 攻击力%, 充能, 精通, 攻击]
 */
const SUB_PRESETS = {
  // 双暴输出（通用主C/副C）：双暴并列最优先(=)，攻击% > 充能 ≈ 精通
  crit:    [['cr', 1], ['cd', 1, '='], ['atkP'], ['er'], ['em'], ['atk']],
  // 双暴+生命（生命转攻类：胡桃/夜兰/芙宁娜等）：双暴并列，生命% 紧随
  critHp:  [['cr', 1], ['cd', 1, '='], ['hpP'], ['er'], ['em'], ['atk']],
  // 双暴+防御（防御转攻类：诺艾尔/荒泷/娜维娅等）：双暴并列，防御% 紧随
  critDef: [['cr', 1], ['cd', 1, '='], ['defP'], ['er'], ['def'], ['atkP']],
  // 精通流（剧变/反应主C：纳西妲/艾尔海森/久岐忍等）：精通必选，充能次之，双暴按需
  em:      [['em', 1], ['er'], ['cr'], ['cd'], ['atkP']],
  // 生命流（生命辅助/绽放辅：妮露/心海等）：生命%必选，充能次之
  hp:      [['hpP', 1], ['er'], ['cr'], ['cd'], ['hp'], ['em']],
  // 防御流（防御向：阿贝多/荒泷等）
  def:     [['defP', 1], ['cr'], ['cd'], ['er'], ['def']],
  // 充能辅助（依赖大招的辅助：班尼特/香菱/行秋等）：充能必选，双暴/生命按需
  er:      [['er', 1], ['cr'], ['cd'], ['hpP'], ['atkP'], ['em'], ['hp']],
  // 攻击流（攻击向副C/辅：九条/云堇等）：攻击%必选，双暴次之
  atk:     [['atkP', 1], ['cr'], ['cd'], ['er'], ['atk'], ['em']],
  // 治疗辅助：生命%必选，充能次之，生命固定值
  heal:    [['hpP', 1], ['er'], ['hp'], ['atkP']],
};

/* 预设的中文名（供界面下拉使用） */
const SUB_PRESET_NAMES = {
  crit: '双暴输出', critHp: '双暴+生命', critDef: '双暴+防御',
  em: '精通流', hp: '生命流', def: '防御流',
  er: '充能辅助', atk: '攻击流', heal: '治疗辅助',
};

/* 把 [id, req, op?] 简写展开成 [{ id, req, op }]；op 缺省 '>'（比上一条更低） */
function toSubs(list) {
  return (list || []).map(([id, req, op]) => ({ id, req: !!req, op: op || '>' }));
}

/* ============================================================
 * 角色元信息：国度 + 定位
 * 格式 '角色名': [ 国度, [定位...] ]
 * 定位第一个为主定位，用于卡片显示；批量筛选时任一命中即选中
 * ============================================================ */
/* ---------- 角色英文名 ----------
 * 采用米哈游官方英文本地化名（核对自 Genshin Impact Wiki / 萌娘百科角色模块）。
 * 旅行者按元素形态分别给出：Traveler (Anemo) / (Geo) / (Electro) / (Dendro) / (Hydro) / (Pyro)。
 */
const CH_EN = {
  '安柏': 'Amber',
  '凯亚': 'Kaeya',
  '丽莎': 'Lisa',
  '芭芭拉': 'Barbara',
  '琴': 'Jean',
  '可莉': 'Klee',
  '诺艾尔': 'Noelle',
  '菲谢尔': 'Fischl',
  '砂糖': 'Sucrose',
  '莫娜': 'Mona',
  '迪奥娜': 'Diona',
  '雷泽': 'Razor',
  '温迪': 'Venti',
  '班尼特': 'Bennett',
  '迪卢克': 'Diluc',
  '阿贝多': 'Albedo',
  '罗莎莉亚': 'Rosaria',
  '优菈': 'Eula',
  '埃洛伊': 'Aloy',
  '米卡': 'Mika',
  '法尔伽': 'Varka',
  '塔利雅': 'Dahlia',
  '杜林': 'Durin',
  '洛恩': 'Lohen',
  '尼可': 'Nicole',
  '布伦妮': 'Prune',
  '北斗': 'Beidou',
  '凝光': 'Ningguang',
  '香菱': 'Xiangling',
  '行秋': 'Xingqiu',
  '重云': 'Chongyun',
  '刻晴': 'Keqing',
  '七七': 'Qiqi',
  '钟离': 'Zhongli',
  '辛焱': 'Xinyan',
  '甘雨': 'Ganyu',
  '魈': 'Xiao',
  '胡桃': 'Hu Tao',
  '烟绯': 'Yanfei',
  '申鹤': 'Shenhe',
  '云堇': 'Yun Jin',
  '夜兰': 'Yelan',
  '瑶瑶': 'Yaoyao',
  '白术': 'Baizhu',
  '闲云': 'Xianyun',
  '嘉明': 'Gaming',
  '蓝砚': 'Lan Yan',
  '兹白': 'Zibai',
  '神里绫华': 'Kamisato Ayaka',
  '枫原万叶': 'Kaedehara Kazuha',
  '宵宫': 'Yoimiya',
  '早柚': 'Sayu',
  '雷电将军': 'Raiden Shogun',
  '九条裟罗': 'Kujou Sara',
  '珊瑚宫心海': 'Sangonomiya Kokomi',
  '托马': 'Thoma',
  '荒泷一斗': 'Arataki Itto',
  '五郎': 'Gorou',
  '八重神子': 'Yae Miko',
  '神里绫人': 'Kamisato Ayato',
  '久岐忍': 'Kuki Shinobu',
  '鹿野院平藏': 'Shikanoin Heizou',
  '绮良良': 'Kirara',
  '梦见月瑞希': 'Yumemizuki Mizuki',
  '提纳里': 'Tighnari',
  '柯莱': 'Collei',
  '赛诺': 'Cyno',
  '坎蒂丝': 'Candace',
  '多莉': 'Dori',
  '妮露': 'Nilou',
  '纳西妲': 'Nahida',
  '艾尔海森': 'Alhaitham',
  '莱依拉': 'Layla',
  '流浪者': 'Wanderer',
  '珐露珊': 'Faruzan',
  '迪希雅': 'Dehya',
  '卡维': 'Kaveh',
  '赛索斯': 'Sethos',
  '林尼': 'Lyney',
  '琳妮特': 'Lynette',
  '菲米尼': 'Freminet',
  '那维莱特': 'Neuvillette',
  '莱欧斯利': 'Wriothesley',
  '芙宁娜': 'Furina',
  '夏洛蒂': 'Charlotte',
  '娜维娅': 'Navia',
  '夏沃蕾': 'Chevreuse',
  '克洛琳德': 'Clorinde',
  '希格雯': 'Sigewinne',
  '艾梅莉埃': 'Emilie',
  '千织': 'Chiori',
  '爱可菲': 'Escoffier',
  '玛拉妮': 'Mualani',
  '卡齐娜': 'Kachina',
  '基尼奇': 'Kinich',
  '希诺宁': 'Xilonen',
  '恰斯卡': 'Chasca',
  '欧洛伦': 'Ororon',
  '玛薇卡': 'Mavuika',
  '茜特菈莉': 'Citlali',
  '伊安珊': 'Iansan',
  '瓦雷莎': 'Varesa',
  '伊法': 'Ifa',
  '莉奈娅': 'Linnea',
  '叶洛亚': 'Illuga',
  '哥伦比娅': 'Columbina',
  '雅珂达': 'Jahoda',
  '奈芙尔': 'Nefer',
  '菲林斯': 'Flins',
  '菈乌玛': 'Lauma',
  '爱诺': 'Aino',
  '伊涅芙': 'Ineffa',
  '达达利亚': 'Tartaglia',
  '阿蕾奇诺': 'Arlecchino',
  '桑多涅': 'Sandrone',
  '奥黛塔': 'Odette',
  '阿罗夏': 'Alyosha',
  '丝柯克': 'Skirk',
  '旅行者·风': 'Traveler (Anemo)',
  '旅行者·岩': 'Traveler (Geo)',
  '旅行者·雷': 'Traveler (Electro)',
  '旅行者·草': 'Traveler (Dendro)',
  '旅行者·水': 'Traveler (Hydro)',
  '旅行者·火': 'Traveler (Pyro)',
};

/* 图鉴顺序（= 米游社观测枢角色索引：按国度 → 版本登场先后（旧→新））
 * 角色列表「正序」时国度内按此顺序排；不在此表里的自定义角色排在该国度最后。 */
const CH_CATALOG = [
  '安柏',
  '凯亚',
  '丽莎',
  '芭芭拉',
  '琴',
  '可莉',
  '诺艾尔',
  '菲谢尔',
  '砂糖',
  '莫娜',
  '迪奥娜',
  '雷泽',
  '温迪',
  '班尼特',
  '迪卢克',
  '阿贝多',
  '罗莎莉亚',
  '优菈',
  '埃洛伊',
  '米卡',
  '法尔伽',
  '塔利雅',
  '杜林',
  '洛恩',
  '尼可',
  '布伦妮',
  '北斗',
  '凝光',
  '香菱',
  '行秋',
  '重云',
  '刻晴',
  '七七',
  '钟离',
  '辛焱',
  '甘雨',
  '魈',
  '胡桃',
  '烟绯',
  '申鹤',
  '云堇',
  '夜兰',
  '瑶瑶',
  '白术',
  '闲云',
  '嘉明',
  '蓝砚',
  '兹白',
  '神里绫华',
  '枫原万叶',
  '宵宫',
  '早柚',
  '雷电将军',
  '九条裟罗',
  '珊瑚宫心海',
  '托马',
  '荒泷一斗',
  '五郎',
  '八重神子',
  '神里绫人',
  '久岐忍',
  '鹿野院平藏',
  '绮良良',
  '梦见月瑞希',
  '提纳里',
  '柯莱',
  '赛诺',
  '坎蒂丝',
  '多莉',
  '妮露',
  '纳西妲',
  '艾尔海森',
  '莱依拉',
  '流浪者',
  '珐露珊',
  '迪希雅',
  '卡维',
  '赛索斯',
  '林尼',
  '琳妮特',
  '菲米尼',
  '那维莱特',
  '莱欧斯利',
  '芙宁娜',
  '夏洛蒂',
  '娜维娅',
  '夏沃蕾',
  '克洛琳德',
  '希格雯',
  '艾梅莉埃',
  '千织',
  '爱可菲',
  '玛拉妮',
  '卡齐娜',
  '基尼奇',
  '希诺宁',
  '恰斯卡',
  '欧洛伦',
  '玛薇卡',
  '茜特菈莉',
  '伊安珊',
  '瓦雷莎',
  '伊法',
  '莉奈娅',
  '叶洛亚',
  '哥伦比娅',
  '雅珂达',
  '奈芙尔',
  '菲林斯',
  '菈乌玛',
  '爱诺',
  '伊涅芙',
  '达达利亚',
  '阿蕾奇诺',
  '桑多涅',
  '奥黛塔',
  '阿罗夏',
  '丝柯克',
  '旅行者·风',
  '旅行者·岩',
  '旅行者·雷',
  '旅行者·草',
  '旅行者·水',
  '旅行者·火',
];
const CH_CATALOG_IDX = Object.fromEntries(CH_CATALOG.map((n, i) => [n, i]));

const CH_META = {
  /* ---------- 蒙德 Mondstadt（26） ---------- */
  '安柏': ['mondstadt', ['support']],
  '凯亚': ['mondstadt', ['subdps']],
  '丽莎': ['mondstadt', ['subdps']],
  '芭芭拉': ['mondstadt', ['support']],
  '琴': ['mondstadt', ['support']],
  '可莉': ['mondstadt', ['maindps']],
  '诺艾尔': ['mondstadt', ['maindps']],
  '菲谢尔': ['mondstadt', ['subdps']],
  '砂糖': ['mondstadt', ['support']],
  '莫娜': ['mondstadt', ['support', 'subdps']],
  '迪奥娜': ['mondstadt', ['support']],
  '雷泽': ['mondstadt', ['maindps']],
  '温迪': ['mondstadt', ['support']],
  '班尼特': ['mondstadt', ['support', 'subdps']],
  '迪卢克': ['mondstadt', ['maindps']],
  '阿贝多': ['mondstadt', ['subdps']],
  '罗莎莉亚': ['mondstadt', ['subdps']],
  '优菈': ['mondstadt', ['maindps']],
  '埃洛伊': ['mondstadt', ['maindps']],   // 2.1 联动角色，归属蒙德
  '米卡': ['mondstadt', ['support']],
  '法尔伽': ['mondstadt', ['maindps']],
  '塔利雅': ['mondstadt', ['support']],
  '杜林': ['mondstadt', ['subdps']],
  '洛恩': ['mondstadt', ['maindps']],
  '尼可': ['mondstadt', ['maindps']],
  '布伦妮': ['mondstadt', ['support']],
  /* ---------- 璃月 Liyue（22） ---------- */
  '北斗': ['liyue', ['subdps']],
  '凝光': ['liyue', ['maindps']],
  '香菱': ['liyue', ['subdps']],
  '行秋': ['liyue', ['subdps']],
  '重云': ['liyue', ['subdps']],
  '刻晴': ['liyue', ['maindps']],
  '七七': ['liyue', ['support']],
  '钟离': ['liyue', ['support']],
  '辛焱': ['liyue', ['support']],
  '甘雨': ['liyue', ['maindps', 'subdps']],
  '魈': ['liyue', ['maindps']],
  '胡桃': ['liyue', ['maindps']],
  '烟绯': ['liyue', ['maindps']],
  '申鹤': ['liyue', ['support']],
  '云堇': ['liyue', ['support']],
  '夜兰': ['liyue', ['subdps']],
  '瑶瑶': ['liyue', ['support']],
  '白术': ['liyue', ['support']],
  '闲云': ['liyue', ['support', 'subdps']],
  '嘉明': ['liyue', ['maindps']],
  '蓝砚': ['liyue', ['support']],
  '兹白': ['liyue', ['maindps']],
  /* ---------- 稻妻 Inazuma（16） ---------- */
  '神里绫华': ['inazuma', ['maindps']],
  '枫原万叶': ['inazuma', ['support']],
  '宵宫': ['inazuma', ['maindps']],
  '早柚': ['inazuma', ['support']],
  '雷电将军': ['inazuma', ['maindps']],
  '九条裟罗': ['inazuma', ['support']],
  '珊瑚宫心海': ['inazuma', ['support', 'maindps']],
  '托马': ['inazuma', ['support']],
  '荒泷一斗': ['inazuma', ['maindps']],
  '五郎': ['inazuma', ['support']],
  '八重神子': ['inazuma', ['subdps']],
  '神里绫人': ['inazuma', ['maindps']],
  '久岐忍': ['inazuma', ['support', 'subdps']],
  '鹿野院平藏': ['inazuma', ['maindps']],
  '绮良良': ['inazuma', ['support']],
  '梦见月瑞希': ['inazuma', ['support']],
  /* ---------- 须弥 Sumeru（14） ---------- */
  '提纳里': ['sumeru', ['maindps']],
  '柯莱': ['sumeru', ['subdps']],
  '赛诺': ['sumeru', ['maindps']],
  '坎蒂丝': ['sumeru', ['support']],
  '多莉': ['sumeru', ['support']],
  '妮露': ['sumeru', ['support']],
  '纳西妲': ['sumeru', ['subdps', 'support']],
  '艾尔海森': ['sumeru', ['maindps']],
  '莱依拉': ['sumeru', ['support']],
  '流浪者': ['sumeru', ['maindps']],
  '珐露珊': ['sumeru', ['support']],
  '迪希雅': ['sumeru', ['subdps', 'support']],
  '卡维': ['sumeru', ['maindps', 'support']],
  '赛索斯': ['sumeru', ['maindps']],
  /* ---------- 枫丹 Fontaine（14） ---------- */
  '林尼': ['fontaine', ['maindps']],
  '琳妮特': ['fontaine', ['subdps', 'support']],
  '菲米尼': ['fontaine', ['maindps']],
  '那维莱特': ['fontaine', ['maindps']],
  '莱欧斯利': ['fontaine', ['maindps']],
  '芙宁娜': ['fontaine', ['subdps', 'support']],
  '夏洛蒂': ['fontaine', ['support']],
  '娜维娅': ['fontaine', ['maindps']],
  '夏沃蕾': ['fontaine', ['support']],
  '克洛琳德': ['fontaine', ['maindps']],
  '希格雯': ['fontaine', ['support']],
  '艾梅莉埃': ['fontaine', ['subdps']],
  '千织': ['fontaine', ['subdps']],
  '爱可菲': ['fontaine', ['support']],
  /* ---------- 纳塔 Natlan（11） ---------- */
  '玛拉妮': ['natlan', ['maindps']],
  '卡齐娜': ['natlan', ['subdps']],
  '基尼奇': ['natlan', ['maindps']],
  '希诺宁': ['natlan', ['support']],
  '恰斯卡': ['natlan', ['maindps']],
  '欧洛伦': ['natlan', ['subdps', 'support']],
  '玛薇卡': ['natlan', ['maindps', 'support']],
  '茜特菈莉': ['natlan', ['support']],
  '伊安珊': ['natlan', ['support']],
  '瓦雷莎': ['natlan', ['maindps']],
  '伊法': ['natlan', ['support']],
  /* ---------- 挪德卡莱 Nod-Krai（9） ---------- */
  '莉奈娅': ['nodkrai', ['subdps']],
  '叶洛亚': ['nodkrai', ['maindps']],
  '哥伦比娅': ['nodkrai', ['support']],
  '雅珂达': ['nodkrai', ['support']],
  '奈芙尔': ['nodkrai', ['maindps']],
  '菲林斯': ['nodkrai', ['maindps']],
  '菈乌玛': ['nodkrai', ['support']],
  '爱诺': ['nodkrai', ['support']],
  '伊涅芙': ['nodkrai', ['subdps']],
  /* ---------- 至冬 Snezhnaya（5） ---------- */
  '达达利亚': ['snezhnaya', ['maindps']],
  '阿蕾奇诺': ['snezhnaya', ['maindps']],
  '桑多涅': ['snezhnaya', ['maindps']],
  '奥黛塔': ['snezhnaya', ['support']],
  '阿罗夏': ['snezhnaya', ['support']],
  /* ---------- 其他 / 旅行者（7） ---------- */
  '丝柯克': ['other', ['maindps']],
  '旅行者·风': ['other', ['support']],
  '旅行者·岩': ['other', ['subdps']],
  '旅行者·雷': ['other', ['support']],
  '旅行者·草': ['other', ['subdps']],
  '旅行者·水': ['other', ['subdps']],
  '旅行者·火': ['other', ['maindps']],
};

const RAW_CHARS = [
  /* ---------- 火 ---------- */
  ['胡桃', 'pyro', 'critHp', [['炽烈的炎之魔女'], ['追忆之注连']], ['em', 'hpP'], ['pyro', 'hpP'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/43804422', 'https://www.miyoushe.com/ys/article/58957682', 'https://www.miyoushe.com/ys/article/58955919']],
  ['迪卢克', 'pyro', 'crit', [['炽烈的炎之魔女'], ['追忆之注连']], ['atkP'], ['pyro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/73900753', 'https://bbs.mihoyo.com/ys/article/22237040', 'https://bbs.mihoyo.com/ys/article/20413601']],
  ['可莉', 'pyro', 'crit', [['炽烈的炎之魔女'], ['追忆之注连']], ['atkP'], ['pyro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/73558152', 'https://www.miyoushe.com/ys/article/71866180', 'https://www.miyoushe.com/ys/article/71102349']],
  ['宵宫', 'pyro', 'crit', [['追忆之注连'], ['来歆余响'], ['炽烈的炎之魔女']], ['atkP'], ['pyro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/64575893', 'https://www.miyoushe.com/ys/article/47804923', 'https://www.miyoushe.com/ys/article/47752227']],
  ['林尼', 'pyro', 'crit', [['辰砂往生录'], ['来歆余响']], ['atkP'], ['pyro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/59510751', 'https://www.miyoushe.com/ys/article/75046083', 'https://www.miyoushe.com/ys/article/74678199']],
  ['香菱', 'pyro', 'crit', [['绝缘之旗印'], ['炽烈的炎之魔女']], ['er', 'atkP', 'em'], ['pyro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/75875081', 'https://bbs.mihoyo.com/ys/article/25074981', 'https://bbs.mihoyo.com/ys/article/20230070']],
  ['班尼特', 'pyro', 'heal', [['昔日宗室之仪'], ['被怜爱的少女']], ['er', 'hpP'], ['hpP'], ['hpP', 'heal'], ['https://www.miyoushe.com/ys/article/54022194', 'https://bbs.mihoyo.com/ys/article/25074159', 'https://bbs.mihoyo.com/ys/article/20068461']],
  ['玛薇卡', 'pyro', 'crit', [['黑曜秘典'], ['炽烈的炎之魔女']], ['atkP'], ['pyro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/66177682', 'https://www.miyoushe.com/ys/article/75910511', 'https://www.miyoushe.com/ys/article/75905772']],
  ['阿蕾奇诺', 'pyro', 'crit', [['谐律异想断章'], ['炽烈的炎之魔女']], ['atkP'], ['pyro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/70507908', 'https://www.miyoushe.com/ys/article/51936359', 'https://www.miyoushe.com/ys/article/51920910']],
  ['托马', 'pyro', 'hp', [['千岩牢固'], ['绝缘之旗印']], ['hpP', 'er'], ['hpP'], ['hpP'], ['https://www.miyoushe.com/ys/article/32388545', 'https://www.miyoushe.com/ys/article/54061940', 'https://bbs.mihoyo.com/ys/article/25074912']],
  ['烟绯', 'pyro', 'crit', [['炽烈的炎之魔女'], ['追忆之注连']], ['atkP'], ['pyro'], ['cr', 'cd'], ['https://bbs.mihoyo.com/ys/article/25075070', 'https://bbs.mihoyo.com/ys/article/23419183', 'https://bbs.mihoyo.com/ys/article/21268500']],
  ['迪希雅', 'pyro', 'hp', [['千岩牢固'], ['烬城勇者绘卷']], ['hpP'], ['pyro', 'hpP'], ['cr', 'cd', 'hpP'], ['https://www.miyoushe.com/ys/article/36342244', 'https://www.miyoushe.com/ys/article/68183574', 'https://www.miyoushe.com/ys/article/36343279']],
  ['嘉明', 'pyro', 'crit', [['炽烈的炎之魔女'], ['追忆之注连']], ['atkP'], ['pyro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/48532329', 'https://www.miyoushe.com/ys/article/71813629', 'https://www.miyoushe.com/ys/article/54223358']],
  ['辛焱', 'pyro', 'def', [['千岩牢固'], ['逆飞的流星']], ['defP'], ['phys', 'defP'], ['cr', 'defP'], ['https://bbs.mihoyo.com/ys/article/25075001', 'https://bbs.mihoyo.com/ys/article/21741667', 'https://bbs.mihoyo.com/ys/article/18634883']],
  ['夏沃蕾', 'pyro', 'hp', [['昔日宗室之仪'], ['昔时之歌'], ['烬城勇者绘卷']], ['hpP', 'er'], ['hpP'], ['hpP', 'heal'], ['https://www.miyoushe.com/ys/article/47759303', 'https://www.miyoushe.com/ys/article/71769196', 'https://www.miyoushe.com/ys/article/47762991']],

  /* ---------- 水 ---------- */
  ['行秋', 'hydro', 'crit', [['绝缘之旗印'], ['沉沦之心']], ['atkP', 'er'], ['hydro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/75141780', 'https://www.miyoushe.com/ys/article/70022906', 'https://bbs.mihoyo.com/ys/article/25075041']],
  ['夜兰', 'hydro', 'critHp', [['绝缘之旗印'], ['沉沦之心'], ['千岩牢固']], ['hpP'], ['hydro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/69095833', 'https://www.miyoushe.com/ys/article/35379633', 'https://bbs.mihoyo.com/ys/article/23365969']],
  ['达达利亚', 'hydro', 'crit', [['沉沦之心'], ['逐影猎人']], ['atkP'], ['hydro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/61217705', 'https://bbs.mihoyo.com/ys/article/31675253', 'https://bbs.mihoyo.com/ys/article/22237098']],
  ['珊瑚宫心海', 'hydro', 'hp', [['海染砗磲'], ['千岩牢固']], ['hpP', 'er'], ['hydro', 'hpP'], ['heal', 'hpP'], ['https://bbs.mihoyo.com/ys/article/9783187', 'https://bbs.mihoyo.com/ys/article/28670439', 'https://bbs.mihoyo.com/ys/article/9811643']],
  ['莫娜', 'hydro', 'er', [['绝缘之旗印'], ['昔日宗室之仪']], ['er', 'atkP'], ['hydro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/71353241', 'https://www.miyoushe.com/ys/article/71293999', 'https://bbs.mihoyo.com/ys/article/22242956']],
  ['妮露', 'hydro', 'hp', [['乐园遗落之花'], ['千岩牢固', '乐园遗落之花']], ['hpP'], ['hpP'], ['hpP'], ['https://www.miyoushe.com/ys/article/37891114', 'https://bbs.mihoyo.com/ys/article/30319453', 'https://www.miyoushe.com/ys/article/68308954']],
  ['芙宁娜', 'hydro', 'critHp', [['黄金剧团'], ['沉沦之心']], ['hpP', 'er'], ['hydro', 'hpP'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/69835283', 'https://www.miyoushe.com/ys/article/54231026', 'https://www.miyoushe.com/ys/article/45238744']],
  ['那维莱特', 'hydro', 'critHp', [['逐影猎人'], ['沉沦之心']], ['hpP', 'er'], ['hydro', 'hpP'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/72892872', 'https://www.miyoushe.com/ys/article/51019831', 'https://www.miyoushe.com/ys/article/43799619']],
  ['芭芭拉', 'hydro', 'heal', [['被怜爱的少女'], ['海染砗磲']], ['hpP'], ['hpP'], ['heal'], ['https://www.miyoushe.com/ys/article/68736041', 'https://bbs.mihoyo.com/ys/article/25074129', 'https://bbs.mihoyo.com/ys/article/23419183']],
  ['玛拉妮', 'hydro', 'critHp', [['黑曜秘典'], ['沉沦之心']], ['hpP'], ['hydro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/67605282', 'https://www.miyoushe.com/ys/article/56901714', 'https://www.miyoushe.com/ys/article/67669637']],
  ['塔利雅', 'hydro', 'atk', [['昔日宗室之仪'], ['绝缘之旗印']], ['atkP', 'er'], ['hydro', 'atkP'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/65679835', 'https://www.miyoushe.com/ys/article/65404405', 'https://www.miyoushe.com/ys/article/65404256']],
  ['希格雯', 'hydro', 'heal', [['昔时之歌'], ['海染砗磲']], ['hpP', 'er'], ['hpP'], ['heal', 'hpP'], ['https://www.miyoushe.com/ys/article/54243679', 'https://www.miyoushe.com/ys/article/54229003', 'https://www.miyoushe.com/ys/article/61942374']],
  ['坎蒂丝', 'hydro', 'hp', [['千岩牢固'], ['绝缘之旗印']], ['hpP', 'er'], ['hpP'], ['hpP'], ['https://bbs.mihoyo.com/ys/article/29482398', 'https://www.miyoushe.com/ys/article/74049148', 'https://bbs.mihoyo.com/ys/article/29611709']],

  /* ---------- 冰 ---------- */
  ['甘雨', 'cryo', 'crit', [['冰风迷途的勇士'], ['流浪大地的乐团']], ['atkP'], ['cryo'], ['cd', 'cr'], ['https://bbs.mihoyo.com/ys/article/14957113', 'https://www.miyoushe.com/ys/article/61283838', 'https://www.miyoushe.com/ys/article/38956966']],
  ['神里绫华', 'cryo', 'crit', [['冰风迷途的勇士'], ['沉沦之心']], ['atkP'], ['cryo'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/64527638', 'https://www.miyoushe.com/ys/article/32720596', 'https://bbs.mihoyo.com/ys/article/20714244']],
  ['优菈', 'cryo', 'crit', [['苍白之火'], ['苍白之火', '染血的骑士道']], ['atkP'], ['phys'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/40948437', 'https://www.miyoushe.com/ys/article/73861985', 'https://www.miyoushe.com/ys/article/40951883']],
  ['申鹤', 'cryo', 'atk', [['千岩牢固'], ['冰风迷途的勇士', '追忆之注连']], ['atkP'], ['atkP'], ['atkP'], ['https://www.miyoushe.com/ys/article/65787422', 'https://www.miyoushe.com/ys/article/65404318', 'https://www.miyoushe.com/ys/article/65464845']],
  ['莱欧斯利', 'cryo', 'crit', [['逐影猎人'], ['冰风迷途的勇士']], ['atkP'], ['cryo'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/44583182', 'https://www.miyoushe.com/ys/article/62417764', 'https://www.miyoushe.com/ys/article/76302270']],
  ['迪奥娜', 'cryo', 'hp', [['千岩牢固'], ['被怜爱的少女']], ['hpP', 'er'], ['hpP'], ['hpP', 'heal'], ['https://www.miyoushe.com/ys/article/76347079', 'https://www.miyoushe.com/ys/article/76479642', 'https://bbs.mihoyo.com/ys/article/27923191']],
  ['罗莎莉亚', 'cryo', 'crit', [['冰风迷途的勇士'], ['苍白之火']], ['atkP'], ['cryo'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/70615140', 'https://bbs.mihoyo.com/ys/article/25074734', 'https://bbs.mihoyo.com/ys/article/20802145']],
  ['七七', 'cryo', 'heal', [['被怜爱的少女'], ['千岩牢固']], ['atkP', 'er'], ['atkP'], ['heal'], ['https://www.miyoushe.com/ys/article/76326299', 'https://www.miyoushe.com/sr/article/61091178', 'https://bbs.mihoyo.com/ys/article/21881008']],
  ['爱可菲', 'cryo', 'atk', [['黄金剧团'], ['冰风迷途的勇士']], ['atkP'], ['cryo', 'atkP'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/73995271', 'https://www.miyoushe.com/ys/article/64215753', 'https://www.miyoushe.com/ys/article/64193368']],
  ['丝柯克', 'cryo', 'crit', [['深廊终曲'], ['冰风迷途的勇士']], ['atkP'], ['cryo'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/73991725', 'https://www.miyoushe.com/ys/article/65478404', 'https://www.miyoushe.com/ys/article/65404377']],
  ['重云', 'cryo', 'crit', [['冰风迷途的勇士'], ['昔日宗室之仪']], ['atkP'], ['cryo'], ['cr', 'cd'], ['https://bbs.mihoyo.com/ys/article/11361211', 'https://bbs.mihoyo.com/ys/article/25075185', 'https://bbs.mihoyo.com/ys/article/24476281']],
  ['菲米尼', 'cryo', 'crit', [['冰风迷途的勇士'], ['苍白之火']], ['atkP'], ['cryo', 'phys'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/43154250', 'https://www.miyoushe.com/ys/article/76548802', 'https://www.miyoushe.com/ys/article/43066421']],
  ['夏洛蒂', 'cryo', 'heal', [['千岩牢固'], ['被怜爱的少女']], ['atkP', 'er'], ['atkP'], ['heal', 'atkP'], ['https://www.miyoushe.com/ys/article/45238643', 'https://www.miyoushe.com/ys/article/74068739', 'https://www.miyoushe.com/ys/article/45186920']],
  ['米卡', 'cryo', 'heal', [['千岩牢固'], ['被怜爱的少女']], ['atkP', 'er'], ['atkP'], ['heal', 'atkP'], ['https://www.miyoushe.com/ys/article/75831154', 'https://www.miyoushe.com/ys/article/37059683', 'https://www.miyoushe.com/ys/article/37103850']],

  /* ---------- 雷 ---------- */
  ['雷电将军', 'electro', 'crit', [['绝缘之旗印']], ['er', 'atkP'], ['electro', 'atkP'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/47804425', 'https://www.miyoushe.com/ys/article/32613094', 'https://bbs.mihoyo.com/ys/article/18889634']],
  ['八重神子', 'electro', 'crit', [['饰金之梦'], ['如雷的盛怒']], ['atkP'], ['electro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/64762050', 'https://www.miyoushe.com/ys/article/64630754', 'https://bbs.mihoyo.com/ys/article/17929472']],
  ['菲谢尔', 'electro', 'crit', [['如雷的盛怒'], ['饰金之梦'], ['绝缘之旗印']], ['atkP'], ['electro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/72463227', 'https://www.miyoushe.com/ys/article/72528522', 'https://www.miyoushe.com/ys/article/44410305']],
  ['刻晴', 'electro', 'crit', [['如雷的盛怒'], ['饰金之梦']], ['atkP'], ['electro'], ['cd', 'cr'], ['https://www.miyoushe.com/ys/article/61261935', 'https://www.miyoushe.com/sr/article/61091188', 'https://www.miyoushe.com/ys/article/33231059']],
  ['赛诺', 'electro', 'em', [['饰金之梦'], ['如雷的盛怒']], ['em', 'atkP'], ['electro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/45995448', 'https://bbs.mihoyo.com/ys/article/29480539', 'https://www.miyoushe.com/ys/article/68307851']],
  ['久岐忍', 'electro', 'em', [['饰金之梦'], ['乐园遗落之花']], ['em'], ['em'], ['em'], ['https://bbs.mihoyo.com/ys/article/24454467', 'https://www.miyoushe.com/sr/article/68674152', 'https://www.miyoushe.com/ys/article/32513206']],
  ['九条裟罗', 'electro', 'atk', [['昔日宗室之仪'], ['绝缘之旗印']], ['er', 'atkP'], ['electro', 'atkP'], ['cr', 'cd'], ['https://bbs.mihoyo.com/ys/article/9505598', 'https://bbs.mihoyo.com/ys/article/25074355', 'https://bbs.mihoyo.com/ys/article/21593056']],
  ['雷泽', 'electro', 'crit', [['苍白之火'], ['平息鸣雷的尊者']], ['atkP'], ['phys'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/71260308', 'https://www.miyoushe.com/sr/article/75508081', 'https://bbs.mihoyo.com/ys/article/25074526']],
  ['克洛琳德', 'electro', 'crit', [['谐律异想断章'], ['如雷的盛怒']], ['atkP'], ['electro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/53505994', 'https://www.miyoushe.com/ys/article/53493282', 'https://www.miyoushe.com/ys/article/61261814']],
  ['瓦雷莎', 'electro', 'crit', [['黑曜秘典'], ['长夜之誓']], ['atkP'], ['electro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/62923305', 'https://www.miyoushe.com/ys/article/62882282', 'https://www.miyoushe.com/ys/article/71889313']],
  ['伊安珊', 'electro', 'atk', [['烬城勇者绘卷'], ['昔日宗室之仪']], ['atkP', 'er'], ['electro', 'atkP'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/62923263', 'https://www.miyoushe.com/ys/article/62890274', 'https://www.miyoushe.com/ys/article/62922913']],
  ['欧洛伦', 'electro', 'atk', [['烬城勇者绘卷'], ['绝缘之旗印']], ['atkP', 'er'], ['electro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/59513932', 'https://www.miyoushe.com/ys/article/59513936', 'https://www.miyoushe.com/ys/article/76822394']],
  ['多莉', 'electro', 'hp', [['千岩牢固'], ['被怜爱的少女']], ['hpP', 'er'], ['hpP'], ['heal', 'hpP'], ['https://www.miyoushe.com/sr/article/69337526', 'https://bbs.mihoyo.com/ys/article/28690959', 'https://bbs.mihoyo.com/ys/article/28936608']],

  /* ---------- 风 ---------- */
  ['枫原万叶', 'anemo', 'em', [['翠绿之影']], ['em'], ['em'], ['em'], ['https://www.miyoushe.com/ys/article/51026414', 'https://bbs.mihoyo.com/ys/article/25403328', 'https://www.miyoushe.com/ys/article/51015181']],
  ['温迪', 'anemo', 'em', [['翠绿之影']], ['em', 'atkP'], ['anemo', 'em'], ['em', 'cr'], ['https://www.miyoushe.com/ys/article/71235177', 'https://www.miyoushe.com/ys/article/71128239', 'https://www.miyoushe.com/ys/article/63567342']],
  ['砂糖', 'anemo', 'em', [['翠绿之影']], ['em'], ['em'], ['em'], ['https://www.miyoushe.com/ys/article/73607818', 'https://www.miyoushe.com/sr/article/69299682', 'https://bbs.mihoyo.com/ys/article/25074877']],
  ['琴', 'anemo', 'atk', [['翠绿之影'], ['被怜爱的少女']], ['atkP', 'er'], ['anemo', 'atkP'], ['atkP', 'heal'], ['https://www.miyoushe.com/ys/article/73882906', 'https://bbs.mihoyo.com/ys/article/22243055', 'https://bbs.mihoyo.com/ys/article/20636331']],
  ['魈', 'anemo', 'crit', [['辰砂往生录'], ['翠绿之影', '追忆之注连']], ['atkP'], ['anemo'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/49507346', 'https://bbs.mihoyo.com/ys/article/14291328', 'https://www.miyoushe.com/zzz/article/61286356']],
  ['鹿野院平藏', 'anemo', 'em', [['翠绿之影']], ['em', 'atkP'], ['anemo', 'em'], ['em', 'cr'], ['https://bbs.mihoyo.com/ys/article/25502533', 'https://bbs.mihoyo.com/ys/article/25515428', 'https://bbs.mihoyo.com/ys/article/25475900']],
  ['早柚', 'anemo', 'em', [['翠绿之影']], ['em', 'er'], ['em'], ['em', 'heal'], ['https://bbs.mihoyo.com/ys/article/25075158', 'https://bbs.mihoyo.com/ys/article/20803122', 'https://bbs.mihoyo.com/ys/article/20756639']],
  ['流浪者', 'anemo', 'crit', [['沙上楼阁史话'], ['翠绿之影']], ['atkP'], ['anemo'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/52854441', 'https://www.miyoushe.com/ys/article/32509992', 'https://www.miyoushe.com/ys/article/68213153']],
  ['闲云', 'anemo', 'atk', [['昔时之歌'], ['翠绿之影']], ['atkP', 'er'], ['atkP'], ['atkP'], ['https://www.miyoushe.com/ys/article/62923290', 'https://www.miyoushe.com/ys/article/48531983', 'https://www.miyoushe.com/ys/article/62920755']],
  ['恰斯卡', 'anemo', 'crit', [['黑曜秘典'], ['翠绿之影']], ['atkP'], ['anemo'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/67613530', 'https://www.miyoushe.com/ys/article/67504158', 'https://www.miyoushe.com/ys/article/59513958']],
  ['琳妮特', 'anemo', 'crit', [['翠绿之影'], ['沙上楼阁史话']], ['atkP'], ['anemo'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/64763434', 'https://www.miyoushe.com/ys/article/42420011', 'https://www.miyoushe.com/ys/article/77532016']],
  ['伊法', 'anemo', 'em', [['翠绿之影'], ['烬城勇者绘卷']], ['em', 'atkP'], ['anemo', 'em'], ['em', 'cr'], ['https://www.miyoushe.com/ys/article/64215763', 'https://www.miyoushe.com/ys/article/64193378', 'https://www.miyoushe.com/ys/article/64215506']],
  ['梦见月瑞希', 'anemo', 'em', [['翠绿之影'], ['饰金之梦', '流浪大地的乐团']], ['em', 'er'], ['em'], ['em'], ['https://www.miyoushe.com/ys/article/61944028', 'https://www.miyoushe.com/ys/article/61942278', 'https://www.miyoushe.com/ys/article/77540856']],

  /* ---------- 岩 ---------- */
  ['钟离', 'geo', 'hp', [['千岩牢固'], ['悠古的磐岩']], ['hpP'], ['geo', 'hpP'], ['hpP', 'cr'], ['https://www.miyoushe.com/ys/article/70478147', 'https://www.miyoushe.com/ys/article/43113435', 'https://bbs.mihoyo.com/ys/article/15008953']],
  ['阿贝多', 'geo', 'def', [['华馆梦醒形骸记'], ['悠古的磐岩']], ['defP'], ['geo', 'defP'], ['cr', 'cd', 'defP'], ['https://bbs.mihoyo.com/ys/article/12540853', 'https://www.miyoushe.com/ys/article/71204498', 'https://bbs.mihoyo.com/ys/article/12492354']],
  ['荒泷一斗', 'geo', 'def', [['华馆梦醒形骸记']], ['defP'], ['geo'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/50510058', 'https://bbs.mihoyo.com/ys/article/24446310', 'https://www.miyoushe.com/ys/article/50248084']],
  ['诺艾尔', 'geo', 'def', [['华馆梦醒形骸记'], ['逆飞的流星']], ['defP'], ['geo'], ['cr', 'cd'], ['https://bbs.mihoyo.com/ys/article/25074833', 'https://bbs.mihoyo.com/ys/article/23419183', 'https://bbs.mihoyo.com/ys/article/20700735']],
  ['五郎', 'geo', 'def', [['华馆梦醒形骸记'], ['千岩牢固']], ['defP', 'er'], ['defP'], ['defP', 'cr'], ['https://bbs.mihoyo.com/ys/article/13360837', 'https://bbs.mihoyo.com/ys/article/13058643', 'https://www.miyoushe.com/ys/article/72730171']],
  ['凝光', 'geo', 'crit', [['悠古的磐岩'], ['追忆之注连']], ['atkP'], ['geo'], ['cr', 'cd'], ['https://bbs.mihoyo.com/ys/article/11354285', 'https://bbs.mihoyo.com/ys/article/25074768', 'https://bbs.mihoyo.com/ys/article/21079968']],
  ['娜维娅', 'geo', 'crit', [['回声之林夜话'], ['逆飞的流星']], ['atkP'], ['geo'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/64214960', 'https://www.miyoushe.com/ys/article/64215722', 'https://www.miyoushe.com/ys/article/46721884']],
  ['希诺宁', 'geo', 'def', [['烬城勇者绘卷'], ['华馆梦醒形骸记']], ['defP'], ['defP'], ['defP', 'heal'], ['https://www.miyoushe.com/ys/article/71701174', 'https://www.miyoushe.com/ys/article/63567294', 'https://www.miyoushe.com/ys/article/58423970']],
  ['卡齐娜', 'geo', 'def', [['烬城勇者绘卷'], ['华馆梦醒形骸记']], ['defP'], ['geo', 'defP'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/56901692', 'https://www.miyoushe.com/ys/article/57054342', 'https://www.miyoushe.com/ys/article/57054661']],
  ['云堇', 'geo', 'def', [['华馆梦醒形骸记'], ['千岩牢固']], ['defP', 'er'], ['defP'], ['defP'], ['https://bbs.mihoyo.com/ys/article/14159567', 'https://bbs.mihoyo.com/ys/article/14168921', 'https://www.miyoushe.com/ys/article/70590053']],

  /* ---------- 草 ---------- */
  ['纳西妲', 'dendro', 'em', [['深林的记忆'], ['饰金之梦']], ['em'], ['dendro', 'em'], ['em', 'cr'], ['https://www.miyoushe.com/ys/article/68365889', 'https://www.miyoushe.com/ys/article/48532156', 'https://www.miyoushe.com/ys/article/48527814']],
  ['艾尔海森', 'dendro', 'em', [['饰金之梦'], ['深林的记忆']], ['em', 'atkP'], ['dendro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/34393808', 'https://www.miyoushe.com/ys/article/68243036', 'https://www.miyoushe.com/ys/article/53490437']],
  ['提纳里', 'dendro', 'em', [['深林的记忆'], ['流浪大地的乐团']], ['em', 'atkP'], ['dendro'], ['cr', 'cd'], ['https://bbs.mihoyo.com/ys/article/27858534', 'https://www.miyoushe.com/ys/article/68276063', 'https://bbs.mihoyo.com/ys/article/27882468']],
  ['基尼奇', 'dendro', 'crit', [['黑曜秘典'], ['深林的记忆', '追忆之注连']], ['atkP'], ['dendro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/64733796', 'https://www.miyoushe.com/ys/article/57703059', 'https://www.miyoushe.com/ys/article/64763431']],
  ['艾梅莉埃', 'dendro', 'atk', [['未竟的遐思'], ['深林的记忆', '追忆之注连']], ['atkP'], ['dendro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/66265444', 'https://www.miyoushe.com/ys/article/66196228', 'https://www.miyoushe.com/ys/article/56283870']],
  ['白术', 'dendro', 'hp', [['千岩牢固'], ['深林的记忆']], ['hpP', 'er'], ['hpP'], ['hpP'], ['https://www.miyoushe.com/ys/article/45242415', 'https://www.miyoushe.com/ys/article/52845613', 'https://www.miyoushe.com/ys/article/61217694']],
  ['瑶瑶', 'dendro', 'hp', [['千岩牢固'], ['深林的记忆']], ['hpP', 'er'], ['hpP'], ['heal', 'hpP'], ['https://www.miyoushe.com/ys/article/70045506', 'https://www.miyoushe.com/ys/article/36315371', 'https://www.miyoushe.com/ys/article/34411972']],
  ['柯莱', 'dendro', 'er', [['深林的记忆'], ['绝缘之旗印']], ['er'], ['dendro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/70046336', 'https://bbs.mihoyo.com/ys/article/27942377', 'https://bbs.mihoyo.com/ys/article/27923191']],
  ['卡维', 'dendro', 'em', [['饰金之梦'], ['深林的记忆']], ['em', 'er'], ['em'], ['em'], ['https://www.miyoushe.com/ys/article/38866023', 'https://www.miyoushe.com/ys/article/68699830', 'https://www.miyoushe.com/ys/article/38867337']],
  ['绮良良', 'dendro', 'hp', [['千岩牢固'], ['深林的记忆']], ['hpP'], ['hpP'], ['hpP'], ['https://www.miyoushe.com/ys/article/75118187', 'https://www.miyoushe.com/ys/article/39667535', 'https://www.miyoushe.com/ys/article/39654659']],

  /* ---------- 补遗：2.x–4.x 老角色（初始库未收录） ---------- */
  ['安柏', 'pyro', 'crit', [['炽烈的炎之魔女'], ['炽烈的炎之魔女', '流浪大地的乐团']], ['atkP'], ['pyro'], ['cr'], ['https://bbs.mihoyo.com/ys/article/25074046', 'https://bbs.mihoyo.com/ys/article/21900143', 'https://bbs.mihoyo.com/ys/article/8286004']],
  ['丽莎', 'electro', 'crit', [['如雷的盛怒'], ['如雷的盛怒', '饰金之梦']], ['atkP'], ['electro'], ['cr'], ['https://bbs.mihoyo.com/ys/article/18195176', 'https://bbs.mihoyo.com/ys/article/25074562', 'https://bbs.mihoyo.com/ys/article/21905051']],
  ['凯亚', 'cryo', 'crit', [['冰风迷途的勇士'], ['冰风迷途的勇士', '苍白之火']], ['atkP'], ['cryo'], ['cr'], ['https://bbs.mihoyo.com/ys/article/25074424', 'https://bbs.mihoyo.com/ys/article/21902157', 'https://bbs.mihoyo.com/ys/article/15434494']],
  ['北斗', 'electro', 'crit', [['如雷的盛怒'], ['如雷的盛怒', '绝缘之旗印']], ['atkP'], ['electro'], ['cr'], ['https://www.miyoushe.com/ys/article/76326682', 'https://www.miyoushe.com/ys/article/76458044', 'https://bbs.mihoyo.com/ys/article/25074190']],
  ['埃洛伊', 'cryo', 'crit', [['冰风迷途的勇士'], ['冰风迷途的勇士', '苍白之火']], ['atkP'], ['cryo'], ['cr'], ['https://bbs.mihoyo.com/ys/article/22236845', 'https://bbs.mihoyo.com/ys/article/20991211', 'https://bbs.mihoyo.com/ys/article/11394064']],
  ['神里绫人', 'hydro', 'crit', [['沉沦之心'], ['沉沦之心', '来歆余响']], ['atkP'], ['hydro'], ['cr'], ['https://www.miyoushe.com/ys/article/64552586', 'https://www.miyoushe.com/ys/article/45995770?create=1', 'https://www.miyoushe.com/ys/article/33348334']],
  ['千织', 'geo', 'critDef', [['黄金剧团'], ['黄金剧团', '悠古的磐岩']], ['defP'], ['geo'], ['cr'], ['https://www.miyoushe.com/ys/article/64606530', 'https://www.miyoushe.com/ys/article/50261907', 'https://www.miyoushe.com/ys/article/50251961']],
  ['珐露珊', 'anemo', 'er', [['翠绿之影'], ['翠绿之影', '绝缘之旗印']], ['er'], ['anemo'], ['cr'], ['https://www.miyoushe.com/ys/article/71373526', 'https://www.miyoushe.com/ys/article/32525530', 'https://www.miyoushe.com/ys/article/32504999']],
  ['莱依拉', 'cryo', 'hp', [['千岩牢固'], ['千岩牢固', '昔日宗室之仪']], ['hpP'], ['hpP'], ['heal'], ['https://bbs.mihoyo.com/ys/article/31870136', 'https://bbs.mihoyo.com/ys/article/31944305', 'https://bbs.mihoyo.com/ys/article/31721820']],
  ['赛索斯', 'electro', 'crit', [['来歆余响'], ['来歆余响', '如雷的盛怒']], ['atkP'], ['electro'], ['cr'], ['https://www.miyoushe.com/ys/article/53493547', 'https://www.miyoushe.com/ys/article/53494323', 'https://www.miyoushe.com/ys/article/72499518']],
  ['蓝砚', 'anemo', 'er', [['翠绿之影'], ['翠绿之影', '千岩牢固']], ['er'], ['anemo'], ['heal'], ['https://www.miyoushe.com/ys/article/61341054', 'https://www.miyoushe.com/ys/article/61261987', 'https://www.miyoushe.com/ys/article/61128886']],
  ['茜特菈莉', 'cryo', 'em', [['烬城勇者绘卷'], ['乐园遗落之花', '饰金之梦']], ['em', 'er'], ['em'], ['em'], ['https://www.miyoushe.com/ys/article/66928936', 'https://www.miyoushe.com/ys/article/60616408', 'https://www.miyoushe.com/ys/article/66889568']],

  /* ---------- 补遗：5.8 伊涅芙 + 6.0–6.5 挪德卡莱 ---------- */
  ['伊涅芙', 'electro', 'crit', [['穹境示现之夜'], ['如雷的盛怒', '饰金之梦']], ['atkP'], ['atkP'], ['cr'], ['https://www.miyoushe.com/ys/article/66930889', 'https://www.miyoushe.com/ys/article/66926002', 'https://www.miyoushe.com/ys/article/66860312']],
  ['菈乌玛', 'dendro', 'em', [['纺月的夜歌'], ['深林的记忆', '饰金之梦']], ['em'], ['em'], ['em'], ['https://www.miyoushe.com/ys/article/75010416', 'https://www.miyoushe.com/ys/article/68379786', 'https://www.miyoushe.com/ys/article/68366449']],
  ['菲林斯', 'electro', 'crit', [['穹境示现之夜'], ['饰金之梦', '如雷的盛怒']], ['atkP'], ['electro'], ['cr'], ['https://bbs.mihoyo.com/ys/article/73536135', 'https://www.miyoushe.com/ys/article/69103292', 'https://www.miyoushe.com/ys/article/69057298']],
  ['爱诺', 'hydro', 'er', [['纺月的夜歌'], ['昔日宗室之仪', '千岩牢固']], ['er'], ['hpP'], ['heal'], ['https://www.miyoushe.com/ys/article/68366413', 'https://www.miyoushe.com/ys/article/68335669', 'https://www.miyoushe.com/ys/article/68363201']],
  ['奈芙尔', 'dendro', 'em', [['穹境示现之夜'], ['深林的记忆', '饰金之梦']], ['em'], ['em'], ['cr'], ['https://www.miyoushe.com/ys/article/74992752', 'https://www.miyoushe.com/ys/article/69841102', 'https://www.miyoushe.com/ys/article/69783347']],
  ['杜林', 'pyro', 'crit', [['风起之日'], ['昔日宗室之仪', '辰砂往生录']], ['atkP'], ['pyro'], ['cr'], ['https://www.miyoushe.com/ys/article/75458713', 'https://www.miyoushe.com/ys/article/71128406', 'https://www.miyoushe.com/ys/article/71078792']],
  ['哥伦比娅', 'hydro', 'hp', [['晨星与月的晓歌'], ['千岩牢固', '昔日宗室之仪']], ['hpP', 'er'], ['hpP'], ['cr'], ['https://www.miyoushe.com/ys/article/72303663', 'https://www.miyoushe.com/ys/article/72259629', 'https://www.miyoushe.com/ys/article/72259367']],
  ['兹白', 'geo', 'critDef', [['穹境示现之夜'], ['华馆梦醒形骸记', '悠古的磐岩']], ['defP'], ['defP'], ['cr'], ['https://www.miyoushe.com/ys/article/72899669', 'https://www.miyoushe.com/ys/article/72865664', 'https://www.miyoushe.com/ys/article/72928080']],

  /* ---------- 补遗：6.6–7.0（新版本，配装可能随环境微调） ---------- */
  ['桑多涅', 'cryo', 'crit', [['影中沉凝的幻灭'], ['苍白之火', '染血的骑士道']], ['atkP'], ['atkP'], ['cr'], ['https://www.miyoushe.com/ys/article/76432747', 'https://www.miyoushe.com/ys/article/76348458', 'https://www.miyoushe.com/ys/article/76348139']],
  ['奥黛塔', 'cryo', 'crit', [['炉火融炼之心'], ['昔日宗室之仪', '辰砂往生录']], ['atkP'], ['atkP'], ['cr'], ['https://www.miyoushe.com/ys/article/77385286', 'https://www.miyoushe.com/ys/article/77367319', 'https://www.miyoushe.com/ys/article/77319627']],
  ['阿罗夏', 'electro', 'er', [['昔日宗室之仪'], ['昔日宗室之仪', '辰砂往生录']], ['er'], ['atkP'], ['cr'], ['https://www.miyoushe.com/ys/article/77397277', 'https://www.miyoushe.com/ys/article/77367254', 'https://www.miyoushe.com/ys/article/77259762']],
  ['法尔伽', 'anemo', 'crit', [['风起之日'], ['沙上楼阁史话', '辰砂往生录']], ['atkP'], ['anemo'], ['cr'], ['https://bbs.mihoyo.com/ys/article/73525902', 'https://www.miyoushe.com/ys/article/73567276', 'https://www.miyoushe.com/ys/article/73524547']],

  /* ---------- 补遗：蒙德 5.x 群角色（洛恩 / 尼可 / 布伦妮） ---------- */
  ['洛恩', 'cryo', 'crit', [['冰风迷途的勇士'], ['苍白之火']], ['atkP'], ['cryo'], ['cr', 'cd'], [], '通用推荐（暂无专属攻略来源），请按实际玩法调整'],
  ['尼可', 'pyro', 'crit', [['炽烈的炎之魔女'], ['追忆之注连']], ['atkP'], ['pyro'], ['cr', 'cd'], [], '通用推荐（暂无专属攻略来源），请按实际玩法调整'],
  ['布伦妮', 'anemo', 'em', [['翠绿之影'], ['昔日宗室之仪']], ['er', 'em'], ['anemo', 'em'], ['em'], [], '通用推荐（暂无专属攻略来源），请按实际玩法调整'],

  /* ---------- 补遗：挪德卡莱（莉奈娅 / 叶洛亚 / 雅珂达） ---------- */
  ['莉奈娅', 'geo', 'crit', [['悠古的磐岩'], ['华馆梦醒形骸记']], ['atkP'], ['geo'], ['cr', 'cd'], [], '通用推荐（暂无专属攻略来源），请按实际玩法调整'],
  ['叶洛亚', 'geo', 'critDef', [['华馆梦醒形骸记'], ['悠古的磐岩']], ['defP', 'atkP'], ['geo'], ['cr', 'cd'], [], '通用推荐（暂无专属攻略来源），请按实际玩法调整'],
  ['雅珂达', 'anemo', 'em', [['翠绿之影'], ['纺月的夜歌']], ['er', 'em'], ['em'], ['em'], [], '通用推荐（暂无专属攻略来源），请按实际玩法调整'],

  /* ---------- 旅行者：按「元素形态」各设一个条目，各自独立配装 ---------- */
  ['旅行者·风', 'anemo', 'em', [['翠绿之影']], ['er', 'em'], ['anemo', 'em'], ['em'], [], '旅行者按元素形态分别启用、分别配装，各形态互相独立'],
  ['旅行者·岩', 'geo', 'crit', [['悠古的磐岩'], ['华馆梦醒形骸记']], ['atkP', 'defP'], ['geo'], ['cr', 'cd'], [], '旅行者按元素形态分别启用、分别配装，各形态互相独立'],
  ['旅行者·雷', 'electro', 'er', [['绝缘之旗印'], ['昔日宗室之仪']], ['er', 'atkP'], ['electro', 'atkP'], ['cr', 'cd'], [], '旅行者按元素形态分别启用、分别配装，各形态互相独立'],
  ['旅行者·草', 'dendro', 'em', [['深林的记忆'], ['饰金之梦']], ['er', 'em'], ['dendro', 'em'], ['em', 'cr'], [], '旅行者按元素形态分别启用、分别配装，各形态互相独立'],
  ['旅行者·水', 'hydro', 'crit', [['沉沦之心'], ['绝缘之旗印']], ['atkP', 'er'], ['hydro'], ['cr', 'cd'], [], '旅行者按元素形态分别启用、分别配装，各形态互相独立'],
  ['旅行者·火', 'pyro', 'crit', [['炽烈的炎之魔女'], ['追忆之注连']], ['atkP'], ['pyro'], ['cr', 'cd'], [], '旅行者按元素形态分别启用、分别配装，各形态互相独立'],
];

/* ---------- 展开为完整结构 ---------- */
/* 生成一份「主要属性 + 追加属性」需求（按配装组独立） */
function makeStatNeeds(sands, goblet, circlet, subPreset) {
  return {
    main: {
      sands:   sands.map((stat, i) => ({ stat, rank: i + 1 })),
      goblet:  goblet.map((stat, i) => ({ stat, rank: i + 1 })),
      circlet: circlet.map((stat, i) => ({ stat, rank: i + 1 })),
    },
    subs: toSubs(SUB_PRESETS[subPreset] || SUB_PRESETS.crit),
  };
}

/* 把来源链接项归一化为 {url, title}（兼容旧版纯字符串 / [url,title] 数组 / 对象） */
function normSrcItem(s) {
  if (!s) return null;
  if (typeof s === 'string') return { url: s.trim(), title: '' };
  if (Array.isArray(s)) return { url: String(s[0] || '').trim(), title: String(s[1] || '').trim() };
  if (typeof s === 'object') return { url: String(s.url || '').trim(), title: String(s.title || '').trim() };
  return null;
}
function normSrcList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normSrcItem).filter(x => x && x.url);
}

function buildDefaultCharacters() {
  return RAW_CHARS.map(([name, element, subPreset, builds, sands, goblet, circlet, src, note], i) => {
    const meta = CH_META[name] || ['other', ['maindps']];
    const need = makeStatNeeds(sands, goblet, circlet, subPreset);
    return {
    id: 'c' + i + '_' + name,
    name,
    skey: name, // 出厂角色名：改名后不变，是「改名了还能还原」的唯一可靠锚点（id 会随数组插入漂移）
    element,
    region: meta[0],
    roles: meta[1].slice(),
    enabled: false,
    note: note || '',
    src: normSrcList(src),
    custom: false,
    // 主 / 追加属性需求按【配装组】区分：一组配装 = 一套词条需求
    // bkey：出厂指纹，永远用出厂角色名（如「胡桃#0」），用来判定这一组是不是内置原样、能不能还原
    builds: builds.map((sets, idx) => Object.assign({
      sets,
      bkey: name + '#' + idx,
      priority: idx === 0 ? 'main' : 'alt',
    }, JSON.parse(JSON.stringify(need)))),
  };});
}

/* ============================================================
 * 语言：数据语言（角色 / 套装 / 属性等【数据本身】显示成中文还是英文）
 * ------------------------------------------------------------
 * 与「显示语言」分开：显示语言只管界面文案，数据语言只管数据内容。
 * DATA_LANG 由 app.js 在切换时赋值，取值函数统一走 d()。
 * ============================================================ */
let DATA_LANG = 'zh';
let UI_LANG = 'zh';
function setDataLang(lang) { DATA_LANG = (lang === 'en' ? 'en' : 'zh'); }
function setUiLang(lang) { UI_LANG = (lang === 'en' ? 'en' : 'zh'); }
function isDataEn() { return DATA_LANG === 'en'; }
function isUiEn() { return UI_LANG === 'en'; }
/* 取译名：英文模式下返回官方英文名，没有译名就回退原文。
 * _forceZh：导出 / 复制时临时置起——游戏内锁定界面是中文，
 * 照抄的清单必须跟着游戏走，不能随界面语言变成英文。 */
let _forceZh = false;
function withZh(fn) {
  const old = _forceZh;
  _forceZh = true;
  try { return fn(); } finally { _forceZh = old; }
}
function d(zh, en) { return (!_forceZh && DATA_LANG === 'en' && en) ? en : zh; }

const ELEMENT_EN = {
  pyro: 'Pyro', hydro: 'Hydro', cryo: 'Cryo', electro: 'Electro',
  anemo: 'Anemo', geo: 'Geo', dendro: 'Dendro',
};
const REGION_EN = {
  mondstadt: 'Mondstadt', liyue: 'Liyue', inazuma: 'Inazuma', sumeru: 'Sumeru',
  fontaine: 'Fontaine', natlan: 'Natlan', nodkrai: 'Nod-Krai',
  snezhnaya: 'Snezhnaya', other: 'Other',
};
const ROLE_EN = { maindps: 'Main DPS', subdps: 'Sub DPS', support: 'Support' };
const SLOT_EN = {
  flower: 'Flower of Life', plume: 'Plume of Death', sands: 'Sands of Eon',
  goblet: 'Goblet of Eonothem', circlet: 'Circlet of Logos',
};
const SLOT_SHORT_EN = {
  flower: 'Flower', plume: 'Plume', sands: 'Sands', goblet: 'Goblet', circlet: 'Circlet',
};
/* 主要属性 / 追加属性共用一套词条名（官方英文本地化） */
const STAT_EN = {
  hp: 'HP', atk: 'ATK', def: 'DEF',
  hpP: 'HP%', atkP: 'ATK%', defP: 'DEF%',
  em: 'Elemental Mastery', er: 'Energy Recharge',
  pyro: 'Pyro DMG Bonus', hydro: 'Hydro DMG Bonus', cryo: 'Cryo DMG Bonus',
  electro: 'Electro DMG Bonus', anemo: 'Anemo DMG Bonus', geo: 'Geo DMG Bonus',
  dendro: 'Dendro DMG Bonus', phys: 'Physical DMG Bonus',
  cr: 'CRIT Rate', cd: 'CRIT DMG', heal: 'Healing Bonus',
};
const SUB_PRESET_EN = {
  crit: 'CRIT', critHp: 'CRIT + HP', critDef: 'CRIT + DEF',
  em: 'Elemental Mastery', hp: 'HP', def: 'DEF',
  er: 'Energy Recharge', atk: 'ATK', heal: 'Healing',
};

/* ---------- 工具：取名称（统一走数据语言） ---------- */
function charName(n) { return d(n, CH_EN[n]); }
function keepRuleName(n) { return d(n, KEEP_RULE_EN[n]); }
function setName(n)  { return d(n, SET_EN[n]); }
function elemName(id)   { return d((ELEMENTS[id] || {}).name || id, ELEMENT_EN[id]); }
function regionName(id) { return d(REGION_NAME[id] || id, REGION_EN[id]); }
function roleName(id)   { return d(ROLE_NAME[id] || id, ROLE_EN[id]); }
function slotName(id) {
  const hit = SLOTS.find(s => s.id === id);
  return hit ? d(hit.name, SLOT_EN[id]) : id;
}
function slotShortName(id) {
  const hit = SLOTS.find(s => s.id === id);
  return hit ? d(hit.short, SLOT_SHORT_EN[id]) : id;
}
/* 2 件套说明里几条不好直译的，整条给英文 */
const BONUS_EN = {
  '夜魂加持下伤害+15%': "DMG +15% in Nightsoul's Blessing",
  '元素战技/爆发伤害+15%': 'Elemental Skill/Burst DMG +15%',
  '普通攻击/重击伤害+15%': 'Normal / Charged Attack DMG +15%',
  '下落攻击伤害+25%': 'Plunging Attack DMG +25%',
  '受到的雷元素伤害-40%': 'Electro DMG taken -40%',
  '受到的火元素伤害-40%': 'Pyro DMG taken -40%',
  '受到的冰元素伤害-40%': 'Cryo DMG taken -40%',
  '受到的水元素伤害-40%': 'Hydro DMG taken -40%',
  '护盾强效+35%': 'Shield Strength +35%',
  '攻击力+18%': 'ATK +18%',
  '生命值+20%': 'HP +20%',
  '防御力+30%': 'DEF +30%',
  '元素精通+80': 'Elemental Mastery +80',
  '元素充能效率+20%': 'Energy Recharge +20%',
  '治疗加成+15%': 'Healing Bonus +15%',
  '物理伤害+25%': 'Physical DMG +25%',
  '元素战技伤害+20%': 'Elemental Skill DMG +20%',
  '元素爆发伤害+20%': 'Elemental Burst DMG +20%',
  '火元素伤害+15%': 'Pyro DMG Bonus +15%',
  '水元素伤害+15%': 'Hydro DMG Bonus +15%',
  '冰元素伤害+15%': 'Cryo DMG Bonus +15%',
  '雷元素伤害+15%': 'Electro DMG Bonus +15%',
  '风元素伤害+15%': 'Anemo DMG Bonus +15%',
  '岩元素伤害+15%': 'Geo DMG Bonus +15%',
  '草元素伤害+15%': 'Dendro DMG Bonus +15%',
};
/* 2 件套说明（如「攻击力+18%」）也跟着数据语言走 */
function setBonusText(name) {
  const zh = SET_BONUS[name] || '';
  if (DATA_LANG !== 'en') return zh;
  if (BONUS_EN[zh]) return BONUS_EN[zh];
  return zh
    .replace(/(火|水|冰|雷|风|岩|草|物理)元素伤害/g, function (_, e) {
      return ELEMENT_EN[{ 火: 'pyro', 水: 'hydro', 冰: 'cryo', 雷: 'electro', 风: 'anemo', 岩: 'geo', 草: 'dendro', 物理: 'phys' }[e]] + ' DMG';
    })
    .replace(/受到的(火|水|冰|雷)元素伤害/g, function (_, e) {
      return ELEMENT_EN[{ 火: 'pyro', 水: 'hydro', 冰: 'cryo', 雷: 'electro' }[e]] + ' DMG Taken';
    })
    .replace(/[一-龥]+/g, function (m) {
      const map = {
        '攻击力': 'ATK', '生命值': 'HP', '防御力': 'DEF', '元素精通': 'Elemental Mastery',
        '元素充能效率': 'Energy Recharge', '治疗加成': 'Healing Bonus', '护盾强效': 'Shield Strength',
        '元素爆发伤害': 'Elemental Burst DMG', '元素战技伤害': 'Elemental Skill DMG',
        '普通攻击': 'Normal Attack', '重击': 'Charged Attack', '下落攻击': 'Plunging Attack',
        '夜魂加持下': 'under Nightsoul', '伤害': 'DMG',
      };
      return map[m] != null ? map[m] : m;
    });
}
/* ---------- 工具：取主要属性名称 ---------- */
function mainStatName(slot, id) {
  if (id && typeof id === 'object') id = (id.stat != null ? id.stat : id.id);
  const list = MAIN_STATS[slot] || [];
  const hit = list.find(s => s.id === id);
  return hit ? d(hit.name, STAT_EN[id]) : (typeof id === 'string' ? d(id, STAT_EN[id]) : '');
}
function subStatName(id) {
  if (id && typeof id === 'object') id = (id.id != null ? id.id : id.stat);
  const hit = SUB_STATS.find(s => s.id === id);
  return hit ? d(hit.name, STAT_EN[id]) : (typeof id === 'string' ? d(id, STAT_EN[id]) : '');
}

/* ============================================================
 * 翻译词典（中文原文 → English）
 * ------------------------------------------------------------
 * 用法：界面渲染后统一扫一遍 DOM，把文本 / placeholder / title 按词典替换。
 * 这样 app.js 里的中文文案不用逐个包函数，切换语言 = 换一张表重扫。
 * 词典分两块，对应两个独立开关：
 *   T_DATA_EN 数据语言 = 角色 / 套装 / 国度 / 定位 / 部位 / 词条 / 预设（官方英文本地化）
 *   T_UI_EN   显示语言 = 界面按钮、标签、提示、说明文案
 * 没收录的条目自动保留中文，不会翻出半吊子英文。
 * ============================================================ */

/* 由「中文名 → 英文名」两张表拼出「中文显示名 → 英文显示名」 */
function _enByName(zhMap, enMap) {
  const out = {};
  Object.keys(zhMap).forEach(k => {
    const zh = zhMap[k], en = enMap[k];
    if (zh && en && zh !== en) out[zh] = en;
  });
  return out;
}
const T_DATA_EN = Object.assign(
  {},
  CH_EN,
  SET_EN,
  _enByName(REGION_NAME, REGION_EN),
  _enByName(ROLE_NAME, ROLE_EN),
  _enByName(Object.fromEntries(Object.keys(ELEMENTS).map(k => [k, ELEMENTS[k].name])), ELEMENT_EN),
  _enByName(Object.fromEntries(SLOTS.map(s => [s.id, s.name])), SLOT_EN),
  _enByName(Object.fromEntries(SLOTS.map(s => [s.id, s.short])), SLOT_SHORT_EN),
  _enByName(SUB_PRESET_NAMES, SUB_PRESET_EN),
  /* 词条名：主要属性 / 追加属性共用一套官方英文名 */
  _enByName(Object.fromEntries(SUB_STATS.map(s => [s.id, s.name])), STAT_EN),
  _enByName(Object.keys(MAIN_STATS).reduce((acc, slot) => {
    MAIN_STATS[slot].forEach(s => { acc[s.id] = s.name; });
    return acc;
  }, {}), STAT_EN),
  { '其他': 'Other', '不限': 'Any' },
);

/* ---------- 界面文案（显示语言 = English 时启用） ---------- */
const T_UI_EN = {
  /* 顶栏 / 导航 */
  '原神圣遗物锁定方案生成器': 'Genshin Artifact Lock Plan Generator',
  '输入角色配装需求 → 汇总输出每套圣遗物的锁定清单': 'Pick your characters → get a lock plan for every artifact set',
  '数据保存在本机浏览器': 'Saved in this browser',
  '使用说明': 'How to use',
  '① 角色配置': '① Characters',
  '① 角色': '① Chars',
  '② 锁定方案': '② Lock Plans',
  '② 方案': '② Plans',
  '③ 追加属性规则': '③ Substat Rules',
  '③ 追加属性': '③ Substats',
  '④ 数据管理': '④ Data',
  '④ 数据': '④ Data',
  '显示语言': 'UI language',
  '数据语言': 'Data language',
  '中文': 'Chinese',
  '英文': 'English',

  /* 角色页 · 筛选 / 批量 */
  '搜索角色 / 套装 / 国度 / 定位…': 'Search character / set / region / role…',
  '全部': 'All',
  '全部国度': 'All regions',
  '只看已启用': 'Enabled only',
  '批量': 'Batch',
  '全选': 'Select all',
  '全不选': 'Deselect all',
  '反选': 'Invert',
  '按属性': 'By element',
  '按国度': 'By region',
  '按定位': 'By role',
  '已启用': 'Enabled',
  '个角色': 'characters',
  '筛出': 'matched',
  '+ 新增角色': '+ Add character',
  '没有匹配的角色。': 'No matching characters.',
  '当前筛选结果为空': 'Nothing matches the current filters',
  '没有该分类的角色': 'No character in this category',
  '清空所有角色的启用状态？（配装数据保留）': 'Clear enabled state for all characters? (builds are kept)',
  '已清空启用状态': 'Enabled state cleared',

  /* 方案页 */
  '套装筛选': 'Set filter',
  '全部套装': 'All sets',
  '部位筛选': 'Slot filter',
  '全部部位': 'All slots',
  '隐藏无人需要的套装': 'Hide sets nobody needs',
  '计入备选配装': 'Include alt builds',
  '显示详细件数': 'Show piece counts',
  '复制游戏内方案': 'Copy in-game plan',
  '游戏内方案已复制': 'In-game plan copied',
  '复制清单': 'Copy list',
  '清单已复制到剪贴板': 'List copied to clipboard',
  '复制失败，请手动选择文本': 'Copy failed — please select the text manually',
  '导出 CSV': 'Export CSV',
  'CSV 已导出（Excel 可直接打开）': 'CSV exported (opens in Excel)',
  '打印 / 存 PDF': 'Print / Save PDF',
  '请先在「① 角色配置」页勾选你要养的角色，这里会自动生成锁定方案。':
    'Tick the characters you build on the ① Characters page first — lock plans are generated from them.',
  '没有符合条件的套装。': 'No set matches the filters.',
  '原神圣遗物锁定清单': 'Genshin Artifact Lock List',
  '启用角色': 'Enabled characters',
  '涉及套装': 'Sets involved',
  '采纳方案总数': 'Adopted plans',
  '可整套清理的套装': 'Sets you can clear entirely',
  '复制': 'Copy',
  '采纳': 'Adopt',
  '并入…': 'Merge into…',
  '拆回': 'Split back',
  '已合并为一个方案': 'Merged into one plan',
  '已拆回为合并前的候选': 'Split back into the original candidates',
  '编辑': 'Edit',
  '删除': 'Delete',
  '已删除': 'Deleted',
  '最优': 'Best',
  '建议保留': 'Keep',
  '件': 'pcs',
  '无角色需要': 'Nobody needs it',
  '无角色需要 · 可全喂': 'Nobody needs it · safe to feed',
  '无角色需要 · 可整套清理': 'Nobody needs it · clear the whole set',
  '稀有·建议多留': 'Rare · keep more',
  '二选一': 'Either one',
  '详细件数清单': 'Piece count detail',
  '追加属性优先：': 'Substat priority:',
  '未配置套装': 'No set configured',
  '不限': 'Any',
  '不限套装）': 'any set)',
  '（未指定角色）': '(no character)',

  /* 散件 / 过渡 保留规则 */
  '🧩 散件 / 过渡 保留规则': '🧩 Off-piece / Transitional Keep Rules',
  '＋ 新增自定义规则': '＋ New custom rule',
  '＋ 新增规则': '＋ New rule',
  '收起这一模块（只是不显示，启用的规则照常生效）': 'Collapse this block (display only — enabled rules keep working)',
  '编辑规则': 'Edit rule',
  '＋ 新增自定义规则': '＋ New custom rule',
  '添加规则': 'Add rule',
  '取消编辑': 'Cancel edit',
  '名称': 'Name',
  '描述（可选）': 'Description (optional)',
  '部位': 'Slot',
  '要留的主要属性': 'Main stats to keep',
  '追加属性': 'Substats',
  '★必须追加属性': '★Required substats',
  '启用': 'Enable',
  '停用': 'Disable',
  '已修改': 'Modified',
  '恢复默认': 'Restore default',
  '已恢复默认设置': 'Defaults restored',
  '已删除规则': 'Rule deleted',
  '请填写规则名称': 'Please enter a rule name',
  '请至少勾选一个要留的主要属性': 'Pick at least one main stat to keep',

  /* 追加属性规则页 */
  '通用分档规则': 'General tier rules',
  '胚子评分器': 'Artifact scorer',
  '输入一件圣遗物的信息，快速判断值不值得留。': 'Enter an artifact to see whether it is worth keeping.',
  '根据你启用的角色，自动汇总出的主要属性白名单 + 追加属性判定逻辑。游戏内可照此执行锁定。':
    'Auto-summarised from your enabled characters: a main-stat whitelist plus substat rules you can copy into the game.',
  '各套装推荐追加属性': 'Recommended substats per set',
  '套装': 'Set',
  '相对强度': 'Relative weight',
  '追加属性需求排序 Top5（★= 多数角色标为必选）':
    'Substat priority Top 5 (★ = most characters marked it Required)',
  '主要属性': 'Main stat',
  '主要属性固定': 'Main stat is fixed',
  '未设置': 'Not set',
  '未设置，可在下方添加': 'Not set — add one below',
  '命中': 'Hits',

  /* 数据管理页 */
  '圣遗物套装管理': 'Artifact Set Manager',
  '备份与恢复': 'Backup & restore',
  '打开套装管理': 'Open set manager',
  '导出配置 JSON': 'Export config JSON',
  '导入配置 JSON': 'Import config JSON',
  '清空启用状态': 'Clear enabled state',
  '恢复内置默认库（硬刷新）': 'Restore built-in defaults (hard reset)',
  '已导出配置': 'Config exported',
  '导入成功：': 'Imported: ',
  '导入失败：文件格式不正确': 'Import failed: invalid file',
  '已恢复默认库': 'Defaults restored',
  '更新日志': 'Changelog',
  '查看更新公告': 'View update notice',
  '关于数据': 'About the data',
  '个角色、': ' characters and ',
  '个套装，整理自社区常见推荐，随版本变动请自行校正。': ' sets, compiled from common community builds — adjust as patches change things.',
  '上移': 'Move up',
  '下移': 'Move down',
  '隐藏': 'Hide',
  '恢复': 'Restore',
  '内置': 'Built-in',
  '自定义': 'Custom',
  '新套装名称，例：某某之梦': 'New set name, e.g. Some Set',
  '2件套效果，例：攻击力+18%': '2-piece bonus, e.g. ATK +18%',
  '+ 添加套装': '+ Add set',
  '显示已隐藏的内置套装': 'Show hidden built-in sets',
  '恢复全部内置套装': 'Restore all built-in sets',
  '请输入套装名称': 'Please enter a set name',
  '该套装已存在': 'That set already exists',
  '已存在同名套装': 'A set with that name already exists',
  '套装名称不能为空': 'Set name cannot be empty',
  '已添加套装：': 'Set added: ',
  '已恢复': 'Restored',
  '个内置套装': 'built-in sets',
  '内置套装已全部在列表中': 'All built-in sets are already listed',
  '个角色的配装用到了它，会一并移除。': ' character builds use it and will be updated.',
  '确定删除这个套装吗？': 'Delete this set?',

  /* 角色编辑浮窗 */
  '编辑角色': 'Edit character',
  '新增角色': 'New character',
  '角色名称': 'Character name',
  '元素属性': 'Element',
  '所属国度': 'Region',
  '队伍定位': 'Role',
  '可多选，影响批量筛选': 'Multi-select — used by batch filters',
  '圣遗物配装': 'Artifact builds',
  '第 1 组为主推，其余为备选；单套=4件套，双套=2+2':
    'Group 1 is the main build, others are alternates; one set = 4-piece, two sets = 2+2',
  '下面每组是一张': 'Each group below is a',
  '只读卡片': 'read-only card',
  '：要看 / 改词条（三部位主要属性与追加属性）请点「✎ 编辑」，在弹出窗口里点「保存」才生效。':
    ': to view or edit stats (main stat + substats) tap "✎ Edit" and hit "Save" in the popup.',
  '+ 添加一组配装': '+ Add a build',
  '📋 新增时套用…': '📋 Template for new builds…',
  '空白（双暴默认词条）': 'Blank (default CRIT substats)',
  '＋ 从预置添加': '＋ Add from presets',
  '（选择一个已删除的预置组）': '(pick a deleted preset group)',
  '备注': 'Notes',
  '攻略来源': 'Sources',
  '+ 添加链接': '+ Add link',
  '暂无来源，点击下方「+ 添加链接」': 'No sources yet — tap "+ Add link" below',
  '↩ 还原主推': '↩ Restore main build',
  '当前「主推 / 备选」的排布与内置不同（词条内容没变）':
    'Main / alt arrangement differs from the built-in data (substats unchanged)',
  '✎ 编辑': '✎ Edit',
  '设为主推': 'Set as main build',
  '整组还原': 'Restore this group',
  '已还原为内置原样，点「保存」后生效': 'Restored to built-in — hit "Save" to apply',
  '已还原主推排布，点「保存」后生效': 'Main build restored — hit "Save" to apply',
  '这一组没有内置原样可还原': 'No built-in version to restore for this group',
  '这个角色没有内置数据可还原': 'No built-in data to restore for this character',
  '删除角色': 'Delete character',
  '还原内置': 'Restore built-in',
  '取消': 'Cancel',
  '保存': 'Save',
  '请填写角色名称': 'Please enter a character name',
  '请至少选择一个套装': 'Pick at least one set',
  '至少保留一组配装': 'Keep at least one build',
  '至少保留一个定位': 'Keep at least one role',
  '可选的都已经在列表里了。': 'Everything available is already listed.',
  '（选择套装）': '(pick a set)',
  '（2+2 可选）': '(optional for 2+2)',
  '（不改，保持当前）': '(keep current)',

  /* 配装编辑浮窗 */
  '编辑配装': 'Edit build',
  '关闭': 'Close',
  '设为主推（第 1 组默认主推，同一角色只可有一组主推）':
    'Set as main build (group 1 is main by default; only one main per character)',
  '📋 套用…': '📋 Copy from…',
  '越靠前越想要；★ = 游戏内锁定方案的「必须」':
    'Earlier = more wanted; ★ = "Required" in the in-game lock plan',
  '+ 添加追加属性…': '+ Add substat…',
  '追加属性需求': 'Substat needs',
  '+ 添加主要属性': '+ Add main stat',
  '该主要属性已在列表中': 'That main stat is already listed',
  '该追加属性已在列表中': 'That substat is already listed',
  '越靠前优先级越高': 'Earlier = higher priority',
  '与上一条的重要度关系：': 'Importance vs. the previous entry:',
  '同等重要': 'Equally important',
  '略低': 'Slightly lower',
  '必选': 'Required',
  '选择属性': 'Choose a stat',
  '选择主要属性': 'Choose a main stat',
  '选择追加属性': 'Choose a substat',
  '改完请点右下角': 'Hit ',
  '才生效；点「取消」或关掉窗口，改动会全部丢弃。':
    ' to apply; "Cancel" or closing the window discards every change.',
  '还原这一组': 'Restore this group',

  /* 更新公告 */
  '更新公告': 'Update notice',
  '知道了': 'Got it',

  /* 方案卡片内文案 */
  '🎮 游戏内锁定方案候选': '🎮 In-game lock plan candidates',
  '追加属性（五部位相同）': 'Substats (same for all five slots)',
  '包含（★计入）': 'Include (★ counts)',
  '个候选方案': 'candidates',
  '个候选（角色组': 'candidates (character group',
  '个预设': 'presets',
  '个自定义预设': 'custom presets',
  '个自定义预设，多个预设共同生效；': ' custom presets; several can be active at once; ',
  '个锁定方案': 'lock plans',
  '个套装': 'sets',
  '个套装、': ' sets and ',
  '个套装超过': ' sets exceed',
  '个套装采纳了超过': ' sets adopted more than',
  '主推 / 备选': 'Main / alt',
  '主推': 'Main',
  '备选': 'Alt',
  '主推 / 备选」权重：主推': 'Main / alt weighting: main',
  '（如双暴）自动合并——重要属性相同就并为一套，次要属性（攻击% / 生命% / 防御%）不同的角色用':
    ' (like CRIT) — same key stats merge into one plan; characters that differ only in ATK% / HP% / DEF% are marked with ',
  '颜色': 'colour',
  '区分标注；': ' instead; ',
  '重要属性': 'Key stats',
  '候选按角色的': 'Candidates are grouped by each character\'s',
  '全自动、无需调参': 'fully automatic, no tuning needed',
  '每个方案的': 'Every plan\'s',
  '五个部位共用同一份追加属性条件': 'five slots share one substat condition',
  '，主要属性逐部位独立合并；命中条数': '; main stats are merged per slot; the hit count',
  '默认「至少两条」': 'defaults to "at least 2"',
  '，可在下方单独调到 1–4 做更细的筛选；觉得候选多了就用「并入…」合并、或取消勾选「采纳」。':
    ' and can be set to 1–4 per plan below; if there are too many candidates, use "Merge into…" or untick "Adopt".',
  '游戏内：背包 → 圣遗物 → 锁定功能 → 选中本套装 → 编辑，按上方逐套设置；\n      每种套装游戏内':
    'In game: Inventory → Artifacts → Lock → pick this set → Edit, then apply the settings above; each set has ',
  '，请自行收敛。仅有 3 条追加属性的圣遗物，所需数量会自动减 1。':
    ' — keep it within that. Artifacts with only 3 substats need one less hit.',

  /* 胚子评分器档位 */
  'S 级 · 必锁': 'S · Lock it',
  'A 级 · 升级观察': 'A · Level and watch',
  '主要属性命中「必留」列表，且追加属性': 'Main stat is on the "keep" list and the substats',
  '同时含暴击率与暴击伤害': 'include both CRIT Rate and CRIT DMG',
  '主要属性命中需求，追加属性含': 'Main stat matches the need and substats include',
  '操作：直接锁定，喂到 20 级。': 'Action: lock it and level to 20.',
  '单个暴击词条 + 1 条有效词条': 'one CRIT roll + 1 useful stat',
};

/* 合并后的当前词典：按两个开关拼装（界面文案优先级高于数据名） */
function currentDict() {
  const m = {};
  if (typeof isDataEn === 'function' && isDataEn()) Object.assign(m, T_DATA_EN);
  if (typeof isUiEn === 'function' && isUiEn()) Object.assign(m, T_UI_EN);
  return m;
}
/* 供 app.js 里拼接出来的文案使用：查得到就翻，查不到保留中文 */
function t(zh) {
  const m = currentDict();
  return (m[zh] != null ? m[zh] : zh);
}

/* 使用说明的整段英文版（避免被 <b> 切碎后没法逐句匹配） */
const I18N_HTML = {
  help: [
    '<h4>How it works</h4>',
    '<ol>',
    '<li><b>① Characters</b>: filter by <b>element / region / role</b> at the top (they stack, and combine with the search box and "Enabled only"); when a filter is on, the top right shows "matched N / total". Next to it <b>↓ Ascending / ↑ Descending</b> flips the whole list (your choice is remembered). Tick the characters you actually build. Tap a card to open the <b>edit popup</b>: character info on top, build cards below — each card shows the set, the three main stats and the substats at a glance; <b>"✎ Edit"</b> on a card opens a second <b>build editor popup</b>. Stats only apply after you hit <b>"Save"</b>; "Cancel" / closing / clicking outside warns about unsaved changes first. A character can have several builds (4-piece / 2+2) and <b>each build keeps its own stat needs</b>; when adding one you can start blank or copy an existing build, and deleted <b>built-in presets</b> can be picked back up from "＋ Add from presets".</li>',
    '<li><b>Made a mess?</b>: both build cards and character cards can show a <b>"Modified"</b> badge — that item now differs from the built-in data. One group gone wrong → <b>"Restore this group"</b> on the card (set + stats + main flag all back to built-in). Only tangled up which build is main → a <b>"↩ Restore main build"</b> button appears above the builds (touches the main flag only). Whole character a mess → <b>"Restore built-in"</b> at the bottom left of the popup (name / element / region / role / note / sources / every build at once). Deleted built-in builds can be re-added from "＋ Add from presets".</li>',
    '<li><b>Built-in data follows game updates</b>: builds you have <b>not touched</b> automatically pick up new data from the repo; anything <b>you edited</b> is left alone (tagged "Modified") — hit restore if you want the new version.</li>',
    '<li><b>② Lock Plans</b>: every set gets "in-game lock plan <b>candidates</b>" — clustered automatically by each character\'s <b>substat needs</b>. All <b>five slots in one plan share the same substat condition</b>; main stats are listed per slot, so you can just copy them into the game. <b>No slot limit</b>: there can be many candidates — merge them by hand with "Merge into…" or untick "Adopt" to drop the ones you do not want, then narrow it down to the 3 presets the game allows per set. The <b>"🧩 Off-piece / Transitional Keep Rules"</b> block at the top is character-independent: artifacts worth keeping purely because the main stat is rare (an elemental DMG goblet, say). Each enabled rule produces a candidate plan that joins the character clusters with <b>equal weight</b> for merging and adoption.</li>',
    '<li><b>Traveler</b> is split into 6 separate entries by element (Traveler · Anemo / Geo / Electro / Dendro / Hydro / Pyro): each form has a different element and different builds, so they can be enabled and edited separately. Likewise <b>Nod-Krai</b> is now its own region (separate from Snezhnaya); if your save is from an older version, regions and roles are corrected once on open — after that your own edits are never overwritten.</li>',
    '<li><b>List sorting</b>: the ① character cards, the ② set blocks and the ③ "Recommended substats per set" table at the bottom all have a <b>↓ Ascending / ↑ Descending</b> button — one tap flips the direction and the choice is saved locally. Set lists (②③) also get a <b>"Catalog / Usage" toggle</b>: <b>Catalog</b> = the order in the set library (which follows the HoYoLAB catalog), stable and never jumping around; <b>Usage</b> = most used first, which changes with the characters you tick. The character list is ordered by region (Mondstadt → Liyue → … → Other·Traveler).</li>',
    '<li><b>③ Substat Rules</b>: tier rules plus an artifact scorer, answering "the main stat is right, but are the substats worth keeping?".</li>',
    '<li><b>④ Data → Set Manager (popup)</b>: hit "Open set manager" to add or remove sets, edit the 2-piece text and reorder; built-in sets are only "hidden" and can be restored any time.</li>',
    '<li><b>④ Data → Changelog</b>: the built-in characters and artifacts are maintained by hand as the game updates; every change is logged here. A major update pops up the <b>update notice</b> once the first time you open the app (it stops after you have read it) — use "View update notice" to see it again.</li>',
    '</ol>',
    '<h4>Reading a plan</h4>',
    '<ul>',
    '<li><b>Plan N</b>: built by merging characters with similar substat needs; the heading says who it is for. Several plans under one set are <b>all active at once</b> in the lock screen (they are ORed together).</li>',
    '<li><b>Adopt / Merge into… / Split back</b>: every candidate starts out adopted; "Merge into…" folds two candidates into one and "Split back" undoes it. Changes are saved. When the number of adopted plans passes the in-game limit (3 per set), an orange warning appears at the top.</li>',
    '<li><b>Auto-merging</b>: plans are clustered by each character\'s <b>key stats</b> (the run of equally important entries from the top plus the &#9733;required ones — usually just CRIT): matching key stats merge into one plan. Differences in minor stats (ATK% / HP% and so on) do not block a merge — those are shown <b>colour-grouped per character</b>, and which one actually gets the piece depends on what you have. Main stats are merged <b>independently per slot</b>. No tuning needed.</li>',
    '<li><b>&#9733;Required</b>: the gold entries — the artifact <b>must</b> have them or it is not locked. They come from substats <b>every character in the group ticked as "Required"</b> (set it with the ☆ in the character popup), at most 2.</li>',
    '<li><b>At least 2</b>: the hit count <b>defaults to "at least 2"</b> — an artifact ends up with 4 substats and at least 2 of them must fall in the substat pool before it is locked; &#9733;required entries count towards those two. To be stricter, change the dropdown on that plan card <b>to 3 or 4</b> (or relax it to 1); each plan remembers its own value.</li>',
    '<li><b>Collapse</b>: the arrow on the left of the "🧩 Off-piece / Transitional Keep Rules" heading folds the block down to a single title line — it only hides it, enabled rules keep producing candidates.</li>',
    '<li>Tick <b>"Show piece counts"</b> in the toolbar to expand the suggested keep count and the source of each need; unticked, the page only shows the lock plans you can copy straight over.</li>',
    '</ul>',
    '<h4>Gotchas</h4>',
    '<ul>',
    '<li>Flower and plume have fixed main stats, so in game you can only set substats for them — that makes those two slots the strictest. After the plan unifies substats, the &#9733;required list and the substat pool only drop entries that clash with flower / plume.</li>',
    '<li>Elemental DMG goblets have a very low drop rate — turn on the "Elemental DMG Goblet" rule under "🧩 Off-piece / Transitional Keep Rules" to keep a set of them aside.</li>',
    '<li>A substat can never repeat the main stat of the same slot. After the plan unifies substats, entries clashing with the fixed flower / plume main stats (HP / ATK) are removed automatically; sands / goblet / circlet main stats vary per plan so they cannot be filtered per slot — just skip those when copying.</li>',
    '<li>Data lives in this browser; use "Data → Export JSON" to move to another device.</li>',
    '</ul>',
    '<h4>Language</h4>',
    '<ul>',
    '<li>Two independent switches in the top right: <b>UI language</b> (buttons and help text) and <b>Data language</b> (character names, set names, stat names). Both are remembered, and the two can differ.</li>',
    '<li>Search matches both languages — typing "Hu Tao" or "Marechaussee" works no matter which data language is active.</li>',
    '<li>Exports and clipboard text follow the game, so they stay in Chinese.</li>',
    '</ul>',
  ].join(''),
};

/* ---------- 界面文案补充（含带数字的句式；逐句收录，避免翻出半吊子英文） ---------- */
Object.assign(T_UI_EN, {
  /* 排序 */
  '排序顺序来自米游社图鉴': 'Order follows the HoYoLAB catalog',
  '按使用人数排序：用得多的在前': 'Sorted by usage: most used first',
  '↓ 正序': '↓ Ascending',
  '↑ 倒序': '↑ Descending',
  '图鉴': 'Catalog',
  '推荐': 'Usage',
  /* 顶栏语言控件 */
  '显示': 'UI',
  '数据': 'Data',
  /* 定位组合（卡片上用「·」连起来的多定位） */
  '主C·副C': 'Main DPS · Sub DPS',
  '主C·辅助': 'Main DPS · Support',
  '副C·主C': 'Sub DPS · Main DPS',
  '副C·辅助': 'Sub DPS · Support',
  '辅助·主C': 'Support · Main DPS',
  '辅助·副C': 'Support · Sub DPS',
  '主C·副C·辅助': 'Main DPS · Sub DPS · Support',
  /* 追加属性重要度 */
  '同权': 'Tied',
  '次选': '2nd',
  /* 内置散件规则名 */
  '元素伤害杯': 'Elemental DMG Goblet',
  '双暴头': 'CRIT Circlet',
  '充能沙': 'Energy Recharge Sands',
  '精通杯': 'Elemental Mastery Goblet',
  /* 散件规则描述（整句，遇到 <b> 切碎的靠 data-en 顶上） */
  '空之杯主要属性为任意元素 / 物理伤害加成——掉率极低，是公认必留的稀有胚子':
    'Goblet with any elemental or Physical DMG Bonus — extremely rare, keep it',
  '理之冠主要属性为暴击率 / 暴击伤害，追加属性带双暴等好词条即留':
    'Circlet with CRIT Rate / CRIT DMG, keep it when the substats include CRIT',
  '时之沙主要属性为元素充能效率，追加属性带双暴 / 攻击等即留':
    'Sands with Energy Recharge, keep it when the substats include CRIT / ATK',
  '空之杯主要属性为元素精通——草系反应队常用，同样稀有':
    'Goblet with Elemental Mastery — common in Dendro reaction teams, just as rare',
  /* 胚子评分器档位 */
  'B 级 · 过渡件': 'B · Transitional',
  'C 级 · 狗粮': 'C · Feed it',
  '主要属性命中需求但追加属性平庸。': 'Main stat matches but the substats are mediocre.',
  '主要属性不在任何已启用角色的需求列表中。': 'Main stat is not needed by any enabled character.',
  '操作：直接喂。': 'Action: feed it.',
  '操作：先用着，毕业胚子到位后当狗粮喂掉。': 'Action: use it for now, feed it once a better piece shows up.',
  '操作：升到 4 级看第 4 词条，出双暴继续喂，否则停手留作过渡。':
    'Action: level to 4 to reveal the 4th substat; keep going on CRIT, otherwise stop and keep it as a transitional piece.',
  '例外：同套装的对应元素伤害杯极难出货，建议无脑保留。':
    'Exception: a matching elemental DMG goblet of the same set is extremely rare — always keep it.',
  '（或你方角色所需的核心双词条）。': '(or the two core substats your characters need).',
  /* 方案页零碎 */
  '预设「至少两条」': 'defaults to "at least 2"',
  '「保存」': '"Save"',
  '全部角色': 'all characters',
  '主要属性：': 'Main stat: ',
  '追加属性：': 'Substats: ',
  '个候选方案': 'candidate plans',
  /* 数据页 */
  '按配装组': 'per build',
  '个角色、': ' characters, ',
  /* 使用说明 / 更新日志里的标题 */
  '三步走': 'How it works',
  '怎么看方案': 'Reading a plan',
  '注意': 'Gotchas',
  '语言': 'Language',
  /* 更新日志（历史条目） */
  '套装列表可切换「图鉴 / 推荐」两种排序依据':
    'Set lists can switch between "Catalog" and "Usage" ordering',
  '列表可切正序 / 倒序，排序顺序来自米游社图鉴':
    'Lists can be reversed; the order follows the HoYoLAB catalog',
  '角色库补全到 124 条 + 国度 / 定位筛选 + 旅行者按形态拆分':
    'Character library completed to 124 + region / role filters + Traveler split by form',
  '属性选择浮窗 + 还原拆三档 + 内置数据自动跟随':
    'Stat picker popup + restore split into three levels + built-in data auto-follow',
  '角色编辑浮窗化 + 两层还原 + 更新公告与日志':
    'Character editing in a popup + two levels of restore + update notice and changelog',
});

/* ---------- 带数字的句式：词典装不下的，用正则兜底 ----------
 * 每项 [正则, 替换函数]，先查词典、再走规则。 */
const T_RULES = [
  [/^\+(\d+)备选$/, m => '+' + m[1] + ' alt'],
  [/^\/ (\d+) 个$/, m => '/ ' + m[1]],
  [/^已启用 (\d+) 条 · 生成 (\d+) 个候选方案$/,
   m => m[1] + ' rule(s) on · ' + m[2] + ' candidate plan(s)'],
  [/^筛出 (\d+) \/ (\d+) 个?$/, m => m[1] + ' / ' + m[2] + ' matched'],
  [/^已启用 (\d+) 个角色$/, m => m[1] + ' characters enabled'],
  [/^共 (\d+) 条?$/, m => m[1] + ' total'],
  [/^等 (\d+) 人$/, m => '+ ' + m[1] + ' more'],
  [/^共 (\d+) 人$/, m => m[1] + ' total'],
  [/^有效权重 ([\d.]+) \/ 约 (\d+) 次词条 = (\d+)%$/,
   m => 'Weight ' + m[1] + ' / about ' + m[2] + ' rolls = ' + m[3] + '%'],
  [/^当前版本 (.+)$/, m => 'Version ' + m[1]],
];
function trByRules(zh) {
  const s = String(zh).trim();
  if (!s) return null;
  for (let i = 0; i < T_RULES.length; i++) {
    const m = s.match(T_RULES[i][0]);
    if (m) return String(zh).replace(s, T_RULES[i][1](m));
  }
  return null;
}

/* ---------- 界面文案补充二：评分器 / 规则卡 / 零碎标签 ---------- */
Object.assign(T_UI_EN, {
  '国度': 'Region',
  '★必须：': '★Required: ',
  '当前配装用不上': 'not used by the current build',
  '尚未启用角色，评分器暂用「双暴输出」默认排序。':
    'No character enabled yet — the scorer falls back to the default "CRIT" ordering.',
  '当前等级': 'Current level',
  'C 狗粮': 'C · Feed it',
  '未选择套装，只做追加属性评分': 'No set selected — scoring substats only',
  '尚未填写追加属性': 'No substats entered yet',
  '建议：直接喂，别浪费资源。': 'Verdict: feed it, do not waste resources.',
  '启用角色后这里会显示每个套装的追加属性需求排序。':
    'Enable some characters and the substat priority for every set shows up here.',
  '当前版本': 'Current version',
  '有效权重': 'Effective weight',
});

/* ---------- 界面文案补充三：动态写入浮窗的标题 / 标签 ---------- */
Object.assign(T_UI_EN, {
  '（主推）': ' (main)',
  '（备选）': ' (alt)',
  /* ② 锁定方案页：候选卡 / 计数 / 提示 */
  '散件 / 过渡保留：': 'Off-piece / transitional keep: ',
  '供 {x} 使用': 'For {x}',
  '备选': 'Alt',
  '次选': '2nd',
  '共 {n} 个候选（角色组 {c} · 散件规则 {r}）': '{n} candidates ({c} character group(s) · {r} off-piece rule(s))',
  '等 {n} 人': '+{n} more',
  '共 {n} 人': '{n} total',
  '已采纳 {p} / 游戏上限 {m}': 'Adopted {p} / in-game cap {m}',
  '（未指定角色）': '(no character assigned)',
  '不限': 'Any',
  '选择主要属性': 'Choose a main stat',
  '选择追加属性': 'Choose a substat',
  '挑一个还没加过的属性：': 'Pick one you have not added yet: ',
});
