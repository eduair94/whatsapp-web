import langApiStatus from "~/i18n/locales/apiStatus/he.json";
import langCountry from "~/i18n/locales/country/he.json";
import seo from "~/i18n/locales/seo/he.json";
import lang from "~/i18n/locales/translations/he.json";
import langVerification from "~/i18n/locales/verification/he.json";

export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
    ...langVerification,
    ...seo,
  };
});
