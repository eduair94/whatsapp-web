// scripts/check-missing-translations.js
// Usage: npm run check-missing-translations
// Checks for missing translation keys in all language files using en.ts as the base

const fs = require("fs");
const path = require("path");

const localesDir = path.join(__dirname, "../i18n/locales");
const baseLang = "en.ts";

function loadLang(file) {
  const filePath = path.join(localesDir, file);
  if (!fs.existsSync(filePath)) return {};
  // Support both export default and module.exports
  const content = fs.readFileSync(filePath, "utf-8");
  try {
    // Remove export default or module.exports =
    const json = content.replace(/^export default |module\.exports = /, "").replace(/;\s*$/, "");
    return eval("(" + json + ")");
  } catch (e) {
    console.error(`Failed to parse ${file}:`, e);
    return {};
  }
}

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

function main() {
  const base = loadMergedLang("en");
  if (!base) {
    console.error("Base language files not found for: en");
    process.exit(1);
  }
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

  let hasMissing = false;
  let output = "";

  // Create missing-translations directory
  const missingTranslationsDir = path.join(__dirname, "../missing-translations");
  if (!fs.existsSync(missingTranslationsDir)) {
    fs.mkdirSync(missingTranslationsDir, { recursive: true });
  }

  for (const lang of Array.from(allFiles).sort()) {
    const langObj = loadMergedLang(lang);
    const langKeys = getAllKeys(langObj);
    const missing = baseKeys.filter((k) => !langKeys.includes(k));

    if (missing.length) {
      hasMissing = true;
      output += `\nMissing in ${lang}:\n`;
      missing.forEach((k) => (output += "  " + k + "\n"));

      // Create individual JSON file for this language's missing translations
      const missingKeysObj = {};
      missing.forEach((key) => {
        missingKeysObj[key] = "";
      });

      const missingData = {
        language: lang,
        totalMissing: missing.length,
        generatedAt: new Date().toISOString(),
        missingKeys: missingKeysObj,
      };

      const langMissingFile = path.join(missingTranslationsDir, `${lang}.json`);
      fs.writeFileSync(langMissingFile, JSON.stringify(missingData, null, 2) + "\n");
      console.log(`Created missing translations file: missing-translations/${lang}.json (${missing.length} keys)`);
    }
  }

  if (!hasMissing) {
    output = "All translations are complete!\n";
    // Clean up missing-translations directory if all complete
    if (fs.existsSync(missingTranslationsDir)) {
      const existingFiles = fs.readdirSync(missingTranslationsDir);
      existingFiles.forEach((file) => {
        fs.unlinkSync(path.join(missingTranslationsDir, file));
      });
      fs.rmdirSync(missingTranslationsDir);
      console.log("Removed missing-translations directory - all translations complete!");
    }
  } else {
    // Create summary file
    const summaryData = {
      totalLanguages: Array.from(allFiles).length,
      languagesWithMissing: Array.from(allFiles).filter((lang) => {
        const langObj = loadMergedLang(lang);
        const langKeys = getAllKeys(langObj);
        const missing = baseKeys.filter((k) => !langKeys.includes(k));
        return missing.length > 0;
      }).length,
      generatedAt: new Date().toISOString(),
      languagesSummary: Array.from(allFiles)
        .sort()
        .map((lang) => {
          const langObj = loadMergedLang(lang);
          const langKeys = getAllKeys(langObj);
          const missing = baseKeys.filter((k) => !langKeys.includes(k));
          return {
            language: lang,
            missingCount: missing.length,
            completionPercentage: Math.round(((baseKeys.length - missing.length) / baseKeys.length) * 100),
          };
        }),
    };

    fs.writeFileSync(path.join(missingTranslationsDir, "_summary.json"), JSON.stringify(summaryData, null, 2) + "\n");
    console.log(`Created summary file: missing-translations/_summary.json`);
  }

  // Write to main file
  fs.writeFileSync(path.join(__dirname, "../missing-translations.txt"), output.trim());
  // Also print to console
  console.log(output.trim());
}

main();
