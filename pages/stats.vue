<template>
  <div class="stats-page">
    <v-container>
      <!-- Header -->
      <div class="text-center mb-8">
        <h1>
          <v-icon class="mr-3" size="40">mdi-chart-line</v-icon>
          {{ t("stats.title") }}
        </h1>
        <p class="text-h6 text-medium-emphasis">{{ t("stats.subtitle") }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center my-16">
        <v-progress-circular :size="70" :width="7" color="primary" indeterminate></v-progress-circular>
        <p class="text-h6 mt-4">{{ t("stats.loading") }}</p>
      </div>

      <!-- Error State -->
      <v-alert v-else-if="error" type="error" variant="tonal" class="ma-4">
        {{ error }}
      </v-alert>

      <!-- Main Content -->
      <div v-else-if="statsData">
        <!-- Key Metrics Cards -->
        <v-row class="mb-8">
          <v-col cols="12" md="3">
            <v-card class="text-center pa-4" elevation="4">
              <v-icon size="48" color="primary" class="mb-2">mdi-database</v-icon>
              <h3 class="text-h4 font-weight-bold">{{ formatNumber(statsData.total) }}</h3>
              <p class="text-body-1 text-medium-emphasis">{{ t("stats.totalQueries") }}</p>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card class="text-center pa-4" elevation="4">
              <v-icon size="48" color="success" class="mb-2">mdi-clock-time-four</v-icon>
              <h3 class="text-h4 font-weight-bold">{{ formatNumber(statsData.last24Hours) }}</h3>
              <p class="text-body-1 text-medium-emphasis">{{ t("stats.last24Hours") }}</p>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card class="text-center pa-4" elevation="4">
              <v-icon size="48" color="warning" class="mb-2">mdi-calendar-week</v-icon>
              <h3 class="text-h4 font-weight-bold">{{ formatNumber(statsData.lastWeek) }}</h3>
              <p class="text-body-1 text-medium-emphasis">{{ t("stats.lastWeek") }}</p>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card class="text-center pa-4" elevation="4">
              <v-icon size="48" color="info" class="mb-2">mdi-speedometer</v-icon>
              <h3 class="text-h4 font-weight-bold">{{ Math.round(statsData.syncDurationMs / 1000) }}s</h3>
              <p class="text-body-1 text-medium-emphasis">{{ t("stats.syncDuration") }}</p>
            </v-card>
          </v-col>
        </v-row>

        <!-- Charts Section -->
        <v-row>
          <!-- Country Distribution Chart -->
          <v-col cols="12" lg="8">
            <v-card elevation="4" class="pa-6">
              <v-card-title class="text-h5 mb-4">{{ t("stats.topCountriesByUsage") }}</v-card-title>
              <div class="chart-container">
                <Bar :data="chartData" :options="chartOptions" :height="300" />
              </div>
            </v-card>
          </v-col>

          <!-- Donut Chart -->
          <v-col cols="12" lg="4">
            <v-card elevation="4" class="pa-6">
              <v-card-title class="text-h5 mb-4">
                <v-icon class="mr-2">mdi-chart-donut</v-icon>
                {{ t("stats.distribution") }}
              </v-card-title>
              <div class="chart-container">
                <Doughnut :data="donutData" :options="donutOptions" :height="300" />
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Interactive Map -->
        <v-row class="mt-8">
          <v-col cols="12">
            <v-card elevation="4" class="pa-6">
              <v-card-title class="text-h5 mb-4">
                <v-icon class="mr-2">mdi-map-outline</v-icon>
                {{ t("stats.globalUsageMap") }}
                <v-spacer></v-spacer>
                <v-btn size="small" variant="outlined" @click="refreshMap" :loading="mapLoading">
                  <v-icon size="16" class="mr-2">mdi-refresh</v-icon>
                  {{ t("stats.refresh") }}
                </v-btn>
              </v-card-title>
              <div class="map-container">
                <!-- Interactive Map -->
                <div v-if="!mapError" id="world-map" class="map-element">
                  <div v-if="mapLoading" class="text-center pa-16 map-loading-overlay">
                    <v-progress-circular :size="50" :width="5" color="primary" indeterminate></v-progress-circular>
                    <p class="text-body-2 mt-4">{{ t("stats.loadingInteractiveMap") }}</p>
                  </div>
                </div>

                <!-- Fallback Vue Component -->
                <div v-else class="text-center pa-16 map-fallback">
                  <v-icon size="72" color="primary" class="mb-4">mdi-earth</v-icon>
                  <h3 class="text-h5 mb-4">{{ t("stats.globalDistribution") }}</h3>
                  <p class="text-body-2 text-medium-emphasis mb-8">{{ t("stats.interactiveMapUnavailable") }}</p>

                  <!-- Country Grid -->
                  <v-row class="mt-8" justify="center">
                    <v-col v-for="(country, index) in statsData.topCountries.slice(0, 8)" :key="country._id" cols="6" sm="4" md="3" lg="2">
                      <v-card variant="outlined" class="text-center pa-3 country-fallback-card">
                        <div class="text-h4 mb-2">{{ getCountryFlag(country._id) }}</div>
                        <div class="text-caption mb-1">{{ getCountryName(country._id) }}</div>
                        <div class="text-body-2 font-weight-bold mb-1">{{ formatNumber(country.count) }}</div>
                        <v-chip size="x-small" color="primary" variant="text">#{{ index + 1 }}</v-chip>
                      </v-card>
                    </v-col>
                  </v-row>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Country Details Table -->
        <v-row class="mt-8">
          <v-col cols="12">
            <v-card elevation="4">
              <v-card-title class="text-h5">
                <v-icon class="mr-2">mdi-table</v-icon>
                {{ t("stats.detailedCountryStatistics") }}
              </v-card-title>
              <v-data-table :headers="tableHeaders" :items="tableItems" :items-per-page="10" class="elevation-0" :theme="'dark'">
                <template v-slot:item.flag="{ item }">
                  <span class="flag-emoji">{{ getCountryFlag(item._id) }}</span>
                </template>
                <template v-slot:item.count="{ item }">
                  <strong>{{ formatNumber(item.count) }}</strong>
                </template>
                <template v-slot:item.percentage="{ item }">
                  <v-chip :color="getPercentageColor(item.percentage)" variant="tonal" size="small"> {{ item.percentage }}% </v-chip>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>

        <!-- Sync Info -->
        <v-row class="mt-8">
          <v-col cols="12">
            <v-card elevation="2" variant="tonal" color="info">
              <v-card-text class="text-center">
                <v-icon class="mr-2">mdi-information</v-icon>
                {{ t("stats.lastSynchronized") }} {{ formatDate(statsData.lastSyncDate) }}
                <v-chip class="ml-2" :color="statsData.fromCache ? 'warning' : 'success'" size="small">
                  {{ statsData.fromCache ? t("stats.fromCache") : t("stats.liveData") }}
                </v-chip>
                <span v-if="statsData.fromCache" class="ml-2 text-caption"> ({{ t("stats.cacheAge") }} {{ Math.round(statsData.cacheAge / 1000) }}s) </span>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from "chart.js";
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { Bar, Doughnut } from "vue-chartjs";
import { phoneCodes } from "~/utils/phoneCodes";

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

// i18n composable
const { t } = useI18n();

// Define layout
definePageMeta({
  layout: false,
});

// Head meta
useHead({
  title: computed(() => t("stats.title")),
  meta: [{ name: "description", content: computed(() => t("stats.subtitle")) }],
});

// Reactive data
const loading = ref(true);
const error = ref("");
const statsData = ref(null);
const mapLoading = ref(false);
const mapError = ref(false);
let leafletMap = null;

// Function to get country name from ISO code using phoneCodes utility
const getCountryName = (isoCode) => {
  const phoneCode = phoneCodes.find((code) => code.iso === isoCode);
  return phoneCode ? t("country." + phoneCode.country) : isoCode;
};

// Function to get country flag from ISO code using phoneCodes utility
const getCountryFlag = (isoCode) => {
  const phoneCode = phoneCodes.find((code) => code.iso === isoCode);
  return phoneCode ? phoneCode.flag : "🏳️";
};

// Function to get country coordinates from ISO code using phoneCodes utility
const getCountryCoordinates = (isoCode) => {
  const phoneCode = phoneCodes.find((code) => code.iso === isoCode);
  return phoneCode ? phoneCode.coordinates : null;
};

// Fetch stats data
const fetchStats = async () => {
  try {
    loading.value = true;
    const response = await $fetch("/api/stats").catch((e) => {
      // Handle fetch errors
      console.error("Fetch error:", e);
      if (e?.statusCode === 403) {
        window.location.href = "/api/refresh";
      }
      return {
        success: false,
        error: e.message || "An unexpected error occurred. Please try again.",
        statusCode: e.statusCode || 500,
      };
    });

    if (response.success) {
      statsData.value = response.data;
    } else {
      error.value = t("stats.failedToLoad");
    }
  } catch (err) {
    error.value = t("stats.errorFetching") + " " + err.message;
  } finally {
    loading.value = false;
  }
};

// Chart data for bar chart
const chartData = computed(() => {
  if (!statsData.value?.topCountries) return { labels: [], datasets: [] };

  const labels = statsData.value.topCountries.map((country) => getCountryName(country._id));
  const data = statsData.value.topCountries.map((country) => country.count);

  return {
    labels,
    datasets: [
      {
        label: "Queries",
        data,
        backgroundColor: ["#1976D2", "#388E3C", "#F57C00", "#D32F2F", "#7B1FA2", "#0097A7", "#5D4037", "#455A64", "#E64A19", "#689F38"],
        borderColor: ["#1565C0", "#2E7D32", "#EF6C00", "#C62828", "#6A1B9A", "#00838F", "#4E342E", "#37474F", "#D84315", "#558B2F"],
        borderWidth: 2,
      },
    ],
  };
});

// Chart options for bar chart
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "white",
      bodyColor: "white",
      callbacks: {
        label: function (context) {
          return `${t("stats.queries")}: ${formatNumber(context.parsed.y)}`;
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(255, 255, 255, 0.1)",
      },
      ticks: {
        color: "rgba(255, 255, 255, 0.8)",
        callback: function (value) {
          return formatNumber(value);
        },
      },
    },
    x: {
      grid: {
        color: "rgba(255, 255, 255, 0.1)",
      },
      ticks: {
        color: "rgba(255, 255, 255, 0.8)",
      },
    },
  },
};

// Donut chart data
const donutData = computed(() => {
  if (!statsData.value?.topCountries) return { labels: [], datasets: [] };

  const topCountries = statsData.value.topCountries.slice(0, 5);
  const labels = topCountries.map((country) => getCountryName(country._id));
  const data = topCountries.map((country) => country.count);

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: ["#1976D2", "#388E3C", "#F57C00", "#D32F2F", "#7B1FA2"],
        borderColor: ["#1565C0", "#2E7D32", "#EF6C00", "#C62828", "#6A1B9A"],
        borderWidth: 2,
      },
    ],
  };
});

// Donut chart options
const donutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: "rgba(255, 255, 255, 0.8)",
        usePointStyle: true,
        padding: 15,
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "white",
      bodyColor: "white",
      callbacks: {
        label: function (context) {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((context.parsed / total) * 100).toFixed(1);
          return `${context.label}: ${formatNumber(context.parsed)} (${percentage}%)`;
        },
      },
    },
  },
};

// Table headers
const tableHeaders = [
  { title: "", key: "flag", sortable: false, width: "60px" },
  { title: computed(() => t("stats.country")), key: "name", sortable: true },
  { title: computed(() => t("stats.code")), key: "_id", sortable: true },
  { title: computed(() => t("stats.queries")), key: "count", sortable: true },
  { title: computed(() => t("stats.percentage")), key: "percentage", sortable: true },
];

// Table items
const tableItems = computed(() => {
  if (!statsData.value?.topCountries) return [];

  const total = statsData.value.total;
  return statsData.value.topCountries.map((country) => ({
    ...country,
    name: getCountryName(country._id),
    percentage: ((country.count / total) * 100).toFixed(2),
  }));
});

// Utility functions
const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

const getPercentageColor = (percentage) => {
  const num = parseFloat(percentage);
  if (num >= 10) return "success";
  if (num >= 5) return "warning";
  return "info";
};

// Initialize world map
const initWorldMap = async () => {
  console.log("initWorldMap called");
  console.log("process.client:", process.client);
  console.log("statsData.value:", statsData.value);
  console.log("topCountries:", statsData.value?.topCountries);

  if (!process.client) {
    console.log("Not on client side - early return");
    return;
  }

  if (!statsData.value?.topCountries) {
    console.log("No stats data available - early return");
    return;
  }

  mapLoading.value = true;

  // Wait a bit to ensure DOM is ready
  await new Promise((resolve) => setTimeout(resolve, 100));

  try {
    console.log("Starting map initialization...");

    const mapContainer = document.getElementById("world-map");
    console.log("Map container found:", mapContainer);
    if (!mapContainer) {
      console.log("Map container not found! Waiting and retrying...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      const retryContainer = document.getElementById("world-map");
      if (!retryContainer) {
        console.log("Map container still not found after retry!");
        mapError.value = true;
        return;
      }
    }

    // Dynamically import Leaflet only on client side
    const L = await import("leaflet");
    console.log("Leaflet imported:", L);

    // Import CSS
    await import("leaflet/dist/leaflet.css");
    console.log("Leaflet CSS imported");

    // Clear existing map if any
    if (leafletMap) {
      leafletMap.remove();
    }

    // Create map
    leafletMap = L.map("world-map", {
      preferCanvas: true,
      zoomControl: true,
      attributionControl: true,
    }).setView([20, 0], 2);

    console.log("Map created successfully");

    // Add tile layer (dark theme)
    L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    }).addTo(leafletMap);

    console.log("Tile layer added");

    // Find max count for sizing markers
    const maxCount = Math.max(...statsData.value.topCountries.map((c) => c.count));

    // Add markers for each country
    statsData.value.topCountries.forEach((country, index) => {
      const coords = getCountryCoordinates(country._id);
      if (!coords) {
        console.log(`No coordinates found for country: ${country._id}`);
        return;
      }

      // Calculate marker size based on query count
      const percentage = country.count / maxCount;
      const markerSize = Math.max(15, Math.min(50, 15 + percentage * 35));

      // Color based on ranking
      const colors = ["#FF4444", "#FF8844", "#FFBB44", "#88BB44", "#44BB88", "#44BBAA", "#4488BB", "#4455BB", "#8844BB", "#BB44BB"];
      const color = colors[index] || "#666666";

      // Create custom marker
      const marker = L.circleMarker([coords[0], coords[1]], {
        radius: markerSize,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.6,
      }).addTo(leafletMap);

      // Create popup content
      const popupContent = `
        <div class="popup-container">
          <div class="popup-flag">${getCountryFlag(country._id)}</div>
          <h3 class="popup-title">${getCountryName(country._id)}</h3>
          <p class="popup-count popup-count-color" data-color="${color}">
            ${formatNumber(country.count)} ${t("stats.queries")}
          </p>
          <p class="popup-percentage">
            ${((country.count / statsData.value.total) * 100).toFixed(2)}% ${t("stats.ofTotal")}
          </p>
          <p class="popup-rank">
            ${t("stats.rank")} #${index + 1}
          </p>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: "custom-popup",
      });

      // Set dynamic color when popup opens
      marker.on("popupopen", function () {
        const popup = document.querySelector(".custom-popup .popup-count-color");
        if (popup) {
          popup.style.color = color;
        }
      });

      // Add hover effects
      marker.on("mouseover", function () {
        this.setStyle({
          weight: 3,
          opacity: 1,
          fillOpacity: 0.8,
          radius: markerSize + 3,
        });
      });

      marker.on("mouseout", function () {
        this.setStyle({
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.6,
          radius: markerSize,
        });
      });
    });

    console.log("Markers added successfully");

    const legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
      const div = L.DomUtil.create("div", "map-legend");
      div.innerHTML = `
        <div class="legend-container">
          <h4 class="legend-title">${t("stats.queryVolume")}</h4>
          <div class="legend-item">
            <div class="legend-marker legend-marker-high"></div>
            <span>${t("stats.high")}</span>
          </div>
          <div class="legend-item">
            <div class="legend-marker legend-marker-medium"></div>
            <span>${t("stats.medium")}</span>
          </div>
          <div class="legend-item">
            <div class="legend-marker legend-marker-low"></div>
            <span>${t("stats.lowerVolume")}</span>
          </div>
        </div>
      `;
      return div;
    };
    legend.addTo(leafletMap);

    console.log("Map initialization completed successfully");
  } catch (error) {
    console.error("Error initializing map:", error);
    // Set error flag to show Vue fallback component
    mapError.value = true;
  } finally {
    mapLoading.value = false;
  }
};

// Refresh map function
const refreshMap = async () => {
  mapError.value = false; // Reset error state
  await initWorldMap();
};

// Lifecycle
onMounted(async () => {
  await fetchStats();
  await nextTick();
  setTimeout(() => {
    initWorldMap();
  }, 500);
});

// Cleanup on unmount
onUnmounted(() => {
  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
  }
});
</script>

<style scoped>
.stats-page {
  min-height: 100vh;
}

.chart-container {
  position: relative;
  height: 300px;
}

.map-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.flag-emoji {
  font-size: 1.5rem;
}

.v-card {
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.v-data-table {
  background: transparent !important;
}

:deep(.v-data-table-header) {
  background: rgba(255, 255, 255, 0.05) !important;
}

:deep(.v-data-table__tr:hover) {
  background: rgba(255, 255, 255, 0.08) !important;
}

/* Leaflet map styles */
:deep(.leaflet-container) {
  background: #1a1a1a !important;
  border-radius: 8px;
}

:deep(.leaflet-control-zoom) {
  border: none !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

:deep(.leaflet-control-zoom a) {
  background: rgba(255, 255, 255, 0.9) !important;
  color: #333 !important;
  border: none !important;
}

:deep(.leaflet-control-zoom a:hover) {
  background: #fff !important;
}

:deep(.leaflet-popup-content-wrapper) {
  background: #fff !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
}

:deep(.leaflet-popup-tip) {
  background: #fff !important;
}

:deep(.map-legend) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
  border-radius: 8px !important;
}

/* Custom animation for markers */
@keyframes markerPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

:deep(.leaflet-marker-icon) {
  transition: all 0.3s ease !important;
}

/* Map element styles */
.map-element {
  min-height: 500px;
  height: fit-content;
  width: 100%;
  position: relative;
}

.map-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.map-fallback {
  height: fit-content;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.country-fallback-card {
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

/* Popup styles */
.popup-container {
  text-align: center;
  padding: 8px;
  min-width: 200px;
}

.popup-flag {
  font-size: 2rem;
  margin-bottom: 8px;
}

.popup-title {
  margin: 0 0 8px 0;
  color: #333;
}

.popup-count {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  font-weight: bold;
}

.popup-percentage {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.popup-rank {
  margin: 4px 0 0 0;
  font-size: 0.8rem;
  color: #888;
}

/* Legend styles */
.legend-container {
  background: rgba(0, 0, 0, 0.8);
  padding: 12px;
  border-radius: 8px;
  color: white;
  font-size: 12px;
}

.legend-title {
  margin: 0 0 8px 0;
  color: white;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.legend-item:last-child {
  margin-bottom: 0;
}

.legend-marker {
  border-radius: 50%;
  margin-right: 8px;
}

.legend-marker-high {
  width: 20px;
  height: 20px;
  background: #ff4444;
}

.legend-marker-medium {
  width: 15px;
  height: 15px;
  background: #ffbb44;
}

.legend-marker-low {
  width: 12px;
  height: 12px;
  background: #44bb88;
}
</style>
