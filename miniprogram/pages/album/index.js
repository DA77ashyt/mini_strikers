const M = require('../../utils/model');

Page({
  data: {
    chips: [],
    active: 0,
    list: [],
    total: 0
  },

  onLoad() {
    const stats = M.yearStats();
    const chips = [{ year: 0, label: '全部', n: M.photos().length }].concat(
      stats.map((s) => ({ year: s.year, label: String(s.year), n: s.photos }))
    );
    const list = M.photos().map((p) => ({ id: p.id, kind: p.kind, ratio: p.ratio, title: p.title, year: p.year }));
    this.setData({ chips, list, total: list.length });
  },

  pick(e) {
    const y = Number(e.currentTarget.dataset.year);
    const all = M.photos();
    const list = (y ? all.filter((p) => p.year === y) : all).map((p) => ({
      id: p.id, kind: p.kind, ratio: p.ratio, title: p.title, year: p.year
    }));
    this.setData({ active: y, list, total: list.length });
  },

  open(e) {
    wx.navigateTo({ url: '/pages/photo/index?id=' + e.currentTarget.dataset.id });
  }
});
