const config = require('./config');

App({
  globalData: {
    config,
    me: config.ME,
    cloudReady: false
  },

  onLaunch() {
    if (config.USE_CLOUD && config.ENV_ID) {
      wx.cloud.init({ env: config.ENV_ID, traceUser: true });
      this.globalData.cloudReady = true;
    }
  },

  onError(err) {
    // 开发期把错误摆到台面上，别静默吞掉
    console.error('[app error]', err && err.stack ? err.stack : err);
  }
});
