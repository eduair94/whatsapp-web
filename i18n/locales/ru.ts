import langApiStatus from "~/i18n/locales/apiStatus/ru.json";
import langCountry from "~/i18n/locales/country/ru.json";
import lang from "~/i18n/locales/translations/ru.json";
import langVerification from "~/i18n/locales/verification/ru.json";

export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
    ...langVerification,
  };
});
