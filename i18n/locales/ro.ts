import langApiStatus from "~/i18n/locales/apiStatus/ro.json";
import langCountry from "~/i18n/locales/country/ro.json";
import seo from "~/i18n/locales/seo/ro.json";
import lang from "~/i18n/locales/translations/ro.json";
import langVerification from "~/i18n/locales/verification/ro.json";

export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
    ...langVerification,
    ...seo,
  };
});
