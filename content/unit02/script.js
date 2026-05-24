'use strict';
/* ════════════════════════════════════════════════════════
   GET UNDERWAY — Maritime English L1 · Unit 2
   Emergencies & Maritime Safety
   script.js — Core application logic
   ════════════════════════════════════════════════════════ */

// ── Content Data ────────────────────────────────────────
const CONTENT = {
  vocab: {
    "Types of Emergency": [
      { en: 'Fire',               es: 'Incendio' },
      { en: 'Flooding',           es: 'Inundación / vía de agua' },
      { en: 'Collision',          es: 'Colisión / abordaje' },
      { en: 'Grounding',          es: 'Varada / encallamiento' },
      { en: 'Man overboard (MOB)',es: 'Hombre al agua' },
      { en: 'Abandon ship',       es: 'Abandono del buque' }
    ],
    "Life-Saving Appliances (LSA)": [
      { en: 'Lifeboat',          es: 'Bote salvavidas (rígido / cubierto)' },
      { en: 'Liferaft canister', es: 'Balsa salvavidas (en contenedor inflable)' },
      { en: 'Lifejacket',        es: 'Chaleco salvavidas' },
      { en: 'Immersion suit',    es: 'Traje de inmersión / supervivencia' },
      { en: 'TPA',               es: 'Ayuda técnica de protección térmica' },
      { en: 'Lifebuoy',          es: 'Aro salvavidas' },
      { en: 'EPIRB',             es: 'Radiobaliza de localización de siniestros' },
      { en: 'SART',              es: 'Respondedor de radar de búsqueda y rescate' },
      { en: 'MES',               es: 'Sistema de evacuación marina (toboganes)' },
      { en: 'Davit',             es: 'Pescante (para arriar botes)' },
      { en: 'Rescue boat',       es: 'Bote de rescate (rápido)' },
      { en: 'Pyrotechnics',      es: 'Pirotecnia (bengalas, señales de humo)' }
    ],
    "Fire-Fighting Equipment (FFE)": [
      { en: 'Portable extinguisher', es: 'Extintor portátil' },
      { en: 'SCBA',                  es: 'Equipo de respiración autónomo (ERI)' },
      { en: 'EEBD',                  es: 'Dispositivo de respiración de escape de emergencia' },
      { en: 'Fire hydrant',          es: 'Hidrante de incendios' },
      { en: 'Fire main',             es: 'Tubería principal de incendios' },
      { en: 'Fire hose',             es: 'Manguera contra incendios' },
      { en: 'Fire blanket',          es: 'Manta ignífuga' },
      { en: 'Fire control plan',     es: 'Plano de lucha contra incendios' },
      { en: 'Smoke detector',        es: 'Detector de humo' },
      { en: 'Sprinkler system',      es: 'Sistema de rociadores' }
    ],
    "Medical Emergencies": [
      { en: 'Radio Medico',   es: 'Asesoría médica por radio (TMAS)' },
      { en: 'First aid kit',  es: 'Botiquín de primeros auxilios' },
      { en: 'Stretcher',      es: 'Camilla' },
      { en: 'Medical chest',  es: 'Gabinete médico de a bordo' },
      { en: 'Symptoms',       es: 'Síntomas' },
      { en: 'CPR',            es: 'Reanimación cardiopulmonar (RCP)' },
      { en: 'Hypothermia',    es: 'Hipotermia (pérdida de calor corporal)' },
      { en: 'Acute injury',   es: 'Lesión aguda / grave' }
    ],
    "Signals & Procedures": [
      { en: 'Mayday',          es: 'Llamada de socorro (peligro inmediato)' },
      { en: 'Pan-Pan',         es: 'Llamada de urgencia (situación seria, no inmediata)' },
      { en: 'Sécurité',        es: 'Llamada de seguridad (aviso navegacional)' },
      { en: 'Distress signal', es: 'Señal de socorro' },
      { en: 'GMDSS',           es: 'Sistema Mundial de Socorro y Seguridad Marítimos' }
    ],
    "Emergency Actions": [
      { en: 'Evacuate',  es: 'Evacuar' },
      { en: 'Muster',    es: 'Reunir / convocar en punto de reunión' },
      { en: 'Deploy',    es: 'Desplegar (balsa, equipo)' },
      { en: 'Activate',  es: 'Activar (EPIRB, alarma)' },
      { en: 'Transmit',  es: 'Transmitir (llamada de socorro)' },
      { en: 'Report',    es: 'Reportar / informar el incidente' }
    ]
  },

  func: {
    "Transmitting a Mayday Call by VHF": [
      {
        en: 'Mayday Mayday Mayday — This is [vessel name] — Position [coordinates] — We have a fire on board — [number] persons on board — Require immediate assistance — Over.',
        use: 'Formato básico de llamada Mayday. Se repite tres veces la palabra Mayday al inicio.',
        ctx: 'mayday'
      },
      {
        en: 'Mayday [vessel name] — This is [station] — Received Mayday — Assistance on way — Over.',
        use: 'Respuesta de la estación costera o buque que recibe la llamada.',
        ctx: 'mayday'
      },
      {
        en: 'Mayday all stations — This is [vessel name] — Cancel Mayday — Situation under control — Out.',
        use: 'Cancelar la llamada de socorro cuando el peligro ha pasado.',
        ctx: 'mayday'
      }
    ],
    "Transmitting Pan-Pan and Sécurité": [
      {
        en: 'Pan-Pan Pan-Pan Pan-Pan — All stations — This is [vessel name] — We have a medical emergency — One person unconscious — Position [coordinates] — Request medical advice — Over.',
        use: 'Urgencia médica a bordo. Situación seria pero sin peligro inmediato de hundimiento.',
        ctx: 'panpan'
      },
      {
        en: 'Pan-Pan Pan-Pan Pan-Pan — All stations — This is [vessel name] — Engine failure — Drifting — Position [coordinates] — Over.',
        use: 'Avería de máquinas sin peligro inmediato. Buque a la deriva.',
        ctx: 'panpan'
      },
      {
        en: 'Sécurité Sécurité Sécurité — All stations — This is [vessel name] — Navigational warning — Unlit object adrift at position [coordinates] — Over.',
        use: 'Aviso de objeto a la deriva sin luces. Riesgo para la navegación.',
        ctx: 'securite'
      },
      {
        en: 'Sécurité Sécurité Sécurité — All stations — This is Cartagena Radio — Weather warning — Strong winds and heavy seas expected in the area — Over.',
        use: 'Aviso meteorológico emitido por estación costera. Contexto Caribe colombiano.',
        ctx: 'securite'
      }
    ],
    "Giving Evacuation Instructions to the Crew": [
      {
        en: 'All crew — muster at your assigned stations immediately.',
        use: 'Orden general de reunión en puntos de abandono asignados.',
        ctx: 'evac'
      },
      {
        en: 'Put on your life jackets and immersion suits.',
        use: 'Orden de ponerse chaleco y traje de supervivencia.',
        ctx: 'evac'
      },
      {
        en: 'Prepare to deploy the liferafts on the port side.',
        use: 'Orden de preparar el despliegue de balsas por babor.',
        ctx: 'evac'
      },
      {
        en: 'Abandon ship! All hands abandon ship!',
        use: 'Orden final de abandono del buque. Se repite.',
        ctx: 'evac'
      },
      {
        en: 'Man overboard — port side! Throw the lifebuoy!',
        use: 'Aviso de hombre al agua indicando la banda. Orden inmediata.',
        ctx: 'evac'
      }
    ],
    "Functional Emergency Communications": [
      {
        en: 'I am reporting a minor fuel spill on the aft deck. Contained by the bunker team.',
        use: 'Informar un derrame menor de combustible en la cubierta de popa.',
        ctx: 'proc'
      },
      {
        en: 'Requesting immediate medical advice from Radio Medico. Patient has severe abdomen pain.',
        use: 'Solicitar asesoría médica urgente por dolor abdominal agudo.',
        ctx: 'proc'
      },
      {
        en: 'Testing all life-saving appliances as per SOLAS requirements. Drills in progress.',
        use: 'Prueba de todos los dispositivos de salvamento según SOLAS.',
        ctx: 'proc'
      }
    ],
    "Completing Post-Incident Emergency Reports": [
      {
        en: 'At [time], a fire was reported in the engine room.',
        use: 'Inicio del informe con hora y naturaleza del incidente.',
        ctx: 'report'
      },
      {
        en: 'All crew mustered at muster stations. No persons missing.',
        use: 'Resultado del recuento de tripulación.',
        ctx: 'report'
      },
      {
        en: 'Mayday transmitted on Channel 16 at [time]. Acknowledged by Cartagena Radio.',
        use: 'Registro de la comunicación de socorro enviada y recibida.',
        ctx: 'report'
      },
      {
        en: 'Fire extinguished at [time]. Damage confined to the engine room.',
        use: 'Registro de resolución del incidente y extensión del daño.',
        ctx: 'report'
      },
      {
        en: 'Mayday cancelled at [time]. Vessel proceeding to nearest port for inspection.',
        use: 'Cierre del informe con cancelación de socorro y acción siguiente.',
        ctx: 'report'
      }
    ]
  },

  smcp: {
    "Mayday — Full Distress Call Format": [
      {
        phrase: 'MAYDAY MAYDAY MAYDAY\nThis is [vessel name] [vessel name] [vessel name]\nPosition [lat/lon or bearing & distance]\nNature of distress: [fire / flooding / collision / grounding]\nNumber of persons on board: [number]\n[Any other relevant information]\nOver.',
        type: 'El nombre del buque y la palabra Mayday se repiten tres veces. La posición es el dato más crítico.',
        bdr: 'mayday'
      },
      { phrase: 'This is a Mayday relay for vessel [name] in position [X].', type: 'Retransmisión de socorro para otro buque.', bdr: 'mayday' }
    ],
    "Medical Reporting (SMCP)": [
      { phrase: 'I have a person [conscious / unconscious] on board.', type: 'Reporte de estado de consciencia.', bdr: 'panpan' },
      { phrase: 'Patient is [male / female] aged [number] years.', type: 'Información demográfica básica del paciente.', bdr: 'panpan' },
      { phrase: 'Nature of illness: [chest pain / high fever / fracture].', type: 'Naturaleza de la enfermedad o lesión.', bdr: 'panpan' },
      { phrase: 'What is your medicine chest number?', type: 'Pregunta sobre la numeración del dispensario según el convenio.', bdr: 'panpan' }
    ],
    "Mayday Acknowledgement": [
      {
        phrase: 'MAYDAY [vessel name]\nThis is [station / vessel name]\nReceived MAYDAY\n[Number] miles from your position\nProceeding to your assistance\nEstimated time of arrival [time]\nOver.',
        type: 'Acuse de recibo estándar OMI / SMCP. Quien responde confirma recepción, distancia y hora estimada de llegada.',
        bdr: 'mayday'
      },
      {
        phrase: 'MAYDAY MV Providencia Star\nThis is Cartagena Radio\nReceived MAYDAY\nCoastguard vessel dispatched\nETA your position forty-five minutes\nMaintain watch on Channel 16\nOver.',
        type: 'Ejemplo — respuesta de Cartagena Radio (DIMAR). DIMAR opera las estaciones costeras en Colombia.',
        bdr: 'mayday'
      },
      {
        phrase: 'MAYDAY MV Providencia Star — All stations\nThis is Cartagena Radio\nSEELONCE MAYDAY\nOut.',
        type: 'Orden de silencio radio en el canal (SEELONCE MAYDAY). Solo el buque en peligro y la estación coordinadora pueden transmitir.',
        bdr: 'mayday'
      }
    ],
    "Pan-Pan — Urgency Call": [
      {
        phrase: 'PAN-PAN PAN-PAN PAN-PAN\nAll stations all stations all stations\nThis is [vessel name]\nPosition [coordinates]\n[Nature of urgency: medical / engine failure / person missing]\n[Assistance required]\nOver.',
        type: 'Formato Pan-Pan — OMI / SMCP. Situación seria pero sin peligro inmediato. No requiere silencio de radio obligatorio.',
        bdr: 'panpan'
      },
      {
        phrase: 'PAN-PAN PAN-PAN PAN-PAN\nAll stations all stations all stations\nThis is MV San Bernardo\nPosition: five miles east of Tolú, Gulf of Morrosquillo\nEngine failure — vessel adrift\nSix persons on board — no injuries\nRequest towing assistance\nOver.',
        type: 'Ejemplo real — contexto Golfo de Morrosquillo. Zona pesquera y turística activa entre Tolú y Coveñas.',
        bdr: 'panpan'
      }
    ],
    "Abandon Ship Sequence": [
      { phrase: 'Abandon ship! Abandon ship!', type: 'Orden final repetida.', bdr: 'evac' },
      { phrase: 'Lower lifeboats to the embarkation deck.', type: 'Arriar botes a la cubierta de embarque.', bdr: 'evac' },
      { phrase: 'All persons enter lifeboats.', type: 'Orden de entrada a los botes.', bdr: 'evac' },
      { phrase: 'Lower lifeboats into the water.', type: 'Arriar botes al agua.', bdr: 'evac' },
      { phrase: 'Cast off from the vessel and steer clear.', type: 'Desamarrar del buque y alejarse para evitar succión.', bdr: 'evac' }
    ],
    "Sécurité — Navigational Safety Call": [
      {
        phrase: 'SÉCURITÉ SÉCURITÉ SÉCURITÉ\nAll stations all stations all stations\nThis is [vessel name / station]\n[Navigational warning / meteorological warning]\n[Details of hazard and position]\nOut.',
        type: 'Formato Sécurité — OMI / SMCP. Aviso informativo. No requiere respuesta. Se termina con "Out", no con "Over".',
        bdr: 'securite'
      },
      {
        phrase: 'SÉCURITÉ SÉCURITÉ SÉCURITÉ\nAll stations all stations all stations\nThis is Cartagena Radio\nNavigational warning\nUnlit fishing nets drifting\nPosition: 10°18\' N, 075°45\' W\nVessels in the area are advised to keep clear\nOut.',
        type: 'Ejemplo real — redes a la deriva, Caribe colombiano. Situación frecuente en aguas colombianas.',
        bdr: 'securite'
      }
    ],
    "Emergency Procedural Phrases": [
      { phrase: 'This is a Mayday relay.',                                             type: 'Usado cuando un buque retransmite el Mayday de otro que no ha sido escuchado por la estación costera.', bdr: 'proc' },
      { phrase: 'Cancel Mayday. Situation under control. Out.',                         type: 'Se transmite cuando el peligro ha pasado. Obligatorio notificar a todas las estaciones.', bdr: 'proc' },
      { phrase: 'Activating EPIRB. Position will be transmitted automatically.',        type: 'La EPIRB transmite en 406 MHz al sistema COSPAS-SARSAT para localización por satélite.', bdr: 'proc' },
      { phrase: 'Man overboard. Man overboard. Position [coordinates]. Vessel turning to assist.', type: 'Transmitir en canal 16. Marcar la posición GPS inmediatamente.', bdr: 'proc' },
      { phrase: 'All crew muster at muster stations. This is not a drill.',             type: 'La frase "this is not a drill" distingue la emergencia real del simulacro.', bdr: 'proc' }
    ]
  }
};

const PRACTICE = {
  vocab: [
    { text: 'Lifeboat',          variants: ['lifeboat'] },
    { text: 'Immersion suit',    variants: ['immersion suit'] },
    { text: 'EPIRB',             variants: ['epirb'] },
    { text: 'Fire extinguisher', variants: ['fire extinguisher'] },
    { text: 'First aid kit',     variants: ['first aid kit'] },
    { text: 'Smoke detector',    variants: ['smoke detector'] },
    { text: 'Muster station',    variants: ['muster station'] },
    { text: 'Abandon ship',      variants: ['abandon ship'] },
    { text: 'GMDSS',             variants: ['gmdss'] },
    { text: 'Liferaft canister', variants: ['liferaft canister'] },
    { text: 'Fire hydrant',      variants: ['fire hydrant'] },
    { text: 'Hypothermia',       variants: ['hypothermia'] }
  ],
  func: [
    { text: 'Mayday Mayday Mayday.',              variants: ['mayday mayday mayday'] },
    { text: 'Received Mayday.',                   variants: ['received mayday'] },
    { text: 'Man overboard — port side!',          variants: ['man overboard port side'] },
    { text: 'Requesting medical advice.',         variants: ['requesting medical advice'] },
    { text: 'All crew muster at muster stations.', variants: ['all crew muster at muster stations'] },
    { text: 'I am activating the EPIRB.',         variants: ['i am activating the epirb'] }
  ],
  smcp: [
    { text: 'Abandon ship!',                     variants: ['abandon ship'] },
    { text: 'Anchor is holding.',                variants: ['anchor is holding'] },
    { text: 'This is not a drill.',              variants: ['this is not a drill'] },
    { text: 'SEELONCE MAYDAY.',                  variants: ['seelonce mayday'] },
    { text: 'Cancel Mayday. Situation under control.', variants: ['cancel mayday situation under control'] },
    { text: 'Requesting towing assistance.',     variants: ['requesting towing assistance'] }
  ]
};

// ── STATE ──────────────────────────────────────────────
const S_KEY = 'maritime_l11_u2_known';
const P_KEY = 'maritime_l11_u2_practice';
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
