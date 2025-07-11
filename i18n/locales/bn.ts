import langApiStatus from "~/i18n/locales/apiStatus/bn.json";
import langCountry from "~/i18n/locales/country/bn.json";
import seo from "~/i18n/locales/seo/bn.json";
import lang from "~/i18n/locales/translations/bn.json";
import langVerification from "~/i18n/locales/verification/bn.json";

export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
    ...langVerification,
    ...seo,
  };
});
