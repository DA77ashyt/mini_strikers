const M = require('../../utils/model');

Page({
  data: {
    p: null,
    idx: 0,
    total: 0,
    people: [],
    event: null,
    kind: ''
  },

  onLoad(q) {
    this.show(q.id);
  },

  show(id) {
    const list = M.photos();
    const p = M.photo(id) || list[0];
    if (!p) return;
    const idx = list.findIndex((x) => x.id === p.id);
    const ev = M.raw.EVENTS.filter((e) => (e.photos || []).indexOf(p.id) >= 0)[0] || null;
    this.setData({
      p,
      idx: idx + 1,
      total: list.length,
      kind: M.kindName(p.kind),
      people: (p.people || []).map((pid) => {
        const per = M.person(pid);
        return { id: pid, name: per ? per.name : '', ch: per ? per.name.slice(0, 1) : '?', pos: per ? M.unitCn(per.pos) : '' };
      }),
      event: ev ? { id: ev.id, title: ev.title, d: M.shortDate(ev.date), kindName: M.kindName(ev.kind) } : null
    });
    wx.setNavigationBarTitle({ title: p.title });
  },

  openPerson(e) {
    wx.navigateTo({ url: '/pages/person/index?id=' + e.currentTarget.dataset.id });
  },

  openEvent() {
    const ev = this.data.event;
    if (!ev) return;
    const raw = M.event(ev.id);
    const st = M.storyOfEvent(raw);
    if (st) return wx.navigateTo({ url: '/pages/story/index?id=' + st.id });
    wx.showToast({ title: ev.title, icon: 'none' });
  },

  prev() {
    const list = M.photos();
    const i = list.findIndex((x) => x.id === this.data.p.id);
    this.show(list[(i - 1 + list.length) % list.length].id);
  },

  next() {
    const list = M.photos();
    const i = list.findIndex((x) => x.id === this.data.p.id);
    this.show(list[(i + 1) % list.length].id);
  }
});
