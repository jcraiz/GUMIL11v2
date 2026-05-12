# Audio Files Requirements & Naming Convention

This folder contains the audio assets for Military English Level 11, Unit 1.

## Naming Convention
To ensure the web object can locate and play the correct audio file for each vocabulary item or phrase, you MUST follow the standardized naming convention:

1. **Extract the first 7 words** of the English phrase or vocabulary term.
2. **Convert to lowercase**.
3. **Remove all punctuation** (commas, periods, question marks, slashes, apostrophes). *Exception: If a word ends in "(s)", treat it as an "s" (e.g., "report(s)" becomes "reports").*
4. **Replace spaces with underscores (`_`)**.
5. Save the file as `.mp3`.

### Examples:
- "BLUF" → `bluf.mp3`
- "Active voice" → `active_voice.mp3`
- "Concise style" → `concise_style.mp3`
- "Has G2 received any IED reports IVO grid square 4578 in the last 72 hours?" 
  → `has_g2_received_any_ied_reports_ivo.mp3`

## Fallback System
If an `.mp3` file is missing, the system will automatically fallback to the browser's native Text-to-Speech (TTS) engine. However, to ensure military-grade pronunciation and realism, it is highly recommended to provide pre-recorded `.mp3` files for all entries.

*Note: The "Formats & Style Rules" section, as well as the "DTG" and "NATO Doctrinal References" vocabulary categories, intentionally do not require audio files as they are focused on writing skills.*
