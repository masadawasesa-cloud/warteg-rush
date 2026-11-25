// Warteg Rush — draws the whole frame: room, food in progress, people,
// order tickets, the status panel, and the title / day-end / game-over
// screens. All in-game text is English.
import { LAYOUT, MONEY, VIEW } from './config.js';
import { FOOD, foodName, hopFor } from './data.js';
import { rr, cir, ell, line, txt, FB, FR, drawFood, drawPlate, drawRoom, drawPerson, drawPatience } from './art.js';
import { SCREEN } from './world.js';

const blink = (t, off) => ((t + off) % 3.4) < 0.11;

function drawStationItems(g, world, t) {
  for (const st of world.stations) {
    if (st.kind === 'slot' && st.plate) drawPlate(g, st.plate, st.cx, st.cy, 0.82);
    const it = st.item;
    if (!it) continue;
    const bounce = it.state === 'done' ? Math.sin(t * 6) * 1.6 : 0;
    drawFood(g, it.id, st.cx, st.cy + bounce, 40, it.state === 'burnt');
    if (it.state === 'cooking') {
      const frac = it.t / it.total;
      rr(g, st.cx - 23, st.cy + 24, 46, 7, 3.5, 'rgba(20,16,10,0.55)');
      rr(g, st.cx - 21, st.cy + 26, 42 * frac, 3.4, 2, '#f0b63c');
    } else if (it.state === 'done') {
      rr(g, st.cx - 23, st.cy + 24, 46, 7, 3.5, 'rgba(20,16,10,0.55)');
      rr(g, st.cx - 21, st.cy + 26, 42, 3.4, 2, '#58c14c');
    } else if (it.state === 'burnt') {
      txt(g, 'BURNT', st.cx, st.cy + 28, FB(10.5), '#ff9a80');
    }
  }
}

function drawCustomers(g, world, t) {
  const sorted = [...world.customers].sort((a, b) => a.y - b.y);
  for (const c of sorted) {
    const frac = c.patienceLeft / c.patienceMax;
    const mouth = c.state === 'queue' || c.state === 'arrive'
      ? (frac > 0.5 ? 'smile' : frac > 0.25 ? 'flat' : 'sad')
      : c.state === 'leaving' && c.angry ? 'sad' : 'smile';
    const eating = c.state === 'eating';
    drawPerson(g, {
      x: c.x, y: c.y, skin: c.skin, shirt: c.shirt, hair: c.hair, hairStyle: c.hairStyle,
      walk: c.moving ? c.walkPhase : -1,
      blink: blink(t, c.blinkOff), mouth,
      chop: eating ? (world.time * 1.4) % 1 : -1, tool: 'spoon',
      carry: null,
    }, t);
    if (eating && c.plateItems && c.seat) {
      const px = c.x + (c.seat.tx - c.x) * 0.45, py = c.y + (c.seat.ty - c.y) * 0.45;
      drawPlate(g, c.plateItems, px, py, 0.5);
    }
    if (c.state === 'queue' || c.state === 'arrive') {
      drawPatience(g, c.x, c.y - 58, Math.max(0, frac), t);
      // a pill with the dishes they want, readable at a glance
      const dishes = c.ticket.items.filter((i) => i !== 'rice');
      const wdt = dishes.length * 21 + 8;
      rr(g, c.x - wdt / 2, c.y - 52, wdt, 20, 9, 'rgba(24,20,14,0.72)');
      dishes.forEach((id, i) => drawFood(g, id, c.x - wdt / 2 + 14 + i * 21, c.y - 42, 17));
    }
  }
}

function drawPlayer(g, world, t) {
  const p = world.player;
  const carryItems = p.carry && p.carry.type === 'plate' ? p.carry.items : null;
  drawPerson(g, {
    x: p.x, y: p.y, skin: '#c98f62', shirt: '#f2f0ea', hair: '#26221e', hairStyle: 'cap',
    apron: true, walk: p.moving ? p.walkPhase : -1,
    blink: blink(t, 0.7), mouth: 'smile',
    chop: p.chopNear ? (world.time * 2.4) % 1 : -1, tool: 'knife',
    carry: carryItems,
  }, t);
  const carryLabel = p.carry && p.carry.type === 'item'
    ? foodName(p.carry.dish || p.carry.id)
    : carryItems ? (carryItems.length ? carryItems.map(foodName).join(' + ') : 'Empty plate') : null;
  if (p.carry && p.carry.type === 'item') drawFood(g, p.carry.id, p.x, p.y + 15, 30, false);
  if (carryLabel) {
    g.font = FB(11);
    const w = g.measureText(carryLabel).width + 18;
    rr(g, p.x - w / 2, p.y - 60, w, 19, 9, 'rgba(24,20,14,0.78)');
    txt(g, carryLabel, p.x, p.y - 50, FB(11), '#fff3c9');
  }
}

function drawBoard(g, world) {
  const B = LAYOUT.board;
  rr(g, B.x, B.y, B.w, B.h, 8, '#7a5a38', '#5d4225', 2);
  txt(g, 'ORDERS', B.x + 10, B.y + 15, FB(11.5), '#ffdf9e', 'left');
  const queued = world.customers.filter((c) => c.state === 'queue' || c.state === 'arrive')
    .sort((a, b) => a.slot - b.slot);
  if (!queued.length) txt(g, 'Waiting for customers…', B.x + B.w / 2, B.y + B.h / 2 + 8, FR(15), '#e8d9b8');
  queued.forEach((c, i) => {
    const x = B.x + 66 + i * 195, y = B.y + 8, w = 186, h = B.h - 16;
    rr(g, x, y, w, h, 5, '#fbf7e8', '#c9b586', 1.6);
    cir(g, x + w / 2, y + 5, 4, '#b3372c');
    const frac = Math.max(0, c.patienceLeft / c.patienceMax);
    rr(g, x + 8, y + 12, w - 16, 6, 3, '#e3dcc4');
    rr(g, x + 8, y + 12, (w - 16) * frac, 6, 3, frac > 0.5 ? '#58c14c' : frac > 0.25 ? '#f0b63c' : '#e03a24');
    const items = c.ticket.items;
    items.forEach((id, k) => {
      const col = k % 2, row = Math.floor(k / 2);
      const ix = x + 17 + col * 92, iy = y + 32 + row * 21;
      drawFood(g, id, ix - 8, iy, 14);
      txt(g, FOOD[id].name, ix + 1, iy, FR(11), '#3c3c42', 'left');
    });
  });
}

function drawHUD(g, world) {
  const H = LAYOUT.hud;
  rr(g, H.x, H.y, H.w, H.h, 8, '#37474f', '#24333a', 2);
  txt(g, 'DAY ' + world.day, H.x + 14, H.y + 17, FB(16), '#ffe9b0', 'left');
  // time-of-day bar
  const dayFrac = 1 - world.dayTimeLeft / 150;
  rr(g, H.x + 86, H.y + 11, 150, 11, 5.5, '#24333a');
  rr(g, H.x + 86, H.y + 11, 150 * Math.min(1, dayFrac), 11, 5.5, '#f0b63c');
  txt(g, Math.ceil(world.dayTimeLeft) + 's', H.x + 246, H.y + 17, FB(13), '#ffe9b0', 'left');
  // hearts
  for (let i = 0; i < 3; i += 1) {
    txt(g, '♥', H.x + 300 + i * 24, H.y + 17, FB(19), i < world.hearts ? '#ff6b5e' : '#5a6a72');
  }
  // money vs target
  txt(g, MONEY(world.dayMoney) + ' / ' + MONEY(world.cfg.target), H.x + 14, H.y + 42, FB(15.5), '#ffffff', 'left');
  const mf = Math.min(1, world.dayMoney / world.cfg.target);
  rr(g, H.x + 14, H.y + 54, H.w - 28, 9, 4.5, '#24333a');
  rr(g, H.x + 14, H.y + 54, (H.w - 28) * mf, 9, 4.5, world.dayMoney >= world.cfg.target ? '#58c14c' : '#7fd4a8');
  // combo + rice stock line
  const comboTxt = world.combo > 1 ? `COMBO x${world.combo}` : 'Combo —';
  txt(g, comboTxt, H.x + 14, H.y + 76, FB(13.5), world.combo > 1 ? '#ffd94d' : '#8fa5ad', 'left');
  txt(g, `Served ${world.dayServed} · Rice ${world.riceStock}/10${world.riceCooking ? ' (cooking)' : ''}`, H.x + H.w - 14, H.y + 76, FB(12.5), '#cfe3ea', 'right');
}

function drawParticles(g, world) {
  for (const pt of world.particles) {
    const k = pt.t / pt.life;
    if (pt.kind === 'steam') { cir(g, pt.x, pt.y, 4 + k * 7, `rgba(255,255,255,${0.42 * (1 - k)})`); }
    else if (pt.kind === 'smoke') { cir(g, pt.x, pt.y, 4 + k * 6, `rgba(60,56,52,${0.4 * (1 - k)})`); }
    else { cir(g, pt.x, pt.y, 2.6, `rgba(255,214,80,${1 - k})`); }
  }
}

function drawFloaters(g, world) {
  for (const f of world.floaters) {
    const a = f.t > f.life - 0.35 ? (f.life - f.t) / 0.35 : 1;
    g.save(); g.globalAlpha = a;
    g.font = FB(14.5); g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = 3.4; g.strokeStyle = 'rgba(30,22,12,0.8)';
    g.strokeText(f.text, f.x, f.y);
    g.fillStyle = f.color; g.fillText(f.text, f.x, f.y);
    g.restore();
  }
}

function hintText(world) {
  const p = world.player;
  const st = world.nearestStation(76);
  if (!st) return p.carry ? '' : 'Walk to a station, press E';
  const names = { bin: 'ingredient shelf', chop: 'Cutting Board', fry: 'Wok', boil: 'Boiling Pot', pot: 'Lodeh Pot', rice: 'Rice Cooker', sambal: 'Sambal', crackers: 'Cracker Jar', tea: 'Tea Dispenser', plates: 'Plate Stand', slot: 'Plating Slot', trash: 'Bin', serve: 'Serve Counter' };
  if (!p.carry) {
    if (st.kind === 'bin') return `E — Take ${foodName(st.rawId)}`;
    if (st.item) return st.item.state === 'cooking' ? `${foodName(st.item.dish)} is cooking…` : `E — Pick up ${foodName(st.item.id)}`;
    if (st.kind === 'plates') return 'E — Take a plate';
    if (st.kind === 'slot' && st.plate) return 'E — Pick up the plate';
    if (st.kind === 'rice') return world.riceStock < 10 && !world.riceCooking ? 'E — Cook more rice' : 'Rice Cooker';
    return names[st.kind] || '';
  }
  if (p.carry.type === 'item') {
    const hop = hopFor(p.carry);
    if (st.kind === 'trash') return 'E — Throw it away';
    if (hop && st.kind === hop.station && !st.item) return `E — Start: ${foodName(p.carry.dish)}`;
    return `Carrying ${foodName(p.carry.id)} → needs ${hop ? names[hop.station] : 'a plate'}`;
  }
  if (st.kind === 'serve') return 'E — Serve this customer';
  if (st.kind === 'rice') return 'E — Add rice';
  if (st.kind === 'sambal') return 'E — Add sambal';
  if (st.kind === 'crackers') return 'E — Add crackers';
  if (st.kind === 'tea') return 'E — Add sweet tea';
  if (st.item && st.item.state === 'done') return `E — Add ${foodName(st.item.id)} to the plate`;
  if (st.kind === 'slot' && !st.plate) return 'E — Set the plate down';
  if (st.kind === 'trash') return 'E — Bin the plate';
  return 'Plate: ' + (p.carry.items.length ? p.carry.items.map(foodName).join(' + ') : 'empty');
}

function panel(g, w, h) {
  const x = (VIEW.width - w) / 2, y = (VIEW.height - h) / 2;
  rr(g, 0, 0, VIEW.width, VIEW.height, 0, 'rgba(24,18,10,0.62)');
  rr(g, x, y, w, h, 14, '#fbf7e8', '#8a5a34', 4);
  return { x, y, w, h };
}

function drawScreens(g, world) {
  if (world.screen === SCREEN.PLAY) return;
  if (world.screen === SCREEN.TITLE) {
    const p = panel(g, 620, 430);
    txt(g, 'WARTEG RUSH', p.x + p.w / 2, p.y + 58, FB(46), '#b3372c');
    txt(g, "Bu Siti's kitchen is open — feed the lunch rush!", p.x + p.w / 2, p.y + 100, FR(16.5), '#5a4a34');
    const lines = [
      'Cook what each ticket asks: rice + dishes + extras.',
      'Take ingredients from the glass case, chop, fry, boil,',
      'build the plate, and serve before patience runs out.',
      'Finished dishes burn if you leave them — bin them.',
      'Three walk-outs, or missing the day target, ends the run.',
      '',
      'Move: WASD / Arrow keys / Click      Interact: E or Space',
    ];
    lines.forEach((s, i) => txt(g, s, p.x + p.w / 2, p.y + 148 + i * 27, i === 6 ? FB(15) : FR(15.5), '#3c3c42'));
    rr(g, p.x + p.w / 2 - 130, p.y + p.h - 74, 260, 46, 10, '#c22e1c');
    txt(g, 'CLICK OR PRESS ENTER TO OPEN', p.x + p.w / 2, p.y + p.h - 51, FB(15.5), '#ffffff');
    return;
  }
  if (world.screen === SCREEN.DAYEND) {
    const p = panel(g, 520, 330);
    txt(g, `DAY ${world.day} COMPLETE!`, p.x + p.w / 2, p.y + 52, FB(32), '#3f7a34');
    txt(g, `Earned ${MONEY(world.dayMoney)} of ${MONEY(world.cfg.target)} target`, p.x + p.w / 2, p.y + 104, FR(17), '#3c3c42');
    txt(g, `Served ${world.dayServed} customers · ${world.dayAngry} walked out`, p.x + p.w / 2, p.y + 138, FR(16), '#3c3c42');
    txt(g, `Total so far: ${MONEY(world.score)}`, p.x + p.w / 2, p.y + 170, FB(17), '#3c3c42');
    txt(g, world.day === 1 ? 'Tomorrow: Fried Fish and Balado Egg join the menu!' : world.day === 2 ? 'Tomorrow: Tempeh Orek, Lodeh and Kangkung join the menu!' : 'Tomorrow the rush gets heavier. Same menu, fuller house!', p.x + p.w / 2, p.y + 210, FR(14.5), '#8a6a3a');
    rr(g, p.x + p.w / 2 - 120, p.y + p.h - 72, 240, 44, 10, '#c22e1c');
    txt(g, `START DAY ${world.day + 1}`, p.x + p.w / 2, p.y + p.h - 50, FB(16), '#ffffff');
    return;
  }
  // game over
  const p = panel(g, 540, 340);
  txt(g, 'THE DAY IS LOST', p.x + p.w / 2, p.y + 54, FB(34), '#b3372c');
  txt(g, world.overReason === 'target' ? `Takings ${MONEY(world.dayMoney)} missed the ${MONEY(world.cfg.target)} target.` : 'Three customers walked out angry.', p.x + p.w / 2, p.y + 102, FR(16.5), '#3c3c42');
  txt(g, `You reached Day ${world.day} · Total earned ${MONEY(world.score)}`, p.x + p.w / 2, p.y + 148, FR(16.5), '#3c3c42');
  txt(g, `Served ${world.totalServed} customers across the run`, p.x + p.w / 2, p.y + 180, FR(16.5), '#3c3c42');
  txt(g, 'Bu Siti believes in you. Tomorrow is another lunch rush.', p.x + p.w / 2, p.y + 224, FR(14.5), '#8a6a3a');
  rr(g, p.x + p.w / 2 - 120, p.y + p.h - 72, 240, 44, 10, '#c22e1c');
  txt(g, 'TRY AGAIN — ENTER', p.x + p.w / 2, p.y + p.h - 50, FB(16), '#ffffff');
}

export function draw(g, world, t) {
  drawRoom(g, world, t);
  drawStationItems(g, world, t);
  drawCustomers(g, world, t);
  // the cashier, hopping with delight at every sale
  const hop = world.cashierHop > 0 ? Math.sin((0.45 - world.cashierHop) / 0.45 * Math.PI) * 7 : 0;
  drawPerson(g, {
    x: LAYOUT.cashier.x, y: LAYOUT.cashier.y - hop, skin: '#b57a4a', shirt: '#2e6fc2',
    hair: '#37474f', hairStyle: 'hijab', walk: -1, blink: blink(t, 1.9), mouth: 'smile', chop: -1, carry: null,
  }, t);
  drawPlayer(g, world, t);
  drawParticles(g, world);
  drawBoard(g, world);
  drawHUD(g, world);
  drawFloaters(g, world);
  if (world.screen === SCREEN.PLAY) {
    const hint = hintText(world);
    if (hint) {
      g.font = FB(13.5);
      const w = g.measureText(hint).width + 26;
      rr(g, 14, 720 - 36, w, 26, 8, 'rgba(24,20,14,0.78)');
      txt(g, hint, 27, 720 - 23, FB(13.5), '#ffe9b0', 'left');
    }
  }
  drawScreens(g, world);
}
