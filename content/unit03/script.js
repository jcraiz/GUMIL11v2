'use strict';

// ============================================================================
// CONSTANTS & STATE
// ============================================================================

const STORAGE_KEY = 'military_l11_u3_known';
const P_KEY = 'military_l11_u3_practice';
const PASS_THRESHOLD = 0.70;

// Silent Image manifest - currently empty as no images are present in unit03/images
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
    { "id": "v_attack", "group": "Task Verbs — Offensive Operations (ATP-112)", "en": "ATTACK", "es": "Maniobrar con fuego para destruir o derrotar al enemigo — verbo ofensivo genérico" },
    { "id": "v_attackbyfire", "group": "Task Verbs — Offensive Operations (ATP-112)", "en": "ATTACK BY FIRE", "es": "Atacar con fuego directo sin cerrar con el enemigo — fijarlo o desgastarlo desde distancia" },
    { "id": "v_seize", "group": "Task Verbs — Offensive Operations (ATP-112)", "en": "SEIZE", "es": "Tomar posesión de un área designada por la fuerza — implica combate para obtener control" },
    { "id": "v_capture", "group": "Task Verbs — Offensive Operations (ATP-112)", "en": "CAPTURE", "es": "Tomar posesión de personal, equipo o material enemigo designado — no de terreno" },
    { "id": "v_clear", "group": "Task Verbs — Offensive Operations (ATP-112)", "en": "CLEAR", "es": "Eliminar todas las fuerzas enemigas de un área designada — confirmar área libre de hostiles" },
    { "id": "v_secure", "group": "Task Verbs — Offensive Operations (ATP-112)", "en": "SECURE", "es": "Ganar control de un área para prevenir su uso o destrucción por el enemigo — énfasis en protección" },
    { "id": "v_destroy", "group": "Task Verbs — Offensive Operations (ATP-112)", "en": "DESTROY", "es": "Dejar un blanco físicamente incapaz de cumplir su función — daño permanente e irreversible" },
    { "id": "v_defeat", "group": "Task Verbs — Offensive Operations (ATP-112)", "en": "DEFEAT", "es": "Dejar al enemigo incapaz o sin voluntad de resistir — puede ser por destrucción, neutralización o retirada forzada" },
    { "id": "v_penetrate", "group": "Task Verbs — Offensive Operations (ATP-112)", "en": "PENETRATE", "es": "Romper las defensas enemigas para abrir una brecha — atravesar la línea defensiva principal" },
    { "id": "v_envelop", "group": "Task Verbs — Offensive Operations (ATP-112)", "en": "ENVELOP", "es": "Maniobrar alrededor de la posición enemiga para atacar desde el flanco o retaguardia" },
    { "id": "v_exploit", "group": "Task Verbs — Offensive Operations (ATP-112)", "en": "EXPLOIT", "es": "Aprovechar el éxito táctico para desorganizar al enemigo en profundidad — seguir el momentum" },
    { "id": "v_ambush", "group": "Task Verbs — Offensive Operations (ATP-112)", "en": "AMBUSH", "es": "Ataque sorpresa desde posición oculta contra una fuerza en movimiento o temporalmente detenida" },
    { "id": "v_assault", "group": "Task Verbs — Offensive Operations (ATP-112)", "en": "ASSAULT", "es": "Fase final del ataque — cerrar con el enemigo y destruirlo o derrotarlo mediante combate cercano" },
    { "id": "v_breach", "group": "Task Verbs — Offensive Operations (ATP-112)", "en": "BREACH", "es": "Crear una brecha a través de un obstáculo — abrir paso en campos minados, muros o barreras" },
    { "id": "v_bypass", "group": "Task Verbs — Offensive Operations (ATP-112)", "en": "BYPASS", "es": "Maniobrar alrededor de un obstáculo o posición enemiga sin enfrentarlo — evitar el combate" },
    { "id": "v_counterattack", "group": "Task Verbs — Offensive Operations (ATP-112)", "en": "COUNTER-ATTACK", "es": "Ataque de una fuerza en defensa contra una fuerza atacante — recuperar terreno perdido" },
    { "id": "v_feint", "group": "Task Verbs — Offensive Operations (ATP-112)", "en": "FEINT", "es": "Ataque de engaño para desviar la atención enemiga — operación de decepción táctica" },
    { "id": "v_block", "group": "Task Verbs — Defensive & Shaping Operations", "en": "BLOCK", "es": "Impedir el movimiento enemigo en una dirección específica o a lo largo de una ruta — barrera física o por fuego" },
    { "id": "v_deny", "group": "Task Verbs — Defensive & Shaping Operations", "en": "DENY", "es": "Impedir que el enemigo use un área, ruta o instalación — no requiere ocupación física permanente" },
    { "id": "v_delay", "group": "Task Verbs — Defensive & Shaping Operations", "en": "DELAY", "es": "Retardar el avance enemigo sin entrar en combate decisivo — intercambiar espacio por tiempo" },
    { "id": "v_fix", "group": "Task Verbs — Defensive & Shaping Operations", "en": "FIX", "es": "Impedir que el enemigo se mueva o maniobre — clavarlo en su posición actual" },
    { "id": "v_contain", "group": "Task Verbs — Defensive & Shaping Operations", "en": "CONTAIN", "es": "Impedir que el enemigo se retire o maniobre más allá de un área designada — aislarlo operacionalmente" },
    { "id": "v_isolate", "group": "Task Verbs — Defensive & Shaping Operations", "en": "ISOLATE", "es": "Separar al enemigo de sus fuentes de apoyo — cortar refuerzos, suministros o comunicaciones" },
    { "id": "v_screen", "group": "Task Verbs — Defensive & Shaping Operations", "en": "SCREEN", "es": "Proporcionar alerta temprana mediante vigilancia — observar y reportar sin entrar en combate decisivo" },
    { "id": "v_guard", "group": "Task Verbs — Defensive & Shaping Operations", "en": "GUARD", "es": "Proteger contra observación, ataque o infiltración enemiga — defensa más activa que SCREEN" },
    { "id": "v_cover", "group": "Task Verbs — Defensive & Shaping Operations", "en": "COVER", "es": "Proteger posicionándose entre el enemigo y la fuerza protegida — absorbe el primer contacto" },
    { "id": "v_retain", "group": "Task Verbs — Defensive & Shaping Operations", "en": "RETAIN", "es": "Mantener la posesión de un área designada — defensa de terreno ya controlado" },
    { "id": "v_canalize", "group": "Task Verbs — Defensive & Shaping Operations", "en": "CANALIZE", "es": "Restringir el movimiento enemigo a una zona estrecha — dirigirlo hacia donde se le puede atacar" },
    { "id": "v_disrupt", "group": "Task Verbs — Defensive & Shaping Operations", "en": "DISRUPT", "es": "Romper y volver temporalmente ineficaz — desorganizar sin daño permanente" },
    { "id": "v_neutralize", "group": "Task Verbs — Defensive & Shaping Operations", "en": "NEUTRALIZE", "es": "Dejar temporalmente incapaz de cumplir su función — inutilizar por un periodo limitado" },
    { "id": "v_demonstrate", "group": "Task Verbs — Defensive & Shaping Operations", "en": "DEMONSTRATE", "es": "Demostración de fuerza para engañar sobre intenciones — similar a FEINT pero sin hacer contacto" },
    { "id": "v_withdraw", "group": "Task Verbs — Defensive & Shaping Operations", "en": "WITHDRAW", "es": "Desengancharse del enemigo y moverse hacia la retaguardia — retirada planificada bajo presión" },
    { "id": "v_escort", "group": "Task Verbs — Enabling & Mobility Operations", "en": "ESCORT", "es": "Acompañar y proteger una fuerza o convoy — garantizar seguridad durante el movimiento" },
    { "id": "v_evacuate", "group": "Task Verbs — Enabling & Mobility Operations", "en": "EVACUATE", "es": "Retirar personal o material de un área — extracción por motivos de seguridad o médicos" },
    { "id": "v_exfiltrate", "group": "Task Verbs — Enabling & Mobility Operations", "en": "EXFILTRATE", "es": "Retirar personal de manera encubierta — salida silenciosa sin detección enemiga" },
    { "id": "v_infiltrate", "group": "Task Verbs — Enabling & Mobility Operations", "en": "INFILTRATE", "es": "Mover personal de manera encubierta a través de líneas enemigas — penetración sin ser detectado" },
    { "id": "v_interdict", "group": "Task Verbs — Enabling & Mobility Operations", "en": "INTERDICT", "es": "Impedir el uso enemigo de rutas o áreas — cortar líneas de comunicación o suministro" },
    { "id": "v_locate", "group": "Task Verbs — Enabling & Mobility Operations", "en": "LOCATE", "es": "Encontrar y reportar la posición de — identificar coordenadas de un objetivo o elemento" },
    { "id": "v_occupy", "group": "Task Verbs — Enabling & Mobility Operations", "en": "OCCUPY", "es": "Moverse a un área y controlarla sin oposición armada — asentamiento sin combate" },
    { "id": "v_pursue", "group": "Task Verbs — Enabling & Mobility Operations", "en": "PURSUE", "es": "Seguir al enemigo para capturarlo o destruirlo — persecución tras ruptura o retirada enemiga" },
    { "id": "v_recover", "group": "Task Verbs — Enabling & Mobility Operations", "en": "RECOVER", "es": "Recuperar personal o material — búsqueda y extracción de elementos propios" },
    { "id": "v_relieveinplace", "group": "Task Verbs — Enabling & Mobility Operations", "en": "RELIEVE IN PLACE", "es": "Relevar una unidad por otra en la misma posición — sustitución sin pérdida de control del terreno" },
    { "id": "v_retire", "group": "Task Verbs — Enabling & Mobility Operations", "en": "RETIRE", "es": "Alejarse del enemigo sin presión táctica — movimiento retrógrado sin contacto" },
    { "id": "v_supportbyfire", "group": "Task Verbs — Enabling & Mobility Operations", "en": "SUPPORT BY FIRE", "es": "Apoyar con fuego directo la maniobra de otra unidad — fuego de cobertura desde posición fija" },
    { "id": "v_turn", "group": "Task Verbs — Enabling & Mobility Operations", "en": "TURN", "es": "Forzar al enemigo a cambiar de dirección — desviarlo de su eje de avance planeado" },
    { "id": "v_followampsupport", "group": "Task Verbs — Enabling & Mobility Operations", "en": "FOLLOW & SUPPORT", "es": "Seguir y apoyar a una unidad líder — proporcionar refuerzo y apoyo sin asumir la misión principal" },
    { "id": "v_followampassume", "group": "Task Verbs — Enabling & Mobility Operations", "en": "FOLLOW & ASSUME", "es": "Seguir y estar preparado para asumir la misión de la unidad líder si esta no puede continuar" },
    { "id": "v_conductinfoops", "group": "CONDUCT + [Activity] — When No NATO Verb Exists", "en": "CONDUCT INFO OPS", "es": "Ejecutar operaciones de información (no existe verbo NATO directo)" },
    { "id": "v_conductsar", "group": "CONDUCT + [Activity] — When No NATO Verb Exists", "en": "CONDUCT SAR", "es": "Search and Rescue — búsqueda y rescate" },
    { "id": "v_conductcimictasks", "group": "CONDUCT + [Activity] — When No NATO Verb Exists", "en": "CONDUCT CIMIC TASKS", "es": "Ejecutar tareas de cooperación cívico-militar" },
    { "id": "v_conductreconnaissanc", "group": "CONDUCT + [Activity] — When No NATO Verb Exists", "en": "CONDUCT RECONNAISSANCE", "es": "Aunque existen verbos como LOCATE y SCREEN, el reconocimiento completo usa CONDUCT" },
    { "id": "v_conductdeceptionops", "group": "CONDUCT + [Activity] — When No NATO Verb Exists", "en": "CONDUCT DECEPTION OPS", "es": "Operaciones de decepción — FEINT y DEMONSTRATE son formas específicas" },
    { "id": "v_conductcordon", "group": "CONDUCT +[Activity] — When No NATO Verb Exists", "en": "CONDUCT CORDON", "es": "Establecer un cordón de seguridad — combina elementos de CONTAIN y SCREEN" }
];

const PRACTICE = {
  vocab:[
    { "id": "p_v_0", "text": "ATTACK" },
    { "id": "p_v_1", "text": "ATTACK BY FIRE" },
    { "id": "p_v_2", "text": "SEIZE" },
    { "id": "p_v_3", "text": "CAPTURE" },
    { "id": "p_v_4", "text": "CLEAR" },
    { "id": "p_v_5", "text": "SECURE" },
    { "id": "p_v_6", "text": "DESTROY" },
    { "id": "p_v_7", "text": "DEFEAT" },
    { "id": "p_v_8", "text": "PENETRATE" },
    { "id": "p_v_9", "text": "ENVELOP" },
    { "id": "p_v_10", "text": "EXPLOIT" },
    { "id": "p_v_11", "text": "AMBUSH" },
    { "id": "p_v_12", "text": "ASSAULT" },
    { "id": "p_v_13", "text": "BREACH" },
    { "id": "p_v_14", "text": "BYPASS" },
    { "id": "p_v_15", "text": "COUNTER-ATTACK" },
    { "id": "p_v_16", "text": "FEINT" },
    { "id": "p_v_17", "text": "BLOCK" },
    { "id": "p_v_18", "text": "DENY" },
    { "id": "p_v_19", "text": "DELAY" },
    { "id": "p_v_20", "text": "FIX" },
    { "id": "p_v_21", "text": "CONTAIN" },
    { "id": "p_v_22", "text": "ISOLATE" },
    { "id": "p_v_23", "text": "SCREEN" },
    { "id": "p_v_24", "text": "GUARD" },
    { "id": "p_v_25", "text": "COVER" },
    { "id": "p_v_26", "text": "RETAIN" },
    { "id": "p_v_27", "text": "CANALIZE" },
    { "id": "p_v_28", "text": "DISRUPT" },
    { "id": "p_v_29", "text": "NEUTRALIZE" },
    { "id": "p_v_30", "text": "DEMONSTRATE" },
    { "id": "p_v_31", "text": "WITHDRAW" },
    { "id": "p_v_32", "text": "ESCORT" },
    { "id": "p_v_33", "text": "EVACUATE" },
    { "id": "p_v_34", "text": "EXFILTRATE" },
    { "id": "p_v_35", "text": "INFILTRATE" },
    { "id": "p_v_36", "text": "INTERDICT" },
    { "id": "p_v_37", "text": "LOCATE" },
    { "id": "p_v_38", "text": "OCCUPY" },
    { "id": "p_v_39", "text": "PURSUE" },
    { "id": "p_v_40", "text": "RECOVER" },
    { "id": "p_v_41", "text": "RELIEVE IN PLACE" },
    { "id": "p_v_42", "text": "RETIRE" },
    { "id": "p_v_43", "text": "SUPPORT BY FIRE" },
    { "id": "p_v_44", "text": "TURN" },
    { "id": "p_v_45", "text": "FOLLOW & SUPPORT" },
    { "id": "p_v_46", "text": "FOLLOW & ASSUME" },
    { "id": "p_v_47", "text": "CONDUCT INFO OPS" },
    { "id": "p_v_48", "text": "CONDUCT SAR" },
    { "id": "p_v_49", "text": "CONDUCT CIMIC TASKS" },
    { "id": "p_v_50", "text": "CONDUCT RECONNAISSANCE" },
    { "id": "p_v_51", "text": "CONDUCT DECEPTION OPS" },
    { "id": "p_v_52", "text": "CONDUCT CORDON" }
  ],
  func:[
    { "id": "p_f_1a", "text": "Sunray One-One, this is Sunray." },
    { "id": "p_f_1b", "text": "Confirm your understanding of the task regarding Hill 389." },
    { "id": "p_f_2a", "text": "Sunray, Sunray One-One." },
    { "id": "p_f_2b", "text": "My OpO states SECURE HILL 389." },
    { "id": "p_f_3a", "text": "If you have to fight to take possession," },
    { "id": "p_f_3b", "text": "the proper verb is SEIZE." },
    { "id": "p_f_4a", "text": "1 Platoon is to SEIZE HILL 389" },
    { "id": "p_f_4b", "text": "IOT deny enemy use of high ground." },
    { "id": "p_f_5a", "text": "Sunray One-Two is to DELAY the enemy advance along AXIS RED" },
    { "id": "p_f_5b", "text": "from H-Hour to H+4." },
    { "id": "p_f_6a", "text": "To prevent movement along a specific route, the verb is BLOCK." },
    { "id": "p_f_6b", "text": "I will BLOCK Route Tango." },
    { "id": "p_f_7a", "text": "Preventing withdrawal from an area is CONTAIN." },
    { "id": "p_f_7b", "text": "I am to CONTAIN the enemy in the village." },
    { "id": "p_f_8a", "text": "I will phrase it as CONDUCT CIMIC TASKS in Pueblo Verde" },
    { "id": "p_f_8b", "text": "IOT build relationship with local population." },
    { "id": "p_f_9a", "text": "NEUTRALIZE means temporarily incapable of function." },
    { "id": "p_f_9b", "text": "Use it wherever the effect is time-limited." },
    { "id": "p_f_10a", "text": "Task one: 2 Platoon is to SEIZE CHECKPOINT ALPHA NLT H+2" },
    { "id": "p_f_10b", "text": "IOT deny enemy use of the road junction." }
  ]
};

const SIMULATIONS =[
  {
    "id": "sim-verb-seize-secure",
    "title": "Clarifying the Correct Task Verb for a Contested Town",
    "description": "A platoon commander queries the OpO regarding whether the task is to take a town by force or to secure it against sabotage, requiring precise verb selection.",
    "roles": ["company_hq", "platoon_leader"],
    "script":[
      { "speaker": "company_hq", "text": "Sunray One-One, this is Sunray." },
      { "speaker": "company_hq", "text": "Confirm your understanding of the task regarding Hill 389." },
      { "speaker": "company_hq", "text": "What ATP-112 verb are you using, over?" },
      { "speaker": "platoon_leader", "text": "Sunray, Sunray One-One." },
      { "speaker": "platoon_leader", "text": "My OpO states 'SECURE HILL 389'." },
      { "speaker": "platoon_leader", "text": "But the town is currently defended by an enemy squad." },
      { "speaker": "platoon_leader", "text": "I need to attack to gain control." },
      { "speaker": "platoon_leader", "text": "That doesn't match SECURE, over." },
      { "speaker": "company_hq", "text": "Correct. SECURE is for preventing the loss or destruction of an area," },
      { "speaker": "company_hq", "text": "not for taking it from an enemy." },
      { "speaker": "company_hq", "text": "If you have to fight to take possession, the proper verb is SEIZE." },
      { "speaker": "company_hq", "text": "Acknowledge, over." },
      { "speaker": "platoon_leader", "text": "Understood. The correct verb is SEIZE." },
      { "speaker": "platoon_leader", "text": "My mission should read: 1 Platoon is to SEIZE HILL 389" },
      { "speaker": "platoon_leader", "text": "IOT deny enemy use of high ground." },
      { "speaker": "platoon_leader", "text": "Please confirm I should adjust my task, over." },
      { "speaker": "company_hq", "text": "Affirmative. Update your OpO to SEIZE HILL 389." },
      { "speaker": "company_hq", "text": "SECURE implies the enemy is not in control." },
      { "speaker": "company_hq", "text": "Keep that distinction in mind." },
      { "speaker": "company_hq", "text": "Report when the order is amended, over." },
      { "speaker": "platoon_leader", "text": "Wilco. Changing to SEIZE HILL 389." },
      { "speaker": "platoon_leader", "text": "I will brief my section commanders using the precise verb." },
      { "speaker": "platoon_leader", "text": "Sunray One-One out." }
    ]
  },
  {
    "id": "sim-mission-statement-delay",
    "title": "Issuing a 5-W Mission Statement for a Delay Operation",
    "description": "The Company Commander issues a delay order and a platoon commander must confirm that the mission statement contains all five Ws.",
    "roles": ["commander", "platoon_commander"],
    "script":[
      { "speaker": "commander", "text": "Sunray One-Two, this is Sunray." },
      { "speaker": "commander", "text": "FRAGO follows. Acknowledge ready to copy your mission, over." },
      { "speaker": "platoon_commander", "text": "Sunray, Sunray One-Two. Ready to copy, over." },
      { "speaker": "commander", "text": "Mission: Sunray One-Two is to DELAY the enemy advance along AXIS RED" },
      { "speaker": "commander", "text": "from H-Hour to H+4" },
      { "speaker": "commander", "text": "IOT allow the main body to consolidate at CHECKPOINT ZULU." },
      { "speaker": "commander", "text": "How copy, over?" },
      { "speaker": "platoon_commander", "text": "Copied. I confirm: WHO – Sunray One-Two; WHAT – DELAY;" },
      { "speaker": "platoon_commander", "text": "WHERE – AXIS RED; WHEN – H-Hour to H+4;" },
      { "speaker": "platoon_commander", "text": "WHY – allow main body consolidation." },
      { "speaker": "platoon_commander", "text": "All five Ws present. This mission is clear, over." },
      { "speaker": "commander", "text": "Very good. You are to trade space for time," },
      { "speaker": "commander", "text": "do not become decisively engaged." },
      { "speaker": "commander", "text": "Use the terrain to canalize. I have your acknowledgment." },
      { "speaker": "commander", "text": "Execute at H-Hour, over." },
      { "speaker": "platoon_commander", "text": "Wilco. Will DELAY along AXIS RED as ordered" },
      { "speaker": "platoon_commander", "text": "and report status every 30 minutes. Sunray One-Two out." }
    ]
  },
  {
    "id": "sim-verb-deny-block-fix",
    "title": "Precisely Assigning Shaping Tasks on the Objective",
    "description": "A commander issues tasks using DENY, BLOCK, and FIX. A junior officer must confirm that they understand the distinct tactical effects.",
    "roles":["commander", "junior_officer"],
    "script":[
      { "speaker": "commander", "text": "Echo One, this is Sunray. You have three shaping tasks." },
      { "speaker": "commander", "text": "First, prevent enemy reinforcement along Route Tango." },
      { "speaker": "commander", "text": "Use the correct verb, over." },
      { "speaker": "junior_officer", "text": "Sunray, Echo One. To prevent movement along a specific route," },
      { "speaker": "junior_officer", "text": "the verb is BLOCK. I will BLOCK Route Tango, over." },
      { "speaker": "commander", "text": "Correct. Second, prevent the enemy from withdrawing from the village." },
      { "speaker": "commander", "text": "They must not leave that area. Which verb, over?" },
      { "speaker": "junior_officer", "text": "Preventing withdrawal from an area is CONTAIN." },
      { "speaker": "junior_officer", "text": "I am to CONTAIN the enemy in the village." },
      { "speaker": "junior_officer", "text": "Third, stop the enemy from using the bridge as a supply route" },
      { "speaker": "junior_officer", "text": "without necessarily occupying it. That would be DENY, over." },
      { "speaker": "commander", "text": "Perfect. Your tasks are to BLOCK Route Tango," },
      { "speaker": "commander", "text": "CONTAIN the enemy in the village, and DENY the bridge." },
      { "speaker": "commander", "text": "Confirm you understand these are three different effects, over." },
      { "speaker": "junior_officer", "text": "Solid copy. Three distinct tasks with precise ATP-112 verbs." },
      { "speaker": "junior_officer", "text": "I will issue the orders with those terms. Echo One out." }
    ]
  },
  {
    "id": "sim-conduct-cimic",
    "title": "Tasking a Unit with Civil-Military Cooperation",
    "description": "The commander assigns a CIMIC task to a platoon leader, discussing why CONDUCT CIMIC TASKS is used instead of a single ATP-112 verb.",
    "roles":["commander", "platoon_leader"],
    "script":[
      { "speaker": "commander", "text": "Sunray One-Three, you have an additional task." },
      { "speaker": "commander", "text": "You are to conduct civil-military cooperation" },
      { "speaker": "commander", "text": "with village leaders in Pueblo Verde." },
      { "speaker": "commander", "text": "This is not a kinetic task. Acknowledge, over." },
      { "speaker": "platoon_leader", "text": "Sunray, Sunray One-Three. I understand. No NATO task verb covers this." },
      { "speaker": "platoon_leader", "text": "I will phrase it as 'CONDUCT CIMIC TASKS in Pueblo Verde" },
      { "speaker": "platoon_leader", "text": "IOT build relationship with local population.' Is that correct, over?" },
      { "speaker": "commander", "text": "Affirmative. There is no single verb like ENGAGE or ASSIST" },
      { "speaker": "commander", "text": "that captures CIMIC operations. CONDUCT + activity is the proper format." },
      { "speaker": "commander", "text": "Also, remember this is an enabling task, not a combat task. Questions, over?" },
      { "speaker": "platoon_leader", "text": "Understood. I will assign one section and the CIMIC team." },
      { "speaker": "platoon_leader", "text": "The mission statement will be: 3 Platoon is to CONDUCT CIMIC TASKS" },
      { "speaker": "platoon_leader", "text": "in PUEBLO VERDE IOT gain local support." },
      { "speaker": "platoon_leader", "text": "I will brief the team in 10, over." },
      { "speaker": "commander", "text": "Approved. Coordinate with the CIMIC officers." },
      { "speaker": "commander", "text": "Do not use military abbreviations when speaking with civilians." },
      { "speaker": "commander", "text": "Confirm completion NLT 1600Z, over." },
      { "speaker": "platoon_leader", "text": "Wilco. CONDUCT CIMIC TASKS; no abbreviations with civilians;" },
      { "speaker": "platoon_leader", "text": "report by 1600Z. Sunray One-Three out." }
    ]
  },
  {
    "id": "sim-destroy-vs-neutralize",
    "title": "Clarifying Temporary vs Permanent Effects on Enemy Radar",
    "description": "During a FRAGO update, a commander corrects a platoon leader who used DESTROY instead of NEUTRALIZE for a temporary suppression mission.",
    "roles":["commander", "platoon_leader"],
    "script":[
      { "speaker": "commander", "text": "Sunray One-Four, I have reviewed your fire support request." },
      { "speaker": "commander", "text": "You stated 'DESTROY enemy radar site at GR 4579.'" },
      { "speaker": "commander", "text": "But the intent is to silence it only during the assault" },
      { "speaker": "commander", "text": "— a 4-hour window. Is that correct, over?" },
      { "speaker": "platoon_leader", "text": "Sunray, Sunray One-Four. Yes, sir. We only need the radar inactive while we maneuver." },
      { "speaker": "platoon_leader", "text": "After the assault, it can become operational again." },
      { "speaker": "platoon_leader", "text": "Did I use the wrong verb, over?" },
      { "speaker": "commander", "text": "Affirmative. DESTROY means permanent, irreversible damage." },
      { "speaker": "commander", "text": "If the effect is temporary, the correct verb is NEUTRALIZE." },
      { "speaker": "commander", "text": "Change your fire support request to reflect that, over." },
      { "speaker": "platoon_leader", "text": "Understood. I will correct: '1 Platoon requests NEUTRALIZE" },
      { "speaker": "platoon_leader", "text": "enemy radar site at GR 4579 from H-30 to H+3" },
      { "speaker": "platoon_leader", "text": "IOT allow undetected approach.'" },
      { "speaker": "platoon_leader", "text": "Thank you for the correction." },
      { "speaker": "platoon_leader", "text": "I won't confuse permanent and temporary again, over." },
      { "speaker": "commander", "text": "Good. NEUTRALIZE means temporarily incapable of function." },
      { "speaker": "commander", "text": "Use it wherever the effect is time-limited." },
      { "speaker": "commander", "text": "Confirm you understand and will adjust all subsequent documents, over." },
      { "speaker": "platoon_leader", "text": "Wilco. NEUTRALIZE for temporary, DESTROY for permanent." },
      { "speaker": "platoon_leader", "text": "I will amend the request now. Sunray One-Four out." }
    ]
  },
  {
    "id": "sim-frago-multi-task",
    "title": "Issuing a Fragmentary Order with SEIZE, HOLD, and BPT WITHDRAW",
    "description": "The commander issues a FRAGO containing multiple tasks and a 'be prepared to' instruction, ensuring correct obligation verbs (is to, must, will) and capitalization.",
    "roles":["commander", "platoon_commander"],
    "script":[
      { "speaker": "commander", "text": "Sunray Two, this is Sunray. FRAGO to 2 Platoon. Break." },
      { "speaker": "commander", "text": "Task one: 2 Platoon is to SEIZE CHECKPOINT ALPHA NLT H+2" },
      { "speaker": "commander", "text": "IOT deny enemy use of the road junction." },
      { "speaker": "commander", "text": "Task two: You must camouflage all vehicles before first light." },
      { "speaker": "commander", "text": "Task three: You will be prepared to WITHDRAW on my order" },
      { "speaker": "commander", "text": "if the main attack fails. Acknowledge, over." },
      { "speaker": "platoon_commander", "text": "Sunray, Sunray Two. Copied." },
      { "speaker": "platoon_commander", "text": "We are to SEIZE CHECKPOINT ALPHA — obligation verb 'is to'." },
      { "speaker": "platoon_commander", "text": "We must camouflage vehicles — 'must' for critical constraint." },
      { "speaker": "platoon_commander", "text": "And we will be prepared to WITHDRAW" },
      { "speaker": "platoon_commander", "text": "— 'will' for a future contingency," },
      { "speaker": "platoon_commander", "text": "with BPT for the secondary task. All verbs correct, over." },
      { "speaker": "commander", "text": "Exactly. Note: 'will be prepared to' is correct for a contingency task;" },
      { "speaker": "commander", "text": "the primary task always uses 'is to'." },
      { "speaker": "commander", "text": "Also, you used CHECKPOINT ALPHA in capitals, which is correct." },
      { "speaker": "commander", "text": "Do you have any questions about the distinction, over?" },
      { "speaker": "platoon_commander", "text": "All clear. I will brief the platoon using the same verb discipline." },
      { "speaker": "platoon_commander", "text": "2 Platoon will execute as ordered. Sunray Two out." }
    ]
  }
];

// ============================================================================
// CORE UTILITIES (GOLD STANDARDS)
// ============================================================================

function toSlug(text) {
    if (!text) return "";
    return text.toString().toLowerCase()
        .replace(/['\-]/g, '')          // Removes apostrophes AND hyphens entirely ("don't" -> "dont", "R-T-O" -> "rto")
        .replace(/[^a-z0-9\s]/g, ' ')   // Replaces other special characters with spaces
        .replace(/\s+/g, ' ')           // Collapses multiple consecutive spaces into one single space
        .trim()                         // Trims leading/trailing whitespace
        .split(' ')                     // Splits by single space
        .slice(0, 7)                    // Max 7 words
        .join('_');                     // Re-joins with underscores
}

function loadResilientImage(imgElement, baseName) {
    const formats =['.webp', '.png', '.jpg', '.jpeg'];
    let currentFormatIndex = 0;

    imgElement.onerror = () => {
        currentFormatIndex++;
        if (currentFormatIndex < formats.length) {
            imgElement.src = `assets/${baseName}${formats[currentFormatIndex]}`;
        } else {
            imgElement.style.display = 'none'; // Failsafe
            console.warn(`All image formats failed for asset: ${baseName}`);
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
// INITIALISATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  calculateTotalItems();
  
  renderVocab();
  
  // Restore exercise checkbox states (if needed for custom logic, though l11 u3 exercises are static HTML in this script logic)
  ['ex1','ex2','ex3','ex4','ex5'].forEach(id => {
    const cb = document.getElementById(id + '-cb');
    if (cb) cb.checked = knownItems.has(id);
  });

  setupModeSwitching();
  setupStudyTabs();
  setupPracticeTabs();
  setupGlobalControls();
  setupMicGate();
  
  updateProgressUI();
});

function calculateTotalItems() {
  const vocabCount = CONTENT.vocab.length;
  const funcCount = PRACTICE.func ? PRACTICE.func.length : 0;
  // 5 interactive exercises (ex1 through ex5) in l11 u3
  const trackableGroups = 5; 
  const simCount = SIMULATIONS.length;
  TOTAL_ITEMS = vocabCount + funcCount + trackableGroups + simCount;
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
    if (!groups[item.group]) groups[item.group] = [];
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
          ${items.map(item => {
            const slug = toSlug(item.en);
            const isKnown = knownItems.has(item.id);
            const hasImage = AVAILABLE_IMAGES.includes(slug);
            const audioBtnHtml = `<button class="audio-btn" onclick="playFallbackAudio('${item.en.replace(/'/g, "\\'")}', null, this)" title="Listen"><i class="fas fa-volume-up"></i></button>`;
            
            const imgBtnHtml = hasImage ? `<button class="audio-btn image-toggle-btn" id="img-btn-${item.id}" style="display: none;" onclick="toggleVocabImage(this, '${item.id}', '${slug}')" title="Toggle Image"><i class="fas fa-image"></i></button>` : '';
            const imgContHtml = hasImage ? `<div class="item-image-container" id="img-cont-${item.id}" style="display: none; text-align: center; margin-top: 10px; margin-bottom: 5px;">
                <img id="img-${item.id}" style="max-height: 200px; max-width: 100%;" onload="const b = document.getElementById('img-btn-${item.id}'); if(b) b.style.display='inline-flex';">
              </div>` : '';

            return `
            <div class="item-row-wrap" data-id="${item.id}">
              <div class="item-row">
                <div class="item-en">${item.en}</div>
                <div class="item-es">${item.es}</div>
                <div class="item-controls">
                  ${imgBtnHtml}
                  ${audioBtnHtml}
                  <label class="know-checkbox">
                    <input type="checkbox" class="know-cb" 
                           ${isKnown ? 'checked' : ''}
                           onchange="toggleItem('${item.id}', this.checked)">
                    <span class="know-label">Verified</span>
                  </label>
                </div>
              </div>
              ${imgContHtml}
            </div>
          `}).join('')}
        </div>
        <div class="accordion-footer">
          <span style="font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase;">Mark section verified:</span>
          <input type="checkbox" class="know-cb group-toggle-cb" 
                 ${items.every(i => knownItems.has(i.id)) ? 'checked' : ''}>
        </div>
      </div>
    `;
    const groupCb = acc.querySelector('.group-toggle-cb');
    groupCb.addEventListener('change', function() {
      toggleVocabGroup(groupName, this.checked);
    });
    container.appendChild(acc);
    
    // Initialize image loading for each item in this group
    items.forEach(item => {
      const imgElement = document.getElementById(`img-${item.id}`);
      if (imgElement) {
        const slug = toSlug(item.en);
        loadResilientImage(imgElement, slug);
      }
    });
  }
}

// (renderFunctionsTab and renderFormatsTab are not used in l11 u3 as per user snippet, omitted or can be kept empty if not needed)
function renderFunctionsTab() {}
function renderFormatsTab() {}

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
  
  // ANTI-CHEAT: Stop audio and lock
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
      addMasteredPhrase(target); // Uses text for masteredPhrases tracking in L11
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
    renderSystemLine(line); 
    playFallbackAudio(line.text, () => { simState.turnIndex++; setTimeout(processNextTurn, 500); });
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
  bubble.innerHTML = `<div class="bubble-avatar avatar-user"><i class="fas fa-user-astronaut"></i></div><div class="bubble-content"><div class="bubble-say-label">Transmission required: <button class="btn btn-ghost btn-sm" onclick="playHint('${line.text.replace(/'/g, "\\'")}')"><i class="fas fa-volume-up"></i> Decode</button></div><div class="bubble-text">${line.text}</div><div class="turn-feedback" id="feedback-${simState.turnIndex}"></div></div>`;
  area.appendChild(bubble); area.scrollTop = area.scrollHeight;
}

function playHint(text) {
  const btn = document.getElementById('sim-record-btn');
  if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; btn.querySelector('span').textContent = "Decoding..."; }
  playFallbackAudio(text, () => {
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.querySelector('span').textContent = "Transmit"; }
  });
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
  if (!SpeechRec) return alert("Speech recognition not supported");
  const btn = document.getElementById('sim-record-btn');
  
  if (btn.classList.contains('recording')) {
    if (recognition) { try { recognition.stop(); } catch(e){} }
    btn.classList.remove('recording');
    btn.querySelector('span').textContent = "Transmit";
    isListening = false;
    return;
  }
  
  if (recognition) { try { recognition.abort(); } catch(e){} }
  
  // ANTI CHEAT
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
  // Calculate final score purely based on lines perfectly transmitted
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

// ═══════════════════════════════════════════
// EXERCISE HELPER FUNCTIONS (Static for L11 U3)
// ═══════════════════════════════════════════

function switchTab(id, btn) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
}

// Add event listeners to options
document.querySelectorAll('.ex-option').forEach(opt => {
    opt.addEventListener('click', function () {
        const parent = this.parentElement;
        if (!parent.classList.contains('multi-select')) {
            parent.querySelectorAll('.ex-option').forEach(o => o.classList.remove('selected'));
        }
        this.classList.toggle('selected');
    });
});

function getSelectedOption(container) {
    const selected = container.querySelector('.ex-option.selected');
    return selected ? selected.getAttribute('data-value') : null;
}

function highlightItem(itemEl, isCorrect) {
    itemEl.classList.remove('correct-highlight', 'incorrect-highlight');
    itemEl.classList.add(isCorrect ? 'correct-highlight' : 'incorrect-highlight');
}

function highlightOptions(container, correctValue, selectedValue) {
    container.querySelectorAll('.ex-option').forEach(opt => {
        opt.classList.remove('correct-reveal', 'incorrect-reveal');
        const val = opt.getAttribute('data-value');
        if (val === correctValue) {
            opt.classList.add('correct-reveal');
        } else if (val === selectedValue && selectedValue !== correctValue) {
            opt.classList.add('incorrect-reveal');
        }
    });
}

function highlightSelect(selectEl, correctValue) {
    selectEl.classList.remove('correct-reveal', 'incorrect-reveal');
    if (selectEl.value === correctValue) {
        selectEl.classList.add('correct-reveal');
    } else {
        selectEl.classList.add('incorrect-reveal');
    }
}

function updateExerciseCard(cardId, score, total) {
    const card = document.getElementById(cardId);
    if(!card) return;
    card.classList.remove('exercise-correct', 'exercise-partial', 'exercise-incorrect', 'exercise-unanswered');
    if (score === total) {
        card.classList.add('exercise-correct');
    } else if (score > 0) {
        card.classList.add('exercise-partial');
    } else {
        card.classList.add('exercise-incorrect');
    }
}


// ═══════════════════════════════════════════
// EXERCISE 1
// ═══════════════════════════════════════════
const ex1Answers = { 1: 'SEIZE', 2: 'DENY', 3: 'DEFEAT', 4: 'CLEAR', 5: 'SCREEN', 6: 'NEUTRALIZE' };
const ex1Explanations = {
    1: 'SEIZE = take possession of a designated area <strong>by force</strong>. The bridge is held by enemy forces — you must fight to take it. CAPTURE is for personnel/equipment, not terrain. OCCUPY implies no armed opposition. SECURE focuses on preventing use/destruction, not the act of taking.',
    2: 'DENY = prevent enemy <strong>use</strong> of an area, route, or facility without necessarily occupying it. The scenario explicitly says you do not need to physically occupy the pass. BLOCK is narrower (a specific route). CONTAIN prevents withdrawal, not use.',
    3: 'DEFEAT = render enemy <strong>unable or unwilling</strong> to resist. The scenario describes multiple possible effects (destruction, neutralization, forced withdrawal) — DEFEAT is the broader term that encompasses all of these. DESTROY is only physical damage.',
    4: 'CLEAR = <strong>eliminate all enemy forces</strong> from a designated area and confirm it is free of hostiles. The scenario specifies eliminating all enemy presence and confirming the area is clear. SEIZE is about taking control, not necessarily eliminating all enemy.',
    5: 'SCREEN = provide <strong>early warning</strong> through surveillance without becoming decisively engaged. The scenario specifies observe and report without engagement. GUARD and COVER involve active protection. DELAY involves trading space for time.',
    6: 'NEUTRALIZE = render <strong>temporarily incapable</strong> of performing its function. The scenario specifies a 4-hour window — after which systems may become operational again. DESTROY is permanent. DISRUPT is less complete.'
};

window.checkExercise1 = () => {
    let score = 0; const total = 6; const feedbackEl = document.getElementById('ex1-feedback'); let feedbackHTML = '';
    for (let q = 1; q <= total; q++) {
        const itemEl = document.getElementById('ex1-q' + q);
        if(!itemEl) continue;
        const optionsContainer = itemEl.querySelector('.ex-options');
        const selectedValue = getSelectedOption(optionsContainer);
        const correctValue = ex1Answers[q];
        if (selectedValue === correctValue) { score++; highlightItem(itemEl, true); } else { highlightItem(itemEl, false); }
        highlightOptions(optionsContainer, correctValue, selectedValue);
        if (selectedValue !== correctValue) { feedbackHTML += '<p><strong>Q' + q + ':</strong> ' + ex1Explanations[q] + '</p>'; }
    }
    if (score === total) {
        feedbackHTML = '<p><strong>✓ Perfect! ' + score + '/' + total + ' correct.</strong> You have demonstrated strong understanding of ATP-112 verb selection based on tactical effect.</p>' + feedbackHTML;
        feedbackEl.className = 'ex-feedback show fb-correct'; toggleItem('ex1', true);
    } else if (score >= 3) {
        feedbackHTML = '<p><strong>△ ' + score + '/' + total + ' correct.</strong> Good effort. Review the distinctions below:</p>' + feedbackHTML;
        feedbackEl.className = 'ex-feedback show fb-partial';
    } else {
        feedbackHTML = '<p><strong>✗ ' + score + '/' + total + ' correct.</strong> Review the critical differentiations in the Vocabulary section and try again.</p>' + feedbackHTML;
        feedbackEl.className = 'ex-feedback show fb-incorrect';
    }
    feedbackEl.innerHTML = feedbackHTML; updateExerciseCard('ex1-card', score, total);
};

window.resetExercise1 = () => {
    for (let q = 1; q <= 6; q++) {
        const itemEl = document.getElementById('ex1-q' + q);
        if(!itemEl) continue;
        itemEl.classList.remove('correct-highlight', 'incorrect-highlight');
        const optionsContainer = itemEl.querySelector('.ex-options');
        optionsContainer.querySelectorAll('.ex-option').forEach(opt => { opt.classList.remove('selected', 'correct-reveal', 'incorrect-reveal'); });
    }
    const feedbackEl = document.getElementById('ex1-feedback');
    if(feedbackEl){ feedbackEl.innerHTML = ''; feedbackEl.className = 'ex-feedback'; }
    const c=document.getElementById('ex1-card'); if(c){c.classList.remove('exercise-correct', 'exercise-partial', 'exercise-incorrect'); c.classList.add('exercise-unanswered');}
};

window.showExercise1Answers = () => {
    for (let q = 1; q <= 6; q++) {
        const itemEl = document.getElementById('ex1-q' + q);
        if(!itemEl) continue;
        const optionsContainer = itemEl.querySelector('.ex-options');
        optionsContainer.querySelectorAll('.ex-option').forEach(opt => {
            opt.classList.remove('selected');
            if (opt.getAttribute('data-value') === ex1Answers[q]) { opt.classList.add('correct-reveal'); }
        });
        highlightItem(itemEl, true);
    }
    const feedbackEl = document.getElementById('ex1-feedback');
    if(feedbackEl){ feedbackEl.innerHTML = '<p><strong>Answers revealed.</strong> Study the explanations and reset to try again.</p>'; feedbackEl.className = 'ex-feedback show fb-info';}
};

// ═══════════════════════════════════════════
// EXERCISE 2
// ═══════════════════════════════════════════
const ex2Answers = {
    '2-1': { who: 'A COY', verb: 'SEIZE', object: 'HILL 247', purpose: 'allow the battalion main body to advance along AXIS SIERRA' },
    '2-2': { who: 'B COY', verb: 'DENY', object: 'EAGLE BRIDGE', purpose: 'set conditions for the encirclement of En forces in GRID SQUARE 4578' },
    '2-3': { who: 'RECCE PL', verb: 'SCREEN', object: 'the eastern approach', purpose: 'protect the main body\'s flank during movement' },
    '2-4': { who: '3 PL', verb: 'DESTROY', object: 'the En communications node IVO GRID 456789', purpose: 'degrade En command and control capability' }
};

window.checkExercise2 = () => {
    let score = 0; const totalItems = 4; const totalFields = 16; let correctFields = 0;
    const feedbackEl = document.getElementById('ex2-feedback'); let feedbackHTML = ''; const itemScores = {};
    for (let q = 1; q <= totalItems; q++) {
        const qKey = '2-' + q; const itemEl = document.getElementById('ex2-q' + q);
        if(!itemEl) continue;
        const selects = itemEl.querySelectorAll('.ex-select'); let itemCorrect = true;
        selects.forEach(select => {
            const field = select.getAttribute('data-field'); const correctVal = ex2Answers[qKey][field];
            if (select.value === correctVal) { correctFields++; select.classList.add('correct-reveal'); select.classList.remove('incorrect-reveal'); } 
            else { itemCorrect = false; select.classList.add('incorrect-reveal'); select.classList.remove('correct-reveal'); }
        });
        if (itemCorrect) { score++; highlightItem(itemEl, true); } else { highlightItem(itemEl, false); }
        itemScores[q] = itemCorrect;
    }
    if (score === totalItems) {
        feedbackHTML = '<p><strong>✓ Perfect! ' + score + '/' + totalItems + ' statements correct (' + correctFields + '/' + totalFields + ' fields).</strong> You can construct complete mission statements following the NATO formula.</p>';
        feedbackEl.className = 'ex-feedback show fb-correct'; toggleItem('ex2', true);
    } else if (score >= 2) {
        feedbackHTML = '<p><strong>△ ' + score + '/' + totalItems + ' statements correct (' + correctFields + '/' + totalFields + ' fields).</strong> Check the statements with errors:</p>';
        for (let q = 1; q <= totalItems; q++) { if (!itemScores[q]) { const qKey = '2-' + q; feedbackHTML += '<p><strong>Q' + q + ' correct answer:</strong> ' + ex2Answers[qKey].who + ' is to ' + ex2Answers[qKey].verb + ' ' + ex2Answers[qKey].object + ' IOT ' + ex2Answers[qKey].purpose + '.</p>'; } }
        feedbackEl.className = 'ex-feedback show fb-partial';
    } else {
        feedbackHTML = '<p><strong>✗ ' + score + '/' + totalItems + ' statements correct.</strong> Review the mission statement formula and try again.</p>';
        for (let q = 1; q <= totalItems; q++) { const qKey = '2-' + q; feedbackHTML += '<p><strong>Q' + q + ' correct answer:</strong> ' + ex2Answers[qKey].who + ' is to ' + ex2Answers[qKey].verb + ' ' + ex2Answers[qKey].object + ' IOT ' + ex2Answers[qKey].purpose + '.</p>'; }
        feedbackEl.className = 'ex-feedback show fb-incorrect';
    }
    feedbackEl.innerHTML = feedbackHTML; updateExerciseCard('ex2-card', score, totalItems);
};

window.resetExercise2 = () => {
    for (let q = 1; q <= 4; q++) {
        const itemEl = document.getElementById('ex2-q' + q);
        if(!itemEl) continue;
        itemEl.classList.remove('correct-highlight', 'incorrect-highlight');
        const selects = itemEl.querySelectorAll('.ex-select');
        selects.forEach(select => { select.value = ''; select.classList.remove('correct-reveal', 'incorrect-reveal'); });
    }
    const feedbackEl = document.getElementById('ex2-feedback');
    if(feedbackEl){ feedbackEl.innerHTML = ''; feedbackEl.className = 'ex-feedback'; }
    const c=document.getElementById('ex2-card'); if(c){c.classList.remove('exercise-correct', 'exercise-partial', 'exercise-incorrect'); c.classList.add('exercise-unanswered');}
};

window.showExercise2Answers = () => {
    for (let q = 1; q <= 4; q++) {
        const qKey = '2-' + q; const itemEl = document.getElementById('ex2-q' + q);
        if(!itemEl) continue;
        itemEl.classList.remove('correct-highlight', 'incorrect-highlight'); itemEl.classList.add('correct-highlight');
        const selects = itemEl.querySelectorAll('.ex-select');
        selects.forEach(select => { const field = select.getAttribute('data-field'); select.value = ex2Answers[qKey][field]; select.classList.remove('incorrect-reveal'); select.classList.add('correct-reveal'); });
    }
    const feedbackEl = document.getElementById('ex2-feedback');
    if(feedbackEl){ feedbackEl.innerHTML = '<p><strong>Answers revealed.</strong> Study the correct statements and reset to try again.</p>'; feedbackEl.className = 'ex-feedback show fb-info'; }
};

// ═══════════════════════════════════════════
// EXERCISE 3
// ═══════════════════════════════════════════
const ex3Answers = { '3-1': 'SECURE', '3-2': 'BLOCK', '3-3': 'CONTAIN', '3-4': 'DELAY', '3-5': 'DEFEAT' };
const ex3Explanations = {
    '3-1': '<strong>SECURE</strong> = gain control to <strong>prevent use or destruction</strong>. The depot is unoccupied but rigged with explosives — the key concern is preventing its destruction, not taking it by force (no enemy present). SEIZE implies fighting to take control.',
    '3-2': '<strong>BLOCK</strong> = stop movement along a <strong>specific route</strong>. The scenario specifies stopping movement along ROUTE TANGO specifically. DENY is broader (use of an area). FIX means preventing all movement from their current position.',
    '3-3': '<strong>CONTAIN</strong> = stop enemy from <strong>withdrawing or maneuvering</strong> beyond a designated area. The scenario specifies preventing the enemy from leaving their area to join the main body. ISOLATE means cutting them off from support, not just preventing withdrawal.',
    '3-4': '<strong>DELAY</strong> = slow enemy advance while <strong>trading space for time</strong> without decisive engagement. The scenario specifies a 6-hour period of slowing advancement. DISRUPT is about breaking up and making ineffective, not necessarily slowing over time.',
    '3-5': '<strong>DEFEAT</strong> = render <strong>unable or unwilling</strong> to resist. The scenario describes multiple possible methods (destroying key units, forcing withdrawal, breaking cohesion). DEFEAT is the broader term. DESTROY only covers physical damage.'
};

window.checkExercise3 = () => {
    let score = 0; const total = 5; const feedbackEl = document.getElementById('ex3-feedback'); let feedbackHTML = '';
    for (let q = 1; q <= total; q++) {
        const qKey = '3-' + q; const itemEl = document.getElementById('ex3-q' + q);
        if(!itemEl) continue;
        const optionsContainer = itemEl.querySelector('.ex-options'); const selectedValue = getSelectedOption(optionsContainer); const correctValue = ex3Answers[qKey];
        if (selectedValue === correctValue) { score++; highlightItem(itemEl, true); } else { highlightItem(itemEl, false); }
        highlightOptions(optionsContainer, correctValue, selectedValue);
        if (selectedValue !== correctValue) { feedbackHTML += '<p>' + ex3Explanations[qKey] + '</p>'; }
    }
    if (score === total) {
        feedbackHTML = '<p><strong>✓ Perfect! ' + score + '/' + total + ' correct.</strong> You can precisely distinguish between similar NATO task verbs.</p>' + feedbackHTML;
        feedbackEl.className = 'ex-feedback show fb-correct'; toggleItem('ex3', true);
    } else if (score >= 3) {
        feedbackHTML = '<p><strong>△ ' + score + '/' + total + ' correct.</strong> Good. Review the distinctions below:</p>' + feedbackHTML;
        feedbackEl.className = 'ex-feedback show fb-partial';
    } else {
        feedbackHTML = '<p><strong>✗ ' + score + '/' + total + ' correct.</strong> Study the critical differentiations table in the Vocabulary section.</p>' + feedbackHTML;
        feedbackEl.className = 'ex-feedback show fb-incorrect';
    }
    feedbackEl.innerHTML = feedbackHTML; updateExerciseCard('ex3-card', score, total);
};

window.resetExercise3 = () => {
    for (let q = 1; q <= 5; q++) {
        const itemEl = document.getElementById('ex3-q' + q);
        if(!itemEl) continue;
        itemEl.classList.remove('correct-highlight', 'incorrect-highlight');
        const optionsContainer = itemEl.querySelector('.ex-options');
        optionsContainer.querySelectorAll('.ex-option').forEach(opt => { opt.classList.remove('selected', 'correct-reveal', 'incorrect-reveal'); });
    }
    const feedbackEl = document.getElementById('ex3-feedback');
    if(feedbackEl){ feedbackEl.innerHTML = ''; feedbackEl.className = 'ex-feedback';}
    const c=document.getElementById('ex3-card'); if(c){c.classList.remove('exercise-correct', 'exercise-partial', 'exercise-incorrect'); c.classList.add('exercise-unanswered');}
};

window.showExercise3Answers = () => {
    for (let q = 1; q <= 5; q++) {
        const qKey = '3-' + q; const itemEl = document.getElementById('ex3-q' + q);
        if(!itemEl) continue;
        const optionsContainer = itemEl.querySelector('.ex-options');
        optionsContainer.querySelectorAll('.ex-option').forEach(opt => { opt.classList.remove('selected'); if (opt.getAttribute('data-value') === ex3Answers[qKey]) { opt.classList.add('correct-reveal'); } });
        highlightItem(itemEl, true);
    }
    const feedbackEl = document.getElementById('ex3-feedback');
    if(feedbackEl){ feedbackEl.innerHTML = '<p><strong>Answers revealed.</strong> Study the distinctions and reset to try again.</p>'; feedbackEl.className = 'ex-feedback show fb-info'; }
};

// ═══════════════════════════════════════════
// EXERCISE 4 
// ═══════════════════════════════════════════
const ex4VerbAnswers = { '4-1': 'SEIZE', '4-2': 'SCREEN', '4-3': 'DENY', '4-4': 'DEFEAT' };
const ex4StatementAnswers = {
    '4-1b': 'B COY is to SEIZE EAGLE BRIDGE IOT prevent En use as an escape route.',
    '4-2b': 'RECCE PL is to SCREEN the eastern flank IOT provide early warning and protect the main body\'s advance.',
    '4-3b': 'C COY is to DENY the mountain pass IOT prevent En resupply operations.',
    '4-4b': '3 BN is to DEFEAT En forces in the northern sector IOT allow FF freedom of maneuver.'
};

window.checkExercise4 = () => {
    let score = 0; const total = 4; const feedbackEl = document.getElementById('ex4-feedback'); let feedbackHTML = '';
    const questionKeys =['4-1', '4-2', '4-3', '4-4']; const statementKeys =['4-1b', '4-2b', '4-3b', '4-4b']; const qNums = [1, 2, 3, 4];
    for (let i = 0; i < total; i++) {
        const qNum = qNums[i]; const qKey = questionKeys[i]; const sKey = statementKeys[i]; const itemEl = document.getElementById('ex4-q' + qNum);
        if(!itemEl) continue;
        let itemCorrect = true;
        const verbSelect = itemEl.querySelector('.ex-select[data-field="verb"]'); const correctVerb = ex4VerbAnswers[qKey];
        if (verbSelect.value === correctVerb) { verbSelect.classList.add('correct-reveal'); verbSelect.classList.remove('incorrect-reveal'); } 
        else { itemCorrect = false; verbSelect.classList.add('incorrect-reveal'); verbSelect.classList.remove('correct-reveal'); }
        const optionsContainer = itemEl.querySelector('.ex-options'); const selectedStatement = getSelectedOption(optionsContainer); const correctStatement = ex4StatementAnswers[sKey];
        if (selectedStatement !== correctStatement) { itemCorrect = false; }
        highlightOptions(optionsContainer, correctStatement, selectedStatement);
        if (itemCorrect) { score++; highlightItem(itemEl, true); } else { highlightItem(itemEl, false); }
    }
    if (score === total) {
        feedbackHTML = '<p><strong>✓ Perfect! ' + score + '/' + total + ' correct.</strong> You can translate Spanish tactical intent into precise NATO English mission statements.</p>';
        feedbackEl.className = 'ex-feedback show fb-correct'; toggleItem('ex4', true);
    } else if (score >= 2) {
        feedbackHTML = '<p><strong>△ ' + score + '/' + total + ' correct.</strong> Remember: identify the tactical effect first, then select the ATP-112 verb. Do not translate literally.</p>';
        feedbackEl.className = 'ex-feedback show fb-partial';
    } else {
        feedbackHTML = '<p><strong>✗ ' + score + '/' + total + ' correct.</strong> Key principle: Spanish verbs do not map 1:1 to NATO task verbs. Identify the <em>tactical effect</em> in English first, then select the verb.</p>';
        feedbackEl.className = 'ex-feedback show fb-incorrect';
    }
    feedbackEl.innerHTML = feedbackHTML; updateExerciseCard('ex4-card', score, total);
};

window.resetExercise4 = () => {
    for (let q = 1; q <= 4; q++) {
        const itemEl = document.getElementById('ex4-q' + q);
        if(!itemEl) continue;
        itemEl.classList.remove('correct-highlight', 'incorrect-highlight');
        const selects = itemEl.querySelectorAll('.ex-select'); selects.forEach(select => { select.value = ''; select.classList.remove('correct-reveal', 'incorrect-reveal'); });
        const optionsContainers = itemEl.querySelectorAll('.ex-options'); optionsContainers.forEach(oc => { oc.querySelectorAll('.ex-option').forEach(opt => { opt.classList.remove('selected', 'correct-reveal', 'incorrect-reveal'); }); });
    }
    const feedbackEl = document.getElementById('ex4-feedback');
    if(feedbackEl){ feedbackEl.innerHTML = ''; feedbackEl.className = 'ex-feedback'; }
    const c=document.getElementById('ex4-card'); if(c){c.classList.remove('exercise-correct', 'exercise-partial', 'exercise-incorrect'); c.classList.add('exercise-unanswered');}
};

window.showExercise4Answers = () => {
    const questionKeys =['4-1', '4-2', '4-3', '4-4']; const statementKeys =['4-1b', '4-2b', '4-3b', '4-4b']; const qNums = [1, 2, 3, 4];
    for (let i = 0; i < 4; i++) {
        const qNum = qNums[i]; const qKey = questionKeys[i]; const sKey = statementKeys[i]; const itemEl = document.getElementById('ex4-q' + qNum);
        if(!itemEl) continue;
        itemEl.classList.remove('correct-highlight', 'incorrect-highlight'); itemEl.classList.add('correct-highlight');
        const verbSelect = itemEl.querySelector('.ex-select[data-field="verb"]'); verbSelect.value = ex4VerbAnswers[qKey]; verbSelect.classList.remove('incorrect-reveal'); verbSelect.classList.add('correct-reveal');
        const optionsContainer = itemEl.querySelector('.ex-options'); optionsContainer.querySelectorAll('.ex-option').forEach(opt => { opt.classList.remove('selected', 'incorrect-reveal'); if (opt.getAttribute('data-value') === ex4StatementAnswers[sKey]) { opt.classList.add('correct-reveal'); } });
    }
    const feedbackEl = document.getElementById('ex4-feedback');
    if(feedbackEl){ feedbackEl.innerHTML = '<p><strong>Answers revealed.</strong> Study the correct verb-effect mapping and reset to try again.</p>'; feedbackEl.className = 'ex-feedback show fb-info'; }
};

// ═══════════════════════════════════════════
// EXERCISE 5 
// ═══════════════════════════════════════════
const ex5Answers = { '5-1': 'CONDUCT', '5-2': 'CONDUCT', '5-3': 'DIRECT', '5-4': 'CONDUCT', '5-5': 'CONDUCT' };
const ex5Explanations = {
    '5-1': '<strong>CONDUCT INFO OPS</strong> — There is no single ATP-112 task verb for information operations. INFLUENCE is not a NATO task verb. Use CONDUCT + activity.',
    '5-2': '<strong>CONDUCT SAR</strong> — While RECOVER exists for retrieving personnel or matériel, Search and Rescue (SAR) is a specific operation type that combines locating, securing, and extracting. CONDUCT SAR is the standard phrasing in NATO orders for this specialized operation.',
    '5-3': '<strong>SEIZE</strong> — A direct ATP-112 verb exists. SEIZE means "take possession of a designated area by force." Never use CONDUCT SEIZURE when SEIZE is available.',
    '5-4': '<strong>CONDUCT CIMIC TASKS</strong> — Civil-Military Cooperation tasks have no single NATO task verb. ENGAGE is not an ATP-112 task verb in this context. Use CONDUCT + activity.',
    '5-5': '<strong>CONDUCT CORDON</strong> — A cordon combines elements of CONTAIN (preventing withdrawal) and SCREEN (observation) but no single ATP-112 verb covers establishing a security cordon around an area. CONTAIN alone does not capture the full effect.'
};

window.checkExercise5 = () => {
    let score = 0; const total = 5; const feedbackEl = document.getElementById('ex5-feedback'); let feedbackHTML = '';
    for (let q = 1; q <= total; q++) {
        const qKey = '5-' + q; const itemEl = document.getElementById('ex5-q' + q);
        if(!itemEl) continue;
        const optionsContainer = itemEl.querySelector('.ex-options'); const selectedValue = getSelectedOption(optionsContainer); const correctValue = ex5Answers[qKey];
        if (selectedValue === correctValue) { score++; highlightItem(itemEl, true); } else { highlightItem(itemEl, false); }
        highlightOptions(optionsContainer, correctValue, selectedValue);
        if (selectedValue !== correctValue) { feedbackHTML += '<p>' + ex5Explanations[qKey] + '</p>'; }
    }
    if (score === total) {
        feedbackHTML = '<p><strong>✓ Perfect! ' + score + '/' + total + ' correct.</strong> You understand when to use CONDUCT + activity vs a direct NATO verb.</p>' + feedbackHTML;
        feedbackEl.className = 'ex-feedback show fb-correct'; toggleItem('ex5', true);
    } else if (score >= 3) {
        feedbackHTML = '<p><strong>△ ' + score + '/' + total + ' correct.</strong> Good. Review the CONDUCT rules below:</p>' + feedbackHTML;
        feedbackEl.className = 'ex-feedback show fb-partial';
    } else {
        feedbackHTML = '<p><strong>✗ ' + score + '/' + total + ' correct.</strong> Key rule: if an ATP-112 verb exists, use it. Only use CONDUCT when no NATO verb matches the tactical effect.</p>' + feedbackHTML;
        feedbackEl.className = 'ex-feedback show fb-incorrect';
    }
    feedbackEl.innerHTML = feedbackHTML; updateExerciseCard('ex5-card', score, total);
};

window.resetExercise5 = () => {
    for (let q = 1; q <= 5; q++) {
        const itemEl = document.getElementById('ex5-q' + q);
        if(!itemEl) continue;
        itemEl.classList.remove('correct-highlight', 'incorrect-highlight');
        const optionsContainer = itemEl.querySelector('.ex-options'); optionsContainer.querySelectorAll('.ex-option').forEach(opt => { opt.classList.remove('selected', 'correct-reveal', 'incorrect-reveal'); });
    }
    const feedbackEl = document.getElementById('ex5-feedback');
    if(feedbackEl){ feedbackEl.innerHTML = ''; feedbackEl.className = 'ex-feedback'; }
    const c=document.getElementById('ex5-card'); if(c){c.classList.remove('exercise-correct', 'exercise-partial', 'exercise-incorrect'); c.classList.add('exercise-unanswered');}
};

window.showExercise5Answers = () => {
    for (let q = 1; q <= 5; q++) {
        const qKey = '5-' + q; const itemEl = document.getElementById('ex5-q' + q);
        if(!itemEl) continue;
        const optionsContainer = itemEl.querySelector('.ex-options');
        optionsContainer.querySelectorAll('.ex-option').forEach(opt => { opt.classList.remove('selected'); if (opt.getAttribute('data-value') === ex5Answers[qKey]) { opt.classList.add('correct-reveal'); } });
        highlightItem(itemEl, true);
    }
    const feedbackEl = document.getElementById('ex5-feedback');
    if(feedbackEl){ feedbackEl.innerHTML = '<p><strong>Answers revealed.</strong> Study the CONDUCT rules and reset to try again.</p>'; feedbackEl.className = 'ex-feedback show fb-info'; }
};