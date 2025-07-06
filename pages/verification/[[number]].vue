<template>
  <v-container class="mx-auto p-4" max-width="800">
    <h1 class="mb-5 mb-md-8 text-center">{{ t("verification.title") }}</h1>

    <!-- Step Indicator -->
    <v-stepper v-model="currentStep" alt-labels class="mb-6">
      <v-stepper-header>
        <v-stepper-item :complete="currentStep > 1" :value="1" :title="t('verification.steps.phone')" icon="mdi-phone"></v-stepper-item>
        <v-divider></v-divider>
        <v-stepper-item :complete="currentStep > 2" :value="2" :title="t('verification.steps.template')" icon="mdi-message-text"></v-stepper-item>
        <v-divider></v-divider>
        <v-stepper-item :value="3" :title="t('verification.steps.verify')" icon="mdi-shield-check"></v-stepper-item>
      </v-stepper-header>
    </v-stepper>

    <!-- Phone Number Input -->
    <v-card class="mb-6" elevation="2">
      <v-card-title class="text-h6 pb-2">
        <v-icon class="mr-2">mdi-phone</v-icon>
        {{ t("verification.phoneTitle") }}
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="loadTemplates">
          <v-row>
            <v-col cols="4" sm="3">
              <v-autocomplete return-object :disabled="loading" variant="outlined" hide-details required v-model="phoneCode" :filter="customFilter" item-title="countryWithCode" autocomplete="off" :label="t('lookup.country')" :items="phoneCodesWithCountry">
                <template #selection="{ item }">
                  <span>+{{ item.raw.code }}</span>
                </template>
                <template #item="{ props, item }">
                  <v-list-item v-bind="props" :title="item.raw.countryWithCode" :subtitle="'+' + item.raw.code" />
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="8" sm="9">
              <v-text-field :disabled="loading" v-model="phoneNumber" autocomplete="off" variant="outlined" type="tel" hide-details :label="t('verification.inputLabel')" required />
            </v-col>
          </v-row>
          <div class="text-center mt-4">
            <v-btn :disabled="!phoneValid || loading" type="submit" :loading="loading" size="large" color="primary" prepend-icon="mdi-arrow-right">
              {{ t("verification.selectTemplate") }}
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Template Selection -->
    <v-card v-if="templates.length > 0" class="mb-6" elevation="2">
      <v-card-title class="text-h6 pb-2">
        <v-icon class="mr-2">mdi-message-text</v-icon>
        {{ t("verification.templateTitle") }}
      </v-card-title>
      <v-card-text>
        <v-select v-model="selectedTemplate" :items="templateItems" item-title="displayName" item-value="name" variant="outlined" :label="t('verification.selectTemplateLabel')" prepend-inner-icon="mdi-message-text-outline" hide-details @update:model-value="updatePreview">
          <template #item="{ props, item }">
            <v-list-item v-bind="props">
              <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
            </v-list-item>
          </template>
        </v-select>

        <!-- Configuration Options -->
        <v-row class="mt-4">
          <v-col cols="12" md="4">
            <v-select v-model="selectedLanguage" :items="availableLanguages" item-title="name" item-value="code" variant="outlined" :label="t('verification.languageLabel')" prepend-inner-icon="mdi-translate" hide-details :disabled="availableLanguages.length === 0" @update:model-value="loadTemplatesForLanguage" />
          </v-col>
          <v-col cols="12" md="4">
            <v-select v-model="otpLength" :items="[4, 5, 6, 7, 8]" variant="outlined" :label="t('verification.lengthLabel')" prepend-inner-icon="mdi-numeric" hide-details @update:model-value="generatePreviewMessage" />
          </v-col>
          <v-col cols="12" md="4">
            <v-select v-model="otpExpiry" :items="[1, 2, 3, 5, 10, 15]" variant="outlined" :label="t('verification.expiryLabel')" prepend-inner-icon="mdi-clock-outline" hide-details @update:model-value="generatePreviewMessage" />
          </v-col>
        </v-row>

        <!-- Dynamic Fields Based on Template Placeholders -->
        <v-row class="mt-4" v-if="selectedTemplate && templateFields.length > 0">
          <v-col v-for="field in templateFields" :key="field.key" :cols="field.fullWidth ? 12 : field.type === 'url' ? 12 : 6">
            <v-text-field v-model="dynamicFields[field.key]" variant="outlined" :label="field.label" :prepend-inner-icon="field.icon" :placeholder="field.placeholder" :type="field.type" hide-details clearable />
          </v-col>
        </v-row>

        <!-- WhatsApp Message Preview -->
        <v-card v-if="previewMessage" class="mt-4" elevation="1" :class="$vuetify.theme.current.dark ? 'whatsapp-preview-dark' : 'whatsapp-preview-light'">
          <v-card-title class="text-subtitle-1 pb-2">
            <v-icon class="mr-2" color="green">mdi-whatsapp</v-icon>
            {{ t("verification.previewTitle") }}
          </v-card-title>
          <v-card-text>
            <!-- WhatsApp Message Bubble -->
            <div class="whatsapp-message-container">
              <div class="whatsapp-message">
                <!-- Image Preview (if available) -->
                <div v-if="dynamicFields.image" class="message-image mb-2">
                  <v-img :src="dynamicFields.image" :alt="t('verification.imagePreview')" :aspect-ratio="16 / 9" width="100%" cover class="rounded" @error="onImageError">
                    <template #placeholder>
                      <div class="d-flex align-center justify-center fill-height">
                        <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
                      </div>
                    </template>
                    <template #error>
                      <div class="d-flex align-center justify-center fill-height bg-grey-lighten-2">
                        <v-icon color="grey">mdi-image-broken</v-icon>
                      </div>
                    </template>
                  </v-img>
                </div>

                <!-- Message Text -->
                <div class="message-text">{{ previewMessage }}</div>

                <!-- Message Time -->
                <div class="message-time">
                  {{ new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }}
                  <v-icon size="16" color="blue">mdi-check-all</v-icon>
                </div>
              </div>
            </div>

            <!-- Note about preview -->
            <v-alert type="info" variant="text" density="compact" class="mt-3">
              {{ t("verification.previewNote") }}
            </v-alert>
          </v-card-text>
        </v-card>

        <div class="text-center mt-4">
          <v-btn :disabled="!selectedTemplate || sendingOtp" @click="sendOtp" :loading="sendingOtp" size="large" color="success" prepend-icon="mdi-send">
            {{ t("verification.sendOtp") }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- OTP Verification -->
    <v-card v-if="otpSent" class="mb-6" elevation="2">
      <v-card-title class="text-h6 pb-2">
        <v-icon class="mr-2">mdi-shield-check</v-icon>
        {{ t("verification.verifyTitle") }}
      </v-card-title>
      <v-card-text>
        <v-alert type="success" variant="tonal" class="mb-4">
          <template #title>{{ t("verification.otpSentTitle") }}</template>
          {{ t("verification.otpSentMessage", { phone: maskedPhone }) }}
        </v-alert>

        <v-text-field v-model="otpCode" variant="outlined" :label="t('verification.otpLabel')" prepend-inner-icon="mdi-numeric" hide-details type="tel" maxlength="8" class="text-center" style="font-size: 1.2em; letter-spacing: 2px" />

        <div class="text-center mt-4">
          <v-btn :disabled="!otpCode || otpCode.length < 4 || verifyingOtp" @click="verifyOtp" :loading="verifyingOtp" size="large" color="primary" prepend-icon="mdi-check" class="mr-3">
            {{ t("verification.verifyOtp") }}
          </v-btn>
          <v-btn @click="resetProcess" variant="outlined" color="secondary" prepend-icon="mdi-refresh">
            {{ t("verification.startOver") }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Results -->
    <v-card v-if="verificationResult" elevation="2">
      <v-card-title class="text-h6 pb-2">
        <v-icon class="mr-2" :color="verificationResult.success ? 'success' : 'error'">
          {{ verificationResult.success ? "mdi-check-circle" : "mdi-alert-circle" }}
        </v-icon>
        {{ t("verification.resultTitle") }}
      </v-card-title>
      <v-card-text>
        <v-alert :type="verificationResult.success ? 'success' : 'error'" variant="tonal" class="mb-4">
          <template #title>
            {{ verificationResult.success ? t("verification.success") : t("verification.failed") }}
          </template>
          {{ verificationResult.message || verificationResult.error || t("verification.unknownError") }}
        </v-alert>

        <v-expansion-panels v-if="verificationResult.data || sendResult">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="mr-2">mdi-code-json</v-icon>
              {{ t("verification.technicalDetails") }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-textarea :model-value="JSON.stringify(verificationResult.data || sendResult, null, 2)" readonly variant="outlined" rows="10" class="mt-3" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <div class="text-center mt-4">
          <v-btn @click="resetProcess" variant="outlined" color="primary" prepend-icon="mdi-refresh">
            {{ t("verification.startOver") }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Error Display -->
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = ''">
      <template #title>{{ t("verification.errorTitle") }}</template>
      {{ error }}
    </v-alert>

    <!-- API Promotion -->
    <v-card class="mt-6" elevation="2" color="primary" variant="tonal">
      <v-card-title class="text-h6 pb-2">
        <v-icon class="mr-2">mdi-api</v-icon>
        {{ t("verification.apiPromotion.title") }}
      </v-card-title>
      <v-card-text>
        <p class="mb-3">{{ t("verification.apiPromotion.description") }}</p>
        <v-btn href="https://rapidapi.com/airaudoeduardo/api/whatsauth-whatsapp-otp1" target="_blank" color="primary" size="large" prepend-icon="mdi-rocket-launch" class="mr-3">
          {{ t("verification.apiPromotion.button") }}
        </v-btn>
        <v-chip color="success" size="small" class="ml-2">
          <v-icon start>mdi-currency-usd</v-icon>
          {{ t("verification.apiPromotion.cheapest") }}
        </v-chip>
      </v-card-text>
    </v-card>

    <!-- Info Message -->
    <v-alert v-if="!templates.length && !loading" class="mt-5" type="info" variant="tonal">
      {{ t("verification.infoMessage") }}
    </v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { useHead, useI18n, useLocalePath, useRoute, useRouter } from "#imports";
import parsePhoneNumber from "libphonenumber-js";
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useSearchHistory } from "~/composables/useSearchHistory";
import type { PhoneCode } from "~/utils/interfaces/phone.interface";
import { phoneCodes } from "~/utils/phoneCodes";

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const localePath = useLocalePath();
const { addSearchToHistory, initializeStorage } = useSearchHistory();

// Loading states
const loading = ref(false);
const sendingOtp = ref(false);
const verifyingOtp = ref(false);

// Form data
const phoneNumber = ref("");
const phoneCode = ref({
  code: "",
  countryWithCode: "",
  countryTranslated: "",
} as PhoneCode);
const userName = ref("");
const companyName = ref("Your Company");
const imageUrl = ref("");
const otpCode = ref("");

// Templates and selection
const templates = ref<any[]>([]);
const availableLanguages = ref<Array<{ code: string; name: string }>>([]);
const selectedTemplate = ref("");
const selectedLanguage = ref("");
const otpLength = ref(5);
const otpExpiry = ref(2);
const selectedTemplatePlaceholders = ref<string[]>([]);
const dynamicFields = ref<Record<string, string>>({});
const previewMessage = ref("");

// Process state
const currentStep = ref(1);
const otpSent = ref(false);
const verificationResult = ref<any>(null);
const sendResult = ref<any>(null);
const error = ref("");

const { $api } = useNuxtApp();

const phoneValid = computed(() => {
  if (!phoneCode.value?.code || !phoneNumber.value) return false;

  try {
    const phoneNumberFull = phoneCode.value.code + phoneNumber.value.trim();
    const phone = parsePhoneNumber("+" + phoneNumberFull);
    return phone?.isValid() ?? false;
  } catch (error) {
    console.warn("Phone validation error:", error);
    return false;
  }
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

const templateItems = computed(() => {
  // Use a Set to track unique template names and avoid duplicates
  const seenNames = new Set<string>();

  return templates.value
    .filter((template) => {
      const displayName = template.name.charAt(0).toUpperCase() + template.name.slice(1).replace(/([A-Z])/g, " $1");
      if (seenNames.has(displayName)) {
        return false; // Skip duplicate
      }
      seenNames.add(displayName);
      return true;
    })
    .map((template) => ({
      name: template.name,
      displayName: template.name.charAt(0).toUpperCase() + template.name.slice(1).replace(/([A-Z])/g, " $1"),
      description: template.description,
      placeholders: template.placeholders,
      messagePreview: template.messagePreview,
    }));
});

const templateFields = computed(() => {
  if (!selectedTemplate.value || !selectedTemplatePlaceholders.value.length) return [];

  interface FieldConfig {
    key: string;
    label: string;
    icon: string;
    placeholder: string;
    type: string;
    fullWidth: boolean;
  }

  const fields: FieldConfig[] = [];

  // Generate fields dynamically for each placeholder in the template
  selectedTemplatePlaceholders.value.forEach((placeholder: string) => {
    // Extract the key from {{key}} format
    const key = placeholder.replace(/[{}]/g, "").toLowerCase();

    // Skip system placeholders that shouldn't be user inputs
    if (["otp", "expiry"].includes(key)) {
      return;
    }

    // Create field config based on placeholder name
    let fieldConfig: FieldConfig;

    switch (key) {
      case "name":
        fieldConfig = {
          key,
          label: `${t("verification.nameLabel")}`,
          icon: "mdi-account",
          placeholder: `Enter value for ${key}`,
          type: "text",
          fullWidth: false,
        };
        break;
      case "company":
        fieldConfig = {
          key,
          label: `${t("verification.companyLabel")}`,
          icon: "mdi-domain",
          placeholder: `Enter value for ${key}`,
          type: "text",
          fullWidth: false,
        };
        break;
      default:
        // Generic field for any other placeholder
        fieldConfig = {
          key,
          label: `${key.charAt(0).toUpperCase() + key.slice(1)}`,
          icon: "mdi-text-box",
          placeholder: `Enter value for ${key}`,
          type: "text",
          fullWidth: false,
        };
    }

    fields.push(fieldConfig);
  });

  // Always add image as an optional field for all templates
  fields.push({
    key: "image",
    label: t("verification.imageLabel"),
    icon: "mdi-image",
    placeholder: "https://cdn.pixabay.com/photo/2023/03/15/20/46/background-7855413_640.jpg",
    type: "url",
    fullWidth: true,
  });

  return fields;
});

const maskedPhone = computed(() => {
  if (!phoneCode.value || !phoneNumber.value) return "";
  const fullPhone = phoneCode.value.code + phoneNumber.value.trim();
  if (fullPhone.length < 8) return fullPhone;
  return fullPhone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
});

const customFilter = (item: any, queryText: string): boolean => {
  if (!item || !item.countryWithCode) return false;
  const searchText = queryText.toLowerCase();
  return item.countryWithCode.toLowerCase().includes(searchText) || item.countryTranslated.toLowerCase().includes(searchText) || item.code.includes(searchText);
};

const loadTemplates = async (): Promise<void> => {
  if (!phoneValid.value) return;

  loading.value = true;
  error.value = "";

  try {
    const currentLocale = selectedLanguage.value || locale.value || "en";
    const response = await $api.get(`/api/otp/templates?language=${currentLocale}`).then((res) => res.data);

    if (response.success && response.data?.templates) {
      templates.value = response.data.templates;

      // Extract supported languages from response (prioritize supportedLanguages over availableLanguages)
      const supportedLanguages = response.data.supportedLanguages || response.data.availableLanguages;
      if (supportedLanguages) {
        // Check if supportedLanguages is an object (key-value pairs) or an array
        if (Array.isArray(supportedLanguages)) {
          // Handle array format
          availableLanguages.value = supportedLanguages.map((lang: any) => ({
            code: lang.code || lang,
            name: lang.name || lang.charAt(0).toUpperCase() + lang.slice(1),
          }));
        } else if (typeof supportedLanguages === "object") {
          // Handle object format (key-value pairs)
          availableLanguages.value = Object.entries(supportedLanguages).map(([code, name]) => ({
            code,
            name: name as string,
          }));
        } else {
          // If no supported languages provided, initialize with empty array
          availableLanguages.value = [];
        }
      } else {
        // If no supported languages provided, initialize with empty array
        availableLanguages.value = [];
      }

      // Set default language if not already set or if current selection is not supported
      if (!selectedLanguage.value || !availableLanguages.value.some((lang) => lang.code === selectedLanguage.value)) {
        const currentLocale = locale.value || "en";
        // Check if current locale is supported, otherwise use the first available language
        if (availableLanguages.value.some((lang) => lang.code === currentLocale)) {
          selectedLanguage.value = currentLocale;
        } else if (availableLanguages.value.length > 0) {
          selectedLanguage.value = availableLanguages.value[0].code;
        } else {
          selectedLanguage.value = "en"; // Ultimate fallback
        }
      }

      currentStep.value = 2;
    } else {
      throw new Error(response.error || "Failed to load templates");
    }
  } catch (err: any) {
    console.error("Load templates error:", err);
    error.value = err.message || "Failed to load OTP templates. Please try again.";
  } finally {
    loading.value = false;
  }
};

const loadTemplatesForLanguage = async (): Promise<void> => {
  if (!selectedLanguage.value) return;

  loading.value = true;
  error.value = "";

  try {
    const response = await $api.get(`/api/otp/templates?language=${selectedLanguage.value}`).then((res) => res.data);

    if (response.success && response.data?.templates) {
      const previouslySelectedTemplate = selectedTemplate.value;
      templates.value = response.data.templates;

      // Update supported languages from the new response
      const supportedLanguages = response.data.supportedLanguages || response.data.availableLanguages;
      if (supportedLanguages) {
        // Check if supportedLanguages is an object (key-value pairs) or an array
        if (Array.isArray(supportedLanguages)) {
          // Handle array format
          availableLanguages.value = supportedLanguages.map((lang: any) => ({
            code: lang.code || lang,
            name: lang.name || lang.charAt(0).toUpperCase() + lang.slice(1),
          }));
        } else if (typeof supportedLanguages === "object") {
          // Handle object format (key-value pairs)
          availableLanguages.value = Object.entries(supportedLanguages).map(([code, name]) => ({
            code,
            name: name as string,
          }));
        }
      } else {
        // If no supported languages provided, keep current languages or initialize with empty array
        if (availableLanguages.value.length === 0) {
          availableLanguages.value = [];
        }
      }

      // Validate that the selected language is still supported
      if (!availableLanguages.value.some((lang) => lang.code === selectedLanguage.value)) {
        if (availableLanguages.value.length > 0) {
          selectedLanguage.value = availableLanguages.value[0].code;
        }
      }

      // Preserve the selected template if it exists in the new language's templates
      if (previouslySelectedTemplate && templates.value.some((t) => t.name === previouslySelectedTemplate)) {
        // Keep the same template selected
        selectedTemplate.value = previouslySelectedTemplate;
        // Update preview with the preserved template
        updatePreview();
      } else {
        // Only reset if the template doesn't exist in the new language
        selectedTemplate.value = "";
        previewMessage.value = "";
        dynamicFields.value = { image: "https://cdn.pixabay.com/photo/2023/03/15/20/46/background-7855413_640.jpg" };
        selectedTemplatePlaceholders.value = [];
      }
    } else {
      throw new Error(response.error || "Failed to load templates for selected language");
    }
  } catch (err: any) {
    console.error("Load templates for language error:", err);
    error.value = err.message || "Failed to load templates for selected language. Please try again.";
  } finally {
    loading.value = false;
  }
};

const updatePreview = () => {
  if (!selectedTemplate.value) {
    previewMessage.value = "";
    selectedTemplatePlaceholders.value = [];
    dynamicFields.value = {};
    return;
  }

  // Find the selected template
  const template = templates.value.find((t) => t.name === selectedTemplate.value);
  if (!template) {
    previewMessage.value = "";
    selectedTemplatePlaceholders.value = [];
    return;
  }

  console.log("Selected template:", template);
  console.log("Template placeholders:", template.placeholders);

  // Update placeholders for dynamic fields
  selectedTemplatePlaceholders.value = template.placeholders || [];

  console.log("Extracted placeholders:", selectedTemplatePlaceholders.value);

  // Reset dynamic fields when template changes to show new fields
  const newDynamicFields: Record<string, string> = {};
  selectedTemplatePlaceholders.value.forEach((placeholder: string) => {
    // Extract the key from {{key}} format
    const key = placeholder.replace(/[{}]/g, "").toLowerCase();
    console.log(`Processing placeholder: "${placeholder}" -> key: "${key}"`);
    // Start with empty values for new template
    newDynamicFields[key] = "";
  });
  // Always ensure image field exists as optional with default value
  newDynamicFields["image"] = "https://cdn.pixabay.com/photo/2023/03/15/20/46/background-7855413_640.jpg";
  dynamicFields.value = newDynamicFields;

  console.log("Dynamic fields initialized:", dynamicFields.value);

  generatePreviewMessage();
};

const generatePreviewMessage = () => {
  if (!selectedTemplate.value) {
    previewMessage.value = "";
    return;
  }

  // Find the selected template
  const template = templates.value.find((t) => t.name === selectedTemplate.value);
  if (!template) {
    previewMessage.value = "";
    return;
  }

  // Generate preview message
  let preview = template.messagePreview || "Preview not available";

  console.log("Original preview message:", preview);
  console.log("Current dynamic fields:", dynamicFields.value);

  // Replace placeholders with actual values or defaults
  // Note: OTP and expiry are handled by the system, not user input
  preview = preview.replace(/\{\{otp\}\}/gi, "1".repeat(otpLength.value));
  preview = preview.replace(/\{\{expiry\}\}/gi, otpExpiry.value.toString());

  // Replace dynamic field placeholders
  selectedTemplatePlaceholders.value.forEach((placeholder: string) => {
    // Extract the key from {{key}} format
    const key = placeholder.replace(/[{}]/g, "").toLowerCase();
    const value = dynamicFields.value[key] || (key === "company" ? "Your Company" : "") || (key === "name" ? "User" : "") || `[${key.toUpperCase()}]`;

    console.log(`Replacing placeholder "${placeholder}" (key: "${key}") with value: "${value}"`);

    // Create regex to match the full placeholder including brackets
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "gi");
    preview = preview.replace(regex, value);
  });

  console.log("Final preview message:", preview);

  // Replace remaining static placeholders with defaults (for templates that might have these)
  preview = preview.replace(/\{\{service\}\}/g, "verification");
  preview = preview.replace(/\{\{amount\}\}/g, "$100");
  preview = preview.replace(/\{\{item\}\}/g, "order");
  preview = preview.replace(/\{\{recipient\}\}/g, "recipient");
  preview = preview.replace(/\{\{points\}\}/g, "100");
  preview = preview.replace(/\{\{date\}\}/g, "2025-07-06");
  preview = preview.replace(/\{\{time\}\}/g, "15:30");
  preview = preview.replace(/\{\{value\}\}/g, "$50");
  preview = preview.replace(/\{\{game\}\}/g, "game");
  preview = preview.replace(/\{\{event\}\}/g, "event");
  preview = preview.replace(/\{\{plan\}\}/g, "premium");
  preview = preview.replace(/\{\{message\}\}/g, "Welcome!");
  preview = preview.replace(/\{\{code\}\}/g, "ABC123");

  previewMessage.value = preview;
};

const sendOtp = async (): Promise<void> => {
  if (!selectedTemplate.value || !phoneValid.value) return;

  sendingOtp.value = true;
  error.value = "";

  try {
    const fullPhone = phoneCode.value.code + phoneNumber.value.trim();
    const params = new URLSearchParams({
      phone: fullPhone,
      template: selectedTemplate.value,
      language: selectedLanguage.value || locale.value || "en",
      length: otpLength.value.toString(),
      expiry: otpExpiry.value.toString(),
    });

    // Add dynamic field values to parameters
    Object.entries(dynamicFields.value).forEach(([key, value]) => {
      if (value && typeof value === "string" && value.trim()) {
        params.append(key, value.trim());
      }
    });

    // No need for fallback to legacy fields since we handle all fields dynamically now

    const response = await $api.get(`/api/otp/send?${params.toString()}`).then((res) => res.data);

    if (response.success) {
      sendResult.value = response.data;
      otpSent.value = true;
      currentStep.value = 3;

      // Save to history
      await addSearchToHistory(fullPhone, {
        type: "otp_verification",
        phone: fullPhone,
        template: selectedTemplate.value,
        timestamp: new Date().toISOString(),
        ...response.data,
      });
    } else {
      throw new Error(response.error || "Failed to send OTP");
    }
  } catch (err: any) {
    console.error("Send OTP error:", err);
    error.value = err.message || "Failed to send OTP. Please try again.";
  } finally {
    sendingOtp.value = false;
  }
};

const verifyOtp = async (): Promise<void> => {
  if (!otpCode.value || !phoneValid.value) return;

  verifyingOtp.value = true;
  error.value = "";

  try {
    const fullPhone = phoneCode.value.code + phoneNumber.value.trim();
    const params = new URLSearchParams({
      phone: fullPhone,
      otp: otpCode.value,
    });

    const response = await $api.get(`/api/otp/verify?${params.toString()}`).then((res) => res.data);

    verificationResult.value = response;

    // Update history with verification result
    if (response.success) {
      await addSearchToHistory(fullPhone, {
        type: "otp_verification_result",
        phone: fullPhone,
        verified: true,
        timestamp: new Date().toISOString(),
        ...response.data,
      });
    }
  } catch (err: any) {
    console.error("Verify OTP error:", err);
    verificationResult.value = {
      success: false,
      error: err.message || "Failed to verify OTP. Please try again.",
    };
  } finally {
    verifyingOtp.value = false;
  }
};

const resetProcess = () => {
  currentStep.value = 1;
  otpSent.value = false;
  verificationResult.value = null;
  sendResult.value = null;
  error.value = "";
  otpCode.value = "";
  selectedTemplate.value = "";
  selectedLanguage.value = locale.value || "en";
  otpLength.value = 5;
  otpExpiry.value = 2;
  previewMessage.value = "";
  templates.value = [];
  availableLanguages.value = [];
  userName.value = "";
  companyName.value = "Your Company";
  imageUrl.value = "";
  dynamicFields.value = { image: "https://cdn.pixabay.com/photo/2023/03/15/20/46/background-7855413_640.jpg" };
  selectedTemplatePlaceholders.value = [];
};

// Watch for template selection to update preview
watch(selectedTemplate, updatePreview);
watch(userName, updatePreview);
watch(companyName, updatePreview);
watch(otpLength, generatePreviewMessage);
watch(otpExpiry, generatePreviewMessage);
watch(
  dynamicFields,
  () => {
    // Only trigger preview update, don't modify dynamicFields to avoid recursion
    if (selectedTemplate.value) {
      generatePreviewMessage();
    }
  },
  { deep: true }
);

// Image error handler
const onImageError = () => {
  console.warn("Failed to load image for preview");
};

// SEO meta tags
const baseUrl = "https://whatsapp.checkleaked.cc";
useHead(() => {
  const title = t("verification.title") + " | WhatsApp Profile API";
  const description = t("verification.infoMessage") + " " + t("verification.title") + " - WhatsApp Profile API.";
  const url = `${baseUrl}/verification/${route.params.number || ""}`;
  return {
    title,
    meta: [
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
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
  };
});

// Client-side initialization
onMounted(async () => {
  if (import.meta.client) {
    await initializeStorage();

    // Initialize default values
    selectedLanguage.value = locale.value || "en";
    otpLength.value = 5;
    otpExpiry.value = 2;
    dynamicFields.value = { image: "https://cdn.pixabay.com/photo/2023/03/15/20/46/background-7855413_640.jpg" };

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
    }
  }
});

watch(phoneCode, (val) => {
  if (!val) return;
  if (import.meta.client) localStorage.setItem("phoneCode", JSON.stringify(val));
});

// Watch for language changes and reload templates accordingly
watch(selectedLanguage, (newLanguage, oldLanguage) => {
  if (newLanguage && newLanguage !== oldLanguage && templates.value.length > 0) {
    // Only load templates if the new language is in the supported languages list
    if (availableLanguages.value.some((lang) => lang.code === newLanguage)) {
      loadTemplatesForLanguage();
    }
  }
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
      // Auto-load templates if phone is valid
      nextTick(() => {
        if (phoneValid.value) {
          loadTemplates();
        }
      });
    }
  } catch (error) {
    console.error("Error parsing phone number:", error);
    // Fallback: try to extract country code and number manually
    const fullNumber = phoneNumberParam;
    if (fullNumber.length > 3) {
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

<style scoped>
/* Minimal custom styles - relying on Vuetify's built-in responsiveness */
.v-stepper {
  box-shadow: none !important;
  background: transparent !important;
}

.v-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.v-text-field input {
  text-align: center;
}

/* OTP input styling */
.v-field input[maxlength="8"] {
  font-size: 1.2em;
  letter-spacing: 2px;
  text-align: center;
  font-weight: 500;
}

/* WhatsApp Message Preview Styles */
.whatsapp-preview-light {
  background-color: #f0f2f5 !important;
}

.whatsapp-preview-dark {
  background-color: #1e1e1e !important;
}

.whatsapp-message-container {
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}

.whatsapp-message {
  background: #dcf8c6;
  border-radius: 12px 12px 4px 12px;
  padding: 8px 12px;
  max-width: 320px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
}

.v-theme--dark .whatsapp-message {
  background: #056162;
  color: #e9edef;
}

.message-image {
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
}

.message-image .v-img {
  min-height: 120px;
  max-height: 200px;
}

.message-text {
  color: #303030;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.v-theme--dark .message-text {
  color: #e9edef;
}

.message-time {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
  font-size: 11px;
  color: #667781;
}

.v-theme--dark .message-time {
  color: #8696a0;
}
</style>
