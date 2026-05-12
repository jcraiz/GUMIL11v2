'use strict';

// ============================================================================
// CONSTANTS & STATE
// ============================================================================

const STORAGE_KEY = 'military_l11_u5_known';
const PASS_THRESHOLD = 0.70;

let knownItems = new Set();
let TOTAL_ITEMS = 37; // Calculated points: 36 vocab + 2 formats + 5 exercises

// Anti-Cheat & Audio Variables
let isListening = false;
let currentAudio = null;

const synth = window.speechSynthesis;
let recognition = null;
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

// Active Exercise State for Ex 4 (ABC Rewrite)
let ex4State = {
    currentIndex: 0,
    answers: [],
    scores:[]
};

// Load state from local storage
try {
  const savedItems = localStorage.getItem(STORAGE_KEY);
  if (savedItems) knownItems = new Set(JSON.parse(savedItems));
} catch (e) {
  console.error("Error loading progress:", e);
}

// ============================================================================
// DATA STRUCTURES
// ============================================================================

const CONTENT = {};
CONTENT.vocab =[
    // Group 1: Types of Military Briefing
    { id: "v_info", group: "v-g1", groupName: "Types of Military Briefing", en: "Information Briefing", es: "Presents facts to keep audience informed. No decision required. Output: understanding." },
    { id: "v_dec", group: "v-g1", groupName: "Types of Military Briefing", en: "Decision Briefing", es: "Obtains a decision on COA. Presents options/analysis. Ends with recommendation." },
    { id: "v_miss", group: "v-g1", groupName: "Types of Military Briefing", en: "Mission Briefing", es: "Coordinates effort for specific mission. Given by CO to subordinates." },
    { id: "v_staff", group: "v-g1", groupName: "Types of Military Briefing", en: "Staff Briefing", es: "Updates commander on operational situation. Shared situational awareness." },

    // Group 2: Briefing Structure
    { id: "v_intro", group: "v-g2", groupName: "Briefing Structure", en: "Introduction", es: "Greeting, Name/Rank, Purpose/BLUF, Scope, Classification." },
    { id: "v_body", group: "v-g2", groupName: "Briefing Structure", en: "Body", es: "Main content by topic. Transitions and visual aids referenced explicitly." },
    { id: "v_ending", group: "v-g2", groupName: "Briefing Structure", en: "Ending", es: "Summary, Conclusion/Recommendation, Questions (invite or defer)." },

    // Group 3: Briefing Phraseology (Standard NATO Language)
    { id: "p_greet", group: "v-g3", groupName: "Briefing Phraseology", en: "Good morning, Colonel Smith.", es: "Greeting: Use rank and surname. Never first name." },
    { id: "p_id", group: "v-g3", groupName: "Briefing Phraseology", en: "I am Lieutenant Harris, the Assistant S3.", es: "Self-identification: Rank + full name + appointment." },
    { id: "p_bluf", group: "v-g3", groupName: "Briefing Phraseology", en: "Today I will brief you on the current enemy situation in our AOR. My assessment is that En activity has increased significantly in the last 24 hours.", es: "Purpose + BLUF: State topic and key message in intro." },
    { id: "p_scope", group: "v-g3", groupName: "Briefing Phraseology", en: "This briefing will take approximately 15 minutes. Please save your questions until the end.", es: "Scope: Duration and Q&A policy upfront." },
    { id: "p_class", group: "v-g3", groupName: "Briefing Phraseology", en: "This briefing is classified CONFIDENTIAL.", es: "Classification: State before presenting classified content." },
    { id: "p_trans", group: "v-g3", groupName: "Briefing Phraseology", en: "Let's look now at the enemy's logistics situation.", es: "Transition: 'Let's look now at...' signals the shift." },
    { id: "p_vis", group: "v-g3", groupName: "Briefing Phraseology", en: "If you look at the map on slide three, you can see that…", es: "Visual aid: Direct audience to visual before explaining." },
    { id: "p_map", group: "v-g3", groupName: "Briefing Phraseology", en: "The red overlay here indicates the En defensive line along PHASE LINE GOLD.", es: "Spatial references: 'here', 'in this area', 'to the north of'." },
    { id: "p_chart", group: "v-g3", groupName: "Briefing Phraseology", en: "As this graph shows, casualty rates increased by 40% between D+1 and D+3.", es: "Interpretation: State trend before the data." },
    { id: "p_sum", group: "v-g3", groupName: "Briefing Phraseology", en: "In summary, En activity has increased. Our defensive posture is adequate.", es: "Summary: No new information. Restate key points." },
    { id: "p_concl", group: "v-g3", groupName: "Briefing Phraseology", en: "That concludes my briefing, pending your questions.", es: "Closing: Standard NATO signals readiness for Q&A." },
    { id: "p_unknown", group: "v-g3", groupName: "Briefing Phraseology", en: "I don't know, sir, but I'll find out and report back to you by 1600.", es: "Unknown answer: Never guess. Commit to follow-up." },
    { id: "p_defer", group: "v-g3", groupName: "Briefing Phraseology", en: "Please save your questions until the end of the briefing.", es: "Deferring: Used when time-constrained or answered later." },
    { id: "p_invite", group: "v-g3", groupName: "Briefing Phraseology", en: "Please interrupt me if you have any questions as we go through the material.", es: "Inviting: Used in informal briefings." },

    // Group 4: ABC Principle & Elision
    { id: "abc_a", group: "v-g4", groupName: "ABC Principle & Elision", en: "Accuracy", es: "Ensuring all data and assessments are precise and verified." },
    { id: "abc_b", group: "v-g4", groupName: "ABC Principle & Elision", en: "Brevity", es: "Removing all words that do not add information (articles, auxiliaries)." },
    { id: "abc_c", group: "v-g4", groupName: "ABC Principle & Elision", en: "Clarity", es: "Ensuring the message is unambiguous and easy to process." },
    { id: "abc_art", group: "v-g4", groupName: "ABC Principle & Elision", en: "Articles: a / an / the", es: "'the enemy' → 'En' or 'enemy'; 'a decision' → 'decision'." },
    { id: "abc_aux", group: "v-g4", groupName: "ABC Principle & Elision", en: "Auxiliaries: is / are / has / have", es: "'1 Bde has continued' → '1 Bde continued'." },
    { id: "abc_pro", group: "v-g4", groupName: "ABC Principle & Elision", en: "Personal pronouns: I / we / they", es: "'We are requesting' → 'requesting' or 'COY: requesting'." },
    { id: "abc_conn", group: "v-g4", groupName: "ABC Principle & Elision", en: "Long connectors", es: "'in order to' → 'IOT'; 'due to the fact that' → 'due to'." },
    { id: "abc_pass", group: "v-g4", groupName: "ABC Principle & Elision", en: "Passive constructions", es: "'was confirmed by G2' → 'G2: confirmed'." },
    { id: "abc_fill", group: "v-g4", groupName: "ABC Principle & Elision", en: "Filler phrases", es: "'It should be noted that' → delete; 'For your information' → delete." }
];

CONTENT.formats =[
    {
        id: "fmt-info",
        title: "Information Briefing — Full Script",
        content: `INTRODUCTION
Good morning, Colonel Smith.
I am Lieutenant Harris, the Assistant S3.
Today I will brief you on the current enemy situation in our area of responsibility.
My assessment is that En activity has increased significantly in the last 24 hours, with new defensive positions established IVO PHASE LINE GOLD.
This briefing will take approximately ten minutes.
Please save your questions until the end.
This briefing is UNCLASSIFIED.

BODY[SECTION 1 — Enemy composition and dispositions]
Let's look first at the enemy's composition and dispositions.
If you look at the map on slide two, you can see the En's known positions marked in red.
G2 assesses an estimated one reinforced company, approximately 120 x personnel, IVO GR 456879.
They are equipped with small arms, two crew-served MG positions, and one mortar section.[SECTION 2 — Enemy activity]
I will now address recent enemy activity.
As this chart on slide three shows, En patrol activity increased by approximately 40% in the last 24-hour period, compared to the previous week.
Patrols have been observed on AXIS BRAVO and AXIS SIERRA on three separate occasions.

ENDING
In summary: En has approximately 120 x personnel IVO GR 456879. Activity has increased in the last 24 hours. An attack tonight is improbable.
That concludes my briefing, pending your questions.`
    },
    {
        id: "fmt-dec",
        title: "Decision Briefing — Annotated Structure",
        content: `INTRODUCTION
Good morning, Brigadier Jones.
I am Major Vargas, the S3.
I am here to brief you on three courses of action for the resupply operation on D+2 and to obtain your decision on the preferred COA.
This briefing will take approximately 20 minutes.

BODY — SECTION 3: RECOMMENDATION
My recommendation is COA 2 — AXIS BRAVO.
This COA offers the best balance of speed, security, and logistics feasibility given current En activity.

ENDING
In summary: three COAs were presented. COA 2 is recommended.
Your decision will enable the resupply operation to proceed on schedule for D+2.
That concludes my briefing. Do you have a decision, sir?`
    }
];

// ============================================================================
// EXERCISES DATA
// ============================================================================

const EX1_DATA =[
    {
        q: "The CO needs all staff section heads to present their current status — G2, G3, G4, and G6 — so that the commander has a full picture of the operational situation before issuing updated guidance. What type of briefing is this?",
        opts: ["Information Briefing","Decision Briefing","Mission Briefing","Staff Briefing"],
        ans: 3,
        exp: "This is a Staff Briefing. Multiple staff sections update the commander for shared situational awareness."
    },
    {
        q: "The S2 must present the latest enemy intelligence to the CO. The CO will listen, but no decision or action is required from him at this time. What type of briefing is this?",
        opts:["Information Briefing","Decision Briefing","Mission Briefing","Staff Briefing"],
        ans: 0,
        exp: "This is an Information Briefing. The purpose is to inform — no decision or mission assignment is required."
    },
    {
        q: "Three possible routes for a supply convoy have been analysed. The S3 must present the options with their advantages, risks, and a recommendation, so that the CO can select the route to be used. What type of briefing is this?",
        opts:["Information Briefing","Decision Briefing","Mission Briefing","Staff Briefing"],
        ans: 1,
        exp: "This is a Decision Briefing. The output is a decision from the senior officer based on COA analysis."
    },
    {
        q: "Before a patrol, the OC gathers all subordinate section commanders and directs them through their specific tasks, timings, actions on, and communications plan. What type of briefing is this?",
        opts:["Information Briefing","Decision Briefing","Mission Briefing","Staff Briefing"],
        ans: 2,
        exp: "This is a Mission Briefing. It coordinates subordinates towards a specific mission."
    },
    {
        q: "The G2 officer has 10 minutes to brief the incoming battalion commander on the entire intelligence picture. No decision will be made at this meeting. What type of briefing is this?",
        opts:["Staff Briefing","Decision Briefing","Information Briefing","Mission Briefing"],
        ans: 2,
        exp: "This is an Information Briefing. Bringing a commander up to speed without a required decision."
    }
];

const EX2_ITEMS =[
    { id: 'e2_1', text: 'Classification statement', correct: 5 },
    { id: 'e2_2', text: 'Purpose + BLUF (key message)', correct: 3 },
    { id: 'e2_3', text: 'Greeting ("Good morning, Colonel Smith")', correct: 1 },
    { id: 'e2_4', text: 'Scope — duration and Q&A policy', correct: 4 },
    { id: 'e2_5', text: 'Self-identification — rank, name, appointment', correct: 2 },
];

const EX3_DATA = [
    {
        stem: 'Opening — self-identification:',
        sentence: 'I am[CHOICE] Harris, the Assistant S3.',
        options: ['Lieutenant', 'Lt', 'Lt.'],
        ans: 'Lieutenant',
        hint: 'State your full rank — not an abbreviation — when introducing yourself in a briefing.'
    },
    {
        stem: 'Opening — scope:',
        sentence: 'Please save your questions [CHOICE] the end of the briefing.',
        options: ['until', 'for', 'to'],
        ans: 'until',
        hint: '"Until the end" is the standard NATO phrasing.'
    },
    {
        stem: 'Transition to new section:',
        sentence: "Let's look [CHOICE] at the enemy's logistics situation.",
        options: ['now', 'later', 'first'],
        ans: 'now',
        hint: '"Let\'s look now at..." signals the shift clearly.'
    },
    {
        stem: 'Referring to a visual:',
        sentence: 'If you look at the [CHOICE] on slide three, you can see that…',
        options: ['map', 'picture', 'idea'],
        ans: 'map',
        hint: 'Name the type of visual explicitly before explaining it.'
    },
    {
        stem: 'Closing the briefing:',
        sentence: 'That concludes my briefing, [CHOICE] your questions.',
        options:['pending', 'awaiting', 'after'],
        ans: 'pending',
        hint: '"Pending your questions" is the NATO standard closing phrase.'
    },
    {
        stem: "Q&A — when you don't know the answer:",
        sentence: "I don't know, sir, but I'll find out and [CHOICE] back to you by 1600.",
        options:['report', 'come', 'get'],
        ans: 'report',
        hint: '"Report back" is the professional standard.'
    }
];

const EX4_BULLETS =[
    {
        original: 'The enemy has been reinforcing their defensive positions along the northern axis since yesterday morning.',
        model: 'En: reinforcing def posns, northern axis since D-1',
        hint: 'Remove "The enemy has been" → "En:". "Their" removed. "Since yesterday morning" → "since D-1".'
    },
    {
        original: 'There is a realistic probability that the enemy will conduct an attack on our forward positions during the hours of darkness tonight.',
        model: 'En attack, fwd posns tonight: realistic probability (25–50%)',
        hint: 'Remove "There is". Replace long probability phrase with NATO term. "Hours of darkness" → "tonight".'
    },
    {
        original: 'We are running critically low on fuel, which means that we will not be able to sustain operations for more than 48 hours without resupply.',
        model: 'Fuel: CRITICAL. Ops sustainable NLT 48 hrs without resupply.',
        hint: 'Remove "We are running" and "which means that". Strong noun first: "Fuel:". "Not more than" → "NLT".'
    },
    {
        original: 'It has been confirmed by the G2 section that there are approximately 120 enemy soldiers in the vicinity of grid reference 456879.',
        model: 'G2 confirmed: ~120 x En IVO GR 456879',
        hint: 'Passive → active: "G2 confirmed". Remove "It has been". "In the vicinity of grid reference" → "IVO GR". "approximately" → "~".'
    },
    {
        original: 'Due to the fact that the main bridge has been destroyed by the enemy, all vehicle movement north of Phase Line Gold will have to use the alternative crossing at grid reference 445890.',
        model: 'Main bridge destroyed by En. Veh mvt N of PL GOLD: alt crossing GR 445890',
        hint: 'Remove "Due to the fact that". Split into two bullets at the logical break. Abbreviate "vehicle movement" → "Veh mvt". "Phase Line Gold" → "PL GOLD".'
    }
];

const EX5_DATA =[
    {
        q: "You are about to show a map slide that displays enemy defensive positions. What do you say BEFORE explaining the map?",
        opts:[
            "The enemy has established positions along PHASE LINE GOLD, as this map shows.",
            "If you look at the map on slide four, you can see the enemy's defensive positions marked in red.",
            "Now I will talk about the enemy situation.",
            "The next slide shows the enemy."
        ],
        ans: 1,
        exp: "Direct audience to visual first: 'If you look at [visual] on slide [number]...'."
    },
    {
        q: "A chart shows that patrol activity increased by 40% over 5 days. What is the correct sequence for presenting this?",
        opts:[
            "Slide 6 shows a chart.",
            "The numbers went up.",
            "As this chart on slide six shows, patrol activity increased by 40% between D+1 and D+5.",
            "If you look at the numbers, there is an increase."
        ],
        ans: 2,
        exp: "State interpretation first, then the data, and reference the specific slide."
    },
    {
        q: "An officer interrupts your briefing to ask a detailed question you were not expecting and cannot immediately answer. What is the correct response?",
        opts:[
            "I think the answer is probably somewhere around 60%.",
            "That is a very good question, and I will address it now.",
            "I don't know, sir, but I'll find out and report back to you by 1600.",
            "I'm afraid that is outside the scope of this briefing."
        ],
        ans: 2,
        exp: "Admit unknown answer, never guess, and commit to follow-up."
    },
    {
        q: "You are using an overlay on a map to show the friendly force positions. How do you correctly refer to a specific area?",
        opts:[
            "Over there in the blue area.",
            "Somewhere on the left side of the map.",
            "The blue overlay here, in the northern sector IVO GR 456, indicates C COY's defensive positions.",
            "This is where our guys are."
        ],
        ans: 2,
        exp: "Use precise spatial references: direction, grid reference, unit name, and colour."
    }
];

// ============================================================================
// CORE UTILITIES (GOLD STANDARDS)
// ============================================================================

function toSlug(text) {
    if (!text) return "";
    return text.toString().toLowerCase()
        .replace(/['\-]/g, '')          // Removes apostrophes AND hyphens entirely ("don't" -> "dont")
        .replace(/[^a-z0-9\s]/g, ' ')   // Replaces other special characters with spaces
        .replace(/\s+/g, ' ')           // Collapses multiple consecutive spaces into one single space
        .trim()                         // Trims leading/trailing whitespace
        .split(' ')                     // Splits by single space
        .slice(0, 7)                    // Max 7 words
        .join('_');                     // Re-joins with underscores
}

function loadResilientImage(imgElement, baseName) {
    const formats = ['.webp', '.png', '.jpg', '.jpeg'];
    let currentFormatIndex = 0;

    imgElement.onerror = () => {
        currentFormatIndex++;
        if (currentFormatIndex < formats.length) {
            imgElement.src = `assets/${baseName}${formats[currentFormatIndex]}`;
        } else {
            imgElement.style.display = 'none'; // Failsafe
        }
    };
    imgElement.src = `assets/${baseName}${formats[0]}`; // Attempt WebP first
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

// ANTI-CHEAT MECHANISM 
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
        if (callback) callback(); // Prevent freeze
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
        console.log("Audio playback blocked: Microphone is actively listening.");
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
    if (isListening) return; // Anti-cheat abort
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

// Matrix-based Levenshtein Algorithm
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
// INITIALIZATION & MAIN LOGIC
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    calculateTotalItems();
    injectVocabAccordions();
    injectFormatAccordions();
    initExercises();
    setupModeSwitching();
    setupStudyTabs();
    setupGlobalControls();
    updateHUD();
});

function calculateTotalItems() {
    TOTAL_ITEMS = CONTENT.vocab.length + CONTENT.formats.length + 5; // 5 exercises
}

function updateHUD() {
    const count = knownItems.size;
    const pct = TOTAL_ITEMS > 0 ? Math.min(100, Math.round((count / TOTAL_ITEMS) * 100)) : 0;

    const pLabel = document.getElementById('progress-pct');
    const mLabel = document.getElementById('pbar-label');
    const progressLabel = document.getElementById('progress-label');
    
    if (pLabel) pLabel.textContent = `${pct}%`;
    if (mLabel) mLabel.textContent = `${pct}% COMPLETED`;
    if (progressLabel) progressLabel.textContent = `${count} of ${TOTAL_ITEMS} capability points`;

    const bar = document.getElementById('hud-progress-bar');
    if (bar) {
        bar.innerHTML = '';
        const segments = 10;
        const filledSegments = Math.round((pct / 100) * segments);
        for (let i = 0; i < segments; i++) {
            const seg = document.createElement('div');
            seg.className = `progress-segment ${i < filledSegments ? 'active' : ''}`;
            bar.appendChild(seg);
        }
    }

    const statKnown = document.getElementById('stat-known');
    const statRate = document.getElementById('stat-rate');
    if (statKnown) statKnown.textContent = count;
    if (statRate) statRate.textContent = `${pct}%`;

    localStorage.setItem(STORAGE_KEY, JSON.stringify([...knownItems]));
}

function toggleItem(id, isKnown) {
    if (isKnown) knownItems.add(id);
    else knownItems.delete(id);
    updateHUD();
}

function toggleGroup(groupName, isKnown) {
    CONTENT.vocab.filter(i => i.groupName === groupName).forEach(item => {
        if (isKnown) knownItems.add(item.id);
        else knownItems.delete(item.id);
    });
    
    const groupItems = CONTENT.vocab.filter(i => i.groupName === groupName);
    groupItems.forEach(item => {
        const cb = document.querySelector(`.item-row-wrap[data-id="${item.id}"] .know-cb`);
        if (cb) cb.checked = isKnown;
    });
    
    updateHUD();
}

function setupModeSwitching() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            document.getElementById(`${btn.dataset.mode}-section`).classList.add('active');
        });
    });
}

function setupStudyTabs() {
    document.querySelectorAll('.study-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.study-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            const target = tab.dataset.tab;
            if (target === 'formats') {
                document.getElementById('tab-formats').classList.add('active');
            } else if (target === 'vocab') {
                document.getElementById('tab-vocab').classList.add('active');
            }
        });
    });
}

function setupGlobalControls() {
    document.getElementById('expand-all-btn').addEventListener('click', () => {
        const activePanel = document.querySelector('.tab-panel.active, .content-section.active');
        if(activePanel) activePanel.querySelectorAll('.accordion').forEach(a => a.classList.add('active', 'is-open'));
    });
    document.getElementById('collapse-all-btn').addEventListener('click', () => {
        const activePanel = document.querySelector('.tab-panel.active, .content-section.active');
        if(activePanel) activePanel.querySelectorAll('.accordion').forEach(a => a.classList.remove('active', 'is-open'));
    });

    const statsBtn = document.getElementById('stats-btn');
    if (statsBtn) {
        statsBtn.addEventListener('click', () => {
            updateHUD();
            document.getElementById('stats-modal').classList.remove('hidden');
        });
    }

    const closeStatsBtn = document.getElementById('close-stats-btn');
    if (closeStatsBtn) {
        closeStatsBtn.addEventListener('click', () => document.getElementById('stats-modal').classList.add('hidden'));
    }

    window.toggleAccordion = function(header) {
        header.parentElement.classList.toggle('is-open');
        header.parentElement.classList.toggle('active'); // Added to match previous logic
    };
}

// ============================================================================
// RENDERING ACCORDIONS
// ============================================================================

function injectVocabAccordions() {
    const container = document.getElementById('tab-vocab');
    if (!container) return;
    container.innerHTML = '';

    const groups = {};
    CONTENT.vocab.forEach(item => {
        if (!groups[item.groupName]) groups[item.groupName] = { id: item.group, items: [] };
        groups[item.groupName].items.push(item);
    });

    Object.keys(groups).forEach(gName => {
        const group = groups[gName];
        const gid = group.id;
        const acc = document.createElement('div');
        acc.className = 'accordion';
        
        const allKnown = group.items.every(i => knownItems.has(i.id));

        acc.innerHTML = `
            <div class="accordion-header" onclick="toggleAccordion(this)">
                <div class="acc-icon-box"><i class="fas fa-list-ul"></i></div>
                <div class="acc-title-group">
                    <div class="acc-title">${gName}</div>
                    <div class="acc-count">${group.items.length} Items</div>
                </div>
                <i class="fas fa-chevron-down acc-chevron"></i>
            </div>
            <div class="accordion-body">
                <div class="accordion-inner">
                    <div class="vocab-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px;">
                        ${group.items.map(item => {
                            const slug = toSlug(item.en);
                            const isKnown = knownItems.has(item.id);
                            
                            const hideAudio = gName === 'ABC Principle & Elision';
                            const audioBtnHtml = hideAudio ? '' : `<button class="audio-btn" onclick="speak('${item.en.replace(/'/g, "\\'")}')" title="Listen">
                                            <i class="fas fa-volume-up"></i>
                                        </button>`;
                            return `
                            <div class="item-row-wrap" data-id="${item.id}" style="padding: 10px; background: var(--surface); border: 1px solid var(--outline-variant); border-radius: 4px;">
                                <div class="item-row" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
                                    <div style="flex: 1;">
                                        <div class="item-en" style="font-weight: 600; color: var(--on-surface);">${item.en}</div>
                                        <div class="item-es" style="font-size: 0.85rem; color: var(--on-surface-variant); margin-top: 4px;">${item.es}</div>
                                    </div>
                                    <div class="item-controls" style="display: flex; align-items: center; gap: 8px;">
                                        <button class="audio-btn image-toggle-btn" id="img-btn-${item.id}" style="display: none;" onclick="toggleVocabImage(this, '${item.id}', '${slug}')" title="Toggle Image"><i class="fas fa-image"></i></button>
                                        ${audioBtnHtml}
                                        <label class="know-checkbox" style="display: flex; align-items: center; gap: 4px; font-size: 0.7rem; text-transform: uppercase; cursor: pointer;">
                                            <input type="checkbox" class="know-cb" ${isKnown ? 'checked' : ''} onchange="toggleItem('${item.id}', this.checked)">
                                            <span>Mstr</span>
                                        </label>
                                    </div>
                                </div>
                                <div id="img-cont-${item.id}" class="vocab-image-container hidden" style="display:none; margin-top:10px; text-align:center;">
                                    <img id="img-${item.id}" style="max-height: 200px; max-width: 100%; border-radius:4px;" onload="const b = document.getElementById('img-btn-${item.id}'); if(b) b.style.display='inline-flex';">
                                </div>
                            </div>
                        `;}).join('')}
                    </div>
                </div>
                <div class="accordion-footer" style="padding: 10px; background: var(--surface-container); border-top: 1px solid var(--outline-variant); display: flex; justify-content: flex-end; align-items: center; gap: 10px;">
                    <span style="font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase;">Mark section verified:</span>
                    <input type="checkbox" class="know-cb group-toggle-cb" id="${gid}-cb" 
                           ${allKnown ? 'checked' : ''} onchange="toggleGroup('${gName}', this.checked)">
                </div>
            </div>
        `;
        container.appendChild(acc);

        // Resilient Image Preload
        group.items.forEach(item => {
            const imgElement = document.getElementById(`img-${item.id}`);
            if (imgElement) {
                loadResilientImage(imgElement, toSlug(item.en));
            }
        });
    });
}

function injectFormatAccordions() {
    const container = document.getElementById('tab-formats');
    if (!container) return;
    container.innerHTML = '';

    CONTENT.formats.forEach((fmt) => {
        const isKnown = knownItems.has(fmt.id);
        const acc = document.createElement('div');
        acc.className = 'accordion';
        acc.innerHTML = `
            <div class="accordion-header" onclick="toggleAccordion(this)">
                <div class="acc-icon-box"><i class="fas fa-file-alt"></i></div>
                <div class="acc-title-group">
                    <div class="acc-title">${fmt.title}</div>
                </div>
                <i class="fas fa-chevron-down acc-chevron"></i>
            </div>
            <div class="accordion-body">
                <div class="accordion-inner">
                    <div class="doc-frame" style="background: var(--surface-container-low); border: 1px solid var(--outline-variant); padding: 15px; border-radius: 4px; font-family: monospace; white-space: pre-wrap; font-size: 0.9rem;">${fmt.content}</div>
                </div>
                <div class="accordion-footer" style="padding: 10px; background: var(--surface-container); border-top: 1px solid var(--outline-variant); display: flex; justify-content: flex-end; align-items: center; gap: 10px;">
                    <span style="font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase;">Mark format verified:</span>
                    <input type="checkbox" class="know-cb" id="${fmt.id}-cb" ${isKnown ? 'checked' : ''} onchange="toggleItem('${fmt.id}', this.checked)">
                </div>
            </div>
        `;
        container.appendChild(acc);
    });
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

function showFeedback(id, msg, type) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = msg;
    el.className = 'ex-feedback show ' + (type === 'correct' ? 'feedback-correct' : type === 'partial' ? 'feedback-partial' : 'feedback-wrong');
    el.style.display = 'block';
}

function hideFeedback(id) {
    const el = document.getElementById(id);
    if (el) {
        el.className = 'ex-feedback hidden';
        el.style.display = 'none';
        el.innerHTML = '';
    }
}

// --- EX 1: Multiple Choice ---
function renderEx1() {
    const container = document.getElementById('ex1-container');
    if (!container) return;
    const letters = ['A','B','C','D'];
    container.innerHTML = EX1_DATA.map((d, i) => `
        <div class="exercise-item" id="ex1-item-${i}" style="margin-bottom: 20px;">
            <div class="ex-q" style="font-weight: 600; margin-bottom: 10px; color: var(--on-surface);">${i+1}. ${d.q}</div>
            <div class="ex-options" id="ex1-opts-${i}" style="display: flex; flex-direction: column; gap: 8px;">
                ${d.opts.map((opt, oi) => `
                    <div class="mc-opt" id="ex1-opt-${i}-${oi}" onclick="ex1Select(${i},${oi})" style="display: flex; align-items: flex-start; gap: 10px; padding: 9px 13px; background: var(--surface-container-low); border: 1px solid var(--outline-variant); border-radius: 6px; cursor: pointer; transition: all 0.15s;">
                        <span class="mc-letter" style="font-weight: 700; min-width: 20px;">${letters[oi]}.</span>
                        <span>${opt}</span>
                    </div>
                `).join('')}
            </div>
            <div id="ex1-q${i}-feedback" class="q-feedback hidden" style="margin-top: 8px; font-size: 0.85rem; padding: 8px; border-radius: 4px; background: var(--surface-container-high);"></div>
        </div>
    `).join('');
    // Reset global state
    window.ex1Answered = new Array(EX1_DATA.length).fill(false);
}

window.ex1Select = function(qi, oi) {
    if (window.ex1Answered[qi]) return;
    
    const opts = document.querySelectorAll(`#ex1-opts-${qi} .mc-opt`);
    opts.forEach(o => o.style.pointerEvents = 'none');
    
    const selectedOpt = document.getElementById(`ex1-opt-${qi}-${oi}`);
    const correctOpt = document.getElementById(`ex1-opt-${qi}-${EX1_DATA[qi].ans}`);
    
    if (oi === EX1_DATA[qi].ans) {
        selectedOpt.classList.add('correct');
        selectedOpt.style.background = 'rgba(182, 208, 136, 0.1)';
        selectedOpt.style.borderColor = 'var(--success)';
    } else {
        selectedOpt.classList.add('incorrect');
        selectedOpt.style.background = 'rgba(255, 180, 171, 0.1)';
        selectedOpt.style.borderColor = 'var(--error)';
        
        correctOpt.classList.add('reveal-correct');
        correctOpt.style.background = 'rgba(182, 208, 136, 0.1)';
        correctOpt.style.borderColor = 'var(--success)';
    }
    
    window.ex1Answered[qi] = true;
    
    const fb = document.getElementById(`ex1-q${qi}-feedback`);
    fb.innerHTML = `→ ${EX1_DATA[qi].exp}`;
    fb.style.display = 'block';
};

window.checkEx1 = function() {
    let correct = 0;
    EX1_DATA.forEach((d, i) => {
        if (!window.ex1Answered[i]) return;
        const el = document.getElementById(`ex1-opt-${i}-${d.ans}`);
        if (el && el.classList.contains('correct')) correct++;
    });
    
    const doneCount = window.ex1Answered.filter(Boolean).length;
    if (doneCount < EX1_DATA.length) {
        showFeedback('ex1-feedback', `You have answered ${doneCount} of ${EX1_DATA.length} questions.`, 'partial');
    } else if (correct === EX1_DATA.length) {
        showFeedback('ex1-feedback', `All ${EX1_DATA.length} correct. You can distinguish accurately between all four briefing types.`, 'correct');
        toggleItem('ex1', true);
        document.getElementById('ex1-cb').checked = true;
    } else {
        showFeedback('ex1-feedback', `${correct}/${EX1_DATA.length} correct. Key distinction: Information = inform only; Decision = obtain a decision; Mission = assign tasks; Staff = multiple sections update the commander.`, 'wrong');
    }
};

window.resetEx1 = function() { 
    renderEx1(); 
    hideFeedback('ex1-feedback'); 
    toggleItem('ex1', false);
    document.getElementById('ex1-cb').checked = false;
};

// --- EX 2: Drag & Drop (Intro Order) ---
function renderEx2() {
    const chipsEl = document.getElementById('ex2-chips');
    const slotsEl = document.getElementById('ex2-slots');
    if (!chipsEl || !slotsEl) return;
    
    chipsEl.innerHTML = '';
    [...EX2_ITEMS].sort(() => Math.random() - 0.5).forEach(item => {
        const chip = document.createElement('div');
        chip.className = 'drag-chip chip-neutral';
        chip.draggable = true;
        chip.id = item.id;
        chip.dataset.correct = item.correct;
        chip.textContent = item.text;
        chip.style.padding = '8px 14px';
        chip.style.background = 'var(--primary-container)';
        chip.style.border = '1px solid var(--primary)';
        chip.style.borderRadius = '20px';
        chip.style.cursor = 'grab';
        chip.style.fontWeight = 'bold';
        chip.style.fontSize = '0.85rem';
        chip.style.color = 'var(--on-surface)';
        
        chip.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.id);
            chip.style.opacity = '0.5';
        });
        chip.addEventListener('dragend', () => {
            chip.style.opacity = '1';
        });
        
        chipsEl.appendChild(chip);
    });

    slotsEl.innerHTML = '';
    const slotLabels =['Step 1','Step 2','Step 3','Step 4','Step 5'];
    slotLabels.forEach((label, i) => {
        const slot = document.createElement('div');
        slot.className = 'drop-slot';
        slot.dataset.pos = i + 1;
        slot.id = `ex2-slot-${i+1}`;
        slot.style.display = 'flex';
        slot.style.alignItems = 'center';
        slot.style.gap = '15px';
        slot.style.padding = '10px';
        slot.style.border = '1px dashed var(--outline)';
        slot.style.borderRadius = '8px';
        slot.style.minHeight = '50px';
        slot.style.marginBottom = '8px';
        slot.style.background = 'var(--surface-container-low)';
        
        slot.ondragover = e => { e.preventDefault(); slot.style.background = 'var(--surface-container-high)'; };
        slot.ondragleave = () => { slot.style.background = 'var(--surface-container-low)'; };
        slot.ondrop = e => { 
            e.preventDefault(); 
            slot.style.background = 'var(--surface-container-low)';
            handleEx2Drop(e, slot); 
        };
        
        slot.innerHTML = `<span class="slot-label" style="font-weight:bold; color:var(--secondary); min-width:60px;">${label}</span><div class="slot-content" id="ex2-sc-${i+1}" style="flex:1; display:flex; align-items:center;"></div>`;
        slotsEl.appendChild(slot);
    });
}

window.allowDrop = function(e) { e.preventDefault(); };

window.handleDrop = function(e, targetId) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const chip = document.getElementById(id);
    if (chip && targetId === 'ex2-chips') {
        document.getElementById('ex2-chips').appendChild(chip);
    }
};

window.handleEx2Drop = function(e, slot) {
    const id = e.dataTransfer.getData('text/plain');
    const chip = document.getElementById(id);
    if (!chip) return;
    
    const content = slot.querySelector('.slot-content');
    
    // If slot has a chip, send it back to bank
    if (content.children.length > 0) {
        document.getElementById('ex2-chips').appendChild(content.children[0]);
    }
    
    content.appendChild(chip);
};

window.checkEx2 = function() {
    let score = 0;
    EX2_ITEMS.forEach(item => {
        const slot = document.getElementById(`ex2-slot-${item.correct}`);
        if (!slot) return;
        const content = slot.querySelector('.slot-content');
        const placed = content && content.querySelector('.drag-chip');
        
        if (placed && placed.id === item.id) {
            score++;
            slot.style.borderColor = 'var(--success)';
            slot.style.background = 'rgba(129, 201, 149, 0.1)';
        } else {
            slot.style.borderColor = 'var(--error)';
            slot.style.background = 'rgba(255, 180, 171, 0.1)';
        }
    });
    
    if (score === EX2_ITEMS.length) {
        showFeedback('ex2-feedback', `All 5 correct. The sequence is: Greeting → Identification → Purpose/BLUF → Scope → Classification.`, 'correct');
        toggleItem('ex2', true);
        document.getElementById('ex2-cb').checked = true;
    } else {
        showFeedback('ex2-feedback', `${score}/5 correct. Remember: purpose comes before scope. Classification is always last.`, 'wrong');
    }
};

window.resetEx2 = function() { 
    renderEx2(); 
    hideFeedback('ex2-feedback'); 
    toggleItem('ex2', false);
    document.getElementById('ex2-cb').checked = false;
};

// --- EX 3: Dropdown Gap Fill ---
function renderEx3() {
    const container = document.getElementById('ex3-container');
    if (!container) return;
    container.innerHTML = EX3_DATA.map((d, i) => `
        <div class="question-block" id="ex3-block-${i}" style="margin-bottom: 1.5rem;">
            <div class="q-text" style="font-size: 0.85rem; color: var(--on-surface-variant); margin-bottom: 0.4rem;">${d.stem}</div>
            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; font-size: 0.95rem; font-family: var(--font-mono); background: var(--surface-container-low); padding: 10px; border-radius: 4px; border: 1px solid var(--outline-variant);">
                <div class="dropdown-sentence">
                    ${d.sentence.replace('[CHOICE]', `
                        <select class="ex3-select" id="ex3-sel-${i}" style="padding: 4px 8px; background: var(--surface-container-highest); border: 1px solid var(--secondary); color: var(--secondary); font-weight: bold; border-radius: 4px; outline: none; cursor: pointer;">
                            <option value="">-- select --</option>
                            ${d.options.map(o => `<option value="${o}">${o}</option>`).join('')}
                        </select>
                    `)}
                </div>
                <div id="ex3-hint-${i}" style="font-size: 0.8rem; color: var(--amber); width: 100%; display: none; margin-top: 5px;"></div>
            </div>
        </div>
    `).join('');
}

window.checkEx3 = function() {
    let score = 0;
    EX3_DATA.forEach((d, i) => {
        const sel = document.getElementById(`ex3-sel-${i}`);
        const hintBox = document.getElementById(`ex3-hint-${i}`);
        
        if (sel.value === d.ans) {
            score++;
            sel.style.borderColor = 'var(--success)';
            sel.style.color = 'var(--success)';
            sel.style.background = 'rgba(129, 201, 149, 0.1)';
            hintBox.style.display = 'none';
        } else {
            sel.style.borderColor = 'var(--error)';
            sel.style.color = 'var(--error)';
            sel.style.background = 'rgba(255, 180, 171, 0.1)';
            hintBox.innerHTML = `Hint: ${d.hint}`;
            hintBox.style.display = 'block';
        }
    });
    
    if (score === EX3_DATA.length) {
        showFeedback('ex3-feedback', `<i class="fas fa-check-double"></i> All 6 correct — excellent NATO phrasing!`, 'correct');
        toggleItem('ex3', true);
        document.getElementById('ex3-cb').checked = true;
    } else {
        showFeedback('ex3-feedback', `Score: <strong>${score}/6</strong> — Review the hints below the incorrect items.`, 'partial');
    }
};

window.resetEx3 = function() { 
    renderEx3(); 
    hideFeedback('ex3-feedback'); 
    toggleItem('ex3', false);
    document.getElementById('ex3-cb').checked = false;
};

// --- EX 4: ABC Principle Rewrite ---
function renderEx4() {
    const container = document.getElementById('ex4-quiz-ui');
    if (!container) return;
    
    if (ex4State.currentIndex >= EX4_BULLETS.length) {
        // Handled in advance
        return;
    }

    const q = EX4_BULLETS[ex4State.currentIndex];
    
    container.innerHTML = `
        <div class="question-block" style="background: var(--surface-container-low); padding: 15px; border-radius: 4px; border: 1px solid var(--outline-variant);">
            <div class="q-text" style="color: var(--primary); font-weight: bold; margin-bottom: 10px;">Bullet ${ex4State.currentIndex + 1} of 5: Rewrite in ABC Style</div>
            
            <div class="rewrite-source" style="font-family: monospace; background: rgba(255,200,100,0.05); padding: 10px; border-left: 3px solid var(--secondary); margin-bottom: 15px; font-size: 0.9rem;">
                • ${q.original}
            </div>
            
            <textarea id="ex4-input" class="rewrite-area" placeholder="Type your ABC version here..." style="width: 100%; height: 80px; padding: 10px; background: #0a0b0e; color: var(--text); border: 1px solid var(--outline); font-family: monospace; resize: none;"></textarea>
            
            <div id="ex4-hint-box" class="hidden" style="margin-top: 10px; background: rgba(182,208,136,0.1); border-left: 3px solid var(--success); padding: 10px; font-family: monospace; font-size: 0.85rem;">
                <strong>Model Answer:</strong><br>• ${q.model}
            </div>
            
            <div id="ex4-inline-feedback" style="display:none; margin-top: 12px;"></div>
            <div id="ex4-inline-actions" style="display:none; margin-top: 15px; gap:10px; flex-wrap:wrap;"></div>
        </div>
    `;
    
    const progressHint = document.getElementById('ex4-progress-hint');
    if(progressHint) progressHint.textContent = `Question ${ex4State.currentIndex + 1} / 5`;
    
    hideFeedback('ex4-feedback');

    const submitBtn = document.getElementById('ex4-submit-btn');
    if (submitBtn) {
        submitBtn.textContent = 'Submit Answer';
        submitBtn.disabled = false;
        submitBtn.style.display = 'inline-block';
    }
    
    const hintBtn = document.getElementById('ex4-hint-btn');
    if (hintBtn) {
        hintBtn.style.display = 'inline-block';
    }
}

window.revealEx4Hint = function() {
    const hint = document.getElementById('ex4-hint-box');
    if (hint) {
        hint.classList.remove('hidden');
        setTimeout(() => hint.classList.add('hidden'), 5000);
    }
};

window.submitEx4Answer = function() {
    const inputEl = document.getElementById('ex4-input');
    const input = inputEl ? inputEl.value.trim() : '';
    if (!input) return;

    const q = EX4_BULLETS[ex4State.currentIndex];
    
    // Core engine calculation
    const score = calculateSimilarity(input, q.model);
    const pct = Math.round(score * 100);
    const isGood = score >= 0.55;
    const isLast = ex4State.currentIndex === 4;

    const fb = document.getElementById('ex4-inline-feedback');
    let qualityLabel, qualityColor;
    
    if (pct >= 80)      { qualityLabel = 'Excellent ABC reduction!';        qualityColor = 'var(--success)'; }
    else if (pct >= 55) { qualityLabel = 'Good — you captured the key info.'; qualityColor = 'var(--secondary)'; }
    else                { qualityLabel = 'Needs more reduction — try again.'; qualityColor = 'var(--error)'; }

    fb.style.display = 'block';
    fb.innerHTML = `
        <div style="padding:15px; border-left: 4px solid ${qualityColor}; background:var(--surface-container-high); font-size:0.9rem; line-height:1.6;">
            <div style="font-weight:700; color:${qualityColor}; margin-bottom:6px;">${qualityLabel} <span style="font-weight:400; color:var(--on-surface-variant);">(Match: ${pct}%)</span></div>
            <div style="font-size:0.8rem; color:var(--on-surface-variant); margin-bottom:4px;">Model answer:</div>
            <div style="font-family:'Courier New',monospace; color:var(--on-surface); font-size:0.9rem;">• ${q.model}</div>
        </div>
    `;

    const acts = document.getElementById('ex4-inline-actions');
    acts.style.display = 'flex';

    if (!isGood) {
        acts.innerHTML = `
            <button class="btn btn-secondary btn-sm" onclick="ex4TryAgain()"><i class="fas fa-redo"></i> Try Again</button>
            <button class="btn btn-primary btn-sm" onclick="ex4Advance(${score})">Accept &amp; ${isLast ? 'Finish' : 'Next →'}</button>
        `;
    } else {
        acts.innerHTML = `
            <button class="btn btn-primary btn-sm" onclick="ex4Advance(${score})"><i class="fas fa-check"></i> ${isLast ? 'Finish Exercise' : 'Next Question →'}</button>
        `;
    }

    const submitBtn = document.getElementById('ex4-submit-btn');
    if(submitBtn) submitBtn.style.display = 'none';
    
    const hintBtn = document.getElementById('ex4-hint-btn');
    if(hintBtn) hintBtn.style.display = 'none';
};

window.ex4TryAgain = function() {
    const fb = document.getElementById('ex4-inline-feedback');
    const acts = document.getElementById('ex4-inline-actions');
    if (fb) { fb.style.display = 'none'; fb.innerHTML = ''; }
    if (acts) { acts.style.display = 'none'; acts.innerHTML = ''; }
    
    const inputEl = document.getElementById('ex4-input');
    if (inputEl) { inputEl.value = ''; inputEl.focus(); }
    
    const submitBtn = document.getElementById('ex4-submit-btn');
    if (submitBtn) { submitBtn.style.display = 'inline-block'; submitBtn.disabled = false; }
    
    const hintBtn = document.getElementById('ex4-hint-btn');
    if(hintBtn) hintBtn.style.display = 'inline-block';
};

window.ex4Advance = function(score) {
    ex4State.scores.push(score);

    if (ex4State.currentIndex < 4) {
        ex4State.currentIndex++;
        renderEx4();
    } else {
        const avg = ex4State.scores.reduce((a, b) => a + b, 0) / ex4State.scores.length;
        const fb = document.getElementById('ex4-feedback');
        
        fb.innerHTML = `<i class="fas fa-flag-checkered"></i> Exercise Complete — Average Match: <strong>${Math.round(avg * 100)}%</strong>. ${
            avg >= 0.6 ? 'Well done — you are applying ABC correctly.' : 'Keep practising — aim for shorter, cleaner bullets.'
        }`;
        fb.className = 'ex-feedback show ' + (avg >= 0.6 ? 'feedback-correct' : 'feedback-partial');
        
        if (avg >= 0.6) {
            toggleItem('ex4', true);
            document.getElementById('ex4-cb').checked = true;
        }
        
        const container = document.getElementById('ex4-quiz-ui');
        container.innerHTML = '';
        
        const progressHint = document.getElementById('ex4-progress-hint');
        if(progressHint) progressHint.textContent = `All 5 bullets completed.`;
        
        const submitBtn = document.getElementById('ex4-submit-btn');
        if(submitBtn) submitBtn.style.display = 'none';
    }
};

window.resetEx4 = function() {
    ex4State = { currentIndex: 0, answers: [], scores:[] };
    renderEx4();
    document.getElementById('ex4-cb').checked = false;
    toggleItem('ex4', false);
};

// --- EX 5: MC Visual Aids ---
function renderEx5() {
    const container = document.getElementById('ex5-container');
    if (!container) return;
    const letters = ['A','B','C','D'];
    container.innerHTML = EX5_DATA.map((q, qi) => `
        <div class="question-block" id="ex5-q-${qi}" style="margin-bottom: 20px;">
            <div class="q-text" style="font-weight: 600; margin-bottom: 10px; color: var(--on-surface);">${qi + 1}. ${q.q}</div>
            <div class="opt-list" id="ex5-opts-${qi}" style="display: flex; flex-direction: column; gap: 8px;">
                ${q.opts.map((opt, oi) => `
                    <div class="mc-opt" id="ex5-opt-${qi}-${oi}" onclick="ex5Select(${qi},${oi})" style="display: flex; align-items: flex-start; gap: 10px; padding: 9px 13px; background: var(--surface-container-low); border: 1px solid var(--outline-variant); border-radius: 6px; cursor: pointer; transition: all 0.15s;">
                        <span class="mc-letter" style="font-weight: 700; min-width: 20px;">${letters[oi]}.</span>
                        <span>${opt}</span>
                    </div>
                `).join('')}
            </div>
            <div id="ex5-q${qi}-feedback" class="q-feedback hidden" style="margin-top: 8px; font-size: 0.85rem; padding: 8px; border-radius: 4px; background: var(--surface-container-high);"></div>
        </div>
    `).join('');
    
    window.ex5Answered = new Array(EX5_DATA.length).fill(false);
}

window.ex5Select = function(qi, oi) {
    if (window.ex5Answered[qi]) return;
    
    const opts = document.querySelectorAll(`#ex5-opts-${qi} .mc-opt`);
    opts.forEach(o => o.style.pointerEvents = 'none');
    
    const selectedOpt = document.getElementById(`ex5-opt-${qi}-${oi}`);
    const correctOpt = document.getElementById(`ex5-opt-${qi}-${EX5_DATA[qi].ans}`);
    
    if (oi === EX5_DATA[qi].ans) {
        selectedOpt.classList.add('correct');
        selectedOpt.style.background = 'rgba(182, 208, 136, 0.1)';
        selectedOpt.style.borderColor = 'var(--success)';
    } else {
        selectedOpt.classList.add('incorrect');
        selectedOpt.style.background = 'rgba(255, 180, 171, 0.1)';
        selectedOpt.style.borderColor = 'var(--error)';
        
        correctOpt.classList.add('reveal-correct');
        correctOpt.style.background = 'rgba(182, 208, 136, 0.1)';
        correctOpt.style.borderColor = 'var(--success)';
    }
    
    window.ex5Answered[qi] = true;
    
    const fb = document.getElementById(`ex5-q${qi}-feedback`);
    fb.innerHTML = `→ ${EX5_DATA[qi].exp}`;
    fb.style.display = 'block';
};

window.checkEx5 = function() {
    let correct = 0;
    EX5_DATA.forEach((d, i) => {
        if (!window.ex5Answered[i]) return;
        const el = document.getElementById(`ex5-opt-${i}-${d.ans}`);
        if (el && el.classList.contains('correct')) correct++;
    });
    
    const doneCount = window.ex5Answered.filter(Boolean).length;
    if (doneCount < EX5_DATA.length) {
        showFeedback('ex5-feedback', `Answer all ${EX5_DATA.length} questions before checking.`, 'partial');
    } else if (correct === EX5_DATA.length) {
        showFeedback('ex5-feedback', `All ${EX5_DATA.length} correct. You are using professional visual aid language.`, 'correct');
        toggleItem('ex5', true);
        document.getElementById('ex5-cb').checked = true;
    } else {
        showFeedback('ex5-feedback', `${correct}/${EX5_DATA.length} correct. Key rules: direct audience to visual before explaining; don't guess.`, 'wrong');
    }
};

window.resetEx5 = function() { 
    renderEx5(); 
    hideFeedback('ex5-feedback'); 
    toggleItem('ex5', false);
    document.getElementById('ex5-cb').checked = false;
};

// ============================================================================
// ABC MODAL
// ============================================================================

window.showABCModal = function() {
    const modal = document.getElementById('abc-modal');
    if (modal) modal.classList.remove('hidden');
};

window.hideABCModal = function() {
    const modal = document.getElementById('abc-modal');
    if (modal) modal.classList.add('hidden');
};