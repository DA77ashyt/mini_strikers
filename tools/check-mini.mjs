// 命令行校验：node tools/check-mini.mjs
// 与小程序的「开发自检」页调用同一个 validate()，两边结论必须一致。
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

// D:\project_hyt\package.json 是 "type":"module"，所以这里不能用 require 加载 .js，
// 统一用 new Function 注入一个假的 module/exports，模拟小程序的 CommonJS 环境。
function loadCjs(file) {
  const src = fs.readFileSync(file, 'utf8');
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', 'wx', 'getApp', src)(
    mod, mod.exports, () => ({}), undefined, () => ({ globalData: {} })
  );
  return mod.exports;
}

const db = loadCjs(path.join(ROOT, 'miniprogram/data/db.js'));
const validate = loadCjs(path.join(ROOT, 'miniprogram/utils/validate.js'));

if (typeof validate !== 'function') {
  console.error('validate.js 没有导出函数');
  process.exit(1);
}

const r = validate(db);
Object.entries(r.counts).forEach(([k, v]) => console.log(`${k}: ${v}`));

if (r.ok) {
  console.log('OK 数据契约通过');
  process.exit(0);
}
console.error('\nFAIL 发现 ' + r.errors.length + ' 个问题：');
r.errors.forEach((e) => console.error(' - ' + e));
process.exit(1);
