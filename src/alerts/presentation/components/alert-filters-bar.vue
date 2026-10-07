<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { AlertSeverity } from '../../domain/model/alert-severity.enum.js';
import { AlertStatus } from '../../domain/model/alert-status.enum.js';

/** Filter values: { severity, laboratory, status, period }; 'all' means no filter. */
const filters = defineModel('filters', { type: Object, required: true });

const props = defineProps({
  /** Laboratory names available in the alert feed. */
  laboratories: { type: Array, default: () => [] },
  /** Whether any filter or search term is applied. */
  hasActiveFilters: { type: Boolean, default: false },
});

const emit = defineEmits(['clear']);

const { t } = useI18n();

const groups = computed(() => [
  {
    key: 'severity',
    label: t('alerts.filters.severity'),
    options: [
      { value: 'all', label: t('alerts.filters.all') },
      ...Object.values(AlertSeverity).map((value) => ({
        value,
        label: t(`alerts.severity.${value}`),
      })),
    ],
  },
  {
    key: 'laboratory',
    label: t('alerts.filters.laboratory'),
    options: [
      { value: 'all', label: t('alerts.filters.all') },
      ...props.laboratories.map((name) => ({ value: name, label: name })),
    ],
  },
  {
    key: 'status',
    label: t('alerts.filters.status'),
    options: [
      { value: 'all', label: t('alerts.filters.all') },
      { value: 'open', label: t('alerts.filters.open') },
      ...Object.values(AlertStatus).map((value) => ({
        value,
        label: t(`alerts.status.${value}`),
      })),
    ],
  },
  {
    key: 'period',
    label: t('alerts.filters.period'),
    options: ['all', 'today', '7d', '30d'].map((value) => ({
      value,
      label: t(`alerts.filters.periods.${value}`),
    })),
  },
]);

/**
 * @param {Object} group - Filter group.
 * @param {string} value - Selected value.
 * @returns {string} Text shown in the closed select, e.g. "Severity: Critical".
 */
const selectedText = (group, value) => {
  const option = group.options.find((item) => item.value === value);
  return `${group.label}: ${option?.label ?? t('alerts.filters.all')}`;
};

/**
 * @param {string} key - Filter key.
 * @param {string} value - New value.
 */
const updateFilter = (key, value) => {
  filters.value = { ...filters.value, [key]: value ?? 'all' };
};
</script>

<template>
  <div
    class="filters-bar"
    role="group"
    :aria-label="t('alerts.filters.label')"
  >
    <div class="filters-controls">
      <pv-select
        v-for="group in groups"
        :key="group.key"
        :model-value="filters[group.key]"
        :options="group.options"
        option-label="label"
        option-value="value"
        :aria-label="group.label"
        class="filter-select"
        :class="{ 'filter-select-active': filters[group.key] !== 'all' }"
        @update:model-value="updateFilter(group.key, $event)"
      >
        <template #value="slotProps">
          {{ selectedText(group, slotProps.value) }}
        </template>
      </pv-select>
    </div>
    <pv-button
      :label="t('alerts.filters.clear')"
      icon="pi pi-filter-slash"
      severity="secondary"
      class="clear-button"
      :disabled="!hasActiveFilters"
      @click="emit('clear')"
    />
  </div>
</template>

<style scoped>
.filters-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 14px;
  background: var(--cryo-surface);
  border: 1px solid var(--cryo-border);
  border-radius: var(--cryo-radius-xl);
  box-shadow: var(--cryo-shadow-xs);
}

.filters-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-select {
  min-width: 150px;
  max-width: 240px;
}

.filter-select :deep(.p-select-label) {
  padding: 0 !important;
  color: var(--cryo-text-secondary);
  font-size: 13px;
  font-weight: 500;
}

.filters-bar :deep(.p-select.filter-select) {
  padding: 7px 12px !important;
  background: var(--cryo-surface-alt) !important;
}

.filters-bar :deep(.p-select.filter-select-active) {
  background: var(--cryo-primary-subtle) !important;
  border-color: var(--cryo-primary-border) !important;
}

.filters-bar :deep(.p-select.filter-select-active .p-select-label) {
  color: var(--cryo-brand-dark);
}

.clear-button {
  flex: 0 0 auto;
}

@media (max-width: 760px) {
  .filters-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .filters-controls {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-select {
    min-width: 0;
    max-width: none;
  }
}

@media (max-width: 420px) {
  .filters-controls {
    grid-template-columns: 1fr;
  }
}
</style>
