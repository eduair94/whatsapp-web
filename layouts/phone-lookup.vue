<template>
  <div class="py-5 px-3 px-md-0">
    <!-- Rate Limit Display - positioned exactly where it was in the original page -->
    <h1 class="mb-5 mb-md-8 text-center">{{ $t("lookup.title") }}</h1>

    <!-- Cool announcement banner -->
    <nuxt-link class="announcement-container mb-6 announcement-link" :to="localePath('/api')" target="_blank" rel="noopener">
      <div class="announcement-banner">
        <div class="announcement-content">
          <div class="announcement-item">
            <v-icon class="announcement-icon" color="success">mdi-account-group</v-icon>
            <span class="announcement-text">{{ $t("hero.happyUsers") }}</span>
          </div>
          <div class="announcement-divider">•</div>
          <div class="announcement-item">
            <v-icon class="announcement-icon" color="white">mdi-tag</v-icon>
            <span class="announcement-text">{{ $t("hero.cheapest") }}</span>
          </div>
        </div>
      </div>
    </nuxt-link>

    <!-- Rate Limit Display -->
    <ClientOnly>
      <RateLimitDisplay />
      <template #fallback>
        <RateLimitSkeleton />
      </template>
    </ClientOnly>

    <slot />

    <!-- Page content -->
  </div>
</template>

<script setup lang="ts">
import RateLimitDisplay from "~/components/RateLimitDisplay.vue";
const localePath = useLocalePath();

// Import components that might be used
</script>

<style lang="scss" scoped>
.announcement-link {
  text-decoration: none;
  transition: filter 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  justify-content: center;

  .announcement-banner {
    transition: filter 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover .announcement-banner {
    filter: brightness(1.08) drop-shadow(0 0 8px #764ba288);
    transform: scale(1.025) rotate(-0.5deg);
    box-shadow: 0 4px 24px 0 #764ba288, 0 1.5px 8px #667eea66;
    cursor: pointer;
  }
}

.announcement-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.announcement-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50px;
  padding: 12px 24px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 90%;
  width: fit-content;

  @media (max-width: 768px) {
    padding: 10px 20px;
    border-radius: 25px;
  }
}

.announcement-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 768px) {
    gap: 12px;
    flex-direction: column;
  }
}

.announcement-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
}

.announcement-icon {
  font-size: 1.2rem !important;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.announcement-text {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  white-space: nowrap;

  @media (max-width: 768px) {
    white-space: normal;
    text-align: center;
  }
}

.announcement-divider {
  color: rgba(255, 255, 255, 0.7);
  font-weight: bold;
  font-size: 1.2rem;

  @media (max-width: 768px) {
    display: none;
  }
}

.announcement-banner {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-3px);
  }
}
</style>
