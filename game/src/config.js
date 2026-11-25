// Warteg Rush — field, timing and day tuning in one place.
export const VIEW = { width: 1280, height: 720 };
export const STEP = 1 / 60;

export const DAY_LENGTH = 150; // seconds of service per day
export const HEARTS_PER_DAY = 3;
export const QUEUE_SLOTS = 4;
export const COMBO_WINDOW = 12; // seconds to keep a serve streak alive
export const BURN_GRACE = 9; // seconds a finished dish survives before it burns

export const RICE_MAX = 10;
export const RICE_COOK_TIME = 14;

// One entry per day; days past the list reuse the last row with a harder target.
export const DAYS = [
  { target: 120000, spawnEvery: 9.0, unlock: ['fried_chicken', 'omelette', 'fried_tempeh', 'fried_tofu'] },
  { target: 175000, spawnEvery: 7.0, unlock: ['fried_chicken', 'omelette', 'fried_tempeh', 'fried_tofu', 'fried_fish', 'balado_egg'] },
  { target: 235000, spawnEvery: 5.6, unlock: ['fried_chicken', 'omelette', 'fried_tempeh', 'fried_tofu', 'fried_fish', 'balado_egg', 'tempeh_orek', 'lodeh', 'stir_kangkung'] },
];

export function dayConfig(day) {
  const row = DAYS[Math.min(day - 1, DAYS.length - 1)];
  const extra = Math.max(0, day - DAYS.length);
  return {
    target: row.target + extra * 60000,
    spawnEvery: Math.max(4.2, row.spawnEvery - extra * 0.5),
    unlock: row.unlock,
  };
}

export const MONEY = (n) => 'Rp ' + Math.round(n).toLocaleString('en-US');

// Fixed room geometry shared by the simulation and the drawing code.
export const LAYOUT = {
  wallH: 96,
  board: { x: 16, y: 106, w: 856, h: 88 },
  hud: { x: 888, y: 106, w: 376, h: 88 },
  etalase: { x: 16, y: 212, w: 288, h: 272 },
  binRows: [240, 348],
  binX: [28, 96, 164, 232],
  binW: 62, binH: 92,
  chop: { x: 336, y: 212, w: 150, h: 118, cx: 411, cy: 262, ix: 411, iy: 350 },
  shelf: { x: 502, y: 212, w: 158, h: 118 },
  cobek: { cx: 548, cy: 262, ix: 548, iy: 350 },
  jar: { cx: 616, cy: 262, ix: 616, iy: 350 },
  plating: { x: 336, y: 356, w: 324, h: 128 },
  plateStand: { cx: 392, cy: 420, ix: 392, iy: 502 },
  plateSlots: [{ cx: 492, cy: 420, ix: 492, iy: 502 }, { cx: 592, cy: 420, ix: 592, iy: 502 }],
  stove: { x: 692, y: 212, w: 572, h: 128 },
  fryers: [{ cx: 748, cy: 268, ix: 748, iy: 360 }, { cx: 838, cy: 268, ix: 838, iy: 360 }],
  boil: { cx: 928, cy: 268, ix: 928, iy: 360 },
  bigpot: { cx: 1024, cy: 268, ix: 1024, iy: 360 },
  rice: { cx: 1152, cy: 262, ix: 1152, iy: 360 },
  tea: { x: 692, y: 372, w: 104, h: 112, cx: 744, cy: 420, ix: 744, iy: 502 },
  trash: { x: 812, y: 428, w: 44, h: 56, ix: 834, iy: 502 },
  counter: { x: 396, y: 536, w: 560, h: 34 },
  queueX: [470, 610, 750, 890],
  queueY: 622,
  serveY: 516,
  tables: [{ x: 112, y: 608 }, { x: 264, y: 608 }],
  cashierDesk: { x: 996, y: 536, w: 268, h: 74 },
  cashier: { x: 1130, y: 512 },
  cat: { x: 322, y: 514 },
  door: { x: 1252, y: 660 },
  playerStart: { x: 500, y: 518 },
};
