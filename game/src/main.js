// Warteg Rush — boot, the fixed-step loop, screen flow, and the hooks the
// screenshot tooling uses (window.WARTEG).
import { VIEW, STEP } from './config.js';
import { World, SCREEN } from './world.js';
import { Input } from './input.js';
import { draw } from './render.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const g = canvas.getContext('2d');
const status = document.getElementById('status');
const params = new URLSearchParams(location.search);
const seed = Number(params.get('seed') || 20261125);
const shot = params.get('shot');

const world = new World(seed);
let frozen = false;
if (shot) { stageShot(world, shot); frozen = true; }

function advance() {
  if (world.screen === SCREEN.TITLE) world.startGame();
  else if (world.screen === SCREEN.DAYEND) world.nextDay();
  else if (world.screen === SCREEN.OVER) world.startGame();
}
const input = new Input(canvas, world, advance);

function fit() {
  const scale = Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height);
  canvas.style.width = Math.floor(VIEW.width * scale) + 'px';
  canvas.style.height = Math.floor(VIEW.height * scale) + 'px';
}
window.addEventListener('resize', fit);
fit();

let last = performance.now();
let acc = 0;
let statusT = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (!frozen) {
    acc += dt;
    const control = input.poll();
    while (acc >= STEP) { world.step(STEP, control); acc -= STEP; }
  }
  draw(g, world, now / 1000);
  statusT += dt;
  if (statusT > 0.5) { statusT = 0; status.textContent = world.stateText().replaceAll('\n', ' · '); }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Tooling hooks: deterministic time travel and a text snapshot of the state.
window.WARTEG = {
  world,
  advanceTime(ms) {
    const idle = { moveX: 0, moveY: 0 };
    const steps = Math.round(ms / (STEP * 1000));
    for (let i = 0; i < steps; i += 1) world.step(STEP, idle);
  },
  stateText() { return world.stateText(); },
};
