import langApiStatus from "~/i18n/locales/apiStatus/ja.json";
import langCountry from "~/i18n/locales/country/ja.json";
import seo from "~/i18n/locales/seo/ja.json";
import lang from "~/i18n/locales/translations/ja.json";
import langVerification from "~/i18n/locales/verification/ja.json";

export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
    ...langVerification,
    ...seo,
  };
});
