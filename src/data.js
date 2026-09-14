/* ============================================================
 * 原神圣遗物锁定方案生成器 —— 内置数据
 * 说明：内置配装取自米游社「观测枢」wiki 角色词条的「推荐装备 → 圣遗物推荐」
 *      （结构化数据，非攻略图 OCR）。抓取 / 回写脚本见 tools/。
 *      版本更迭后请在「角色配置」页自行增删改，所有改动保存在本地浏览器。
 * ============================================================ */

/* ---------- 版本与更新日志 ----------
 * APP_VERSION：用于「更新公告」是否已读的判定，改版本就会自动弹一次公告。
 * CHANGELOG：新在前，CHANGELOG[0].v 必须等于 APP_VERSION。items 为纯文本（渲染时会 esc）。
 * 注意：本文件所有字符串都不得出现 script 结束标签（build.js 有检查，注释里也别写）。
 * ---------------------------------- */
const APP_VERSION = '2026.09.13';
const CHANGELOG = [
  {
    v: '2026.09.13', date: '2026-09-13',
    title: '角色库补全124 + wiki数据重核对 + 中英文切换定稿 + 配装功能定位 + 手机端适配 + 英文套装名 + 公告改小卡片',
    items: [
      '角色库补全到 124 条：按国度逐条核对修正烟绯/神里绫人/流浪者/千织/埃洛伊归属；新增「挪德卡莱」国度并入伊涅芙等 6 人；补洛恩等 6 角色；旅行者按 6 元素形态拆为独立条目。',
      '角色配置页新增「国度」「定位」筛选（主C/副C/辅助），可与元素/搜索/只看已启用叠加，右上角显示「筛出 N / 总数」。',
      '新补角色暂无稳定攻略，配装为按元素/武器通用推荐，备注已标注请按实际玩法调整。',
      '中英文切换定稿：顶栏单按钮「中 / EN」两段（当前金色高亮），点一下同时切界面文案与角色/套装/属性名；顺序「保存→语言切换→使用说明」；数据管理「关于数据」补英文并补回动态计数。',
      '配装数据整体按观测枢 wiki「推荐装备」结构化数据重核对：124 角色主词条按原文排序、2+2 混搭保留、四星过渡套不混入；攻略来源第 1 条固定观测枢词条（真数据源）。',
      '推翻旧 SUB_PRESETS 粗桶：每组配装独立携带套装+三部位主词条+副词条+流派标签，心海等 12 角色双暴纠正为 wiki 真实值；同角色多流派分组保留。',
      '配装新增「功能定位」多选+自定义（输出/增伤/减抗/治疗/护盾/增幅反应/剧变反应…），跨角色共享词表；全部 124 角色定位按 wiki 重新推断。',
      '角色与圣遗物按图鉴核对：补全到 124 角色、圣遗物 45→46 套并订正套装名；数据语言切 English 显官方英文名、中英文搜索都认。',
      '界面打磨：套装名与配装切换合并一行可点选、流派切换芯片去色点只留编号、详情「攻略来源」标注数据源/攻略、锁定方案按「重要属性」相似度自动合并+命中条数可调、手机端配装编辑横向滚动修复、②③ 页加图鉴/推荐排序与正倒序切换。',
      '修「中文模式出现英文」误解：实为本地存储残留 en 状态；单按钮直接显示当前语言，见 EN 点一下即切回。',
      '手机端（≤560px）顶栏：语言按钮「中 / EN」压缩内边距；帮助按钮改「?」图标释放横向空间；标题字号 15→14px。',
      '手机端弹窗（公告/说明/角色编辑/配装编辑/属性选择/套装管理/规则表单）统一 100vw×100vh 全屏，取消圆角边框、底部加安全区留白。',
      '切换英文（数据语言 English）时圣遗物套装名跟随切换为官方英文名：覆盖角色卡配装芯片、配装编辑抽屉标题、副词条表套装列、复制配装下拉（此前这些位置残留中文名）。',
      '手机端（≤560px）开屏更新公告由全屏改为小巧居中可滚动卡片：日志区独立上下滑动，底部「知道了」按钮常驻可见，短公告不再撑满屏。',
      '更新日志按日期归并：同一天多次更新可用「日期.子版本」（如 2026.09.13.1）区分，避免每天散出多条重复日期条目。',
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
    title: '角色编辑浮窗化 + 合并规则重做 + 追加属性颜色分组 + 更新公告',
    items: [
      '角色编辑由右侧抽屉改为居中浮窗，配装改为卡片式展示：一眼看全套装、三部位主要属性、追加属性。',
      '配装编辑独立为第二层浮窗，点「保存」才生效；点取消 / 关闭 / 浮窗外会提示「有未保存的修改」确认后放弃。',
      '新增「还原这一组」：改过或删掉的配装组可单独还原成内置原样（预置方案可在「从预置添加」里选回）。',
      '新增「还原为内置数据」：整个角色（名字 / 元素 / 国度 / 定位 / 备注 / 来源 / 全部配装）一键还原。',
      '角色卡片显示「已修改」小徽标，提示该项已和内置数据不同。',
      '新增更新公告与数据管理页「更新日志」；内置角色 / 圣遗物随版本手工维护，日志可看改动。',
      '去掉多余颜色图例框，颜色直接打在角色名与专属追加属性上；追加属性改为「先共有、后分组专属」，顺序按角色重要度。',
      '修掉「大家都要素充能效率却合不到一起」及次要属性被静默砍掉的问题。',
      '合并判定改为纯追加属性相似度自动完成：只看最重要几条是否重合、不再被次要属性干扰、也不再依赖手动分组。',
      '命中条件可按方案单独调「命中至少几条」（1–4 条，默认至少两条），避免只中一条就锁定。',
      '「散件 / 过渡 保留规则」改为浮窗编辑、可收起，且支持自己增删改。',
    ],
  },
  {
    v: '2026.09.09', date: '2026-09-09',
    title: '统一属性用词 + 锁定方案重构（去 3 槽位限制）',
    items: [
      '主词条改称「主要属性」，副词条 / 候选属性统一改称「追加属性」。',
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

/* ---------- 配装功能定位（一个配装可有多个；可自定义，跨角色共享） ----------
 * 与角色级「队伍定位」(ROLES：主C/副C/辅助) 是两回事：
 * 这里是「这套配装拿来干嘛用」——输出 / 增伤 / 减抗 / 治疗 / 护盾 ……
 * 基础词表在下面，用户还能在编辑器里追加自定义定位（存 state.customBuildRoles）。 */
const BUILD_ROLES = [
  '输出', '增伤', '减抗', '治疗', '护盾',
  '副C', '辅助', '精通', '充能', '聚怪/控制',
  '增幅反应', '剧变反应',
];

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
  { name: '血红之证',           en: 'Scarlet Proof',                        bonus: '攻击力+18%' , bonus4: '装备者触发星扩散反应后的10秒内，暴击率提升16%，星扩散反应伤害提升40%' },
  { name: '炉火融炼之心',       en: 'Heart of the Furnace',                 bonus: '攻击力+18%' , bonus4: '装备者触发星烁反应或造成星烁反应伤害后的12秒内，攻击力提升12%，队伍中附近的所有角色造成的星烁反应伤害提升50%' },
  /* ---- 6.6「虚空劫灰往世书」 ---- */
  { name: '影中沉凝的幻灭',     en: 'Disenchantment in Deep Shadow',        bonus: '攻击力+18%' , bonus4: '超导反应造成的伤害提升80%，星超导反应造成的伤害提升40%；装备者攻击受到超导或星超导反应影响的敌人时，本次攻击的暴击率提高16%' },
  { name: '天之美赐',           en: 'Celestial Gift',                       bonus: '元素充能效率+20%' , bonus4: '若装备者已经完成了魔女的课业，则施放元素战技后，还会获得「天光之引」效果:依据装备者的元素类型使队伍中附近的所有角色获得20%对应元素伤害加成，持续20秒；·队伍拥有「魔导·秘仪」效果时，「天光之引」效果将会升级为「凡世颂歌」，除装备者的元素类型外，还会依据队伍中自己的当前场上角色的元素类型，使队伍中附近的所有角色获得对应元素伤害加成，且上述两种元素伤害加成提升至40%，同元素类型的元素伤害加成效果无法叠加' },
  /* ---- 6.3「月之四」 ---- */
  { name: '晨星与月的晓歌',     en: 'Aubade of Morningstar and Moon',       bonus: '元素精通+80' , bonus4: '装备者处于队伍后台时，造成的月曜反应伤害提升20%；队伍的月兆等级至少为满辉时，造成的月曜反应伤害进一步提升40%' },
  { name: '风起之日',           en: 'A Day Carved From Rising Winds',       bonus: '攻击力+18%' , bonus4: '普通攻击、重击、元素战技或元素爆发命中敌人后，将获得持续6秒的「风与牧歌的眷怜」：攻击力提高25%；若装备者已经完成了「魔女的课业」，则「风与牧歌的眷怜」将会升级为「风与牧歌的决意」，额外使通过考验的装备者的暴击率提升20%' },
  /* ---- 6.0「月之一」挪德卡莱 ---- */
  { name: '穹境示现之夜',       en: "Night of the Sky's Unveiling",         bonus: '元素精通+80' },
  { name: '纺月的夜歌',         en: "Silken Moon's Serenade",               bonus: '元素充能效率+20%' },
  /* ---- 5.x 纳塔 ---- */
  { name: '长夜之誓',           en: "Long Night's Oath",                    bonus: '下落攻击伤害+25%' },
  { name: '深廊终曲',           en: 'Finale of the Deep Galleries',         bonus: '冰元素伤害+15%' , bonus4: '装备者的元素能量为0时，普通攻击造成的伤害提升60%，元素爆发造成的伤害提升60%；装备者的普通攻击造成伤害后，上述元素爆发伤害提升效果将失效6秒；装备者的元素爆发造成伤害后，上述普通攻击伤害提升效果将失效6秒' },
  { name: '黑曜秘典',           en: 'Obsidian Codex',                       bonus: '夜魂加持下伤害+15%' , bonus4: '装备者在场上消耗1点夜魂值后暴击率提高40%，持续6秒。该效果每1秒至多触发一次' },
  { name: '烬城勇者绘卷',       en: 'Scroll of the Hero of Cinder City',    bonus: '元素战技/爆发伤害+15%' , bonus4: '装备者触发其对应元素类型的相关反应后，队伍中附近的所有角色的该元素反应相关的元素伤害加成提升12%，持续15秒；若触发该效果时，装备者处于夜魂加持状态下，还将使队伍中附近的所有角色的与该元素反应相关的元素伤害加成提升28%，持续20秒' },
  /* ---- 4.x 枫丹 ---- */
  { name: '未竟的遐思',         en: 'Unfinished Reverie',                   bonus: '攻击力+18%' , bonus4: '脱离战斗状态3秒后，造成的伤害提升50%；在战斗状态下，附近不存在处于燃烧状态下的敌人超过6秒后，上述伤害提升效果每秒降低10%直到降低至0%；存在处于燃烧状态下的敌人时，每秒提升10%，直到达到50%' },
  { name: '谐律异想断章',       en: 'Fragment of Harmonic Whimsy',          bonus: '攻击力+18%' , bonus4: '生命之契的数值提升或降低时角色造成的伤害提升18%，该效果持续6秒，至多叠加3次' },
  { name: '回声之林夜话',       en: 'Nighttime Whispers in the Echoing Woods', bonus: '攻击力+18%' , bonus4: '施放元素战技后的10秒内，岩元素伤害加成提升20%；若处于结晶反应产生的护盾庇护下，或附近存在月结晶反应形成的月笼，上述效果提高150%，进一步提高的效果将在不满足上面条件的1秒后移除' },
  { name: '昔时之歌',           en: 'Song of Days Past',                    bonus: '治疗加成+15%' , bonus4: '装备者对队伍中的角色进行治疗时将产生持续6秒的渴盼效果，记录治疗的生命值回复量（包括溢出值）；持续时间结束时，渴盼效果将转变为「彼时的浪潮」效果：队伍中自己的当前场上角色的普通攻击、重击、下落攻击、元素战技与元素爆发命中敌人时，将基于渴盼效果所记录的回复量的8%提高造成的伤害，「彼时的浪潮」将在生效5次或10秒后移除；一次渴盼效果至多记录15000点回复量，同时至多存在一个能够记录多个装备者的产生的回复量' },
  { name: '逐影猎人',           en: 'Marechaussee Hunter',                  bonus: '普通攻击/重击伤害+15%' , bonus4: '当前生命值提升或降低时，暴击率提升12%，该效果持续5秒，至多叠加3次' },
  { name: '黄金剧团',           en: 'Golden Troupe',                        bonus: '元素战技伤害+20%' , bonus4: '元素战技造成的伤害提升25%；此外，处于队伍后台时，元素战技造成的伤害还将进一步提升25%，该效果将在登场后2秒移除' },
  /* ---- 3.x 须弥 ---- */
  { name: '花海甘露之光',       en: "Vourukasha's Glow",                    bonus: '生命值+20%' },
  { name: '水仙之梦',           en: "Nymph's Dream",                        bonus: '水元素伤害+15%' },
  { name: '乐园遗落之花',       en: 'Flower of Paradise Lost',              bonus: '元素精通+80' , bonus4: '装备者绽放、超绽放、烈绽放反应造成的伤害提升40%，造成的月绽放反应伤害提升10%；此外，装备者触发绽放、超绽放、烈绽放、月绽放后，上述效果带来的加成提升25%，该效果持续10秒，至多叠加4次，每1秒至多触发一次' },
  { name: '沙上楼阁史话',       en: 'Desert Pavilion Chronicle',            bonus: '风元素伤害+15%' , bonus4: '重击命中敌人后，该角色的普通攻击速度提升10%，普通攻击、重击与下落攻击造成的伤害提升40%，持续15秒' },
  { name: '深林的记忆',         en: 'Deepwood Memories',                    bonus: '草元素伤害+15%' , bonus4: '元素战技或元素爆发命中敌人后，使命中目标的草元素抗性降低30%，持续8秒' },
  { name: '饰金之梦',           en: 'Gilded Dreams',                        bonus: '元素精通+80' , bonus4: '触发元素反应后的8秒内，会根据队伍内其他角色的元素类型，使装备者获得强化：队伍中每存在1个和装备者同类元素的角色，攻击力提升14%；每存在1个和装备者不同元素类型的角色，元素精通提升50点' },
  /* ---- 2.x 稻妻 / 璃月 ---- */
  { name: '辰砂往生录',         en: 'Vermillion Hereafter',                 bonus: '攻击力+18%' , bonus4: '施放元素爆发后，将产生持续16秒的「潜光」效果：攻击力提升8%；并在角色的生命值降低时，攻击力进一步提升10%，至多通过这种方式提升4次，每0.8秒至多触发一次' },
  { name: '来歆余响',           en: 'Echoes of an Offering',                bonus: '攻击力+18%' , bonus4: '普通攻击命中敌人时，有36%概率触发「幽谷祝祀」：普通攻击造成的伤害提高，伤害提高值为攻击力的70%，该效果将在普通攻击造成伤害后的0.05秒后清除；普通攻击未触发「幽谷祝祀」时，会使下次触发概率提升20%' },
  { name: '华馆梦醒形骸记',     en: 'Husk of Opulent Dreams',               bonus: '防御力+30%' , bonus4: '装备此圣遗物套装的角色在以下情况下，将获得「问答」效果：在场上用岩元素攻击命中敌人后获得一层，每0.3秒至多触发一次；在队伍后台中，每3秒获得一层；问答至多叠加4层，每层能提供6%防御力与6%岩元素伤害加成；每6秒，若未获得问答效果，将损失一层' },
  { name: '海染砗磲',           en: 'Ocean-Hued Clam',                      bonus: '治疗加成+15%' , bonus4: '装备此圣遗物套装的角色对队伍中的角色进行治疗时，将产生持续3秒的海染泡沫，记录治疗的生命值回复量（包括溢出值）；持续时间结束时，海染泡沫将会爆炸，对周围的敌人造成90%累计回复量的伤害（该伤害结算方式同感电、超导等元素反应，但不受元素精通、等级或反应伤害加成效果影响）；海染泡沫至多记录30000点回复量，含溢出部分的治疗量' },
  { name: '绝缘之旗印',         en: 'Emblem of Severed Fate',               bonus: '元素充能效率+20%' , bonus4: '基于元素充能效率的25%，提高元素爆发造成的伤害。至多通过这种方式获得75%提升' },
  { name: '追忆之注连',         en: "Shimenawa's Reminiscence",             bonus: '攻击力+18%' },
  /* ---- 1.x 开服系列（含 1.5） ---- */
  { name: '千岩牢固',           en: 'Tenacity of the Millelith',            bonus: '生命值+20%' , bonus4: '元素战技命中敌人后，使队伍中附近的所有角色攻击力提升20%，护盾强效提升30%，持续3秒' },
  { name: '苍白之火',           en: 'Pale Flame',                           bonus: '物理伤害+25%' , bonus4: '元素战技命中敌人后，攻击力提升9%；叠满2层时，2件套的效果提升100%' },
  { name: '平息鸣雷的尊者',     en: 'Thundersoother',                       bonus: '受到的雷元素伤害-40%' , bonus4: '对处于雷元素影响下的敌人造成的伤害提升35%' },
  { name: '炽烈的炎之魔女',     en: 'Crimson Witch of Flames',              bonus: '火元素伤害+15%' , bonus4: '超载、燃烧、烈绽放反应造成的伤害提升40%，蒸发、融化反应的加成系数提高15%；施放元素战技后的10秒内，2件套的效果提高50%，该效果最多叠加3次' },
  { name: '流浪大地的乐团',     en: "Wanderer's Troupe",                    bonus: '元素精通+80' },
  { name: '染血的骑士道',       en: 'Bloodstained Chivalry',                bonus: '物理伤害+25%' , bonus4: '击败敌人后的10秒内，施放重击时不消耗体力，且重击造成的伤害提升50%' },
  { name: '被怜爱的少女',       en: 'Maiden Beloved',                       bonus: '治疗加成+15%' , bonus4: '施放元素战技或元素爆发后的10秒内，队伍中所有角色受治疗效果加成提高20%' },
  { name: '角斗士的终幕礼',     en: "Gladiator's Finale",                   bonus: '攻击力+18%' },
  { name: '渡过烈火的贤人',     en: 'Lavawalker',                           bonus: '受到的火元素伤害-40%' , bonus4: '对处于火元素影响下的敌人造成的伤害提升35%' },
  { name: '悠古的磐岩',         en: 'Archaic Petra',                        bonus: '岩元素伤害+15%' , bonus4: '获得结晶反应形成的晶片或触发月结晶反应时，队伍中所有角色获得35%对应元素伤害加成，持续10秒；同时只能通过该效果获得一种元素伤害加成' },
  { name: '如雷的盛怒',         en: 'Thundering Fury',                      bonus: '雷元素伤害+15%' , bonus4: '超载、感电、超导、超绽放反应造成的伤害提升40%，超激化反应带来的伤害提升提高20%，月感电、星超导反应造成的伤害提升20%；触发上述元素反应或原激化反应时，元素战技冷却时间减少1秒' },
  { name: '沉沦之心',           en: 'Heart of Depth',                       bonus: '水元素伤害+15%' , bonus4: '施放元素战技后的15秒内，普通攻击与重击造成的伤害提高30%' },
  { name: '逆飞的流星',         en: 'Retracing Bolide',                     bonus: '护盾强效+35%' , bonus4: '处于护盾庇护下时，额外获得40%普通攻击和重击伤害加成' },
  { name: '昔日宗室之仪',       en: 'Noblesse Oblige',                      bonus: '元素爆发伤害+20%' , bonus4: '释放元素爆发后，队伍中所有角色攻击力提升20％，持续12秒，该效果不可叠加' },
  { name: '翠绿之影',           en: 'Viridescent Venerer',                  bonus: '风元素伤害+15%' , bonus4: '扩散反应造成的伤害提升60%，星扩散反应造成的伤害提升20%；根据扩散的元素类型，降低受到影响的敌人40%的对应元素抗性，持续10秒；对敌人触发星扩散反应时，也会降低其40%的冰元素抗性' },
  { name: '冰风迷途的勇士',     en: 'Blizzard Strayer',                     bonus: '冰元素伤害+15%' , bonus4: '攻击处于冰元素影响下的敌人时，暴击率提高20%；若敌人处于冻结状态下，则暴击率额外提高20%' },
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
  '旅行者·冰': 'Traveler (Cryo)',
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
  '旅行者·冰',
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
  '旅行者·冰': ['other', ['subdps']],
};

const RAW_CHARS = [
  /* ---------- 火 ---------- */
  ['胡桃',      'pyro', [
    {sets:['炽烈的炎之魔女'], sands:['hpP', 'em'], goblet:['pyro'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'hpP', 'em', 'atkP'], roles:['增伤', '精通', '增幅反应']},
    {sets:['追忆之注连'], sands:['hpP', 'em'], goblet:['pyro'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'hpP', 'em', 'atkP'], roles:['增伤', '精通', '充能']},
    {sets:['沙上楼阁史话'], sands:['hpP', 'em'], goblet:['pyro'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'hpP', 'em', 'atkP'], roles:['增伤', '精通']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/1627/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/58957682', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/59760224', '因为邪王真眼是最强的']],   ''],
  ['迪卢克',      'pyro', [
    {sets:['炽烈的炎之魔女'], sands:['atkP', 'em'], goblet:['pyro', 'em'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'em'], roles:['增伤', '精通']},
    {sets:['长夜之誓'], sands:['atkP', 'em'], goblet:['pyro', 'em'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'em'], roles:['增伤', '精通']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/75/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/73900753', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/69811876', '风伤幽冥']],   ''],
  ['可莉',      'pyro', [
    {sets:['风起之日'], sands:['atkP'], goblet:['pyro'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['输出', '增伤', '充能']},
    {sets:['逐影猎人'], sands:['atkP'], goblet:['pyro'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'atkP', 'er'], roles:['输出', '增伤', '充能']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/55/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/73738502', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/73525061', '风伤幽冥']],   ''],
  ['宵宫',      'pyro', [
    {sets:['追忆之注连'], sands:['atkP', 'em'], goblet:['pyro', 'atkP'], circlet:['cr', 'cd'], subs:['cd', 'cr', 'atkP'], roles:['输出', '增伤', '精通']},
    {sets:['沙上楼阁史话'], sands:['atkP', 'em'], goblet:['pyro', 'atkP'], circlet:['cr', 'cd'], subs:['cd', 'cr', 'atkP'], roles:['增伤', '精通']},
    {sets:['来歆余响'], sands:['atkP', 'em'], goblet:['pyro', 'atkP'], circlet:['cr', 'cd'], subs:['cd', 'cr', 'atkP'], roles:['增伤', '精通']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/2124/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/64575893', 'Asgater'], ['https://www.miyoushe.com/ys/article/64629774', '风伤幽冥']],   ''],
  ['林尼',      'pyro', [
    {sets:['逐影猎人'], sands:['atkP'], goblet:['pyro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP'], roles:['输出', '增伤']},
    {sets:['逆飞的流星'], sands:['atkP'], goblet:['pyro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP'], roles:['增伤', '护盾']},
    {sets:['未竟的遐思'], sands:['atkP'], goblet:['pyro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP'], roles:['增伤']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/6937/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/42419524', 'Asgater'], ['https://www.miyoushe.com/ys/article/74678199', 'HoYo青枫']],   ''],
  ['香菱',      'pyro', [
    {sets:['炽烈的炎之魔女'], sands:['er', 'atkP'], goblet:['pyro'], circlet:['cr', 'cd'], subs:['er', 'cr', 'cd'], roles:['输出', '增伤', '精通', '充能']},
    {sets:['绝缘之旗印'], sands:['er', 'atkP'], goblet:['pyro'], circlet:['cr', 'cd'], subs:['er', 'cr', 'cd'], roles:['输出', '增伤', '充能']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/112/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/75875081', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/53677077', '风扬帆影']],   ''],
  ['班尼特',      'pyro', [
    {sets:['昔日宗室之仪'], sands:['er', 'hpP'], goblet:['hpP'], circlet:['heal', 'hpP', 'cr'], subs:['hpP', 'er', 'cr'], roles:['输出', '治疗', '辅助', '充能']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/105/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/71497654', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/62847331', '风伤幽冥']],   ''],
  ['玛薇卡',      'pyro', [
    {sets:['黑曜秘典'], sands:['atkP', 'em'], goblet:['pyro', 'atkP'], circlet:['cd', 'atkP'], subs:['cr', 'cd', 'atkP', 'em'], roles:['输出', '增伤', '精通']},
    {sets:['烬城勇者绘卷'], sands:['atkP', 'em'], goblet:['pyro', 'atkP'], circlet:['cr', 'cd', 'atkP'], subs:['cr', 'cd', 'atkP', 'em'], roles:['增伤', '辅助', '精通']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/503613/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/75883027', 'Asgater'], ['https://www.miyoushe.com/ys/article/75777988', 'HoYo青枫']],   ''],
  ['阿蕾奇诺',      'pyro', [
    {sets:['谐律异想断章'], sands:['atkP'], goblet:['pyro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'em'], roles:['输出', '增伤']},
    {sets:['角斗士的终幕礼'], sands:['atkP'], goblet:['pyro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'em'], roles:['输出', '增伤']},
    {sets:['逐影猎人'], sands:['atkP'], goblet:['pyro', 'atkP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'atkP', 'em'], roles:['输出', '增伤']},
    {sets:['饰金之梦'], sands:['em', 'atkP'], goblet:['em', 'pyro', 'atkP'], circlet:['cd', 'cr'], subs:['cd', 'cr', 'em', 'atkP'], roles:['增伤', '精通', '增幅反应']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/501157/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/77185586', 'Asgater'], ['https://www.miyoushe.com/ys/article/77156164', 'HoYo青枫']],   ''],
  ['托马',      'pyro', [
    {sets:['昔日宗室之仪'], sands:['er', 'hpP'], goblet:['hpP'], circlet:['hpP'], subs:['er', 'hpP', 'cr', 'cd'], roles:['增伤', '辅助']},
    {sets:['乐园遗落之花'], sands:['em'], goblet:['em'], circlet:['em'], subs:['er', 'em'], roles:['输出', '精通', '剧变反应']},
    {sets:['绝缘之旗印'], sands:['er', 'hpP'], goblet:['hpP'], circlet:['hpP'], subs:['er', 'hpP', 'cr', 'cd'], roles:['护盾']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/2606/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/45620252', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/57703960', '风伤幽冥']],   ''],
  ['烟绯',      'pyro', [
    {sets:['炽烈的炎之魔女'], sands:['atkP', 'em'], goblet:['pyro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'em'], roles:['输出', '增伤', '精通']},
    {sets:['逐影猎人'], sands:['atkP', 'em'], goblet:['pyro'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'em'], roles:['输出', '增伤', '精通']},
    {sets:['流浪大地的乐团'], sands:['atkP', 'em'], goblet:['pyro'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'em'], roles:['输出', '增伤', '精通']},
    {sets:['角斗士的终幕礼'], sands:['atkP', 'em'], goblet:['pyro'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'em'], roles:['输出', '增伤', '精通']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/1795/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/50810071', '风伤幽冥'], ['https://www.miyoushe.com/ys/article/63436414', '风伤幽冥']],   ''],
  ['迪希雅',      'pyro', [
    {sets:['绝缘之旗印'], sands:['er', 'atkP', 'hpP'], goblet:['pyro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'hpP', 'atkP'], roles:['增伤', '充能']},
    {sets:['花海甘露之光'], sands:['er', 'atkP', 'hpP'], goblet:['pyro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'hpP', 'atkP'], roles:['输出', '增伤']},
    {sets:['炽烈的炎之魔女'], sands:['er', 'atkP'], goblet:['pyro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'hpP', 'atkP'], roles:['增伤']},
    {sets:['炽烈的炎之魔女'], sands:['er', 'atkP'], goblet:['pyro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'hpP', 'atkP', 'em'], roles:['增伤', '精通']},
    {sets:['饰金之梦'], sands:['em', 'er', 'atkP'], goblet:['em', 'pyro', 'atkP'], circlet:['em', 'cr', 'cd'], subs:['em', 'cr', 'cd', 'hpP', 'atkP'], roles:['增伤', '精通', '剧变反应']},
    {sets:['乐园遗落之花'], sands:['em', 'er', 'atkP'], goblet:['em', 'pyro', 'atkP'], circlet:['em', 'cr', 'cd'], subs:['em', 'cr', 'cd', 'hpP', 'atkP'], roles:['增伤', '精通', '剧变反应']},
    {sets:['千岩牢固'], sands:['er', 'atkP'], goblet:['pyro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'hpP', 'atkP'], roles:['增伤', '护盾', '辅助']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/6180/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/36343971', '新剪刀k'], ['https://www.miyoushe.com/ys/article/69819573', '风伤幽冥']],   ''],
  ['嘉明',      'pyro', [
    {sets:['长夜之誓'], sands:['atkP', 'em'], goblet:['pyro'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'em', 'atkP'], roles:['增伤', '精通']},
    {sets:['逐影猎人'], sands:['atkP', 'em'], goblet:['pyro'], circlet:['cd'], subs:['cr', 'cd', 'em', 'atkP'], roles:['输出', '增伤', '精通']},
    {sets:['炽烈的炎之魔女'], sands:['atkP', 'em'], goblet:['pyro'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'em', 'atkP'], roles:['增伤', '精通']},
    {sets:['辰砂往生录'], sands:['atkP', 'em'], goblet:['pyro'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'em', 'atkP'], roles:['增伤', '精通']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/500672/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/48532329', 'Asgater'], ['https://www.miyoushe.com/ys/article/71813629', 'HoYo青枫']],   ''],
  ['辛焱',      'pyro', [
    {sets:['苍白之火'], sands:['atkP', 'defP'], goblet:['phys'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er', 'defP'], roles:['增伤']},
    {sets:['染血的骑士道', '苍白之火'], sands:['atkP', 'defP'], goblet:['phys'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er', 'defP'], roles:['增伤']},
    {sets:['追忆之注连'], sands:['atkP', 'defP'], goblet:['phys'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er', 'defP'], roles:['输出', '增伤', '充能']},
    {sets:['昔日宗室之仪'], sands:['defP'], goblet:['defP'], circlet:['defP', 'cd'], subs:['defP', 'er', 'cd', 'cr'], roles:['护盾', '辅助']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/1291/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/49461187', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/57070050', '风伤幽冥']],   ''],
  ['夏沃蕾',      'pyro', [
    {sets:['昔日宗室之仪'], sands:['hpP', 'er'], goblet:['hpP'], circlet:['hpP'], subs:['hpP', 'er', 'cr', 'em'], roles:['辅助']},
    {sets:['昔时之歌'], sands:['hpP', 'er'], goblet:['hpP'], circlet:['hpP', 'heal'], subs:['hpP', 'er', 'cr', 'em'], roles:['治疗']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/500605/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/62961015', 'Asgater'], ['https://www.miyoushe.com/ys/article/71769196', 'HoYo青枫']],   ''],

  /* ---------- 水 ---------- */
  ['行秋',      'hydro', [
    {sets:['昔日宗室之仪'], sands:['atkP', 'er'], goblet:['hydro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'em', 'er'], roles:['输出', '增伤', '辅助', '精通', '充能']},
    {sets:['绝缘之旗印'], sands:['er', 'atkP'], goblet:['hydro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'em', 'er'], roles:['输出', '增伤', '精通', '充能']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/241/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/75141780', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/22007968', '流曳']],   ''],
  ['夜兰',      'hydro', [
    {sets:['绝缘之旗印'], sands:['hpP', 'er'], goblet:['hydro', 'hpP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'er', 'hpP'], roles:['增伤', '充能']},
    {sets:['昔日宗室之仪'], sands:['hpP', 'er'], goblet:['hydro', 'hpP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'er', 'hpP'], roles:['增伤', '辅助']},
    {sets:['逐影猎人'], sands:['hpP', 'er'], goblet:['hydro', 'hpP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'er', 'hpP'], roles:['输出', '增伤']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/4081/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/69095833', 'Asgater'], ['https://www.miyoushe.com/ys/article/69055107', 'HoYo青枫']],   ''],
  ['达达利亚',      'hydro', [
    {sets:['水仙之梦'], sands:['atkP'], goblet:['hydro'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'em'], roles:['输出', '增伤']},
    {sets:['沉沦之心'], sands:['atkP'], goblet:['hydro'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'em'], roles:['输出', '增伤']},
    {sets:['沙上楼阁史话'], sands:['atkP'], goblet:['hydro'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'em'], roles:['输出', '增伤']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/1220/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/61585425', 'Asgater'], ['https://www.miyoushe.com/ys/article/43187652', '七月的休']],   ''],
  ['珊瑚宫心海',      'hydro', [
    {sets:['海染砗磲'], sands:['hpP', 'er'], goblet:['hpP', 'hydro'], circlet:['heal'], subs:['hpP', 'er', 'em'], roles:['增伤', '治疗', '辅助']},
    {sets:['昔时之歌'], sands:['hpP', 'er'], goblet:['hpP', 'hydro'], circlet:['heal'], subs:['hpP', 'er', 'em'], roles:['增伤', '治疗']},
    {sets:['被怜爱的少女'], sands:['hpP', 'er'], goblet:['hpP', 'hydro'], circlet:['heal'], subs:['hpP', 'er', 'em'], roles:['增伤', '治疗']},
    {sets:['千岩牢固'], sands:['hpP', 'er'], goblet:['hpP', 'hydro'], circlet:['heal'], subs:['hpP', 'er', 'em'], roles:['输出', '增伤', '辅助']},
    {sets:['乐园遗落之花'], sands:['hpP', 'er'], goblet:['hpP', 'em'], circlet:['heal'], subs:['hpP', 'er', 'em'], roles:['输出', '精通', '剧变反应']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/2403/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/64666544', 'Asgater'], ['https://www.miyoushe.com/ys/article/9832329', '流曳']],   ''],
  ['莫娜',      'hydro', [
    {sets:['昔日宗室之仪'], sands:['er', 'atkP'], goblet:['hydro', 'atkP'], circlet:['cr', 'cd'], subs:['er', 'atkP', 'em', 'cr', 'cd'], roles:['增伤']},
    {sets:['千岩牢固'], sands:['er', 'atkP'], goblet:['hydro', 'atkP'], circlet:['cr', 'cd'], subs:['er', 'atkP', 'em', 'cr', 'cd'], roles:['增伤', '辅助']},
    {sets:['绝缘之旗印'], sands:['er', 'atkP'], goblet:['hydro', 'atkP'], circlet:['cr', 'cd'], subs:['er', 'atkP', 'em', 'cr', 'cd'], roles:['增伤', '充能']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/1057/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/71353241', 'Asgater'], ['https://www.miyoushe.com/ys/article/50283916', '风伤幽冥']],   ''],
  ['妮露',      'hydro', [
    {sets:['千岩牢固', '花海甘露之光'], sands:['hpP'], goblet:['hpP'], circlet:['hpP'], subs:['em', 'hpP', 'cr', 'cd'], roles:['输出', '精通']},
    {sets:['沉沦之心', '水仙之梦'], sands:['hpP'], goblet:['hydro', 'hpP'], circlet:['cr', 'cd', 'hpP'], subs:['em', 'cr', 'cd', 'hpP'], roles:['输出', '增伤', '精通']},
    {sets:['深林的记忆'], sands:['hpP'], goblet:['hydro', 'hpP'], circlet:['cr', 'cd', 'hpP'], subs:['em', 'cr', 'cd', 'hpP'], roles:['输出', '增伤', '辅助', '精通']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/5020/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/68590672', 'Asgater'], ['https://www.miyoushe.com/ys/article/55223165', 'HoYo青枫']],   ''],
  ['芙宁娜',      'hydro', [
    {sets:['黄金剧团'], sands:['hpP', 'er'], goblet:['hpP', 'hydro'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'hpP', 'er'], roles:['输出', '增伤']},
    {sets:['千岩牢固'], sands:['hpP', 'er'], goblet:['hpP', 'hydro'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'hpP', 'er'], roles:['增伤', '辅助']},
    {sets:['昔日宗室之仪'], sands:['hpP'], goblet:['hpP', 'hydro'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'hpP', 'er'], roles:['增伤', '辅助']},
    {sets:['逐影猎人'], sands:['hpP', 'er'], goblet:['hpP', 'hydro'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'hpP', 'er'], roles:['输出', '增伤']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/500291/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/70375033', 'Asgater'], ['https://www.miyoushe.com/ys/article/69782038', 'HoYo青枫']],   ''],
  ['那维莱特',      'hydro', [
    {sets:['逐影猎人'], sands:['hpP'], goblet:['hydro'], circlet:['cd', 'hpP'], subs:['cr', 'cd', 'hpP'], roles:['输出', '增伤']},
    {sets:['沉沦之心'], sands:['hpP'], goblet:['hydro'], circlet:['cr', 'cd', 'hpP'], subs:['cr', 'cd', 'hpP'], roles:['增伤']},
    {sets:['水仙之梦', '沉沦之心'], sands:['hpP'], goblet:['hydro'], circlet:['cr', 'cd', 'hpP'], subs:['cr', 'cd', 'hpP'], roles:['增伤']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/500207/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/72892872', 'Asgater'], ['https://www.miyoushe.com/ys/article/72778260', 'HoYo青枫']],   ''],
  ['芭芭拉',      'hydro', [
    {sets:['被怜爱的少女'], sands:['er', 'hpP'], goblet:['hpP'], circlet:['heal', 'hpP'], subs:['er', 'hpP', 'cr'], roles:['治疗']},
    {sets:['海染砗磲'], sands:['er', 'hpP'], goblet:['hpP'], circlet:['heal', 'hpP'], subs:['er', 'hpP', 'cr'], roles:['输出', '治疗']},
    {sets:['昔时之歌'], sands:['er', 'hpP'], goblet:['hpP'], circlet:['heal', 'hpP'], subs:['er', 'hpP', 'cr'], roles:['输出', '治疗']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/61/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/68736041', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/50809699', '风伤幽冥']],   ''],
  ['玛拉妮',      'hydro', [
    {sets:['黑曜秘典'], sands:['hpP', 'em'], goblet:['hydro', 'hpP'], circlet:['cd', 'hpP'], subs:['cd', 'hpP', 'em', 'cr'], roles:['输出', '增伤', '精通']},
    {sets:['饰金之梦'], sands:['hpP', 'em'], goblet:['hydro', 'hpP'], circlet:['cd', 'hpP'], subs:['cd', 'hpP', 'em', 'cr'], roles:['增伤', '辅助', '精通']},
    {sets:['沉沦之心'], sands:['hpP', 'em'], goblet:['hydro', 'hpP'], circlet:['cd', 'hpP'], subs:['cd', 'hpP', 'em', 'cr'], roles:['增伤', '精通']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/501625/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/67646572', 'Asgater'], ['https://www.miyoushe.com/ys/article/67669637', 'HoYo青枫']],   ''],
  ['塔利雅',      'hydro', [
    {sets:['昔日宗室之仪'], sands:['er', 'hpP'], goblet:['hpP'], circlet:['hpP'], subs:['hpP', 'cr'], roles:['辅助']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/505418/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/65404405', 'Asgater'], ['https://www.miyoushe.com/ys/article/74011159', 'HoYo青枫']],   ''],
  ['希格雯',      'hydro', [
    {sets:['昔时之歌'], sands:['hpP'], goblet:['hpP'], circlet:['hpP', 'heal'], subs:['hpP', 'er'], roles:['治疗', '辅助']},
    {sets:['海染砗磲'], sands:['hpP'], goblet:['hpP'], circlet:['hpP', 'heal'], subs:['hpP', 'er'], roles:['治疗', '辅助']},
    {sets:['千岩牢固'], sands:['hpP'], goblet:['hpP'], circlet:['hpP', 'heal'], subs:['hpP', 'er'], roles:['治疗', '辅助']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/501214/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/61942325', 'Asgater'], ['https://www.miyoushe.com/ys/article/74923340', 'HoYo青枫']],   ''],
  ['坎蒂丝',      'hydro', [
    {sets:['昔日宗室之仪'], sands:['er', 'hpP'], goblet:['hydro', 'hpP'], circlet:['hpP', 'cr'], subs:['cr', 'cd', 'hpP'], roles:['输出', '增伤', '辅助', '充能']},
    {sets:['绝缘之旗印'], sands:['er', 'hpP'], goblet:['hydro', 'hpP'], circlet:['hpP', 'cr'], subs:['cr', 'cd', 'hpP'], roles:['输出', '增伤', '充能']},
    {sets:['角斗士的终幕礼'], sands:['er', 'hpP'], goblet:['hydro', 'hpP'], circlet:['hpP', 'cr'], subs:['cr', 'cd', 'hpP', 'er'], roles:['输出', '增伤']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/4781/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/74049148', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/65397318', '风伤幽冥']],   ''],

  /* ---------- 冰 ---------- */
  ['甘雨',      'cryo', [
    {sets:['流浪大地的乐团'], sands:['atkP', 'em'], goblet:['cryo'], circlet:['cr', 'cd'], subs:['cd', 'cr', 'atkP', 'em'], roles:['增伤', '精通', '增幅反应']},
    {sets:['追忆之注连'], sands:['atkP', 'em'], goblet:['cryo'], circlet:['cr', 'cd'], subs:['cd', 'cr', 'atkP', 'em'], roles:['增伤', '精通', '充能', '增幅反应']},
    {sets:['沙上楼阁史话'], sands:['atkP', 'em'], goblet:['cryo'], circlet:['cr', 'cd'], subs:['cd', 'cr', 'atkP', 'em'], roles:['增伤', '精通', '充能', '增幅反应']},
    {sets:['未竟的遐思'], sands:['atkP', 'em'], goblet:['cryo'], circlet:['cr', 'cd'], subs:['cd', 'cr', 'atkP', 'em'], roles:['增伤', '精通', '增幅反应']},
    {sets:['逐影猎人'], sands:['atkP', 'em'], goblet:['cryo'], circlet:['cr', 'cd'], subs:['cd', 'cr', 'atkP', 'em'], roles:['输出', '增伤', '精通', '增幅反应']},
    {sets:['冰风迷途的勇士'], sands:['atkP', 'er'], goblet:['cryo'], circlet:['cd'], subs:['cd', 'cr', 'atkP', 'er'], roles:['输出', '增伤']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/1433/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/61529617', 'Asgater'], ['https://www.miyoushe.com/ys/article/15060332', '流曳']],   ''],
  ['神里绫华',      'cryo', [
    {sets:['冰风迷途的勇士'], sands:['atkP'], goblet:['cryo', 'atkP'], circlet:['cd', 'atkP'], subs:['cr', 'cd', 'atkP'], roles:['输出', '增伤']},
    {sets:['逐影猎人'], sands:['atkP'], goblet:['cryo', 'atkP'], circlet:['cd', 'atkP'], subs:['cr', 'cd', 'atkP'], roles:['输出', '增伤']},
    {sets:['绝缘之旗印'], sands:['atkP', 'er'], goblet:['cryo', 'atkP'], circlet:['cd', 'atkP'], subs:['cr', 'cd', 'atkP'], roles:['输出', '增伤', '充能']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/2123/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/64527638', 'Asgater'], ['https://www.miyoushe.com/ys/article/21035507', '流曳']],   ''],
  ['优菈',      'cryo', [
    {sets:['苍白之火'], sands:['atkP'], goblet:['phys', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP'], roles:['输出', '增伤']},
    {sets:['角斗士的终幕礼'], sands:['atkP'], goblet:['phys', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP'], roles:['增伤']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/2040/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/40951883', 'Asgater'], ['https://www.miyoushe.com/ys/article/73861985', 'HoYo青枫']],   ''],
  ['申鹤',      'cryo', [
    {sets:['昔日宗室之仪'], sands:['atkP', 'er'], goblet:['atkP'], circlet:['atkP', 'cr', 'cd'], subs:['atkP', 'er', 'cr', 'cd'], roles:['辅助']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/3386/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/65404318', 'Asgater'], ['https://www.miyoushe.com/ys/article/65464845', 'HoYo青枫']],   ''],
  ['莱欧斯利',      'cryo', [
    {sets:['影中沉凝的幻灭'], sands:['atkP'], goblet:['atkP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'atkP', 'em'], roles:['输出', '增伤', '辅助']},
    {sets:['逐影猎人'], sands:['atkP', 'em'], goblet:['cryo'], circlet:['cd'], subs:['cr', 'cd', 'em', 'atkP'], roles:['输出', '增伤', '辅助', '精通']},
    {sets:['辰砂往生录'], sands:['em', 'atkP'], goblet:['cryo'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'em', 'atkP'], roles:['输出', '增伤', '辅助', '精通']},
    {sets:['沙上楼阁史话'], sands:['atkP', 'em'], goblet:['cryo'], circlet:['cr', 'cd', 'atkP'], subs:['cr', 'cd', 'em', 'atkP'], roles:['增伤', '辅助', '精通']},
    {sets:['追忆之注连'], sands:['atkP', 'em'], goblet:['cryo'], circlet:['cr', 'cd', 'atkP'], subs:['cr', 'cd', 'em', 'atkP'], roles:['增伤', '辅助', '精通', '充能']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/500286/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/62418468', 'Asgater'], ['https://www.miyoushe.com/ys/article/76302270', 'HoYo青枫']],   ''],
  ['迪奥娜',      'cryo', [
    {sets:['昔日宗室之仪'], sands:['er', 'hpP'], goblet:['hpP'], circlet:['hpP', 'heal'], subs:['er', 'hpP', 'cr'], roles:['辅助']},
    {sets:['千岩牢固'], sands:['er', 'hpP'], goblet:['hpP'], circlet:['hpP', 'heal'], subs:['er', 'hpP', 'cr'], roles:['治疗', '护盾', '充能']},
    {sets:['被怜爱的少女'], sands:['er', 'hpP'], goblet:['hpP'], circlet:['hpP', 'heal'], subs:['er', 'hpP'], roles:['治疗']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/1221/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/76347079', 'Asgater'], ['https://www.miyoushe.com/ys/article/76479642', 'HoYo青枫']],   ''],
  ['罗莎莉亚',      'cryo', [
    {sets:['昔日宗室之仪'], sands:['er', 'atkP'], goblet:['cryo'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['增伤']},
    {sets:['冰风迷途的勇士'], sands:['er', 'atkP'], goblet:['cryo'], circlet:['cd', 'atkP'], subs:['cr', 'cd', 'atkP', 'er'], roles:['输出', '增伤']},
    {sets:['苍白之火'], sands:['atkP'], goblet:['phys'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP'], roles:['输出', '增伤']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/1744/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/11126959', 'Asgater'], ['https://www.miyoushe.com/ys/article/70615140', 'HoYo青枫']],   ''],
  ['七七',      'cryo', [
    {sets:['千岩牢固'], sands:['atkP'], goblet:['atkP'], circlet:['heal', 'cr'], subs:['er', 'atkP', 'cr'], roles:['输出', '辅助']},
    {sets:['海染砗磲'], sands:['atkP'], goblet:['atkP'], circlet:['heal', 'cr'], subs:['er', 'atkP', 'cr'], roles:['输出', '治疗']},
    {sets:['昔时之歌'], sands:['er', 'atkP'], goblet:['atkP'], circlet:['heal', 'cr'], subs:['er', 'atkP', 'cr'], roles:['治疗']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/1056/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/61557727', 'Asgater'], ['https://www.miyoushe.com/ys/article/76326299', 'HoYo青枫']],   ''],
  ['爱可菲',      'cryo', [
    {sets:['黄金剧团'], sands:['atkP'], goblet:['cryo', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['增伤']},
    {sets:['千岩牢固'], sands:['atkP'], goblet:['cryo', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['增伤', '辅助']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/504976/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/73899692', 'Asgater'], ['https://www.miyoushe.com/ys/article/73987299', 'HoYo青枫']],   ''],
  ['丝柯克',      'cryo', [
    {sets:['深廊终曲'], sands:['atkP'], goblet:['atkP', 'cryo'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP'], roles:['输出', '增伤']},
    {sets:['逐影猎人'], sands:['atkP'], goblet:['cryo', 'atkP'], circlet:['cd'], subs:['cd', 'cr', 'atkP'], roles:['输出', '增伤']},
    {sets:['角斗士的终幕礼'], sands:['atkP'], goblet:['atkP', 'cryo'], circlet:['cr', 'cd'], subs:['cd', 'cr', 'atkP'], roles:['增伤']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/505417/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/73966901', 'Asgater'], ['https://www.miyoushe.com/ys/article/73965211', 'HoYo青枫']],   ''],
  ['重云',      'cryo', [
    {sets:['昔日宗室之仪'], sands:['atkP'], goblet:['cryo', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'em', 'er'], roles:['输出', '增伤', '精通', '充能']},
    {sets:['绝缘之旗印'], sands:['atkP'], goblet:['cryo', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'em', 'er'], roles:['输出', '增伤', '精通', '充能']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/644/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/45409890', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/44713435', '风伤幽冥']],   ''],
  ['菲米尼',      'cryo', [
    {sets:['苍白之火'], sands:['atkP'], goblet:['phys'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['增伤']},
    {sets:['染血的骑士道', '苍白之火'], sands:['atkP'], goblet:['phys'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['增伤']},
    {sets:['冰风迷途的勇士'], sands:['atkP'], goblet:['cryo'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['增伤']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/7257/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/43154250', 'Asgater'], ['https://www.miyoushe.com/ys/article/76548802', 'HoYo青枫']],   ''],
  ['夏洛蒂',      'cryo', [
    {sets:['昔时之歌'], sands:['er', 'atkP'], goblet:['atkP'], circlet:['heal'], subs:['cr', 'atkP'], roles:['治疗', '辅助']},
    {sets:['昔日宗室之仪'], sands:['er', 'atkP'], goblet:['atkP'], circlet:['heal'], subs:['cr', 'atkP'], roles:['辅助']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/500292/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/45238643', 'Asgater'], ['https://www.miyoushe.com/ys/article/74068739', 'HoYo青枫']],   ''],
  ['米卡',      'cryo', [
    {sets:['昔日宗室之仪'], sands:['er', 'hpP'], goblet:['hpP'], circlet:['heal', 'hpP', 'cr'], subs:['er', 'hpP', 'cr'], roles:['辅助']},
    {sets:['海染砗磲'], sands:['er', 'hpP'], goblet:['hpP'], circlet:['heal', 'hpP', 'cr'], subs:['er', 'hpP', 'cr'], roles:['治疗', '辅助']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/6285/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/37055160', 'Asgater'], ['https://www.miyoushe.com/ys/article/75831154', 'HoYo青枫']],   ''],

  /* ---------- 雷 ---------- */
  ['雷电将军',      'electro', [
    {sets:['绝缘之旗印'], sands:['er'], goblet:['electro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'er'], roles:['增伤', '充能']},
    {sets:['乐园遗落之花'], sands:['em'], goblet:['em'], circlet:['em'], subs:['em'], roles:['精通', '剧变反应']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/2404/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/76824456', 'Asgater'], ['https://www.miyoushe.com/ys/article/76739565', 'HoYo青枫']],   ''],
  ['八重神子',      'electro', [
    {sets:['炉火融炼之心'], sands:['atkP'], goblet:['atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'em'], roles:['增伤', '辅助', '精通']},
    {sets:['千岩牢固'], sands:['atkP'], goblet:['atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'em'], roles:['辅助']},
    {sets:['影中沉凝的幻灭'], sands:['atkP'], goblet:['atkP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'atkP', 'em'], roles:['输出', '增伤', '精通']},
    {sets:['饰金之梦'], sands:['atkP', 'em'], goblet:['atkP', 'electro'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'em', 'atkP'], roles:['增伤', '辅助', '精通']},
    {sets:['黄金剧团'], sands:['atkP'], goblet:['electro', 'atkP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'em', 'atkP'], roles:['输出', '增伤', '副C']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/3564/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/76347725', 'Asgater'], ['https://www.miyoushe.com/ys/article/76435138', 'HoYo青枫']],   ''],
  ['菲谢尔',      'electro', [
    {sets:['风起之日'], sands:['atkP'], goblet:['electro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'em', 'er'], roles:['输出', '增伤']},
    {sets:['黄金剧团'], sands:['atkP', 'em'], goblet:['electro'], circlet:['cr'], subs:['cd', 'cr', 'atkP', 'em', 'er'], roles:['输出', '增伤', '副C', '精通']},
    {sets:['千岩牢固'], sands:['atkP', 'er'], goblet:['electro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er', 'em'], roles:['输出', '增伤', '辅助']},
    {sets:['如雷的盛怒'], sands:['atkP', 'em'], goblet:['electro'], circlet:['cr'], subs:['cd', 'cr', 'atkP', 'em', 'er'], roles:['增伤', '精通', '剧变反应']},
    {sets:['苍白之火'], sands:['atkP'], goblet:['phys'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP'], roles:['输出', '增伤']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/382/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/72463227', 'Asgater'], ['https://www.miyoushe.com/ys/article/72528522', 'HoYo青枫']],   ''],
  ['刻晴',      'electro', [
    {sets:['如雷的盛怒'], sands:['atkP', 'em'], goblet:['electro'], circlet:['cr', 'cd'], subs:['cd', 'cr', 'atkP', 'em'], roles:['输出', '增伤', '精通']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/1058/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/61418035', 'Asgater'], ['https://www.miyoushe.com/ys/article/69883014', '风伤幽冥']],   ''],
  ['赛诺',      'electro', [
    {sets:['影中沉凝的幻灭'], sands:['atkP'], goblet:['atkP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'atkP', 'em'], roles:['输出', '增伤']},
    {sets:['如雷的盛怒'], sands:['em', 'atkP'], goblet:['electro', 'atkP'], circlet:['cd', 'cr'], subs:['em', 'cr', 'cd', 'atkP'], roles:['输出', '增伤', '精通', '充能']},
    {sets:['饰金之梦'], sands:['em', 'atkP'], goblet:['electro', 'atkP'], circlet:['cd', 'cr'], subs:['em', 'cr', 'cd', 'atkP'], roles:['增伤', '精通']},
    {sets:['穹境示现之夜'], sands:['em', 'atkP'], goblet:['electro', 'atkP'], circlet:['cd', 'cr'], subs:['em', 'cr', 'cd', 'atkP'], roles:['输出', '增伤', '辅助', '精通', '剧变反应']},
    {sets:['角斗士的终幕礼'], sands:['atkP', 'em'], goblet:['electro', 'atkP'], circlet:['cd', 'cr'], subs:['em', 'cr', 'cd', 'atkP'], roles:['增伤', '精通']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/4780/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/76480300', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/76282139', '风伤幽冥']],   ''],
  ['久岐忍',      'electro', [
    {sets:['饰金之梦'], sands:['em'], goblet:['em'], circlet:['em'], subs:['em', 'hpP', 'er'], roles:['输出', '精通']},
    {sets:['如雷的盛怒'], sands:['em'], goblet:['em'], circlet:['em'], subs:['em', 'hpP', 'er'], roles:['输出', '精通']},
    {sets:['乐园遗落之花'], sands:['em'], goblet:['em'], circlet:['em'], subs:['em', 'hpP', 'er'], roles:['输出', '精通', '剧变反应']},
    {sets:['千岩牢固'], sands:['em', 'hpP', 'er'], goblet:['em', 'hpP'], circlet:['heal', 'em', 'hpP', 'cr'], subs:['cr', 'em', 'hpP', 'er'], roles:['辅助', '精通']},
    {sets:['昔日宗室之仪'], sands:['em', 'hpP', 'er'], goblet:['em', 'hpP'], circlet:['heal', 'em', 'hpP', 'cr'], subs:['cr', 'em', 'hpP', 'er'], roles:['辅助', '精通']},
    {sets:['海染砗磲'], sands:['em', 'hpP', 'er'], goblet:['em', 'hpP'], circlet:['heal', 'hpP', 'cr'], subs:['cr', 'em', 'hpP', 'er'], roles:['输出', '治疗', '精通']},
    {sets:['被怜爱的少女'], sands:['em', 'hpP', 'er'], goblet:['em', 'hpP'], circlet:['heal', 'hpP', 'cr'], subs:['cr', 'em', 'hpP', 'er'], roles:['治疗', '精通']},
    {sets:['被怜爱的少女'], sands:['em', 'hpP', 'er'], goblet:['em', 'hpP'], circlet:['heal', 'em', 'hpP', 'cr'], subs:['cr', 'em', 'hpP', 'er'], roles:['治疗', '精通']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/4148/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/68674152', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/58831154', '风伤幽冥']],   ''],
  ['九条裟罗',      'electro', [
    {sets:['昔日宗室之仪'], sands:['atkP', 'er'], goblet:['electro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['增伤', '辅助']},
    {sets:['绝缘之旗印'], sands:['atkP', 'er'], goblet:['electro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['增伤', '充能']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/2402/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/9131930', 'Asgater'], ['https://www.miyoushe.com/ys/article/9380133', '流曳']],   ''],
  ['雷泽',      'electro', [
    {sets:['风起之日'], sands:['atkP'], goblet:['phys', 'atkP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'atkP', 'em', 'er'], roles:['输出', '增伤']},
    {sets:['苍白之火'], sands:['atkP'], goblet:['phys', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'em', 'er'], roles:['输出', '增伤', '精通', '充能']},
    {sets:['角斗士的终幕礼'], sands:['atkP'], goblet:['phys', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'em', 'er'], roles:['输出', '增伤', '精通', '充能']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/56/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/75508081', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/71180154', '风伤幽冥']],   ''],
  ['克洛琳德',      'electro', [
    {sets:['谐律异想断章'], sands:['atkP'], goblet:['electro', 'atkP'], circlet:['cd', 'cr'], subs:['cd', 'cr', 'atkP', 'em'], roles:['输出', '增伤']},
    {sets:['如雷的盛怒'], sands:['atkP'], goblet:['electro', 'atkP'], circlet:['cd', 'cr'], subs:['cd', 'cr', 'atkP', 'em'], roles:['增伤', '精通']},
    {sets:['逐影猎人'], sands:['atkP'], goblet:['electro', 'atkP'], circlet:['cd'], subs:['cd', 'cr', 'atkP', 'em'], roles:['输出', '增伤']},
    {sets:['来歆余响'], sands:['atkP'], goblet:['electro', 'atkP'], circlet:['cd', 'cr'], subs:['cd', 'cr', 'atkP', 'em'], roles:['输出', '增伤']},
    {sets:['角斗士的终幕礼'], sands:['atkP'], goblet:['electro', 'atkP'], circlet:['cd', 'cr'], subs:['cd', 'cr', 'atkP', 'em'], roles:['输出', '增伤']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/501213/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/75166713', 'Asgater'], ['https://www.miyoushe.com/ys/article/74324480', 'HoYo青枫']],   ''],
  ['瓦雷莎',      'electro', [
    {sets:['长夜之誓'], sands:['atkP'], goblet:['electro', 'atkP'], circlet:['cr', 'cd', 'atkP'], subs:['cr', 'cd', 'atkP', 'er'], roles:['增伤']},
    {sets:['黑曜秘典'], sands:['atkP'], goblet:['electro', 'atkP'], circlet:['cd', 'atkP'], subs:['cd', 'cr', 'atkP', 'er'], roles:['输出', '增伤']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/504570/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/71719330', 'Asgater'], ['https://www.miyoushe.com/ys/article/71622492', 'HoYo青枫']],   ''],
  ['伊安珊',      'electro', [
    {sets:['烬城勇者绘卷'], sands:['er', 'atkP'], goblet:['atkP'], circlet:['atkP', 'cr'], subs:['er', 'atkP', 'cr'], roles:['增伤', '辅助', '精通']},
    {sets:['昔日宗室之仪'], sands:['er', 'atkP'], goblet:['atkP'], circlet:['atkP', 'cr'], subs:['er', 'atkP', 'cr'], roles:['辅助']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/504621/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/62890274', 'Asgater'], ['https://www.miyoushe.com/ys/article/71744341', 'HoYo青枫']],   ''],
  ['欧洛伦',      'electro', [
    {sets:['烬城勇者绘卷'], sands:[], goblet:[], circlet:['cr'], subs:['cr'], roles:['输出', '副C', '辅助', '充能']},
    {sets:['烬城勇者绘卷'], sands:['atkP'], goblet:[], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP'], roles:['输出', '辅助']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/502927/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/59513932', 'Asgater'], ['https://www.miyoushe.com/ys/article/76822394', 'HoYo青枫']],   ''],
  ['多莉',      'electro', [
    {sets:['海染砗磲'], sands:['er', 'hpP'], goblet:['hpP', 'electro'], circlet:['heal', 'hpP'], subs:['hpP', 'er'], roles:['增伤', '治疗', '充能']},
    {sets:['昔日宗室之仪'], sands:['er', 'hpP'], goblet:['electro', 'hpP'], circlet:['hpP', 'cd', 'cr'], subs:['hpP', 'cd', 'cr'], roles:['输出', '增伤', '充能']},
    {sets:['被怜爱的少女'], sands:['er', 'hpP'], goblet:['hpP', 'electro'], circlet:['heal', 'hpP'], subs:['hpP', 'er'], roles:['增伤', '治疗', '充能']},
    {sets:['如雷的盛怒'], sands:['atkP', 'er'], goblet:['electro'], circlet:['cr', 'cd'], subs:['cd', 'cr', 'er'], roles:['输出', '增伤', '充能']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/4736/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/28690959', 'Asgater'], ['https://www.miyoushe.com/ys/article/69337526', 'HoYo青枫']],   ''],

  /* ---------- 风 ---------- */
  ['枫原万叶',      'anemo', [
    {sets:['翠绿之影'], sands:['em', 'atkP'], goblet:['em', 'anemo'], circlet:['em', 'cr', 'cd'], subs:['em', 'er', 'cr', 'cd', 'atkP'], roles:['输出', '增伤', '精通', '剧变反应']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/2142/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/64697921', 'Asgater'], ['https://www.miyoushe.com/ys/article/57050468', 'HoYo青枫']],   ''],
  ['温迪',      'anemo', [
    {sets:['翠绿之影'], sands:['atkP', 'em'], goblet:['em'], circlet:['cr', 'cd', 'em'], subs:['cr', 'cd', 'atkP', 'em', 'er'], roles:['辅助', '精通', '剧变反应']},
    {sets:['沙上楼阁史话'], sands:['atkP'], goblet:['anemo'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP'], roles:['输出', '增伤']},
    {sets:['来歆余响'], sands:['atkP'], goblet:['anemo'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP'], roles:['输出', '增伤']},
    {sets:['风起之日'], sands:['atkP'], goblet:['anemo'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP'], roles:['输出', '增伤']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/57/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/71128239', 'Asgater'], ['https://www.miyoushe.com/ys/article/71164926', 'HoYo青枫']],   ''],
  ['砂糖',      'anemo', [
    {sets:['翠绿之影'], sands:['em', 'er'], goblet:['em'], circlet:['em'], subs:['em', 'er'], roles:['减抗', '精通', '充能']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/1055/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/73607818', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/68934829', '风伤幽冥']],   ''],
  ['琴',      'anemo', [
    {sets:['翠绿之影'], sands:['atkP', 'er'], goblet:['atkP'], circlet:['heal', 'cr'], subs:['cr', 'er', 'cd', 'atkP'], roles:['输出', '减抗', '辅助']},
    {sets:['昔日宗室之仪'], sands:['atkP', 'er'], goblet:['atkP'], circlet:['heal', 'cr'], subs:['cr', 'er', 'cd', 'atkP'], roles:['输出', '辅助']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/59/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/73882906', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/55245347', '要和我一起去炸鱼吗m']],   ''],
  ['魈',      'anemo', [
    {sets:['长夜之誓'], sands:['atkP'], goblet:['atkP', 'anemo'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['增伤']},
    {sets:['辰砂往生录'], sands:['atkP'], goblet:['anemo', 'atkP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'atkP', 'er'], roles:['增伤']},
    {sets:['逐影猎人'], sands:['atkP'], goblet:['atkP', 'anemo'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'atkP', 'er'], roles:['输出', '增伤']},
    {sets:['沙上楼阁史话'], sands:['atkP'], goblet:['atkP', 'anemo'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['增伤']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/1498/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/61486523', 'Asgater'], ['https://www.miyoushe.com/ys/article/49581298', 'HoYo青枫']],   ''],
  ['鹿野院平藏',      'anemo', [
    {sets:['翠绿之影'], sands:['atkP'], goblet:['anemo', 'atkP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'atkP', 'er'], roles:['增伤', '辅助', '精通', '剧变反应']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/4197/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/25488733', 'Asgater'], ['https://www.miyoushe.com/ys/article/45911850', 'HoYo青枫']],   ''],
  ['早柚',      'anemo', [
    {sets:['翠绿之影'], sands:['er', 'em', 'atkP'], goblet:['em', 'atkP', 'anemo'], circlet:['heal', 'em', 'atkP'], subs:['er', 'em', 'atkP'], roles:['增伤', '减抗', '精通']},
    {sets:['被怜爱的少女'], sands:['er', 'em', 'atkP'], goblet:['em', 'atkP', 'anemo'], circlet:['heal', 'em', 'atkP'], subs:['er', 'em', 'atkP'], roles:['增伤', '精通']},
    {sets:['昔日宗室之仪'], sands:['er', 'em', 'atkP'], goblet:['em', 'atkP', 'anemo'], circlet:['heal', 'em', 'atkP'], subs:['er', 'em', 'atkP'], roles:['增伤', '辅助', '精通']},
    {sets:['流浪大地的乐团'], sands:['er', 'em', 'atkP'], goblet:['em', 'atkP', 'anemo'], circlet:['heal', 'em', 'atkP'], subs:['er', 'em', 'atkP'], roles:['增伤', '精通']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/2125/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/45698695', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/43236960', '风伤幽冥']],   ''],
  ['流浪者',      'anemo', [
    {sets:['沙上楼阁史话'], sands:['atkP'], goblet:['anemo', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'em'], roles:['输出', '增伤', '精通']},
    {sets:['来歆余响'], sands:['atkP'], goblet:['anemo', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'em'], roles:['输出', '增伤', '精通']},
    {sets:['追忆之注连'], sands:['atkP'], goblet:['anemo', 'atkP'], circlet:['cd'], subs:['cr', 'cd', 'atkP', 'em'], roles:['输出', '增伤', '精通']},
    {sets:['逐影猎人'], sands:['atkP'], goblet:['anemo', 'atkP'], circlet:['cd'], subs:['cr', 'cd', 'atkP', 'em'], roles:['输出', '增伤', '精通']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/5494/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/38627094', '流曳'], ['https://www.miyoushe.com/ys/article/52853674', '荧岁镇太辰']],   ''],
  ['闲云',      'anemo', [
    {sets:['翠绿之影'], sands:['er', 'atkP'], goblet:['atkP'], circlet:['atkP'], subs:['er', 'atkP', 'cr', 'cd'], roles:['减抗', '辅助', '精通', '剧变反应']},
    {sets:['昔日宗室之仪'], sands:['er', 'atkP'], goblet:['atkP'], circlet:['atkP'], subs:['er', 'atkP', 'cr', 'cd'], roles:[]},
    {sets:['昔时之歌'], sands:['er', 'atkP'], goblet:['atkP'], circlet:['atkP'], subs:['er', 'atkP', 'cr', 'cd'], roles:['增伤', '治疗']},
    {sets:['海染砗磲'], sands:['er', 'atkP'], goblet:['atkP'], circlet:['atkP'], subs:['er', 'atkP', 'cr', 'cd'], roles:['治疗']},
    {sets:['角斗士的终幕礼'], sands:['er', 'atkP'], goblet:['atkP'], circlet:['atkP'], subs:['er', 'atkP', 'cr', 'cd'], roles:['充能']},
    {sets:['长夜之誓'], sands:['er', 'atkP'], goblet:['anemo', 'atkP'], circlet:['cr', 'atkP'], subs:['cr', 'cd', 'atkP', 'er'], roles:['输出', '增伤']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/500673/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/62923290', 'Asgater'], ['https://www.miyoushe.com/ys/article/62920755', 'HoYo青枫']],   ''],
  ['恰斯卡',      'anemo', [
    {sets:['黑曜秘典'], sands:['atkP'], goblet:['atkP'], circlet:['cd'], subs:['cd', 'atkP', 'cr'], roles:['输出', '增伤']},
    {sets:['逐影猎人'], sands:['atkP'], goblet:['atkP'], circlet:['cd'], subs:['cd', 'atkP', 'cr'], roles:['输出']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/502928/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/74448954', 'Asgater'], ['https://www.miyoushe.com/ys/article/74429071', 'HoYo青枫']],   ''],
  ['琳妮特',      'anemo', [
    {sets:['翠绿之影'], sands:['atkP', 'er'], goblet:['anemo', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'er', 'cd', 'atkP'], roles:['输出', '增伤', '辅助', '充能']},
    {sets:['昔日宗室之仪'], sands:['atkP', 'er'], goblet:['anemo', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'er', 'cd', 'atkP'], roles:['输出', '增伤', '辅助', '充能']},
    {sets:['逐影猎人'], sands:['atkP', 'er'], goblet:['anemo', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'er', 'cd', 'atkP'], roles:['输出', '增伤', '充能']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/6938/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/42420011', 'Asgater'], ['https://www.miyoushe.com/ys/article/77532016', 'HoYo青枫']],   ''],
  ['伊法',      'anemo', [
    {sets:['翠绿之影'], sands:['em', 'atkP'], goblet:['em', 'anemo'], circlet:['em', 'cr', 'cd'], subs:['em', 'cr', 'cd', 'atkP'], roles:['增伤', '精通', '剧变反应']},
    {sets:['烬城勇者绘卷'], sands:['em', 'atkP'], goblet:['em', 'anemo'], circlet:['em', 'cr', 'cd'], subs:['em', 'cr', 'cd', 'atkP'], roles:['增伤', '辅助', '精通']},
    {sets:['黑曜秘典'], sands:['atkP'], goblet:['anemo'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'atkP'], roles:['输出', '增伤']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/504977/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/64215763', 'Asgater'], ['https://www.miyoushe.com/ys/article/64215506', 'HoYo青枫']],   ''],
  ['梦见月瑞希',      'anemo', [
    {sets:['翠绿之影'], sands:['em', 'er'], goblet:['em'], circlet:['em'], subs:['em', 'er', 'cr'], roles:['精通', '剧变反应']},
    {sets:['血红之证'], sands:['em', 'er'], goblet:['em'], circlet:['cr', 'cd', 'em'], subs:['em', 'er', 'cr'], roles:['输出', '增伤', '辅助', '精通', '剧变反应']},
    {sets:['饰金之梦'], sands:['em', 'er'], goblet:['em'], circlet:['em'], subs:['em', 'er', 'cr'], roles:['精通']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/504440/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/77540856', 'Asgater'], ['https://www.miyoushe.com/ys/article/76206764', 'HoYo青枫']],   ''],

  /* ---------- 岩 ---------- */
  ['钟离',      'geo', [
    {sets:['千岩牢固'], sands:['hpP', 'er'], goblet:['hpP', 'geo'], circlet:['hpP', 'cr'], subs:['hpP', 'er', 'cr', 'cd'], roles:['增伤', '护盾', '辅助']},
    {sets:['悠古的磐岩'], sands:['hpP', 'er'], goblet:['hpP', 'geo'], circlet:['hpP', 'cr'], subs:['hpP', 'er', 'cr', 'cd'], roles:['输出', '增伤', '辅助']},
    {sets:['昔日宗室之仪'], sands:['er', 'hpP'], goblet:['hpP', 'geo'], circlet:['hpP', 'cr'], subs:['er', 'hpP', 'cr', 'cd'], roles:['增伤', '辅助', '充能']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/1290/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/70478147', 'Asgater'], ['https://www.miyoushe.com/ys/article/60064315', 'HoYo青枫']],   ''],
  ['阿贝多',      'geo', [
    {sets:['华馆梦醒形骸记'], sands:['defP'], goblet:['geo'], circlet:['cr', 'cd'], subs:['defP', 'er', 'cd', 'cr'], roles:['输出', '增伤']},
    {sets:['黄金剧团'], sands:['defP'], goblet:['geo'], circlet:['cr', 'cd'], subs:['defP', 'er', 'cd', 'cr'], roles:['输出', '增伤']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/1360/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/71574894', 'Asgater'], ['https://www.miyoushe.com/ys/article/73555470', 'HoYo青枫']],   ''],
  ['荒泷一斗',      'geo', [
    {sets:['华馆梦醒形骸记'], sands:['defP'], goblet:['geo'], circlet:['cr', 'cd'], subs:['cd', 'cr', 'defP', 'er'], roles:['增伤']},
    {sets:['回声之林夜话'], sands:['defP'], goblet:['geo'], circlet:['cr', 'cd'], subs:['cd', 'cr', 'defP', 'er'], roles:['增伤', '副C', '精通']},
    {sets:['逆飞的流星'], sands:['defP'], goblet:['geo'], circlet:['cr', 'cd'], subs:['cd', 'cr', 'defP', 'er'], roles:['输出', '增伤', '护盾']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/3276/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/64666521', 'Asgater'], ['https://www.miyoushe.com/ys/article/50245580', 'HoYo青枫']],   ''],
  ['诺艾尔',      'geo', [
    {sets:['华馆梦醒形骸记'], sands:['defP'], goblet:['geo'], circlet:['cr', 'cd', 'defP'], subs:['defP', 'cr', 'cd'], roles:['输出', '增伤']},
    {sets:['逐影猎人'], sands:['defP'], goblet:['geo'], circlet:['cr', 'cd', 'defP'], subs:['defP', 'cr', 'cd'], roles:['输出', '增伤']},
    {sets:['角斗士的终幕礼'], sands:['defP'], goblet:['geo'], circlet:['cr', 'cd', 'defP'], subs:['defP', 'cr', 'cd'], roles:['输出', '增伤']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/111/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/74472429', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/54232496', '风伤幽冥']],   ''],
  ['五郎',      'geo', [
    {sets:['华馆梦醒形骸记'], sands:['defP', 'er'], goblet:['defP'], circlet:['cr', 'defP'], subs:['cr', 'defP', 'er'], roles:['输出', '副C', '辅助']},
    {sets:['昔日宗室之仪'], sands:['defP', 'er'], goblet:['defP'], circlet:['cr', 'defP'], subs:['cr', 'defP', 'er'], roles:['输出', '辅助']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/3275/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/72730171', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/13306375', '流曳']],   ''],
  ['凝光',      'geo', [
    {sets:['回声之林夜话'], sands:['atkP'], goblet:['geo', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['输出', '增伤', '辅助']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/78/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/49459379', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/34885085', '陈皮泡水er']],   ''],
  ['娜维娅',      'geo', [
    {sets:['回声之林夜话'], sands:['atkP'], goblet:['geo', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['输出', '增伤', '辅助']},
    {sets:['黄金剧团'], sands:['atkP'], goblet:['geo', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['增伤']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/500419/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/64215722', 'Asgater'], ['https://www.miyoushe.com/ys/article/64212556', 'HoYo青枫']],   ''],
  ['希诺宁',      'geo', [
    {sets:['烬城勇者绘卷'], sands:['defP'], goblet:['defP'], circlet:['defP', 'heal', 'cr'], subs:['defP', 'er', 'cr'], roles:['输出', '增伤', '精通']},
    {sets:['悠古的磐岩'], sands:['defP'], goblet:['defP'], circlet:['defP', 'heal', 'cr'], subs:['defP', 'er', 'cr'], roles:['输出', '辅助']},
    {sets:['黑曜秘典'], sands:['defP'], goblet:['defP'], circlet:['cd', 'cr'], subs:['cd', 'cr', 'defP'], roles:['输出', '增伤']},
    {sets:['华馆梦醒形骸记'], sands:['defP'], goblet:['defP'], circlet:['cr', 'cd'], subs:['cd', 'cr', 'defP'], roles:['输出']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/502306/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/71701174', 'Asgater'], ['https://www.miyoushe.com/ys/article/71693771', 'HoYo青枫']],   ''],
  ['卡齐娜',      'geo', [
    {sets:['烬城勇者绘卷'], sands:['er', 'defP'], goblet:['geo', 'defP'], circlet:['cr', 'defP'], subs:['cd', 'er', 'defP'], roles:['增伤', '辅助']},
    {sets:['黄金剧团'], sands:['er', 'defP'], goblet:['geo', 'defP'], circlet:['cr', 'defP'], subs:['cd', 'er', 'defP'], roles:['输出', '增伤', '副C']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/501626/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/57054661', 'Asgater'], ['https://www.miyoushe.com/ys/article/57054342', 'HoYo青枫']],   ''],
  ['云堇',      'geo', [
    {sets:['华馆梦醒形骸记'], sands:['defP', 'er'], goblet:['defP'], circlet:['cr', 'defP'], subs:['cr', 'defP', 'er'], roles:[]},
    {sets:['昔日宗室之仪'], sands:['defP', 'er'], goblet:['defP'], circlet:['cr', 'defP'], subs:['cr', 'defP', 'er'], roles:[]},
  ],     [['https://baike.mihoyo.com/ys/obc/content/3387/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/40126329', 'Asgater'], ['https://www.miyoushe.com/ys/article/70590053', 'HoYo青枫']],   ''],

  /* ---------- 草 ---------- */
  ['纳西妲',      'dendro', [
    {sets:['深林的记忆'], sands:['em'], goblet:['em', 'dendro'], circlet:['em', 'cr', 'cd'], subs:['em', 'cr', 'cd', 'er'], roles:['输出', '增伤', '减抗', '辅助', '精通', '充能']},
    {sets:['黄金剧团'], sands:['em'], goblet:['em', 'dendro'], circlet:['em', 'cr', 'cd'], subs:['em', 'cr', 'cd', 'er'], roles:['输出', '增伤', '精通', '充能']},
    {sets:['深林的记忆', '饰金之梦'], sands:['em'], goblet:['em', 'dendro'], circlet:['em', 'cr', 'cd'], subs:['em', 'cr', 'cd', 'er'], roles:['输出', '增伤', '精通', '充能']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/5111/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/68365889', 'Asgater'], ['https://www.miyoushe.com/ys/article/68333843', 'HoYo青枫']],   ''],
  ['艾尔海森',      'dendro', [
    {sets:['饰金之梦'], sands:['em', 'atkP'], goblet:['dendro', 'em'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'em', 'atkP'], roles:['输出', '增伤', '精通']},
    {sets:['深林的记忆', '饰金之梦'], sands:['em', 'atkP'], goblet:['dendro', 'em'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'em', 'atkP'], roles:['输出', '增伤', '精通']},
    {sets:['深林的记忆'], sands:['em', 'atkP'], goblet:['dendro', 'em'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'em', 'atkP'], roles:['输出', '增伤', '辅助', '精通']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/5865/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/53490437', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/53493972', '风伤幽冥']],   ''],
  ['提纳里',      'dendro', [
    {sets:['流浪大地的乐团'], sands:['em', 'atkP'], goblet:['dendro', 'atkP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'em', 'atkP'], roles:['增伤', '精通', '剧变反应']},
    {sets:['饰金之梦'], sands:['em', 'atkP'], goblet:['dendro', 'atkP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'em', 'atkP'], roles:['增伤', '精通', '剧变反应']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/4334/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/69888834', '风伤幽冥'], ['https://www.miyoushe.com/ys/article/28276046', '流曳']],   ''],
  ['基尼奇',      'dendro', [
    {sets:['黑曜秘典'], sands:['atkP'], goblet:['dendro'], circlet:['cd'], subs:['cd', 'cr', 'atkP'], roles:['输出', '增伤']},
    {sets:['未竟的遐思'], sands:['atkP'], goblet:['dendro', 'atkP'], circlet:['cr', 'cd'], subs:['cd', 'cr', 'atkP'], roles:['增伤']},
    {sets:['深林的记忆'], sands:['atkP'], goblet:['dendro', 'atkP'], circlet:['cr', 'cd'], subs:['cd', 'cr', 'atkP'], roles:['增伤', '减抗']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/501624/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/64759482', 'Asgater'], ['https://www.miyoushe.com/ys/article/64752081', 'HoYo青枫']],   ''],
  ['艾梅莉埃',      'dendro', [
    {sets:['未竟的遐思'], sands:['atkP'], goblet:['dendro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP'], roles:['增伤']},
    {sets:['深林的记忆'], sands:['atkP'], goblet:['dendro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP'], roles:['增伤', '减抗', '辅助']},
    {sets:['渡过烈火的贤人'], sands:['atkP'], goblet:['dendro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP'], roles:['增伤']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/501441/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/66196228', 'Asgater'], ['https://www.miyoushe.com/ys/article/74340680', 'HoYo青枫']],   ''],
  ['白术',      'dendro', [
    {sets:['昔日宗室之仪'], sands:['er', 'hpP'], goblet:['hpP'], circlet:['hpP', 'heal'], subs:['er', 'hpP'], roles:['输出', '辅助']},
    {sets:['海染砗磲'], sands:['er', 'hpP'], goblet:['hpP'], circlet:['heal', 'hpP'], subs:['er', 'hpP'], roles:['输出', '治疗', '辅助']},
    {sets:['昔时之歌'], sands:['hpP', 'er'], goblet:['hpP'], circlet:['heal', 'hpP'], subs:['er', 'hpP'], roles:['治疗']},
    {sets:['深林的记忆'], sands:['er', 'hpP'], goblet:['hpP'], circlet:['hpP', 'heal'], subs:['er', 'hpP'], roles:['减抗']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/6489/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/61386859', 'Asgater'], ['https://www.miyoushe.com/ys/article/39022726', '潇小渔']],   ''],
  ['瑶瑶',      'dendro', [
    {sets:['深林的记忆'], sands:['er', 'hpP'], goblet:['hpP'], circlet:['heal', 'hpP', 'cr'], subs:['em', 'er', 'atkP'], roles:['输出', '治疗', '辅助', '精通', '充能']},
    {sets:['千岩牢固'], sands:['er', 'hpP'], goblet:['hpP'], circlet:['hpP', 'heal', 'cr'], subs:['em', 'er', 'atkP'], roles:['输出', '治疗', '辅助', '精通', '充能']},
    {sets:['海染砗磲', '被怜爱的少女'], sands:['er', 'hpP'], goblet:['hpP'], circlet:['hpP', 'heal', 'cr'], subs:['em', 'er', 'atkP'], roles:['输出', '治疗', '精通', '充能']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/5866/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/70045506', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/49545157', '风伤幽冥']],   ''],
  ['柯莱',      'dendro', [
    {sets:['深林的记忆'], sands:['er', 'atkP'], goblet:['em', 'dendro'], circlet:['cr', 'atkP'], subs:['cr', 'er', 'em', 'atkP'], roles:['输出', '增伤', '减抗', '辅助', '精通', '充能']},
    {sets:['昔日宗室之仪'], sands:['er', 'atkP'], goblet:['em', 'dendro'], circlet:['cr', 'atkP'], subs:['cr', 'er', 'em', 'atkP'], roles:['输出', '增伤', '辅助', '精通', '充能']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/4333/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/70046336', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/42740346', '风伤幽冥']],   ''],
  ['卡维',      'dendro', [
    {sets:['深林的记忆'], sands:['er', 'em'], goblet:['em'], circlet:['em'], subs:['er', 'em', 'atkP', 'cr'], roles:['输出', '减抗', '精通', '充能']},
    {sets:['乐园遗落之花'], sands:['er', 'em'], goblet:['em'], circlet:['em'], subs:['er', 'em', 'atkP', 'cr'], roles:['输出', '精通', '充能', '剧变反应']},
    {sets:['饰金之梦', '流浪大地的乐团'], sands:['er', 'em'], goblet:['em'], circlet:['em'], subs:['er', 'em', 'atkP', 'cr'], roles:['输出', '精通', '充能']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/6490/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/68699830', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/39132970', '一波哥哥']],   ''],
  ['绮良良',      'dendro', [
    {sets:['花海甘露之光', '千岩牢固'], sands:['hpP'], goblet:['hpP'], circlet:['hpP'], subs:['hpP', 'er', 'cr', 'em'], roles:['输出', '护盾', '精通', '充能']},
    {sets:['深林的记忆'], sands:['hpP'], goblet:['hpP'], circlet:['hpP'], subs:['hpP', 'er', 'cr', 'em'], roles:['输出', '减抗', '精通', '充能']},
    {sets:['昔日宗室之仪'], sands:['hpP'], goblet:['hpP'], circlet:['hpP'], subs:['hpP', 'er', 'cr', 'em'], roles:['输出', '辅助', '精通', '充能']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/6594/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/75118187', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/39305155', '风伤幽冥']],   ''],

  /* ---------- 补遗：2.x–4.x 老角色（初始库未收录） ---------- */
  ['安柏',      'pyro', [
    {sets:['流浪大地的乐团'], sands:['atkP', 'em'], goblet:['pyro'], circlet:['cd'], subs:['cd', 'cr', 'atkP', 'em'], roles:['增伤', '精通']},
    {sets:['追忆之注连'], sands:['atkP', 'em'], goblet:['pyro'], circlet:['cr', 'cd'], subs:['cd', 'cr', 'atkP', 'em'], roles:['增伤', '精通', '充能']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/54/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/42570254', '风伤幽冥'], ['https://www.miyoushe.com/ys/article/11926703', '纪伊酱']],   ''],
  ['丽莎',      'electro', [
    {sets:['如雷的盛怒'], sands:['er', 'atkP'], goblet:['electro'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er', 'em'], roles:['增伤', '精通', '充能']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/92/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/39680217', '风伤幽冥'], ['https://www.miyoushe.com/ys/article/45737796', '落羽师兄']],   ''],
  ['凯亚',      'cryo', [
    {sets:['苍白之火'], sands:['atkP'], goblet:['phys'], circlet:['cr', 'cd'], subs:['cd', 'cr', 'atkP'], roles:['输出', '增伤']},
    {sets:['绝缘之旗印'], sands:['atkP'], goblet:['cryo'], circlet:['cr', 'cd'], subs:['cd', 'cr', 'atkP'], roles:['输出', '增伤', '充能']},
    {sets:['冰风迷途的勇士'], sands:['atkP'], goblet:['cryo'], circlet:['cd'], subs:['cd', 'cr', 'atkP'], roles:['输出', '增伤']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/76/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/46046481', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/42223270', '七月的休']],   ''],
  ['北斗',      'electro', [
    {sets:['绝缘之旗印'], sands:['er', 'atkP'], goblet:['electro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['输出', '增伤', '充能']},
    {sets:['昔日宗室之仪'], sands:['er', 'atkP'], goblet:['electro'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['输出', '增伤', '辅助', '充能']},
    {sets:['如雷的盛怒'], sands:['er', 'atkP'], goblet:['electro'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['输出', '增伤', '充能']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/79/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/76458044', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/76265302', '风伤幽冥']],   ''],
  ['埃洛伊',      'cryo', [
    {sets:['冰风迷途的勇士'], sands:['atkP'], goblet:['cryo', 'atkP'], circlet:['cd'], subs:['cd', 'cr', 'atkP'], roles:['增伤']},
    {sets:['追忆之注连'], sands:['atkP'], goblet:['cryo'], circlet:['cr', 'cd'], subs:['cd', 'cr', 'atkP'], roles:['输出', '增伤']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/2415/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/11394064', '暴躁的土土土'], ['https://www.miyoushe.com/ys/article/49845902', '风伤幽冥']],   ''],
  ['神里绫人',      'hydro', [
    {sets:['沉沦之心'], sands:['atkP'], goblet:['hydro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['增伤']},
    {sets:['水仙之梦'], sands:['atkP'], goblet:['hydro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['增伤']},
    {sets:['来歆余响'], sands:['atkP'], goblet:['hydro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['增伤']},
    {sets:['角斗士的终幕礼'], sands:['atkP'], goblet:['hydro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['增伤']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/3875/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/64552586', 'Asgater'], ['https://www.miyoushe.com/ys/article/45936049', '闲摆花团扇']],   ''],
  ['千织',      'geo', [
    {sets:['华馆梦醒形骸记'], sands:['defP'], goblet:['geo', 'defP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'defP', 'atkP'], roles:['输出', '增伤']},
    {sets:['黄金剧团'], sands:['defP'], goblet:['geo', 'defP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'defP', 'atkP'], roles:['输出', '增伤', '副C']},
    {sets:['千岩牢固'], sands:['defP'], goblet:['geo', 'defP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'defP', 'atkP'], roles:['输出', '增伤', '辅助']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/500987/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/64606530', 'Asgater'], ['https://www.miyoushe.com/ys/article/58421614', 'HoYo青枫']],   ''],
  ['珐露珊',      'anemo', [
    {sets:['千岩牢固'], sands:['er'], goblet:['anemo', 'atkP'], circlet:['cr', 'cd'], subs:['er', 'cr', 'cd', 'atkP'], roles:['输出', '增伤', '辅助', '充能']},
    {sets:['昔日宗室之仪'], sands:['er'], goblet:['anemo', 'atkP'], circlet:['cr', 'cd'], subs:['er', 'cr', 'cd', 'atkP'], roles:['输出', '增伤', '辅助', '充能']},
    {sets:['翠绿之影'], sands:['er'], goblet:['anemo', 'atkP'], circlet:['cr', 'cd'], subs:['er', 'cr', 'cd', 'atkP'], roles:['输出', '增伤', '辅助', '精通', '充能', '剧变反应']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/5493/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/71373526', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/32553943', '风伤幽冥']],   ''],
  ['莱依拉',      'cryo', [
    {sets:['千岩牢固'], sands:['hpP'], goblet:['hpP'], circlet:['hpP'], subs:['er', 'hpP', 'cr'], roles:['护盾', '辅助']},
    {sets:['昔日宗室之仪'], sands:['hpP'], goblet:['hpP'], circlet:['hpP'], subs:['er', 'hpP', 'cr'], roles:['辅助']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/5297/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/45987202', 'HoYo青枫'], ['https://www.miyoushe.com/ys/article/64192812', '风伤幽冥']],   ''],
  ['赛索斯',      'electro', [
    {sets:['流浪大地的乐团'], sands:['em'], goblet:['electro', 'em'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'em', 'er'], roles:['输出', '增伤', '精通']},
    {sets:['饰金之梦'], sands:['em'], goblet:['electro', 'em'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'em', 'er'], roles:['输出', '增伤', '精通']},
    {sets:['逆飞的流星'], sands:['em'], goblet:['electro', 'em'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'em', 'er'], roles:['增伤', '护盾', '精通']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/501212/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/53493547', 'Asgater'], ['https://www.miyoushe.com/ys/article/72499518', 'HoYo青枫']],   ''],
  ['蓝砚',      'anemo', [
    {sets:['翠绿之影'], sands:['atkP', 'er'], goblet:['atkP', 'anemo'], circlet:['atkP', 'cr', 'cd'], subs:['atkP', 'er', 'cr', 'cd', 'em'], roles:['输出', '增伤', '精通', '剧变反应']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/503614/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/61128886', 'Asgater'], ['https://www.miyoushe.com/ys/article/77813912', 'HoYo青枫']],   ''],
  ['茜特菈莉',      'cryo', [
    {sets:['烬城勇者绘卷'], sands:['em', 'er'], goblet:['em'], circlet:['em'], subs:['em', 'er'], roles:['增伤', '精通', '充能']},
    {sets:['千岩牢固'], sands:['em', 'er'], goblet:['em'], circlet:['em'], subs:['em', 'er'], roles:['护盾', '精通']},
    {sets:['昔日宗室之仪'], sands:['em', 'er'], goblet:['em'], circlet:['em'], subs:['em', 'er'], roles:['精通']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/503612/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/76171935', 'Asgater'], ['https://www.miyoushe.com/ys/article/76168720', 'HoYo青枫']],   ''],

  /* ---------- 补遗：5.8 伊涅芙 + 6.0–6.5 挪德卡莱 ---------- */
  ['伊涅芙',      'electro', [
    {sets:['纺月的夜歌'], sands:['atkP'], goblet:['atkP'], circlet:['cr', 'cd', 'atkP'], subs:['cr', 'cd', 'atkP', 'em', 'er'], roles:['输出', '辅助', '精通']},
    {sets:['晨星与月的晓歌'], sands:['atkP'], goblet:['atkP'], circlet:['cr', 'cd', 'atkP'], subs:['cr', 'cd', 'atkP', 'em', 'er'], roles:['输出', '副C', '精通', '剧变反应']},
    {sets:['千岩牢固'], sands:['atkP'], goblet:['atkP'], circlet:['cr', 'cd', 'atkP'], subs:['cr', 'cd', 'atkP', 'em', 'er'], roles:[]},
  ],     [['https://baike.mihoyo.com/ys/obc/content/505631/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/77883619', 'Asgater'], ['https://www.miyoushe.com/ys/article/72311458', 'HoYo青枫']],   ''],
  ['菈乌玛',      'dendro', [
    {sets:['纺月的夜歌'], sands:['em', 'er'], goblet:['em'], circlet:['em'], subs:['em', 'er'], roles:['辅助', '精通', '充能']},
    {sets:['穹境示现之夜'], sands:['em'], goblet:['em'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'em', 'er'], roles:['输出', '精通']},
    {sets:['深林的记忆'], sands:['em', 'er'], goblet:['em'], circlet:['em'], subs:['em', 'er'], roles:['减抗', '精通']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/505973/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/74866766', 'Asgater'], ['https://www.miyoushe.com/ys/article/74959885', 'HoYo青枫']],   ''],
  ['菲林斯',      'electro', [
    {sets:['穹境示现之夜'], sands:['atkP'], goblet:['atkP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'atkP', 'em', 'er'], roles:['输出', '增伤', '精通']},
    {sets:['饰金之梦'], sands:['atkP'], goblet:['atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'em', 'er'], roles:['精通']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/505971/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/77795408', 'Asgater'], ['https://www.miyoushe.com/ys/article/73472412', 'HoYo青枫']],   ''],
  ['爱诺',      'hydro', [
    {sets:['纺月的夜歌'], sands:['er', 'em'], goblet:['em'], circlet:['em', 'cr'], subs:['em', 'er', 'cr', 'cd'], roles:['增伤', '精通']},
    {sets:['昔日宗室之仪'], sands:['er', 'em'], goblet:['em'], circlet:['em', 'cr'], subs:['em', 'er', 'cr', 'cd'], roles:['辅助', '精通', '剧变反应']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/505972/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/68366413', 'Asgater'], ['https://www.miyoushe.com/ys/article/72688435', 'HoYo青枫']],   ''],
  ['奈芙尔',      'dendro', [
    {sets:['穹境示现之夜'], sands:['em'], goblet:['em'], circlet:['cd', 'em', 'cr'], subs:['cd', 'cr', 'em'], roles:['输出', '增伤', '精通']},
    {sets:['饰金之梦'], sands:['em'], goblet:['em'], circlet:['cd', 'cr', 'em'], subs:['cd', 'cr', 'em'], roles:['精通']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/506676/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/74962160', 'Asgater'], ['https://www.miyoushe.com/ys/article/74983763', 'HoYo青枫']],   ''],
  ['杜林',      'pyro', [
    {sets:['风起之日'], sands:['atkP', 'em'], goblet:['pyro', 'atkP', 'em'], circlet:['cr', 'cd'], subs:['cd', 'cr', 'atkP', 'em', 'er'], roles:['输出', '增伤', '精通']},
    {sets:['天之美赐'], sands:['atkP', 'er'], goblet:['pyro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['输出', '增伤', '辅助']},
    {sets:['昔日宗室之仪'], sands:['atkP', 'er'], goblet:['pyro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['增伤', '辅助']},
    {sets:['深林的记忆'], sands:['atkP', 'er'], goblet:['pyro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['增伤', '减抗', '辅助']},
    {sets:['纺月的夜歌'], sands:['atkP', 'er'], goblet:['pyro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['增伤', '辅助', '精通', '剧变反应']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/507241/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/75443427', 'Asgater'], ['https://www.miyoushe.com/ys/article/71125651', 'HoYo青枫']],   ''],
  ['哥伦比娅',      'hydro', [
    {sets:['晨星与月的晓歌'], sands:['er', 'hpP'], goblet:['hpP'], circlet:['cr', 'cd', 'hpP'], subs:['cd', 'cr', 'hpP', 'er', 'em'], roles:['输出', '副C', '精通']},
    {sets:['纺月的夜歌'], sands:['er', 'hpP'], goblet:['hpP'], circlet:['cr', 'cd', 'hpP'], subs:['cd', 'cr', 'hpP', 'er', 'em'], roles:['增伤', '辅助', '精通', '充能']},
    {sets:['穹境示现之夜'], sands:['er', 'hpP'], goblet:['hpP'], circlet:['cd', 'hpP'], subs:['cd', 'cr', 'hpP', 'er', 'em'], roles:['输出', '精通']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/507505/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/76665391', 'Asgater'], ['https://www.miyoushe.com/ys/article/72301009', 'HoYo青枫']],   ''],
  ['兹白',      'geo', [
    {sets:['穹境示现之夜'], sands:['defP', 'em'], goblet:['defP', 'em'], circlet:['cd', 'cr', 'defP'], subs:['cr', 'cd', 'defP', 'em'], roles:['输出', '精通']},
    {sets:['华馆梦醒形骸记'], sands:['defP', 'em'], goblet:['defP', 'em'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'defP', 'em'], roles:['精通']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/507503/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/72899669', 'Asgater'], ['https://www.miyoushe.com/ys/article/72891550', 'HoYo青枫']],   ''],

  /* ---------- 补遗：6.6–7.0（新版本，配装可能随环境微调） ---------- */
  ['桑多涅',      'cryo', [
    {sets:['影中沉凝的幻灭'], sands:['atkP'], goblet:['atkP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'atkP', 'em'], roles:['输出', '增伤']},
    {sets:['饰金之梦'], sands:['atkP'], goblet:['atkP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'atkP', 'em'], roles:['精通']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/508841/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/76348139', 'Asgater'], ['https://www.miyoushe.com/ys/article/76345204', 'HoYo青枫']],   ''],
  ['奥黛塔',      'cryo', [
    {sets:['炉火融炼之心'], sands:['atkP'], goblet:['atkP'], circlet:['cr', 'cd', 'atkP'], subs:['cr', 'cd', 'atkP'], roles:['辅助']},
    {sets:['影中沉凝的幻灭'], sands:['atkP'], goblet:['atkP'], circlet:['cd', 'cr', 'atkP'], subs:['cr', 'cd', 'atkP'], roles:['输出']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/509103/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/77367319', 'Asgater'], ['https://www.miyoushe.com/ys/article/77363319', 'HoYo青枫']],   ''],
  ['阿罗夏',      'electro', [
    {sets:['炉火融炼之心'], sands:[], goblet:['atkP'], circlet:['heal', 'atkP'], subs:['atkP'], roles:['增伤', '辅助', '精通']},
    {sets:['昔日宗室之仪'], sands:[], goblet:['atkP'], circlet:['heal', 'atkP'], subs:['atkP'], roles:['辅助']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/509104/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/77367254', 'Asgater'], ['https://www.miyoushe.com/ys/article/77363224', 'HoYo青枫']],   ''],
  ['法尔伽',      'anemo', [
    {sets:['风起之日'], sands:['atkP'], goblet:['atkP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'atkP'], roles:['输出']},
    {sets:['沙上楼阁史话'], sands:['atkP'], goblet:['atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP'], roles:['输出', '增伤']},
    {sets:['来歆余响'], sands:['atkP'], goblet:['atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP'], roles:['输出']},
    {sets:['角斗士的终幕礼'], sands:['atkP'], goblet:['atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP'], roles:['增伤']},
  ],     [['https://baike.mihoyo.com/ys/obc/content/507995/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/73524547', 'Asgater'], ['https://www.miyoushe.com/ys/article/73521348', 'HoYo青枫']],   ''],

  /* ---------- 补遗：蒙德 5.x 群角色（洛恩 / 尼可 / 布伦妮） ---------- */
  ['洛恩',      'cryo', [
    {sets:['风起之日'], sands:['atkP'], goblet:['cryo', 'atkP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'atkP'], roles:['输出', '增伤']},
    {sets:['逐影猎人'], sands:['atkP'], goblet:['cryo', 'atkP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'atkP'], roles:['输出', '增伤']},
    {sets:['冰风迷途的勇士'], sands:['atkP'], goblet:['cryo', 'atkP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'atkP'], roles:['输出', '增伤']},
  ],      [['https://baike.mihoyo.com/ys/obc/content/508598/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/75904223', 'Asgater'], ['https://www.miyoushe.com/ys/article/75898105', 'HoYo青枫']],      ''],
  ['尼可',      'pyro', [
    {sets:['天之美赐'], sands:['atkP'], goblet:['atkP'], circlet:['atkP'], subs:['atkP', 'er'], roles:['增伤', '充能']},
    {sets:['昔日宗室之仪'], sands:['atkP'], goblet:['atkP'], circlet:['atkP'], subs:['atkP', 'er'], roles:['辅助']},
  ],      [['https://baike.mihoyo.com/ys/obc/content/508596/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/75443707', 'Asgater'], ['https://www.miyoushe.com/ys/article/75440644', 'HoYo青枫']],      ''],
  ['布伦妮',      'anemo', [
    {sets:['翠绿之影'], sands:['er', 'atkP'], goblet:['atkP'], circlet:['atkP'], subs:['er', 'atkP'], roles:['精通', '剧变反应']},
    {sets:['天之美赐'], sands:['er', 'atkP'], goblet:['atkP'], circlet:['atkP'], subs:['er', 'atkP'], roles:['增伤', '辅助', '充能']},
  ],      [['https://baike.mihoyo.com/ys/obc/content/508597/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/75443677', 'Asgater'], ['https://www.miyoushe.com/ys/article/75442988', 'HoYo青枫']],      ''],

  /* ---------- 补遗：挪德卡莱（莉奈娅 / 叶洛亚 / 雅珂达） ---------- */
  ['莉奈娅',      'geo', [
    {sets:['晨星与月的晓歌'], sands:['defP', 'er'], goblet:['defP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'defP', 'er'], roles:['精通']},
    {sets:['华馆梦醒形骸记'], sands:['defP', 'er'], goblet:['defP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'defP', 'er'], roles:[]},
    {sets:['纺月的夜歌'], sands:['defP', 'er'], goblet:['defP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'defP', 'er'], roles:['辅助', '精通', '充能']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/508198/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/74409707', 'Asgater'], ['https://www.miyoushe.com/ys/article/74473481', '关蝎']],      ''],
  ['叶洛亚',      'geo', [
    {sets:['纺月的夜歌'], sands:['em'], goblet:['em'], circlet:['em'], subs:['em', 'er', 'cr'], roles:['输出', '辅助', '精通']},
  ],      [['https://baike.mihoyo.com/ys/obc/content/507504/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/72899643', 'Asgater'], ['https://www.miyoushe.com/ys/article/72869570', 'HoYo青枫']],      ''],
  ['雅珂达',      'anemo', [
    {sets:['翠绿之影'], sands:['er'], goblet:['atkP'], circlet:['heal', 'atkP'], subs:['er', 'atkP', 'cr'], roles:['精通', '剧变反应']},
    {sets:['纺月的夜歌'], sands:['er'], goblet:['atkP'], circlet:['heal', 'atkP'], subs:['er', 'atkP', 'cr'], roles:['充能']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/507287/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/71128393', 'Asgater'], ['https://www.miyoushe.com/ys/article/71325029', '关蝎']],      ''],

  /* ---------- 旅行者：按「元素形态」各设一个条目，各自独立配装 ---------- */
  ['旅行者·风',      'anemo', [
    {sets:['翠绿之影'], sands:['er', 'atkP'], goblet:['anemo', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'er', 'atkP'], roles:['输出', '增伤', '减抗', '辅助', '充能']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/505499/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/58423640', 'Sattle'], ['https://www.miyoushe.com/ys/article/43149246', '我真的好困t']],      '旅行者按元素形态分别启用、分别配装，各形态互相独立'],
  ['旅行者·岩',      'geo', [
    {sets:['昔日宗室之仪'], sands:['er', 'atkP'], goblet:['geo', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['增伤']},
    {sets:['悠古的磐岩'], sands:['er', 'atkP'], goblet:['geo', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'er', 'atkP'], roles:['输出', '增伤', '充能']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/505501/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/21129731', '猫冬'], ['https://www.miyoushe.com/ys/article/43553143', '我真的好困t']],      '旅行者按元素形态分别启用、分别配装，各形态互相独立'],
  ['旅行者·雷',      'electro', [
    {sets:['昔日宗室之仪'], sands:['er', 'atkP'], goblet:['electro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['增伤']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/505496/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/43796537', '我真的好困t'], ['https://www.miyoushe.com/ys/article/58555607', 'Sattle']],      '旅行者按元素形态分别启用、分别配装，各形态互相独立'],
  ['旅行者·草',      'dendro', [
    {sets:['深林的记忆'], sands:['atkP', 'er'], goblet:['dendro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'atkP', 'er'], roles:['输出', '增伤', '减抗', '辅助']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/505498/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/28276210', '流曳'], ['https://www.miyoushe.com/ys/article/58933632', 'Sattle']],      '旅行者按元素形态分别启用、分别配装，各形态互相独立'],
  ['旅行者·水',      'hydro', [
    {sets:['黄金剧团'], sands:['atkP', 'er'], goblet:['hydro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'er', 'atkP'], roles:['增伤']},
    {sets:['水仙之梦', '沉沦之心'], sands:['atkP', 'er'], goblet:['hydro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'er', 'atkP'], roles:['增伤']},
    {sets:['辰砂往生录'], sands:['atkP', 'er'], goblet:['hydro', 'atkP'], circlet:['cr', 'cd'], subs:['cr', 'cd', 'er', 'atkP'], roles:['增伤']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/505500/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/42652540', '幕陵'], ['https://www.miyoushe.com/ys/article/58933661', 'Sattle']],      '旅行者按元素形态分别启用、分别配装，各形态互相独立'],
  ['旅行者·火',      'pyro', [
    {sets:['烬城勇者绘卷'], sands:['atkP', 'em'], goblet:['pyro', 'atkP'], circlet:['cr', 'cd', 'atkP'], subs:['cr', 'cd', 'atkP', 'em'], roles:['增伤', '辅助', '精通']},
    {sets:['黑曜秘典'], sands:['atkP', 'em'], goblet:['pyro', 'atkP'], circlet:['cd', 'atkP'], subs:['cd', 'atkP', 'cr', 'em'], roles:['输出', '增伤', '精通']},
    {sets:['长夜之誓'], sands:['atkP', 'em'], goblet:['pyro', 'atkP'], circlet:['cr', 'cd', 'atkP'], subs:['cd', 'atkP', 'cr', 'em'], roles:['输出', '增伤', '精通']},
    {sets:['角斗士的终幕礼'], sands:['atkP', 'em'], goblet:['pyro', 'atkP'], circlet:['cr', 'cd', 'atkP'], subs:['cd', 'atkP', 'cr', 'em'], roles:['输出', '增伤', '精通']},
    {sets:['乐园遗落之花'], sands:['em'], goblet:['em'], circlet:['em'], subs:['cr', 'er'], roles:['输出', '精通', '剧变反应']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/4074/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/60699036', '风伤幽冥'], ['https://www.miyoushe.com/ys/article/61101854', '猫冬']],      '旅行者按元素形态分别启用、分别配装，各形态互相独立'],
  ['旅行者·冰',       'cryo', [
    {sets:['影中沉凝的幻灭'], sands:['atkP'], goblet:['atkP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'atkP', 'em'], roles:['输出']},
    {sets:['炉火融炼之心'], sands:['atkP'], goblet:['atkP'], circlet:['cd', 'cr'], subs:['cr', 'cd', 'atkP', 'em'], roles:['辅助', '精通']},
  ],  [['https://baike.mihoyo.com/ys/obc/content/509225/detail', '观测枢词条'], ['https://www.miyoushe.com/ys/article/77260008', 'Asgater'], ['https://www.miyoushe.com/ys/article/77341480', 'HoYo青枫']],       '旅行者按元素形态分别启用、分别配装，各形态互相独立'],
];

/* ---------- 展开为完整结构 ---------- */
/* wiki 副词条是 id 列表（按优先级），转成 app 内部 [{id, req, op}]；
   首位标记 ★必选（req），其余按 '>' 递减。 */
function subIdsToSubs(ids) {
  return toSubs((ids || []).map((id, i) => [id, i === 0, '>']));
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
  return RAW_CHARS.map((row, i) => {
    const name = row[0];
    const element = row[1];
    const meta = CH_META[name] || ['other', ['maindps']];

    // 数据格式兼容：
    //   新格式：[name, element, [ {sets,sands,goblet,circlet,subs,tag}... ], src, note]
    //   旧格式（兜底）：[name, element, subPreset, [sets...], sands[], goblet[], circlet[], src, note]
    let buildsRaw, srcRaw, noteRaw;
    if (Array.isArray(row[2])) {
      buildsRaw = row[2]; srcRaw = row[3]; noteRaw = row[4];
    } else {
      const subPreset = row[2];
      const setsList = row[3] || [];
      const fn = (arr) => (arr || []).map((stat, j) => ({ stat, rank: j + 1 }));
      const presets = SUB_PRESETS[subPreset] || SUB_PRESETS.crit;
      buildsRaw = setsList.map(sets => ({
        sets,
        sands: fn(row[4]), goblet: fn(row[5]), circlet: fn(row[6]),
        subs: presets.map(s => s[0]), tag: null,
      }));
      srcRaw = row[7]; noteRaw = row[8];
    }

    // 每组配装独立携带 套装 + 主词条 + 副词条（直接来自 wiki，不再走粗预设桶）
    const builds = buildsRaw.map((b, idx) => ({
      sets: b.sets || [],
      bkey: name + '#' + idx,
      priority: idx === 0 ? 'main' : 'alt',
      main: {
        sands:   (b.sands   || []).map((stat, j) => ({ stat, rank: j + 1 })),
        goblet:  (b.goblet  || []).map((stat, j) => ({ stat, rank: j + 1 })),
        circlet: (b.circlet || []).map((stat, j) => ({ stat, rank: j + 1 })),
      },
      subs: subIdsToSubs(b.subs),
      roles: Array.isArray(b.roles) ? b.roles.filter(s => typeof s === 'string' && s) : [],
    }));

    return {
      id: 'c' + i + '_' + name,
      name,
      skey: name, // 出厂角色名：改名后不变，是「改名了还能还原」的唯一可靠锚点（id 会随数组插入漂移）
      element,
      region: meta[0],
      roles: meta[1].slice(),
      enabled: false,
      note: noteRaw || '',
      src: normSrcList(srcRaw),
      custom: false,
      builds,
    };
  });
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
