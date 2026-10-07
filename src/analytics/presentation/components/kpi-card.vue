<script setup>
defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  iconClass: { type: String, required: true },
  iconBgColor: { type: String, default: '#f3f4f6' },
  iconColor: { type: String, default: '#6b7280' },
});
</script>

<template>
  <div class="kpi-card">
    <div class="kpi-card__header">
      <div
        class="kpi-card__icon-wrapper"
        :style="{ backgroundColor: iconBgColor, color: iconColor }"
      >
        <i :class="iconClass" class="kpi-card__icon"></i>
      </div>
      <span class="kpi-card__title">{{ title }}</span>
    </div>

    <div class="kpi-card__value">{{ value }}</div>
  </div>
</template>

<style scoped>
.kpi-card {
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}
.kpi-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.kpi-card__icon-wrapper {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
}
.kpi-card__icon {
  font-size: 1.25rem;
}
.kpi-card__title {
  color: #6b7280;
  font-weight: 500;
  font-size: 0.875rem;
}
.kpi-card__value {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1f2937;
}
</style>
