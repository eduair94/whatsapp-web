<template>
  <div class="d-flex phone">
    <v-autocomplete variant="outlined" hide-details required v-model="phoneCodeModel" class="phone--code" :filter="customFilter" max-width="100px" item-title="code" item-value="code" autocomplete="off" data-lpignore="true" data-form-type="other" :label="t('lookup.country')" :items="phoneCodes">
      <template #selection="{ item }">
        <span class="text-white">+{{ item.raw.code }}</span>
      </template>
      <template #item="{ props, item }">
        <v-list-item v-bind="props" :title="item?.raw?.country" :subtitle="'+' + item?.raw?.code" class="text-white" />
      </template>
    </v-autocomplete>
    <v-text-field v-model="phoneNumberModel" class="phone-number" variant="outlined" type="tel" hide-details :label="t('lookup.phone')" required color="white" input-class="text-white" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { phoneCodes } from "~/utils/phoneCodes";

const { t, locale } = useI18n();

interface Props {
  phoneCode?: string;
  phoneNumber?: string;
}

const props = withDefaults(defineProps<Props>(), {
  phoneCode: "598",
  phoneNumber: "",
});

interface Emits {
  (e: "update:phoneCode", value: string): void;
  (e: "update:phoneNumber", value: string): void;
}

const emit = defineEmits<Emits>();

type PhoneCode = {
  country: string;
  code: string;
};

const phoneCodeModel = computed({
  get: () => props.phoneCode,
  set: (value: string) => emit("update:phoneCode", value),
});

const phoneNumberModel = computed({
  get: () => props.phoneNumber,
  set: (value: string) => emit("update:phoneNumber", value),
});

const customFilter = (item: PhoneCode, queryText: string): boolean => {
  const textOne = item.country.toLowerCase();
  const textTwo = item.code;
  const searchText = queryText.toLowerCase();
  return textOne.indexOf(searchText) > -1 || textTwo.indexOf(searchText) > -1;
};
</script>

<style scoped>
.phone {
  max-width: 700px;
  margin: auto;
  gap: 8px;
}

.phone--code {
  max-width: 150px;
}

.v-field {
  border-radius: 0;
}

.phone-number {
  flex: 1;
}

@media (max-width: 600px) {
  .phone {
    flex-direction: column;
  }

  .phone--code {
    flex: 1;
  }
}
</style>
