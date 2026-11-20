# 云函数目录

当前只有 `login`，它做一件很小的事：把调用者的 `openid` 返回给小程序。

## 为什么先只有这一个

纪念版第一阶段是「读」为主（看照片、看编年史、看名册），数据还打包在小程序里（`miniprogram/data/db.js`）。
等接入云开发后，页面仍然只调 `miniprogram/utils/model.js`，把里面的本地查询换成云函数调用即可，页面代码不用动。

## 约定

1. **前端永远不上传 userId**。身份一律在云函数里用 `cloud.getWXContext().OPENID` 取。
2. **一个云函数一个域**，内部用 `event.action` 路由（例如 `photo` 云函数下 `action: 'list' | 'detail'`），不要按页面建云函数。
3. **集合安全规则一律 `{"read": false, "write": false}`**，全部走云函数，前端不能直连数据库。
4. 只读数据可以考虑加索引：`m_photos.year`、`m_events.date`、`m_stories.date`。

## 部署

1. 微信开发者工具 → 云开发 → 开通，记下环境 ID；
2. 把环境 ID 填到 `miniprogram/config.js` 的 `ENV_ID`，并把 `USE_CLOUD` 改成 `true`；
3. 右键 `cloudfunctions/login` → 上传并部署（云端安装依赖）。
