const M = require('../../utils/model');

function row(p) {
  return {
    id: p.id,
    num: p.num,
    name: p.name,
    pos: p.pos,
    unit: M.unitCn(p.pos),
    years: M.yearsRange(p),
    honor: (p.honors && p.honors[0]) || ''
  };
}

Page({
  data: {
    tab: 'active',
    active: [],
    alumni: [],
    retired: [],
    total: 0
  },

  onLoad() {
    const all = M.allPeople;
    this.setData({
      active: all.filter((p) => p.status === 'active').sort((a, b) => a.num - b.num).map(row),
      alumni: all.filter((p) => p.status === 'alumni').sort((a, b) => a.from - b.from).map(row),
      retired: M.RETIRED.map((r) => ({ num: r.num, name: r.name, year: r.year, note: r.note })),
      total: all.length
    });
  },

  switchTab(e) { this.setData({ tab: e.currentTarget.dataset.tab }); },

  open(e) {
    wx.navigateTo({ url: '/pages/person/index?id=' + e.currentTarget.dataset.id });
  }
});
