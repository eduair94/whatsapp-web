<template>
  <v-footer class="footer-gradient py-3 mt-auto">
    <v-container>
      <!-- Main Content Row -->
      <v-row align="center" justify="space-between" class="mb-0">
        <!-- Brand Section -->
        <v-col cols="12" md="4" class="text-center text-md-start py-1">
          <div class="d-flex align-center justify-center justify-md-start">
            <v-icon color="primary" class="mr-2" size="20">mdi-whatsapp</v-icon>
            <span class="text-body-2 font-weight-bold text-primary">WhatsApp Checker</span>
          </div>
        </v-col>
        <!-- Quick Links -->
        <v-col cols="12" md="4" class="text-center py-1">
          <div class="d-flex flex-wrap justify-center ga-1">
            <v-btn variant="text" size="x-small" color="primary" to="/pricing" class="text-caption">Pricing</v-btn>
            <v-btn variant="text" size="x-small" color="primary" to="/database" class="text-caption">Database</v-btn>
            <v-btn variant="text" size="x-small" color="primary" to="/api-status" class="text-caption">Status</v-btn>
            <v-btn variant="text" size="x-small" color="primary" to="/faqs" class="text-caption">FAQs</v-btn>
            <v-btn variant="text" size="x-small" color="primary" to="/terms" class="text-caption">Terms</v-btn>
            <v-btn variant="text" size="x-small" color="primary" to="/privacy" class="text-caption">Privacy</v-btn>
          </div>
        </v-col>

        <!-- Review Section -->
        <v-col cols="12" md="4" class="text-center text-md-end py-1">
          <v-btn color="primary" variant="outlined" href="https://www.trustpilot.com/review/whatsapp.checkleaked.cc" target="_blank" rel="noopener noreferrer" class="review-btn text-caption" density="compact">
            <v-icon class="mr-1" size="14">mdi-star</v-icon>
            Review us
          </v-btn>
        </v-col>
      </v-row>
      <!-- Divider -->
      <v-divider class="mb-5 mt-2 opacity-20"></v-divider>
      <!-- Copyright Row -->
      <div class="d-flex flex-column flex-sm-row justify-space-between align-center">
        <p class="text-caption text-center text-sm-left text-medium-emphasis mb-1 mb-sm-0">© {{ new Date().getFullYear() }} WhatsApp Mobile Checker. All rights reserved.</p>
        <div class="d-flex align-center justify-center w-100 justify-md-end">
          <span class="text-caption text-medium-emphasis mr-2">Developed by</span>
          <v-btn href="https://www.linkedin.com/in/eduardo-airaudo" target="_blank" rel="noopener noreferrer" color="primary" variant="text" size="x-small" class="text-caption px-0">
            <v-icon size="16" class="mr-1">mdi-linkedin</v-icon>
            Eduardo Airaudo
          </v-btn>
        </div>
      </div>
    </v-container>
  </v-footer>
</template>

<style scoped>
.footer-gradient {
  background: linear-gradient(135deg, rgb(var(--v-theme-surface)) 0%, rgba(var(--v-theme-primary), 0.03) 100%);
  border-top: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.review-btn {
  text-transform: none;
  font-weight: 600;
  transition: all 0.2s ease;
}

.review-btn:hover {
  transform: scale(1.02);
}

/* Dark theme adjustments */
.v-theme--dark .footer-gradient {
  background: linear-gradient(135deg, rgb(var(--v-theme-surface)) 0%, rgba(var(--v-theme-primary), 0.05) 100%);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .v-col {
    margin-bottom: 4px;
  }

  .v-col:last-child {
    margin-bottom: 0;
  }
}

@media (max-width: 600px) {
  .review-btn {
    min-width: 100px;
    font-size: 0.75rem;
  }

  .d-flex.ga-1 {
    gap: 2px !important;
  }

  .d-flex.ga-1 .v-btn {
    font-size: 0.7rem;
    padding: 0 6px;
    min-width: 60px;
  }
}
</style>
