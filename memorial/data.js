/* ============================================================
   STRIKERS · 队史馆 —— 数据层（单一数据源）
   ------------------------------------------------------------
   · 原型只读本文件即可渲染全部页面，无构建、无依赖
   · 文件末尾的 validate() 同时给浏览器自检页和 node check.js 使用
   · 演示数据：队史内容为虚构示例，上线前替换为真实素材
   ============================================================ */

const TEAM = {
  en: 'STRIKERS',
  founded: '2016.09.18',
  years: [2016, 2026],
  city: '城南',
  motto: '一支球队的历史，是所有人一起写的。',
  intro: '十年，128 场正式比赛，86 个人穿过这件球衣。这里收着照片、编年史，和那些没写下来的话。'
};

const STATS = [
  { v: 10, u: '年', l: '建队至今' },
  { v: 128, u: '场', l: '正式比赛' },
  { v: 86, u: '人', l: '穿过这件球衣' },
  { v: 3, u: '冠', l: '城市碗' }
];

const QUOTE = {
  text: '十年里我们换了三块场地、四套队服、六个教练，但每次开球前围成一圈，喊的还是同一句话。',
  by: '陈志远',
  role: '首任队长 · 2016–2019',
  person: 'p27'
};

/* 事件类型 → 中文标签 */
const KINDS = {
  founding: '建队',
  first: '第一次',
  trophy: '冠军',
  grad: '毕业',
  void: '停摆',
  rebuild: '重建',
  home: '回家'
};

/* 位置中文名 */
const POS_CN = { QB: '四分卫', RB: '跑卫', WR: '外接手', TE: '近端锋', OL: '进攻锋线', DL: '防守锋线', LB: '线卫', CB: '角卫', S: '安全卫', K: '踢球手', P: '弃踢手' };

/* ---------- 编年史 ---------- */
const EVENTS = [
  { id: 'e01', year: 2016, date: '2016.09.18', kind: 'founding', title: '七个人，一颗球，一场雨', summary: '城南体育公园的塑胶跑道上，七个刚认识的人用手机查着规则开始摆阵。那天没有人知道这支队能活过第一个冬天。', photos: ['ph01'], people: ['p27', 'p02', 'p01', 'p29'], story: 's01' },
  { id: 'e02', year: 2016, date: '2016.10.05', kind: 'first', title: '第一堂正式训练', summary: '借来的护具、二手头盔、一双不合脚的钉鞋。第一次完整跑完一套进攻战术，用了四十分钟。', photos: [], people: ['p27', 'p02', 'p40'] },
  { id: 'e03', year: 2016, date: '2016.11.20', kind: 'first', title: '第一场比赛，0 : 35', summary: '对手是已经打了三年的老队。我们在第四节才第一次推进过中场。赛后合影时所有人都笑得很开心——那是对橄榄球最初的、也是最干净的热爱。', photos: ['ph02'], people: ['p02', 'p03', 'p29', 'p40'], story: 's02' },
  { id: 'e04', year: 2017, date: '2017.05.14', kind: 'first', title: '首胜 21 : 14', summary: '第七场正式比赛，第一个胜场。终场哨响时，替补席上所有人都冲进了场。', photos: ['ph03'], people: ['p03', 'p28', 'p30'] },
  { id: 'e05', year: 2017, date: '2017.09.02', kind: 'first', title: '第一次客场远征', summary: '六小时大巴，三十个人，一箱水。车窗外是没见过的城市，车厢里是跑调的队歌。', photos: ['ph04'], people: ['p28', 'p31'] },
  { id: 'e06', year: 2018, date: '2018.06.10', kind: 'first', title: '第一次进季后赛', summary: '常规赛 6 胜 2 负。季后赛首轮出局，但那一年我们第一次觉得，这支队是能赢的。', photos: ['ph05'], people: ['p04', 'p16', 'p32'] },
  { id: 'e07', year: 2019, date: '2019.06.23', kind: 'trophy', title: '城市碗 · 第一座冠军', summary: '决赛 28 : 17。第四节最后两分钟，防守组在自家端区前连挡四次。终场哨响，有人跪在草皮上哭了。', photos: ['ph06', 'ph07'], people: ['p27', 'p03', 'p02', 'p34'], story: 's03' },
  { id: 'e08', year: 2019, date: '2019.07.01', kind: 'grad', title: '第一批队员毕业', summary: '建队七人里有四个在那年夏天离开。他们把球衣叠好放进纸箱，说：以后还会回来。', photos: ['ph08'], people: ['p27', 'p29', 'p31'] },
  { id: 'e09', year: 2020, date: '2020.03.15', kind: 'void', title: '停摆的一年', summary: '没有比赛，没有合练。我们在群里发训练视频，在各自家里的地板上做核心。那一年唯一的「比赛」，是队内的线上战术课。', photos: ['ph09'], people: ['p17', 'p33'] },
  { id: 'e10', year: 2021, date: '2021.09.11', kind: 'rebuild', title: '重建：十二张新面孔', summary: '老队员走了大半，新来了十二个新人。第一次合练，教练说：从零开始，这次我们要把基础打牢。', photos: ['ph10'], people: ['p13', 'p23', 'p26'] },
  { id: 'e11', year: 2022, date: '2022.05.28', kind: 'first', title: '客场首胜', summary: '客场 24 : 21，最后 9 秒的任意球。那一年我们开始相信，客场也能赢。', photos: ['ph11'], people: ['p20', 'p12', 'p19'] },
  { id: 'e12', year: 2023, date: '2023.06.18', kind: 'trophy', title: '城市碗 · 第二座冠军', summary: '31 : 24，加时。第一次在决赛里赢下加时赛。', photos: ['ph12'], people: ['p11', 'p08', 'p15', 'p36'] },
  { id: 'e13', year: 2024, date: '2024.07.06', kind: 'trophy', title: '卫冕：第三座冠军', summary: '35 : 21，常规赛 8 胜 0 负，决赛全场领先。三座奖杯，用了八年。', photos: ['ph13'], people: ['p02', 'p11', 'p21', 'p35'], story: 's03' },
  { id: 'e14', year: 2024, date: '2024.07.07', kind: 'grad', title: '毕业墙 +8', summary: '又一批人走了。我们把他们的号码和照片钉在更衣室的墙上，从那天起，那面墙有了名字。', photos: ['ph14'], people: ['p35', 'p36', 'p39'] },
  { id: 'e15', year: 2025, date: '2025.04.19', kind: 'home', title: '校友队成立', summary: '十二个已经毕业的老队员组了一支「影子队」，每年回来打一场。', photos: ['ph15'], people: ['p28', 'p32', 'p38'] },
  { id: 'e16', year: 2025, date: '2025.10.12', kind: 'home', title: '老队长回来了', summary: '陈志远回队做进攻协调员。他说：我不是回来执教的，我是回来还债的。', photos: ['ph16'], people: ['p27', 'p17'] },
  { id: 'e17', year: 2026, date: '2026.04.11', kind: 'home', title: '十周年回家赛', summary: '现役队 vs 校友队，38 : 31。比分不重要，重要的是四十多个人在同一块草皮上，穿同一件球衣。', photos: ['ph17'], people: ['p01', 'p27', 'p28', 'p24'] },
  { id: 'e18', year: 2026, date: '2026.09.18', kind: 'home', title: '十年 · 队史馆上线', summary: '86 个人、128 场比赛、3 座奖杯，和数不清的雨夜。这个馆是给所有穿过这件球衣的人建的。', photos: ['ph18'], people: ['p01'], story: 's04' }
];

/* ---------- 照片 ----------
   kind 决定占位图场景；ratio 是展示比例；people 是照片里的人（反查个人页） */
const PHOTOS = [
  { id: 'ph01', title: '建队之夜', year: 2016, date: '2016.09.18', place: '城南体育公园 · 3 号场', kind: 'field', ratio: '4/5', caption: '七个人，一盏路灯，一颗球。照片是路过的人帮忙拍的，糊了，但我们只有这一张。', people: ['p27', 'p02', 'p01', 'p29'] },
  { id: 'ph02', title: '第一场雨战', year: 2016, date: '2016.11.20', place: '城西体育中心', kind: 'mud', ratio: '4/3', caption: '0 : 35。泥水灌进球鞋，跑不动，但没有人要求下场。', people: ['p02', 'p03', 'p29'] },
  { id: 'ph03', title: '首胜更衣室', year: 2017, date: '2017.05.14', place: '主场更衣室', kind: 'celebration', ratio: '1/1', caption: '21 : 14。第一次在更衣室里把水泼到教练身上。', people: ['p03', 'p28', 'p30'] },
  { id: 'ph04', title: '第一次远征', year: 2017, date: '2017.09.02', place: '高速服务区', kind: 'bus', ratio: '4/3', caption: '六小时车程，三十个人，一箱水。有人在最后一排睡了一路。', people: ['p28', 'p31'] },
  { id: 'ph05', title: '季后赛首轮', year: 2018, date: '2018.06.10', place: '城南体育公园', kind: 'field', ratio: '4/5', caption: '输了。但那一年我们第一次觉得，这支队是能赢的。', people: ['p04', 'p16', 'p32'] },
  { id: 'ph06', title: '冠军之夜', year: 2019, date: '2019.06.23', place: '城市碗决赛场地', kind: 'trophy', ratio: '4/5', caption: '28 : 17。奖杯很沉，比想象中沉。', people: ['p27', 'p03', 'p02', 'p34'] },
  { id: 'ph07', title: '奖杯与草皮', year: 2019, date: '2019.06.23', place: '城市碗决赛场地', kind: 'trophy', ratio: '1/1', caption: '有人把奖杯放在草皮上，跪下来拍了这张。', people: ['p03', 'p02'] },
  { id: 'ph08', title: '第一批毕业', year: 2019, date: '2019.07.01', place: '主场更衣室', kind: 'locker', ratio: '4/3', caption: '四个人的储物柜空了。球衣叠好，放在纸箱最上面。', people: ['p27', 'p29', 'p31'] },
  { id: 'ph09', title: '空场', year: 2020, date: '2020.03.15', place: '城南体育公园', kind: 'empty', ratio: '4/5', caption: '没有观众，没有哨声。那一年最常听到的声音，是钉鞋踩在跑道上的回声。', people: [] },
  { id: 'ph10', title: '十二张新面孔', year: 2021, date: '2021.09.11', place: '城南体育公园', kind: 'team', ratio: '4/3', caption: '第一堂合练，所有人先学了怎么正确戴头盔。', people: ['p13', 'p23', 'p26', 'p07'] },
  { id: 'ph11', title: '客场九秒', year: 2022, date: '2022.05.28', place: '城西体育中心', kind: 'field', ratio: '4/5', caption: '最后九秒的任意球。进球之后，替补席安静了两秒才反应过来。', people: ['p20', 'p12', 'p19'] },
  { id: 'ph12', title: '第二座冠军', year: 2023, date: '2023.06.18', place: '城市碗决赛场地', kind: 'trophy', ratio: '1/1', caption: '加时。31 : 24。这是我第一次在决赛里看到有人抽筋。', people: ['p11', 'p08', 'p15'] },
  { id: 'ph13', title: '卫冕', year: 2024, date: '2024.07.06', place: '城市碗决赛场地', kind: 'trophy', ratio: '4/3', caption: '35 : 21。全场领先，一次也没落后。', people: ['p02', 'p11', 'p21'] },
  { id: 'ph14', title: '毕业墙', year: 2024, date: '2024.07.07', place: '主场更衣室', kind: 'locker', ratio: '4/5', caption: '八件球衣挂在墙上。从那天起，那面墙有了名字。', people: ['p35', 'p36', 'p39'] },
  { id: 'ph15', title: '校友赛', year: 2025, date: '2025.04.19', place: '城南体育公园', kind: 'team', ratio: '1/1', caption: '毕业的人穿回了自己的号码。有两个人的球衣已经穿不下了。', people: ['p28', 'p32', 'p38'] },
  { id: 'ph16', title: '老队长', year: 2025, date: '2025.10.12', place: '训练场', kind: 'portrait', ratio: '4/5', caption: '陈志远，首任队长，2019 年毕业，2025 年回来做进攻协调员。', people: ['p27'] },
  { id: 'ph17', title: '回家赛', year: 2026, date: '2026.04.11', place: '城南体育公园', kind: 'team', ratio: '4/3', caption: '38 : 31。四十多个人，同一块草皮，同一件球衣。', people: ['p01', 'p27', 'p28', 'p24'] },
  { id: 'ph18', title: '十年', year: 2026, date: '2026.09.18', place: '队史馆开馆日', kind: 'ring', ratio: '1/1', caption: '86 个名字。有些名字后面没有照片，只有一行在队年份。', people: ['p01'] }
];

/* ---------- 长文 ---------- */
const STORIES = [
  {
    id: 's01', year: 2016, date: '2016.09.18', author: '陈志远', person: 'p27',
    title: '2016 年 9 月 18 日，那天下着雨',
    lead: '十年后我才明白，一支球队不是从第一场比赛开始的，是从一条群消息开始的。',
    photos: ['ph01'],
    paras: [
      '我们第一次见面是在学校西门。七个人，一个橄榄球，网上买的，还没充气。有人从宿舍拎了个打气筒下来，打了十分钟，球太硬了，后来才知道只要打到 9 PSI。',
      '没有人真的会打。手机里放着规则视频，边看边在跑道上摆。有人问：这球怎么开球？我们查了四十分钟。',
      '那天下了雨。塑胶跑道很滑，第一组折返跑就有人摔了，膝盖蹭破一大块。我们笑到跑不动，最后坐在看台底下躲雨，把剩下的时间用来给位置起中文名。',
      '回家的路上我给他们发了一条消息：下周三，同一时间。没有一个人说不。',
      '十年后我才明白，一支球队不是从第一场比赛开始的，是从那条消息开始的。'
    ]
  },
  {
    id: 's02', year: 2016, date: '2016.11.25', author: '李强', person: 'p02',
    title: '0 : 35',
    lead: '那场比赛我们输了三十五分，却是我打得最快乐的一场球。',
    photos: ['ph02'],
    paras: [
      '比分是 0 比 35。第四节我们才第一次推进过中场，全场只有三次第一档推进成功。',
      '护具是借的，头盔有四个尺码都不对。我戴着的那顶，面罩是歪的，看出去总有一道影子。',
      '中场休息时教练只说了一句话：今天没有人会怪你们，因为对面已经打了三年。',
      '最后一分钟，对方换上了替补。我们那一年唯一一次在对方半场完成四档防守，就是在那分钟。',
      '比赛结束后我们在场地中央拍了照。所有人都在笑，笑得很真。我知道那不是输球的笑，是「原来这就是比赛」的笑。'
    ]
  },
  {
    id: 's03', year: 2024, date: '2024.07.10', author: '王磊', person: 'p03',
    title: '三座奖杯之间，隔着两千个傍晚',
    lead: '奖杯不值钱。值钱的是奖杯之间那些傍晚。',
    photos: ['ph06'],
    paras: [
      '2019 年第一次拿冠军，我们在更衣室把水泼在教练身上，然后有人哭了，接着所有人都在哭。',
      '2023 年拿第二座，决赛打到加时。终场哨响时我第一反应是看时间——两年零十一个月。那两年里我们有过一个赛季只赢一场。',
      '2024 年卫冕，常规赛 8 胜 0 负。领奖台上很吵，我却在想 2016 年那块积水的跑道，和那七个连开球都不会的人。',
      '三座奖杯不值钱，值钱的是三座奖杯之间那些傍晚：九点的场地，十点半的泡面，和每次训练结束后的那句「明天见」。'
    ]
  },
  {
    id: 's04', year: 2026, date: '2026.09.18', author: '张伟', person: 'p01',
    title: '十年之后，我还认得那件球衣',
    lead: '86 个人。有人只来过三次训练，有人在这里待了七年。',
    photos: ['ph17'],
    paras: [
      '队史馆上线这天，我翻了四个小时照片。有些人的脸我一时想不起名字，但我记得他们在场上的位置。',
      '86 个人。有人只来过三次训练，有人在这里待了七年。档案里我们给他们同样的位置，因为他们确实都穿过这件球衣。',
      '毕业的人会回来的。每年四月，校友队和现役队打一场。比分年年不一样，开球前的口号年年一样。',
      '如果你也在照片里，欢迎补一张。如果你不在了，这里还留着你的号码。'
    ]
  }
];

/* ---------- 球队记忆（短句墙） ---------- */
const MEMORIES = [
  { by: '陆铭', person: 'p35', year: 2024, text: '我第一次达阵那年，儿子还没出生。现在他会在电视前喊我爸的号码。' },
  { by: '苏航', person: 'p32', year: 2021, text: '护具是二手的，头盔是借的，但那件球衣是我第一次觉得属于自己。' },
  { by: '林一鸣', person: 'p28', year: 2023, text: '最想回去的不是冠军那场，是每周三晚上九点，训练完一起坐在马路牙子上吃泡面。' },
  { by: '谢天赐', person: 'p36', year: 2024, text: '我退役那天，队里给我办了个很小的仪式。我在更衣室哭了十分钟。' },
  { by: '张伟', person: 'p01', year: 2026, text: '十年了，每次开球前围成一圈，喊的还是同一句话。' },
  { by: '陈志远', person: 'p27', year: 2019, text: '那天没有人知道这支队能活过第一个冬天。' }
];

/* ---------- 纪录 ---------- */
const RECORDS = [
  { label: '单场最高得分', value: '48', note: '2023.10.14 · vs 猎鹰' },
  { label: '最大分差', value: '41', note: '48 : 7 · 同一场' },
  { label: '最长连胜', value: '7 场', note: '2024.03 – 2024.07' },
  { label: '最快达阵', value: '11 秒', note: '2022.05.28 · 开球回攻' },
  { label: '主场胜率', value: '68%', note: '86 场 · 58 胜' },
  { label: '最年长出场', value: '34 岁', note: '2026.04.11 · 唐磊' }
];

/* ---------- 退役号码 ---------- */
const RETIRED = [
  { num: 1, name: '陈志远', year: 2019, note: '首任队长。2019 年毕业，1 号球衣同年退役。' },
  { num: 12, name: '第十二人', year: 2020, note: '留给所有站过边线的人：替补、家属，和每场都来的那几个。' }
];

/* ---------- 名册（p1–p26 现役沿用旧原型，p27–p40 为已毕业） ---------- */
const PEOPLE = [
  { id: 'p01', name: '张伟', num: 11, pos: 'WR', from: 2016, to: null, status: 'active', honors: ['城市碗 2019', '城市碗 2023', '城市碗 2024', '2023 赛季 MVP'], quote: '十年，我把最好的几个秋天都留在了这块草皮上。' },
  { id: 'p02', name: '李强', num: 7, pos: 'QB', from: 2016, to: null, status: 'active', honors: ['城市碗 2019', '城市碗 2023', '城市碗 2024'], quote: '第一场比赛我传了 46 码，被抄截了三次。' },
  { id: 'p03', name: '王磊', num: 52, pos: 'LB', from: 2016, to: null, status: 'active', honors: ['城市碗 2019', '城市碗 2023', '城市碗 2024', '2019 决赛最佳防守'], quote: '防守组的人，习惯在没人看的地方把事情做完。' },
  { id: 'p04', name: '陈晨', num: 22, pos: 'RB', from: 2022, to: null, status: 'active', honors: ['城市碗 2023', '城市碗 2024'], quote: '我来的时候队里已经有冠军了，我想再拿一个。' },
  { id: 'p05', name: '王建国', num: 66, pos: 'OL', from: 2016, to: null, status: 'active', honors: ['城市碗 2019', '城市碗 2023', '城市碗 2024'], quote: '锋线的工作就是让别人看不见我们。挺好的。' },
  { id: 'p06', name: '赵磊', num: 90, pos: 'DL', from: 2016, to: null, status: 'active', honors: ['城市碗 2019'], quote: '我最喜欢的声音是开球前那一秒的安静。' },
  { id: 'p07', name: '刘洋', num: 24, pos: 'CB', from: 2021, to: null, status: 'active', honors: ['城市碗 2023', '城市碗 2024'], quote: '角卫的职业生涯只有两种结果：被记住，或者被针对。' },
  { id: 'p08', name: '孙浩', num: 88, pos: 'TE', from: 2020, to: null, status: 'active', honors: ['城市碗 2023', '城市碗 2024'], quote: '我第一年上场时间不到三十档，但我每档都跑完了。' },
  { id: 'p09', name: '周杰', num: 3, pos: 'S', from: 2017, to: null, status: 'active', honors: ['城市碗 2019', '城市碗 2023'], quote: '安全卫是最后一道防线，也是最后一个放弃的人。' },
  { id: 'p10', name: '吴迪', num: 55, pos: 'LB', from: 2018, to: null, status: 'active', honors: ['城市碗 2019', '城市碗 2023', '城市碗 2024'], quote: '2019 年决赛最后四档，我到现在还能背出对面的阵型。' },
  { id: 'p11', name: '郑凯', num: 78, pos: 'OL', from: 2016, to: null, status: 'active', honors: ['城市碗 2023', '城市碗 2024'], quote: '十年，我换过四个号码，没换过位置。' },
  { id: 'p12', name: '冯磊', num: 33, pos: 'RB', from: 2018, to: null, status: 'active', honors: ['城市碗 2019', '城市碗 2023', '城市碗 2024'], quote: '最快的达阵是 11 秒，但我觉得跑得最远的那次没进。' },
  { id: 'p13', name: '许阳', num: 81, pos: 'WR', from: 2021, to: null, status: 'active', honors: ['城市碗 2023', '城市碗 2024'], quote: '我第一次接球脱手，第二次接住了，然后就再也没想过脱手。' },
  { id: 'p14', name: '何军', num: 72, pos: 'DL', from: 2017, to: null, status: 'active', honors: ['城市碗 2019', '城市碗 2023'], quote: '我的膝盖记得每一块场地。' },
  { id: 'p15', name: '高峰', num: 45, pos: 'LB', from: 2018, to: null, status: 'active', honors: ['城市碗 2023', '城市碗 2024'], quote: '刚来的时候我连什么是「第一档」都不知道。' },
  { id: 'p16', name: '林涛', num: 19, pos: 'CB', from: 2019, to: null, status: 'active', honors: ['城市碗 2023'], quote: '我进队那年正好是第一座冠军，我以为每年都会这样。' },
  { id: 'p17', name: '黄鹏', num: 8, pos: 'QB', from: 2019, to: null, status: 'active', honors: ['城市碗 2023', '城市碗 2024'], quote: '四分卫是最容易被记住也最容易被怪罪的位置。' },
  { id: 'p18', name: '徐亮', num: 64, pos: 'OL', from: 2017, to: null, status: 'active', honors: ['城市碗 2019', '城市碗 2023'], quote: '我在队里待得比大部分人都久，但我从来没当过队长。' },
  { id: 'p19', name: '马超', num: 27, pos: 'S', from: 2019, to: null, status: 'active', honors: ['城市碗 2023', '城市碗 2024'], quote: '客场那个任意球，我站在边线上，不敢看。' },
  { id: 'p20', name: '朱琳', num: 5, pos: 'K', from: 2019, to: null, status: 'active', honors: ['城市碗 2023', '城市碗 2024'], quote: '踢球手只有两种时刻：进球，和所有人都看着你。' },
  { id: 'p21', name: '胡兵', num: 95, pos: 'DL', from: 2020, to: null, status: 'active', honors: ['城市碗 2024'], quote: '2020 年那一年，我在家练了一整年的核心。' },
  { id: 'p22', name: '郭强', num: 84, pos: 'WR', from: 2022, to: null, status: 'active', honors: ['城市碗 2023', '城市碗 2024'], quote: '外接手最怕的不是脱手，是没人传球给你。' },
  { id: 'p23', name: '罗宾', num: 58, pos: 'LB', from: 2021, to: null, status: 'active', honors: ['城市碗 2023', '城市碗 2024'], quote: '重建那年来的人，现在都是老队员了。' },
  { id: 'p24', name: '唐磊', num: 70, pos: 'OL', from: 2016, to: null, status: 'active', honors: ['城市碗 2019', '城市碗 2023', '城市碗 2024'], quote: '34 岁那场，我是全队最老的，也是最后一个离开更衣室的。' },
  { id: 'p25', name: '谢峰', num: 89, pos: 'TE', from: 2019, to: null, status: 'active', honors: ['城市碗 2023'], quote: '我原来穿 12 号，后来队里把 12 号退役了，我换了 89。' },
  { id: 'p26', name: '韩雪', num: 9, pos: 'P', from: 2022, to: null, status: 'active', honors: ['城市碗 2024'], quote: '全队只有我一个人希望进攻组快点三档出局。' },

  { id: 'p27', name: '陈志远', num: 1, pos: 'QB', from: 2016, to: 2019, status: 'alumni', honors: ['城市碗 2019', '首任队长'], quote: '我们那会儿没有场地，只有一颗球和一个信念。' },
  { id: 'p28', name: '林一鸣', num: 18, pos: 'WR', from: 2016, to: 2021, status: 'alumni', honors: ['城市碗 2019'], quote: '首胜那场我接了一个 30 码，落地时摔在边线的塑料桶上。' },
  { id: 'p29', name: '宋启', num: 54, pos: 'LB', from: 2016, to: 2019, status: 'alumni', honors: ['城市碗 2019'], quote: '第一场比赛我在第三节抽筋，教练说：你不会是最后一个。' },
  { id: 'p30', name: '顾晨阳', num: 28, pos: 'RB', from: 2017, to: 2020, status: 'alumni', honors: ['城市碗 2019'], quote: '首胜那个制胜达阵是我跑的，但我记得的是赛后所有人抱在一起。' },
  { id: 'p31', name: '邓宇', num: 77, pos: 'DL', from: 2017, to: 2019, status: 'alumni', honors: ['城市碗 2019'], quote: '我毕业那天把护具送给了新来的大一。' },
  { id: 'p32', name: '苏航', num: 68, pos: 'OL', from: 2018, to: 2021, status: 'alumni', honors: ['城市碗 2019'], quote: '我到现在还会在周三晚上九点下意识看手机。' },
  { id: 'p33', name: '何一诺', num: 21, pos: 'CB', from: 2018, to: 2022, status: 'alumni', honors: ['城市碗 2019'], quote: '停摆那年我在家对着墙练了半年脚步。' },
  { id: 'p34', name: '郑昊', num: 4, pos: 'QB', from: 2019, to: 2023, status: 'alumni', honors: ['城市碗 2023'], quote: '第二座冠军的加时赛，我传了 3 次，2 次没接住。' },
  { id: 'p35', name: '陆铭', num: 80, pos: 'WR', from: 2019, to: 2024, status: 'alumni', honors: ['城市碗 2023', '城市碗 2024'], quote: '我第一次达阵那年，儿子还没出生。' },
  { id: 'p36', name: '谢天赐', num: 92, pos: 'DL', from: 2020, to: 2024, status: 'alumni', honors: ['城市碗 2023', '城市碗 2024'], quote: '我在更衣室哭了十分钟，然后去吃了顿烧烤。' },
  { id: 'p37', name: '白宇', num: 86, pos: 'TE', from: 2020, to: 2023, status: 'alumni', honors: ['城市碗 2023'], quote: '我从来没当过首发，但我每一场都在场边喊。' },
  { id: 'p38', name: '蒋川', num: 50, pos: 'LB', from: 2021, to: 2025, status: 'alumni', honors: ['城市碗 2023', '城市碗 2024'], quote: '校友队成立那天，我第一个报名。' },
  { id: 'p39', name: '罗一', num: 2, pos: 'K', from: 2021, to: 2024, status: 'alumni', honors: ['城市碗 2023', '城市碗 2024'], quote: '我一共踢进过 61 个球，只记得没进的那 9 个。' },
  { id: 'p40', name: '傅斯年', num: 60, pos: 'OL', from: 2016, to: 2020, status: 'alumni', honors: ['城市碗 2019'], quote: '第一堂训练我们用了四十分钟跑完一套战术，今天只用四秒。' }
];

/* 当前登录者（演示） */
const ME = 'p01';
const MY = { apps: 96, td: 24, titles: 3 };

/* ============================================================
   校验：浏览器自检页与 node check.js 共用
   ============================================================ */
const RATIOS = ['4/5', '1/1', '4/3', '3/4', '16/9'];

function validate() {
  const errs = [];
  const ok = (cond, msg) => { if (!cond) errs.push(msg); };
  const idOf = (arr) => new Set(arr.map((x) => x.id));
  const eventIds = idOf(EVENTS);
  const photoIds = idOf(PHOTOS);
  const peopleIds = idOf(PEOPLE);
  const storyIds = idOf(STORIES);
  const inRange = (y) => y >= TEAM.years[0] && y <= TEAM.years[1];

  // 1. 集合内唯一 id（不同集合之间允许重名，引用按集合区分）
  [['事件', EVENTS], ['照片', PHOTOS], ['成员', PEOPLE], ['长文', STORIES]].forEach(function (pair) {
    const name = pair[0];
    const seen = new Set();
    pair[1].forEach(function (x) {
      ok(!seen.has(x.id), name + '重复 id: ' + x.id);
      seen.add(x.id);
    });
  });

  // 2. 事件
  EVENTS.forEach((e) => {
    ok(!!KINDS[e.kind], '事件 ' + e.id + ' 类型不在 KINDS 中: ' + e.kind);
    ok(inRange(e.year), '事件 ' + e.id + ' 年份越界: ' + e.year);
    ok(e.date.indexOf(String(e.year) + '.') === 0, '事件 ' + e.id + ' 日期与年份不符: ' + e.date);
    (e.photos || []).forEach((pid) => ok(photoIds.has(pid), '事件 ' + e.id + ' 引用了不存在的照片 ' + pid));
    (e.people || []).forEach((pid) => ok(peopleIds.has(pid), '事件 ' + e.id + ' 引用了不存在的人 ' + pid));
    if (e.story) ok(storyIds.has(e.story), '事件 ' + e.id + ' 引用了不存在的长文 ' + e.story);
  });

  // 3. 照片
  PHOTOS.forEach((p) => {
    ok(RATIOS.indexOf(p.ratio) >= 0, '照片 ' + p.id + ' 比例不在白名单: ' + p.ratio);
    ok(inRange(p.year), '照片 ' + p.id + ' 年份越界: ' + p.year);
    ok(p.date.indexOf(String(p.year) + '.') === 0, '照片 ' + p.id + ' 日期与年份不符: ' + p.date);
    (p.people || []).forEach((pid) => ok(peopleIds.has(pid), '照片 ' + p.id + ' 引用了不存在的人 ' + pid));
  });

  // 4. 长文
  STORIES.forEach((s) => {
    ok(peopleIds.has(s.person), '长文 ' + s.id + ' 的作者不存在: ' + s.person);
    ok((s.paras || []).length >= 2, '长文 ' + s.id + ' 段落太少');
    (s.photos || []).forEach((pid) => ok(photoIds.has(pid), '长文 ' + s.id + ' 引用了不存在的照片 ' + pid));
  });

  // 5. 记忆
  MEMORIES.forEach((m) => ok(peopleIds.has(m.person), '记忆作者不存在: ' + m.person));

  // 6. 事件升序
  const dates = EVENTS.map((e) => e.date);
  ok(dates.join('|') === dates.slice().sort().join('|'), '事件未按日期升序排列');

  // 7. 名册
  const active = PEOPLE.filter((p) => p.status === 'active');
  const nums = {};
  active.forEach((p) => {
    if (nums[p.num]) errs.push('现役号码重复: ' + p.num + '（' + nums[p.num] + ' / ' + p.name + '）');
    nums[p.num] = p.name;
  });
  RETIRED.forEach((r) => ok(!nums[r.num], '退役号码 ' + r.num + ' 仍在使用'));
  PEOPLE.forEach((p) => {
    ok(inRange(p.from), '成员 ' + p.id + ' 入队年份越界: ' + p.from);
    if (p.status === 'alumni') ok(!!p.to && p.to >= p.from, '毕业成员 ' + p.id + ' 毕业年份无效');
    if (p.status === 'active') ok(p.to === null, '现役成员 ' + p.id + ' 不应有毕业年份');
  });

  return {
    ok: errs.length === 0,
    errs: errs,
    counts: {
      事件: EVENTS.length,
      照片: PHOTOS.length,
      成员: PEOPLE.length,
      已毕业: PEOPLE.filter((p) => p.status === 'alumni').length,
      长文: STORIES.length,
      记忆: MEMORIES.length,
      退役号码: RETIRED.length
    }
  };
}

/* 说明：data.js 是给浏览器用的普通脚本，不做 module.exports。
   node 端请用 check.mjs（它对本文件做 vm 求值），这样两边永远同源。 */
