#!/usr/bin/env node
/* ============================================================
   队史馆数据校验 —— 无依赖，直接跑：
     node memorial/check.mjs
   通过退出码 0，失败退出码 1（可挂进 pre-commit / CI）
   ------------------------------------------------------------
   为什么用 vm 对 data.js 求值：
   · data.js 是给浏览器 <script> 用的普通脚本，不依赖任何模块系统
   · 本仓库上层 package.json 是 "type": "module"，.js 会被当成 ESM，
     直接 require/import 都拿不到里面的 const
   · vm.runInContext(源码 + 表达式) 与浏览器语义一致，且无需构建
   ============================================================ */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(here, 'data.js'), 'utf8');
const expr =
  ';({TEAM,STATS,QUOTE,KINDS,EVENTS,PHOTOS,STORIES,MEMORIES,RECORDS,RETIRED,PEOPLE,ME,MY,validate})';

let api;
try {
  api = vm.runInContext(src + expr, vm.createContext({ console }), { filename: 'data.js' });
} catch (e) {
  console.error('✗ data.js 求值失败（语法错误？）');
  console.error('  ' + e.message);
  process.exit(1);
}

const { TEAM, EVENTS, PHOTOS, PEOPLE, STORIES, MEMORIES, RETIRED, validate } = api;
const r = validate();

const line = (label, value) => `  ${label.padEnd(8, '　')} ${value}`;
console.log(`\n  ${TEAM.en} 队史馆 · 数据校验`);
console.log(`  ${TEAM.years[0]}–${TEAM.years[1]}　${'—'.repeat(28)}`);
Object.entries(r.counts).forEach(([k, v]) => console.log(line(k, v)));

if (r.ok) {
  // 交叉引用统计，帮助发现「有人但没照片」这类内容空洞
  const noPhoto = PEOPLE.filter((p) => !PHOTOS.some((ph) => (ph.people || []).includes(p.id)));
  console.log(`\n  ✓ 全部检查通过（${Object.keys(r.counts).length} 类 / ${EVENTS.length} 事件）`);
  if (noPhoto.length) {
    console.log(`  · 提示：${noPhoto.length} 位成员暂无照片（${noPhoto.slice(0, 4).map((p) => p.name).join('、')}${noPhoto.length > 4 ? ' 等' : ''}）`);
  }
  console.log(`  · 长文 ${STORIES.length} 篇、记忆 ${MEMORIES.length} 条、退役号码 ${RETIRED.length} 个\n`);
  process.exit(0);
}

console.log(`\n  ✗ ${r.errs.length} 个问题：`);
r.errs.forEach((e, i) => console.log(`  ${String(i + 1).padStart(2)}. ${e}`));
console.log('');
process.exit(1);
