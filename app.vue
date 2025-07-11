<template>
  <v-app class="wrapper">
    <!-- Mobile Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" temporary location="left" class="d-flex d-md-none">
      <v-list>
        <!-- Tools submenu -->
        <v-list-item prepend-icon="mdi-home" :title="$t('nav.checkNumber')" :to="localePath('/')" @click="drawer = false"></v-list-item>
        <v-list-item prepend-icon="mdi-history" :title="$t('nav.searchHistory')" :to="localePath('/history')" @click="drawer = false"></v-list-item>
        <v-list-item prepend-icon="mdi-api" :title="$t('nav.apiStatus')" :to="localePath('/api-status')" @click="drawer = false"></v-list-item>
        <v-list-item prepend-icon="mdi-shield-check" :title="$t('nav.testVerification')" :to="localePath('/verification')" @click="drawer = false"></v-list-item>
        <v-list-item prepend-icon="mdi-message-check" :title="$t('nav.otpStatus')" :to="localePath('/otp-status')" @click="drawer = false"></v-list-item>
        <v-list-item prepend-icon="mdi-telegram" :title="$t('nav.telegramStatus')" :to="localePath('/telegram-status')" @click="drawer = false"></v-list-item>

        <!-- WhatsApp Section -->
        <v-list-group>
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-whatsapp" title="WhatsApp" class="text-whatsapp font-weight-medium"></v-list-item>
          </template>
          <v-list-item :to="localePath('/database')" prepend-icon="mdi-database" :title="$t('nav.database')" @click="drawer = false" class="pl-8"></v-list-item>
          <v-list-item :to="localePath('/stats')" prepend-icon="mdi-chart-line" :title="$t('nav.stats')" @click="drawer = false" class="pl-8"></v-list-item>
          <v-list-item :to="localePath('/business/map')" prepend-icon="mdi-map-marker" title="Business Map" @click="drawer = false" class="pl-8"></v-list-item>
        </v-list-group>

        <!-- Telegram Section -->
        <v-list-group>
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-telegram" title="Telegram" class="text-telegram font-weight-medium"></v-list-item>
          </template>
          <v-list-item :to="localePath('/telegram/database')" prepend-icon="mdi-database" :title="$t('nav.database')" @click="drawer = false" class="pl-8"></v-list-item>
          <v-list-item :to="localePath('/telegram/stats')" prepend-icon="mdi-chart-line" :title="$t('nav.stats')" @click="drawer = false" class="pl-8"></v-list-item>
        </v-list-group>

        <v-list-item prepend-icon="mdi-robot" :title="$t('nav.telegramBot')" href="https://t.me/WhatsappNumberSearch_bot" target="_blank" @click="drawer = false"></v-list-item>
        <v-list-item v-if="user" prepend-icon="mdi-key" :title="$t('nav.apiKeyManager')" @click="openApiKeyManager" @click.stop="drawer = false"></v-list-item>

        <!-- PWA Install Button for Mobile -->
        <v-list-item
          prepend-icon="mdi-download"
          :title="$t('pwa.installApp')"
          @click="
            installPWA();
            drawer = false;
          "
        ></v-list-item>

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
            <v-list-item :to="localePath('/verification')" prepend-icon="mdi-shield-check">
              <v-list-item-title>{{ $t("nav.testVerification") }}</v-list-item-title>
            </v-list-item>
            <v-list-item :to="localePath('/otp-status')" prepend-icon="mdi-message-check">
              <v-list-item-title>{{ $t("nav.otpStatus") }}</v-list-item-title>
            </v-list-item>
            <v-list-item :to="localePath('/telegram-status')" prepend-icon="mdi-telegram">
              <v-list-item-title>{{ $t("nav.telegramStatus") }}</v-list-item-title>
            </v-list-item>

            <v-divider class="my-2"></v-divider>

            <!-- WhatsApp Section -->
            <v-list-subheader class="text-whatsapp font-weight-bold whatsapp-section">
              <v-icon class="mr-2" color="success">mdi-whatsapp</v-icon>
              WhatsApp
            </v-list-subheader>
            <v-list-item :to="localePath('/database')" prepend-icon="mdi-database" class="pl-8">
              <v-list-item-title>{{ $t("nav.database") }}</v-list-item-title>
            </v-list-item>
            <v-list-item :to="localePath('/stats')" prepend-icon="mdi-chart-line" class="pl-8">
              <v-list-item-title>{{ $t("nav.stats") }}</v-list-item-title>
            </v-list-item>
            <v-list-item :to="localePath('/business/map')" prepend-icon="mdi-map-marker" class="pl-8">
              <v-list-item-title>Business Map</v-list-item-title>
            </v-list-item>

            <v-divider class="my-2"></v-divider>

            <!-- Telegram Section -->
            <v-list-subheader class="text-telegram font-weight-bold telegram-section">
              <v-icon class="mr-2" color="info">mdi-telegram</v-icon>
              Telegram
            </v-list-subheader>
            <v-list-item :to="localePath('/telegram/database')" prepend-icon="mdi-database" class="pl-8">
              <v-list-item-title>{{ $t("nav.database") }}</v-list-item-title>
            </v-list-item>
            <v-list-item :to="localePath('/telegram/stats')" prepend-icon="mdi-chart-line" class="pl-8">
              <v-list-item-title>{{ $t("nav.stats") }}</v-list-item-title>
            </v-list-item>

            <v-divider class="my-2"></v-divider>

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
        <v-btn class="mr-3" link color="primary" variant="elevated" :to="localePath('/api')" target="_blank" prepend-icon="mdi-code-tags"> {{ $t("nav.api") }} </v-btn>
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

            <!-- PWA Install Button for Desktop -->
            <v-list-item @click="installPWA" prepend-icon="mdi-download">
              <v-list-item-title>{{ $t("pwa.installApp") }}</v-list-item-title>
            </v-list-item>
            <v-divider />

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
          <v-btn v-bind="props" color="primary" class="mr-0 mr-md-3">
            <v-icon>mdi-translate</v-icon>
            <span style="font-size: 0.95em; margin-left: 4px; min-width: 2ch">{{ locale.toUpperCase() }}</span>
          </v-btn>
        </template>
        <v-card class="pa-2" min-width="200">
          <v-autocomplete v-model="selectedLocale" :items="localeOptions" item-title="name" @click.prevent="(e:any) => e.stopPropagation()" item-value="code" density="compact" hide-details autofocus />
        </v-card>
      </v-menu>

      <!-- LinkedIn Profile -->
      <v-btn href="https://www.linkedin.com/in/eduardo-airaudo" target="_blank" rel="noopener noreferrer" color="primary" variant="text" size="small" class="mr-0 mr-md-2" title="Eduardo Airaudo - LinkedIn Profile">
        <v-icon>mdi-linkedin</v-icon>
        <span class="d-none d-lg-inline ml-1">Eduardo Airaudo</span>
      </v-btn>
    </v-app-bar>

    <!-- Language Alert positioned under the menu -->
    <LanguageAlert />

    <NuxtLayout>
      <LoadingOverlay />
      <v-container fluid class="pa-0">
        <NuxtPage />
      </v-container>
    </NuxtLayout>
    <!-- Reviews Carousel -->
    <ReviewsCarousel />
    <Footer></Footer>
    <!-- API Key Manager Component -->
    <ApiKeyManager />
  </v-app>
</template>

<script lang="ts" setup>
import { useI18n, useLocalePath, useRouter, useSwitchLocalePath } from "#imports";
import { computed, defineAsyncComponent, ref, watch } from "vue";
import { useFirebaseAuth } from "~/composables/useFirebaseAuth";
import { useGlobalApiKeyManager } from "~/composables/useGlobalApiKeyManager";

const localePath = useLocalePath();
const { locale, locales, t, setLocale } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const router = useRouter();
const { openApiKeyManager } = useGlobalApiKeyManager();

// PWA functionality
const { canInstall, install: installPWA, isSupported, isInstalled } = usePWAWeb();

const localeOptions = computed(() => locales.value);
const selectedLocale = ref(locale.value);

watch(selectedLocale, (val) => {
  if (val && val !== locale.value) {
    router.push(switchLocalePath(val));
  }
});
watch(locale, (val) => {
  selectedLocale.value = val;
});

// Reactive data for mobile drawer
const drawer = ref(false);

// Firebase Auth - Auto-initializes on first call (fastest approach)
const { user, logout } = useFirebaseAuth();

// Components
const Footer = defineAsyncComponent(() => import("~/components/Footer.vue"));
const LoadingOverlay = defineAsyncComponent(() => import("~/components/LoadingOverlay.vue"));
const ApiKeyManager = defineAsyncComponent(() => import("~/components/ApiKeyManager.vue"));
const ReviewsCarousel = defineAsyncComponent(() => import("~/components/ReviewsCarousel.vue"));
const LanguageAlert = defineAsyncComponent(() => import("~/components/LanguageAlert.vue"));
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
  width: 100%;
}

/* Enhanced Navigation Styles */
.v-list-group {
  border-radius: 8px;
  margin: 4px 0;
  transition: all 0.3s ease;
}

.v-list-group:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.v-list-group .v-list-item {
  border-radius: 6px;
  margin: 2px 8px;
  transition: all 0.2s ease;
}

.v-list-group .v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.06);
  transform: translateX(4px);
}

.v-list-subheader {
  padding: 12px 16px 8px 16px;
  font-size: 0.875rem;
  letter-spacing: 0.025em;
  display: flex;
  align-items: center;
}

.v-list-item.pl-8 {
  position: relative;
}

.v-list-item.pl-8::before {
  content: "";
  position: absolute;
  left: 32px;
  top: 50%;
  width: 2px;
  height: 20px;
  background: linear-gradient(to bottom, rgba(25, 118, 210, 0.3), transparent);
  transform: translateY(-50%);
  border-radius: 1px;
}

/* WhatsApp brand colors */
.text-whatsapp {
  color: #25d366 !important;
}

.v-list-subheader.whatsapp-section {
  background: linear-gradient(90deg, rgba(37, 211, 102, 0.1), transparent);
  border-left: 3px solid #25d366;
}

/* Telegram brand colors */
.text-telegram {
  color: #0088cc !important;
}

.v-list-subheader.telegram-section {
  background: linear-gradient(90deg, rgba(0, 136, 204, 0.1), transparent);
  border-left: 3px solid #0088cc;
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
