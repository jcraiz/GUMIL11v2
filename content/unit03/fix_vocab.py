import re
import os
import json

base_dir = r"c:\Users\user\Desktop\GetUnderwayESP_2026\Proposed site"
draft_html_path = os.path.join(base_dir, "Draft Military_Content", "military_english_level1_unit3.html")
unit03_dir = os.path.join(base_dir, "Military Landing Page", "Level 11", "content", "unit03")

with open(draft_html_path, "r", encoding="utf-8") as f:
    draft_content = f.read()

# 5. Extract Vocab and Practice data using regex
vocab_items = []
vocab_div_match = re.search(r'<div id="vocab" class="section active">(.*?)<!-- ═══════════════════════════════════════════════════\s*SECTION 2', draft_content, re.DOTALL)
if vocab_div_match:
    vocab_div_content = vocab_div_match.group(1)
    
    # Let's just find ALL vocab cards globally in this section
    groups = re.split(r'<div class="cat-title">(.*?)</div>', vocab_div_content)
    
    for i in range(1, len(groups), 2):
        group_html = groups[i]
        # Remove span tags from group title
        group_name = re.sub(r'<span.*?>.*?</span>\s*', '', group_html).strip()
        group_content = groups[i+1]
        
        # Find all vocab-cards
        cards = re.findall(r'<div class="vocab-card"><div class="vocab-en">(.*?)</div><div class="vocab-es">(.*?)</div></div>', group_content)
        for en, es in cards:
            en = re.sub(r'<.*?>', '', en).strip()
            es = re.sub(r'<.*?>', '', es).strip()
            slug = re.sub(r'[^a-z0-9]', '', en.lower())[:20]
            vocab_items.append({"id": f"v_{slug}", "group": group_name, "en": en, "es": es})

# Also handle the CONDUCT ones at the end
# They are under <div class="cat-title">CONDUCT + [Activity] — When No NATO Verb Exists</div>
# The regex above will catch them too because they have <div class="vocab-card">

content_vocab_js = "CONTENT.vocab = " + json.dumps(vocab_items, indent=4) + ";"

practice_items = [{"id": f"p_v_{i}", "text": item["en"]} for i, item in enumerate(vocab_items)]
practice_js = "PRACTICE = {\n  vocab: " + json.dumps(practice_items, indent=4) + ",\n  func: [],\n  sim: []\n};"

with open(os.path.join(unit03_dir, "script.js"), "r", encoding="utf-8") as f:
    script_js = f.read()

# Replace CONTENT.vocab array
# Find const CONTENT = { vocab: [ ... ] }; or CONTENT.vocab = [ ... ];
match = re.search(r'const CONTENT = \{.*?const SIMULATIONS = \[\];', script_js, re.DOTALL)
if match:
    script_js = script_js.replace(match.group(0), f'const CONTENT = {{}};\n{content_vocab_js}\n\n{practice_js}\n\nconst SIMULATIONS = [];')
else:
    print("NO MATCH")

with open(os.path.join(unit03_dir, "script.js"), "w", encoding="utf-8") as f:
    f.write(script_js)

print("FOUND", len(vocab_items), "VOCAB ITEMS")
