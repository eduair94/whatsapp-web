<template>
  <v-fade-transition v-if="loading">
    <div class="loading_screen">
      <span class="cubesWrapper">
        <span class="cube_loading"></span>
        <span class="cube_loading"></span>
      </span>
    </div>
  </v-fade-transition>
</template>

<script setup lang="ts">
const nuxtApp = useNuxtApp();
const loading = ref(false);
nuxtApp.hook("page:start", () => {
  loading.value = true;
});
nuxtApp.hook("page:finish", () => {
  loading.value = false;
});
</script>

<style lang="scss">
body .loading_screen {
  transition: 0.5s ease-in-out;
  position: fixed;
  z-index: 99999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #36393f5e;
}

.loading_screen .cubesWrapper {
  left: 48vw;
  top: 45vh;
  position: relative;
  display: inline-block;
  width: 52px;
  height: 52px;
  contain: paint;
}

.loading_screen .cube_loading {
  background-color: #7289da;
  width: 10px;
  height: 10px;
  position: absolute;
  top: 0;
  left: 0;
  -webkit-animation: cubeSpinner 1.8s ease-in-out infinite;
  animation: cubeSpinner 1.8s ease-in-out infinite;
}

.cube_loading:last-child {
  -webkit-animation-delay: -0.9s;
  animation-delay: -0.9s;
}

@-webkit-keyframes cubeSpinner {
  25% {
    -webkit-transform: translateX(22px) rotate(-90deg) scale(0.5);
    transform: translateX(22px) rotate(-90deg) scale(0.5);
  }

  50% {
    -webkit-transform: translateX(22px) translateY(22px) rotate(-180deg);
    transform: translateX(22px) translateY(22px) rotate(-180deg);
  }

  75% {
    -webkit-transform: translateX(0) translateY(22px) rotate(-270deg) scale(0.5);
    transform: translateX(0) translateY(22px) rotate(-270deg) scale(0.5);
  }

  to {
    -webkit-transform: rotate(-1turn);
    transform: rotate(-1turn);
  }
}

@keyframes cubeSpinner {
  25% {
    -webkit-transform: translateX(22px) rotate(-90deg) scale(0.5);
    transform: translateX(22px) rotate(-90deg) scale(0.5);
  }

  50% {
    -webkit-transform: translateX(22px) translateY(22px) rotate(-180deg);
    transform: translateX(22px) translateY(22px) rotate(-180deg);
  }

  75% {
    -webkit-transform: translateX(0) translateY(22px) rotate(-270deg) scale(0.5);
    transform: translateX(0) translateY(22px) rotate(-270deg) scale(0.5);
  }

  to {
    -webkit-transform: rotate(-1turn);
    transform: rotate(-1turn);
  }
}
</style>