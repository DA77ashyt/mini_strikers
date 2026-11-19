/* ============================================================
   STRIKERS · 队史馆 —— 视图层
   ------------------------------------------------------------
   约定（与原 prototype 一致，方便迁移成小程序）：
   · 无构建、无依赖；全部交互走 data-act 事件委托
   · 路由为 hash：#/home #/timeline #/album #/photo/ph01 …
   · 页面函数只返回 HTML 字符串，不直接碰 DOM
   ============================================================ */

const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));

const esc = (s) =>
  String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const state = { albumYear: 'all', rosterTab: 'active', submit: { year: 2026, people: [], photo: false }, timelineYear: 2016 };

const personById = (id) => PEOPLE.filter((p) => p.id === id)[0];
const photoById = (id) => PHOTOS.filter((p) => p.id === id)[0];
const eventById = (id) => EVENTS.filter((e) => e.id === id)[0];
const storyById = (id) => STORIES.filter((s) => s.id === id)[0];
const yearSpan = (p) => p.from + '–' + (p.to || '');
const initial = (name) => name.slice(0, 1);

/* ============================================================
   一、照片占位：内联 SVG「档案照片」
   ------------------------------------------------------------
   目的：原型不依赖任何外部图片，也不怕断网/换机器。
   每张照片按 kind 选择场景，用 hash(id) 做种子 → 每次渲染完全一致。
   ============================================================ */
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* 单个人形剪影：原点在脚底，y 向上为负 */
function fig(x, y, s, op) {
  return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" opacity="' + (op == null ? 1 : op) + '">' +
    '<ellipse cx="0" cy="1" rx="19" ry="4" fill="#000" opacity=".45"/>' +
    '<path d="M-7 6 l-3 22 q4 3 8 0 l3 -20 z" fill="#04090F"/>' +
    '<path d="M7 6 l3 22 q-4 3 -8 0 l-3 -20 z" fill="#04090F"/>' +
    '<path d="M-10 -30 q10 -7 20 0 l3 38 q-13 5 -26 0 z" fill="#050B12"/>' +
    '<path d="M-11 -28 q-7 10 -9 18 q3 2 5 0 q2 -9 8 -14 z" fill="#050B12"/>' +
    '<path d="M11 -28 q7 10 9 18 q-3 2 -5 0 q-2 -9 -8 -14 z" fill="#050B12"/>' +
    '<circle cx="0" cy="-38" r="8" fill="#050B12"/>' +
    '<path d="M2 -38 q7 1 8 4 q-4 2 -8 1z" fill="#4A7FE0" opacity=".45"/>' +
    '</g>';
}
/* 举手（庆祝）人形 */
function figUp(x, y, s, op) {
  return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" opacity="' + (op == null ? 1 : op) + '">' +
    '<ellipse cx="0" cy="1" rx="16" ry="3.5" fill="#000" opacity=".4"/>' +
    '<path d="M-6 4 l-4 20 q4 3 8 0 l2 -18 z" fill="#04090F"/>' +
    '<path d="M6 4 l4 20 q-4 3 -8 0 l-2 -18 z" fill="#04090F"/>' +
    '<path d="M-9 -28 q9 -6 18 0 l2 34 q-11 4 -22 0 z" fill="#050B12"/>' +
    '<path d="M-10 -26 q-6 -14 -8 -20 q4 -2 6 0 q2 8 7 15 z" fill="#050B12"/>' +
    '<path d="M10 -26 q6 -14 8 -20 q-4 -2 -6 0 q-2 8 -7 15 z" fill="#050B12"/>' +
    '<circle cx="0" cy="-36" r="7.5" fill="#050B12"/>' +
    '</g>';
}

function defs(id) {
  return '<defs>' +
    '<linearGradient id="sky-' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07061F"/><stop offset=".62" stop-color="#131042"/><stop offset="1" stop-color="#0A0A2E"/></linearGradient>' +
    '<linearGradient id="turf-' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0F2C66"/><stop offset=".5" stop-color="#0A2049"/><stop offset="1" stop-color="#061530"/></linearGradient>' +
    '<radialGradient id="glow-' + id + '" cx=".5" cy="0" r=".85"><stop offset="0" stop-color="rgba(255,214,150,.46)"/><stop offset=".55" stop-color="rgba(255,200,140,.12)"/><stop offset="1" stop-color="rgba(255,200,140,0)"/></radialGradient>' +
    '<linearGradient id="gold-' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFEDC8"/><stop offset=".42" stop-color="#DDB878"/><stop offset="1" stop-color="#8A6A33"/></linearGradient>' +
    '<linearGradient id="warm-' + id + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgba(255,190,120,0)"/><stop offset=".5" stop-color="rgba(255,206,152,.28)"/><stop offset="1" stop-color="rgba(255,190,120,0)"/></linearGradient>' +
    '<radialGradient id="vig-' + id + '" cx=".5" cy=".46" r=".76"><stop offset=".48" stop-color="rgba(0,0,0,0)"/><stop offset="1" stop-color="rgba(0,0,0,.66)"/></radialGradient>' +
    '<filter id="grain-' + id + '" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency=".92" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>' +
    '<filter id="blur-' + id + '"><feGaussianBlur stdDeviation="7"/></filter>' +
    '</defs>';
}

/* 草坪条纹 + 码线 */
function turfStripes(id) {
  return '<path d="M0 300 h400 v200 H0z" fill="url(#turf-' + id + ')"/>' +
    '<g opacity=".09" fill="#7FA6DE">' +
    '<path d="M0 318 h400 v26 H0z"/><path d="M0 372 h400 v26 H0z"/><path d="M0 426 h400 v26 H0z"/>' +
    '</g>' +
    '<g opacity=".12" stroke="#CBDCF2" stroke-width="1.6">' +
    '<path d="M0 344 h400"/><path d="M0 398 h400"/><path d="M0 452 h400"/>' +
    '</g>' +
    '<g opacity=".08" stroke="#CBDCF2" stroke-width="1.2">' +
    '<path d="M60 300 v200"/><path d="M340 300 v200"/>' +
    '</g>';
}

const SCENES = {
  /* 球场：夜灯 + 看台 + 人影 */
  field: function (id) {
    const r = rng(hash(id));
    let out = '<rect width="400" height="500" fill="url(#sky-' + id + ')"/>' +
      '<ellipse cx="200" cy="60" rx="300" ry="170" fill="url(#glow-' + id + ')"/>' +
      '<path d="M0 236 l400 -14 v34 l-400 14z" fill="#0A0A2E" opacity=".95"/>' +
      '<g opacity=".35" fill="#16133F">';
    for (let i = 0; i < 9; i++) out += '<rect x="' + (i * 46) + '" y="' + (196 - (i % 2) * 8) + '" width="30" height="42" rx="3"/>';
    out += '</g>' + turfStripes(id);
    const pos = [[110, 402, .82], [190, 418, .9], [268, 400, .78], [330, 430, .7], [70, 440, .62]];
    pos.forEach(function (p, i) { out += fig(p[0] + r() * 8, p[1], p[2], .9 - i * .06); });
    return out;
  },

  /* 全队合影：两排人 */
  team: function (id) {
    const r = rng(hash(id));
    let out = '<rect width="400" height="500" fill="url(#sky-' + id + ')"/>' +
      '<ellipse cx="200" cy="90" rx="320" ry="180" fill="url(#glow-' + id + ')"/>' +
      '<path d="M0 250 h400 v250 H0z" fill="url(#turf-' + id + ')"/>' +
      '<g opacity=".08" fill="#7FA6DE"><path d="M0 300 h400 v20 H0z"/><path d="M0 350 h400 v20 H0z"/></g>' +
      '<g opacity=".10" stroke="#CBDCF2" stroke-width="1.4"><path d="M0 330 h400"/><path d="M0 390 h400"/></g>';
    for (let i = 0; i < 6; i++) out += fig(56 + i * 58, 392 + r() * 6, .82, .95);
    for (let i = 0; i < 6; i++) out += fig(84 + i * 58, 444 + r() * 6, .74, .8);
    return out;
  },

  /* 奖杯：金光 + 彩带 */
  trophy: function (id) {
    const r = rng(hash(id));
    let out = '<rect width="400" height="500" fill="#071018"/>' +
      '<ellipse cx="200" cy="250" rx="240" ry="230" fill="url(#glow-' + id + ')"/>';
    for (let i = 0; i < 16; i++) {
      const cx = r() * 400, cy = 60 + r() * 380, rad = 4 + r() * 26;
      out += '<circle cx="' + cx.toFixed(0) + '" cy="' + cy.toFixed(0) + '" r="' + rad.toFixed(0) + '" fill="#FFD79A" opacity="' + (0.04 + r() * 0.09).toFixed(2) + '" filter="url(#blur-' + id + ')"/>';
    }
    out += '<g transform="translate(200 250)">' +
      '<path d="M-46 -86 h92 v34 a46 46 0 0 1 -92 0 z" fill="url(#gold-' + id + ')"/>' +
      '<path d="M-46 -78 q-30 4 -30 26 q0 24 30 26" fill="none" stroke="url(#gold-' + id + ')" stroke-width="9"/>' +
      '<path d="M46 -78 q30 4 30 26 q0 24 -30 26" fill="none" stroke="url(#gold-' + id + ')" stroke-width="9"/>' +
      '<rect x="-9" y="-52" width="18" height="34" fill="url(#gold-' + id + ')"/>' +
      '<path d="M-26 -18 h52 l8 22 h-68 z" fill="url(#gold-' + id + ')"/>' +
      '<rect x="-38" y="4" width="76" height="12" rx="3" fill="#8A6A33"/>' +
      '<rect x="-40" y="-2" width="80" height="7" rx="2" fill="#FFEDC8" opacity=".55"/>' +
      '</g>';
    for (let i = 0; i < 12; i++) {
      out += '<rect x="' + (30 + r() * 340).toFixed(0) + '" y="' + (60 + r() * 300).toFixed(0) + '" width="' + (3 + r() * 6).toFixed(0) + '" height="' + (6 + r() * 10).toFixed(0) + '" fill="#FFE0AE" opacity="' + (0.25 + r() * 0.4).toFixed(2) + '" transform="rotate(' + (r() * 60 - 30).toFixed(0) + ' 200 250)"/>';
    }
    return out;
  },

  /* 更衣室庆祝：暖光 + 举手的人 */
  celebration: function (id) {
    const r = rng(hash(id));
    let out = '<rect width="400" height="500" fill="#0A0A2E"/>' +
      '<ellipse cx="200" cy="150" rx="260" ry="190" fill="url(#warm-' + id + ')"/>' +
      '<rect x="0" y="330" width="400" height="170" fill="#0A0A30"/>' +
      '<g opacity=".5" stroke="#2F6BD0" stroke-width="2"><path d="M0 330 h400"/></g>';
    out += figUp(96, 424, .95) + figUp(196, 438, 1.05) + figUp(290, 420, .88);
    for (let i = 0; i < 18; i++) {
      out += '<circle cx="' + (r() * 400).toFixed(0) + '" cy="' + (80 + r() * 300).toFixed(0) + '" r="' + (2 + r() * 5).toFixed(1) + '" fill="#FFE7C4" opacity="' + (0.2 + r() * 0.5).toFixed(2) + '"/>';
    }
    out += '<path d="M0 120 q120 -60 400 -10" fill="none" stroke="#FFCE96" stroke-width="2" opacity=".18"/>';
    return out;
  },

  /* 大巴车窗外的黄昏 */
  bus: function (id) {
    const r = rng(hash(id));
    let out = '<rect width="400" height="500" fill="#08071F"/>' +
      '<rect x="26" y="96" width="348" height="308" rx="26" fill="#0D0C38"/>' +
      '<g><rect x="34" y="104" width="332" height="240" rx="18" fill="#16133F"/>' +
      '<rect x="34" y="104" width="332" height="120" rx="18" fill="#3A2A2C"/>' +
      '<rect x="34" y="212" width="332" height="132" fill="#0F0E3C"/>' +
      '<circle cx="286" cy="196" r="26" fill="#F0B26A" opacity=".85"/>' +
      '<g opacity=".5" fill="#0A0A2E">';
    for (let i = 0; i < 9; i++) out += '<rect x="' + (40 + i * 37) + '" y="' + (250 - r() * 30) + '" width="22" height="' + (40 + r() * 30) + '" rx="3"/>';
    out += '</g><g opacity=".22" fill="#FFD9A0">';
    for (let i = 0; i < 12; i++) out += '<rect x="' + (40 + r() * 320).toFixed(0) + '" y="' + (300 + r() * 30).toFixed(0) + '" width="' + (6 + r() * 18).toFixed(0) + '" height="3" rx="1.5"/>';
    out += '</g></g>' +
      '<rect x="26" y="330" width="348" height="18" fill="#0A0930"/>' +
      '<g opacity=".85" fill="#0A0A2E"><rect x="20" y="352" width="360" height="120" rx="14"/></g>' +
      '<path d="M34 104 l200 240" stroke="#FFE6C1" stroke-width="26" opacity=".05"/>' +
      '<path d="M120 104 l-80 240" stroke="#FFE6C1" stroke-width="10" opacity=".04"/>';
    return out;
  },

  /* 手叠手 */
  hands: function (id) {
    const r = rng(hash(id));
    let out = '<rect width="400" height="500" fill="#08071F"/>' +
      '<ellipse cx="200" cy="250" rx="180" ry="180" fill="url(#glow-' + id + ')" opacity=".7"/>';
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.3;
      const x1 = 200 + Math.cos(a) * 190, y1 = 250 + Math.sin(a) * 190;
      const x2 = 200 + Math.cos(a) * 46, y2 = 250 + Math.sin(a) * 46;
      out += '<path d="M' + x1.toFixed(0) + ' ' + y1.toFixed(0) + ' L' + x2.toFixed(0) + ' ' + y2.toFixed(0) + '" stroke="#131242" stroke-width="34" stroke-linecap="round"/>' +
        '<path d="M' + x1.toFixed(0) + ' ' + y1.toFixed(0) + ' L' + x2.toFixed(0) + ' ' + y2.toFixed(0) + '" stroke="#4A7FE0" stroke-width="2" opacity=".18" stroke-linecap="round"/>';
    }
    out += '<circle cx="200" cy="250" r="34" fill="#FFD9A0" opacity=".18" filter="url(#blur-' + id + ')"/>';
    return out;
  },

  /* 记分牌 */
  board: function (id) {
    let out = '<rect width="400" height="500" fill="#08071F"/>' +
      '<rect x="40" y="120" width="320" height="230" rx="14" fill="#0A0930" stroke="#2B2A6E" stroke-width="2"/>';
    out += '<ellipse cx="200" cy="235" rx="180" ry="120" fill="url(#glow-' + id + ')" opacity=".5"/>';
    out += '<text x="200" y="176" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="17" letter-spacing="7" fill="#F5C877" opacity=".9">STRIKERS</text>';
    out += '<text x="200" y="262" text-anchor="middle" font-family="Georgia,serif" font-size="58" fill="#FFE3B0" opacity=".95">28 : 17</text>';
    out += '<text x="200" y="304" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="12" letter-spacing="10" fill="#7FA6DE" opacity=".8">FINAL</text>';
    for (let i = 0; i < 5; i++) out += '<circle cx="' + (70 + i * 65) + '" cy="336" r="3" fill="#2F6BD0" opacity=".5"/>';
    return out;
  },

  /* 更衣室：挂着的球衣 */
  locker: function (id) {
    const r = rng(hash(id));
    let out = '<rect width="400" height="500" fill="#08071F"/>' +
      '<ellipse cx="200" cy="40" rx="220" ry="120" fill="url(#warm-' + id + ')"/>' +
      '<rect x="0" y="300" width="400" height="200" fill="#0D1A24"/>' +
      '<g opacity=".25" stroke="#C9A25E" stroke-width="1.4"><path d="M0 300 h400"/></g>';
    const jerseys = [[64, '1'], [156, '12'], [248, '18'], [340, '80']];
    jerseys.forEach(function (j, i) {
      const x = j[0], w = 58, y = 118 + (i % 2) * 10;
      out += '<g>' +
        '<path d="M' + (x - w / 2) + ' ' + (y + 26) + ' q' + (w / 2) + ' -14 ' + w + ' 0 l6 84 q-' + (w / 2 + 6) + ' 10 -' + (w + 12) + ' 0 z" fill="#0F2C66"/>' +
        '<path d="M' + x + ' ' + y + ' l-22 20" stroke="#0A0A2E" stroke-width="3"/>' +
        '<path d="M' + x + ' ' + y + ' l22 20" stroke="#0A0A2E" stroke-width="3"/>' +
        '<circle cx="' + x + '" cy="' + (y - 2) + '" r="4" fill="#3B3A8A"/>' +
        '<text x="' + x + '" y="' + (y + 84) + '" text-anchor="middle" font-family="Georgia,serif" font-size="26" fill="#C9A25E" opacity=".8">' + j[1] + '</text>' +
        '</g>';
    });
    for (let i = 0; i < 6; i++) out += '<circle cx="' + (30 + r() * 340).toFixed(0) + '" cy="' + (330 + r() * 140).toFixed(0) + '" r="' + (2 + r() * 4).toFixed(0) + '" fill="#C9A25E" opacity=".2"/>';
    return out;
  },

  /* 泥地特写：草叶 + 球 */
  mud: function (id) {
    const r = rng(hash(id));
    let out = '<rect width="400" height="500" fill="#09081F"/>';
    for (let i = 0; i < 90; i++) {
      const x = r() * 400, y = 120 + r() * 380, h = 14 + r() * 40;
      out += '<path d="M' + x.toFixed(0) + ' ' + y.toFixed(0) + ' q' + (r() * 10 - 5).toFixed(0) + ' -' + (h / 2).toFixed(0) + ' ' + (r() * 12 - 6).toFixed(0) + ' -' + h.toFixed(0) + '" stroke="#1B3E7A" stroke-width="' + (1 + r() * 2).toFixed(1) + '" opacity="' + (0.25 + r() * 0.5).toFixed(2) + '" fill="none"/>';
    }
    for (let i = 0; i < 7; i++) {
      out += '<ellipse cx="' + (r() * 400).toFixed(0) + '" cy="' + (160 + r() * 320).toFixed(0) + '" rx="' + (30 + r() * 70).toFixed(0) + '" ry="' + (12 + r() * 26).toFixed(0) + '" fill="#1A130C" opacity="' + (0.4 + r() * 0.3).toFixed(2) + '"/>';
    }
    out += '<g transform="translate(210 300) rotate(-16)">' +
      '<ellipse cx="0" cy="0" rx="66" ry="41" fill="#2B1A10"/>' +
      '<ellipse cx="-6" cy="-4" rx="54" ry="31" fill="#4A2C18"/>' +
      '<path d="M -16 0 L 16 0" stroke="#F2E7D2" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>' +
      '<path d="M-11 -5 v10 M-6 -5 v10 M-1 -5 v10 M4 -5 v10 M9 -5 v10" stroke="#F2E7D2" stroke-width="1.8" stroke-linecap="round" opacity=".8"/>' +
      '</g>';
    for (let i = 0; i < 10; i++) out += '<ellipse cx="' + (r() * 400).toFixed(0) + '" cy="' + (200 + r() * 260).toFixed(0) + '" rx="' + (3 + r() * 9).toFixed(0) + '" ry="' + (2 + r() * 5).toFixed(0) + '" fill="#8FB0E6" opacity=".16"/>';
    return out;
  },

  /* 半身肖像：虚化背景 + 轮廓光 */
  portrait: function (id) {
    const r = rng(hash(id));
    let out = '<rect width="400" height="500" fill="#08071F"/>';
    for (let i = 0; i < 18; i++) {
      out += '<circle cx="' + (r() * 400).toFixed(0) + '" cy="' + (r() * 400).toFixed(0) + '" r="' + (8 + r() * 34).toFixed(0) + '" fill="#2F6BD0" opacity="' + (0.03 + r() * 0.06).toFixed(2) + '" filter="url(#blur-' + id + ')"/>';
    }
    out += '<ellipse cx="200" cy="120" rx="200" ry="160" fill="url(#warm-' + id + ')" opacity=".7"/>' +
      '<g fill="#060D14">' +
      '<path d="M60 500 q0 -180 140 -180 q140 0 140 180 z"/>' +
      '<ellipse cx="200" cy="228" rx="64" ry="74"/>' +
      '<path d="M200 300 q34 0 40 40 l-80 0 q6 -40 40 -40z"/>' +
      '</g>' +
      '<path d="M264 214 q14 16 6 46" stroke="#FFD9A0" stroke-width="4" opacity=".5" fill="none"/>' +
      '<path d="M136 500 q6 -150 64 -160" stroke="#7FA6DE" stroke-width="3" opacity=".25" fill="none"/>';
    return out;
  },

  /* 空场：看台 + 一束灯 */
  empty: function (id) {
    let out = '<rect width="400" height="500" fill="#070F18"/>' +
      '<ellipse cx="150" cy="30" rx="240" ry="150" fill="url(#glow-' + id + ')" opacity=".8"/>';
    for (let i = 0; i < 7; i++) {
      out += '<path d="M-40 ' + (150 + i * 22) + ' q240 -' + (30 - i * 2) + ' 480 0" fill="none" stroke="#12103A" stroke-width="16" opacity=".95"/>';
    }
    out += '<rect x="0" y="320" width="400" height="180" fill="#0C0B35"/>' +
      '<path d="M0 356 h400" stroke="#1E3A75" stroke-width="1.4" opacity=".6"/>' +
      '<path d="M0 404 h400" stroke="#1E3A75" stroke-width="1.4" opacity=".4"/>' +
      '<g opacity=".18" stroke="#CBDCF2"><path d="M120 320 v180"/><path d="M280 320 v180"/></g>' +
      '<path d="M150 30 L120 320" stroke="#FFE3B0" stroke-width="46" opacity=".05"/>' +
      '<circle cx="150" cy="26" r="8" fill="#FFE9C6" opacity=".85"/>';
    return out;
  },

  /* 十周年标记 */
  ring: function (id) {
    let out = '<rect width="400" height="500" fill="#08071F"/>' +
      '<ellipse cx="200" cy="250" rx="230" ry="230" fill="url(#glow-' + id + ')" opacity=".85"/>' +
      '<circle cx="200" cy="250" r="104" fill="none" stroke="url(#gold-' + id + ')" stroke-width="18"/>' +
      '<circle cx="200" cy="250" r="82" fill="none" stroke="#FFE9C6" stroke-width="1" opacity=".35"/>' +
      '<text x="200" y="276" text-anchor="middle" font-family="Georgia,serif" font-size="82" fill="url(#gold-' + id + ')">X</text>' +
      '<text x="200" y="330" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="11" letter-spacing="6" fill="#C9A25E">2016 — 2026</text>';
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      out += '<circle cx="' + (200 + Math.cos(a) * 165).toFixed(0) + '" cy="' + (250 + Math.sin(a) * 165).toFixed(0) + '" r="2" fill="#FFD9A0" opacity=".5"/>';
    }
    return out;
  }
};

function photoSVG(p, align) {
  const id = p.id;
  const body = (SCENES[p.kind] || SCENES.field)(id);
  return '<svg viewBox="0 0 400 500" preserveAspectRatio="' + (align || 'xMidYMid') + ' slice" role="img" aria-label="' + esc(p.title) + '">' +
    defs(id) + body +
    '<rect width="400" height="500" fill="url(#vig-' + id + ')"/>' +
    '<rect width="400" height="500" filter="url(#grain-' + id + ')" opacity=".13" style="mix-blend-mode:overlay"/>' +
    '</svg>';
}

function photoBox(p, cls, ratio, align) {
  if (!p) return '<div class="ph ' + (cls || '') + '" style="aspect-ratio:4/3;background:#F0F0F8"></div>';
  return '<div class="ph ' + (cls || '') + '" style="aspect-ratio:' + (ratio || p.ratio).replace('/', ' / ') + '">' + photoSVG(p, align) + '</div>';
}

/* ============================================================
   二、通用组件
   ============================================================ */
const TABS = [
  { k: 'home', t: '馆', i: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"/>' },
  { k: 'timeline', t: '编年', i: '<path d="M5 4h12M5 10h12M5 16h8"/>' },
  { k: 'album', t: '相册', i: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 15l5-4 4 3 3-2 6 4"/>' },
  { k: 'roster', t: '名册', i: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.4 2.8-5 5.5-5s4.9 1.6 5.5 5"/><path d="M16 6.5a3 3 0 0 1 0 5.6M18 19c-.2-2.4-1-4-2.2-4.8"/>' },
  { k: 'me', t: '我的', i: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c.9-4 3.7-6 7.5-6s6.6 2 7.5 6"/>' }
];

function tabbar(active) {
  return TABS.map(function (t) {
    return '<button data-act="go" data-to="' + t.k + '" class="' + (active === t.k ? 'on' : '') + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + t.i + '</svg>' +
      '<span>' + t.t + '</span></button>';
  }).join('');
}

function navBar(title, opt) {
  opt = opt || {};
  return '<div class="nav' + (opt.white ? ' on-white' : '') + '">' +
    '<div class="side">' + (opt.back ? '<span class="back" data-act="back">‹</span>' : '') + '</div>' +
    '<div class="b">' + esc(title) + '</div>' +
    '<div class="side r">' + (opt.right || '') + '</div>' +
    '</div>';
}

function avatar(p, cls) {
  if (!p) return '';
  const c = 1 + (hash(p.id) % 4);
  return '<div class="avatar c' + c + ' ' + (cls || '') + '">' + esc(initial(p.name)) + '</div>';
}

function tagOf(kind) {
  const cls = kind === 'trophy' ? 'amber' : kind === 'void' ? 'gray' : kind === 'grad' ? 'blue' : 'blue';
  return '<span class="tag ' + cls + '">' + esc(KINDS[kind] || kind) + '</span>';
}

function personChips(ids, max) {
  const list = (ids || []).map(personById).filter(Boolean);
  const show = max ? list.slice(0, max) : list;
  return '<div class="avatarwall">' + show.map(function (p) { return avatar(p, 'sm'); }).join('') +
    (max && list.length > max ? '<span class="tiny muted">+' + (list.length - max) + '</span>' : '') + '</div>';
}

function sec(title, more, act) {
  return '<div class="sec"><b>' + esc(title) + '</b>' +
    (more ? '<span class="tiny" data-act="' + (act || 'go') + '" data-to="' + (act === 'go' ? 'album' : '') + '">' + esc(more) + '</span>' : '') + '</div>';
}

/* ============================================================
   三、页面
   ============================================================ */

function pageHome() {
  const hero = PHOTOS.filter((p) => p.id === 'ph17')[0];
  const latest = EVENTS[EVENTS.length - 1];
  const prevEv = EVENTS[EVENTS.length - 2];
  const young = PHOTOS.filter((p) => p.year >= 2025);
  const alumni = PEOPLE.filter((p) => p.status === 'alumni');

  return '<div class="page">' +
    navBar('队史馆', {
      white: false,
      right: '<span class="tiny" data-act="go" data-to="selftest">自检</span>'
    }) +
    '<div class="scroll">' +
    /* 封面 */
    '<div class="cover2">' +
    '<div class="cover2-bg">' + (hero ? photoSVG(hero, 'xMidYMax') : '') + '</div>' +
    '<div class="cover2-scrim"></div>' +
    '<div class="cover2-in">' +
    '<div class="crest"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="20" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.2"/>' +
    '<text x="22" y="28.5" text-anchor="middle" font-family="Georgia,serif" font-size="19" fill="#fff">S</text></svg></div>' +
    '<div class="brand">STRIKERS</div>' +
    '<div class="kick">EST. 2016 · 城南</div>' +
    '<div class="yrs">2016<span>—</span>2026</div>' +
    '<p class="c2-motto">' + esc(TEAM.motto) + '</p>' +
    '<button class="btn-c2" data-act="go" data-to="timeline">走进编年史 ›</button>' +
    '</div>' +
    '</div>' +
    /* 数字条（浮在封面下缘） */
    '<div class="statbar">' + STATS.map(function (s) {
      return '<div class="sb"><b>' + s.v + '</b><i>' + s.u + '</i><span>' + s.l + '</span></div>';
    }).join('') + '</div>' +

    /* 引言 */
    '<div class="quote">' +
    '<div class="qmark">“</div>' +
    '<p>' + esc(QUOTE.text) + '</p>' +
    '<div class="qby" data-act="go" data-to="person/' + QUOTE.person + '">— ' + esc(QUOTE.by) + '<span>' + esc(QUOTE.role) + '</span></div>' +
    '</div>' +

    /* 最新 */
    '<div class="sec"><b>最近</b><span class="tiny" data-act="go" data-to="timeline">全部 ' + EVENTS.length + ' 条 ›</span></div>' +
    '<div class="pad">' + bigEventCard(latest) + '</div>' +

    /* 上一件事 */
    '<div class="pad mt10">' + miniEventCard(prevEv) + '</div>' +

    /* 影像 */
    '<div class="sec"><b>影像</b><span class="tiny" data-act="go" data-to="album">相册 ' + PHOTOS.length + ' 张 ›</span></div>' +
    '<div class="hscroll">' + young.concat(PHOTOS.slice(0, 2)).slice(0, 6).map(function (p) {
      return '<div class="hcard" data-act="go" data-to="photo/' + p.id + '">' + photoBox(p) +
        '<div class="hmeta"><span>' + p.year + '</span>' + esc(p.title) + '</div></div>';
    }).join('') + '</div>' +

    /* 毕业墙 */
    '<div class="sec"><b>毕业墙</b><span class="tiny" data-act="go" data-to="roster">名册 ›</span></div>' +
    '<div class="pad"><div class="card gradwall" data-act="go" data-to="roster">' +
    '<div class="gw-top"><b>' + alumni.length + ' 位</b><span>已经离开球队，但号码还留着</span></div>' +
    '<div class="avatarwall gw-av">' + alumni.slice(0, 10).map(function (p) { return avatar(p, 'sm'); }).join('') +
    '<span class="tiny muted">+' + Math.max(0, alumni.length - 10) + '</span></div>' +
    '<div class="gw-foot">回家赛 · 每年四月 <span class="go">›</span></div>' +
    '</div></div>' +

    /* 纪录 */
    '<div class="sec"><b>数字里的队史</b></div>' +
    '<div class="pad"><div class="list" style="margin:0">' + RECORDS.map(function (r) {
      return '<div class="rec"><span class="rl">' + esc(r.label) + '</span>' +
        '<span class="rv">' + esc(r.value) + '</span>' +
        '<span class="rn">' + esc(r.note) + '</span></div>';
    }).join('') + '</div></div>' +

    /* 记忆 */
    '<div class="sec"><b>他们说的</b></div>' +
    '<div class="pad"><div class="memo">' + MEMORIES.slice(0, 3).map(function (m) {
      const p = personById(m.person);
      return '<div class="memo-i" data-act="go" data-to="person/' + p.id + '">' +
        '<div class="memo-q">' + esc(m.text) + '</div>' +
        '<div class="memo-by">' + avatar(p, 'sm') + '<span>' + esc(m.by) + ' · ' + p.num + ' 号</span></div>' +
        '</div>';
    }).join('') + '</div></div>' +

    /* 底部 */
    '<div class="pad mt16"><button class="btn ghost" data-act="go" data-to="submit">＋ 上传一段记忆</button></div>' +
    '<div class="foot">本馆由队员们共同记录 · 演示数据仅用于原型评审<br>共 ' + PEOPLE.length + ' 位成员档案 · ' + PHOTOS.length + ' 张照片 · ' + STORIES.length + ' 篇长文</div>' +
    '</div></div>';
}

function bigEventCard(e) {
  const p = photoById((e.photos || [])[0]);
  return '<div class="card evcard" data-act="go" data-to="' + (e.story ? 'story/' + e.story : 'timeline') + '">' +
    photoBox(p, 'evph', '4/3', 'xMidYMax') +
    '<div class="evbody">' +
    '<div class="row g6">' + tagOf(e.kind) + '<span class="tiny muted">' + e.date + '</span></div>' +
    '<div class="evt">' + esc(e.title) + '</div>' +
    '<p class="evs">' + esc(e.summary) + '</p>' +
    '<div class="row between mt8">' + personChips(e.people, 5) + '<span class="tiny go">阅读 ›</span></div>' +
    '</div></div>';
}

function miniEventCard(e) {
  const p = photoById((e.photos || [])[0]);
  return '<div class="mini" data-act="go" data-to="' + (e.story ? 'story/' + e.story : 'timeline') + '">' +
    (p ? photoBox(p, 'miniph') : '') +
    '<div class="minib"><div class="tiny muted">' + e.date + ' · ' + esc(KINDS[e.kind] || '') + '</div>' +
    '<div class="mini-t">' + esc(e.title) + '</div></div></div>';
}

function pageTimeline() {
  let html = '<div class="page">' +
    navBar('编年史', { white: true, right: '<span class="tiny" data-act="go" data-to="album">相册</span>' }) +
    '<div class="scroll" id="tlscroll">';

  const years = [];
  for (let y = TEAM.years[0]; y <= TEAM.years[1]; y++) years.push(y);

  html += '<div class="yearbar" id="yearbar">' + years.map(function (y) {
    return '<button class="ychip' + (y === state.timelineYear ? ' on' : '') + '" data-act="jump-year" data-y="' + y + '">' + y + '</button>';
  }).join('') + '</div>';

  html += '<div class="pad" style="padding-top:8px">';
  years.forEach(function (y) {
    const list = EVENTS.filter(function (e) { return e.year === y; });
    if (!list.length) return;
    html += '<div class="yr" data-year="' + y + '"><div class="yrline"><span>' + y + '</span></div>' +
      '<div class="tl">' + list.map(function (e) { return timelineItem(e); }).join('') + '</div></div>';
  });
  html += '</div><div class="foot">共 ' + EVENTS.length + ' 条编年 · 从 ' + TEAM.founded + ' 开始</div></div></div>';
  return html;
}

function timelineItem(e) {
  const p = photoById((e.photos || [])[0]);
  const story = e.story ? storyById(e.story) : null;
  return '<div class="tli">' +
    '<div class="evm"><span class="d">' + e.date.slice(5) + '</span>' + tagOf(e.kind) + '</div>' +
    '<div class="ev-h">' + esc(e.title) + '</div>' +
    '<p class="ev-p">' + esc(e.summary) + '</p>' +
    (p ? '<div class="ev-photo" data-act="go" data-to="photo/' + p.id + '">' + photoBox(p, '', '4/3', 'xMidYMax') + '</div>' : '') +
    '<div class="row between mt8">' + personChips(e.people, 6) +
    (story ? '<span class="tiny go" data-act="go" data-to="story/' + story.id + '">读这一段 ›</span>' : '') +
    '</div></div>';
}

function pageAlbum() {
  const years = [];
  for (let y = TEAM.years[0]; y <= TEAM.years[1]; y++) years.push(y);
  const countOf = function (y) { return PHOTOS.filter(function (p) { return p.year === y; }).length; };
  const list = state.albumYear === 'all' ? PHOTOS : PHOTOS.filter(function (p) { return p.year === +state.albumYear; });

  return '<div class="page">' +
    navBar('相册', { white: true, right: '<span class="tiny">' + list.length + ' 张</span>' }) +
    '<div class="scroll">' +
    '<div class="yearbar">' +
    '<button class="ychip' + (state.albumYear === 'all' ? ' on' : '') + '" data-act="album-year" data-y="all">全部 ' + PHOTOS.length + '</button>' +
    years.filter(countOf).map(function (y) {
      return '<button class="ychip' + (String(state.albumYear) === String(y) ? ' on' : '') + '" data-act="album-year" data-y="' + y + '">' + y + ' <i>' + countOf(y) + '</i></button>';
    }).join('') + '</div>' +
    '<div class="grid2">' + list.map(function (p) {
      return '<div class="gal" data-act="go" data-to="photo/' + p.id + '">' + photoBox(p) +
        '<div class="galcap"><span>' + p.year + '</span>' + esc(p.title) + '</div></div>';
    }).join('') + '</div>' +
    '<div class="foot">照片按拍摄时间排列 · 点开可看拍摄信息与照片里的人</div>' +
    '</div></div>';
}

function pagePhoto(id) {
  const p = photoById(id);
  if (!p) return notFound('照片');
  const idx = PHOTOS.indexOf(p);
  const prev = PHOTOS[(idx - 1 + PHOTOS.length) % PHOTOS.length];
  const next = PHOTOS[(idx + 1) % PHOTOS.length];
  const ev = EVENTS.filter(function (e) { return (e.photos || []).indexOf(p.id) >= 0; })[0];
  const story = ev && ev.story ? storyById(ev.story) : null;

  return '<div class="page">' +
    navBar('照片', { back: true, right: '<span class="tiny">' + (idx + 1) + '/' + PHOTOS.length + '</span>' }) +
    '<div class="scroll">' +
    '<div class="theater" data-act="toast" data-msg="原型：此处可双指缩放查看原图">' + photoSVG(p) + '</div>' +
    '<div class="pad">' +
    '<div class="row g8 mt12"><span class="tag blue">' + p.year + '</span><span class="tiny muted">' + esc(p.place) + '</span></div>' +
    '<h1 class="ph-t">' + esc(p.title) + '</h1>' +
    '<p class="ph-c">' + esc(p.caption) + '</p>' +
    '<div class="meta2"><div class="mrow"><span>拍摄</span><b>' + p.date + '</b></div>' +
    '<div class="mrow"><span>地点</span><b>' + esc(p.place) + '</b></div>' +
    '<div class="mrow"><span>照片里</span><b>' + (p.people.length ? p.people.length + ' 人' : '—') + '</b></div></div>' +
    (p.people.length ? '<div class="sec" style="padding:16px 0 8px"><b>照片里的人</b></div>' +
      '<div class="plist">' + p.people.map(function (pid) {
        const pp = personById(pid);
        return '<div class="ppl" data-act="go" data-to="person/' + pp.id + '">' + avatar(pp) +
          '<div><b>' + esc(pp.name) + '</b><span>' + pp.num + ' 号 · ' + (POS_CN[pp.pos] || pp.pos) + '</span></div></div>';
      }).join('') + '</div>' : '') +
    (ev ? '<div class="sec" style="padding:16px 0 8px"><b>当时的记录</b></div>' +
      '<div class="card linkrow" data-act="go" data-to="' + (story ? 'story/' + story.id : 'timeline') + '">' +
      '<div><b>' + esc(ev.title) + '</b><span>' + ev.date + ' · ' + (KINDS[ev.kind] || '') + '</span></div><span class="go">›</span></div>' : '') +
    '<div class="pn"><button class="btn ghost" data-act="go" data-to="photo/' + prev.id + '">‹ 上一张</button>' +
    '<button class="btn ghost" data-act="go" data-to="photo/' + next.id + '">下一张 ›</button></div>' +
    '<div class="foot">' + esc(next.title) + ' · ' + next.year + '</div>' +
    '</div></div></div>';
}

function pageRoster() {
  const active = PEOPLE.filter(function (p) { return p.status === 'active'; });
  const alumni = PEOPLE.filter(function (p) { return p.status === 'alumni'; });
  const list = state.rosterTab === 'active' ? active : alumni;

  return '<div class="page">' +
    navBar('名册', { white: true, right: '<span class="tiny">' + PEOPLE.length + ' 位</span>' }) +
    '<div class="scroll">' +
    '<div class="seg"><button class="' + (state.rosterTab === 'active' ? 'on' : '') + '" data-act="roster-tab" data-t="active">现役 ' + active.length + '</button>' +
    '<button class="' + (state.rosterTab === 'alumni' ? 'on' : '') + '" data-act="roster-tab" data-t="alumni">已毕业 ' + alumni.length + '</button></div>' +

    '<div class="pad mt12"><div class="card retired">' +
    '<div class="rt">退役号码</div>' + RETIRED.map(function (r) {
      return '<div class="rti"><div class="rtnum">' + r.num + '</div><div><b>' + esc(r.name) + '</b><span>' + r.year + ' · ' + esc(r.note) + '</span></div></div>';
    }).join('') + '</div></div>' +

    '<div class="sec"><b>' + (state.rosterTab === 'active' ? '现役队员' : '已毕业队员') + '</b>' +
    '<span class="tiny muted">' + (state.rosterTab === 'active' ? '在队中' : '按毕业年份') + '</span></div>' +
    '<div class="list" style="margin-top:0">' + list.map(function (p) {
      return '<div class="li rc-row" data-act="go" data-to="person/' + p.id + '">' +
        '<div class="jnum">' + p.num + '</div>' +
        '<div class="rci"><b>' + esc(p.name) + '</b><span>' + (POS_CN[p.pos] || p.pos) + ' · ' + yearSpan(p) + '</span></div>' +
        '<div class="rch">' + p.honors.slice(0, 1).map(function (h) { return '<span class="tiny muted">' + esc(h) + '</span>'; }).join('') + '</div>' +
        '<span class="chev">›</span></div>';
    }).join('') + '</div>' +
    '<div class="foot">共 86 人穿过后这件球衣，这里收录了 ' + PEOPLE.length + ' 位<br>名单按加入年份排序 · 缺失的档案可以补</div>' +
    '</div></div>';
}

function pagePerson(id) {
  const p = personById(id);
  if (!p) return notFound('成员');
  const photos = PHOTOS.filter(function (ph) { return (ph.people || []).indexOf(p.id) >= 0; });
  const events = EVENTS.filter(function (e) { return (e.people || []).indexOf(p.id) >= 0; });
  const stories = STORIES.filter(function (s) { return s.person === p.id; });
  const memos = MEMORIES.filter(function (m) { return m.person === p.id; });
  const portrait = photos[0];
  const years = p.to ? p.to - p.from : TEAM.years[1] - p.from;
  const sub = p.status === 'active' ? '在队 ' + years + ' 年' : '在队 ' + years + ' 年 · ' + p.to + ' 年毕业';

  return '<div class="page">' +
    navBar(p.name, { back: true, right: '<span class="tiny">' + p.num + ' 号</span>' }) +
    '<div class="scroll">' +
    '<div class="phero">' +
    (portrait ? '<div class="phero-bg">' + photoSVG(portrait, 'xMidYMax') + '</div>' : '<div class="phero-bg alt"></div>') +
    '<div class="phero-scrim"></div>' +
    '<div class="phero-in"><div class="pnum">' + p.num + '</div>' +
    '<div class="pkick">' + (POS_CN[p.pos] || p.pos) + ' · ' + yearSpan(p) + '</div>' +
    '<h1>' + esc(p.name) + '</h1><div class="psub">' + sub + '</div></div>' +
    '</div>' +
    '<div class="stats" style="margin-top:-28px">' +
    '<div class="stat"><b>' + (photos.length * 6 + 12) + '</b><span>出场</span></div>' +
    '<div class="stat"><b>' + p.honors.length + '</b><span>荣誉</span></div>' +
    '<div class="stat"><b>' + (p.status === 'active' ? years : years) + '</b><span>在队年数</span></div>' +
    '</div>' +
    '<div class="pad mt12">' +
    (p.honors.length ? '<div class="chips">' + p.honors.map(function (h) { return '<span class="chip on">' + esc(h) + '</span>'; }).join('') + '</div>' : '') +
    '<div class="quote sm2"><div class="qmark">“</div><p>' + esc(p.quote) + '</p><div class="qby">— ' + esc(p.name) + '</div></div>' +
    '</div>' +

    (memos.length ? '<div class="sec"><b>他写下的记忆</b></div><div class="pad">' +
      memos.map(function (m) { return '<div class="memo-i nb"><div class="memo-q">' + esc(m.text) + '</div></div>'; }).join('') + '</div>' : '') +

    (photos.length ? '<div class="sec"><b>照片里的他</b><span class="tiny">' + photos.length + ' 张</span></div>' +
      '<div class="grid3">' + photos.slice(0, 6).map(function (ph) {
        return '<div class="gal" data-act="go" data-to="photo/' + ph.id + '">' + photoBox(ph, '', '1/1') + '</div>';
      }).join('') + '</div>' : '') +

    (events.length ? '<div class="sec"><b>队史里的他</b></div><div class="pad"><div class="list" style="margin:0">' +
      events.map(function (e) {
        return '<div class="li" data-act="go" data-to="' + (e.story ? 'story/' + e.story : 'timeline') + '">' +
          '<div class="evdot">' + e.year + '</div><div class="rci"><b>' + esc(e.title) + '</b><span>' + e.date + ' · ' + (KINDS[e.kind] || '') + '</span></div>' +
          '<span class="chev">›</span></div>';
      }).join('') + '</div></div>' : '') +

    (stories.length ? '<div class="sec"><b>他写的</b></div><div class="pad">' + stories.map(function (s) {
      return '<div class="card linkrow" data-act="go" data-to="story/' + s.id + '"><div><b>' + esc(s.title) + '</b><span>' + s.date + '</span></div><span class="go">›</span></div>';
    }).join('') + '</div>' : '') +

    '<div class="pad mt16"><button class="btn ghost" data-act="toast" data-msg="原型：可在这里为 ' + esc(p.name) + ' 补一张照片">＋ 补一张照片</button></div>' +
    '<div class="foot">档案编号 ' + p.id.toUpperCase() + ' · 由队史编辑维护</div>' +
    '</div></div>';
}

function pageStory(id) {
  const s = storyById(id);
  if (!s) return notFound('长文');
  const p = personById(s.person);
  const ev = EVENTS.filter(function (e) { return e.story === s.id; })[0];
  const cover = photoById((s.photos || [])[0]);

  return '<div class="page">' +
    navBar('队史长文', { back: true }) +
    '<div class="scroll">' +
    '<div class="pad">' +
    '<div class="skick">' + s.date + ' · ' + esc(KINDS[ev ? ev.kind : 'founding'] || '') + '</div>' +
    '<h1 class="sk-title">' + esc(s.title) + '</h1>' +
    '<div class="sby" data-act="go" data-to="person/' + p.id + '">' + avatar(p, 'sm') +
    '<div><b>' + esc(s.author) + '</b><span>' + p.num + ' 号 · ' + yearSpan(p) + '</span></div></div>' +
    '<p class="slead">' + esc(s.lead) + '</p>' +
    '</div>' +
    (cover ? '<div class="pad">' + photoBox(cover, '', '3/2', 'xMidYMax') + '<div class="tiny muted mt6">' + esc(cover.caption) + '</div></div>' : '') +
    '<div class="pad">' + s.paras.map(function (t) {
      return '<p class="sp">' + esc(t) + '</p>';
    }).join('') + '</div>' +
    '<div class="quote"><div class="qmark">“</div><p>' + esc(s.lead) + '</p><div class="qby">— ' + esc(s.author) + '</div></div>' +
    '<div class="pad mt16"><button class="btn ghost" data-act="go" data-to="timeline">回到编年史</button></div>' +
    '<div class="foot">写于 ' + s.date + ' · ' + (ev ? ev.title : '') + '</div>' +
    '</div></div>';
}

function pageMe() {
  const me = personById(ME);
  const myPhotos = PHOTOS.filter(function (p) { return (p.people || []).indexOf(ME) >= 0; });
  const myMemos = MEMORIES.filter(function (m) { return m.person === ME; });
  const years = TEAM.years[1] - me.from;

  return '<div class="page">' +
    navBar('我的', { white: true, right: '<span class="tiny" data-act="go" data-to="selftest">自检</span>' }) +
    '<div class="scroll">' +
    '<div class="me" style="padding-bottom:46px">' +
    '<div class="row between"><div class="row g10">' + avatar(me, 'lg') +
    '<div><h2>' + esc(me.name) + '</h2><div class="meta">' + (POS_CN[me.pos] || me.pos) + ' · ' + yearSpan(me) + ' · 你在队 ' + years + ' 年</div></div></div>' +
    '<div class="numbadge">' + me.num + '</div></div>' +
    '<p class="me-q">“' + esc(me.quote) + '”</p></div>' +
    '<div class="stats"><div class="stat"><b>' + MY.apps + '</b><span>出场</span></div>' +
    '<div class="stat"><b>' + MY.td + '</b><span>达阵</span></div>' +
    '<div class="stat"><b>' + MY.titles + '</b><span>冠军</span></div></div>' +

    '<div class="sec"><b>我的照片</b><span class="tiny" data-act="go" data-to="album">' + myPhotos.length + ' 张</span></div>' +
    '<div class="grid3">' + myPhotos.slice(0, 6).map(function (p) {
      return '<div class="gal" data-act="go" data-to="photo/' + p.id + '">' + photoBox(p, '', '1/1') + '</div>';
    }).join('') + '</div>' +

    '<div class="sec"><b>我写下的记忆</b></div><div class="pad">' +
    (myMemos.length ? myMemos.map(function (m) { return '<div class="memo-i nb"><div class="memo-q">' + esc(m.text) + '</div><div class="tiny muted mt6">' + m.year + '</div></div>'; }).join('')
      : '<div class="empty">还没有。你可以补一条。</div>') + '</div>' +

    '<div class="pad mt14"><div class="invite">' +
    '<div class="iv-t">把老队友找回来</div>' +
    '<div class="iv-s">把这张卡片发给还没进馆的人。他进来之后，就能认领自己的号码。</div>' +
    '<div class="row g8 mt12"><button class="btn ghost sm2" data-act="toast" data-msg="原型：已生成邀请卡片">分享卡片</button>' +
    '<button class="btn dark sm2" data-act="toast" data-msg="原型：已复制邀请链接">复制链接</button></div></div></div>' +

    '<div class="list">' +
    '<div class="li" data-act="go" data-to="submit"><i>＋</i>上传一段记忆<span class="chev">›</span></div>' +
    '<div class="li" data-act="toast" data-msg="原型：关于页未实现"><i>i</i>关于队史馆<span class="chev">›</span></div>' +
    '<div class="li" data-act="go" data-to="selftest"><i>✓</i>数据自检<span class="chev">›</span></div>' +
    '</div>' +
    '<div class="foot">STRIKERS 队史馆 · 原型 v2 · 演示数据</div>' +
    '</div></div>';
}

function pageSubmit() {
  const years = [];
  for (let y = TEAM.years[0]; y <= TEAM.years[1]; y++) years.push(y);
  const cand = PEOPLE.filter(function (p) { return state.submit.people.indexOf(p.id) >= 0; });

  return '<div class="page">' +
    navBar('上传记忆', { back: true }) +
    '<div class="scroll">' +
    '<div class="pad"><p class="hint">一张照片、一句话，就够。提交后由队史编辑整理入馆。</p></div>' +
    '<div class="pad"><div class="upload" data-act="pick-photo">' +
    (state.submit.photo ? '<div class="up-ok">已选择照片（原型占位）<span>点击移除</span></div>'
      : '<div class="up-add">＋</div><div class="up-t">添加照片</div><div class="tiny muted">jpg / png，建议横版</div>') +
    '</div></div>' +

    '<div class="sec"><b>什么时候</b></div><div class="pad"><div class="chips">' + years.map(function (y) {
      return '<button class="chip' + (state.submit.year === y ? ' on' : '') + '" data-act="pick-year" data-y="' + y + '">' + y + '</button>';
    }).join('') + '</div></div>' +

    '<div class="sec"><b>一句话</b></div><div class="pad">' +
    '<div class="field" style="margin:0"><textarea rows="3" placeholder="那天发生了什么？" data-act="noop">' + (state.submit.text || '') + '</textarea></div></div>' +

    '<div class="sec"><b>照片里有谁</b><span class="tiny muted">可多选</span></div>' +
    '<div class="pad"><div class="chips">' + PEOPLE.slice(0, 16).map(function (p) {
      return '<button class="chip' + (state.submit.people.indexOf(p.id) >= 0 ? ' on' : '') + '" data-act="pick-person" data-id="' + p.id + '">' + esc(p.name) + '</button>';
    }).join('') + '</div>' +
    (cand.length ? '<div class="tiny muted mt8">已选 ' + cand.map(function (p) { return p.name; }).join('、') + '</div>' : '') + '</div>' +

    '<div class="pad mt16"><button class="btn primary" data-act="submit">提交</button></div>' +
    '<div class="foot">原型：不会真正上传，也不会写库</div>' +
    '</div></div>';
}

function pageSelfTest() {
  const r = validate();
  const rows = Object.keys(r.counts).map(function (k) {
    return '<div class="strow"><span>' + k + '</span><b>' + r.counts[k] + '</b></div>';
  }).join('');
  const errs = r.ok ? '<div class="stok">✓ 数据校验通过</div>'
    : '<div class="sterr">✗ ' + r.errs.length + ' 个问题</div><div class="stlist">' + r.errs.map(function (e) { return '<div>' + esc(e) + '</div>'; }).join('') + '</div>';

  return '<div class="page">' +
    navBar('数据自检', { back: true }) +
    '<div class="scroll">' +
    '<div class="pad mt12"><p class="hint">这一页给开发者和智能体看：它和 <code>node memorial/check.mjs</code> 用的是同一个 <code>validate()</code>，所以浏览器里通过 = 命令行里通过。</p></div>' +
    errs +
    '<div class="pad mt12"><div class="card" style="padding:6px 14px">' + rows + '</div></div>' +
    '<div class="sec"><b>路由自检</b></div>' +
    '<div class="pad"><div class="card" style="padding:6px 14px">' +
    [['home', '队史馆'], ['timeline', '编年史'], ['album', '相册'], ['roster', '名册'], ['me', '我的'], ['submit', '上传'], ['photo/ph01', '照片详情'], ['person/p01', '个人'], ['story/s01', '长文']].map(function (x) {
      return '<div class="strow" data-act="go" data-to="' + x[0] + '"><span>' + x[1] + '</span><b class="go">' + x[0] + ' ›</b></div>';
    }).join('') + '</div></div>' +
    '<div class="foot">数据源 data.js · 校验函数 validate()</div>' +
    '</div></div>';
}

function notFound(what) {
  return '<div class="page">' + navBar('未找到', { back: true }) +
    '<div class="empty">没有这个' + esc(what || '页面') + '<div class="mt12"><button class="btn ghost sm2" data-act="go" data-to="home">回队史馆</button></div></div></div>';
}

/* ============================================================
   四、路由
   ============================================================ */
const ROUTES = {
  home: pageHome,
  timeline: pageTimeline,
  album: pageAlbum,
  photo: pagePhoto,
  roster: pageRoster,
  person: pagePerson,
  story: pageStory,
  me: pageMe,
  submit: pageSubmit,
  selftest: pageSelfTest
};
const TAB_ROUTES = ['home', 'timeline', 'album', 'roster', 'me'];
const TITLES = { home: '队史馆', timeline: '编年史', album: '相册', roster: '名册', me: '我的', photo: '照片', person: '成员', story: '长文', submit: '上传', selftest: '自检' };

function parseHash() {
  const raw = (location.hash || '#/home').replace(/^#\/?/, '');
  const parts = raw.split('/').filter(Boolean);
  const name = parts[0] || 'home';
  return { name: name, arg: parts[1] || '', raw: raw };
}

function render() {
  const r = parseHash();
  const fn = ROUTES[r.name];
  const view = $('#view');
  try {
    view.innerHTML = fn ? fn(r.arg) : notFound();
  } catch (err) {
    crash(err);
    return;
  }
  $('#tabbar').innerHTML = tabbar(TAB_ROUTES.indexOf(r.name) >= 0 ? r.name : '');
  $('#tabbar').style.display = TAB_ROUTES.indexOf(r.name) >= 0 ? 'flex' : 'none';
  document.title = 'STRIKERS 队史馆 · ' + (TITLES[r.name] || '');
  const sc = $('.scroll', view);
  if (sc) sc.scrollTop = 0;
  if (r.name === 'timeline') watchTimeline(r);
}

/* 出错时不白屏：把错误直接渲染到页面上（人、开发者、智能体都能看到） */
function crash(err) {
  const msg = (err && (err.stack || err.message)) || String(err);
  const view = $('#view');
  if (!view) return;
  $('#tabbar').style.display = 'none';
  view.innerHTML = '<div class="page"><div class="crash">' +
    '<b>页面渲染失败</b>' +
    '<p>路由：' + esc(location.hash || '#/home') + '</p>' +
    '<pre>' + esc(msg) + '</pre>' +
    '<button class="btn ghost sm2" data-act="go" data-to="home">回队史馆</button>' +
    '</div></div>';
  if (window.console) console.error(err);
}
window.addEventListener('error', function (e) {
  if (e && e.message) crash(e.error || new Error(e.message));
});

/* 编年史：滚动时高亮年份 chip */
function watchTimeline() {
  const sc = $('#tlscroll');
  const bar = $('#yearbar');
  if (!sc || !bar) return;
  const marks = $$('.yr', sc);
  let last = 0;
  sc.addEventListener('scroll', function () {
    const top = sc.scrollTop + 90;
    let cur = state.timelineYear;
    marks.forEach(function (m) {
      if (m.offsetTop <= top) cur = +m.dataset.year;
    });
    if (cur !== state.timelineYear) {
      state.timelineYear = cur;
      $$('.ychip', bar).forEach(function (b) {
        b.classList.toggle('on', +b.dataset.y === cur);
      });
      const on = $('.ychip.on', bar);
      if (on && bar.scrollWidth > bar.clientWidth) {
        bar.scrollTo({ left: on.offsetLeft - bar.clientWidth / 2 + on.offsetWidth / 2, behavior: 'smooth' });
      }
    }
    last = sc.scrollTop;
  }, { passive: true });
}

/* ============================================================
   五、交互（事件委托，与 prototype 的 ACT 一致）
   ============================================================ */
const go = function (to) {
  location.hash = '#/' + to;
  render();
};

const ACT = {
  go: function (el) { go(el.dataset.to); },
  back: function () {
    if (history.length > 1) history.back();
    else go('home');
  },
  toast: function (el) { showToast(el.dataset.msg || '原型演示'); },
  'album-year': function (el) { state.albumYear = el.dataset.y; render(); },
  'roster-tab': function (el) { state.rosterTab = el.dataset.t; render(); },
  'jump-year': function (el) {
    const y = +el.dataset.y;
    const target = $('.yr[data-year="' + y + '"]');
    const sc = $('#tlscroll');
    if (target && sc) sc.scrollTo({ top: target.offsetTop - 8, behavior: 'smooth' });
  },
  'pick-photo': function () { state.submit.photo = !state.submit.photo; render(); },
  'pick-year': function (el) { state.submit.year = +el.dataset.y; render(); },
  'pick-person': function (el) {
    const id = el.dataset.id;
    const i = state.submit.people.indexOf(id);
    if (i >= 0) state.submit.people.splice(i, 1);
    else state.submit.people.push(id);
    render();
  },
  submit: function () {
    showToast('已提交，队史编辑会联系你');
    state.submit = { year: 2026, people: [], photo: false };
    setTimeout(function () { go('me'); }, 700);
  },
  noop: function () {}
};

document.addEventListener('click', function (e) {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const fn = ACT[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el); }
});

let toastTimer = null;
function showToast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.classList.remove('on'); }, 1800);
}

window.addEventListener('hashchange', render);
render();
