import { WORLDS, EPISODES, TOPICS, buildLevel, buildBoss, buildExam, fmt } from './questions.js';
import * as store from './store.js';
import { sfx, music, speak, stopSpeaking, canSpeak } from './sfx.js';

const IMG = 'assets/img/';
const ICONS = `${IMG}icons.svg`;
const MAPPING_START = new Date(2026, 9, 18);
const MAPPING_END = new Date(2026, 9, 23, 23, 59);
const TIER = { 1: 1, 2: 2, 3: 3, boss: 6 };
const SUBS_PER_STAR = 500;
const PERFECT_BONUS = 1000;
const HINT_COST = 50;
const BOSS_HP = 10;
const PRAISE = ['מעולה!', 'אלוף!', 'GG!', 'בול!', 'מקצוען!', 'יש!', 'פצצה!', 'וואו!'];
const FRAME_NAMES = { none: 'ללא מסגרת', silver: 'מסגרת כסף', gold: 'מסגרת זהב', diamond: 'מסגרת יהלום' };

let state = store.load();
let run = null;
let parentOk = false;
let deferredInstall = null;
let examTimer = null;
let autoNext = null;

const app = document.getElementById('app');
const live = document.getElementById('live');

// ---------- DOM helpers ----------
function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(Infinity)) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : String(kid));
  return el;
}

const SVGNS = 'http://www.w3.org/2000/svg';
function s(tag, attrs, ...kids) {
  const el = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs || {})) if (v != null) el.setAttribute(k, v);
  for (const kid of kids.flat(Infinity)) if (kid != null) el.append(kid.nodeType ? kid : String(kid));
  return el;
}

function icon(name, cls = '') {
  return s('svg', { class: `ico ${cls}`.trim(), 'aria-hidden': 'true', focusable: 'false' }, s('use', { href: `${ICONS}#${name}` }));
}

function announce(msg) {
  live.textContent = '';
  requestAnimationFrame(() => { live.textContent = msg; });
}

const persist = () => store.save(state);
const calm = () => state.settings.calm || matchMedia('(prefers-reduced-motion: reduce)').matches;

function screen(...kids) {
  clearInterval(examTimer);
  clearTimeout(autoNext);
  document.querySelector('.sheet')?.remove();
  app.replaceChildren(...kids.flat(Infinity).filter(Boolean));
  const title = app.querySelector('h1');
  if (title) { title.setAttribute('tabindex', '-1'); title.focus({ preventScroll: true }); }
}

function go(hash) {
  if (location.hash === hash) route(); else location.hash = hash;
}

// ---------- settings ----------
function applySettings() {
  const root = document.documentElement;
  root.classList.toggle('hc', state.settings.contrast);
  root.classList.toggle('calm', state.settings.calm);
  sfx.setEnabled(state.settings.sfx);
  if (!state.settings.music) music.stop();
}

document.addEventListener('pointerdown', () => {
  if (state.settings.music && !music.playing) music.start();
}, { passive: true });

// ---------- shared UI ----------
function topBar(back) {
  return h('header', { class: 'topbar' },
    back
      ? h('a', { class: 'icon-btn', href: back, 'aria-label': 'חזרה' }, icon('chev-right'))
      : h('a', { class: 'brand', href: '#/', 'aria-label': 'Noam TV, דף הבית' }, h('img', { src: 'assets/icons/icon.svg', alt: '', width: 36, height: 36 }), h('span', { class: 'brand-name', dir: 'ltr' }, 'Noam', h('b', null, 'TV'))),
    h('div', { class: 'topbar-actions' },
      h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'הגדרות', onclick: openSettings }, icon('sliders')),
      h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'אזור הורים', onclick: openParentGate }, icon('shield')),
    ),
  );
}

function avatar(size = 'md') {
  return h('div', { class: `avatar avatar-${size} frame-${state.frame}` }, h('img', { src: `${IMG}avatar.svg`, alt: '', width: 200, height: 200 }));
}

function starsRow(n, total = 3, cls = '') {
  return h('span', { class: `stars ${cls}`, role: 'img', 'aria-label': `${n} מתוך ${total} כוכבים` },
    Array.from({ length: total }, (_, i) => icon('star', i < n ? 'on' : 'off')));
}

function bar(frac, label) {
  return h('div', { class: 'bar', role: 'progressbar', 'aria-label': label, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(frac * 100) },
    h('span', { style: `inline-size:${Math.max(0, Math.min(1, frac)) * 100}%` }));
}

const worldStars = id => [1, 2, 3].reduce((acc, l) => acc + (state.stars[`${id}-${l}`] || 0), 0);
const isUnlocked = (id, lvl) => lvl === 1 || (state.stars[`${id}-${lvl - 1}`] || 0) > 0;
const bossUnlocked = () => WORLDS.every(w => (state.stars[`${w.id}-1`] || 0) > 0);

function nextStep() {
  for (const w of WORLDS) for (const l of [1, 2, 3]) {
    if (isUnlocked(w.id, l) && !state.stars[`${w.id}-${l}`]) return { hash: `#/play/${w.id}/${l}`, label: `${w.title} · פרק ${l}` };
  }
  if (bossUnlocked() && !state.stars.boss) return { hash: '#/boss', label: 'קרב הבוס' };
  for (const w of WORLDS) for (const l of [1, 2, 3]) {
    if ((state.stars[`${w.id}-${l}`] || 0) < 3) return { hash: `#/play/${w.id}/${l}`, label: `שפרו ל־3 כוכבים: ${w.title} · פרק ${l}` };
  }
  return { hash: '#/exam', label: 'מבחן מדומה' };
}

function countdown() {
  const now = new Date();
  const day = 86400000;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let text;
  if (today < MAPPING_START) {
    const d = Math.round((MAPPING_START - today) / day);
    text = d === 1 ? 'מחר מתחיל שבוע המיפוי!' : `עוד ${d} ימים לשבוע המיפוי`;
  } else if (now <= MAPPING_END) text = 'זה שבוע המיפוי! בהצלחה!';
  else text = 'המיפוי מאחוריך. ממשיכים לצבור מנויים!';
  return h('div', { class: 'countdown' }, icon('clock'),
    h('div', null, h('strong', null, text), h('span', null, 'מיפוי מתמטיקה 18–23/10. התאריך המדויק לכיתה יימסר בהמשך.')));
}

// ---------- HOME ----------
function renderHome() {
  const next = nextStep();
  const totalStars = Object.values(state.stars).reduce((a, b) => a + b, 0);
  const nextPlaque = store.PLAQUES.find(p => state.subs < p.at);
  const prevAt = [...store.PLAQUES].reverse().find(p => state.subs >= p.at)?.at || 0;

  screen(
    topBar(),
    h('section', { class: 'channel' },
      h('div', { class: 'banner' }, h('img', { src: `${IMG}banner.svg`, alt: '', width: 1200, height: 300 })),
      h('div', { class: 'channel-row' },
        avatar('lg'),
        h('div', { class: 'channel-meta' },
          h('h1', { class: 'channel-name' }, state.name),
          h('p', { class: 'muted' }, h('span', { dir: 'ltr' }, '@NoamTV'), ' · הכנה למיפוי כיתה ד׳'),
        ),
      ),
      h('ul', { class: 'stats' },
        h('li', null, icon('users'), h('b', null, fmt(state.subs)), h('span', null, 'מנויים')),
        h('li', null, icon('eye'), h('b', null, fmt(state.views)), h('span', null, 'צפיות')),
        h('li', null, icon('flame', 'flame'), h('b', null, state.streak.count), h('span', null, 'ימים ברצף')),
        h('li', null, icon('star', 'on'), h('b', null, totalStars), h('span', null, 'כוכבים')),
      ),
    ),
    countdown(),
    h('a', { class: 'btn btn-primary btn-xl', href: next.hash }, icon('play'), h('span', null, 'להמשיך: ', next.label)),
    h('section', { class: 'plaques', 'aria-labelledby': 'plaques-title' },
      h('div', { class: 'section-head' },
        h('h2', { id: 'plaques-title' }, 'לוחיות היוטיוב שלי'),
        nextPlaque && h('span', { class: 'muted' }, `עוד ${fmt(nextPlaque.at - state.subs)} מנויים ל${nextPlaque.label}`)),
      nextPlaque && bar((state.subs - prevAt) / (nextPlaque.at - prevAt), `התקדמות ל${nextPlaque.label}`),
      h('ul', { class: 'plaque-shelf' }, store.PLAQUES.map(p => {
        const got = state.subs >= p.at;
        return h('li', { class: got ? 'got' : 'locked' },
          h('img', { src: p.img, alt: '', width: 160, height: 200 }),
          !got && h('span', { class: 'lock' }, icon('lock')),
          h('span', null, p.label, h('small', null, `${fmt(p.at)} מנויים`)));
      })),
    ),
    h('h2', { class: 'section-title' }, 'הסדרות בערוץ'),
    h('div', { class: 'grid-worlds' }, WORLDS.map(worldCard)),
    h('div', { class: 'grid-special' }, bossCard(), examCard()),
    installCard(),
  );
}

function worldCard(w) {
  const st = worldStars(w.id);
  return h('a', { class: 'card world-card', href: `#/world/${w.id}`, style: `--c:${w.color}` },
    h('div', { class: 'thumb' },
      h('img', { src: w.img, alt: '', width: 320, height: 180, loading: 'lazy' }),
      h('span', { class: 'thumb-badge' }, icon('star', 'on'), `${st}/9`)),
    h('div', { class: 'card-body' },
      h('h3', null, w.title),
      h('p', { class: 'muted' }, w.subtitle),
      bar(st / 9, `התקדמות ב${w.title}`)),
  );
}

function bossCard() {
  const open = bossUnlocked();
  const inner = [
    h('div', { class: 'thumb' }, h('img', { src: `${IMG}world-boss.svg`, alt: '', width: 320, height: 180, loading: 'lazy' }),
      !open && h('span', { class: 'thumb-lock' }, icon('lock'))),
    h('div', { class: 'card-body' },
      h('h3', null, icon('crown'), ' קרב הבוס'),
      h('p', { class: 'muted' }, open ? 'שאלות קשות מכל הנושאים. 10 פגיעות מנצחות את הבוס.' : 'נפתח אחרי פרק 1 בכל חמש הסדרות.'),
      open && starsRow(state.stars.boss || 0)),
  ];
  return open
    ? h('a', { class: 'card special boss', href: '#/boss' }, inner)
    : h('div', { class: 'card special boss is-locked', 'aria-disabled': 'true' }, inner);
}

function examCard() {
  const last = state.exams[0];
  return h('a', { class: 'card special exam', href: '#/exam' },
    h('div', { class: 'thumb' }, h('img', { src: `${IMG}world-exam.svg`, alt: '', width: 320, height: 180, loading: 'lazy' })),
    h('div', { class: 'card-body' },
      h('h3', null, icon('clipboard'), ' מבחן מדומה'),
      h('p', { class: 'muted' }, '20 שאלות מכל נושאי המיפוי, בלי רמזים. הציון מופיע בסוף.'),
      last && h('p', { class: 'last-score' }, `ציון אחרון: ${last.score}`)),
  );
}

function installCard() {
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone) return null;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (deferredInstall) {
    return h('section', { class: 'install' }, icon('download'),
      h('div', null, h('strong', null, 'להתקין את Noam TV בטלפון'), h('span', { class: 'muted' }, 'נפתח כמו אפליקציה ועובד גם בלי אינטרנט.')),
      h('button', { class: 'btn btn-secondary', type: 'button', onclick: doInstall }, 'התקנה'));
  }
  if (ios) {
    return h('section', { class: 'install' }, icon('plus-square'),
      h('div', null, h('strong', null, 'להוסיף למסך הבית באייפון'),
        h('span', { class: 'muted' }, 'בספארי לוחצים על ', icon('share', 'inline'), ' שיתוף, ואז על "הוספה למסך הבית".')));
  }
  return null;
}

async function doInstall() {
  if (!deferredInstall) return;
  deferredInstall.prompt();
  await deferredInstall.userChoice;
  deferredInstall = null;
  if (!location.hash || location.hash === '#/') renderHome();
}

// ---------- WORLD ----------
function renderWorld(id) {
  const w = WORLDS.find(x => x.id === id);
  if (!w) return go('#/');
  screen(
    topBar('#/'),
    h('section', { class: 'world-hero', style: `--c:${w.color}` },
      h('img', { src: w.img, alt: '', width: 320, height: 180 }),
      h('div', null,
        h('h1', null, w.title),
        h('p', { class: 'muted' }, w.subtitle),
        h('ul', { class: 'learn' }, w.learn.map(t => h('li', null, icon('check'), t))))),
    h('ol', { class: 'episodes' }, [1, 2, 3].map(l => {
      const open = isUnlocked(w.id, l);
      const st = state.stars[`${w.id}-${l}`] || 0;
      const body = [
        h('span', { class: 'ep-num', 'aria-hidden': 'true' }, l),
        h('span', { class: 'ep-text' }, h('strong', null, EPISODES[l - 1]),
          h('span', { class: 'muted' }, open ? `10 שאלות · 3 לבבות · עד ${fmt(3 * SUBS_PER_STAR * TIER[l])} מנויים` : `סיימו את פרק ${l - 1} כדי לפתוח`)),
        open ? starsRow(st) : icon('lock', 'ep-lock'),
      ];
      return h('li', null, open
        ? h('a', { class: 'episode', href: `#/play/${w.id}/${l}`, style: `--c:${w.color}` }, body)
        : h('div', { class: 'episode is-locked', 'aria-disabled': 'true' }, body));
    })),
  );
}

// ---------- PLAY ----------
function startRun(cfg) {
  run = { i: 0, hearts: 3, combo: 0, best: 0, views: 0, correct: 0, log: [], started: Date.now(), ...cfg };
  renderQuestion();
}

function startLevel(id, lvl) {
  const w = WORLDS.find(x => x.id === id);
  if (!w || ![1, 2, 3].includes(lvl) || !isUnlocked(id, lvl)) return go('#/');
  startRun({ mode: 'level', world: w, lvl, qs: buildLevel(id, lvl), title: `${w.title} · פרק ${lvl}` });
}

function startBoss() {
  if (!bossUnlocked()) return go('#/');
  startRun({ mode: 'boss', lvl: 'boss', qs: buildBoss(12), bossHp: BOSS_HP, title: 'קרב הבוס' });
}

function startExam() {
  startRun({ mode: 'exam', lvl: 3, qs: buildExam(), title: 'מבחן מדומה' });
}

const comboMult = c => (c >= 8 ? 3 : c >= 5 ? 2 : c >= 3 ? 1.5 : 1);

function renderQuestion() {
  const q = run.qs[run.i];
  run.answered = false;
  run.hintUsed = false;
  run.qStart = Date.now();
  run.submitInput = null;
  const total = run.qs.length;

  const hud = h('header', { class: 'hud' },
    h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'יציאה מהשלב', onclick: confirmExit }, icon('close')),
    h('div', { class: 'qbar', role: 'progressbar', 'aria-label': 'התקדמות בשלב', 'aria-valuemin': 0, 'aria-valuemax': total, 'aria-valuenow': run.i },
      h('span', { style: `inline-size:${(run.i / total) * 100}%` })),
    run.mode === 'exam'
      ? h('span', { class: 'timer', id: 'timer' }, icon('clock'), h('span', null, '0:00'))
      : h('span', { class: 'hearts', role: 'img', 'aria-label': `${run.hearts} לבבות` },
        [0, 1, 2].map(i => icon('heart', i < run.hearts ? 'on' : 'off'))),
    run.mode !== 'exam' && h('span', { class: 'views-chip', id: 'views-chip' }, icon('eye'), h('span', null, fmt(state.views))),
  );

  const boss = run.mode === 'boss' && h('div', { class: 'boss-bar' },
    h('img', { src: `${IMG}world-boss.svg`, alt: '', width: 64, height: 36 }),
    h('div', { class: 'boss-hp', role: 'progressbar', 'aria-label': 'חיים של הבוס', 'aria-valuemin': 0, 'aria-valuemax': BOSS_HP, 'aria-valuenow': run.bossHp },
      h('span', { style: `inline-size:${(run.bossHp / BOSS_HP) * 100}%` })),
    h('b', null, `${run.bossHp}/${BOSS_HP}`));

  const combo = run.mode !== 'exam' && run.combo >= 3 && h('span', { class: 'combo' }, icon('bolt'), `קומבו ${run.combo} · ×${comboMult(run.combo)}`);

  const card = h('section', { class: 'qcard', 'aria-labelledby': 'qtext' },
    h('div', { class: 'qmeta' },
      h('span', null, `${run.title} · שאלה ${run.i + 1} מתוך ${total}`),
      combo),
    h('div', { class: 'qhead' },
      h('h1', { id: 'qtext', class: 'qtext' }, q.text),
      canSpeak() && h('button', { class: 'icon-btn soft', type: 'button', 'aria-label': 'הקראת השאלה', onclick: () => readQuestion(q) }, icon('speaker'))),
    q.words && h('p', { class: 'qwords' }, q.words),
    q.seq ? h('p', { class: 'seq', dir: 'ltr' }, q.seq.map(v => h('span', { class: v === '?' ? 'chip missing' : 'chip' }, v)))
      : q.expr && h('p', { class: 'qexpr', dir: 'ltr' }, q.expr),
    q.shape && shapeSvg(q.shape),
    q.ruler && rulerSvg(q.ruler),
    q.line && q.kind !== 'tapline' && lineSvg(q.line),
    h('div', { class: 'hint-slot', id: 'hint-slot' }),
  );

  const answers = h('section', { class: 'answers', 'aria-label': 'אזור התשובה' }, answerUI(q));
  const tools = run.mode !== 'exam' && h('div', { class: 'tools' },
    h('button', { class: 'btn btn-ghost', type: 'button', id: 'hint-btn', onclick: () => showHint(q) }, icon('bulb'), `רמז · עולה ${HINT_COST} צפיות`));

  screen(h('div', { class: `play mode-${run.mode}` }, hud, boss, card, answers, tools));

  if (run.mode === 'exam') {
    const tick = () => { const t = document.querySelector('#timer span'); if (t) t.textContent = clock(Date.now() - run.started); };
    tick(); examTimer = setInterval(tick, 1000);
  }
  if (state.settings.autoRead) readQuestion(q);
}

function readQuestion(q) {
  const parts = [q.text, q.words || ''].join(' ');
  const ok = speak(parts, q.seq ? q.seq.join(', ') : q.expr || (q.kind === 'compare' ? `${q.left} ? ${q.right}` : ''));
  if (!ok) toast('אין קול עברי במכשיר הזה. אפשר להתקין קול עברי בהגדרות הטלפון.');
}

const clock = ms => { const t = Math.floor(ms / 1000); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };

function answerUI(q) {
  if (q.kind === 'choice') {
    return h('div', { class: `choices${q.long ? ' long' : ''}`, role: 'group', 'aria-label': 'אפשרויות' },
      q.options.map((opt, i) => h('button', {
        class: 'choice', type: 'button', 'data-value': String(opt),
        dir: (q.ltrOptions || typeof opt === 'number') ? 'ltr' : null,
        onclick: e => submit(opt, e.currentTarget),
      }, h('kbd', { 'aria-hidden': 'true' }, i + 1), h('span', null, typeof opt === 'number' ? fmt(opt) : opt))));
  }
  if (q.kind === 'compare') {
    const slot = h('span', { class: 'slot', id: 'cmp-slot' }, '?');
    const names = { '<': 'קטן מ', '=': 'שווה ל', '>': 'גדול מ' };
    return h('div', { class: 'compare-wrap' },
      h('p', { class: 'compare', dir: 'ltr' }, h('span', { class: 'side' }, q.left), slot, h('span', { class: 'side' }, q.right)),
      h('div', { class: 'cmp-btns', dir: 'ltr', role: 'group', 'aria-label': 'בחירת סימן' },
        ['<', '=', '>'].map(sym => h('button', {
          class: 'choice cmp', type: 'button', 'data-value': sym, 'aria-label': names[sym],
          onclick: e => { slot.textContent = sym; submit(sym, e.currentTarget); },
        }, sym))));
  }
  if (q.kind === 'tapline') {
    return h('div', { class: 'tap-wrap' }, lineSvg(q.line, i => submit(i, null)),
      h('p', { class: 'muted center' }, 'הקישו על השנתה הנכונה'));
  }
  return numpad(q);
}

function numpad(q) {
  let val = '';
  const out = h('output', { class: 'answer-box', dir: 'ltr', 'aria-live': 'polite', 'aria-label': 'התשובה שלי' }, '?');
  const ok = h('button', { class: 'key key-ok', type: 'button', disabled: true, 'aria-label': 'בדיקה', onclick: () => val && submit(Number(val), null) }, icon('check'));
  const upd = () => { out.textContent = val ? fmt(Number(val)) : '?'; out.classList.toggle('filled', !!val); ok.disabled = !val; };
  const press = k => {
    if (run.answered) return;
    if (k === 'back') val = val.slice(0, -1);
    else if (val.length < 6) val = val === '0' ? k : val + k;
    sfx.click(); upd();
  };
  run.submitInput = { press, submit: () => val && submit(Number(val), null) };
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'back', '0'];
  return h('div', { class: 'numpad-wrap' },
    h('div', { class: 'answer-row' }, out, q.unit && h('span', { class: 'unit' }, q.unit)),
    h('div', { class: 'numpad', dir: 'ltr', role: 'group', 'aria-label': 'מקלדת מספרים' },
      keys.map(k => k === 'back'
        ? h('button', { class: 'key key-back', type: 'button', 'aria-label': 'מחיקה', onclick: () => press('back') }, icon('backspace'))
        : h('button', { class: 'key', type: 'button', onclick: () => press(k) }, k)),
      ok));
}

function showHint(q) {
  if (run.hintUsed || run.answered) return;
  run.hintUsed = true;
  const cost = Math.min(HINT_COST, state.views);
  state.views -= cost; persist();
  sfx.hint();
  const slot = document.getElementById('hint-slot');
  slot.replaceChildren(h('p', { class: 'hint' }, icon('bulb'), h('span', null, q.hint)));
  document.getElementById('hint-btn')?.setAttribute('disabled', '');
  const chip = document.querySelector('#views-chip span'); if (chip) chip.textContent = fmt(state.views);
  announce(`רמז: ${q.hint}`);
}

function answerLabel(q, v) {
  if (q.kind === 'tapline') return fmt(q.line.a + q.line.s * v);
  if (typeof v === 'number') return fmt(v) + (q.unit ? ` ${q.unit}` : '');
  return String(v);
}

function submit(value, btn) {
  if (!run || run.answered) return;
  run.answered = true;
  const q = run.qs[run.i];
  const ok = value === q.answer;
  state.practiceMs += Math.min(Date.now() - run.qStart, 180000);
  store.recordAnswer(state, q.topic, ok);
  store.touchStreak(state);
  run.log.push({ q, given: value, ok });
  document.querySelectorAll('.answers button, .nl-hit').forEach(b => b.setAttribute('disabled', ''));

  if (run.mode === 'exam') {
    if (ok) run.correct++;
    persist(); sfx.click();
    btn?.classList.add('picked');
    setTimeout(nextQuestion, 220);
    return;
  }

  markAnswer(q, value, btn, ok);
  let gain = 0;
  if (ok) {
    run.correct++; run.combo++; run.best = Math.max(run.best, run.combo);
    gain = Math.round(20 * TIER[run.lvl] * comboMult(run.combo));
    run.views += gain; state.views += gain;
    if (run.mode === 'boss') run.bossHp--;
    sfx.correct();
    if (run.combo >= 3) setTimeout(() => sfx.combo(run.combo), 300);
    floatGain(`+${fmt(gain)}`);
  } else {
    run.combo = 0; run.hearts--;
    sfx.wrong();
    if (state.settings.sfx) navigator.vibrate?.(120);
    const hearts = document.querySelector('.hearts');
    if (hearts) {
      hearts.replaceChildren(...[0, 1, 2].map(i => icon('heart', i < run.hearts ? 'on' : 'off')));
      hearts.setAttribute('aria-label', `${run.hearts} לבבות`);
      hearts.classList.add('hurt');
    }
  }
  persist();
  feedback(ok, q, gain);
}

function markAnswer(q, value, btn, ok) {
  if (q.kind === 'tapline') {
    document.querySelector(`.nl-hit[data-i="${q.answer}"]`)?.classList.add('correct');
    if (!ok) document.querySelector(`.nl-hit[data-i="${value}"]`)?.classList.add('wrong');
    return;
  }
  if (q.kind === 'choice' || q.kind === 'compare') {
    btn?.classList.add(ok ? 'correct' : 'wrong');
    if (!ok) document.querySelector(`.answers [data-value="${CSS.escape(String(q.answer))}"]`)?.classList.add('correct');
    return;
  }
  document.querySelector('.answer-box')?.classList.add(ok ? 'correct' : 'wrong');
}

function floatGain(text) {
  const chip = document.getElementById('views-chip');
  if (!chip) return;
  chip.querySelector('span').textContent = fmt(state.views);
  if (calm()) return;
  const f = h('span', { class: 'float-gain', 'aria-hidden': 'true' }, text);
  chip.append(f);
  setTimeout(() => f.remove(), 1100);
}

function feedback(ok, q, gain) {
  const last = run.mode === 'boss' ? run.bossHp <= 0 || run.hearts <= 0 : run.i + 1 >= run.qs.length || run.hearts <= 0;
  const cont = h('button', { class: `btn ${ok ? 'btn-ok' : 'btn-primary'} btn-xl`, type: 'button', onclick: () => { clearTimeout(autoNext); sheet.remove(); nextQuestion(); } },
    ok ? (last ? 'לתוצאות' : 'הבא') : 'הבנתי, ממשיכים', icon('chev-left'));
  const sheet = h('section', { class: `sheet ${ok ? 'ok' : 'bad'}`, role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'fb-title' },
    h('div', { class: 'sheet-inner' },
      ok
        ? h('div', { class: 'fb-head' }, icon('check', 'fb-ico'),
          h('div', null, h('h2', { id: 'fb-title' }, PRAISE[Math.floor(Math.random() * PRAISE.length)]),
            h('p', null, `+${fmt(gain)} צפיות`, run.combo >= 3 ? ` · קומבו ${run.combo}!` : '', run.mode === 'boss' ? ' · פגעת בבוס!' : '')))
        : h('div', { class: 'fb-head' }, icon('close', 'fb-ico'),
          h('div', null, h('h2', { id: 'fb-title' }, run.mode === 'boss' ? 'הבוס פגע בך!' : 'אופס, כמעט!'),
            h('p', null, 'התשובה הנכונה: ', h('b', { dir: 'auto' }, answerLabel(q, q.answer))))),
      !ok && h('div', { class: 'explain' },
        h('h3', null, 'איך פותרים:'),
        h('ol', null, q.explain.map(t => h('li', null, t))),
        canSpeak() && h('button', { class: 'btn btn-ghost small', type: 'button', onclick: () => speak(q.explain.join('. ')) }, icon('speaker'), 'הקראת ההסבר')),
      cont));
  document.body.append(sheet);
  requestAnimationFrame(() => sheet.classList.add('in'));
  cont.focus({ preventScroll: true });
  announce(ok ? `נכון! ועוד ${gain} צפיות` : `לא נכון. התשובה הנכונה ${answerLabel(q, q.answer)}`);
  if (ok && !last) autoNext = setTimeout(() => { if (sheet.isConnected) { sheet.remove(); nextQuestion(); } }, 1300);
}

function nextQuestion() {
  if (!run) return;
  run.i++;
  if (run.mode !== 'exam' && run.hearts <= 0) return finish(false);
  if (run.mode === 'boss' && run.bossHp <= 0) return finish(true);
  if (run.i >= run.qs.length) return finish(run.mode !== 'boss');
  renderQuestion();
}

function confirmExit() {
  const dlg = modal('יוצאים מהשלב?', [h('p', null, run?.mode === 'exam' ? 'המבחן לא יישמר.' : 'הצפיות שצברתם נשמרות, אבל השלב לא יושלם.')], [
    h('button', { class: 'btn btn-secondary', type: 'button', onclick: () => dlg.close() }, 'להמשיך לשחק'),
    h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { const w = run?.world; dlg.close(); run = null; go(w ? `#/world/${w.id}` : '#/'); } }, 'לצאת'),
  ]);
}

// ---------- RESULTS ----------
function finish(win) {
  stopSpeaking();
  const r = run;
  const before = state.subs;
  let subs = 0, stars = 0, perfect = false;

  if (r.mode === 'exam') {
    const score = Math.round((r.correct / r.qs.length) * 100);
    const byTopic = {};
    for (const { q, ok } of r.log) { const t = byTopic[q.topic] || (byTopic[q.topic] = { c: 0, t: 0 }); t.t++; if (ok) t.c++; }
    state.exams.unshift({ date: store.todayKey(), score, ms: Date.now() - r.started, byTopic });
    state.exams = state.exams.slice(0, 20);
    subs = score * 100;
  } else if (win) {
    stars = r.hearts;
    const key = r.mode === 'boss' ? 'boss' : `${r.world.id}-${r.lvl}`;
    const prev = state.stars[key] || 0;
    state.stars[key] = Math.max(prev, stars);
    subs = stars * SUBS_PER_STAR * TIER[r.lvl];
    if (stars === 3 && prev < 3) { subs += PERFECT_BONUS; perfect = true; }
  }
  state.subs += subs;
  persist();
  run = null;
  // Leave the #/play hash so reloads or re-renders never restart the finished level.
  history.replaceState(null, '', '#/result');

  if (r.mode === 'exam') renderExamResult(r, subs);
  else renderResult(r, win, stars, subs, perfect);

  const fresh = store.PLAQUES.filter(p => before < p.at && state.subs >= p.at);
  if (fresh.length) setTimeout(() => plaqueModal(fresh[fresh.length - 1]), 900);
}

function confetti() {
  if (calm()) return null;
  const colors = ['#ffd23f', '#3ee08f', '#53d6ff', '#ff5d6c', '#ff9f43', '#c99bff'];
  return h('div', { class: 'confetti', 'aria-hidden': 'true' }, Array.from({ length: 28 }, (_, i) =>
    h('i', { style: `--x:${Math.random() * 100}%;--d:${(Math.random() * 0.8).toFixed(2)}s;--r:${Math.floor(Math.random() * 360)}deg;background:${colors[i % colors.length]}` })));
}

function renderResult(r, win, stars, subs, perfect) {
  const back = r.mode === 'boss' ? '#/' : `#/world/${r.world.id}`;
  const nextLvl = r.mode === 'level' && r.lvl < 3 && win ? `#/play/${r.world.id}/${r.lvl + 1}` : null;
  const replay = r.mode === 'boss' ? '#/boss' : `#/play/${r.world.id}/${r.lvl}`;
  if (win) sfx.win(); else sfx.lose();
  const answered = r.log.length;

  screen(
    topBar(back),
    h('section', { class: `result ${win ? 'win' : 'lose'}` },
      win && confetti(),
      avatar('xl'),
      h('h1', null, win ? (r.mode === 'boss' ? 'ניצחת את הבוס!' : 'השלב הושלם!') : 'נגמרו הלבבות'),
      h('p', { class: 'muted' }, win ? r.title : 'גם יוטיוברים גדולים מתחילים מחדש. עוד ניסיון?'),
      win && starsRow(stars, 3, 'big'),
      h('ul', { class: 'result-stats' },
        win && h('li', null, icon('users'), h('b', null, `+${fmt(subs)}`), h('span', null, perfect ? 'מנויים (כולל בונוס 3 כוכבים!)' : 'מנויים')),
        h('li', null, icon('eye'), h('b', null, `+${fmt(r.views)}`), h('span', null, 'צפיות')),
        h('li', null, icon('check'), h('b', null, `${r.correct}/${answered}`), h('span', null, 'תשובות נכונות')),
        h('li', null, icon('bolt'), h('b', null, r.best), h('span', null, 'קומבו שיא'))),
      h('div', { class: 'result-actions' },
        nextLvl && h('a', { class: 'btn btn-primary btn-xl', href: nextLvl }, icon('play'), 'לפרק הבא'),
        h('a', { class: `btn ${nextLvl || !win ? 'btn-secondary' : 'btn-primary'} btn-xl`, href: replay }, icon('refresh'), win ? 'לשחק שוב' : 'לנסות שוב'),
        h('a', { class: 'btn btn-ghost', href: '#/' }, icon('home'), 'לערוץ')),
    ),
  );
  announce(win ? `ניצחון! ${stars} כוכבים ועוד ${subs} מנויים` : 'נגמרו הלבבות. אפשר לנסות שוב');
}

function examVerdict(score) {
  if (score >= 90) return 'מצוין! אתה מוכן למיפוי.';
  if (score >= 75) return 'טוב מאוד! עוד קצת חיזוק וזה מושלם.';
  if (score >= 55) return 'בכיוון הנכון. כדאי לתרגל את הנושאים החלשים.';
  return 'כדאי לתרגל עוד בסדרות, ואז לנסות שוב.';
}

function renderExamResult(r, subs) {
  const ex = state.exams[0];
  sfx.win();
  const topicWorld = Object.fromEntries(WORLDS.map(w => [w.topic, w]));
  const mistakes = r.log.filter(x => !x.ok);
  screen(
    topBar('#/'),
    h('section', { class: 'result exam-result' },
      ex.score >= 75 && confetti(),
      h('p', { class: 'score', 'aria-hidden': 'true' }, ex.score),
      h('h1', null, `ציון: ${ex.score}`),
      h('p', { class: 'muted' }, examVerdict(ex.score), ` זמן: ${clock(ex.ms)}.`),
      h('p', { class: 'chip-gain' }, icon('users'), `+${fmt(subs)} מנויים`),
      h('ul', { class: 'topic-bars' }, Object.entries(ex.byTopic).map(([t, v]) =>
        h('li', null,
          h('a', { href: `#/world/${topicWorld[t].id}` }, TOPICS[t]),
          bar(v.c / v.t, TOPICS[t]),
          h('b', null, `${v.c}/${v.t}`)))),
      mistakes.length
        ? h('section', { class: 'review' }, h('h2', null, `טעויות לתיקון (${mistakes.length})`),
          mistakes.map(({ q, given }) => h('details', null,
            h('summary', null, h('span', null, q.text), q.expr && h('span', { class: 'qexpr-sm', dir: 'ltr' }, ` ${q.expr}`)),
            h('p', null, 'ענית: ', h('b', { class: 'bad-text' }, answerLabel(q, given)), ' · נכון: ', h('b', { class: 'ok-text' }, answerLabel(q, q.answer))),
            h('ol', null, q.explain.map(t => h('li', null, t))))))
        : h('p', { class: 'perfect' }, 'אפס טעויות! מושלם!'),
      h('div', { class: 'result-actions' },
        h('a', { class: 'btn btn-primary btn-xl', href: '#/exam' }, icon('refresh'), 'מבחן חדש'),
        h('a', { class: 'btn btn-ghost', href: '#/' }, icon('home'), 'לערוץ')),
    ),
  );
}

// ---------- VISUALS (inline SVG generated per question) ----------
function lineSvg(line, onTap) {
  const W = 440, pad = 34, y = 56;
  const dx = (W - 2 * pad) / line.k;
  const svg = s('svg', { class: `nline${onTap ? ' tappable' : ''}`, viewBox: `0 0 ${W} 110`, role: 'img', 'aria-label': 'ישר המספרים', dir: 'ltr' });
  svg.append(
    s('line', { x1: 8, y1: y, x2: W - 8, y2: y, class: 'nl-axis' }),
    s('path', { d: `M${W - 4} ${y}l-10-6v12z`, class: 'nl-arrow' }),
    s('path', { d: `M4 ${y}l10-6v12z`, class: 'nl-arrow' }),
  );
  for (let i = 0; i <= line.k; i++) {
    const x = pad + i * dx;
    const major = line.labels.includes(i);
    svg.append(s('line', { x1: x, y1: y - (major ? 14 : 10), x2: x, y2: y + (major ? 14 : 10), class: major ? 'nl-tick major' : 'nl-tick' }));
    if (major) svg.append(s('text', { x, y: y + 38, class: 'nl-label' }, fmt(line.a + line.s * i)));
  }
  if (line.mark != null) {
    const x = pad + line.mark * dx;
    svg.append(s('path', { d: `M${x} ${y - 16}l-9-14h18z`, class: 'nl-mark' }), s('text', { x, y: y - 36, class: 'nl-q' }, '?'));
  }
  if (onTap) {
    for (let i = 0; i <= line.k; i++) {
      const x = pad + i * dx;
      const hit = s('g', { class: 'nl-hit', 'data-i': i, tabindex: 0, role: 'button', 'aria-label': `שנתה ${i + 1} משמאל` },
        s('rect', { x: x - dx / 2, y: 8, width: dx, height: 92, class: 'nl-hit-area' }),
        s('circle', { cx: x, cy: y, r: 9, class: 'nl-dot' }));
      const act = () => { if (!hit.hasAttribute('disabled')) onTap(i); };
      hit.addEventListener('click', act);
      hit.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
      svg.append(hit);
    }
  }
  return svg;
}

function rulerSvg(ruler) {
  const u = 30, pad = 22, max = 15, W = pad * 2 + u * max;
  const rows = ruler.items.length;
  const top = 10, rowH = 34, ry = top + rows * rowH + 14;
  const H = ry + 70;
  const X = cm => pad + cm * u;
  const svg = s('svg', { class: 'ruler', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'סרגל בסנטימטרים', dir: 'ltr' });
  ruler.items.forEach((it, idx) => {
    const y = top + idx * rowH;
    const x1 = X(it.from), x2 = X(it.to), tip = 18, ph = 24;
    svg.append(
      s('line', { x1, y1: y + ph / 2, x2: x1, y2: ry, class: 'guide' }),
      s('line', { x1: x2, y1: y + ph / 2, x2, y2: ry, class: 'guide' }),
      s('rect', { x: x1, y, width: 9, height: ph, rx: 3, fill: '#ff8fb1' }),
      s('rect', { x: x1 + 9, y, width: x2 - x1 - 9 - tip, height: ph, fill: it.color }),
      s('rect', { x: x1 + 9, y, width: x2 - x1 - 9 - tip, height: 7, fill: '#fff', opacity: '.25' }),
      s('path', { d: `M${x2 - tip} ${y}L${x2} ${y + ph / 2}L${x2 - tip} ${y + ph}z`, fill: '#f2c38b' }),
      s('path', { d: `M${x2 - 6} ${y + ph / 2 - 3.5}L${x2} ${y + ph / 2}L${x2 - 6} ${y + ph / 2 + 3.5}z`, fill: '#333' }),
    );
  });
  svg.append(s('rect', { x: 4, y: ry, width: W - 8, height: 62, rx: 6, class: 'ruler-body' }));
  for (let mm = 0; mm <= max * 2; mm++) {
    const x = pad + (mm * u) / 2, cm = mm % 2 === 0;
    svg.append(s('line', { x1: x, y1: ry, x2: x, y2: ry + (cm ? 22 : 12), class: 'ruler-tick' }));
    if (cm) svg.append(s('text', { x, y: ry + 47, class: 'ruler-num' }, mm / 2));
  }
  return svg;
}

function shapeSvg(shape) {
  const W = 260, H = 210, pad = 34;
  const xs = shape.pts.map(p => p[0]), ys = shape.pts.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const sc = Math.min((W - 2 * pad) / (maxX - minX || 1), (H - 2 * pad) / (maxY - minY || 1));
  const ox = (W - (maxX - minX) * sc) / 2, oy = (H - (maxY - minY) * sc) / 2;
  const P = shape.pts.map(([x, y]) => [ox + (x - minX) * sc, oy + (y - minY) * sc]);
  const n = P.length;
  const cx = P.reduce((a, p) => a + p[0], 0) / n, cy = P.reduce((a, p) => a + p[1], 0) / n;
  const svg = s('svg', { class: 'shape', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'צורה', dir: 'ltr' });
  svg.append(s('polygon', { points: P.map(p => p.map(v => v.toFixed(1)).join(',')).join(' '), class: 'shape-fill' }));
  const unit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); return [dx / l, dy / l]; };
  const arc = (i, r, cls) => {
    const v = P[i], a = unit(v, P[(i + n - 1) % n]), b = unit(v, P[(i + 1) % n]);
    const sweep = a[0] * b[1] - a[1] * b[0] > 0 ? 1 : 0;
    svg.append(s('path', { d: `M${v[0] + a[0] * r} ${v[1] + a[1] * r}A${r} ${r} 0 0 ${sweep} ${v[0] + b[0] * r} ${v[1] + b[1] * r}`, class: cls }));
  };
  if (shape.right != null) {
    const i = shape.right, v = P[i], a = unit(v, P[(i + n - 1) % n]), b = unit(v, P[(i + 1) % n]), k = 16;
    svg.append(s('path', { d: `M${v[0] + a[0] * k} ${v[1] + a[1] * k}L${v[0] + (a[0] + b[0]) * k} ${v[1] + (a[1] + b[1]) * k}L${v[0] + b[0] * k} ${v[1] + b[1] * k}`, class: 'angle-mark' }));
  }
  if (shape.obtuse != null) arc(shape.obtuse, 24, 'angle-mark obtuse');
  if (shape.acute) for (let i = 0; i < n; i++) arc(i, 18, 'angle-mark');
  if (shape.sideLabels) {
    shape.sideLabels.forEach((len, i) => {
      const a = P[i], b = P[(i + 1) % n];
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      const d = Math.hypot(mx - cx, my - cy) || 1;
      svg.append(s('text', { x: mx + ((mx - cx) / d) * 18, y: my + ((my - cy) / d) * 18 + 6, class: 'side-label' }, len));
    });
  }
  if (shape.dots) P.forEach(p => svg.append(s('circle', { cx: p[0], cy: p[1], r: 6, class: 'vertex' })));
  return svg;
}

// ---------- MODALS ----------
function modal(title, body, actions, cls = '') {
  const dlg = h('dialog', { class: `modal ${cls}`, 'aria-labelledby': 'modal-title' },
    h('h2', { id: 'modal-title' }, title), body, h('div', { class: 'modal-actions' }, actions));
  dlg.addEventListener('close', () => dlg.remove());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  document.body.append(dlg);
  dlg.showModal();
  return dlg;
}

function toast(msg, action) {
  document.querySelector('.toast')?.remove();
  const t = h('div', { class: 'toast', role: 'status' }, h('span', null, msg), action);
  document.body.append(t);
  if (!action) setTimeout(() => t.remove(), 4000);
}

function plaqueModal(p) {
  sfx.plaque();
  const dlg = modal(`קיבלת ${p.label}!`, [
    h('img', { class: 'plaque-big', src: p.img, alt: p.label, width: 160, height: 200 }),
    h('p', null, `הערוץ עבר ${fmt(p.at)} מנויים! פתחת ${FRAME_NAMES[p.id]} לאווטאר.`),
  ], [
    h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { state.frame = p.id; persist(); dlg.close(); refreshAvatars(); } }, 'לשים את המסגרת'),
    h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => dlg.close() }, 'אחר כך'),
  ], 'celebrate');
}

function toggle(key, label, desc) {
  const id = `set-${key}`;
  return h('label', { class: 'switch', for: id },
    h('span', null, h('b', null, label), desc && h('small', null, desc)),
    h('input', {
      id, type: 'checkbox', role: 'switch', checked: state.settings[key],
      onchange: e => {
        state.settings[key] = e.target.checked; persist(); applySettings();
        if (key === 'music' && e.target.checked) music.start();
      },
    }));
}

function openSettings() {
  const name = h('input', { id: 'set-name', type: 'text', maxlength: 24, value: state.name, autocomplete: 'off' });
  const frames = ['none', ...store.unlockedPlaques(state.subs).map(p => p.id)];
  const dlg = modal('הגדרות', [
    h('div', { class: 'field' }, h('label', { for: 'set-name' }, 'שם הערוץ'), name),
    h('fieldset', { class: 'frames' }, h('legend', null, 'מסגרת לאווטאר'),
      frames.map(f => h('label', { class: 'frame-opt' },
        h('input', { type: 'radio', name: 'frame', value: f, checked: state.frame === f, onchange: () => { state.frame = f; persist(); } }),
        h('span', { class: `avatar avatar-sm frame-${f}` }, h('img', { src: `${IMG}avatar.svg`, alt: '' })),
        h('span', null, FRAME_NAMES[f]))),
      frames.length === 1 && h('p', { class: 'muted' }, 'מסגרות נפתחות בלוחיות: 10,000, 100,000 ומיליון מנויים.')),
    toggle('sfx', 'צלילים'),
    toggle('music', 'מוזיקת רקע'),
    toggle('autoRead', 'הקראת שאלות אוטומטית', 'צריך קול עברי במכשיר'),
    toggle('contrast', 'ניגודיות גבוהה'),
    toggle('calm', 'מצב רגוע', 'פחות אנימציות'),
  ], [
    h('button', { class: 'btn btn-primary', type: 'button', onclick: () => dlg.close() }, 'שמירה'),
  ]);
  dlg.addEventListener('close', () => {
    const v = name.value.trim();
    if (v) state.name = v.slice(0, 24);
    persist();
    if (!location.hash || location.hash === '#/') renderHome(); else refreshAvatars();
  });
}

function refreshAvatars() {
  document.querySelectorAll('.avatar').forEach(el => {
    if (!el.closest('.frame-opt')) el.className = el.className.replace(/frame-\w+/, `frame-${state.frame}`);
  });
}

function openParentGate() {
  if (parentOk) return go('#/parent');
  const a = 12 + Math.floor(Math.random() * 8), b = 13 + Math.floor(Math.random() * 7);
  const input = h('input', { id: 'gate', type: 'text', inputmode: 'numeric', autocomplete: 'off', dir: 'ltr' });
  const err = h('p', { class: 'error', role: 'alert' });
  const check = () => {
    if (Number(input.value) === a * b) { parentOk = true; dlg.close(); go('#/parent'); }
    else { err.textContent = 'לא נכון. נסו שוב.'; input.select(); }
  };
  input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
  const dlg = modal('אזור הורים', [
    h('p', null, 'כדי להיכנס, פתרו תרגיל של מבוגרים:'),
    h('div', { class: 'field' }, h('label', { for: 'gate', dir: 'ltr' }, `${a} × ${b} = ?`), input, err),
  ], [
    h('button', { class: 'btn btn-primary', type: 'button', onclick: check }, 'כניסה'),
    h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => dlg.close() }, 'ביטול'),
  ]);
  input.focus();
}

// ---------- PARENT ----------
function renderParent() {
  if (!parentOk) { go('#/'); return openParentGate(); }
  const mins = Math.round(state.practiceMs / 60000);
  const done = Object.keys(state.stars).filter(k => k !== 'boss').length;
  const rows = Object.entries(TOPICS).map(([t, label]) => {
    const st = state.topicStats[t] || { c: 0, t: 0 };
    const pct = st.t ? st.c / st.t : 0;
    const level = !st.t ? 'אין נתונים' : st.t < 5 ? 'מעט נתונים' : pct >= 0.85 ? 'חזק' : pct >= 0.65 ? 'בינוני' : 'לחזק';
    return { t, label, st, pct, level };
  });
  const weak = rows.filter(r => r.st.t >= 5 && r.pct < 0.65);
  screen(
    topBar('#/'),
    h('section', { class: 'parent' },
      h('h1', null, 'אזור הורים'),
      h('ul', { class: 'stats parent-stats' },
        h('li', null, icon('clock'), h('b', null, mins < 60 ? `${mins} דק׳` : `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')} שע׳`), h('span', null, 'זמן תרגול')),
        h('li', null, icon('flame', 'flame'), h('b', null, state.streak.count), h('span', null, 'ימים ברצף')),
        h('li', null, icon('check'), h('b', null, `${done}/15`), h('span', null, 'פרקים הושלמו')),
        h('li', null, icon('clipboard'), h('b', null, state.exams.length), h('span', null, 'מבחנים מדומים'))),
      h('h2', null, 'הצלחה לפי נושא'),
      h('table', { class: 'topic-table' },
        h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'נושא'), h('th', { scope: 'col' }, 'נכון'), h('th', { scope: 'col' }, 'אחוז'), h('th', { scope: 'col' }, 'מצב'))),
        h('tbody', null, rows.map(r => h('tr', { class: `lvl-${r.level === 'לחזק' ? 'weak' : r.level === 'חזק' ? 'strong' : 'mid'}` },
          h('th', { scope: 'row' }, r.label),
          h('td', null, `${r.st.c}/${r.st.t}`),
          h('td', null, r.st.t ? `${Math.round(r.pct * 100)}%` : '–'),
          h('td', null, r.level))))),
      weak.length
        ? h('p', { class: 'note' }, 'מומלץ לחזק: ', weak.map(r => r.label).join(', '), '. כדאי לשחק שוב בפרקים של הסדרה המתאימה.')
        : h('p', { class: 'note' }, 'אין כרגע נושא חלש במיוחד (נדרשות לפחות 5 תשובות בנושא).'),
      h('h2', null, 'מבחנים מדומים'),
      state.exams.length
        ? h('ol', { class: 'exam-list' }, state.exams.map(e => h('li', null, h('b', null, e.score), h('span', null, `${e.date.split('-').reverse().join('/')} · ${clock(e.ms)} דק׳`))))
        : h('p', { class: 'muted' }, 'עדיין לא נעשה מבחן מדומה.'),
      h('h2', null, 'נושאי המיפוי (מהמכתב לכיתה)'),
      h('ul', { class: 'mapping' },
        h('li', null, 'קריאת מספרים והבנתם בתחום הרבבה, כולל השוואה ביניהם'),
        h('li', null, 'זיהוי מספרים על ישר המספרים והשלמת סדרות'),
        h('li', null, 'תרגילים ובעיות בחיבור ובחיסור, כפל וחילוק מלוח הכפל, ובעשרות ובמאות שלמות'),
        h('li', null, 'גיאומטריה: זיהוי מצולעים לפי צלעות וקודקודים, סנטימטר על סרגל, משפחת המשולשים')),
      h('button', { class: 'btn btn-danger', type: 'button', onclick: confirmReset }, 'איפוס כל ההתקדמות'),
    ),
  );
}

function confirmReset() {
  const dlg = modal('לאפס את כל ההתקדמות?', [h('p', null, 'כל המנויים, הכוכבים והסטטיסטיקה יימחקו. אי אפשר לבטל את הפעולה.')], [
    h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => dlg.close() }, 'ביטול'),
    h('button', { class: 'btn btn-danger', type: 'button', onclick: () => { state = store.reset(); applySettings(); dlg.close(); go('#/'); } }, 'כן, לאפס'),
  ]);
}

// ---------- keyboard ----------
document.addEventListener('keydown', e => {
  if (document.querySelector('dialog[open]') || e.altKey || e.ctrlKey || e.metaKey) return;
  const sheet = document.querySelector('.sheet');
  if (sheet) { if (e.key === 'Enter' && document.activeElement?.tagName !== 'BUTTON') sheet.querySelector('.btn')?.click(); return; }
  if (!run || run.answered || !app.querySelector('.play')) return;
  const q = run.qs[run.i];
  if (e.key === 'Escape') return confirmExit();
  if (q.kind === 'input' && run.submitInput) {
    if (/^\d$/.test(e.key)) run.submitInput.press(e.key);
    else if (e.key === 'Backspace') run.submitInput.press('back');
    else if (e.key === 'Enter') { e.preventDefault(); run.submitInput.submit(); }
  } else if (q.kind === 'choice' && /^[1-4]$/.test(e.key)) {
    app.querySelectorAll('.choice')[Number(e.key) - 1]?.click();
  } else if (q.kind === 'compare' && ['<', '>', '='].includes(e.key)) {
    app.querySelector(`.cmp[data-value="${e.key}"]`)?.click();
  }
});

// ---------- router ----------
function route() {
  stopSpeaking();
  const [view, a, b] = location.hash.replace(/^#\/?/, '').split('/');
  if (view !== 'play' && view !== 'boss' && view !== 'exam') run = null;
  window.scrollTo(0, 0);
  switch (view) {
    case 'world': return renderWorld(a);
    case 'play': return startLevel(a, Number(b));
    case 'boss': return startBoss();
    case 'exam': return startExam();
    case 'parent': return renderParent();
    default: return renderHome();
  }
}

window.addEventListener('hashchange', route);

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstall = e;
  if (!location.hash || location.hash === '#/') renderHome();
});

if ('serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').catch(() => {});
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) toast('יש גרסה חדשה של האפליקציה.', h('button', { class: 'btn btn-secondary small', type: 'button', onclick: () => location.reload() }, 'רענון'));
  });
}

applySettings();
route();
