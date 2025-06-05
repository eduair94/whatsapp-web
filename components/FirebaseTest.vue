<template>
  <div class="p-6 bg-white rounded-lg shadow">
    <h2 class="text-2xl font-bold mb-4">Firebase Configuration Test</h2>

    <!-- Firebase Config Test -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-2">1. Firebase Admin SDK Configuration</h3>
      <button @click="testFirebaseConfig" :disabled="configLoading" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50">
        {{ configLoading ? "Testing..." : "Test Firebase Config" }}
      </button>

      <div v-if="configResult" class="mt-2 p-3 rounded" :class="configResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
        <p><strong>Status:</strong> {{ configResult.success ? "SUCCESS" : "FAILED" }}</p>
        <p><strong>Message:</strong> {{ configResult.message }}</p>
        <p v-if="configResult.projectId"><strong>Project ID:</strong> {{ configResult.projectId }}</p>
        <p><strong>Has Service Account:</strong> {{ configResult.hasServiceAccount ? "Yes" : "No" }}</p>
      </div>
    </div>

    <!-- Authentication Test -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-2">2. Firebase Authentication</h3>

      <div v-if="!user" class="mb-4">
        <p class="text-gray-600 mb-2">Please sign in first to test authentication:</p>
        <button @click="signIn" :disabled="authLoading" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50">
          {{ authLoading ? "Signing in..." : "Sign In with Google" }}
        </button>
      </div>

      <div v-else class="mb-4">
        <p class="text-green-600 mb-2">✅ Signed in as: {{ user.email }}</p>
        <div class="space-x-2">
          <button @click="testAuth" :disabled="authTestLoading" class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50">
            {{ authTestLoading ? "Testing..." : "Test Server Authentication" }}
          </button>
          <button @click="signOut" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Sign Out</button>
        </div>
      </div>

      <div v-if="authResult" class="mt-2 p-3 rounded" :class="authResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
        <p><strong>Status:</strong> {{ authResult.success ? "SUCCESS" : "FAILED" }}</p>
        <p><strong>Message:</strong> {{ authResult.message }}</p>
        <div v-if="authResult.user" class="mt-2">
          <p><strong>Server verified user:</strong></p>
          <ul class="list-disc list-inside ml-4">
            <li>UID: {{ authResult.user.uid }}</li>
            <li>Email: {{ authResult.user.email }}</li>
            <li>Email Verified: {{ authResult.user.emailVerified }}</li>
            <li v-if="authResult.user.name">Name: {{ authResult.user.name }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- API Key Test -->
    <div v-if="user">
      <h3 class="text-lg font-semibold mb-2">3. API Key Management Test</h3>
      <button @click="testApiKey" :disabled="apiKeyLoading" class="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50">
        {{ apiKeyLoading ? "Testing..." : "Test API Key Storage" }}
      </button>

      <div v-if="apiKeyResult" class="mt-2 p-3 rounded" :class="apiKeyResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
        <p><strong>Status:</strong> {{ apiKeyResult.success ? "SUCCESS" : "FAILED" }}</p>
        <p><strong>Message:</strong> {{ apiKeyResult.message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// State
const configLoading = ref(false);
const configResult = ref(null);
const authLoading = ref(false);
const authTestLoading = ref(false);
const authResult = ref(null);
const apiKeyLoading = ref(false);
const apiKeyResult = ref(null);

// Firebase composables
const { user, signInWithGoogle, signOut: firebaseSignOut } = useFirebaseAuth();
const { saveApiKey } = useApiKeyManagement();

// Test Firebase configuration
async function testFirebaseConfig() {
  configLoading.value = true;
  configResult.value = null;

  try {
    const response = await $fetch("/api/test/firebase-config");
    configResult.value = response;
  } catch (error) {
    configResult.value = {
      success: false,
      message: error.message || "Failed to test Firebase configuration",
      hasServiceAccount: false,
    };
  } finally {
    configLoading.value = false;
  }
}

// Sign in
async function signIn() {
  authLoading.value = true;
  try {
    await signInWithGoogle();
  } catch (error) {
    console.error("Sign in failed:", error);
  } finally {
    authLoading.value = false;
  }
}

// Sign out
async function signOut() {
  await firebaseSignOut();
  authResult.value = null;
  apiKeyResult.value = null;
}

// Test server authentication
async function testAuth() {
  if (!user.value) return;

  authTestLoading.value = true;
  authResult.value = null;

  try {
    const token = await user.value.getIdToken();
    const response = await $fetch("/api/test/auth", {
      method: "POST",
      body: { token },
    });
    authResult.value = response;
  } catch (error) {
    authResult.value = {
      success: false,
      message: error.message || "Authentication test failed",
    };
  } finally {
    authTestLoading.value = false;
  }
}

// Test API key management
async function testApiKey() {
  if (!user.value) return;

  apiKeyLoading.value = true;
  apiKeyResult.value = null;

  try {
    // Test saving a dummy API key
    const testApiKey = "test-api-key-" + Date.now();
    await saveApiKey(testApiKey);

    apiKeyResult.value = {
      success: true,
      message: "API key saved and retrieved successfully!",
    };
  } catch (error) {
    apiKeyResult.value = {
      success: false,
      message: error.message || "API key test failed",
    };
  } finally {
    apiKeyLoading.value = false;
  }
}
</script>
