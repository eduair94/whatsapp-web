import langApiStatus from "~/i18n/locales/apiStatus/ko.json";
import langCountry from "~/i18n/locales/country/ko.json";
import seo from "~/i18n/locales/seo/ko.json";
import lang from "~/i18n/locales/translations/ko.json";
import langVerification from "~/i18n/locales/verification/ko.json";

export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
    ...langVerification,
    ...seo,
  };
});
