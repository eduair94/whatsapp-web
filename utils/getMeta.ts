import type { LocaleObject } from "@nuxtjs/i18n";
import type { RouteLocationNormalizedLoaded } from "vue-router";
export const getMeta = (pageUrl: globalThis.ComputedRef<string>, baseUrl: string, route: RouteLocationNormalizedLoaded, locales: globalThis.ComputedRef<LocaleObject<"en" | "es" | "pt" | "ru" | "hi" | "my" | "de" | "ur" | "th" | "fa" | "it">[]>) => {
  return {
    link: [
      { rel: "canonical", href: pageUrl.value },
      ...locales.value.map(({ code }) => {
        return { rel: "alternate", href: `${baseUrl}/${code}${route.path}`, hreflang: code };
      }),
    ],
  };
};
