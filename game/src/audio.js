// Warteg Rush — tiny generated sound effects (WebAudio, no audio files).
// Everything is best-effort: if audio is unavailable the game stays silent.
let ctx = null;

function ac() {
  if (ctx) return ctx;
  try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { ctx = null; }
  return ctx;
}

function blip(freqA, freqB, seconds, type = 'square', gain = 0.05, when = 0) {
  const a = ac(); if (!a) return;
  const t0 = a.currentTime + when;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqA, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqB), t0 + seconds);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
  osc.connect(g).connect(a.destination);
  osc.start(t0); osc.stop(t0 + seconds + 0.02);
}

export const sfx = {
  unlock() { ac(); },
  pickup() { blip(500, 700, 0.07, 'triangle', 0.06); },
  place() { blip(300, 220, 0.07, 'triangle', 0.06); },
  chop() { blip(180, 90, 0.05, 'square', 0.04); },
  done() { blip(880, 880, 0.09, 'sine', 0.07); blip(1318, 1318, 0.12, 'sine', 0.07, 0.09); },
  coin() { blip(988, 988, 0.07, 'square', 0.05); blip(1319, 1568, 0.14, 'square', 0.05, 0.07); },
  error() { blip(220, 140, 0.16, 'sawtooth', 0.05); },
  angry() { blip(392, 392, 0.1, 'square', 0.05); blip(311, 262, 0.18, 'square', 0.05, 0.1); },
  pour() { blip(700, 500, 0.12, 'sine', 0.03); },
  pop() { blip(600, 900, 0.05, 'sine', 0.05); },
};
