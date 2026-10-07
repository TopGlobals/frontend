<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  name: { type: String, required: true },
  type: { type: String, required: true },
  temperature: { type: Number, required: true },
  status: { type: String, required: true }, // 'NORMAL', 'WARNING', 'ALERT'
});

const tagSeverity = computed(() => {
  if (props.status === 'ALERT') return 'danger';
  if (props.status === 'WARNING') return 'warning';
  return 'success';
});
</script>

<template>
  <div :class="['lab-card', `lab-card--${status.toLowerCase()}`]">
    <div class="lab-card__header">
      <span class="lab-card__name">{{ name }}</span>
      <Tag
        :severity="tagSeverity"
        :value="t(`analytics.dashboard.labs.statuses.${status.toLowerCase()}`)"
        rounded
        class="lab-card__tag"
      />
    </div>
    <span class="lab-card__type">{{ type }}</span>
    <span class="lab-card__temperature">{{ temperature }}°C</span>
  </div>
</template>

<style scoped>
.lab-card {
  background-color: #ffffff;
  padding: 1.25rem;
  border-radius: 1rem;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  min-width: 220px;
}
.lab-card--alert {
}
.lab-card--warning {
}
.lab-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.lab-card__name {
  font-weight: 700;
  color: #1f2937;
}
.lab-card__tag {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
}
.lab-card__type {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}
.lab-card__temperature {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
}
</style>
