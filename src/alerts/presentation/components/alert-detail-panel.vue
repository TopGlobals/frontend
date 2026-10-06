<script setup>
import { computed, ref, useId } from 'vue';
import { useI18n } from 'vue-i18n';
import { AlertSeverity } from '../../domain/model/alert-severity.enum.js';
import { useAlertFormatters } from '../composables/use-alert-formatters.js';
import AlertTrendChart from './alert-trend-chart.vue';

const props = defineProps({
  /** Alert entity to describe. */
  alert: { type: Object, required: true },
  /** Reference time for durations and escalation. */
  now: { type: Date, required: true },
  /** Whether an action on this alert is in progress. */
  busy: { type: Boolean, default: false },
});

const emit = defineEmits(['close', 'acknowledge', 'resolve']);

const { t } = useI18n();
const {
  formatTemperature,
  formatRange,
  formatDateTime,
  formatDuration,
  formatRelative,
  severityLabel,
  statusLabel,
  severityTagType,
  sourceLabel,
} = useAlertFormatters();

const headingId = useId();
const heading = ref(null);

const isUnattended = computed(() => props.alert.isUnattended(props.now));
const durationLabel = computed(() =>
  props.alert.isOpen ? t('alerts.details.openFor') : t('alerts.details.resolvedIn')
);
const resolveSeverity = computed(() => {
  if (props.alert.severity === AlertSeverity.CRITICAL) return 'danger';
  if (props.alert.severity === AlertSeverity.WARNING) return 'warn';
  return undefined;
});
const location = computed(() =>
  [props.alert.laboratoryName, props.alert.storageUnitName, props.alert.sensorCode]
    .filter(Boolean)
    .join(' · ')
);

/** Moves keyboard focus to the panel heading when the panel opens. */
function focusHeading() {
  heading.value?.focus();
}

defineExpose({ focusHeading });
</script>

<template>
  <section
    class="detail-panel"
    :aria-labelledby="headingId"
  >
    <header class="panel-header">
      <div>
        <p class="panel-eyebrow">
          {{ t('alerts.details.title') }}
        </p>
        <span class="panel-code">
          <pv-tag
            :value="severityLabel(alert.severity)"
            :severity="severityTagType(alert.severity)"
          />
          <span>{{ t('alerts.details.code', { code: alert.code }) }}</span>
        </span>
      </div>
      <pv-button
        icon="pi pi-times"
        severity="secondary"
        text
        rounded
        :aria-label="t('alerts.details.close')"
        @click="emit('close')"
      />
    </header>

    <div class="panel-body">
      <h2
        :id="headingId"
        ref="heading"
        tabindex="-1"
      >
        {{ alert.title }}
      </h2>
      <p class="panel-location">
        <i
          class="pi pi-building"
          aria-hidden="true"
        />
        {{ location }}
      </p>

      <p
        v-if="isUnattended"
        class="escalation-banner"
        role="status"
      >
        <i
          class="pi pi-clock"
          aria-hidden="true"
        />
        {{ t('alerts.details.escalationWarning', { minutes: alert.durationMinutes(now) }) }}
      </p>

      <dl class="facts">
        <div class="fact">
          <dt>{{ t('alerts.details.status') }}</dt>
          <dd>
            <span
              class="status-dot"
              :class="`status-${alert.status}`"
              aria-hidden="true"
            />
            {{ statusLabel(alert.status) }}
          </dd>
        </div>
        <div class="fact">
          <dt>{{ durationLabel }}</dt>
          <dd>{{ formatDuration(alert.durationMinutes(now)) }}</dd>
        </div>
        <div
          class="fact"
          :class="{ 'fact-alarm': alert.isReadingOutOfRange }"
        >
          <dt>{{ t('alerts.details.reading') }}</dt>
          <dd>{{ formatTemperature(alert.readingCelsius) }}</dd>
        </div>
        <div class="fact">
          <dt>{{ t('alerts.details.safeRange') }}</dt>
          <dd>{{ formatRange(alert.safeMinCelsius, alert.safeMaxCelsius) }}</dd>
        </div>
      </dl>

      <section class="panel-section">
        <h3>{{ t('alerts.details.description') }}</h3>
        <p>{{ alert.message }}</p>
        <p class="panel-meta">
          <span>{{ t('alerts.details.raisedAt', { date: formatDateTime(alert.raisedAt) }) }}</span>
          <span>{{ t('alerts.details.source', { source: sourceLabel(alert.sourceType) }) }}</span>
        </p>
      </section>

      <section
        v-if="alert.readings.length > 1"
        class="panel-section"
      >
        <h3>{{ t('alerts.details.trend') }}</h3>
        <alert-trend-chart
          :readings="alert.readings"
          :safe-min="alert.safeMinCelsius"
          :safe-max="alert.safeMaxCelsius"
          :severity="alert.isOpen ? alert.severity : 'info'"
        />
      </section>

      <section class="panel-section">
        <h3>{{ t('alerts.details.activity') }}</h3>
        <ol class="activity">
          <li v-if="alert.acknowledgedAt">
            <i
              class="pi pi-user"
              aria-hidden="true"
            />
            <span>
              {{ t('alerts.details.acknowledgedBy', { name: alert.acknowledgedBy }) }}
              <time :datetime="alert.acknowledgedAt.toISOString()">{{
                formatRelative(alert.acknowledgedAt, now)
              }}</time>
            </span>
          </li>
          <li
            v-for="(action, index) in alert.correctiveActions"
            :key="index"
          >
            <i
              class="pi pi-wrench"
              aria-hidden="true"
            />
            <span>
              <strong>{{ action.description }}</strong>
              {{ t('alerts.details.actionBy', { name: action.technicianName }) }}
              <time :datetime="action.takenAt?.toISOString()">{{
                formatRelative(action.takenAt, now)
              }}</time>
            </span>
          </li>
          <li v-if="alert.resolvedAt">
            <i
              class="pi pi-check-circle"
              aria-hidden="true"
            />
            <span>
              {{ t('alerts.details.resolvedBy', { name: alert.resolvedBy }) }}
              <time :datetime="alert.resolvedAt.toISOString()">{{
                formatRelative(alert.resolvedAt, now)
              }}</time>
            </span>
          </li>
          <li
            v-if="!alert.acknowledgedAt && !alert.correctiveActions.length"
            class="activity-empty"
          >
            {{ t('alerts.details.noActivity') }}
          </li>
        </ol>
      </section>
    </div>

    <footer
      v-if="alert.isOpen"
      class="panel-actions"
    >
      <pv-button
        v-if="alert.canBeAcknowledged"
        :label="t('alerts.actions.acknowledge')"
        icon="pi pi-user-plus"
        severity="secondary"
        :loading="busy"
        @click="emit('acknowledge', alert)"
      />
      <pv-button
        :label="t('alerts.actions.markResolved')"
        icon="pi pi-check"
        :severity="resolveSeverity"
        :disabled="busy"
        @click="emit('resolve', alert)"
      />
    </footer>
  </section>
</template>

<style scoped>
.detail-panel {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background: var(--cryo-surface);
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--cryo-border-subtle);
}

.panel-eyebrow {
  margin-bottom: 6px;
  color: var(--cryo-text);
  font-size: 15px;
  font-weight: 600;
}

.panel-code {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--cryo-text-muted);
  font-size: 12px;
}

.panel-code :deep(.p-tag) {
  padding: 3px 8px !important;
  font-size: 11px !important;
}

.panel-body {
  flex: 1;
  padding: 18px 20px 8px;
}

h2 {
  color: var(--cryo-text);
  font-size: 19px;
  font-weight: 700;
  line-height: 1.3;
}

h2:focus {
  outline: none;
}

h2:focus-visible {
  outline: 3px solid var(--cryo-primary);
  outline-offset: 3px;
  border-radius: var(--cryo-radius-xs);
}

.panel-location {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  color: var(--cryo-text-secondary);
  font-size: 13px;
}

.escalation-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 14px;
  padding: 10px 12px;
  color: var(--cryo-status-warning-text);
  background: var(--cryo-status-warning-bg);
  border: 1px solid var(--cryo-status-warning-border);
  border-radius: var(--cryo-radius-md);
  font-size: 13px;
}

.escalation-banner i {
  margin-top: 2px;
}

.facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin: 18px 0 4px;
}

.fact {
  padding: 12px 14px;
  background: var(--cryo-surface-alt);
  border: 1px solid var(--cryo-border-subtle);
  border-radius: var(--cryo-radius-lg);
}

.fact dt {
  color: var(--cryo-text-muted);
  font-size: 12px;
  font-weight: 500;
}

.fact {
  min-width: 0;
}

.fact dd {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-wrap: anywhere;
  margin-top: 4px;
  color: var(--cryo-text);
  font-size: 16px;
  font-weight: 700;
}

.fact-alarm {
  background: var(--cryo-status-critical-bg);
  border-color: var(--cryo-status-critical-border);
}

.fact-alarm dd {
  color: var(--cryo-status-critical-text);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-raised {
  background: var(--cryo-status-critical);
}

.status-acknowledged {
  background: var(--cryo-status-warning);
}

.status-closed {
  background: var(--cryo-status-ok);
}

.panel-section {
  margin-top: 20px;
}

.panel-section h3 {
  margin-bottom: 8px;
  color: var(--cryo-text-secondary);
  font-size: 13px;
  font-weight: 600;
}

.panel-section > p {
  color: var(--cryo-text);
  font-size: 13px;
  line-height: 1.6;
}

.panel-section > .panel-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 16px;
  margin-top: 8px;
  color: var(--cryo-text-muted);
  font-size: 12px;
}

.activity {
  display: grid;
  gap: 10px;
  padding: 0;
  list-style: none;
}

.activity li {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 8px;
  color: var(--cryo-text-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.activity li i {
  margin-top: 3px;
  color: var(--cryo-primary);
  font-size: 13px;
}

.activity strong {
  display: block;
  color: var(--cryo-text);
  font-weight: 500;
}

.activity time {
  color: var(--cryo-text-muted);
}

.activity .activity-empty {
  display: block;
  color: var(--cryo-text-muted);
}

.panel-actions {
  position: sticky;
  bottom: 0;
  display: flex;
  gap: 10px;
  padding: 14px 20px 18px;
  background: var(--cryo-surface);
  border-top: 1px solid var(--cryo-border-subtle);
}

.panel-actions :deep(.p-button) {
  flex: 1;
  justify-content: center;
}

.panel-actions :deep(.p-button:focus-visible),
.panel-header :deep(.p-button:focus-visible) {
  outline: 3px solid var(--cryo-primary);
  outline-offset: 2px;
}

/* Action colors with WCAG AA contrast for white text (palette #B45309; red-600). */
.detail-panel :deep(.p-button.p-button-danger) {
  background: #dc2626 !important;
  border-color: #dc2626 !important;
}

.detail-panel :deep(.p-button.p-button-danger:not(:disabled):hover) {
  background: #b91c1c !important;
  border-color: #b91c1c !important;
}

.detail-panel :deep(.p-button.p-button-warn) {
  color: #fff !important;
  background: #b45309 !important;
  border-color: #b45309 !important;
}

.detail-panel :deep(.p-button.p-button-warn:not(:disabled):hover) {
  background: #92400e !important;
  border-color: #92400e !important;
}
</style>
