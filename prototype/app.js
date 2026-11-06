/* ===== Strikers 交互原型 · 逻辑 ===== */

const $v = document.getElementById('view');
const $tab = document.getElementById('tabbar');
const $toast = document.getElementById('toast');
const $sheet = document.getElementById('sheet');

const byId = id => PEOPLE.find(p => p.id === id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));

/* ---------- 全局状态 ---------- */
const state = {
  route: 'home', param: null,
  monthOffset: 0,
  day: TODAY,
  seg: 'all',
  checkins: {},   // trainingId -> {pid: 'present'|'late'|'absent'|'leave'|''}
  signups: {},    // matchId -> [pid]
  tsig: {},       // trainingId -> [pid]
  rollcall: null, // 当前导入解析结果
  injuries: INJURIES.map(x => ({ ...x })),
  sheetPid: null
};

MATCHES.forEach(m => { state.signups[m.id] = [...m.signups]; });
TRAININGS.forEach(t => { state.tsig[t.id] = [...t.signups]; });

/* 今天这场合练：队长已经点了大半，留几个人没点 */
(function seedToday() {
  const t = TRAININGS.find(x => x.id === 't1');
  const c = {};
  t.signups.forEach((pid, i) => {
    if (i < 15) c[pid] = 'present';
    else if (i === 15) c[pid] = 'late';
    else if (i === 16) c[pid] = 'absent';
    else if (i === 17 || i === 18) c[pid] = 'leave';
    else c[pid] = '';
  });
  state.checkins.t1 = c;
})();

/* ---------- 图标 ---------- */
const I = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5.5H9V20H5a1 1 0 0 1-1-1z"/></svg>',
  cal:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3.5" y="5.5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3.5v3M16 3.5v3"/></svg>',
  flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M6 21V4M6 4h11l-2.5 4L17 12H6"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.8 20c1.2-3.6 3.9-5.4 7.2-5.4S18 16.4 19.2 20"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  circle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v8M8 12h8"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="8.2"/><path d="M12 7.5V12l3 2"/></svg>',
  pin:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 21s6.5-6.2 6.5-11a6.5 6.5 0 1 0-13 0C5.5 14.8 12 21 12 21z"/><circle cx="12" cy="10" r="2.4"/></svg>',
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19c.9-3 3-4.6 5.5-4.6S13.6 16 14.5 19M16 6.2a3 3 0 0 1 0 5.6M17.5 19c-.3-1.6-.8-2.9-1.6-3.9 2.3.2 4 1.7 4.6 3.9"/></svg>',
  bag:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="4" y="7" width="16" height="13" rx="2.5"/><path d="M9 7V5.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5.5V7"/></svg>',
  warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.2v.2"/></svg>',
  cake: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="4" y="12" width="16" height="8" rx="2"/><path d="M4 16h16M12 12V8M12 5.5v.6"/></svg>',
  cross:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M12 5.5v13M5.5 12h13"/></svg>',
  clip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="6" y="4.5" width="12" height="16" rx="2"/><path d="M9.5 4.5V3h5v1.5M9 10h6M9 14h6M9 18h3"/></svg>',
  chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 19V11M12 19V5M19 19v-5"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M18 9a6 6 0 1 0-12 0c0 4-1.5 5.5-1.5 5.5h15S18 13 18 9z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 8h9M17 8h3M4 16h3M11 16h9"/><circle cx="15" cy="8" r="2.2"/><circle cx="9" cy="16" r="2.2"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3.5 19 6v6c0 4-3 7-7 8.5-4-1.5-7-4.5-7-8.5V6z"/></svg>',
  plus2:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M12 6v12M6 12h12"/></svg>'
};

/* ---------- 小工具 ---------- */
function toast(msg) {
  $toast.textContent = msg;
  $toast.classList.add('on');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => $toast.classList.remove('on'), 1600);
}
function openSheet(html) { $sheet.innerHTML = '<div class="sheet">' + html + '</div>'; $sheet.classList.add('on'); }
function closeSheet() { $sheet.classList.remove('on'); }
$sheet.addEventListener('click', e => { if (e.target === $sheet) closeSheet(); });

const WD = ['日','一','二','三','四','五','六'];
function md(d) { const [y, m, dd] = d.split('-').map(Number); return { y, m, d: dd }; }
function wd(d) { const [y, m, dd] = d.split('-').map(Number); return WD[new Date(y, m - 1, dd).getDay()]; }
function dateLabel(d) { const o = md(d); return o.m + '月' + o.d + '日 周' + wd(d); }
function shortDate(d) { const o = md(d); return o.m + '月' + o.d + '日'; }

function checkinsOf(t) {
  if (!state.checkins[t.id]) {
    const c = {};
    t.signups.forEach(pid => { c[pid] = ''; });
    state.checkins[t.id] = c;
  }
  return state.checkins[t.id];
}
function countsOf(t) {
  const c = checkinsOf(t);
  const ids = state.tsig[t.id] || t.signups;
  let present = 0, late = 0, absent = 0, leave = 0, none = 0;
  ids.forEach(pid => {
    const s = c[pid];
    if (s === 'present') present++;
    else if (s === 'late') late++;
    else if (s === 'absent') absent++;
    else if (s === 'leave') leave++;
    else none++;
  });
  return { total: ids.length, present, late, absent, leave, none };
}
function activeInjuries() { return state.injuries.filter(i => i.status === 'active'); }
function injuryOf(pid) { return activeInjuries().find(i => i.pid === pid); }

/* ---------- 路由 ---------- */
function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }

const ROUTES = {
  home:       { tab: 'home', render: pageHome },
  schedule:   { tab: 'schedule', render: pageSchedule },
  trainings:  { tab: 'trainings', render: pageTrainings },
  me:         { tab: 'me', render: pageMe },
  training:   { render: pageTraining },
  importer:   { render: pageImport },
  rollcall:   { render: pageRollcall },
  match:      { render: pageMatch },
  injury:     { render: pageInjury },
  stats:      { render: pageStats },
  newtraining:{ render: pageNewTraining },
  newpickup:  { render: pageNewPickup },
  notices:    { render: pageNotices }
};

function parseHash() {
  const h = (location.hash || '#/home').replace(/^#\/?/, '');
  const [name, param] = h.split('/');
  return { name: ROUTES[name] ? name : 'home', param: param || null };
}

function render() {
  const { name, param } = parseHash();
  state.route = name; state.param = param;
  const r = ROUTES[name];
  $v.innerHTML = r.render(param);
  const tab = r.tab;
  $tab.style.display = tab ? 'flex' : 'none';
  [...$tab.children].forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  $v.querySelector('.scroll')?.scrollTo(0, 0);
}
window.addEventListener('hashchange', render);

/* ---------- 通用片段 ---------- */
function avatar(p, cls = '') {
  return `<div class="avatar ${p.c} ${cls}">${p.name[0]}</div>`;
}
function navBar(title, right = '', onWhite = true) {
  return `<div class="nav ${onWhite ? 'on-white' : ''}">
    <div class="side"><span class="back" data-act="back">‹</span></div>
    <div>${title}</div>
    <div class="side r">${right}</div>
  </div>`;
}
function tabBar() {
  const items = [
    ['home', '首页', I.home], ['schedule', '赛程', I.cal],
    ['trainings', '训练', I.flag], ['me', '我的', I.user]
  ];
  return items.map(([k, l, ic]) =>
    `<button data-tab="${k}" data-act="tab" data-to="${k}">${ic}<span>${l}</span></button>`).join('');
}

/* ================= 首页 ================= */
function pageHome() {
  const m = MATCHES.find(x => x.status === 'open');
  const signed = state.signups[m.id].length;
  const todayBday = Object.entries(BIRTHDAYS).filter(([, v]) => {
    const [mm, dd] = v.split('-').map(Number);
    const t = md(TODAY);
    return mm === t.m && dd === t.d;
  }).map(([pid]) => byId(pid));
  const myInj = injuryOf(ME);

  return `<div class="page">
    <div class="scroll">
      <div class="hero">
        <div class="row between">
          <div class="team">STRIKERS</div>
          <div class="row g8">
            <button class="iconbtn" data-act="toast" data-msg="消息中心：3 条未读">${I.bell}</button>
            <button class="iconbtn" data-act="tab" data-to="me" style="font-size:13px;font-weight:700;">伟</button>
          </div>
        </div>
        <h1>周五好，阿伟</h1>
        <div class="sub">共 ${Object.keys(BIRTHDAYS).length} 位队友登记了生日 · 本周 2 场活动</div>
      </div>

      <div class="card next" data-act="go" data-to="#/match/${m.id}">
        <div class="row between">
          <span class="tag blue">下一场 · ${m.round.split(' · ')[0]}</span>
          <span class="sm b" style="color:#E8590C">还有 2 天</span>
        </div>
        <div class="match-title mt10">Strikers vs ${m.opponent}</div>
        <div class="match-meta">${shortDate(m.date)} 周${wd(m.date)} ${m.time} · ${m.venue}</div>
        <div class="row between mt12">
          <div class="sm muted">已报名 <b style="color:#0A1B33">${signed}</b> / ${m.cap} 人</div>
          <div class="sm b" style="color:#1F6FEB">去报名 ›</div>
        </div>
        <div class="bar"><i style="width:${Math.round(signed / m.cap * 100)}%"></i></div>
      </div>

      ${myInj ? `<div class="alert" data-act="go" data-to="#/injury">
        ${I.warn}
        <div>你处于伤停中 · ${myInj.part} · 预计 ${md(myInj.expect).m}-${md(myInj.expect).d} 复出</div>
        <span style="color:#B06F00">›</span>
      </div>` : ''}

      <div class="quick">
        <button class="q" data-act="go" data-to="#/schedule"><i>${I.check}</i>报名</button>
        <button class="q" data-act="go" data-to="#/newtraining"><i>${I.plus}</i>发训练</button>
        <button class="q" data-act="go" data-to="#/newpickup"><i>${I.circle}</i>发约练</button>
        <button class="q" data-act="go" data-to="#/rollcall/t1"><i>${I.list}</i>点名</button>
      </div>

      <div class="sec"><b>今日生日</b><span class="tiny muted" data-act="toast" data-msg="生日墙：本月 2 位">查看全部 ›</span></div>
      ${todayBday.map(p => `<div class="card bday">
        <div class="avatar ${p.c}" style="background:#FFF1DC;color:#C2570A">${I.cake}</div>
        <div style="flex:1">
          <div class="b" style="font-size:14px">今天是${p.name}的生日</div>
          <div class="tiny muted mt6">一起去祝他生日快乐吧</div>
        </div>
        <button class="btn ghost sm2" data-act="toast" data-msg="已送出祝福 🎂">送祝福</button>
      </div>`).join('') || '<div class="card bday"><div class="tiny muted">今天没有队友过生日</div></div>'}

      <div class="sec"><b>球队公告</b><span class="tiny muted" data-act="go" data-to="#/notices">全部 ›</span></div>
      ${NOTICES.map(n => `<div class="notice" data-act="go" data-to="#/notices">
        <div class="ln"></div>
        <div style="flex:1"><b>${n.title}</b><span>${n.by} · ${n.time}</span></div>
      </div>`).join('')}
    </div>
  </div>`;
}

/* ================= 赛程 ================= */
function monthEvents(y, m) {
  const inMonth = d => { const o = md(d); return o.y === y && o.m === m; };
  return [
    ...MATCHES.filter(x => inMonth(x.date)).map(x => ({ ...x, kind: 'match' })),
    ...TRAININGS.filter(x => inMonth(x.date)).map(x => ({ ...x, kind: 'training' }))
  ].sort((a, b) => a.date.localeCompare(b.date));
}

function pageSchedule() {
  const base = new Date(2026, 10 + state.monthOffset, 1);
  const y = base.getFullYear(), m = base.getMonth() + 1;
  const first = new Date(y, m - 1, 1);
  const lead = (first.getDay() + 6) % 7; // 周一起始
  const days = new Date(y, m, 0).getDate();
  const evs = monthEvents(y, m);
  const evDates = new Set(evs.map(e => e.date));

  let cells = '';
  for (let i = 0; i < lead; i++) cells += '<button class="off" disabled></button>';
  for (let d = 1; d <= days; d++) {
    const ds = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const cls = [ds === state.day ? 'sel' : '', ds === TODAY ? 'today' : '', evDates.has(ds) ? 'has' : ''].join(' ');
    cells += `<button class="${cls}" data-act="pickday" data-day="${ds}">${d}</button>`;
  }

  const dayEvs = evs.filter(e => e.date === state.day);
  const listHtml = dayEvs.length ? dayEvs.map(e => e.kind === 'match' ? matchRow(e) : trainingRow(e)).join('')
    : `<div class="empty">这一天没有安排<br><span class="tiny">上面有圆点的日子有比赛或训练</span></div>`;

  const isNow = state.monthOffset === 0;
  return `<div class="page">
    <div class="scroll">
      <div class="nav"><div class="side"></div>
        <div>赛程</div>
        <div class="side r"><span data-act="toast" data-msg="新建比赛：原型暂未开放">＋</span></div>
      </div>
      <div class="monthbar">
        <button data-act="month" data-d="-1">‹</button>
        <div>${y} 年 ${m} 月</div>
        <button data-act="month" data-d="1" ${isNow ? 'disabled' : ''}>›</button>
      </div>
      <div class="cal">
        <div class="cal-head">${['一','二','三','四','五','六','日'].map(x => `<div>${x}</div>`).join('')}</div>
        <div class="cal-grid">${cells}</div>
      </div>
      <div class="sec"><b>${dateLabel(state.day)}</b>
        <span class="tiny muted">${dayEvs.length} 场安排</span></div>
      <div>${listHtml}</div>
      <div style="height:10px"></div>
    </div>
  </div>`;
}

function matchRow(m) {
  const signed = state.signups[m.id].length;
  const done = m.status === 'done';
  return `<div class="daycard" data-act="go" data-to="#/match/${m.id}">
    <div class="datecol"><b>${md(m.date).d}</b><span>周${wd(m.date)}</span></div>
    <div style="flex:1">
      <div class="row between">
        <span class="tag ${done ? 'gray' : 'blue'}">${done ? '已结束' : m.round.split(' · ')[0]}</span>
        ${done ? `<span class="sm b">${m.score}</span>` : `<span class="tag green">已报名 ${signed}</span>`}
      </div>
      <div class="b mt6" style="font-size:14px">vs ${m.opponent}</div>
      <div class="tiny muted mt6">${m.time} · ${m.venue} · 主队</div>
      ${done ? '<div class="tiny mt6" style="color:#0FA968">胜</div>'
             : `<div class="tiny mt6" style="color:#1F6FEB">已报名 ${signed} / ${m.cap} 人 · 查看详情</div>`}
    </div>
  </div>`;
}

function trainingRow(t) {
  const c = t.checkins ? null : (state.checkins[t.id] ? countsOf(t) : null);
  const future = t.date > TODAY;
  const today = t.date === TODAY;
  return `<div class="daycard" data-act="go" data-to="#/training/${t.id}">
    <div class="datecol"><b>${md(t.date).d}</b><span>周${wd(t.date)}</span></div>
    <div style="flex:1">
      <div class="row between">
        <span class="tag ${today ? 'amber' : future ? 'blue' : 'gray'}">${today ? '今天' : future ? '待开始' : '已结束'}</span>
        <span class="tiny muted">${(state.tsig[t.id] || t.signups).length} 人报名</span>
      </div>
      <div class="b mt6" style="font-size:14px">${t.title}</div>
      <div class="tiny muted mt6">${t.start} - ${t.end} · ${t.venue}</div>
    </div>
  </div>`;
}

/* ================= 训练列表 ================= */
function pageTrainings() {
  const list = [...TRAININGS].sort((a, b) => b.date.localeCompare(a.date));
  const upcoming = list.filter(t => t.date >= TODAY).sort((a, b) => a.date.localeCompare(b.date));
  const past = list.filter(t => t.date < TODAY);
  const myCount = past.filter(t => {
    const c = t.checkins;
    return c && (c[ME] === 'present' || c[ME] === 'late');
  }).length;

  return `<div class="page">
    <div class="scroll">
      <div class="nav"><div class="side"></div><div>训练</div>
        <div class="side r"><span data-act="go" data-to="#/newtraining" style="font-size:22px;font-weight:400">＋</span></div>
      </div>
      <div class="card flat" style="margin:4px 16px 0;padding:14px">
        <div class="row between">
          <div>
            <div class="tiny muted">我的出勤</div>
            <div class="b" style="font-size:20px;margin-top:4px">${myCount} <span class="sm muted">/ ${past.length} 场</span></div>
          </div>
          <button class="btn ghost sm2" data-act="go" data-to="#/stats">明细 ›</button>
        </div>
      </div>
      <div class="sec"><b>待开始</b><span class="tiny muted">${upcoming.length} 场</span></div>
      <div>${upcoming.map(trainingRow).join('') || '<div class="empty">暂无安排</div>'}</div>
      <div class="sec"><b>历史训练</b><span class="tiny muted">${past.length} 场</span></div>
      <div>${past.map(trainingRow).join('')}</div>
      <div style="height:10px"></div>
    </div>
  </div>`;
}

/* ================= 训练详情 ================= */
function pageTraining(id) {
  const t = TRAININGS.find(x => x.id === id);
  if (!t) return '<div class="empty">训练不存在</div>';
  const ids = state.tsig[t.id] || t.signups;
  const done = !!t.checkins;
  const c = countsOf(t);
  const injCount = ids.filter(pid => injuryOf(pid)).length;
  const joined = ids.includes(ME);

  return `<div class="page">
    <div class="scroll">
      <div class="cover">
        <div class="ring"></div>
        <div class="row between" style="position:relative">
          <span class="back" data-act="back" style="font-size:24px">‹</span>
          <span class="tag" style="background:rgba(255,255,255,.16);color:#fff">${t.type}</span>
        </div>
        <h1>${t.title}</h1>
        <div class="sm" style="color:#A9C4EA;margin-top:6px;position:relative">${shortDate(t.date)} 周${wd(t.date)} ${t.start} - ${t.end}</div>
      </div>

      <div class="card info">
        <div class="ln">${I.clock}<span>${t.start} - ${t.end} · 共 2 小时</span></div>
        <div class="ln">${I.pin}<b>${t.venue}</b>
          <span style="color:#1F6FEB" data-act="toast" data-msg="已复制地址，去地图导航">导航 ›</span></div>
        <div class="ln">${I.users}<span>已报名 <b style="color:#0A1B33">${ids.length}</b> / ${t.cap} 人${done ? ` · 签到 ${c.present + c.late}` : ''}</span></div>
        <div class="ln">${I.bag}<span>头盔、护肩、防滑钉鞋</span></div>
      </div>

      <div class="card stack">
        <div class="row between"><span class="b sm">报名名单</span>
          <span class="sm" style="color:#1F6FEB" data-act="toast" data-msg="按位置分组的完整名单">${ids.length} 人 ›</span></div>
        <div class="avatarwall mt10">
          ${ids.slice(0, 7).map(pid => avatar(byId(pid))).join('')}
          ${ids.length > 7 ? `<span class="tiny muted">+${ids.length - 7}</span>` : ''}
        </div>
        ${injCount ? `<div class="row g8 mt10" style="background:#FFF7ED;border:1px solid #FFE0C2;border-radius:10px;padding:9px 11px;color:#9A4A05;font-size:11.5px">
          ${I.warn}<span>本场有 <b>${injCount}</b> 人处于伤停中，名单已标记</span></div>` : ''}
      </div>

      <div class="card stack" data-act="go" data-to="#/importer/${t.id}">
        <div class="row between">
          <span class="b sm">接龙名单</span>
          ${t.rollcall ? `<span class="tag amber">已导入 ${t.rollcall.filter(r => r.status !== 'leave').length} 人</span>
            <span class="sm" style="color:#1F6FEB">重新导入 ›</span>`
            : `<span class="tag gray">未导入</span><span class="sm" style="color:#1F6FEB">去导入 ›</span>`}
        </div>
        <div class="tiny muted mt6">把微信群里的接龙文本粘进来，自动对照花名册</div>
      </div>

      <div class="card stack">
        <div class="row between"><span class="b sm">训练安排</span><span class="tiny muted">教练组</span></div>
        ${t.plan.map(([n, s, e]) => `<div class="row between mt10">
          <span class="sm">· ${n}</span><span class="tiny muted">${s} - ${e}</span></div>`).join('')}
      </div>
      <div style="height:14px"></div>
    </div>

    <div class="bottom">
      <button class="btn ghost" style="flex:0 0 110px" data-act="go" data-to="#/rollcall/${t.id}">点名台</button>
      <button class="btn primary" data-act="join" data-id="${t.id}">${joined ? '取消报名' : '我要参加'}</button>
    </div>
  </div>`;
}

/* ================= 接龙导入 ================= */
const SAMPLE = `1. 张伟
2. 李强 带朋友
3. 王磊 迟到20分钟
4. 陈晨 请假
5. 老王
6. 小赵
7. 3号`;

function lev(a, b) {
  const m = [], n = [];
  for (let i = 0; i <= b.length; i++) m[i] = i;
  for (let i = 1; i <= a.length; i++) {
    n[0] = i;
    for (let j = 1; j <= b.length; j++) {
      n[j] = Math.min(m[j] + 1, n[j - 1] + 1, m[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    for (let j = 0; j <= b.length; j++) m[j] = n[j];
  }
  return m[b.length];
}

function matchPerson(tok) {
  const t = tok.replace(/\s/g, '');
  if (!t) return { warn: true, cands: [], how: '空行' };
  let hit = PEOPLE.find(p => p.name === t);
  if (hit) return { pid: hit.id, how: '精确匹配 · 花名册' };
  hit = PEOPLE.find(p => p.nick === t);
  if (hit) return { pid: hit.id, how: '昵称匹配 · ' + hit.name };

  const num = t.match(/^(\d{1,2})\s*号?$/);
  if (num) {
    const n = +num[1];
    hit = PEOPLE.find(p => p.num === n);
    if (hit) return { pid: hit.id, how: `按球衣号匹配 · ${n} 号` };
  }
  // 小X / 老X / 阿X：不确定，交给人工
  const nick = t.match(/^[小老阿]([\u4e00-\u9fa5]{1,2})$/);
  if (nick) {
    const body = nick[1];
    const cands = PEOPLE.filter(p => p.name.includes(body) || (p.nick || '').includes(body));
    return { warn: true, cands: cands.map(p => p.id), how: cands.length ? '可能是昵称 · ' + cands.map(p => p.name).join(' / ') : '花名册中未找到' };
  }
  const cands = PEOPLE.filter(p => t.length >= 2 && (p.name.includes(t) || t.includes(p.name)));
  if (cands.length === 1) return { pid: cands[0].id, how: '包含匹配 · ' + cands[0].name };
  if (cands.length > 1) return { warn: true, cands: cands.map(p => p.id), how: '多个相近：' + cands.map(p => p.name).join(' / ') };

  const f = PEOPLE.filter(p => lev(p.name, t) <= 1);
  if (f.length === 1) return { pid: f[0].id, how: '近似匹配 · ' + f[0].name };
  if (f.length > 1) return { warn: true, cands: f.map(p => p.id), how: '多个相近：' + f.map(p => p.name).join(' / ') };
  return { warn: true, cands: [], how: '花名册中未找到 · 可能是外援' };
}

function parseRollcall(text) {
  const rows = [];
  const used = new Set();
  text.split('\n').map(s => s.trim()).filter(Boolean).forEach(line => {
    if (/接龙|训练|报名/.test(line) && !/^\d/.test(line)) return; // 标题行
    const body = line.replace(/^\s*\d+\s*[.、:：)]\s*/, '');
    if (!body) return;
    let status = 'join', guests = 0;
    if (/请假|不来|缺席/.test(body)) status = 'leave';
    else if (/迟到/.test(body)) status = 'late';
    const g = body.match(/带\s*(?:(\d+)\s*人?|朋友|人)/);
    if (g) guests = g[1] ? Number(g[1]) : 1;

    const namePart = body
      .replace(/带\s*\d*\s*(?:人|朋友)?/g, '')
      .replace(/迟到\s*\d*\s*分钟?/g, '')
      .replace(/请假|不来|缺席/g, '')
      .trim();

    const hit = matchPerson(namePart);
    let pid = hit.pid || null;
    let warn = !!hit.warn;
    let how = hit.how;
    if (pid && used.has(pid)) { warn = true; how = '重复：' + byId(pid).name + ' 已在名单中'; }
    if (pid) used.add(pid);
    rows.push({ raw: line, name: namePart, pid, warn, how, status, guests, cands: hit.cands || [] });
  });
  return rows;
}

function pageImport(id) {
  const t = TRAININGS.find(x => x.id === id);
  const rows = state.rollcall;
  const ok = rows ? rows.filter(r => !r.warn && r.status !== 'leave') : [];
  const warn = rows ? rows.filter(r => r.warn) : [];
  const leave = rows ? rows.filter(r => r.status === 'leave' && !r.warn) : [];

  const rowHtml = r => {
    if (r.warn) {
      return `<div class="imp warn">
        <div class="avatar" style="background:#F5A524;color:#fff">?</div>
        <div style="flex:1;min-width:0">
          <div class="nm">${esc(r.name)}</div>
          <div class="src">${r.how}</div>
        </div>
        <button class="btn ghost sm2 act" data-act="pick" data-i="${rows.indexOf(r)}">指定</button>
      </div>`;
    }
    const p = byId(r.pid);
    const tag = r.status === 'leave' ? '请假' : r.status === 'late' ? '迟到' : '参加';
    const cls = r.status === 'leave' ? 'gray' : r.status === 'late' ? 'amber' : 'green';
    return `<div class="imp">
      ${avatar(p)}
      <div style="flex:1;min-width:0">
        <div class="nm">${p.name}${r.guests ? ` <span class="tag amber">+${r.guests} 随行</span>` : ''}</div>
        <div class="src">${r.how}</div>
      </div>
      <span class="tag ${cls} act">${tag}</span>
    </div>`;
  };

  return `<div class="page">
    <div class="scroll">
      ${navBar('导入接龙', '<span data-act="toast" data-msg="支持「序号. 姓名 + 备注」格式，姓名对不上会标黄">帮助</span>')}
      <div class="row between" style="padding:8px 16px 0">
        <span class="sm muted">把微信群里的接龙文本整个粘进来</span>
        <span class="tiny" style="color:#1F6FEB" data-act="fill">填入示例</span>
      </div>
      <textarea class="paste mt10" id="paste" placeholder="粘贴接龙文本…">${esc(state.pasteText || SAMPLE)}</textarea>
      <div class="pad mt12">
        <button class="btn primary" data-act="parse">解析文本</button>
      </div>

      ${rows ? `
      <div class="summary">
        <div class="sum"><b style="color:#0FA968">${ok.length}</b><span>已识别</span></div>
        <div class="sum"><b style="color:#B06F00">${warn.length}</b><span>待确认</span></div>
        <div class="sum"><b style="color:#0A1B33">${leave.length}</b><span>请假</span></div>
      </div>
      <div class="sec"><b>解析结果</b><span class="tiny muted">共 ${rows.length} 条</span></div>
      <div>${rows.map(rowHtml).join('')}</div>
      <div style="height:14px"></div>` : `<div class="empty" style="padding-top:34px">
        粘好文本后点「解析文本」<br><span class="tiny">会自动对照花名册、识别请假和迟到</span></div>`}
    </div>
    ${rows ? `<div class="bottom">
      <button class="btn ghost" style="flex:0 0 110px" data-act="addone">手动录入</button>
      <button class="btn primary" data-act="confirm" data-id="${t.id}">确认导入（${ok.length}）</button>
    </div>` : ''}
  </div>`;
}

/* ================= 点名台 ================= */
function pageRollcall(id) {
  const t = TRAININGS.find(x => x.id === id);
  const ids = state.tsig[t.id] || t.signups;
  const c = checkinsOf(t);
  const cnt = countsOf(t);
  const segs = [['all', '全部', ids.length], ['off', '进攻', 0], ['def', '防守', 0], ['st', '特勤', 0]];
  const counts = { off: 0, def: 0, st: 0 };
  ids.forEach(pid => { counts[byId(pid).unit]++; });

  const shown = ids.filter(pid => state.seg === 'all' || byId(pid).unit === state.seg);

  const rcRow = pid => {
    const p = byId(pid);
    const st = c[pid] || '';
    const inj = injuryOf(pid);
    const tag = inj ? '<span class="tag red" style="height:18px;padding:0 6px;font-size:10px">伤停</span>'
      : st === 'leave' ? '<span class="tag gray" style="height:18px;padding:0 6px;font-size:10px">请假</span>' : '';
    return `<div class="rc">
      ${avatar(p, 'sm')}
      <div style="min-width:0">
        <div class="row g6"><span class="nm">${p.name}</span>${tag}</div>
        <div class="meta">${p.pos} ${POS_CN[p.pos]} · ${p.num} 号</div>
      </div>
      <div class="states">
        <button class="st ${st === 'present' ? 'p' : ''}" data-act="setstate" data-id="${t.id}" data-pid="${pid}" data-s="present">到</button>
        <button class="st ${st === 'late' ? 'l' : ''}" data-act="setstate" data-id="${t.id}" data-pid="${pid}" data-s="late">迟</button>
        <button class="st ${st === 'absent' ? 'a' : ''}" data-act="setstate" data-id="${t.id}" data-pid="${pid}" data-s="absent">缺</button>
      </div>
    </div>`;
  };

  const done = Math.min(cnt.present + cnt.late, cnt.total);

  return `<div class="page">
    <div class="dark">
      <div class="row between">
        <div>
          <h1>点名 · ${t.title}</h1>
          <div class="sub">${shortDate(t.date)} ${t.start} · 发起人：队长</div>
        </div>
        <div style="text-align:right">
          <div class="tiny" style="color:#8FB3E0">进行中</div>
          <div class="b" style="font-size:16px">02:14</div>
        </div>
      </div>
      <div class="counts">
        <div class="cnt"><b>${cnt.total}</b><span>应到</span></div>
        <div class="cnt"><b style="color:#37D39B">${cnt.present}</b><span>已到</span></div>
        <div class="cnt"><b style="color:#F5A524">${cnt.late}</b><span>迟到</span></div>
        <div class="cnt"><b style="color:#8FB3E0">${cnt.leave}</b><span>请假</span></div>
        <div class="cnt"><b style="color:#FF7A7A">${cnt.none}</b><span>未处理</span></div>
      </div>
    </div>

    <div class="seg">
      ${segs.map(([k, l, n]) => `<button class="${state.seg === k ? 'on' : ''}" data-act="seg" data-k="${k}">
        ${l} ${k === 'all' ? ids.length : counts[k]}</button>`).join('')}
    </div>

    <div class="scroll" style="padding-top:8px">
      ${shown.map(rcRow).join('') || '<div class="empty">这个分组没有人</div>'}
      <div class="tiny muted" style="text-align:center;padding:14px">共 ${shown.length} 人 · 上下滑动查看</div>
    </div>

    <div class="bottom">
      <button class="btn ghost" style="flex:0 0 110px" data-act="allpresent" data-id="${t.id}">全部出勤</button>
      <button class="btn primary" data-act="submit" data-id="${t.id}">提交点名（${cnt.present + cnt.late}/${cnt.total}）</button>
    </div>
  </div>`;
}

/* ================= 比赛详情 ================= */
function gapsOf(list) {
  const cnt = {};
  list.forEach(pid => { const p = byId(pid); cnt[p.pos] = (cnt[p.pos] || 0) + 1; });
  return Object.entries(REQ)
    .map(([pos, need]) => ({ pos, need, have: cnt[pos] || 0, gap: need - (cnt[pos] || 0) }))
    .filter(x => x.gap > 0)
    .sort((a, b) => b.gap - a.gap);
}

function pageMatch(id) {
  const m = MATCHES.find(x => x.id === id);
  const list = state.signups[m.id];
  const mine = list.includes(ME);
  const done = m.status === 'done';
  const injIds = activeInjuries().filter(i => !list.includes(i.pid)).map(i => i.pid);
  const gaps = gapsOf(list);
  const pct = Math.round(list.length / m.cap * 100);

  return `<div class="page">
    <div class="scroll">
      <div class="cover" style="padding-bottom:34px">
        <div class="row between" style="position:relative">
          <span class="back" data-act="back" style="font-size:24px">‹</span>
          <span class="tag" style="background:rgba(255,255,255,.16);color:#fff">${m.round}</span>
        </div>
        <div class="row between mt14" style="position:relative;align-items:flex-start">
          <div style="text-align:center;width:88px">
            <div style="width:56px;height:56px;border-radius:16px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;margin:0 auto">S</div>
            <div class="sm b mt8">Strikers</div>
          </div>
          <div style="text-align:center;padding-top:6px">
            <div style="font-size:26px;font-weight:800;letter-spacing:.06em">VS</div>
            <div class="tiny" style="color:#A9C4EA;margin-top:6px">${shortDate(m.date)} ${m.time}</div>
          </div>
          <div style="text-align:center;width:88px">
            <div style="width:56px;height:56px;border-radius:16px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;margin:0 auto">${m.opponent[0]}</div>
            <div class="sm b mt8">${m.opponent}</div>
          </div>
        </div>
        <div class="sm" style="text-align:center;color:#A9C4EA;margin-top:14px;position:relative">${m.venue} · ${m.home ? '主队' : '客场'} · 集合 12:30</div>
      </div>

      <div class="card stack">
        <div class="row between"><span class="b sm">报名进度</span>
          <span class="b sm" style="color:#1F6FEB">${list.length} / ${m.cap}</span></div>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <div class="row between mt8">
          <span class="tiny muted">还有 ${Math.max(0, m.cap - list.length)} 个名额</span>
          <span class="tiny muted">候补 ${Math.max(0, list.length - m.cap)} 人</span>
        </div>
        ${gaps.length ? `<div class="row g8 mt12" style="background:#F3F8FF;border:1px solid #DCE9FC;border-radius:10px;padding:9px 11px;color:#1557D6;font-size:11.5px">
          ${I.warn}<span>还缺 ${gaps.slice(0, 2).map(g => `${g.gap} 名 ${g.pos} ${POS_CN[g.pos]}`).join('、')}</span></div>` : ''}
      </div>

      <div class="card stack">
        <div class="row between"><span class="b sm">已报名名单</span>
          <span class="tiny muted" data-act="toast" data-msg="按位置分组查看">按位置分组</span></div>
        <div class="avatarwall mt10">
          ${list.slice(0, 8).map(pid => avatar(byId(pid))).join('')}
          ${list.length > 8 ? `<span class="tiny muted">+${list.length - 8}</span>` : ''}
        </div>
        ${injIds.length ? `<div class="tiny mt10" style="color:#C42929">${I.warn.replace('<svg', '<svg width="12" height="12" style="vertical-align:-2px"')} 伤停 ${injIds.length} 人不可报名：${injIds.map(pid => byId(pid).name).join('、')}</div>` : ''}
      </div>

      <div class="card stack">
        <div class="row between"><span class="sm muted">截止时间</span><span class="b sm">${m.deadline}</span></div>
        <div class="row between mt10"><span class="sm muted">我的状态</span>
          <span class="tag ${mine ? 'green' : 'gray'}">${mine ? '已报名' : '未报名'}</span></div>
        ${injuryOf(ME) ? `<div class="tiny mt10" style="color:#C42929">你处于伤停中，报名时需要二次确认，教练组会看到伤情</div>` : ''}
      </div>

      <div class="card stack">
        <div class="row between"><span class="b sm">历史交锋</span>
          <span class="tiny muted">近 ${H2H.length} 次 · ${H2H.filter(x => x.win).length} 胜 ${H2H.filter(x => !x.win).length} 负</span></div>
        ${H2H.map(h => `<div class="row between mt10">
          <span class="sm muted">${h.date} · ${h.home ? '主场' : '客场'}</span>
          <span class="sm b" style="color:${h.win ? '#0FA968' : '#C42929'}">${h.score} ${h.win ? '胜' : '负'}</span>
        </div>`).join('')}
      </div>

      <div class="card stack">
        <div class="b sm">赛前须知</div>
        <div class="sm mt10"><b style="color:#1F6FEB">1</b> 12:30 到场集合，迟到者顺延替补</div>
        <div class="sm mt8"><b style="color:#1F6FEB">2</b> 带齐头盔、护肩与白色客场球衣</div>
        <div class="sm mt8"><b style="color:#1F6FEB">3</b> 请假须在截止前提交，逾期记为缺席</div>
      </div>
      <div style="height:14px"></div>
    </div>

    ${done ? `<div class="bottom"><button class="btn dark" data-act="toast" data-msg="比赛已结束 · ${m.score}">比赛已结束 ${m.score}</button></div>`
      : `<div class="bottom">
        <button class="btn ghost" style="flex:0 0 110px" data-act="leavegame" data-id="${m.id}">请假</button>
        <button class="btn primary" data-act="rsvp" data-id="${m.id}">${mine ? '已报名 · 取消报名' : '我要报名'}</button>
      </div>`}
  </div>`;
}

/* ================= 我的 ================= */
function pageMe() {
  const me = byId(ME);
  const past = TRAININGS.filter(t => t.date < TODAY && t.checkins);
  let present = 0, late = 0, should = 0;
  past.forEach(t => {
    const s = t.checkins[ME];
    if (s === 'present' || s === 'late') { should++; if (s === 'present') present++; else late++; }
  });
  const attended = present + late;
  const rate = should ? Math.round(attended / should * 100) : 0;
  const inj = injuryOf(ME);
  const recent = [...TRAININGS].filter(t => t.checkins && t.date <= TODAY)
    .sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  return `<div class="page">
    <div class="scroll">
      <div class="me">
        <div class="row g12">
          ${avatar(byId(ME), 'lg')}
          <div style="flex:1">
            <h2>${me.name}</h2>
            <div class="meta">${me.pos} ${POS_CN[me.pos]} · ${me.num} 号 · 2024 年入队</div>
          </div>
          <div class="numbadge">${me.num}</div>
        </div>
      </div>

      <div class="stats">
        <div class="stat"><b>${attended}</b><span>出勤次数</span></div>
        <div class="stat"><b style="color:#0FA968">${rate}%</b><span>出勤率</span></div>
        <div class="stat"><b style="color:#F5A524">${late}</b><span>迟到</span></div>
      </div>

      <div class="list mt14">
        <button class="li" data-act="go" data-to="#/injury"><i>${I.cross}</i>我的伤病记录
          ${inj ? '<span class="tag red" style="margin-left:8px">伤停中</span>' : ''}<span class="chev">›</span></button>
        <button class="li" data-act="mygames"><i>${I.clip}</i>我的报名<span class="chev">›</span></button>
        <button class="li" data-act="go" data-to="#/stats"><i>${I.chart}</i>出勤明细与统计口径<span class="chev">›</span></button>
      </div>

      <div class="card stack" style="padding:14px 16px">
        <div class="row between"><span class="b sm">最近训练</span>
          <span class="tiny" style="color:#1F6FEB" data-act="go" data-to="#/stats">全部 ›</span></div>
        ${recent.map(t => {
          const s = t.checkins[ME];
          const map = { present: ['到', 'green'], late: ['迟', 'amber'], absent: ['缺', 'red'], leave: ['假', 'gray'] };
          const [txt, cls] = map[s] || ['—', 'gray'];
          return `<div class="row between mt10">
            <div style="min-width:0">
              <div class="sm">${t.title}</div>
              <div class="tiny muted mt6">${t.date} · ${t.venue}</div>
            </div>
            <span class="tag ${cls}">${txt}</span>
          </div>`;
        }).join('')}
      </div>

      <div class="list mt12">
        <button class="li" data-act="toast" data-msg="消息中心：3 条未读"><i>${I.bell}</i>消息中心
          <span class="tag blue" style="margin-left:8px">3</span><span class="chev">›</span></button>
        <button class="li" data-act="toast" data-msg="订阅消息提醒：生日、赛前、点名三类"><i>${I.gear}</i>提醒设置<span class="chev">›</span></button>
        <button class="li" data-act="toast" data-msg="管理入口：仅队长与管理员可见"><i>${I.shield}</i>管理入口
          <span class="tag gray" style="margin-left:8px">队长</span><span class="chev">›</span></button>
      </div>
      <div style="height:16px"></div>
    </div>
  </div>`;
}

/* ================= 伤病 ================= */
function pageInjury() {
  const mine = state.injuries.filter(i => i.pid === ME);
  const active = mine.find(i => i.status === 'active');
  const healed = mine.filter(i => i.status === 'healed');

  return `<div class="page">
    <div class="scroll">
      ${navBar('伤病记录', '<span data-act="newinj" style="font-size:22px">＋</span>')}
      ${active ? `<div class="injhero">
        <div class="lbl">当前状态</div>
        <h2>伤停中 · ${active.part}</h2>
        <div class="sm mt6" style="color:#F5B8C2">${active.type} · ${active.level} · ${md(active.from).m}月${md(active.from).d}日受伤</div>
        <div class="injkv">
          <div><span>预计复出</span><b>${md(active.expect).m}月${md(active.expect).d}日</b></div>
          <div><span>已伤停</span><b>${Math.max(1, Math.round((new Date(TODAY) - new Date(active.from)) / 86400000))} 天</b></div>
          <div><span>影响</span><b>训练 / 比赛</b></div>
        </div>
      </div>` : `<div class="card stack" style="text-align:center;padding:26px 16px">
        <div class="b">目前没有进行中的伤病</div>
        <div class="tiny muted mt6">受伤后自己或队长登记，方便排阵和报名时提醒</div>
      </div>`}

      <div class="sec"><b>康复进展</b><span class="tiny muted">仅本人与队长可见</span></div>
      <div class="card stack" style="padding-top:16px">
        <div class="tl">
          ${(active ? active.logs : []).map(([d, txt, by], i) => `<div class="tli ${i === 0 ? '' : 'done'}">
            <div class="sm b">${txt}</div>
            <div class="tiny muted mt6">${md(d).m}月${md(d).d}日 · ${by}更新</div>
          </div>`).join('') || '<div class="tli"><div class="sm muted">暂无记录</div></div>'}
        </div>
      </div>

      <div class="sec"><b>历史记录</b><span class="tiny muted">共 ${mine.length} 次</span></div>
      <div style="margin:0 16px">
        ${healed.map(i => {
          const days = Math.max(1, Math.round((new Date(i.expect) - new Date(i.from)) / 86400000));
          return `<div class="card flat" style="padding:13px 14px;margin-bottom:8px">
            <div class="row between"><span class="b sm">${i.part} ${i.type}</span>
              <span class="tag green">已康复</span></div>
            <div class="tiny muted mt6">${i.from} → ${i.expect} · 共 ${days} 天</div>
          </div>`;
        }).join('')}
      </div>

      <div class="sec"><b>全队伤停（管理者视角）</b><span class="tiny muted">${activeInjuries().length} 人</span></div>
      <div style="margin:0 16px">
        ${activeInjuries().map(i => {
          const p = byId(i.pid);
          return `<div class="card flat" style="padding:11px 14px;margin-bottom:8px">
            <div class="row g10">${avatar(p, 'sm')}
              <div style="flex:1"><div class="sm b">${p.name} <span class="tiny muted">${p.pos}</span></div>
                <div class="tiny muted mt6">${i.part} · ${i.level} · 预计 ${md(i.expect).m}-${md(i.expect).d} 复出</div></div>
              <span class="tag red">伤停</span></div>
          </div>`;
        }).join('')}
      </div>
      <div style="height:16px"></div>
    </div>
    ${active ? `<div class="bottom"><button class="btn primary" data-act="heal">标记为已康复</button></div>` : ''}
  </div>`;
}

/* ================= 出勤明细 ================= */
function pageStats() {
  const past = TRAININGS.filter(t => t.date < TODAY && t.checkins).sort((a, b) => b.date.localeCompare(a.date));
  const attended = past.filter(t => t.checkins[ME] === 'present' || t.checkins[ME] === 'late').length;
  const lateN = past.filter(t => t.checkins[ME] === 'late').length;
  const rate = past.length ? Math.round(attended / past.length * 100) : 0;
  const rows = past.map(t => {
    const s = t.checkins[ME];
    const map = { present: ['出勤', 'green'], late: ['迟到', 'amber'], absent: ['缺席', 'red'], leave: ['请假', 'gray'] };
    const [txt, cls] = map[s] || ['未统计', 'gray'];
    return `<div class="li" style="cursor:default">
      <div style="flex:1"><div class="sm b">${t.title}</div>
        <div class="tiny muted mt6">${t.date} · ${t.venue}</div></div>
      <span class="tag ${cls}">${txt}</span>
    </div>`;
  }).join('');

  return `<div class="page">
    <div class="scroll">
      ${navBar('出勤明细')}
      <div class="stats" style="margin:0 16px 0">
        <div class="stat"><b>${attended}</b><span>出勤 / 应到 ${past.length} 场</span></div>
        <div class="stat"><b style="color:#0FA968">${rate}%</b><span>出勤率</span></div>
        <div class="stat"><b style="color:#F5A524">${lateN}</b><span>迟到</span></div>
      </div>
      <div class="card flat" style="margin:12px 16px 0;padding:14px">
        <div class="b sm">统计口径</div>
        <div class="tiny muted mt8" style="line-height:1.7">
          应到 = 报名「参加」+ 训练已结束 + 已点名；<br>
          未点名的场次不计入（显示为「未统计」）；<br>
          迟到单独计次；请假与伤停不计入应到。
        </div>
      </div>
      <div class="sec"><b>逐场记录</b><span class="tiny muted">${past.length} 场</span></div>
      <div class="list" style="margin-top:0">${rows}</div>
      <div style="height:16px"></div>
    </div>
  </div>`;
}

/* ================= 公告 ================= */
function pageNotices() {
  return `<div class="page">
    <div class="scroll">
      ${navBar('球队公告')}
      <div class="list" style="margin-top:0">
        ${NOTICES.map(n => `<div class="li" style="cursor:default;align-items:flex-start">
          <div style="flex:1"><div class="sm b">${n.title}</div>
            <div class="tiny muted mt6">${n.by} · ${n.time}</div></div>
        </div>`).join('')}
      </div>
      <div class="card flat" style="margin:12px 16px;padding:13px">
        <div class="tiny muted">公告由队长/管理员发布，支持群转发；原型阶段只读。</div>
      </div>
    </div>
  </div>`;
}

/* ================= 发布训练 ================= */
function pageNewTraining() {
  return `<div class="page">
    <div class="scroll">
      ${navBar('发布训练', '<span data-act="toast" data-msg="发布后自动推送报名提醒">发布</span>', false)}
      <div class="field"><label>训练名称</label><input value="周五常规训练" id="f-title"></div>
      <div class="field"><label>日期</label><input value="2026-11-13" id="f-date"></div>
      <div class="field"><label>时间</label><input value="19:00 - 21:00" id="f-time"></div>
      <div class="field"><label>地点</label><input value="城南体育公园 3 号场" id="f-venue"></div>
      <div class="field"><label>人数上限</label><input value="30" id="f-cap"></div>
      <div class="sec"><b>训练类型</b></div>
      <div class="pad"><div class="chips" id="f-type">
        ${['常规训练', '对抗训练', '恢复训练', '战术课'].map((x, i) =>
          `<button class="chip ${i === 0 ? 'on' : ''}" data-act="chip">${x}</button>`).join('')}
      </div></div>
      <div style="height:24px"></div>
    </div>
    <div class="bottom"><button class="btn primary" data-act="publishtraining">发布并推送</button></div>
  </div>`;
}

/* ================= 发起约练 ================= */
function pageNewPickup() {
  return `<div class="page">
    <div class="scroll">
      ${navBar('发起约练', '', false)}
      <div class="card flat" style="margin:0 16px;padding:14px">
        <div class="tiny muted" style="line-height:1.7">自由约练不需要队长审批，发起后队友可以直接报名，人数够了自动成局。</div>
      </div>
      <div class="field mt14"><label>主题</label><input value="周末加练：接球 + 路线" id="p-title"></div>
      <div class="field"><label>时间</label><input value="2026-11-09 10:00" id="p-time"></div>
      <div class="field"><label>地点</label><input value="城南体育公园" id="p-venue"></div>
      <div class="field"><label>需要人数</label><input value="8" id="p-cap"></div>
      <div style="height:24px"></div>
    </div>
    <div class="bottom"><button class="btn primary" data-act="publishpickup">发布约练</button></div>
  </div>`;
}

/* ================= 事件 ================= */
const ACT = {
  back() { history.length > 1 ? history.back() : go('#/home'); },
  tab(d) { go('#/' + d.to); },
  go(d) { go(d.to); },
  toast(d) { toast(d.msg); },

  month(d) {
    state.monthOffset += Number(d.d);
    if (state.monthOffset < 0) state.monthOffset = 0;
    render();
  },
  pickday(d) { state.day = d.day; render(); },
  seg(d) { state.seg = d.k; render(); },

  setstate(d) {
    const t = TRAININGS.find(x => x.id === d.id);
    const c = checkinsOf(t);
    c[d.pid] = c[d.pid] === d.s ? '' : d.s;
    render();
  },
  allpresent(d) {
    const t = TRAININGS.find(x => x.id === d.id);
    const c = checkinsOf(t);
    (state.tsig[t.id] || t.signups).forEach(pid => {
      if (!c[pid]) c[pid] = 'present';
    });
    toast('已把未处理的人标为出勤');
    render();
  },
  submit(d) {
    const t = TRAININGS.find(x => x.id === d.id);
    const c = checkinsOf(t);
    const left = Object.values(c).filter(x => !x).length;
    if (left) { toast(`还有 ${left} 人未处理，可以再点一次「全部出勤」`); return; }
    t.checkins = { ...c };
    toast('点名已提交，出勤已入账');
    go('#/training/' + t.id);
  },

  join(d) {
    const t = TRAININGS.find(x => x.id === d.id);
    const list = state.tsig[t.id];
    const i = list.indexOf(ME);
    if (i >= 0) { list.splice(i, 1); toast('已取消报名'); }
    else { list.push(ME); toast('报名成功，训练前会提醒你'); }
    render();
  },

  rsvp(d) {
    const list = state.signups[d.id];
    const i = list.indexOf(ME);
    if (i >= 0) { list.splice(i, 1); toast('已取消报名'); render(); return; }
    if (injuryOf(ME)) {
      openSheet(`<h3>你当前处于伤停中</h3>
        <div style="padding:0 18px 12px" class="tiny muted">教练组会看到你的伤停记录。确认要报名吗？</div>
        <button class="opt" data-act="rsvp-force" data-id="${d.id}">仍要报名</button>
        <button class="opt" data-act="close">先不报</button>`);
      return;
    }
    list.push(ME); toast('报名成功'); render();
  },
  'rsvp-force'(d) {
    state.signups[d.id].push(ME); closeSheet(); toast('已报名，注意伤病防护'); render();
  },
  leavegame(d) {
    openSheet(`<h3>请假</h3>
      <div style="padding:0 18px 12px" class="tiny muted">请假后名额释放给候补，截止前可以撤销。</div>
      <button class="opt" data-act="toast" data-msg="已提交请假，队里会看到">因伤病请假</button>
      <button class="opt" data-act="toast" data-msg="已提交请假，队里会看到">因事请假</button>
      <button class="opt" data-act="close">取消</button>`);
  },
  close() { closeSheet(); },

  fill() {
    state.pasteText = SAMPLE;
    const el = document.getElementById('paste');
    if (el) el.value = SAMPLE;
    toast('已填入示例接龙');
  },
  parse() {
    const el = document.getElementById('paste');
    const text = el ? el.value : SAMPLE;
    state.pasteText = text;
    state.rollcall = parseRollcall(text);
    render();
    const n = state.rollcall.length;
    toast(n ? `解析出 ${n} 条，其中 ${state.rollcall.filter(r => r.warn).length} 条待确认` : '没识别到内容，检查一下格式');
  },
  pick(d) {
    const rows = state.rollcall;
    const row = rows[Number(d.i)];
    const cands = row.cands.length ? row.cands : PEOPLE.map(p => p.id);
    openSheet(`<h3>指定队员 · ${esc(row.name)}</h3>
      <div class="optlist">${cands.map(pid => {
        const p = byId(pid);
        return `<button class="opt" data-act="assign" data-i="${d.i}" data-pid="${pid}">
          ${avatar(p, 'sm')}<div><div>${p.name}</div><div class="meta">${p.pos} ${POS_CN[p.pos]} · ${p.num} 号</div></div></button>`;
      }).join('')}</div>`);
  },
  assign(d) {
    const row = state.rollcall[Number(d.i)];
    const p = byId(d.pid);
    row.pid = p.id; row.warn = false; row.how = '人工指定 · ' + p.name;
    closeSheet(); render(); toast(`已指定为 ${p.name}`);
  },
  addone() {
    toast('手动录入：原型直接改文本再解析');
  },
  confirm(d) {
    const t = TRAININGS.find(x => x.id === d.id);
    const rows = state.rollcall;
    const warn = rows.filter(r => r.warn);
    if (warn.length) { toast(`还有 ${warn.length} 条待确认，先指定或删掉`); return; }
    const c = checkinsOf(t);
    const list = state.tsig[t.id];
    rows.forEach(r => {
      if (!r.pid) return;
      if (!list.includes(r.pid)) list.push(r.pid);
      c[r.pid] = r.status === 'leave' ? 'leave' : r.status === 'late' ? 'late' : 'present';
    });
    t.rollcall = rows;
    state.rollcall = null;
    toast(`已导入 ${rows.length} 条，去点名台核对`);
    go('#/rollcall/' + t.id);
  },

  mygames() {
    const rows = MATCHES.filter(m => state.signups[m.id].includes(ME));
    openSheet(`<h3>我的报名</h3><div class="optlist">${rows.map(m =>
      `<button class="opt" data-act="go" data-to="#/match/${m.id}">
        <div><div>vs ${m.opponent}</div><div class="meta">${m.date} ${m.time}</div></div>
        <span class="tag ${m.status === 'done' ? 'gray' : 'green'}" style="margin-left:auto">${m.status === 'done' ? '已结束' : '已报名'}</span>
      </button>`).join('')}</div>`);
  },

  newinj() {
    openSheet(`<h3>新增伤病记录</h3>
      <div style="padding:0 18px 8px"><div class="chips">
        ${['右侧膝盖', '左脚踝', '右肩', '腰部', '头部'].map((x, i) =>
          `<button class="chip ${i === 0 ? 'on' : ''}" data-act="chip">${x}</button>`).join('')}
      </div></div>
      <div style="padding:4px 18px 8px" class="tiny muted">受伤部位、类型、严重程度可继续补全；队友只会看到「伤停中」角标。</div>
      <button class="opt" data-act="saveinj">保存</button>`);
  },
  saveinj() {
    state.injuries.push({
      id: 'i' + Date.now(), pid: ME, part: '右侧膝盖', type: '内侧副韧带扭伤',
      level: '中度', from: TODAY, expect: '2026-11-20', status: 'active',
      logs: [[TODAY, '新建伤病记录', '本人']]
    });
    closeSheet(); toast('已记录，队长会收到提醒'); render();
  },
  heal() {
    const a = state.injuries.find(i => i.pid === ME && i.status === 'active');
    if (a) { a.status = 'healed'; toast('已标记康复，训练可以正常参加'); }
    render();
  },
  chip(el) {
    const box = el.parentElement;
    [...box.querySelectorAll('.chip')].forEach(c => c.classList.remove('on'));
    el.classList.add('on');
  },

  publishtraining() {
    const g = id => document.getElementById(id)?.value || '';
    const t = {
      id: 't' + Date.now(), date: g('f-date'), start: (g('f-time').split('-')[0] || '19:00').trim(),
      end: (g('f-time').split('-')[1] || '21:00').trim(), title: g('f-title'),
      venue: g('f-venue'), cap: Number(g('f-cap')) || 30,
      type: document.querySelector('#f-type .chip.on')?.textContent || '常规训练',
      signups: [ME], checkins: null,
      plan: [['热身与拉伸', '19:00', '19:15'], ['战术演练', '19:15', '19:50'], ['全场对抗', '19:50', '21:00']]
    };
    TRAININGS.push(t);
    state.tsig[t.id] = [ME];
    toast('已发布，报名提醒已推送到群里');
    go('#/training/' + t.id);
  },
  publishpickup() {
    toast('约练已发布，队友可以直接报名');
    setTimeout(() => go('#/trainings'), 700);
  }
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const fn = ACT[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el.dataset, el); }
});

/* ---------- 启动 ---------- */
$tab.innerHTML = tabBar();
if (!location.hash) location.hash = '#/home';
/* 截图/演示用：?parse=1 直接展示解析结果，?full=1 展示已填满的点名 */
const QS = new URLSearchParams(location.search);
if (QS.get('parse') === '1') state.rollcall = parseRollcall(SAMPLE);
if (QS.get('full') === '1') {
  const c = checkinsOf(TRAININGS.find(x => x.id === 't1'));
  Object.keys(c).forEach(pid => { if (!c[pid]) c[pid] = 'present'; });
}
render();

/* ---------- 自检：?selftest=1 ---------- */
if (QS.get('selftest') === '1') {
  const out = [];
  const ok = (c, m) => out.push((c ? '✓ ' : '✗ ') + m);
  try {
    const rows = parseRollcall(SAMPLE);
    ok(rows.length === 7, `接龙解析 7 条（实际 ${rows.length}）`);
    ok(rows.filter(r => r.warn).length === 2, `待确认 2 条（实际 ${rows.filter(r => r.warn).length}）`);
    ok(rows[3].status === 'leave', '「陈晨 请假」识别为请假');
    ok(rows[1].guests === 1, '「李强 带朋友」识别随行 1 人');
    ok(rows[2].status === 'late', '「王磊 迟到20分钟」识别为迟到');
    ok(byId(rows[6].pid).name === '周杰', '「3号」按球衣号匹配到周杰');

    location.hash = '#/importer/t1'; render();
    document.querySelector('[data-act="parse"]').click();
    ok(document.querySelectorAll('.imp').length === 7, `点「解析文本」后出现 7 行结果（实际 ${document.querySelectorAll('.imp').length}）`);

    document.querySelector('[data-act="pick"]').click();
    const hasSheet = document.querySelectorAll('.sheet .opt').length > 0;
    ok(hasSheet, '点「指定」弹出队员选择面板');
    document.querySelector('.sheet .opt').click();
    ok(document.querySelectorAll('.imp.warn').length === 1, `指定后待确认剩 1 条（实际 ${document.querySelectorAll('.imp.warn').length}）`);

    location.hash = '#/rollcall/t1'; render();
    const before = document.querySelector('.cnt b').textContent;
    document.querySelector('.st').click();
    ok(document.querySelector('.cnt b').textContent === before, '点名标记不改变「应到」人数');

    location.hash = '#/match/m1'; render();
    const cntBefore = state.signups.m1.length;
    document.querySelector('[data-act="rsvp"]').click();
    const sheetOpen = document.querySelectorAll('.sheet .opt').length === 2;
    ok(sheetOpen, '伤停中报名弹出二次确认');
    document.querySelector('.sheet .opt').click();
    ok(state.signups.m1.length === cntBefore - 1, '确认后取消报名，名单 -1');

    location.hash = '#/training/t1'; render();
    ok(document.querySelector('.avatarwall').children.length > 3, '训练详情渲染报名头像墙');
  } catch (e) {
    out.push('✗ 异常：' + e.message);
  }
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;inset:0;background:#0A1526;color:#E6EEF9;padding:16px;font:12px/1.9 ui-monospace,Consolas,monospace;z-index:999;overflow:auto';
  box.innerHTML = '<div style="font-size:14px;font-weight:700;margin-bottom:10px;color:#7FB2FF">原型自检</div>'
    + out.map(l => `<div style="color:${l[0] === '✓' ? '#37D39B' : '#FF7A7A'}">${l}</div>`).join('');
  document.body.appendChild(box);
}
