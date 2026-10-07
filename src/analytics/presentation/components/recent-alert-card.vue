<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  severity: { type: String, required: true }, // 'CRITICAL', 'WARNING', 'RESOLVED'
  time: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
});

const tagSeverity = computed(() => {
  if (props.severity === 'CRITICAL') return 'danger';
  if (props.severity === 'WARNING') return 'warning';
  return 'success';
});
</script>

<template>
  <div :class="['alert-card', `alert-card--${severity.toLowerCase()}`]">
    <div class="alert-card__header">
      <Tag
        :severity="tagSeverity"
        :value="t(`analytics.dashboard.alerts.severities.${severity.toLowerCase()}`)"
        rounded
        class="alert-card__tag"
      />
      <span class="alert-card__time">{{ time }}</span>
    </div>
    <h3 class="alert-card__title">{{ title }}</h3>
    <p class="alert-card__desc">{{ description }}</p>
  </div>
</template>

<style scoped>
.alert-card {
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid #f3f4f6;
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.alert-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.alert-card__tag {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
}
.alert-card__time {
  font-size: 0.75rem;
  color: #9ca3af;
}
.alert-card__title {
  font-weight: 700;
  color: #1f2937;
  font-size: 0.875rem;
  margin: 0 0 0.25rem 0;
}
.alert-card__desc {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}
</style>
