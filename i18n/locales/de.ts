import langApiStatus from "~/i18n/locales/apiStatus/de.json";
import langCountry from "~/i18n/locales/country/de.json";
import lang from "~/i18n/locales/translations/de.json";

export default defineI18nLocale(async (locale) => {
  return {
    ...lang,
    ...langCountry,
    ...langApiStatus,
  };
});
