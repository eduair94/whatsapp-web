import langApiStatus from "~/i18n/locales/apiStatus/it.json";
import langCountry from "~/i18n/locales/country/it.json";
import lang from "~/i18n/locales/translations/it.json";
import langVerification from "~/i18n/locales/verification/it.json";

export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
    ...langVerification,
  };
});
