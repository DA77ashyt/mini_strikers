// 云函数：login
// 作用只有一件事——把调用者的 openid 返回给小程序。
// 前端永远不传 userId 上来，身份一律从 getWXContext() 取。
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async () => {
  const { OPENID, APPID, UNIONID } = cloud.getWXContext();
  return { ok: true, openid: OPENID, appid: APPID, unionid: UNIONID || '' };
};
