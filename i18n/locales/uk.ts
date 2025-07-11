import langApiStatus from "~/i18n/locales/apiStatus/uk.json";
import langCountry from "~/i18n/locales/country/uk.json";
import seo from "~/i18n/locales/seo/uk.json";
import lang from "~/i18n/locales/translations/uk.json";
import langVerification from "~/i18n/locales/verification/uk.json";

export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
    ...langVerification,
    ...seo,
  };
});
