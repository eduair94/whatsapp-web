<template>
  <v-container class="auth-container">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="auth-card" elevation="10">
          <v-card-title class="text-center py-6">
            <h1 class="text-h4 font-weight-bold">
              {{ authMode === "login" ? t("auth.login.title") : t("auth.register.title") }}
            </h1>
          </v-card-title>

          <v-card-text class="pt-6">
            <!-- Error Alert -->
            <v-alert v-if="authError" type="error" variant="tonal" class="mb-4" closable @click:close="authError = null">
              {{ authError }}
            </v-alert>

            <!-- Success Alert -->
            <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4" closable @click:close="successMessage = null">
              {{ successMessage }}
            </v-alert>

            <!-- Auth Form -->
            <v-form ref="formRef" @submit.prevent="handleSubmit">
              <!-- Display Name (Register only) -->
              <v-text-field v-if="authMode === 'register'" v-model="form.displayName" :label="t('auth.displayName')" :rules="displayNameRules" variant="outlined" prepend-inner-icon="mdi-account" class="mb-3" required />

              <!-- Email -->
              <v-text-field v-model="form.email" :label="t('auth.email')" :rules="emailRules" variant="outlined" type="email" prepend-inner-icon="mdi-email" class="mb-3" required />

              <!-- Password -->
              <v-text-field v-model="form.password" :label="t('auth.password')" :rules="passwordRules" variant="outlined" :type="showPassword ? 'text' : 'password'" prepend-inner-icon="mdi-lock" :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="showPassword = !showPassword" class="mb-3" required />

              <!-- Confirm Password (Register only) -->
              <v-text-field v-if="authMode === 'register'" v-model="form.confirmPassword" :label="t('auth.confirmPassword')" :rules="confirmPasswordRules" variant="outlined" :type="showConfirmPassword ? 'text' : 'password'" prepend-inner-icon="mdi-lock-check" :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="showConfirmPassword = !showConfirmPassword" class="mb-4" required />

              <!-- Submit Button -->
              <v-btn type="submit" color="primary" size="large" block :loading="authLoading" class="text-none mb-4 w-100">
                {{ authMode === "login" ? t("auth.login.submit") : t("auth.register.submit") }}
              </v-btn>

              <!-- Divider -->
              <v-divider class="my-4">
                <span class="text-body-2 text-medium-emphasis px-2">{{ t("auth.orDivider") }}</span>
              </v-divider>

              <!-- Google Sign In Button -->
              <v-btn @click="handleGoogleSignIn" color="white" variant="outlined" size="large" block :loading="authLoading" class="text-none mb-4 w-100" prepend-icon="mdi-google">
                {{ t("auth.signInWithGoogle") }}
              </v-btn>
            </v-form>

            <!-- Forgot Password (Login only) -->
            <div v-if="authMode === 'login'" class="text-center mb-4">
              <v-btn variant="text" color="primary" size="small" @click="showForgotPassword = true">
                {{ t("auth.forgotPassword") }}
              </v-btn>
            </div>

            <!-- Toggle Auth Mode -->
            <v-divider class="my-4" />
            <div class="text-center">
              <p class="text-body-2 mb-2">
                {{ authMode === "login" ? t("auth.noAccount") : t("auth.hasAccount") }}
              </p>
              <v-btn variant="text" color="primary" @click="toggleAuthMode">
                {{ authMode === "login" ? t("auth.register.link") : t("auth.login.link") }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Forgot Password Dialog -->
    <v-dialog v-model="showForgotPassword" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          {{ t("auth.resetPassword.title") }}
        </v-card-title>
        <v-card-text>
          <p class="mb-4">{{ t("auth.resetPassword.description") }}</p>
          <v-text-field v-model="resetEmail" :label="t('auth.email')" variant="outlined" type="email" prepend-inner-icon="mdi-email" :rules="emailRules" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showForgotPassword = false">
            {{ t("auth.cancel") }}
          </v-btn>
          <v-btn color="primary" variant="flat" :loading="resetLoading" @click="handlePasswordReset">
            {{ t("auth.resetPassword.submit") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { useHead, useLocalePath, useRouter } from "#imports";
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import { useFirebaseAuth } from "~/composables/useFirebaseAuth";

const { t, locale } = useI18n();
const localePath = useLocalePath();
const router = useRouter();
const { user, error, loading, signIn, signUp, signInWithGoogle, resetPassword } = useFirebaseAuth();

// SEO
const pageUrl = `${baseUrl}/${locale.value}/auth`;

useHead({
  title: computed(() => t("auth.title") + " - " + t("meta.suffix")),
  meta: [
    { name: "description", content: computed(() => t("auth.meta.description")) },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: computed(() => t("meta.siteName")) },
    { property: "og:title", content: computed(() => t("auth.title") + " - " + t("meta.suffix")) },
    { property: "og:description", content: computed(() => t("auth.meta.description")) },
    { property: "og:url", content: pageUrl },
    { name: "twitter:title", content: computed(() => t("auth.title") + " - " + t("meta.suffix")) },
    { name: "twitter:description", content: computed(() => t("auth.meta.description")) },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "robots", content: "noindex, nofollow" }, // Private page
    { name: "language", content: computed(() => locale.value) },
  ],
});

// Reactive data
const authMode = ref<"login" | "register">("login");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const showForgotPassword = ref(false);
const formRef = ref();
const authError = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const authLoading = ref(false);
const resetLoading = ref(false);
const resetEmail = ref("");

const form = reactive({
  email: "",
  password: "",
  confirmPassword: "",
  displayName: "",
});

// Validation rules
const emailRules = [(v: string) => !!v || t("auth.validation.emailRequired"), (v: string) => /.+@.+\..+/.test(v) || t("auth.validation.emailInvalid")];

const passwordRules = [(v: string) => !!v || t("auth.validation.passwordRequired"), (v: string) => v.length >= 6 || t("auth.validation.passwordMinLength")];

const displayNameRules = [(v: string) => !!v || t("auth.validation.displayNameRequired"), (v: string) => v.length >= 2 || t("auth.validation.displayNameMinLength")];

const confirmPasswordRules = computed(() => [(v: string) => !!v || t("auth.validation.confirmPasswordRequired"), (v: string) => v === form.password || t("auth.validation.passwordsNotMatch")]);

// Methods
const toggleAuthMode = () => {
  authMode.value = authMode.value === "login" ? "register" : "login";
  authError.value = null;
  successMessage.value = null;
  // Reset form
  Object.keys(form).forEach((key) => {
    form[key as keyof typeof form] = "";
  });
  nextTick(() => {
    formRef.value?.resetValidation();
  });
};

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  authLoading.value = true;
  authError.value = null;
  successMessage.value = null;

  try {
    if (authMode.value === "login") {
      await signIn(form.email, form.password);
      successMessage.value = t("auth.login.success");
      // Redirect to home page after successful login
      setTimeout(() => {
        router.push(localePath("/"));
      }, 1500);
    } else {
      await signUp(form.email, form.password, form.displayName);
      successMessage.value = t("auth.register.success");
      // Redirect to home page after successful registration
      setTimeout(() => {
        router.push(localePath("/"));
      }, 1500);
    }
  } catch (err: any) {
    authError.value = error.value || t("auth.error.generic");
  } finally {
    authLoading.value = false;
  }
};

const handlePasswordReset = async () => {
  if (!resetEmail.value || !/.+@.+\..+/.test(resetEmail.value)) {
    authError.value = t("auth.validation.emailInvalid");
    return;
  }

  resetLoading.value = true;
  authError.value = null;

  try {
    await resetPassword(resetEmail.value);
    successMessage.value = t("auth.resetPassword.success");
    showForgotPassword.value = false;
    resetEmail.value = "";
  } catch (err: any) {
    authError.value = error.value || t("auth.error.generic");
  } finally {
    resetLoading.value = false;
  }
};

const handleGoogleSignIn = async () => {
  authLoading.value = true;
  authError.value = null;
  successMessage.value = null;

  try {
    await signInWithGoogle();
    successMessage.value = t("auth.login.success");
    // Redirect to home page after successful login
    setTimeout(() => {
      router.push(localePath("/"));
    }, 1500);
  } catch (err: any) {
    console.error(err);
    authError.value = error.value || t("auth.error.generic");
  } finally {
    authLoading.value = false;
  }
};

// Redirect if already authenticated
watch(user, (currentUser) => {
  if (currentUser) {
    router.push(localePath("/"));
  }
});

// Check if user is already authenticated on mount
onMounted(() => {
  if (user.value) {
    router.push(localePath("/"));
  }
});
</script>

<style scoped lang="scss">
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.auth-card {
  backdrop-filter: blur(10px);
  background: rgba(var(--v-theme-surface), 0.95);
  border-radius: 16px;

  .v-card-title {
    background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
    color: rgb(var(--v-theme-on-primary));
    margin: -1px -1px 0 -1px;
    border-radius: 16px 16px 0 0;
  }
}

.v-text-field {
  margin-bottom: 8px;
}

@media (max-width: 600px) {
  .auth-container {
    padding: 16px;
  }

  .auth-card {
    margin: 0;
  }
}
</style>
