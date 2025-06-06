<template>
  <div>
    <!-- API Key Management Dialog -->
    <v-dialog v-model="isApiKeyManagerOpen" max-width="600px" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-key-variant</v-icon>
          {{ $t("apiKey.title") }}
        </v-card-title>

        <v-card-text>
          <!-- Description -->
          <p class="mb-4 text-body-2">
            {{ $t("apiKey.description") }}
          </p>

          <!-- Error Alert -->
          <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4" closable @click:close="errorMessage = null">
            {{ errorMessage }}
          </v-alert>

          <!-- Success Alert -->
          <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4" closable @click:close="successMessage = null">
            {{ successMessage }}
          </v-alert>

          <!-- Current API Key Info -->
          <div v-if="currentApiKey && !isEditing" class="mb-4">
            <v-card variant="outlined" class="pa-3">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-subtitle-2 mb-1">{{ $t("apiKey.current") }}</div>
                  <div class="text-body-2 font-mono">{{ currentApiKey.apiKey }}</div>
                  <div class="text-caption text-medium-emphasis">{{ $t("auth.linkedAt") }}: {{ formatDate(currentApiKey.linkedAt) }}</div>
                </div>
                <div class="d-flex flex-column gap-2">
                  <v-btn size="small" color="primary" variant="outlined" @click="isEditing = true">
                    {{ $t("apiKey.update") }}
                  </v-btn>
                  <v-btn size="small" color="error" variant="outlined" @click="confirmRemove = true">
                    {{ $t("apiKey.remove") }}
                  </v-btn>
                </div>
              </div>
            </v-card>
          </div>

          <!-- API Key Input Form -->
          <div v-if="!currentApiKey || isEditing">
            <v-form ref="formRef" @submit.prevent="handleSave">
              <v-text-field v-model="apiKeyInput" :label="$t('apiKey.inputLabel')" :placeholder="$t('apiKey.inputPlaceholder')" variant="outlined" type="password" prepend-inner-icon="mdi-key" :rules="apiKeyRules" :loading="loading" class="mb-3" required />
            </v-form>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="handleCancel" :disabled="loading">
            {{ $t("apiKey.cancel") }}
          </v-btn>
          <v-btn v-if="!currentApiKey || isEditing" color="primary" variant="flat" :loading="loading" @click="handleSave">
            {{ $t("apiKey.save") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirm Remove Dialog -->
    <v-dialog v-model="confirmRemove" max-width="400px">
      <v-card>
        <v-card-title>{{ $t("apiKey.remove") }}</v-card-title>
        <v-card-text>
          {{ $t("apiKey.confirmRemove") }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmRemove = false">
            {{ $t("apiKey.cancel") }}
          </v-btn>
          <v-btn color="error" variant="flat" :loading="loading" @click="handleRemove">
            {{ $t("apiKey.remove") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "#imports";
import { onMounted, ref, watch } from "vue";
import { useApiKeyManagement } from "~/composables/useApiKeyManagement";
import { useFirebaseAuth } from "~/composables/useFirebaseAuth";
import { useGlobalApiKeyManager } from "~/composables/useGlobalApiKeyManager";

const { t } = useI18n();
const { user } = useFirebaseAuth();
const { loading, error, linkApiKey, getUserApiKey, removeApiKey } = useApiKeyManagement();
const { isApiKeyManagerOpen, closeApiKeyManager } = useGlobalApiKeyManager();

// Component state
const confirmRemove = ref(false);
const isEditing = ref(false);
const apiKeyInput = ref("");
const currentApiKey = ref<{ apiKey: string; linkedAt: string } | null>(null);
const formRef = ref();
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Validation rules
const apiKeyRules = [(v: string) => !!v || t("apiKey.validation.required"), (v: string) => v.length >= 20 || t("apiKey.validation.invalid")];

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

// Load current API key when user is available
const loadCurrentApiKey = async () => {
  if (!user.value) return;

  try {
    const response = await getUserApiKey(user.value);
    if (response.hasKey) {
      currentApiKey.value = {
        apiKey: response.apiKey!,
        linkedAt: response.lastSaved!,
      };
      const { setApiKeyValue } = usePhoneApi();
      setApiKeyValue(true);
    }
  } catch (err) {
    console.error("Error loading API key:", err);
  }
};

// Handle save
const handleSave = async () => {
  if (!user.value) {
    errorMessage.value = t("auth.error.notAuthenticated");
    return;
  }

  const { valid } = await formRef.value?.validate();
  if (!valid) return;

  try {
    errorMessage.value = null;
    successMessage.value = null;

    const response = await linkApiKey(user.value, apiKeyInput.value);

    if (response.success) {
      successMessage.value = t("apiKey.success");
      apiKeyInput.value = "";
      isEditing.value = false;
      await loadCurrentApiKey();
    } else {
      errorMessage.value = response.error || t("apiKey.error");
    }
  } catch (err: any) {
    errorMessage.value = err.message || t("apiKey.error");
  }
};

// Handle remove
const handleRemove = async () => {
  if (!user.value) return;

  try {
    errorMessage.value = null;
    successMessage.value = null;

    const response = await removeApiKey(user.value);

    if (response.success) {
      successMessage.value = response.message;
      currentApiKey.value = null;
      confirmRemove.value = false;
    } else {
      errorMessage.value = response.error || t("apiKey.error");
    }
  } catch (err: any) {
    errorMessage.value = err.message || t("apiKey.error");
  }
};

// Handle cancel
const handleCancel = () => {
  closeApiKeyManager();
  isEditing.value = false;
  apiKeyInput.value = "";
  errorMessage.value = null;
  successMessage.value = null;
  confirmRemove.value = false;
};

// Watch for user changes
watch(
  user,
  async (newUser) => {
    if (newUser) {
      await loadCurrentApiKey();
    } else {
      currentApiKey.value = null;
    }
  },
  { immediate: true }
);

// Watch for error prop changes
watch(error, (newError) => {
  if (newError) {
    errorMessage.value = newError;
  }
});

// Load API key on mount
onMounted(async () => {
  if (user.value) {
    await loadCurrentApiKey();
  }
});
</script>

<style scoped>
.font-mono {
  font-family: "Courier New", monospace;
}
.gap-2 {
  gap: 10px;
}
</style>
