/**
 * MARITIME ENGLISH L1 — UNIT 5: CARGO & DECK OPERATIONS
 * "ADMIRALTY GLASS" - Refactored for Consistency
 */

// ── DATA STRUCTURES ────────────────────────────────────

const CONTENT = {
  vocab: {
    "Cargo Types": [
      { en: "Stores", es: "Víveres / pertrechos de a bordo" },
      { en: "Victuals", es: "Vituallas / provisiones de alimento" },
      { en: "Spare parts", es: "Repuestos / piezas de recambio" },
      { en: "Ammunition", es: "Munición" },
      { en: "Fuel (bunkering)", es: "Combustible (abastecimiento de bunker)" },
      { en: "Bulk cargo", es: "Carga a granel (granos, minerales)" },
      { en: "Break bulk cargo", es: "Carga fraccionada / suelta" },
      { en: "Containerised cargo", es: "Carga contenerizada" },
      { en: "Ro-Ro cargo", es: "Carga rodante (vehículos, maquinaria)" },
      { en: "Liquid cargo", es: "Carga líquida (tanqueros)" },
      { en: "Refrigerated cargo", es: "Carga refrigerada / reefer" },
      { en: "Heavy lift", es: "Carga pesada / de gran peso" },
      { en: "Out-of-gauge cargo", es: "Carga fuera de medida / sobredimensionada" },
      { en: "Deadweight (DWT)", es: "Peso muerto (capacidad de carga del buque)" }
    ],
    "Hazardous Materials": [
      { en: "Hazardous materials (HAZMAT)", es: "Materiales / mercancías peligrosas" },
      { en: "IMDG Code", es: "Código IMDG (código marítimo de mercancías peligrosas)" },
      { en: "Dangerous goods declaration", es: "Declaración de mercancías peligrosas" },
      { en: "Flammable", es: "Inflamable" },
      { en: "Explosive", es: "Explosivo" },
      { en: "Corrosive", es: "Corrosivo" },
      { en: "Toxic", es: "Tóxico" },
      { en: "Radioactive", es: "Radioactivo" },
      { en: "Oxidising agent", es: "Agente oxidante" },
      { en: "Segregation", es: "Segregación (separación de cargas incompatibles)" },
      { en: "Placarding", es: "Etiquetado / señalización de peligro IMDG" },
      { en: "UN number", es: "Número ONU (identifica mercancía peligrosa)" },
      { en: "Emergency schedule", es: "Hoja de emergencia / procedimiento EmS" },
      { en: "Spill / leakage", es: "Derrame / fuga de mercancía peligrosa" }
    ],
    "Loading & Discharging Ops": [
      { en: "Loading", es: "Carga / embarque de mercancía" },
      { en: "Discharging", es: "Descarga / desembarque de mercancía" },
      { en: "Stowing", es: "Estiba (colocar y organizar la carga)" },
      { en: "Lashing", es: "Trinca (sujetar la carga con eslingas o cadenas)" },
      { en: "Securing", es: "Asegurar / fijar la carga" },
      { en: "Dunnage", es: "Separadores / material de estiba (madera, cartón)" },
      { en: "Shoring", es: "Apuntalamiento de la carga" },
      { en: "Tallying", es: "Conteo / verificación de bultos en muelle" },
      { en: "Overstowing", es: "Sobreestiba (carga bloqueada por otra encima)" },
      { en: "Broken stow", es: "Estiba incompleta / espacio perdido en bodega" },
      { en: "Bunkering", es: "Avituallamiento de combustible" },
      { en: "Topping off", es: "Completar el llenado de un tanque" },
      { en: "Ullage", es: "Ullaje / espacio libre en un tanque de carga" },
      { en: "Cargo plan", es: "Plan de carga / plano de distribución de carga" },
      { en: "Stowage factor", es: "Factor de estiba (m³ por tonelada de carga)" },
      { en: "Cargo manifest", es: "Manifiesto de carga" },
      { en: "Bill of lading (B/L)", es: "Conocimiento de embarque" },
      { en: "Tally sheet", es: "Hoja de conteo de carga" }
    ],
    "Deck & Cargo Equipment": [
      { en: "Crane", es: "Grúa de cubierta" },
      { en: "Derrick", es: "Pórtico / mástil de carga" },
      { en: "Winch", es: "Maquinilla / winche" },
      { en: "Hoist", es: "Aparejo de izado / polipasto" },
      { en: "Sling", es: "Eslinga (correa o cable de levante)" },
      { en: "Shackle", es: "Grillete" },
      { en: "Hook", es: "Gancho de carga" },
      { en: "Cargo net", es: "Red de carga" },
      { en: "Spreader bar", es: "Barra separadora / traversín" },
      { en: "Hatch cover", es: "Tapa de escotilla" },
      { en: "Hatch coaming", es: "Brazola de escotilla" },
      { en: "Forklift", es: "Montacargas / carretilla elevadora" },
      { en: "Pallet", es: "Paleta / plataforma de madera" },
      { en: "Cargo ramp", es: "Rampa de carga (buques Ro-Ro)" },
      { en: "Twistlock", es: "Traba giratoria (fijación de contenedores)" },
      { en: "Turnbuckle", es: "Tensor / tirafondo (para trincas)" },
      { en: "Chain lashing", es: "Trinca con cadena" },
      { en: "Wire rope", es: "Cable de acero / cable metálico" },
      { en: "Rigging", es: "Aparejo / equipo de izamiento y trinca" },
      { en: "Safe working load (SWL)", es: "Carga máxima de trabajo seguro" }
    ],
    "Vessel Stability & Condition": [
      { en: "Stability", es: "Estabilidad del buque" },
      { en: "Trim", es: "Asiento / diferencia de calados" },
      { en: "Draft / draught", es: "Calado" },
      { en: "Freeboard", es: "Francobordo (distancia línea de flotación a cubierta)" },
      { en: "Load line", es: "Línea de máxima carga / línea Plimsoll" },
      { en: "List", es: "Escora (inclinación lateral permanente)" },
      { en: "Heel", es: "Bandazo / inclinación dinámica" },
      { en: "GM (metacentric height)", es: "Altura metacéntrica (indicador de estabilidad)" },
      { en: "Centre of gravity (G)", es: "Centro de gravedad" },
      { en: "Centre of buoyancy (B)", es: "Centro de carena / flotabilidad" },
      { en: "Ballast", es: "Lastre (agua o peso para mejorar estabilidad)" },
      { en: "Securing points", es: "Puntos de amarre / sujeción de carga" },
      { en: "Lashing points", es: "Puntos de trinca en cubierta" },
      { en: "Cargo shift", es: "Corrimiento de carga" },
      { en: "Overhang", es: "Vuelo / carga que sobresale de los límites del buque" },
      { en: "Weight distribution", es: "Distribución del peso a bordo" }
    ],
    "Cargo Documentation": [
      { en: "Cargo manifest", es: "Manifiesto de carga (lista total de la carga)" },
      { en: "Bill of lading (B/L)", es: "Conocimiento de embarque" },
      { en: "Packing list", es: "Lista de empaque / contenido de bultos" },
      { en: "Dangerous goods manifest", es: "Manifiesto de mercancías peligrosas" },
      { en: "Mates receipt", es: "Recibo del oficial (acuse de carga a bordo)" },
      { en: "Notice of readiness (NOR)", es: "Aviso de alistamiento (buque listo para operar)" },
      { en: "Letter of protest", es: "Carta de protesta (por daño o discrepancia)" },
      { en: "Cargo damage report", es: "Informe de daños a la carga" },
      { en: "Hatch report", es: "Informe de bodega / estado de la escotilla" },
      { en: "Stowage plan", es: "Plano de estiba / distribución de carga en bodegas" }
    ]
  },
  func: {
    "Stowage & Lashing Instructions": [
      { en: "Stow the cargo on the port side of hold number two. Keep clear of the bilge wells.", use: "Declaring stowage location and restrictions.", ctx: "stow" },
      { en: "Place dunnage between the layers. Do not stow heavy items on top of fragile cargo.", use: "Instruction on dunnage and stack order.", ctx: "stow" },
      { en: "Lash the vehicle to the deck securing points using chain lashings. Apply turnbuckles and take up the slack.", use: "Step-by-step lashing instruction.", ctx: "stow" },
      { en: "Check all lashings before departure. Tension must be sufficient to prevent cargo shift in rough weather.", use: "Pre-departure verification order.", ctx: "stow" },
      { en: "Segregate the Class 3 flammable liquids from the Class 5 oxidising agents. Refer to the IMDG segregation table.", use: "IMMAT/HAZMAT segregation order.", ctx: "stow" },
      { en: "The vessel has a three-degree list to starboard. Shift ballast to correct. Do not continue loading until the list is eliminated.", use: "Correcting list before continuing ops.", ctx: "stow" }
    ],
    "Crane Operations (Handie-Talkie)": [
      { en: "Crane operator — hoist away slowly. Load is clear of the hatch coaming.", use: "Order to hoist after clearing coaming.", ctx: "crane" },
      { en: "Stop hoisting. The sling is not properly secured. Lower away and re-rig.", use: "Safety stop for sling check.", ctx: "crane" },
      { en: "Swing to port. Stop. Lower away gently onto the pallet.", use: "Swing and landing sequence.", ctx: "crane" },
      { en: "All hands stand clear of the hook radius. Load is swinging.", use: "Safety warning for swing radius.", ctx: "crane" },
      { en: "Hook is now over the hatch. Lower away. Slowly — slowly — stop. Well done, load is landed.", use: "Guiding load into the hold.", ctx: "crane" }
    ],
    "Cargo Manifest (Standard Headers)": [
      { en: "Vessel name: MV Caribe Star. Port of loading: Cartagena. Port of discharge: Barranquilla. Voyage number: 047. Total cargo: 245.7 metric tonnes.", use: "Standard manifest identification header.", ctx: "manifest" }
    ],
    "Deck Incident Reporting": [
      { en: "During loading operations, two crates of spare parts were dropped and sustained damage. A cargo damage report has been prepared.", use: "Initial report of cargo damage.", ctx: "incident" },
      { en: "A minor fuel spill occurred during bunkering operations. Approximately 20 litres on deck. Contained with absorbent material.", use: "Bunkering spill report.", ctx: "incident" },
      { en: "An Ordinary Seaman sustained a hand injury while handling a wire sling. Operations suspended in the affected area.", use: "Personal injury report and safety measure.", ctx: "incident" },
      { en: "In heavy weather the deck cargo shifted to starboard. All lashings were re-tightened and ballast adjusted.", use: "Reporting cargo shift and corrective action.", ctx: "incident" }
    ]
  },
  smcp: {
    "Crane & Hoist Commands": [
      { phrase: "Hoist away.", type: "Hoist order", note: "Start lifting. Can add 'slowly'.", bdr: "crane" },
      { phrase: "Lower away.", type: "Lower order", note: "Start lowering. 'Lower away gently' for delicate items.", bdr: "crane" },
      { phrase: "Stop!", type: "Emergency stop", note: "Immediate halt of all movements. Top priority.", bdr: "crane" },
      { phrase: "Slack off.", type: "Slackening", note: "Reduce tension without fully lowering.", bdr: "crane" },
      { phrase: "Take up the slack.", type: "Tensioning", note: "Tighten cable before lifting.", bdr: "crane" },
      { phrase: "Swing to port / starboard.", type: "Slewing", note: "Move boom laterally.", bdr: "crane" },
      { phrase: "Boom up / Boom down.", type: "Luffing", note: "Adjust boom angle/outreach.", bdr: "crane" },
      { phrase: "Hold on. Do not hoist yet. Load is not properly slung. Over.", type: "Safety pause", note: "Stop due to rigging error.", bdr: "crane" },
      { phrase: "Load is clear. Hoist away. Safe working load is [X] tonnes. Do not exceed. Over.", type: "Authorization", note: "Confirming clear and reminding of SWL.", bdr: "crane" }
    ],
    "Safety Alerts": [
      { phrase: "All hands clear of the crane area. Crane operations in progress. Over.", type: "Clearance alert", note: "Issue before starting lifting.", bdr: "incident" },
      { phrase: "Danger — load overhead. Keep clear below. Over.", type: "Overhead warning", note: "Never pass under a suspended load.", bdr: "incident" },
      { phrase: "Bunkering in progress — no naked flames, no smoking in the vicinity. Over.", type: "Bunkering safety", note: "SOLAS requirement for fuel ops.", bdr: "proc" },
      { phrase: "HAZMAT in hold number [X]. No smoking. No unauthorised entry. Refer to IMDG emergency schedule. Over.", type: "Dangerous goods alert", note: "Inform crew of HAZMAT locations.", bdr: "incident" },
      { phrase: "Cargo shift reported. All hands check and re-tighten lashings. Report to Chief Officer when complete. Over.", type: "Cargo shift alarm", note: "General order for lashing verification.", bdr: "incident" }
    ],
    "Damage & Incident Reports": [
      { phrase: "[Station] this is [vessel]. Cargo damage report: Location [hold], Nature [desc], Cause [suspected], Action [measures]. Over.", type: "Report format", note: "Standard format for incident reporting.", bdr: "incident" },
      { phrase: "Chief Officer — Bosun. Two pallets of stores damaged. Cause: sling failure. Cargo set aside. Tally sheet endorsed. Over.", type: "Example: Sling failure", note: "Endorsing tally is crucial for legal claims.", bdr: "incident" },
      { phrase: "Cartagena Port Control — this is MV Caribe Star. Minor fuel spill during bunkering. Contained — no overboard discharge. Over.", type: "Example: Port report", note: "Must report to Port Authority (DIMAR).", bdr: "incident" }
    ],
    "Manifest Communications": [
      { phrase: "We have dangerous goods on board. Class [X], UN [XXXX]. Stowed in hold [X]. Manifest forwarded to port agent. Over.", type: "HAZMAT declaration", note: "Notify VTS and Agent before arrival.", bdr: "manifest" },
      { phrase: "Port Control — this is MV Caribe Star. Total cargo: [X] metric tonnes. Ready for cargo inspection. Over.", type: "Arrival report", note: "Standard summary for customs/security.", bdr: "manifest" }
    ],
    "General Deck Procedures": [
      { phrase: "Hatch number [X] is open and ready for loading. Hatch covers stowed clear. Over.", type: "Ready for ops", note: "Ensure covers are secured in stowage.", bdr: "proc" },
      { phrase: "Loading operations complete. Hatch covers replaced and secured. Ready for sea. Over.", type: "Ready for sea", note: "Mandatory check before departure.", bdr: "proc" },
      { phrase: "Notice of readiness tendered at [time]. Vessel ready in all respects for cargo operations. Over.", type: "NOR Tender", note: "Marks start of laytime.", bdr: "proc" },
      { phrase: "Requesting crane operator to stand by. Cargo is ready for loading at hatch number [X]. Over.", type: "Operator request", note: "Coordination between deck and crane.", bdr: "proc" },
      { phrase: "Lashing operations in progress. Stand by for tension check. Over.", type: "Coordination", bdr: "proc" }
    ]
  }
};

const PRACTICE = {
  vocab: [
    { text: "Hazardous materials", variants: ["hazardous materials"] },
    { text: "Dangerous goods declaration", variants: ["dangerous goods declaration"] },
    { text: "Bill of lading", variants: ["bill of lading"] },
    { text: "Cargo manifest", variants: ["cargo manifest"] },
    { text: "Stowage plan", variants: ["stowage plan"] },
    { text: "Safe working load", variants: ["safe working load"] },
    { text: "Notice of readiness", variants: ["notice of readiness"] },
    { text: "Broken stow", variants: ["broken stow"] },
    { text: "Heavy lift", variants: ["heavy lift"] },
    { text: "Hatch cover", variants: ["hatch cover"] },
    { text: "IMDG Code",          variants: ["imdg code"] },
    { text: "Placarding",         variants: ["placarding"] },
    { text: "Shackle",            variants: ["shackle"] },
    { text: "Spreader bar",       variants: ["spreader bar"] },
    { text: "Forklift",           variants: ["forklift"] }
  ],
  func: [
    { text: "Stow the cargo on the port side of hold number two.", variants: ["stow the cargo on the port side of hold number two"] },
    { text: "Lash the vehicle to the deck securing points.", variants: ["lash the vehicle to the deck securing points"] },
    { text: "Crane operator — hoist away slowly.", variants: ["crane operator hoist away slowly"] },
    { text: "Stop hoisting. The sling is not properly secured.", variants: ["stop hoisting the sling is not properly secured"] },
    { text: "Swing to port. Stop. Lower away gently onto the pallet.", variants: ["swing to port stop lower away gently onto the pallet"] },
    { text: "Check all lashings before departure.", variants: ["check all lashings before departure"] }
  ],
  smcp: [
    { text: "Hoist away.", variants: ["hoist away"] },
    { text: "Lower away gently.", variants: ["lower away gently"] },
    { text: "All hands clear of the crane area.", variants: ["all hands clear of the crane area"] },
    { text: "Danger — load overhead. Keep clear below.", variants: ["danger load overhead keep clear below"] },
    { text: "Hatch number two is open and ready for loading.", variants: ["hatch number two is open and ready for loading"] },
    { text: "Wait for crane operator to stand by.", variants: ["wait for crane operator to stand by"] },
    { text: "Depth of hold is ten metres.", variants: ["depth of hold is ten metres"] }
  ]
};

// ── STATE ──────────────────────────────────────────────

const S_KEY = 'maritime_l11_u5_known';
const P_KEY = 'maritime_l11_u5_practice';
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

const modeBtns        = document.querySelectorAll('.mode-btn');
const sections        = document.querySelectorAll('.content-section');
const studyTabs       = document.querySelectorAll('.study-tab');
const tabPanels       = document.querySelectorAll('.tab-panel');
const progressPct     = document.getElementById('progress-pct');
const progressFill    = document.querySelector('.pring-fill');
const pbarFill        = document.querySelector('.pbar-fill');
const pbarLabel       = document.getElementById('pbar-label');
const statKnown       = document.getElementById('stat-known');
const statPracticed   = document.getElementById('stat-practiced');
const statRate        = document.getElementById('stat-rate');
const modePill        = document.querySelector('.mode-pill');

// ── INITIALIZATION ─────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  renderStudyTab('vocab');
  updateProgress();
  setupEventListeners();
  initSpeech();
});

function setupEventListeners() {
  modeBtns.forEach((btn, idx) => btn.addEventListener('click', () => {
    switchMode(btn.dataset.mode);
    if (modePill) modePill.style.transform = `translateX(${idx * 100}%)`;
  }));

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
  modeBtns.forEach(b => {
    const isActive = b.dataset.mode === mode;
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-selected', isActive);
  });
  sections.forEach(s => s.classList.toggle('active', s.id === `${mode}-section`));
  if (mode === 'practice') {
    const activeFilter = document.querySelector('.pfilter-btn.active').dataset.pfilter;
    renderPractice(activeFilter);
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
        <div class="acc-icon-box"><i class="fas fa-${getIcon(tab)}"></i></div>
        <div class="acc-title-group">
          <div class="acc-title">${cat}</div>
          <div class="acc-count">${items.length} items</div>
        </div>
        <i class="fas fa-chevron-down acc-chevron"></i>
      </div>
      <div class="accordion-body">
        <div class="accordion-inner">
          ${items.map(item => renderItem(item, tab)).join('')}
          ${cat === 'Cargo Manifest (Standard Headers)' ? renderManifestTable() : ''}
        </div>
      </div>
    `;
    acc.querySelector('.accordion-header').addEventListener('click', () => acc.classList.toggle('is-open'));
    container.appendChild(acc);
  });
}

function getIcon(tab) {
    if (tab === 'vocab') return 'spell-check';
    if (tab === 'func') return 'comments';
    return 'radio';
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
        <div class="item-row" style="padding-top:0;opacity:0.75">
          <div class="item-note"><i class="fas fa-info-circle" style="font-size:0.7rem"></i> ${item.type}${item.note ? ': ' + item.note : ''}</div>
        </div>
      </div>
    `;
  }
}

function renderManifestTable() {
    return `
    <div class="manifest-table-wrapper">
        <table class="manifest-table">
            <thead>
                <tr><th>Item</th><th>Description</th><th>Qty</th><th>Weight</th><th>Notes</th></tr>
            </thead>
            <tbody>
                <tr><td>1</td><td>Steel pipes</td><td>12 bndl</td><td>24.5 t</td><td>Deck stowed</td></tr>
                <tr><td>2</td><td>Diesel fuel</td><td>1 pcl</td><td>80.0 t</td><td>IMDG Class 3</td></tr>
                <tr><td>3</td><td>Reefer food</td><td>200 pal.</td><td>120.0 t</td><td>Keep -18°C</td></tr>
            </tbody>
        </table>
    </div>`;
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
      if (preferredVoice) utt.voice = preferredVoice;

      utt.onend = () => btn.classList.remove('playing');
      window.speechSynthesis.speak(utt);
    });
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

function updateProgress() {
  const pct = Math.min(100, Math.round((knownItems.length / TOTAL_ITEMS) * 100));
  
  if (progressPct) progressPct.textContent = `${pct}%`;
  if (progressFill) {
      const offset = 151 - (151 * pct) / 100;
      progressFill.style.strokeDashoffset = offset;
  }
  
  if (pbarFill) pbarFill.style.width = `${pct}%`;
  if (pbarLabel) pbarLabel.textContent = `${pct}% Completed`;
  
  const label = document.getElementById('progress-label');
  if (label) label.textContent = `${knownItems.length} of ${TOTAL_ITEMS} items mastered (${pct}%)`;
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
    if (!resultDiv) return;
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
