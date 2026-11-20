const M = require('../../utils/model');

Page({
  data: {
    p: null,
    years: '',
    statusText: '',
    cover: 'portrait',
    stats: null,
    honors: [],
    memories: [],
    photos: [],
    events: []
  },

  onLoad(q) {
    const p = M.person(q.id) || M.allPeople[0];
    if (!p) return;
    const ph = M.photosOfPerson(p.id);
    const ev = M.eventsOfPerson(p.id).slice(0, 4).map((e) => ({
      id: e.id,
      d: M.shortDate(e.date),
      title: e.title,
      kindName: M.kindName(e.kind),
      hasStory: !!e.story
    }));
    this.setData({
      p: {
        id: p.id,
        name: p.name,
        num: p.num,
        pos: p.pos,
        unit: M.unitCn(p.pos),
        years: M.yearsRange(p),
        quote: p.quote || '',
        ch: p.name.slice(0, 1)
      },
      cover: ph.length ? ph[0].kind : 'portrait',
      years: M.yearsOnTeam(p),
      statusText: p.status === 'active' ? '现役' : (p.to ? p.to + ' 年毕业' : '已离队'),
      stats: { shots: ph.length, honors: (p.honors || []).length, years: M.yearsOnTeam(p) },
      honors: p.honors || [],
      memories: M.memoriesOfPerson(p.id),
      photos: ph.slice(0, 6),
      events: ev
    });
    wx.setNavigationBarTitle({ title: p.name });
  },

  openPhoto(e) {
    wx.navigateTo({ url: '/pages/photo/index?id=' + e.currentTarget.dataset.id });
  },

  openEvent(e) {
    const ev = M.event(e.currentTarget.dataset.id);
    const st = M.storyOfEvent(ev);
    if (st) return wx.navigateTo({ url: '/pages/story/index?id=' + st.id });
    const p = M.photoOfEvent(ev);
    if (p) return wx.navigateTo({ url: '/pages/photo/index?id=' + p.id });
  }
});
