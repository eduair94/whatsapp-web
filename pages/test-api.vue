<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">API Key System Test</h1>

    <!-- Authentication Status -->
    <div class="mb-6 p-4 border rounded-lg">
      <h2 class="text-xl font-semibold mb-3">Authentication Status</h2>
      <div v-if="user" class="text-green-600">
        ✅ Signed in as: {{ user.email }}
        <br />
        UID: {{ user.uid }}
      </div>
      <div v-else class="text-red-600">❌ Not authenticated</div>

      <div class="mt-3 space-x-2">
        <button v-if="!user" @click="signIn" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Sign In with Google</button>
        <button v-if="user" @click="signOut" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Sign Out</button>
      </div>
    </div>

    <!-- API Key Management -->
    <div v-if="user" class="mb-6 p-4 border rounded-lg">
      <h2 class="text-xl font-semibold mb-3">API Key Management</h2>

      <!-- Current API Key Status -->
      <div class="mb-4">
        <h3 class="font-medium mb-2">Current Status:</h3>
        <div v-if="loading.status" class="text-gray-500">Loading...</div>
        <div v-else-if="apiKeyStatus.hasKey" class="text-green-600">
          ✅ API Key saved: {{ apiKeyStatus.apiKey }}
          <br />
          <small>Last saved: {{ new Date(apiKeyStatus.lastSaved).toLocaleString() }}</small>
        </div>
        <div v-else class="text-yellow-600">⚠️ No API key saved</div>
      </div>

      <!-- Save New API Key -->
      <div class="mb-4">
        <h3 class="font-medium mb-2">Save API Key:</h3>
        <div class="flex space-x-2">
          <input v-model="newApiKey" type="text" placeholder="Enter API key..." class="flex-1 border rounded px-3 py-2" />
          <button @click="saveApiKey" :disabled="!newApiKey || loading.save" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50">
            {{ loading.save ? "Saving..." : "Save" }}
          </button>
        </div>
      </div>

      <!-- Get Full API Key -->
      <div class="mb-4">
        <button @click="getFullApiKey" :disabled="loading.get" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50">
          {{ loading.get ? "Loading..." : "Get Full API Key" }}
        </button>
        <div v-if="fullApiKey" class="mt-2 p-2 bg-gray-100 rounded font-mono text-sm">
          {{ fullApiKey }}
        </div>
      </div>

      <!-- Delete API Key -->
      <div class="mb-4">
        <button @click="deleteApiKey" :disabled="loading.delete" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50">
          {{ loading.delete ? "Deleting..." : "Delete API Key" }}
        </button>
      </div>
    </div>

    <!-- Test Results -->
    <div class="mb-6 p-4 border rounded-lg">
      <h2 class="text-xl font-semibold mb-3">Test Results</h2>
      <div class="space-y-2 max-h-64 overflow-y-auto">
        <div v-for="(result, index) in testResults" :key="index" class="text-sm">
          <span class="text-gray-500">{{ result.timestamp }}:</span>
          <span :class="result.success ? 'text-green-600' : 'text-red-600'">
            {{ result.message }}
          </span>
        </div>
      </div>
      <button @click="clearResults" class="mt-2 text-sm text-gray-500 hover:text-gray-700">Clear Results</button>
    </div>

    <!-- Phone API Test -->
    <div class="mb-6 p-4 border rounded-lg">
      <h2 class="text-xl font-semibold mb-3">Phone API Test</h2>

      <!-- Phone Input -->
      <div class="mb-4">
        <h3 class="font-medium mb-2">Test Phone Lookup:</h3>
        <div class="flex space-x-2">
          <input v-model="testPhoneNumber" type="text" placeholder="Enter phone number (e.g., 59899123456)..." class="flex-1 border rounded px-3 py-2" />
          <button @click="testPhoneApi" :disabled="!testPhoneNumber || phoneApi.loading.value" class="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50">
            {{ phoneApi.loading.value ? "Searching..." : "Search" }}
          </button>
        </div>
      </div>

      <!-- Phone API Status -->
      <div class="mb-4">
        <h3 class="font-medium mb-2">API Status:</h3>
        <div class="space-y-1 text-sm">
          <div>Loading: {{ phoneApi.loading.value ? "Yes" : "No" }}</div>
          <div>Rate Limited: {{ phoneApi.rateLimited.value ? "Yes" : "No" }}</div>
          <div>Authenticated: {{ phoneApi.isAuthenticated.value ? "Yes" : "No" }}</div>
          <div v-if="phoneApi.error.value" class="text-red-600">Error: {{ phoneApi.error.value }}</div>
        </div>
      </div>

      <!-- Phone API Result -->
      <div v-if="phoneApiResult" class="mt-3">
        <h3 class="font-medium mb-2">Result:</h3>
        <pre class="bg-gray-100 p-3 rounded text-sm overflow-x-auto">{{ JSON.stringify(phoneApiResult, null, 2) }}</pre>
      </div>
    </div>

    <!-- System Health -->
    <div class="mb-6 p-4 border rounded-lg">
      <h2 class="text-xl font-semibold mb-3">System Health</h2>
      <button @click="checkHealth" :disabled="loading.health" class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50">
        {{ loading.health ? "Checking..." : "Check Health" }}
      </button>
      <div v-if="healthStatus" class="mt-3">
        <pre class="bg-gray-100 p-3 rounded text-sm overflow-x-auto">{{ JSON.stringify(healthStatus, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useApiKeyManagement } from "~/composables/useApiKeyManagement";
import { useFirebaseAuth } from "~/composables/useFirebaseAuth";
import { usePhoneApi } from "~/composables/usePhoneApi";

const { user, signInWithGoogle, signOut: firebaseSignOut } = useFirebaseAuth();
const { saveApiKey: saveKey, getApiKey, deleteApiKey: deleteKey, hasApiKey } = useApiKeyManagement();

// Phone API composable
const phoneApi = usePhoneApi({
  includeAuth: true,
  retryAttempts: 2,
  timeout: 30000,
});

// Reactive data
const newApiKey = ref("");
const fullApiKey = ref("");
const apiKeyStatus = ref({ hasKey: false, apiKey: "", lastSaved: null });
const healthStatus = ref(null);
const testResults = ref([]);

// Phone API test data
const testPhoneNumber = ref("59899123456");
const phoneApiResult = ref(null);

// Loading states
const loading = ref({
  status: false,
  save: false,
  get: false,
  delete: false,
  health: false,
});

// Helper function to add test results
const addResult = (message, success = true) => {
  testResults.value.unshift({
    timestamp: new Date().toLocaleTimeString(),
    message,
    success,
  });
};

// Authentication methods
const signIn = async () => {
  try {
    await signInWithGoogle();
    addResult("Successfully signed in");
    await checkApiKeyStatus();
  } catch (error) {
    addResult(`Sign in failed: ${error.message}`, false);
  }
};

const signOut = async () => {
  try {
    await firebaseSignOut();
    addResult("Successfully signed out");
    // Clear local state
    apiKeyStatus.value = { hasKey: false, apiKey: "", lastSaved: null };
    fullApiKey.value = "";
  } catch (error) {
    addResult(`Sign out failed: ${error.message}`, false);
  }
};

// API Key methods
const checkApiKeyStatus = async () => {
  if (!user.value) return;

  try {
    loading.value.status = true;
    const result = await hasApiKey();

    if (result.success) {
      apiKeyStatus.value = {
        hasKey: result.data.hasKey,
        apiKey: result.data.apiKey || "",
        lastSaved: result.data.lastSaved,
      };
      addResult("API key status checked successfully");
    } else {
      addResult(`Failed to check API key status: ${result.error}`, false);
    }
  } catch (error) {
    addResult(`Error checking API key status: ${error.message}`, false);
  } finally {
    loading.value.status = false;
  }
};

const saveApiKey = async () => {
  if (!newApiKey.value) return;

  try {
    loading.value.save = true;
    const result = await saveKey(newApiKey.value);

    if (result.success) {
      addResult("API key saved successfully");
      newApiKey.value = "";
      await checkApiKeyStatus();
    } else {
      addResult(`Failed to save API key: ${result.error}`, false);
    }
  } catch (error) {
    addResult(`Error saving API key: ${error.message}`, false);
  } finally {
    loading.value.save = false;
  }
};

const getFullApiKey = async () => {
  try {
    loading.value.get = true;
    const result = await getApiKey();

    if (result.success) {
      fullApiKey.value = result.data.apiKey;
      addResult("Full API key retrieved successfully");
    } else {
      addResult(`Failed to get API key: ${result.error}`, false);
    }
  } catch (error) {
    addResult(`Error getting API key: ${error.message}`, false);
  } finally {
    loading.value.get = false;
  }
};

const deleteApiKey = async () => {
  if (!confirm("Are you sure you want to delete your API key?")) return;

  try {
    loading.value.delete = true;
    const result = await deleteKey();

    if (result.success) {
      addResult("API key deleted successfully");
      fullApiKey.value = "";
      await checkApiKeyStatus();
    } else {
      addResult(`Failed to delete API key: ${result.error}`, false);
    }
  } catch (error) {
    addResult(`Error deleting API key: ${error.message}`, false);
  } finally {
    loading.value.delete = false;
  }
};

// System health check
const checkHealth = async () => {
  try {
    loading.value.health = true;
    const response = await $fetch("/api/health");
    healthStatus.value = response;
    addResult("Health check completed");
  } catch (error) {
    addResult(`Health check failed: ${error.message}`, false);
  } finally {
    loading.value.health = false;
  }
};

// Utility methods
const clearResults = () => {
  testResults.value = [];
};

// Initialize
onMounted(async () => {
  // Check initial API key status if user is already signed in
  if (user.value) {
    await checkApiKeyStatus();
  }

  // Check system health on load
  await checkHealth();
});

// Watch for user changes
watch(user, async (newUser) => {
  if (newUser) {
    await checkApiKeyStatus();
  } else {
    apiKeyStatus.value = { hasKey: false, apiKey: "", lastSaved: null };
    fullApiKey.value = "";
  }
});
</script>
