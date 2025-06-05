<template>
  <div class="py-5 px-3 px-md-0">
    <h1 class="mb-5 mb-md-8 text-center">{{ t("verification.title") }}</h1>
    <v-form @submit.prevent="submit">
      <div class="d-flex phone">
        <v-autocomplete return-object :disabled="loading" variant="outlined" hide-details required v-model="phoneCode" class="phone--code" :filter="customFilter" max-width="118px" item-title="countryWithCode" autocomplete="off" data-lpignore="true" data-form-type="other" :label="t('lookup.country')" :items="phoneCodesWithCountry">
          <template #selection="{ item }">
            <span>+{{ item.raw.code }}</span>
          </template>
          <template #item="{ props, item }">
            <v-list-item v-bind="props" :title="item.raw.countryWithCode" :subtitle="'+' + item.raw.code" />
          </template>
        </v-autocomplete>
        <v-text-field :disabled="loading" v-model="phoneNumber" autocomplete="off" data-lpignore="true" data-form-type="other" class="phone--number" variant="outlined" tile type="tel" hide-details :label="t('verification.inputLabel')" required />
      </div>
      <div class="text-center pt-5">
        <v-btn :disabled="!phoneValid" type="submit" :loading="loading" size="large" color="primary">{{ t("verification.button") }}</v-btn>
      </div>
    </v-form>
    <v-container>
      <v-alert v-if="!phoneValid" class="text-body-2 alert-send-button mx-auto mt-5" type="info" :text="t('verification.infoMessage')" density="compact"></v-alert>
      <div v-if="verificationResponse" class="mt-5">
        <v-row>
          <v-col cols="12" md="6">
            <div class="d-flex flex-wrap gap-10">
              <v-btn color="primary" target="_blank" link :href="verificationResponse.whatsappLink">{{ t("verification.verifyLink") }}</v-btn>
              <v-btn @click.prevent="resetVerification" color="secondary">{{ t("verification.reset") }}</v-btn>
            </div>
            <div class="mt-4">
              <v-alert :type="statusColor(verificationResponse.status)" border="start" prominent class="text-body-1">
                <template #title>{{ t("verification.statusTitle") }}</template>
                <span>{{ verificationResponse.status || t("verification.status.unknown") }}</span>
              </v-alert>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <h3>{{ t("verification.responseTitle") }}</h3>
            <v-textarea rows="10" :model-value="stringify(verificationResponse)" readonly />
          </v-col>
        </v-row>
      </div>
      <div v-if="statusResponse" class="mt-5">
        <h3>{{ t("verification.statusResponseTitle") }}</h3>
        <v-textarea rows="10" :model-value="stringify(statusResponse)" readonly />
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { useHead, useI18n, useLocalePath, useRoute, useRouter } from "#imports";
import parsePhoneNumber from "libphonenumber-js";
import { computed, nextTick, onMounted, ref } from "vue";
import { useReCaptcha } from "vue-recaptcha-v3";
import { useSearchHistory } from "~/composables/useSearchHistory";
import type { PhoneCode } from "~/utils/interfaces/phone.interface";
import { phoneCodes } from "~/utils/phoneCodes";

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const localePath = useLocalePath();
const { addSearchToHistory, initializeStorage } = useSearchHistory();
const loading = ref(false);
const loadingStatus = ref(false);
const phoneNumber = ref("");
const phoneCode = ref({
  code: "",
  countryWithCode: "",
  countryTranslated: "",
} as PhoneCode);
const verificationResponse = ref<any>(null);
const statusResponse = ref<any>(null);
const verificationSent = ref(false);
const recaptchaInstance = useReCaptcha();
const { $api } = useNuxtApp();

const phoneValid = computed(() => {
  const phoneNumberFull = phoneCode.value.code + phoneNumber.value.trim();
  const phone = parsePhoneNumber("+" + phoneNumberFull);
  if (!phone) return false;
  return phone.isValid(); // Adjust this based on your validation needs
});

const phoneCodesWithCountry = computed(() =>
  phoneCodes.map(
    (pc) =>
      ({
        ...pc,
        countryWithCode: `${t(`country.${pc.country}`) || pc.country} (+${pc.code})`,
        countryTranslated: t(`country.${pc.country}`) || pc.country,
      } as PhoneCode)
  )
);

const customFilter = (item: any, queryText: string): boolean => {
  if (!item || !item.countryWithCode) return false;
  const searchText = queryText.toLowerCase();
  return item.countryWithCode.toLowerCase().includes(searchText) || item.countryTranslated.toLowerCase().includes(searchText) || item.code.includes(searchText);
};

const stringify = (data: any): string => {
  return JSON.stringify(data, null, 2);
};

const recaptcha = async (): Promise<string | undefined> => {
  // optional you can await for the reCaptcha load
  await recaptchaInstance?.recaptchaLoaded();

  // get the token, a custom action could be added as argument to the method
  const token = await recaptchaInstance?.executeRecaptcha("verification");

  return token;
};

const submit = async (): Promise<void> => {
  if (phoneCode.value.code && phoneNumber.value) {
    // If the phone number route is the same as the current one, just search
    const phoneValue = `${phoneCode.value.code}${phoneNumber.value}`;
    if ((route.params.number as string) === phoneValue) {
      await sendVerification();
      return;
    }
    await router.push(localePath(`/verification/${phoneValue}`));
  }
};

const resetVerification = async () => {
  if (!import.meta.client) return;

  const reset = 1;
  loading.value = true;
  statusResponse.value = null;
  verificationSent.value = false;
  try {
    const token = await recaptcha();
    if (!token) {
      throw new Error("Failed to get ReCaptcha token");
    }

    const phone = verificationResponse.value?.phoneNumber;
    if (!phone) throw new Error("No phone number found in verification response");
    const response = await $api.get(`/api/verification/${phone}?token=${token}&reset=${reset}`);
    verificationResponse.value = response.data;
    verificationSent.value = true;
  } catch (error: any) {
    console.error("Reset verification error:", error);
    if (error.message?.includes("ReCaptcha")) {
      verificationResponse.value = { error: "ReCaptcha verification failed. Please refresh the page and try again." };
    } else {
      verificationResponse.value = { error: error?.message || "Unknown error" };
    }
  } finally {
    loading.value = false;
  }
};

const sendVerification = async (reset = 0) => {
  if (!import.meta.client) return;

  loading.value = true;
  verificationResponse.value = null;
  statusResponse.value = null;
  verificationSent.value = false;
  try {
    const token = await recaptcha();
    if (!token) {
      throw new Error("Failed to get ReCaptcha token");
    }

    const phone = phoneCode.value.code + phoneNumber.value.trim();
    const response = await $api.get(`/api/verification/${phone}?token=${token}&reset=${reset}`);
    verificationResponse.value = response.data;
    verificationSent.value = true;

    // Save verification result to history if successful and has useful data
    if (verificationResponse.value && !verificationResponse.value.error) {
      await addSearchToHistory(phone, {
        ...verificationResponse.value,
        type: "verification",
        phone: phone,
        isBusiness: false,
        isEnterprise: false,
      });
    }
  } catch (error: any) {
    console.error("Send verification error:", error);
    if (error.message?.includes("ReCaptcha")) {
      verificationResponse.value = { error: "ReCaptcha verification failed. Please refresh the page and try again." };
    } else {
      verificationResponse.value = { error: error?.message || "Unknown error" };
    }
  } finally {
    loading.value = false;
  }
};

const checkStatus = async () => {
  if (!import.meta.client) return;

  loadingStatus.value = true;
  statusResponse.value = null;
  try {
    const token = await recaptcha();
    if (!token) {
      throw new Error("Failed to get ReCaptcha token");
    }

    const phone = phoneCode.value.code + phoneNumber.value.trim();
    const response = await $api.get(`/api/verification/status/${phone}?token=${token}`);
    statusResponse.value = response.data;
  } catch (error: any) {
    console.error("Check status error:", error);
    if (error.message?.includes("ReCaptcha")) {
      statusResponse.value = { error: "ReCaptcha verification failed. Please refresh the page and try again." };
    } else {
      statusResponse.value = { error: error?.message || "Unknown error" };
    }
  } finally {
    loadingStatus.value = false;
  }
};

const statusColor = (status: string) => {
  if (!status) return "info";
  switch (status.toLowerCase()) {
    case "pending":
      return "warning";
    case "verified":
      return "success";
    case "failed":
    case "expired":
      return "error";
    default:
      return "info";
  }
};

const baseUrl = ref("");
const runtimeConfig = ref<any>(null);

// Computed properties that are safe for SSR
const localizedPath = computed(() => `/${locale.value}${route.path}`);
const pageUrl = computed(() => `${baseUrl.value}${localizedPath.value}`);

// SEO meta tags
useHead(() => {
  const title = t("verification.title") + " | WhatsApp Profile API";
  const description = t("verification.infoMessage") + " " + t("verification.title") + " - WhatsApp Profile API.";
  const siteUrl = runtimeConfig.value?.public?.siteUrl || "https://whatsapp.checkleaked.cc";
  const url = `${siteUrl}/verification/${route.params.number || ""}`;
  return {
    title,
    meta: [
      { name: "description", content: t("verification.infoMessage") },
      { property: "og:title", content: t("verification.title") + " | WhatsApp Profile API" },
      { property: "og:description", content: t("verification.infoMessage") },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:site_name", content: "WhatsApp Profile API" },
      { property: "og:image", content: "/web-app-manifest-512x512.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: "/web-app-manifest-512x512.png" },
      { name: "robots", content: "index, follow" },
      { name: "language", content: route.params.lang || "en" },
    ],
    link: [{ rel: "canonical", href: url }],
    script: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: title,
          description: description,
          url: url,
          inLanguage: route.params.lang || "en",
          isPartOf: {
            "@type": "WebSite",
            name: "WhatsApp Profile API",
            url: runtimeConfig.value?.public?.siteUrl || "https://whatsapp.checkleaked.cc",
          },
          mainEntity: {
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: t("verification.title"),
                acceptedAnswer: {
                  "@type": "Answer",
                  text: t("verification.infoMessage"),
                },
              },
            ],
          },
        }),
      },
    ],
  };
});

// Client-side initialization
onMounted(async () => {
  if (import.meta.client) {
    // Initialize search history storage
    await initializeStorage();

    // Initialize client-side only dependencies
    try {
      runtimeConfig.value = useRuntimeConfig();
      // Set base URL
      baseUrl.value = runtimeConfig.value?.public?.siteUrl || (process.env.NODE_ENV === "production" ? "https://whatsapp.checkleaked.cc" : "http://localhost:3000");
    } catch (error) {
      console.error("Error initializing client-side dependencies:", error);
    }

    // Parse phone number from route if available
    const phoneNumberParam = route.params.number as string;
    if (phoneNumberParam) {
      await parsePhoneNumberFromRoute(phoneNumberParam);
    }
    if (!phoneNumber.value) {
      const defaultVal = {
        code: "598",
        countryWithCode: `${t(`country.Uruguay`)} (+598)`,
        countryTranslated: t(`country.Uruguay`),
      };
      const phoneCodeL = localStorage.getItem("phoneCode");
      if (phoneCodeL) {
        try {
          phoneCode.value = phoneCodesWithCountry.value.find((el) => el.code === JSON.parse(phoneCodeL).code) || defaultVal;
        } catch (error) {
          phoneCode.value = defaultVal;
        }
      } else {
        phoneCode.value = defaultVal;
      }
      loading.value = false;
    }
  }
});

watch(phoneCode, (val) => {
  if (!val) return;
  if (import.meta.client) localStorage.setItem("phoneCode", JSON.stringify(val));
});

const parsePhoneNumberFromRoute = async (phoneNumberParam: string) => {
  try {
    const phone = parsePhoneNumber("+" + phoneNumberParam);
    if (phone && phone.isValid()) {
      phoneCode.value = {
        code: phone.countryCallingCode,
        countryWithCode: `${t(`country.${phone.country}`)} (+${phone.countryCallingCode})`,
        countryTranslated: t(`country.${phone.country}`) || (phone.country as string),
      };
      phoneNumber.value = phone.nationalNumber;
      // Trigger search after values are set
      nextTick(() => {
        sendVerification(route.query.reset ? parseInt(route.query.reset as string, 10) : 0);
      });
    }
  } catch (error) {
    console.error("Error parsing phone number:", error);
    // Fallback: try to extract country code and number manually
    const fullNumber = phoneNumberParam;
    if (fullNumber.length > 3) {
      // Try common country code lengths
      const possibleCodes = [fullNumber.slice(0, 1), fullNumber.slice(0, 2), fullNumber.slice(0, 3)];
      for (const code of possibleCodes) {
        if (phoneCodes.some((pc) => pc.code === code)) {
          phoneCode.value = {
            code: code,
            countryTranslated: "",
            countryWithCode: "",
          };
          phoneNumber.value = fullNumber.slice(code.length);
          break;
        }
      }
    }
  }
};
</script>

<style scoped lang="scss">
.phone {
  max-width: 700px;
  margin: auto;
  .v-field {
    border-radius: 0;
  }
}

.gap-10 {
  gap: 10px;
}
</style>
