// 把 memorial/data.js（浏览器脚本）转成小程序可 require 的 CommonJS 模块
// 用法：node tools/sync-data.mjs
// 为什么要有这步：小程序只能 require 自己根目录里的模块，而 memorial/data.js 是唯一数据源，
// 所以用脚本把它序列化成 miniprogram/data/db.js，避免两份数据各改各的。
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'memorial/data.js');
const OUT = path.join(ROOT, 'miniprogram/data/db.js');

const NAMES = ['TEAM', 'STATS', 'QUOTE', 'KINDS', 'POS_CN', 'RATIOS', 'EVENTS', 'PHOTOS', 'PEOPLE', 'STORIES', 'MEMORIES', 'RECORDS', 'RETIRED', 'ME', 'MY'];

const code = fs.readFileSync(SRC, 'utf8');
const expr = `({${NAMES.join(',')}})`;
const bag = vm.runInNewContext(code + '\n;' + expr, { console }, { filename: SRC });

const missing = NAMES.filter((n) => bag[n] === undefined);
if (missing.length) {
  console.error('数据源缺少导出：' + missing.join(', '));
  process.exit(1);
}

const head = [
  '// 由 tools/sync-data.mjs 从 memorial/data.js 生成，请勿手改。',
  '// 改内容 → 改 memorial/data.js → node tools/sync-data.mjs',
  '// 校验 → node tools/check-mini.mjs（与 memorial/check.mjs 同一套规则）',
  ''
].join('\n');

const body = 'module.exports = ' + JSON.stringify(bag, null, 2) + ';\n';
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, head + body, 'utf8');

const counts = NAMES.filter((n) => Array.isArray(bag[n])).map((n) => `${n}=${bag[n].length}`);
console.log('ok -> miniprogram/data/db.js  ' + counts.join(' '));
