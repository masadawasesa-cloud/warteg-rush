// Warteg Rush — every pixel is drawn here in code: food that looks like the
// real dish, the warteg room with its signature props, and the people.
export function rr(g, x, y, w, h, r, fill, stroke, lw = 2) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
}
export function cir(g, x, y, r, fill, stroke, lw = 2) {
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
}
export function ell(g, x, y, rx, ry, fill, stroke, lw = 2) {
  g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
}
export function poly(g, pts, fill, stroke, lw = 2) {
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i += 1) g.lineTo(pts[i][0], pts[i][1]);
  g.closePath();
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
}
export function line(g, x1, y1, x2, y2, color, lw = 2) {
  g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2);
  g.strokeStyle = color; g.lineWidth = lw; g.lineCap = 'round'; g.stroke();
}
export function txt(g, s, x, y, font, color, align = 'center') {
  g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle';
  g.fillText(s, x, y);
}
export const FB = (s) => `bold ${s}px "Trebuchet MS", Verdana, sans-serif`;
export const FR = (s) => `${s}px "Trebuchet MS", Verdana, sans-serif`;

// ---------------------------------------------------------------- food ----
// Draw one food item centred at (x, y), roughly s px wide, top-down, drawn
// to resemble the real thing. `burnt` blackens dishes that stayed too long.
export function drawFood(g, id, x, y, s, burnt = false) {
  const u = s / 44; // unit: designs are sketched on a 44px tile
  const dark = (c) => (burnt ? '#26221f' : c);
  g.save(); g.translate(x, y); g.scale(u, u);
  switch (id) {
    case 'rice': {
      ell(g, 0, 3, 17, 12, dark('#e8e2d2'));
      ell(g, 0, 0, 14, 10, dark('#fbf8ee'));
      g.strokeStyle = dark('#d9d2ba'); g.lineWidth = 1.2;
      for (const [gx, gy] of [[-7, -2], [0, -4], [7, -1], [-3, 3], [4, 4]]) {
        g.beginPath(); g.ellipse(gx, gy, 2.6, 1.1, 0.5, 0, Math.PI * 2); g.stroke();
      }
      break;
    }
    case 'chicken': { // raw drumstick
      ell(g, -3, 0, 13, 9, '#eec39a'); ell(g, 8, 2, 6, 5, '#f6e3c8');
      cir(g, 15, 4, 3.4, '#f8f2e2'); cir(g, 18, 1, 3, '#f8f2e2');
      break;
    }
    case 'fried_chicken': {
      ell(g, -3, 0, 14, 10, dark('#c47b27'));
      ell(g, -5, -2, 9, 6, dark('#d98f35'));
      g.fillStyle = dark('#9c5a1a');
      for (const [gx, gy] of [[-9, 2], [-2, 4], [-6, -5], [1, -1]]) cir(g, gx, gy, 1.4, g.fillStyle);
      ell(g, 9, 3, 5.5, 4.6, dark('#e8a34c'));
      cir(g, 16, 5, 3.6, '#f8f2e2'); cir(g, 19, 2, 3.1, '#f8f2e2');
      break;
    }
    case 'egg': cir(g, 0, 0, 10, '#f6efdd', '#d8cdb2'); cir(g, 0, 0, 4.4, '#f2b63c'); break;
    case 'boiled_egg': ell(g, 0, 0, 12, 9, '#fbf7ea', '#ddd3b8'); ell(g, -3, -1, 5, 4, '#f6e8c8'); break;
    case 'omelette': {
      g.beginPath(); g.ellipse(0, 0, 15, 11, 0, Math.PI, Math.PI * 2); g.closePath();
      g.fillStyle = dark('#f0b93e'); g.fill();
      rr(g, -15, -1, 30, 4, 2, dark('#e3a92e'));
      line(g, -13, 1, 13, 1, dark('#c78f1e'), 1.6);
      g.fillStyle = dark('#3f7a34');
      for (const [gx, gy] of [[-8, -5], [2, -7], [9, -4]]) cir(g, gx, gy, 1.3, g.fillStyle);
      break;
    }
    case 'balado_egg': {
      ell(g, -8, 1, 8.5, 7, dark('#c93a24')); ell(g, 8, 1, 8.5, 7, dark('#c93a24'));
      ell(g, -8, 0, 6.4, 5.2, '#fbf7ea'); ell(g, 8, 0, 6.4, 5.2, '#fbf7ea');
      cir(g, -8, 0, 3.1, '#f5a623'); cir(g, 8, 0, 3.1, '#f5a623');
      g.fillStyle = dark('#e0522e');
      for (const [gx, gy] of [[-14, 5], [0, 6], [13, 5], [-2, -6]]) cir(g, gx, gy, 1.7, g.fillStyle);
      break;
    }
    case 'tempeh': {
      rr(g, -14, -8, 28, 16, 3, '#e9dcba', '#c9b586');
      g.fillStyle = '#d9c48f';
      for (const [gx, gy] of [[-8, -3], [0, 2], [8, -3], [-3, -5], [5, 5]]) cir(g, gx, gy, 1.6, g.fillStyle);
      break;
    }
    case 'fried_tempeh': {
      for (const dx of [-8, 6]) {
        rr(g, dx - 7, -10, 14, 20, 3, dark('#d99a3a'), dark('#a96f22'));
        line(g, dx - 4, -4, dx + 4, -4, dark('#a96f22'), 1.6);
        line(g, dx - 4, 2, dx + 4, 2, dark('#a96f22'), 1.6);
      }
      break;
    }
    case 'chopped_tempeh': case 'tempeh_orek': {
      const base = id === 'tempeh_orek' ? '#a55a1e' : '#e3d3a4';
      const edge = id === 'tempeh_orek' ? '#7e4212' : '#c3ad76';
      for (const [gx, gy] of [[-9, -5], [1, -7], [9, -3], [-5, 3], [5, 4], [-11, 5], [11, 6]]) {
        rr(g, gx - 4.4, gy - 4.4, 8.8, 8.8, 2, dark(base), dark(edge), 1.2);
      }
      if (id === 'tempeh_orek') {
        g.fillStyle = dark('#c22e1c');
        for (const [gx, gy] of [[-6, -8], [7, 0], [0, 8]]) cir(g, gx, gy, 1.6, g.fillStyle);
      }
      break;
    }
    case 'tofu': {
      for (const [gx, gy] of [[-8, -4], [6, -6], [0, 6]]) rr(g, gx - 6, gy - 6, 12, 12, 3, '#f4efe0', '#d9d0b4', 1.4);
      break;
    }
    case 'fried_tofu': {
      for (const [gx, gy] of [[-8, -4], [6, -6], [0, 6]]) {
        rr(g, gx - 6.4, gy - 6.4, 12.8, 12.8, 3.4, dark('#e0aa4e'), dark('#b57f2a'), 1.4);
        cir(g, gx, gy, 1.5, dark('#c99034'));
      }
      break;
    }
    case 'fish': case 'fried_fish': {
      const body = id === 'fish' ? '#b9c4c9' : '#b06a24';
      const side = id === 'fish' ? '#9fb0b8' : '#c97f31';
      poly(g, [[8, 0], [17, -8], [16, 0], [17, 8]], dark(side));
      ell(g, -2, 0, 13, 7.6, dark(body));
      ell(g, -4, -1, 9, 5, dark(side));
      cir(g, -11, -2, 1.7, '#20242a');
      if (id === 'fried_fish') {
        line(g, -3, -5, 0, 4, '#7e4c14', 1.6); line(g, 3, -5, 6, 4, '#7e4c14', 1.6);
      } else { line(g, -6, -6, -4, 6, '#86979f', 1.6); }
      break;
    }
    case 'lodehveg': {
      g.strokeStyle = '#4d7d33'; g.lineWidth = 2.4; g.lineCap = 'round';
      for (const a of [-0.5, 0, 0.5]) { g.beginPath(); g.moveTo(-10, 6); g.quadraticCurveTo(0, a * 12, 11, -4 + a * 6); g.stroke(); }
      ell(g, 2, 4, 6, 4.4, '#8fae4e'); ell(g, -6, -3, 5, 4, '#6d9140'); cir(g, 8, -6, 3.4, '#7a4a86');
      break;
    }
    case 'lodeh': { // served in its bowl of coconut curry
      cir(g, 0, 0, 16, '#eef0ee', '#b9beb9', 2);
      cir(g, 0, 0, 12.6, dark('#e9b64f'));
      g.strokeStyle = dark('#4d7d33'); g.lineWidth = 2;
      g.beginPath(); g.moveTo(-8, 3); g.quadraticCurveTo(0, -3, 8, 2); g.stroke();
      ell(g, -4, -4, 3.6, 2.8, dark('#8fae4e')); cir(g, 5, -5, 2.6, dark('#7a4a86')); cir(g, 2, 6, 2.2, dark('#c96a2e'));
      break;
    }
    case 'kangkung': case 'chopped_kangkung': {
      g.strokeStyle = '#3e7a2e'; g.lineWidth = 2.2; g.lineCap = 'round';
      const n = id === 'kangkung' ? 6 : 8;
      for (let i = 0; i < n; i += 1) {
        const a = (i / n) * Math.PI * 2;
        g.beginPath(); g.moveTo(0, 0);
        g.quadraticCurveTo(Math.cos(a) * 8, Math.sin(a) * 8 - 3, Math.cos(a) * 13, Math.sin(a) * 10);
        g.stroke();
        ell(g, Math.cos(a) * 12, Math.sin(a) * 9, 3.2, 2, '#4f9440');
      }
      break;
    }
    case 'stir_kangkung': {
      g.strokeStyle = dark('#35702a'); g.lineWidth = 2.4; g.lineCap = 'round';
      for (let i = 0; i < 7; i += 1) {
        const a = (i / 7) * Math.PI * 2 + 0.4;
        g.beginPath(); g.moveTo(-4, 2);
        g.quadraticCurveTo(Math.cos(a) * 9, Math.sin(a) * 7 - 4, Math.cos(a) * 13, Math.sin(a) * 9);
        g.stroke();
      }
      ell(g, 0, -2, 10, 6, dark('#3f7d33'));
      g.fillStyle = dark('#d0341e');
      for (const [gx, gy] of [[-6, 3], [5, -4], [8, 5]]) cir(g, gx, gy, 1.7, g.fillStyle);
      break;
    }
    case 'sambal': {
      cir(g, 0, 0, 10, '#6e5a4a', '#54432f', 1.6);
      ell(g, 0, -1, 7.6, 6, dark('#c9331d'));
      g.fillStyle = dark('#e0522e');
      for (const [gx, gy] of [[-3, -3], [3, 0], [0, 2]]) cir(g, gx, gy, 1.5, g.fillStyle);
      break;
    }
    case 'crackers': {
      cir(g, -6, 1, 8, '#f2e7c8', '#d9c48f', 1.4);
      cir(g, 7, -2, 7, '#f6edd2', '#d9c48f', 1.4);
      g.fillStyle = '#e3d09e';
      for (const [gx, gy] of [[-7, 0], [6, -3], [8, 3]]) cir(g, gx, gy, 1.2, g.fillStyle);
      break;
    }
    case 'tea': { // a glass of sweet iced tea
      rr(g, -7, -13, 14, 26, 3, 'rgba(214,138,44,0.92)', '#a86a1e', 1.6);
      rr(g, -4.6, -9, 4.6, 4.6, 1, 'rgba(240,248,252,0.9)');
      rr(g, 1, -3, 4.6, 4.6, 1, 'rgba(240,248,252,0.9)');
      line(g, 3, -6, 8, -15, '#d23b2e', 2.6);
      break;
    }
    default: cir(g, 0, 0, 10, '#cccccc');
  }
  g.restore();
}

// A plate with its food arranged on it: rice dome centre-back, dishes in a
// ring, sambal dollop and crackers at the rim, tea standing beside it.
export function drawPlate(g, items, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  ell(g, 0, 4, 47, 30, 'rgba(30,20,10,0.18)');
  ell(g, 0, 0, 46, 29, '#f4f1e6', '#c9c2ab', 2);
  ell(g, 0, 0, 37, 22, '#e9e4d2');
  const dishes = items.filter((i) => i !== 'rice' && i !== 'sambal' && i !== 'crackers' && i !== 'tea');
  if (items.includes('rice')) drawFood(g, 'rice', -4, -6, 40);
  const spots = [[-24, 6], [16, 8], [0, 13]];
  dishes.slice(0, 3).forEach((id, i) => drawFood(g, id, spots[i][0], spots[i][1], 33));
  if (items.includes('sambal')) { ell(g, 26, -8, 7.6, 6, '#c9331d'); cir(g, 25, -9, 2, '#e0522e'); }
  if (items.includes('crackers')) { cir(g, -30, -10, 7.4, '#f2e7c8', '#d9c48f', 1.3); cir(g, -22, -14, 6.4, '#f6edd2', '#d9c48f', 1.3); }
  if (items.includes('tea')) drawFood(g, 'tea', 56, -4, 30);
  g.restore();
}

// ---------------------------------------------------------------- room ----
import { LAYOUT } from './config.js';
import { RAW } from './data.js';

const BIN_ORDER = ['chicken', 'egg', 'tempeh', 'tofu', 'fish', 'lodehveg', 'kangkung'];

export function binRect(i) {
  const row = Math.floor(i / 4), col = i % 4;
  return { x: LAYOUT.binX[col], y: LAYOUT.binRows[row], w: LAYOUT.binW, h: LAYOUT.binH };
}

function drawWall(g, t, dayMinute) {
  const L = LAYOUT;
  rr(g, 0, 0, 1280, L.wallH, 0, '#f3ecd8');
  // green half-tile wainscot along the wall base
  rr(g, 0, L.wallH - 26, 1280, 26, 0, '#7aa884');
  g.strokeStyle = '#67936f'; g.lineWidth = 1;
  for (let x = 0; x < 1280; x += 32) { g.beginPath(); g.moveTo(x, L.wallH - 26); g.lineTo(x, L.wallH); g.stroke(); }
  rr(g, 0, L.wallH - 3, 1280, 3, 0, '#5d4632');
  // shop sign
  rr(g, 18, 10, 300, 52, 6, '#b3372c', '#7e231b', 3);
  txt(g, 'WARTEG BU SITI', 168, 30, FB(25), '#ffe9b0');
  txt(g, 'WARTEG RUSH', 168, 52, FB(13), '#ffd9a0');
  // handwritten menu board
  rr(g, 336, 8, 252, 56, 3, '#fbf7e8', '#a68d5f', 2);
  txt(g, "TODAY'S MENU", 350, 20, FB(13), '#c22e1c', 'left');
  txt(g, 'Rice+Fried Chicken 12k · Balado Egg 10k', 350, 38, FR(12.5), '#3c3c42', 'left');
  txt(g, 'Lodeh 9k · Sweet Tea 4k', 350, 53, FR(12.5), '#3c3c42', 'left');
  // wall clock, hands follow the day clock
  cir(g, 640, 34, 24, '#fcfbf6', '#4a4a50', 3);
  const a1 = -Math.PI / 2 + (dayMinute / 60) * Math.PI * 2;
  const a2 = -Math.PI / 2 + dayMinute * Math.PI * 2;
  line(g, 640, 34, 640 + Math.cos(a1) * 12, 34 + Math.sin(a1) * 12, '#33333a', 3);
  line(g, 640, 34, 640 + Math.cos(a2) * 17, 34 + Math.sin(a2) * 17, '#33333a', 2);
  cir(g, 640, 34, 3, '#c22e1c');
  // calendar with a food picture
  rr(g, 684, 8, 52, 56, 2, '#fdfcf6', '#a39a83', 1.5);
  rr(g, 684, 8, 52, 13, 2, '#c22e1c');
  ell(g, 710, 36, 12, 8, '#d8943a', '#a96f22', 1.4);
  txt(g, 'NOV', 710, 56, FB(10), '#6a6353');
  // wall fan, blades spin with t
  cir(g, 792, 34, 25, null, '#7d838c', 3);
  g.save(); g.translate(792, 34); g.rotate(t * 7);
  g.fillStyle = '#aeb6be';
  for (let i = 0; i < 3; i += 1) { g.rotate((Math.PI * 2) / 3); ell(g, 11, 0, 12, 5.4, '#aeb6be'); }
  g.restore();
  cir(g, 792, 34, 5, '#787f88');
  // hanging sachet strips, swaying gently
  const sachetCols = ['#c47832', '#96603a', '#5d8a4d', '#c22e1c', '#e8c85a'];
  for (let i = 0; i < 5; i += 1) {
    const sx = 852 + i * 30;
    const sway = Math.sin(t * 1.6 + i) * 2;
    line(g, sx, 0, sx + sway, 12, '#8a8a8a', 1.4);
    for (let k = 0; k < 3; k += 1) rr(g, sx - 7 + sway * (k + 1) / 3, 12 + k * 15, 14, 13, 2, sachetCols[(i + k) % 5], '#8a744a', 1);
  }
  // corner TV playing a soap opera
  rr(g, 1036, 8, 150, 58, 4, '#232326');
  rr(g, 1044, 14, 134, 46, 2, '#7fb2d9');
  rr(g, 1044, 44, 134, 16, 0, '#5d8a4d');
  cir(g, 1104, 34, 9, '#f2c893');
  cir(g, 1136, 36, 8, '#e8b184');
  txt(g, 'SOAP', 1052, 20, FB(9), '#ffffff', 'left');
  txt(g, 'OPEN', 1216, 80, FB(13), '#3f7a34');
}

function drawEtalase(g, t) {
  const E = LAYOUT.etalase;
  rr(g, E.x, E.y, E.w, E.h, 8, '#8a5a34');
  rr(g, E.x + 6, E.y + 6, E.w - 12, E.h - 46, 6, '#bfe0ec');
  BIN_ORDER.forEach((rawId, i) => {
    const b = binRect(i);
    rr(g, b.x, b.y, b.w, b.h, 5, '#e8f2f4', '#9db8c0', 1.5);
    // a little pile of the raw ingredient in its tray
    for (let k = 0; k < 3; k += 1) {
      drawFood(g, rawId, b.x + 16 + (k % 2) * 26 + (k === 2 ? 8 : 0), b.y + 26 + Math.floor(k / 2) * 24, 30);
    }
    txt(g, RAW[rawId].name.toUpperCase(), b.x + b.w / 2, b.y + b.h - 11, FB(10.5), '#33565f');
  });
  // glass shine
  poly(g, [[E.x + 30, E.y + 10], [E.x + 96, E.y + 10], [E.x + 44, E.y + 190], [E.x + 12, E.y + 190]], 'rgba(255,255,255,0.20)');
  rr(g, E.x, E.y + E.h - 38, E.w, 38, 6, '#6e4525');
  txt(g, 'FRESH INGREDIENTS', E.x + E.w / 2, E.y + E.h - 19, FB(14), '#ffdf9e');
}

function drawStove(g, world, t) {
  const S = LAYOUT.stove;
  rr(g, S.x, S.y, S.w, S.h, 8, '#b3502e');
  rr(g, S.x, S.y, S.w, 26, 8, '#8f3c20');
  txt(g, 'STOVE', S.x + 16, S.y + 13, FB(13), '#ffe3c2', 'left');
  const flame = (cx, cy, on) => {
    if (!on) { cir(g, cx, cy, 21, '#3c3a3c'); return; }
    cir(g, cx, cy, 21, '#3c3a3c');
    for (let i = 0; i < 7; i += 1) {
      const fx = cx - 15 + i * 5;
      const fh = 8 + Math.abs(Math.sin(t * 11 + i * 1.7)) * 7;
      poly(g, [[fx - 3, cy + 12], [fx, cy + 12 - fh], [fx + 3, cy + 12]], i % 2 ? '#f59c28' : '#e86a1e');
    }
  };
  world.stations.filter((s) => s.kind === 'fry').forEach((st, i) => {
    const F = LAYOUT.fryers[i];
    flame(F.cx, F.cy + 8, true);
    ell(g, F.cx, F.cy - 4, 27, 17, '#43464a');
    ell(g, F.cx, F.cy - 5, 22, 13, st.item ? '#8a5a20' : '#5a5e63');
    txt(g, 'WOK ' + (i + 1), F.cx, F.cy + 34, FB(11), '#ffd9ae');
  });
  // boil pot and the big lodeh pot
  const B = LAYOUT.boil;
  cir(g, B.cx, B.cy + 6, 19, '#3c3a3c'); cir(g, B.cx, B.cy, 21, '#8f959c'); cir(g, B.cx, B.cy, 16, '#c8ced4');
  txt(g, 'BOIL', B.cx, B.cy + 36, FB(11), '#ffd9ae');
  const P = LAYOUT.bigpot;
  cir(g, P.cx, P.cy + 6, 23, '#3c3a3c'); cir(g, P.cx, P.cy, 25, '#7d838c'); cir(g, P.cx, P.cy, 19.5, '#e9b64f');
  ell(g, P.cx - 5, P.cy - 4, 4.6, 3.4, '#8fae4e'); cir(g, P.cx + 6, P.cy + 3, 3, '#7a4a86');
  txt(g, 'LODEH POT', P.cx, P.cy + 38, FB(11), '#ffd9ae');
  // rice cooker with its stock pips
  const R = LAYOUT.rice;
  rr(g, R.cx - 34, R.cy - 22, 68, 52, 9, '#f2f0ea', '#b9b4a4', 2);
  rr(g, R.cx - 34, R.cy - 22, 68, 15, 9, '#d8d2c2');
  cir(g, R.cx + 22, R.cy + 12, 4, world.riceCooking ? '#e8a13a' : '#58a34c');
  txt(g, 'RICE', R.cx - 6, R.cy + 12, FB(12), '#6a6353');
  for (let i = 0; i < 10; i += 1) {
    cir(g, R.cx - 26 + i * 5.6, R.cy + 40, 2.4, i < world.riceStock ? '#58a34c' : '#d8d2c2');
  }
  if (world.riceCooking) txt(g, 'COOKING…', R.cx, R.cy + 54, FB(10.5), '#ffe3c2');
}

export function drawRoom(g, world, t) {
  const L = LAYOUT;
  // tiled floor with a warm stove-zone mat and a queue mat
  rr(g, 0, L.wallH, 1280, 720 - L.wallH, 0, '#e3d9bd');
  g.strokeStyle = '#cfc096'; g.lineWidth = 1;
  for (let x = 0; x <= 1280; x += 46) { g.beginPath(); g.moveTo(x, L.wallH); g.lineTo(x, 720); g.stroke(); }
  for (let y = L.wallH; y <= 720; y += 46) { g.beginPath(); g.moveTo(0, y); g.lineTo(1280, y); g.stroke(); }
  rr(g, 684, 204, 588, 300, 10, 'rgba(179,80,46,0.13)');
  rr(g, 388, 500, 576, 108, 10, 'rgba(70,110,160,0.10)');
  drawWall(g, t, world.dayTimeLeft);
  drawEtalase(g, t);
  // cutting counter
  const C = L.chop;
  rr(g, C.x, C.y, C.w, C.h, 7, '#a9743f'); rr(g, C.x, C.y, C.w, 16, 7, '#8a5a2e');
  txt(g, 'CUTTING BOARD', C.cx, C.y + 104, FB(11.5), '#ffedc9');
  rr(g, C.cx - 34, C.cy - 24, 68, 48, 5, '#d9b878', '#b08d4e', 2);
  line(g, C.cx - 30, C.cy, C.cx + 30, C.cy, '#b08d4e', 1.4);
  // staple shelf: sambal cobek + cracker jar
  const SH = L.shelf;
  rr(g, SH.x, SH.y, SH.w, SH.h, 7, '#7a6a4f'); rr(g, SH.x, SH.y, SH.w, 16, 7, '#5f5138');
  txt(g, 'SAMBAL · CRACKERS', SH.x + SH.w / 2, SH.y + 104, FB(11.5), '#ffedc9');
  cir(g, L.cobek.cx, L.cobek.cy, 21, '#5d4a38'); ell(g, L.cobek.cx, L.cobek.cy - 2, 15, 11, '#c9331d');
  ell(g, L.jar.cx, L.jar.cy, 21, 24, 'rgba(205,228,238,0.85)', '#7d9ca8', 2);
  cir(g, L.jar.cx - 6, L.jar.cy - 6, 8.4, '#f2e7c8', '#d9c48f', 1.2);
  cir(g, L.jar.cx + 7, L.jar.cy + 5, 7.6, '#f6edd2', '#d9c48f', 1.2);
  rr(g, L.jar.cx - 21, L.jar.cy - 30, 42, 8, 3, '#b3372c');
  // plating counter
  const PL = L.plating;
  rr(g, PL.x, PL.y, PL.w, PL.h, 7, '#4f7d8a'); rr(g, PL.x, PL.y, PL.w, 16, 7, '#3c626d');
  txt(g, 'PLATING', PL.x + 14, PL.y + 8 + 96, FB(11.5), '#dff2f7', 'left');
  for (let i = 0; i < 4; i += 1) ell(g, L.plateStand.cx, L.plateStand.cy - i * 5, 30, 12, '#f4f1e6', '#c9c2ab', 1.4);
  for (const s of L.plateSlots) { ell(g, s.cx, s.cy, 40, 24, 'rgba(255,255,255,0.20)', 'rgba(255,255,255,0.5)', 1.6); }
  drawStove(g, world, t);
  // tea dispenser stand
  const TE = L.tea;
  rr(g, TE.x, TE.y, TE.w, TE.h, 7, '#5d7a52'); rr(g, TE.x, TE.y, TE.w, 16, 7, '#47603e');
  rr(g, TE.cx - 20, TE.cy - 30, 40, 52, 5, '#cfd8dc', '#93a1a8', 2);
  rr(g, TE.cx - 20, TE.cy - 30, 40, 14, 5, '#b3372c');
  txt(g, 'TEA', TE.cx, TE.y + 96, FB(11.5), '#eaf5e4');
  // trash bin
  const TR = L.trash;
  rr(g, TR.x, TR.y, TR.w, TR.h, 5, '#707880'); rr(g, TR.x - 3, TR.y - 6, TR.w + 6, 10, 4, '#596068');
  txt(g, 'BIN', TR.ix, TR.y + TR.h + 12, FB(10.5), '#7a7260');
  // dining tables with checked cloths, stools, bottles and tissue
  L.tables.forEach((tb, i) => {
    const cloth = i === 0 ? '#c2505c' : '#4a6fa5';
    for (const [sx, sy] of [[-58, -8], [58, -8], [-58, 34], [58, 34]]) rr(g, tb.x + sx - 15, tb.y + sy - 11, 30, 22, 5, ['#d23b2e', '#2e6fc2', '#e8a13a', '#3f9e4d'][(i + (sx > 0 ? 1 : 0) + (sy > 0 ? 2 : 0)) % 4]);
    cir(g, tb.x, tb.y, 47, cloth, '#00000022', 2);
    cir(g, tb.x, tb.y, 39, cloth);
    g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2;
    for (const off of [-20, 0, 20]) { g.beginPath(); g.moveTo(tb.x + off, tb.y - 38); g.lineTo(tb.x + off, tb.y + 38); g.stroke(); }
    rr(g, tb.x - 34, tb.y - 16, 9, 20, 3, '#c9331d'); rr(g, tb.x - 22, tb.y - 15, 8, 19, 3, '#4a2e1e');
    rr(g, tb.x + 18, tb.y - 12, 22, 13, 2, '#f08bb0'); poly(g, [[tb.x + 26, tb.y - 12], [tb.x + 30, tb.y - 20], [tb.x + 33, tb.y - 12]], '#fdfdf8');
  });
  // serving counter
  const SC = L.counter;
  rr(g, SC.x, SC.y, SC.w, SC.h, 6, '#8a5a34'); rr(g, SC.x, SC.y, SC.w, 10, 6, '#a9743f');
  // cashier desk with register and receipt
  const CD = L.cashierDesk;
  rr(g, CD.x, CD.y, CD.w, CD.h, 7, '#5a4632'); rr(g, CD.x, CD.y, CD.w, 14, 7, '#6e573d');
  txt(g, 'CASHIER', CD.x + CD.w - 14, CD.y + 24, FB(13), '#ffdf9e', 'right');
  rr(g, 1024, 548, 52, 34, 4, '#37474f'); rr(g, 1030, 554, 40, 16, 2, '#9fd8c9');
  poly(g, [[1062, 548], [1072, 548], [1070, 528], [1064, 528]], '#fdfdf8');
  // the warteg cat, asleep by the etalase: it breathes, its tail tip sways
  // in its sleep, and one ear twitches every few seconds
  const cat = L.cat, br = Math.sin(t * 1.8) * 1.6;
  const sway = Math.sin(t * 0.9) * 2.6;
  const twitch = (t % 7) < 0.18 ? 2.2 : 0;
  ell(g, cat.x, cat.y + 6, 30, 10 + br * 0.9, '#e89c42');
  cir(g, cat.x + 26, cat.y + br * 0.3, 11, '#eda94e');
  poly(g, [[cat.x + 19, cat.y - 8], [cat.x + 22, cat.y - 17], [cat.x + 27, cat.y - 9]], '#eda94e');
  poly(g, [[cat.x + 28, cat.y - 9], [cat.x + 33 + twitch, cat.y - 16], [cat.x + 36, cat.y - 7]], '#eda94e');
  g.beginPath(); g.moveTo(cat.x - 22, cat.y + 9);
  g.quadraticCurveTo(cat.x - 40, cat.y + 13 + sway, cat.x - 37, cat.y + 3 + sway * 1.7);
  g.strokeStyle = '#d98a34'; g.lineWidth = 4.4; g.lineCap = 'round'; g.stroke();
  line(g, cat.x - 14, cat.y + 2, cat.x + 12, cat.y + 2, '#cf8434', 2.4);
}

// -------------------------------------------------------------- people ----
export const SKINS = ['#c98f62', '#b57a4a', '#a06638', '#d9a06b'];
export const SHIRTS = ['#2e6fc2', '#c2505c', '#3f9e4d', '#e8a13a', '#7a4a86', '#4a7d8a'];
export const HAIRS = ['#26221e', '#3a2c1c', '#14100c', '#4a3826'];

// p: {x, y, skin, shirt, hair, hairStyle ('cap'|'short'|'hijab'|'bun'),
//     apron, walk (phase or -1), blink, mouth ('smile'|'flat'|'sad'|''),
//     chop (0..1 or -1), carry (plate items array or null), face (-1|1)}
export function drawPerson(g, p, t) {
  const bob = p.walk >= 0 ? Math.abs(Math.sin(p.walk)) * 3 : Math.sin(t * 2 + p.x * 0.05) * 1.1;
  const y = p.y - bob;
  ell(g, p.x, p.y + 30, 20, 6.4, 'rgba(30,20,10,0.20)');
  // legs while walking
  if (p.walk >= 0) {
    const sw = Math.sin(p.walk) * 8;
    rr(g, p.x - 11, y + 16, 9, 15, 4, '#4a4a55');
    rr(g, p.x + 3 + sw * 0.4, y + 16, 9, 15, 4, '#3d3d48');
  }
  // body
  rr(g, p.x - 17, y - 6, 34, 30, 9, p.shirt);
  if (p.apron) {
    rr(g, p.x - 12, y + 2, 24, 22, 4, '#c22e1c');
    line(g, p.x - 12, y + 2, p.x - 5, y - 6, '#c22e1c', 4);
    line(g, p.x + 12, y + 2, p.x + 5, y - 6, '#c22e1c', 4);
  }
  // arms
  const armY = y + 2;
  if (p.carry) {
    rr(g, p.x - 20, armY + 6, 12, 7, 3.4, p.skin);
    rr(g, p.x + 8, armY + 6, 12, 7, 3.4, p.skin);
  } else if (p.chop >= 0) {
    rr(g, p.x - 21, armY + 2, 9, 14, 4, p.skin);
    const lift = Math.sin(p.chop * Math.PI * 2) * 9;
    rr(g, p.x + 12, armY - 4 - lift, 8, 15, 4, p.skin);
    if (p.tool === 'spoon') {
      line(g, p.x + 16, armY - 6 - lift, p.x + 19, armY - 16 - lift, '#8a5a2e', 2.4);
      ell(g, p.x + 20, armY - 18 - lift, 3.4, 2.4, '#c8ced4');
    } else {
      rr(g, p.x + 15, armY - 16 - lift, 5, 12, 2, '#8a5a2e');
      poly(g, [[p.x + 14, armY - 24 - lift], [p.x + 24, armY - 24 - lift], [p.x + 22, armY - 15 - lift], [p.x + 15, armY - 15 - lift]], '#c8ced4');
    }
  } else {
    const sway = p.walk >= 0 ? Math.sin(p.walk) * 3 : Math.sin(t * 2 + p.x * 0.05) * 1.2;
    rr(g, p.x - 21, armY + sway, 8, 14, 4, p.skin);
    rr(g, p.x + 13, armY - sway, 8, 14, 4, p.skin);
  }
  // head
  cir(g, p.x, y - 20, 14.5, p.skin);
  cir(g, p.x - 14.5, y - 19, 3.2, p.skin); cir(g, p.x + 14.5, y - 19, 3.2, p.skin);
  if (p.hairStyle === 'cap') {
    g.beginPath(); g.ellipse(p.x, y - 26, 15, 9, 0, Math.PI, Math.PI * 2); g.closePath();
    g.fillStyle = '#c22e1c'; g.fill();
    rr(g, p.x - 16, y - 27, 32, 4.4, 2, '#a02318');
  } else if (p.hairStyle === 'hijab') {
    g.beginPath(); g.ellipse(p.x, y - 20, 16.4, 15.4, 0, 0, Math.PI * 2);
    g.fillStyle = p.hair; g.fill();
    cir(g, p.x, y - 19, 12.4, p.skin);
    rr(g, p.x - 13, y - 8, 26, 7, 3, p.hair);
  } else if (p.hairStyle === 'bun') {
    g.beginPath(); g.ellipse(p.x, y - 25, 14.6, 8.6, 0, Math.PI, Math.PI * 2); g.closePath();
    g.fillStyle = p.hair; g.fill();
    cir(g, p.x, y - 33, 5.4, p.hair);
  } else {
    g.beginPath(); g.ellipse(p.x, y - 25, 14.6, 8.8, 0, Math.PI, Math.PI * 2); g.closePath();
    g.fillStyle = p.hair; g.fill();
  }
  // face
  if (p.blink) {
    line(g, p.x - 8, y - 19, p.x - 3, y - 19, '#2c2118', 1.8);
    line(g, p.x + 3, y - 19, p.x + 8, y - 19, '#2c2118', 1.8);
  } else {
    cir(g, p.x - 5.6, y - 19, 1.9, '#2c2118'); cir(g, p.x + 5.6, y - 19, 1.9, '#2c2118');
  }
  if (p.mouth === 'smile') { g.beginPath(); g.arc(p.x, y - 13.4, 4.6, 0.25, Math.PI - 0.25); g.strokeStyle = '#7e4212'; g.lineWidth = 1.8; g.stroke(); }
  if (p.mouth === 'flat') line(g, p.x - 3.4, y - 10.6, p.x + 3.4, y - 10.6, '#7e4212', 1.8);
  if (p.mouth === 'sad') { g.beginPath(); g.arc(p.x, y - 7.6, 4.2, Math.PI + 0.3, Math.PI * 2 - 0.3); g.strokeStyle = '#7e4212'; g.lineWidth = 1.8; g.stroke(); }
  // a carried plate rides in front, at chest height
  if (p.carry) drawPlate(g, p.carry, p.x, y + 16, 0.62);
}

// Patience bar + mood face above a waiting customer.
export function drawPatience(g, x, y, frac, t) {
  const w = 54;
  rr(g, x - w / 2 - 2, y - 2, w + 4, 10, 5, 'rgba(20,16,10,0.55)');
  const col = frac > 0.5 ? '#58c14c' : frac > 0.25 ? '#f0b63c' : '#e03a24';
  rr(g, x - w / 2, y, Math.max(3, w * frac), 6, 3, frac <= 0.25 && Math.sin(t * 10) > 0 ? '#ff5a3c' : col);
}
