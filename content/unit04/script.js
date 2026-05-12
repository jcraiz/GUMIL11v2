'use strict';

// ============================================================================
// CONSTANTS & STATE
// ============================================================================

const STORAGE_KEY = 'military_l11_u4_known';
const P_KEY = 'military_l11_u4_practice';
const PASS_THRESHOLD = 0.70;

// Silent Image manifest - currently empty as no images are present
const AVAILABLE_IMAGES =[];

let knownItems = new Set();
let masteredPhrases = new Set();
let TOTAL_ITEMS = 0;
let micEnabled = false;

// Anti-Cheat Variables
let isListening = false;
let currentAudio = null;

// Load state from local storage
try {
  const savedItems = localStorage.getItem(STORAGE_KEY);
  if (savedItems) knownItems = new Set(JSON.parse(savedItems));
  const savedPhrases = localStorage.getItem(P_KEY);
  if (savedPhrases) masteredPhrases = new Set(JSON.parse(savedPhrases));
} catch (e) {
  console.error("Error loading progress:", e);
}

// Speech synthesis & recognition
const synth = window.speechSynthesis;
let recognition = null;
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

// Active Simulation State
let simState = { activeId: null, role: null, turnIndex: 0, score: 0, attempts: 0, maxAttempts: 3 };

// ============================================================================
// DATA STRUCTURES
// ============================================================================

const CONTENT = {};
CONTENT.vocab =[
    // Group 1: Report Types
    { id: "v_sitrep", group: "v-g1", groupName: "Report Types", en: "SITREP", es: "Situation Report — informe periódico de situación operacional" },
    { id: "v_casrep", group: "v-g1", groupName: "Report Types", en: "CASREP", es: "Casualty Report — informe de bajas y heridos" },
    { id: "v_intrep", group: "v-g1", groupName: "Report Types", en: "INTREP", es: "Intelligence Report — informe de inteligencia sobre el enemigo" },
    { id: "v_intsum", group: "v-g1", groupName: "Report Types", en: "INTSUM", es: "Intelligence Summary — resumen periódico de inteligencia" },
    { id: "v_persrep", group: "v-g1", groupName: "Report Types", en: "PERSREP", es: "Personnel Report — estado del personal (strength, casualties)" },
    { id: "v_logrep", group: "v-g1", groupName: "Report Types", en: "LOGREP", es: "Logistics Report — estado de suministros, combustible, munición" },
    { id: "v_spotrep", group: "v-g1", groupName: "Report Types", en: "SPOTREP", es: "Spot Report — observación táctica inmediata" },
    { id: "v_increp", group: "v-g1", groupName: "Report Types", en: "Incident report", es: "Informe de incidente — registro formal de un evento específico" },
    { id: "v_brief", group: "v-g1", groupName: "Report Types", en: "Brief", es: "Brief — presentación estructurada con BLUF y recomendación" },
    { id: "v_memo", group: "v-g1", groupName: "Report Types", en: "Memorandum", es: "Memorando — comunicación interna formal entre unidades" },
    { id: "v_aar", group: "v-g1", groupName: "Report Types", en: "After-action report (AAR)", es: "Informe post-acción — lecciones aprendidas tras una operación" },
    { id: "v_salute", group: "v-g1", groupName: "Report Types", en: "SALUTE report", es: "Size–Activity–Location–Unit–Time–Equipment — reporte de observación" },

    // Group 2: Paragraph Structure
    { id: "v_topic", group: "v-g2", groupName: "Paragraph Structure in Military Reports", en: "Topic sentence", es: "Oración temática — la idea principal al inicio del párrafo" },
    { id: "v_support", group: "v-g2", groupName: "Paragraph Structure in Military Reports", en: "Supporting detail", es: "Detalle de apoyo — evidencia, datos, ejemplos que desarrollan la idea" },
    { id: "v_numbered", group: "v-g2", groupName: "Paragraph Structure in Military Reports", en: "Numbered paragraph", es: "Párrafo numerado — obligatorio en informes militares formales" },
    { id: "v_1p1i", group: "v-g2", groupName: "Paragraph Structure in Military Reports", en: "1 paragraph = 1 idea", es: "Un párrafo contiene una sola idea principal — regla cardinal NATO" },
    { id: "v_bluf", group: "v-g2", groupName: "Paragraph Structure in Military Reports", en: "BLUF opening", es: "Párrafo 1 = el punto principal — el lector no busca el mensaje" },
    { id: "v_rec_p3", group: "v-g2", groupName: "Paragraph Structure in Military Reports", en: "Recommendation paragraph", es: "En un brief: siempre en párrafo 3 — antes del desarrollo" },
    { id: "v_brief_struct", group: "v-g2", groupName: "Paragraph Structure in Military Reports", en: "Brief structure", es: "Introduction → Aim → Recommendation → Body → Conclusions" },
    { id: "v_coherence", group: "v-g2", groupName: "Paragraph Structure in Military Reports", en: "Thematic coherence", es: "Coherencia temática — cada frase del párrafo apoya la oración temática" },

    // Group 3: Linking Words
    { id: "v_add", group: "v-g3", groupName: "Linking Words by Function", en: "Addition", es: "In addition, Moreover, Furthermore, Additionally" },
    { id: "v_con", group: "v-g3", groupName: "Linking Words by Function", en: "Contrast", es: "However, Nevertheless, Despite this, In contrast" },
    { id: "v_ce", group: "v-g3", groupName: "Linking Words by Function", en: "Cause–Effect", es: "Therefore, Consequently, As a result, Hence" },
    { id: "v_time", group: "v-g3", groupName: "Linking Words by Function", en: "Time / Sequence", es: "Initially, Subsequently, Following this, Thereafter" },
    { id: "v_spec", group: "v-g3", groupName: "Linking Words by Function", en: "Specification", es: "Specifically, In particular, Primarily, Notably" },
    { id: "v_conc", group: "v-g3", groupName: "Linking Words by Function", en: "Concession", es: "Although, While, Even though, Despite the fact that" },

    // Group 4: Probability Scale
    { id: "v_hun", group: "v-g4", groupName: "NATO Intelligence Probability Scale", en: "Highly unlikely", es: "< 10% — Muy poco probable" },
    { id: "v_imp", group: "v-g4", groupName: "NATO Intelligence Probability Scale", en: "Improbable", es: "15 – 25% — Improbable" },
    { id: "v_real", group: "v-g4", groupName: "NATO Intelligence Probability Scale", en: "Realistic probability", es: "25 – 50% — Probabilidad realista" },
    { id: "v_prob", group: "v-g4", groupName: "NATO Intelligence Probability Scale", en: "Probably / Likely", es: "50 – 75% — Probable / Posible" },
    { id: "v_hp", group: "v-g4", groupName: "NATO Intelligence Probability Scale", en: "Highly probable", es: "75 – 90% — Muy probable" },
    { id: "v_ac", group: "v-g4", groupName: "NATO Intelligence Probability Scale", en: "Almost certain", es: "> 90% — Casi seguro" },

    // Group 5: Abbreviations
    { id: "v_wia", group: "v-g5", groupName: "Operational Abbreviations & Report Style", en: "WIA", es: "Wounded in Action — Herido en combate" },
    { id: "v_kia", group: "v-g5", groupName: "Operational Abbreviations & Report Style", en: "KIA", es: "Killed in Action — Muerto en combate" },
    { id: "v_civ", group: "v-g5", groupName: "Operational Abbreviations & Report Style", en: "CIV", es: "Civilian — Civil" },
    { id: "v_fob", group: "v-g5", groupName: "Operational Abbreviations & Report Style", en: "FOB", es: "Forward Operating Base — Base de operaciones avanzada" },
    { id: "v_hwy", group: "v-g5", groupName: "Operational Abbreviations & Report Style", en: "HWY", es: "Highway — Carretera / Autopista" },
    { id: "v_sof", group: "v-g5", groupName: "Operational Abbreviations & Report Style", en: "SOF", es: "Special Operations Forces — Fuerzas de operaciones especiales" },
    { id: "v_cas", group: "v-g5", groupName: "Operational Abbreviations & Report Style", en: "CASEVAC", es: "Casualty Evacuation — Evacuación de bajas" },
    { id: "v_svbied", group: "v-g5", groupName: "Operational Abbreviations & Report Style", en: "SVBIED", es: "Suicide Vehicle-Borne IED — Coche bomba suicida" },
    { id: "v_ln", group: "v-g5", groupName: "Operational Abbreviations & Report Style", en: "LN", es: "Local National — Nacional local / Población local" },
    { id: "v_ied", group: "v-g5", groupName: "Operational Abbreviations & Report Style", en: "IED", es: "Improvised Explosive Device — Artefacto explosivo improvisado" },
    { id: "v_eod", group: "v-g5", groupName: "Operational Abbreviations & Report Style", en: "EOD", es: "Explosive Ordnance Disposal — Desactivación de explosivos" },
    { id: "v_roz", group: "v-g5", groupName: "Operational Abbreviations & Report Style", en: "ROZ", es: "Restricted Operations Zone — Zona de operaciones restringida" }
];

const PRACTICE = {};
PRACTICE.vocab = CONTENT.vocab.map(v => ({ id: `p_v_${v.id}`, text: v.en }));
PRACTICE.func =[
    { id: "p_f_1a", text: "Sunray, this is Sierra One." },
    { id: "p_f_1b", text: "I have eyes on six armed personnel moving north." },
    { id: "p_f_2a", text: "Do not wait for the SITREP." },
    { id: "p_f_2b", text: "Send a SPOTREP now using SALUTE format." },
    { id: "p_f_3a", text: "A SITREP is periodic, a SPOTREP is immediate." },
    { id: "p_f_3b", text: "Use SALUTE format for tactical observations." },
    { id: "p_f_4a", text: "Requesting immediate CASEVAC for two WIA." },
    { id: "p_f_4b", text: "CASREP for personnel and equipment losses." },
    { id: "p_f_5a", text: "Incident report for formal documentation and legal record." },
    { id: "p_f_5b", text: "Submit the incident report NLT 1000Z." },
    { id: "p_f_6a", text: "Initially, the patrol departed at 0400Z." },
    { id: "p_f_6b", text: "Subsequently, an IED detonated beneath the lead vehicle." },
    { id: "p_f_7a", text: "Consequently, the route was immediately closed." },
    { id: "p_f_7b", text: "However, route clearance was not completed until 0910Z." },
    { id: "p_f_8a", text: "Recommendation appears in paragraph 3 before evidence." },
    { id: "p_f_8b", text: "This follows the BLUF principle in NATO briefs." },
    { id: "p_f_9a", text: "Four independent confirming sources would be ALMOST CERTAIN." },
    { id: "p_f_9b", text: "En responsibility is PROBABLE (50 to 75%)." }
];

const SIMULATIONS =[
  {
    id: "sim-spotrep-vs-sitrep",
    title: "SPOTREP vs SITREP",
    description: "Deciding between immediate observation and scheduled reporting.",
    roles:["patrol_leader", "company_hq"],
    script:[
      { speaker: "patrol_leader", text: "Sunray, this is Sierra One." },
      { speaker: "patrol_leader", text: "I have eyes on six armed personnel moving north on AXIS BRAVO at grid 445870." },
      { speaker: "patrol_leader", text: "Do you want this in my next SITREP, over?" },
      { speaker: "company_hq", text: "Sierra One, this is Sunray. Negative. Do not wait for the SITREP." },
      { speaker: "company_hq", text: "Send a SPOTREP now using SALUTE format." },
      { speaker: "patrol_leader", text: "Sunray, Sierra One. Understood. Sending SPOTREP now." },
      { speaker: "company_hq", text: "Roger. Good distinction — a SITREP is periodic, a SPOTREP is immediate." }
    ]
  },
  {
    id: "sim-casrep-ied",
    title: "CASREP After an IED Incident",
    description: "Transmitting casualties and coordinating CASEVAC.",
    roles: ["vehicle_commander", "battalion_hq"],
    script:[
      { speaker: "vehicle_commander", text: "Dragon Actual, this is Convoy Lead. IED detonation at grid 452878." },
      { speaker: "vehicle_commander", text: "We have casualties. Requesting immediate CASEVAC. How copy, over?" },
      { speaker: "battalion_hq", text: "Convoy Lead, Dragon Actual. Solid copy. Need a CASREP, over." },
      { speaker: "vehicle_commander", text: "CASREP follows: 2 x WIA, 1 x KIA. CASEVAC requested for the two WIA." },
      { speaker: "battalion_hq", text: "CASREP copied. Send me an incident report when the situation is contained." },
      { speaker: "vehicle_commander", text: "Understood. Incident report for formal documentation. Out." }
    ]
  },
  {
    id: "sim-probability-scale",
    title: "NATO Probability Scale",
    description: "Correcting vague language with standardized terms.",
    roles:["s2_officer", "junior_analyst"],
    script:[
      { speaker: "s2_officer", text: "Echo Two, this is S2 Actual. I read your INTREP. You wrote 'pretty likely'." },
      { speaker: "s2_officer", text: "That is not a NATO probability term. Acknowledge, over." },
      { speaker: "junior_analyst", text: "S2 Actual, Echo Two. I understand. What is the correct NATO term, over?" },
      { speaker: "s2_officer", text: "With two sources supporting, the correct term is PROBABLY or LIKELY (50 to 75%)." },
      { speaker: "junior_analyst", text: "Copied. PROBABLY (50-75%) for two supporting sources. I will update." },
      { speaker: "s2_officer", text: "The scale is non-negotiable in NATO documents. S2 Actual out." }
    ]
  },
  {
    id: "sim-incident-report",
    title: "Incident Report Logic",
    description: "Understanding why formal documentation is required.",
    roles: ["commander", "duty_officer"],
    script:[
      { speaker: "commander", text: "Sunray Two, this is Sunray. We need a formal incident report for the investigate file." },
      { speaker: "duty_officer", text: "Sunray, Sunray Two. I already sent a SPOTREP and a CASREP. Why a third, over?" },
      { speaker: "commander", text: "The incident report is administrative and legal. It documents the timeline and response." },
      { speaker: "duty_officer", text: "Understood. I will submit it within one hour, over." },
      { speaker: "commander", text: "Submit NLT 1000Z. No contractions. Sunray out." }
    ]
  },
  {
    id: "sim-linking-words",
    title: "Linking Words in a SITREP",
    description: "Reviewing for logical coherence using tactical connectors.",
    roles: ["senior_nco", "junior_nco"],
    script:[
      { speaker: "senior_nco", text: "Echo Three, I read your SITREP. Use INITIALLY for the departure." },
      { speaker: "senior_nco", text: "Follow with SUBSEQUENTLY for the IED detonation. How copy, over?" },
      { speaker: "junior_nco", text: "Echo Actual, Echo Three. Copy. INITIALLY for departure, SUBSEQUENTLY for IED." },
      { speaker: "junior_nco", text: "And CONSEQUENTLY for the route closure. I will rewrite. Out." }
    ]
  },
  {
    id: "sim-brief-structure",
    title: "Brief Structure",
    description: "Explaining why recommendation precedes the body.",
    roles: ["staff_officer", "junior_officer"],
    script:[
      { speaker: "staff_officer", text: "Lieutenant, the recommendation in a NATO brief appears in paragraph 3." },
      { speaker: "junior_officer", text: "Sir, I placed it at the end. Does it really come before the body, over?" },
      { speaker: "staff_officer", text: "Yes. This is the BLUF principle. Recommendation in paragraph 3 before evidence." },
      { speaker: "junior_officer", text: "Understood. Restructured brief with recommendation in paragraph 3. Out." }
    ]
  }
];

// ============================================================================
// CORE UTILITIES (GOLD STANDARDS)
// ============================================================================

function toSlug(text) {
    if (!text) return "";
    return text.toString().toLowerCase()
        .replace(/['\-]/g, '')          
        .replace(/[^a-z0-9\s]/g, ' ')   
        .replace(/\s+/g, ' ')           
        .trim()                         
        .split(' ')                     
        .slice(0, 7)                    
        .join('_');                     
}

function loadResilientImage(imgElement, baseName) {
    const formats =['.webp', '.webp', '.webp', '.webp'];
    let currentFormatIndex = 0;

    imgElement.onerror = () => {
        currentFormatIndex++;
        if (currentFormatIndex < formats.length) {
            imgElement.src = `assets/${baseName}${formats[currentFormatIndex]}`;
        } else {
            imgElement.style.display = 'none';
        }
    };
    imgElement.src = `assets/${baseName}${formats[0]}`;
}

function toggleVocabImage(btn, id, baseName) {
    const container = document.getElementById(`img-cont-${id}`);
    const img = document.getElementById(`img-${id}`);
    
    if (container.style.display === 'none' || container.classList.contains('hidden')) {
        container.style.display = 'block';
        container.classList.remove('hidden');
        btn.classList.add('active');
        btn.style.color = 'var(--primary)';
        if (!img.src || img.src === window.location.href) {
            loadResilientImage(img, baseName);
        }
    } else {
        container.style.display = 'none';
        container.classList.add('hidden');
        btn.classList.remove('active');
        btn.style.color = '';
    }
}

function stopAllAudio() {
    if (synth.speaking) synth.cancel();
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
}

function useTTS(text, callback, btn = null) {
    if (isListening) {
        if (callback) callback(); 
        return; 
    }
    stopAllAudio();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; 
    u.rate = 0.85;
    u.onend = () => { if (btn) btn.classList.remove('playing'); if (callback) callback(); };
    u.onerror = () => { if (btn) btn.classList.remove('playing'); if (callback) callback(); };
    synth.speak(u);
}

function playFallbackAudio(text, onEndCallback, btn = null) {
    if (isListening) {
        if (onEndCallback) onEndCallback();
        return; 
    }
    
    stopAllAudio();
    if (btn) btn.classList.add('playing');
    
    const audioFileName = toSlug(text.split('\n')[0]);
    const audioPath = `audio/${audioFileName}.mp3`;
    
    currentAudio = new Audio(audioPath);
    
    currentAudio.play().then(() => {
        currentAudio.onended = () => { 
            if (btn) btn.classList.remove('playing');
            currentAudio = null; 
            if (onEndCallback) onEndCallback(); 
        };
    }).catch((e) => {
        currentAudio = null;
        useTTS(text, onEndCallback, btn);
    });
}

function speak(text) {
    if (isListening) return;
    playFallbackAudio(text, null, null);
}

function normalizeSpeech(str) {
    if (!str) return "";
    let s = str.toLowerCase().replace(/[^\w\s]/g,'').trim();
    // Standard Military/Maritime ESP Phonetic Mappings
    s = s.replace(/\btree\b/g, 'three');
    s = s.replace(/\bfoer\b|\bfourth\b/g, 'four');
    s = s.replace(/\bfife\b|\bfive\b/g, 'five');
    s = s.replace(/\bniner\b/g, 'nine');
    s = s.replace(/\bout\b/g, 'out');
    s = s.replace(/\broger\b/g, 'roger');
    return s;
}

function calculateSimilarity(s1, s2) {
    if (s1 === s2) return 1.0;
    const l1 = s1.length, l2 = s2.length;
    let m = Array(l1 + 1).fill().map(() => Array(l2 + 1).fill(0));
    for (let i = 0; i <= l1; i++) m[i][0] = i;
    for (let j = 0; j <= l2; j++) m[0][j] = j;
    for (let i = 1; i <= l1; i++) {
        for (let j = 1; j <= l2; j++) {
            const cost = s1[i-1] === s2[j-1] ? 0 : 1;
            m[i][j] = Math.min(
                m[i-1][j] + 1, 
                m[i][j-1] + 1, 
                m[i-1][j-1] + cost
            );
        }
    }
    const max = Math.max(l1, l2);
    return max === 0 ? 1.0 : (max - m[l1][l2]) / max;
}

// ============================================================================
// INITIALISATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    calculateTotalItems();
    renderVocab();
    restoreCheckboxStates();
    setupModeSwitching();
    setupStudyTabs();
    setupPracticeFilters();
    setupGlobalControls();
    initExercises();
    updateProgressUI();
});

function restoreCheckboxStates() {
    const groups =['v-g1','v-g2','v-g3','v-g4','v-g5','ex1','ex2','ex3','ex4','ex5'];
    groups.forEach(id => {
        const cb = document.getElementById(id + '-cb');
        if (cb) cb.checked = knownItems.has(id);
    });
}

function calculateTotalItems() {
    const vocabCount = CONTENT.vocab.length;
    const funcCount = PRACTICE.func ? PRACTICE.func.length : 0;
    const exercisesCount = 5; 
    const simCount = SIMULATIONS.length;
    
    TOTAL_ITEMS = vocabCount + funcCount + exercisesCount + simCount;
}

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...knownItems]));
  localStorage.setItem(P_KEY, JSON.stringify([...masteredPhrases]));
  updateProgressUI();
}

function toggleItem(id, isKnown) {
  if (isKnown) knownItems.add(id);
  else knownItems.delete(id);
  saveProgress();
}

function toggleVocabGroup(groupId, isChecked) {
  CONTENT.vocab.filter(i => i.group === groupId).forEach(item => {
    if (isChecked) knownItems.add(item.id);
    else knownItems.delete(item.id);
  });
  saveProgress();
  renderVocab();
}

function addMasteredPhrase(text) {
  if (!masteredPhrases.has(text)) {
    masteredPhrases.add(text);
    saveProgress();
  }
}

function updateProgressUI() {
  const count = knownItems.size;
  const pct = TOTAL_ITEMS > 0 ? Math.min(100, Math.round((count / TOTAL_ITEMS) * 100)) : 0;

  const hudBar = document.getElementById('hud-progress-bar');
  if (hudBar) {
    hudBar.innerHTML = '';
    const segments = 10;
    const filledSegments = Math.round((pct / 100) * segments);
    for (let i = 0; i < segments; i++) {
      const seg = document.createElement('div');
      seg.className = `segment ${i < filledSegments ? 'filled' : ''}`;
      hudBar.appendChild(seg);
    }
  }
  
  const pLabel = document.getElementById('progress-pct');
  const mLabel = document.getElementById('pbar-label');
  const progressLabel = document.getElementById('progress-label');
  
  if (pLabel) pLabel.textContent = `${pct}%`;
  if (mLabel) mLabel.textContent = `${pct}% COMPLETED`;
  if (progressLabel) progressLabel.textContent = `${count} of ${TOTAL_ITEMS} items mastered`;

  const statKnown = document.getElementById('stat-known');
  const statPracticed = document.getElementById('stat-practiced');
  const statRate = document.getElementById('stat-rate');
  
  if (statKnown) statKnown.textContent = count;
  if (statPracticed) {
    let simDoneCount = 0;
    SIMULATIONS.forEach(sim => { if (knownItems.has(sim.id)) simDoneCount++; });
    statPracticed.textContent = `${masteredPhrases.size} / ${simDoneCount}`;
  }
  if (statRate) statRate.textContent = `${pct}%`;
  
  if (document.getElementById('practice-mode-btn').classList.contains('active')) {
    if (document.getElementById('pfilter-sim').classList.contains('active') && !simState.activeId && micEnabled) {
      renderPracticeGallery();
    }
  }
}

// Fixed missing global authorizeMic linking correctly to the DOM onclick event
window.authorizeMic = function() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            micEnabled = true;
            document.getElementById('mic-notice').classList.add('hidden');
            renderActivePracticeMode();
          })
          .catch(err => {
            alert("Microphone access is required. Please allow access in your browser settings.");
          });
    } else {
         micEnabled = true;
         document.getElementById('mic-notice').classList.add('hidden');
         renderActivePracticeMode();
    }
};

// ============================================================================
// UI NAVIGATION
// ============================================================================

function setupModeSwitching() {
  const studyBtn = document.getElementById('study-mode-btn');
  const pracBtn = document.getElementById('practice-mode-btn');
  const studySec = document.getElementById('study-section');
  const pracSec = document.getElementById('practice-section');

  studyBtn.addEventListener('click', () => {
    studyBtn.classList.add('active'); pracBtn.classList.remove('active');
    studySec.classList.add('active'); pracSec.classList.remove('active');
    if (recognition) { try { recognition.abort(); } catch(e){} }
    isListening = false;
  });

  pracBtn.addEventListener('click', () => {
    pracBtn.classList.add('active'); studyBtn.classList.remove('active');
    pracSec.classList.add('active'); studySec.classList.remove('active');
    if (micEnabled) renderActivePracticeMode();
  });
}

function setupStudyTabs() {
  const tabs = document.querySelectorAll('.study-tab');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    });
  });
}

function setupPracticeFilters() {
  const pBtns = document.querySelectorAll('.pfilter-btn');
  pBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (recognition) { try { recognition.abort(); } catch(e){} }
      isListening = false;
      if (micEnabled) renderActivePracticeMode();
    });
  });
}

function renderActivePracticeMode() {
  const activeBtn = document.querySelector('.pfilter-btn.active');
  const mode = activeBtn ? activeBtn.dataset.pfilter : 'vocab';
  const pArea = document.getElementById('practice-area');
  const pGrid = document.getElementById('practice-grid');
  const pGallery = document.getElementById('sim-gallery');
  const pStage = document.getElementById('sim-stage');
  
  if (!pArea) return;
  pArea.classList.remove('hidden');

  // Corrected structural alignment with HTML components
  if (mode === 'vocab' || mode === 'func') {
    pGrid.classList.remove('hidden');
    pGallery.classList.add('hidden');
    pStage.classList.add('hidden');
    renderPracticeCards(mode);
  } else {
    pGrid.classList.add('hidden');
    pStage.classList.add('hidden');
    simState.activeId = null;
    renderPracticeGallery();
  }
}

function setupGlobalControls() {
  document.getElementById('expand-all-btn').addEventListener('click', () => {
    const activePanel = document.querySelector('.tab-panel.active');
    activePanel.querySelectorAll('.accordion').forEach(acc => acc.classList.add('is-open'));
  });

  document.getElementById('collapse-all-btn').addEventListener('click', () => {
    const activePanel = document.querySelector('.tab-panel.active');
    activePanel.querySelectorAll('.accordion').forEach(acc => acc.classList.remove('is-open'));
  });

  document.getElementById('stats-btn').addEventListener('click', () => {
      updateProgressUI();
      document.getElementById('stats-modal').classList.remove('hidden');
  });
  document.getElementById('close-stats-btn').addEventListener('click', () => document.getElementById('stats-modal').classList.add('hidden'));

  window.toggleAccordion = function(header) {
      const acc = header.closest('.accordion');
      acc.classList.toggle('is-open');
  };
}

// ============================================================================
// STUDY SECTION RENDERING
// ============================================================================

function renderVocab() {
    const container = document.getElementById('tab-vocab');
    if (!container) return;
    
    const groups = {};
    CONTENT.vocab.forEach(item => {
        if (!groups[item.groupName]) groups[item.groupName] = { id: item.group, items:[] };
        groups[item.groupName].items.push(item);
    });
    
    container.innerHTML = '';
    Object.keys(groups).forEach(gName => {
        const group = groups[gName];
        const gid = group.id;
        const acc = document.createElement('div');
        acc.className = 'accordion';
        acc.innerHTML = `
            <div class="accordion-header" onclick="toggleAccordion(this)">
                <div class="acc-icon-box"><i class="fas fa-folder"></i></div>
                <div class="acc-title-group">
                    <div class="acc-title">${gName}</div>
                    <div class="acc-count">${group.items.length} Items</div>
                </div>
                <i class="fas fa-chevron-down acc-chevron"></i>
            </div>
            <div class="accordion-body">
                <div class="accordion-inner">
                    <div class="vocab-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px;">
                        ${group.items.map(item => {
                            const slug = toSlug(item.en);
                            const isKnown = knownItems.has(item.id);
                            const hasImage = AVAILABLE_IMAGES.includes(slug);
                            
                            const imgBtnHtml = hasImage ? `<button class="audio-btn image-toggle-btn" id="img-btn-${item.id}" style="display: none;" onclick="toggleVocabImage(this, '${item.id}', '${slug}')" title="Toggle Image"><i class="fas fa-image"></i></button>` : '';
                            const imgContHtml = hasImage ? `<div class="item-image-container" id="img-cont-${item.id}" style="display: none; text-align: center; margin-top: 10px; margin-bottom: 5px;">
                                <img id="img-${item.id}" style="max-height: 200px; max-width: 100%;" onload="const b = document.getElementById('img-btn-${item.id}'); if(b) b.style.display='inline-flex';">
                              </div>` : '';

                            return `
                            <div class="item-row-wrap" data-id="${item.id}" style="padding: 10px; background: var(--surface); border: 1px solid var(--outline-variant);">
                                <div class="item-row" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
                                    <div style="flex: 1;">
                                        <div class="item-en" style="font-weight: 600; color: var(--on-surface);">${item.en}</div>
                                        <div class="item-es" style="font-size: 0.85rem; color: var(--on-surface-variant);">${item.es}</div>
                                    </div>
                                    <div class="item-controls" style="display: flex; align-items: center; gap: 8px;">
                                        ${imgBtnHtml}
                                        <button class="audio-btn" onclick="playFallbackAudio('${item.en.replace(/'/g, "\\'")}', null, this)" title="Listen">
                                            <i class="fas fa-volume-up"></i>
                                        </button>
                                        <label class="know-checkbox" style="display: flex; align-items: center; gap: 4px; font-size: 0.7rem; text-transform: uppercase;">
                                            <input type="checkbox" class="know-cb" ${isKnown ? 'checked' : ''} 
                                                   onchange="toggleItem('${item.id}', this.checked)">
                                            <span>Mstr</span>
                                        </label>
                                    </div>
                                </div>
                                ${imgContHtml}
                            </div>
                        `;}).join('')}
                    </div>
                </div>
                <div class="accordion-footer" style="padding: 10px; background: var(--surface-container); border-top: 1px solid var(--outline-variant); display: flex; justify-content: flex-end; align-items: center; gap: 10px;">
                    <span style="font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase;">Mark section verified:</span>
                    <input type="checkbox" class="know-cb group-toggle-cb" id="${gid}-cb" 
                           ${group.items.every(i => knownItems.has(i.id)) ? 'checked' : ''}>
                </div>
            </div>
        `;
        
        const groupCb = acc.querySelector('.group-toggle-cb');
        groupCb.addEventListener('change', function() {
            toggleVocabGroup(gid, this.checked);
        });
        
        container.appendChild(acc);
        
        group.items.forEach(item => {
            const imgElement = document.getElementById(`img-${item.id}`);
            if (imgElement) {
                loadResilientImage(imgElement, toSlug(item.en));
            }
        });
    });
}

// ============================================================================
// PRACTICE CARDS & SPEECH RECOGNITION
// ============================================================================

function renderPracticeCards(listKey) {
  const container = document.getElementById('practice-grid'); // Fixed targeting
  container.innerHTML = '';
  const data = PRACTICE[listKey];
  if (!data) return;

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'practice-card glass-card';
    card.innerHTML = `
      <div class="practice-card-header" style="font-size:0.75rem; text-transform:uppercase; color:var(--primary);">
        <span class="phrase-label">Phrase Target</span>
      </div>
      <div class="practice-card-body">
        <div class="practice-phrase" style="margin-bottom:var(--space-3);">${item.text}</div>
        <div class="practice-actions">
           <button class="audio-btn" style="flex-shrink:0;" onclick="playFallbackAudio('${item.text.replace(/'/g, "\\'")}', null, this)" title="Listen Pronunciation"><i class="fas fa-volume-up"></i></button>
           <button class="record-btn" onclick="startVocabRec('${item.text.replace(/'/g, "\\'")}', this, '${item.id}')">
             <i class="fas fa-microphone"></i> Interrogate
           </button>
        </div>
        <div class="rec-result hidden" style="margin-top:var(--space-2);"></div>
      </div>
    `;
    container.appendChild(card);
  });
}

function startVocabRec(target, btn, id) {
  if (btn.classList.contains('recording')) {
    if (recognition) { try { recognition.abort(); } catch(e){} }
    btn.classList.remove('recording');
    btn.innerHTML = '<i class="fas fa-microphone"></i> Interrogate';
    isListening = false;
    return;
  }
  
  if (!SpeechRec) return alert("Speech recognition not supported.");
  
  stopAllAudio();
  isListening = true;

  recognition = new SpeechRec();
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  btn.classList.add('recording');
  
  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    const normalizedTranscript = normalizeSpeech(transcript);
    const normalizedTarget = normalizeSpeech(target);
    const simScore = calculateSimilarity(normalizedTranscript, normalizedTarget);
    const resultDiv = btn.closest('.practice-card-body').querySelector('.rec-result');
    resultDiv.classList.remove('hidden');
    
    if (simScore >= PASS_THRESHOLD) {
      resultDiv.innerHTML = `<div class="feedback-success" style="color:var(--success);"><i class="fas fa-check-circle"></i> Perfect Match! (${Math.round(simScore*100)}%)</div>`;
      addMasteredPhrase(target); 
    } else {
      resultDiv.innerHTML = `<div class="feedback-fail" style="color:var(--secondary);"><i class="fas fa-exclamation-circle"></i> Mismatch (${Math.round(simScore*100)}%): "${transcript}"</div>`;
    }
  };
  
  recognition.onend = () => { 
    isListening = false;
    btn.innerHTML = '<i class="fas fa-microphone"></i> Interrogate'; 
    btn.classList.remove('recording'); 
  };
  recognition.onerror = () => { 
    isListening = false;
    btn.innerHTML = '<i class="fas fa-microphone"></i> Interrogate'; 
    btn.classList.remove('recording'); 
  };
  try { recognition.start(); } catch (e) { console.error(e); isListening = false; }
}

// ============================================================================
// SIMULATION ENGINE (GOLD STANDARD)
// ============================================================================

function renderPracticeGallery() {
  const pGrid = document.getElementById('practice-grid');
  const pGallery = document.getElementById('sim-gallery');
  const pStage = document.getElementById('sim-stage');

  if (pGrid) pGrid.classList.add('hidden');
  if (pStage) pStage.classList.add('hidden');
  
  if (pGallery) {
      pGallery.classList.remove('hidden');
      pGallery.innerHTML = '';

      if (SIMULATIONS.length === 0) {
        pGallery.innerHTML = `<div class="mic-notice"><div class="mic-icon-wrap"><i class="fas fa-wrench"></i></div><h3>Simulations Pending</h3><p>Please provide the DeepSeek simulations to unlock this sector.</p></div>`;
        return;
      }

      SIMULATIONS.forEach(sim => {
        const isCompleted = knownItems.has(sim.id);
        const card = document.createElement('div');
        card.className = `sim-card ${isCompleted ? 'completed' : ''}`;
        card.onclick = () => showRolePicker(sim.id);
        card.innerHTML = `
          <div class="sim-card-header"><span class="sim-number">${sim.id.toUpperCase()}</span><span class="sim-completed-badge"><i class="fas fa-check"></i> Verified</span></div>
          <div class="sim-card-body" style="flex:1;"><h3 class="sim-title" style="margin-bottom:8px;">${sim.title}</h3><p class="sim-desc">${sim.description}</p><div class="sim-roles" style="margin-top:10px;">${sim.roles.map(r => `<span class="sim-role-tag">${r.toUpperCase().replace('_', ' ')}</span>`).join('')}</div></div>
          <div class="sim-card-footer"><span class="sim-line-count">${sim.script.length} transmissions</span><span class="sim-start-hint">Execute <i class="fas fa-arrow-right"></i></span></div>
        `;
        pGallery.appendChild(card);
      });
  }
}

function showRolePicker(simId) {
  const pGallery = document.getElementById('sim-gallery');
  const pStage = document.getElementById('sim-stage');
  
  if (pGallery) pGallery.classList.add('hidden');
  if (pStage) {
      pStage.classList.remove('hidden');
      const sim = SIMULATIONS.find(s => s.id === simId);
      pStage.innerHTML = `
        <div class="role-picker">
          <h3 style="color:var(--primary); text-transform:uppercase; margin-bottom:10px;">Select Call Sign</h3>
          <p style="margin-bottom:20px;">${sim.title}</p>
          <div class="role-buttons">
            ${sim.roles.map(r => `<button class="role-btn" onclick="startSimulation('${sim.id}', '${r}')"><i class="fas fa-headset"></i><span class="role-btn-name">${r.toUpperCase().replace('_', ' ')}</span><span class="role-btn-sub">Assume this role</span></button>`).join('')}
          </div>
          <button class="btn-ghost" style="margin-top:20px;" onclick="renderPracticeGallery()"><i class="fas fa-arrow-left"></i> Abort</button>
        </div>
      `;
  }
}

window.startSimulation = function(simId, role) {
  simState = { activeId: simId, role: role, turnIndex: 0, score: 0, attempts: 0, maxAttempts: 3 };
  renderSimulationStage();
  processNextTurn();
};

function renderSimulationStage() {
  const sim = SIMULATIONS.find(s => s.id === simState.activeId);
  const pStage = document.getElementById('sim-stage');
  if (!pStage) return;
  pStage.innerHTML = `
    <div class="sim-stage">
      <div class="sim-stage-header"><div class="sim-stage-title">${sim.title}</div><div class="sim-stage-meta">Call Sign: <span class="sim-role-badge">${simState.role.toUpperCase().replace('_', ' ')}</span></div></div>
      <div class="sim-internal-bar"><div class="sim-internal-fill" id="sim-progress" style="width: 0%"></div></div>
      <div class="dialogue-area" id="dialogue-area"></div>
      <div class="sim-control-bar" id="sim-control-bar" style="display:none;">
        <button id="sim-record-btn" class="record-big-btn" onclick="toggleSimRecording()"><i class="fas fa-microphone"></i> <span>Transmit</span></button>
        <button class="sim-skip-btn" onclick="skipTurn()" title="Bypass">Bypass</button>
        <div class="sim-attempt-info" id="sim-attempt-info"></div>
        <div style="flex:1"></div>
        <button class="sim-exit-btn" onclick="exitSimulation()"><i class="fas fa-sign-out-alt"></i> Abort</button>
      </div>
    </div>
  `;
}

function processNextTurn() {
  const sim = SIMULATIONS.find(s => s.id === simState.activeId);
  const pct = (simState.turnIndex / sim.script.length) * 100;
  document.getElementById('sim-progress').style.width = `${pct}%`;

  if (simState.turnIndex >= sim.script.length) { finishSimulation(); return; }

  const line = sim.script[simState.turnIndex];
  simState.attempts = 0;
  
  if (line.speaker === simState.role) {
    renderUserPrompt(line); setupRecordingState();
  } else {
    document.getElementById('sim-control-bar').style.display = 'none';
    renderSystemLine(line); playFallbackAudio(line.text, () => { simState.turnIndex++; setTimeout(processNextTurn, 500); });
  }
}

function renderSystemLine(line) {
  const area = document.getElementById('dialogue-area');
  const bubble = document.createElement('div');
  bubble.className = 'dialogue-bubble system-line';
  bubble.innerHTML = `<div class="bubble-avatar avatar-system"><i class="fas fa-network-wired"></i></div><div class="bubble-content"><div class="bubble-speaker">${line.speaker.replace('_', ' ')}</div><div class="bubble-text">${line.text}</div></div>`;
  area.appendChild(bubble); area.scrollTop = area.scrollHeight;
}

function renderUserPrompt(line) {
  const area = document.getElementById('dialogue-area');
  const bubble = document.createElement('div');
  bubble.className = 'dialogue-bubble user-prompt';
  bubble.id = `turn-${simState.turnIndex}`;
  bubble.innerHTML = `<div class="bubble-avatar avatar-user"><i class="fas fa-user-astronaut"></i></div><div class="bubble-content"><div class="bubble-say-label">Transmission required: <button class="btn btn-ghost btn-sm" onclick="playHint('${line.text.replace(/'/g, "\\'")}')"><i class="fas fa-volume-up"></i> Decode</button></div><div class="bubble-text">${line.text}</div><div class="turn-feedback" id="feedback-${simState.turnIndex}"></div></div>`;
  area.appendChild(bubble); area.scrollTop = area.scrollHeight;
}

window.playHint = function(text) {
  const btn = document.getElementById('sim-record-btn');
  if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; btn.querySelector('span').textContent = "Decoding..."; }
  playFallbackAudio(text, () => {
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.querySelector('span').textContent = "Transmit"; }
  });
};

function setupRecordingState() {
  const controlBar = document.getElementById('sim-control-bar');
  controlBar.style.display = 'flex';
  document.getElementById('sim-attempt-info').textContent = `Attempts remaining: ${simState.maxAttempts}`;
  const btn = document.getElementById('sim-record-btn');
  btn.classList.remove('recording'); btn.querySelector('span').textContent = "Transmit";
  if (recognition) { recognition.onend = null; recognition.onerror = null; recognition.onresult = null; recognition.abort(); }
}

window.toggleSimRecording = function() {
  const btn = document.getElementById('sim-record-btn');
  
  if (btn.classList.contains('recording')) {
    if (recognition) { try { recognition.stop(); } catch(e){} }
    btn.classList.remove('recording');
    btn.querySelector('span').textContent = "Transmit";
    isListening = false;
    return;
  }
  
  if (recognition) { try { recognition.abort(); } catch(e){} }
  if (!SpeechRec) return alert("Speech recognition not supported in this browser.");
  
  stopAllAudio();
  isListening = true;
  
  recognition = new SpeechRec();
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  btn.classList.add('recording'); btn.querySelector('span').textContent = "Listening...";
  const sim = SIMULATIONS.find(s => s.id === simState.activeId);
  const target = sim.script[simState.turnIndex].text;
  
  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    const normalizedTranscript = normalizeSpeech(transcript);
    const normalizedTarget = normalizeSpeech(target);
    const score = calculateSimilarity(normalizedTranscript, normalizedTarget);
    const feedback = document.getElementById(`feedback-${simState.turnIndex}`);
    simState.attempts++;
    
    if (score >= PASS_THRESHOLD) {
      feedback.innerHTML = `<span style="color:var(--success)"><i class="fas fa-check"></i> Verified (${Math.round(score*100)}%)</span>`;
      simState.score += 1;
      simState.turnIndex++; 
      isListening = false;
      document.getElementById('sim-control-bar').style.display='none';
      setTimeout(processNextTurn, 1000);
    } else {
      if (simState.attempts >= simState.maxAttempts) {
        feedback.innerHTML = `<span style="color:var(--error)"><i class="fas fa-times"></i> Max attempts. Bypassing...</span>`;
        simState.turnIndex++; 
        isListening = false;
        document.getElementById('sim-control-bar').style.display='none';
        setTimeout(processNextTurn, 1500);
      } else {
        feedback.innerHTML = `<span style="color:var(--secondary)"><i class="fas fa-exclamation-triangle"></i> Mismatch: "${transcript}". Try again.</span>`;
        setupRecordingState();
        isListening = false;
      }
    }
  };
  recognition.onend = () => { setupRecordingState(); isListening = false; };
  recognition.onerror = () => { setupRecordingState(); isListening = false; };
  try { recognition.start(); } catch (e) { console.error(e); isListening = false; }
};

window.skipTurn = function() { simState.turnIndex++; processNextTurn(); };

window.exitSimulation = function() {
  stopAllAudio();
  if (recognition) {try{recognition.abort();}catch(e){}}
  isListening = false;
  simState.activeId = null; 
  renderPracticeGallery();
};

function finishSimulation() {
  document.getElementById('sim-progress').style.width = `100%`;
  const simId = simState.activeId;
  const sim = SIMULATIONS.find(s => s.id === simId);
  const userLines = sim.script.filter(l => l.speaker === simState.role).length;
  const finalScore = Math.round((simState.score / userLines) * 100);
  
  const area = document.getElementById('dialogue-area');
  const completionDiv = document.createElement('div');
  completionDiv.style.textAlign = 'center'; completionDiv.style.padding = 'var(--space-4)'; completionDiv.style.marginTop = 'var(--space-4)'; completionDiv.style.borderTop = '1px dashed var(--outline-variant)';
  completionDiv.innerHTML = `<h3 style="color:var(--primary); margin-bottom:10px;"><i class="fas fa-flag-checkered"></i> SIMULATION COMPLETE</h3><p>Performance Logged.</p><button class="btn btn-primary" style="margin-top:15px;" onclick="exitSimulation()">Return to Tactics</button>`;
  area.appendChild(completionDiv); area.scrollTop = area.scrollHeight;
  
  if (finalScore >= (PASS_THRESHOLD * 100)) {
      toggleItem(simId, true);
  }
}

// ============================================================================
// EXERCISES LOGIC
// ============================================================================

function initExercises() {
    renderEx1();
    renderEx2();
    renderEx3();
    renderEx4();
    renderEx5();
}

// Exercise 1
const EX1_DATA =[
    { q: "A report detailing the composition, strength, and capabilities of enemy forces in a sector is an:", opts:["INTREP", "CASREP", "LOGREP", "AAR"], ans: 0, exp: "INTREP (Intelligence Report) is used for enemy information." },
    { q: "A unit has sustained injuries and requires immediate medical evacuation. Which report is sent?", opts:["SITREP", "SPOTREP", "CASREP", "PERSREP"], ans: 2, exp: "CASREP (Casualty Report) is used to report wounded or killed personnel." },
    { q: "A platoon leader spots a group of armed insurgents setting up an ambush. Which immediate report should be sent?", opts: ["INTREP", "SITREP", "SPOTREP", "AAR"], ans: 2, exp: "SPOTREP is used for immediate tactical observations (often in SALUTE format)." },
    { q: "A company commander must report the number of operational vehicles, remaining rations, and fuel levels. Which report?", opts:["PERSREP", "LOGREP", "SITREP", "INTSUM"], ans: 1, exp: "LOGREP (Logistics Report) covers supply and equipment status." },
    { q: "A scheduled update sent every 12 hours to battalion HQ detailing friendly activities and current status is a:", opts:["SITREP", "SPOTREP", "Brief", "AAR"], ans: 0, exp: "SITREP (Situation Report) is periodic and scheduled." }
];

function renderEx1() {
    const container = document.getElementById('ex1-container');
    if (!container) return;
    container.innerHTML = EX1_DATA.map((d, i) => `
        <div class="exercise-item" style="margin-bottom: 20px;">
            <div class="ex-q" style="font-weight: 600; margin-bottom: 10px; color: var(--on-surface);">${i+1}. ${d.q}</div>
            <div class="ex-options" id="ex1-opts-${i}" style="display: flex; flex-direction: column; gap: 8px;">
                ${d.opts.map((opt, oi) => `
                    <label class="ex-opt" style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 12px; background: var(--surface-container-low); border: 1px solid var(--outline-variant); border-radius: 8px; transition: all 0.2s;">
                        <input type="radio" name="ex1-q${i}" value="${oi}" style="accent-color: var(--primary);">
                        <span>${opt}</span>
                    </label>
                `).join('')}
            </div>
            <div id="ex1-q${i}-feedback" class="q-feedback hidden" style="margin-top: 8px; font-size: 0.85rem; padding: 8px; border-radius: 4px; background: var(--surface-container-high);"></div>
        </div>
    `).join('');
}

window.checkEx1 = function() {
    let score = 0;
    EX1_DATA.forEach((d, i) => {
        const selected = document.querySelector(`input[name="ex1-q${i}"]:checked`);
        const fb = document.getElementById(`ex1-q${i}-feedback`);
        fb.classList.remove('hidden');
        if (selected && parseInt(selected.value) === d.ans) {
            score++;
            fb.innerHTML = `<span style="color: var(--success); font-weight: 600;"><i class="fas fa-check"></i> CORRECT.</span> ${d.exp}`;
        } else {
            fb.innerHTML = `<span style="color: var(--error); font-weight: 600;"><i class="fas fa-times"></i> INCORRECT.</span> ${d.exp}`;
        }
    });
    const fb = document.getElementById('ex1-feedback');
    fb.innerHTML = `Score: ${score}/5.`;
    fb.className = 'ex-feedback show ' + (score === 5 ? 'feedback-correct' : 'feedback-wrong');
    if (score === 5) {
        document.getElementById('ex1-cb').checked = true;
        toggleItem('ex1', true);
    }
};

window.resetEx1 = function() { renderEx1(); document.getElementById('ex1-feedback').className='ex-feedback hidden'; };

// Exercise 2
const EX2_SENTENCES =[
    { text: "1. The patrol encountered heavy resistance. {0}, they were forced to withdraw.", ans: "Consequently" },
    { text: "2. We require artillery support. {0}, we request a MEDEVAC for two casualties.", ans: "Additionally" },
    { text: "3. {0}, the enemy forces established defensive positions. Subsequently, they began laying mines.", ans: "Initially" },
    { text: "4. The bridge was secured at 1400Z. {0}, it was destroyed by an airstrike at 1430Z.", ans: "However" },
    { text: "5. We lack anti-armour weapons. {0}, we cannot hold the position against a tank assault.", ans: "Therefore" }
];
const EX2_WORDS = ["Consequently", "Additionally", "Initially", "However", "Therefore"];

function renderEx2() {
    const container = document.getElementById('ex2-container');
    if (!container) return;
    container.innerHTML = `
        <div style="margin-bottom: 15px; display: flex; flex-wrap: wrap; gap: 8px; padding: 12px; background: var(--surface-container-high); border-radius: 8px; border: 1px dashed var(--outline);">
            <strong style="margin-right: 10px; color: var(--primary);">WORD BANK:</strong> 
            ${EX2_WORDS.map(w => `<span class="badge" style="background: var(--secondary-container); color: var(--on-secondary-container); padding: 4px 10px; border-radius: 4px; font-size: 0.8rem;">${w}</span>`).join(' ')}
        </div>
        <div class="ex-text" style="line-height: 2.5; font-family: var(--font-mono); color: var(--on-surface);">
            ${EX2_SENTENCES.map((s, i) => s.text.replace("{0}", `<input type="text" class="ex-input" id="ex2-g${i}" style="background: transparent; border: none; border-bottom: 2px solid var(--outline); width: 120px; text-align: center; color: var(--primary); font-weight: bold; outline: none;">`)).join("<br>")}
        </div>
    `;
}

window.checkEx2 = function() {
    let score = 0;
    EX2_SENTENCES.forEach((s, i) => {
        const el = document.getElementById(`ex2-g${i}`);
        if (el.value.trim().toLowerCase() === s.ans.toLowerCase()) {
            score++;
            el.style.borderBottomColor = 'var(--success)';
            el.style.color = 'var(--success)';
        } else {
            el.style.borderBottomColor = 'var(--error)';
            el.style.color = 'var(--error)';
        }
    });
    const fb = document.getElementById('ex2-feedback');
    fb.innerHTML = `Score: ${score}/5.`;
    fb.className = 'ex-feedback show ' + (score === 5 ? 'feedback-correct' : 'feedback-wrong');
    if (score === 5) {
        document.getElementById('ex2-cb').checked = true;
        toggleItem('ex2', true);
    }
};

window.resetEx2 = function() { renderEx2(); document.getElementById('ex2-feedback').className='ex-feedback hidden'; };

// Exercise 3
const EX3_ORDER =["Introduction", "Aim", "Recommendation", "Body", "Conclusions"];

function renderEx3() {
    const chips = document.getElementById('ex3-chips');
    const slots = document.getElementById('ex3-slots');
    if (!chips || !slots) return;
    
    const shuffled = [...EX3_ORDER].sort(() => Math.random() - 0.5);
    chips.innerHTML = shuffled.map(s => `<div class="drag-chip" draggable="true" ondragstart="handleEx3Drag(event)" id="ex3-chip-${s}" style="padding: 10px 20px; background: var(--primary-container); color: var(--on-primary-container); border-radius: 20px; cursor: grab; font-weight: bold; font-size: 0.8rem; border: 1px solid var(--outline);">${s}</div>`).join('');
    
    slots.innerHTML = EX3_ORDER.map((_, i) => `
        <div class="drop-slot" ondragover="event.preventDefault()" ondrop="handleEx3Drop(event, ${i})" style="display: flex; align-items: center; gap: 15px; padding: 10px; border: 1px dashed var(--outline); border-radius: 8px; min-height: 50px; margin-bottom: 8px; background: var(--surface-container-low);">
            <span style="font-weight: bold; color: var(--secondary); min-width: 60px;">Para ${i+1}:</span>
            <div class="slot-content" id="ex3-slot-${i}" style="flex: 1; display: flex; align-items: center;"></div>
        </div>
    `).join('');
}

window.handleEx3Drag = function(e) { e.dataTransfer.setData('text', e.target.id); };
window.handleEx3Drop = function(e, idx) {
    e.preventDefault();
    const chipId = e.dataTransfer.getData('text');
    const chip = document.getElementById(chipId);
    const slot = document.getElementById(`ex3-slot-${idx}`);
    if (slot.children.length === 0) {
        slot.appendChild(chip);
        slot.parentElement.style.background = 'var(--surface-container-high)';
        slot.parentElement.style.borderStyle = 'solid';
    }
};
window.allowDrop = function(e) { e.preventDefault(); };
window.handleDrop = function(e, targetId) {
    e.preventDefault();
    const chipId = e.dataTransfer.getData('text');
    const chip = document.getElementById(chipId);
    if (chip && targetId === 'ex3-chips') {
        document.getElementById('ex3-chips').appendChild(chip);
    }
};

window.checkEx3 = function() {
    let score = 0;
    EX3_ORDER.forEach((ans, i) => {
        const slot = document.getElementById(`ex3-slot-${i}`);
        if (slot.children.length > 0 && slot.children[0].textContent === ans) {
            score++;
            slot.parentElement.style.borderColor = 'var(--success)';
            slot.parentElement.style.background = 'var(--success-container)';
        } else {
            slot.parentElement.style.borderColor = 'var(--error)';
            slot.parentElement.style.background = 'var(--error-container)';
        }
    });
    const fb = document.getElementById('ex3-feedback');
    fb.innerHTML = `Score: ${score}/5. Correct order: ${EX3_ORDER.join(', ')}`;
    fb.className = 'ex-feedback show ' + (score === 5 ? 'feedback-correct' : 'feedback-wrong');
    if (score === 5) {
        document.getElementById('ex3-cb').checked = true;
        toggleItem('ex3', true);
    }
};

window.resetEx3 = function() { renderEx3(); document.getElementById('ex3-feedback').className='ex-feedback hidden'; };

// Exercise 4
const EX4_DATA =[
    { q: "Assessment based on one source with low reliability (15-25%).", a: "Improbable" },
    { q: "Information which is more likely than not to be true (50-75%).", a: "Probably / Likely" },
    { q: "Assessment with approximately 50/50 chance of occurrence (25-50%).", a: "Realistic probability" },
    { q: "High level of probability based on multiple reliable sources (75-90%).", a: "Highly probable" },
    { q: "Assessment where there is no reasonable doubt (over 90%).", a: "Almost certain" }
];
const EX4_OPTS =["Improbable", "Realistic probability", "Probably / Likely", "Highly probable", "Almost certain"];

function renderEx4() {
    const container = document.getElementById('ex4-container');
    if (!container) return;
    container.innerHTML = EX4_DATA.map((d, i) => `
        <div class="exercise-item" style="margin-bottom: 15px; display: flex; align-items: center; gap: 15px; padding: 12px; background: var(--surface-container-low); border-radius: 8px; border: 1px solid var(--outline-variant);">
            <div style="flex: 1; font-size: 0.9rem; color: var(--on-surface);">${d.q}</div>
            <select id="ex4-s${i}" class="ex-select" style="padding: 8px; border-radius: 6px; border: 1px solid var(--outline); background: var(--surface); color: var(--on-surface); width: 200px; cursor: pointer; outline: none;">
                <option value="">-- Term --</option>
                ${EX4_OPTS.map(o => `<option value="${o}">${o}</option>`).join('')}
            </select>
        </div>
    `).join('');
}

window.checkEx4 = function() {
    let score = 0;
    EX4_DATA.forEach((d, i) => {
        const el = document.getElementById(`ex4-s${i}`);
        const val = el.value;
        if (val === d.a) {
            score++;
            el.style.borderColor = 'var(--success)';
            el.style.color = 'var(--success)';
        } else {
            el.style.borderColor = 'var(--error)';
            el.style.color = 'var(--error)';
        }
    });
    const fb = document.getElementById('ex4-feedback');
    fb.innerHTML = `Score: ${score}/5.`;
    fb.className = 'ex-feedback show ' + (score === 5 ? 'feedback-correct' : 'feedback-wrong');
    if (score === 5) {
        document.getElementById('ex4-cb').checked = true;
        toggleItem('ex4', true);
    }
};

window.resetEx4 = function() { renderEx4(); document.getElementById('ex4-feedback').className='ex-feedback hidden'; };

// Exercise 5: Rewrite
const EX5_MODEL = "INCIDENT REPORT DTG: 140823ZOCT25 UNIT: B COY, 3 BN SUBJ: IED DETONATION, MAIN GATE, FOB EAGLE 1. An IED detonated at the main gate of FOB EAGLE at 0823Z. 1 x WIA confirmed. CASEVAC requested at 0826Z. 2. The area was immediately cordoned. EOD was tasked at 0831Z. EOD arrival was delayed due to route constraints. Arrival time: 0910Z. 3. An estimated 3 x vehicles sustained blast damage. Damage assessment is ongoing. Full CASREP to follow NLT 141200ZOCT25. 4. En responsibility: PROBABLE (50-75%). Further INTREP follows.";

window.checkEx5 = function() {
    const input = document.getElementById('ex5-input').value;
    if (!input.trim()) return;
    
    const score = calculateSimilarity(input, EX5_MODEL);
    const pct = Math.round(score * 100);
    
    let styleBonus = 0;
    if (input.includes('WIA')) styleBonus += 5;
    if (input.includes('DTG')) styleBonus += 5;
    if (input.includes('Z')) styleBonus += 5;
    if (input.includes('NLT')) styleBonus += 5;
    
    const totalScore = Math.min(100, pct + styleBonus);
    
    const fb = document.getElementById('ex5-feedback');
    fb.innerHTML = `
        <div style="margin-bottom: 10px;">Style Compliance Score: <strong>${totalScore}%</strong></div>
        <div class="doc-frame" style="background: var(--surface-container-high); border-color: var(--success); text-align: left;">
            <div class="doc-header" style="background: var(--success-container); color: var(--on-success-container);">Model NATO Solution</div>
            <div class="doc-body-inner" style="font-size: 0.8rem; font-family: monospace; white-space: pre-wrap;">${EX5_MODEL}</div>
        </div>
    `;
    fb.className = 'ex-feedback show ' + (totalScore > 70 ? 'feedback-correct' : 'feedback-partial');
    fb.style.display = 'block';

    if (totalScore > 70) {
        document.getElementById('ex5-cb').checked = true;
        toggleItem('ex5', true);
    }
};

window.revealModelEx5 = function() {
    const el = document.getElementById('ex5-model');
    if (el) {
        el.classList.remove('hidden');
        el.style.display = 'block';
        setTimeout(() => {
            el.classList.add('hidden');
            el.style.display = 'none';
        }, 3000);
    }
};