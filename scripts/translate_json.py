import json
import os
import urllib.request
import urllib.parse
import time

TARGETS = ['da', 'sv', 'no', 'fi', 'hu', 'pl', 'pt', 'el', 'ru', 'zh-CN', 'de', 'es', 'fr', 'nl', 'it']
KLINGON = 'tlh'

print("Loading base english strings...")
with open("public/locales/en/translation.json", "r", encoding="utf-8") as f:
    base_data = json.load(f)

def extract_strings(d, strings_list, map_keys, current_path=""):
    for k, v in d.items():
        path = f"{current_path}.{k}" if current_path else k
        if isinstance(v, dict):
            extract_strings(v, strings_list, map_keys, path)
        elif isinstance(v, str):
            strings_list.append(v)
            map_keys.append(path)

strings_to_translate = []
key_map = []
extract_strings(base_data, strings_to_translate, key_map)

print(f"Extracted {len(strings_to_translate)} strings.")

def translate_batch(strings, target_lang):
    text = " ||| ".join(strings)
    url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=" + target_lang + "&dt=t&q=" + urllib.parse.quote(text)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode('utf-8'))
            translated_text = "".join([x[0] for x in res[0]])
            return [s.strip() for s in translated_text.split("|||")]
    except Exception as e:
        print(f"Error translating to {target_lang}: {e}")
        return strings

def set_nested_value(d, path, value):
    keys = path.split('.')
    for key in keys[:-1]:
        d = d[key]
    d[keys[-1]] = value.strip() if isinstance(value, str) else value

def process_lang(lang_code, folder_name):
    print(f"Translating to {folder_name} ({lang_code})...")
    # Batch strings in chunks of 50 to avoid URL length limits
    translated_strings = []
    chunk_size = 30
    for i in range(0, len(strings_to_translate), chunk_size):
        chunk = strings_to_translate[i:i+chunk_size]
        res = translate_batch(chunk, lang_code)
        if len(res) < len(chunk):
            # Fallback to appending chunk if parsing failed
            res += chunk[len(res):]
        elif len(res) > len(chunk):
            res = res[:len(chunk)]
        translated_strings.extend(res)
        time.sleep(1) # throttle
    
    # Rebuild JSON
    import copy
    new_data = copy.deepcopy(base_data)
    for path, val in zip(key_map, translated_strings):
        # some translations might lose string placeholders randomly, but we'll try to preserve UI
        set_nested_value(new_data, path, val)
        
    os.makedirs(f"public/locales/{folder_name}", exist_ok=True)
    with open(f"public/locales/{folder_name}/translation.json", "w", encoding="utf-8") as f:
        json.dump(new_data, f, ensure_ascii=False, indent=4)
    print(f"Saved {folder_name}.")

for lang in TARGETS:
    process_lang(lang, lang if lang != 'zh-CN' else 'zh')

print("\n--- KLINGON (tlh) VALIDATION ---")
try:
    with open("public/locales/tlh/translation.json", "r", encoding="utf-8") as f:
        tlh_data = json.load(f)
except FileNotFoundError:
    tlh_data = {}

missing_klingon = {}

def check_missing_klingon(en_dict, tlh_dict, current_path=""):
    for k, v in en_dict.items():
        path = f"{current_path}.{k}" if current_path else k
        if isinstance(v, dict):
            if k not in tlh_dict or not isinstance(tlh_dict[k], dict):
                tlh_dict[k] = {}
            check_missing_klingon(v, tlh_dict[k], path)
        elif isinstance(v, str):
            if k not in tlh_dict or tlh_dict[k] == "":
                missing_klingon[path] = v

check_missing_klingon(base_data, tlh_data)

if missing_klingon:
    print("⚠️ WARNING: INCOMPLETE KLINGON (tlh) TRANSLATION DETECTED!")
    print("Google Translate API does not support authentic Klingon (tlhIngan Hol).")
    print("To avoid 'Schmalspur-Klingonisch', please ask your AI Assistant")
    print("to natively translate the following missing English keys into Klingon:\n")
    
    out_dict = {}
    for path, text in missing_klingon.items():
        keys = path.split('.')
        d = out_dict
        for key in keys[:-1]:
            d = d.setdefault(key, {})
        d[keys[-1]] = text
        
    print(json.dumps(out_dict, indent=4))
    print("\nPlease merge the AI's translation into public/locales/tlh/translation.json.")
else:
    print("Klingon (tlh) translation is fully synchronized! batlh!")

print("\nAll languages processed.")
