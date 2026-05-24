'use strict';
/* ════════════════════════════════════════════════════════
   GET UNDERWAY — Maritime English L1 · Unit 04
   Meteorology, Weather & Sea State
   script.js — Core application logic
   ════════════════════════════════════════════════════════ */

// ── Content Data ────────────────────────────────────────
const CONTENT = {
  vocab: {
    "Weather Elements": [
      { en: 'Wind speed',      es: 'Velocidad del viento' },
      { en: 'Wind direction',  es: 'Dirección del viento' },
      { en: 'Visibility',      es: 'Visibilidad' },
      { en: 'Air pressure',    es: 'Presión atmosférica' },
      { en: 'Temperature',     es: 'Temperatura' },
      { en: 'Humidity',        es: 'Humedad' },
      { en: 'Cloud cover',     es: 'Nubosidad' },
      { en: 'Precipitation',   es: 'Precipitación' }
    ],
    "Wind Force (Beaufort Scale)": [
      { en: 'Calm',            es: 'Calma (Fuerza 0)' },
      { en: 'Light air',       es: 'Ventolina (Fuerza 1)' },
      { en: 'Light breeze',    es: 'Brisa muy débil (Fuerza 2)' },
      { en: 'Gentle breeze',   es: 'Brisa débil (Fuerza 3)' },
      { en: 'Moderate breeze', es: 'Brisa moderada (Fuerza 4)' },
      { en: 'Fresh breeze',    es: 'Brisa fresca (Fuerza 5)' },
      { en: 'Strong breeze',   es: 'Brisa fuerte (Fuerza 6)' },
      { en: 'Near gale',       es: 'Viento fuerte (Fuerza 7)' },
      { en: 'Gale',            es: 'Temporal (Fuerza 8)' },
      { en: 'Strong gale',     es: 'Temporal fuerte (Fuerza 9)' },
      { en: 'Storm',           es: 'Temporal duro (Fuerza 10)' },
      { en: 'Violent storm',   es: 'Temporal muy duro (Fuerza 11)' },
      { en: 'Hurricane force', es: 'Huracán (Fuerza 12)' }
    ],
    "Visibility & Fog": [
      { en: 'Clear visibility',es: 'Visibilidad clara' },
      { en: 'Good visibility', es: 'Buena visibilidad' },
      { en: 'Moderate visibility',es: 'Visibilidad moderada' },
      { en: 'Poor visibility', es: 'Poca visibilidad' },
      { en: 'Mist',            es: 'Neblina' },
      { en: 'Fog',             es: 'Niebla' },
      { en: 'Dense fog',       es: 'Niebla densa' },
      { en: 'Smog',            es: 'Esmog / niebla con humo' }
    ],
    "Sea State & Waves": [
      { en: 'Smooth sea',      es: 'Mar llana / bonanza' },
      { en: 'Slight sea',      es: 'Marrizado' },
      { en: 'Moderate sea',    es: 'Marejada' },
      { en: 'Rough sea',       es: 'Fuerte marejada' },
      { en: 'Very rough sea',  es: 'Mar gruesa' },
      { en: 'High sea',        es: 'Mar muy gruesa' },
      { en: 'Very high sea',   es: 'Mar arbolada' },
      { en: 'Waves',           es: 'Olas' },
      { en: 'Swell',           es: 'Mar de fondo / oleaje' },
      { en: 'Breaking waves',  es: 'Rompientes' }
    ],
    "Weather Changes": [
      { en: 'Improving',       es: 'Mejorando' },
      { en: 'Deteriorating',   es: 'Deteriorándose / empeorando' },
      { en: 'Fair weather',    es: 'Buen tiempo' },
      { en: 'Storm warning',   es: 'Aviso de temporal' },
      { en: 'Gale warning',    es: 'Aviso de fuerte viento' },
      { en: 'Squall',          es: 'Chubasco / racha' },
      { en: 'Thunderstorm',    es: 'Tormenta eléctrica' }
    ]
  },

  func: {
    "Requesting and Giving Weather Information": [
      { en: 'What is the weather forecast for the area?', use: 'Solicitar pronóstico meteorológico.', ctx: 'req' },
      { en: 'The wind is expected to increase to force seven.', use: 'Informar aumento esperado del viento.', ctx: 'info' },
      { en: 'Visibility is reduced to less than one mile.', use: 'Informar reducción de visibilidad.', ctx: 'info' },
      { en: 'The sea is moderate with a heavy swell from the northwest.', use: 'Describir estado del mar y oleaje.', ctx: 'info' },
      { en: 'A storm warning is in effect for our position.', use: 'Informar advertencia de temporal activa.', ctx: 'info' }
    ],
    "Reporting Weather-Related Navigational Hazards": [
      { en: 'Danger of icing in the northern sectors.', use: 'Advertir sobre riesgo de engelamiento.', ctx: 'warn' },
      { en: 'Fog is expected to develop within the next two hours.', use: 'Advertir sobre formación de niebla.', ctx: 'warn' },
      { en: 'Tropical cyclone reported approaching position [coords].', use: 'Informar aproximación de ciclón tropical.', ctx: 'warn' },
      { en: 'Maintain extra lookout due to poor visibility.', use: 'Orden de vigilancia extra por mala visibilidad.', ctx: 'warn' }
    ]
  },

  smcp: {
    "Weather Reports & Warnings": [
      { phrase: 'Wind [direction] force Beaufort [number]', type: 'Reportar viento.', bdr: 'info' },
      { phrase: 'Visibility is [number] nautical miles.', type: 'Reportar visibilidad.', bdr: 'info' },
      { phrase: 'Sea state is [Beaufort number].', type: 'Reportar estado del mar.', bdr: 'info' },
      { phrase: 'The barometer is dropping rapidly.', type: 'Informar caída rápida de presión.', bdr: 'warn' },
      { phrase: 'Gale warning in area [name].', type: 'Aviso de viento fuerte en área específica.', bdr: 'warn' },
      { phrase: 'Caution: ice reported in position [coords].', type: 'Advertencia de hielo.', bdr: 'warn' }
    ]
  }
};

const PRACTICE = {
  vocab: [
    { text: 'Wind speed',      variants: ['wind speed'] },
    { text: 'Visibility',      variants: ['visibility'] },
    { text: 'Moderate breeze', variants: ['moderate breeze'] },
    { text: 'Rough sea',       variants: ['rough sea'] },
    { text: 'Swell',           variants: ['swell'] },
    { text: 'Fog',             variants: ['fog'] },
    { text: 'Thunderstorm',    variants: ['thunderstorm'] },
    { text: 'Hurricane force', variants: ['hurricane force'] },
    { text: 'Gentle breeze',   variants: ['gentle breeze'] },
    { text: 'Dense fog',       variants: ['dense fog'] },
    { text: 'Precipitation',   variants: ['precipitation'] }
  ],
  func: [
    { text: 'What is the weather forecast?', variants: ['what is the weather forecast'] },
    { text: 'Visibility is reduced to less than one mile.', variants: ['visibility is reduced to less than one mile'] },
    { text: 'A storm warning is in effect.', variants: ['a storm warning is in effect'] },
    { text: 'The sea is moderate with a heavy swell.', variants: ['the sea is moderate with a heavy swell'] },
    { text: 'Fog is expected to develop within two hours.', variants: ['fog is expected to develop within two hours'] }
  ],
  smcp: [
    { text: 'Wind northwest force six.', variants: ['wind northwest force six'] },
    { text: 'The barometer is dropping rapidly.', variants: ['the barometer is dropping rapidly'] },
    { text: 'Gale warning in area zero four.', variants: ['gale warning in area zero four'] },
    { text: 'Visibility is two nautical miles.', variants: ['visibility is two nautical miles'] },
    { text: 'Sea state is force seven.', variants: ['sea state is force seven'] }
  ]
};

// ── STATE ──────────────────────────────────────────────
const S_KEY = 'maritime_l11_u4_known';
const P_KEY = 'maritime_l11_u4_practice';
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
  document.querySelectorAll('.mode-btn').forEach(btn => btn.addEventListener('click', () => switchMode(btn.dataset.mode)));
  document.querySelectorAll('.study-tab').forEach(tab => tab.addEventListener('click', () => {
    document.querySelectorAll('.study-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
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
  const micBtn = document.getElementById('enable-mic-btn');
  if (micBtn) {
    micBtn.addEventListener('click', () => {
      document.getElementById('mic-notice').classList.add('hidden');
      document.getElementById('practice-cards').classList.remove('hidden');
      if (typeof SpeechRec !== 'undefined' && SpeechRec) {
        try {
          const tempRec = new SpeechRec();
          tempRec.start();
          tempRec.stop();
        } catch (e) {}
      }
    });
  }
}

// ── CORE LOGIC ─────────────────────────────────────────
function switchMode(mode) {
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  document.querySelectorAll('.content-section').forEach(s => s.classList.toggle('active', s.id === `${mode}-section`));
  
  if (mode === 'practice') {
    const activeBtn = document.querySelector('.pfilter-btn.active');
    const filter = activeBtn ? activeBtn.dataset.pfilter : 'vocab';
    // Ensure the first filter is active if none are
    if (!activeBtn) {
      const firstBtn = document.querySelector('.pfilter-btn');
      if (firstBtn) firstBtn.classList.add('active');
    }
    renderPractice(filter);
    
    // Smooth scroll to top of practice section
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <div class="acc-icon-box"><i class="fas fa-${tab==='vocab'?'tags':tab==='func'?'bullhorn':'shield-halved'}"></i></div>
        <div class="acc-title-group"><div class="acc-title">${cat}</div><div class="acc-count">${items.length} items</div></div>
        <i class="fas fa-chevron-down acc-chevron"></i>
      </div>
      <div class="accordion-body"><div class="accordion-inner">${items.map(item => renderItem(item, tab)).join('')}</div></div>
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
          <div class="item-controls">${renderAudioBtn(item.en)}<input type="checkbox" class="know-cb" ${isKnown?'checked':''} onchange="toggleKnown('${id}', this)"></div>
        </div>
        <div class="item-row" style="padding-top:0;opacity:0.8"><div class="item-es" style="font-size:0.75rem">${item.use}</div></div>
      </div>`;
  } else {
    return `
      <div class="item-row-wrap smcp-card-row smcp-border-${item.bdr}" data-id="${id}">
        <div class="item-row">
          <div class="item-phrase smcp-phrase">${item.phrase}</div>
          <div class="item-controls">${renderAudioBtn(item.phrase)}<input type="checkbox" class="know-cb" ${isKnown?'checked':''} onchange="toggleKnown('${id}', this)"></div>
        </div>
        <div class="item-row" style="padding-top:0;opacity:0.75"><div class="item-note"><i class="fas fa-info-circle"></i> ${item.type}</div></div>
      </div>`;
  }
}

function toSlug(text) {
  return text.toLowerCase()
    .replace(/\(s\)/g, 's')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');
}

function renderAudioBtn(text) {
  return `<button class="audio-btn" onclick="playAudio('${text.replace(/'/g, "\\'")}', this)" title="Listen Pronunciation"><i class="fas fa-volume-up"></i></button>`;
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

function toggleKnown(id, cb) {
  if (cb.checked) { if (!knownItems.includes(id)) knownItems.push(id); }
  else { knownItems = knownItems.filter(i => i !== id); }
  localStorage.setItem(S_KEY, JSON.stringify(knownItems));
  updateProgress();
}

function updateProgress() {
  const pct = Math.min(100, Math.round((knownItems.length / TOTAL_ITEMS) * 100));
  if (progressPct) progressPct.textContent = `${pct}%`;
  if (progressFill) progressFill.style.strokeDashoffset = 150.796 - (150.796 * pct) / 100;
  if (pbarFill) pbarFill.style.width = `${pct}%`;
  if (pbarLabel) pbarLabel.textContent = `${pct}% Completed`;
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
  // Handled in setupEventListeners
}

function renderPractice(filter) {
  const container = document.getElementById('practice-cards');
  container.innerHTML = '';
  PRACTICE[filter].forEach(item => {
    const card = document.createElement('div');
    card.className = 'practice-card glass-card';
    card.innerHTML = `
      <div class="practice-card-header">
        <span class="phrase-label">Phrase</span>
      </div>
      <div class="practice-card-body">
        <div class="practice-phrase">${item.text}</div>
        <div class="practice-actions">
           ${renderAudioBtn(item.text)}
           <button class="record-btn" onclick="startRec('${item.text.replace(/'/g, "\\'")}', this)">
             <i class="fas fa-microphone"></i> Record
           </button>
        </div>
        <div class="rec-result hidden"></div>
      </div>
    `;
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
      resultDiv.innerHTML = `<div class="feedback-error">Try again. Heard: "${transcript}"</div>`;
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

// ── Windows Voice Selection Utility ─────────────────────
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
