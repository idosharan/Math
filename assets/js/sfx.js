let ctx = null;
let enabled = true;

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, at, dur, { type = 'square', vol = 0.06, slide = 0 } = {}) {
  const c = ac(); if (!c) return;
  const t = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t); o.stop(t + dur + 0.02);
}

const play = fn => (...a) => { if (enabled) fn(...a); };

export const sfx = {
  setEnabled(v) { enabled = v; },
  click: play(() => tone(660, 0, 0.05, { vol: 0.03 })),
  correct: play(() => { tone(784, 0, 0.09); tone(1047, 0.08, 0.09); tone(1319, 0.16, 0.16); }),
  wrong: play(() => { tone(220, 0, 0.18, { type: 'sawtooth', vol: 0.05, slide: 0.6 }); tone(160, 0.16, 0.22, { type: 'sawtooth', vol: 0.05, slide: 0.6 }); }),
  combo: play(n => { const base = 523 + Math.min(n, 10) * 40; tone(base, 0, 0.06); tone(base * 1.5, 0.06, 0.1); }),
  hint: play(() => { tone(988, 0, 0.07, { type: 'triangle', vol: 0.08 }); tone(1319, 0.07, 0.12, { type: 'triangle', vol: 0.08 }); }),
  win: play(() => { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.14)); }),
  lose: play(() => { [392, 349, 311, 262].forEach((f, i) => tone(f, i * 0.16, 0.2, { type: 'triangle', vol: 0.08 })); }),
  plaque: play(() => { [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, i * 0.08, 0.25, { type: 'triangle', vol: 0.07 })); }),
  hit: play(() => tone(140, 0, 0.12, { type: 'sawtooth', vol: 0.06, slide: 0.5 })),
};

// Tiny chiptune loop: bass + lead, scheduled ahead of time.
const LEAD = [69, 72, 76, 72, 74, 72, 69, 67, 69, 72, 76, 79, 76, 74, 72, 0];
const BASS = [45, 45, 52, 52, 41, 41, 48, 48];
let timer = null, step = 0, nextAt = 0;
const midi = n => 440 * Math.pow(2, (n - 69) / 12);

export const music = {
  get playing() { return !!timer; },
  start() {
    const c = ac(); if (!c || timer) return;
    step = 0; nextAt = c.currentTime + 0.05;
    timer = setInterval(() => {
      while (nextAt < c.currentTime + 0.25) {
        const at = nextAt - c.currentTime;
        const n = LEAD[step % LEAD.length];
        if (n) tone(midi(n), at, 0.16, { vol: 0.018 });
        if (step % 2 === 0) tone(midi(BASS[(step / 2) % BASS.length]), at, 0.3, { type: 'triangle', vol: 0.035 });
        step++; nextAt += 0.2;
      }
    }, 80);
  },
  stop() { clearInterval(timer); timer = null; },
};

function hebrewVoice() {
  if (!('speechSynthesis' in window)) return null;
  return speechSynthesis.getVoices().find(v => /^he|^iw/i.test(v.lang)) || null;
}

if ('speechSynthesis' in window) speechSynthesis.getVoices();

export function canSpeak() { return 'speechSynthesis' in window; }

const MATH_WORDS = [
  [/×/g, ' כפול '], [/:/g, ' לחלק ל '], [/\+/g, ' ועוד '], [/[−-]/g, ' פחות '],
  [/=/g, ' שווה '], [/</g, ' קטן מ '], [/>/g, ' גדול מ '], [/_{2,}|\?/g, ' כמה '],
];
const noCommas = s => s.replace(/(\d),(\d{3})/g, '$1$2');

export function speak(text, expr = '') {
  if (!canSpeak()) return false;
  let e = noCommas(expr);
  for (const [re, rep] of MATH_WORDS) e = e.replace(re, rep);
  const s = `${noCommas(text)} ${e}`.trim();
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(s);
  u.lang = 'he-IL';
  const v = hebrewVoice();
  if (v) u.voice = v;
  u.rate = 0.92;
  speechSynthesis.speak(u);
  return !!v || speechSynthesis.getVoices().length === 0;
}

export function stopSpeaking() { if (canSpeak()) speechSynthesis.cancel(); }
