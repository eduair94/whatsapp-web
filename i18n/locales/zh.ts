import langApiStatus from "~/i18n/locales/apiStatus/zh.json";
import langCountry from "~/i18n/locales/country/zh.json";
import seo from "~/i18n/locales/seo/zh.json";
import lang from "~/i18n/locales/translations/zh.json";
import langVerification from "~/i18n/locales/verification/zh.json";

export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
    ...langVerification,
    ...seo,
  };
});
