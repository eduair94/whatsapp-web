import langApiStatus from "~/i18n/locales/apiStatus/hi.json";
import langCountry from "~/i18n/locales/country/hi.json";
import lang from "~/i18n/locales/translations/hi.json";
import langVerification from "~/i18n/locales/verification/hi.json";

export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
    ...langVerification,
  };
});
