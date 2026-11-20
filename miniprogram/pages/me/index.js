const M = require('../../utils/model');
const validate = require('../../utils/validate');
const config = require('../../config');

Page({
  data: {
    me: null,
    years: '',
    my: M.MY,
    photos: [],
    memories: [],
    chips: []
  },

  onLoad() {
    const me = M.person(config.ME) || M.allPeople[0];
    this.setData({
      me: {
        id: me.id,
        name: me.name,
        num: me.num,
        unit: M.unitCn(me.pos),
        pos: me.pos,
        years: M.yearsRange(me),
        ch: me.name.slice(0, 1),
        quote: me.quote || ''
      },
      years: M.yearsOnTeam(me),
      version: config.VERSION + ' · 演示数据',
      photos: M.photosOfPerson(me.id).slice(0, 3),
      memories: M.memoriesOfPerson(me.id)
    });
  },

  openPhoto(e) {
    wx.navigateTo({ url: '/pages/photo/index?id=' + e.currentTarget.dataset.id });
  },

  goSubmit() {
    wx.navigateTo({ url: '/pages/submit/index' });
  },

  share() {
    wx.showToast({ title: '体验版分享请用右上角菜单', icon: 'none' });
  },

  copyLink() {
    wx.setClipboardData({
      data: 'STRIKERS 队史馆 · ' + (this.data.me ? this.data.me.name : '') + ' https://github.com/DA77ashyt/mini_strikers',
      success: () => wx.showToast({ title: '链接已复制', icon: 'none' })
    });
  },

  about() {
    wx.showModal({
      title: '关于队史馆',
      content: '原型 ' + config.VERSION + '：数据为演示内容，照片是占位图。真实内容上线后由队史编辑维护。',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  selfCheck() {
    const r = validate(M.raw);
    const lines = Object.keys(r.counts).map((k) => k + ' ' + r.counts[k]).join('\n');
    wx.showModal({
      title: r.ok ? '数据校验通过' : '数据有问题',
      content: (r.ok ? lines : r.errors.slice(0, 6).join('\n')),
      showCancel: false,
      confirmText: '好'
    });
  }
});
