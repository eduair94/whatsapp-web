import langApiStatus from "~/i18n/locales/apiStatus/pl.json";
import langCountry from "~/i18n/locales/country/pl.json";
import seo from "~/i18n/locales/seo/pl.json";
import lang from "~/i18n/locales/translations/pl.json";
import langVerification from "~/i18n/locales/verification/pl.json";

export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
    ...langVerification,
    ...seo,
  };
});
