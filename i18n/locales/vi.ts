import langApiStatus from "~/i18n/locales/apiStatus/vi.json";
import langCountry from "~/i18n/locales/country/vi.json";
import seo from "~/i18n/locales/seo/vi.json";
import lang from "~/i18n/locales/translations/vi.json";
import langVerification from "~/i18n/locales/verification/vi.json";

export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
    ...langVerification,
    ...seo,
  };
});
