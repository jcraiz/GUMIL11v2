import re
import os
import json

base_dir = r"c:\Users\user\Desktop\GetUnderwayESP_2026\Proposed site"
draft_html_path = os.path.join(base_dir, "Draft Military_Content", "military_english_level1_unit3.html")
unit03_dir = os.path.join(base_dir, "Military Landing Page", "Level 11", "content", "unit03")

with open(draft_html_path, "r", encoding="utf-8") as f:
    draft_content = f.read()

# 1. Extract CSS
css_match = re.search(r'/\* ═══════════════════════════════ EXERCISE STYLES ═══════════════════════════════ \*/(.*?)</style>', draft_content, re.DOTALL)
exercise_css = css_match.group(1) if css_match else ""

with open(os.path.join(unit03_dir, "style.css"), "a", encoding="utf-8") as f:
    f.write("\n/* ═══════════════════════════════ EXERCISE STYLES ═══════════════════════════════ */\n")
    f.write(exercise_css)

# 2. Extract HTML for Interactive Exercises
html_match = re.search(r'<div id="func" class="section">(.*?)<!-- ═══════════════════════════════════════════════════\s*SECTION 3', draft_content, re.DOTALL)
exercise_html = html_match.group(1) if html_match else ""

# Also extract the Formats & Rules HTML
formats_match = re.search(r'<div id="formats" class="section">(.*?)\s*</div>\s*<script>', draft_content, re.DOTALL)
formats_html = formats_match.group(1) if formats_match else ""

# 3. Update index.html
with open(os.path.join(unit03_dir, "index.html"), "r", encoding="utf-8") as f:
    index_html = f.read()

index_html = index_html.replace("<title>Military English Level 11 — Unit 1</title>", "<title>Military English Level 11 — Unit 3</title>")
index_html = index_html.replace("<h2>UNIT 1 // Military Writing Style & Correspondence</h2>", "<h2>UNIT 3 // NATO Task Verbs & Mission Statements</h2>")
index_html = index_html.replace("<p class=\"header-sub\">Technical Vocabulary · NATO Abbreviations · DTG · Concise Style</p>", "<p class=\"header-sub\">Tactical Vocabulary · ATP-112 Verbs · Mission Formula · Exercise Sector</p>")
index_html = index_html.replace("<i class=\"fas fa-walkie-talkie\"></i> Communicative Functions", "<i class=\"fas fa-gamepad\"></i> Interactive Exercises")

# Insert exercises HTML
index_html = index_html.replace('<div id="tab-func"  class="tab-panel"        role="tabpanel" aria-labelledby="stab-func"></div>', f'<div id="tab-func" class="tab-panel" role="tabpanel" aria-labelledby="stab-func">\n{exercise_html}\n</div>')

# We can actually insert formats HTML statically as well, but wait, unit01/script.js has renderFormatsTab().
# Let's check how many elements there are. 
# It's probably easier to just replace tab-formats as well.
index_html = index_html.replace('<div id="tab-formats" class="tab-panel"      role="tabpanel" aria-labelledby="stab-formats"></div>', f'<div id="tab-formats" class="tab-panel" role="tabpanel" aria-labelledby="stab-formats">\n{formats_html}\n</div>')

with open(os.path.join(unit03_dir, "index.html"), "w", encoding="utf-8") as f:
    f.write(index_html)

# 4. Extract Javascript for exercises
js_match = re.search(r'// ═══════════════════════════════════════════\s*// EXERCISE 1(.*)</script>', draft_content, re.DOTALL)
exercise_js = "// ═══════════════════════════════════════════\n// EXERCISE 1\n" + js_match.group(1) if js_match else ""

# 5. Extract Vocab and Practice data
# 5. Extract Vocab and Practice data using regex
vocab_items = []
vocab_div_match = re.search(r'<div id="vocab" class="section active">(.*?)<!-- ═══════════════════════════════════════════════════\s*SECTION 2', draft_content, re.DOTALL)
if vocab_div_match:
    vocab_div_content = vocab_div_match.group(1)
    # Split by cat-title to get groups
    groups = re.split(r'<div class="cat-title">(.*?)</div>', vocab_div_content)
    # groups[0] is text before first title
    for i in range(1, len(groups), 2):
        group_html = groups[i]
        # Remove span tags from group title
        group_name = re.sub(r'<span.*?>.*?</span>\s*', '', group_html).strip()
        group_content = groups[i+1]
        
        # Find all vocab-cards
        cards = re.findall(r'<div class="vocab-card"><div class="vocab-en">(.*?)</div><div class="vocab-es">(.*?)</div></div>', group_content)
        for en, es in cards:
            en = en.strip()
            es = es.strip()
            slug = en.lower().replace(" ", "_").replace("&", "and")[:20]
            vocab_items.append({"id": f"v_{slug}", "group": group_name, "en": en, "es": es})

# Generate JS Content array
content_vocab_js = "CONTENT.vocab = " + json.dumps(vocab_items, indent=4) + ";"

# Practice text can be generated from the vocab items
practice_items = [{"id": f"p_v_{i}", "text": item["en"]} for i, item in enumerate(vocab_items)]
practice_js = "PRACTICE = {\n  vocab: " + json.dumps(practice_items, indent=4) + ",\n  func: [],\n  sim: []\n};"

# 6. Update script.js
with open(os.path.join(unit03_dir, "script.js"), "r", encoding="utf-8") as f:
    script_js = f.read()

# Replace STORAGE_KEY
script_js = script_js.replace("const STORAGE_KEY = 'milit11_u1_prog';", "const STORAGE_KEY = 'milit11_u3_prog';")
script_js = script_js.replace("const P_KEY = 'milit11_u1_prac';", "const P_KEY = 'milit11_u3_prac';")

# Remove renderFunctionsTab and renderFormatsTab calls and definitions
script_js = script_js.replace("renderFunctionsTab();\n", "")
script_js = script_js.replace("renderFormatsTab();\n", "")

# We need to use regex to remove the function definitions
script_js = re.sub(r'function renderFunctionsTab\(\) \{.*?\n\}\n', '', script_js, flags=re.DOTALL)
script_js = re.sub(r'function renderFormatsTab\(\) \{.*?\n\}\n', '', script_js, flags=re.DOTALL)

# Replace CONTENT and PRACTICE and SIMULATIONS blocks
# Finding the block from const CONTENT = { to SIMULATIONS = [ ... ];
# Since we just want to replace the whole data section:
# Actually we can just find 'const CONTENT = {' and replace down to 'let TOTAL_ITEMS = 0;'
data_block_match = re.search(r'(const CONTENT = \{.*?let TOTAL_ITEMS = 0;)', script_js, re.DOTALL)
if data_block_match:
    new_data_block = f"""const CONTENT = {{}};
{content_vocab_js}

{practice_js}

const SIMULATIONS = [];

let TOTAL_ITEMS = 0;
"""
    script_js = script_js.replace(data_block_match.group(1), new_data_block)

# Also we need to fix calculateTotalItems because we removed funcGroups and formatGroups from renderers, wait, we can just set it to CONTENT.vocab.length since func and formats are statically in HTML. But wait, we want progress tracking for the static HTML too? The original code had checkboxes for func and formats. In the static HTML there are NO checkboxes! 
# Unit 3's static HTML does not have checkboxes for the interactive exercises or formats.
# Let's adjust calculateTotalItems to just count vocab for now, or add 5 points for the 5 exercises.
# Let's add the interactive exercises JS at the end of the script.
script_js += "\n\n" + exercise_js

with open(os.path.join(unit03_dir, "script.js"), "w", encoding="utf-8") as f:
    f.write(script_js)

print("SUCCESS")
