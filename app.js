// אפליקציית אימון מתמטיקה לכיתה ג' — ללא תלות באינטרנט
// יוצר: M365 Copilot

const el = (id) => document.getElementById(id);
const by = (sel) => document.querySelector(sel);

const topicSel = el('topic');
const diffSel = el('difficulty');
const countSel = el('questionCount');
const startBtn = el('startBtn');
const howBtn = el('howBtn');

const quizSec = el('quiz');
const progressBar = el('progressBar');
const scoreBox = el('scoreBox');
const questionText = el('questionText');
const answerArea = el('answerArea');
const keypad = el('keypad');
const checkBtn = el('checkBtn');
const skipBtn = el('skipBtn');
const endBtn = el('endBtn');
const feedback = el('feedback');

const summarySec = el('summary');
const summaryText = el('summaryText');
const againBtn = el('againBtn');
const backBtn = el('backBtn');

const howDialog = el('howDialog');
const badgesBox = el('badges');

let problems = [];
let questions = [];
let index = 0;
let score = 0;
let current = null;

function isNumericQuestion(text) {
  // מזהה תרגילים שהם רק ספרות וסימני חשבון כדי ליישר שמאלה
  const cleaned = text.replace(/[0-9\s\+\-×÷=\?\(\)<>:_,\.]/g, '');
  return cleaned.trim().length === 0;
}

async function loadProblems() {
  try {
    const res = await fetch('problems.json');
    problems = await res.json();
  } catch (e) {
    console.warn('לא נטען קובץ בעיות מילוליות:', e);
    problems = [];
  }
}

function saveBest(topicKey, diff, percent) {
  const key = `best:${topicKey}:${diff}`;
  const current = Number(localStorage.getItem(key) || '0');
  if (percent > current) localStorage.setItem(key, String(percent));
}

function showBadges() {
  badgesBox.innerHTML = '';
  const topics = [
    ['multiplication', 'כפל'],
    ['tenThousands', 'תחום הרבבה'],
    ['addSub', 'חיבור/חיסור'],
    ['division', 'חילוק'],
    ['wordProblems', 'בעיות מילוליות'],
  ];
  const diffs = [['easy','קל'],['medium','בינוני'],['hard','מתקדם']];
  topics.forEach(([key, label]) => {
    diffs.forEach(([dkey, dlabel]) => {
      const best = Number(localStorage.getItem(`best:${key}:${dkey}`) || '');
      if (best) {
        const span = document.createElement('span');
        span.className = 'badge';
        span.textContent = `${label} · ${dlabel}: ${best}%`;
        badgesBox.appendChild(span);
      }
    });
  });
}

function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// מחוללי שאלות לפי נושאים
function genMultiplication(diff) {
  let a, b, missing = false;
  if (diff === 'easy') {
    a = rnd(0,5); b = rnd(0,5);
  } else if (diff === 'hard') {
    a = rnd(3,9); b = rnd(3,9); // ברמת מתקדם ללא 10, כולל 3–9
    if (Math.random() < 0.5) missing = true;
  } else {
    a = rnd(0,10); b = rnd(0,10);
  }
  const product = a * b;
  const text = missing ? `__ × ${b} = ${product}` : `${a} × ${b} = ?`;
  return {
    type: 'number', topic: 'multiplication', text, correct: missing ? String(a) : String(product)
  };
}

function genDivision(diff) {
  // חילוק מדויק בלבד (ללא שארית)
  const minF = diff === 'hard' ? 3 : 1;
  const maxF = diff === 'hard' ? 9 : 10; // ברמת מתקדם נמנעים מ-10
  const a = rnd(minF, maxF);
  const b = rnd(minF, maxF);
  const n = a * b;
  return { type: 'number', topic: 'division', text: `${n} ÷ ${b} = ?`, correct: String(a) };
}

function genAddSub(diff) {
  let max = diff === 'easy' ? 100 : diff === 'medium' ? 1000 : 9999;
  const isAdd = Math.random() < 0.5;
  let a = rnd(0, max), b = rnd(0, max);
  if (!isAdd && b > a) [a, b] = [b, a];
  const text = isAdd ? `${a} + ${b} = ?` : `${a} − ${b} = ?`;
  const res = isAdd ? a + b : a - b;
  return { type: 'number', topic: 'addSub', text, correct: String(res) };
}

function genTenThousands(diff) {
  // תחום הרבבה: 0..9,999 — ערכי ספרות, עיגול, הרחבה, השוואה
  const kind = choice(['place', 'round', 'expand', 'compare', 'addsub']);
  const n = rnd(0, 9999);
  if (kind === 'place') {
    const places = [ ['אלפים', 1000], ['מאות', 100], ['עשרות', 10], ['יחידות', 1] ];
    const [label, val] = choice(places);
    const digit = Math.floor(n / val) % 10;
    const text = `מה הערך של ספרת ה${label} במספר ${n}?`;
    return { type: 'number', topic: 'tenThousands', text, correct: String(digit * val) };
  }
  if (kind === 'round') {
    const to = choice([10, 100, 1000]);
    const text = `עגול את ${n} ל${to === 10 ? 'עשרות' : to === 100 ? 'מאות' : 'אלפים'} הקרובות`;
    const x = Math.round(n / to) * to;
    return { type: 'number', topic: 'tenThousands', text, correct: String(x) };
  }
  if (kind === 'expand') {
    const th = Math.floor(n / 1000) % 10;
    const h = Math.floor(n / 100) % 10;
    const t = Math.floor(n / 10) % 10;
    const u = n % 10;
    const text = `כתוב/י את ${n} בצורה מורחבת (למשל: 4,000 + 300 + 20 + 5)`;
    const parts = [];
    if (th) parts.push(`${th*1000}`);
    if (h) parts.push(`${h*100}`);
    if (t) parts.push(`${t*10}`);
    if (u || parts.length===0) parts.push(`${u}`);
    const corr = parts.join(' + ');
    return { type: 'text', topic: 'tenThousands', text, correct: corr, normalize: normalizeExpanded };
  }
  // add/sub within 0..9,999
  if (kind === 'addsub') {
    const isAdd = Math.random() < 0.5;
    let a2 = rnd(0, 9999), b2 = rnd(0, 9999);
    if (!isAdd && b2 > a2) [a2, b2] = [b2, a2];
    const text2 = isAdd ? `${a2} + ${b2} = ?` : `${a2} − ${b2} = ?`;
    const res2 = isAdd ? a2 + b2 : a2 - b2;
    return { type: 'number', topic: 'tenThousands', text: text2, correct: String(res2) };
  }

  // compare
  const a = rnd(0, 9999), b = rnd(0, 9999);
  const sign = a === b ? '=' : (a > b ? '>' : '<');
  const text = `איזה סימן נכון: ${a} __ ${b}  (כתבו אחד מהבאים: < , > , =) `;
  return { type: 'text', topic: 'tenThousands', text, correct: sign, normalize: s=>s.trim() };
}

function normalizeExpanded(s){
  // מסדר פלט כמו "4000 + 300 + 20 + 5" ללא רווחים מיותרים
  return s.replace(/\s+/g,'').replace(/\+/g,' + ').replace(/\s+\+/g,' + ').trim();
}

function pickWordProblem(diff) {
  const pool = problems.filter(p => p.difficulty === diff);
  const item = pool.length ? choice(pool) : choice(problems);
  if (item.answer && typeof item.answer === 'object') {
    return { type: 'quotientRemainder', topic: 'wordProblems', text: item.text, correct: item.answer };
  }
  return { type: 'number', topic: 'wordProblems', text: item.text, correct: String(item.answer), unit: item.unit };
}

const generators = {
  multiplication: genMultiplication,
  division: genDivision,
  addSub: genAddSub,
  tenThousands: genTenThousands,
  wordProblems: pickWordProblem,
};

function buildQuestions(topic, diff, count) {
  const list = [];
  for (let i=0;i<count;i++) {
    let q = generators[topic](diff);
    // הימנע מתשובות שליליות/קשות לילד
    if (q.type === 'number' && Number(q.correct) < 0) { i--; continue; }
    list.push(q);
  }
  return list;
}

function renderInputs(q){
  answerArea.innerHTML = '';
  keypad.classList.remove('hidden');

  if (q.type === 'number') {
    const input = document.createElement('input');
    input.type = 'tel';
    input.inputMode = 'numeric';
    input.placeholder = 'הקלד/י תשובה';
    input.id = 'answer';
    answerArea.appendChild(input);
    if (q.unit) {
      const span = document.createElement('span');
      span.className = 'unit';
      span.textContent = q.unit;
      answerArea.appendChild(span);
    }
    setTimeout(()=>input.focus(), 50);
  }
  else if (q.type === 'text') {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'כתבו כאן';
    input.id = 'answerText';
    answerArea.appendChild(input);
    setTimeout(()=>input.focus(), 50);
  }
  else if (q.type === 'quotientRemainder') {
    const qIn = document.createElement('input'); qIn.type='tel'; qIn.inputMode='numeric'; qIn.placeholder='מנה'; qIn.id='ansQ';
    const rIn = document.createElement('input'); rIn.type='tel'; rIn.inputMode='numeric'; rIn.placeholder='שארית'; rIn.id='ansR';
    answerArea.appendChild(qIn); answerArea.appendChild(rIn);
    setTimeout(()=>qIn.focus(), 50);
  }

  // בנה מקלדת מספרים
  keypad.innerHTML = '';
  const keys = ['7','8','9','4','5','6','1','2','3','⌫','0','✔','<','>','='];
  keys.forEach(k=>{
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = k; b.addEventListener('click', ()=>{
      const active = answerArea.querySelector('input:focus') || answerArea.querySelector('input');
      if (!active) return;
      if (k === '⌫') { active.value = active.value.slice(0,-1); return; }
      if (k === '✔') { onCheck(); return; }
      active.value += k;
      active.focus();
    });
    keypad.appendChild(b);
  });
}

function updateUI(){
  const pct = Math.round((index / questions.length) * 100);
  progressBar.style.width = pct + '%';
  scoreBox.textContent = `ניקוד: ${score}`;
  if (index >= questions.length) return;
  current = questions[index];
  questionText.textContent = current.text;
  const numericOnly = isNumericQuestion(current.text);
  questionText.dataset.dir = numericOnly ? 'ltr' : 'rtl';
  renderInputs(current);
}

function checkAnswer(){
  if (!current) return false;
  if (current.type === 'number') {
    const val = (el('answer')?.value || '').trim();
    return val === current.correct;
  }
  if (current.type === 'text') {
    const normalize = current.normalize || ((s)=>s.trim());
    return normalize(el('answerText')?.value || '') === normalize(current.correct);
  }
  if (current.type === 'quotientRemainder') {
    const qVal = Number((el('ansQ')?.value || '').trim());
    const rVal = Number((el('ansR')?.value || '').trim());
    return qVal === current.correct.q && rVal === current.correct.r;
  }
  return false;
}

function onCheck(){
  const ok = checkAnswer();
  if (ok) {
    feedback.className = 'feedback ok';
    feedback.textContent = '✅ נכון! כל הכבוד ⭐';
    score += 10;
  } else {
    feedback.className = 'feedback no';
    const corr = (typeof current.correct === 'object') ? `מנה: ${current.correct.q}, שארית: ${current.correct.r}` : current.correct;
    feedback.textContent = `❌ לא מדויק. התשובה: ${corr}`;
  }
  index++;
  setTimeout(()=>{
    if (index >= questions.length) finish();
    else updateUI();
  }, 1500);
}

function onSkip(){
  index++;
  if (index >= questions.length) finish();
  else updateUI();
}

function finish(){
  quizSec.classList.add('hidden');
  summarySec.classList.remove('hidden');
  const max = questions.length * 10;
  const percent = Math.round((score / max) * 100);
  saveBest(topicSel.value, diffSel.value, percent);
  showBadges();
  let medal = '🥉';
  if (percent >= 90) medal = '🥇';
  else if (percent >= 75) medal = '🥈';
  summaryText.textContent = `סיימנו! ציון: ${percent}% ${medal} · ענית נכון על ${score/10} מתוך ${questions.length}.`;
}

function start(){
  index = 0; score = 0; current = null;
  questions = buildQuestions(topicSel.value, diffSel.value, Number(countSel.value));
  summarySec.classList.add('hidden');
  quizSec.classList.remove('hidden');
  feedback.className = 'feedback';
  feedback.textContent = '';
  updateUI();
  setTimeout(()=>{
    quizSec.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
  }, 50);
}

startBtn.addEventListener('click', start);
checkBtn.addEventListener('click', onCheck);
skipBtn.addEventListener('click', onSkip);
endBtn.addEventListener('click', finish);

againBtn.addEventListener('click', start);
backBtn.addEventListener('click', ()=>{
  summarySec.classList.add('hidden');
  quizSec.classList.add('hidden');
});

howBtn.addEventListener('click', ()=>{
  howDialog.showModal();
});

window.addEventListener('load', async ()=>{
  await loadProblems();
  showBadges();
});
