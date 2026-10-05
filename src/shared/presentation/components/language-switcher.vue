<script setup>
import { useI18n } from 'vue-i18n';
const { locale, availableLocales, t } = useI18n();
</script>

<template>
  <pv-select-button
    v-model="locale"
    :options="availableLocales"
    :aria-label="t('layout.language.label')"
  >
    <template #option="slotProps">
      <span>{{ slotProps.option.toUpperCase() }}</span>
    </template>
  </pv-select-button>
</template>

<style scoped></style>
