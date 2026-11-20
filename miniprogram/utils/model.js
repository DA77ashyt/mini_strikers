// 数据访问层：页面只调这里，不直接拼数据。
// 之后接云开发，只需要在这一层把 db.* 换成云函数返回结果，页面不用改。
const db = require('../data/db.js');

const byId = (list) => {
  const map = {};
  list.forEach((x) => { map[x.id] = x; });
  return map;
};

const peopleMap = byId(db.PEOPLE);
const photoMap = byId(db.PHOTOS);
const eventMap = byId(db.EVENTS);
const storyMap = byId(db.STORIES);

function person(id) { return peopleMap[id] || null; }
function photo(id) { return photoMap[id] || null; }
function event(id) { return eventMap[id] || null; }
function story(id) { return storyMap[id] || null; }

function personName(id) {
  const p = person(id);
  return p ? p.name : '未知';
}

function avatarOf(id) {
  const p = person(id);
  return p ? p.name.slice(0, 1) : '?';
}

function byNewest(a, b) {
  if (a.date === b.date) return 0;
  return a.date < b.date ? 1 : -1;
}

function events() { return db.EVENTS.slice().sort(byNewest); }
function photos() { return db.PHOTOS.slice().sort(byNewest); }
function eventsByYear(year) { return events().filter((e) => e.year === year); }
function photosByYear(year) { return photos().filter((p) => p.year === year); }
function eventsOfPerson(id) { return events().filter((e) => (e.people || []).indexOf(id) >= 0); }
function photosOfPerson(id) { return photos().filter((p) => (p.people || []).indexOf(id) >= 0); }
function memoriesOfPerson(id) { return db.MEMORIES.filter((m) => m.person === id); }
function storyOfEvent(e) { return e && e.story ? story(e.story) : null; }
function photoOfEvent(e) { return e && e.photos && e.photos.length ? photo(e.photos[0]) : null; }
function peopleOf(arr) { return (arr || []).map((id) => person(id)).filter(Boolean); }

// 年份列表（含条数），相册与编年共用
function yearStats() {
  const ys = [];
  for (let y = db.TEAM.years[1]; y >= db.TEAM.years[0]; y -= 1) ys.push(y);
  return ys.map((y) => ({
    year: y,
    photos: photosByYear(y).length,
    events: eventsByYear(y).length
  })).filter((x) => x.photos || x.events);
}

// 2016–  /  2016–2019
function yearsRange(p) {
  if (!p) return '';
  return p.to ? `${p.from}–${p.to}` : `${p.from}–`;
}

function yearsOnTeam(p) {
  if (!p) return 0;
  const end = p.to || db.TEAM.years[1];
  return Math.max(1, end - p.from);
}

// '2016.09.18' → '09.18'
function shortDate(d) { return String(d).slice(5); }

function kindName(kind) { return db.KINDS[kind] || ''; }

function unitCn(pos) { return db.POS_CN[pos] || pos || ''; }
function posLabel(p) { return p ? `${p.pos} · ${unitCn(p.pos)}` : ''; }

// 随机翻一页（首页「随便翻一页」）
function randomPhoto(excludeId) {
  const pool = db.PHOTOS.filter((p) => p.id !== excludeId);
  return pool[Math.floor(Math.random() * pool.length)];
}

module.exports = {
  raw: db,
  TEAM: db.TEAM,
  KINDS: db.KINDS,
  STATS: db.STATS,
  QUOTE: db.QUOTE,
  RECORDS: db.RECORDS,
  RETIRED: db.RETIRED,
  MY: db.MY,
  allPeople: db.PEOPLE,
  allStories: db.STORIES,
  allMemories: db.MEMORIES,
  person,
  photo,
  event,
  story,
  personName,
  avatarOf,
  peopleOf,
  events,
  photos,
  eventsByYear,
  photosByYear,
  eventsOfPerson,
  photosOfPerson,
  memoriesOfPerson,
  storyOfEvent,
  photoOfEvent,
  yearStats,
  yearsRange,
  yearsOnTeam,
  shortDate,
  kindName,
  unitCn,
  posLabel,
  randomPhoto
};
