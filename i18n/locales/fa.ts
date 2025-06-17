import langApiStatus from "~/i18n/locales/apiStatus/fa.json";
import langCountry from "~/i18n/locales/country/fa.json";
import seo from "~/i18n/locales/seo/fa.json";
import lang from "~/i18n/locales/translations/fa.json";
import langVerification from "~/i18n/locales/verification/fa.json";
export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
    ...langVerification,
    ...seo,
  };
});
