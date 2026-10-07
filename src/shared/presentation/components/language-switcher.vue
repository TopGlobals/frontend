<script setup>
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale, availableLocales, t } = useI18n();

watch(locale, (newLocale) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('cryovigil_locale', newLocale);
  }
});
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
