const fs = require("fs");
const path = require("path");

// Translation mappings for each language
const translations = {
  "it.json": {
    "challenge.error": "Verifica di sicurezza fallita",
    "challenge.solving": "Verificando che non sei un robot...",
    "challenge.verified": "Verifica di sicurezza completata",
    "lookup.includeTelegram": "Includi informazioni Telegram",
    "lookup.lastSync": "Ultima sincronizzazione",
    "lookup.now": "Ora",
    "status.apiRequests": "Richieste API",
    "status.otpDesc": "Controlla lo stato attuale e la disponibilità dell'API WhatsApp OTP.",
    "status.otpTitle": "Stato API OTP - API WhatsApp OTP",
    "status.rateLimitErrors": "Errori limite velocità",
    "status.rateLimited": "Limite velocità raggiunto",
    "status.telegramDesc": "Controlla lo stato attuale e la disponibilità dell'API Profilo Telegram.",
    "status.telegramTitle": "Stato API Telegram - API Profilo Telegram",
    "status.totalRequests": "Richieste totali",
    "status.websiteRequests": "Richieste sito web",
    "telegramStats.accountTypes": "Tipi di account",
    "telegramStats.cacheAge": "Età cache:",
    "telegramStats.code": "Codice",
    "telegramStats.country": "Paese",
    "telegramStats.detailedCountryStatistics": "Statistiche dettagliate per paese",
    "telegramStats.distribution": "Distribuzione",
    "telegramStats.errorFetching": "Errore nel recupero statistiche Telegram:",
    "telegramStats.failedToLoad": "Caricamento statistiche Telegram fallito",
    "telegramStats.fromCache": "Dalla cache",
    "telegramStats.last24Hours": "Ultime 24 ore",
    "telegramStats.lastSynchronized": "Ultima sincronizzazione:",
    "telegramStats.lastWeek": "Settimana scorsa",
    "telegramStats.liveData": "Dati in tempo reale",
    "telegramStats.loading": "Caricamento statistiche Telegram...",
    "telegramStats.numbers": "Numeri",
    "telegramStats.percentage": "Percentuale",
    "telegramStats.photoPercentage": "Percentuale foto",
    "telegramStats.photoStatistics": "Statistiche foto",
    "telegramStats.premiumStatistics": "Statistiche Premium",
    "telegramStats.subtitle": "Approfondimenti in tempo reale nel database numeri Telegram",
    "telegramStats.summaryStatistics": "Statistiche di riepilogo",
    "telegramStats.syncDuration": "Durata sincronizzazione",
    "telegramStats.title": "Statistiche Telegram",
    "telegramStats.topCountriesByUsage": "Paesi principali per utilizzo",
    "telegramStats.totalNumbers": "Numeri totali",
    "telegramStats.totalUsers": "Utenti totali",
    "telegramStats.users": "Utenti",
    "telegramStats.usersWithPhotos": "Utenti con foto",
    "telegramStats.usersWithoutPhotos": "Utenti senza foto",
    "telegramStats.verificationStatus": "Stato verifica",
    "telegramStats.withPhotos": "Con foto",
    "telegramStats.withoutPhotos": "Senza foto",
  },
  "pt.json": {
    "challenge.error": "Falha na verificação de segurança",
    "challenge.solving": "Verificando que você não é um robô...",
    "challenge.verified": "Verificação de segurança concluída",
    "lookup.includeTelegram": "Incluir informações do Telegram",
    "lookup.lastSync": "Última sincronização",
    "lookup.now": "Agora",
    "status.apiRequests": "Solicitações de API",
    "status.otpDesc": "Verifique o status atual e disponibilidade da API WhatsApp OTP.",
    "status.otpTitle": "Status da API OTP - API WhatsApp OTP",
    "status.rateLimitErrors": "Erros de limite de taxa",
    "status.rateLimited": "Limite de taxa atingido",
    "status.telegramDesc": "Verifique o status atual e disponibilidade da API Perfil Telegram.",
    "status.telegramTitle": "Status da API Telegram - API Perfil Telegram",
    "status.totalRequests": "Solicitações totais",
    "status.websiteRequests": "Solicitações do site",
    "telegramStats.accountTypes": "Tipos de conta",
    "telegramStats.cacheAge": "Idade do cache:",
    "telegramStats.code": "Código",
    "telegramStats.country": "País",
    "telegramStats.detailedCountryStatistics": "Estatísticas detalhadas por país",
    "telegramStats.distribution": "Distribuição",
    "telegramStats.errorFetching": "Erro ao buscar estatísticas do Telegram:",
    "telegramStats.failedToLoad": "Falha ao carregar estatísticas do Telegram",
    "telegramStats.fromCache": "Do cache",
    "telegramStats.last24Hours": "Últimas 24 horas",
    "telegramStats.lastSynchronized": "Última sincronização:",
    "telegramStats.lastWeek": "Última semana",
    "telegramStats.liveData": "Dados ao vivo",
    "telegramStats.loading": "Carregando estatísticas do Telegram...",
    "telegramStats.numbers": "Números",
    "telegramStats.percentage": "Porcentagem",
    "telegramStats.photoPercentage": "Porcentagem de fotos",
    "telegramStats.photoStatistics": "Estatísticas de fotos",
    "telegramStats.premiumStatistics": "Estatísticas Premium",
    "telegramStats.subtitle": "Insights em tempo real do banco de dados de números do Telegram",
    "telegramStats.summaryStatistics": "Estatísticas de resumo",
    "telegramStats.syncDuration": "Duração da sincronização",
    "telegramStats.title": "Estatísticas do Telegram",
    "telegramStats.topCountriesByUsage": "Principais países por uso",
    "telegramStats.totalNumbers": "Números totais",
    "telegramStats.totalUsers": "Usuários totais",
    "telegramStats.users": "Usuários",
    "telegramStats.usersWithPhotos": "Usuários com fotos",
    "telegramStats.usersWithoutPhotos": "Usuários sem fotos",
    "telegramStats.verificationStatus": "Status de verificação",
    "telegramStats.withPhotos": "Com fotos",
    "telegramStats.withoutPhotos": "Sem fotos",
  },
  "ru.json": {
    "challenge.error": "Ошибка проверки безопасности",
    "challenge.solving": "Проверяем, что вы не робот...",
    "challenge.verified": "Проверка безопасности завершена",
    "lookup.includeTelegram": "Включить информацию Telegram",
    "lookup.lastSync": "Последняя синхронизация",
    "lookup.now": "Сейчас",
    "status.apiRequests": "API запросы",
    "status.otpDesc": "Проверьте текущий статус и доступность WhatsApp OTP API.",
    "status.otpTitle": "Статус OTP API - WhatsApp OTP API",
    "status.rateLimitErrors": "Ошибки лимита скорости",
    "status.rateLimited": "Лимит скорости достигнут",
    "status.telegramDesc": "Проверьте текущий статус и доступность Telegram Profile API.",
    "status.telegramTitle": "Статус Telegram API - Telegram Profile API",
    "status.totalRequests": "Всего запросов",
    "status.websiteRequests": "Запросы сайта",
    "telegramStats.accountTypes": "Типы аккаунтов",
    "telegramStats.cacheAge": "Возраст кэша:",
    "telegramStats.code": "Код",
    "telegramStats.country": "Страна",
    "telegramStats.detailedCountryStatistics": "Подробная статистика по странам",
    "telegramStats.distribution": "Распределение",
    "telegramStats.errorFetching": "Ошибка получения статистики Telegram:",
    "telegramStats.failedToLoad": "Не удалось загрузить статистику Telegram",
    "telegramStats.fromCache": "Из кэша",
    "telegramStats.last24Hours": "Последние 24 часа",
    "telegramStats.lastSynchronized": "Последняя синхронизация:",
    "telegramStats.lastWeek": "Прошлая неделя",
    "telegramStats.liveData": "Данные в реальном времени",
    "telegramStats.loading": "Загрузка статистики Telegram...",
    "telegramStats.numbers": "Номера",
    "telegramStats.percentage": "Процент",
    "telegramStats.photoPercentage": "Процент фото",
    "telegramStats.photoStatistics": "Статистика фото",
    "telegramStats.premiumStatistics": "Статистика Premium",
    "telegramStats.subtitle": "Аналитика базы данных номеров Telegram в реальном времени",
    "telegramStats.summaryStatistics": "Сводная статистика",
    "telegramStats.syncDuration": "Длительность синхронизации",
    "telegramStats.title": "Статистика Telegram",
    "telegramStats.topCountriesByUsage": "Топ стран по использованию",
    "telegramStats.totalNumbers": "Всего номеров",
    "telegramStats.totalUsers": "Всего пользователей",
    "telegramStats.users": "Пользователи",
    "telegramStats.usersWithPhotos": "Пользователи с фото",
    "telegramStats.usersWithoutPhotos": "Пользователи без фото",
    "telegramStats.verificationStatus": "Статус верификации",
    "telegramStats.withPhotos": "С фото",
    "telegramStats.withoutPhotos": "Без фото",
  },
  "nl.json": {
    "challenge.error": "Beveiligingsverificatie mislukt",
    "challenge.solving": "Controleren of je geen robot bent...",
    "challenge.verified": "Beveiligingsverificatie voltooid",
    "lookup.includeTelegram": "Telegram-informatie opnemen",
    "lookup.lastSync": "Laatste synchronisatie",
    "lookup.now": "Nu",
    "status.apiRequests": "API-verzoeken",
    "status.otpDesc": "Controleer de huidige status en beschikbaarheid van de WhatsApp OTP API.",
    "status.otpTitle": "OTP API Status - WhatsApp OTP API",
    "status.rateLimitErrors": "Tarieflimieten fouten",
    "status.rateLimited": "Tariefbeperkt",
    "status.telegramDesc": "Controleer de huidige status en beschikbaarheid van de Telegram Profiel API.",
    "status.telegramTitle": "Telegram API Status - Telegram Profiel API",
    "status.totalRequests": "Totaal verzoeken",
    "status.websiteRequests": "Website verzoeken",
    "telegramStats.accountTypes": "Accounttypen",
    "telegramStats.cacheAge": "Cache leeftijd:",
    "telegramStats.code": "Code",
    "telegramStats.country": "Land",
    "telegramStats.detailedCountryStatistics": "Gedetailleerde landstatistieken",
    "telegramStats.distribution": "Distributie",
    "telegramStats.errorFetching": "Fout bij ophalen Telegram statistieken:",
    "telegramStats.failedToLoad": "Kon Telegram statistieken niet laden",
    "telegramStats.fromCache": "Uit cache",
    "telegramStats.last24Hours": "Laatste 24 uur",
    "telegramStats.lastSynchronized": "Laatst gesynchroniseerd:",
    "telegramStats.lastWeek": "Vorige week",
    "telegramStats.liveData": "Live gegevens",
    "telegramStats.loading": "Telegram statistieken laden...",
    "telegramStats.numbers": "Nummers",
    "telegramStats.percentage": "Percentage",
    "telegramStats.photoPercentage": "Foto percentage",
    "telegramStats.photoStatistics": "Foto statistieken",
    "telegramStats.premiumStatistics": "Premium statistieken",
    "telegramStats.subtitle": "Real-time inzichten in Telegram nummers database",
    "telegramStats.summaryStatistics": "Samenvatting statistieken",
    "telegramStats.syncDuration": "Synchronisatie duur",
    "telegramStats.title": "Telegram Statistieken",
    "telegramStats.topCountriesByUsage": "Top landen op gebruik",
    "telegramStats.totalNumbers": "Totaal nummers",
    "telegramStats.totalUsers": "Totaal gebruikers",
    "telegramStats.users": "Gebruikers",
    "telegramStats.usersWithPhotos": "Gebruikers met foto's",
    "telegramStats.usersWithoutPhotos": "Gebruikers zonder foto's",
    "telegramStats.verificationStatus": "Verificatiestatus",
    "telegramStats.withPhotos": "Met foto's",
    "telegramStats.withoutPhotos": "Zonder foto's",
  },
};

// Define more comprehensive translation mappings for remaining languages
const additionalTranslations = {
  "ja.json": {
    "challenge.error": "セキュリティ認証に失敗しました",
    "challenge.solving": "あなたがロボットではないことを確認しています...",
    "challenge.verified": "セキュリティ認証完了",
    "lookup.includeTelegram": "Telegram情報を含める",
    "lookup.lastSync": "最終同期",
    "lookup.now": "今",
    "status.apiRequests": "APIリクエスト",
    "status.totalRequests": "総リクエスト数",
    "status.websiteRequests": "ウェブサイトリクエスト",
    "telegramStats.accountTypes": "アカウントタイプ",
    "telegramStats.title": "Telegram統計",
    "telegramStats.users": "ユーザー",
    "telegramStats.numbers": "番号",
    "telegramStats.percentage": "パーセンテージ",
  },
  "ko.json": {
    "challenge.error": "보안 인증 실패",
    "challenge.solving": "로봇이 아님을 확인하는 중...",
    "challenge.verified": "보안 인증 완료",
    "lookup.includeTelegram": "Telegram 정보 포함",
    "lookup.lastSync": "마지막 동기화",
    "lookup.now": "지금",
    "status.apiRequests": "API 요청",
    "status.totalRequests": "총 요청",
    "status.websiteRequests": "웹사이트 요청",
    "telegramStats.accountTypes": "계정 유형",
    "telegramStats.title": "Telegram 통계",
    "telegramStats.users": "사용자",
    "telegramStats.numbers": "번호",
    "telegramStats.percentage": "퍼센트",
  },
  "ar.json": {
    "challenge.error": "فشل التحقق الأمني",
    "challenge.solving": "التحقق من أنك لست روبوتاً...",
    "challenge.verified": "اكتمل التحقق الأمني",
    "lookup.includeTelegram": "تضمين معلومات تليجرام",
    "lookup.lastSync": "آخر مزامنة",
    "lookup.now": "الآن",
    "status.apiRequests": "طلبات API",
    "status.totalRequests": "إجمالي الطلبات",
    "status.websiteRequests": "طلبات الموقع",
    "telegramStats.accountTypes": "أنواع الحسابات",
    "telegramStats.title": "إحصائيات تليجرام",
    "telegramStats.users": "المستخدمون",
    "telegramStats.numbers": "الأرقام",
    "telegramStats.percentage": "النسبة المئوية",
  },
  "zh.json": {
    "challenge.error": "安全验证失败",
    "challenge.solving": "正在验证您不是机器人...",
    "challenge.verified": "安全验证完成",
    "lookup.includeTelegram": "包含Telegram信息",
    "lookup.lastSync": "最后同步",
    "lookup.now": "现在",
    "status.apiRequests": "API请求",
    "status.totalRequests": "总请求数",
    "status.websiteRequests": "网站请求",
    "telegramStats.accountTypes": "账户类型",
    "telegramStats.title": "Telegram统计",
    "telegramStats.users": "用户",
    "telegramStats.numbers": "号码",
    "telegramStats.percentage": "百分比",
  },
  "hi.json": {
    "challenge.error": "सुरक्षा सत्यापन विफल",
    "challenge.solving": "सत्यापित कर रहे हैं कि आप रोबोट नहीं हैं...",
    "challenge.verified": "सुरक्षा सत्यापन पूर्ण",
    "lookup.includeTelegram": "टेलीग्राम जानकारी शामिल करें",
    "lookup.lastSync": "अंतिम सिंक",
    "lookup.now": "अभी",
    "status.apiRequests": "API अनुरोध",
    "status.totalRequests": "कुल अनुरोध",
    "status.websiteRequests": "वेबसाइट अनुरोध",
    "telegramStats.accountTypes": "खाता प्रकार",
    "telegramStats.title": "टेलीग्राम सांख्यिकी",
    "telegramStats.users": "उपयोगकर्ता",
    "telegramStats.numbers": "संख्याएं",
    "telegramStats.percentage": "प्रतिशत",
  },
  "tr.json": {
    "challenge.error": "Güvenlik doğrulaması başarısız",
    "challenge.solving": "Robot olmadığınızı doğruluyoruz...",
    "challenge.verified": "Güvenlik doğrulaması tamamlandı",
    "lookup.includeTelegram": "Telegram bilgilerini dahil et",
    "lookup.lastSync": "Son senkronizasyon",
    "lookup.now": "Şimdi",
    "status.apiRequests": "API istekleri",
    "status.totalRequests": "Toplam istekler",
    "status.websiteRequests": "Web sitesi istekleri",
    "telegramStats.accountTypes": "Hesap türleri",
    "telegramStats.title": "Telegram İstatistikleri",
    "telegramStats.users": "Kullanıcılar",
    "telegramStats.numbers": "Numaralar",
    "telegramStats.percentage": "Yüzde",
  },
};

// Merge the translation sets
Object.assign(translations, additionalTranslations);

const translationsDir = path.join(__dirname, "i18n", "locales", "translations");

// Process each language file
Object.keys(translations).forEach((filename) => {
  const filePath = path.join(translationsDir, filename);

  if (!fs.existsSync(filePath)) {
    console.log(`File ${filename} not found, skipping...`);
    return;
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(content);

    // Apply translations
    const langTranslations = translations[filename];
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
          data[key] === "Total Requests" ||
          data[key] === "Website Requests" ||
          data[key] === "Account Types" ||
          data[key] === "Cache age:" ||
          data[key] === "Code" ||
          data[key] === "Country" ||
          data[key] === "Telegram Statistics" ||
          data[key] === "Users" ||
          data[key] === "Numbers" ||
          data[key] === "Percentage")
      ) {
        data[key] = langTranslations[key];
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
      console.log(`Fixed translations in ${filename}`);
    }
  } catch (error) {
    console.error(`Error processing ${filename}:`, error);
  }
});

console.log("Translation fix complete!");
