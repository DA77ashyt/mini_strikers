#!/usr/bin/env node
/* ============================================================
   队史馆渲染冒烟测试 —— 不需要浏览器，直接跑：
     node memorial/smoke.mjs
   ------------------------------------------------------------
   做法：在 vm 里给 app.js 一套极简 DOM 桩，然后逐条路由调 render()，
   断言「没抛异常 / 不是空白页 / 关键内容在」。这样任何一次改动都能
   在 1 秒内确认 10 个页面全都能渲染 —— 给开发者和智能体的确定性反馈。
   ============================================================ */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => fs.readFileSync(path.join(here, f), 'utf8');

/* ---------- 极简 DOM 桩 ---------- */
function makeEl() {
  const el = {
    innerHTML: '', textContent: '', style: {}, dataset: {}, className: '',
    scrollTop: 0, scrollWidth: 500, clientWidth: 320, offsetTop: 0, offsetLeft: 0, offsetWidth: 40,
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener() {}, removeEventListener() {}, appendChild() {}, scrollTo() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    closest() { return null; }
  };
  return el;
}

const viewEl = makeEl();
const tabEl = makeEl();
const scrollEl = makeEl();

const document = {
  title: '',
  querySelector(sel) {
    if (sel === '#view') return viewEl;
    if (sel === '#tabbar') return tabEl;
    if (sel === '#toast') return makeEl();
    if (sel === '.scroll') return scrollEl;
    return null;
  },
  querySelectorAll() { return []; },
  addEventListener() {},
  createElement() { return makeEl(); }
};

const location = { hash: '#/home', href: 'file:///memorial/index.html' };
const history = { length: 2, back() {} };
const sandbox = {
  document, location, history, console,
  setTimeout: (fn) => { if (typeof fn === 'function') fn(); return 0; },
  clearTimeout() {},
  requestAnimationFrame: (fn) => { if (typeof fn === 'function') fn(); return 0; }
};
sandbox.window = sandbox;
sandbox.addEventListener = function () {};
sandbox.removeEventListener = function () {};
sandbox.globalThis = sandbox;

const ctx = vm.createContext(sandbox);
vm.runInContext(read('data.js'), ctx, { filename: 'data.js' });

try {
  vm.runInContext(read('app.js'), ctx, { filename: 'app.js' });
} catch (e) {
  console.error('✗ app.js 加载失败：' + e.message);
  console.error(e.stack);
  process.exit(1);
}

const api = vm.runInContext(
  '({ ROUTES, render, PHOTOS, PEOPLE, EVENTS, STORIES, validate })',
  ctx
);

/* ---------- 逐路由渲染 ---------- */
const cases = [
  { hash: '#/home', must: ['走进编年史', 'STRIKERS'], min: 4000 },
  { hash: '#/timeline', must: ['编年史', '2016', '十年'], min: 4000 },
  { hash: '#/album', must: ['相册', '2026'], min: 3000 },
  { hash: '#/roster', must: ['现役', '已毕业', '退役号码'], min: 4000 },
  { hash: '#/me', must: ['我的', '张伟'], min: 2500 },
  { hash: '#/submit', must: ['上传记忆', '一句话'], min: 1500 },
  { hash: '#/photo/' + api.PHOTOS[0].id, must: ['上一张', '照片里的人'], min: 1800 },
  { hash: '#/person/' + api.PEOPLE[0].id, must: ['在队', '队史里的他'], min: 2500 },
  { hash: '#/story/' + api.STORIES[0].id, must: ['队史长文'], min: 1500 },
  { hash: '#/selftest', must: ['数据自检', '路由自检'], min: 1200 },
  { hash: '#/nope', must: ['未找到'], min: 100 }
];

let bad = 0;
console.log('\n  队史馆 · 渲染冒烟测试');
console.log('  ' + '—'.repeat(34));
cases.forEach((c) => {
  location.hash = c.hash;
  let out = '';
  let err = null;
  try {
    api.render();
    out = viewEl.innerHTML || '';
  } catch (e) {
    err = e;
  }
  const problems = [];
  if (err) problems.push('抛异常：' + err.message);
  if (!out) problems.push('输出为空');
  if (out.length < c.min) problems.push('内容过短（' + out.length + ' < ' + c.min + '）');
  if (out.indexOf('页面渲染失败') >= 0) problems.push('命中了错误兜底页');
  c.must.forEach((m) => { if (out.indexOf(m) < 0) problems.push('缺少「' + m + '」'); });

  if (problems.length) {
    bad++;
    console.log('  ✗ ' + c.hash);
    problems.forEach((p) => console.log('      · ' + p));
  } else {
    console.log('  ✓ ' + c.hash + '  ' + out.length + ' 字符');
  }
});

console.log('  ' + '—'.repeat(34));
if (bad) {
  console.log('  ✗ ' + bad + ' / ' + cases.length + ' 条路由有问题\n');
  process.exit(1);
}
console.log('  ✓ ' + cases.length + ' 条路由全部渲染通过\n');
