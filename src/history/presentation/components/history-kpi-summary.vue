<template>
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-header">
        <span class="kpi-title">{{ $t('history.totalEvents') }}</span>
        <div class="kpi-icon total-icon">
          <i class="pi pi-chart-bar"></i>
        </div>
      </div>
      <div class="kpi-value">12,482</div>
      <span class="kpi-sub">{{ $t('history.allTime') }}</span>
    </div>

    <div class="kpi-card">
      <div class="kpi-header">
        <span class="kpi-title">{{ $t('history.alertsResolved') }}</span>
        <div class="kpi-icon resolved-icon">
          <i class="pi pi-check-circle"></i>
        </div>
      </div>
      <div class="kpi-value">156</div>
      <span class="kpi-sub positive">{{ $t('history.thisWeek') }}</span>
    </div>

    <div class="kpi-card">
      <div class="kpi-header">
        <span class="kpi-title">{{ $t('history.systemUptime') }}</span>
        <div class="kpi-icon uptime-icon">
          <i class="pi pi-bolt"></i>
        </div>
      </div>
      <div class="kpi-value">99.9%</div>
      <span class="kpi-sub">{{ $t('history.lastDays') }}</span>
    </div>

    <div class="kpi-card">
      <div class="kpi-header">
        <span class="kpi-title">{{ $t('history.userActions') }}</span>
        <div class="kpi-icon user-icon">
          <i class="pi pi-user"></i>
        </div>
      </div>
      <div class="kpi-value">42</div>
      <span class="kpi-sub">{{ $t('history.today') }}</span>
    </div>
  </div>
</template>
<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.kpi-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
}
.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.kpi-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
}
.kpi-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.95rem;
  background-color: #f3f4f6;
  color: #4b5563;
}
.kpi-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}
.kpi-sub {
  font-size: 0.75rem;
  color: #9ca3af;
}
.positive {
  color: #10b981;
}
</style>
