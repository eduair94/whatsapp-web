<template>
  <div>
    <v-form @submit.prevent="submit">
      <div class="d-flex phone">
        <v-autocomplete return-object :disabled="loading" variant="outlined" hide-details required v-model="phoneCode" class="phone--code" :filter="customFilter" max-width="118px" item-title="countryWithCode" autocomplete="off" data-lpignore="true" data-form-type="other" :label="$t('lookup.country')" :items="phoneCodesWithCountry">
          <template #selection="{ item }">
            <span>+{{ item.raw.code }}</span>
          </template>
          <template #item="{ props, item }">
            <v-list-item v-bind="props" :title="item.raw.countryWithCode" :subtitle="'+' + item.raw.code"> </v-list-item>
          </template>
        </v-autocomplete>
        <v-text-field :disabled="loading" v-model="phoneNumber" autocomplete="off" data-lpignore="true" data-form-type="other" class="phone--number" variant="outlined" tile type="tel" hide-details :label="$t('lookup.inputLabel')" required />
      </div>
      <div class="text-center pt-5">
        <div class="search_buttons d-flex justify-center flex-wrap">
          <v-btn type="button" class="text-none" color="secondary" size="large" :loading="loading" @click.prevent="randomNumber">
            <v-icon left>mdi-dice-multiple</v-icon>
            {{ $t("lookup.random") }}
          </v-btn>
          <v-btn :disabled="!phoneValid" type="submit" :loading="loading" size="large" class="text-none" color="primary">
            {{ $t("lookup.button") }}
          </v-btn>
        </div>
        <v-alert v-if="!phoneValid" class="text-body-2 alert-send-button mx-auto mt-5" type="info" :text="$t('lookup.infoMessage')" density="compact"></v-alert>
        <!-- Authentication warning for users not logged in (when auth is required) -->
        <ClientOnly>
          <nuxt-link v-if="!loadingFirebase" class="link_fixed" :to="localePath('/auth')">
            <v-alert v-if="!phoneApi.isAuthenticated.value" max-width="100%" width="fit-content" class="text-body-2 mx-auto mt-5" type="info" density="compact">
              <v-icon left>mdi-account-alert</v-icon>
              {{ $t("auth.signInSuggestion") }}
            </v-alert>
          </nuxt-link>
          <!-- API Key linking suggestion for authenticated users without API key -->
          <v-alert v-if="!loadingFirebase && phoneApi.isAuthenticated.value && !phoneApi.hasApiKey.value" @click="openApiKeyManager" max-width="100%" width="fit-content" class="custom_btn text-body-2 mx-auto mt-5" type="info" density="compact">
            <div class="d-flex align-center justify-space-between flex-wrap gap-2">
              <div class="d-flex align-center">
                <v-icon left>mdi-key-plus</v-icon>
                <span>{{ $t("apiKey.linkSuggestion") }}</span>
              </div>
            </div>
          </v-alert>
        </ClientOnly>
      </div>
    </v-form>
    <div v-if="data" class="wp_output mt-5">
      <v-alert v-if="data.error || phoneApi.error.value" type="error">
        {{ data.error ? $t(data.error) : phoneApi.error.value }}
      </v-alert>
      <v-row v-else>
        <v-col cols="12" lg="6">
          <v-card :elevation="10" class="mx-auto">
            <v-img class="grey" :src="data.profilePic" placeholder="/placeholder.jpg" width="500px" contain>
              <v-btn v-show="data.profilePic" :loading="loadingDownloadImage" class="mx-2 button_download" fab dark link target="_blank" :href="data.profilePic" small download color="primary" @click.prevent="downloadImage">
                <v-icon dark> mdi-download </v-icon>
              </v-btn>
            </v-img>
            <v-list>
              <v-list-item :title="$t('lookup.phone')">
                <p>{{ data.phone }}</p>
              </v-list-item>
              <v-list-item :title="$t('lookup.name')">
                <p>{{ data.pushname || "--" }}</p>
              </v-list-item>
              <v-list-item :title="$t('lookup.about')">
                <p>{{ data.about || "--" }}</p>
              </v-list-item>
              <v-list-item :title="$t('lookup.business')">
                <p>{{ data.isBusiness ? $t("lookup.yes") : $t("lookup.no") }}</p>
              </v-list-item>
              <v-list-item :title="$t('lookup.enterprise')">
                <p>{{ data.isEnterprise ? $t("lookup.yes") : $t("lookup.no") }}</p>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
        <v-col cols="12" lg="6">
          <v-textarea label="Raw Data" rows="30" :model-value="stringify(data)" readonly />
        </v-col>
      </v-row>
    </div>
    <!-- Review Popup Component -->
    <ReviewPopup ref="reviewPopupRef" />
  </div>
</template>

<script setup lang="ts">
import { useHead, useI18n, useLocalePath, useRoute, useRouter } from "#imports";
import parsePhoneNumber from "libphonenumber-js";
import { generatePhoneNumber } from "phone-number-generator-js";
import { computed, nextTick, onBeforeMount, onMounted, ref, watch } from "vue";
import { useReCaptcha } from "vue-recaptcha-v3";
import { useGlobalApiKeyManager } from "~/composables/useGlobalApiKeyManager";
import { usePhoneApi } from "~/composables/usePhoneApi";
import { useSearchHistory } from "~/composables/useSearchHistory";
import type { PhoneCode, WhatsAppProfileData } from "~/utils/interfaces/phone.interface";
import { phoneCodes } from "~/utils/phoneCodes";

// Define layout for this page
definePageMeta({
  layout: "phone-lookup",
});

const { locale, t, locales } = useI18n();
const localePath = useLocalePath();
const { addSearchToHistory, initializeStorage } = useSearchHistory();
const { user, loading: loadingFirebase, waitForLoadingFirebase } = useFirebaseAuth();
const { openApiKeyManager, registerApiKeySavedCallback, unregisterApiKeySavedCallback } = useGlobalApiKeyManager();

const router = useRouter();
const route = useRoute();

const baseUrl = process.env.NODE_ENV === "production" ? "https://whatsapp.checkleaked.cc" : "http://localhost:3000";
const localizedPath = computed(() => `/${locale}${route.path}`);
const pageUrl = computed(() => `${baseUrl}${localizedPath.value}`);

// Format phone number for meta tags
const phoneNumberParam = computed(() => route.params.number as string);
const formattedPhone = computed(() => {
  if (phoneNumberParam.value) {
    try {
      const phone = parsePhoneNumber("+" + phoneNumberParam.value);
      return phone?.formatInternational() || `+${phoneNumberParam.value}`;
    } catch {
      return `+${phoneNumberParam.value}`;
    }
  }
  return "";
});

useHead({
  title: computed(() => t("number.titlePrefix") + " " + formattedPhone.value + " - " + t("meta.suffix")),
  meta: [
    { name: "description", content: computed(() => t("number.descPrefix") + " " + formattedPhone.value) },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: computed(() => t("meta.siteName")) },
    { property: "og:title", content: computed(() => t("number.titlePrefix") + " " + formattedPhone.value + " - " + t("meta.suffix")) },
    { property: "og:description", content: computed(() => t("number.descPrefix") + " " + formattedPhone.value) },
    { property: "og:url", content: pageUrl },
    { name: "twitter:title", content: computed(() => t("number.titlePrefix") + " " + formattedPhone.value + " - " + t("meta.suffix")) },
    { name: "twitter:description", content: computed(() => t("number.descPrefix") + " " + formattedPhone.value) },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@whatsappapi" },
    { name: "robots", content: "index, follow" },
    { name: "language", content: computed(() => locale.value) },
  ],
  ...getMeta(pageUrl, baseUrl, route, locales),
  script: [
    {
      type: "application/ld+json",
      innerHTML: computed(() =>
        JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: t("number.titlePrefix") + " " + formattedPhone.value + " - " + t("meta.suffix"),
          description: t("number.descPrefix") + " " + formattedPhone.value,
          url: pageUrl.value,
          inLanguage: locale.value,
          isPartOf: {
            "@type": "WebSite",
            name: t("meta.siteName"),
            url: baseUrl + "/" + locale.value,
          },
        })
      ),
    },
  ],
});

const localLoading = ref(true);
const loadingDownloadImage = ref(false);
const phoneNumber = ref("");
const phoneCode = ref({
  code: "",
  countryWithCode: "",
  countryTranslated: "",
} as PhoneCode);
const data = ref<WhatsAppProfileData | null>(null);
const recaptchaInstance = useReCaptcha();
const reviewPopupRef = ref<{
  open: () => void;
  showPopup: () => void;
  closePopup: () => void;
  hasBeenShown: () => boolean;
} | null>(null);

// Review popup state
const hasPerformedFirstSearch = ref(false);

// Initialize phone API composable with Firebase auth integration
const phoneApi = usePhoneApi({
  includeAuth: true,
  retryAttempts: 2,
  timeout: 30000,
});

// Combined loading state
const loading = computed(() => localLoading.value || phoneApi.loading.value);

const phoneValid = computed(() => {
  if (!phoneCode.value || !phoneNumber.value) return false;
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

onMounted(async () => {
  // Initialize search history storage
  initializeStorage();

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
  }
  localLoading.value = false;
});

onBeforeMount(() => {
  const phoneNumberParam = route.params.number as string;
  if (phoneNumberParam) {
    try {
      const phone = parsePhoneNumber("+" + phoneNumberParam);
      if (phone && phone.isValid()) {
        const country = phoneCodes.find((el) => el.iso === phone.country)?.country || "Uruguay";
        phoneCode.value = {
          code: phone.countryCallingCode,
          countryWithCode: `${t(`country.${country}`)} (+${phone.countryCallingCode})`,
          countryTranslated: t(`country.${country}`) || (phone.country as string),
        };
        phoneNumber.value = phone.nationalNumber;
        // Trigger search after values are set
        nextTick(() => {
          search();
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
  }
});

// Watch for route changes to update phone number display
watch(
  () => route.params.number,
  (newNumber) => {
    if (newNumber && typeof newNumber === "string") {
      try {
        const phone = parsePhoneNumber("+" + newNumber);
        if (phone && phone.isValid()) {
          const country = phoneCodes.find((el) => el.iso === phone.country)?.country || "Uruguay";
          phoneCode.value = {
            code: phone.countryCallingCode,
            countryWithCode: `${t(`country.${country}`)} (+${phone.countryCallingCode})`,
            countryTranslated: t(`country.${country}`) || (phone.country as string),
          };
          phoneNumber.value = phone.nationalNumber;
        }
      } catch (error) {
        console.error("Error parsing phone number:", error);
      }
    }
  },
  { immediate: true }
);

watch(phoneCode, (val) => {
  if (!val) return;
  if (import.meta.client) localStorage.setItem("phoneCode", JSON.stringify(val));
});

watch(
  user,
  (val) => {
    phoneApi.fetchRateLimitInfo();
  },
  { immediate: true }
);

const downloadImage = (e: Event) => {
  e.stopPropagation();
  e.preventDefault();
  const url = data.value?.profilePic;
  if (!url) {
    throw new Error("Resource URL not provided! You need to provide one");
  }
  loadingDownloadImage.value = true;
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const blobURL = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobURL;
      a.style.display = "none";
      a.download = "profile.jpeg";

      document.body.appendChild(a);
      a.click();
      loadingDownloadImage.value = false;
    })
    .catch(() => {
      loadingDownloadImage.value = false;
    });
};

const recaptcha = async (): Promise<string | undefined> => {
  // optional you can await for the reCaptcha load
  await recaptchaInstance?.recaptchaLoaded();

  // get the token, a custom action could be added as argument to the method
  const token = await recaptchaInstance?.executeRecaptcha("wp");

  return token;
};

const customFilter = (item: any, queryText: string): boolean => {
  if (!item || !item.countryWithCode) return false;
  const searchText = queryText.toLowerCase();
  return item.countryWithCode.toLowerCase().includes(searchText) || item.countryTranslated.toLowerCase().includes(searchText) || item.code.includes(searchText);
};

const scheduleReviewPopup = (): void => {
  // Show popup after 10 seconds
  setTimeout(() => {
    console.log("Attempting to open review popup");
    if (reviewPopupRef.value) {
      reviewPopupRef.value.open();
    }
  }, 3000); // 10 seconds
};

const stringify = (data: WhatsAppProfileData | null): string => {
  return JSON.stringify(data, null, 2);
};

/**
 * Sleep for a given number of milliseconds.
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const search = async (): Promise<void> => {
  // Wait for loadingFirebase to be true with timeout
  await waitForLoadingFirebase();

  const phoneNumberFull = phoneCode.value.code + phoneNumber.value.trim();

  // Clear any previous errors
  phoneApi.clearError();

  // Use the phone API composable
  const result = await phoneApi.searchProfile(phoneNumberFull);

  // Update local data state
  data.value = result.data;

  // Refresh rate limit info after the request
  if (!result?.data?._id) {
    phoneApi.fetchRateLimitInfo();
  }

  // Handle errors and rate limiting
  if (result.error) {
    console.error("Phone API error:", result.error);

    // Set fallback error data
    if (!data.value) {
      data.value = {
        phone: phoneNumberFull,
        isBusiness: false,
        isEnterprise: false,
        error: result.error,
      };
    }

    return;
  }
  // Save successful search to history (only if we have valid data and no errors)
  if (data.value && !data.value.error) {
    await addSearchToHistory(phoneNumberFull, data.value);

    // Schedule review popup for first-time users
    scheduleReviewPopup();
  }
};

/**
 * Update URL using History API (lightest approach)
 */
const updateUrlWithHistory = async (phoneNumber: string) => {
  if (!import.meta.client) return;

  const localePath = useLocalePath();
  const newUrl = localePath(`/${phoneNumber}`);

  console.log("New url", newUrl);

  try {
    // Method 1: Update Vue Router state first, then browser history
    await router.replace({
      path: newUrl,
      query: route.query, // Preserve any query parameters
    });

    // Update browser history to ensure consistency
    window.history.replaceState({ ...window.history.state, phoneNumber }, "", newUrl);
  } catch (error) {
    console.error("Failed to update route:", error);
    // Fallback to just history API
    window.history.replaceState(window.history.state, "", newUrl);
  }
};
const submit = async (): Promise<void> => {
  if (phoneCode.value.code && phoneNumber.value) {
    // If the phone number route is the same as the current one, just search
    const phoneValue = `${phoneCode.value.code}${phoneNumber.value}`;
    if ((route.params.number as string) === phoneValue) {
      await search();
      return;
    }
    // Store current scroll position
    updateUrlWithHistory(phoneValue);
    search();
  }
};

const randomNumber = () => {
  const number = generatePhoneNumber();
  const phone = parsePhoneNumber(number);
  if (phone && phone.isValid()) {
    phoneCode.value = {
      code: phone.countryCallingCode,
      countryWithCode: `${t(`country.${phone.country}`)} (+${phone.countryCallingCode})`,
      countryTranslated: t(`country.${phone.country}`) || (phone.country as string),
    };
    phoneNumber.value = phone.nationalNumber;
  }
};
</script>

<style lang="scss">
.phone {
  max-width: 700px;
  margin: auto;
  .v-field {
    border-radius: 0;
  }
}

.wp_output {
  max-width: 800px;
  margin: auto;
  .v-list-item:nth-child(even) {
    background-color: #80808042;
  }
}

.button_download {
  position: absolute;
  bottom: 10px;
  right: 5px;
}

.search_buttons {
  gap: 8px;
}

.link_fixed,
.custom_btn {
  text-decoration: none;
  transition: 0.3s ease-in-out;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
}

.alert-send-button {
  width: fit-content;
}
</style>
