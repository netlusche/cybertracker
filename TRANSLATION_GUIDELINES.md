# CyberTasker Translation Guidelines

When adding or modifying translation keys in the CyberTasker interface, it is critical to balance the **Cyberpunk Aesthetic** with **Functional Clarity**. 

Because `scripts/translate_json.py` uses the English (`en`) `translation.json` file as the absolute baseline for all other 14 automatically translated languages (Google Translate API), overly abstract English slang will result in completely nonsensical translations in other languages (e.g., translating "Reroute Frequency" literally into German as "Rute-Häufigkeit").

## The Golden Rules of Translation

### 1. English is the Rosetta Stone
All automated translations flow from the English JSON file. Therefore, the English text must be grammatically correct and logically structured. Do not use made-up words or highly abstract slang that a machine translator cannot reliably interpret.

### 2. Balance Theme and Clarity
Instead of using obscure jargon, use strong, thematic, but universally understood verbs and nouns. 
*   **BAD (Too Abstract):** "Splice the datalink." -> *Translators will destroy this.*
*   **GOOD (Thematic & Clear):** "Re-route Com-Link." -> *Translators will correctly interpret 'change email'.*
*   **BAD (Confusing):** "Downgrade Operator." -> *Translators might think of software versions.*
*   **GOOD (Precise):** "Demote Operator" or "Revoke Admin Clearance."

### 3. Use Brackets for Context
If a cyberpunk term is required for immersion, always anchor it with a widely understood standard term in brackets. This allows human readers and translation algorithms to grasp the true meaning.
*   "// SYSTEM ACCESS [Authentication]"
*   "// BIO-LOCK SECURITY [2FA]"
*   "// NEURAL PROGRESSION [XP & Ranks]"

### 4. Provide Context for Native Overrides
For languages that require precise, hand-crafted manual overrides (like the Klingon `tlh` or specific German `de` UI verbs like "Befördern"/"Degradieren"), ensure that you manually re-apply these changes *after* running the `translate_json.py` script, or define an exclusion block within the script to protect those specific files/keys.

### 5. AI Agent Directive
If you are an AI Assistant updating translations:
1. Ensure the English text is precise, professional, and slightly thematic.
2. Ensure you have not broken any string interpolation placeholders (e.g., `{{username}}`).
3. If asked to natively translate specific keys into complex languages (like German or Klingon), ensure you bypass the automated translation script for those specific files.
