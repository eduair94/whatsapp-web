import langApiStatus from "~/i18n/locales/apiStatus/th.json";
import langCountry from "~/i18n/locales/country/th.json";
import lang from "~/i18n/locales/translations/th.json";
import langVerification from "~/i18n/locales/verification/th.json";

export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
    ...langVerification,
  };
});
