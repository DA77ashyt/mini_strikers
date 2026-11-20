// 全局配置：先跑本地演示数据，接上云开发时只改这一个文件
module.exports = {
  // 是否走云函数取数据；false = 直接用 data/db.js（演示版默认）
  USE_CLOUD: false,
  // 云开发环境 ID，在「微信开发者工具 → 云开发控制台」里能看到
  ENV_ID: '',
  // 演示版固定「我」是谁，接登录后由 openid 决定
  ME: 'p01',
  VERSION: 'v2.0.0-memorial'
};
