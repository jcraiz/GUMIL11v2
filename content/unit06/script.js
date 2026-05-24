/**
 * MARITIME ENGLISH LEVEL 1 — UNIT 06: RADIOTELEPHONY
 * "ADMIRALTY GLASS" Standard Procedure
 */

// ── DATA STRUCTURES ──────────────────────────────────────

const vocab = [
  {
    category: "Radiotelephony Procedure",
    icon: "fa-radio",
    items: [
      { en: "Call sign", es: "Indicativo de llamada / señal de llamada" },
      { en: "Hailing channel (Ch 16)", es: "Canal de llamada y socorro (canal 16)" },
      { en: "Working channel", es: "Canal de trabajo (canal operativo)" },
      { en: "Switching channels", es: "Cambio de canal" },
      { en: "Over", es: "Cambio (espero respuesta)" },
      { en: "Out", es: "Fuera (comunicación terminada)" },
      { en: "Roger", es: "Recibido (entendí el mensaje)" },
      { en: "Wilco", es: "Entendido y cumpliré (will comply)" },
      { en: "Say again", es: "Repita / diga de nuevo" },
      { en: "Stand by", es: "Espere / en espera" },
      { en: "Silence please", es: "Silencio en el canal (orden de guardar silencio)" },
      { en: "Seelonce Mayday", es: "Silencio de socorro absoluto en el canal" },
      { en: "Seelonce Feenee", es: "Fin del silencio de socorro" },
      { en: "Affirmative", es: "Afirmativo (sí)" },
      { en: "Negative", es: "Negativo (no)" },
      { en: "Correct", es: "Correcto (confirma información recibida)" },
      { en: "Wrong / Incorrect", es: "Incorrecto (niega información recibida)" },
      { en: "I spell", es: "Deletreo (introduce un deletreo fonético)" },
      { en: "In figures", es: "En cifras (los datos siguientes son números)" },
      { en: "In words", es: "En palabras (los datos siguientes se dicen en palabras)" },
      { en: "All stations", es: "A todas las estaciones (llamada general)" },
      { en: "Unknown station", es: "Estación desconocida (identidad no confirmada)" },
      { en: "Interco", es: "Código Internacional de Señales" },
      { en: "Relay", es: "Retransmisión (reenviar un mensaje a otro destinatario)" }
    ]
  },
  {
    category: "Types of Radio Traffic",
    icon: "fa-rss",
    items: [
      { en: "Distress traffic", es: "Tráfico de socorro (Mayday — máxima prioridad)" },
      { en: "Urgency traffic", es: "Tráfico de urgencia (Pan-Pan — segunda prioridad)" },
      { en: "Safety traffic", es: "Tráfico de seguridad (Sécurité — tercera prioridad)" },
      { en: "Routine traffic", es: "Tráfico rutinario (operaciones normales)" },
      { en: "Port operations traffic", es: "Tráfico de operaciones portuarias" },
      { en: "Ship movement traffic", es: "Tráfico de movimiento de buques (VTS)" },
      { en: "Intership traffic", es: "Tráfico entre buques" },
      { en: "Public correspondence", es: "Correspondencia pública (llamadas a tierra)" }
    ]
  },
  {
    category: "Communication Failures",
    icon: "fa-triangle-exclamation",
    items: [
      { en: "Poor signal", es: "Señal débil / mala calidad de señal" },
      { en: "Interference", es: "Interferencia en el canal" },
      { en: "Static", es: "Estática / ruido de fondo" },
      { en: "Broken transmission", es: "Transmisión entrecortada / cortada" },
      { en: "Garbled message", es: "Mensaje incomprensible / distorsionado" },
      { en: "Radio silence", es: "Silencio de radio (obligatorio en socorro)" },
      { en: "Out of range", es: "Fuera de alcance / cobertura insuficiente" },
      { en: "Dead spot", es: "Zona sin cobertura" },
      { en: "Double keying", es: "Doble pulsación / dos estaciones transmitiendo a la vez" },
      { en: "Read you strength 1 to 5", es: "Le recibo — calidad de señal del 1 al 5" },
      { en: "Nothing heard", es: "Sin recepción / no se recibe nada" },
      { en: "Radio check", es: "Prueba de radio (verificar funcionamiento)" }
    ]
  },
  {
    category: "Radio Equipment & GMDSS",
    icon: "fa-tower-cell",
    items: [
      { en: "VHF radio", es: "Radio VHF (Very High Frequency — 156–174 MHz)" },
      { en: "MF / HF radio", es: "Radio MF/HF (onda media / onda corta)" },
      { en: "DSC (Digital Selective Calling)", es: "LSD — Llamada Selectiva Digital" },
      { en: "MMSI number", es: "Número de Identificación del Servicio Móvil Marítimo" },
      { en: "Inmarsat", es: "Sistema de comunicación satelital marino" },
      { en: "EPIRB", es: "Radiobaliza de emergencia (406 MHz — COSPAS-SARSAT)" },
      { en: "SART (Search and Rescue Transponder)", es: "Transpondedor de búsqueda y rescate" },
      { en: "Handheld VHF", es: "Radio VHF portátil / handie-talkie" },
      { en: "Watch keeping", es: "Escucha permanente en canal 16" },
      { en: "GMDSS sea area", es: "Área marítima GMDSS (A1, A2, A3, A4)" },
      { en: "Radio log", es: "Diario de radio / registro de comunicaciones" },
      { en: "Squelch", es: "Silenciador (filtro de ruido en radio VHF)" }
    ]
  },
  {
    category: "Colombian Authorities",
    icon: "fa-building-shield",
    items: [
      { en: "Colombian Navy", es: "Armada de Colombia" },
      { en: "Colombian Coast Guard", es: "Guardia Costera colombiana" },
      { en: "Maritime Authority (DIMAR)", es: "Dirección General Marítima" },
      { en: "MRCC Cartagena", es: "Centro Coordinador de Rescate Marítimo de Cartagena" },
      { en: "CIOH", es: "Centro de Investigaciones Oceanográficas e Hidrográficas" },
      { en: "Cartagena Radio", es: "Estación costera de Cartagena" },
      { en: "Barranquilla Radio", es: "Estación costera de Barranquilla" },
      { en: "Port Captain's Office", es: "Capitanía de Puerto" },
      { en: "Port Control", es: "Control de puerto / VTS" },
      { en: "Rescue Coordination Centre (RCC)", es: "Centro Coordinador de Rescate (CCR)" },
      { en: "SAR (Search and Rescue)", es: "Búsqueda y rescate" },
      { en: "INAMET", es: "Instituto Nacional de Meteorología (Colombia)" }
    ]
  },
  {
    category: "Phonetic Alphabet",
    icon: "fa-font",
    items: [
      { en: "Alpha", es: "A (AL-fah)" },
      { en: "Bravo", es: "B (BRAH-voh)" },
      { en: "Charlie", es: "C (CHAR-lee)" },
      { en: "Delta", es: "D (DEL-tah)" },
      { en: "Echo", es: "E (EK-oh)" },
      { en: "Foxtrot", es: "F (FOKS-trot)" },
      { en: "Golf", es: "G (Golf)" },
      { en: "Hotel", es: "H (hoh-TEL)" },
      { en: "India", es: "I (IN-dee-ah)" },
      { en: "Juliett", es: "J (JEW-lee-et)" },
      { en: "Kilo", es: "K (KEY-loh)" },
      { en: "Lima", es: "L (LEE-mah)" },
      { en: "Mike", es: "M (Mike)" },
      { en: "November", es: "N (no-VEM-ber)" },
      { en: "Oscar", es: "O (OSS-car)" },
      { en: "Papa", es: "P (pah-PAH)" },
      { en: "Quebec", es: "Q (keh-BEK)" },
      { en: "Romeo", es: "R (ROW-me-oh)" },
      { en: "Sierra", es: "S (see-AIR-rah)" },
      { en: "Tango", es: "T (TANG-go)" },
      { en: "Uniform", es: "U (YOU-nee-form)" },
      { en: "Victor", es: "V (VIK-tah)" },
      { en: "Whiskey", es: "W (WISS-key)" },
      { en: "X-ray", es: "X (ECKS-ray)" },
      { en: "Yankee", es: "Y (YANG-key)" },
      { en: "Zulu", es: "Z (ZOO-loo)" }
    ]
  },
  {
    category: "Radiotelephony Numbers",
    icon: "fa-hashtag",
    items: [
      { en: "Zero", es: "0 (ZE-RO)" },
      { en: "One", es: "1 (WUN)" },
      { en: "Two", es: "2 (TOO)" },
      { en: "Three", es: "3 (TREE)" },
      { en: "Four", es: "4 (FOW-ER)" },
      { en: "Five", es: "5 (FIFE)" },
      { en: "Six", es: "6 (SIX)" },
      { en: "Seven", es: "7 (SEV-EN)" },
      { en: "Eight", es: "8 (AIT)" },
      { en: "Nine", es: "9 (NIN-ER)" }
    ]
  }
];

const func = [
  {
    category: "Establishing and Closing Contact",
    icon: "fa-headset",
    items: [
      { phrase: "Cartagena Radio, Cartagena Radio, Cartagena Radio — this is MV Magdalena Star, MV Magdalena Star, MV Magdalena Star — Over.", note: "Llamada inicial estándar en canal 16." },
      { phrase: "MV Magdalena Star — this is Cartagena Radio — go to working channel six-seven — Over.", note: "Orden de cambio al canal de trabajo." },
      { phrase: "Cartagena Radio — this is MV Magdalena Star — switching to channel six-seven — Over.", note: "Confirmación del cambio de canal." },
      { phrase: "Cartagena Radio — this is MV Magdalena Star — message received — returning to channel one-six — Out.", note: "Cierre estándar y regreso al canal 16." },
      { phrase: "MV Rio Sinú, MV Rio Sinú — this is MV Caribe Star — are you on channel one-six? — Over.", note: "Llamada buque a buque." },
      { phrase: "Cartagena Radio — this is MV Caribe Star — radio check on channel one-six — Over.", note: "Solicitar prueba de radio." },
      { phrase: "MV Caribe Star — this is Cartagena Radio — reading you strength four — signal good — Over.", note: "Respuesta a prueba de radio." }
    ]
  },
  {
    category: "Spelling Critical Data",
    icon: "fa-spell-check",
    items: [
      { phrase: "My vessel name is Caribe Star — I spell: Charlie, Alpha, Romeo, India, Bravo, Echo — Sierra, Tango, Alpha, Romeo — Over.", note: "Deletreo de nombre de buque." },
      { phrase: "My call sign is Hotel, Kilo, Alpha, Bravo, four — Over.", note: "Deletreo de indicativo." },
      { phrase: "Position: in figures — one-zero degrees, two-fife minutes North — in figures — seven-fife degrees, tree-two minutes West — Over.", note: "Deletreo de posición." },
      { phrase: "Waypoint name is Barú — I spell: Bravo, Alpha, Romeo, Uniform — Over.", note: "Deletreo de nombre de punto." }
    ]
  },
  {
    category: "Interference and Misunderstandings",
    icon: "fa-triangle-exclamation",
    items: [
      { phrase: "Your message was broken. Say again all after position. Over.", note: "Solicitar repetición parcial." },
      { phrase: "I am reading you strength two. Signal is weak and broken. Please speak slowly and clearly. Over.", note: "Informar señal débil." },
      { phrase: "You said channel six-seven. I confirm — channel six-seven. That is correct? Over.", note: "Confirmar dato malentendido." },
      { phrase: "Negative. I said channel seven-seven, not six-seven. I spell: seven-seven. Over.", note: "Corregir malentendido." },
      { phrase: "There is interference on this channel. Please stand by while we switch to channel six-eight. Over.", note: "Cambio por interferencia." },
      { phrase: "Unknown station transmitting on channel one-six — nothing heard — please identify yourself and go to a working channel. Over.", note: "Aviso a estación sin identificación." }
    ]
  },
  {
    category: "Colombian Authorities Info",
    icon: "fa-building-shield",
    items: [
      { phrase: "MRCC Cartagena, MRCC Cartagena — this is MV Caribe Star — we have a medical emergency on board — requesting medical advice — Over.", note: "Llamada al MRCC — emergencia." },
      { phrase: "Cartagena Port Control — this is MV Magdalena Star — inbound, ETA pilot station zero-eight-thirty — requesting berth allocation — Over.", note: "Llamada a Control Puerto." },
      { phrase: "Cartagena Radio — this is MV Caribe Star — requesting latest weather forecast for the Colombian Caribbean coast — Over.", note: "Solicitud de meteo CIOH." },
      { phrase: "Colombian Coast Guard — this is MV Caribe Star — reporting departure from Cartagena — bound for Barranquilla — ETA eighteen-hundred — souls on board: twenty-two — Over.", note: "Reporte de zarpe a Guardacostas." }
    ]
  }
];

const smcp = [
  {
    category: "Routine Contact Sequence",
    icon: "fa-list-check",
    items: [
      { phrase: "Cartagena Radio, Cartagena Radio, Cartagena Radio. This is MV Magdalena Star, MV Magdalena Star. Over.", type: "Routine Contact", note: "Initial call — Ch 16" },
      { phrase: "MV Magdalena Star — this is Cartagena Radio. Go to working channel six-seven. Over.", type: "Routine Contact", note: "Station responds — Ch 16" },
      { phrase: "Cartagena Radio — this is MV Magdalena Star. Switching to channel six-seven. Over.", type: "Routine Contact", note: "Vessel confirms switch" },
      { phrase: "Cartagena Radio — this is MV Magdalena Star. Position: ten degrees twenty-five minutes North, seventy-five degrees thirty-two minutes West. Course: two-two-zero, speed: ten knots. ETA Cartagena pilot station: one-four-three-zero. Over.", type: "Routine Contact", note: "Message — working channel" },
      { phrase: "MV Magdalena Star — this is Cartagena Radio. Roger — understood — berth two-seven assigned. Pilot available at one-four-hundred. Out.", type: "Routine Contact", note: "Station acknowledges" },
      { phrase: "Cartagena Radio — this is MV Magdalena Star. Roger — returning to channel one-six. Out.", type: "Routine Contact", note: "Vessel closes contact" }
    ]
  },
  {
    category: "Spelling",
    icon: "fa-spell-check",
    items: [
      { phrase: "I spell:", type: "Spelling", note: "La frase 'I spell' siempre precede al deletreo." },
      { phrase: "My call sign is Hotel, Kilo, Alpha, Bravo, four. Over.", type: "Spelling", note: "Indicativo colombiano deletreado — prefijo HK" },
      { phrase: "Vessel name: Providencia Star. I spell: Papa, Romeo, Oscar, Victor, India, Delta, Echo, November, Charlie, India, Alpha — Sierra, Tango, Alpha, Romeo. Over.", type: "Spelling", note: "Deletreo de nombre de buque." }
    ]
  },
  {
    category: "Numbers",
    icon: "fa-hashtag",
    items: [
      { phrase: "Course: two-two-zero degrees. Speed: in figures — one-zero knots. Depth: in figures — fife-fife metres.", type: "Numbers", note: "Números en contexto de navegación" },
      { phrase: "Time: in figures — one-four-tree-zero. ETA: zero-ait-tree-zero.", type: "Numbers", note: "Horas en formato 24h" },
      { phrase: "Position: in figures — one-zero degrees, two-fife minutes North, seven-fife degrees, tree-two minutes West.", type: "Numbers", note: "Coordenadas geográficas" },
      { phrase: "Channel: six-seven.", type: "Numbers", note: "Canales VHF" }
    ]
  },
  {
    category: "Interference",
    icon: "fa-triangle-exclamation",
    items: [
      { phrase: "Your message was broken. Say again all after", type: "Interference", note: "Solicitud de repetición parcial después." },
      { phrase: "Say again all before", type: "Interference", note: "Repetición del comienzo del mensaje." },
      { phrase: "I am reading you strength", type: "Interference", note: "Informe de calidad de señal." },
      { phrase: "Silence please. I have traffic for all stations. Out.", type: "Interference", note: "Orden de silencio en el canal." }
    ]
  },
  {
    category: "Agencies",
    icon: "fa-building-shield",
    items: [
      { phrase: "MRCC Cartagena, MRCC Cartagena — this is MV Caribe Star — Call sign: Hotel, Kilo, Alpha, Bravo, four — Requesting SAR coordination — Over.", type: "Agencies", note: "Llamada al MRCC" },
      { phrase: "Colombian Coast Guard — this is MV Magdalena Star — Reporting position: in figures — one-zero degrees, two-fife minutes North, seven-fife degrees, tree-two minutes West — Course: two-four-zero — speed: ten knots — Destination: Barranquilla — ETA: one-ait-zero-zero — Souls on board: in figures — tree-zero — Over.", type: "Agencies", note: "Reporte de Guardia Costera" },
      { phrase: "Cartagena Radio — this is MV Caribe Star — Request latest CIOH weather bulletin for Colombian Caribbean area — Over.", type: "Agencies", note: "Solicitud de meteorología CIOH" }
    ]
  },
  {
    category: "Procedures",
    icon: "fa-clipboard-list",
    items: [
      { phrase: "This is MV Caribe Star — radio check — channel one-six — Over.", type: "Procedures", note: "Prueba de radio" },
      { phrase: "Stand by channel one-six. I will call you on channel", type: "Procedures", note: "Solicitar espera" },
      { phrase: "Message received. Returning to channel one-six. Out.", type: "Procedures", note: "Cierre estándar" },
      { phrase: "Unknown station on channel one-six — you are causing interference — please identify yourself — Over.", type: "Procedures", note: "Aviso a estación no identificada" }
    ]
  }
];

// Optimized Practice Data (Curated to ~60% of total items for pronounceability)
const practiceData = {
  vocab: [
    "Call sign",
    "Hailing channel",
    "Working channel",
    "Switching channels",
    "Over",
    "Out",
    "Roger",
    "Wilco",
    "Say again",
    "Stand by",
    "Silence please",
    "Seelonce Mayday",
    "Seelonce Feenee",
    "Affirmative",
    "Negative",
    "Correct",
    "Wrong",
    "I spell",
    "In figures",
    "In words",
    "All stations",
    "Unknown station",
    "Interco",
    "Relay",
    "Distress traffic",
    "Urgency traffic",
    "Safety traffic",
    "Routine traffic",
    "Port operations",
    "Ship movement traffic",
    "Intership traffic",
    "Poor signal",
    "Interference",
    "Static",
    "Radio silence",
    "Out of range",
    "Dead spot",
    "Double keying",
    "Nothing heard",
    "Radio check",
    "VHF radio",
    "Watch keeping",
    "Radio log",
    "Colombian Navy",
    "Colombian Coast Guard",
    "Port Control",
    "Search and Rescue",
    "Alpha", "Bravo", "Charlie", "Delta", "Echo",
    "Foxtrot", "Golf", "Hotel", "India", "Juliett",
    "Kilo", "Lima", "Mike", "November", "Oscar",
    "Papa", "Quebec", "Romeo", "Sierra", "Tango",
    "Uniform", "Victor", "Whiskey", "Xray", "Yankee", "Zulu"
  ],
  func: [
    "Go to working channel six seven. Over.",
    "Switching to channel six seven. Over.",
    "Message received. Returning to channel one six. Out.",
    "Are you on channel one six? Over.",
    "Radio check on channel one six. Over.",
    "Reading you strength four. Signal good. Over.",
    "My call sign is Hotel Kilo Alpha Bravo four.",
    "My vessel name is Caribe Star.",
    "I spell: Charlie Alpha Romeo India Bravo Echo.",
    "Your message was broken. Say again. Over.",
    "I am reading you strength two. Signal is weak.",
    "Please speak slowly and clearly. Over.",
    "Unknown station transmitting on channel one six.",
    "Please identify yourself. Over.",
    "Request latest weather forecast for the Caribbean."
  ],
  smcp: [
    "Position: ten degrees north. Over.",
    "Course: two two zero degrees.",
    "Speed: in figures, one zero knots.",
    "Depth: in figures, fife fife metres.",
    "Time: in figures, one four tree zero.",
    "ETA: zero ait tree zero.",
    "Say again all before position.",
    "Say again all after course.",
    "Silence please. I have traffic for all stations.",
    "Requesting SAR coordination. Over.",
    "This is MV Caribe Star. radio check. Over.",
    "Stand by channel one six.",
    "You are causing interference."
  ]
};

// ── DOM ELEMENTS ─────────────────────────────────────────
const studySection = document.getElementById('study-section');
const practiceSection = document.getElementById('practice-section');
const tabVocab = document.getElementById('tab-vocab');
const tabFunc = document.getElementById('tab-func');
const tabSmcp = document.getElementById('tab-smcp');
const practiceCards = document.getElementById('practice-cards');
const micNotice = document.getElementById('mic-notice');
const progressLabel = document.getElementById('progress-label');
const progressPct = document.getElementById('progress-pct');
const pbarFill = document.querySelector('.pbar-fill');
const pbarLabel = document.getElementById('pbar-label');
const pringFill = document.querySelector('.pring-fill');

const statKnown = document.getElementById('stat-known');
const statPracticed = document.getElementById('stat-practiced');
const statRate = document.getElementById('stat-rate');

// ── STATE ───────────────────────────────────────────────
let state = {
  currentMode: 'study',
  currentTab: 'vocab',
  knownItems: new Set(JSON.parse(localStorage.getItem('maritime_l11_u6_known') || '[]')),
  practicedItems: new Set(JSON.parse(localStorage.getItem('maritime_l11_u6_practice') || '[]')),
  totalItems: 0,
  currentPFilter: 'vocab',
  isRecording: false
};

// ── INITIALIZATION ──────────────────────────────────────
function init() {
  calculateTotal();
  renderStudyTab('vocab');
  renderStudyTab('func');
  renderStudyTab('smcp');
  updateProgress();
  setupEventListeners();
}

function calculateTotal() {
  const v = vocab.reduce((acc, c) => acc + c.items.length, 0);
  const f = func.reduce((acc, c) => acc + c.items.length, 0);
  const s = smcp.reduce((acc, c) => acc + c.items.length, 0);
  state.totalItems = v + f + s;
}

// ── TAB RENDERING ───────────────────────────────────────
function renderStudyTab(tabId) {
  let html = '';
  const data = (tabId === 'vocab') ? vocab : (tabId === 'func' ? func : smcp);
  const container = (tabId === 'vocab') ? tabVocab : (tabId === 'func' ? tabFunc : tabSmcp);

  data.forEach((cat, cIdx) => {
    html += `
      <div class="accordion ${cIdx === 0 ? 'is-open' : ''}">
        <div class="accordion-header" onclick="toggleAccordion(this)">
          <div class="acc-icon-box"><i class="fas ${cat.icon}"></i></div>
          <div class="acc-title-group">
            <div class="acc-title">${cat.category}</div>
            <div class="acc-count">${cat.items.length} units</div>
          </div>
          <i class="fas fa-chevron-down acc-chevron"></i>
        </div>
        <div class="accordion-body">
          <div class="accordion-inner">
            ${cat.items.map((item, iIdx) => renderRow(item, tabId, cIdx, iIdx)).join('')}
          </div>
          <div class="accordion-footer">
            <span class="theme-label">Mark section as known</span>
            <input type="checkbox" class="section-cb" onchange="toggleCategory('${tabId}', ${cIdx}, this.checked)">
          </div>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function renderRow(item, tabId, cIdx, iIdx) {
  const id = `${tabId}-${cIdx}-${iIdx}`;
  const isChecked = state.knownItems.has(id);
  
  if (tabId === 'vocab') {
    const slug = (item.en || '').split('\n')[0].toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, '_');
    return `
      <div class="item-row-wrap" data-id="${id}">
        <div class="item-row">
          <div class="item-en">${item.en}</div>
          <div class="item-es">${item.es}</div>
          <div class="item-controls">
            <button class="audio-btn image-toggle-btn" id="img-btn-${id}" style="display: none;" onclick="const c = document.getElementById('img-cont-${id}'); c.style.display = c.style.display === 'none' ? 'block' : 'none';" title="Toggle Image"><i class="fas fa-image"></i></button>
            ${renderAudioBtn(item.en)}
            <input type="checkbox" class="know-cb" ${isChecked ? 'checked' : ''} onchange="toggleKnown('${id}', this.checked)">
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
  } else {
    return `
      <div class="item-row-wrap" data-id="${id}">
        <div class="item-row smcp-card-row">
          <div class="acc-title-group">
            <div class="item-phrase smcp-phrase">${item.phrase}</div>
            <div class="item-note">${item.note || item.type || ''}</div>
          </div>
          <div class="item-controls">
            ${renderAudioBtn(item.phrase)}
            <input type="checkbox" class="know-cb" ${isChecked ? 'checked' : ''} onchange="toggleKnown('${id}', this.checked)">
          </div>
        </div>
      </div>
    `;
  }
}

function renderAudioBtn(text) {
  const escaped = text.replace(/'/g, "\\'");
  return `<button class="audio-btn" onclick="playAudio('${escaped}', this)" title="Listen"><i class="fas fa-volume-up"></i></button>`;
}

// ── PRACTICE RENDERING ──────────────────────────────────
function renderPractice(filter) {
  state.currentPFilter = filter;
  const items = practiceData[filter];
  let html = '';

  items.forEach((text, idx) => {
    const isMastered = state.practicedItems.has(text);
    const escaped = text.replace(/'/g, "\\'");
    html += `
      <div class="practice-card ${isMastered ? 'known' : ''}">
        <div class="practice-card-header">
           <span class="phrase-label">Phrase</span>
           <span class="phrase-hint">${filter.toUpperCase()}</span>
        </div>
        <div class="practice-card-body">
          <div class="practice-phrase">${text}</div>
          <div class="practice-actions">
            <button class="audio-btn" onclick="playAudio('${escaped}', this)"><i class="fas fa-volume-up"></i> Listen</button>
            <button class="record-btn" onclick="startRec('${escaped}', this)"><i class="fas fa-microphone"></i> Record</button>
          </div>
          <div class="feedback-area"></div>
        </div>
      </div>
    `;
  });
  practiceCards.innerHTML = html;
}

// ── CORE LOGIC ──────────────────────────────────────────
function toggleAccordion(header) {
  const acc = header.closest('.accordion');
  acc.classList.toggle('is-open');
}

function toggleKnown(id, checked) {
  if (checked) state.knownItems.add(id);
  else state.knownItems.delete(id);
  
  localStorage.setItem('maritime_l11_u6_known', JSON.stringify([...state.knownItems]));
  updateProgress();
}

function toggleCategory(tabId, cIdx, checked) {
  const data = (tabId === 'vocab') ? vocab : (tabId === 'func' ? func : smcp);
  data[cIdx].items.forEach((_, iIdx) => {
    const id = `${tabId}-${cIdx}-${iIdx}`;
    toggleKnown(id, checked);
    const row = document.querySelector(`[data-id="${id}"] .know-cb`);
    if (row) row.checked = checked;
  });
}

function updateProgress() {
  const count = state.knownItems.size;
  const pct = Math.min(100, Math.round((count / state.totalItems) * 100));
  
  progressLabel.textContent = `${count} of ${state.totalItems} items known`;
  progressPct.textContent = `${pct}%`;
  pbarLabel.textContent = `${pct}% Completed`;
  pbarFill.style.width = `${pct}%`;
  
  // Update Ring
  const offset = 151 - (151 * pct / 100);
  pringFill.style.strokeDashoffset = offset;

  // Stats
  statKnown.textContent = count;
  statPracticed.textContent = state.practicedItems.size;
  const totalPrac = practiceData.vocab.length + practiceData.func.length + practiceData.smcp.length;
  statRate.textContent = `${Math.round((state.practicedItems.size / totalPrac) * 100)}%`;
}

// ── SPEECH & AUDIO ──────────────────────────────────────
function playAudio(text, btn) {
  if (btn) btn.classList.add('playing');
  
  // Try folder: unit06/audio/slug.mp3
  const slug = text.toLowerCase().trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '_');
  const audioFile = `audio/${slug}.mp3`;

  const audio = new Audio(audioFile);
  audio.onerror = () => {
    // Fallback: TTS with Windows-preferred voice
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'en-US';
    msg.rate = 0.9;
    const preferredVoice = getPreferredWindowsVoice();
    if (preferredVoice) msg.voice = preferredVoice;
    msg.onend = () => btn?.classList.remove('playing');
    window.speechSynthesis.speak(msg);
  };
  audio.onended = () => btn?.classList.remove('playing');
  audio.play();
}

function startRec(target, btn) {
  if (state.isRecording) return;
  state.isRecording = true;
  
  const feedback = btn.closest('.practice-card-body').querySelector('.feedback-area');
  btn.classList.add('recording');
  btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Recording...';
  feedback.innerHTML = '<span class="theme-label">Listening... Speak now.</span>';

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser.");
    state.isRecording = false;
    btn.classList.remove('recording');
    btn.innerHTML = '<i class="fas fa-microphone"></i> Record';
    return;
  }
  
  const rec = new SpeechRecognition();
  rec.lang = 'en-US';
  rec.interimResults = false;
  
  try { rec.start(); } catch (e) { console.error(e); }

  rec.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    const cleanTarget = normalizeSpeech(target);
    const cleanResult = normalizeSpeech(transcript);
    const similarity = calculateSimilarity(cleanResult, cleanTarget);

    if (similarity >= 0.70) {
      feedback.innerHTML = `<div class="feedback-success"><i class="fas fa-check-circle"></i> Excellent! Perfect match. (${Math.round(similarity*100)}%)</div>`;
      state.practicedItems.add(target);
      localStorage.setItem('maritime_l11_u6_practice', JSON.stringify([...state.practicedItems]));
      btn.closest('.practice-card').classList.add('known');
      updateProgress();
    } else {
      feedback.innerHTML = `<div class="feedback-error"><i class="fas fa-redo"></i> Not quite. You said: "${transcript}". Try again!</div>`;
    }
  };

  rec.onend = () => {
    state.isRecording = false;
    btn.classList.remove('recording');
    btn.innerHTML = '<i class="fas fa-microphone"></i> Record';
  };
  rec.onerror = () => {
    state.isRecording = false;
    btn.classList.remove('recording');
    btn.innerHTML = '<i class="fas fa-microphone"></i> Record';
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

// ── EVENT LISTENERS ─────────────────────────────────────
function setupEventListeners() {
  document.getElementById('study-mode-btn').onclick = () => switchMode('study');
  document.getElementById('practice-mode-btn').onclick = () => switchMode('practice');
  
  document.querySelectorAll('.study-tab').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.study-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    };
  });

  document.querySelectorAll('.pfilter-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.pfilter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPractice(btn.dataset.pfilter);
    };
  });

  document.getElementById('stats-btn').onclick = () => document.getElementById('stats-modal').classList.remove('hidden');
  document.getElementById('close-stats-btn').onclick = () => document.getElementById('stats-modal').classList.add('hidden');
  document.getElementById('enable-mic-btn').onclick = () => {
    micNotice.classList.add('hidden');
    practiceCards.classList.remove('hidden');
    renderPractice('vocab');
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const tempRec = new SpeechRec();
        tempRec.start();
        tempRec.stop();
      } catch (e) {}
    }
  };

  document.getElementById('expand-all-btn').onclick = () => {
    document.querySelectorAll('.accordion').forEach(a => a.classList.add('is-open'));
  };
  document.getElementById('collapse-all-btn').onclick = () => {
    document.querySelectorAll('.accordion').forEach(a => a.classList.remove('is-open'));
  };

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.onclick = () => {
      document.body.className = '';
      document.documentElement.setAttribute('data-theme', btn.dataset.theme);
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    };
  });
}

function switchMode(mode) {
  state.currentMode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  studySection.classList.toggle('active', mode === 'study');
  practiceSection.classList.toggle('active', mode === 'practice');
  
  const pill = document.querySelector('.mode-pill');
  if (mode === 'practice') pill.style.transform = 'translateX(100%)';
  else pill.style.transform = 'translateX(0)';

  if (mode === 'practice') {
    // Check if mic notice needed
    if (!micNotice.classList.contains('hidden')) {
      // just in case
    }
  }
}

// ── START ───────────────────────────────────────────────
window.onload = init;
