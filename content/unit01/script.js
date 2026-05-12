// --- 1. STATE & TRACKING ---
'use strict';

const STORAGE_KEY = 'military_l11_u1_known';
const P_KEY = 'military_l11_u1_practice';
const PASS_THRESHOLD = 0.70;

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

const CONTENT = {
  vocab:[
    { id: 'v1', group: 'Military Writing Style — Core Concepts', en: 'BLUF', es: 'Bottom Line Up Front — el punto principal va primero' },
    { id: 'v2', group: 'Military Writing Style — Core Concepts', en: 'Active voice', es: 'Voz activa — el sujeto realiza la acción' },
    { id: 'v3', group: 'Military Writing Style — Core Concepts', en: 'Concise style', es: 'Estilo conciso — máxima información con mínimas palabras' },
    { id: 'v4', group: 'Military Writing Style — Core Concepts', en: 'Neutral register', es: 'Registro neutro — sin emoción, sin opinión personal' },
    { id: 'v5', group: 'Military Writing Style — Core Concepts', en: 'Plain language', es: 'Lenguaje llano — preferir palabras comunes y cortas' },
    { id: 'v6', group: 'Military Writing Style — Core Concepts', en: 'Formal register', es: 'Registro formal — sin contracciones, sin argot' },
    { id: 'v7', group: 'Military Writing Style — Core Concepts', en: 'No contractions', es: 'Sin contracciones (write "do not", not "don\'t")' },
    { id: 'v8', group: 'Military Writing Style — Core Concepts', en: 'No phrasal verbs', es: 'Sin verbos frasales ("obtain" not "get hold of")' },
    { id: 'v9', group: 'Military Writing Style — Core Concepts', en: 'Strong verb', es: 'Verbo fuerte / directo (replace "make a decision" with "decide")' },
    { id: 'v10', group: 'Military Writing Style — Core Concepts', en: 'Redundancy', es: 'Redundancia (palabras que repiten lo ya dicho)' },
    { id: 'v11', group: 'Military Writing Style — Core Concepts', en: 'Nominalization', es: 'Nominalización (convertir verbos en sustantivos — evitar en estilo NATO)' },
    { id: 'v12', group: 'Military Writing Style — Core Concepts', en: 'Padding', es: 'Relleno (palabras que no añaden información)' },
    { id: 'v13', group: 'Military Writing Style — Core Concepts', en: 'Hedge word', es: 'Palabra de cobertura (might, perhaps, possibly — evitar)' },
    { id: 'v14', group: 'Military Writing Style — Core Concepts', en: 'Jargon', es: 'Jerga técnica (usar solo si el receptor la conoce)' },
    { id: 'v15', group: 'Military Writing Style — Core Concepts', en: 'Tone', es: 'Tono (la actitud implícita en el texto — debe ser neutral y profesional)' },
    { id: 'v16', group: 'Military Writing Style — Core Concepts', en: 'Readability', es: 'Legibilidad (facilidad con que el texto es entendido)' },
    
    { id: 'v17', group: 'NATO Standard Abbreviations', en: 'IOT', es: 'In order to (Para)' },
    { id: 'v18', group: 'NATO Standard Abbreviations', en: 'BPT', es: 'Be prepared to (Esté preparado para)' },
    { id: 'v19', group: 'NATO Standard Abbreviations', en: 'NLT', es: 'No later than (A más tardar)' },
    { id: 'v20', group: 'NATO Standard Abbreviations', en: 'IVO', es: 'In the vicinity of (En las cercanías de)' },
    { id: 'v21', group: 'NATO Standard Abbreviations', en: 'IAW', es: 'In accordance with (De acuerdo con)' },
    { id: 'v22', group: 'NATO Standard Abbreviations', en: 'NIL', es: 'Nothing / None (Nada)' },
    { id: 'v23', group: 'NATO Standard Abbreviations', en: 'AOO', es: 'Area of Operations (Área de operaciones)' },
    { id: 'v24', group: 'NATO Standard Abbreviations', en: 'ROE', es: 'Rules of Engagement (Reglas de enfrentamiento)' },
    { id: 'v25', group: 'NATO Standard Abbreviations', en: 'COA', es: 'Course of Action (Curso de acción)' },
    { id: 'v26', group: 'NATO Standard Abbreviations', en: 'FOM', es: 'Freedom of Movement (Libertad de movimiento)' },
    { id: 'v27', group: 'NATO Standard Abbreviations', en: 'NCO', es: 'Non-Commissioned Officer (Suboficial)' },
    { id: 'v28', group: 'NATO Standard Abbreviations', en: 'FOB', es: 'Forward Operating Base (Base operativa avanzada)' },
    { id: 'v29', group: 'NATO Standard Abbreviations', en: 'SOP', es: 'Standard Operating Procedure (Procedimiento operativo estándar)' },
    { id: 'v30', group: 'NATO Standard Abbreviations', en: 'OPORD', es: 'Operation Order (Orden de operaciones)' },
    { id: 'v31', group: 'NATO Standard Abbreviations', en: 'FRAGO', es: 'Fragmentary Order (Orden fragmentaria)' },
    { id: 'v32', group: 'NATO Standard Abbreviations', en: 'SITREP', es: 'Situation Report (Reporte de situación)' },
    { id: 'v33', group: 'NATO Standard Abbreviations', en: 'CASREP', es: 'Casualty Report (Reporte de bajas)' },
    { id: 'v34', group: 'NATO Standard Abbreviations', en: 'RFI', es: 'Request for Information (Solicitud de información)' },
    { id: 'v35', group: 'NATO Standard Abbreviations', en: 'HQ', es: 'Headquarters (Cuartel General / Jefatura)' },
    { id: 'v36', group: 'NATO Standard Abbreviations', en: 'OC', es: 'Officer Commanding (Comandante de compañía/unidad menor)' },
    { id: 'v37', group: 'NATO Standard Abbreviations', en: 'CO', es: 'Commanding Officer (Comandante de batallón/unidad)' },
    { id: 'v38', group: 'NATO Standard Abbreviations', en: 'XO', es: 'Executive Officer (Segundo Comandante / Oficial Ejecutivo)' },
    { id: 'v39', group: 'NATO Standard Abbreviations', en: 'G2', es: 'Intelligence staff (Estado Mayor - Inteligencia)' },
    { id: 'v40', group: 'NATO Standard Abbreviations', en: 'G4', es: 'Logistics staff (Estado Mayor - Logística)' },
    { id: 'v41', group: 'NATO Standard Abbreviations', en: 'DTG', es: 'Date-Time Group (Grupo fecha-hora)' },
    { id: 'v42', group: 'NATO Standard Abbreviations', en: 'LOE', es: 'Line of Effort (Línea de esfuerzo)' },
    { id: 'v43', group: 'NATO Standard Abbreviations', en: 'LOAC', es: 'Law of Armed Conflict (Derecho de los Conflictos Armados)' },
    { id: 'v44', group: 'NATO Standard Abbreviations', en: 'CIMIC', es: 'Civil-Military Cooperation (Cooperación Cívico-Militar)' },
    { id: 'v45', group: 'NATO Standard Abbreviations', en: 'IDP', es: 'Internally Displaced Person (Persona desplazada internamente)' },
    
    { id: 'v46', group: 'Correspondence Types', en: 'Official email', es: 'Correo electrónico oficial' },
    { id: 'v47', group: 'Correspondence Types', en: 'Official letter', es: 'Carta oficial / oficio' },
    { id: 'v48', group: 'Correspondence Types', en: 'Memorandum', es: 'Memorando (interno)' },
    { id: 'v49', group: 'Correspondence Types', en: 'Internal correspondence', es: 'Correspondencia interna (puede usar abreviaturas NATO)' },
    { id: 'v50', group: 'Correspondence Types', en: 'External correspondence', es: 'Correspondencia externa (evitar abreviaturas)' },
    { id: 'v51', group: 'Correspondence Types', en: 'STANAG 2066', es: 'Norma NATO para el formato de correspondencia militar' },
    { id: 'v52', group: 'Correspondence Types', en: 'AAP-56', es: 'Manual NATO de correspondencia militar' },
    { id: 'v53', group: 'Correspondence Types', en: 'JSP 101', es: 'Defence Writing Guide (UK MOD)' },
    { id: 'v54', group: 'Correspondence Types', en: 'Salutation', es: 'Saludo / fórmula de apertura de carta' },
    { id: 'v55', group: 'Correspondence Types', en: 'Complimentary close', es: 'Fórmula de cierre' },
    { id: 'v56', group: 'Correspondence Types', en: 'Subject line', es: 'Línea de asunto (en email y cartas)' },
    { id: 'v57', group: 'Correspondence Types', en: 'Action required', es: 'Acción requerida (qué debe hacer el destinatario)' },
    { id: 'v58', group: 'Correspondence Types', en: 'For information (FYI)', es: 'Para información / sin acción requerida' },
    { id: 'v59', group: 'Correspondence Types', en: 'RFI', es: 'Solicitud de información' },
    { id: 'v60', group: 'Correspondence Types', en: 'Action addressee', es: 'Destinatario de acción (debe actuar)' },
    { id: 'v61', group: 'Correspondence Types', en: 'Info addressee', es: 'Destinatario de información (solo conocimiento)' },

    { id: 'v62', group: 'Letter Structure Elements', en: 'Letterhead', es: 'Membrete / encabezado institucional' },
    { id: 'v63', group: 'Letter Structure Elements', en: 'Reference number', es: 'Número de referencia del documento' },
    { id: 'v64', group: 'Letter Structure Elements', en: 'Date line', es: 'Línea de fecha (formato: 14 October 2025)' },
    { id: 'v65', group: 'Letter Structure Elements', en: 'Addressee block', es: 'Bloque del destinatario' },
    { id: 'v66', group: 'Letter Structure Elements', en: 'Subject line (bold)', es: 'Línea de asunto en negrita' },
    { id: 'v67', group: 'Letter Structure Elements', en: 'Opening paragraph', es: 'Párrafo de apertura (BLUF)' },
    { id: 'v68', group: 'Letter Structure Elements', en: 'Body (numbered)', es: 'Cuerpo — párrafos numerados en correspondencia interna' },
    { id: 'v69', group: 'Letter Structure Elements', en: 'Action paragraph', es: 'Párrafo de acción — qué debe hacer y cuándo' },
    { id: 'v70', group: 'Letter Structure Elements', en: 'Signature block', es: 'Bloque de firma (nombre, rango, cargo, unidad)' },
    { id: 'v71', group: 'Letter Structure Elements', en: 'Enclosure / Annex', es: 'Adjunto / Anexo' },
    { id: 'v72', group: 'Letter Structure Elements', en: 'Copy (cc:)', es: 'Copia para destinatarios adicionales' },
    { id: 'v73', group: 'Letter Structure Elements', en: 'Distribution list', es: 'Lista de distribución' },

    { id: 'v74', group: 'DTG — Date-Time Group', en: '121500ZAPR24', es: '12 April 2024 at 1500 Zulu (UTC)' },
    { id: 'v75', group: 'DTG — Date-Time Group', en: '011200LJAN25', es: '01 January 2025 at 1200 Local time' },
    { id: 'v76', group: 'DTG — Date-Time Group', en: 'Z (Zulu)', es: 'Tiempo UTC / tiempo universal coordinado' },
    { id: 'v77', group: 'DTG — Date-Time Group', en: 'L (Local)', es: 'Hora local del lugar de origen' },
    { id: 'v78', group: 'DTG — Date-Time Group', en: 'Day (DD)', es: 'Dos dígitos: 01–31' },
    { id: 'v79', group: 'DTG — Date-Time Group', en: 'Hour-Minute (HHMM)', es: 'Cuatro dígitos en formato 24 horas' },
    { id: 'v80', group: 'DTG — Date-Time Group', en: 'Month (3-letter)', es: 'JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC' },
    { id: 'v81', group: 'DTG — Date-Time Group', en: 'Year (2 digits)', es: 'Últimos dos dígitos del año: 24 = 2024' },

    { id: 'v82', group: 'NATO Doctrinal References', en: 'AAP-56 (2018)', es: 'NATO Military Correspondence' },
    { id: 'v83', group: 'NATO Doctrinal References', en: 'STANAG 2066', es: 'Acuerdo de estandarización NATO (layout)' },
    { id: 'v84', group: 'NATO Doctrinal References', en: 'AAP-15 (2021)', es: 'NATO Glossary of Abbreviations' },
    { id: 'v85', group: 'NATO Doctrinal References', en: 'NATOTERM', es: 'Base de datos de terminología NATO' },
    { id: 'v86', group: 'NATO Doctrinal References', en: 'JSP 101 v3.1', es: 'Defence Writing Guide (UK MOD)' },
    { id: 'v87', group: 'NATO Doctrinal References', en: 'Concise Oxford Dictionary', es: 'Diccionario preferido por NATO' }
  ]
};

const PRACTICE = {
  vocab:[
    { "id": "pv1", "text": "BLUF" },
    { "id": "pv2", "text": "Active voice" },
    { "id": "pv3", "text": "Concise style" },
    { "id": "pv4", "text": "Neutral register" },
    { "id": "pv5", "text": "Plain language" },
    { "id": "pv6", "text": "Formal register" },
    { "id": "pv7", "text": "No contractions" },
    { "id": "pv8", "text": "No phrasal verbs" },
    { "id": "pv9", "text": "Strong verb" },
    { "id": "pv10", "text": "Redundancy" },
    { "id": "pv11", "text": "Nominalization" },
    { "id": "pv12", "text": "Padding" },
    { "id": "pv13", "text": "Hedge word" },
    { "id": "pv14", "text": "Jargon" },
    { "id": "pv15", "text": "Tone" },
    { "id": "pv16", "text": "Readability" },
    { "id": "pv17", "text": "IOT" },
    { "id": "pv18", "text": "BPT" },
    { "id": "pv19", "text": "NLT" },
    { "id": "pv21", "text": "IAW" },
    { "id": "pv22", "text": "NIL" },
    { "id": "pv23", "text": "AOO" },
    { "id": "pv24", "text": "ROE" },
    { "id": "pv25", "text": "COA" }
  ],
  func:[
    { "id": "pf1", "text": "Alpha Patrol, this is Battle Watch." },
    { "id": "pf2", "text": "Your last three SITREPs contained formatting errors." },
    { "id": "pf3", "text": "Confirm you understand the required structure, over." },
    { "id": "pf4", "text": "Battle Watch, Alpha Patrol. I understand." },
    { "id": "pf5", "text": "The BLUF must state our current status..." },
    { "id": "pf6", "text": "We will correct this, over." },
    { "id": "pf7", "text": "Roger. Additionally, all times must use DTG..." },
    { "id": "pf8", "text": "Your last report used local civilian time." },
    { "id": "pf9", "text": "Confirm you will use Zulu time, over." },
    { "id": "pf10", "text": "Request confirmation: is the deadline still 2000Z..." },
    { "id": "pf11", "text": "Affirmative. Submit NLT 2000Z." },
    { "id": "pf12", "text": "Ensure your SITREP includes casualties, ammunition status,..." },
    { "id": "pf13", "text": "SITREP NLT 2000Z with status, casualties, ammunition,..." },
    { "id": "pf14", "text": "Port Operations, this is Lieutenant Mendez, Colombian..." },
    { "id": "pf15", "text": "Request immediate coordination for a medical evacuation..." },
    { "id": "pf16", "text": "Lieutenant Mendez, Port Operations. We received your..." },
    { "id": "pf17", "text": "Please provide the expected arrival time and..." },
    { "id": "pf18", "text": "We expect one helicopter with two urgent-care..." },
    { "id": "pf19", "text": "Estimated arrival at your airfield is 1430..." },
    { "id": "pf20", "text": "We need access to your northern landing..." },
    { "id": "pf21", "text": "Understood. We will clear the northern pad." },
    { "id": "pf22", "text": "Do you require ambulance coordination to a..." },
    { "id": "pf23", "text": "Negative. Our medical team will handle transfer." },
    { "id": "pf24", "text": "Please do not hesitate to contact me..." },
    { "id": "pf25", "text": "Roger. Northern pad confirmed for 1430. We..." }
  ]
};

const SIMULATIONS = [
  {
    "id": "sim-sitrep-format",
    "script":[
      { "speaker": "hq", "text": "Alpha Patrol, this is Battle Watch." },
      { "speaker": "hq", "text": "Your last three SITREPs contained formatting errors." },
      { "speaker": "hq", "text": "Confirm you understand the required structure, over." },
      { "speaker": "patrol_leader", "text": "Battle Watch, Alpha Patrol. I understand." },
      { "speaker": "patrol_leader", "text": "The BLUF must state our current status in the first sentence." },
      { "speaker": "patrol_leader", "text": "We will correct this, over." },
      { "speaker": "hq", "text": "Roger. Additionally, all times must use DTG format." },
      { "speaker": "hq", "text": "Your last report used local civilian time." },
      { "speaker": "hq", "text": "Confirm you will use Zulu time, over." },
      { "speaker": "patrol_leader", "text": "Wilco." },
      { "speaker": "patrol_leader", "text": "All future SITREPs will open with our combat status and use DTG format." },
      { "speaker": "patrol_leader", "text": "Request confirmation: is the deadline still 2000Z daily, over?" },
      { "speaker": "hq", "text": "Affirmative. Submit NLT 2000Z." },
      { "speaker": "hq", "text": "Ensure your SITREP includes casualties, ammunition status, and any contacts." },
      { "speaker": "hq", "text": "How copy, over?" },
      { "speaker": "patrol_leader", "text": "Solid copy." },
      { "speaker": "patrol_leader", "text": "SITREP NLT 2000Z with status, casualties, ammunition, and contacts in proper format." },
      { "speaker": "patrol_leader", "text": "Alpha Patrol out." }
    ],
    "title": "Verifying SITREP Submission Standards",
    "description": "Field unit confirms proper SITREP format and submission timeline with Battalion HQ after repeated formatting errors.",
    "roles": [ "hq", "patrol_leader" ]
  },
  {
    "id": "sim-external-civ",
    "script":[
      { "speaker": "officer", "text": "Port Operations, this is Lieutenant Mendez, Colombian Army." },
      { "speaker": "officer", "text": "Request immediate coordination for a medical evacuation flight, over." },
      { "speaker": "civilian_ops", "text": "Lieutenant Mendez, Port Operations. We received your request." },
      { "speaker": "civilian_ops", "text": "Please provide the expected arrival time and number of patients, over." },
      { "speaker": "officer", "text": "We expect one helicopter with two urgent-care patients." },
      { "speaker": "officer", "text": "Estimated arrival at your airfield is 1430 local time on 18 October." },
      { "speaker": "officer", "text": "We need access to your northern landing pad, over." },
      { "speaker": "civilian_ops", "text": "Understood. We will clear the northern pad." },
      { "speaker": "civilian_ops", "text": "Do you require ambulance coordination to a civilian hospital, over?" },
      { "speaker": "officer", "text": "Negative. Our medical team will handle transfer." },
      { "speaker": "officer", "text": "I should be grateful if you would confirm the landing pad availability by 1400 local time." },
      { "speaker": "officer", "text": "Please do not hesitate to contact me for any further details, over." },
      { "speaker": "civilian_ops", "text": "Roger. Northern pad confirmed for 1430. We will notify ground crews." },
      { "speaker": "civilian_ops", "text": "Port Operations out." }
    ],
    "title": "Coordinating MEDEVAC Landing Zone with Civilian Airport",
    "description": "Officer must request temporary use of a civilian airfield for a medical evacuation helicopter, avoiding all military abbreviations.",
    "roles": [ "officer", "civilian_ops" ]
  },
  {
    "id": "sim-rfi-route",
    "script":[
      { "speaker": "recon_lead", "text": "G2, this is Recon Team Sierra." },
      { "speaker": "recon_lead", "text": "Requesting information for route clearance operation on Axis Bravo." },
      { "speaker": "recon_lead", "text": "I have three specific questions, over." },
      { "speaker": "g2", "text": "Recon Team Sierra, G2. Send your questions in sequence, over." },
      { "speaker": "recon_lead", "text": "Question one: Have you received any reports of improvised explosive devices in grid square 4578 within the last 48 hours," },
      { "speaker": "recon_lead", "text": "over?" },
      { "speaker": "g2", "text": "We have no IED reports for that grid square." },
      { "speaker": "g2", "text": "Send question two, over." },
      { "speaker": "recon_lead", "text": "Question two: What is the current threat level on Axis Bravo between 0400 and 0800 Zulu," },
      { "speaker": "recon_lead", "text": "over?" },
      { "speaker": "g2", "text": "Threat level is medium due to sporadic small-arms activity." },
      { "speaker": "g2", "text": "Send question three, over." },
      { "speaker": "recon_lead", "text": "Question three: Are there any known civilian vehicle movements on Axis Bravo during our patrol window," },
      { "speaker": "recon_lead", "text": "over?" },
      { "speaker": "g2", "text": "Civilian traffic is expected to be light." },
      { "speaker": "g2", "text": "However, a humanitarian convoy is scheduled for 0600 Zulu IVO grid 4580." },
      { "speaker": "g2", "text": "Confirm you will avoid that area, over." },
      { "speaker": "recon_lead", "text": "Solid copy on all three answers." },
      { "speaker": "recon_lead", "text": "We will adjust our route to avoid the humanitarian corridor." },
      { "speaker": "recon_lead", "text": "Recon Team Sierra out." }
    ],
    "title": "Submitting an RFI for Route Clearance",
    "description": "Recon element transmits a structured Request for Information to Brigade Intelligence section regarding route conditions.",
    "roles": [ "recon_lead", "g2" ]
  },
  {
    "id": "sim-frago-issue",
    "script":[
      { "speaker": "commander", "text": "Warrior Six, this is Dragon Actual. FRAGO follows." },
      { "speaker": "commander", "text": "Acknowledge ready to copy, over." },
      { "speaker": "platoon_leader", "text": "Dragon Actual, Warrior Six. Ready to copy your FRAGO, over." },
      { "speaker": "commander", "text": "Situation: Enemy movement reported IVO grid 5623." },
      { "speaker": "commander", "text": "Mission unchanged but axis of advance is modified." },
      { "speaker": "commander", "text": "You are to shift from Axis Alpha to Axis Charlie immediately, over." },
      { "speaker": "platoon_leader", "text": "Copied: Shift from Axis Alpha to Axis Charlie." },
      { "speaker": "platoon_leader", "text": "Request confirmation: does this change our link-up time with Bravo Company, over?" },
      { "speaker": "commander", "text": "Negative. Link-up time remains NLT 1600Z." },
      { "speaker": "commander", "text": "You are to be prepared to conduct a hasty defence if contact is made during movement." },
      { "speaker": "commander", "text": "Acknowledge, over." },
      { "speaker": "platoon_leader", "text": "Wilco." },
      { "speaker": "platoon_leader", "text": "Shift to Axis Charlie, maintain link-up NLT 1600Z, and be prepared for hasty defence." },
      { "speaker": "platoon_leader", "text": "Warrior Six executing now, over." },
      { "speaker": "commander", "text": "Roger. Dragon Actual out." }
    ],
    "title": "Issuing a FRAGO to Modify Patrol Route",
    "description": "Company Commander issues a Fragmentary Order to a platoon leader, modifying their axis of advance due to updated intelligence.",
    "roles": [ "commander", "platoon_leader" ]
  },
  {
    "id": "sim-concise-radio",
    "script":[
      { "speaker": "senior_nco", "text": "Echo Three, this is Echo Actual. Your last transmission was excessively long." },
      { "speaker": "senior_nco", "text": "Radio discipline requires concise style. Acknowledge, over." },
      { "speaker": "junior_op", "text": "Echo Actual, Echo Three. I understand. I will keep transmissions brief." },
      { "speaker": "junior_op", "text": "How should I report the vehicle status, over?" },
      { "speaker": "senior_nco", "text": "Report the facts." },
      { "speaker": "senior_nco", "text": "Instead of telling me the vehicle is not operational due to the fact that we could not obtain the spare parts in time, tell me simply: Vehicle unserviceable due to parts shortage." },
      { "speaker": "senior_nco", "text": "Send your report again, over." },
      { "speaker": "junior_op", "text": "Echo Actual, Echo Three. Corrected report: Vehicle unserviceable. Awaiting parts." },
      { "speaker": "junior_op", "text": "We cannot conduct the patrol NLT the ordered time. Request instructions, over." },
      { "speaker": "senior_nco", "text": "Solid copy. That was perfect." },
      { "speaker": "senior_nco", "text": "I will task another unit for the patrol. You remain on standby." },
      { "speaker": "senior_nco", "text": "Remember: BLUF in every transmission. Echo Actual out." }
    ],
    "title": "Correcting Wordy Radio Transmissions",
    "description": "Senior NCO corrects a junior operator's overly wordy radio communication, reinforcing the principle of concise military style.",
    "roles":[ "senior_nco", "junior_op" ]
  },
  {
    "id": "sim-dtg-joint",
    "script":[
      { "speaker": "nato_officer", "text": "Liaison Team, this is Exercise Control." },
      { "speaker": "nato_officer", "text": "We are receiving reports with non-standard time formats." },
      { "speaker": "nato_officer", "text": "All times must be transmitted as DTG using Zulu. Acknowledge, over." },
      { "speaker": "liaison_officer", "text": "Exercise Control, Liaison Team. We understand DTG is required." },
      { "speaker": "liaison_officer", "text": "Can you confirm the correct format for today's date at 0930 Zulu, over?" },
      { "speaker": "nato_officer", "text": "Today's DTG is 180930ZOCT25." },
      { "speaker": "nato_officer", "text": "Format is day, time in four digits, Zulu indicator, month in three letters, and two-digit year." },
      { "speaker": "nato_officer", "text": "No spaces. Send your next report using this format, over." },
      { "speaker": "liaison_officer", "text": "Copied. Our next report will use DTG." },
      { "speaker": "liaison_officer", "text": "One more question: Are we permitted to use standard NATO abbreviations in our written SITREP to your headquarters, over?" },
      { "speaker": "nato_officer", "text": "Affirmative." },
      { "speaker": "nato_officer", "text": "Since this is internal military correspondence, you may use abbreviations IAW AAP-15." },
      { "speaker": "nato_officer", "text": "But remember: no apostrophes in plurals. Write NCOs, not NCO apostrophe S." },
      { "speaker": "nato_officer", "text": "Confirm understanding, over." },
      { "speaker": "liaison_officer", "text": "Solid copy. DTGs for all times, abbreviations permitted without apostrophes in plurals." },
      { "speaker": "liaison_officer", "text": "We will correct our format immediately. Liaison Team out." }
    ],
    "title": "Clarifying DTG and Abbreviation Standards",
    "description": "During a multinational exercise, an officer clarifies the use of NATO-standard DTG and abbreviations when coordinating with a partner.",
    "roles": [ "nato_officer", "liaison_officer" ]
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
    const formats = ['.webp', '.webp', '.jpg', '.jpeg'];
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
  // We have 5 func items and 6 format items in our custom renderers to track
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
    if (!groups[item.group]) groups[item.group] = [];
    groups[item.group].push(item);
  });

  for (const [groupName, items] of Object.entries(groups)) {
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
            // Selective Audio Logic
            const hideAudio = groupName === 'DTG — Date-Time Group' || groupName === 'NATO Doctrinal References' || groupName === 'NATO Standard Abbreviations' || groupName === 'Correspondence Types' || groupName === 'Letter Structure Elements';
            const audioBtnHtml = hideAudio ? '' : `
                  <button class="audio-btn" onclick="playFallbackAudio('${item.en.replace(/'/g, "\\'")}', null, this)" title="Listen">
                    <i class="fas fa-volume-up"></i>
                  </button>
            `;
            
            return `
            <div class="item-row-wrap" data-id="${item.id}">
              <div class="item-row">
                <div class="item-en">${item.en}</div>
                <div class="item-es">${item.es}</div>
                <div class="item-controls">
                  <button class="audio-btn image-toggle-btn" id="img-btn-${item.id}" style="display: none;" onclick="toggleVocabImage(this, '${item.id}', '${slug}')" title="Toggle Image"><i class="fas fa-image"></i></button>
                  ${audioBtnHtml}
                  <label class="know-checkbox">
                    <input type="checkbox" class="know-cb" 
                           ${isKnown ? 'checked' : ''}
                           onchange="toggleItem('${item.id}', this.checked)">
                    <span class="know-label">Verified</span>
                  </label>
                </div>
              </div>
              <div class="item-image-container" id="img-cont-${item.id}" style="display: none; text-align: center; margin-top: 10px; margin-bottom: 5px;">
                <img id="img-${item.id}" 
                     alt="${item.en}" 
                     style="max-height: 200px; max-width: 100%;" 
                     onload="const b = document.getElementById('img-btn-${item.id}'); if(b) b.style.display='inline-flex';">
              </div>
            </div>
          `}).join('')}
        </div>
        <div class="accordion-footer">
          <span style="font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase;">Mark section verified:</span>
          <input type="checkbox" class="know-cb" 
                 ${items.every(i => knownItems.has(i.id)) ? 'checked' : ''}
                 onchange="toggleVocabGroup('${groupName.replace(/'/g, "\\'")}', this.checked)">
        </div>
      </div>
    `;
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

function renderFunctionsTab() {
  const container = document.getElementById('tab-func');
  if (!container) return;
  container.innerHTML = `
    <!-- Group 1: Emails -->
    <div class="accordion">
      <div class="accordion-header" onclick="toggleAccordion(this)">
        <div class="acc-icon-box"><i class="fas fa-envelope-open-text"></i></div>
        <div class="acc-title-group"><div class="acc-title">Drafting Official Emails</div></div>
        <i class="fas fa-chevron-down acc-chevron"></i>
      </div>
      <div class="accordion-body"><div class="accordion-inner">
        <div class="info-box">Military emails follow the BLUF principle. The subject line must be specific. Internal emails may use abbreviations freely; external emails must use full terms.</div>
        
        <div class="doc-frame">
          <div class="doc-header">Internal Military Email</div>
          <div class="doc-body-inner"><span class="doc-field">FROM:</span> MAJ R. Ospina, G3, 1 Bde HQ
<span class="doc-field">TO:</span> OC B Coy; OC C Coy
<span class="doc-field">SUBJECT:</span> SITREP SUBMISSION TIMES — ACTION REQUIRED NLT 200900ZOCT25

B Coy and C Coy are to submit daily SITREPs NLT 2000Z IAW the revised SOP.

2. Previous submissions have been received late. This is unacceptable.

3. OCs are to confirm receipt NLT 200900ZOCT25.</div>
          <div class="doc-note">BLUF in subject line. Paragraph 1 states requirement. Abbreviations used freely.</div>
        </div>
        
        <div class="doc-frame">
          <div class="doc-header">External Civilian Email</div>
          <div class="doc-body-inner"><span class="doc-field">FROM:</span> Lieutenant Colonel A. Torres, Chief of Staff
<span class="doc-field">TO:</span> Mr J. Williams, Port Authority of Cartagena
<span class="doc-field">SUBJECT:</span> Request for Berth Allocation — ARC Almirante Padilla

Dear Mr Williams,

I am writing to request berth allocation for the frigate ARC Almirante Padilla.

2. The vessel is expected to arrive on 20 October 2025.

3. I should be grateful if you would confirm berth availability by 16 October.

Yours sincerely,
Lt Col A. Torres</div>
          <div class="doc-note">No NATO abbreviations. Formal salutation and close. Full dates used.</div>
        </div>
      </div>
      <div class="accordion-footer">
        <span style="font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase;">Mark section verified:</span>
        <input type="checkbox" class="know-cb" ${knownItems.has('func-g1') ? 'checked' : ''} onchange="toggleItem('func-g1', this.checked)">
      </div></div>
    </div>

    <!-- Group 2: Concise Style -->
    <div class="accordion">
      <div class="accordion-header" onclick="toggleAccordion(this)">
        <div class="acc-icon-box"><i class="fas fa-eraser"></i></div>
        <div class="acc-title-group"><div class="acc-title">Applying Concise Style Principles</div></div>
        <i class="fas fa-chevron-down acc-chevron"></i>
      </div>
      <div class="accordion-body"><div class="accordion-inner">
        <div class="rule-box">NATO rule: Every word must earn its place. If a word can be removed without changing the meaning, remove it.</div>
        
        <div class="compare-grid">
          <div class="compare-before"><div class="compare-label label-before">✗ Wordy</div><div class="compare-text">Due to the fact that the vehicle was not operational, it was decided by the unit that the patrol would be cancelled.</div></div>
          <div class="compare-after"><div class="compare-label label-after">✓ Concise</div><div class="compare-text">The unit cancelled the patrol because the vehicle was unserviceable.</div></div>
        </div>
        
        <div class="compare-grid">
          <div class="compare-before"><div class="compare-label label-before">✗ Nominalization</div><div class="compare-text">The Commander gave consideration to the implementation of a new SOP.</div></div>
          <div class="compare-after"><div class="compare-label label-after">✓ Strong verb</div><div class="compare-text">The Commander considered implementing a new SOP.</div></div>
        </div>

        <div class="compare-grid">
          <div class="compare-before"><div class="compare-label label-before">✗ Redundant</div><div class="compare-text">At this point in time, the unit is currently engaged in conducting patrol operations in the area.</div></div>
          <div class="compare-after"><div class="compare-label label-after">✓ Concise</div><div class="compare-text">The unit is patrolling the area.</div></div>
        </div>
      </div>
      <div class="accordion-footer">
        <span style="font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase;">Mark section verified:</span>
        <input type="checkbox" class="know-cb" ${knownItems.has('func-g2') ? 'checked' : ''} onchange="toggleItem('func-g2', this.checked)">
      </div></div>
    </div>

    <!-- Group 3: RFI -->
    <div class="accordion">
      <div class="accordion-header" onclick="toggleAccordion(this)">
        <div class="acc-icon-box"><i class="fas fa-question-circle"></i></div>
        <div class="acc-title-group"><div class="acc-title">Producing an RFI</div></div>
        <i class="fas fa-chevron-down acc-chevron"></i>
      </div>
      <div class="accordion-body"><div class="accordion-inner">
        <div class="phrase-card">
          <span class="phrase-context ctx-rfi">RFI Structure</span>
          <div class="phrase-en">An RFI is a brief, numbered document with three elements: Context, Questions (numbered), and Deadline. It does not include analysis.</div>
        </div>
        <div class="doc-frame">
          <div class="doc-header">RFI Format Example</div>
          <div class="doc-body-inner">SUBJECT: RFI 003/25 — ROUTE CLEARANCE INFO
1. 3 Bn requires the following information IOT plan the route clearance on Axis Sierra.
2. QUESTIONS:
   a. Has G2 received any IED reports IVO grid 4578 in the last 72 hours?
3. Response required NLT 141800ZOCT25.</div>
        </div>
      </div>
      <div class="accordion-footer">
        <span style="font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase;">Mark section verified:</span>
        <input type="checkbox" class="know-cb" ${knownItems.has('func-g3') ? 'checked' : ''} onchange="toggleItem('func-g3', this.checked)">
      </div></div>
    </div>
    
    <!-- Group 4: Abbreviations -->
    <div class="accordion">
      <div class="accordion-header" onclick="toggleAccordion(this)">
        <div class="acc-icon-box"><i class="fas fa-spell-check"></i></div>
        <div class="acc-title-group"><div class="acc-title">Using Abbreviations Correctly</div></div>
        <i class="fas fa-chevron-down acc-chevron"></i>
      </div>
      <div class="accordion-body"><div class="accordion-inner">
        <div class="phrase-card">
          <span class="phrase-context ctx-abbr">Internal vs External</span>
          <div class="phrase-en">Abbreviations may be used freely in internal military correspondence. Do not use them in external (civilian) correspondence. First use: write the full term, then abbreviation in brackets.</div>
        </div>
        <div class="phrase-card">
          <span class="phrase-context ctx-abbr">Apostrophes</span>
          <div class="phrase-en">Abbreviations DO NOT take an apostrophe to form the plural. Write: 200 IDPs (not 200 IDP's). Apostrophes are for possession only.</div>
        </div>
      </div>
      <div class="accordion-footer">
        <span style="font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase;">Mark section verified:</span>
        <input type="checkbox" class="know-cb" ${knownItems.has('func-g4') ? 'checked' : ''} onchange="toggleItem('func-g4', this.checked)">
      </div></div>
    </div>
    
    <!-- Group 5: Paragraphs -->
    <div class="accordion">
      <div class="accordion-header" onclick="toggleAccordion(this)">
        <div class="acc-icon-box"><i class="fas fa-align-left"></i></div>
        <div class="acc-title-group"><div class="acc-title">Structuring Paragraphs</div></div>
        <i class="fas fa-chevron-down acc-chevron"></i>
      </div>
      <div class="accordion-body"><div class="accordion-inner">
        <div class="phrase-card">
          <span class="phrase-context ctx-bluf">One Idea Per Paragraph</span>
          <div class="phrase-en">Each numbered paragraph contains one main idea. The first sentence of the paragraph states that idea (the paragraph BLUF). A single-sentence paragraph is common and acceptable.</div>
        </div>
      </div>
      <div class="accordion-footer">
        <span style="font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase;">Mark section verified:</span>
        <input type="checkbox" class="know-cb" ${knownItems.has('func-g5') ? 'checked' : ''} onchange="toggleItem('func-g5', this.checked)">
      </div></div>
    </div>
  `;
}

function renderFormatsTab() {
  const container = document.getElementById('tab-formats');
  if (!container) return;
  container.innerHTML = `
    <!-- BLUF -->
    <div class="accordion">
      <div class="accordion-header" onclick="toggleAccordion(this)">
        <div class="acc-icon-box"><i class="fas fa-bolt"></i></div>
        <div class="acc-title-group"><div class="acc-title">Bottom Line Up Front</div></div>
        <i class="fas fa-chevron-down acc-chevron"></i>
      </div>
      <div class="accordion-body"><div class="accordion-inner">
        <div class="rule-card rule-bluf">
          <div class="rule-phrase">RULE: State the purpose of your document in the first sentence.
          
✓ "This email requests your approval for the patrol plan."
✗ "I am writing with regard to the patrol plan which has been finalised."</div>
        </div>
        <div class="rule-card rule-bluf">
          <div class="rule-phrase">TEST: Cover the text. Read only the first sentence of each paragraph. You should understand the full document from those sentences alone.</div>
        </div>
      </div>
      <div class="accordion-footer">
        <span style="font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase;">Mark section verified:</span>
        <input type="checkbox" class="know-cb" ${knownItems.has('fmt-g1') ? 'checked' : ''} onchange="toggleItem('fmt-g1', this.checked)">
      </div></div>
    </div>
    
    <!-- Style Rules -->
    <div class="accordion">
      <div class="accordion-header" onclick="toggleAccordion(this)">
        <div class="acc-icon-box"><i class="fas fa-pencil-ruler"></i></div>
        <div class="acc-title-group"><div class="acc-title">NATO Style Rules</div></div>
        <i class="fas fa-chevron-down acc-chevron"></i>
      </div>
      <div class="accordion-body"><div class="accordion-inner">
        <div class="rule-card rule-style">
          <div class="rule-phrase">NO CONTRACTIONS in formal documents:
✗ don't → ✓ do not
✗ won't → ✓ will not
✗ it's  → ✓ it is</div>
        </div>
        <div class="rule-card rule-style">
          <div class="rule-phrase">NO PHRASAL VERBS — use single-word alternatives:
✗ get hold of → ✓ obtain
✗ put off     → ✓ postpone
✗ carry out   → ✓ conduct</div>
        </div>
        <div class="rule-card rule-style">
          <div class="rule-phrase">REMOVE REDUNDANCIES:
"past experience" (experience is always past)
"brief summary" (a summary is always brief)
"completely destroyed" (destroyed is already complete)</div>
        </div>
      </div>
      <div class="accordion-footer">
        <span style="font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase;">Mark section verified:</span>
        <input type="checkbox" class="know-cb" ${knownItems.has('fmt-g2') ? 'checked' : ''} onchange="toggleItem('fmt-g2', this.checked)">
      </div></div>
    </div>
    
    <!-- Letter Layout -->
    <div class="accordion">
      <div class="accordion-header" onclick="toggleAccordion(this)">
        <div class="acc-icon-box"><i class="fas fa-file-signature"></i></div>
        <div class="acc-title-group"><div class="acc-title">STANAG 2066 Letter Format</div></div>
        <i class="fas fa-chevron-down acc-chevron"></i>
      </div>
      <div class="accordion-body"><div class="accordion-inner">
        <div class="rule-card rule-letter">
          <div class="rule-phrase">SALUTATION — COMPLIMENTARY CLOSE PAIRINGS:
          
"Dear Col Smith," → "Yours sincerely," (Known name)
"Dear Sir,"       → "Yours faithfully," (Unknown name)</div>
        </div>
        <div class="rule-card rule-letter">
          <div class="rule-phrase">STANAG 2066 — LAYOUT SUMMARY:
- Subject line appears BETWEEN the salutation and paragraph 1.
- Subject line is bolded.
- Paragraphs are numbered.
- Date is written in full (14 October 2025).</div>
        </div>
      </div>
      <div class="accordion-footer">
        <span style="font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase;">Mark section verified:</span>
        <input type="checkbox" class="know-cb" ${knownItems.has('fmt-g3') ? 'checked' : ''} onchange="toggleItem('fmt-g3', this.checked)">
      </div></div>
    </div>
    
    <!-- Email Format -->
    <div class="accordion">
      <div class="accordion-header" onclick="toggleAccordion(this)">
        <div class="acc-icon-box"><i class="fas fa-envelope"></i></div>
        <div class="acc-title-group"><div class="acc-title">Email Register & Subjects</div></div>
        <i class="fas fa-chevron-down acc-chevron"></i>
      </div>
      <div class="accordion-body"><div class="accordion-inner">
        <div class="rule-card rule-email">
          <div class="rule-phrase">SUBJECT LINE RULES:
✗ "Meeting"
✓ "CO's Brief — Agenda for 151400ZOCT25 — ACTION NLT 141200Z"

STRUCTURE: [Topic] — [Action or FYI] — [Deadline]</div>
        </div>
        <div class="rule-card rule-email">
          <div class="rule-phrase">EMAIL REGISTER:
INTERNAL: "Regards" or "V/r"
EXTERNAL: "Yours sincerely" or "Kind regards"</div>
        </div>
      </div>
      <div class="accordion-footer">
        <span style="font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase;">Mark section verified:</span>
        <input type="checkbox" class="know-cb" ${knownItems.has('fmt-g4') ? 'checked' : ''} onchange="toggleItem('fmt-g4', this.checked)">
      </div></div>
    </div>
    
    <!-- DTG -->
    <div class="accordion">
      <div class="accordion-header" onclick="toggleAccordion(this)">
        <div class="acc-icon-box"><i class="fas fa-clock"></i></div>
        <div class="acc-title-group"><div class="acc-title">Date-Time Groups (DTG)</div></div>
        <i class="fas fa-chevron-down acc-chevron"></i>
      </div>
      <div class="accordion-body"><div class="accordion-inner">
        <div class="rule-card rule-dtg">
          <div class="rule-phrase">FORMAT: DD HHMM Z/L MON YY
EXAMPLE: 141500ZOCT25
= 14 Oct 2025, 1500 UTC (Zulu)

No spaces between elements. Month is always 3 capital letters.</div>
        </div>
      </div>
      <div class="accordion-footer">
        <span style="font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase;">Mark section verified:</span>
        <input type="checkbox" class="know-cb" ${knownItems.has('fmt-g5') ? 'checked' : ''} onchange="toggleItem('fmt-g5', this.checked)">
      </div></div>
    </div>
    
    <!-- Abbreviations Rule -->
    <div class="accordion">
      <div class="accordion-header" onclick="toggleAccordion(this)">
        <div class="acc-icon-box"><i class="fas fa-book"></i></div>
        <div class="acc-title-group"><div class="acc-title">Authoritative Sources</div></div>
        <i class="fas fa-chevron-down acc-chevron"></i>
      </div>
      <div class="accordion-body"><div class="accordion-inner">
        <div class="rule-card rule-abbr">
          <div class="rule-phrase">NATOTERM (nso.nato.int) is the authoritative terminology source. 
Do not invent abbreviations. 
Do not use national abbreviations in NATO documents without first confirming they are in AAP-15.</div>
        </div>
      </div>
      <div class="accordion-footer">
        <span style="font-size:0.75rem; color:var(--on-surface-variant); text-transform:uppercase;">Mark section verified:</span>
        <input type="checkbox" class="know-cb" ${knownItems.has('fmt-g6') ? 'checked' : ''} onchange="toggleItem('fmt-g6', this.checked)">
      </div></div>
    </div>
  `;
}

// ============================================================================
// PRACTICE CARDS
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
      resultDiv.innerHTML = `<div class="feedback-success"><i class="fas fa-check-circle"></i> Perfect Match! (${Math.round(simScore*100)}%)</div>`;
      addMasteredPhrase(target);
    } else {
      resultDiv.innerHTML = `<div class="feedback-error">Mismatch. Received: "${transcript}"</div>`;
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
      simState.score += (10 - simState.attempts); simState.turnIndex++; 
      isListening = false;
      setTimeout(processNextTurn, 1000);
    } else {
      if (simState.attempts >= simState.maxAttempts) {
        feedback.innerHTML = `<span style="color:var(--error)"><i class="fas fa-times"></i> Max attempts. Bypassing...</span>`;
        simState.turnIndex++; 
        isListening = false;
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
  const area = document.getElementById('dialogue-area');
  const completionDiv = document.createElement('div');
  completionDiv.style.textAlign = 'center'; completionDiv.style.padding = 'var(--space-4)'; completionDiv.style.marginTop = 'var(--space-4)'; completionDiv.style.borderTop = '1px dashed var(--outline-variant)';
  completionDiv.innerHTML = `<h3 style="color:var(--primary); margin-bottom:10px;"><i class="fas fa-flag-checkered"></i> SIMULATION COMPLETE</h3><p>Performance Logged.</p><button class="btn btn-primary" style="margin-top:15px;" onclick="exitSimulation()">Return to Tactics</button>`;
  area.appendChild(completionDiv); area.scrollTop = area.scrollHeight;
  toggleItem(simId, true);
}