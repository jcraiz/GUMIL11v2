'use strict';

// ============================================================================
// CONSTANTS & STATE
// ============================================================================

const STORAGE_KEY = 'military_l11_u6_known';
const PASS_THRESHOLD = 0.70;

let currentMode = 'study'; // 'study' or 'practice'
let currentPFilter = 'vocab';

// Ensure globals are properly bound to prevent ReferenceErrors
window.knownItems = new Set();
window.practiceScores = {};
window.TOTAL_ITEMS = 0;

// Anti-Cheat Variables
let isListening = false;
let currentAudio = null;

let recognition = null;
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
const synth = window.speechSynthesis;

// Simulation State
let simGlobalState = {};

try {
  const savedItems = localStorage.getItem(STORAGE_KEY);
  if (savedItems) window.knownItems = new Set(JSON.parse(savedItems));
  const savedScores = localStorage.getItem('military_l11_u6_practice');
  if (savedScores) window.practiceScores = JSON.parse(savedScores);
} catch (e) {
  console.error("Error loading progress:", e);
}

// ============================================================================
// DATA STRUCTURES: TECHNICAL VOCABULARY
// ============================================================================
const VOCAB_DATA =[
    {
        id: "v-officers",
        title: "NATO Rank Codes – Officers (OF-1 to OF-10)",
        count: "10 Ranks",
        icon: "fas fa-star",
        description: `
            <div class="visual-ref-card" onclick="showRankImage('officers')" style="cursor:pointer; background:var(--surface-container); border:1px solid var(--primary); border-radius:12px; padding:1rem; margin-bottom:1.5rem; display:flex; align-items:center; gap:1rem; transition:0.2s; border-left:4px solid var(--primary);">
                <div style="background:var(--primary); color:var(--on-primary); width:40px; height:40px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
                    <i class="fas fa-image"></i>
                </div>
                <div>
                    <div style="font-weight:700; color:var(--primary); font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px;">Visual Reference Guide</div>
                    <div style="font-size:0.8rem; color:var(--on-surface-variant);">View Official Officer Shoulder Board Insignia</div>
                </div>
                <i class="fas fa-expand-arrows-alt" style="margin-left:auto; color:var(--primary); opacity:0.7;"></i>
            </div>
        `,
        items:[
            { id: "v-of1", nato: "OF-1", eng: "Sub-Lieutenant / Ensign", col: "Teniente de Corbeta / Cadete" },
            { id: "v-of2", nato: "OF-2", eng: "Lieutenant", col: "Teniente de Navío" },
            { id: "v-of3", nato: "OF-3", eng: "Lt Commander / Major", col: "Capitán de Corbeta / Mayor (IM)" },
            { id: "v-of4", nato: "OF-4", eng: "Commander / Lt Colonel", col: "Capitán de Fragata / Teniente Coronel (IM)" },
            { id: "v-of5", nato: "OF-5", eng: "Captain / Colonel", col: "Capitán de Navío / Coronel (IM)" },
            { id: "v-of6", nato: "OF-6", eng: "Commodore / Brigadier", col: "Contralmirante / Brigadier General" },
            { id: "v-of7", nato: "OF-7", eng: "Rear Admiral / Major General", col: "Vicealmirante / Mayor General" },
            { id: "v-of8", nato: "OF-8", eng: "Vice Admiral / Lt General", col: "Almirante / Teniente General" },
            { id: "v-of9", nato: "OF-9", eng: "Admiral / General", col: "Almirante (ARC)" },
            { id: "v-of10", nato: "OF-10", eng: "Admiral of the Fleet / Field Marshal", col: "Ceremonial / OTAN" }
        ]
    },
    {
        id: "v-enlisted",
        title: "Enlisted Ranks (OR-1 to OR-9)",
        count: "6 Groups",
        icon: "fas fa-chevron-up",
        description: `
            <div class="visual-ref-card" onclick="showRankImage('enlisted')" style="cursor:pointer; background:var(--surface-container); border:1px solid var(--primary); border-radius:12px; padding:1rem; margin-bottom:1.5rem; display:flex; align-items:center; gap:1rem; transition:0.2s; border-left:4px solid var(--primary);">
                <div style="background:var(--primary); color:var(--on-primary); width:40px; height:40px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
                    <i class="fas fa-image"></i>
                </div>
                <div>
                    <div style="font-weight:700; color:var(--primary); font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px;">Visual Reference Guide</div>
                    <div style="font-size:0.8rem; color:var(--on-surface-variant);">View Official Enlisted Shoulder Board Insignia</div>
                </div>
                <i class="fas fa-expand-arrows-alt" style="margin-left:auto; color:var(--primary); opacity:0.7;"></i>
            </div>
        `,
        items:[
            { id: "v-or1", nato: "OR-1/2", eng: "Private / Able Rating / Seaman", col: "Marinero Segundo / Primero" },
            { id: "v-or3", nato: "OR-3/4", eng: "Lance Corporal / Corporal", col: "Cabo / Cabo Primero" },
            { id: "v-or5", nato: "OR-5/6", eng: "Sergeant / Staff Sergeant", col: "Sargento Segundo / Primero" },
            { id: "v-or7", nato: "OR-7", eng: "Chief Petty Officer", col: "Suboficial Jefe Técnico / Suboficial Jefe" },
            { id: "v-or8", nato: "OR-8", eng: "Warrant Officer Class 2", col: "Suboficial Primero / Segundo" },
            { id: "v-or9", nato: "OR-9", eng: "Warrant Officer Class 1 / Command CPO", col: "Suboficial Jefe Técnico de Comando" }
        ]
    },
    {
        id: "v-appointments",
        title: "Key Appointments",
        count: "7 Roles",
        icon: "fas fa-id-badge",
        items:[
            { id: "v-co", code: "CO", desc: "Commanding Officer (Comandante de Unidad)" },
            { id: "v-xo", code: "XO", desc: "Executive Officer (Segundo Comandante)" },
            { id: "v-2ic", code: "2IC", desc: "Second-in-Command" },
            { id: "v-cos", code: "COS", desc: "Chief of Staff (Jefe de Estado Mayor)" },
            { id: "v-bde", code: "Bde Comd", desc: "Brigade Commander" },
            { id: "v-pl", code: "Pl Comd / Sect Comd", desc: "Platoon / Section Commander" },
            { id: "v-saceur", code: "SACEUR", desc: "Supreme Allied Commander Europe" }
        ]
    },
    {
        id: "v-staff",
        title: "Staff Functions (J1 – J9)",
        count: "9 Functions",
        icon: "fas fa-users-cog",
        items:[
            { id: "v-j1", code: "J1", desc: "Personnel & Admin" },
            { id: "v-j2", code: "J2", desc: "Intelligence & Security" },
            { id: "v-j3", code: "J3", desc: "Operations" },
            { id: "v-j4", code: "J4", desc: "Logistics" },
            { id: "v-j5", code: "J5", desc: "Plans & Policy" },
            { id: "v-j6", code: "J6", desc: "CIS (Communications)" },
            { id: "v-j7", code: "J7", desc: "Training & Exercises" },
            { id: "v-j8", code: "J8", desc: "Budget & Finance" },
            { id: "v-j9", code: "J9", desc: "CIMIC (Civil-Military Cooperation)" }
        ]
    },
    {
        id: "v-colombian",
        title: "Colombian Navy (ARC) Full Hierarchy",
        count: "Information",
        icon: "fas fa-anchor",
        content: `
            <div class="info-box">
                <strong>Oficiales Navales:</strong> Almirante (Admiral) | Vicealmirante (Vice Admiral) | Contralmirante (Rear Admiral) | Capitán de Navío (Captain) | Capitán de Fragata (Commander) | Capitán de Corbeta (Lt Commander) | Teniente de Navío (Lieutenant) | Teniente de Fragata (Lieutenant JG) | Teniente de Corbeta (Ensign) | Cadete (Cadet).<br><br>
                <strong>Suboficiales:</strong> Suboficial Jefe Técnico de Comando Conjunto (Joint Command Chief Technical Officer) | Suboficial Jefe Técnico de Comando | Suboficial Jefe Técnico | Suboficial Jefe (Chief Petty Officer) | Suboficial Primero | Suboficial Segundo | Suboficial Tercero | Marinero Primero (Seaman) | Marinero Segundo (Seaman Apprentice).<br><br>
                <strong>Infantería de Marina:</strong> Mayor General (Major General) | Brigadier General | Coronel (Colonel) | Teniente Coronel (Lt Colonel) | Mayor (Major) | Capitán (Captain) | Teniente (Lieutenant) | Subteniente (Second Lieutenant).
            </div>
        `
    },
    {
        id: "v-nato",
        title: "NATO Command Structure",
        count: "3 Levels",
        icon: "fas fa-globe",
        content: `
            <div class="info-box" style="border-left-color: var(--teal); background: rgba(26,109,107,0.1);">
                <strong>ESTRATÉGICO:</strong> SHAPE / SACEUR<br>
                <strong>OPERACIONAL:</strong> JFC Brunssum, JFC Naples, JFC Norfolk<br>
                <strong>TÁCTICO:</strong> LANDCOM (Ejército), MARCOM (Marítimo), AIRCOM (Aire). La Armada de Colombia se alinea con MARCOM.<br><br>
                <em>Prefijos en HQs: G (componente terrestre), J (conjunto), M (marítimo), S (unidad), A (aire).</em>
            </div>
        `
    }
];

// --- 3. CONTENT DATA: FORMATS & MODELS ---
const FORMATS_DATA =[
    {
        id: "f-address",
        title: "Addressing International Officers",
        count: "Protocol",
        icon: "fas fa-comments",
        content: `
            <table class="phrase-table" style="width:100%; border-collapse:collapse; margin-bottom:1rem;">
                <thead>
                    <tr style="background:var(--surface-container); border-bottom:1px solid var(--outline-variant);">
                        <th style="padding:10px; text-align:left;">Rank (English)</th>
                        <th style="padding:10px; text-align:left;">Verbal Address</th>
                        <th style="padding:10px; text-align:left;">Example</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom:1px solid var(--outline-variant);">
                        <td style="padding:10px;">Major General / Brigadier General</td>
                        <td style="padding:10px;">"General"</td>
                        <td style="padding:10px; font-family:monospace;">"Good morning, General Smith."</td>
                    </tr>
                    <tr style="border-bottom:1px solid var(--outline-variant);">
                        <td style="padding:10px;">Lieutenant Colonel</td>
                        <td style="padding:10px;">"Colonel"</td>
                        <td style="padding:10px; font-family:monospace;">"Yes, Colonel."</td>
                    </tr>
                    <tr style="border-bottom:1px solid var(--outline-variant);">
                        <td style="padding:10px;">Lieutenant Commander</td>
                        <td style="padding:10px;">"Commander"</td>
                        <td style="padding:10px; font-family:monospace;">"Commander, the report is ready."</td>
                    </tr>
                    <tr style="border-bottom:1px solid var(--outline-variant);">
                        <td style="padding:10px;">Captain (Navy) / Captain (Army)</td>
                        <td style="padding:10px;">"Captain"</td>
                        <td style="padding:10px; font-family:monospace;">"Captain, the vessel is ready."</td>
                    </tr>
                    <tr>
                        <td style="padding:10px;">Admiral (OF-9)</td>
                        <td style="padding:10px;">"Admiral"</td>
                        <td style="padding:10px; font-family:monospace;">"Admiral, the fleet is deployed."</td>
                    </tr>
                </tbody>
            </table>
            <div class="info-box">
                <i class="fas fa-lightbulb" style="color:var(--primary); margin-right:8px;"></i>
                <strong>Explanation Model:</strong> "Good morning. I am Lieutenant Rojas, International Liaison Officer. Today I will brief you on the Colombian Navy rank alignment with NATO MARCOM. Our highest rank is Admiral (OF-9). The chain of command includes CO, XO, and staff branches J1 to J9."
            </div>
        `
    }
];

// --- 4. EXERCISES DATA ---
const EX1_DATA =[
    { q: "NATO OF-4 equivalent of Colombian 'Capitán de Fragata'?", opts: ["OF-3","OF-4","OF-5","OF-2"], ans: 1, exp: "Commander = OF-4" },
    { q: "How to address a Major General?", opts:["Major General","General","Sir only","General + last name"], ans: 1, exp: "Use 'General'" },
    { q: "Which J-code handles CIMIC?", opts:["J5","J9","J7","J2"], ans: 1, exp: "J9 Civil-Military Cooperation" },
    { q: "SACEUR leads which HQ?", opts: ["MARCOM","SHAPE","JFC","LANDCOM"], ans: 1, exp: "Supreme Allied Commander Europe leads SHAPE" },
    { q: "Colombian Navy aligns with which NATO tactical command?", opts: ["AIRCOM","MARCOM","LANDCOM","JFC"], ans: 1, exp: "MARCOM (Maritime)" }
];

const EX2_DATA =[
    { id:'j3', text:'Operations (J3)', correctSlot:2 },
    { id:'j2', text:'Intelligence (J2)', correctSlot:1 },
    { id:'j4', text:'Logistics (J4)', correctSlot:3 },
    { id:'j1', text:'Personnel (J1)', correctSlot:0 },
    { id:'j5', text:'Plans (J5)', correctSlot:4 }
];
const EX2_SLOTS =['J1 – Personnel','J2 – Intel','J3 – Ops','J4 – Logistics','J5 – Plans'];

const EX3_DATA =[
    { before: "Good morning, ", after: ", I am Lieutenant Diaz.", options: ["Admiral","General","Captain","Colonel"], correct: "Admiral" },
    { before: "The Colombian Marine Brigade is commanded by a ", after: " (OF-7).", options: ["Major General","Brigadier","Rear Admiral","General"], correct: "Major General" },
    { before: "The staff branch responsible for training is ", after: ".", options:["J7","J3","J5","J9"], correct: "J7" },
    { before: "J6 in a joint HQ stands for ", after: " systems.", options: ["CIS","Logistics","Personnel","Operations"], correct: "CIS" },
    { before: "The second-in-command of a ship is the ", after: " (XO).", options: ["Executive Officer","Operations Officer","Chief Engineer","Navigator"], correct: "Executive Officer" },
    { before: "NATO operational JFC in the US is JFC ", after: ".", options: ["Norfolk","Brunssum","Naples","Lille"], correct: "Norfolk" }
];

const EX4_DATA = [
    { q:"Strategic NATO HQ led by SACEUR?", opts:["SHAPE","MARCOM","JFC","LANDCOM"], ans:0, exp:"SHAPE"},
    { q:"Colombian Navy aligns with?", opts:["AIRCOM","MARCOM","LANDCOM"], ans:1, exp:"MARCOM"},
    { q:"J8 responsibility?", opts:["Budget","Logistics","Plans","Intel"], ans:0, exp:"Budget & Finance"},
    { q:"Capitán de Navío OF code?", opts:["OF-4","OF-5","OF-6"], ans:1, exp:"OF-5 Captain"}
];

// --- 5. SIMULATIONS DATA ---
const SIMULATIONS_DATA =[
    { title: "1. Opening a briefing to an Admiral", correctOrder:["Good morning, Admiral.","I am Lieutenant Gómez, the International Cooperation Officer.","Today I will brief you on Colombian Navy rank alignment with NATO OF codes.","Please save your questions until the end."] },
    { title: "2. Addressing SACEUR (Strategic level)", correctOrder:["Good morning, General. I am Commander Rojas.","I request your decision on the maritime operation plan.","Three courses of action have been analyzed.","My recommendation is COA 2."] },
    { title: "3. J3 Officer at multinational staff meeting", correctOrder:["Good morning, Colonel. I am Major Silva, J3 Operations.","Our current operational readiness is GREEN.","We are coordinating with MARCOM for the upcoming exercise.","Do you have any questions?"] },
    { title: "4. Chain of command – from CO to MARCOM", correctOrder:["The Commanding Officer leads our task group.","He reports to the operational level at JFC Naples.","Tactical direction comes from MARCOM.","SACEUR provides strategic guidance."] },
    { title: "5. Responding to a Colonel about J2 intelligence", correctOrder:["Sir, J2 is responsible for intelligence and security.","We assess enemy activity as low probability.","I will provide a detailed intelligence brief by 1400.","That concludes my update, pending your questions."] },
    { title: "6. Closing a decision briefing", correctOrder:["In summary, we have three viable courses of action.","My recommendation is COA Bravo.","That concludes my briefing, pending your decision.","Do you have a decision, sir?"] }
];

const PRACTICE_VOCAB =[
    { id: "pv-1", phrase: "Admiral", hint: "OF-9 Commander" },
    { id: "pv-2", phrase: "Lieutenant Commander", hint: "OF-3 Naval Officer" },
    { id: "pv-3", phrase: "Supreme Allied Commander Europe", hint: "SACEUR" },
    { id: "pv-4", phrase: "Chief of Staff", hint: "COS" },
    { id: "pv-5", phrase: "Intelligence and Security", hint: "J2 Function" },
    { id: "pv-6", phrase: "Civil Military Cooperation", hint: "J9 Function (CIMIC)" },
    { id: "pv-7", phrase: "Commanding Officer", hint: "CO - Unit Commander" },
    { id: "pv-8", phrase: "Executive Officer", hint: "XO - Second-in-Command" },
    { id: "pv-9", phrase: "Personnel and Administration", hint: "J1 Function" },
    { id: "pv-10", phrase: "Operations", hint: "J3 Function" },
    { id: "pv-11", phrase: "Logistics", hint: "J4 Function" },
    { id: "pv-12", phrase: "Plans and Policy", hint: "J5 Function" },
    { id: "pv-13", phrase: "Training and Exercises", hint: "J7 Function" },
    { id: "pv-14", phrase: "Budget and Finance", hint: "J8 Function" },
    { id: "pv-15", phrase: "Maritime Command", hint: "MARCOM - Tactical Level" }
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
    const formats = ['.webp', '.webp', '.webp', '.webp'];
    let currentFormatIndex = 0;

    imgElement.onerror = () => {
        currentFormatIndex++;
        if (currentFormatIndex < formats.length) {
            imgElement.src = `assets/${baseName}${formats[currentFormatIndex]}`;
        } else {
            imgElement.style.display = 'none'; 
            console.warn(`All image formats failed for asset: ${baseName}`);
        }
    };
    imgElement.src = `assets/${baseName}${formats[0]}`; 
}

window.showRankImage = function(type) {
    const modal = document.getElementById('image-modal');
    const img = document.getElementById('modal-img-content');
    const title = document.getElementById('image-modal-title');
    
    if (type === 'officers') {
        loadResilientImage(img, 'officers');
        title.innerHTML = '<i class="fas fa-star"></i> Officer Shoulder Boards (OF-1 to OF-10)';
    } else {
        loadResilientImage(img, 'petty_subofficers');
        title.innerHTML = '<i class="fas fa-chevron-up"></i> Enlisted Shoulder Boards (OR-1 to OR-9)';
    }
    
    modal.classList.remove('hidden');
};

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

window.speak = function(text) {
    if (isListening) return;
    playFallbackAudio(text, null, null);
};

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
// LOGIC & INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    calculateTotalItems();
    initUI();
    renderStudyContent();
    renderExercises();
    updateProgressHUD();
});

function calculateTotalItems() {
    let total = 0;
    VOCAB_DATA.forEach(cat => {
        total++; // the category itself
        if (cat.items) total += cat.items.length;
    });
    FORMATS_DATA.forEach(f => total++);['ex1','ex2','ex3','ex4'].forEach(ex => total++);
    PRACTICE_VOCAB.forEach(pv => total++);
    SIMULATIONS_DATA.forEach(sim => total++);
    window.TOTAL_ITEMS = total;
}

function initUI() {
    const statsModal = document.getElementById('stats-modal');
    const imageModal = document.getElementById('image-modal');
    const closeStatsBtn = document.getElementById('close-stats-btn');
    const closeImageBtn = document.getElementById('close-image-btn');
    const statsBtn = document.getElementById('stats-btn');

    if (statsBtn) statsBtn.addEventListener('click', () => statsModal.classList.remove('hidden'));
    if (closeStatsBtn) closeStatsBtn.addEventListener('click', () => statsModal.classList.add('hidden'));
    if (closeImageBtn) closeImageBtn.addEventListener('click', () => imageModal.classList.add('hidden'));

    [statsModal, imageModal].forEach(m => {
        if (m) m.addEventListener('click', (e) => {
            if (e.target === m) m.classList.add('hidden');
        });
    });

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            document.getElementById(currentMode + '-section').classList.add('active');
            updateProgressHUD();
        });
    });

    document.querySelectorAll('.study-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.study-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
        });
    });

    document.querySelectorAll('.pfilter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pfilter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPFilter = btn.dataset.pfilter;
            renderPracticeContent();
        });
    });

    const expandBtn = document.getElementById('expand-all-btn');
    if (expandBtn) expandBtn.addEventListener('click', () => {
        document.querySelectorAll('#study-section .accordion').forEach(acc => acc.classList.add('is-open'));
    });
    
    const collapseBtn = document.getElementById('collapse-all-btn');
    if (collapseBtn) collapseBtn.addEventListener('click', () => {
        document.querySelectorAll('#study-section .accordion').forEach(acc => acc.classList.remove('is-open'));
    });

    const micBtn = document.getElementById('enable-mic-btn');
    if (micBtn) {
        micBtn.addEventListener('click', () => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(() => {
                        document.getElementById('mic-notice').classList.add('hidden');
                        document.getElementById('practice-cards').classList.remove('hidden');
                        document.getElementById('practice-area').classList.remove('hidden');
                        renderPracticeContent();
                    })
                    .catch(err => alert('Microphone access denied or not available.'));
            } else {
                alert('Speech recognition is not supported in this browser.');
            }
        });
    }
}

window.toggleAccordion = function(header) {
    header.parentElement.classList.toggle('is-open');
};

window.toggleItem = function(id, isKnown) {
    if (isKnown) {
        window.knownItems.add(id);
        const group = VOCAB_DATA.find(v => v.id === id);
        if (group && group.items) {
            group.items.forEach(i => { if (i.id) window.knownItems.add(i.id); });
            renderStudyContent();
        }
    } else {
        window.knownItems.delete(id);
        const group = VOCAB_DATA.find(v => v.id === id);
        if (group && group.items) {
            group.items.forEach(i => { if (i.id) window.knownItems.delete(i.id); });
            renderStudyContent();
        }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...window.knownItems]));
    updateProgressHUD();
};

function updateProgressHUD() {
    let totalCompleted = 0;
    
    VOCAB_DATA.forEach(v => {
        if (v.items) {
            v.items.forEach(i => { if(window.knownItems.has(i.id)) totalCompleted++; });
        }
    });

    let sectionsVerified = 0;
    VOCAB_DATA.forEach(v => { if(window.knownItems.has(v.id)) sectionsVerified++; });
    FORMATS_DATA.forEach(f => { if(window.knownItems.has(f.id)) sectionsVerified++; });['ex1','ex2','ex3','ex4'].forEach(ex => { if(window.knownItems.has(ex)) sectionsVerified++; });
    
    totalCompleted += sectionsVerified;

    let totalPracticed = 0;
    PRACTICE_VOCAB.forEach(pv => {
        if (window.practiceScores[pv.id] >= PASS_THRESHOLD) totalPracticed++;
    });
    SIMULATIONS_DATA.forEach((sim, idx) => {
        const stateId = `sim-${idx}`;
        if (window.practiceScores[stateId] >= PASS_THRESHOLD) totalPracticed++;
    });
    
    totalCompleted += totalPracticed;

    const pct = Math.round((totalCompleted / window.TOTAL_ITEMS) * 100) || 0;

    const pctEl = document.getElementById('progress-pct');
    if (pctEl) pctEl.textContent = pct + '%';
    const pbarLabel = document.getElementById('pbar-label');
    if (pbarLabel) pbarLabel.textContent = pct + '% COMPLETED';
    
    const bar = document.getElementById('hud-progress-bar');
    if (bar) {
        bar.innerHTML = '';
        const segments = 20;
        const filledSegments = Math.round((pct / 100) * segments);
        for (let i = 0; i < segments; i++) {
            const seg = document.createElement('div');
            seg.className = 'segment ' + (i < filledSegments ? 'filled' : '');
            bar.appendChild(seg);
        }
    }

    const plabel = document.getElementById('progress-label');
    if (plabel) plabel.textContent = `${totalCompleted} / ${window.TOTAL_ITEMS} Capability Points`;
    
    const statKnown = document.getElementById('stat-known');
    if (statKnown) statKnown.textContent = totalCompleted;
    
    const statPracticed = document.getElementById('stat-practiced');
    if (statPracticed) statPracticed.textContent = totalPracticed;
    
    const statRate = document.getElementById('stat-rate');
    if (statRate) statRate.textContent = pct + '%';
}

function renderStudyContent() {
    const vocabTab = document.getElementById('tab-vocab');
    if (vocabTab) vocabTab.innerHTML = VOCAB_DATA.map(v => buildAccordion(v)).join('');

    const formatsTab = document.getElementById('tab-formats');
    if (formatsTab) formatsTab.innerHTML = FORMATS_DATA.map(f => buildAccordion(f)).join('');

    document.querySelectorAll('.accordion-header').forEach(h => {
        h.addEventListener('click', () => h.parentElement.classList.toggle('is-open'));
    });
}

function buildAccordion(data) {
    const isChecked = window.knownItems.has(data.id) ? 'checked' : '';
    let bodyHtml = '';

    if (data.items) {
        if (data.id.includes('officers') || data.id.includes('enlisted')) {
            bodyHtml += '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:12px; margin-bottom:1rem;">' + data.items.map(i => `
                <div style="background:var(--surface); border:1px solid var(--outline-variant); border-radius:8px; padding:0.8rem 1rem;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
                        <div>
                            <span style="font-size:0.8rem; font-weight:700; color:var(--primary); background:rgba(182,208,136,0.1); padding:0.2rem 0.6rem; border-radius:20px; display:inline-block; margin-bottom:0.4rem;">${i.nato}</span>
                            <div style="font-weight:600; margin-bottom:4px;">${i.eng}</div>
                            <div style="font-size:0.8rem; color:var(--on-surface-variant);">🇨🇴 ${i.col}</div>
                        </div>
                        <div class="item-controls" style="display: flex; align-items: center; gap: 8px;">
                            <button class="audio-btn" onclick="window.speak('${i.eng.replace(/'/g, "\\'")}')" title="Play Audio" style="background:transparent; border:none; cursor:pointer; color:var(--primary); font-size:1.2rem;">
                                <i class="fas fa-volume-up"></i>
                            </button>
                            <label class="know-checkbox" style="display: flex; align-items: center; gap: 4px; font-size: 0.7rem; text-transform: uppercase; cursor: pointer;">
                                <input type="checkbox" class="know-cb" ${window.knownItems.has(i.id) ? 'checked' : ''} onchange="window.toggleItem('${i.id}', this.checked)">
                                <span>Mstr</span>
                            </label>
                        </div>
                    </div>
                </div>
            `).join('') + '</div>';
        } else if (data.id.includes('appointments') || data.id.includes('staff')) {
            bodyHtml += '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:12px; margin-bottom:1rem;">' + data.items.map(i => `
                <div style="background:var(--surface); border:1px solid var(--outline-variant); border-radius:8px; padding:0.8rem 1rem;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
                        <div>
                            <strong style="color:var(--primary);">${i.code}</strong> &mdash; ${i.desc}
                        </div>
                        <div class="item-controls" style="display: flex; align-items: center; gap: 8px;">
                            <button class="audio-btn" onclick="window.speak('${(i.code + ' — ' + i.desc.split('(')[0].trim()).replace(/'/g, "\\'").replace(/"/g, '&quot;')}')" title="Play Audio" style="background:transparent; border:none; cursor:pointer; color:var(--primary); font-size:1.2rem;">
                                <i class="fas fa-volume-up"></i>
                            </button>
                            <label class="know-checkbox" style="display: flex; align-items: center; gap: 4px; font-size: 0.7rem; text-transform: uppercase; cursor: pointer;">
                                <input type="checkbox" class="know-cb" ${window.knownItems.has(i.id) ? 'checked' : ''} onchange="window.toggleItem('${i.id}', this.checked)">
                                <span>Mstr</span>
                            </label>
                        </div>
                    </div>
                </div>
            `).join('') + '</div>';
        }

        if (data.description) bodyHtml += `<div class="vocab-desc" style="margin-top:1.5rem;">${data.description}</div>`;
    } else if (data.content) {
        bodyHtml = data.content;
    }

    return `
        <div class="accordion ${isChecked ? 'is-open' : ''}">
            <div class="accordion-header">
                <div class="acc-icon-box"><i class="${data.icon}"></i></div>
                <div class="acc-title-group">
                    <div class="acc-title">${data.title}</div>
                    <div class="acc-count">${data.count}</div>
                </div>
                <i class="fas fa-chevron-down acc-chevron"></i>
            </div>
            <div class="accordion-body">
                <div class="accordion-inner">${bodyHtml}</div>
                <div class="accordion-footer">
                    <span style="font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase;">Mark section verified:</span>
                    <input type="checkbox" class="know-cb" onchange="window.toggleItem('${data.id}', this.checked)" ${isChecked}>
                </div>
            </div>
        </div>
    `;
}

// ============================================================================
// EXERCISES RENDER & LOGIC
// ============================================================================

function renderExercises() {
    const exTab = document.getElementById('tab-exercises');
    
    let html = `
        <div class="info-box">
            Complete the exercises to verify your understanding of NATO ranks, key appointments, and staff functions.
        </div>
    `;

    // EX1: Multiple Choice
    html += `
        <div class="accordion" id="acc-ex1">
            <div class="accordion-header" onclick="window.toggleAccordion(this)">
                <div class="acc-icon-box"><i class="fas fa-list-ul"></i></div>
                <div class="acc-title-group">
                    <div class="acc-title">Exercise 1: NATO Codes & Equivalents</div>
                    <div class="acc-count">Multiple Choice</div>
                </div>
                <i class="fas fa-chevron-down acc-chevron"></i>
            </div>
            <div class="accordion-body"><div class="accordion-inner">
                <div class="exercise-card" id="ex1-card">
                    <div class="ex-instruction">Select the correct option for each question.</div>
                    <div id="ex1-content"></div>
                    <div class="ex-feedback" id="ex1-feedback"></div>
                    <div class="btn-row" style="margin-top:1rem;">
                        <button class="btn btn-primary" onclick="window.checkEx1()">Check Answers</button>
                        <button class="btn btn-secondary" onclick="window.resetEx1()">Reset</button>
                    </div>
                </div>
            </div>
            <div class="accordion-footer">
                <span style="font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase;">Mark section verified:</span>
                <input type="checkbox" class="know-cb" id="cb-ex1" onchange="window.toggleItem('ex1', this.checked)">
            </div></div>
        </div>
    `;

    // EX2: Drag and Drop
    html += `
        <div class="accordion" id="acc-ex2">
            <div class="accordion-header" onclick="window.toggleAccordion(this)">
                <div class="acc-icon-box"><i class="fas fa-hand-pointer"></i></div>
                <div class="acc-title-group">
                    <div class="acc-title">Exercise 2: Match J-code to Responsibility</div>
                    <div class="acc-count">Drag & Drop</div>
                </div>
                <i class="fas fa-chevron-down acc-chevron"></i>
            </div>
            <div class="accordion-body"><div class="accordion-inner">
                <div class="exercise-card" id="ex2-card">
                    <div class="ex-instruction">Drag each function to the corresponding J-code slot.</div>
                    <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:1rem; min-height:40px; padding:10px; background:var(--surface-container); border-radius:8px;" id="ex2-chips" ondragover="window.allowDrop(event)" ondrop="window.drop(event)"></div>
                    <div id="ex2-slots" style="display:flex; flex-direction:column; gap:8px;"></div>
                    <div class="ex-feedback" id="ex2-feedback"></div>
                    <div class="btn-row" style="margin-top:1rem;">
                        <button class="btn btn-primary" onclick="window.checkEx2()">Check Answers</button>
                        <button class="btn btn-secondary" onclick="window.resetEx2()">Reset</button>
                    </div>
                </div>
            </div>
            <div class="accordion-footer">
                <span style="font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase;">Mark section verified:</span>
                <input type="checkbox" class="know-cb" id="cb-ex2" onchange="window.toggleItem('ex2', this.checked)">
            </div></div>
        </div>
    `;

    // EX3: Dropdown
    html += `
        <div class="accordion" id="acc-ex3">
            <div class="accordion-header" onclick="window.toggleAccordion(this)">
                <div class="acc-icon-box"><i class="fas fa-chevron-circle-down"></i></div>
                <div class="acc-title-group">
                    <div class="acc-title">Exercise 3: Complete the Phrase</div>
                    <div class="acc-count">Dropdown Selection</div>
                </div>
                <i class="fas fa-chevron-down acc-chevron"></i>
            </div>
            <div class="accordion-body"><div class="accordion-inner">
                <div class="exercise-card" id="ex3-card">
                    <div class="ex-instruction">Select the correct word or code in each dropdown.</div>
                    <div id="ex3-content" style="display:flex; flex-direction:column; gap:12px;"></div>
                    <div class="ex-feedback" id="ex3-feedback"></div>
                    <div class="btn-row" style="margin-top:1rem;">
                        <button class="btn btn-primary" onclick="window.checkEx3()">Check Answers</button>
                        <button class="btn btn-secondary" onclick="window.resetEx3()">Reset</button>
                    </div>
                </div>
            </div>
            <div class="accordion-footer">
                <span style="font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase;">Mark section verified:</span>
                <input type="checkbox" class="know-cb" id="cb-ex3" onchange="window.toggleItem('ex3', this.checked)">
            </div></div>
        </div>
    `;

    // EX4: Multiple Choice (HQ)
    html += `
        <div class="accordion" id="acc-ex4">
            <div class="accordion-header" onclick="window.toggleAccordion(this)">
                <div class="acc-icon-box"><i class="fas fa-globe"></i></div>
                <div class="acc-title-group">
                    <div class="acc-title">Exercise 4: NATO Command Structure</div>
                    <div class="acc-count">Multiple Choice</div>
                </div>
                <i class="fas fa-chevron-down acc-chevron"></i>
            </div>
            <div class="accordion-body"><div class="accordion-inner">
                <div class="exercise-card" id="ex4-card">
                    <div class="ex-instruction">Select the correct option for each question regarding NATO HQs and codes.</div>
                    <div id="ex4-content"></div>
                    <div class="ex-feedback" id="ex4-feedback"></div>
                    <div class="btn-row" style="margin-top:1rem;">
                        <button class="btn btn-primary" onclick="window.checkEx4()">Check Answers</button>
                        <button class="btn btn-secondary" onclick="window.resetEx4()">Reset</button>
                    </div>
                </div>
            </div>
            <div class="accordion-footer">
                <span style="font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase;">Mark section verified:</span>
                <input type="checkbox" class="know-cb" id="cb-ex4" onchange="window.toggleItem('ex4', this.checked)">
            </div></div>
        </div>
    `;

    exTab.innerHTML = html;

    window.resetEx1();
    window.resetEx2();
    window.resetEx3();
    window.resetEx4();

    ['ex1','ex2','ex3','ex4'].forEach(id => {
        if(window.knownItems.has(id)) document.getElementById('cb-'+id).checked = true;
    });
}

// ─── EX1 LOGIC ───
window.resetEx1 = function() {
    const container = document.getElementById('ex1-content');
    container.innerHTML = EX1_DATA.map((q, i) => `
        <div class="ex-item" style="margin-bottom:1rem; padding-bottom:1rem; border-bottom:1px solid var(--outline-variant);">
            <div style="font-weight:600; margin-bottom:8px;">${i+1}. ${q.q}</div>
            <div style="display:flex; flex-direction:column; gap:6px;">
                ${q.opts.map((opt, j) => `
                    <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                        <input type="radio" name="ex1-q${i}" value="${j}"> ${opt}
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');
    document.getElementById('ex1-feedback').style.display = 'none';
};

window.checkEx1 = function() {
    let score = 0;
    const inputs = document.querySelectorAll('#ex1-content input[type="radio"]:checked');
    if (inputs.length < EX1_DATA.length) {
        const fb = document.getElementById('ex1-feedback');
        fb.innerHTML = '⚠️ Please answer all questions before checking.';
        fb.style.display = 'block'; fb.className = 'ex-feedback'; fb.style.background = 'var(--gold-light)'; fb.style.color = '#856404';
        return;
    }
    inputs.forEach((inp) => {
        const qIdx = parseInt(inp.name.replace('ex1-q',''));
        if (parseInt(inp.value) === EX1_DATA[qIdx].ans) score++;
    });
    
    const fb = document.getElementById('ex1-feedback');
    fb.innerHTML = `🎯 Score: ${score} / ${EX1_DATA.length}`;
    fb.style.display = 'block';
    
    if (score === EX1_DATA.length) {
        fb.style.background = 'var(--green-light)'; fb.style.color = 'var(--green)';
        document.getElementById('cb-ex1').checked = true;
        window.toggleItem('ex1', true);
    } else {
        fb.style.background = 'var(--red-light)'; fb.style.color = 'var(--red)';
    }
};

// ─── EX2 LOGIC (Drag & Drop) ───
window.allowDrop = function(ev) { ev.preventDefault(); };
window.drag = function(ev) { ev.dataTransfer.setData("text", ev.target.id); };
window.drop = function(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const el = document.getElementById(data);
    if (!el) return;
    
    if (ev.target.classList.contains('drop-slot-box')) {
        if (ev.target.children.length === 0) {
            ev.target.appendChild(el);
        }
    } else if (ev.target.id === 'ex2-chips') {
        ev.target.appendChild(el);
    }
};

window.resetEx2 = function() {
    const chipsContainer = document.getElementById('ex2-chips');
    const slotsContainer = document.getElementById('ex2-slots');
    
    chipsContainer.innerHTML = EX2_DATA.map(d => `
        <div id="${d.id}" class="drag-chip" draggable="true" ondragstart="window.drag(event)" 
             style="background:var(--primary); color:var(--on-primary); padding:6px 12px; border-radius:20px; font-size:0.8rem; cursor:grab;">
             ${d.text}
        </div>
    `).sort(()=>Math.random()-0.5).join('');
    
    slotsContainer.innerHTML = EX2_SLOTS.map((s, i) => `
        <div style="display:flex; align-items:center; gap:12px; background:var(--surface); border:1px solid var(--outline-variant); padding:8px 12px; border-radius:8px;">
            <div style="font-weight:600; font-size:0.85rem; width:120px;">${s}</div>
            <div class="drop-slot-box" data-slot="${i}" ondragover="window.allowDrop(event)" ondrop="window.drop(event)"
                 style="flex:1; min-height:36px; border:2px dashed var(--border); border-radius:20px; display:flex; align-items:center; padding:0 4px;">
            </div>
        </div>
    `).join('');
    
    document.getElementById('ex2-feedback').style.display = 'none';
};

window.checkEx2 = function() {
    let score = 0;
    document.querySelectorAll('.drop-slot-box').forEach(slot => {
        const slotIdx = parseInt(slot.dataset.slot);
        if (slot.children.length > 0) {
            const chipId = slot.children[0].id;
            const item = EX2_DATA.find(d => d.id === chipId);
            if (item && item.correctSlot === slotIdx) {
                score++;
                slot.style.borderColor = 'var(--green)';
                slot.style.background = 'var(--green-light)';
            } else {
                slot.style.borderColor = 'var(--red)';
                slot.style.background = 'var(--red-light)';
            }
        } else {
            slot.style.borderColor = 'var(--red)';
        }
    });
    
    const fb = document.getElementById('ex2-feedback');
    fb.innerHTML = `🎯 Score: ${score} / ${EX2_SLOTS.length}`;
    fb.style.display = 'block';
    
    if (score === EX2_SLOTS.length) {
        fb.style.background = 'var(--green-light)'; fb.style.color = 'var(--green)';
        document.getElementById('cb-ex2').checked = true;
        window.toggleItem('ex2', true);
    } else {
        fb.style.background = 'var(--red-light)'; fb.style.color = 'var(--error)';
    }
};

// ─── EX3 LOGIC (Dropdown) ───
window.resetEx3 = function() {
    const container = document.getElementById('ex3-content');
    container.innerHTML = EX3_DATA.map((q, i) => `
        <div style="background:var(--surface); border:1px solid var(--outline-variant); padding:10px 14px; border-radius:8px;">
            ${i+1}. ${q.before} 
            <select id="ex3-sel-${i}" style="padding:4px 8px; border-radius:4px; border:1px solid var(--primary); font-family:var(--font-mono); font-size:0.85rem; background:var(--surface-container-high); color:var(--on-surface);">
                <option value="">-- select --</option>
                ${q.options.sort(()=>Math.random()-0.5).map(opt => `<option value="${opt}">${opt}</option>`).join('')}
            </select>
            ${q.after}
        </div>
    `).join('');
    document.getElementById('ex3-feedback').style.display = 'none';
};

window.checkEx3 = function() {
    let score = 0;
    const total = EX3_DATA.length;
    let allFilled = true;
    
    for (let i=0; i<total; i++) {
        const sel = document.getElementById(`ex3-sel-${i}`);
        if (!sel.value) allFilled = false;
        if (sel.value === EX3_DATA[i].correct) {
            score++;
            sel.style.borderColor = 'var(--success)';
            sel.style.background = 'rgba(76, 175, 80, 0.1)';
        } else {
            sel.style.borderColor = 'var(--error)';
            sel.style.background = 'rgba(244, 67, 54, 0.1)';
        }
    }
    
    const fb = document.getElementById('ex3-feedback');
    if (!allFilled) {
        fb.innerHTML = '⚠️ Please complete all dropdowns.';
        fb.style.background = 'var(--surface-container-highest)'; fb.style.color = 'var(--secondary)';
    } else {
        fb.innerHTML = `🎯 Score: ${score} / ${total}`;
        if (score === total) {
            fb.style.background = 'rgba(76, 175, 80, 0.1)'; fb.style.color = 'var(--success)';
            document.getElementById('cb-ex3').checked = true;
            window.toggleItem('ex3', true);
        } else {
            fb.style.background = 'rgba(244, 67, 54, 0.1)'; fb.style.color = 'var(--error)';
        }
    }
    fb.style.display = 'block';
};

// ─── EX4 LOGIC ───
window.resetEx4 = function() {
    const container = document.getElementById('ex4-content');
    container.innerHTML = EX4_DATA.map((q, i) => `
        <div class="ex-item" style="margin-bottom:1rem; padding-bottom:1rem; border-bottom:1px solid var(--outline-variant);">
            <div style="font-weight:600; margin-bottom:8px;">${i+1}. ${q.q}</div>
            <div style="display:flex; flex-direction:column; gap:6px;">
                ${q.opts.map((opt, j) => `
                    <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                        <input type="radio" name="ex4-q${i}" value="${j}"> ${opt}
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');
    document.getElementById('ex4-feedback').style.display = 'none';
};

window.checkEx4 = function() {
    let score = 0;
    const inputs = document.querySelectorAll('#ex4-content input[type="radio"]:checked');
    if (inputs.length < EX4_DATA.length) {
        const fb = document.getElementById('ex4-feedback');
        fb.innerHTML = '⚠️ Please answer all questions before checking.';
        fb.style.display = 'block'; fb.className = 'ex-feedback'; fb.style.background = 'var(--surface-container-highest)'; fb.style.color = 'var(--secondary)';
        return;
    }
    inputs.forEach((inp) => {
        const qIdx = parseInt(inp.name.replace('ex4-q',''));
        if (parseInt(inp.value) === EX4_DATA[qIdx].ans) score++;
    });
    
    const fb = document.getElementById('ex4-feedback');
    fb.innerHTML = `🎯 Score: ${score} / ${EX4_DATA.length}`;
    fb.style.display = 'block';
    
    if (score === EX4_DATA.length) {
        fb.style.background = 'rgba(76, 175, 80, 0.1)'; fb.style.color = 'var(--success)';
        document.getElementById('cb-ex4').checked = true;
        window.toggleItem('ex4', true);
    } else {
        fb.style.background = 'rgba(244, 67, 54, 0.1)'; fb.style.color = 'var(--error)';
    }
};

// ============================================================================
// PRACTICE ENGINE (VOCAB + SEQUENCE SIMS)
// ============================================================================

function renderPracticeContent() {
    const cardsContainer = document.getElementById('practice-cards');
    const areaContainer = document.getElementById('practice-area');
    if (!cardsContainer || !areaContainer) return;
    
    cardsContainer.innerHTML = '';
    areaContainer.innerHTML = '';

    if (currentPFilter === 'vocab') {
        cardsContainer.classList.remove('hidden');
        areaContainer.classList.add('hidden');
        renderVocabPractice(cardsContainer);
    } else if (currentPFilter === 'sim') {
        cardsContainer.classList.add('hidden');
        areaContainer.classList.remove('hidden');
        renderSimulations(areaContainer);
    }
}

// --- VOCAB PRACTICE ---
function renderVocabPractice(container) {
    PRACTICE_VOCAB.forEach((item) => {
        const score = window.practiceScores[item.id] || 0;
        const isMastered = score >= PASS_THRESHOLD;
        const card = document.createElement('div');
        card.className = `practice-card glass-card ${isMastered ? 'mastered' : ''}`;
        
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <div class="card-icon" style="background:var(--primary-container); color:var(--primary); width:32px; height:32px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:1rem; border:1px solid var(--outline-variant);">
                    <i class="fas fa-microchip"></i>
                </div>
                ${isMastered ? '<div class="mastery-badge" style="color:var(--success); font-size:0.7rem; font-weight:700; text-transform:uppercase; border:1px solid var(--success); padding:2px 8px; border-radius:0px;">Mastered</div>' : ''}
            </div>
            <div style="font-size:1.2rem; font-weight:700; color:var(--on-surface); margin-bottom:4px; font-family:var(--font-display);">${item.phrase}</div>
            <div style="font-size:0.85rem; color:var(--on-surface-variant); font-style:italic; margin-bottom:16px;">${item.hint}</div>
            
            <div class="mic-status" id="mic-st-${item.id}">${isMastered ? 'Mission Accomplished' : 'Awaiting Uplink...'}</div>
            <div class="sim-meter"><div class="sim-fill" id="meter-${item.id}" style="width:${score*100}%; background:${isMastered ? 'var(--success)' : 'var(--secondary)'};"></div></div>
            
            <div class="practice-actions" style="margin-top:auto; display:flex; gap:10px;">
                <button class="btn btn-ghost btn-sm" onclick="window.speak('${item.phrase.replace(/'/g, "\\'")}')" style="flex:1;"><i class="fas fa-volume-up"></i> Listen</button>
                <button class="btn btn-primary btn-sm" id="btn-rec-${item.id}" onclick="window.startVocabRec('${item.id}', '${item.phrase.replace(/'/g, "\\'")}')" style="flex:2;"><i class="fas fa-microphone"></i> Transmit</button>
            </div>
        `;
        container.appendChild(card);
    });
}

window.startVocabRec = function(id, targetPhrase) {
    const btn = document.getElementById(`btn-rec-${id}`);
    if (btn.classList.contains('recording')) {
        if (recognition) { try { recognition.abort(); } catch(e){} }
        btn.classList.remove('recording');
        isListening = false;
        return;
    }

    if (!SpeechRec) { alert("Speech recognition not supported."); return; }
    
    // Anti-cheat setup
    stopAllAudio();
    isListening = true;

    recognition = new SpeechRec();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    const stEl = document.getElementById('mic-st-'+id);
    const meterEl = document.getElementById('meter-'+id);
    
    stEl.innerHTML = '<span style="color:var(--secondary); animation: blink 1s infinite;">🎙️ LISTENING...</span>';
    btn.classList.add('recording');
    
    try { recognition.start(); } catch (e) { console.error(e); }
    
    recognition.onresult = (e) => {
        const spoken = e.results[0][0].transcript;
        const normSpoken = normalizeSpeech(spoken);
        const normTarget = normalizeSpeech(targetPhrase);
        const sim = calculateSimilarity(normSpoken, normTarget);
        
        stEl.innerHTML = `Heard: "<em>${spoken}</em>" (${Math.round(sim*100)}% match)`;
        meterEl.style.width = (sim * 100) + '%';
        
        if (sim >= PASS_THRESHOLD) {
            stEl.style.color = 'var(--success)';
            meterEl.style.background = 'var(--success)';
            window.practiceScores[id] = sim;
            localStorage.setItem('military_l11_u6_practice', JSON.stringify(window.practiceScores));
            window.toggleItem(id, true);
            updateProgressHUD();
            setTimeout(() => renderPracticeContent(), 1500);
        } else {
            stEl.style.color = 'var(--error)';
            meterEl.style.background = 'var(--error)';
        }
    };
    
    recognition.onerror = () => {
        stEl.innerHTML = '<span style="color:var(--error);">❌ Microphone error or no speech detected.</span>';
        isListening = false;
        btn.classList.remove('recording');
    };

    recognition.onend = () => {
        isListening = false;
        btn.classList.remove('recording');
    };
};

// --- SEQUENCE SIMULATIONS ---
function renderSimulations(container) {
    const instructions = document.createElement('div');
    instructions.className = 'info-box glass-card';
    instructions.style = 'margin-bottom:2rem; border-left:4px solid var(--primary); padding:1.5rem;';
    instructions.innerHTML = `
        <div style="font-weight:700; margin-bottom:12px; display:flex; align-items:center; gap:10px; color:var(--primary); text-transform:uppercase; letter-spacing:0.05em;">
            <i class="fas fa-terminal"></i> Tactical Sequence Protocol
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px; font-size:0.85rem; line-height:1.6;">
            <div>
                <strong style="color:var(--primary);">[EN]</strong> To complete the simulation, you must transmit each phrase in the correct tactical sequence:
                <ul style="margin:10px 0; padding-left:18px; list-style-type: square;">
                    <li>Analyze the <strong>Available Phrases</strong> list.</li>
                    <li>Activate a transmission slot and speak clearly.</li>
                    <li>Click <strong>Evaluate</strong> once the sequence is complete.</li>
                </ul>
            </div>
            <div style="border-left:1px solid var(--outline-variant); padding-left:24px;">
                <strong style="color:var(--primary);">[ES]</strong> Para completar la simulación, debe transmitir cada frase en la secuencia táctica correcta:
                <ul style="margin:10px 0; padding-left:18px; list-style-type: square;">
                    <li>Analice la lista de frases disponibles.</li>
                    <li>Active un espacio de transmisión y hable con claridad.</li>
                    <li>Haga clic en <strong>Evaluar</strong> una vez completada la secuencia.</li>
                </ul>
            </div>
        </div>
    `;
    container.appendChild(instructions);

    SIMULATIONS_DATA.forEach((sim, simIdx) => {
        if (!simGlobalState[simIdx]) {
            const shuffled =[...sim.correctOrder].sort(() => Math.random() - 0.5);
            simGlobalState[simIdx] = {
                remainingPhrases: shuffled,
                slots: sim.correctOrder.map(() => ({ phrase: '', similarity: 0, filled: false })),
                originalOrder: sim.correctOrder,
                id: `sim-${simIdx}`
            };
        }
        
        const state = simGlobalState[simIdx];
        const score = window.practiceScores[state.id] || 0;
        const isMastered = score >= PASS_THRESHOLD;
        
        const card = document.createElement('div');
        card.className = `sim-card glass-card ${isMastered ? 'mastered' : ''}`;
        card.style = "margin-bottom:2.5rem; overflow:hidden;";
        card.innerHTML = `
            <div class="sim-header" style="background:var(--surface-container-highest); padding:1.2rem 1.5rem; font-weight:700; color:var(--primary); border-bottom:1px solid var(--outline-variant); text-transform:uppercase; letter-spacing:0.05em; display:flex; justify-content:space-between; align-items:center;">
                <span>${sim.title}</span>
                ${isMastered ? '<i class="fas fa-check-circle" style="color:var(--success);"></i>' : ''}
            </div>
            <div class="sim-grid-layout" style="display:flex; flex-wrap:wrap; gap:1.5rem; padding:1.5rem;">
                <div class="phrases-column" style="flex:1; background:var(--surface-container); padding:1.2rem; border-radius:0px; border:1px solid var(--outline-variant);">
                    <div style="font-weight:600; margin-bottom:1rem; font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase; letter-spacing:0.05em;">Available Intelligence</div>
                    <div id="sim-phrases-${simIdx}" style="display:flex; flex-direction:column; gap:0.7rem;"></div>
                </div>
                <div class="slots-column" style="flex:1; background:var(--surface-container); padding:1.2rem; border-radius:0px; border:1px solid var(--outline-variant);">
                    <div style="font-weight:600; margin-bottom:1rem; font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase; letter-spacing:0.05em;">Transmission Queue</div>
                    <div id="sim-slots-${simIdx}"></div>
                </div>
            </div>
            <div class="sim-actions" style="padding:1rem 1.5rem; display:flex; gap:1rem; align-items:center; border-top:1px solid var(--outline-variant); background:rgba(29,32,36,0.6);">
                <button class="btn btn-primary" onclick="window.evaluateSim(${simIdx})">Verify Sequence</button>
                <button class="btn btn-ghost" onclick="window.resetSim(${simIdx})">Purge Queue</button>
                <div class="score-area" id="score-area-${simIdx}" style="margin-left:auto; font-family:var(--font-mono); font-size:0.9rem; color:${isMastered ? 'var(--success)' : 'var(--on-surface-variant)'};">[ STATUS: ${isMastered ? 'ACQUIRED' : 'PENDING'} ]
                </div>
            </div>
            <div class="feedback-banner" id="feedback-${simIdx}" style="margin: 0 1.5rem 1.5rem; padding: 1.2rem; border-radius:0px; display:none; font-family:var(--font-mono); font-size:0.8rem; line-height:1.5;"></div>
        `;
        container.appendChild(card);
        renderPhrasesList(simIdx, state);
        renderSlots(simIdx, state);
    });
}

function renderPhrasesList(simIdx, state) {
    const list = document.getElementById(`sim-phrases-${simIdx}`);
    if(!list) return;
    list.innerHTML = state.remainingPhrases.length === 0 
        ? '<div style="font-style:italic; font-size:0.8rem; color:var(--success); border:1px dashed var(--success); padding:0.8rem; text-align:center;">DATALINK COMPLETE</div>'
        : state.remainingPhrases.map(p => `<div style="background:var(--surface); padding:0.8rem 1rem; border:1px solid var(--outline-variant); font-size:0.85rem; font-family:var(--font-mono); color:var(--on-surface-variant);">${p}</div>`).join('');
}

function renderSlots(simIdx, state) {
    const container = document.getElementById(`sim-slots-${simIdx}`);
    if(!container) return;
    container.innerHTML = state.slots.map((slot, i) => `
        <div class="slot-card ${slot.filled ? 'filled' : 'empty'}" id="slot-${simIdx}-${i}" 
             style="background:var(--surface); border:1px ${slot.filled ? 'solid var(--success)' : 'dashed var(--primary)'}; padding:1rem; margin-bottom:0.8rem; cursor:pointer; position:relative; transition:all 0.2s;"
             onclick="${slot.filled ? '' : `window.startSimRec(${simIdx}, ${i})`}">
             <div style="font-size:0.65rem; color:var(--primary); margin-bottom:6px; display:flex; justify-content:space-between; text-transform:uppercase; letter-spacing:0.05em;">
                <span>Queue Pos: 0${i+1}</span>
                ${slot.filled ? `<span style="color:var(--success); font-weight:700;">${Math.round(slot.similarity*100)}% Match</span>` : '<span>[Click to Speak]</span>'}
             </div>
             <div class="slot-phrase" style="font-family:var(--font-mono); font-size:0.85rem; color:${slot.filled ? 'var(--on-surface)' : 'var(--outline)'};">
                ${slot.filled ? slot.phrase : '--- EMPTY CHANNEL ---'}
             </div>
        </div>
    `).join('');
}

window.startSimRec = function(simIdx, slotIdx) {
    const state = simGlobalState[simIdx];
    if (state.slots[slotIdx].filled) return;
    
    if (isListening) return; // Anti-cheat
    
    if (!SpeechRec) { alert("Speech recognition not supported."); return; }
    if (recognition) { try { recognition.abort(); } catch(e){} }
    
    stopAllAudio();
    isListening = true;

    recognition = new SpeechRec();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    const slotDiv = document.getElementById(`slot-${simIdx}-${slotIdx}`);
    const originalHtml = slotDiv.querySelector('.slot-phrase').innerHTML;
    slotDiv.querySelector('.slot-phrase').innerHTML = '<span style="color:var(--secondary); animation: blink 1s infinite;">🎙️ INITIALIZING SENSOR...</span>';
    slotDiv.style.borderColor = 'var(--secondary)';
    
    try { recognition.start(); } catch (e) { console.error(e); isListening = false; }
    
    recognition.onresult = (e) => {
        const spoken = e.results[0][0].transcript;
        const normSpoken = normalizeSpeech(spoken);
        let bestMatch = null, bestSim = 0;
        
        for (let phrase of state.remainingPhrases) {
            const sim = calculateSimilarity(normSpoken, normalizeSpeech(phrase));
            if (sim > bestSim) { bestSim = sim; bestMatch = phrase; }
        }
        
        if (bestMatch && bestSim >= PASS_THRESHOLD) {
            const idxPhrase = state.remainingPhrases.indexOf(bestMatch);
            if (idxPhrase !== -1) {
                state.remainingPhrases.splice(idxPhrase, 1);
                state.slots[slotIdx] = { phrase: bestMatch, similarity: bestSim, filled: true };
                renderPhrasesList(simIdx, state);
                renderSlots(simIdx, state);
            }
        } else {
            alert(`Low similarity (${Math.round(bestSim*100)}%). Try speaking exactly one of the available phrases.\nHeard: "${spoken}"`);
            slotDiv.querySelector('.slot-phrase').innerHTML = originalHtml;
            slotDiv.style.borderColor = 'var(--primary)';
        }
    };
    
    recognition.onerror = () => {
        slotDiv.querySelector('.slot-phrase').innerHTML = originalHtml;
        slotDiv.style.borderColor = 'var(--primary)';
        isListening = false;
    };

    recognition.onend = () => {
        isListening = false;
    };
};

window.evaluateSim = function(simIdx) {
    const state = simGlobalState[simIdx];
    const sim = SIMULATIONS_DATA[simIdx];
    const total = sim.correctOrder.length;
    
    if (!state.slots.every(s => s.filled)) {
        alert("Sequence incomplete. All transmission slots must be filled.");
        return;
    }
    
    let correctCount = 0;
    state.slots.forEach((s, i) => {
        if (s.phrase === sim.correctOrder[i]) correctCount++;
    });
    
    const avgSim = state.slots.reduce((acc, s) => acc + s.similarity, 0) / total;
    const finalScore = (correctCount / total) * 0.5 + (avgSim * 0.5);
    
    window.practiceScores[state.id] = finalScore;
    localStorage.setItem('military_l11_u6_practice', JSON.stringify(window.practiceScores));
    
    const fbDiv = document.getElementById(`feedback-${simIdx}`);
    fbDiv.innerHTML = `🏆 SEQUENCE ANALYSIS COMPLETE<br><br>Order Accuracy: ${correctCount}/${total}<br>Vocal Fidelity: ${Math.round(avgSim*100)}%<br>Operational Score: ${Math.round(finalScore*100)}%<br><br>${finalScore >= PASS_THRESHOLD ? '<span style="color:var(--success);">MISSION ACCOMPLISHED. DATA SECURED.</span>' : '<span style="color:var(--error);">MISSION FAILURE. IMPROVE SEQUENCE AND FIDELITY.</span>'}`;
    fbDiv.style.display = 'block';
    fbDiv.style.background = finalScore >= PASS_THRESHOLD ? 'rgba(182,208,136,0.1)' : 'rgba(255,180,171,0.1)';
    fbDiv.style.color = finalScore >= PASS_THRESHOLD ? 'var(--success)' : 'var(--error)';
    fbDiv.style.border = `1px solid ${finalScore >= PASS_THRESHOLD ? 'var(--success)' : 'var(--error)'}`;

    const scoreArea = document.getElementById(`score-area-${simIdx}`);
    scoreArea.textContent = `[ SCORE: ${Math.round(finalScore * 100)}% ]`;
    scoreArea.style.color = finalScore >= PASS_THRESHOLD ? 'var(--success)' : 'var(--error)';
    
    updateProgressHUD();
    if (finalScore >= PASS_THRESHOLD) window.toggleItem(state.id, true);
};

window.resetSim = function(simIdx) {
    const sim = SIMULATIONS_DATA[simIdx];
    const shuffled = [...sim.correctOrder].sort(() => Math.random() - 0.5);
    simGlobalState[simIdx] = {
        remainingPhrases: shuffled,
        slots: sim.correctOrder.map(() => ({ phrase: '', similarity: 0, filled: false })),
        originalOrder: sim.correctOrder,
        id: `sim-${simIdx}`
    };
    renderPhrasesList(simIdx, simGlobalState[simIdx]);
    renderSlots(simIdx, simGlobalState[simIdx]);
    const fbDiv = document.getElementById(`feedback-${simIdx}`);
    if(fbDiv) fbDiv.style.display = 'none';
    const scoreArea = document.getElementById(`score-area-${simIdx}`);
    scoreArea.textContent = '[ STATUS: PENDING ]';
    scoreArea.style.color = 'var(--on-surface-variant)';
    updateProgressHUD();
};