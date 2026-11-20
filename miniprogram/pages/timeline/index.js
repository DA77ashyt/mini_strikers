const M = require('../../utils/model');

Page({
  data: {
    years: [],
    active: 0,
    groups: []
  },

  onLoad() {
    const stat = M.yearStats(); // 新 → 旧
    const groups = stat.map((s) => ({
      year: s.year,
      events: M.eventsByYear(s.year).map((e) => {
        const cover = M.photoOfEvent(e);
        const ppl = (e.people || []).slice(0, 4).map((id) => ({ id, ch: M.avatarOf(id) }));
        return {
          id: e.id,
          d: M.shortDate(e.date),
          kind: M.kindName(e.kind),
          title: e.title,
          summary: e.summary,
          kind_raw: cover ? cover.kind : 'field',
          ratio: cover ? cover.ratio : '4/3',
          people: ppl,
          hasStory: !!e.story
        };
      })
    }));
    this.setData({ years: stat.map((s) => s.year), active: stat.length ? stat[0].year : 0, groups });
  },

  jump(e) {
    const y = e.currentTarget.dataset.year;
    this.setData({ active: y });
    wx.pageScrollTo({ selector: '#y' + y, duration: 280, offsetTop: -120 });
  },

  onScroll() {},

  openEvent(e) {
    const ev = M.event(e.currentTarget.dataset.id);
    const st = M.storyOfEvent(ev);
    if (st) return wx.navigateTo({ url: '/pages/story/index?id=' + st.id });
    const p = M.photoOfEvent(ev);
    if (p) return wx.navigateTo({ url: '/pages/photo/index?id=' + p.id });
    wx.showToast({ title: '这条还没有照片', icon: 'none' });
  }
});
