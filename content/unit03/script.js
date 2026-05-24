'use strict';
/* ════════════════════════════════════════════════════════
   GET UNDERWAY — Maritime English L1 · Unit 3
   Navigation, Position & Track
   script.js — Standardized Admiralty Glass Implementation
   ════════════════════════════════════════════════════════ */

// ── Content Data ────────────────────────────────────────
const CONTENT = {
  vocab: {
    "Nautical Charts & Instruments": [
      { en: 'Chart',               es: 'Carta náutica' },
      { en: 'Compass',             es: 'Compás / brújula' },
      { en: 'GPS',                 es: 'Sistema de posicionamiento global' },
      { en: 'Radar',               es: 'Radar' },
      { en: 'Echo sounder',        es: 'Ecosonda / sonda acústica' },
      { en: 'Bearing',             es: 'Marcación / rumbo de demora' },
      { en: 'Heading',             es: 'Rumbo de la proa / proa' },
      { en: 'Course',              es: 'Rumbo a seguir' },
      { en: 'Waypoint',            es: 'Punto de derrota / waypoint' },
      { en: 'Fix',                 es: 'Punto de situación / posición confirmada' },
      { en: 'Dead reckoning',      es: 'Navegación por estima' }
    ],
    "Nautical Geography": [
      { en: 'Latitude',            es: 'Latitud' },
      { en: 'Longitude',           es: 'Longitud' },
      { en: 'Nautical mile',       es: 'Milla náutica (1 852 m)' },
      { en: 'Knot',                es: 'Nudo (milla náutica por hora)' },
      { en: 'Depth',               es: 'Profundidad / calado del agua' },
      { en: 'Shoal',               es: 'Bajo / aguas poco profundas' },
      { en: 'Reef',                es: 'Arrecife / escollo' },
      { en: 'Buoy',                es: 'Boya de señalización' },
      { en: 'Lighthouse',          es: 'Faro' },
      { en: 'Fairway',             es: 'Canal de navegación / aguas navegables' }
    ],
    "Track & Passage Terms": [
      { en: 'Track',               es: 'Trayectoria / derrota seguida' },
      { en: 'Passage plan',        es: 'Plan de navegación / derrota planificada' },
      { en: 'ETA',                 es: 'Hora estimada de llegada' },
      { en: 'ETD',                 es: 'Hora estimada de salida' },
      { en: 'Speed over ground (SOG)', es: 'Velocidad sobre el fondo' },
      { en: 'Course over ground (COG)', es: 'Rumbo sobre el fondo' },
      { en: 'Cross track error (XTE)',  es: 'Error de derrota lateral / desvío de ruta' }
    ],
    "Colregs — Rules of the Road": [
      { en: 'Rule of the Road',    es: 'Reglamento de abordajes (COLREGS)' },
      { en: 'Stand-on vessel',     es: 'Buque que tiene la prioridad de paso' },
      { en: 'Give-way vessel',     es: 'Buque que debe ceder el paso' },
      { en: 'Collision avoidance', es: 'Maniobra / prevención de abordajes' }
    ]
  },

  func: {
    "Communicating Position by VHF": [
      { en: 'My position is ten degrees twenty-five minutes North, seventy-five degrees thirty-two minutes West.', use: 'Formato estándar SMCP para comunicar posición.', ctx: 'pos' },
      { en: 'My position is three nautical miles west of Punta Canoas lighthouse.', es: 'Posición referenciada a punto notable.', ctx: 'pos' },
      { en: 'We are one mile south of the Bocas de Cenizas fairway buoy, inbound.', use: 'Referencia a boya de canal de entrada.', ctx: 'pos' },
      { en: 'What is your present position?', use: 'Solicitar la posición actual a otro buque.', ctx: 'pos' }
    ],
    "Requesting and Giving Traffic Info": [
      { en: 'What is the traffic situation in the approach channel?', use: 'Consultar al VTS sobre buques en el canal.', ctx: 'traffic' },
      { en: 'One vessel outbound in the main channel. Expect to meet at the northern bend.', use: 'VTS informa buque saliente.', ctx: 'traffic' },
      { en: 'Request permission to enter the fairway. We have a deep draft.', use: 'Solicitar autorización indicando calado.', ctx: 'traffic' },
      { en: 'There is a vessel at anchor in the fairway at position ten degrees North.', use: 'Avisar de un obstáculo en la derrota.', ctx: 'traffic' }
    ],
    "Reporting Course & Speed to VTS": [
      { en: 'I am altering course to starboard. New course two-seven-zero degrees.', use: 'Informar al VTS un cambio de rumbo.', ctx: 'vts' },
      { en: 'I am reducing speed. Present speed six knots.', use: 'Reportar reducción de velocidad al VTS.', ctx: 'vts' },
      { en: 'Altering course to port and reducing speed to allow inbound vessel to pass.', use: 'Reporte de maniobra combinada.', ctx: 'vts' },
      { en: 'Revised ETA Cartagena — zero-eight-thirty local time.', use: 'Actualizar la hora estimada de llegada.', ctx: 'vts' }
    ],
    "Describing a Passage Plan": [
      { en: 'We depart Barranquilla at zero-six-hundred. ETD is confirmed.', use: 'Inicio con puerto de salida y hora.', ctx: 'plan' },
      { en: 'First waypoint is Punta Canoas, bearing two-two-five, distance twelve miles.', use: 'Describir primer waypoint.', ctx: 'plan' },
      { en: 'There are shoals to port between waypoints two and three.', use: 'Señalar zonas de poca profundidad.', ctx: 'plan' },
      { en: 'ETA Cartagena pilot station is fourteen-hundred.', use: 'Hora de llegada al práctico.', ctx: 'plan' },
      { en: 'Average speed twelve knots. Course over ground two-four-zero degrees.', use: 'Velocidad y rumbo general.', ctx: 'plan' }
    ]
  },

  smcp: {
    "Position Reports": [
      { phrase: 'My position is ten degrees twenty-five minutes North, seventy-five degrees thirty-two minutes West.', type: 'Ejemplo — posición frente a Cartagena de Indias.', bdr: 'pos' },
      { phrase: 'My position is two miles northwest of Isla Tierra Bomba lighthouse, inbound.', type: 'Referencia visual — Caribe colombiano.', bdr: 'pos' },
      { phrase: 'My position is abeam Bocas de Cenizas entrance buoy.', type: 'Referencia al través (90° del buque).', bdr: 'pos' }
    ],
    "VTS Reports": [
      { phrase: 'Vessel Magdalena Star. Position: ten-twenty-eight North. Course: two-two-zero.', type: 'Reporte estandar de entrada a zona VTS.', bdr: 'vts' },
      { phrase: 'Cartagena VTS this is MV Magdalena Star. Inbound to Manga.', type: 'Reporte de llegada a destino final.', bdr: 'vts' },
      { phrase: 'Barranquilla VTS this is MV Rio Sinu. ETA pilot station zero-seven-hundred.', type: 'Reporte de aproximación a zona pilotaje.', bdr: 'vts' }
    ],
    "Traffic & Channel Info": [
      { phrase: 'What is the traffic situation in the approach channel?', type: 'Pregunta estándar antes de entrar al canal.', bdr: 'traffic' },
      { phrase: 'Is the fairway clear for inbound traffic?', type: 'Verificar si el canal está libre.', bdr: 'traffic' },
      { phrase: 'What is the depth in the main channel at present state of tide?', type: 'Relevante para buques de gran calado.', bdr: 'traffic' },
      { phrase: 'I have one vessel on my port bow. Crossing situation.', type: 'Reporte conforme a COLREGS Regla 15.', bdr: 'traffic' }
    ],
    "COLREGS Actions": [
      { phrase: 'I am altering course to starboard to pass astern of you.', type: 'Buque da paso informa maniobra.', bdr: 'colregs' },
      { phrase: 'I am the stand-on vessel. Maintaining course and speed.', type: 'Buque con prioridad confirma mantenimiento.', bdr: 'colregs' },
      { phrase: 'Vessel on my starboard bow — you are standing into danger.', type: 'Advertencia urgente de peligro colisión.', bdr: 'colregs' }
    ],
    "Navigational Procedures": [
      { phrase: 'I am proceeding to anchorage number four.', type: 'Informar intención de fondeo.', bdr: 'proc' },
      { phrase: 'Cross track error is zero-decimal-five miles to port.', type: 'Informar desvío de derrota.', bdr: 'proc' },
      { phrase: 'Pilot embarked. Proceeding to berth.', type: 'Inicio de atraque tras abordaje práctico.', bdr: 'proc' },
      { phrase: 'Average speed twelve knots. Course over ground two-four-zero.', type: 'Datos operacionales de navegación.', bdr: 'proc' }
    ]
  }
};

const PRACTICE = {
  vocab: [
    { text: 'Chart',               variants: ['chart', 'charts'] },
    { text: 'Compass',             variants: ['compass'] },
    { text: 'Echo sounder',        variants: ['echo sounder', 'echosounder'] },
    { text: 'Bearing',             variants: ['bearing'] },
    { text: 'Waypoint',            variants: ['waypoint'] },
    { text: 'Dead reckoning',      variants: ['dead reckoning'] },
    { text: 'Latitude',            variants: ['latitude'] },
    { text: 'Longitude',           variants: ['longitude'] },
    { text: 'Nautical mile',       variants: ['nautical mile'] },
    { text: 'Knot',                variants: ['knot', 'knots'] },
    { text: 'Fairway',             variants: ['fairway'] },
    { text: 'Lighthouse',          variants: ['lighthouse'] },
    { text: 'Passage plan',        variants: ['passage plan'] },
    { text: 'Rule of the Road',    variants: ['rule of the road'] },
    { text: 'Stand-on vessel',     variants: ['stand on vessel'] },
    { text: 'Give-way vessel',     variants: ['give way vessel'] },
    { text: 'Parallel index',      variants: ['parallel index'] },
    { text: 'Safe water mark',     variants: ['safe water mark'] },
    { text: 'Cardinal buoy',       variants: ['cardinal buoy'] },
    { text: 'Tidal stream',        variants: ['tidal stream'] },
    { text: 'Wreck',               variants: ['wreck'] },
    { text: 'Leading lights',      variants: ['leading lights'] }
  ],
  func: [
    { text: 'My position is ten degrees North, seventy-five degrees West.', variants: ['my position is ten degrees north seventy five degrees west'] },
    { text: 'What is your present position?',      variants: ['what is your present position'] },
    { text: 'Request permission to enter the fairway.', variants: ['request permission to enter the fairway'] },
    { text: 'What is the traffic situation?',      variants: ['what is the traffic situation'] },
    { text: 'I am altering course to starboard.', variants: ['i am altering course to starboard'] },
    { text: 'I am reducing speed.',                variants: ['i am reducing speed'] },
    { text: 'First waypoint is Punta Canoas.',     variants: ['first waypoint is punta canoas'] },
    { text: 'We depart Barranquilla at zero-six-hundred.', variants: ['we depart barranquilla at zero six hundred'] },
    { text: 'Request permission to anchor.',       variants: ['request permission to anchor'] },
    { text: 'Underway and making way.',            variants: ['underway and making way'] },
    { text: 'Report when passing buoy number four.', variants: ['report when passing buoy number four'] }
  ],
  smcp: [
    { text: 'My position is abeam entrance buoy.', variants: ['my position is abeam entrance buoy'] },
    { text: 'Is the fairway clear?',               variants: ['is the fairway clear'] },
    { text: 'Maintaining course and speed.',       variants: ['maintaining course and speed'] },
    { text: 'I am altering course to starboard.',  variants: ['i am altering course to starboard'] },
    { text: 'Altering course immediately.',       variants: ['altering course immediately'] },
    { text: 'Correcting course.',                  variants: ['correcting course'] },
    { text: 'Pilot embarked.',                     variants: ['pilot embarked'] },
    { text: 'Course over ground two-four-zero.',   variants: ['course over ground two four zero'] },
    { text: 'Speed over ground ten knots.',        variants: ['speed over ground ten knots'] },
    { text: 'Wait for pilot at pilot station.',    variants: ['wait for pilot at pilot station'] },
    { text: 'Depth over the bar is twelve metres.', variants: ['depth over the bar is twelve metres'] },
    { text: 'The fairway is closed due to traffic.', variants: ['the fairway is closed due to traffic'] }
  ]
};

// ── STATE ──────────────────────────────────────────────
const S_KEY = 'maritime_l11_u3_known';
const P_KEY = 'maritime_l11_u3_practice';
let knownItems = JSON.parse(localStorage.getItem(S_KEY) || '[]');
let masteredPhrases = JSON.parse(localStorage.getItem(P_KEY) || '[]');
const TOTAL_ITEMS = Object.values(CONTENT.vocab).flat().length + Object.values(CONTENT.func).flat().length + Object.values(CONTENT.smcp).flat().length;

// ── DOM ELEMENTS ───────────────────────────────────────
const modeBtns       = document.querySelectorAll('.mode-btn');
const sections       = document.querySelectorAll('.content-section');
const studyTabs      = document.querySelectorAll('.study-tab');
const tabPanels      = document.querySelectorAll('.tab-panel');
const progressPct    = document.getElementById('progress-pct');
const pbarFill       = document.querySelector('.pbar-fill');
const pbarLabel      = document.getElementById('pbar-label');
const progressFill   = document.querySelector('.pring-fill');
const statKnown      = document.getElementById('stat-known');
const statPracticed  = document.getElementById('stat-practiced');
const statRate       = document.getElementById('stat-rate');

// ── INITIALIZATION ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderStudyTab('vocab');
  updateProgress();
  setupEventListeners();
  initSpeech();
});

function setupEventListeners() {
  modeBtns.forEach(btn => btn.addEventListener('click', () => switchMode(btn.dataset.mode)));

  studyTabs.forEach(tab => tab.addEventListener('click', () => {
    studyTabs.forEach(t => t.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    renderStudyTab(tab.dataset.tab);
  }));

  document.getElementById('stats-btn').addEventListener('click', openStats);
  document.getElementById('close-stats-btn').addEventListener('click', () => document.getElementById('stats-modal').classList.add('hidden'));
  document.getElementById('expand-all-btn').addEventListener('click', () => document.querySelectorAll('.accordion').forEach(a => a.classList.add('is-open')));
  document.getElementById('collapse-all-btn').addEventListener('click', () => document.querySelectorAll('.accordion').forEach(a => a.classList.remove('is-open')));

  document.querySelectorAll('.theme-btn').forEach(btn => btn.addEventListener('click', () => {
    document.documentElement.setAttribute('data-theme', btn.dataset.theme);
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }));

  document.querySelectorAll('.pfilter-btn').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.pfilter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderPractice(btn.dataset.pfilter);
  }));
}

// ── CORE LOGIC ─────────────────────────────────────────
function switchMode(mode) {
  modeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  sections.forEach(s => s.classList.toggle('active', s.id === `${mode}-section`));
  if (mode === 'practice') {
     const activeBtn = document.querySelector('.pfilter-btn.active');
     const filter = activeBtn ? activeBtn.dataset.pfilter : 'vocab';
     renderPractice(filter);
  }
}

function renderStudyTab(tab) {
  const container = document.getElementById(`tab-${tab}`);
  container.innerHTML = '';
  const data = CONTENT[tab];

  Object.entries(data).forEach(([cat, items]) => {
    const acc = document.createElement('div');
    acc.className = 'accordion glass-card';
    acc.innerHTML = `
      <div class="accordion-header">
        <div class="acc-icon-box"><i class="fas fa-${tab === 'vocab' ? 'tags' : tab === 'func' ? 'bullhorn' : 'shield-halved'}"></i></div>
        <div class="acc-title-group">
          <div class="acc-title">${cat}</div>
          <div class="acc-count">${items.length} items</div>
        </div>
        <i class="fas fa-chevron-down acc-chevron"></i>
      </div>
      <div class="accordion-body">
        <div class="accordion-inner">
          ${items.map(item => renderItem(item, tab)).join('')}
        </div>
      </div>
    `;
    acc.querySelector('.accordion-header').addEventListener('click', () => acc.classList.toggle('is-open'));
    container.appendChild(acc);
  });
}

function renderItem(item, type) {
  const text = item.en || item.phrase;
  const id = `${type}_${text.replace(/\s+/g, '_').toLowerCase()}`;
  const isKnown = knownItems.includes(id);
  
  if (type === 'vocab') {
    const slug = toSlug((item.en || '').split('\n')[0]);
    return `
      <div class="item-row-wrap" data-id="${id}">
        <div class="item-row">
          <div class="item-en">${item.en}</div>
          <div class="item-es">${item.es}</div>
          <div class="item-controls">
            <button class="audio-btn image-toggle-btn" id="img-btn-${id}" style="display: none;" onclick="const c = document.getElementById('img-cont-${id}'); c.style.display = c.style.display === 'none' ? 'block' : 'none';" title="Toggle Image"><i class="fas fa-image"></i></button>
            ${renderAudioBtn(item.en)}
            <input type="checkbox" class="know-cb" ${isKnown ? 'checked' : ''} onchange="toggleKnown('${id}', this)">
          </div>
        </div>
        <div class="item-image-container" id="img-cont-${id}" style="display: none; text-align: center; margin-top: 10px; margin-bottom: 5px;">
          <img src="assets/${slug}.webp" 
               alt="${item.en}" 
               style="max-height: 200px; max-width: 100%; border-radius: 8px;" 
               onload="const b = document.getElementById('img-btn-${id}'); if(b) b.style.display='inline-block';"
               onerror="this.onerror=null; this.src='assets/${slug}.webp'; this.onerror=function(){ this.onerror=null; this.src='assets/${slug}.webp'; this.onerror=function(){ this.parentElement.style.display='none'; } }">
        </div>
      </div>
    `;
  } else if (type === 'func') {
    return `
      <div class="item-row-wrap" data-id="${id}">
        <div class="item-row">
          <div class="item-phrase"><span class="badge-ctx badge-${item.ctx}">${item.ctx.toUpperCase()}</span>${item.en}</div>
          <div class="item-controls">
            ${renderAudioBtn(item.en)}
            <input type="checkbox" class="know-cb" ${isKnown ? 'checked' : ''} onchange="toggleKnown('${id}', this)">
          </div>
        </div>
        <div class="item-row" style="padding-top:0;opacity:0.8"><div class="item-es" style="font-size:0.75rem">${item.use || item.es}</div></div>
      </div>
    `;
  } else if (type === 'smcp') {
    return `
      <div class="item-row-wrap smcp-card-row smcp-border-${item.bdr}" data-id="${id}">
        <div class="item-row">
          <div class="item-phrase smcp-phrase">${item.phrase}</div>
          <div class="item-controls">
            ${renderAudioBtn(item.phrase)}
            <input type="checkbox" class="know-cb" ${isKnown ? 'checked' : ''} onchange="toggleKnown('${id}', this)">
          </div>
        </div>
        <div class="item-row" style="padding-top:0;opacity:0.7">
          <div class="item-note"><i class="fas fa-info-circle"></i> ${item.type || item.note}</div>
        </div>
      </div>
    `;
  }
}

function renderAudioBtn(text) {
  return `<button class="audio-btn" onclick="playAudio('${text.replace(/'/g, "\\'")}', this)" title="Listen Pronunciation"><i class="fas fa-volume-up"></i></button>`;
}

function toSlug(text) {
  return text.toLowerCase()
    .replace(/\(s\)/g, 's')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');
}

function playAudio(text, btn) {
  if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
  const slug = toSlug(text.split('\n')[0]);
  const audio = new Audio(`audio/${slug}.mp3`);
  btn.classList.add('playing');
  audio.play()
    .then(() => { audio.onended = () => btn.classList.remove('playing'); })
    .catch(() => {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'en-US'; utt.rate = 0.85;
      const preferredVoice = getPreferredWindowsVoice();
      if (preferredVoice) utt.voice = preferredVoice;
      utt.onend = () => btn.classList.remove('playing');
      window.speechSynthesis.speak(utt);
    });
}

function getPreferredWindowsVoice() {
  if (!('speechSynthesis' in window)) return null;
  const isWindows = /Win/.test(navigator.platform) || /Windows/.test(navigator.userAgent);
  if (!isWindows) return null;
  const voices = window.speechSynthesis.getVoices();
  const mark = voices.find(v => v.name === 'Microsoft Mark - English (United States)');
  if (mark) return mark;
  const alternatives = [
    'Microsoft Zira - English (United States)',
    'Microsoft David - English (United States)',
    'Microsoft Aria - English (United States)'
  ];
  for (const name of alternatives) {
    const voice = voices.find(v => v.name === name);
    if (voice) return voice;
  }
  return null;
}

// ── Voice Selection Utility ─────────────────────────────
function getPreferredWindowsVoice() {
  if (!('speechSynthesis' in window)) return null;
  const isWindows = /Win/.test(navigator.platform) || /Windows/.test(navigator.userAgent);
  if (!isWindows) return null;
  const voices = window.speechSynthesis.getVoices();
  const mark = voices.find(v => v.name === 'Microsoft Mark - English (United States)');
  if (mark) return mark;
  const alternatives = [
    'Microsoft Zira - English (United States)',
    'Microsoft David - English (United States)',
    'Microsoft Aria - English (United States)'
  ];
  for (const name of alternatives) {
    const voice = voices.find(v => v.name === name);
    if (voice) return voice;
  }
  return null;
}

function toggleKnown(id, cb) {
  if (cb.checked) { if (!knownItems.includes(id)) knownItems.push(id); }
  else { knownItems = knownItems.filter(i => i !== id); }
  localStorage.setItem(S_KEY, JSON.stringify(knownItems));
  updateProgress();
}

function updateProgress() {
  const pct = Math.min(100, Math.round((knownItems.length / TOTAL_ITEMS) * 100));
  if (progressPct) progressPct.textContent = `${pct}%`;
  if (pbarFill) pbarFill.style.width = `${pct}%`;
  if (pbarLabel) pbarLabel.textContent = `${pct}% Completed`;
  if (progressFill) progressFill.style.strokeDashoffset = 150.796 - (150.796 * pct) / 100;
  const label = document.getElementById('progress-label');
  if (label) label.textContent = `${knownItems.length} of ${TOTAL_ITEMS} items mastered`;
}

function openStats() {
  statKnown.textContent = knownItems.length;
  statPracticed.textContent = masteredPhrases.length;
  statRate.textContent = TOTAL_ITEMS > 0 ? Math.min(100, Math.round((knownItems.length / TOTAL_ITEMS) * 100)) + '%' : '0%';
  document.getElementById('stats-modal').classList.remove('hidden');
}

let recognition = null;
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

function initSpeech() {
  if (!SpeechRec) return;
  document.getElementById('enable-mic-btn').addEventListener('click', () => {
    document.getElementById('mic-notice').classList.add('hidden');
    document.getElementById('practice-cards').classList.remove('hidden');
    try {
      const tempRec = new SpeechRec();
      tempRec.start();
      tempRec.stop();
    } catch (e) {}
  });
}

function renderPractice(filter) {
  const container = document.getElementById('practice-cards');
  container.innerHTML = '';
  PRACTICE[filter].forEach(item => {
    const card = document.createElement('div');
    card.className = 'practice-card glass-card';
    card.innerHTML = `
      <div class="practice-card-header"><span class="phrase-label">Phrase</span></div>
      <div class="practice-card-body">
        <div class="practice-phrase">${item.text}</div>
        <div class="practice-actions">
           ${renderAudioBtn(item.text)}
           <button class="record-btn" onclick="startRec('${item.text.replace(/'/g, "\\'")}', this)"><i class="fas fa-microphone"></i> Record</button>
        </div>
        <div class="rec-result hidden"></div>
      </div>`;
    container.appendChild(card);
  });
}

function startRec(target, btn) {
  if (!SpeechRec) return alert("Speech recognition not supported.");
  if (recognition) { try { recognition.abort(); } catch(e){} }
  
  recognition = new SpeechRec();
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Listening...';
  btn.classList.add('recording');
  
  try { recognition.start(); } catch (e) { console.error(e); }
  
  recognition.onresult = (e) => {
    const rawTranscript = e.results[0][0].transcript;
    const transcript = normalizeSpeech(rawTranscript);
    const targetClean = normalizeSpeech(target);
    const similarity = calculateSimilarity(transcript, targetClean);
    const resultDiv = btn.closest('.practice-card-body').querySelector('.rec-result');
    resultDiv.classList.remove('hidden');
    if (similarity >= 0.70) {
      resultDiv.innerHTML = `<div class="feedback-success"><i class="fas fa-check-circle"></i> Perfect Match! (${Math.round(similarity*100)}%)</div>`;
      if (!masteredPhrases.includes(target)) {
        masteredPhrases.push(target);
        localStorage.setItem(P_KEY, JSON.stringify(masteredPhrases));
      }
    } else {
      resultDiv.innerHTML = `<div class="feedback-error">Heard: "${transcript}"</div>`;
    }
  };
  recognition.onend = () => {
    btn.innerHTML = '<i class="fas fa-microphone"></i> Record';
    btn.classList.remove('recording');
  };
  recognition.onerror = () => {
    btn.innerHTML = '<i class="fas fa-microphone"></i> Record';
    btn.classList.remove('recording');
  };
}

function normalizeSpeech(text) {
  let norm = text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ");
  const dict = {
    'eta': 'e t a', 'm v': 'mv', 'arc': 'a r c',
    'tree': 'three', 'ait': 'eight', 'fife': 'five', 'niner': 'nine',
    'seelonce': 'silence', 'feenee': 'fini'
  };
  for (const [key, val] of Object.entries(dict)) {
    norm = norm.replace(new RegExp('\\b' + key.replace(/\./g, '\\.') + '\\b', 'g'), val);
  }
  const numMap = {'0':'zero','1':'one','2':'two','3':'three','4':'four','5':'five','6':'six','7':'seven','8':'eight','9':'nine'};
  norm = norm.replace(/[0-9]/g, m => ' ' + numMap[m] + ' ');
  return norm.replace(/\s+/g, ' ').trim();
}

function calculateSimilarity(s1, s2) {
    if (s1 === s2) return 1.0;
    const len1 = s1.length, len2 = s2.length;
    let matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
        }
    }
    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1.0 : (maxLen - matrix[len1][len2]) / maxLen;
}
