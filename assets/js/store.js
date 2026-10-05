const KEY = 'noamtv.v1';

const DEFAULTS = {
  name: 'הערוץ של נועם',
  subs: 0,
  views: 0,
  stars: {},
  topicStats: {},
  exams: [],
  streak: { count: 0, last: '' },
  practiceMs: 0,
  frame: 'none',
  settings: { sfx: true, music: false, autoRead: false, contrast: false, calm: false },
};

export const PLAQUES = [
  { id: 'silver', at: 10000, label: 'לוחית כסף', img: 'assets/img/plaque-silver.svg' },
  { id: 'gold', at: 100000, label: 'לוחית זהב', img: 'assets/img/plaque-gold.svg' },
  { id: 'diamond', at: 1000000, label: 'לוחית יהלום', img: 'assets/img/plaque-diamond.svg' },
];

export function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { ...structuredClone(DEFAULTS), ...raw, settings: { ...DEFAULTS.settings, ...(raw.settings || {}) } };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

export function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full or blocked */ }
}

export function reset() {
  localStorage.removeItem(KEY);
  return structuredClone(DEFAULTS);
}

export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function touchStreak(state) {
  const today = todayKey();
  if (state.streak.last === today) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  state.streak.count = state.streak.last === todayKey(y) ? state.streak.count + 1 : 1;
  state.streak.last = today;
}

export function recordAnswer(state, topic, ok) {
  const s = state.topicStats[topic] || (state.topicStats[topic] = { c: 0, t: 0 });
  s.t++; if (ok) s.c++;
}

export const unlockedPlaques = subs => PLAQUES.filter(p => subs >= p.at);
