<template>
  <!-- Full image dialog -->
  <v-dialog v-model="dialogVisible" max-width="800">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>{{ t("history.fullImage.title") }} {{ formatPhoneNumber(phoneNumber) }}</span>
        <v-btn icon variant="text" @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-img :src="imageUrl" :alt="`Profile picture for ${phoneNumber}`" class="w-100" style="max-height: 70vh" contain>
          <template v-slot:placeholder>
            <div class="d-flex align-center justify-center fill-height">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
          </template>
          <template v-slot:error>
            <div class="d-flex align-center justify-center fill-height">
              <v-icon size="64" color="grey">mdi-image-broken</v-icon>
            </div>
          </template>
        </v-img>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="outlined" @click="handleDownload">
          <v-icon left>mdi-download</v-icon>
          {{ t("history.fullImage.download") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  imageUrl: string;
  phoneNumber: string;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "download", imageUrl: string, filename: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useI18n();

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

const formatPhoneNumber = (phoneNumber: string): string => {
  return phoneNumber;
};

const closeDialog = () => {
  emit("update:modelValue", false);
};

const handleDownload = () => {
  emit("download", props.imageUrl, `${props.phoneNumber}_profile.jpeg`);
};
</script>
