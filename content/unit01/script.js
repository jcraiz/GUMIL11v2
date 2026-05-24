'use strict';
/* ════════════════════════════════════════════════════════
   GET UNDERWAY — Maritime English L1 · Unit 1
   Introduction to Navigation & Shipboard Ops
   script.js — Core application logic
   ════════════════════════════════════════════════════════ */

// ── Content Data ────────────────────────────────────────
const CONTENT = {
  vocab: {
    "Basic Vessel Parts": [
      { en: 'Bow',            es: 'Proa' },
      { en: 'Stern',          es: 'Popa' },
      { en: 'Port',           es: 'Babor' },
      { en: 'Starboard',      es: 'Estribor' },
      { en: 'Bridge',         es: 'Puente de mando' },
      { en: 'Keel',           es: 'Quilla' },
      { en: 'Hull',           es: 'Casco' },
      { en: 'Rudder',         es: 'Timón' },
      { en: 'Propeller',      es: 'Hélice' },
      { en: 'Hatch',          es: 'Escotilla' },
      { en: 'Davit',          es: 'Pescante / Davit' },
      { en: 'Mooring cleat',  es: 'Cornamusa / Bita de amarre' },
      { en: 'Bollard',        es: 'Bolardo / Noray' },
      { en: 'Anchor',         es: 'Ancla' },
      { en: 'Windlass',       es: 'Molinete / Cabrestante proa' },
      { en: 'Capstan',        es: 'Cabrestante' }
    ],
    "Hull & Hull Openings": [
      { en: 'Superstructure', es: 'Superestructura' },
      { en: 'Funnel',         es: 'Chimenea' },
      { en: 'Forecastle',     es: 'Castillo de proa' },
      { en: 'Quarterdeck',    es: 'Alcázar / Cubierta de popa' },
      { en: 'Draft',          es: 'Calado' },
      { en: 'Freeboard',      es: 'Francobordo' },
      { en: 'Bulkhead',       es: 'Mamparo' },
      { en: 'Bilge',          es: 'Sentina' },
      { en: 'Ballast tank',   es: 'Tanque de lastre' },
      { en: 'Double bottom',  es: 'Doble fondo' },
      { en: 'Scupper',        es: 'Imbornal' },
      { en: 'Porthole',       es: 'Ojo de buey / Lumbrera' }
    ],
    "Ship Movements": [
      { en: 'Heave', es: 'Movimiento vertical (ascenso / descenso)' },
      { en: 'Sway',  es: 'Deriva lateral' },
      { en: 'Surge', es: 'Movimiento longitudinal' },
      { en: 'Yaw',   es: 'Guiñada (giro sobre eje vertical)' },
      { en: 'Pitch', es: 'Cabeceo (proa / popa arriba y abajo)' },
      { en: 'Roll',  es: 'Balance (de babor a estribor)' }
    ],
    "Navigational Instruments": [
      { en: 'GPS',           es: 'Sistema de posicionamiento global' },
      { en: 'Radar',         es: 'Radar (detección y telemetría por radio)' },
      { en: 'ARPA',          es: 'Ayuda de punteo de radar automática (evitar colisión)' },
      { en: 'ECDIS',         es: 'Sistema de información y visualización de cartas electrónicas' },
      { en: 'Echo Sounder',  es: 'Ecosonda (medición de profundidad)' },
      { en: 'AIS',           es: 'Sistema de identificación automática' },
      { en: 'Gyro Compass',  es: 'Girocompás (norte verdadero)' },
      { en: 'Magnetic Compass', es: 'Compás magnético' },
      { en: 'Speed Log',     es: 'Corredera (mide velocidad y distancia)' },
      { en: 'VDR',           es: 'Registrador de datos de la travesía (caja negra)' }
    ],
    "Maneuvering": [
      { en: 'Moor',         es: 'Atracar / amarrar' },
      { en: 'Unmoor',       es: 'Desamarrar' },
      { en: 'Make fast',    es: 'Firmar / asegurar el cabo' },
      { en: 'Cast off',     es: 'Soltar cabos / largar' },
      { en: 'Weigh anchor', es: 'Levar ancla' },
      { en: 'Let go',       es: 'Soltar / largar' },
      { en: 'Single up',    es: 'Dejar un solo cabo por banda' },
      { en: 'Take in slack',es: 'Cobrar cabo flojo' }
    ],
    "Shipboard Personnel": [
      { en: 'Master',              es: 'Capitán' },
      { en: 'Chief Officer',       es: 'Primer Oficial / Jefe de Cubierta' },
      { en: 'Second Officer',      es: 'Segundo Oficial' },
      { en: 'Third Officer',       es: 'Tercer Oficial' },
      { en: 'Pilot',               es: 'Práctico' },
      { en: 'Chief Engineer',      es: 'Jefe de Máquinas' },
      { en: 'Second Engineer',     es: 'Primer Oficial de Máquinas' },
      { en: 'Third Engineer',      es: 'Segundo Oficial de Máquinas' },
      { en: 'Boatswain (Bosun)',   es: 'Contramaestre' },
      { en: 'Fitter',              es: 'Mecánico / Fitter' },
      { en: 'Oiler',               es: 'Engrasador' },
      { en: 'Cook',                es: 'Cocinero' },
      { en: 'Messman',             es: 'Mozo de cámara' },
      { en: 'Ordinary Seaman',     es: 'Marinero ordinario' },
      { en: 'Helmsman',            es: 'Timonel' },
      { en: 'Cadet',               es: 'Cadete / Oficial en formación' }
    ]
  },

  func: {
    "Giving and Receiving Helm and Engine Orders": [
      { en: 'Midships',                          use: 'Timón al centro — neutralizar el ángulo de caña',   ctx: 'helm' },
      { en: 'Port ten / Starboard ten',          use: 'Poner 10° de caña a babor / estribor',              ctx: 'helm' },
      { en: 'Hard to port / Hard to starboard',  use: 'Timón todo a babor / estribor',                     ctx: 'helm' },
      { en: 'Slow ahead',                        use: 'Avante despacio',                                   ctx: 'engine' },
      { en: 'Half ahead / Full ahead',           use: 'Avante media / avante toda',                        ctx: 'engine' },
      { en: 'Stop engine(s)',                    use: 'Parar máquina(s)',                                   ctx: 'engine' },
      { en: 'Slow astern / Full astern',         use: 'Atrás despacio / atrás toda',                      ctx: 'engine' },
      { en: 'Port ten, aye. / Steering port ten.', use: 'Respuesta del timonel al recibir la orden',      ctx: 'reply' }
    ],
    "Watchkeeping & Handover Phrases": [
      { en: 'I have the watch.',               use: 'Tengo la guardia (asumir responsabilidad).',        ctx: 'watch' },
      { en: 'You have the watch.',             use: 'Usted tiene la guardia (ceder responsabilidad).',  ctx: 'watch' },
      { en: 'Relieve the watch.',              use: 'Relevar la guardia.',                               ctx: 'watch' },
      { en: 'Maintain a sharp lookout.',       use: 'Mantener una vigilancia atenta y constante.',      ctx: 'lookout' },
      { en: 'Steady course is zero-nine-five.',use: 'El rumbo estable es 095 grados.',                   ctx: 'course' },
      { en: 'No ships in sight.',              use: 'No hay buques a la vista.',                         ctx: 'lookout' }
    ],
    "Reporting Position Relative to the Berth": [
      { en: 'The bow is — metres from the jetty.', use: 'Informar distancia de la proa al muelle', ctx: 'dist' },
      { en: 'The stern is off the berth.',         use: 'La popa se ha alejado del puesto de atraque', ctx: 'dist' },
      { en: 'We are — metres off the buoy.',       use: 'Indicar distancia a la boya', ctx: 'dist' },
      { en: 'Port side to the quay.',              use: 'Atracando por babor al muelle', ctx: 'dist' }
    ],
    "Coordinating Maneuvers with the Pilot": [
      { en: 'Pilot is on board.',              use: 'Confirmar que el práctico ha embarcado', ctx: 'pilot' },
      { en: 'What are your intentions, Pilot?', use: 'Solicitar el plan de maniobra al práctico', ctx: 'pilot' },
      { en: 'Ready fore and aft.',             use: 'Tripulación lista en proa y popa', ctx: 'crew' },
      { en: 'Tug is made fast forward / aft.', use: 'Remolcador amarrado a proa / popa', ctx: 'tug' }
    ],
    "Recording Events in the Deck Logbook": [
      { en: '0830 — Pilot embarked at pilot station.',      use: 'Entrada de embarque del práctico con hora', ctx: 'log' },
      { en: '1200 — All fast, port side to Berth No. 3.',  use: 'Entrada de conclusión de atraque', ctx: 'log' },
      { en: '1430 — Anchored in — metres of water.',       use: 'Entrada de fondeo con calado de agua', ctx: 'log' },
      { en: 'Vessel departed berth. All lines clear.',      use: 'Entrada de salida del puesto de atraque', ctx: 'log' }
    ]
  },

  smcp: {
    "Helm Orders": [
      { phrase: 'Midships',                          type: 'Timón al centro. Respuesta del timonel: "Midships, aye."', bdr: 'helm' },
      { phrase: 'Port / Starboard [number] degrees', type: 'Ej: "Port fifteen." → Timonel: "Port fifteen, aye. Steering port fifteen."', bdr: 'helm' },
      { phrase: 'Hard to port / Hard to starboard',  type: 'Todo el ángulo de caña disponible a babor o estribor.', bdr: 'helm' },
      { phrase: 'Nothing to port / Nothing to starboard', type: 'No caer a babor / estribor del rumbo ordenado.', bdr: 'helm' },
      { phrase: 'Steady / Steady as she goes',       type: 'Mantener el rumbo actual en el momento de la orden.', bdr: 'helm' }
    ],
    "Lookout Reporting": [
      { phrase: 'Object on port bow!',              type: 'Avistamiento de objeto por la amura de babor.', bdr: 'lookout' },
      { phrase: 'Ship of [vessel type] crossing from port.', type: 'Buque cruzando por babor.', bdr: 'lookout' },
      { phrase: 'Buoy on the starboard side.',      type: 'Boya avistada por estribor.', bdr: 'lookout' },
      { phrase: 'Lights in sight on the horizon.',  type: 'Luces avistadas en el horizonte.', bdr: 'lookout' },
      { phrase: 'Fishing vessel dead ahead.',       type: 'Buque pesquero justo por la proa.', bdr: 'lookout' }
    ],
    "Engine Orders": [
      { phrase: 'Slow / Half / Full ahead',  type: 'Avante: despacio / media / toda. Respuesta: "Slow ahead, aye."', bdr: 'engine' },
      { phrase: 'Stop engine(s)',            type: 'Máquina(s) al paro. Respuesta: "Stop engine, aye."', bdr: 'engine' },
      { phrase: 'Slow / Half / Full astern', type: 'Atrás: despacio / media / toda.', bdr: 'engine' },
      { phrase: 'Stand by engine(s)',        type: 'Máquinas listas para maniobra — antes de entrar a puerto.', bdr: 'engine' },
      { phrase: 'Finished with engine(s)',   type: 'Fin de la maniobra. Máquinas fuera de servicio operativo.', bdr: 'engine' }
    ],
    "Anchoring & Mooring": [
      { phrase: 'Let go!',             type: 'Soltar el ancla o largar el cabo. Orden inmediata, sin demora.', bdr: 'moor' },
      { phrase: 'Let go all lines!',   type: 'Soltar todos los cabos de amarre simultáneamente.', bdr: 'moor' },
      { phrase: 'Anchor is away.',     type: 'El ancla ha salido del escoben / ha dejado el fondo.', bdr: 'moor' },
      { phrase: 'Anchor is clear.',    type: 'El ancla está libre (no enganchada, no enredada).', bdr: 'moor' },
      { phrase: 'Anchor is holding.',  type: 'El ancla está agarrada al fondo y el buque no garrea.', bdr: 'moor' },
      { phrase: 'Heave away! / Heave to!', type: 'Virar / cobrar la cadena.', bdr: 'moor' }
    ],
    "Procedural Phrases": [
      { phrase: 'Understood.',             type: 'He recibido y entendido el mensaje. Uso formal en VHF / SMCP.', bdr: 'conf' },
      { phrase: 'Wilco.',                  type: '"Will comply" — Entendido y cumpliré la instrucción.', bdr: 'conf' },
      { phrase: 'Say again.',              type: 'Solicitar que se repita el mensaje. No usar "repeat" en VHF (ambiguo).', bdr: 'conf' },
      { phrase: 'Affirmative. / Negative.',type: 'Preferir sobre "yes/no" en comunicaciones formales de VHF.', bdr: 'conf' },
      { phrase: 'Correct. / Incorrect.',   type: 'Confirmar o corregir información recibida en una comunicación.', bdr: 'conf' },
      { phrase: 'Stand by.',               type: 'Solicitar que se espere respuesta o acción inminente.', bdr: 'conf' },
      { phrase: 'Over. / Out.',            type: '"Over" = esperando respuesta; "Out" = comunicación terminada.', bdr: 'conf' }
    ]
  }
};

const PRACTICE = {
  vocab: [
    { text: 'Bow',           variants: ['bow'] },
    { text: 'Stern',         variants: ['stern'] },
    { text: 'Bridge',        variants: ['bridge'] },
    { text: 'GPS',           variants: ['gps'] },
    { text: 'Radar',         variants: ['radar'] },
    { text: 'Draft',         variants: ['draft', 'draught'] },
    { text: 'Chief Officer', variants: ['chief officer'] },
    { text: 'Gyro Compass',  variants: ['gyro compass'] },
    { text: 'Boatswain',     variants: ['boatswain', 'bosun'] },
    { text: 'Superstructure',variants: ['superstructure'] },
    { text: 'Propeller',     variants: ['propeller'] },
    { text: 'Keel',          variants: ['keel'] },
    { text: 'Windlass',      variants: ['windlass'] },
    { text: 'Chief Engineer',variants: ['chief engineer'] }
  ],
  func: [
    { text: 'I have the watch.',               variants: ['i have the watch'] },
    { text: 'You have the watch.',             variants: ['you have the watch'] },
    { text: 'Maintain a sharp lookout.',       variants: ['maintain a sharp lookout'] },
    { text: 'Midships',                        variants: ['midships'] },
    { text: 'Slow ahead',                      variants: ['slow ahead'] },
    { text: 'I request to relieve the watch.', variants: ['i request to relieve the watch'] },
    { text: 'The bow is ten metres from the jetty.', variants: ['the bow is ten metres from the jetty'] }
  ],
  smcp: [
    { text: 'Object on port bow!',             variants: ['object on port bow'] },
    { text: 'Ship crossing from port.',        variants: ['ship crossing from port'] },
    { text: 'Anchor is holding.',              variants: ['anchor is holding'] },
    { text: 'Wilco.',                          variants: ['wilco'] },
    { text: 'Steady as she goes.',             variants: ['steady as she goes'] },
    { text: 'Let go all lines.',               variants: ['let go all lines'] }
  ]
};

// ── STATE ──────────────────────────────────────────────
const S_KEY = 'maritime_l11_u1_known';
const P_KEY = 'maritime_l11_u1_practice';
let knownItems = JSON.parse(localStorage.getItem(S_KEY) || '[]');
let masteredPhrases = JSON.parse(localStorage.getItem(P_KEY) || '[]');
const TOTAL_ITEMS = (() => {
  let n = 0;
  Object.values(CONTENT.vocab).forEach(arr => n += arr.length);
  Object.values(CONTENT.func).forEach(arr => n += arr.length);
  Object.values(CONTENT.smcp).forEach(arr => n += arr.length);
  return n;
})();

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
  if (mode === 'practice') renderPractice('vocab');
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
        <div class="accordion-footer">
          <span class="text-muted" style="font-size:0.75rem">Mark section as known:</span>
          <input type="checkbox" class="section-cb" onchange="toggleSection('${cat.replace(/'/g, "\\'")}', '${tab}', this)">
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
        <div class="item-row" style="padding-top:0;opacity:0.8"><div class="item-es" style="font-size:0.75rem">${item.use}</div></div>
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
          <div class="item-note"><i class="fas fa-info-circle"></i> ${item.type}${item.note ? ': ' + item.note : ''}</div>
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
  const audioPath = `audio/${slug}.mp3`;
  const audio = new Audio(audioPath);
  
  btn.classList.add('playing');

  audio.play()
    .then(() => {
      audio.onended = () => btn.classList.remove('playing');
    })
    .catch(() => {
      // Fallback to TTS with Windows-preferred voice
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'en-US';
      utt.rate = 0.85;
      const preferredVoice = getPreferredWindowsVoice();
      if (preferredVoice) {
        utt.voice = preferredVoice;
      } else {
        // Fallback to original logic for non-Windows
        const voices = window.speechSynthesis.getVoices();
        const fallback = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
        if (fallback) utt.voice = fallback;
      }

      utt.onend = () => btn.classList.remove('playing');
      window.speechSynthesis.speak(utt);
    });
}

// ── Voice Selection Utility ─────────────────────────────
function getPreferredWindowsVoice() {
  if (!('speechSynthesis' in window)) return null;
  const isWindows = /Win/.test(navigator.platform) || /Windows/.test(navigator.userAgent);
  if (!isWindows) return null;
  
  const voices = window.speechSynthesis.getVoices();
  // Primary: Microsoft Mark (natural male voice on Windows)
  const mark = voices.find(v => v.name === 'Microsoft Mark - English (United States)');
  if (mark) return mark;
  
  // Fallbacks: Other natural Windows voices
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

// ── PROGRESS ───────────────────────────────────────────
function toggleKnown(id, cb) {
  if (cb.checked) {
    if (!knownItems.includes(id)) knownItems.push(id);
  } else {
    knownItems = knownItems.filter(i => i !== id);
  }
  localStorage.setItem(S_KEY, JSON.stringify(knownItems));
  updateProgress();
}

function toggleSection(cat, type, cb) {
  const items = CONTENT[type][cat];
  items.forEach(item => {
    const text = item.en || item.phrase;
    const id = `${type}_${text.replace(/\s+/g, '_').toLowerCase()}`;
    if (cb.checked) {
      if (!knownItems.includes(id)) knownItems.push(id);
    } else {
      knownItems = knownItems.filter(i => i !== id);
    }
  });
  localStorage.setItem(S_KEY, JSON.stringify(knownItems));
  renderStudyTab(type);
  updateProgress();
}

function updateProgress() {
  const pct = Math.min(100, Math.round((knownItems.length / TOTAL_ITEMS) * 100));
  if (progressPct) progressPct.textContent = `${pct}%`;
  if (pbarLabel) pbarLabel.textContent = `${pct}% Completed`;
  if (pbarFill) pbarFill.style.width = `${pct}%`;
  
  if (progressFill) {
    const offset = 151 - (151 * pct) / 100;
    progressFill.style.strokeDashoffset = offset;
  }
  
  const label = document.getElementById('progress-label');
  if (label) label.textContent = `${knownItems.length} of ${TOTAL_ITEMS} items mastered`;
}

function openStats() {
  statKnown.textContent = knownItems.length;
  statPracticed.textContent = masteredPhrases.length;
  statRate.textContent = TOTAL_ITEMS > 0 ? Math.min(100, Math.round((knownItems.length / TOTAL_ITEMS) * 100)) + '%' : '0%';
  document.getElementById('stats-modal').classList.remove('hidden');
}

// ── PRACTICE (SPEECH) ──────────────────────────────────
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
