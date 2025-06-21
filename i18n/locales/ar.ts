import langApiStatus from "~/i18n/locales/apiStatus/ar.json";
import langCountry from "~/i18n/locales/country/ar.json";
import seo from "~/i18n/locales/seo/ar.json";
import lang from "~/i18n/locales/translations/ar.json";
import langVerification from "~/i18n/locales/verification/ar.json";

export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
    ...langVerification,
    ...seo,
  };
});
