import langApiStatus from "~/i18n/locales/apiStatus/en.json";
import langCountry from "~/i18n/locales/country/en.json";
import seo from "~/i18n/locales/seo/en.json";
import lang from "~/i18n/locales/translations/en.json";
import langVerification from "~/i18n/locales/verification/en.json";

export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
    ...langVerification,
    ...seo,
  };
});
