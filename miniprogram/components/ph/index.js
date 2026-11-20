Component({
  properties: {
    kind: { type: String, value: 'field' },
    ratio: { type: String, value: '4/3' },
    src: { type: String, value: '' },
    label: { type: String, value: '' },
    radius: { type: String, value: '24rpx' }
  },

  data: {
    pb: 75
  },

  observers: {
    ratio(v) {
      const parts = String(v).split('/');
      const w = Number(parts[0]) || 4;
      const h = Number(parts[1]) || 3;
      this.setData({ pb: Math.round((h / w) * 1000) / 10 });
    }
  },

  lifetimes: {
    attached() {
      const parts = String(this.data.ratio).split('/');
      const w = Number(parts[0]) || 4;
      const h = Number(parts[1]) || 3;
      this.setData({ pb: Math.round((h / w) * 1000) / 10 });
    }
  }
});
