<script setup>
import { useI18n } from 'vue-i18n';

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
});

const { t } = useI18n();
</script>

<template>
  <div class="settings-page-heading">
    <router-link
      class="back-link"
      to="/settings"
    >
      <i
        class="pi pi-arrow-left"
        aria-hidden="true"
      />
      {{ t('settings.back') }}
    </router-link>
    <div class="heading-row">
      <div>
        <h2>{{ title }}</h2>
        <p>{{ subtitle }}</p>
      </div>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 10px;
  color: #687b95;
  font-size: 12px;
}

.back-link:hover {
  color: #008b68;
}

.heading-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 8px 0 20px;
}

.heading-row h2 {
  margin: 0;
  font-size: 20px;
}

.heading-row p {
  margin: 2px 0 0;
  color: #6a7d99;
  font-size: 12px;
}

@media (max-width: 680px) {
  .heading-row {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
