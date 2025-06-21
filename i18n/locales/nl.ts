import langApiStatus from "~/i18n/locales/apiStatus/nl.json";
import langCountry from "~/i18n/locales/country/nl.json";
import seo from "~/i18n/locales/seo/nl.json";
import lang from "~/i18n/locales/translations/nl.json";
import langVerification from "~/i18n/locales/verification/nl.json";

export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
    ...langVerification,
    ...seo,
  };
});
