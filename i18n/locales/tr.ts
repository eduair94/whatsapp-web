import langApiStatus from "~/i18n/locales/apiStatus/tr.json";
import langCountry from "~/i18n/locales/country/tr.json";
import seo from "~/i18n/locales/seo/tr.json";
import lang from "~/i18n/locales/translations/tr.json";
import langVerification from "~/i18n/locales/verification/tr.json";

export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
    ...langVerification,
    ...seo,
  };
});
