const M = require('../../utils/model');

Page({
  data: {
    team: M.TEAM,
    stats: M.STATS,
    quote: M.QUOTE,
    records: M.RECORDS,
    recent: [],
    photos: [],
    alumni: 0
  },

  onLoad() {
    const alumni = M.allPeople.filter((p) => p.status === 'alumni').length;
    const recent = M.events().slice(0, 3).map((e) => {
      const cover = M.photoOfEvent(e);
      return {
        id: e.id,
        title: e.title,
        summary: e.summary,
        kind: cover ? cover.kind : 'field',
        kindName: M.kindName(e.kind),
        d: M.shortDate(e.date),
        hasStory: !!e.story
      };
    });
    this.setData({ alumni, recent, photos: M.photos().slice(0, 6) });
  },

  goTimeline() { wx.switchTab({ url: '/pages/timeline/index' }); },
  goAlbum() { wx.switchTab({ url: '/pages/album/index' }); },
  goRoster() { wx.switchTab({ url: '/pages/roster/index' }); },
  goMe() { wx.switchTab({ url: '/pages/me/index' }); },

  openEvent(e) {
    const id = e.currentTarget.dataset.id;
    const ev = M.event(id);
    if (!ev) return;
    const st = M.storyOfEvent(ev);
    if (st) return wx.navigateTo({ url: '/pages/story/index?id=' + st.id });
    const p = M.photoOfEvent(ev);
    if (p) return wx.navigateTo({ url: '/pages/photo/index?id=' + p.id });
    wx.showToast({ title: '这条还没有照片', icon: 'none' });
  },

  openPhoto(e) {
    wx.navigateTo({ url: '/pages/photo/index?id=' + e.currentTarget.dataset.id });
  },

  openStory() {
    const s = M.allStories[0];
    if (s) wx.navigateTo({ url: '/pages/story/index?id=' + s.id });
  },

  random() {
    const p = M.randomPhoto();
    wx.navigateTo({ url: '/pages/photo/index?id=' + p.id });
  }
});
