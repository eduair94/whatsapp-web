import langApiStatus from "~/i18n/locales/apiStatus/ur.json";
import langCountry from "~/i18n/locales/country/ur.json";
import seo from "~/i18n/locales/seo/ur.json";
import lang from "~/i18n/locales/translations/ur.json";
import langVerification from "~/i18n/locales/verification/ur.json";

export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
    ...langVerification,
    ...seo,
  };
});
