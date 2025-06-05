import langApiStatus from "~/i18n/locales/apiStatus/pt.json";
import langCountry from "~/i18n/locales/country/pt.json";
import lang from "~/i18n/locales/translations/pt.json";
import langVerification from "~/i18n/locales/verification/pt.json";

export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
    ...langVerification,
  };
});
