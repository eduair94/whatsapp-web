import langApiStatus from "~/i18n/locales/apiStatus/es.json";
import langCountry from "~/i18n/locales/country/es.json";
import lang from "~/i18n/locales/translations/es.json";
import langVerification from "~/i18n/locales/verification/es.json";

export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
    ...langVerification,
  };
});
