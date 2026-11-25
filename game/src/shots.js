// Warteg Rush — staged screenshot scenes behind ?shot=cover|action|serve|end.
// Each scene builds a real world state with the game's own rules and data,
// then lets it run half a second so steam, breathing and blink settle into
// a living frame. The same seed always stages the same scene.
import { LAYOUT, RICE_MAX } from './config.js';
import { SCREEN } from './world.js';

function cust(world, slot, items, frac, extra = {}) {
  const patience = 40 + items.length * 9;
  const c = {
    x: LAYOUT.queueX[slot], y: LAYOUT.queueY, slot,
    ticket: { items, patience }, patienceMax: patience, patienceLeft: patience * frac,
    state: 'queue', seat: null, eatT: 0, plateItems: null, angry: false, moving: false,
    skin: '#c98f62', shirt: '#2e6fc2', hair: '#26221e', hairStyle: 'short',
    blinkOff: slot * 0.9, walkPhase: 0, ...extra,
  };
  world.customers.push(c);
  return c;
}

function eater(world, seatIdx, plateItems, style = {}) {
  const seat = world.seats[seatIdx];
  const c = cust(world, 0, ['rice'], 1, { ...style });
  c.slot = -1; c.state = 'eating'; c.seat = seat; c.eatT = 6;
  c.x = seat.x; c.y = seat.y; c.plateItems = plateItems;
  seat.by = c;
  return c;
}

function cook(world, stationId, id, dish, t, total, state = 'cooking') {
  const st = world.stations.find((s) => s.id === stationId);
  st.item = { id, dish, t, total, state, doneT: state === 'done' ? 0.6 : 0 };
}

function settle(world, seconds = 0.5) {
  const idle = { moveX: 0, moveY: 0 };
  for (let i = 0; i < seconds * 60; i += 1) world.step(1 / 60, idle);
}

export function stageShot(world, name) {
  if (name === 'action') {
    world.day = 1; world.startDay(); world.screen = SCREEN.PLAY;
    world.dayTimeLeft = 128; world.dayMoney = 34000; world.score = 34000; world.riceStock = 8; world.dayServed = 3;
    cook(world, 'fry0', 'chicken', 'fried_chicken', 5.6, 8);
    cook(world, 'chop', 'tempeh', 'tempeh_orek', 1.1, 2.5);
    world.stations.find((s) => s.id === 'slot1').plate = ['rice', 'fried_tofu'];
    world.player.x = LAYOUT.chop.ix; world.player.y = LAYOUT.chop.iy;
    cust(world, 0, ['rice', 'fried_chicken', 'sambal'], 0.8, { shirt: '#c2505c' });
    cust(world, 1, ['rice', 'omelette', 'tea'], 0.55, { hairStyle: 'hijab', hair: '#7a4a86', skin: '#b57a4a' });
    cust(world, 2, ['rice', 'fried_tempeh', 'crackers'], 0.66, { shirt: '#3f9e4d', hairStyle: 'bun', skin: '#a06638' });
    settle(world);
    return;
  }
  if (name === 'serve') {
    world.day = 2; world.startDay(); world.screen = SCREEN.PLAY;
    world.dayTimeLeft = 74; world.dayMoney = 132500; world.score = 256000; world.dayServed = 14;
    world.combo = 4; world.comboT = 9; world.riceStock = 5; world.cashierHop = 0.3;
    cook(world, 'fry1', 'balado_egg', 'balado_egg', 5, 5, 'done');
    const c = cust(world, 1, ['rice', 'fried_fish', 'sambal', 'tea'], 0.8, { shirt: '#e8a13a' });
    cust(world, 3, ['rice', 'fried_chicken', 'fried_tempeh'], 0.5, { hairStyle: 'hijab', hair: '#2e6fc2', skin: '#d9a06b' });
    eater(world, 2, ['rice', 'omelette', 'sambal'], { shirt: '#7a4a86', hairStyle: 'bun' });
    world.player.x = LAYOUT.queueX[1]; world.player.y = LAYOUT.serveY;
    world.player.carry = { type: 'plate', items: ['rice', 'fried_fish', 'sambal', 'tea'] };
    settle(world, 0.3);
    world.floaters.push({ x: c.x, y: c.y - 78, text: '+Rp 24,900  COMBO x4', color: '#ffe066', t: 0, life: 1.25 });
    return;
  }
  if (name === 'end') {
    world.day = 2; world.startDay(); world.screen = SCREEN.DAYEND;
    world.dayMoney = 196500; world.dayServed = 21; world.dayAngry = 1; world.score = 318500;
    world.dayTimeLeft = 0; world.riceStock = RICE_MAX;
    cook(world, 'pot', 'lodeh', 'lodeh', 10, 10, 'done');
    eater(world, 1, ['rice', 'lodeh', 'tea'], { shirt: '#4a7d8a' });
    world.player.x = 700; world.player.y = 436;
    settle(world, 0.3);
    return;
  }
  // cover: day 2, mid lunch rush, everything happening at once
  world.day = 2; world.startDay(); world.screen = SCREEN.PLAY;
  world.dayTimeLeft = 96; world.dayMoney = 86500; world.score = 204000;
  world.combo = 3; world.comboT = 8; world.riceStock = 6; world.dayServed = 9;
  cook(world, 'fry0', 'chicken', 'fried_chicken', 4.8, 8);
  cook(world, 'fry1', 'omelette', 'omelette', 5, 5, 'done');
  cook(world, 'pot', 'lodehveg', 'lodeh', 4, 10);
  cook(world, 'chop', 'chopped_kangkung', 'stir_kangkung', 2.5, 2.5, 'done');
  world.stations.find((s) => s.id === 'slot0').plate = ['rice'];
  world.player.x = 520; world.player.y = 512;
  world.player.carry = { type: 'plate', items: ['rice', 'fried_chicken'] };
  cust(world, 0, ['rice', 'fried_chicken', 'sambal'], 0.85, { shirt: '#c2505c' });
  cust(world, 1, ['rice', 'balado_egg', 'tea'], 0.6, { hairStyle: 'hijab', hair: '#7a4a86', skin: '#b57a4a' });
  cust(world, 2, ['rice', 'fried_tofu', 'fried_tempeh', 'crackers'], 0.38, { shirt: '#3f9e4d', skin: '#a06638' });
  cust(world, 3, ['rice', 'omelette'], 0.72, { hairStyle: 'bun', shirt: '#e8a13a', skin: '#d9a06b' });
  eater(world, 0, ['rice', 'fried_chicken'], { shirt: '#2e6fc2' });
  settle(world);
}
