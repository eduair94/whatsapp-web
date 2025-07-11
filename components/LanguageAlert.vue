<template>
  <ClientOnly>
    <v-slide-y-transition>
      <v-card v-if="showLanguageAlert" class="mx-2 mb-2 mt-2" variant="tonal" color="info" rounded="lg">
        <v-card-text class="py-2">
          <div class="d-flex align-center">
            <v-icon color="info" class="mr-3">mdi-translate</v-icon>
            <div class="flex-grow-1">
              <div class="text-body-2 font-weight-medium">
                {{ getBrowserLanguageText("languageAlert.title") }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ getBrowserLanguageText("languageAlert.message") }}
              </div>
            </div>
            <!-- Desktop layout -->
            <div class="ml-3 d-none d-sm-flex align-center">
              <v-btn @click="switchToBrowserLanguage" color="info" variant="elevated" size="small" class="mr-2">
                {{ getBrowserLanguageText("languageAlert.switch") }}
              </v-btn>
              <v-btn @click="dismissLanguageAlert" variant="text" size="small" icon="mdi-close" />
            </div>
            <!-- Mobile dismiss button (top right) -->
            <div class="d-flex d-sm-none">
              <v-btn @click="dismissLanguageAlert" variant="text" size="small" icon="mdi-close" />
            </div>
          </div>
          <!-- Mobile action button (bottom) -->
          <div class="d-flex d-sm-none mt-3">
            <v-btn @click="switchToBrowserLanguage" color="info" variant="elevated" size="small" block>
              {{ getBrowserLanguageText("languageAlert.switch") }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-slide-y-transition>
  </ClientOnly>
</template>

<script lang="ts" setup>
import { useI18n, useRouter, useSwitchLocalePath } from "#imports";
import { onMounted, ref, watch } from "vue";

const { locale, locales, t } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const router = useRouter();

// Language alert functionality
const showLanguageAlert = ref(false);
const browserLanguage = ref("");
const alertDismissed = ref(false);
const browserLanguageTranslations = ref<Record<string, string>>({});
const autoDismissTimer = ref<NodeJS.Timeout | null>(null);

// Auto-dismiss after 15 seconds
const startAutoDismissTimer = () => {
  if (autoDismissTimer.value) {
    clearTimeout(autoDismissTimer.value);
  }
  autoDismissTimer.value = setTimeout(() => {
    if (showLanguageAlert.value) {
      dismissLanguageAlert();
    }
  }, 45000); // 45 seconds
};

// Clear auto-dismiss timer
const clearAutoDismissTimer = () => {
  if (autoDismissTimer.value) {
    clearTimeout(autoDismissTimer.value);
    autoDismissTimer.value = null;
  }
};

// Function to load translations for a specific language
const loadTranslationsForLanguage = async (lang: string) => {
  try {
    const translations = await import(`~/i18n/locales/translations/${lang}.json`);
    return translations.default || translations;
  } catch (error) {
    console.warn(`Failed to load translations for language: ${lang}`, error);
    // Fallback to English if the language file doesn't exist
    try {
      const fallbackTranslations = await import("~/i18n/locales/translations/en.json");
      return fallbackTranslations.default || fallbackTranslations;
    } catch (fallbackError) {
      console.error("Failed to load fallback English translations", fallbackError);
      return {
        "languageAlert.title": "Language Mismatch Detected",
        "languageAlert.message": "Your browser language doesn't match the current site language. Would you like to switch to match your browser's language?",
        "languageAlert.switch": "Switch Language",
        "languageAlert.dismiss": "Dismiss",
      };
    }
  }
};

// Function to get browser language text
const getBrowserLanguageText = (key: string) => {
  return browserLanguageTranslations.value[key] || key;
};

// Function to check if browser language is available
const isBrowserLanguageAvailable = () => {
  const browserLang = navigator.language?.split("-")[0] || "en";
  const availableLocales = locales.value.map((l: any) => l.code || l);
  return availableLocales.includes(browserLang);
};

// Function to check language mismatch
const checkLanguageMismatch = async () => {
  if (alertDismissed.value) return;

  const browserLang = navigator.language?.split("-")[0] || "en";
  browserLanguage.value = browserLang;

  // Check if browser language is different from current locale and is available
  if (browserLang !== locale.value && isBrowserLanguageAvailable()) {
    // Load translations for the browser language
    const translations = await loadTranslationsForLanguage(browserLang);
    browserLanguageTranslations.value = translations;
    showLanguageAlert.value = true;
    startAutoDismissTimer();
  }
};

// Function to switch to browser language
const switchToBrowserLanguage = () => {
  clearAutoDismissTimer();
  const browserLang = browserLanguage.value;
  if (browserLang && browserLang !== locale.value) {
    const availableLocales = locales.value.map((l: any) => l.code || l);
    if (availableLocales.includes(browserLang)) {
      router.push(switchLocalePath(browserLang as any));
    }
  }
  showLanguageAlert.value = false;
  alertDismissed.value = true;
};

// Function to dismiss language alert
const dismissLanguageAlert = () => {
  clearAutoDismissTimer();
  showLanguageAlert.value = false;
  alertDismissed.value = true;
};

// Check language mismatch on mount
onMounted(async () => {
  await checkLanguageMismatch();
});

// Watch for locale changes
watch(locale, (val) => {
  // Hide alert if language was changed
  if (val === browserLanguage.value) {
    showLanguageAlert.value = false;
  }
});
</script>

<style scoped>
/* No custom styles needed - using Vuetify's responsive classes */
</style>
