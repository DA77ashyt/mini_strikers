/* ===== 演示数据（美式橄榄球体系） ===== */

const POS_CN = {
  QB:'四分卫', RB:'跑卫', FB:'全卫', WR:'外接手', TE:'近端锋', OL:'进攻锋线',
  DL:'防守锋线', LB:'线卫', CB:'角卫', S:'安全卫', K:'踢球员', P:'弃踢手'
};
const OFF = ['QB','RB','FB','WR','TE','OL'];
const DEF = ['DL','LB','CB','S'];
function unitOf(pos){
  if (OFF.includes(pos)) return 'off';
  if (DEF.includes(pos)) return 'def';
  return 'st';
}
const UNIT_CN = { off:'进攻', def:'防守', st:'特勤' };

const PEOPLE = [
  { id:'p1',  name:'张伟',   num:11, pos:'WR', nick:'阿伟',  c:'c1' },
  { id:'p2',  name:'李强',   num:7,  pos:'QB', nick:'强哥',  c:'c2' },
  { id:'p3',  name:'王磊',   num:52, pos:'LB', nick:'磊子',  c:'c3' },
  { id:'p4',  name:'陈晨',   num:22, pos:'RB', nick:'小陈',  c:'c4' },
  { id:'p5',  name:'王建国', num:66, pos:'OL', nick:'建国',  c:'c1' },
  { id:'p6',  name:'赵磊',   num:90, pos:'DL', nick:'赵哥',  c:'c2' },
  { id:'p7',  name:'刘洋',   num:24, pos:'CB', nick:'洋洋',  c:'c3' },
  { id:'p8',  name:'孙浩',   num:88, pos:'TE', nick:'浩子',  c:'c4' },
  { id:'p9',  name:'周杰',   num:3,  pos:'S',  nick:'杰哥',  c:'c1' },
  { id:'p10', name:'吴迪',   num:55, pos:'LB', nick:'无敌',  c:'c2' },
  { id:'p11', name:'郑凯',   num:78, pos:'OL', nick:'凯哥',  c:'c3' },
  { id:'p12', name:'冯磊',   num:33, pos:'RB', nick:'二磊',  c:'c4' },
  { id:'p13', name:'许阳',   num:81, pos:'WR', nick:'阳阳',  c:'c1' },
  { id:'p14', name:'何军',   num:72, pos:'DL', nick:'军哥',  c:'c2' },
  { id:'p15', name:'高峰',   num:45, pos:'LB', nick:'高个',  c:'c3' },
  { id:'p16', name:'林涛',   num:19, pos:'CB', nick:'涛涛',  c:'c4' },
  { id:'p17', name:'黄鹏',   num:8,  pos:'QB', nick:'鹏鹏',  c:'c1' },
  { id:'p18', name:'徐亮',   num:64, pos:'OL', nick:'亮子',  c:'c2' },
  { id:'p19', name:'马超',   num:27, pos:'S',  nick:'超哥',  c:'c3' },
  { id:'p20', name:'朱琳',   num:5,  pos:'K',  nick:'小林',  c:'c4' },
  { id:'p21', name:'胡兵',   num:95, pos:'DL', nick:'胡哥',  c:'c1' },
  { id:'p22', name:'郭强',   num:84, pos:'WR', nick:'小郭',  c:'c2' },
  { id:'p23', name:'罗宾',   num:58, pos:'LB', nick:'宾哥',  c:'c3' },
  { id:'p24', name:'唐磊',   num:70, pos:'OL', nick:'唐哥',  c:'c4' },
  { id:'p25', name:'谢峰',   num:12, pos:'TE', nick:'峰哥',  c:'c1' },
  { id:'p26', name:'韩雪',   num:9,  pos:'P',  nick:'小雪',  c:'c2' }
].map(p => ({ ...p, unit: unitOf(p.pos) }));

const ME = 'p1';
const TODAY = '2026-11-06';

/* 生日（月-日） */
const BIRTHDAYS = { p10: '11-06', p25: '11-12', p2: '03-08', p18: '11-25' };

const MATCHES = [
  {
    id:'m1', date:'2026-11-08', time:'14:00', opponent:'闪电队', venue:'城南体育公园',
    home:true, cap:22, status:'open', deadline:'11-07 20:00', round:'联赛 · 第 6 轮',
    signups:['p1','p2','p3','p5','p7','p8','p9','p10','p11','p12','p13','p14','p15','p16','p17','p18','p19','p20']
  },
  {
    id:'m2', date:'2026-11-15', time:'10:00', opponent:'猎鹰队', venue:'城北足球公园',
    home:false, cap:22, status:'open', deadline:'11-14 20:00', round:'联赛 · 第 7 轮',
    signups:['p1','p2','p5','p8','p10','p13']
  },
  {
    id:'m3', date:'2026-11-01', time:'14:00', opponent:'猎鹰队', venue:'城北足球公园',
    home:false, cap:22, status:'done', deadline:'10-31 20:00', round:'联赛 · 第 5 轮',
    score:'21 : 14', win:true,
    signups:['p1','p2','p3','p5','p7','p8','p9','p10','p11','p12','p13','p14','p15','p16','p17','p18','p19','p20','p22','p23','p24','p25']
  }
];

/* 历史训练的签到用固定规则生成，保证每次打开一致 */
function seedCheckins(absent, late){
  const c = {};
  PEOPLE.forEach(p => { c[p.id] = 'present'; });
  absent.forEach(id => { c[id] = 'absent'; });
  late.forEach(id => { c[id] = 'late'; });
  return c;
}

const TRAININGS = [
  {
    id:'t1', date:'2026-11-06', start:'19:00', end:'21:00', title:'赛前合练',
    venue:'城南体育公园 3 号场', cap:30, type:'对抗训练',
    signups:['p1','p2','p3','p4','p5','p6','p7','p8','p9','p10','p11','p12','p13','p14','p15','p16','p17','p18','p19','p20','p21','p22','p23','p24','p25','p26'],
    checkins:null, rollcall:null,
    plan:[['热身与拉伸','19:00','19:15'],['战术演练（进攻组）','19:15','19:50'],['全场对抗','19:50','21:00']]
  },
  {
    id:'t2', date:'2026-11-03', start:'19:00', end:'21:00', title:'周三常规训练',
    venue:'城南体育公园 3 号场', cap:30, type:'常规训练',
    signups:['p1','p2','p3','p5','p7','p8','p9','p10','p11','p12','p13','p14','p15','p16','p17','p18','p19','p20','p22','p23','p24','p25'],
    checkins: seedCheckins(['p12','p16','p24'],['p8','p19']),
    plan:[['热身','19:00','19:15'],['分队对抗','19:15','21:00']]
  },
  {
    id:'t4', date:'2026-10-27', start:'19:00', end:'21:00', title:'周三常规训练',
    venue:'城南体育公园 3 号场', cap:30, type:'常规训练',
    signups:['p1','p2','p3','p5','p7','p8','p9','p10','p11','p13','p14','p15','p17','p18','p19','p20','p22','p23','p25'],
    checkins: seedCheckins(['p9'],['p15']),
    plan:[['热身','19:00','19:15'],['战术课','19:15','20:15'],['对抗','20:15','21:00']]
  },
  {
    id:'t5', date:'2026-10-20', start:'19:00', end:'21:00', title:'周三常规训练',
    venue:'城南体育公园 3 号场', cap:30, type:'常规训练',
    signups:['p1','p2','p3','p5','p8','p10','p11','p13','p14','p17','p18','p19','p22','p23','p25'],
    checkins: seedCheckins(['p2','p13'],['p1']),
    plan:[['热身','19:00','19:15'],['全场对抗','19:15','21:00']]
  },
  {
    id:'t3', date:'2026-11-13', start:'19:00', end:'21:00', title:'赛后恢复训练',
    venue:'城南体育公园 3 号场', cap:30, type:'恢复训练',
    signups:['p1','p2','p5','p8'],
    checkins:null, plan:[['放松拉伸','19:00','19:40'],['录像复盘','19:40','21:00']]
  }
];

const INJURIES = [
  { id:'i0', pid:'p1',  part:'右侧膝盖', type:'内侧副韧带扭伤', level:'中度',
    from:'2026-11-02', expect:'2026-11-20', status:'active',
    logs:[['2026-11-05','复查结果良好，可开始轻度慢跑','本人'],['2026-11-03','队长确认：本周不上场','队长'],['2026-11-02','新建伤病记录：右膝内侧副韧带扭伤','本人']] },
  { id:'i1', pid:'p4',  part:'右侧膝盖', type:'内侧副韧带扭伤', level:'中度',
    from:'2026-11-02', expect:'2026-11-20', status:'active',
    logs:[['2026-11-05','复查结果良好，可开始轻度慢跑','本人'],['2026-11-03','队长确认：本周不上场','队长']] },
  { id:'i2', pid:'p6',  part:'左脚踝', type:'外侧韧带扭伤', level:'轻度',
    from:'2026-10-30', expect:'2026-11-09', status:'active',
    logs:[['2026-11-02','已能正常行走，暂不参加对抗','本人']] },
  { id:'i3', pid:'p21', part:'右肩', type:'肩锁关节挫伤', level:'中度',
    from:'2026-11-04', expect:'2026-11-18', status:'active',
    logs:[['2026-11-04','对抗中落地压到肩膀，已冰敷','本人']] },
  { id:'i4', pid:'p1',  part:'左脚踝', type:'外侧韧带扭伤', level:'轻度',
    from:'2026-08-12', expect:'2026-08-26', status:'healed',
    logs:[['2026-08-26','康复，恢复全部训练','本人']] },
  { id:'i5', pid:'p1',  part:'肩部', type:'肩锁关节挫伤', level:'轻度',
    from:'2026-05-03', expect:'2026-05-10', status:'healed',
    logs:[['2026-05-10','康复，恢复正常训练','本人']] }
];

const NOTICES = [
  { id:'n1', title:'本周日比赛集合时间改为 12:30', by:'队长', time:'2 小时前' },
  { id:'n2', title:'冬季队服统计尺寸，本周内报给队长', by:'管理员', time:'昨天' }
];

/* 位置缺口的基准人数（按 22 人比赛名单配比） */
const REQ = { QB:1, RB:2, WR:3, TE:1, OL:5, DL:4, LB:3, CB:2, S:2, K:1 };

/* 与闪电队的近 3 次交锋 */
const H2H = [
  { date:'2026-10-18', home:false, score:'14 : 21', win:false },
  { date:'2026-09-06', home:true,  score:'28 : 14', win:true  },
  { date:'2025-11-02', home:true,  score:'21 : 17', win:true  }
];
