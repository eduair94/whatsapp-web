import langApiStatus from "~/i18n/locales/apiStatus/id.json";
import langCountry from "~/i18n/locales/country/id.json";
import seo from "~/i18n/locales/seo/id.json";
import lang from "~/i18n/locales/translations/id.json";
import langVerification from "~/i18n/locales/verification/id.json";

export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
    ...langVerification,
    ...seo,
  };
});
