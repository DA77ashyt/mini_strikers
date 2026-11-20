const M = require('../../utils/model');

Page({
  data: {
    s: null,
    kindName: '',
    author: { name: '', ch: '', pos: '', years: '', id: '' },
    cover: null,
    inner: null
  },

  onLoad(q) {
    const s = M.story(q.id) || M.allStories[0];
    if (!s) return;
    const per = M.person(s.person);
    const covers = (s.photos || []).map((id) => M.photo(id)).filter(Boolean);
    const ev = M.raw.EVENTS.filter((e) => e.story === s.id)[0];
    this.setData({
      s,
      kindName: ev ? M.kindName(ev.kind) : '队史',
      author: {
        id: per ? per.id : '',
        name: per ? per.name : s.author,
        ch: per ? per.name.slice(0, 1) : String(s.author).slice(0, 1),
        pos: per ? M.unitCn(per.pos) : '',
        years: per ? M.yearsRange(per) : ''
      },
      cover: covers[0] || null,
      inner: covers[1] || null
    });
    wx.setNavigationBarTitle({ title: '队史长文' });
  },

  openPerson() {
    if (this.data.author.id) {
      wx.navigateTo({ url: '/pages/person/index?id=' + this.data.author.id });
    }
  }
});
