<template>
  <v-skeleton-loader height="45px" :elevation="2" class="rate-limit-card mx-auto mb-4 overflow-hidden" max-width="600" variant="outlined" type="card"></v-skeleton-loader>
</template>

<script setup lang="ts">
// No props needed for skeleton loader
</script>

<style scoped>
.rate-limit-card {
  transition: all 0.3s ease;
}
</style>
