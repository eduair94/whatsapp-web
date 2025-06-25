import axios from "axios";

export default defineNuxtPlugin((nuxtApp) => {
  let api = axios.create({
    headers: {
      common: {},
    },
  });

  return {
    provide: {
      api: api,
    },
  };
});
