<template>
  <v-alert color="primary" variant="tonal" density="compact" class="my-0" @click="navigateToHome" style="cursor: pointer">
    <template v-slot:prepend>
      <v-icon>mdi-store-plus</v-icon>
    </template>
    <div class="d-flex align-center justify-space-between">
      <div>
        <div class="font-weight-medium">{{ $t("map.addYourBusiness") }}</div>
        <div class="text-caption">{{ $t("map.addYourBusinessDescription") }}</div>
      </div>
      <v-btn link :to="localePath('/')" color="primary" variant="text" size="small" append-icon="mdi-arrow-right">
        {{ $t("map.addYourBusiness") }}
      </v-btn>
    </div>
  </v-alert>
</template>

<script setup lang="ts">
const localePath = useLocalePath();
// Navigation method for "Add your business" alert
const navigateToHome = () => {
  navigateTo(localePath("/"));
};
</script>
