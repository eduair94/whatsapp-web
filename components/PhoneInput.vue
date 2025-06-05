<template>
  <div class="d-flex phone">
    <v-autocomplete variant="outlined" hide-details required v-model="phoneCode" class="phone--code" :filter="customFilter" max-width="100px" item-title="countryWithCode" item-value="code" autocomplete="off" data-lpignore="true" data-form-type="other" :label="t('lookup.country')" :items="phoneCodesWithCountry">
      <template #selection="{ item }">
        <span :class="textColor">+{{ item.raw.code }}</span>
      </template>
      <template #item="{ props, item }">
        <v-list-item v-bind="props" :title="item.raw.countryWithCode" :subtitle="'+' + item.raw.code" :class="itemTextColor" />
      </template>
    </v-autocomplete>
    <v-text-field v-model="phoneNumber" class="phone-number" variant="outlined" type="tel" hide-details :label="t('lookup.inputLabel')" required :color="fieldColor" :input-class="textColor" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { phoneCodes } from "~/utils/phoneCodes";

interface Props {
  modelValue?: {
    phoneCode: string;
    phoneNumber: string;
  };
  textColor?: string;
  itemTextColor?: string;
  fieldColor?: string;
}

interface Emits {
  (e: "update:modelValue", value: { phoneCode: string; phoneNumber: string }): void;
}

const props = withDefaults(defineProps<Props>(), {
  textColor: "text-white",
  itemTextColor: "text-white",
  fieldColor: "white",
});

const emit = defineEmits<Emits>();

const { t } = useI18n();

// Internal reactive values
const phoneCode = computed({
  get: () => props.modelValue?.phoneCode || "598",
  set: (value: string) => {
    emit("update:modelValue", {
      phoneCode: value,
      phoneNumber: phoneNumber.value,
    });
  },
});

const phoneNumber = computed({
  get: () => props.modelValue?.phoneNumber || "",
  set: (value: string) => {
    emit("update:modelValue", {
      phoneCode: phoneCode.value,
      phoneNumber: value,
    });
  },
});

// Phone codes with country translations
const phoneCodesWithCountry = computed(() =>
  phoneCodes.map((pc) => ({
    ...pc,
    countryWithCode: `${t(`country.${pc.country}`) || pc.country} (+${pc.code})`,
    countryTranslated: t(`country.${pc.country}`) || pc.country,
  }))
);

// Custom filter for autocomplete
const customFilter = (item: any, queryText: string): boolean => {
  if (!item || !item.countryWithCode) return false;
  const searchText = queryText.toLowerCase();
  return item.countryWithCode.toLowerCase().includes(searchText) || item.countryTranslated.toLowerCase().includes(searchText) || item.code.includes(searchText);
};
</script>

<style lang="scss" scoped>
.phone {
  max-width: 700px;
  margin: auto;
  .v-field {
    border-radius: 0;
  }
}

.phone-number {
  flex: 1;
}

@media (max-width: 600px) {
  .phone {
    flex-direction: row;
    gap: 0px;

    &--code {
      max-width: 100%;
    }
  }
}
</style>
