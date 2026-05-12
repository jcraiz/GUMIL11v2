'use strict';

// ============================================================================
// CONSTANTS & STATE
// ============================================================================

const STORAGE_KEY = 'military_l11_u2_known';
const P_KEY = 'military_l11_u2_practice';
const PASS_THRESHOLD = 0.70;

// Silent Image manifest - currently empty as no images are present in unit02/images
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
// DATA STRUCTURES (From Draft Content)
// ============================================================================

const CONTENT = {
  "vocab":[
    {
      "group": "SMEAC Structure — The Five Paragraphs",
      "en": "0. PRELIMS",
      "es": "Preliminary information before the order begins. — Ground (terrain briefing) · Task Organisation (who is in the force) · Met (weather and light data)",
      "id": "v1"
    },
    {
      "group": "SMEAC Structure — The Five Paragraphs",
      "en": "1. SITUATION",
      "es": "The operational context — what is happening. — Enemy forces (En) · Friendly forces (FF) · Attachments and Detachments (Atts & Dets) · Civil Population (CivPop)",
      "id": "v2"
    },
    {
      "group": "SMEAC Structure — The Five Paragraphs",
      "en": "2. MISSION",
      "es": "Single sentence. Contains the 5 Ws. TASK VERB in capitals. — Who · What (task verb) · When · Where · Why (IOT + purpose)",
      "id": "v3"
    },
    {
      "group": "SMEAC Structure — The Five Paragraphs",
      "en": "3. EXECUTION",
      "es": "How the mission will be accomplished. — Commander's Intent · Concept of Operations (ConOps) · Tasks (to subordinate units) · Coordinating Instructions",
      "id": "v4"
    },
    {
      "group": "SMEAC Structure — The Five Paragraphs",
      "en": "4. ADMIN / LOGISTICS",
      "es": "Sustainment and support arrangements. — Supply · Transport · Medical · CIMIC · Prisoners of war (PW)",
      "id": "v5"
    },
    {
      "group": "SMEAC Structure — The Five Paragraphs",
      "en": "5. COMMAND & SIGNAL",
      "es": "Communications and command arrangements. — Chain of command · Location of commander · Radio frequencies · Call signs · EMCON (EmCon)",
      "id": "v6"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "PRELIMS",
      "es": "Información preliminar — terreno, organización de la fuerza, meteorología",
      "id": "v7"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "Ground",
      "es": "Terreno — descripción del área de operaciones",
      "id": "v8"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "Task Organisation (Task Org)",
      "es": "Organización de la fuerza para la tarea — quién compone el grupo",
      "id": "v9"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "Met",
      "es": "Meteorología (Met) — viento, visibilidad, luz diurna/nocturna (BMNT/EENT)",
      "id": "v10"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "BMNT / EENT",
      "es": "Begin Morning Nautical Twilight / End Evening Nautical Twilight",
      "id": "v11"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "En (Enemy)",
      "es": "Fuerzas enemigas — composición, disposición, capacidades, intención",
      "id": "v12"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "FF (Friendly Forces)",
      "es": "Fuerzas amigas — unidades adyacentes y su misión",
      "id": "v13"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "Atts & Dets",
      "es": "Attachments and Detachments — unidades agregadas o desagregadas",
      "id": "v14"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "CivPop",
      "es": "Población civil — presencia, actitud, impacto en la operación",
      "id": "v15"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "Commander's Intent",
      "es": "Intención del comandante — propósito, condición de la tarea, estado final deseado",
      "id": "v16"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "ConOps",
      "es": "Concept of Operations — cómo el comandante visualiza el cumplimiento de la misión",
      "id": "v17"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "Coordinating Instructions",
      "es": "Instrucciones coordinadoras — timings, límites, reglas que aplican a todas las unidades",
      "id": "v18"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "H-Hour",
      "es": "Hora de inicio de la operación (acción principal)",
      "id": "v19"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "D-Day",
      "es": "Día de inicio de la operación",
      "id": "v20"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "Phase line",
      "es": "Línea de fase — línea de control para sincronización del movimiento",
      "id": "v21"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "Axis of advance",
      "es": "Eje de avance",
      "id": "v22"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "Objective",
      "es": "Objetivo — punto o área a capturar, neutralizar o destruir",
      "id": "v23"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "Limit of exploitation",
      "es": "Límite de explotación — hasta dónde avanzar",
      "id": "v24"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "Fire support plan",
      "es": "Plan de apoyo de fuego",
      "id": "v25"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "Support concept",
      "es": "Concepto de apoyo logístico",
      "id": "v26"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "CIMIC",
      "es": "Civil-Military Cooperation — cooperación cívico-militar",
      "id": "v27"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "EmCon (EMCON)",
      "es": "Emission Control — control de emisiones electromagnéticas",
      "id": "v28"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "Net",
      "es": "Red de radio (conjunto de estaciones en la misma frecuencia)",
      "id": "v29"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "Call sign",
      "es": "Indicativo de llamada táctico",
      "id": "v30"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "Primary / Alternate frequency",
      "es": "Frecuencia primaria / alternativa de la red",
      "id": "v31"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "GZ (Ground Zero / given abbreviation)",
      "es": "Puede ser el objetivo o el punto de referencia según el contexto del OPORD",
      "id": "v32"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "LLoC",
      "es": "Land Lines of Communication — líneas terrestres de comunicaciones / abastecimiento",
      "id": "v33"
    },
    {
      "group": "Key Terms by Paragraph",
      "en": "INS",
      "es": "Insurgentes / fuerzas no estatales (según contexto del OPORD)",
      "id": "v34"
    },
    {
      "group": "Obligation Verbs in Orders (NATO)",
      "en": "are to / is to",
      "es": "Obligación estándar — tarea asignada a una unidad específicaC Coy is to SEIZE OBJECTIVE EAGLE.",
      "id": "v35"
    },
    {
      "group": "Obligation Verbs in Orders (NATO)",
      "en": "will",
      "es": "Obligación — evento que ocurrirá en el futuro (timings, secuencia)H-Hour will be 0400Z.",
      "id": "v36"
    },
    {
      "group": "Obligation Verbs in Orders (NATO)",
      "en": "must",
      "es": "Obligación imperativa — cuando el incumplimiento tiene consecuencias críticasAll vehicles must be camouflaged NLT H-2.",
      "id": "v37"
    },
    {
      "group": "Obligation Verbs in Orders (NATO)",
      "en": "should",
      "es": "Sugiere — no obliga. Prohibido en órdenes NATO.",
      "id": "v38"
    },
    {
      "group": "Obligation Verbs in Orders (NATO)",
      "en": "could",
      "es": "Expresa posibilidad — no obligación. Prohibido.",
      "id": "v39"
    },
    {
      "group": "Obligation Verbs in Orders (NATO)",
      "en": "shall",
      "es": "Arcaico y ambiguo en inglés moderno. Prohibido en órdenes NATO.",
      "id": "v40"
    },
    {
      "group": "ATP-112 Mission Task Verbs (selection)",
      "en": "SEIZE",
      "es": "Take possession of a designated area by force. | Ex: B Coy is to SEIZE OBJECTIVE HAWK IOT block En withdrawal routes.",
      "id": "v41"
    },
    {
      "group": "ATP-112 Mission Task Verbs (selection)",
      "en": "SECURE",
      "es": "Gain control of an area to prevent its use by the enemy. | Ex: A Coy is to SECURE THE BRIDGE IOT allow FF crossing.",
      "id": "v42"
    },
    {
      "group": "ATP-112 Mission Task Verbs (selection)",
      "en": "DENY",
      "es": "Prevent the enemy from using an area, route or facility. | Ex: C Coy is to DENY EAGLE BRIDGE IOT set conditions for the denial of INS LLoC through GZ.",
      "id": "v43"
    },
    {
      "group": "ATP-112 Mission Task Verbs (selection)",
      "en": "DESTROY",
      "es": "Render a target incapable of performing its function. | Ex: D Coy is to DESTROY the En communications node IVO GRID 456789.",
      "id": "v44"
    },
    {
      "group": "ATP-112 Mission Task Verbs (selection)",
      "en": "NEUTRALISE",
      "es": "Render a target temporarily ineffective. | Ex: Fire support is to NEUTRALISE En artillery IVO PHASE LINE GOLD.",
      "id": "v45"
    },
    {
      "group": "ATP-112 Mission Task Verbs (selection)",
      "en": "DISRUPT",
      "es": "Break up and render ineffective. | Ex: Recce Pl is to DISRUPT En reinforcement by fire.",
      "id": "v46"
    },
    {
      "group": "ATP-112 Mission Task Verbs (selection)",
      "en": "CLEAR",
      "es": "Eliminate all En forces from a designated area. | Ex: 2 Pl is to CLEAR the northern sector IOT allow the main body to advance.",
      "id": "v47"
    },
    {
      "group": "ATP-112 Mission Task Verbs (selection)",
      "en": "HOLD",
      "es": "Maintain a position and prevent its seizure by the enemy. | Ex: 1 Pl is to HOLD CHECKPOINT ZULU NLT H+2.",
      "id": "v48"
    },
    {
      "group": "ATP-112 Mission Task Verbs (selection)",
      "en": "ADVANCE TO",
      "es": "Move towards a designated point, prepared to engage. | Ex: B Coy is to ADVANCE TO PHASE LINE RED IOT maintain pressure.",
      "id": "v49"
    },
    {
      "group": "ATP-112 Mission Task Verbs (selection)",
      "en": "PROTECT",
      "es": "Preserve the force to prevent destruction or degradation. | Ex: Sp Coy is to PROTECT the logistics convoy on AXIS SIERRA.",
      "id": "v50"
    },
    {
      "group": "ATP-112 Mission Task Verbs (selection)",
      "en": "SCREEN",
      "es": "Provide early warning, maintain surveillance. | Ex: Recce Pl is to SCREEN the eastern flank IOT provide early warning.",
      "id": "v51"
    },
    {
      "group": "ATP-112 Mission Task Verbs (selection)",
      "en": "CONTAIN",
      "es": "Stop the enemy from withdrawing or manoeuvring. | Ex: 3 Pl is to CONTAIN the En IVO grid square 4578.",
      "id": "v52"
    },
    {
      "group": "ATP-112 Mission Task Verbs (selection)",
      "en": "WITHDRAW",
      "es": "Disengage from the enemy and move to the rear. | Ex: B Coy is to WITHDRAW to the consolidation area at H+6.",
      "id": "v53"
    },
    {
      "group": "ATP-112 Mission Task Verbs (selection)",
      "en": "CONSOLIDATE",
      "es": "Reorganise and prepare to defend after an assault. | Ex: On SEIZING OBJECTIVE HAWK, B Coy is to CONSOLIDATE and prepare for counter-attack.",
      "id": "v54"
    },
    {
      "group": "Capitalisation Rules in Orders",
      "en": "PLACES in capitals",
      "es": "Todos los topónimos, objetivos y puntos de referencia: EAGLE BRIDGE, CHECKPOINT ZULU",
      "id": "v55"
    },
    {
      "group": "Capitalisation Rules in Orders",
      "en": "UNITS in capitals",
      "es": "Nombres de unidades: C COY, 3 BN, TASK FORCE ALPHA",
      "id": "v56"
    },
    {
      "group": "Capitalisation Rules in Orders",
      "en": "VESSELS in capitals",
      "es": "Nombres de buques: ARC ALMIRANTE PADILLA, HMS DAUNTLESS",
      "id": "v57"
    },
    {
      "group": "Capitalisation Rules in Orders",
      "en": "TASK VERBS in capitals",
      "es": "El verbo de tarea en la misión: SEIZE, DENY, SECURE, DESTROY, NEUTRALISE",
      "id": "v58"
    },
    {
      "group": "Capitalisation Rules in Orders",
      "en": "Abbreviations: En",
      "es": "Enemy — siempre con mayúscula inicial en órdenes",
      "id": "v59"
    },
    {
      "group": "Capitalisation Rules in Orders",
      "en": "Abbreviations: FF",
      "es": "Friendly Forces — mayúsculas",
      "id": "v60"
    },
    {
      "group": "Capitalisation Rules in Orders",
      "en": "Abbreviations: ConOps",
      "es": "Concept of Operations — mayúscula en C y O",
      "id": "v61"
    },
    {
      "group": "Capitalisation Rules in Orders",
      "en": "Abbreviations: CivPop",
      "es": "Civilian Population — mayúscula en C y P",
      "id": "v62"
    },
    {
      "group": "Capitalisation Rules in Orders",
      "en": "Abbreviations: EmCon",
      "es": "Emission Control — mayúscula en E y C",
      "id": "v63"
    },
    {
      "group": "Capitalisation Rules in Orders",
      "en": "Abbreviations: IOT",
      "es": "In Order To — siempre en mayúsculas en la misión",
      "id": "v64"
    },
    {
      "group": "Doctrinal References",
      "en": "STANAG 2014 Ed9 (2000)",
      "es": "Formats for Orders and Designation of Timings, Locations and Boundaries",
      "id": "v65"
    },
    {
      "group": "Doctrinal References",
      "en": "ATP-112 (2020)",
      "es": "Mission Task Verbs for Use in the Planning and Dissemination of Orders",
      "id": "v66"
    }
  ],
  "funcGroups":[
    {
      "id": "func-g1",
      "title": "Reading and Interpreting a NATO SMEAC Order",
      "html": "<div class=\"phrase-card\">\n    <span class=\"phrase-context ctx-sit\">Situation — what to look for</span>\n    <div class=\"phrase-en\">When reading paragraph 1 (Situation), identify four elements in sequence: (a) the enemy — composition, strength, dispositions, capabilities and probable intentions; (b) friendly forces — what adjacent and higher units are doing; (c) attachments and detachments — what has been added to or removed from your unit for this task; (d) civil population — presence, attitude, impact on freedom of movement. If any element is not mentioned, it is assumed to be NIL or not applicable.</div>\n    <div class=\"phrase-use\">En una orden real, la Situación puede ser el párrafo más extenso. El lector debe ser capaz de extraer la intención del enemigo y el concepto del escalón superior en 30 segundos. Si no puede, la orden está mal redactada.</div>\n  </div>\n  <div class=\"phrase-card\">\n    <span class=\"phrase-context ctx-exec\">Execution — three-level reading</span>\n    <div class=\"phrase-en\">Paragraph 3 (Execution) must be read at three levels: first, read the Commander's Intent — this is the most important element and governs all subordinate action; second, read your own unit's task paragraph — ignore others on first reading; third, read the Coordinating Instructions — these apply to all units and include timings, boundaries, restrictions and actions on. A subordinate commander who understands the Commander's Intent can continue the mission even if the order cannot be executed as written.</div>\n    <div class=\"phrase-use\">La Intención del Comandante es el único párrafo que un subordinado debe memorizar. Todos los demás párrafos sirven para ejecutar esa intención. Si hay conflicto entre un párrafo de tarea y la intención del comandante, prevalece la intención.</div>\n  </div>"
    },
    {
      "id": "func-g2",
      "title": "Writing the Mission Paragraph — The 5 Ws",
      "html": "<div class=\"mission-formula\">\n<span class=\"mf-who\">C COY</span>         <span class=\"mf-label\">WHO</span>\n<span class=\"mf-verb\">is to</span>          <span class=\"mf-label\">OBLIGATION VERB</span>\n<span class=\"mf-task\">DENY</span>           <span class=\"mf-label\">TASK VERB (capitals) — WHAT</span>\n<span class=\"mf-obj\">EAGLE BRIDGE</span>   <span class=\"mf-label\">OBJECT + LOCATION — WHAT / WHERE</span>\n<span class=\"mf-iot\">IOT</span>            <span class=\"mf-label\">IN ORDER TO — links task to purpose</span>\n<span class=\"mf-purp\">set conditions for the denial of INS LLoC through GZ</span>  <span class=\"mf-label\">PURPOSE — WHY</span>\n  </div>\n\n  <div class=\"rule-box\">\n    The Mission statement is always one sentence. It never contains two tasks. If the unit has two tasks, two Mission statements are required — but in practice a second task belongs in the Execution paragraph as a \"be prepared to\" task.\n  </div>\n\n  <div class=\"phrase-card\">\n    <span class=\"phrase-context ctx-mission\">5 Ws — identifying elements in a Mission statement</span>\n    <div class=\"phrase-en\">Given the statement: \"3 BN is to SEIZE OBJECTIVE HAWK IVO GRID 456789 at H-Hour IOT open the axis for 1 BDE main body to advance NLT D+1.\"\n    — WHO: 3 BN\n    — WHAT: SEIZE\n    — WHERE: OBJECTIVE HAWK IVO GRID 456789\n    — WHEN: at H-Hour / NLT D+1\n    — WHY (IOT): open the axis for 1 BDE main body to advance</div>\n    <div class=\"phrase-use\">Identificar las 5 Ws es la primera tarea al leer o redactar una misión. Si alguna de las cinco está ausente, la misión está incompleta y debe reescribirse.</div>\n  </div>\n\n  <div class=\"compare-grid\">\n    <div class=\"compare-before\">\n      <div class=\"compare-label label-before\">✗ Incomplete — missing WHY</div>\n      <div class=\"compare-text\">B Coy is to SECURE the northern bridge.</div>\n    </div>\n    <div class=\"compare-after\">\n      <div class=\"compare-label label-after\">✓ Complete — all 5 Ws</div>\n      <div class=\"compare-text\">B COY is to SECURE NORTHERN BRIDGE at H+1 IOT allow the main body to cross and maintain momentum.</div>\n    </div>\n  </div>\n\n  <div class=\"compare-grid\">\n    <div class=\"compare-before\">\n      <div class=\"compare-label label-before\">✗ Two tasks in one Mission</div>\n      <div class=\"compare-text\">A Coy is to SEIZE OBJECTIVE EAGLE and then HOLD the ground against counter-attack.</div>\n    </div>\n    <div class=\"compare-after\">\n      <div class=\"compare-label label-after\">✓ One task — second task in Execution</div>\n      <div class=\"compare-text\">A COY is to SEIZE OBJECTIVE EAGLE IOT deny En use of the high ground.\n[In Execution: On SEIZING OBJECTIVE EAGLE, A COY is to CONSOLIDATE and BPT HOLD against counter-attack.]</div>\n    </div>\n  </div>"
    },
    {
      "id": "func-g3",
      "title": "Using Obligation Verbs Correctly",
      "html": "<div class=\"phrase-card\">\n    <span class=\"phrase-context ctx-verb\">ARE TO / IS TO — unit tasks</span>\n    <div class=\"phrase-en\">Use \"is to\" or \"are to\" for all assigned unit tasks. The verb is followed directly by the task verb in capitals: \"C Coy is to DENY EAGLE BRIDGE.\" — \"2 Pl and 3 Pl are to SCREEN the eastern approach.\" The obligation is clear and unambiguous. There is no room for interpretation.</div>\n    <div class=\"phrase-use\">\"Is to\" + TASK VERB es la estructura estándar de la oración de misión y de las tareas asignadas en el párrafo de Ejecución. Es la construcción más frecuente en todo OPORD NATO.</div>\n  </div>\n  <div class=\"phrase-card\">\n    <span class=\"phrase-context ctx-verb\">WILL — timings and events</span>\n    <div class=\"phrase-en\">Use \"will\" for timings and events that will occur as part of the plan: \"H-Hour will be 0400Z.\" — \"The fire support plan will commence at H-30.\" — \"The consolidation phase will begin at H+2.\" \"Will\" states a scheduled event, not a task assigned to a unit. It is not interchangeable with \"is to\".</div>\n    <div class=\"phrase-use\">\"Will\" para eventos del plan. \"Is to\" para tareas de unidades. Confundirlos es un error frecuente en escritura de órdenes. Un timing no se asigna a una unidad — ocurre en el tiempo.</div>\n  </div>\n  <div class=\"phrase-card\">\n    <span class=\"phrase-context ctx-verb\">MUST — critical constraints</span>\n    <div class=\"phrase-en\">Reserve \"must\" for constraints where failure to comply would compromise the mission or endanger the force: \"All personnel must be in position NLT H-1.\" — \"Vehicles must be camouflaged before first light.\" — \"Communications must be maintained on the primary net at all times.\" Use sparingly — if everything is \"must\", nothing is prioritised.</div>\n    <div class=\"phrase-use\">\"Must\" se reserva para los requisitos no negociables. Usar \"must\" con demasiada frecuencia dilye su efecto. En una orden bien redactada, \"must\" aparece raramente y siempre con razón clara.</div>\n  </div>\n\n  <div class=\"compare-grid\">\n    <div class=\"compare-before\">\n      <div class=\"compare-label label-before\">✗ Wrong verb — ambiguous</div>\n      <div class=\"compare-text\">C Coy should deny Eagle Bridge by H+1.</div>\n    </div>\n    <div class=\"compare-after\">\n      <div class=\"compare-label label-after\">✓ Correct verb — unambiguous</div>\n      <div class=\"compare-text\">C COY is to DENY EAGLE BRIDGE NLT H+1.</div>\n    </div>\n  </div>\n  <div class=\"compare-grid\">\n    <div class=\"compare-before\">\n      <div class=\"compare-label label-before\">✗ Wrong verb — \"shall\" (archaic)</div>\n      <div class=\"compare-text\">All units shall maintain radio silence until H-Hour.</div>\n    </div>\n    <div class=\"compare-after\">\n      <div class=\"compare-label label-after\">✓ Correct — \"will\" for a scheduled state</div>\n      <div class=\"compare-text\">All units will maintain EmCon Alpha until H-Hour.</div>\n    </div>\n  </div>"
    },
    {
      "id": "func-g4",
      "title": "Writing Command & Signal and Admin/Logistics Subsections",
      "html": "<div class=\"phrase-card\">\n    <span class=\"phrase-context ctx-comsig\">Command & Signal — required content</span>\n    <div class=\"phrase-en\">Paragraph 5 must contain: (a) Chain of command — who commands if the CO becomes a casualty; (b) Location of the commanding officer during each phase; (c) Radio nets — primary net frequency, alternate net, call signs for each element; (d) EMCON state — whether emissions are restricted and when; (e) Visual signals — if any (recognition signals, distress signals). Do not include information that belongs in other paragraphs.</div>\n    <div class=\"phrase-use\">El párrafo de Command & Signal es el más corto del OPORD pero el más crítico operacionalmente. Si las comunicaciones fallan, la cadena de mando y las frecuencias de respaldo son lo único que permite mantener la cohesión de la fuerza.</div>\n  </div>\n  <div class=\"phrase-card\">\n    <span class=\"phrase-context ctx-admin\">Admin / Logistics — required content</span>\n    <div class=\"phrase-en\">Paragraph 4 contains the sustainment concept: (a) Supply — ammunition scales, resupply procedures, fuel; (b) Transport — vehicle allocations, convoy procedures; (c) Medical — location of regimental aid post (RAP), MEDEVAC procedures, casualty collection point (CCP); (d) Prisoners of war — handling, documentation, transit; (e) CIMIC — any civil-military coordination tasks relevant to the force.</div>\n    <div class=\"phrase-use\">Admin/Logistics es el párrafo que más frecuentemente se omite o se redacta de forma insuficiente. En operaciones reales, la falla logística es la causa más común de fracaso de la misión. Un párrafo 4 bien redactado evita preguntas de los subordinados durante la ejecución.</div>\n  </div>"
    },
    {
      "id": "func-smeac-mn",
      "title": "SMEAC mnemonic",
      "html": "<div class='phrase-card'><div class='phrase-en'>Situation – Mission – Execution – Administration/Logistics – Command & Signal</div></div>"
    },
    {
      "id": "func-osmeac",
      "title": "OSMEAC",
      "html": "<div class='phrase-card'><div class='phrase-en'>Orientation + SMEAC (adds a ground/terrain orientation before Situation)</div></div>"
    },
    {
      "id": "func-5w",
      "title": "5 Ws",
      "html": "<div class='phrase-card'><div class='phrase-en'>Who · What · When · Where · Why — the five elements of the Mission paragraph</div></div>"
    },
    {
      "id": "func-mission-stmt",
      "title": "Mission statement",
      "html": "<div class='phrase-card'><div class='phrase-en'>The sentence describing the mission must be unique and complete; it cannot be divided into two separate sentences.</div><div class='phrase-use'>La oración que describe la misión debe ser única y completa; no puede dividirse en dos frases.</div></div>"
    }
  ],
  "formatGroups":[
    {
      "id": "fmt-g1",
      "title": "Full OPORD Annotated SMEAC order — Company level",
      "html": "<div class=\"info-box\">\n    The formats in this section are based on STANAG 2014 Ed9 (2000) and ATP-112 (2020). The full annotated OPORD example below follows the SMEAC structure at company level. Colour-coded annotations identify paragraph function and style features.\n  </div><div class=\"doc-frame\">\n    <div class=\"doc-header\">OPORD 02-25 — C COMPANY — OPERATION SIERRA VERDE</div>\n    <div class=\"doc-body-inner\">CLASSIFICATION: UNCLASSIFIED — EXERCISE ONLY\nCOPY No. 2 of 4 copies\nC COY HQ\nDTG: 121500ZOCT25\n\nOPERATION ORDER NUMBER 02-25\nOPERATION SIERRA VERDE\n\nREFERENCES:\nREF A: 1 BDE OPORD 01-25 dated 111200ZOCT25\nREF B: Topographic map 1:50,000 Sheet DELTA\n\nTIME ZONE: ZULU throughout.\n\n——————————————————————————\n\n0.  PRELIMS\n\n0a. GROUND\n    The AOO is the northern river valley bounded by PHASE\n    LINE RED to the north and PHASE LINE BLUE to the south.\n    Key terrain: EAGLE BRIDGE (GR 456879) dominates\n    the only crossing of RIVER DELTA. Vegetation: sparse.\n    Relief: flat, trafficable for wheeled vehicles.\n\n0b. TASK ORGANISATION\n    C COY: 3 x Rifle Pl, 1 x Sp Pl, attached Engr Sec.\n    Under command (UCOMD): EN RECCE SEC.\n    In support (IN SP): Mortar Pl (1 BN).\n\n0c. MET (as at H-Hour 131200ZOCT25)\n    Wind: 045 / 12 kph.\n    Visibility: 8 km. No precipitation.\n    BMNT: 0535Z. EENT: 1842Z.\n\n——————————————————————————\n\n1.  SITUATION\n\n1a. ENEMY FORCES (En)\n    En strength: estimated one reinforced platoon IVO\n    EAGLE BRIDGE (GR 456879). En are defensive, with\n    prepared positions on the eastern bank.\n    En capability: small arms, medium machine guns, no\n    known armour or anti-armour.\n    En most likely COA: HOLD EAGLE BRIDGE IOT deny\n    FF use of the crossing and protect LLoC.\n    En most dangerous COA: withdrawal with demolition\n    of EAGLE BRIDGE.\n\n1b. FRIENDLY FORCES (FF)\n    A COY is to SECURE PHASE LINE RED to the north IOT\n    protect C COY's northern flank.\n    B COY is to HOLD CHECKPOINT ZULU IOT secure the\n    southern axis.\n    1 BDE main body: follow-on force — ETA PHASE LINE\n    BLUE: D+2.\n\n1c. ATTACHMENTS AND DETACHMENTS (Atts & Dets)\n    Attached to C COY: Engr Sec (breaching capability).\n    Detached from C COY: NIL.\n\n1d. CIVIL POPULATION (CivPop)\n    Low CivPop density in AOO. One village (PUEBLO VERDE)\n    IVO GR 459890 — 200m north of axis. CivPop assessed\n    as neutral. CIMIC team will conduct engagement on D+1.\n\n——————————————————————————\n\n2.  MISSION\n\n    C COY is to DENY EAGLE BRIDGE IOT set conditions\n    for the denial of INS LLoC through GZ.\n\n——————————————————————————\n\n3.  EXECUTION\n\n3a. COMMANDER'S INTENT\n    Purpose: Deny En use of EAGLE BRIDGE and LLoC.\n    Method: Fix En in position, deny crossing, degrade\n    capability to reinforce.\n    End state: EAGLE BRIDGE under C COY control, En\n    unable to use northern LLoC, conditions set for\n    1 BDE advance.\n\n3b. CONCEPT OF OPERATIONS (ConOps)\n    C COY will conduct a two-phase operation.\n    Phase 1 (H-Hour to H+2): 1 Pl and 2 Pl ADVANCE TO\n    positions on the western bank and SCREEN approaches\n    to the bridge. Engr Sec will assess bridge for\n    demolition charges.\n    Phase 2 (H+2 onwards): 3 Pl will DENY EAGLE BRIDGE\n    by fire. Sp Pl will provide fire support from\n    the high ground IVO GR 455885.\n\n3c. TASKS\n    1 Pl is to ADVANCE TO GR 453876 at H-Hour IOT\n    establish a fire support position west of the bridge.\n    2 Pl is to ADVANCE TO GR 457883 and SCREEN the\n    northern approach to EAGLE BRIDGE.\n    3 Pl is to DENY EAGLE BRIDGE from H+2 IOT prevent\n    En use of the crossing.\n    Engr Sec is to ASSESS EAGLE BRIDGE for demolition\n    charges NLT H+1 and report to OC C COY.\n\n3d. COORDINATING INSTRUCTIONS\n    H-Hour: 131200ZOCT25.\n    All units must be in position NLT H-30.\n    Boundary between 1 Pl and 2 Pl: PHASE LINE GREEN\n    (as marked on REF B).\n    No fires within 200m of PUEBLO VERDE IAW ROE.\n    All vehicle movement east of PHASE LINE RED requires\n    OC approval.\n    CASEVAC: RV at GR 451870. Medical officer at this\n    location from H-Hour.\n\n——————————————————————————\n\n4.  ADMIN / LOGISTICS\n\n4a. SUPPLY\n    Ammunition: two combat loads per soldier.\n    Resupply at CCP GR 448872 at H+4 and H+8.\n    Fuel: vehicles to depart with full tanks.\n\n4b. TRANSPORT\n    Organic vehicles only. No civilian vehicles in AOO.\n\n4c. MEDICAL\n    Regimental Aid Post (RAP): GR 451870.\n    CASEVAC route: AXIS SIERRA (as per map).\n    Walking wounded: self-evacuate to RAP.\n    T1 casualties: request MEDEVAC on net.\n\n4d. PRISONERS OF WAR (PW)\n    Process IAW SOP 14. Escort to HQ C COY for\n    documentation. Do not detain CivPop without\n    OC authorisation.\n\n4e. CIMIC\n    CIMIC team will engage PUEBLO VERDE on D+1.\n    No requisitioning of civilian property without\n    OC authorisation.\n\n——————————————————————————\n\n5.  COMMAND AND SIGNAL\n\n5a. CHAIN OF COMMAND\n    OC C COY: MAJ R. Gomez.\n    Deputy OC: CPT L. Vargas.\n    If OC becomes a casualty: CPT L. Vargas assumes\n    command. If CPT Vargas is also a casualty: senior\n    pl commander assumes command and reports to HQ 1 BN.\n\n5b. LOCATION OF CO\n    Phase 1: C COY HQ GR 448872.\n    Phase 2: forward with 3 Pl.\n\n5c. COMMUNICATIONS\n    Primary net: 43.500 MHz.\n    Alternate net: 44.250 MHz.\n    Call signs:\n      C COY HQ:  SUNRAY\n      1 Pl:      SUNRAY 11\n      2 Pl:      SUNRAY 12\n      3 Pl:      SUNRAY 13\n      Sp Pl:     SUNRAY 14\n      Engr Sec:  FOXTROT 1\n    Communications must be established NLT H-1.\n\n5d. EMCON (EmCon)\n    EmCon Alpha from DTG 130001ZOCT25 to H-Hour.\n    (No radio transmissions unless distress.)\n    EmCon Charlie from H-Hour onwards.\n    (Restricted active — tactical net only.)\n\n——————————————————————————\n\nACKNOWLEDGE RECEIPT.\n\nMAJ R. GOMEZ\nOC C COMPANY\n\nCLASSIFICATION: UNCLASSIFIED — EXERCISE ONLY</div>\n    <div class=\"doc-note\">This is a training example. Key features to note: TASK VERBS in capitals throughout; obligation verbs \"is to\" and \"will\" and \"must\" used correctly; no \"should/could/shall\"; PLACES, UNITS, VESSELS in capitals; DTG format correct; coordinating instructions include ROE reference and CASEVAC plan; EMCON states clearly defined.</div>\n  </div>"
    },
    {
      "id": "fmt-g2",
      "title": "Mission Mission statement — rules and patterns",
      "html": "<div class=\"rule-card rule-mission\">\n    <div class=\"rule-phrase\">MISSION STATEMENT FORMULA:\n[UNIT] is to [TASK VERB] [OBJECT + LOCATION]\n[TIMING if applicable]\nIOT[PURPOSE / EFFECT]\n\nEXAMPLE:\nC COY is to DENY EAGLE BRIDGE\nNLT H+1\nIOT set conditions for the denial\nof INS LLoC through GZ.\n\nCHECKLIST:\n✓ One sentence only\n✓ One task verb only\n✓ Task verb in capitals\n✓ Obligation verb: is to / are to\n✓ IOT connects task to purpose\n✓ 5 Ws all present</div>\n    <div class=\"rule-type\">Mission paragraph — STANAG 2014 / ATP-112</div>\n    <div class=\"rule-note\">The Mission statement is the most important sentence in any order. Senior officers read it first. If it is unclear, ambiguous or missing any of the 5 Ws, the entire order is compromised.</div>\n  </div>"
    },
    {
      "id": "fmt-g3",
      "title": "Verbs Obligation verb rules",
      "html": "<div class=\"rule-card rule-verb\">\n    <div class=\"rule-phrase\">CORRECT USE:\n\nUnit tasks:\n\"C COY is to DENY EAGLE BRIDGE.\"\n\nTimings:\n\"H-Hour will be 0400Z.\"\n\nCritical constraints:\n\"All vehicles must be camouflaged\nbefore first light.\"\n\nBe-prepared tasks:\n\"A COY is to HOLD OBJECTIVE HAWK\nand BPT WITHDRAW on order.\"\n\n——————————————————————————\nPROHIBITED IN ORDERS:\n\n\"C Coy should deny Eagle Bridge.\"   ← suggests\n\"Units could use the eastern route.\" ← possibility\n\"1 Pl would provide fire support.\"  ← conditional\n\"All units shall maintain silence.\"  ← archaic</div>\n    <div class=\"rule-type\">Obligation verbs — STANAG 2014 / AAP-56</div>\n    <div class=\"rule-note\">This is the most frequently failed element in NATO order-writing assessments. The examiner will mark down any use of should, could, would or shall in a task or instruction.</div>\n  </div>"
    },
    {
      "id": "fmt-g4",
      "title": "Capitalisation What to capitalise in orders",
      "html": "<div class=\"rule-card rule-caps\">\n    <div class=\"rule-phrase\">CAPITALISE:\n- All place names and objectives:\n  EAGLE BRIDGE, CHECKPOINT ZULU,\n  PHASE LINE RED, GRID 456789\n- All unit names:\n  C COY, 3 BN, TASK FORCE ALPHA,\n  1 BDE, ENGR SEC\n- All vessel names:\n  ARC ALMIRANTE PADILLA\n- All task verbs in Mission and tasks:\n  SEIZE, DENY, SECURE, DESTROY\n- Tactical abbreviations:\n  En, FF, ConOps, CivPop, EmCon\n\nDO NOT CAPITALISE:\n- Verbs of obligation: is to, will, must\n- Common nouns: patrol, axis, road\n  (unless they are part of a proper name)\n- Rank abbreviations in running text\n  unless preceding a name: Maj Gomez</div>\n    <div class=\"rule-type\">Capitalisation rules — STANAG 2014</div>\n    <div class=\"rule-note\">Capitalisation in orders is a precision tool, not decoration. It signals to the reader what is a designated point, unit or action. Inconsistent capitalisation creates ambiguity.</div>\n  </div>"
    },
    {
      "id": "fmt-g5",
      "title": "Commander's Intent Writing the Intent paragraph",
      "html": "<div class=\"rule-card rule-exec\">\n    <div class=\"rule-phrase\">COMMANDER'S INTENT — three elements:\n\nPURPOSE: Why the mission must be accomplished.\n\"Purpose: Deny En use of EAGLE BRIDGE and LLoC.\"\n\nMETHOD: How the commander visualises success.\n\"Method: Fix En in position, deny crossing,\ndegrade capability to reinforce.\"\n\nEND STATE: The desired condition at mission end.\n\"End state: EAGLE BRIDGE under C COY control,\nEn unable to use northern LLoC,\nconditions set for 1 BDE advance.\"\n\n——————————————————————————\nThe Intent is the one paragraph a subordinate\ncommander must understand well enough to\ncomplete the mission without further orders.\nIf in doubt — act in accordance with the intent.</div>\n    <div class=\"rule-type\">Commander's Intent — three-element structure</div>\n    <div class=\"rule-note\">The End State is the most important element of the Intent. It tells subordinates what success looks like, enabling independent action when communications fail or the situation changes.</div>\n  </div>"
    },
    {
      "id": "fmt-g6",
      "title": "Command & Signal Paragraph 5 — key language",
      "html": "<div class=\"rule-card rule-comsig\">\n    <div class=\"rule-phrase\">CHAIN OF COMMAND:\n\"OC C COY: MAJ R. Gomez.\nIf OC becomes a casualty: CPT L. Vargas\nassumes command.\"\n\nEMCON:\n\"EmCon Alpha from [DTG] to H-Hour.\n(No radio transmissions unless distress.)\nEmCon Charlie from H-Hour onwards.\"\n\nRADIO NET:\n\"Primary net: [frequency].\nAlternate net: [frequency].\nCall signs: [unit — call sign].\"\n\nCRITICAL RULE:\n\"Communications must be established\nNLT H-1.\"</div>\n    <div class=\"rule-type\">Command & Signal — standard language patterns</div>\n    <div class=\"rule-note\">\"If [officer] becomes a casualty\" is the standard phrasing for succession of command. Do not write \"if [officer] is killed\" — this is incorrect military register.</div>\n  </div>"
    },
    {
      "id": "fmt-g7",
      "title": "Admin / Log Paragraph 4 — key language",
      "html": "<div class=\"rule-card rule-admin\">\n    <div class=\"rule-phrase\">SUPPLY:\n\"Ammunition: two combat loads per soldier.\nResupply at [location] at [time].\"\n\nMEDICAL:\n\"Regimental Aid Post (RAP): [grid].\nCASEVAC route: [axis].\nT1 casualties: request MEDEVAC on net.\"\n\nPW (PRISONERS OF WAR):\n\"Process IAW SOP [number].\nEscort to [location] for documentation.\"\n\nSTANDARD CLOSING PHRASE:\n\"All personnel are to carry\nindividual first field dressings at all times.\"</div>\n    <div class=\"rule-type\">Admin/Logistics — standard language patterns</div>\n    <div class=\"rule-note\">The medical sub-paragraph must always specify the RAP grid, the CASEVAC route and the procedure for T1 (immediate) casualties. These are the three minimum requirements under NATO medical doctrine.</div>\n  </div>"
    }
  ]
};

const PRACTICE = {
  "vocab":[
    { "id": "pv6", "text": "5. COMMAND & SIGNAL" },
    { "id": "pv7", "text": "PRELIMS" },
    { "id": "pv8", "text": "Ground" },
    { "id": "pv10", "text": "Met" },
    { "id": "pv13", "text": "FF (Friendly Forces)" },
    { "id": "pv14", "text": "Atts & Dets" },
    { "id": "pv16", "text": "Commander's Intent" },
    { "id": "pv18", "text": "Coordinating Instructions" },
    { "id": "pv19", "text": "H-Hour" },
    { "id": "pv20", "text": "D-Day" },
    { "id": "pv21", "text": "Phase line" },
    { "id": "pv22", "text": "Axis of advance" },
    { "id": "pv23", "text": "Objective" },
    { "id": "pv24", "text": "Limit of exploitation" },
    { "id": "pv25", "text": "Fire support plan" },
    { "id": "pv_new_0", "text": "Ground" },
    { "id": "pv_new_1", "text": "Met" },
    { "id": "pv_new_2", "text": "Friendly forces (FF)" },
    { "id": "pv_new_3", "text": "Objective" },
    { "id": "pv_new_4", "text": "Phase" },
    { "id": "pv_new_5", "text": "End state" },
    { "id": "pv_new_6", "text": "Main effort (ME)" },
    { "id": "pv_new_7", "text": "Supply" },
    { "id": "pv_new_8", "text": "Transport" },
    { "id": "pv_new_9", "text": "Medical" },
    { "id": "pv_new_10", "text": "Radio frequencies" },
    { "id": "pv_new_11", "text": "Call signs" }
  ],
  "func":[
    { "id": "pf1", "text": "Sunray One-One, this is Sunray. Warning Order..." },
    { "id": "pf2", "text": "Time is now 0900 Zulu. Acknowledge ready..." },
    { "id": "pf3", "text": "Sunray, Sunray One-One. Ready to copy your..." },
    { "id": "pf4", "text": "Situation: Enemy platoon-strength element reported IVO EAGLE..." },
    { "id": "pf5", "text": "Tentative H-Hour is 0400 Zulu tomorrow. Confirm..." },
    { "id": "pf6", "text": "Copied: Enemy IVO EAGLE BRIDGE." },
    { "id": "pf7", "text": "We are to be prepared to SEIZE..." },
    { "id": "pf8", "text": "Tentative H-Hour 0400 Zulu." },
    { "id": "pf9", "text": "Request any information on friendly forces in..." },
    { "id": "pf10", "text": "A Company is securing your northern flank." },
    { "id": "pf11", "text": "Full OPORD will follow NLT 1800 Zulu." },
    { "id": "pf12", "text": "For now, conduct your map reconnaissance and..." },
    { "id": "pf13", "text": "EmCon Alpha remains in effect. Acknowledge, over." },
    { "id": "pf14", "text": "Sunray One-Two, this is Sunray." },
    { "id": "pf15", "text": "I want to confirm you understood my..." },
    { "id": "pf16", "text": "In your own words, what is the..." },
    { "id": "pf17", "text": "Is that correct, over?" },
    { "id": "pf18", "text": "I will act in accordance with your..." },
    { "id": "pf19", "text": "The purpose is to deny the enemy..." },
    { "id": "pf20", "text": "I will not allow the enemy to..." },
    { "id": "pf21", "text": "Exactly right. That is why the intent..." },
    { "id": "pf22", "text": "You understand. Execute Phase One as ordered...." },
    { "id": "pf23", "text": "Dragon Six, this is Dragon Actual. I..." },
    { "id": "pf24", "text": "Your Mission statement is incomplete. It fails..." },
    { "id": "pf25", "text": "Dragon Actual, Dragon Six. I understand." }
  ]
};

const SIMULATIONS =[
  {
    "id": "sim-warnord",
    "script":[
      { "speaker": "hq", "text": "Sunray One-One, this is Sunray. Warning Order follows." },
      { "speaker": "hq", "text": "Time is now 0900 Zulu. Acknowledge ready to copy, over." },
      { "speaker": "platoon_commander", "text": "Sunray, Sunray One-One. Ready to copy your Warning Order, over." },
      { "speaker": "hq", "text": "Situation: Enemy platoon-strength element reported IVO EAGLE BRIDGE grid 456879." },
      { "speaker": "hq", "text": "Mission: 1 Platoon is to be prepared to SEIZE the western approach to the bridge." },
      { "speaker": "hq", "text": "Tentative H-Hour is 0400 Zulu tomorrow. Confirm you understand, over." },
      { "speaker": "platoon_commander", "text": "Copied: Enemy IVO EAGLE BRIDGE." },
      { "speaker": "platoon_commander", "text": "We are to be prepared to SEIZE the western approach." },
      { "speaker": "platoon_commander", "text": "Tentative H-Hour 0400 Zulu." },
      { "speaker": "platoon_commander", "text": "Request any information on friendly forces in our area, over." },
      { "speaker": "hq", "text": "A Company is securing your northern flank." },
      { "speaker": "hq", "text": "Full OPORD will follow NLT 1800 Zulu." },
      { "speaker": "hq", "text": "For now, conduct your map reconnaissance and prepare your platoon." },
      { "speaker": "hq", "text": "EmCon Alpha remains in effect. Acknowledge, over." },
      { "speaker": "platoon_commander", "text": "Wilco." },
      { "speaker": "platoon_commander", "text": "Will conduct map reconnaissance, maintain EmCon Alpha, and await full OPORD NLT 1800 Zulu." },
      { "speaker": "platoon_commander", "text": "Sunray One-One out." }
    ],
    "title": "Receiving and Acknowledging a Warning Order",
    "description": "Company HQ issues a Warning Order to a platoon commander with preliminary SMEAC information before the full OPORD is ready.",
    "roles": [ "hq", "platoon_commander" ]
  },
  {
    "id": "sim-commanders-intent",
    "script":[
      { "speaker": "commander", "text": "Sunray One-Two, this is Sunray." },
      { "speaker": "commander", "text": "I want to confirm you understood my intent for Phase Two." },
      { "speaker": "commander", "text": "In your own words, what is the end state I require, over?" },
      { "speaker": "platoon_leader", "text": "Sunray, Sunray One-Two." },
      { "speaker": "platoon_leader", "text": "End state is EAGLE BRIDGE under our control with the enemy unable to use the northern lines of communication, and conditions set for the brigade advance." },
      { "speaker": "platoon_leader", "text": "Is that correct, over?" },
      { "speaker": "commander", "text": "Correct." },
      { "speaker": "commander", "text": "But tell me this: if you lose communications with me and the enemy counter-attacks before H+2, what do you do, over?" },
      { "speaker": "platoon_leader", "text": "I will act in accordance with your intent." },
      { "speaker": "platoon_leader", "text": "The purpose is to deny the enemy use of the bridge." },
      { "speaker": "platoon_leader", "text": "If I cannot hold the western bank, I will destroy the crossing to achieve the same effect." },
      { "speaker": "platoon_leader", "text": "I will not allow the enemy to use that bridge, over." },
      { "speaker": "commander", "text": "Exactly right. That is why the intent matters more than the tasks." },
      { "speaker": "commander", "text": "You understand. Execute Phase One as ordered. Sunray out." }
    ],
    "title": "Ensuring Subordinate Understanding of Commander's Intent",
    "description": "A platoon commander seeks clarification on the Commander's Intent after receiving the OPORD, ensuring they can act independently if communications fail.",
    "roles": [ "commander", "platoon_leader" ]
  },
  {
    "id": "sim-mission-statement",
    "script":[
      { "speaker": "brigade_hq", "text": "Dragon Six, this is Dragon Actual. I have read your draft OPORD." },
      { "speaker": "brigade_hq", "text": "Your Mission statement is incomplete. It fails to state the purpose." },
      { "speaker": "brigade_hq", "text": "Acknowledge, over." },
      { "speaker": "company_commander", "text": "Dragon Actual, Dragon Six. I understand." },
      { "speaker": "company_commander", "text": "My draft stated only 'C Company is to SEIZE OBJECTIVE HAWK at H-Hour.' Request guidance: how should I express the purpose, over?" },
      { "speaker": "brigade_hq", "text": "The Mission must answer why you are seizing the objective." },
      { "speaker": "brigade_hq", "text": "Use IOT followed by the purpose." },
      { "speaker": "brigade_hq", "text": "What does seizing Objective Hawk achieve for the brigade, over?" },
      { "speaker": "company_commander", "text": "Understood." },
      { "speaker": "company_commander", "text": "Seizing Objective Hawk will open the axis for the brigade main body to advance." },
      { "speaker": "company_commander", "text": "My corrected Mission will read: C COMPANY is to SEIZE OBJECTIVE HAWK at H-Hour IOT open the axis for 1 BDE main body to advance." },
      { "speaker": "company_commander", "text": "How copy, over?" },
      { "speaker": "brigade_hq", "text": "That is a complete Mission statement." },
      { "speaker": "brigade_hq", "text": "All five Ws are present: who, what, where, when and why." },
      { "speaker": "brigade_hq", "text": "Resubmit your full OPORD with that correction." },
      { "speaker": "brigade_hq", "text": "We cannot issue an order with an incomplete Mission, over." },
      { "speaker": "company_commander", "text": "Wilco. Resubmitting corrected OPORD with complete Mission statement within thirty minutes." },
      { "speaker": "company_commander", "text": "Dragon Six out." }
    ],
    "title": "Rejecting an Incomplete Mission Statement",
    "description": "Brigade HQ rejects a company commander's draft mission statement because it is missing one of the 5 Ws.",
    "roles":[ "brigade_hq", "company_commander" ]
  },
  {
    "id": "sim-obligation-verbs",
    "script":[
      { "speaker": "senior_officer", "text": "Echo Three, this is Echo Actual." },
      { "speaker": "senior_officer", "text": "I reviewed your draft tasks for the patrol." },
      { "speaker": "senior_officer", "text": "You wrote that the reconnaissance section should screen the eastern flank." },
      { "speaker": "senior_officer", "text": "That is incorrect. Acknowledge, over." },
      { "speaker": "junior_officer", "text": "Echo Actual, Echo Three. I understand there is a problem." },
      { "speaker": "junior_officer", "text": "Is the issue with the verb I used, over?" },
      { "speaker": "senior_officer", "text": "Affirmative. Should expresses a suggestion, not an obligation." },
      { "speaker": "senior_officer", "text": "In an order, every task must be unambiguous." },
      { "speaker": "senior_officer", "text": "The reconnaissance section is not being advised to screen the flank." },
      { "speaker": "senior_officer", "text": "They are being ordered to do it." },
      { "speaker": "senior_officer", "text": "What is the correct obligation verb, over?" },
      { "speaker": "junior_officer", "text": "The correct verb is is to." },
      { "speaker": "junior_officer", "text": "The task should read: Recce Section is to SCREEN the eastern flank IOT provide early warning." },
      { "speaker": "junior_officer", "text": "I will correct this immediately, over." },
      { "speaker": "senior_officer", "text": "Correct. Also remember: only three obligation verbs exist in NATO orders." },
      { "speaker": "senior_officer", "text": "Is to for unit tasks, will for timings, and must for critical constraints." },
      { "speaker": "senior_officer", "text": "Never use should, could, would or shall." },
      { "speaker": "senior_officer", "text": "Do you have any of those in your draft, over?" },
      { "speaker": "junior_officer", "text": "I will check my entire draft now." },
      { "speaker": "junior_officer", "text": "I recall I used shall in one coordinating instruction." },
      { "speaker": "junior_officer", "text": "I will replace it with will. Echo Three confirms understanding." },
      { "speaker": "junior_officer", "text": "No should, could, would or shall in any order. Echo Three out." }
    ],
    "title": "Correcting Improper Use of \"Should\" in a Task Assignment",
    "description": "A senior officer corrects a subordinate's draft order that used \"should\" instead of the proper obligation verb \"is to\".",
    "roles":[ "senior_officer", "junior_officer" ]
  },
  {
    "id": "sim-comsig-brief",
    "script":[
      { "speaker": "coms_officer", "text": "All stations, this is Sunray. Communications check prior to H-Hour." },
      { "speaker": "coms_officer", "text": "Confirm primary net frequency 43.500 megahertz. Acknowledge in sequence, over." },
      { "speaker": "patrol_leader", "text": "Sunray, Sunray One-One. Receiving you on primary net 43.500." },
      { "speaker": "patrol_leader", "text": "Signal strength five by five, over." },
      { "speaker": "coms_officer", "text": "Roger. Remember: EmCon Alpha remains in effect until H-Hour." },
      { "speaker": "coms_officer", "text": "No radio transmissions unless you are in distress." },
      { "speaker": "coms_officer", "text": "At H-Hour, we transition to EmCon Charlie." },
      { "speaker": "coms_officer", "text": "Confirm you understand the EMCON change, over." },
      { "speaker": "patrol_leader", "text": "Copied. EmCon Alpha until H-Hour, complete radio silence unless distress." },
      { "speaker": "patrol_leader", "text": "After H-Hour, EmCon Charlie, tactical net use only." },
      { "speaker": "patrol_leader", "text": "What is the alternate frequency if primary net fails, over?" },
      { "speaker": "coms_officer", "text": "Alternate net is 44.250 megahertz." },
      { "speaker": "coms_officer", "text": "Switch to alternate only on my command or if you lose contact on primary for more than five minutes." },
      { "speaker": "coms_officer", "text": "Final item: chain of command." },
      { "speaker": "coms_officer", "text": "If I become a casualty, Sunray One-One assumes command. Acknowledge, over." },
      { "speaker": "patrol_leader", "text": "Solid copy. Primary 43.500, alternate 44.250." },
      { "speaker": "patrol_leader", "text": "I assume command if you become a casualty." },
      { "speaker": "patrol_leader", "text": "All communications to be established NLT H minus one." },
      { "speaker": "patrol_leader", "text": "Sunray One-One standing by, out." }
    ],
    "title": "Briefing Command and Signal Arrangements Before Execution",
    "description": "The communications officer briefs all call signs on the radio net frequencies, EMCON state changes, and chain of command succession before the operation begins.",
    "roles": [ "coms_officer", "patrol_leader" ]
  },
  {
    "id": "sim-intent-conflict",
    "script":[
      { "speaker": "commander", "text": "Sunray One-Three, you have your tasks for Phase Two." },
      { "speaker": "commander", "text": "You are to ADVANCE TO grid 457883 and HOLD that position." },
      { "speaker": "commander", "text": "Any questions before execution, over?" },
      { "speaker": "platoon_commander", "text": "Sunray, Sunray One-Three. I have one question." },
      { "speaker": "platoon_commander", "text": "My task states I am to HOLD at grid 457883." },
      { "speaker": "platoon_commander", "text": "However, your Intent states the end state requires the enemy to be unable to use the northern lines of communication." },
      { "speaker": "platoon_commander", "text": "If I simply hold my position, the enemy may still use the northern route." },
      { "speaker": "platoon_commander", "text": "Request clarification, over." },
      { "speaker": "commander", "text": "Good catch. You are correct." },
      { "speaker": "commander", "text": "Holding that grid alone does not fully achieve the intent." },
      { "speaker": "commander", "text": "What do you propose, over?" },
      { "speaker": "platoon_commander", "text": "Sir, I recommend my task be modified to DENY the northern route from grid 457883 IOT prevent enemy use of the lines of communication." },
      { "speaker": "platoon_commander", "text": "That aligns with your end state." },
      { "speaker": "platoon_commander", "text": "If you approve, I will adjust the task and brief my section commanders accordingly, over." },
      { "speaker": "commander", "text": "Approved." },
      { "speaker": "commander", "text": "Your corrected task: 3 Platoon is to DENY the northern route from grid 457883 IOT prevent enemy use of the lines of communication." },
      { "speaker": "commander", "text": "Good initiative. You understood my intent better than the written order." },
      { "speaker": "commander", "text": "Execute and report at H+1, over." },
      { "speaker": "platoon_commander", "text": "Wilco." },
      { "speaker": "platoon_commander", "text": "3 Platoon will DENY the northern route in accordance with your intent." },
      { "speaker": "platoon_commander", "text": "Sunray One-Three out." }
    ],
    "title": "Subordinate Identifies Conflict Between Task and Commander's Intent",
    "description": "A platoon commander identifies a contradiction between an assigned task in the Execution paragraph and the Commander's Intent, and requests clarification before execution.",
    "roles": [ "commander", "platoon_commander" ]
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
    const formats = ['.webp', '.png', '.jpg', '.jpeg'];
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
  renderFunctionsTab();
  renderFormatsTab();

  setupModeSwitching();
  setupStudyTabs();
  setupPracticeTabs();
  setupGlobalControls();
  setupMicGate();
  
  updateProgressUI();
});

function calculateTotalItems() {
  const vocabCount = CONTENT.vocab.length;
  const funcGroups = 5; 
  const formatGroups = 6;
  const simCount = SIMULATIONS.length;
  
  TOTAL_ITEMS = vocabCount + funcGroups + formatGroups + simCount;
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

function toggleVocabGroup(groupName, isChecked) {
  CONTENT.vocab.filter(i => i.group === groupName).forEach(item => {
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

function setupMicGate() {
  const btn = document.getElementById('enable-mic-btn');
  if (btn) {
    btn.addEventListener('click', () => {
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
    });
  }
}

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

function setupPracticeTabs() {
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
  const pCards = document.getElementById('practice-cards');
  const pArea = document.getElementById('practice-area');
  
  if (mode === 'vocab' || mode === 'func') {
    pArea.classList.add('hidden'); pCards.classList.remove('hidden');
    renderPracticeCards(mode);
  } else {
    pCards.classList.add('hidden'); pArea.classList.remove('hidden');
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
}

// ============================================================================
// STUDY SECTION RENDERING
// ============================================================================

function toggleAccordion(header) {
  const acc = header.closest('.accordion');
  acc.classList.toggle('is-open');
}

function renderVocab() {
  const container = document.getElementById('tab-vocab');
  if (!container) return;
  container.innerHTML = '';

  const groups = {};
  CONTENT.vocab.forEach(item => {
    if (!groups[item.group]) groups[item.group] =[];
    groups[item.group].push(item);
  });

  for (const[groupName, items] of Object.entries(groups)) {
    const acc = document.createElement('div');
    acc.className = 'accordion';
    acc.innerHTML = `
      <div class="accordion-header" onclick="toggleAccordion(this)">
        <div class="acc-icon-box"><i class="fas fa-database"></i></div>
        <div class="acc-title-group">
          <div class="acc-title">${groupName}</div>
          <div class="acc-count">${items.length} items</div>
        </div>
        <i class="fas fa-chevron-down acc-chevron"></i>
      </div>
      <div class="accordion-body">
        <div class="accordion-inner">
            ${(function(){
               if (groupName === 'SMEAC Structure — The Five Paragraphs') {
                 let html = '<p class="smeac-explanation" style="margin-bottom: 1rem; color: var(--on-surface-variant); font-size: 0.9rem;">The SMEAC structure is a five-paragraph military framework used to communicate operational orders clearly, ensuring all team members understand their roles and mission objectives.</p>';
                 html += '<div class="smeac-grid">';
                 html += items.map(item => {
                   return `<div class="smeac-card">
                             <div class="smeac-head">${item.en}</div>
                             <div class="smeac-body">${item.es.replace(/ — /g, '<br><span style="color:var(--on-surface-variant); font-size: 12px; margin-top: 6px; display:block;">')}</span></div>
                           </div>`;
                 }).join('');
                 html += '</div>';
                 const smeacIds = items.map(i => i.id);
                 const allKnown = smeacIds.every(id => knownItems.has(id));
                 html += `<div style="text-align: right; margin-top: 15px; padding-right: 14px;">
                   <label class="know-checkbox">
                     <input type="checkbox" class="know-cb" ${allKnown ? 'checked' : ''} onchange="
                       const isChecked = this.checked;
                       const ids = ['${smeacIds.join("','")}'];
                       ids.forEach(id => {
                         if (isChecked) knownItems.add(id); else knownItems.delete(id);
                       });
                       localStorage.setItem(STORAGE_KEY, JSON.stringify([...knownItems]));
                       updateProgressUI();
                     ">
                     <span class="know-label">Mark section verified</span>
                   </label>
                 </div>`;
                 return html;
               } else {
                 return items.map(item => {
                    const slug = toSlug(item.en);
                    const isKnown = knownItems.has(item.id);
                    const hasImage = AVAILABLE_IMAGES.includes(slug);
                    
                    const hideAudio = groupName === 'SMEAC Structure — The Five Paragraphs' || groupName === 'Capitalisation Rules in Orders' || groupName === 'Doctrinal References' || groupName === 'Key Terms by Paragraph';
                    const audioBtnHtml = hideAudio ? '' : `<button class="audio-btn" onclick="playFallbackAudio('${item.en.replace(/'/g, "\\'")}', null, this)" title="Listen"><i class="fas fa-volume-up"></i></button>`;
                    
                    const imgBtnHtml = hasImage ? `<button class="audio-btn image-toggle-btn" id="img-btn-${item.id}" style="display: none;" onclick="toggleVocabImage(this, '${item.id}', '${slug}')" title="Toggle Image"><i class="fas fa-image"></i></button>` : '';
                    const imgContHtml = hasImage ? `<div class="item-image-container" id="img-cont-${item.id}" style="display: none; text-align: center; margin-top: 10px; margin-bottom: 5px;">
                        <img id="img-${item.id}" style="max-height: 200px; max-width: 100%;" onload="const b = document.getElementById('img-btn-${item.id}'); if(b) b.style.display='inline-flex';">
                      </div>` : '';

                    return `<div class="item-row-wrap" data-id="${item.id}">
                      <div class="item-row">
                        <div class="item-en">${item.en}</div>
                        <div class="item-es">${item.es}</div>
                        <div class="item-controls">
                          ${imgBtnHtml}
                          ${audioBtnHtml}
                          <label class="know-checkbox">
                            <input type="checkbox" class="know-cb" ${isKnown ? 'checked' : ''} onchange="toggleItem('${item.id}', this.checked)">
                            <span class="know-label">Verified</span>
                          </label>
                        </div>
                      </div>
                      ${imgContHtml}
                    </div>`;
                 }).join('');
                }
             })()}
          </div>
          ${groupName === 'SMEAC Structure — The Five Paragraphs' ? '' : `
          <div class="accordion-footer">
            <span style="font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase;">Mark section verified:</span>
            <input type="checkbox" class="know-cb" 
                   ${items.every(i => knownItems.has(i.id)) ? 'checked' : ''}
                   onchange="toggleVocabGroup('${groupName.replace(/'/g, "\\'")}', this.checked)">
          </div>
          `}
        </div>
      `;
      container.appendChild(acc);
      
      if (groupName !== 'SMEAC Structure — The Five Paragraphs') {
          items.forEach(item => {
              const imgElement = document.getElementById(`img-${item.id}`);
              if (imgElement) {
                  loadResilientImage(imgElement, toSlug(item.en));
              }
          });
      }
  }
}

function renderFunctionsTab() {
  const container = document.getElementById('tab-func');
  if (!container) return;
  
  let html = '';
  CONTENT.funcGroups.forEach(g => {
    const isKnown = knownItems.has(g.id);
    html += `
    <div class="accordion">
      <div class="accordion-header" onclick="toggleAccordion(this)">
        <div class="acc-icon-box"><i class="fas fa-list-alt"></i></div>
        <div class="acc-title-group"><div class="acc-title">${g.title}</div></div>
        <i class="fas fa-chevron-down acc-chevron"></i>
      </div>
      <div class="accordion-body">
        <div class="accordion-inner">
          ${g.html}
        </div>
        <div class="accordion-footer">
          <span style="font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase;">Mark section verified:</span>
          <input type="checkbox" class="know-cb" ${isKnown ? 'checked' : ''} onchange="toggleItem('${g.id}', this.checked)">
        </div>
      </div>
    </div>
    `;
  });
  container.innerHTML = html;
}

function renderFormatsTab() {
  const container = document.getElementById('tab-formats');
  if (!container) return;
  
  let html = '';
  CONTENT.formatGroups.forEach(g => {
    const isKnown = knownItems.has(g.id);
    html += `
    <div class="accordion">
      <div class="accordion-header" onclick="toggleAccordion(this)">
        <div class="acc-icon-box"><i class="fas fa-file-alt"></i></div>
        <div class="acc-title-group"><div class="acc-title">${g.title}</div></div>
        <i class="fas fa-chevron-down acc-chevron"></i>
      </div>
      <div class="accordion-body">
        <div class="accordion-inner">
          ${g.html}
        </div>
        <div class="accordion-footer">
          <span style="font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase;">Mark section verified:</span>
          <input type="checkbox" class="know-cb" ${isKnown ? 'checked' : ''} onchange="toggleItem('${g.id}', this.checked)">
        </div>
      </div>
    </div>
    `;
  });
  container.innerHTML = html;
}

// ============================================================================
// PRACTICE CARDS & SPEECH RECOGNITION
// ============================================================================

function renderPracticeCards(listKey) {
  const container = document.getElementById('practice-cards');
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
           <button class="record-btn" onclick="startVocabRec('${item.text.replace(/'/g, "\\'")}', this)">
             <i class="fas fa-microphone"></i> Interrogate
           </button>
        </div>
        <div class="rec-result hidden" style="margin-top:var(--space-2);"></div>
      </div>
    `;
    container.appendChild(card);
  });
}

function startVocabRec(target, btn) {
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
// SIMULATIONS
// ============================================================================

function renderPracticeGallery() {
  const container = document.getElementById('practice-area');
  container.innerHTML = '';
  container.classList.remove('hidden');

  if (SIMULATIONS.length === 0) {
    container.innerHTML = `<div class="mic-notice"><div class="mic-icon-wrap"><i class="fas fa-wrench"></i></div><h3>Simulations Pending</h3><p>Please provide the DeepSeek simulations to unlock this sector.</p></div>`;
    return;
  }

  const gallery = document.createElement('div');
  gallery.className = 'sim-gallery';

  SIMULATIONS.forEach(sim => {
    const isCompleted = knownItems.has(sim.id);
    const card = document.createElement('div');
    card.className = `sim-card ${isCompleted ? 'completed' : ''}`;
    card.onclick = () => showRolePicker(sim.id);
    card.innerHTML = `
      <div class="sim-card-header"><span class="sim-number">${sim.id.toUpperCase()}</span><span class="sim-completed-badge"><i class="fas fa-check"></i> Verified</span></div>
      <div class="sim-card-body" style="flex:1;"><h3 class="sim-title" style="margin-bottom:8px;">${sim.title}</h3><p class="sim-desc">${sim.description}</p><div class="sim-roles" style="margin-top:10px;">${sim.roles.map(r => `<span class="sim-role-tag">${r.toUpperCase()}</span>`).join('')}</div></div>
      <div class="sim-card-footer"><span class="sim-line-count">${sim.script.length} transmissions</span><span class="sim-start-hint">Execute <i class="fas fa-arrow-right"></i></span></div>
    `;
    gallery.appendChild(card);
  });
  container.appendChild(gallery);
}

function showRolePicker(simId) {
  const sim = SIMULATIONS.find(s => s.id === simId);
  const container = document.getElementById('practice-area');
  container.innerHTML = `
    <div class="role-picker">
      <h3 style="color:var(--primary); text-transform:uppercase; margin-bottom:10px;">Select Call Sign</h3>
      <p style="margin-bottom:20px;">${sim.title}</p>
      <div class="role-buttons">
        ${sim.roles.map(r => `<button class="role-btn" onclick="startSimulation('${sim.id}', '${r}')"><i class="fas fa-headset"></i><span class="role-btn-name">${r.toUpperCase()}</span><span class="role-btn-sub">Assume this role</span></button>`).join('')}
      </div>
      <button class="btn-ghost" style="margin-top:20px;" onclick="renderPracticeGallery()"><i class="fas fa-arrow-left"></i> Abort</button>
    </div>
  `;
}

function startSimulation(simId, role) {
  simState = { activeId: simId, role: role, turnIndex: 0, score: 0, attempts: 0, maxAttempts: 3 };
  renderSimulationStage();
  processNextTurn();
}

function renderSimulationStage() {
  const sim = SIMULATIONS.find(s => s.id === simState.activeId);
  const container = document.getElementById('practice-area');
  container.innerHTML = `
    <div class="sim-stage">
      <div class="sim-stage-header"><div class="sim-stage-title">${sim.title}</div><div class="sim-stage-meta">Call Sign: <span class="sim-role-badge">${simState.role.toUpperCase()}</span></div></div>
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
  bubble.innerHTML = `<div class="bubble-avatar avatar-system"><i class="fas fa-network-wired"></i></div><div class="bubble-content"><div class="bubble-speaker">${line.speaker}</div><div class="bubble-text">${line.text}</div></div>`;
  area.appendChild(bubble); area.scrollTop = area.scrollHeight;
}

function renderUserPrompt(line) {
  const area = document.getElementById('dialogue-area');
  const bubble = document.createElement('div');
  bubble.className = 'dialogue-bubble user-prompt';
  bubble.id = `turn-${simState.turnIndex}`;
  bubble.innerHTML = `<div class="bubble-avatar avatar-user"><i class="fas fa-user-astronaut"></i></div><div class="bubble-content"><div class="bubble-say-label">Transmission required: <button class="btn btn-ghost btn-sm" onclick="playFallbackAudio('${line.text.replace(/'/g, "\\'")}', null, this)"><i class="fas fa-volume-up"></i> Decode</button></div><div class="bubble-text">${line.text}</div><div class="turn-feedback" id="feedback-${simState.turnIndex}"></div></div>`;
  area.appendChild(bubble); area.scrollTop = area.scrollHeight;
}

function setupRecordingState() {
  const controlBar = document.getElementById('sim-control-bar');
  controlBar.style.display = 'flex';
  document.getElementById('sim-attempt-info').textContent = `Attempts remaining: ${simState.maxAttempts}`;
  const btn = document.getElementById('sim-record-btn');
  btn.classList.remove('recording'); btn.querySelector('span').textContent = "Transmit";
  if (recognition) { recognition.onend = null; recognition.onerror = null; recognition.onresult = null; recognition.abort(); }
}

function toggleSimRecording() {
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

  btn.classList.add('recording'); 
  btn.querySelector('span').textContent = "Listening...";
  
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
}

function skipTurn() { simState.turnIndex++; processNextTurn(); }

function exitSimulation() {
  if (recognition) recognition.abort();
  isListening = false;
  simState.activeId = null; renderPracticeGallery();
}

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