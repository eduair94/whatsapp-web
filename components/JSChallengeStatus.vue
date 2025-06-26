<template>
  <div></div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useFirebaseAuth } from "~/composables/useFirebaseAuth";
import { useJSChallenge } from "~/composables/useJSChallenge";

interface Props {
  showForUnauthenticated?: boolean;
  alwaysShow?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showForUnauthenticated: true,
  alwaysShow: false,
});

const jsChallenge = useJSChallenge();
const { user } = useFirebaseAuth();

const showChallenge = computed(() => {
  if (props.alwaysShow) return true;
  if (props.showForUnauthenticated && !user.value) return true;
  return false;
});
</script>

<style scoped>
.js-challenge-status {
  max-width: 100%;
}
</style>
