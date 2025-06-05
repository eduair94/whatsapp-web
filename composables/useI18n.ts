import { ref } from "vue";

export const languages = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "ru", label: "Русский" },
  { code: "hi", label: "हिन्दी" }, // Hindi
  { code: "my", label: "မြန်မာစာ" }, // Burmese
  { code: "de", label: "Deutsch" },
  { code: "ur", label: "اردو" },
  { code: "th", label: "ไทย" }, // Thai
  { code: "fa", label: "فارسی" }, // Persian
  { code: "it", label: "Italiano" },
];

export function useI18nAlt() {
  const nuxtApp = useNuxtApp();

  const language = ref("en");

  function setLanguage(lang: string) {
    language.value = lang;
    localStorage.setItem("lang", lang);
    nuxtApp.$i18n.setLocale(lang as any);
  }

  function t(key: string, extra?: any) {
    return nuxtApp.$i18n.t(key);
  }

  return {
    language,
    languages,
    setLanguage,
    setLocale: setLanguage,
    t,
    availableLocales: languages.map((lang) => lang.code),
    locale: nuxtApp.$i18n.locale,
  };
}
