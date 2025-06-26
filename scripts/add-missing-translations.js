// scripts/add-missing-translations.js
// Usage: node scripts/add-missing-translations.js
// Adds missing translation keys by copying from English base

const fs = require("fs");
const path = require("path");

const localesDir = path.join(__dirname, "../i18n/locales");

// Helper to load and merge all JSONs for a language
function loadMergedLang(lang) {
  const base = {};
  const jsonDirs = ["translations", "country", "apiStatus", "verification", "seo"];
  for (const dir of jsonDirs) {
    const file = path.join(localesDir, dir, `${lang}.json`);
    if (fs.existsSync(file)) {
      try {
        Object.assign(base, JSON.parse(fs.readFileSync(file, "utf-8")));
      } catch (e) {
        console.error(`Failed to parse ${file}:`, e);
      }
    }
  }
  return base;
}

function getAllKeys(obj, prefix = "") {
  let keys = [];
  for (const k in obj) {
    if (typeof obj[k] === "object" && obj[k] !== null) {
      keys = keys.concat(getAllKeys(obj[k], prefix ? `${prefix}.${k}` : k));
    } else {
      keys.push(prefix ? `${prefix}.${k}` : k);
    }
  }
  return keys;
}

function getKeyValue(obj, key) {
  const parts = key.split(".");
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

function determineJsonFile(key) {
  if (key.startsWith("country.")) return "country";
  if (key.startsWith("pwa.")) return "translations";
  if (key.startsWith("seo.")) return "seo";
  if (key.startsWith("apiStatus.")) return "apiStatus";
  if (key.startsWith("verification.")) return "verification";
  return "translations";
}

function main() {
  const base = loadMergedLang("en");
  const baseKeys = getAllKeys(base);

  // Find all unique language codes from all directories
  const allFiles = new Set();
  const jsonDirs = ["translations", "country", "apiStatus", "verification", "seo"];

  for (const dir of jsonDirs) {
    const dirPath = path.join(localesDir, dir);
    if (fs.existsSync(dirPath)) {
      const files = fs
        .readdirSync(dirPath)
        .filter((f) => f.endsWith(".json") && f !== "en.json")
        .map((f) => f.replace(".json", ""));
      files.forEach((f) => allFiles.add(f));
    }
  }

  console.log(`Found ${allFiles.size} language variants:`, Array.from(allFiles).sort());

  for (const lang of Array.from(allFiles).sort()) {
    const langObj = loadMergedLang(lang);
    const langKeys = getAllKeys(langObj);
    const missing = baseKeys.filter((k) => !langKeys.includes(k));

    if (missing.length) {
      console.log(`\\nAdding ${missing.length} missing keys to ${lang}:`);

      // Group missing keys by JSON file
      const keysByFile = {};
      for (const key of missing) {
        const file = determineJsonFile(key);
        if (!keysByFile[file]) keysByFile[file] = [];
        keysByFile[file].push(key);
      }

      // Add missing keys to each JSON file
      for (const [jsonFile, keys] of Object.entries(keysByFile)) {
        const filePath = path.join(localesDir, jsonFile, `${lang}.json`);
        let fileContent = {};

        // Create directory if it doesn't exist
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        if (fs.existsSync(filePath)) {
          fileContent = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        }

        let updated = false;
        for (const key of keys) {
          const englishValue = getKeyValue(base, key);
          if (englishValue !== undefined && !fileContent[key]) {
            fileContent[key] = englishValue; // Use English as fallback
            updated = true;
            console.log(`  Added ${key} to ${jsonFile}/${lang}.json`);
          }
        }

        if (updated) {
          // Sort keys alphabetically for consistency
          const sortedContent = {};
          Object.keys(fileContent)
            .sort()
            .forEach((key) => {
              sortedContent[key] = fileContent[key];
            });

          fs.writeFileSync(filePath, JSON.stringify(sortedContent, null, 2) + "\n");
        }
      }
    }
  }

  console.log("\\nFinished adding missing translations!");
}

main();
