// 数据契约校验（小程序与命令行共用，纯函数、无 wx API）
// 返回 { ok, errors: string[], counts: {} }
function validate(db) {
  const errors = [];
  const err = (m) => errors.push(m);

  const ids = (list) => list.map((x) => x.id);
  const dup = (name, list) => {
    const seen = {};
    list.forEach((x) => {
      if (seen[x.id]) err(`${name} 存在重复 id：${x.id}`);
      seen[x.id] = 1;
    });
  };

  const [y0, y1] = db.TEAM.years;
  const personIds = new Set(ids(db.PEOPLE));
  const photoIds = new Set(ids(db.PHOTOS));
  const eventIds = new Set(ids(db.EVENTS));

  dup('EVENTS', db.EVENTS);
  dup('PHOTOS', db.PHOTOS);
  dup('PEOPLE', db.PEOPLE);
  dup('STORIES', db.STORIES);

  const yearOf = (item, name) => {
    if (item.year < y0 || item.year > y1) err(`${name} ${item.id} 的年份 ${item.year} 超出 ${y0}–${y1}`);
    if (!String(item.date).startsWith(String(item.year))) err(`${name} ${item.id} 的日期 ${item.date} 与年份 ${item.year} 不一致`);
  };

  db.EVENTS.forEach((e) => {
    yearOf(e, '事件');
    if (!db.KINDS[e.kind]) err(`事件 ${e.id} 的类型 ${e.kind} 未在 KINDS 中定义`);
    (e.people || []).forEach((p) => { if (!personIds.has(p)) err(`事件 ${e.id} 引用了不存在的成员 ${p}`); });
    (e.photos || []).forEach((p) => { if (!photoIds.has(p)) err(`事件 ${e.id} 引用了不存在的照片 ${p}`); });
    if (e.story && !ids(db.STORIES).includes(e.story)) err(`事件 ${e.id} 引用了不存在的长文 ${e.story}`);
  });

  db.PHOTOS.forEach((p) => {
    yearOf(p, '照片');
    if (!db.RATIOS.includes(p.ratio)) err(`照片 ${p.id} 的比例 ${p.ratio} 不在 ${db.RATIOS.join(' / ')} 里`);
    (p.people || []).forEach((x) => { if (!personIds.has(x)) err(`照片 ${p.id} 引用了不存在的成员 ${x}`); });
  });

  db.STORIES.forEach((s) => {
    yearOf(s, '长文');
    if (s.person && !personIds.has(s.person)) err(`长文 ${s.id} 引用了不存在的成员 ${s.person}`);
    (s.photos || []).forEach((x) => { if (!photoIds.has(x)) err(`长文 ${s.id} 引用了不存在的照片 ${x}`); });
    if (!Array.isArray(s.paras) || !s.paras.length) err(`长文 ${s.id} 没有正文`);
  });

  db.MEMORIES.forEach((m, i) => {
    if (m.person && !personIds.has(m.person)) err(`记忆 #${i} 引用了不存在的成员 ${m.person}`);
    if (m.year < y0 || m.year > y1) err(`记忆 #${i} 的年份 ${m.year} 超出范围`);
  });

  const activeNums = {};
  db.PEOPLE.forEach((p) => {
    if (p.status === 'active') {
      if (activeNums[p.num]) err(`现役号码 ${p.num} 重复：${activeNums[p.num]} / ${p.name}`);
      activeNums[p.num] = p.name;
      if (p.to !== null && p.to !== undefined) err(`现役成员 ${p.name} 不应有毕业年份`);
    } else if (p.status === 'alumni') {
      if (!p.to) err(`已毕业成员 ${p.name} 缺少毕业年份`);
    } else {
      err(`成员 ${p.name} 的 status 只能是 active / alumni`);
    }
    if (!/^[A-Z]{1,2}$/.test(p.pos)) err(`成员 ${p.name} 的位置代码 ${p.pos} 不合法`);
  });

  db.RETIRED.forEach((r) => {
    if (activeNums[r.num]) err(`退役号码 ${r.num} 仍被现役成员 ${activeNums[r.num]} 使用`);
  });

  return {
    ok: errors.length === 0,
    errors,
    counts: {
      事件: db.EVENTS.length,
      照片: db.PHOTOS.length,
      成员: db.PEOPLE.length,
      已毕业: db.PEOPLE.filter((p) => p.status === 'alumni').length,
      长文: db.STORIES.length,
      记忆: db.MEMORIES.length,
      退役号码: db.RETIRED.length
    }
  };
}

module.exports = validate;
