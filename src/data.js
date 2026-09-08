/* ============================================================
 * 原神圣遗物锁定方案生成器 —— 内置数据
 * 说明：内置配装整理自社区常见推荐思路，仅作为初始化参考。
 *      版本更迭后请在「角色配置」页自行增删改，所有改动保存在本地浏览器。
 * ============================================================ */

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
  { id: 'snezhnaya', name: '至冬 / 其他', color: '#9fb3c8' },
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

/* ---------- 主词条库 ---------- */
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

/* ---------- 副词条库 ---------- */
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

/* ---------- 副词条需求预设 ----------
 * 用【排序 + 必选 + 重要度算子】表达，不再使用数值权重：
 *   数组顺序 = 想要程度（越靠前越想要）
 *   第 2 项为 true = 「必选」，对应游戏内锁定方案的 ★必须
 *   每条 op 默认 '>'（比上一条更低），可理解成「逐级降权」；详见 app.js 的 opWeights
 * 例：crit → [暴击率(必选), 暴击伤害(必选), 攻击力%, 元素充能效率, 元素精通, 攻击力]
 */
const SUB_PRESETS = {
  crit:    [['cr', 1], ['cd', 1], ['atkP'], ['er'], ['em'], ['atk']],
  critHp:  [['cr', 1], ['cd', 1], ['hpP'], ['er'], ['em'], ['hp']],
  critDef: [['cr', 1], ['cd', 1], ['defP'], ['er'], ['def'], ['atkP']],
  em:      [['em', 1], ['er'], ['cr'], ['cd'], ['atkP']],
  hp:      [['hpP', 1], ['er'], ['cr'], ['cd'], ['hp'], ['em']],
  def:     [['defP', 1], ['cr'], ['cd'], ['er'], ['def']],
  er:      [['er', 1], ['cr'], ['cd'], ['hpP'], ['atkP'], ['em'], ['hp']],
  atk:     [['atkP', 1], ['cr'], ['cd'], ['er'], ['atk'], ['em']],
  heal:    [['hpP', 1], ['er'], ['hp'], ['atkP']],
};

/* 预设的中文名（供界面下拉使用） */
const SUB_PRESET_NAMES = {
  crit: '双暴输出', critHp: '双暴+生命', critDef: '双暴+防御',
  em: '精通流', hp: '生命流', def: '防御流',
  er: '充能辅助', atk: '攻击流', heal: '治疗辅助',
};

/* 把 [id, req] 简写展开成 [{ id, req, op }]；op 缺省 '>'（比上一条更低） */
function toSubs(list) {
  return (list || []).map(([id, req]) => ({ id, req: !!req, op: '>' }));
}

/* ============================================================
 * 角色元信息：国度 + 定位
 * 格式 '角色名': [ 国度, [定位...] ]
 * 定位第一个为主定位，用于卡片显示；批量筛选时任一命中即选中
 * ============================================================ */
const CH_META = {
  /* 蒙德 */
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
  '烟绯': ['mondstadt', ['maindps']],
  '塔利雅': ['mondstadt', ['support']],
  '米卡': ['mondstadt', ['support']],

  /* 璃月 */
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

  /* 稻妻 */
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
  '流浪者': ['inazuma', ['maindps']],
  '梦见月瑞希': ['inazuma', ['support']],
  '绮良良': ['inazuma', ['support']],
  '鹿野院平藏': ['inazuma', ['maindps']],

  /* 须弥 */
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

  /* 枫丹 */
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

  /* 纳塔 */
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

  /* 至冬 / 其他 */
  '达达利亚': ['snezhnaya', ['maindps']],
  '阿蕾奇诺': ['snezhnaya', ['maindps']],
  '丝柯克': ['snezhnaya', ['maindps']],

  /* 补遗：初始库遗漏的 2.x–4.x 老角色 */
  '安柏': ['mondstadt', ['support']],
  '丽莎': ['mondstadt', ['subdps']],
  '凯亚': ['mondstadt', ['subdps']],
  '埃洛伊': ['snezhnaya', ['maindps']],
  '北斗': ['liyue', ['subdps']],
  '神里绫人': ['liyue', ['maindps']],
  '千织': ['inazuma', ['subdps']],
  '珐露珊': ['sumeru', ['support']],
  '莱依拉': ['sumeru', ['support']],
  '赛索斯': ['sumeru', ['maindps']],
  '蓝砚': ['liyue', ['support']],
  '茜特菈莉': ['natlan', ['support']],

  /* 补遗：5.8 伊涅芙 + 6.0–7.0 挪德卡莱 / 至冬 */
  '伊涅芙': ['snezhnaya', ['subdps']],
  '菈乌玛': ['snezhnaya', ['support']],
  '菲林斯': ['snezhnaya', ['maindps']],
  '爱诺': ['snezhnaya', ['support']],
  '奈芙尔': ['snezhnaya', ['maindps']],
  '杜林': ['mondstadt', ['subdps']],
  '哥伦比娅': ['snezhnaya', ['support']],
  '兹白': ['liyue', ['maindps']],
  '依鲁加': ['snezhnaya', ['subdps']],
  '桑多涅': ['snezhnaya', ['maindps']],
  '奥黛塔': ['snezhnaya', ['support']],
  '阿罗夏': ['snezhnaya', ['support']],
  '法尔伽': ['mondstadt', ['maindps']],
};

/* ============================================================
 * 内置角色库
 * 紧凑格式：[ 名称, 元素, 副词条预设, builds, 沙, 杯, 冠 ]
 *   builds: 数组，第 1 项为主推（4件套或2+2），其余为备选
 *           单项含 1 个套装名 = 4件套；含 2 个 = 2+2
 *   主词条数组按优先级从高到低排列（第1项=最优）
 * ============================================================ */
const RAW_CHARS = [
  /* ---------- 火 ---------- */
  ['胡桃', 'pyro', 'critHp', [['炽烈的炎之魔女'], ['追忆之注连']], ['em', 'hpP'], ['pyro', 'hpP'], ['cr', 'cd']],
  ['迪卢克', 'pyro', 'crit', [['炽烈的炎之魔女'], ['追忆之注连']], ['atkP'], ['pyro'], ['cr', 'cd']],
  ['可莉', 'pyro', 'crit', [['炽烈的炎之魔女'], ['追忆之注连']], ['atkP'], ['pyro'], ['cr', 'cd']],
  ['宵宫', 'pyro', 'crit', [['追忆之注连'], ['来歆余响'], ['炽烈的炎之魔女']], ['atkP'], ['pyro'], ['cr', 'cd']],
  ['林尼', 'pyro', 'crit', [['辰砂往生录'], ['来歆余响']], ['atkP'], ['pyro'], ['cr', 'cd']],
  ['香菱', 'pyro', 'crit', [['绝缘之旗印'], ['炽烈的炎之魔女']], ['er', 'atkP', 'em'], ['pyro'], ['cr', 'cd']],
  ['班尼特', 'pyro', 'heal', [['昔日宗室之仪'], ['被怜爱的少女']], ['er', 'hpP'], ['hpP'], ['hpP', 'heal']],
  ['玛薇卡', 'pyro', 'crit', [['黑曜秘典'], ['炽烈的炎之魔女']], ['atkP'], ['pyro'], ['cr', 'cd']],
  ['阿蕾奇诺', 'pyro', 'crit', [['谐律异想断章'], ['炽烈的炎之魔女']], ['atkP'], ['pyro'], ['cr', 'cd']],
  ['托马', 'pyro', 'hp', [['千岩牢固'], ['绝缘之旗印']], ['hpP', 'er'], ['hpP'], ['hpP']],
  ['烟绯', 'pyro', 'crit', [['炽烈的炎之魔女'], ['追忆之注连']], ['atkP'], ['pyro'], ['cr', 'cd']],
  ['迪希雅', 'pyro', 'hp', [['千岩牢固'], ['烬城勇者绘卷']], ['hpP'], ['pyro', 'hpP'], ['cr', 'cd', 'hpP']],
  ['嘉明', 'pyro', 'crit', [['炽烈的炎之魔女'], ['追忆之注连']], ['atkP'], ['pyro'], ['cr', 'cd']],
  ['辛焱', 'pyro', 'def', [['千岩牢固'], ['逆飞的流星']], ['defP'], ['phys', 'defP'], ['cr', 'defP']],

  /* ---------- 水 ---------- */
  ['行秋', 'hydro', 'crit', [['绝缘之旗印'], ['沉沦之心']], ['atkP', 'er'], ['hydro'], ['cr', 'cd']],
  ['夜兰', 'hydro', 'critHp', [['绝缘之旗印'], ['沉沦之心'], ['千岩牢固']], ['hpP'], ['hydro'], ['cr', 'cd']],
  ['达达利亚', 'hydro', 'crit', [['沉沦之心'], ['水仙十字之圣遗物']], ['atkP'], ['hydro'], ['cr', 'cd']],
  ['珊瑚宫心海', 'hydro', 'hp', [['海染砗磲'], ['千岩牢固']], ['hpP', 'er'], ['hydro', 'hpP'], ['heal', 'hpP']],
  ['莫娜', 'hydro', 'er', [['绝缘之旗印'], ['昔日宗室之仪']], ['er', 'atkP'], ['hydro'], ['cr', 'cd']],
  ['妮露', 'hydro', 'hp', [['乐园遗落之花'], ['千岩牢固', '乐园遗落之花']], ['hpP'], ['hpP'], ['hpP']],
  ['芙宁娜', 'hydro', 'critHp', [['黄金剧团'], ['沉沦之心']], ['hpP', 'er'], ['hydro', 'hpP'], ['cr', 'cd']],
  ['那维莱特', 'hydro', 'critHp', [['水仙十字之圣遗物'], ['沉沦之心']], ['hpP', 'er'], ['hydro', 'hpP'], ['cr', 'cd']],
  ['芭芭拉', 'hydro', 'heal', [['被怜爱的少女'], ['海染砗磲']], ['hpP'], ['hpP'], ['heal']],
  ['玛拉妮', 'hydro', 'critHp', [['黑曜秘典'], ['沉沦之心']], ['hpP'], ['hydro'], ['cr', 'cd']],
  ['梦见月瑞希', 'anemo', 'em', [['翠绿之影'], ['饰金之梦', '流浪大地的乐团']], ['em', 'er'], ['em'], ['em']],
  ['塔利雅', 'hydro', 'atk', [['昔日宗室之仪'], ['绝缘之旗印']], ['atkP', 'er'], ['hydro', 'atkP'], ['cr', 'cd']],
  ['希格雯', 'hydro', 'heal', [['昔时之歌'], ['海染砗磲']], ['hpP', 'er'], ['hpP'], ['heal', 'hpP']],
  ['坎蒂丝', 'hydro', 'hp', [['千岩牢固'], ['绝缘之旗印']], ['hpP', 'er'], ['hpP'], ['hpP']],

  /* ---------- 冰 ---------- */
  ['甘雨', 'cryo', 'crit', [['冰风迷途的勇士'], ['流浪大地的乐团']], ['atkP'], ['cryo'], ['cd', 'cr']],
  ['神里绫华', 'cryo', 'crit', [['冰风迷途的勇士'], ['沉沦之心']], ['atkP'], ['cryo'], ['cr', 'cd']],
  ['优菈', 'cryo', 'crit', [['苍白之火'], ['苍白之火', '染血的骑士道']], ['atkP'], ['phys'], ['cr', 'cd']],
  ['申鹤', 'cryo', 'atk', [['千岩牢固'], ['冰风迷途的勇士', '追忆之注连']], ['atkP'], ['atkP'], ['atkP']],
  ['莱欧斯利', 'cryo', 'crit', [['水仙十字之圣遗物'], ['冰风迷途的勇士']], ['atkP'], ['cryo'], ['cr', 'cd']],
  ['迪奥娜', 'cryo', 'hp', [['千岩牢固'], ['被怜爱的少女']], ['hpP', 'er'], ['hpP'], ['hpP', 'heal']],
  ['罗莎莉亚', 'cryo', 'crit', [['冰风迷途的勇士'], ['苍白之火']], ['atkP'], ['cryo'], ['cr', 'cd']],
  ['七七', 'cryo', 'heal', [['被怜爱的少女'], ['千岩牢固']], ['atkP', 'er'], ['atkP'], ['heal']],
  ['爱可菲', 'cryo', 'atk', [['黄金剧团'], ['冰风迷途的勇士']], ['atkP'], ['cryo', 'atkP'], ['cr', 'cd']],
  ['丝柯克', 'cryo', 'crit', [['深廊终曲'], ['冰风迷途的勇士']], ['atkP'], ['cryo'], ['cr', 'cd']],
  ['夏沃蕾', 'pyro', 'hp', [['昔日宗室之仪'], ['昔时之歌'], ['烬城勇者绘卷']], ['hpP', 'er'], ['hpP'], ['hpP', 'heal']],
  ['重云', 'cryo', 'crit', [['冰风迷途的勇士'], ['昔日宗室之仪']], ['atkP'], ['cryo'], ['cr', 'cd']],
  ['菲米尼', 'cryo', 'crit', [['冰风迷途的勇士'], ['苍白之火']], ['atkP'], ['cryo', 'phys'], ['cr', 'cd']],
  ['夏洛蒂', 'cryo', 'heal', [['千岩牢固'], ['被怜爱的少女']], ['atkP', 'er'], ['atkP'], ['heal', 'atkP']],
  ['米卡', 'cryo', 'heal', [['千岩牢固'], ['被怜爱的少女']], ['atkP', 'er'], ['atkP'], ['heal', 'atkP']],

  /* ---------- 雷 ---------- */
  ['雷电将军', 'electro', 'crit', [['绝缘之旗印']], ['er', 'atkP'], ['electro', 'atkP'], ['cr', 'cd']],
  ['八重神子', 'electro', 'crit', [['饰金之梦'], ['如雷的盛怒']], ['atkP'], ['electro'], ['cr', 'cd']],
  ['菲谢尔', 'electro', 'crit', [['如雷的盛怒'], ['饰金之梦'], ['绝缘之旗印']], ['atkP'], ['electro'], ['cr', 'cd']],
  ['刻晴', 'electro', 'crit', [['如雷的盛怒'], ['饰金之梦']], ['atkP'], ['electro'], ['cd', 'cr']],
  ['赛诺', 'electro', 'em', [['饰金之梦'], ['如雷的盛怒']], ['em', 'atkP'], ['electro'], ['cr', 'cd']],
  ['久岐忍', 'electro', 'em', [['饰金之梦'], ['乐园遗落之花']], ['em'], ['em'], ['em']],
  ['九条裟罗', 'electro', 'atk', [['昔日宗室之仪'], ['绝缘之旗印']], ['er', 'atkP'], ['electro', 'atkP'], ['cr', 'cd']],
  ['雷泽', 'electro', 'crit', [['苍白之火'], ['平息鸣雷的尊者']], ['atkP'], ['phys'], ['cr', 'cd']],
  ['克洛琳德', 'electro', 'crit', [['谐律异想断章'], ['如雷的盛怒']], ['atkP'], ['electro'], ['cr', 'cd']],
  ['瓦雷莎', 'electro', 'crit', [['黑曜秘典'], ['长夜之誓']], ['atkP'], ['electro'], ['cr', 'cd']],
  ['伊安珊', 'electro', 'atk', [['烬城勇者绘卷'], ['昔日宗室之仪']], ['atkP', 'er'], ['electro', 'atkP'], ['cr', 'cd']],
  ['欧洛伦', 'electro', 'atk', [['烬城勇者绘卷'], ['绝缘之旗印']], ['atkP', 'er'], ['electro'], ['cr', 'cd']],
  ['多莉', 'electro', 'hp', [['千岩牢固'], ['被怜爱的少女']], ['hpP', 'er'], ['hpP'], ['heal', 'hpP']],

  /* ---------- 风 ---------- */
  ['枫原万叶', 'anemo', 'em', [['翠绿之影']], ['em'], ['em'], ['em']],
  ['温迪', 'anemo', 'em', [['翠绿之影']], ['em', 'atkP'], ['anemo', 'em'], ['em', 'cr']],
  ['砂糖', 'anemo', 'em', [['翠绿之影']], ['em'], ['em'], ['em']],
  ['琴', 'anemo', 'atk', [['翠绿之影'], ['被怜爱的少女']], ['atkP', 'er'], ['anemo', 'atkP'], ['atkP', 'heal']],
  ['魈', 'anemo', 'crit', [['辰砂往生录'], ['翠绿之影', '追忆之注连']], ['atkP'], ['anemo'], ['cr', 'cd']],
  ['鹿野院平藏', 'anemo', 'em', [['翠绿之影']], ['em', 'atkP'], ['anemo', 'em'], ['em', 'cr']],
  ['早柚', 'anemo', 'em', [['翠绿之影']], ['em', 'er'], ['em'], ['em', 'heal']],
  ['流浪者', 'anemo', 'crit', [['沙上楼阁史话'], ['翠绿之影']], ['atkP'], ['anemo'], ['cr', 'cd']],
  ['闲云', 'anemo', 'atk', [['昔时之歌'], ['翠绿之影']], ['atkP', 'er'], ['atkP'], ['atkP']],
  ['恰斯卡', 'anemo', 'crit', [['黑曜秘典'], ['翠绿之影']], ['atkP'], ['anemo'], ['cr', 'cd']],
  ['琳妮特', 'anemo', 'crit', [['翠绿之影'], ['沙上楼阁史话']], ['atkP'], ['anemo'], ['cr', 'cd']],
  ['伊法', 'anemo', 'em', [['翠绿之影'], ['烬城勇者绘卷']], ['em', 'atkP'], ['anemo', 'em'], ['em', 'cr']],

  /* ---------- 岩 ---------- */
  ['钟离', 'geo', 'hp', [['千岩牢固'], ['悠古的磐岩']], ['hpP'], ['geo', 'hpP'], ['hpP', 'cr']],
  ['阿贝多', 'geo', 'def', [['华馆梦醒形骸记'], ['悠古的磐岩']], ['defP'], ['geo', 'defP'], ['cr', 'cd', 'defP']],
  ['荒泷一斗', 'geo', 'def', [['华馆梦醒形骸记']], ['defP'], ['geo'], ['cr', 'cd']],
  ['诺艾尔', 'geo', 'def', [['华馆梦醒形骸记'], ['逆飞的流星']], ['defP'], ['geo'], ['cr', 'cd']],
  ['五郎', 'geo', 'def', [['华馆梦醒形骸记'], ['千岩牢固']], ['defP', 'er'], ['defP'], ['defP', 'cr']],
  ['凝光', 'geo', 'crit', [['悠古的磐岩'], ['追忆之注连']], ['atkP'], ['geo'], ['cr', 'cd']],
  ['娜维娅', 'geo', 'crit', [['回声之林夜话'], ['逆飞的流星']], ['atkP'], ['geo'], ['cr', 'cd']],
  ['希诺宁', 'geo', 'def', [['烬城勇者绘卷'], ['华馆梦醒形骸记']], ['defP'], ['defP'], ['defP', 'heal']],
  ['卡齐娜', 'geo', 'def', [['烬城勇者绘卷'], ['华馆梦醒形骸记']], ['defP'], ['geo', 'defP'], ['cr', 'cd']],
  ['云堇', 'geo', 'def', [['华馆梦醒形骸记'], ['千岩牢固']], ['defP', 'er'], ['defP'], ['defP']],

  /* ---------- 草 ---------- */
  ['纳西妲', 'dendro', 'em', [['深林的记忆'], ['饰金之梦']], ['em'], ['dendro', 'em'], ['em', 'cr']],
  ['艾尔海森', 'dendro', 'em', [['饰金之梦'], ['深林的记忆']], ['em', 'atkP'], ['dendro'], ['cr', 'cd']],
  ['提纳里', 'dendro', 'em', [['深林的记忆'], ['流浪大地的乐团']], ['em', 'atkP'], ['dendro'], ['cr', 'cd']],
  ['基尼奇', 'dendro', 'crit', [['黑曜秘典'], ['深林的记忆', '追忆之注连']], ['atkP'], ['dendro'], ['cr', 'cd']],
  ['艾梅莉埃', 'dendro', 'atk', [['未竟的遐思'], ['深林的记忆', '追忆之注连']], ['atkP'], ['dendro'], ['cr', 'cd']],
  ['白术', 'dendro', 'hp', [['千岩牢固'], ['深林的记忆']], ['hpP', 'er'], ['hpP'], ['hpP']],
  ['瑶瑶', 'dendro', 'hp', [['千岩牢固'], ['深林的记忆']], ['hpP', 'er'], ['hpP'], ['heal', 'hpP']],
  ['柯莱', 'dendro', 'er', [['深林的记忆'], ['绝缘之旗印']], ['er'], ['dendro'], ['cr', 'cd']],
  ['卡维', 'dendro', 'em', [['饰金之梦'], ['深林的记忆']], ['em', 'er'], ['em'], ['em']],
  ['绮良良', 'dendro', 'hp', [['千岩牢固'], ['深林的记忆']], ['hpP'], ['hpP'], ['hpP']],

  /* ---------- 补遗：2.x–4.x 老角色（初始库未收录） ---------- */
  ['安柏', 'pyro', 'crit', [['炽烈的炎之魔女'], ['炽烈的炎之魔女', '流浪大地的乐团']], ['atkP'], ['pyro'], ['cr']],
  ['丽莎', 'electro', 'crit', [['如雷的盛怒'], ['如雷的盛怒', '饰金之梦']], ['atkP'], ['electro'], ['cr']],
  ['凯亚', 'cryo', 'crit', [['冰风迷途的勇士'], ['冰风迷途的勇士', '苍白之火']], ['atkP'], ['cryo'], ['cr']],
  ['北斗', 'electro', 'crit', [['如雷的盛怒'], ['如雷的盛怒', '绝缘之旗印']], ['atkP'], ['electro'], ['cr']],
  ['埃洛伊', 'cryo', 'crit', [['冰风迷途的勇士'], ['冰风迷途的勇士', '苍白之火']], ['atkP'], ['cryo'], ['cr']],
  ['神里绫人', 'hydro', 'crit', [['沉沦之心'], ['沉沦之心', '来歆余响']], ['atkP'], ['hydro'], ['cr']],
  ['千织', 'geo', 'critDef', [['黄金剧团'], ['黄金剧团', '悠古的磐岩']], ['defP'], ['geo'], ['cr']],
  ['珐露珊', 'anemo', 'er', [['翠绿之影'], ['翠绿之影', '绝缘之旗印']], ['er'], ['anemo'], ['cr']],
  ['莱依拉', 'cryo', 'hp', [['千岩牢固'], ['千岩牢固', '昔日宗室之仪']], ['hpP'], ['hpP'], ['heal']],
  ['赛索斯', 'electro', 'crit', [['来歆余响'], ['来歆余响', '如雷的盛怒']], ['atkP'], ['electro'], ['cr']],
  ['蓝砚', 'anemo', 'er', [['翠绿之影'], ['翠绿之影', '千岩牢固']], ['er'], ['anemo'], ['heal']],
  ['茜特菈莉', 'cryo', 'em', [['烬城勇者绘卷'], ['乐园遗落之花', '饰金之梦']], ['em', 'er'], ['em'], ['em']],

  /* ---------- 补遗：5.8 伊涅芙 + 6.0–6.5 挪德卡莱 ---------- */
  ['伊涅芙', 'electro', 'crit', [['穹境示现之夜'], ['如雷的盛怒', '饰金之梦']], ['atkP'], ['atkP'], ['cr']],
  ['菈乌玛', 'dendro', 'em', [['纺月的夜歌'], ['深林的记忆', '饰金之梦']], ['em'], ['em'], ['em']],
  ['菲林斯', 'electro', 'crit', [['穹境示现之夜'], ['饰金之梦', '如雷的盛怒']], ['atkP'], ['electro'], ['cr']],
  ['爱诺', 'hydro', 'er', [['纺月的夜歌'], ['昔日宗室之仪', '千岩牢固']], ['er'], ['hpP'], ['heal']],
  ['奈芙尔', 'dendro', 'em', [['穹境示现之夜'], ['深林的记忆', '饰金之梦']], ['em'], ['em'], ['cr']],
  ['杜林', 'pyro', 'crit', [['风起之日'], ['昔日宗室之仪', '辰砂往生录']], ['atkP'], ['pyro'], ['cr']],
  ['哥伦比娅', 'hydro', 'hp', [['晨星与月的晓歌'], ['千岩牢固', '昔日宗室之仪']], ['hpP', 'er'], ['hpP'], ['cr']],
  ['兹白', 'geo', 'critDef', [['穹境示现之夜'], ['华馆梦醒形骸记', '悠古的磐岩']], ['defP'], ['defP'], ['cr']],
  ['依鲁加', 'geo', 'em', [['饰金之梦'], ['饰金之梦', '流浪大地的乐团']], ['em'], ['em'], ['em']],

  /* ---------- 补遗：6.6–7.0（新版本，配装可能随环境微调） ---------- */
  ['桑多涅', 'cryo', 'crit', [['影中沉凝的幻灭'], ['苍白之火', '染血的骑士道']], ['atkP'], ['atkP'], ['cr']],
  ['奥黛塔', 'cryo', 'crit', [['炉火融炼之心'], ['昔日宗室之仪', '辰砂往生录']], ['atkP'], ['atkP'], ['cr']],
  ['阿罗夏', 'electro', 'er', [['昔日宗室之仪'], ['昔日宗室之仪', '辰砂往生录']], ['er'], ['atkP'], ['cr']],
  ['法尔伽', 'anemo', 'crit', [['风起之日'], ['沙上楼阁史话', '辰砂往生录']], ['atkP'], ['anemo'], ['cr']],
];

/* ---------- 展开为完整结构 ---------- */
/* 生成一份「主词条 + 副词条」需求（按配装组独立） */
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

function buildDefaultCharacters() {
  return RAW_CHARS.map(([name, element, subPreset, builds, sands, goblet, circlet], i) => {
    const meta = CH_META[name] || ['snezhnaya', ['maindps']];
    const need = makeStatNeeds(sands, goblet, circlet, subPreset);
    return {
    id: 'c' + i + '_' + name,
    name,
    element,
    region: meta[0],
    roles: meta[1].slice(),
    enabled: false,
    note: '',
    custom: false,
    // 主 / 副词条需求按【配装组】区分：一组配装 = 一套词条需求
    builds: builds.map((sets, idx) => Object.assign({
      sets,
      priority: idx === 0 ? 'main' : 'alt',
    }, JSON.parse(JSON.stringify(need)))),
  };});
}

/* ---------- 工具：取主词条名称 ---------- */
function mainStatName(slot, id) {
  const list = MAIN_STATS[slot] || [];
  const hit = list.find(s => s.id === id);
  return hit ? hit.name : id;
}
function subStatName(id) {
  const hit = SUB_STATS.find(s => s.id === id);
  return hit ? hit.name : id;
}
