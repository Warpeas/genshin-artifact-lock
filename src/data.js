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
const APP_VERSION = '2026.09.14';
const CHANGELOG = [
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

/* ---------- 圣遗物套装 ---------- */
// bonus: 2件套效果简述（用于 2+2 搭配参考）
const SETS = [
  { name: '翠绿之影',             bonus: '风元素伤害+15%' },
  { name: '炽烈的炎之魔女',       bonus: '火元素伤害+15%' },
  { name: '如雷的盛怒',           bonus: '雷元素伤害+15%' },
  { name: '平息鸣雷的尊者',       bonus: '受到的雷元素伤害-40%' },
  { name: '渡过烈火的贤人',       bonus: '受到的火元素伤害-40%' },
  { name: '冰风迷途的勇士',       bonus: '冰元素伤害+15%' },
  { name: '被怜爱的少女',         bonus: '治疗加成+15%' },
  { name: '昔日宗室之仪',         bonus: '元素爆发伤害+20%' },
  { name: '流浪大地的乐团',       bonus: '元素精通+80' },
  { name: '沉沦之心',             bonus: '水元素伤害+15%' },
  { name: '苍白之火',             bonus: '物理伤害+25%' },
  { name: '染血的骑士道',         bonus: '物理伤害+25%' },
  { name: '千岩牢固',             bonus: '生命值+20%' },
  { name: '逆飞的流星',           bonus: '护盾强效+35%' },
  { name: '悠古的磐岩',           bonus: '岩元素伤害+15%' },
  { name: '绝缘之旗印',           bonus: '元素充能效率+20%' },
  { name: '追忆之注连',           bonus: '攻击力+18%' },
  { name: '华馆梦醒形骸记',       bonus: '防御力+30%' },
  { name: '海染砗磲',             bonus: '治疗加成+15%' },
  { name: '辰砂往生录',           bonus: '攻击力+18%' },
  { name: '来歆余响',             bonus: '攻击力+18%' },
  { name: '深林的记忆',           bonus: '草元素伤害+15%' },
  { name: '饰金之梦',             bonus: '元素精通+80' },
  { name: '乐园遗落之花',         bonus: '元素精通+80' },
  { name: '沙上楼阁史话',         bonus: '风元素伤害+15%' },
  { name: '水仙十字之圣遗物',     bonus: '普通攻击/重击伤害+15%' },
  { name: '花海甘露之光',         bonus: '生命值+20%' },
  { name: '昔时之歌',             bonus: '治疗加成+15%' },
  { name: '回声之林夜话',         bonus: '攻击力+18%' },
  { name: '谐律异想断章',         bonus: '攻击力+18%' },
  { name: '未竟的遐思',           bonus: '攻击力+18%' },
  { name: '黄金剧团',             bonus: '元素战技伤害+20%' },
  { name: '黑曜秘典',             bonus: '夜魂加持下伤害+15%' },
  { name: '烬城勇者绘卷',         bonus: '元素战技/爆发伤害+15%' },
  { name: '长夜之誓',             bonus: '下落攻击伤害+25%' },
  { name: '深廊终曲',             bonus: '冰元素伤害+15%' },
  { name: '戍卫之誓',             bonus: '攻击力+18%' },
  /* ---- 6.0 挪德卡莱 ---- */
  { name: '纺月的夜歌',           bonus: '元素充能效率+20%' },
  { name: '穹境示现之夜',         bonus: '元素精通+80' },
  /* ---- 6.3 月之四 ---- */
  { name: '晨星与月的晓歌',       bonus: '元素精通+80' },
  /* ---- 6.3/6.4 风起之日 ---- */
  { name: '风起之日',             bonus: '攻击力+18%' },
  /* ---- 6.6 天之美赐 ---- */
  { name: '天之美赐',             bonus: '元素充能效率+20%' },
  /* ---- 6.6 影中沉凝的幻灭 ---- */
  { name: '影中沉凝的幻灭',       bonus: '攻击力+18%' },
  /* ---- 7.0 炉火融炼之心 ---- */
  { name: '炉火融炼之心',         bonus: '攻击力+18%' },
  /* ---- 7.0 血红之证（备用） ---- */
  { name: '血红之证',             bonus: '攻击力+18%' },
];
const SET_NAMES = SETS.map(s => s.name);
const SET_BONUS = Object.fromEntries(SETS.map(s => [s.name, s.bonus]));

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
const CH_META = {
  /* ---------- 蒙德 Mondstadt（26） ---------- */
  '琴': ['mondstadt', ['support']],
  '迪卢克': ['mondstadt', ['maindps']],
  '可莉': ['mondstadt', ['maindps']],
  '温迪': ['mondstadt', ['support']],
  '班尼特': ['mondstadt', ['support', 'subdps']],
  '迪奥娜': ['mondstadt', ['support']],
  '雷泽': ['mondstadt', ['maindps']],
  '芭芭拉': ['mondstadt', ['support']],
  '罗莎莉亚': ['mondstadt', ['subdps']],
  '砂糖': ['mondstadt', ['support']],
  '菲谢尔': ['mondstadt', ['subdps']],
  '诺艾尔': ['mondstadt', ['maindps']],
  '莫娜': ['mondstadt', ['support', 'subdps']],
  '阿贝多': ['mondstadt', ['subdps']],
  '优菈': ['mondstadt', ['maindps']],
  '米卡': ['mondstadt', ['support']],
  '安柏': ['mondstadt', ['support']],
  '丽莎': ['mondstadt', ['subdps']],
  '凯亚': ['mondstadt', ['subdps']],
  '埃洛伊': ['mondstadt', ['maindps']],   // 2.1 联动角色，归属蒙德
  '法尔伽': ['mondstadt', ['maindps']],
  '塔利雅': ['mondstadt', ['support']],
  '杜林': ['mondstadt', ['subdps']],
  '洛恩': ['mondstadt', ['maindps']],
  '尼可': ['mondstadt', ['maindps']],
  '布伦妮': ['mondstadt', ['support']],

  /* ---------- 璃月 Liyue（22） ---------- */
  '刻晴': ['liyue', ['maindps']],
  '凝光': ['liyue', ['maindps']],
  '香菱': ['liyue', ['subdps']],
  '行秋': ['liyue', ['subdps']],
  '夜兰': ['liyue', ['subdps']],
  '钟离': ['liyue', ['support']],
  '甘雨': ['liyue', ['maindps', 'subdps']],
  '胡桃': ['liyue', ['maindps']],
  '七七': ['liyue', ['support']],
  '申鹤': ['liyue', ['support']],
  '云堇': ['liyue', ['support']],
  '瑶瑶': ['liyue', ['support']],
  '白术': ['liyue', ['support']],
  '闲云': ['liyue', ['support', 'subdps']],
  '魈': ['liyue', ['maindps']],
  '嘉明': ['liyue', ['maindps']],
  '重云': ['liyue', ['subdps']],
  '辛焱': ['liyue', ['support']],
  '北斗': ['liyue', ['subdps']],
  '烟绯': ['liyue', ['maindps']],
  '兹白': ['liyue', ['maindps']],
  '蓝砚': ['liyue', ['support']],

  /* ---------- 稻妻 Inazuma（16） ---------- */
  '雷电将军': ['inazuma', ['maindps']],
  '八重神子': ['inazuma', ['subdps']],
  '神里绫华': ['inazuma', ['maindps']],
  '宵宫': ['inazuma', ['maindps']],
  '珊瑚宫心海': ['inazuma', ['support', 'maindps']],
  '荒泷一斗': ['inazuma', ['maindps']],
  '五郎': ['inazuma', ['support']],
  '九条裟罗': ['inazuma', ['support']],
  '枫原万叶': ['inazuma', ['support']],
  '托马': ['inazuma', ['support']],
  '早柚': ['inazuma', ['support']],
  '久岐忍': ['inazuma', ['support', 'subdps']],
  '神里绫人': ['inazuma', ['maindps']],
  '鹿野院平藏': ['inazuma', ['maindps']],
  '绮良良': ['inazuma', ['support']],
  '梦见月瑞希': ['inazuma', ['support']],

  /* ---------- 须弥 Sumeru（14） ---------- */
  '提纳里': ['sumeru', ['maindps']],
  '柯莱': ['sumeru', ['subdps']],
  '多莉': ['sumeru', ['support']],
  '纳西妲': ['sumeru', ['subdps', 'support']],
  '赛诺': ['sumeru', ['maindps']],
  '艾尔海森': ['sumeru', ['maindps']],
  '迪希雅': ['sumeru', ['subdps', 'support']],
  '卡维': ['sumeru', ['maindps', 'support']],
  '妮露': ['sumeru', ['support']],
  '坎蒂丝': ['sumeru', ['support']],
  '流浪者': ['sumeru', ['maindps']],
  '珐露珊': ['sumeru', ['support']],
  '莱依拉': ['sumeru', ['support']],
  '赛索斯': ['sumeru', ['maindps']],

  /* ---------- 枫丹 Fontaine（14） ---------- */
  '林尼': ['fontaine', ['maindps']],
  '琳妮特': ['fontaine', ['subdps', 'support']],
  '那维莱特': ['fontaine', ['maindps']],
  '莱欧斯利': ['fontaine', ['maindps']],
  '芙宁娜': ['fontaine', ['subdps', 'support']],
  '娜维娅': ['fontaine', ['maindps']],
  '克洛琳德': ['fontaine', ['maindps']],
  '夏沃蕾': ['fontaine', ['support']],
  '爱可菲': ['fontaine', ['support']],
  '艾梅莉埃': ['fontaine', ['subdps']],
  '菲米尼': ['fontaine', ['maindps']],
  '希格雯': ['fontaine', ['support']],
  '夏洛蒂': ['fontaine', ['support']],
  '千织': ['fontaine', ['subdps']],

  /* ---------- 纳塔 Natlan（11） ---------- */
  '玛拉妮': ['natlan', ['maindps']],
  '基尼奇': ['natlan', ['maindps']],
  '卡齐娜': ['natlan', ['subdps']],
  '希诺宁': ['natlan', ['support']],
  '恰斯卡': ['natlan', ['maindps']],
  '欧洛伦': ['natlan', ['subdps', 'support']],
  '玛薇卡': ['natlan', ['maindps', 'support']],
  '瓦雷莎': ['natlan', ['maindps']],
  '伊安珊': ['natlan', ['support']],
  '伊法': ['natlan', ['support']],
  '茜特菈莉': ['natlan', ['support']],

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

  /* ---------- 其他 / 旅行者（1 + 6 形态） ----------
   * 旅行者按「国度-属性」各设一个条目：每个形态都能单独启用、单独配装。 */
  '丝柯克': ['other', ['maindps']],
  '旅行者·风': ['other', ['support']],
  '旅行者·岩': ['other', ['subdps']],
  '旅行者·雷': ['other', ['support']],
  '旅行者·草': ['other', ['subdps']],
  '旅行者·水': ['other', ['subdps']],
  '旅行者·火': ['other', ['maindps']],
};

/* ============================================================
 * 内置角色库
 * 紧凑格式：[ 名称, 元素, 追加属性预设, builds, 沙, 杯, 冠, src ]
 *   builds: 数组，第 1 项为主推（4件套或2+2），其余为备选
 *           单项含 1 个套装名 = 4件套；含 2 个 = 2+2
 *   主要属性数组按优先级从高到低排列（第1项=最优）
 *   src: 攻略来源数组（不限定来源，米游社/Game8/KQM/B站等均可，取置信度高、更新新、不重复的链接）
 *        每项为 {url, title}；title 为「作者/标题」标注（选填，留空时按链接域名显示来源平台），可列多个
 *        旧版纯字符串链接会在加载时自动补成 {url, title:''}
 * ============================================================ */
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
  ['达达利亚', 'hydro', 'crit', [['沉沦之心'], ['水仙十字之圣遗物']], ['atkP'], ['hydro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/61217705', 'https://bbs.mihoyo.com/ys/article/31675253', 'https://bbs.mihoyo.com/ys/article/22237098']],
  ['珊瑚宫心海', 'hydro', 'hp', [['海染砗磲'], ['千岩牢固']], ['hpP', 'er'], ['hydro', 'hpP'], ['heal', 'hpP'], ['https://bbs.mihoyo.com/ys/article/9783187', 'https://bbs.mihoyo.com/ys/article/28670439', 'https://bbs.mihoyo.com/ys/article/9811643']],
  ['莫娜', 'hydro', 'er', [['绝缘之旗印'], ['昔日宗室之仪']], ['er', 'atkP'], ['hydro'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/71353241', 'https://www.miyoushe.com/ys/article/71293999', 'https://bbs.mihoyo.com/ys/article/22242956']],
  ['妮露', 'hydro', 'hp', [['乐园遗落之花'], ['千岩牢固', '乐园遗落之花']], ['hpP'], ['hpP'], ['hpP'], ['https://www.miyoushe.com/ys/article/37891114', 'https://bbs.mihoyo.com/ys/article/30319453', 'https://www.miyoushe.com/ys/article/68308954']],
  ['芙宁娜', 'hydro', 'critHp', [['黄金剧团'], ['沉沦之心']], ['hpP', 'er'], ['hydro', 'hpP'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/69835283', 'https://www.miyoushe.com/ys/article/54231026', 'https://www.miyoushe.com/ys/article/45238744']],
  ['那维莱特', 'hydro', 'critHp', [['水仙十字之圣遗物'], ['沉沦之心']], ['hpP', 'er'], ['hydro', 'hpP'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/72892872', 'https://www.miyoushe.com/ys/article/51019831', 'https://www.miyoushe.com/ys/article/43799619']],
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
  ['莱欧斯利', 'cryo', 'crit', [['水仙十字之圣遗物'], ['冰风迷途的勇士']], ['atkP'], ['cryo'], ['cr', 'cd'], ['https://www.miyoushe.com/ys/article/44583182', 'https://www.miyoushe.com/ys/article/62417764', 'https://www.miyoushe.com/ys/article/76302270']],
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

/* ---------- 工具：取主要属性名称 ---------- */
function mainStatName(slot, id) {
  if (id && typeof id === 'object') id = (id.stat != null ? id.stat : id.id);
  const list = MAIN_STATS[slot] || [];
  const hit = list.find(s => s.id === id);
  return hit ? hit.name : (typeof id === 'string' ? id : '');
}
function subStatName(id) {
  if (id && typeof id === 'object') id = (id.id != null ? id.id : id.stat);
  const hit = SUB_STATS.find(s => s.id === id);
  return hit ? hit.name : (typeof id === 'string' ? id : '');
}
