import langApiStatus from "~/i18n/locales/apiStatus/fr.json";
import langCountry from "~/i18n/locales/country/fr.json";
import seo from "~/i18n/locales/seo/fr.json";
import lang from "~/i18n/locales/translations/fr.json";
import langVerification from "~/i18n/locales/verification/fr.json";

export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
    ...langVerification,
    ...seo,
  };
});
