# 队史馆原型（memorial）

给现役队员、毕业队员和还在场边的老队友的**纪念型队史馆**原型。纯静态、零依赖，双击 `index.html` 就能看；数据和校验同源，命令行和浏览器跑的是同一套 `validate()`。

> 演示数据：2016–2026 十年、40 位成员、18 条编年、18 张照片、4 篇长文，全部为评审用虚构内容。照片是内联 SVG 占位图（统一夜场蓝调，球场草皮也走深蓝而不是草绿，保证整页仍是球队蓝白主色），接入真照片后删掉 `memorial.css` 末尾的「照片调色」段即可。

---

## 一、怎么跑

| 想做什么 | 怎么做 |
| --- | --- |
| 看原型 | 直接打开 `memorial/index.html`，或从仓库根 `index.html` 的入口卡进入 |
| 看数据自检页 | `memorial/index.html?selftest=1`，或点任意页面右上角「自检」 |
| 校验数据 | `node memorial/check.mjs`（失败退出码 1） |
| 冒烟全部路由 | `node memorial/smoke.mjs`（无浏览器，vm 里渲染 11 条路由） |
| 重新出图 | PowerShell 执行 `memorial/shot.ps1`，产物在 `memorial/out/` |
| 只出某几张 | `memorial/shot.ps1 home,timeline` |

## 二、路由表

| 路由 | 页面 | Tab |
| --- | --- | --- |
| `#/home` | 队史馆首页：封面、四个数字、引言、最近事件、影像、毕业墙、纪录 | 馆 |
| `#/timeline` | 编年史：年份条 + 时间轴，滚动联动高亮 | 编年 |
| `#/album` | 相册：年份筛选 + 双列瀑布 | 相册 |
| `#/photo/:id` | 照片详情：大图、拍摄信息、照片里的人、上一张/下一张 | — |
| `#/roster` | 名册：现役/已毕业分段、退役号码、个人入口 | 名册 |
| `#/person/:id` | 个人档案：号码水印、荣誉、他的一句话、照片与队史事件 | — |
| `#/story/:id` | 队史长文：serif 正文、首字下沉、内文照片 | — |
| `#/me` | 我的：个人数字、我写下的记忆、邀请老队友 | 我的 |
| `#/submit` | 上传记忆：照片位、年份、一句话、人物多选 | — |
| `#/selftest` | 数据自检：校验结果 + 全部路由入口 | — |

未知路由落到「未找到」页，不会白屏。

## 三、文件职责

| 文件 | 职责 | 改它之前要知道 |
| --- | --- | --- |
| `index.html` | 壳：`.stage > .app > main#view + nav#tabbar`、`#toast` | 与 `prototype/index.html` 同构，别改结构 |
| `styles.css` | **设计系统基线**，与 `prototype/styles.css` 逐字节同源 | 只读！改动请写进 `memorial.css` |
| `memorial.css` | 队史馆新增组件（封面、时间轴、瀑布流、长文……） | 只新增 class，不覆盖基线 token |
| `data.js` | 全部内容 + `validate()` | 纯浏览器脚本，**不要加 `module.exports`** |
| `app.js` | 渲染、路由、事件委托、SVG 占位照片 | 见下方「三条约定」 |
| `check.mjs` / `smoke.mjs` | 命令行自检（`vm` 求值 `data.js`） | 因为 `D:\project_hyt/package.json` 是 `"type":"module"`，本目录 `.js` 在 Node 里是 ESM，所以自检脚本用 `.mjs` |
| `shot.ps1` / `crop.py` | 截图：iframe 固定 430×900 → 大窗口截图 → 裁成 860×1800 | Chrome 的 `--window-size` 在这台机器上不等于视口，**不要**去掉 iframe 包一层 |

### 三条约定（DX / AX）

1. **数据与校验同源**：`validate()` 写在 `data.js` 里，浏览器自检页和 `check.mjs` 共用；新增约束只改一处。
2. **失败可读**：`render()` 有 try/catch，异常会把堆栈渲染成页面（`.crash`），并挂 `window.onerror` —— 人和智能体都能看到失败原因，而不是白屏。
3. **交互只有一种写法**：元素挂 `data-act="动作"`，`ACT` 表里对应一个函数；新增交互不用绑 `onclick`。

## 四、数据结构契约

```js
TEAM      { en, founded, years:[起,止], city, motto, intro }
STATS     [{ v, u, l }]                       // 首页四个数字
QUOTE     { text, by, person, role }          // 首页引言，person 指向 PEOPLE
KINDS     { founding|first|trophy|grad|void|rebuild|home: '中文标签' }
EVENTS    [{ id, year, date:'YYYY.MM.DD', kind, title, summary, photos:[phId], people:[pId], story?: storyId }]
PHOTOS    [{ id:'phNN', title, year, date, place, kind, ratio:'4/5'|'1/1'|'4/3'|'3/4'|'16/9', caption, people:[pId] }]
PEOPLE    [{ id:'pNN', name, num, pos, from, to|null, status:'active'|'alumni', honors:[], quote }]
STORIES   [{ id, year, date, author, person:pId, title, lead, photos:[phId], paras:[段落] }]
MEMORIES  [{ person:pId, by, year, text }]
RECORDS   [{ label, value, note }]
RETIRED   [{ num, name, year, note }]
RATIOS    ['4/5','1/1','4/3','3/4','16/9']
```

### 加一条内容

- **加一张照片**：`PHOTOS` 里加对象（`id` 用 `ph` 前缀，`ratio` 必须在 `RATIOS` 里，`date` 必须以 `year + '.'` 开头），需要的话把它挂到某条 `EVENTS.photos` 或某个人的 `PHOTOS.people`。
- **加一条编年**：`EVENTS` 里加对象，`date` 前缀必须等于 `year`，`photos`/`people`/`story` 必须指向已存在的 id；**整组必须按日期升序**（`validate()` 会查）。
- **加一位成员**：`PEOPLE` 里加对象；现役号码不能重复，且不能用已退役号码（`RETIRED`）；已毕业必须填 `to`，现役必须 `to: null`。
- **加一篇长文**：`STORIES` 里加对象，`person` 必须是已存在成员，`paras` 至少 2 段；再把 `story: 'sXX'` 挂到对应 `EVENTS` 上，编年史里就会出现「读这一段 ›」。

加完跑一次 `node memorial/check.mjs`，它会告诉你哪条引用断了、哪个日期和年份对不上、哪个号码重复了。

## 五、视觉与迁移

- 结构、圆角、字号仍来自 `styles.css` 的 token（`--ink #0A1B33`、`--bg #F4F7FC`、`--line #E4EAF3`）。
- **蓝色按球队指定的两枚参考色重标**，写在 `memorial.css` 末尾的 `:root` 覆盖块里，不动基线文件：
  - `--brand-800 #141371`（突袭者蓝）→ 深色面：封面/个人页渐变、夜空、照片暗部
  - `--brand-700 #073A8B`（海军蓝）→ 可交互与强调：链接、按钮、选中态、时间轴节点
  - `--brand-900 #0B0A3D` 最深、`--brand-100 #E7EDF9` 浅底、`--brand-50 #F2F5FC`
  - 语义色（出勤绿 `#0FA968`、迟到琥珀 `#F5A524`、缺席红 `#E5484D`）保持不变。
- 长文正文是唯一的例外：用系统 serif（`--serif`）区分「史料」与「界面」。
- 迁移到小程序时：一页对一页建 WXML，`styles.css` + `memorial.css` 转成两份 `.wxss`，`data.js` 的集合直接对应云数据库集合，`photoBox()` 换成 `image` 组件 + 真照片；照片的 `ratio` 字段可以直接驱动小程序的图片裁切模式。

## 六、截图

```powershell
cd memorial
.\shot.ps1            # 全部 10 张 860×1800
.\shot.ps1 person     # 只出个人页
python build_board.py # 拼 3×3 总览图 out/board9.png
```

产物：`out/01-home.png … 10-selftest.png`（430×900 @2x）。注意本机 Chrome 在受限沙箱下无法启动（命名管道被拒），需要提权执行。
