// Warteg Rush — keyboard and mouse control. Keyboard: WASD / arrows to
// move, E or Space to interact. Mouse: click a station to walk there and
// use it, click the floor to walk there, click to advance menu screens.
export class Input {
  constructor(canvas, world, onAdvance) {
    this.world = world;
    this.keys = new Set();
    this.control = { moveX: 0, moveY: 0 };
    canvas.tabIndex = 0;
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
      if (e.repeat) return;
      this.keys.add(e.code);
      if (e.code === 'KeyE' || e.code === 'Space') { world.tryInteract(); sfxUnlock(); }
      if (e.code === 'Enter') onAdvance();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    canvas.addEventListener('pointerdown', (e) => {
      sfxUnlock();
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      if (world.screen !== 'play') { onAdvance(); return; }
      let best = null, bestD = 84;
      for (const st of world.stations) {
        const d = Math.hypot(st.cx - x, st.cy - y);
        const d2 = Math.hypot(st.ix - x, st.iy - y);
        const dd = Math.min(d, d2);
        if (dd < bestD) { bestD = dd; best = st; }
      }
      if (best) world.player.target = { x: best.ix, y: best.iy, stationId: best.id };
      else world.player.target = { x, y, stationId: null };
    });
    canvas.focus();
  }

  poll() {
    const k = this.keys;
    this.control.moveX = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
    this.control.moveY = (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0) - (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0);
    return this.control;
  }
}

import { sfx } from './audio.js';
function sfxUnlock() { sfx.unlock(); }
