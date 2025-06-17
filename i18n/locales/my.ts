import langApiStatus from "~/i18n/locales/apiStatus/my.json";
import langCountry from "~/i18n/locales/country/my.json";
import seo from "~/i18n/locales/seo/my.json";
import lang from "~/i18n/locales/translations/my.json";
import langVerification from "~/i18n/locales/verification/my.json";

export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
    ...langVerification,
    ...seo,
  };
});
