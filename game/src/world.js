// Warteg Rush — the simulation: stations, cooking processes, customers,
// patience, combo scoring and the day loop. No drawing happens here.
import { LAYOUT, DAY_LENGTH, HEARTS_PER_DAY, QUEUE_SLOTS, COMBO_WINDOW, BURN_GRACE, RICE_MAX, RICE_COOK_TIME, dayConfig } from './config.js';
import { RAW, FOOD, hopFor, makeTicket, ticketPrice, foodName } from './data.js';
import { Rng } from './random.js';
import { sfx } from './audio.js';
import { SKINS, SHIRTS, HAIRS } from './art.js';

export const SCREEN = { TITLE: 'title', PLAY: 'play', DAYEND: 'dayend', OVER: 'over' };

const OBSTACLES = [
  LAYOUT.etalase,
  { x: 336, y: 212, w: 324, h: 118 },
  LAYOUT.plating,
  LAYOUT.stove,
  LAYOUT.tea,
  LAYOUT.counter,
  LAYOUT.cashierDesk,
  { x: LAYOUT.trash.x - 4, y: LAYOUT.trash.y - 4, w: LAYOUT.trash.w + 8, h: LAYOUT.trash.h + 8 },
  ...LAYOUT.tables.map((t) => ({ x: t.x - 40, y: t.y - 40, w: 80, h: 80 })),
];

function station(id, kind, cx, cy, ix, iy, extra = {}) {
  return { id, kind, cx, cy, ix, iy, item: null, plate: null, ...extra };
}

export class World {
  constructor(seed = 1) {
    this.rng = new Rng(seed);
    this.time = 0;
    this.screen = SCREEN.TITLE;
    this.overReason = '';
    this.buildStations();
    this.resetRun();
  }

  buildStations() {
    const L = LAYOUT;
    this.stations = [];
    Object.keys(RAW).forEach((rawId, i) => {
      const row = Math.floor(i / 4), col = i % 4;
      this.stations.push(station('bin-' + rawId, 'bin', L.binX[col] + L.binW / 2, L.binRows[row] + 40, L.binX[col] + L.binW / 2, 502, { rawId }));
    });
    this.stations.push(station('chop', 'chop', L.chop.cx, L.chop.cy, L.chop.ix, L.chop.iy));
    L.fryers.forEach((f, i) => this.stations.push(station('fry' + i, 'fry', f.cx, f.cy - 4, f.ix, f.iy)));
    this.stations.push(station('boil', 'boil', L.boil.cx, L.boil.cy, L.boil.ix, L.boil.iy));
    this.stations.push(station('pot', 'pot', L.bigpot.cx, L.bigpot.cy, L.bigpot.ix, L.bigpot.iy));
    this.stations.push(station('rice', 'rice', L.rice.cx, L.rice.cy, L.rice.ix, L.rice.iy));
    this.stations.push(station('sambal', 'sambal', L.cobek.cx, L.cobek.cy, L.cobek.ix, L.cobek.iy));
    this.stations.push(station('crackers', 'crackers', L.jar.cx, L.jar.cy, L.jar.ix, L.jar.iy));
    this.stations.push(station('tea', 'tea', L.tea.cx, L.tea.cy, L.tea.ix, L.tea.iy));
    this.stations.push(station('plates', 'plates', L.plateStand.cx, L.plateStand.cy, L.plateStand.ix, L.plateStand.iy));
    L.plateSlots.forEach((s, i) => this.stations.push(station('slot' + i, 'slot', s.cx, s.cy, s.ix, s.iy)));
    this.stations.push(station('trash', 'trash', L.trash.x + 22, L.trash.y + 20, L.trash.ix, L.trash.iy));
    L.queueX.forEach((x, i) => this.stations.push(station('serve' + i, 'serve', x, L.queueY - 60, x, L.serveY, { slot: i })));
  }

  resetRun() {
    this.day = 1;
    this.score = 0;
    this.totalServed = 0;
    this.totalAngry = 0;
    this.player = { x: LAYOUT.playerStart.x, y: LAYOUT.playerStart.y, face: 1, walkPhase: 0, carry: null, target: null, chopNear: false };
    this.startDay();
    this.screen = SCREEN.TITLE;
  }

  startDay() {
    const cfg = dayConfig(this.day);
    this.cfg = cfg;
    this.dayMoney = 0;
    this.hearts = HEARTS_PER_DAY;
    this.dayTimeLeft = DAY_LENGTH;
    this.dayServed = 0;
    this.dayAngry = 0;
    this.combo = 0;
    this.comboT = 0;
    this.customers = [];
    this.floaters = [];
    this.particles = [];
    this.spawnT = 0.8;
    this.riceStock = RICE_MAX;
    this.riceCooking = 0;
    this.cashierHop = 0;
    for (const st of this.stations) { st.item = null; st.plate = null; }
    this.player.carry = null;
    this.player.x = LAYOUT.playerStart.x; this.player.y = LAYOUT.playerStart.y;
    this.seats = [];
    for (const t of LAYOUT.tables) {
      this.seats.push({ x: t.x - 58, y: t.y + 48, tx: t.x, ty: t.y, by: null });
      this.seats.push({ x: t.x + 58, y: t.y + 48, tx: t.x, ty: t.y, by: null });
    }
  }

  startGame() { this.day = 1; this.score = 0; this.totalServed = 0; this.totalAngry = 0; this.startDay(); this.screen = SCREEN.PLAY; }
  nextDay() { this.day += 1; this.startDay(); this.screen = SCREEN.PLAY; }
  gameOver(reason) { this.overReason = reason; this.screen = SCREEN.OVER; }

  // ------------------------------------------------------------ helpers --
  floater(x, y, text, color = '#fff3c9') {
    this.floaters.push({ x, y, text, color, t: 0, life: 1.25 });
  }

  pickDishFor(rawId) {
    const candidates = Object.keys(FOOD).filter((id) => FOOD[id].from === rawId && this.cfg.unlock.includes(id));
    if (!candidates.length) return null;
    // Prefer a dish somebody is actually waiting for.
    for (const c of this.customers) {
      if (c.state !== 'queue') continue;
      for (const want of c.ticket.items) if (candidates.includes(want)) return want;
    }
    return candidates[0];
  }

  nearestStation(maxDist = 76) {
    let best = null, bestD = maxDist;
    for (const st of this.stations) {
      const d = Math.hypot(st.ix - this.player.x, st.iy - this.player.y);
      if (d < bestD) { bestD = d; best = st; }
    }
    return best;
  }

  // ---------------------------------------------------------- interact --
  tryInteract() {
    if (this.screen !== SCREEN.PLAY) return;
    const st = this.nearestStation();
    const p = this.player;
    if (!st) return;
    const fail = (msg) => { sfx.error(); this.floater(p.x, p.y - 46, msg, '#ffb3a0'); };

    if (!p.carry) {
      if (st.kind === 'bin') {
        const dish = this.pickDishFor(st.rawId);
        if (!dish) { fail('Not on today\'s menu'); return; }
        p.carry = { type: 'item', id: st.rawId, dish };
        sfx.pickup();
        return;
      }
      if (st.item && st.item.state !== 'cooking') { p.carry = { type: 'item', id: st.item.id, dish: st.item.dish }; st.item = null; sfx.pickup(); return; }
      if (st.kind === 'plates') { p.carry = { type: 'plate', items: [] }; sfx.pickup(); return; }
      if (st.kind === 'slot' && st.plate) { p.carry = { type: 'plate', items: st.plate }; st.plate = null; sfx.pickup(); return; }
      if (st.kind === 'rice' && !this.riceCooking && this.riceStock < RICE_MAX) {
        this.riceCooking = RICE_COOK_TIME; sfx.place();
        this.floater(st.cx, st.cy - 44, 'Rice cooking…', '#dff2d8');
        return;
      }
      if (st.item && st.item.state === 'cooking') this.floater(st.cx, st.cy - 40, 'Still cooking…', '#ffe9b0');
      return;
    }

    if (p.carry.type === 'item') {
      const it = p.carry;
      if (st.kind === 'trash') { p.carry = null; sfx.place(); this.floater(st.cx, st.cy - 30, 'Binned', '#d8d2c2'); return; }
      const hop = hopFor(it);
      if (!hop) { fail('Already plated-ready'); return; }
      const wantKind = hop.station;
      const match = st.kind === wantKind && !st.item;
      if (match) {
        st.item = { id: it.id, dish: it.dish, t: 0, total: hop.seconds, state: 'cooking', doneT: 0 };
        p.carry = null; sfx.place();
        return;
      }
      if (st.kind === wantKind && st.item) { fail('Station busy'); return; }
      const names = { fry: 'the wok', boil: 'the boiling pot', pot: 'the lodeh pot', chop: 'the cutting board' };
      fail('Needs ' + (names[wantKind] || wantKind));
      return;
    }

    // carrying a plate
    const plate = p.carry.items;
    const addFood = (id) => { if (!plate.includes(id)) { plate.push(id); sfx.pop(); } else fail('Already on the plate'); };
    if (st.kind === 'rice') { if (!plate.includes('rice')) { if (this.riceStock > 0) { this.riceStock -= 1; addFood('rice'); } else fail('Rice is out — recook!'); } else fail('Already on the plate'); return; }
    if (st.kind === 'sambal') { addFood('sambal'); return; }
    if (st.kind === 'crackers') { addFood('crackers'); return; }
    if (st.kind === 'tea') { addFood('tea'); sfx.pour(); return; }
    if (st.kind === 'slot' && !st.plate) { st.plate = plate; p.carry = null; sfx.place(); return; }
    if (st.kind === 'trash') { p.carry = null; sfx.place(); this.floater(st.cx, st.cy - 30, 'Plate binned', '#d8d2c2'); return; }
    if (st.item && st.item.state === 'done') { plate.push(st.item.id); st.item = null; sfx.pop(); return; }
    if (st.item && st.item.state === 'burnt') { fail('That one is burnt — bin it'); return; }
    if (st.kind === 'serve') {
      const cust = this.customers.find((c) => c.slot === st.slot && c.state === 'queue');
      if (!cust) { fail('Nobody waiting there'); return; }
      const missing = cust.ticket.items.filter((id) => !plate.includes(id));
      if (missing.length) { fail('Missing: ' + foodName(missing[0])); return; }
      this.serveCustomer(cust, plate);
      p.carry = null;
      return;
    }
    if (st.item && st.item.state === 'cooking') this.floater(st.cx, st.cy - 40, 'Still cooking…', '#ffe9b0');
  }

  serveCustomer(cust, plate) {
    const base = ticketPrice(cust.ticket.items);
    const frac = Math.max(0, cust.patienceLeft / cust.patienceMax);
    this.combo = this.comboT > 0 ? this.combo + 1 : 1;
    this.comboT = COMBO_WINDOW;
    const mult = 1 + Math.min(4, this.combo - 1) * 0.25;
    const tip = Math.round((base * 0.4 * frac * mult) / 100) * 100;
    const pay = base + tip;
    this.dayMoney += pay; this.score += pay;
    this.dayServed += 1; this.totalServed += 1;
    this.cashierHop = 0.45;
    sfx.coin();
    this.floater(cust.x, cust.y - 78, '+Rp ' + pay.toLocaleString('en-US') + (this.combo > 1 ? '  COMBO x' + this.combo : ''), '#ffe066');
    for (let i = 0; i < 8; i += 1) this.particles.push({ x: cust.x, y: cust.y - 30, vx: this.rng.float(-40, 40), vy: this.rng.float(-70, -20), t: 0, life: 0.55, kind: 'spark' });
    const seat = this.seats.find((s) => !s.by);
    if (seat) { seat.by = cust; cust.seat = seat; cust.state = 'toSeat'; cust.plateItems = [...plate]; }
    else { cust.state = 'leaving'; }
    cust.slot = -1;
  }

  // -------------------------------------------------------------- step --
  step(dt, control) {
    this.time += dt;
    // floaters and particles always drift, even on menu screens
    for (const f of this.floaters) { f.t += dt; f.y -= 30 * dt; }
    this.floaters = this.floaters.filter((f) => f.t < f.life);
    for (const pt of this.particles) { pt.t += dt; pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy -= 26 * dt; }
    this.particles = this.particles.filter((pt) => pt.t < pt.life);
    if (this.screen !== SCREEN.PLAY) return;

    this.dayTimeLeft -= dt;
    if (this.dayTimeLeft <= 0) {
      this.dayTimeLeft = 0;
      if (this.dayMoney >= this.cfg.target) this.screen = SCREEN.DAYEND;
      else this.gameOver('target');
      return;
    }
    if (this.comboT > 0) { this.comboT -= dt; if (this.comboT <= 0) this.combo = 0; }
    if (this.cashierHop > 0) this.cashierHop -= dt;

    this.movePlayer(dt, control);
    this.updateStations(dt);
    this.updateCustomers(dt);

    // rice cooker
    if (this.riceCooking > 0) {
      this.riceCooking -= dt;
      if (this.riceCooking <= 0) { this.riceCooking = 0; this.riceStock = RICE_MAX; sfx.done(); }
    }
    // spawning
    this.spawnT -= dt;
    const queued = this.customers.filter((c) => c.state === 'queue' || c.state === 'arrive').length;
    if (this.spawnT <= 0 && queued < QUEUE_SLOTS) {
      this.spawnCustomer();
      this.spawnT = this.cfg.spawnEvery * this.rng.float(0.75, 1.25);
    }
  }

  movePlayer(dt, control) {
    const p = this.player;
    let vx = 0, vy = 0;
    if (control.moveX || control.moveY) {
      vx = control.moveX; vy = control.moveY;
      p.target = null;
    } else if (p.target) {
      const dx = p.target.x - p.x, dy = p.target.y - p.y;
      const d = Math.hypot(dx, dy);
      if (d < 6) {
        const stId = p.target.stationId;
        p.target = null;
        if (stId) { const st = this.stations.find((s) => s.id === stId); if (st) { p.x = st.ix; p.y = st.iy; } this.tryInteract(); }
      } else { vx = dx / d; vy = dy / d; }
    }
    const len = Math.hypot(vx, vy);
    p.moving = len > 0;
    if (len > 0) {
      vx /= len; vy /= len;
      const sp = 268;
      let nx = p.x + vx * sp * dt;
      let ny = p.y;
      if (!this.hits(nx, ny)) p.x = nx;
      ny = p.y + vy * sp * dt;
      if (!this.hits(p.x, ny)) p.y = ny;
      p.walkPhase += dt * 11;
      if (Math.abs(vx) > 0.1) p.face = vx > 0 ? 1 : -1;
    }
    p.x = Math.max(26, Math.min(1254, p.x));
    p.y = Math.max(208, Math.min(700, p.y));
    // is the cook standing at a chopping board that is working?
    const chop = this.stations.find((s) => s.id === 'chop');
    p.chopNear = !!(chop && chop.item && chop.item.state === 'cooking' && Math.hypot(chop.ix - p.x, chop.iy - p.y) < 84);
    if (p.chopNear) {
      this._chopSfxT = (this._chopSfxT || 0) - dt;
      if (this._chopSfxT <= 0) { sfx.chop(); this._chopSfxT = 0.27; }
    }
  }

  hits(x, y) {
    const r = 15;
    for (const o of OBSTACLES) {
      if (x + r > o.x && x - r < o.x + o.w && y + r > o.y && y - r < o.y + o.h) return true;
    }
    return false;
  }

  updateStations(dt) {
    for (const st of this.stations) {
      const it = st.item;
      if (!it) continue;
      if (it.state === 'cooking') {
        it.t += dt;
        // steam while it cooks
        if (this.rng.chance(0.25)) this.particles.push({ x: st.cx + this.rng.float(-9, 9), y: st.cy - 16, vx: this.rng.float(-4, 4), vy: this.rng.float(-34, -22), t: 0, life: 0.8, kind: 'steam' });
        if (it.t >= it.total) {
          it.state = 'done'; it.doneT = 0;
          it.id = hopFor(it).becomes;
          sfx.done();
          this.floater(st.cx, st.cy - 42, foodName(it.id) + ' ready!', '#c9f2c0');
        }
      } else if (it.state === 'done') {
        it.doneT += dt;
        if (st.kind !== 'chop' && it.doneT > BURN_GRACE) {
          it.state = 'burnt';
          sfx.error();
          this.floater(st.cx, st.cy - 42, 'Burnt!', '#ff9a80');
        }
      } else if (it.state === 'burnt' && this.rng.chance(0.3)) {
        this.particles.push({ x: st.cx + this.rng.float(-8, 8), y: st.cy - 14, vx: 3, vy: this.rng.float(-30, -18), t: 0, life: 0.9, kind: 'smoke' });
      }
    }
  }

  spawnCustomer() {
    const used = new Set(this.customers.filter((c) => c.slot >= 0).map((c) => c.slot));
    let slot = 0;
    while (used.has(slot)) slot += 1;
    if (slot >= QUEUE_SLOTS) return;
    const ticket = makeTicket(this.rng, this.cfg.unlock, this.day);
    const style = this.rng.int(0, 3);
    const cust = {
      x: LAYOUT.door.x, y: LAYOUT.door.y, slot,
      ticket, patienceMax: ticket.patience, patienceLeft: ticket.patience,
      state: 'arrive', seat: null, eatT: 0, plateItems: null,
      skin: this.rng.pick(SKINS), shirt: this.rng.pick(SHIRTS), hair: this.rng.pick(HAIRS),
      hairStyle: style === 0 ? 'hijab' : style === 1 ? 'bun' : 'short',
      blinkOff: this.rng.float(0, 3), walkPhase: this.rng.float(0, 6),
    };
    if (cust.hairStyle === 'hijab') cust.hair = this.rng.pick(['#7a4a86', '#2e6fc2', '#8a5a34', '#3f3f46']);
    this.customers.push(cust);
  }

  updateCustomers(dt) {
    const speed = 120;
    for (const c of this.customers) {
      let moving = false;
      const goTo = (tx, ty) => {
        const dx = tx - c.x, dy = ty - c.y, d = Math.hypot(dx, dy);
        if (d < 4) return true;
        c.x += (dx / d) * speed * dt; c.y += (dy / d) * speed * dt;
        c.walkPhase += dt * 9; moving = true;
        return false;
      };
      if (c.state === 'arrive') {
        if (goTo(LAYOUT.queueX[c.slot], LAYOUT.queueY)) c.state = 'queue';
      } else if (c.state === 'queue') {
        c.patienceLeft -= dt;
        // shuffle toward the slot point if the queue moved
        goTo(LAYOUT.queueX[c.slot], LAYOUT.queueY);
        if (c.patienceLeft <= 0) {
          c.state = 'leaving'; c.angry = true; c.slot = -1;
          this.hearts -= 1; this.dayAngry += 1; this.totalAngry += 1;
          this.combo = 0; this.comboT = 0;
          sfx.angry();
          this.floater(c.x, c.y - 78, 'LEFT ANGRY!', '#ff9a80');
          if (this.hearts <= 0) { this.gameOver('patience'); return; }
        }
      } else if (c.state === 'toSeat') {
        if (goTo(c.seat.x, c.seat.y)) { c.state = 'eating'; c.eatT = this.rng.float(6.5, 9); }
      } else if (c.state === 'eating') {
        c.eatT -= dt;
        if (c.eatT <= 0) { if (c.seat) c.seat.by = null; c.state = 'leaving'; }
      } else if (c.state === 'leaving') {
        if (goTo(LAYOUT.door.x, LAYOUT.door.y)) c.state = 'gone';
      }
      c.moving = moving;
    }
    this.customers = this.customers.filter((c) => c.state !== 'gone');
  }

  stateText() {
    const lines = [
      `screen=${this.screen} day=${this.day} time=${this.time.toFixed(1)} dayLeft=${Math.ceil(this.dayTimeLeft)}`,
      `money=${this.dayMoney}/${this.cfg.target} score=${this.score} hearts=${this.hearts} combo=${this.combo}`,
      `rice=${this.riceStock}${this.riceCooking ? ' cooking' : ''} carry=${JSON.stringify(this.player.carry)}`,
      `customers=${this.customers.map((c) => `${c.state}@${Math.round(c.patienceLeft)}s`).join(' ')}`,
      `stations=${this.stations.filter((s) => s.item).map((s) => `${s.id}:${s.item.id}(${s.item.state})`).join(' ')}`,
    ];
    return lines.join('\n');
  }
}
