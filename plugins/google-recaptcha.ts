import { VueReCaptcha } from "vue-recaptcha-v3";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueReCaptcha, {
    siteKey: "6LcTNcMUAAAAALfLcgD0y-A5e6t4vefcFNdeH5ED",
  } as any);
});
