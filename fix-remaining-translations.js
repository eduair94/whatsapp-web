const fs = require("fs");
const path = require("path");

// Additional translations for remaining languages
const remainingTranslations = {
  "id.json": {
    "challenge.error": "Verifikasi keamanan gagal",
    "challenge.solving": "Memverifikasi bahwa Anda bukan robot...",
    "challenge.verified": "Verifikasi keamanan selesai",
    "lookup.includeTelegram": "Sertakan informasi Telegram",
    "lookup.lastSync": "Sinkronisasi terakhir",
    "lookup.now": "Sekarang",
    "status.apiRequests": "Permintaan API",
    "status.otpDesc": "Periksa status terkini dan ketersediaan API WhatsApp OTP.",
    "status.otpTitle": "Status API OTP - API WhatsApp OTP",
    "status.rateLimitErrors": "Kesalahan batas kecepatan",
    "status.rateLimited": "Batas kecepatan tercapai",
    "status.telegramDesc": "Periksa status terkini dan ketersediaan API Profil Telegram.",
    "status.telegramTitle": "Status API Telegram - API Profil Telegram",
    "status.totalRequests": "Total permintaan",
    "status.websiteRequests": "Permintaan situs web",
    "telegramStats.accountTypes": "Jenis akun",
    "telegramStats.cacheAge": "Usia cache:",
    "telegramStats.code": "Kode",
    "telegramStats.country": "Negara",
    "telegramStats.detailedCountryStatistics": "Statistik negara terperinci",
    "telegramStats.distribution": "Distribusi",
    "telegramStats.errorFetching": "Kesalahan mengambil statistik Telegram:",
    "telegramStats.failedToLoad": "Gagal memuat statistik Telegram",
    "telegramStats.fromCache": "Dari cache",
    "telegramStats.last24Hours": "24 jam terakhir",
    "telegramStats.lastSynchronized": "Terakhir disinkronkan:",
    "telegramStats.lastWeek": "Minggu lalu",
    "telegramStats.liveData": "Data langsung",
    "telegramStats.loading": "Memuat statistik Telegram...",
    "telegramStats.numbers": "Nomor",
    "telegramStats.percentage": "Persentase",
    "telegramStats.photoPercentage": "Persentase foto",
    "telegramStats.photoStatistics": "Statistik foto",
    "telegramStats.premiumStatistics": "Statistik Premium",
    "telegramStats.subtitle": "Wawasan real-time ke database nomor Telegram",
    "telegramStats.summaryStatistics": "Statistik ringkasan",
    "telegramStats.syncDuration": "Durasi sinkronisasi",
    "telegramStats.title": "Statistik Telegram",
    "telegramStats.topCountriesByUsage": "Negara teratas berdasarkan penggunaan",
    "telegramStats.totalNumbers": "Total nomor",
    "telegramStats.totalUsers": "Total pengguna",
    "telegramStats.users": "Pengguna",
    "telegramStats.usersWithPhotos": "Pengguna dengan foto",
    "telegramStats.usersWithoutPhotos": "Pengguna tanpa foto",
    "telegramStats.verificationStatus": "Status verifikasi",
    "telegramStats.withPhotos": "Dengan foto",
    "telegramStats.withoutPhotos": "Tanpa foto",
  },
  "my.json": {
    "challenge.error": "လုံခြုံရေးစိစစ်မှု မအောင်မြင်ပါ",
    "challenge.solving": "သင်သည် ရိုဘော့မဟုတ်ကြောင်း စိစစ်နေပါသည်...",
    "challenge.verified": "လုံခြုံရေးစိစစ်မှု ပြီးမြောက်ပါပြီ",
    "lookup.includeTelegram": "Telegram အချက်အလက်များ ပါဝင်အောင်လုပ်ရန်",
    "lookup.lastSync": "နောက်ဆုံး ထပ်တူကျမှု",
    "lookup.now": "ယခု",
    "status.apiRequests": "API တောင်းခံမှုများ",
    "status.totalRequests": "စုစုပေါင်း တောင်းခံမှုများ",
    "status.websiteRequests": "ဝဘ်ဆိုက် တောင်းခံမှုများ",
    "telegramStats.accountTypes": "အကောင့် အမျိုးအစားများ",
    "telegramStats.title": "Telegram စာရင်းအင်းများ",
    "telegramStats.users": "သုံးစွဲသူများ",
    "telegramStats.numbers": "နံပါတ်များ",
    "telegramStats.percentage": "ရာခိုင်နှုန်း",
  },
  "th.json": {
    "challenge.error": "การตรวจสอบความปลอดภัยล้มเหลว",
    "challenge.solving": "กำลังตรวจสอบว่าคุณไม่ใช่หุ่นยนต์...",
    "challenge.verified": "การตรวจสอบความปลอดภัยเสร็จสิ้น",
    "lookup.includeTelegram": "รวมข้อมูล Telegram",
    "lookup.lastSync": "การซิงค์ล่าสุด",
    "lookup.now": "ตอนนี้",
    "status.apiRequests": "คำขอ API",
    "status.totalRequests": "คำขอทั้งหมด",
    "status.websiteRequests": "คำขอเว็บไซต์",
    "telegramStats.accountTypes": "ประเภทบัญชี",
    "telegramStats.title": "สถิติ Telegram",
    "telegramStats.users": "ผู้ใช้",
    "telegramStats.numbers": "หมายเลข",
    "telegramStats.percentage": "เปอร์เซ็นต์",
  },
  "vi.json": {
    "challenge.error": "Xác minh bảo mật thất bại",
    "challenge.solving": "Đang xác minh bạn không phải robot...",
    "challenge.verified": "Xác minh bảo mật hoàn tất",
    "lookup.includeTelegram": "Bao gồm thông tin Telegram",
    "lookup.lastSync": "Đồng bộ lần cuối",
    "lookup.now": "Bây giờ",
    "status.apiRequests": "Yêu cầu API",
    "status.totalRequests": "Tổng yêu cầu",
    "status.websiteRequests": "Yêu cầu trang web",
    "telegramStats.accountTypes": "Loại tài khoản",
    "telegramStats.title": "Thống kê Telegram",
    "telegramStats.users": "Người dùng",
    "telegramStats.numbers": "Số",
    "telegramStats.percentage": "Tỷ lệ phần trăm",
  },
  "ur.json": {
    "challenge.error": "سیکیورٹی تصدیق ناکام",
    "challenge.solving": "تصدیق کر رہے ہیں کہ آپ روبوٹ نہیں ہیں...",
    "challenge.verified": "سیکیورٹی تصدیق مکمل",
    "lookup.includeTelegram": "ٹیلیگرام کی معلومات شامل کریں",
    "lookup.lastSync": "آخری ہم آہنگی",
    "lookup.now": "اب",
    "status.apiRequests": "API درخواستیں",
    "status.totalRequests": "کل درخواستیں",
    "status.websiteRequests": "ویب سائٹ درخواستیں",
    "telegramStats.accountTypes": "اکاؤنٹ کی اقسام",
    "telegramStats.title": "ٹیلیگرام کے اعداد و شمار",
    "telegramStats.users": "صارفین",
    "telegramStats.numbers": "نمبرز",
    "telegramStats.percentage": "فیصد",
  },
  "fa.json": {
    "challenge.error": "تأیید امنیت ناموفق",
    "challenge.solving": "در حال تأیید اینکه شما ربات نیستید...",
    "challenge.verified": "تأیید امنیت کامل شد",
    "lookup.includeTelegram": "شامل اطلاعات تلگرام",
    "lookup.lastSync": "آخرین همگام‌سازی",
    "lookup.now": "اکنون",
    "status.apiRequests": "درخواست‌های API",
    "status.totalRequests": "کل درخواست‌ها",
    "status.websiteRequests": "درخواست‌های وب‌سایت",
    "telegramStats.accountTypes": "انواع حساب",
    "telegramStats.title": "آمار تلگرام",
    "telegramStats.users": "کاربران",
    "telegramStats.numbers": "شماره‌ها",
    "telegramStats.percentage": "درصد",
  },
};

const translationsDir = path.join(__dirname, "i18n", "locales", "translations");

// Process each remaining language file
Object.keys(remainingTranslations).forEach((filename) => {
  const filePath = path.join(translationsDir, filename);

  if (!fs.existsSync(filePath)) {
    console.log(`File ${filename} not found, skipping...`);
    return;
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(content);

    // Apply translations
    const langTranslations = remainingTranslations[filename];
    let modified = false;

    Object.keys(langTranslations).forEach((key) => {
      if (
        data[key] &&
        (data[key] === "Security verification failed" ||
          data[key] === "Verifying you're not a robot..." ||
          data[key] === "Security verification complete" ||
          data[key] === "Include Telegram information" ||
          data[key] === "Last Sync" ||
          data[key] === "Now" ||
          data[key] === "API Requests" ||
          data[key] === "Check the current status and uptime of the WhatsApp OTP API." ||
          data[key] === "OTP API Status - WhatsApp OTP API" ||
          data[key] === "Rate Limit Errors" ||
          data[key] === "Rate Limited" ||
          data[key] === "Check the current status and uptime of the Telegram Profile API." ||
          data[key] === "Telegram API Status - Telegram Profile API" ||
          data[key] === "Total Requests" ||
          data[key] === "Website Requests" ||
          data[key] === "Account Types" ||
          data[key] === "Cache age:" ||
          data[key] === "Code" ||
          data[key] === "Country" ||
          data[key] === "Detailed Country Statistics" ||
          data[key] === "Distribution" ||
          data[key] === "Error fetching Telegram statistics:" ||
          data[key] === "Failed to load Telegram statistics" ||
          data[key] === "From Cache" ||
          data[key] === "Last 24 Hours" ||
          data[key] === "Last synchronized:" ||
          data[key] === "Last Week" ||
          data[key] === "Live Data" ||
          data[key] === "Loading Telegram statistics..." ||
          data[key] === "Numbers" ||
          data[key] === "Percentage" ||
          data[key] === "Photo Percentage" ||
          data[key] === "Photo Statistics" ||
          data[key] === "Premium Statistics" ||
          data[key] === "Real-time insights into Telegram numbers database" ||
          data[key] === "Summary Statistics" ||
          data[key] === "Sync Duration" ||
          data[key] === "Telegram Statistics" ||
          data[key] === "Top Countries by Usage" ||
          data[key] === "Total Numbers" ||
          data[key] === "Total Users" ||
          data[key] === "Users" ||
          data[key] === "Users with Photos" ||
          data[key] === "Users without Photos" ||
          data[key] === "Verification Status" ||
          data[key] === "With Photos" ||
          data[key] === "Without Photos")
      ) {
        data[key] = langTranslations[key];
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
      console.log(`Fixed remaining translations in ${filename}`);
    }
  } catch (error) {
    console.error(`Error processing ${filename}:`, error);
  }
});

console.log("Remaining translation fixes complete!");
