<template>
  <v-app class="wrapper">
    <!-- Mobile Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" temporary location="left" class="d-flex d-md-none">
      <v-list>
        <!-- Tools submenu -->
        <v-list-item prepend-icon="mdi-home" :title="$t('nav.checkNumber')" :to="localePath('/')" @click="drawer = false"></v-list-item>
        <v-list-item prepend-icon="mdi-history" :title="$t('nav.searchHistory')" :to="localePath('/history')" @click="drawer = false"></v-list-item>
        <v-list-item prepend-icon="mdi-api" :title="$t('nav.apiStatus')" :to="localePath('/api-status')" @click="drawer = false"></v-list-item>        <v-list-item prepend-icon="mdi-chart-line" :title="$t('nav.stats')" :to="localePath('/stats')" @click="drawer = false"></v-list-item> <v-list-item prepend-icon="mdi-shield-check" :title="$t('nav.testVerification')" :to="localePath('/verification')" @click="drawer = false"></v-list-item>
        <v-list-item prepend-icon="mdi-database" :title="$t('nav.database')" :to="localePath('/database')" @click="drawer = false"></v-list-item>
        <v-list-item prepend-icon="mdi-robot" :title="$t('nav.telegramBot')" href="https://t.me/WhatsappNumberSearch_bot" target="_blank" @click="drawer = false"></v-list-item>
        <v-list-item v-if="user" prepend-icon="mdi-key" :title="$t('nav.apiKeyManager')" @click="openApiKeyManager" @click.stop="drawer = false"></v-list-item>

        <v-list-item v-if="!user" prepend-icon="mdi-account" :title="$t('nav.auth')" :to="localePath('/auth')" @click="drawer = false"></v-list-item>
        <v-list-item
          v-else
          prepend-icon="mdi-logout"
          :title="$t('nav.logout')"
          @click="
            () => {
              logout();
              drawer = false;
            }
          "
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar class="position-relative" app prominent>
      <!-- Mobile Menu Button -->
      <v-app-bar-nav-icon class="d-flex d-md-none" @click="drawer = !drawer"></v-app-bar-nav-icon>
      <!-- App Title -->
      <v-app-bar-title>
        <v-btn link color="inherit" variant="text" :to="localePath('/')" class="v-app-bar-title" :class="{ 'text-truncate': $vuetify.display.xs }">
          <span class="d-none d-sm-inline">{{ $t("app.title") }}</span>
          <span class="d-inline d-sm-none">{{ $t("app.shortTitle") }}</span>
        </v-btn>
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <!-- Desktop Navigation Buttons -->
      <div class="d-none d-md-flex mr-lg-5">
        <!-- Tools Menu -->
        <v-menu offset-y>
          <template #activator="{ props }">
            <v-btn v-bind="props" class="mr-3" color="primary" variant="outlined" prepend-icon="mdi-tools">
              <span class="d-none d-lg-block">{{ $t("nav.tools") }}</span>
              <span class="d-block d-lg-none">{{ $t("nav.tools") }}</span>
            </v-btn>
          </template>
          <v-list>
            <v-list-item :to="localePath('/')" prepend-icon="mdi-home">
              <v-list-item-title>{{ $t("nav.checkNumber") }}</v-list-item-title>
            </v-list-item>
            <v-list-item :to="localePath('/history')" prepend-icon="mdi-history">
              <v-list-item-title>{{ $t("nav.searchHistory") }}</v-list-item-title>
            </v-list-item>
            <v-list-item :to="localePath('/api-status')" prepend-icon="mdi-api">
              <v-list-item-title>{{ $t("nav.apiStatus") }}</v-list-item-title>
            </v-list-item>
            <v-list-item :to="localePath('/stats')" prepend-icon="mdi-chart-line">
              <v-list-item-title>{{ $t("nav.stats") }}</v-list-item-title>
            </v-list-item>
            <v-list-item :to="localePath('/verification')" prepend-icon="mdi-shield-check">
              <v-list-item-title>{{ $t("nav.testVerification") }}</v-list-item-title>
            </v-list-item>            <v-list-item :to="localePath('/database')" prepend-icon="mdi-database">
              <v-list-item-title>{{ $t("nav.database") }}</v-list-item-title>
            </v-list-item>
            <v-list-item href="https://t.me/WhatsappNumberSearch_bot" target="_blank" prepend-icon="mdi-robot">
              <v-list-item-title>{{ $t("nav.telegramBot") }}</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="user" @click="openApiKeyManager" prepend-icon="mdi-key">
              <v-list-item-title>{{ $t("nav.apiKeyManager") }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn class="mr-3" color="success" variant="elevated" :to="localePath('/pricing')" prepend-icon="mdi-currency-usd">
          <span class="d-none d-lg-block">{{ $t("nav.pricing") }}</span>
          <span class="d-block d-lg-none">{{ $t("nav.pricingShort") }}</span>
        </v-btn>
        <v-btn class="mr-3" link color="primary" variant="elevated" href="https://rapidapi.com/airaudoeduardo/api/whatsapp-data1/" target="_blank" prepend-icon="mdi-code-tags"> {{ $t("nav.api") }} </v-btn>
        <v-menu offset-y>
          <template #activator="{ props }">
            <v-btn v-bind="props" color="primary" class="mr-0 mr-md-5">
              <v-icon>mdi-account-circle</v-icon>
              <span style="font-size: 0.95em; margin-left: 4px; min-width: 2ch">{{ $t("nav.user") }}</span>
            </v-btn>
          </template>
          <v-list style="min-width: 250px">
            <v-list-item v-if="user" style="padding: 8px; border-radius: 8px; background-color: #f5f5f5">
              <div class="d-flex align-center flex-wrap gap-10">
                <v-avatar size="40" class="mr-3" style="border: 2px solid #ccc">
                  <img class="w-100" v-if="user.photoURL" :src="user.photoURL" alt="User Avatar" />
                </v-avatar>
                <v-list-item-title style="font-weight: bold; font-size: 0.9em; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px">
                  {{ user.displayName ? user.displayName : user.email }}
                </v-list-item-title>
              </div>
            </v-list-item>
            <v-divider v-if="user" />
            <v-list-item v-if="user" @click="logout">
              <v-list-item-title>{{ $t("nav.logout") }}</v-list-item-title>
            </v-list-item>
            <v-list-item v-else :to="localePath('/auth')">
              <v-list-item-title>{{ $t("nav.auth") }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
      <!-- Language Selector -->
      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn v-bind="props" color="primary" class="mr-0 mr-md-5">
            <v-icon>mdi-translate</v-icon>
            <span style="font-size: 0.95em; margin-left: 4px; min-width: 2ch">{{ locale.toUpperCase() }}</span>
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="locale in availableLocales" :key="locale.code" :to="switchLocalePath(locale.code)">
            <v-list-item-title>{{ locale.name }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <NuxtLayout>
      <LoadingOverlay />
      <v-container fluid class="pa-0">
        <NuxtPage />
      </v-container>
    </NuxtLayout>
    <Footer></Footer>
    <!-- API Key Manager Component -->
    <ApiKeyManager />
  </v-app>
</template>

<script lang="ts" setup>
import { useI18n, useLocalePath, useSwitchLocalePath } from "#imports";
import { computed, defineAsyncComponent, ref } from "vue";
import { useFirebaseAuth } from "~/composables/useFirebaseAuth";
import { useGlobalApiKeyManager } from "~/composables/useGlobalApiKeyManager";

const localePath = useLocalePath();
const { locale, locales, t, setLocale } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const { openApiKeyManager } = useGlobalApiKeyManager();

const availableLocales = computed(() => {
  return locales.value.filter((i) => i.code !== locale.value);
});

// Reactive data for mobile drawer
const drawer = ref(false);

// Firebase Auth - Auto-initializes on first call (fastest approach)
const { user, logout } = useFirebaseAuth();

// Components
const Footer = defineAsyncComponent(() => import("~/components/Footer.vue"));
const LoadingOverlay = defineAsyncComponent(() => import("~/components/LoadingOverlay.vue"));
const ApiKeyManager = defineAsyncComponent(() => import("~/components/ApiKeyManager.vue"));
</script>

<style>
.v-application__wrap {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  align-content: stretch;
  justify-content: flex-start;
}

.v-footer {
  max-height: 120px;
  width: 100%;
}

/* Mobile-specific styles */
@media (max-width: 960px) {
  .v-app-bar-title {
    font-size: 1rem !important;
  }

  .v-footer {
    max-height: 100%;
  }

  .v-btn {
    min-width: auto !important;
  }
}

/* Extra small screens */
@media (max-width: 600px) {
  .v-app-bar {
    padding: 0 8px !important;
  }

  .v-app-bar-title {
    font-size: 0.9rem !important;
  }
}

.user-info {
  padding: 8px;
  border-radius: 8px;
  background-color: #f5f5f5;
  transition: background-color 0.3s ease;
}

.user-info:hover {
  background-color: #e0e0e0;
}

.user-name {
  font-weight: bold;
  font-size: 1rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v-avatar img {
  border-radius: 50%;
  border: 2px solid #ccc;
}
</style>
