const fs = require("fs");
const path = require("path");

// Specific fixes for cache age translations
const cacheAgeTranslations = {
  "ar.json": "عمر الذاكرة المؤقتة:",
  "fa.json": "سن کش:",
  "hi.json": "कैश आयु:",
  "ja.json": "キャッシュ年齢:",
  "ko.json": "캐시 수명:",
  "my.json": "Cache သက်တမ်း:",
  "th.json": "อายุแคช:",
  "tr.json": "Önbellek yaşı:",
  "ur.json": "کیش کی عمر:",
  "vi.json": "Tuổi cache:",
  "zh.json": "缓存年龄:",
};

const translationsDir = path.join(__dirname, "i18n", "locales", "translations");

Object.keys(cacheAgeTranslations).forEach((filename) => {
  const filePath = path.join(translationsDir, filename);

  if (!fs.existsSync(filePath)) {
    console.log(`File ${filename} not found, skipping...`);
    return;
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(content);

    if (data["telegramStats.cacheAge"] === "Cache age:") {
      data["telegramStats.cacheAge"] = cacheAgeTranslations[filename];
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
      console.log(`Fixed cache age translation in ${filename}`);
    }
  } catch (error) {
    console.error(`Error processing ${filename}:`, error);
  }
});

console.log("Cache age translation fixes complete!");
