<template>
  <div class="details-panel" v-if="event">
    <div class="panel-header">
      <h2>{{ $t('history.eventDetails') }}</h2>
      <button class="close-btn" @click="$emit('close')">✖</button>
    </div>

    <div class="panel-scroll-content">
      <div class="detail-badge-section">
        <span class="type-tag" :class="event.type.toLowerCase().replace(' ', '-')">{{
          typeLabel(event.type)
        }}</span>
        <span class="severity-tag" :class="event.severity.toLowerCase()">{{
          severityLabel(event.severity)
        }}</span>
      </div>

      <div class="meta-info-block">
        <div class="meta-item">
          <span class="label">{{ $t('history.dateTime') }}</span>
          <span class="value">{{ event.timestamp.toLocaleString($i18n.locale) }}</span>
        </div>
        <div class="meta-item">
          <span class="label">{{ $t('history.laboratory') }}</span>
          <span class="value">{{ event.location }}</span>
        </div>
        <div class="meta-item">
          <span class="label">{{ $t('history.sensor') }}</span>
          <span class="value">{{ event.sensor }}</span>
        </div>
      </div>

      <div class="description-block">
        <h3>{{ $t('history.description') }}</h3>
        <p>{{ $t(event.messageKey) }}</p>
      </div>
      <div class="chart-block" v-if="event.severity === 'Critical' || event.severity === 'Warning'">
        <div class="chart-header">
          <h3>{{ $t('history.sensorDataTitle') }}</h3>
          <span class="peak-label">{{ $t('history.peak') }} <strong class="red-text">31.2 °C</strong></span>
        </div>
        <div class="graphic-container">
          <div class="y-axis-label">{{ $t('history.threshold', { temp: '28°C' }) }}</div>
          <svg class="svg-graph" viewBox="0 0 300 100" preserveAspectRatio="none">
            <line
              x1="0"
              y1="40"
              x2="300"
              y2="40"
              stroke="#ef4444"
              stroke-width="1"
              stroke-dasharray="4 3"
            />
            <path
              d="M 0 80 Q 75 80 120 20 T 210 60 T 300 70 L 300 100 L 0 100 Z"
              fill="url(#grad)"
              opacity="0.15"
            />
            <path
              d="M 0 80 Q 75 80 120 20 T 210 60 T 300 70"
              fill="none"
              stroke="#ef4444"
              stroke-width="2"
            />
            <circle cx="120" cy="20" r="4" fill="#ef4444" />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#ef4444" />
                <stop offset="100%" stop-color="#fff" />
              </linearGradient>
            </defs>
          </svg>
          <div class="x-axis-labels">
            <span>08:50</span>
            <span class="active-time">08:52</span>
            <span>08:54</span>
            <span>08:56</span>
          </div>
        </div>
      </div>

      <div class="actions-block">
        <h3>{{ $t('history.actionsTaken') }}</h3>
        <ul class="actions-list">
          <li v-for="(actionKey, index) in event.actionsTakenKeys" :key="index">
            <span class="action-check">✔</span> {{ $t(actionKey) }}
          </li>
          <li v-if="event.actionsTakenKeys.length === 0" class="no-actions">
            {{ $t('history.noActions') }}
          </li>
        </ul>
      </div>
      <div class="panel-navigation-actions">
        <button class="nav-btn primary-nav-btn" @click="goToLaboratories">
          <i class="pi pi-eye icon-margin"></i> {{ $t('history.viewLaboratoryBtn') }}
        </button>
        <button class="nav-btn secondary-nav-btn" @click="goToReports">
          {{ $t('history.generateReportBtn') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

defineProps({
  event: { type: Object, default: null },
});
defineEmits(['close']);

const { t } = useI18n();
const router = useRouter();

const typeKeys = {
  Resolved: 'history.types.resolved',
  Alert: 'history.types.alert',
  Automation: 'history.types.automation',
  'User Action': 'history.types.userAction',
};

const severityKeys = {
  Critical: 'history.severities.critical',
  Warning: 'history.severities.warning',
  Success: 'history.severities.success',
  Info: 'history.severities.info',
};

const typeLabel = (type) => (typeKeys[type] ? t(typeKeys[type]) : type);
const severityLabel = (severity) => (severityKeys[severity] ? t(severityKeys[severity]) : severity);

const goToLaboratories = () => {
  router.push({ name: 'laboratories' });
};
const goToReports = () => {
  router.push({ name: 'reports' });
};
</script>

<style scoped>
.details-panel {
  width: 400px;
  background: #ffffff;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}
.panel-header h2 {
  font-size: 1.25rem;
  margin: 0;
  color: #111827;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #9ca3af;
}
.panel-scroll-content {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}
.detail-badge-section {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}
.type-tag,
.severity-tag {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 9999px;
  font-weight: 500;
}
.type-tag.alert {
  background: #fee2e2;
  color: #ef4444;
}
.severity-tag.critical {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fee2e2;
}
.meta-info-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}
.meta-item .label {
  display: block;
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
  font-weight: 600;
}
.meta-item .value {
  font-size: 0.95rem;
  font-weight: 500;
  color: #111827;
}
.description-block h3,
.chart-block h3,
.actions-block h3 {
  font-size: 0.8rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  margin: 0 0 8px 0;
}
.description-block p {
  font-size: 0.9rem;
  color: #4b5563;
  line-height: 1.4;
  margin: 0 0 24px 0;
}
/* Se implementan los estilos del grafico SVG
 */
.chart-block {
  margin-bottom: 24px;
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.peak-label {
  font-size: 0.8rem;
  color: #4b5563;
}
.red-text {
  color: #ef4444;
}
.graphic-container {
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  padding: 12px;
  position: relative;
}
.y-axis-label {
  position: absolute;
  top: 44px;
  left: 12px;
  font-size: 0.65rem;
  color: #ef4444;
  font-weight: 500;
}
.svg-graph {
  width: 100%;
  height: 100px;
}
.x-axis-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: #9ca3af;
  margin-top: 6px;
  padding: 0 4px;
}
.active-time {
  color: #ef4444;
  font-weight: 600;
}
.actions-block {
  margin-bottom: 28px;
}
.actions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.actions-list li {
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #4b5563;
  display: flex;
  align-items: center;
}
.action-check {
  color: #10b981;
  margin-right: 8px;
  font-weight: bold;
}
.no-actions {
  color: #9ca3af;
  font-style: italic;
}
.panel-navigation-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}
.nav-btn {
  width: 100%;
  padding: 11px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}
.primary-nav-btn {
  background-color: #10b981;
  color: #ffffff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.primary-nav-btn:hover {
  background-color: #059669;
}
.secondary-nav-btn {
  background-color: #ffffff;
  color: #4b5563;
  border: 1px solid #d1d5db;
}
.secondary-nav-btn:hover {
  background-color: #f9fafb;
  color: #1f2937;
}
.icon-margin {
  margin-right: 6px;
}
</style>
