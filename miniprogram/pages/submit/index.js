const M = require('../../utils/model');

Page({
  data: {
    years: [],
    year: 0,
    text: '',
    people: [],
    picked: {},
    pickedCount: 0,
    photo: ''
  },

  onLoad() {
    const ys = [];
    for (let y = M.TEAM.years[1]; y >= M.TEAM.years[0]; y -= 1) ys.push(y);
    this.setData({
      years: ys,
      year: ys[0],
      people: M.allPeople.filter((p) => p.status === 'active').map((p) => ({ id: p.id, name: p.name, on: false }))
    });
  },

  pickYear(e) { this.setData({ year: Number(e.currentTarget.dataset.year) }); },

  onText(e) { this.setData({ text: e.detail.value }); },

  togglePerson(e) {
    const id = e.currentTarget.dataset.id;
    const picked = Object.assign({}, this.data.picked);
    if (picked[id]) delete picked[id]; else picked[id] = 1;
    const people = this.data.people.map((p) => ({ id: p.id, name: p.name, on: !!picked[p.id] }));
    this.setData({ picked, people, pickedCount: Object.keys(picked).length });
  },

  choosePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      success: (res) => {
        this.setData({ photo: res.tempFiles[0].tempFilePath });
      }
    });
  },

  submit() {
    if (!this.data.text.trim()) {
      return wx.showToast({ title: '写一句话再提交', icon: 'none' });
    }
    wx.showModal({
      title: '已提交',
      content: '队史编辑会在整理后放进相册。原型阶段不会真正保存。',
      showCancel: false,
      confirmText: '好',
      success: () => {
        this.setData({
          text: '',
          photo: '',
          picked: {},
          pickedCount: 0,
          people: this.data.people.map((p) => ({ id: p.id, name: p.name, on: false }))
        });
      }
    });
  }
});
