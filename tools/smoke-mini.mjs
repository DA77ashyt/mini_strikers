// 无微信开发者工具的路由冒烟测试：
// 用极简 stub 加载每个页面的 index.js，跑一遍 onLoad 与主要交互，
// 断言「不抛异常 + 关键数据非空」。给人和智能体都用同一条命令。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MP = path.join(ROOT, 'miniprogram');

const noop = () => {};
const calls = [];
const wx = {
  setNavigationBarTitle: noop,
  showToast: (o) => calls.push(['toast', o.title]),
  showModal: (o) => { calls.push(['modal', o.title]); if (o.success) o.success({ confirm: true }); },
  navigateTo: (o) => calls.push(['navigateTo', o.url]),
  switchTab: (o) => calls.push(['switchTab', o.url]),
  pageScrollTo: noop,
  setClipboardData: (o) => { if (o.success) o.success(); },
  chooseMedia: noop
};
const getApp = () => ({ globalData: {} });

// —— 极简 CJS 加载器（本目录 package.json 是 type:module，不能用 require） ——
const cache = {};
function load(file) {
  const abs = file.endsWith('.js') ? file : file + '.js';
  if (cache[abs]) return cache[abs].exports;
  const module = { exports: {} };
  cache[abs] = module;
  const src = fs.readFileSync(abs, 'utf8');
  const req = (spec) => {
    const target = path.resolve(path.dirname(abs), spec);
    return load(target);
  };
  const fn = new Function('module', 'exports', 'require', 'wx', 'getApp', src);
  fn(module, module.exports, req, wx, getApp);
  return module.exports;
}

// —— 捕获 Page() 配置 ——
let captured = null;
globalThis.Page = (cfg) => { captured = cfg; };

function pageOf(route) {
  captured = null;
  const file = path.join(MP, 'pages', route, 'index.js');
  delete cache[file];
  load(file);
  if (!captured) throw new Error('页面没有调用 Page(): ' + route);
  const page = Object.assign({}, captured);
  page.data = JSON.parse(JSON.stringify(captured.data || {}));
  page.setData = function (patch) {
    Object.keys(patch).forEach((k) => { this.data[k] = patch[k]; });
  };
  return page;
}

function ev(dataset, detail) {
  return { currentTarget: { dataset: dataset || {} }, detail: detail || {} };
}

const results = [];
function check(name, fn) {
  try {
    fn();
    results.push([true, name]);
  } catch (e) {
    results.push([false, name + ' → ' + e.message]);
  }
}

// 首页
check('home 加载', () => {
  const p = pageOf('home');
  p.onLoad();
  if (!p.data.recent.length) throw new Error('recent 为空');
  if (!p.data.photos.length) throw new Error('photos 为空');
  p.openEvent(ev({ id: p.data.recent[0].id }));
  p.openPhoto(ev({ id: p.data.photos[0].id }));
  p.random();
});

// 编年史
check('timeline 加载', () => {
  const p = pageOf('timeline');
  p.onLoad();
  if (!p.data.groups.length) throw new Error('groups 为空');
  if (!p.data.groups[0].events.length) throw new Error('第一条年份没有事件');
  p.jump(ev({ year: p.data.years[1] }));
  p.openEvent(ev({ id: p.data.groups[0].events[0].id }));
});

// 相册
check('album 加载', () => {
  const p = pageOf('album');
  p.onLoad();
  if (!p.data.list.length) throw new Error('list 为空');
  if (p.data.chips[0].n !== p.data.total) throw new Error('「全部」计数与照片总数不一致');
  p.pick(ev({ year: p.data.chips[1].year }));
  if (!p.data.list.length) throw new Error('按年筛选后为空');
  p.pick(ev({ year: 0 }));
  p.open(ev({ id: p.data.list[0].id }));
});

// 照片详情
check('photo 加载', () => {
  const p = pageOf('photo');
  p.onLoad({ id: 'ph06' });
  if (!p.data.p) throw new Error('p 为空');
  if (p.data.idx < 1) throw new Error('idx 异常');
  p.next();
  p.prev();
  if (p.data.people.length) p.openPerson(ev({ id: p.data.people[0].id }));
  if (p.data.event) p.openEvent();
});

// 名册
check('roster 加载', () => {
  const p = pageOf('roster');
  p.onLoad();
  if (p.data.active.length !== 26) throw new Error('现役应为 26，实际 ' + p.data.active.length);
  if (p.data.alumni.length !== 14) throw new Error('已毕业应为 14，实际 ' + p.data.alumni.length);
  if (p.data.retired.length !== 2) throw new Error('退役号码应为 2');
  p.switchTab(ev({ tab: 'alumni' }));
  p.open(ev({ id: p.data.alumni[0].id }));
});

// 个人
check('person 加载', () => {
  const p = pageOf('person');
  p.onLoad({ id: 'p27' });
  if (!p.data.p) throw new Error('p 为空');
  if (!p.data.p.years) throw new Error('years 为空');
  p.openEvent(ev({ id: 'e01' }));
});

// 长文
check('story 加载', () => {
  const p = pageOf('story');
  p.onLoad({ id: 's01' });
  if (!p.data.s) throw new Error('s 为空');
  if (!p.data.s.paras.length) throw new Error('paras 为空');
  if (!p.data.author.name) throw new Error('author 为空');
  p.openPerson();
});

// 我的
check('me 加载', () => {
  const p = pageOf('me');
  p.onLoad();
  if (!p.data.me) throw new Error('me 为空');
  p.copyLink();
  p.selfCheck();
  const modal = calls.filter((c) => c[0] === 'modal').pop();
  if (!modal || modal[1] !== '数据校验通过') throw new Error('自检未通过：' + JSON.stringify(modal));
});

// 上传
check('submit 加载', () => {
  const p = pageOf('submit');
  p.onLoad();
  if (!p.data.years.length) throw new Error('years 为空');
  p.pickYear(ev({ year: p.data.years[2] }));
  p.onText({ detail: { value: '那年冬天下着雨' } });
  p.togglePerson(ev({ id: p.data.people[0].id }));
  if (p.data.pickedCount !== 1) throw new Error('多选计数不对');
  p.submit();
  if (p.data.text !== '') throw new Error('提交后未清空');
});

let bad = 0;
results.forEach(([ok, name]) => {
  if (!ok) bad += 1;
  console.log((ok ? 'OK   ' : 'FAIL ') + name);
});

// —— 静态检查：app.json 的页面文件齐全 + wxml 里绑定的事件都有对应函数 ——
const appJson = JSON.parse(fs.readFileSync(path.join(MP, 'app.json'), 'utf8'));
check('app.json 页面文件齐全', () => {
  appJson.pages.forEach((route) => {
    ['js', 'json', 'wxml', 'wxss'].forEach((ext) => {
      const p = path.join(MP, route + '.' + ext);
      if (!fs.existsSync(p)) throw new Error(`${route} 缺少 index.${ext}`);
    });
  });
});

check('wxml 事件绑定都有对应函数', () => {
  appJson.pages.forEach((route) => {
    const page = pageOf(route.replace('pages/', '').replace('/index', ''));
    const wxml = fs.readFileSync(path.join(MP, route + '.wxml'), 'utf8');
    const re = /bind(?:tap|input|change|submit)="([A-Za-z0-9_]+)"/g;
    let m;
    while ((m = re.exec(wxml))) {
      if (typeof page[m[1]] !== 'function') throw new Error(`${route} 绑定了不存在的 ${m[1]}`);
    }
  });
});

let bad2 = 0;
results.slice(9).forEach(([ok, name]) => {
  if (!ok) bad2 += 1;
  console.log((ok ? 'OK   ' : 'FAIL ') + name);
});

console.log(bad + bad2 ? `\n${bad + bad2} 项失败` : '\n全部通过：9 个页面 onLoad + 主要交互 + 2 项静态检查');
process.exit(bad + bad2 ? 1 : 0);

