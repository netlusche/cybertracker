import fs from 'fs';
import path from 'path';
import 'dotenv/config'; // Ensures .env is loaded if present
import translate from 'google-translate-api-x';

// Parse command line arguments
const args = process.argv.slice(2);
const forceAll = args.includes('--force-all');

const API_KEY = process.env.GEMINI_API_KEY;

const LOCALES_DIR = path.join(process.cwd(), 'public', 'locales');
const SOURCE_LANG = 'en';
const GUIDELINES_PATH = path.join(process.cwd(), 'manuals', 'TRANSLATION_GUIDELINES.md');

// Load constraints
const guidelines = fs.existsSync(GUIDELINES_PATH)
  ? fs.readFileSync(GUIDELINES_PATH, 'utf-8')
  : "Translate UI text accurately, keeping cyberpunk themes where appropriate.";

// Utility to deep copy
const clone = (obj) => JSON.parse(JSON.stringify(obj));

/**
 * Finds missing keys by comparing target with source.
 * Returns an object containing only the keys that need translation.
 */
function findMissingKeys(source, target) {
  const missing = {};
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      const nestedMissing = findMissingKeys(
        source[key],
        (target && typeof target[key] === 'object') ? target[key] : {}
      );
      if (Object.keys(nestedMissing).length > 0) {
        missing[key] = nestedMissing;
      }
    } else if (Array.isArray(source[key])) {
      // For arrays, if not present or length mismatch, retranslate wholly.
      if (!target || !target[key] || target[key].length !== source[key].length) {
        missing[key] = source[key];
      }
    } else {
      if (!target || target[key] === undefined || target[key] === "") {
        missing[key] = source[key];
      }
    }
  }
  return missing;
}

/**
 * Deep merges the translated keys back into the target object.
 */
function mergeTranslations(target, translated) {
  const result = clone(target || {});
  for (const key in translated) {
    if (typeof translated[key] === 'object' && translated[key] !== null && !Array.isArray(translated[key])) {
      result[key] = mergeTranslations(result[key], translated[key]);
    } else {
      result[key] = translated[key];
    }
  }
  return result;
}

/**
 * Calls the Gemini API to translate a JSON object.
 */
async function translateWithGemini(targetLang, jsonPayload) {
  const prompt = `
You are a professional localization engineer translating a web application.
Target Language Code (ISO 639-1): "${targetLang}"

Here are the strict Translation Guidelines you MUST follow:
---
${guidelines}
---

Your task:
Translate the following JSON configuration from English to "${targetLang}".
Return ONLY valid JSON. Keep the exact same JSON structure, keys, and string interpolation variables (like {{username}}).
DO NOT wrap the response in markdown blocks (no \`\`\`json). Just return the raw JSON string.

JSON to translate:
${JSON.stringify(jsonPayload, null, 2)}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API Error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;

  try {
    return JSON.parse(text.trim());
  } catch (e) {
    console.error("Failed to parse Gemini response as JSON:");
    console.error(text);
    throw e;
  }
}

/**
 * Fallback to Google Translate if GEMINI_API_KEY is not provided.
 * Caution: This parses the payload iteratively since Google Translate operates on strings, not structured JSON.
 */
async function translateWithGoogle(targetLang, payload) {
  const result = clone(payload);

  async function traverseAndTranslate(obj) {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        await traverseAndTranslate(obj[key]);
      } else if (typeof obj[key] === 'string') {
        try {
          // Add a minor delay to avoid rate-limiting
          await new Promise(r => setTimeout(r, 200));
          const res = await translate(obj[key], { to: targetLang, forceTo: true });
          obj[key] = res.text;
        } catch (err) {
          console.error(`Google Translate Error on key [${key}]:`, err.message);
        }
      }
    }
  }

  await traverseAndTranslate(result);
  return result;
}


async function main() {
  const sourceFile = path.join(LOCALES_DIR, SOURCE_LANG, 'translation.json');
  if (!fs.existsSync(sourceFile)) {
    console.error(`Source file not found: ${sourceFile}`);
    process.exit(1);
  }

  const sourceJson = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
  const targetLangsArg = args.find(a => a.startsWith('--langs='));
  const targetLangs = targetLangsArg ? targetLangsArg.split('=')[1].split(',') : null;

  let dirs = fs.readdirSync(LOCALES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name !== SOURCE_LANG)
    .map(dirent => dirent.name);

  if (targetLangs) {
    dirs = dirs.filter(lang => targetLangs.includes(lang));
  }

  console.log(`[CyberTasker Localization] Starting Translation Sync`);

  if (API_KEY) {
    console.log('[+] GEMINI_API_KEY found. Using Gemini AI for context-aware translations.');
  } else {
    console.warn('[-] GEMINI_API_KEY environment variable is missing.');
    console.warn('[-] Falling back to standard Google Translate. Warning: Context guidelines will be ignored!');
  }

  console.log(`Mode: ${forceAll ? 'FORCE-ALL (Full Re-translation)' : 'INCREMENTAL (Only missing keys)'}`);
  console.log(`Target Languages: ${dirs.join(', ')}\n`);

  for (const lang of dirs) {
    console.log(`Processing [${lang}]...`);
    const targetFile = path.join(LOCALES_DIR, lang, 'translation.json');
    let targetJson = {};

    if (fs.existsSync(targetFile)) {
      targetJson = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));
    }

    let payloadToTranslate = {};
    if (forceAll) {
      payloadToTranslate = sourceJson;
    } else {
      payloadToTranslate = findMissingKeys(sourceJson, targetJson);
    }

    if (Object.keys(payloadToTranslate).length === 0) {
      console.log(`  -> [${lang}] is already fully translated. Skipping.`);
      continue;
    }

    console.log(`  -> Found ${forceAll ? 'ALL' : 'MISSING'} keys to translate. Contacting API...`);

    try {
      let translatedData;
      if (API_KEY) {
        translatedData = await translateWithGemini(lang, payloadToTranslate);
      } else {
        translatedData = await translateWithGoogle(lang, payloadToTranslate);
      }

      const finalJson = forceAll
        ? translatedData
        : mergeTranslations(targetJson, translatedData);

      fs.writeFileSync(targetFile, JSON.stringify(finalJson, null, 4));
      console.log(`  -> [${lang}] successfully synchronized & saved.`);
    } catch (err) {
      console.error(`  [!] Error translating [${lang}]:`, err.message);
    }
  }

  console.log(`\n[CyberTasker Localization] Sync Complete!`);
}

main().catch(console.error);
