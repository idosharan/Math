// Question generators for every topic of the grade-4 start-of-year mapping.
export const fmt = n => (typeof n === 'number' ? n.toLocaleString('en-US') : String(n));
// Wrap math in a Unicode LTR isolate so it renders correctly inside Hebrew (RTL) sentences.
export const L = s => `\u2066${s}\u2069`;

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const chance = p => Math.random() < p;
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const MINUS = '−';

function options(answer, candidates, count = 4) {
  const out = [answer];
  for (const c of candidates) {
    if (out.length >= count) break;
    if (typeof c === 'number' && (c < 0 || !Number.isInteger(c))) continue;
    if (!out.includes(c)) out.push(c);
  }
  const step = typeof answer === 'number' && answer >= 100 ? 10 : 1;
  for (let k = 1; out.length < count && typeof answer === 'number'; k++) {
    const c = answer + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * step;
    if (c >= 0 && !out.includes(c)) out.push(c);
  }
  return shuffle(out);
}

export const TOPICS = {
  numbers: 'קריאת מספרים והשוואה',
  line: 'ישר המספרים וסדרות',
  addsub: 'חיבור וחיסור',
  muldiv: 'כפל וחילוק',
  geometry: 'גיאומטריה',
};

export const WORLDS = [
  { id: 'blocks', topic: 'numbers', title: 'עולם הבלוקים', subtitle: 'מספרים עד 10,000 והשוואה', img: 'assets/img/world-blocks.svg', color: '#5cbf3d',
    learn: ['קריאה וכתיבה של מספרים עד רבבה', 'ערך הספרה לפי המקום שלה', 'השוואה בעזרת הסימנים <, > ו־='] },
  { id: 'obby', topic: 'line', title: 'אובי המספרים', subtitle: 'ישר המספרים וסדרות', img: 'assets/img/world-obby.svg', color: '#7c3aed',
    learn: ['זיהוי מספרים על ישר המספרים', 'השלמת סדרות עולות ויורדות', 'מציאת הכלל של סדרה'] },
  { id: 'royale', topic: 'addsub', title: 'באטל רויאל', subtitle: 'חיבור וחיסור ובעיות', img: 'assets/img/world-royale.svg', color: '#2f8cff',
    learn: ['חיבור וחיסור בעשרות ובמאות שלמות', 'חיבור וחיסור במאונך עם המרה', 'בעיות מילוליות'] },
  { id: 'arena', topic: 'muldiv', title: 'ארנת הכפל', subtitle: 'לוח הכפל, חילוק, עשרות ומאות', img: 'assets/img/world-arena.svg', color: '#f59e0b',
    learn: ['לוח הכפל עד 10 × 10', 'חילוק כפעולה הפוכה לכפל', 'כפל וחילוק בעשרות ובמאות שלמות'] },
  { id: 'stadium', topic: 'geometry', title: 'אצטדיון הצורות', subtitle: 'מצולעים, סרגל ומשולשים', img: 'assets/img/world-stadium.svg', color: '#22b14c',
    learn: ['זיהוי מצולעים לפי צלעות וקודקודים', 'מדידה בסנטימטרים על סרגל', 'משפחת המשולשים לפי צלעות וזוויות'] },
];

export const EPISODES = ['פרק 1: חימום', 'פרק 2: מתקדמים', 'פרק 3: אתגר'];

// ---------- Hebrew number words (counting form) ----------
const U = ['', 'אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע'];
const TEEN = ['עשר', 'אחת עשרה', 'שתים עשרה', 'שלוש עשרה', 'ארבע עשרה', 'חמש עשרה', 'שש עשרה', 'שבע עשרה', 'שמונה עשרה', 'תשע עשרה'];
const TENS = ['', '', 'עשרים', 'שלושים', 'ארבעים', 'חמישים', 'שישים', 'שבעים', 'שמונים', 'תשעים'];
const HUND = ['', 'מאה', 'מאתיים', 'שלוש מאות', 'ארבע מאות', 'חמש מאות', 'שש מאות', 'שבע מאות', 'שמונה מאות', 'תשע מאות'];
const THOU = ['', 'אלף', 'אלפיים', 'שלושת אלפים', 'ארבעת אלפים', 'חמשת אלפים', 'ששת אלפים', 'שבעת אלפים', 'שמונת אלפים', 'תשעת אלפים', 'עשרת אלפים'];

export function words(n) {
  if (n === 0) return 'אפס';
  const parts = [];
  let joined = false;
  const th = Math.floor(n / 1000), h = Math.floor((n % 1000) / 100), r = n % 100;
  if (th) parts.push(THOU[th]);
  if (h) parts.push(HUND[h]);
  if (r) {
    if (r < 10) parts.push(U[r]);
    else if (r < 20) parts.push(TEEN[r - 10]);
    else if (r % 10 === 0) parts.push(TENS[r / 10]);
    else { parts.push(TENS[Math.floor(r / 10)], 'ו' + U[r % 10]); joined = true; }
  }
  if (!joined && parts.length > 1) parts[parts.length - 1] = 'ו' + parts[parts.length - 1];
  return parts.join(' ');
}

const PLACE = ['יחידות', 'עשרות', 'מאות', 'אלפים', 'עשרות אלפים'];
const digit = (n, p) => Math.floor(n / 10 ** p) % 10;
const digitsOf = n => [3, 2, 1, 0].map(p => digit(n, p));
const fromDigits = d => d.reduce((acc, x) => acc * 10 + x, 0);

function expandedText(n) {
  const parts = [];
  for (let p = 3; p >= 0; p--) { const d = digit(n, p); if (d) parts.push(`${d} ${PLACE[p]}`); }
  if (parts.length > 1) parts[parts.length - 1] = 'ו־' + parts[parts.length - 1];
  return parts.join(', ');
}

function num4(lvl) {
  const d = [rnd(1, 9), rnd(1, 9), rnd(1, 9), rnd(1, 9)];
  if (lvl >= 2) {
    const zeros = lvl === 3 ? rnd(1, 2) : rnd(0, 1);
    shuffle([1, 2, 3]).slice(0, zeros).forEach(i => { d[i] = 0; });
  }
  return fromDigits(d);
}

function numberDistractors(n) {
  const d = digitsOf(n);
  const out = [];
  for (let i = 1; i < 4; i++) for (let j = i + 1; j < 4; j++) {
    if (d[i] !== d[j]) { const s = [...d]; [s[i], s[j]] = [s[j], s[i]]; out.push(fromDigits(s)); }
  }
  const s01 = [...d]; [s01[0], s01[1]] = [s01[1], s01[0]];
  if (s01[0]) out.push(fromDigits(s01));
  const rest = n % 1000;
  if (rest && rest < 100) out.push(Number(`${d[0]}000${rest}`));
  return shuffle(out);
}

// ---------- WORLD 1: numbers ----------
function gPlaceValue(lvl) {
  let n, p, d;
  do { n = num4(lvl); p = rnd(0, 3); d = digit(n, p); } while (!d || digitsOf(n).filter(x => x === d).length > 1);
  const value = d * 10 ** p;
  return {
    kind: 'choice', text: `מה הערך של הספרה ${d} במספר ${fmt(n)}?`,
    options: options(value, [d, d * 10, d * 100, d * 1000]), answer: value,
    hint: `בדקו באיזה מקום עומדת הספרה ${d}: יחידות, עשרות, מאות או אלפים.`,
    explain: [`במספר ${fmt(n)} יש ${expandedText(n)}.`, `הספרה ${d} נמצאת במקום ה${PLACE[p]}, לכן הערך שלה ${fmt(value)}.`],
  };
}

function gDigitAt(lvl) {
  const n = num4(lvl);
  let p = rnd(0, 3);
  if (lvl >= 2) { const z = [0, 1, 2].filter(i => digit(n, i) === 0); if (z.length && chance(0.5)) p = pick(z); }
  const d = digit(n, p);
  return {
    kind: 'input', text: `איזו ספרה נמצאת במקום ה${PLACE[p]} במספר ${fmt(n)}?`, answer: d,
    hint: 'מימין לשמאל: יחידות, עשרות, מאות, אלפים.',
    explain: [`במספר ${fmt(n)} יש ${expandedText(n)}.`, `במקום ה${PLACE[p]} נמצאת הספרה ${d}.`],
  };
}

function gWordsToNumber(lvl) {
  const n = lvl === 1 ? rnd(1, 9) * 1000 + rnd(1, 9) * 100 + rnd(11, 99) : num4(lvl);
  return {
    kind: 'choice', text: 'איזה מספר כתוב במילים?', words: words(n),
    options: options(n, numberDistractors(n)), answer: n,
    hint: 'פרקו את המילים: כמה אלפים? כמה מאות? כמה עשרות ויחידות?',
    explain: [`${words(n)} = ${expandedText(n)}.`, `לכן המספר הוא ${fmt(n)}. מקום ריק מסמנים ב־0.`],
  };
}

function gNumberToWords(lvl) {
  const n = num4(Math.max(2, lvl));
  const opts = options(n, numberDistractors(n), 3).map(words);
  return {
    kind: 'choice', text: 'איך קוראים את המספר?', expr: fmt(n), long: true,
    options: opts, answer: words(n),
    hint: 'קראו קודם את האלפים, אחר כך את המאות, ובסוף את העשרות והיחידות.',
    explain: [`${fmt(n)}: ${expandedText(n)}.`, `קוראים: ${words(n)}.`],
  };
}

function compareExplain(a, b) {
  if (a === b) return [`המספרים זהים, לכן ${L(`${fmt(a)} = ${fmt(b)}`)}.`];
  const da = digitsOf(a), db = digitsOf(b);
  const lines = [];
  for (let i = 0; i < 4; i++) {
    const p = 3 - i;
    if (da[i] === db[i]) { lines.push(`${PLACE[p]}: ${da[i]} שווה ל־${db[i]}, ממשיכים.`); continue; }
    const s = a > b ? '>' : '<';
    lines.push(`${PLACE[p]}: ${da[i]} ${da[i] > db[i] ? 'גדול מ' : 'קטן מ'}־${db[i]}.`);
    lines.push(`לכן ${L(`${fmt(a)} ${s} ${fmt(b)}`)}. הפה של הסימן פתוח לכיוון המספר הגדול.`);
    break;
  }
  return lines;
}

function gCompare(lvl) {
  let a = num4(lvl), b;
  if (lvl === 1) {
    b = chance(0.5) ? a + pick([-1, 1]) * rnd(1, 3) * 1000 : fromDigits(((d) => { d[1] = (d[1] + rnd(1, 8)) % 10; return d; })(digitsOf(a)));
    if (b < 1000 || b > 9999) b = a - 100 >= 1000 ? a - 100 : a + 100;
  } else {
    const d = digitsOf(a);
    if (chance(0.15)) b = a;
    else if (d[2] !== d[3] && chance(0.6)) { const s = [...d]; [s[2], s[3]] = [s[3], s[2]]; b = fromDigits(s); }
    else { b = a + pick([-1, 1]) * rnd(1, 9) * (lvl === 3 ? 1 : 10); if (b < 1000 || b > 9999) b = a + 10; }
  }
  if (lvl === 3 && chance(0.5)) {
    const parts = shuffle([3, 2, 1, 0].map(p => digit(a, p) * 10 ** p).filter(Boolean));
    const left = parts.map(fmt).join(' + ');
    const ans = a > b ? '>' : a < b ? '<' : '=';
    return {
      kind: 'compare', text: 'בחרו את הסימן המתאים:', left, right: fmt(b), answer: ans,
      hint: 'קודם חשבו כמה יוצא התרגיל שבצד שמאל, ואז השוו.',
      explain: [`${L(`${left} = ${fmt(a)}`)}.`, ...compareExplain(a, b)],
    };
  }
  return {
    kind: 'compare', text: 'בחרו את הסימן המתאים:', left: fmt(a), right: fmt(b), answer: a > b ? '>' : a < b ? '<' : '=',
    hint: 'משווים מהמקום הגבוה ביותר: אלפים, אחר כך מאות, עשרות ויחידות.',
    explain: compareExplain(a, b),
  };
}

function gExpanded(lvl) {
  const n = num4(lvl);
  const parts = [3, 2, 1, 0].map(p => digit(n, p) * 10 ** p).filter(Boolean);
  if (lvl === 3 && chance(0.5)) {
    const d = digitsOf(n);
    const txt = shuffle([3, 2, 1, 0].filter(p => d[3 - p]).map(p => `${d[3 - p]} ${PLACE[p]}`)).join(', ');
    return {
      kind: 'input', text: `איזה מספר יש בו ${txt}?`, answer: n,
      hint: 'שימו לב לסדר! כתבו כל ספרה במקום הנכון, ומקום ריק ממלאים ב־0.',
      explain: [`מסדרים לפי המקומות: ${expandedText(n)}.`, `המספר הוא ${fmt(n)}.`],
    };
  }
  const shown = lvl === 3 ? shuffle(parts) : parts;
  const expr = `${shown.map(fmt).join(' + ')} = ?`;
  return {
    kind: 'input', text: 'כמה זה?', expr, answer: n,
    hint: 'כל מחובר שייך למקום אחר: אלפים, מאות, עשרות או יחידות.',
    explain: [`${expandedText(n)}.`, `${L(`${parts.map(fmt).join(' + ')} = ${fmt(n)}`)}`],
  };
}

function gNeighbors(lvl) {
  const forms = lvl === 1
    ? [['אחרי', 1], ['לפני', -1]]
    : [['10 יותר מ', 10], ['10 פחות מ', -10], ['100 יותר מ', 100], ['100 פחות מ', -100], ['1,000 יותר מ', 1000], ['1,000 פחות מ', -1000]];
  const [label, delta] = pick(forms);
  let n;
  if (lvl === 1) n = rnd(1, 9) * 1000 + pick([99, 999, rnd(100, 899), 0]) + (delta < 0 ? 1 : 0);
  else n = rnd(1, 8) * 1000 + pick([rnd(90, 99) * 10 + (lvl === 3 ? rnd(0, 9) : 0), rnd(900, 999), rnd(0, 9) * 10 + rnd(0, 9), rnd(100, 999)]);
  const ans = n + delta;
  if (ans < 0 || ans > 10000) return gNeighbors(lvl);
  const text = lvl === 1 ? `מה המספר שבא מיד ${label} ${fmt(n)}?` : `מהו המספר שהוא ${label}־${fmt(n)}?`;
  return {
    kind: 'input', text, answer: ans,
    hint: Math.abs(delta) === 1 ? 'מוסיפים או מורידים 1. שימו לב למעבר של עשרת, מאה או אלף.' : `שימו לב איזו ספרה משתנה כשמוסיפים או מורידים ${fmt(Math.abs(delta))}.`,
    explain: [`${L(`${fmt(n)} ${delta > 0 ? '+' : MINUS} ${fmt(Math.abs(delta))} = ${fmt(ans)}`)}`],
  };
}

function gOrder(lvl) {
  const base = digitsOf(num4(lvl));
  const set = new Set([fromDigits(base)]);
  let guard = 0;
  while (set.size < 4 && guard++ < 50) { const s = shuffle(base); if (s[0]) set.add(fromDigits(s)); }
  if (set.size < 4) return gOrder(lvl);
  const nums = [...set];
  const big = chance(0.5);
  const ans = big ? Math.max(...nums) : Math.min(...nums);
  return {
    kind: 'choice', text: `איזה מספר הוא ה${big ? 'גדול' : 'קטן'} ביותר?`, options: shuffle(nums), answer: ans,
    hint: 'השוו קודם את האלפים. אם הם שווים, עברו למאות.',
    explain: [`מסדרים מהקטן לגדול: ${L(nums.sort((x, y) => x - y).map(fmt).join(' < '))}.`, `ה${big ? 'גדול' : 'קטן'} ביותר: ${fmt(ans)}.`],
  };
}

function gBuildFromDigits() {
  const ds = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4);
  const big = chance(0.5);
  const sorted = [...ds].sort((a, b) => (big ? b - a : a - b));
  if (!big && sorted[0] === 0) { const i = sorted.findIndex(x => x > 0); [sorted[0], sorted[i]] = [sorted[i], sorted[0]]; }
  const ans = fromDigits(sorted);
  return {
    kind: 'input', text: `בנו את המספר ה${big ? 'גדול' : 'קטן'} ביותר מהספרות ${ds.join(', ')} (כל ספרה פעם אחת).`, answer: ans,
    hint: big ? 'שימו את הספרה הגדולה ביותר במקום האלפים.' : 'במקום האלפים שמים את הספרה הקטנה ביותר, אבל לא 0!',
    explain: [big ? 'מסדרים את הספרות מהגדולה לקטנה.' : 'מסדרים מהקטנה לגדולה. מספר בן 4 ספרות לא מתחיל ב־0.', `המספר: ${fmt(ans)}.`],
  };
}

function gHowManyUnits() {
  const hundreds = chance(0.5);
  const n = hundreds ? rnd(11, 99) * 100 : rnd(11, 99) * 10 + (chance(0.5) ? rnd(1, 9) * 100 : 0);
  const unit = hundreds ? 100 : 10;
  const ans = Math.floor(n / unit);
  const name = hundreds ? 'מאות' : 'עשרות';
  return {
    kind: 'choice', text: `כמה ${name} יש בסך הכול במספר ${fmt(n)}?`, options: options(ans, [digit(n, hundreds ? 2 : 1), ans * 10, Math.floor(ans / 10)]), answer: ans,
    hint: `לא רק הספרה במקום ה${name}! כמה פעמים ${unit} נכנס ב־${fmt(n)}?`,
    explain: [`${L(`${fmt(n)} = ${ans} × ${unit}`)}.`, `לכן יש ${ans} ${name} בסך הכול.`],
  };
}

// ---------- WORLD 2: number line & sequences ----------
function seqExplain(vals, step) {
  const sign = step > 0 ? '+' : MINUS;
  return [`בכל צעד ${step > 0 ? 'מוסיפים' : 'מורידים'} ${fmt(Math.abs(step))}.`, `הסדרה המלאה: ${L(vals.map(fmt).join(', '))}.`, `הכלל: ${L(`${sign}${fmt(Math.abs(step))}`)}`];
}

function gSequence(lvl) {
  let vals, step, explain, hint;
  if (lvl === 3 && chance(0.35)) {
    const start = rnd(1, 20) * 5, inc = pick([5, 10, 25]);
    vals = [start]; for (let i = 1; i < 5; i++) vals.push(vals[i - 1] + inc * i);
    hint = 'הסתכלו על ההפרשים בין המספרים. הם לא קבועים!';
    explain = [`ההפרשים גדלים: ${L([1, 2, 3, 4].map(i => `+${inc * i}`).join(', '))}.`, `הסדרה המלאה: ${L(vals.map(fmt).join(', '))}.`];
  } else {
    step = lvl === 1 ? pick([2, 5, 10, 100]) : lvl === 2 ? pick([25, 50, 200, 250, 500, 1000]) : pick([25, 125, 250, 500, 1000]);
    const down = lvl === 1 ? chance(0.2) : chance(0.5);
    if (down) step = -step;
    const lo = Math.max(0, -step * 4), hi = 10000 - Math.max(0, step * 4);
    const unit = Math.abs(step) >= 100 ? 100 : Math.abs(step) >= 10 ? 10 : 1;
    const start = Math.round(rnd(lo, Math.min(hi, lvl === 1 ? 2000 : 9000)) / unit) * unit;
    vals = [0, 1, 2, 3, 4].map(i => start + step * i);
    hint = 'בדקו בכמה גדל או קטן כל מספר לעומת המספר שלפניו.';
    explain = seqExplain(vals, step);
  }
  const miss = lvl === 1 ? rnd(2, 4) : rnd(0, 4);
  const seq = vals.map((v, i) => (i === miss ? '?' : fmt(v)));
  return { kind: 'input', text: 'איזה מספר חסר בסדרה?', seq, expr: seq.join(', '), answer: vals[miss], hint, explain };
}

function gRule(lvl) {
  const step = pick(lvl === 2 ? [25, 50, 200, 250] : [125, 250, 500, 1000]) * (chance(0.5) ? 1 : -1);
  const start = Math.round(rnd(step < 0 ? -step * 4 : 0, 9000 - Math.max(0, step * 4)) / 25) * 25;
  const vals = [0, 1, 2, 3, 4].map(i => start + step * i);
  const a = Math.abs(step);
  const ans = `${step > 0 ? '+' : MINUS}${fmt(a)}`;
  const cands = [`${step > 0 ? MINUS : '+'}${fmt(a)}`, `${step > 0 ? '+' : MINUS}${fmt(a * 10)}`, `${step > 0 ? '+' : MINUS}${fmt(a * 2)}`, `${step > 0 ? '+' : MINUS}${fmt(a / 5 >= 1 ? a / 5 : a + 5)}`];
  return {
    kind: 'choice', ltrOptions: true, text: 'מה הכלל של הסדרה?', seq: vals.map(fmt), expr: vals.map(fmt).join(', '),
    options: options(ans, cands), answer: ans,
    hint: 'חשבו את ההפרש בין שני מספרים צמודים. הסדרה עולה או יורדת?',
    explain: seqExplain(vals, step),
  };
}

function lineSpec(lvl) {
  if (lvl === 1) {
    const s = pick([10, 100]);
    return { a: s === 10 ? rnd(0, 90) * 10 : rnd(0, 9) * 1000, s, k: 10, labels: [0, 5, 10] };
  }
  if (lvl === 2) { const s = pick([25, 50, 200, 250]); const k = pick([4, 5, 8, 10]); const a = rnd(0, Math.floor((10000 - s * k) / 1000)) * 1000; return { a, s, k, labels: [0, k] }; }
  const s = pick([20, 250, 500]); const k = pick([4, 6, 8]);
  let a = rnd(0, Math.floor((10000 - s * k) / 1000)) * 1000 + (s === 20 ? rnd(1, 9) * 100 : 0);
  if (a + s * k > 10000) a -= 1000;
  return { a, s, k, labels: [0, k] };
}

function lineExplain({ a, s, k }, i) {
  const b = a + s * k, v = a + s * i;
  return [
    `מ־${fmt(a)} עד ${fmt(b)} יש ${fmt(b - a)}, מחולק ל־${k} קפיצות שוות.`,
    `כל קפיצה: ${L(`${fmt(b - a)} : ${k} = ${fmt(s)}`)}.`,
    `${i} קפיצות אחרי ${fmt(a)}: ${L(`${fmt(a)} + ${i} × ${fmt(s)} = ${fmt(v)}`)}.`,
  ];
}

function gLineRead(lvl) {
  const sp = lineSpec(lvl);
  let i; do { i = rnd(1, sp.k - 1); } while (sp.labels.includes(i));
  const v = sp.a + sp.s * i;
  return {
    kind: lvl === 1 ? 'choice' : 'input', text: 'איזה מספר מסמן החץ על ישר המספרים?',
    line: { ...sp, mark: i }, answer: v,
    options: lvl === 1 ? options(v, [v + sp.s, v - sp.s, sp.a + i, v + sp.s * 2]) : undefined,
    hint: 'קודם בדקו כמה שווה כל קפיצה בין שני סימונים.',
    explain: lineExplain(sp, i),
  };
}

function gLineTap(lvl) {
  const sp = lineSpec(lvl);
  let i; do { i = rnd(1, sp.k - 1); } while (sp.labels.includes(i));
  const v = sp.a + sp.s * i;
  return {
    kind: 'tapline', text: `הקישו על המקום של ${fmt(v)} בישר המספרים`, line: { ...sp, mark: null }, answer: i,
    hint: 'בדקו כמה שווה כל קפיצה, ואז ספרו קפיצות מהמספר הקטן.',
    explain: lineExplain(sp, i),
  };
}

function gJumps(lvl) {
  const s = pick(lvl === 2 ? [50, 100, 250] : [125, 250, 500]);
  const n = rnd(3, 6);
  const a = rnd(1, 5) * 500;
  const back = lvl === 3 && chance(0.5);
  const ans = back ? a + 4000 - s * n : a + s * n;
  const start = back ? a + 4000 : a;
  return {
    kind: 'input', text: `על ישר המספרים מתחילים ב־${fmt(start)} וקופצים ${n} קפיצות של ${fmt(s)} ${back ? 'אחורה' : 'קדימה'}. לאיזה מספר מגיעים?`, answer: ans,
    hint: `${n} קפיצות של ${fmt(s)} שוות ל־${L(`${n} × ${fmt(s)}`)}.`,
    explain: [`${L(`${n} × ${fmt(s)} = ${fmt(n * s)}`)}.`, `${L(`${fmt(start)} ${back ? MINUS : '+'} ${fmt(n * s)} = ${fmt(ans)}`)}.`],
  };
}

function gMidpoint() {
  const m = pick([50, 100, 200, 250, 500]);
  const a = rnd(1, 15) * 500;
  const b = a + 2 * m;
  return {
    kind: 'input', text: `איזה מספר נמצא בדיוק באמצע בין ${fmt(a)} ל־${fmt(b)}?`, answer: a + m,
    hint: 'מצאו את המרחק בין המספרים, וחלקו אותו לשניים.',
    explain: [`המרחק: ${L(`${fmt(b)} ${MINUS} ${fmt(a)} = ${fmt(2 * m)}`)}.`, `חצי מהמרחק: ${fmt(m)}.`, `${L(`${fmt(a)} + ${fmt(m)} = ${fmt(a + m)}`)}.`],
  };
}

// ---------- WORLD 3: addition & subtraction ----------
const UNIT_NAME = { 10: 'עשרות', 100: 'מאות', 1000: 'אלפים' };

function roundUnit(a, b) {
  for (const u of [1000, 100, 10]) if (a % u === 0 && b % u === 0) return u;
  return 0;
}

function explainRound(a, b, op) {
  const u = roundUnit(a, b);
  const r = op === '+' ? a + b : a - b;
  if (!u) return null;
  return [`חושבים ב${UNIT_NAME[u]}: ${L(`${a / u} ${op} ${b / u} = ${r / u}`)} ${UNIT_NAME[u]}.`, `${L(`${fmt(a)} ${op} ${fmt(b)} = ${fmt(r)}`)}`];
}

function explainAdd(a, b) {
  const round = explainRound(a, b, '+'); if (round) return round;
  const steps = [];
  const len = Math.max(String(a).length, String(b).length);
  let carry = 0;
  for (let p = 0; p < len; p++) {
    const da = digit(a, p), db = digit(b, p), s = da + db + carry;
    let line = `${PLACE[p]}: ${L(`${da} + ${db}${carry ? ' + 1' : ''} = ${s}`)}`;
    if (s >= 10) line += `, כותבים ${s % 10} ומעבירים 1 ל${PLACE[p + 1]}`;
    steps.push(line + '.');
    carry = s >= 10 ? 1 : 0;
  }
  if (carry) steps.push(`${PLACE[len]}: 1.`);
  steps.push(`התשובה: ${L(`${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}`)}`);
  return steps;
}

function explainSub(a, b) {
  const round = explainRound(a, b, MINUS); if (round) return round;
  const len = String(a).length, lenB = String(b).length;
  const d = Array.from({ length: len + 1 }, (_, p) => digit(a, p));
  const steps = [];
  for (let p = 0; p < len; p++) {
    const db = digit(b, p);
    let note = '';
    if (d[p] < db) {
      let j = p + 1; while (d[j] === 0) j++;
      d[j]--; for (let k = j - 1; k > p; k--) d[k] = 9;
      d[p] += 10;
      note = j === p + 1 ? ` (פורטים 1 מה${PLACE[j]})` : ` (פורטים מה${PLACE[j]}, והאפסים בדרך הופכים ל־9)`;
    }
    if (p >= lenB && !note) { if (p < len - 1 || d[p]) steps.push(`${PLACE[p]}: נשאר ${d[p]}.`); continue; }
    steps.push(`${PLACE[p]}: ${L(`${d[p]} ${MINUS} ${db} = ${d[p] - db}`)}${note}.`);
  }
  steps.push(`בדיקה בחיבור: ${L(`${fmt(a - b)} + ${fmt(b)} = ${fmt(a)}`)}`);
  return steps;
}

function addPair(lvl) {
  if (lvl === 1) {
    return pick([
      () => [rnd(10, 89) * 10, rnd(1, 9) * 10],
      () => [rnd(1, 8) * 100, rnd(1, 8) * 100],
      () => [rnd(1, 6) * 1000, rnd(1, 3) * 1000],
      () => [rnd(1, 8) * 1000 + rnd(1, 9) * 100, rnd(1, 9) * 100],
      () => [rnd(15, 69), rnd(15, 29)],
    ])();
  }
  if (lvl === 2) {
    return pick([
      () => [rnd(120, 680), rnd(120, 319)],
      () => [rnd(1, 8) * 1000 + rnd(1, 9) * 100 + rnd(1, 9) * 10, rnd(1, 9) * 100 + rnd(1, 9) * 10],
      () => [rnd(1, 7) * 1000 + rnd(1, 9) * 100, rnd(1, 9) * 100],
    ])();
  }
  return pick([
    () => [rnd(1200, 5899), rnd(1100, 3999)],
    () => [rnd(2000, 7999), rnd(150, 999)],
  ])();
}

function subPair(lvl) {
  if (lvl === 1) {
    return pick([
      () => { const a = rnd(20, 99) * 10; return [a, rnd(1, a / 10 - 1) * 10]; },
      () => { const a = rnd(3, 9) * 100; return [a, rnd(1, a / 100 - 1) * 100]; },
      () => { const a = rnd(3, 10) * 1000; return [a, rnd(1, a / 1000 - 1) * 1000]; },
      () => { const a = rnd(40, 99); return [a, rnd(11, a - 10)]; },
    ])();
  }
  if (lvl === 2) {
    return pick([
      () => { const a = rnd(400, 999); return [a, rnd(110, a - 100)]; },
      () => { const a = rnd(2, 9) * 1000 + rnd(1, 9) * 100; return [a, rnd(1, 9) * 100 + rnd(1, 9) * 10]; },
    ])();
  }
  return pick([
    () => { const a = rnd(2, 9) * 1000 + rnd(0, 9) * 10 + rnd(0, 9); return [a, rnd(1000, a - 200)]; },
    () => { const a = rnd(2, 10) * 1000; return [a, rnd(100, a - 100)]; },
    () => { const a = rnd(3000, 9999); return [a, rnd(1000, a - 500)]; },
  ])();
}

function gAdd(lvl) {
  const [a, b] = addPair(lvl);
  const ans = a + b, u = roundUnit(a, b) || 1;
  return {
    kind: lvl === 1 && chance(0.4) ? 'choice' : 'input', text: 'פתרו את התרגיל:', expr: `${fmt(a)} + ${fmt(b)} = ?`, answer: ans,
    options: options(ans, [ans + u, ans - u, ans + 10 * u, ans - 10 * u]),
    hint: roundUnit(a, b) ? `חשבו ב${UNIT_NAME[roundUnit(a, b)]}, כמו מספרים קטנים.` : 'חברו במאונך: יחידות עם יחידות, עשרות עם עשרות. אל תשכחו להעביר!',
    explain: explainAdd(a, b),
  };
}

function gSub(lvl) {
  const [a, b] = subPair(lvl);
  const ans = a - b, u = roundUnit(a, b) || 1;
  return {
    kind: lvl === 1 && chance(0.4) ? 'choice' : 'input', text: 'פתרו את התרגיל:', expr: `${fmt(a)} ${MINUS} ${fmt(b)} = ?`, answer: ans,
    options: options(ans, [ans + u, ans - u, ans + 10 * u, a + b]),
    hint: roundUnit(a, b) ? `חשבו ב${UNIT_NAME[roundUnit(a, b)]}, כמו מספרים קטנים.` : 'חסרו במאונך מהיחידות. אם הספרה למעלה קטנה יותר, פורטים מהמקום הבא.',
    explain: explainSub(a, b),
  };
}

function gMissingAddend(lvl) {
  const total = lvl === 2 ? pick([100, 500, 1000]) : pick([1000, 2000, 5000, 10000]);
  const b = lvl === 2 ? rnd(1, total / 10 - 1) * 10 : rnd(110, total - 100);
  const ans = total - b;
  const form = rnd(0, 2);
  const expr = form === 0 ? `? + ${fmt(b)} = ${fmt(total)}` : form === 1 ? `${fmt(b)} + ? = ${fmt(total)}` : `${fmt(total)} ${MINUS} ? = ${fmt(ans)}`;
  const solve = form === 2 ? `${fmt(total)} ${MINUS} ${fmt(ans)} = ${fmt(b)}` : `${fmt(total)} ${MINUS} ${fmt(b)} = ${fmt(ans)}`;
  return {
    kind: 'input', text: 'איזה מספר חסר?', expr, answer: form === 2 ? b : ans,
    hint: 'מוצאים מספר חסר בעזרת הפעולה ההפוכה.',
    explain: [form === 2 ? 'כדי למצוא את המספר שהורידו, מחסרים את התוצאה מהמספר הגדול.' : 'כדי למצוא מחובר חסר, מחסרים מהסכום את המחובר הידוע.', `${L(solve)}.`],
  };
}

const ADD_STORIES = [
  (a, b) => `לסרטון של נועם היו ${fmt(a)} צפיות בבוקר. עד הערב נוספו עוד ${fmt(b)} צפיות. כמה צפיות יש לסרטון בערב?`,
  (a, b) => `בשלב הראשון נועם צבר ${fmt(a)} נקודות, ובשלב השני ${fmt(b)} נקודות. כמה נקודות צבר בסך הכול?`,
  (a, b) => `לערוץ היו ${fmt(a)} מנויים. אחרי סרטון חדש הצטרפו עוד ${fmt(b)} מנויים. כמה מנויים יש עכשיו?`,
  (a, b) => `במשחק בנו ${fmt(a)} בלוקים של אבן ועוד ${fmt(b)} בלוקים של עץ. כמה בלוקים בנו בסך הכול?`,
];
const SUB_STORIES = [
  (a, b) => `לנועם היו ${fmt(a)} מטבעות במשחק. הוא קנה סקין חדש ב־${fmt(b)} מטבעות. כמה מטבעות נשארו לו?`,
  (a, b) => `בבאטל רויאל השתתפו ${fmt(a)} שחקנים. ${fmt(b)} שחקנים יצאו מהמשחק. כמה שחקנים נשארו?`,
  (a, b) => `המטרה של הערוץ היא ${fmt(a)} מנויים. כרגע יש ${fmt(b)} מנויים. כמה מנויים חסרים כדי להגיע למטרה?`,
  (a, b) => `בעולם הבלוקים היו ${fmt(a)} בלוקים. פיצוץ הרס ${fmt(b)} בלוקים. כמה בלוקים נשארו?`,
];

function gAddSubWord(lvl) {
  if (lvl === 3 && chance(0.5)) {
    const a = rnd(12, 60) * 50, b = rnd(4, 30) * 25, c = rnd(3, Math.floor((a + b) / 50) - 1) * 50;
    const ans = a + b - c;
    return {
      kind: 'input', text: `לנועם היו ${fmt(a)} יהלומים. הוא קיבל ${fmt(b)} יהלומים בפרס, ואחר כך קנה חרב ב־${fmt(c)} יהלומים. כמה יהלומים יש לו עכשיו?`, answer: ans,
      hint: 'זו בעיה בשני שלבים: קודם מה קיבל, אחר כך מה הוציא.',
      explain: [`שלב 1 (קיבל): ${L(`${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}`)}.`, `שלב 2 (קנה): ${L(`${fmt(a + b)} ${MINUS} ${fmt(c)} = ${fmt(ans)}`)}.`],
    };
  }
  if (chance(0.5)) {
    const [a, b] = addPair(lvl);
    return { kind: 'input', text: pick(ADD_STORIES)(a, b), answer: a + b, hint: 'המספר גדל, לכן זה חיבור.', explain: [`זה חיבור: ${L(`${fmt(a)} + ${fmt(b)} = ?`)}`, ...explainAdd(a, b)] };
  }
  const [a, b] = subPair(lvl);
  return { kind: 'input', text: pick(SUB_STORIES)(a, b), answer: a - b, hint: 'מחפשים כמה נשאר או כמה חסר, לכן זה חיסור.', explain: [`זה חיסור: ${L(`${fmt(a)} ${MINUS} ${fmt(b)} = ?`)}`, ...explainSub(a, b)] };
}

// ---------- WORLD 4: multiplication & division ----------
function timesExplain(a, b) {
  const p = a * b;
  if (a === 10 || b === 10) return [`כופלים ב־10: מוסיפים 0 בסוף המספר.`, `${L(`${a} × ${b} = ${p}`)}`];
  if (a === 1 || b === 1) return [`כל מספר כפול 1 שווה לעצמו.`, `${L(`${a} × ${b} = ${p}`)}`];
  if (a === 9 || b === 9) { const o = a === 9 ? b : a; return [`טריק ה־9: ${L(`9 × ${o} = 10 × ${o} ${MINUS} ${o}`)}`, `${L(`${10 * o} ${MINUS} ${o} = ${p}`)}`]; }
  const [x, y] = a >= b ? [a, b] : [b, a];
  if (y <= 5) return [`${L(`${x} × ${y}`)} זה ${y} פעמים ${x}: ${L(Array(y).fill(x).join(' + ') + ` = ${p}`)}`];
  return [`מפרקים: ${L(`${x} × ${y} = ${x} × 5 + ${x} × ${y - 5}`)}`, `${L(`${x * 5} + ${x * (y - 5)} = ${p}`)}`];
}

function tablePair(lvl) {
  const a = lvl === 1 ? pick([2, 3, 4, 5, 10]) : pick([6, 7, 8, 9, 6, 7, 8, 9, 4]);
  const b = lvl === 1 ? rnd(1, 10) : rnd(3, 10);
  return chance(0.5) ? [a, b] : [b, a];
}

function gTimes(lvl) {
  const [a, b] = tablePair(lvl);
  const p = a * b;
  return {
    kind: lvl === 1 && chance(0.5) ? 'choice' : 'input', text: 'פתרו:', expr: `${a} × ${b} = ?`, answer: p,
    options: options(p, [a * (b + 1), a * (b - 1), (a + 1) * b, a + b]),
    hint: 'אפשר לפרק לתרגילים קלים יותר, למשל כפל ב־5 ועוד קצת.',
    explain: timesExplain(a, b),
  };
}

function gDiv(lvl) {
  const [a, b] = tablePair(lvl);
  const n = a * b;
  return {
    kind: lvl === 1 && chance(0.5) ? 'choice' : 'input', text: 'פתרו:', expr: `${n} : ${a} = ?`, answer: b,
    options: options(b, [b + 1, b - 1, a, b + 2]),
    hint: `חשבו: ${a} כפול כמה שווה ${n}?`,
    explain: [`חילוק הוא ההפך של כפל: ${L(`${a} × ? = ${n}`)}`, `${L(`${a} × ${b} = ${n}`)}, לכן ${L(`${n} : ${a} = ${b}`)}`],
  };
}

function gMissingFactor(lvl) {
  const [a, b] = tablePair(Math.max(2, lvl));
  const first = chance(0.5);
  const expr = first ? `? × ${b} = ${a * b}` : `${a} × ? = ${a * b}`;
  const ans = first ? a : b, known = first ? b : a;
  return {
    kind: 'input', text: 'איזה מספר חסר?', expr, answer: ans,
    hint: 'גורם חסר מוצאים בעזרת חילוק.',
    explain: [`${L(`${a * b} : ${known} = ${ans}`)}`, `בדיקה: ${L(`${a} × ${b} = ${a * b}`)}`],
  };
}

function gTensMul(lvl) {
  const a = rnd(2, 9), b = rnd(2, 9);
  const u = lvl === 2 ? 10 : pick([10, 100]);
  const big = b * u;
  const p = a * big;
  const expr = chance(0.5) ? `${fmt(big)} × ${a} = ?` : `${a} × ${fmt(big)} = ?`;
  return {
    kind: 'input', text: 'פתרו:', expr, answer: p,
    hint: `${fmt(big)} זה ${b} ${UNIT_NAME[u]}. כמה זה ${a} פעמים ${b} ${UNIT_NAME[u]}?`,
    explain: [`${fmt(big)} = ${b} ${UNIT_NAME[u]}.`, `${L(`${a} × ${b} = ${a * b}`)}, כלומר ${a * b} ${UNIT_NAME[u]}.`, `${a * b} ${UNIT_NAME[u]} = ${fmt(p)}`],
  };
}

function gTensDiv(lvl) {
  const a = rnd(2, 9), q = rnd(2, 9);
  const u = lvl === 2 ? 10 : pick([10, 100]);
  const n = a * q * u;
  return {
    kind: 'input', text: 'פתרו:', expr: `${fmt(n)} : ${a} = ?`, answer: q * u,
    hint: `${fmt(n)} זה ${a * q} ${UNIT_NAME[u]}. חלקו את ה${UNIT_NAME[u]} ל־${a}.`,
    explain: [`${fmt(n)} = ${a * q} ${UNIT_NAME[u]}.`, `${L(`${a * q} : ${a} = ${q}`)}, כלומר ${q} ${UNIT_NAME[u]}.`, `${L(`${fmt(n)} : ${a} = ${fmt(q * u)}`)}`],
  };
}

function gMissingTens() {
  const a = rnd(2, 9), b = rnd(2, 9), u = pick([10, 100]);
  const big = b * u, p = a * big;
  return {
    kind: 'input', text: 'איזה מספר חסר?', expr: `? × ${fmt(big)} = ${fmt(p)}`, answer: a,
    hint: `חשבו ב${UNIT_NAME[u]}: כמה פעמים ${b} ${UNIT_NAME[u]} נותן ${a * b} ${UNIT_NAME[u]}?`,
    explain: [`${fmt(p)} = ${a * b} ${UNIT_NAME[u]}, ו־${fmt(big)} = ${b} ${UNIT_NAME[u]}.`, `${L(`${a * b} : ${b} = ${a}`)}`],
  };
}

function gCommutative() {
  const [a, b] = [rnd(3, 9), rnd(3, 9)];
  if (a === b) return gCommutative();
  return {
    kind: 'choice', ltrOptions: true, text: `איזה תרגיל שווה ל־${L(`${a} × ${b}`)}?`,
    options: shuffle([`${b} × ${a}`, `${a} + ${b}`, `${a} × ${a}`, `${b} + ${b}`]), answer: `${b} × ${a}`,
    hint: 'בכפל אפשר להחליף את הסדר של המספרים.',
    explain: ['חוק החילוף: בכפל, החלפת הסדר לא משנה את התוצאה.', `${L(`${a} × ${b} = ${b} × ${a} = ${a * b}`)}`],
  };
}

function gCompareMul() {
  let a, b, c, d;
  do { [a, b, c, d] = [rnd(3, 9), rnd(3, 9), rnd(3, 9), rnd(3, 9)]; } while (Math.abs(a * b - c * d) > 8 || (a === c && b === d) || (a === d && b === c && chance(0.6)));
  const l = a * b, r = c * d;
  return {
    kind: 'compare', text: 'בחרו את הסימן המתאים:', left: `${a} × ${b}`, right: `${c} × ${d}`, answer: l > r ? '>' : l < r ? '<' : '=',
    hint: 'חשבו כל צד בנפרד, ואז השוו.',
    explain: [`${L(`${a} × ${b} = ${l}`)}`, `${L(`${c} × ${d} = ${r}`)}`, `לכן ${L(`${a} × ${b} ${l > r ? '>' : l < r ? '<' : '='} ${c} × ${d}`)}`],
  };
}

function gMulWord(lvl) {
  const tens = lvl === 3 && chance(0.5);
  if (lvl === 3 && chance(0.3)) {
    const a = rnd(4, 9), b = rnd(3, 9), c = rnd(2, a * b - 5);
    return {
      kind: 'input', text: `נועם קנה ${b} חבילות קלפים. בכל חבילה ${a} קלפים. הוא נתן לאחיו ${c} קלפים. כמה קלפים נשארו לנועם?`, answer: a * b - c,
      hint: 'שני שלבים: קודם כמה קלפים קנה (כפל), אחר כך כמה נשארו (חיסור).',
      explain: [`${L(`${b} × ${a} = ${a * b}`)} קלפים.`, `${L(`${a * b} ${MINUS} ${c} = ${a * b - c}`)}`],
    };
  }
  const [x, y] = tablePair(lvl === 1 ? 1 : 2);
  const a = tens ? x * 10 : x;
  if (chance(0.5)) {
    const story = pick([
      () => `בכל קבוצה בארנה יש ${y} שחקנים. יש ${a} קבוצות. כמה שחקנים יש בסך הכול?`,
      () => `כל סרטון של נועם נמשך ${y} דקות. הוא העלה ${a} סרטונים. כמה דקות של סרטונים העלה?`,
      () => `בכל תיבת אוצר יש ${a} מטבעות. נועם פתח ${y} תיבות. כמה מטבעות מצא?`,
    ])();
    return { kind: 'input', text: story, answer: a * y, hint: 'קבוצות שוות שחוזרות כמה פעמים, לכן זה כפל.', explain: [`${L(`${fmt(a)} × ${y} = ${fmt(a * y)}`)}`] };
  }
  const total = a * y;
  const story = pick([
    () => `נועם אסף ${fmt(total)} יהלומים וחילק אותם שווה בשווה בין ${y} חברים. כמה יהלומים קיבל כל חבר?`,
    () => `בתיבה יש ${fmt(total)} מטבעות. מסדרים אותם בערימות של ${y}. כמה ערימות יהיו?`,
    () => `${fmt(total)} שחקנים נכנסו לארנה והתחלקו ל־${y} קבוצות שוות. כמה שחקנים יש בכל קבוצה?`,
  ])();
  return { kind: 'input', text: story, answer: a, hint: 'מחלקים לקבוצות שוות, לכן זה חילוק.', explain: [`${L(`${fmt(total)} : ${y} = ${fmt(a)}`)}`, `בדיקה: ${L(`${fmt(a)} × ${y} = ${fmt(total)}`)}`] };
}

// ---------- WORLD 5: geometry ----------
const POLY = { 3: 'משולש', 4: 'מרובע', 5: 'מחומש', 6: 'משושה', 7: 'משובע', 8: 'מתומן' };

function polygonPoints(n, irregular) {
  const rot = Math.random() * Math.PI * 2;
  return Array.from({ length: n }, (_, i) => {
    const ang = rot + (i * 2 * Math.PI) / n + (irregular ? (Math.random() - 0.5) * (Math.PI / n) * 0.7 : 0);
    const r = irregular ? 0.72 + Math.random() * 0.28 : 1;
    return [Math.cos(ang) * r * 100, Math.sin(ang) * r * 100];
  });
}

function gPolyName(lvl) {
  const n = rnd(3, lvl === 1 ? 6 : 8);
  const names = Object.values(POLY);
  return {
    kind: 'choice', text: 'איך נקרא המצולע?', shape: { pts: polygonPoints(n, lvl > 1), dots: lvl === 1 },
    options: options(POLY[n], shuffle(names)), answer: POLY[n],
    hint: 'ספרו את הצלעות או את הקודקודים.',
    explain: [`לצורה יש ${n} צלעות ו־${n} קודקודים.`, `מצולע עם ${n} צלעות נקרא ${POLY[n]}.`],
  };
}

function gPolyCount(lvl) {
  const n = rnd(3, lvl === 1 ? 6 : 8);
  const what = chance(0.5) ? 'קודקודים' : 'צלעות';
  return {
    kind: 'input', text: `כמה ${what} יש לצורה?`, shape: { pts: polygonPoints(n, true), dots: what === 'קודקודים' }, answer: n,
    hint: what === 'קודקודים' ? 'קודקוד הוא נקודה שבה שתי צלעות נפגשות.' : 'צלע היא קו ישר בשפה של הצורה.',
    explain: [`ספרנו ${n} ${what}.`, `במצולע מספר הצלעות שווה למספר הקודקודים. זה ${POLY[n]}.`],
  };
}

function gPolyFacts(lvl) {
  const n = rnd(3, 8);
  if (chance(0.5)) {
    const what = chance(0.5) ? 'קודקודים' : 'צלעות';
    return {
      kind: 'input', text: `כמה ${what} יש ל${POLY[n]}?`, answer: n,
      hint: 'השם של המצולע רומז על המספר: מחומש = 5, משושה = 6...',
      explain: [`ל${POLY[n]} יש ${n} צלעות ו־${n} קודקודים.`],
    };
  }
  return {
    kind: 'choice', text: `למצולע יש ${n} ${chance(0.5) ? 'צלעות' : 'קודקודים'}. איך הוא נקרא?`,
    options: options(POLY[n], shuffle(Object.values(POLY))), answer: POLY[n],
    hint: 'משולש 3, מרובע 4, מחומש 5, משושה 6, משובע 7, מתומן 8.',
    explain: [`מצולע עם ${n} צלעות וקודקודים נקרא ${POLY[n]}.`],
  };
}

function gPolyTotal() {
  const [a, b] = shuffle([3, 4, 5, 6, 8]).slice(0, 2);
  const k = rnd(2, 4);
  if (chance(0.5)) {
    return {
      kind: 'input', text: `כמה קודקודים יש בסך הכול ל${POLY[a]} ול${POLY[b]}?`, answer: a + b,
      hint: 'כמה קודקודים יש לכל צורה? חברו.',
      explain: [`ל${POLY[a]} ${a} קודקודים, ול${POLY[b]} ${b}.`, `${L(`${a} + ${b} = ${a + b}`)}`],
    };
  }
  return {
    kind: 'input', text: `נועם צייר ${k} ${a === 3 ? 'משולשים' : a === 4 ? 'מרובעים' : a === 5 ? 'מחומשים' : a === 6 ? 'משושים' : 'מתומנים'}. כמה צלעות צייר בסך הכול?`, answer: a * k,
    hint: 'כמה צלעות יש לכל צורה? כמה צורות יש?',
    explain: [`לכל ${POLY[a]} ${a} צלעות.`, `${L(`${k} × ${a} = ${a * k}`)}`],
  };
}

function gRuler(lvl) {
  if (lvl === 3 && chance(0.6)) {
    const s1 = rnd(0, 3), l1 = rnd(6, 11), s2 = rnd(1, 4), l2 = rnd(3, l1 - 2);
    return {
      kind: 'input', unit: 'ס״מ', text: 'בכמה סנטימטרים העיפרון האדום ארוך יותר מהעיפרון הכחול?', answer: l1 - l2,
      ruler: { items: [{ from: s1, to: s1 + l1, color: '#e0283b' }, { from: s2, to: s2 + l2, color: '#2f6fe0' }] },
      hint: 'מדדו כל עיפרון לפי נקודת ההתחלה והסוף שלו, ואז מצאו את ההפרש.',
      explain: [`אדום: ${L(`${s1 + l1} ${MINUS} ${s1} = ${l1}`)} ס״מ.`, `כחול: ${L(`${s2 + l2} ${MINUS} ${s2} = ${l2}`)} ס״מ.`, `ההפרש: ${L(`${l1} ${MINUS} ${l2} = ${l1 - l2}`)} ס״מ.`],
    };
  }
  const start = lvl === 1 ? 0 : rnd(1, 5);
  const len = rnd(lvl === 1 ? 2 : 3, Math.min(14 - start, 12));
  return {
    kind: 'input', unit: 'ס״מ', text: 'מה אורך העיפרון בסנטימטרים?', answer: len,
    ruler: { items: [{ from: start, to: start + len, color: pick(['#f59e0b', '#22b14c', '#7c3aed']) }] },
    hint: start ? 'העיפרון לא מתחיל ב־0! מחסרים: סוף פחות התחלה.' : 'העיפרון מתחיל ב־0, אז קוראים את המספר בסוף שלו.',
    explain: start
      ? [`העיפרון מתחיל ב־${start} ומסתיים ב־${start + len}.`, `${L(`${start + len} ${MINUS} ${start} = ${len}`)}, לכן אורכו ${len} ס״מ.`]
      : [`העיפרון מתחיל ב־0 ומסתיים ב־${len}, לכן אורכו ${len} ס״מ.`],
  };
}

function gCmDistance() {
  const a = rnd(1, 7), b = a + rnd(3, 8);
  return {
    kind: 'input', unit: 'ס״מ', text: `על סרגל, נקודה א נמצאת ב־${a} ס״מ ונקודה ב נמצאת ב־${b} ס״מ. מה המרחק ביניהן?`, answer: b - a,
    hint: 'המרחק הוא ההפרש בין שני המספרים.',
    explain: [`${L(`${b} ${MINUS} ${a} = ${b - a}`)}, לכן המרחק ${b - a} ס״מ.`],
  };
}

const TRI = {
  equi: [[0, 87], [100, 87], [50, 0]],
  iso: [[0, 100], [60, 100], [30, 0]],
  scal: [[0, 80], [130, 80], [40, 0]],
  right: [[0, 0], [0, 90], [120, 90]],
  obtuse: [[0, 70], [100, 70], [-60, 0]],
  acute: [[0, 90], [110, 90], [45, 0]],
};
const SIDE_NAMES = { equi: 'שווה צלעות', iso: 'שווה שוקיים', scal: 'שונה צלעות' };
const ANGLE_NAMES = { acute: 'חד זווית', right: 'ישר זווית', obtuse: 'קהה זווית' };

function transformTri(pts, rotate) {
  const flip = chance(0.5) ? -1 : 1;
  const ang = rotate ? (Math.random() - 0.5) * 1.2 : 0;
  return pts.map(([x, y]) => { x *= flip; return [x * Math.cos(ang) - y * Math.sin(ang), x * Math.sin(ang) + y * Math.cos(ang)]; });
}
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);

function gTriSides(lvl) {
  const type = pick(['equi', 'iso', 'scal']);
  const pts = transformTri(TRI[type], lvl === 3);
  const f = pick([0.05, 0.1]);
  const sides = pts.map((p, i) => Math.max(2, Math.round(dist(p, pts[(i + 1) % 3]) * f)));
  if (lvl === 3 && chance(0.5)) {
    return {
      kind: 'choice', text: `למשולש יש צלעות באורך ${shuffle(sides).join(', ')} ס״מ. איזה משולש זה?`,
      options: shuffle(Object.values(SIDE_NAMES)), answer: SIDE_NAMES[type],
      hint: 'בדקו כמה צלעות שוות זו לזו.',
      explain: [triSideExplain(type)],
    };
  }
  return {
    kind: 'choice', text: 'איזה משולש זה לפי הצלעות? (האורכים בס״מ)',
    shape: { pts, sideLabels: sides },
    options: shuffle(Object.values(SIDE_NAMES)), answer: SIDE_NAMES[type],
    hint: 'השוו את אורכי הצלעות: כולן שוות? רק שתיים? אף אחת?',
    explain: [triSideExplain(type)],
  };
}

function triSideExplain(type) {
  return type === 'equi' ? 'כל שלוש הצלעות שוות, לכן זה משולש שווה צלעות.'
    : type === 'iso' ? 'שתי צלעות שוות (השוקיים), לכן זה משולש שווה שוקיים.'
      : 'כל הצלעות באורכים שונים, לכן זה משולש שונה צלעות.';
}

function gTriAngles(lvl) {
  const type = pick(['acute', 'right', 'obtuse']);
  const pts = transformTri(TRI[type], lvl === 3);
  const mark = type === 'right' ? { right: 1 } : type === 'obtuse' ? { obtuse: 0 } : { acute: true };
  return {
    kind: 'choice', text: 'איזה משולש זה לפי הזוויות?',
    shape: { pts, ...mark },
    options: shuffle(Object.values(ANGLE_NAMES)), answer: ANGLE_NAMES[type],
    hint: 'חפשו זווית ישרה (כמו פינה של דף) או זווית שפתוחה יותר ממנה.',
    explain: [type === 'right' ? 'יש למשולש זווית ישרה אחת (מסומנת בריבוע), לכן הוא ישר זווית.'
      : type === 'obtuse' ? 'יש למשולש זווית אחת גדולה מזווית ישרה (זווית קהה), לכן הוא קהה זווית.'
        : 'כל שלוש הזוויות קטנות מזווית ישרה (זוויות חדות), לכן הוא חד זווית.'],
  };
}

const GEO_TF = [
  ['יכול להיות משולש עם שתי זוויות ישרות.', false, 'אם יש שתי זוויות ישרות, הצלעות לא ייפגשו ולא ייסגר משולש.'],
  ['כל משולש שווה צלעות הוא גם משולש שווה שוקיים.', true, 'במשולש שווה צלעות יש (לפחות) שתי צלעות שוות, לכן הוא גם שווה שוקיים.'],
  ['במשולש ישר זווית יכולה להיות גם זווית קהה.', false, 'זווית ישרה וזווית קהה יחד כבר גדולות מדי. שתי הזוויות האחרות במשולש ישר זווית חדות.'],
  ['למשולש יש 3 קודקודים ו־3 צלעות.', true, 'משולש: 3 צלעות ו־3 קודקודים.'],
  ['יכול להיות משולש שהוא גם ישר זווית וגם שווה שוקיים.', true, 'כן! למשל חצי ריבוע שנחתך באלכסון.'],
  ['במשולש חד זווית כל הזוויות חדות.', true, 'זו בדיוק ההגדרה של משולש חד זווית.'],
  ['משולש שווה צלעות יכול להיות קהה זווית.', false, 'במשולש שווה צלעות כל הזוויות שוות וחדות.'],
  ['למתומן יש 8 קודקודים.', true, 'מתומן: 8 צלעות ו־8 קודקודים.'],
  ['למשושה יש 5 צלעות.', false, 'למשושה יש 6 צלעות. למחומש יש 5.'],
  ['לכל מצולע יש מספר שווה של צלעות ושל קודקודים.', true, 'בכל מצולע מספר הצלעות שווה למספר הקודקודים.'],
  ['עיגול הוא מצולע.', false, 'מצולע בנוי מקווים ישרים בלבד. לעיגול אין צלעות ישרות.'],
];

function gGeoTF() {
  const [text, ok, why] = pick(GEO_TF);
  const ans = ok ? 'נכון' : 'לא נכון';
  return { kind: 'choice', text: `נכון או לא נכון? ${text}`, options: ['נכון', 'לא נכון'], answer: ans, hint: 'נסו לדמיין או לצייר את הצורה.', explain: [why] };
}

// ---------- level composition ----------
const GENS = {
  numbers: { 1: [gPlaceValue, gDigitAt, gWordsToNumber, gCompare, gExpanded, gNeighbors], 2: [gPlaceValue, gWordsToNumber, gNumberToWords, gCompare, gExpanded, gNeighbors, gOrder], 3: [gCompare, gExpanded, gBuildFromDigits, gHowManyUnits, gOrder, gNumberToWords, gNeighbors] },
  line: { 1: [gSequence, gLineRead, gLineTap, gSequence], 2: [gSequence, gRule, gLineRead, gLineTap, gJumps], 3: [gSequence, gRule, gLineRead, gLineTap, gMidpoint, gJumps] },
  addsub: { 1: [gAdd, gSub, gAdd, gSub, gAddSubWord], 2: [gAdd, gSub, gMissingAddend, gAddSubWord], 3: [gAdd, gSub, gMissingAddend, gAddSubWord, gAddSubWord] },
  muldiv: { 1: [gTimes, gDiv, gTimes, gCommutative, gMulWord], 2: [gTimes, gDiv, gMissingFactor, gTensMul, gTensDiv, gMulWord], 3: [gTensMul, gTensDiv, gMissingTens, gCompareMul, gMulWord, gTimes] },
  geometry: { 1: [gPolyName, gPolyCount, gPolyFacts, gRuler], 2: [gPolyName, gRuler, gCmDistance, gTriSides, gTriAngles, gPolyFacts], 3: [gTriAngles, gTriSides, gRuler, gPolyTotal, gGeoTF, gGeoTF] },
};

const keyOf = q => `${q.text}|${q.expr || ''}|${q.words || ''}|${q.answer}`;

function make(topic, lvl, seen) {
  const gens = GENS[topic][lvl];
  for (let t = 0; t < 25; t++) {
    const q = pick(gens)(lvl);
    const k = keyOf(q);
    if (!seen.has(k)) { seen.add(k); return { ...q, topic, lvl }; }
  }
  return { ...pick(gens)(lvl), topic, lvl };
}

export function buildLevel(worldId, lvl, count = 10) {
  const topic = WORLDS.find(w => w.id === worldId).topic;
  const seen = new Set();
  return Array.from({ length: count }, () => make(topic, lvl, seen));
}

export function buildBoss(count = 12) {
  const seen = new Set();
  const topics = Object.keys(GENS);
  return shuffle(Array.from({ length: count }, (_, i) => make(topics[i % topics.length], i < count / 2 ? 2 : 3, seen)));
}

export function buildExam() {
  const seen = new Set();
  const qs = [];
  for (const topic of Object.keys(GENS)) for (const lvl of [1, 2, 2, 3]) qs.push(make(topic, lvl, seen));
  return qs;
}
