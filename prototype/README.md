# 可交互原型 v1

浏览器直接打开 `index.html` 就能点，不需要构建、不需要装依赖。目的是**验证流程**（接龙导入 → 解析 → 点名 → 出勤入账），不是最终 UI 代码。

截图见 [out/board.png](out/board.png)（8 屏总览）。

## 怎么看

```powershell
# 直接双击 index.html，或
start index.html
```

演示参数（必须写在 `#` 之前）：

| 参数 | 作用 |
| --- | --- |
| `index.html?parse=1#/importer/t1` | 打开接龙导入页并自动填好示例文本 |
| `index.html?full=1#/rollcall/t1` | 点名台默认全员到齐（演示「全部出勤 → 取消个别人」） |
| `index.html?selftest=1` | 跑 13 项自检，结果覆盖在页面上 |

## 页面与路由

| 路由 | 页面 | 能做什么 |
| --- | --- | --- |
| `#/home` | 首页 | 下一场比赛、伤停提醒、今日生日、公告 |
| `#/schedule` | 赛程 | 月历，点日期看当天安排 |
| `#/trainings` | 训练列表 | 待开始 / 历史分组 |
| `#/training/t1` | 训练详情 | 报名、取消、去接龙导入、进点名台 |
| `#/importer/t1` | 接龙导入 | 粘贴 → 解析 → 逐条确认 → 写入名单 |
| `#/rollcall/t1` | 点名台 | 全部出勤 / 逐个 到·迟·缺 / 按进攻防守特勤筛选 |
| `#/match/m1` | 比赛报名 | 报名、请假、候补、位置缺口、历史交锋 |
| `#/me` | 我的 | 出勤统计、伤病入口、最近训练 |
| `#/injury` | 伤病档案 | 当前伤停、康复进展、历史记录、全队伤停 |
| `#/stats` | 出勤明细 | 统计口径 + 逐场记录 |

## 已经真的跑通的逻辑

不是画图，下面这些都是真代码：

- **接龙解析**（`parseRollcall`）：剥序号、认「请假 / 迟到N分钟 / 带朋友」、去重。
- **花名册匹配**（`matchPerson`）：精确 → 昵称 → 球衣号 → 包含 → 编辑距离 ≤1；
  「小X / 老X / 阿X」这种不唯一的一律转「待确认」，不瞎猜。
- **点名计数**（`countsOf`）：应到 = 报名且未请假未伤停；提交后出勤才入账。
- **位置缺口**（`gapsOf`）：按 `REQ` 里的阵型需求算「还缺 3 名 DL」。
- **伤停联动**：伤停中的人报名要二次确认；训练详情显示「本场有 4 人处于伤停中」。
- **出勤统计**：出勤 = 到 + 迟，出勤率 = 出勤 / 应到。

## 还是假的部分

- 数据全在 `data.js` 里，刷新即还原（没有后端）。
- 登录、推送、图片上传、导航、导出都只有入口没有实现。
- 日期固定为 `TODAY = '2026-11-06'`，方便演示。

## 怎么发给别人

| 场景 | 做法 |
| --- | --- |
| 训练现场，几个人围着看 | 双击 `share.ps1`，把窗口里那行 `http://192.168.x.x:8080/` 发到群里，手机连同一个 Wi-Fi 直接打开 |
| 发到微信/QQ 让对方自己看 | 发 `strikers-prototype-v1.zip`（25 KB），**对方要在电脑上解压**，双击 `index.html` |
| 想让全队随时点开 | 托管成网页链接，见下 |

托管最省事的两个选择：

```powershell
# A. GitHub Pages（免费，5 分钟；国内能开，偶尔慢）
cd prototype
git init
git add index.html styles.css data.js app.js
git commit -m "prototype v1"
git branch -M main
git remote add origin https://github.com/<你的账号>/strikers-prototype.git
git push -u origin main
# 然后 GitHub 仓库 → Settings → Pages → Deploy from a branch → main / (root)
# 地址：https://<你的账号>.github.io/strikers-prototype/
```

B. 腾讯云开发**静态网站托管**：和后面正式要用的云开发是同一套环境，上传后直接得到
`https://xxx.tcloudbaseapp.com` 域名，国内访问快、不用备案。缺点是得先开一个云开发环境。

> 微信里能直接打开普通 https 链接（用微信内置浏览器），但**不能直接打开本地文件**；
> iOS 上收到 zip 也不好解压。所以发人看，链接 > zip。

## 文件

| 文件 | 作用 |
| --- | --- |
| `index.html` | 单页骨架：`#view` + `#tabbar` + `#sheet` + `#toast` |
| `styles.css` | 全部样式，token 与设计稿一致（`--ink` / `--blue` / 状态色） |
| `data.js` | 26 名队员、3 场比赛、5 次训练、伤病、公告、阵型需求 |
| `app.js` | hash 路由 + 渲染 + 事件委托 + 解析/匹配/统计 |
| `shot.ps1` | 用 headless Chrome 批量截图到 `out/raw_*.png` |
| `build_board.py` | 裁成 430×900 并拼总览 `out/board.png` |

## 与小程序工程的对应关系

| 原型 | 小程序里 |
| --- | --- |
| `ROUTES` + `render()` | 各页面 `Page({})` |
| `state`（内存） | 云开发数据库集合（`users` / `trainings` / `training_checkins` …） |
| `ACT` 处理器 | 页面事件 + 云函数 |
| `parseRollcall` / `matchPerson` | 原样搬进云函数（纯函数，好迁） |

迁移时最值钱的是这 4 个纯函数，UI 结构参考 [../design/mockups.html](../design/mockups.html)。
