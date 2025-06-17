<template>
  <v-container class="py-4 py-sm-6 py-md-8">
    <!-- Header Section -->
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <div class="text-center mb-6 mb-md-8">
          <v-icon color="primary" :size="$vuetify.display.xs ? 48 : 64" class="mb-3 mb-md-4" aria-hidden="true"> mdi-help-circle </v-icon>

          <h1 class="text-h4 text-sm-h3 text-md-h2 font-weight-bold text-primary mb-3 mb-md-4 px-2">
            {{ $t("faq.title") }}
          </h1>

          <p class="text-body-1 text-sm-h6 text-medium-emphasis mx-auto px-4" style="max-width: 600px">
            {{ $t("faq.subtitle") }}
          </p>
        </div>
      </v-col>
    </v-row>

    <!-- FAQ Accordion -->
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-expansion-panels v-model="openPanels" multiple variant="accordion" class="faq-panels">
          <v-expansion-panel v-for="(faq, index) in faqs" :key="index" :value="index" class="mb-3" elevation="2" rounded="lg">
            <v-expansion-panel-title class="text-body-1 text-sm-h6 font-weight-medium py-3 py-sm-4" expand-icon="mdi-chevron-down" collapse-icon="mdi-chevron-up">
              <template v-slot:default="{ expanded }">
                <v-row no-gutters align="center">
                  <v-col cols="auto" class="pr-2 pr-sm-3">
                    <v-avatar :color="expanded ? 'primary' : 'grey-lighten-1'" :size="$vuetify.display.xs ? 28 : 32" class="text-caption font-weight-bold">
                      {{ index + 1 }}
                    </v-avatar>
                  </v-col>
                  <v-col>
                    <span :class="expanded ? 'text-primary' : 'text-high-emphasis'" class="text-body-2 text-sm-body-1 font-weight-medium">
                      {{ $t(faq.question) }}
                    </span>
                  </v-col>
                </v-row>
              </template>
            </v-expansion-panel-title>

            <v-expansion-panel-text class="pt-0">
              <v-divider class="mb-4 opacity-50"></v-divider>
              <div class="text-body-1 text-medium-emphasis pa-2">
                {{ $t(faq.answer) }}
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>

    <!-- Contact Section -->
    <v-row justify="center" class="mt-8 mt-md-12">
      <v-col cols="12" md="8" lg="6">
        <v-card color="primary" variant="tonal" class="text-center pa-4 pa-sm-6" rounded="xl">
          <v-icon color="primary" :size="$vuetify.display.xs ? 40 : 48" class="mb-3 mb-sm-4" aria-hidden="true"> mdi-message-question </v-icon>

          <h3 class="text-h6 text-sm-h5 font-weight-bold text-primary mb-2 mb-sm-3 px-2">
            {{ $t("faq.stillHaveQuestions") }}
          </h3>

          <p class="text-body-2 text-sm-body-1 text-medium-emphasis mb-3 mb-sm-4 px-2">
            {{ $t("faq.contactDescription") }}
          </p>

          <v-btn color="primary" variant="elevated" :size="$vuetify.display.xs ? 'default' : 'large'" href="mailto:support@checkleaked.cc" class="text-none font-weight-medium" prepend-icon="mdi-email">
            {{ $t("faq.contactUs") }}
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
// SEO and Meta
definePageMeta({
  title: "FAQs",
});

// Composables
const { t } = useI18n();

// Reactive data
const openPanels = ref<number[]>([]);

// FAQ data structure
const faqs = computed(() => [
  {
    question: "seo.faq.question1",
    answer: "seo.faq.answer1",
  },
  {
    question: "seo.faq.question2",
    answer: "seo.faq.answer2",
  },
  {
    question: "seo.faq.question3",
    answer: "seo.faq.answer3",
  },
  {
    question: "seo.faq.question4",
    answer: "seo.faq.answer4",
  },
  {
    question: "seo.faq.question5",
    answer: "seo.faq.answer5",
  },
]);

// SEO Head
useHead({
  title: () => t("seo.faqs.title"),
  meta: [
    {
      name: "description",
      content: () => t("seo.faqs.description"),
    },
    {
      name: "keywords",
      content: () => t("seo.faqs.keywords"),
    },
    // Open Graph
    {
      property: "og:title",
      content: () => t("seo.faqs.title"),
    },
    {
      property: "og:description",
      content: () => t("seo.faqs.description"),
    },
    {
      property: "og:type",
      content: "website",
    },
    // Twitter Card
    {
      name: "twitter:title",
      content: () => t("seo.faqs.title"),
    },
    {
      name: "twitter:description",
      content: () => t("seo.faqs.description"),
    },
    {
      name: "twitter:card",
      content: "summary",
    },
  ],
});
</script>
