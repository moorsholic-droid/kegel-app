const CIRC = 2 * Math.PI * 43;
let running = false, timer = null;
let phase = 'idle', elapsed = 0;
let currentRep = 0, currentSet = 1, totalDone = 0;
let currentExercise = 'classic';
let audioCtx = null;
let selectedProgramDay = null;

// ---- البرنامج الأسبوعي ----
const weekProgram = [
  { day: 1, name: 'الإحماء',  exercise: 'classic', hold: 3, rest: 5, reps: 5,  sets: 2, desc: 'يوم خفيف للبداية — تعرف على التمرين' },
  { day: 2, name: 'الأساس',   exercise: 'classic', hold: 5, rest: 5, reps: 8,  sets: 2, desc: 'نبني القاعدة — تمرين كلاسيكي منتظم' },
  { day: 3, name: 'التحمل',   exercise: 'long',    hold: 8, rest: 6, reps: 6,  sets: 2, desc: 'شد طويل وعميق لزيادة التحمل' },
  { day: 4, name: 'الراحة',   exercise: 'classic', hold: 3, rest: 8, reps: 5,  sets: 1, desc: 'يوم راحة نشطة — تمرين خفيف جداً' },
  { day: 5, name: 'السرعة',   exercise: 'fast',    hold: 2, rest: 3, reps: 12, sets: 3, desc: 'تقلصات سريعة لتنشيط العضلات' },
  { day: 6, name: 'التكثيف',  exercise: 'classic', hold: 7, rest: 5, reps: 10, sets: 3, desc: 'مجموعات أكثر وشد أطول' },
  { day: 7, name: 'التحدي',   exercise: 'long',    hold: 10, rest: 5, reps: 10, sets: 3, desc: 'أقصى جهد — أتم الأسبوع بقوة!' },
];

// ---- No Fap ----
const nofapMilestones = [
  { days: 1,  icon: '🌱', name: 'البداية',       msg: 'كل رحلة تبدأ بخطوة واحدة. أنت تستطيع!' },
  { days: 3,  icon: '💧', name: '3 أيام',        msg: 'ثلاثة أيام من الإرادة! جسمك يشكرك.' },
  { days: 7,  icon: '⭐', name: 'أسبوع كامل',    msg: 'أسبوع كامل! طاقتك تعود إليك الآن.' },
  { days: 14, icon: '🔥', name: 'أسبوعان',       msg: 'أسبوعان! عقلك أصبح أكثر وضوحاً.' },
  { days: 21, icon: '💪', name: '21 يوماً',      msg: 'العادة تتشكل! أنت تبني نفسك من جديد.' },
  { days: 30, icon: '🏅', name: 'شهر كامل',      msg: 'شهر كامل! أنت في النخبة الآن.' },
  { days: 60, icon: '🥈', name: 'شهران',         msg: 'شهران من الإرادة الحديدية! استمر.' },
  { days: 90, icon: '🏆', name: '90 يوماً',      msg: 'أتممت التحدي الكبير! أنت بطل حقيقي.' },
];

// ---- النصائح ----
const allTips = [
  { cat: 'health',   icon: '🫁', label: 'صحية',      text: 'اشرب 8 أكواب من الماء يومياً لترطيب الجسم وتحسين وظائف الأعضاء.' },
  { cat: 'health',   icon: '😴', label: 'صحية',      text: 'النوم 7-8 ساعات يومياً يقوي جهاز المناعة ويحسن التركيز.' },
  { cat: 'health',   icon: '🌞', label: 'صحية',      text: 'التعرض لأشعة الشمس صباحاً يمنحك فيتامين D ويحسن مزاجك.' },
  { cat: 'health',   icon: '🦷', label: 'صحية',      text: 'فرشاة أسنانك مرتين يومياً وانتبه لنظافة الفم — صحة الفم تؤثر على القلب.' },
  { cat: 'health',   icon: '🧘', label: 'صحية',      text: 'التنفس العميق 5 دقائق يومياً يخفض ضغط الدم ويهدئ الجهاز العصبي.' },
  { cat: 'mental',   icon: '📓', label: 'نفسية',     text: 'اكتب 3 أشياء تشكر عليها كل صباح — يغير نظرتك للحياة تدريجياً.' },
  { cat: 'mental',   icon: '📵', label: 'نفسية',     text: 'ابتعد عن الهاتف ساعة قبل النوم — يحسن جودة نومك ويريح عقلك.' },
  { cat: 'mental',   icon: '🎯', label: 'نفسية',     text: 'ضع هدفاً واحداً صغيراً كل يوم وحققه — يبني الثقة بالنفس.' },
  { cat: 'mental',   icon: '🧠', label: 'نفسية',     text: 'تحدث مع نفسك بإيجابية — الكلام الداخلي يشكل شخصيتك.' },
  { cat: 'mental',   icon: '🌊', label: 'نفسية',     text: 'تقبّل مشاعرك دون إنكارها — الاعتراف بها أول خطوة للتجاوز.' },
  { cat: 'social',   icon: '👨‍👩‍👧', label: 'اجتماعية', text: 'خصص وقتاً أسبوعياً للعائلة بلا هواتف — يقوي الروابط ويمنحك سكينة.' },
  { cat: 'social',   icon: '🤝', label: 'اجتماعية', text: 'ساعد شخصاً كل أسبوع — العطاء يمنحك سعادة حقيقية.' },
  { cat: 'social',   icon: '👂', label: 'اجتماعية', text: 'استمع أكثر مما تتكلم — تكسب احترام الناس وتفهمهم أعمق.' },
  { cat: 'social',   icon: '😊', label: 'اجتماعية', text: 'الابتسامة مجانية وتصنع فارقاً — ابدأ بها مع كل شخص تقابله.' },
  { cat: 'sport',    icon: '🚶', label: 'رياضية',    text: 'المشي 30 دقيقة يومياً يحرق السعرات ويقوي القلب والعظام.' },
  { cat: 'sport',    icon: '🏋️', label: 'رياضية',    text: 'تمارين القوة 3 مرات أسبوعياً تزيد الكتلة العضلية وترفع الأيض.' },
  { cat: 'sport',    icon: '🤸', label: 'رياضية',    text: 'الإطالة بعد كل تمرين تمنع الإصابات وتحسن المرونة.' },
  { cat: 'sport',    icon: '🏃', label: 'رياضية',    text: 'التمارين الهوائية تحسن المزاج عبر إفراز هرمونات السعادة.' },
  { cat: 'culture',  icon: '📚', label: 'ثقافية',    text: 'اقرأ 10 صفحات يومياً — في السنة ستكون أتممت 12 كتاباً كاملاً.' },
  { cat: 'culture',  icon: '🌍', label: 'ثقافية',    text: 'تعلم كلمة جديدة بلغة أجنبية كل يوم — يفتح آفاقاً لا تتخيلها.' },
  { cat: 'culture',  icon: '🎵', label: 'ثقافية',    text: 'الموسيقى الهادئة أثناء العمل ترفع التركيز والإنتاجية.' },
  { cat: 'culture',  icon: '✍️', label: 'ثقافية',    text: 'دوّن أفكارك يومياً — الكتابة تنظم العقل وتطور التعبير.' },
];

// ---- التغذية ----
const goodFoods = [
  {
    cat: '🥩 البروتين', items: [
      'الدجاج المشوي — بروتين عالي وقليل الدهون',
      'البيض — كامل العناصر الغذائية',
      'السمك خاصة السلمون — أوميغا 3 للقلب والدماغ',
      'العدس والحمص — بروتين نباتي وألياف',
      'الزبادي اليوناني — بروتين وبروبيوتيك',
    ]
  },
  {
    cat: '🥦 الخضروات', items: [
      'البروكلي — فيتامينات ومضادات أكسدة قوية',
      'السبانخ — حديد وفيتامين K',
      'الجزر — بيتا كاروتين لصحة العيون',
      'الثوم — مضاد طبيعي للبكتيريا',
      'الطماطم — ليكوبين لصحة القلب',
    ]
  },
  {
    cat: '🍎 الفواكه', items: [
      'التفاح — ألياف وفيتامين C',
      'الموز — بوتاسيوم وطاقة سريعة',
      'التوت الأزرق — مضادات أكسدة للدماغ',
      'الرمان — يقوي المناعة ويحسن الدورة الدموية',
      'الأفوكادو — دهون صحية وفيتامين E',
    ]
  },
  {
    cat: '🌾 الحبوب والبقوليات', items: [
      'الشوفان — يخفض الكوليسترول ويشبع طويلاً',
      'الكينوا — بروتين كامل وخالٍ من الغلوتين',
      'الأرز البني — ألياف وطاقة مستدامة',
      'الفاصولياء — حديد وبروتين نباتي',
    ]
  },
  {
    cat: '🫖 المشروبات', items: [
      'الماء — 8 أكواب يومياً على الأقل',
      'الشاي الأخضر — مضادات أكسدة وتحسين التركيز',
      'القهوة باعتدال — تحسن الأداء الرياضي',
      'عصير الليمون الطبيعي — فيتامين C وتنظيف الجسم',
    ]
  },
];

const badFoods = [
  {
    cat: '🍟 الوجبات السريعة', items: [
      'البرغر والبطاطس المقلية — دهون متحولة ضارة بالقلب',
      'البيتزا التجارية — سعرات فارغة وصوديوم عالٍ',
      'الدجاج المقلي — دهون مشبعة تضر الشرايين',
    ]
  },
  {
    cat: '🍬 السكريات والحلويات', items: [
      'المشروبات الغازية — سكر مفرط يسبب السمنة والسكري',
      'الحلوى والشوكولاتة الرخيصة — سعرات فارغة بلا قيمة',
      'عصائر الفاكهة المعبأة — سكر مضاف مخفي',
      'الكيك والبسكويت المصنّع — دهون متحولة وسكر',
    ]
  },
  {
    cat: '🧂 الأطعمة المصنعة', items: [
      'اللحوم المصنعة كالنقانق — مواد حافظة ونترات ضارة',
      'الأطعمة المعلبة — صوديوم عالٍ يرفع ضغط الدم',
      'رقائق البطاطس — دهون ومواد كيميائية',
      'الصلصات الجاهزة — سكر وملح مخفيان',
    ]
  },
  {
    cat: '🍺 المشروبات الضارة', items: [
      'الكحول — يدمر الكبد ويضعف جهاز المناعة',
      'مشروبات الطاقة — كافيين مفرط يضر القلب',
      'المشروبات الغازية الدايت — مُحليات صناعية مشكوك فيها',
    ]
  },
];

// ---- الأصوات ----
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playBeep(frequency, duration) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

function playSqueeze() {
  playBeep(880, 0.15);
  setTimeout(() => playBeep(1100, 0.15), 150);
}

function playRelax() {
  playBeep(440, 0.2);
  setTimeout(() => playBeep(330, 0.3), 200);
}

function playDone() {
  playBeep(523, 0.15);
  setTimeout(() => playBeep(659, 0.15), 160);
  setTimeout(() => playBeep(784, 0.15), 320);
  setTimeout(() => playBeep(1047, 0.4), 480);
}

// ---- التمارين ----
const exercises = {
  classic: { name: 'كلاسيكي', desc: 'شد العضلات لثوانٍ ثم استرخِ — التمرين الأساسي', squeezeClass: 'squeeze', relaxClass: 'relax', color: '#1D9E75' },
  fast:    { name: 'سريع',    desc: 'تقلصات سريعة ومتتالية — لتقوية العضلات بشكل أسرع', squeezeClass: 'fast-squeeze', relaxClass: 'relax', color: '#D85A30' },
  long:    { name: 'طويل',    desc: 'شد بطيء وعميق — للتحكم والتحمل', squeezeClass: 'long-squeeze', relaxClass: 'long-relax', color: '#185FA5' },
};

// ---- السجل ----
function loadHistory() {
  return JSON.parse(localStorage.getItem('kegelHistory') || '[]');
}

function saveSession(reps, sets, exercise) {
  const history = loadHistory();
  history.unshift({
    date: new Date().toLocaleDateString('ar-MA'),
    time: new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' }),
    reps, sets, exercise
  });
  localStorage.setItem('kegelHistory', JSON.stringify(history));
}

function calcStreak() {
  const history = loadHistory();
  if (!history.length) return 0;
  const dates = [...new Set(history.map(h => h.date))];
  const today = new Date().toLocaleDateString('ar-MA');
  if (dates[0] !== today) return 0;
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i-1].split('/').reverse().join('-'));
    const curr = new Date(dates[i].split('/').reverse().join('-'));
    if ((prev - curr) / 86400000 === 1) streak++;
    else break;
  }
  return streak;
}

function renderHistory() {
  const history = loadHistory();
  const streak = calcStreak();
  document.getElementById('histTotalSessions').textContent = history.length;
  document.getElementById('histStreak').textContent = streak;
  document.getElementById('histTotalReps').textContent = history.reduce((s, h) => s + h.reps, 0);
  const list = document.getElementById('historyList');
  if (!history.length) {
    list.innerHTML = '<div class="empty-msg">لا توجد جلسات بعد 😊<br>ابدأ تمرينك الأول!</div>';
    return;
  }
  list.innerHTML = history.map(h => `
    <div class="history-item">
      <div>
        <div class="info">${h.sets} مجموعات × ${h.reps} تكرار</div>
        <div class="date">${h.date} — ${h.time}</div>
      </div>
      <div class="ex-tag">${exercises[h.exercise]?.name || h.exercise}</div>
    </div>
  `).join('');
  const s = calcStreak();
  document.getElementById('streakLabel').textContent = s > 0 ? `🔥 ${s} يوم متتالي` : 'ابدأ جلستك اليومية';
}

function clearHistory() {
  if (confirm('هل أنت متأكد من مسح كل السجل؟')) {
    localStorage.removeItem('kegelHistory');
    renderHistory();
  }
}

// ---- No Fap ----
function loadNofap() {
  return JSON.parse(localStorage.getItem('nofapData') || '{"startDate":null,"best":0,"attempts":0}');
}

function saveNofap(data) {
  localStorage.setItem('nofapData', JSON.stringify(data));
}

function getNofapDays(data) {
  if (!data.startDate) return 0;
  const start = new Date(data.startDate);
  const now = new Date();
  return Math.floor((now - start) / 86400000);
}

function renderNofap() {
  const data = loadNofap();
  const days = getNofapDays(data);
  document.getElementById('nofapDays').textContent = days;
  document.getElementById('nofapBest').textContent = data.best || 0;
  document.getElementById('nofapTotal').textContent = data.attempts || 0;
  const rate = data.attempts > 0 ? Math.round((days / (data.attempts * 30)) * 100) : 0;
  document.getElementById('nofapPercent').textContent = Math.min(rate, 100) + '%';

  const milestone = [...nofapMilestones].reverse().find(m => days >= m.days) || nofapMilestones[0];
  document.getElementById('nofapBadgeIcon').textContent = milestone.icon;
  document.getElementById('nofapBadgeName').textContent = milestone.name;
  document.getElementById('nofapMsg').textContent = milestone.msg;

  const milestonesEl = document.getElementById('nofapMilestones');
  milestonesEl.innerHTML = nofapMilestones.map(m => `
    <div class="milestone-item ${days >= m.days ? 'reached' : ''}">
      <span class="milestone-icon">${m.icon}</span>
      <div class="milestone-info">
        <div class="milestone-name">${m.name}</div>
        <div class="milestone-days">${m.days} يوم</div>
      </div>
      ${days >= m.days ? '<span class="milestone-check">✅</span>' : ''}
    </div>
  `).join('');
}

function nofapCheckin() {
  let data = loadNofap();
  if (!data.startDate) {
    data.startDate = new Date().toISOString();
    data.attempts = (data.attempts || 0) + 1;
    saveNofap(data);
    renderNofap();
    alert('✅ بدأت رحلتك! استمر وكن قوياً 💪');
  } else {
    alert('✅ أحسنت! استمر في طريقك 💪');
  }
}

function nofapReset() {
  if (!confirm('هل أنت متأكد؟ سيتم إعادة العداد من الصفر.')) return;
  let data = loadNofap();
  const days = getNofapDays(data);
  data.best = Math.max(data.best || 0, days);
  data.startDate = null;
  data.attempts = (data.attempts || 0) + 1;
  saveNofap(data);
  renderNofap();
}

// ---- الصحة والتغذية ----
let currentHealthTab = 'all';
let currentFoodTab = 'good';

function renderTipOfDay() {
  const idx = new Date().getDate() % allTips.length;
  document.getElementById('tipText').textContent = allTips[idx].text;
}

function showHealthTab(tab, btn) {
  currentHealthTab = tab;
  document.querySelectorAll('.htab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTips();
}

function renderTips() {
  const filtered = currentHealthTab === 'all' ? allTips : allTips.filter(t => t.cat === currentHealthTab);
  document.getElementById('tipsList').innerHTML = filtered.map(t => `
    <div class="tip-item">
      <span class="tip-cat-icon">${t.icon}</span>
      <div class="tip-content">
        <div class="tip-cat">${t.label}</div>
        <div class="tip-body">${t.text}</div>
      </div>
    </div>
  `).join('');
}

function showFoodTab(tab, btn) {
  currentFoodTab = tab;
  document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderFoods();
}

function renderFoods() {
  const foods = currentFoodTab === 'good' ? goodFoods : badFoods;
  const dotClass = currentFoodTab === 'good' ? 'good' : 'bad';
  document.getElementById('foodCats').innerHTML = foods.map(cat => `
    <div class="food-cat">
      <div class="food-cat-title">${cat.cat}</div>
      <div class="food-list">
        ${cat.items.map(item => `
          <div class="food-item">
            <div class="food-dot ${dotClass}"></div>
            <span>${item}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// ---- البرنامج الأسبوعي ----
function getCompletedDays() {
  return JSON.parse(localStorage.getItem('kegelProgramDays') || '[]');
}

function markDayDone(dayNum) {
  const done = getCompletedDays();
  if (!done.includes(dayNum)) {
    done.push(dayNum);
    localStorage.setItem('kegelProgramDays', JSON.stringify(done));
  }
}

function renderWeekGrid() {
  const done = getCompletedDays();
  document.getElementById('weekGrid').innerHTML = weekProgram.map(d => `
    <button class="day-btn ${done.includes(d.day) ? 'done' : ''}"
      onclick="selectProgramDay(${d.day})">
      <span class="day-num">${done.includes(d.day) ? '✓' : d.day}</span>
      <span class="day-name">${d.name}</span>
    </button>
  `).join('');
}

function selectProgramDay(dayNum) {
  selectedProgramDay = dayNum;
  const d = weekProgram[dayNum - 1];
  const done = getCompletedDays();
  document.getElementById('programEmpty').style.display = 'none';
  document.getElementById('programCard').style.display = 'block';
  document.getElementById('programDayTitle').textContent = `اليوم ${d.day} — ${d.name}`;
  document.getElementById('programDayDesc').textContent = d.desc;
  document.getElementById('programDetails').innerHTML = `
    <div class="program-detail-item"><div class="d-val">${d.hold}ث</div><div class="d-lbl">مدة الشد</div></div>
    <div class="program-detail-item"><div class="d-val">${d.reps}</div><div class="d-lbl">تكرار</div></div>
    <div class="program-detail-item"><div class="d-val">${d.sets}</div><div class="d-lbl">مجموعات</div></div>
  `;
  const btn = document.querySelector('#programCard .btn-start');
  if (done.includes(dayNum)) {
    btn.textContent = '✅ أتممت هذا اليوم';
    btn.style.background = '#888';
  } else {
    btn.textContent = '▶ ابدأ تمرين اليوم';
    btn.style.background = '#1D9E75';
  }
  document.querySelectorAll('.day-btn').forEach((b, i) => {
    b.classList.toggle('active', i + 1 === dayNum && !done.includes(dayNum));
  });
}

function startProgramDay() {
  if (!selectedProgramDay) return;
  if (getCompletedDays().includes(selectedProgramDay)) return;
  const d = weekProgram[selectedProgramDay - 1];
  document.getElementById('holdTime').value = d.hold;
  document.getElementById('holdVal').textContent = d.hold;
  document.getElementById('restTime').value = d.rest;
  document.getElementById('restVal').textContent = d.rest;
  document.getElementById('repsPerSet').value = d.reps;
  document.getElementById('repsVal').textContent = d.reps;
  document.getElementById('numSets').value = d.sets;
  document.getElementById('setsVal').textContent = d.sets;
  document.getElementById('totalSets').textContent = d.sets;
  currentExercise = d.exercise;
  document.querySelectorAll('.ex-btn').forEach(b => b.classList.remove('active'));
  const exMap = { classic: 0, fast: 1, long: 2 };
  document.querySelectorAll('.ex-btn')[exMap[d.exercise]].classList.add('active');
  document.getElementById('exerciseDesc').textContent = exercises[d.exercise].desc;
  showPage('home');
  setTimeout(() => { resetAll(); startSession(); }, 300);
}

// ---- التنقل ----
function showPage(page) {
  ['home','program','nofap','health','history'].forEach(p => {
    document.getElementById('page-' + p).style.display = p === page ? 'block' : 'none';
  });
  document.querySelectorAll('.nav-btn').forEach((b, i) => {
    b.classList.toggle('active', ['home','program','nofap','health','history'][i] === page);
  });
  if (page === 'history') renderHistory();
  if (page === 'program') renderWeekGrid();
  if (page === 'nofap') renderNofap();
  if (page === 'health') { renderTipOfDay(); renderTips(); renderFoods(); }
}

// ---- التمرين ----
function selectExercise(type, btn) {
  if (running) return;
  currentExercise = type;
  document.querySelectorAll('.ex-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('exerciseDesc').textContent = exercises[type].desc;
  setRing(0, exercises[type].color);
  resetAnim();
}

function resetAnim() {
  document.getElementById('muscleCircle').className = 'muscle-circle';
  document.getElementById('animLabel').textContent = 'جاهز';
}

function animateSqueeze() {
  const ex = exercises[currentExercise];
  document.getElementById('muscleCircle').className = 'muscle-circle ' + ex.squeezeClass;
  document.getElementById('animLabel').textContent = 'اشد!';
  playSqueeze();
}

function animateRelax() {
  const ex = exercises[currentExercise];
  document.getElementById('muscleCircle').className = 'muscle-circle ' + ex.relaxClass;
  document.getElementById('animLabel').textContent = 'استرخِ';
  playRelax();
}

function syncSets(v) {
  document.getElementById('setsVal').textContent = v;
  document.getElementById('totalSets').textContent = v;
}

function getSettings() {
  return {
    hold: parseInt(document.getElementById('holdTime').value),
    rest: parseInt(document.getElementById('restTime').value),
    reps: parseInt(document.getElementById('repsPerSet').value),
    sets: parseInt(document.getElementById('numSets').value)
  };
}

function setRing(frac, color) {
  const c = document.getElementById('ringCircle');
  c.setAttribute('stroke-dashoffset', CIRC * (1 - frac));
  c.setAttribute('stroke', color);
}

function updateDisplay(s, ph, frac, color, label) {
  document.getElementById('timerDisplay').textContent = s;
  document.getElementById('phaseLabel').textContent = ph;
  document.getElementById('mainPhaseLabel').textContent = label;
  setRing(frac, color);
}

function toggleStart() {
  if (!running) startSession();
  else pauseSession();
}

function startSession() {
  running = true;
  document.getElementById('mainBtn').textContent = '⏸ إيقاف مؤقت';
  document.getElementById('mainBtn').className = 'btn-start btn-red';
  document.getElementById('controlsDiv').style.opacity = '0.4';
  document.getElementById('controlsDiv').style.pointerEvents = 'none';
  document.getElementById('resetBtn').style.display = 'block';
  document.getElementById('doneBanner').style.display = 'none';
  document.querySelectorAll('.ex-btn').forEach(b => b.style.pointerEvents = 'none');
  if (phase === 'idle') { phase = 'hold'; elapsed = 0; }
  tick();
}

function pauseSession() {
  running = false;
  clearTimeout(timer);
  document.getElementById('mainBtn').textContent = '▶ متابعة';
  document.getElementById('mainBtn').className = 'btn-start btn-green';
}

function tick() {
  if (!running) return;
  const s = getSettings();
  const ex = exercises[currentExercise];
  let dur = phase === 'hold' ? s.hold : s.rest;
  let remaining = dur - elapsed;
  let frac = elapsed / dur;
  let color = phase === 'hold' ? ex.color : '#888';
  let phTxt = phase === 'hold' ? '🔴 شد' : '🔵 استرخاء';
  let label = phase === 'hold' ? 'اشد عضلاتك الآن!' : 'استرخِ...';
  if (elapsed === 0) {
    if (phase === 'hold') animateSqueeze();
    else animateRelax();
  }
  updateDisplay(Math.max(0, remaining), phTxt, frac, color, label);
  elapsed++;
  if (elapsed > dur) {
    elapsed = 0;
    if (phase === 'hold') {
      phase = 'rest'; currentRep++; totalDone++;
      document.getElementById('totalReps').textContent = totalDone;
    } else {
      if (currentRep >= s.reps) {
        currentSet++; currentRep = 0;
        if (currentSet > s.sets) { finishSession(); return; }
        document.getElementById('currentSet').textContent = currentSet;
      }
      phase = 'hold';
    }
  }
  timer = setTimeout(tick, 1000);
}

function finishSession() {
  running = false;
  phase = 'idle';
  const s = getSettings();
  saveSession(totalDone, s.sets, currentExercise);
  if (selectedProgramDay) { markDayDone(selectedProgramDay); selectedProgramDay = null; }
  document.getElementById('mainBtn').style.display = 'none';
  document.getElementById('mainPhaseLabel').textContent = '';
  document.getElementById('phaseLabel').textContent = '✅';
  document.getElementById('timerDisplay').textContent = '✓';
  setRing(1, '#1D9E75');
  resetAnim();
  document.getElementById('animLabel').textContent = '🎉 أحسنت!';
  document.getElementById('doneMsg').textContent = `أتممت ${s.sets} مجموعات × ${totalDone} تكرار بنجاح! 💪`;
  document.getElementById('doneBanner').style.display = 'block';
  renderHistory();
  playDone();
}

function resetAll() {
  running = false;
  clearTimeout(timer);
  phase = 'idle'; elapsed = 0; currentRep = 0; currentSet = 1; totalDone = 0;
  document.getElementById('totalReps').textContent = '0';
  document.getElementById('currentSet').textContent = '1';
  document.getElementById('totalSets').textContent = document.getElementById('numSets').value;
  document.getElementById('timerDisplay').textContent = '0';
  document.getElementById('phaseLabel').textContent = 'جاهز';
  document.getElementById('mainPhaseLabel').textContent = 'اضبط الإعدادات وابدأ';
  document.getElementById('mainBtn').textContent = '▶ ابدأ التمرين';
  document.getElementById('mainBtn').className = 'btn-start btn-green';
  document.getElementById('mainBtn').style.display = 'block';
  document.getElementById('resetBtn').style.display = 'none';
  document.getElementById('controlsDiv').style.opacity = '1';
  document.getElementById('controlsDiv').style.pointerEvents = 'auto';
  document.getElementById('doneBanner').style.display = 'none';
  document.querySelectorAll('.ex-btn').forEach(b => b.style.pointerEvents = 'auto');
  setRing(0, exercises[currentExercise].color);
  resetAnim();
}

// تهيئة
renderHistory();