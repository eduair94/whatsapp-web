<template>
  <div class="map-container">
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>
              <span class="text-h5">Phone Numbers Proximity Search</span>
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="8">
                  <v-text-field v-model="addressInput" label="Search Address" placeholder="Enter an address or click on the map" variant="outlined" density="compact" :loading="geocodingLoading" @keyup.enter="geocodeAddress" append-inner-icon="mdi-magnify" @click:append-inner="geocodeAddress" />
                </v-col>
                <v-col cols="12" md="2">
                  <v-text-field v-model="searchParams.radius" label="Radius (m)" type="number" :rules="[rules.required, rules.radius]" variant="outlined" density="compact" />
                </v-col>
                <v-col cols="12" md="2">
                  <v-btn @click="searchPhoneNumbers" color="primary" :loading="loading" :disabled="!isFormValid" size="large" block> Search </v-btn>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-alert v-if="locationInfo" color="info" variant="tonal" density="compact" closable>
                    <div class="d-flex align-center">
                      <v-icon class="mr-2">mdi-map-marker</v-icon>
                      <span>{{ locationInfo }}</span>
                    </div>
                  </v-alert>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title>
              <span class="text-h6">Map View</span>
              <v-spacer></v-spacer>
              <v-btn @click="getCurrentLocation" color="primary" variant="text" size="small" :loading="locationLoading" prepend-icon="mdi-crosshairs-gps"> My Location </v-btn>
            </v-card-title>
            <v-card-text>
              <div class="map-wrapper">
                <ClientOnly>
                  <div ref="mapContainer" id="map" style="height: 500px; width: 100%"></div>
                  <template #fallback>
                    <div style="height: 500px; width: 100%; display: flex; align-items: center; justify-content: center; background: #f5f5f5">
                      <v-progress-circular indeterminate color="primary" />
                      <span class="ml-2">Loading map...</span>
                    </div>
                  </template>
                </ClientOnly>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card v-if="selectedBusiness">
            <v-card-title class="d-flex align-center ga-3">
              <span class="text-h6">Business Details</span>
              <v-spacer></v-spacer>
              <v-btn @click="selectedBusiness = null" icon="mdi-close" variant="text" size="small" />
            </v-card-title>
            <v-card-text>
              <div class="business-details">
                <div class="business-header">
                  <v-avatar size="60" class="mr-3">
                    <v-img v-if="selectedBusiness.profilePic" :src="selectedBusiness.profilePic" />
                    <v-icon v-else size="40">mdi-phone</v-icon>
                  </v-avatar>
                  <div>
                    <h3>{{ selectedBusiness.number }}</h3>
                    <p class="text-caption">{{ selectedBusiness.countryCode }}</p>
                    <v-chip v-if="selectedBusiness.isBusiness" size="small" color="success" class="mt-1"> Business </v-chip>
                  </div>
                </div>

                <v-divider class="my-3" />

                <div class="business-info">
                  <v-row>
                    <v-col cols="12" v-if="selectedBusiness.about">
                      <h4>About</h4>
                      <p>{{ selectedBusiness.about }}</p>
                    </v-col>

                    <v-col cols="12" v-if="selectedBusiness.businessProfile.description">
                      <h4>Description</h4>
                      <p>{{ selectedBusiness.businessProfile.description }}</p>
                    </v-col>

                    <v-col cols="12" v-if="selectedBusiness.businessProfile.address">
                      <h4>Address</h4>
                      <p>{{ selectedBusiness.businessProfile.address }}</p>
                    </v-col>

                    <v-col cols="12" v-if="selectedBusiness.businessProfile.categories.length > 0">
                      <h4>Categories</h4>
                      <v-chip-group>
                        <v-chip v-for="category in selectedBusiness.businessProfile.categories" :key="category.id" size="small" variant="outlined">
                          {{ category.localized_display_name }}
                        </v-chip>
                      </v-chip-group>
                    </v-col>

                    <v-col cols="12">
                      <h4>Distance</h4>
                      <p>{{ selectedBusiness.distance.toFixed(2) }} meters from search center</p>
                    </v-col>

                    <v-col cols="12">
                      <h4>Member Since</h4>
                      <p>{{ selectedBusiness.businessProfile.memberSinceText }}</p>
                    </v-col>
                  </v-row>
                </div>

                <v-divider class="my-3" />

                <v-btn @click="showBusinessOnMap(selectedBusiness)" color="primary" prepend-icon="mdi-map-marker" block> Show on Map </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <v-card v-else>
            <v-card-title>
              <span class="text-h6">Search Results</span>
              <v-spacer></v-spacer>
              <v-btn v-if="hasSearched" @click="searchPhoneNumbers" color="primary" variant="text" size="small" :loading="loading" prepend-icon="mdi-refresh"> Refresh </v-btn>
            </v-card-title>
            <v-card-text>
              <div v-if="loading" class="text-center">
                <v-progress-circular indeterminate color="primary" />
                <p class="mt-2">Searching...</p>
              </div>

              <div v-else-if="searchResults">
                <div v-if="searchResults.data && searchResults.data.resultCount > 0">
                  <v-chip color="primary" class="mb-3"> {{ searchResults.data.resultCount }} results found </v-chip>

                  <div class="mb-3" v-if="searchResults.data.distanceRange">
                    <small> Distance range: {{ searchResults.data.distanceRange.closest || 0 }}m - {{ searchResults.data.distanceRange.farthest?.toFixed(2) || 0 }}m </small>
                  </div>

                  <v-list>
                    <v-list-item v-for="phone in phoneNumbers" :key="phone._id" class="phone-item" @click="selectBusiness(phone)">
                      <template v-slot:prepend>
                        <v-avatar size="40">
                          <v-img v-if="phone.profilePic" :src="phone.profilePic" />
                          <v-icon v-else>mdi-phone</v-icon>
                        </v-avatar>
                      </template>

                      <v-list-item-title>{{ phone.number }}</v-list-item-title>
                      <v-list-item-subtitle>
                        <div>{{ phone.countryCode }}</div>
                        <div v-if="phone.businessProfile.address">{{ phone.businessProfile.address }}</div>
                        <div class="text-caption">{{ phone.distance.toFixed(2) }}m away</div>
                      </v-list-item-subtitle>

                      <template v-slot:append>
                        <v-chip v-if="phone.isBusiness" size="small" color="success"> Business </v-chip>
                      </template>
                    </v-list-item>
                  </v-list>
                </div>

                <div v-else class="text-center text-grey">
                  <v-icon size="48" class="mb-2">mdi-phone-off</v-icon>
                  <p>No phone numbers found in this area</p>
                  <p class="text-caption">Try increasing the search radius or moving to a different location</p>
                </div>
              </div>

              <div v-else-if="hasSearched && !searchResults" class="text-center text-grey">
                <v-icon size="48" class="mb-2">mdi-alert-circle</v-icon>
                <p>No phone numbers found in this area</p>
                <p class="text-caption">Try increasing the search radius or moving to a different location</p>
              </div>

              <div v-else class="text-center text-grey">
                <v-icon size="48" class="mb-2">mdi-map-search</v-icon>
                <p>Click on the map or search an address to find phone numbers</p>
                <p class="text-caption">Or move the red marker to set your search center</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import type { PhoneNumberDoc, PhoneProximitySearchResponse } from "~/utils/interfaces/phoneProximity";

// Types for Google Geocoding API
interface GeocodeResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
}

interface GeocodeResponse {
  status: string;
  results: GeocodeResult[];
}

// Leaflet types (imported but not executed on server)
type LeafletModule = typeof import("leaflet");
let L: LeafletModule;

// Page meta
definePageMeta({
  title: "Phone Proximity Map",
  description: "Search and visualize phone numbers by location",
});

// Router and route
const router = useRouter();
const route = useRoute();

// Reactive data
const searchParams = reactive({
  latitude: -34.9011, // Default to Montevideo
  longitude: -56.1645,
  radius: 5000,
});

// Initialize from URL parameters
const initializeFromURL = () => {
  const urlLat = route.query.lat;
  const urlLng = route.query.lng;
  const urlRadius = route.query.radius;

  if (urlLat && !isNaN(Number(urlLat))) {
    searchParams.latitude = Number(urlLat);
  }
  if (urlLng && !isNaN(Number(urlLng))) {
    searchParams.longitude = Number(urlLng);
  }
  if (urlRadius && !isNaN(Number(urlRadius))) {
    searchParams.radius = Number(urlRadius);
  }
};

// Update URL with current parameters
const updateURL = () => {
  router.push({
    query: {
      lat: searchParams.latitude.toString(),
      lng: searchParams.longitude.toString(),
      radius: searchParams.radius.toString(),
    },
  });
};

const addressInput = ref("");
const geocodingLoading = ref(false);
const locationLoading = ref(false);
const locationInfo = ref("");
const loading = ref(false);
const searchResults = ref<PhoneProximitySearchResponse | null>(null);
const selectedBusiness = ref<PhoneNumberDoc | null>(null);
const mapContainer = ref<HTMLElement>();
const map = ref<L.Map>();
const markersLayer = ref<L.LayerGroup>();
const searchCenterMarker = ref<L.Marker>();
const radiusCircle = ref<L.Circle>();
const zoom = ref(13);
const mapInitialized = ref(false);
const isClient = ref(false);
const hasSearched = ref(false);

// Google Maps API key
const GOOGLE_MAPS_API_KEY = "AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw";

// Computed properties
const mapCenter = computed(() => [searchParams.latitude, searchParams.longitude]);

const phoneNumbers = computed(() => {
  return searchResults.value?.data.docs || [];
});

// Form validation
const rules = {
  required: (value: any) => !!value || "Required",
  latitude: (value: number) => {
    if (value < -90 || value > 90) return "Latitude must be between -90 and 90";
    return true;
  },
  longitude: (value: number) => {
    if (value < -180 || value > 180) return "Longitude must be between -180 and 180";
    return true;
  },
  radius: (value: number) => {
    if (value <= 0 || value > 50000) return "Radius must be between 1 and 50000 meters";
    return true;
  },
};

const isFormValid = computed(() => {
  return searchParams.radius && searchParams.radius > 0 && searchParams.radius <= 50000;
});

// Create custom icons
const createSearchCenterIcon = () => {
  if (!L) return null;
  return L.divIcon({
    html: `<div style="background: #ff0000; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">S</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    className: "custom-search-icon",
  });
};

const createPhoneIcon = () => {
  if (!L) return null;
  return L.divIcon({
    html: `<div style="background: #00bcd4; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">📞</div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
    className: "custom-phone-icon",
  });
};

// Initialize map
const initializeMap = async () => {
  if (!mapContainer.value || !process.client || mapInitialized.value) return;

  try {
    // Dynamically import Leaflet only on client side
    if (!L) {
      const leafletModule = await import("leaflet");
      L = leafletModule.default;

      // Import CSS
      await import("leaflet/dist/leaflet.css");

      // Fix for default markers
      const markerIcon = await import("leaflet/dist/images/marker-icon.png");
      const markerIcon2x = await import("leaflet/dist/images/marker-icon-2x.png");
      const markerShadow = await import("leaflet/dist/images/marker-shadow.png");

      // Fix default icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2x.default,
        iconUrl: markerIcon.default,
        shadowUrl: markerShadow.default,
      });
    }

    // Wait a bit to ensure the DOM element is ready
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (!mapContainer.value) return;

    // Check if map is already initialized
    if (map.value) {
      map.value.remove();
      map.value = undefined;
    }

    map.value = L.map(mapContainer.value).setView([searchParams.latitude, searchParams.longitude], zoom.value);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map.value);

    // Initialize markers layer
    markersLayer.value = L.layerGroup().addTo(map.value);

    // Add click handler for map
    map.value.on("click", handleMapClick);

    // Add initial search center marker
    updateSearchCenterMarker();

    mapInitialized.value = true;

    // Force map to refresh its size
    setTimeout(() => {
      if (map.value) {
        map.value.invalidateSize();
      }
    }, 200);

    console.log("Map initialized successfully");
  } catch (error) {
    console.error("Error initializing map:", error);
  }
};

// Update map markers
const updateMapMarkers = () => {
  if (!map.value || !markersLayer.value || !L || !mapInitialized.value) return;

  try {
    // Clear existing markers
    markersLayer.value.clearLayers();

    // Remove existing search center marker and radius circle
    if (searchCenterMarker.value) {
      map.value.removeLayer(searchCenterMarker.value);
      searchCenterMarker.value = undefined;
    }
    if (radiusCircle.value) {
      map.value.removeLayer(radiusCircle.value);
      radiusCircle.value = undefined;
    }

    // Always add search center marker (even without results)
    const searchIcon = createSearchCenterIcon();
    if (searchIcon) {
      searchCenterMarker.value = L.marker([searchParams.latitude, searchParams.longitude], {
        icon: searchIcon,
        draggable: true,
      }).addTo(map.value);

      searchCenterMarker.value.bindPopup(`
        <div>
          <strong>Search Center</strong><br>
          Lat: ${searchParams.latitude.toFixed(6)}<br>
          Lng: ${searchParams.longitude.toFixed(6)}<br>
          <small>Drag to move or click on map</small>
        </div>
      `);

      // Handle marker drag
      searchCenterMarker.value.on("dragend", async (event) => {
        const marker = event.target;
        const position = marker.getLatLng();

        searchParams.latitude = position.lat;
        searchParams.longitude = position.lng;

        // Update popup content
        marker.setPopupContent(`
          <div>
            <strong>Search Center</strong><br>
            Lat: ${searchParams.latitude.toFixed(6)}<br>
            Lng: ${searchParams.longitude.toFixed(6)}<br>
            <small>Drag to move or click on map</small>
          </div>
        `);

        // Update URL
        updateURL();

        // Reverse geocode to get address
        await reverseGeocode(searchParams.latitude, searchParams.longitude);

        // Automatically search for phone numbers
        await searchPhoneNumbers();
      });
    }

    // Add radius circle
    radiusCircle.value = L.circle([searchParams.latitude, searchParams.longitude], {
      radius: searchParams.radius,
      color: "#ff0000",
      fillColor: "#ff0000",
      fillOpacity: 0.1,
      weight: 2,
    }).addTo(map.value);

    if (searchResults.value && searchResults.value.data && searchResults.value.data.docs) {
      // Add phone number markers
      phoneNumbers.value.forEach((phone) => {
        const lat = phone.businessProfile.location.coordinates[1];
        const lng = phone.businessProfile.location.coordinates[0];

        const phoneIcon = createPhoneIcon();
        if (phoneIcon) {
          const marker = L.marker([lat, lng], {
            icon: phoneIcon,
          }).addTo(markersLayer.value!);

          // Helper function to truncate text
          const truncateText = (text: string, maxLength: number = 50) => {
            if (!text) return "";
            return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
          };

          const popupContent = `
            <div class="phone-popup">
              <div class="phone-popup-header">
                ${phone.profilePic ? `<img src="${phone.profilePic}" class="profile-pic" />` : ""}
                <div>
                  <strong>${phone.number}</strong><br>
                  <small>${phone.countryCode}</small>
                </div>
              </div>
              <div class="phone-popup-body">
                ${phone.about ? `<p><strong>About:</strong> ${truncateText(phone.about)}</p>` : ""}
                ${phone.businessProfile.description ? `<p><strong>Description:</strong> ${truncateText(phone.businessProfile.description)}</p>` : ""}
                ${phone.businessProfile.address ? `<p><strong>Address:</strong> ${truncateText(phone.businessProfile.address)}</p>` : ""}
                ${
                  phone.businessProfile.categories.length > 0
                    ? `
                  <p><strong>Categories:</strong> ${truncateText(phone.businessProfile.categories.map((c) => c.localized_display_name).join(", "))}</p>
                `
                    : ""
                }
                <p><strong>Distance:</strong> ${phone.distance.toFixed(2)} meters</p>
                <p><strong>Member since:</strong> ${truncateText(phone.businessProfile.memberSinceText)}</p>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);

          // Add click handler to select business
          marker.on("click", () => {
            selectedBusiness.value = phone;
          });
        }
      });

      // Fit map to show all markers only if we have results
      if (phoneNumbers.value.length > 0) {
        const bounds = L.latLngBounds([]);
        bounds.extend([searchParams.latitude, searchParams.longitude]);
        phoneNumbers.value.forEach((phone) => {
          bounds.extend([phone.businessProfile.location.coordinates[1], phone.businessProfile.location.coordinates[0]]);
        });

        if (bounds.isValid()) {
          // Use a timeout to ensure all markers are properly positioned
          setTimeout(() => {
            if (map.value) {
              map.value.fitBounds(bounds, { padding: [20, 20] });
            }
          }, 100);
        }
      }
    }

    // Force map to invalidate size to ensure proper rendering
    setTimeout(() => {
      if (map.value) {
        map.value.invalidateSize();
      }
    }, 200);
  } catch (error) {
    console.error("Error updating map markers:", error);
  }
};

// Geolocation and geocoding functions
const getCurrentLocation = async () => {
  if (!navigator.geolocation) {
    console.error("Geolocation is not supported");
    return;
  }

  locationLoading.value = true;

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000,
      });
    });

    searchParams.latitude = position.coords.latitude;
    searchParams.longitude = position.coords.longitude;

    // Update map center
    if (map.value) {
      map.value.setView([searchParams.latitude, searchParams.longitude], zoom.value);
    }

    // Update URL
    updateURL();

    // Update search center marker
    updateSearchCenterMarker();

    // Reverse geocode to get address
    await reverseGeocode(searchParams.latitude, searchParams.longitude);

    // Automatically search for phone numbers
    await searchPhoneNumbers();
  } catch (error) {
    console.error("Error getting location:", error);
    locationInfo.value = "Could not get your location. Using default location (Montevideo, Uruguay)";
  } finally {
    locationLoading.value = false;
  }
};

const geocodeAddress = async () => {
  if (!addressInput.value.trim()) return;

  geocodingLoading.value = true;

  try {
    const response = (await $fetch(`https://maps.googleapis.com/maps/api/geocode/json`, {
      query: {
        key: GOOGLE_MAPS_API_KEY,
        address: addressInput.value.trim(),
      },
    })) as GeocodeResponse;

    if (response.status === "OK" && response.results.length > 0) {
      const result = response.results[0];
      const location = result.geometry.location;

      searchParams.latitude = location.lat;
      searchParams.longitude = location.lng;

      // Update map center
      if (map.value) {
        map.value.setView([searchParams.latitude, searchParams.longitude], zoom.value);
      }

      locationInfo.value = `Location set to: ${result.formatted_address}`;

      // Update URL
      updateURL();

      // Update search center marker
      updateSearchCenterMarker();

      // Automatically search for phone numbers
      await searchPhoneNumbers();
    } else {
      locationInfo.value = "Address not found. Please try a different address.";
    }
  } catch (error) {
    console.error("Error geocoding address:", error);
    locationInfo.value = "Error finding address. Please try again.";
  } finally {
    geocodingLoading.value = false;
  }
};

const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const response = (await $fetch(`https://maps.googleapis.com/maps/api/geocode/json`, {
      query: {
        key: GOOGLE_MAPS_API_KEY,
        latlng: `${lat},${lng}`,
      },
    })) as GeocodeResponse;

    if (response.status === "OK" && response.results.length > 0) {
      const result = response.results[0];
      locationInfo.value = `Location: ${result.formatted_address}`;
      addressInput.value = result.formatted_address;
    }
  } catch (error) {
    console.error("Error reverse geocoding:", error);
  }
};

// Map interaction handlers
const handleMapClick = async (event: L.LeafletMouseEvent) => {
  const { lat, lng } = event.latlng;

  searchParams.latitude = lat;
  searchParams.longitude = lng;

  // Update search center marker and radius circle
  updateSearchCenterMarker();

  // Update URL
  updateURL();

  // Reverse geocode to get address
  await reverseGeocode(lat, lng);

  // Automatically search for phone numbers
  await searchPhoneNumbers();
};

const updateSearchCenterMarker = () => {
  if (!map.value || !L || !mapInitialized.value) return;

  // Remove existing search center marker
  if (searchCenterMarker.value) {
    map.value.removeLayer(searchCenterMarker.value);
    searchCenterMarker.value = undefined;
  }

  // Remove existing radius circle
  if (radiusCircle.value) {
    map.value.removeLayer(radiusCircle.value);
    radiusCircle.value = undefined;
  }

  // Add new search center marker
  const searchIcon = createSearchCenterIcon();
  if (searchIcon) {
    searchCenterMarker.value = L.marker([searchParams.latitude, searchParams.longitude], {
      icon: searchIcon,
      draggable: true,
    }).addTo(map.value);

    searchCenterMarker.value.bindPopup(`
      <div>
        <strong>Search Center</strong><br>
        Lat: ${searchParams.latitude.toFixed(6)}<br>
        Lng: ${searchParams.longitude.toFixed(6)}<br>
        <small>Drag to move or click on map</small>
      </div>
    `);

    // Handle marker drag
    searchCenterMarker.value.on("dragend", async (event) => {
      const marker = event.target;
      const position = marker.getLatLng();

      searchParams.latitude = position.lat;
      searchParams.longitude = position.lng;

      // Update popup content
      marker.setPopupContent(`
        <div>
          <strong>Search Center</strong><br>
          Lat: ${searchParams.latitude.toFixed(6)}<br>
          Lng: ${searchParams.longitude.toFixed(6)}<br>
          <small>Drag to move or click on map</small>
        </div>
      `);

      // Update URL
      updateURL();

      // Reverse geocode to get address
      await reverseGeocode(searchParams.latitude, searchParams.longitude);

      // Automatically search for phone numbers
      await searchPhoneNumbers();
    });
  }

  // Add radius circle
  radiusCircle.value = L.circle([searchParams.latitude, searchParams.longitude], {
    radius: searchParams.radius,
    color: "#ff0000",
    fillColor: "#ff0000",
    fillOpacity: 0.1,
    weight: 2,
  }).addTo(map.value);
};

// Methods
const selectBusiness = (business: PhoneNumberDoc) => {
  selectedBusiness.value = business;

  // Center map on business
  if (map.value) {
    const lat = business.businessProfile.location.coordinates[1];
    const lng = business.businessProfile.location.coordinates[0];
    map.value.setView([lat, lng], 16);
  }
};

const showBusinessOnMap = (business: PhoneNumberDoc) => {
  if (map.value) {
    const lat = business.businessProfile.location.coordinates[1];
    const lng = business.businessProfile.location.coordinates[0];
    map.value.setView([lat, lng], 16);
  }

  // Close the details panel
  selectedBusiness.value = null;
};

const searchPhoneNumbers = async () => {
  if (!isFormValid.value) return;

  loading.value = true;
  hasSearched.value = true;

  try {
    const response = await $fetch<PhoneProximitySearchResponse>("/api/phone-proximity", {
      query: {
        latitude: searchParams.latitude,
        longitude: searchParams.longitude,
        radius: searchParams.radius,
      },
    });

    console.log("Response", response);

    searchResults.value = response;

    // Ensure map is initialized before updating markers
    if (!mapInitialized.value) {
      await initializeMap();
    }

    // Update map markers
    await nextTick();
    updateMapMarkers();
  } catch (error) {
    console.error("Error searching phone numbers:", error);
    searchResults.value = null;
  } finally {
    loading.value = false;
  }
};

// Lifecycle hooks
onMounted(async () => {
  if (isClient.value) return; // Prevent double initialization

  isClient.value = true;

  // Initialize from URL parameters
  initializeFromURL();

  // Wait for DOM to be ready
  await nextTick();

  // Initialize map with retry mechanism
  const initWithRetry = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        await initializeMap();
        if (mapInitialized.value) {
          break;
        }
      } catch (error) {
        console.error(`Map initialization attempt ${i + 1} failed:`, error);
        if (i === retries - 1) {
          console.error("Failed to initialize map after all retries");
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  };

  await initWithRetry();

  // Try to get current location if no URL parameters
  if (!route.query.lat || !route.query.lng) {
    await getCurrentLocation();
  } else {
    // If we have URL parameters, search automatically
    await reverseGeocode(searchParams.latitude, searchParams.longitude);
    await searchPhoneNumbers();
  }

  // Set location info if no location was obtained
  if (!locationInfo.value) {
    locationInfo.value = 'Using default location (Montevideo, Uruguay). Click "My Location" to use your current location.';
  }
});

// Watch for mapContainer to become available
watch(mapContainer, async (newContainer) => {
  if (newContainer && isClient.value && !mapInitialized.value) {
    await nextTick();
    await initializeMap();
  }
});

// Watch for radius changes to update URL
watch(
  () => searchParams.radius,
  () => {
    updateURL();
  }
);

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
    map.value = undefined;
  }
  mapInitialized.value = false;
});
</script>

<style scoped>
.map-container {
  padding: 20px 0;
}

.map-wrapper {
  border-radius: 8px;
  overflow: hidden;
}

.phone-popup {
  min-width: 250px;
}

.phone-popup-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.profile-pic {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.phone-popup-body p {
  margin: 5px 0;
  font-size: 14px;
}

.phone-item {
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.phone-item:hover {
  background-color: #f5f5f5;
}

.phone-item:last-child {
  border-bottom: none;
}

.business-details {
  padding: 8px 0;
}

.business-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.business-info h4 {
  margin-bottom: 8px;
  color: #1976d2;
}

.business-info p {
  margin-bottom: 12px;
  line-height: 1.4;
}

/* Custom icon styles */
:deep(.custom-search-icon) {
  background: transparent !important;
  border: none !important;
}

:deep(.custom-phone-icon) {
  background: transparent !important;
  border: none !important;
}

/* Leaflet popup styles */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
}

:deep(.leaflet-popup-content) {
  margin: 12px 16px;
}

:deep(.leaflet-popup-content .phone-popup-header) {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

:deep(.leaflet-popup-content .profile-pic) {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

:deep(.leaflet-popup-content .phone-popup-body p) {
  margin: 5px 0;
  font-size: 14px;
}
</style>
