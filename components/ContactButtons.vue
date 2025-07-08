<template>
  <v-row dense>
    <v-col cols="12">
      <v-btn :href="formatPhoneForWhatsApp(phone)" target="_blank" rel="noopener noreferrer" color="success" variant="elevated" block prepend-icon="mdi-whatsapp" class="text-none">
        {{ $t("lookup.contactWhatsApp") }}
      </v-btn>
    </v-col>
    <v-col cols="12">
      <v-btn :href="formatPhoneForGoogleMaps(phone)" target="_blank" rel="noopener noreferrer" color="primary" variant="elevated" block prepend-icon="mdi-map" class="text-none">
        {{ $t("lookup.viewOnGoogleMaps") }}
      </v-btn>
    </v-col>
    <v-col cols="12">
      <v-btn :href="formatPhoneForGoogleSearch(phone)" target="_blank" rel="noopener noreferrer" color="info" variant="elevated" block prepend-icon="mdi-google" class="text-none">
        {{ $t("lookup.googleSearch") }}
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { formatPhoneForWhatsApp } from "~/utils/whatsapp";

interface Props {
  phone: string;
}

defineProps<Props>();

const formatPhoneForGoogleMaps = (phone: string): string => {
  // Clean and format phone number for Google Maps search
  const cleanPhone = phone.replace(/\s+/g, "").replace(/[^\d+]/g, "");
  return `https://www.google.com/maps/search/${encodeURIComponent(cleanPhone)}`;
};

const formatPhoneForGoogleSearch = (phone: string): string => {
  // Clean and format phone number for Google search
  const cleanPhone = phone.replace(/\s+/g, "").replace(/[^\d+]/g, "");
  return `https://www.google.com/search?q=${encodeURIComponent(cleanPhone)}`;
};
</script>
