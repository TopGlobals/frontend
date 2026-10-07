<script setup>
import { computed, useId } from 'vue';
import { useI18n } from 'vue-i18n';
import { AlertSeverity } from '../../domain/model/alert-severity.enum.js';
import { useAlertFormatters } from '../composables/use-alert-formatters.js';

const props = defineProps({
  /** Alert entity to display. */
  alert: { type: Object, required: true },
  /** Reference time for relative dates and escalation. */
  now: { type: Date, required: true },
  /** Whether the alert is the one shown in the detail panel. */
  selected: { type: Boolean, default: false },
  /** Whether an action on this alert is in progress. */
  busy: { type: Boolean, default: false },
});

const emit = defineEmits(['select', 'acknowledge', 'resolve']);

const { t } = useI18n();
const {
  formatRelative,
  formatDateTime,
  severityLabel,
  statusLabel,
  severityTagType,
  statusTagType,
  sourceIcon,
} = useAlertFormatters();

const titleId = useId();
const isUnattended = computed(() => props.alert.isUnattended(props.now));
const actionSeverity = computed(() => {
  if (props.alert.severity === AlertSeverity.CRITICAL) return 'danger';
  if (props.alert.severity === AlertSeverity.WARNING) return 'warn';
  return undefined;
});
const location = computed(() =>
  [props.alert.storageUnitName, props.alert.sensorCode].filter(Boolean).join(' · ')
);
</script>

<template>
  <article
    class="alert-card"
    :class="[`severity-${alert.severity}`, { selected, closed: !alert.isOpen }]"
    :aria-labelledby="titleId"
    :aria-current="selected ? 'true' : undefined"
    @click="emit('select', $event.currentTarget)"
  >
    <span
      class="alert-icon"
      aria-hidden="true"
    ><i :class="sourceIcon(alert)" /></span>

    <div class="alert-body">
      <div class="alert-heading">
        <h3 :id="titleId">
          {{ alert.title }}
        </h3>
        <span class="alert-tags">
          <pv-tag
            :value="severityLabel(alert.severity)"
            :severity="severityTagType(alert.severity)"
          />
          <pv-tag
            :value="statusLabel(alert.status)"
            :severity="statusTagType(alert.status)"
            class="status-tag"
          />
          <pv-tag
            v-if="isUnattended"
            :value="t('alerts.list.pendingEscalation')"
            icon="pi pi-clock"
            severity="warn"
            class="escalation-tag"
          />
        </span>
      </div>

      <p class="alert-message">
        <strong>{{ alert.laboratoryName }}</strong>
        <span aria-hidden="true"> · </span>
        <span>{{ alert.message }}</span>
      </p>

      <div class="alert-footer">
        <span class="alert-meta">
          <span class="meta-item">
            <i
              class="pi pi-clock"
              aria-hidden="true"
            />
            <time
              :datetime="alert.raisedAt?.toISOString()"
              :title="formatDateTime(alert.raisedAt)"
            >{{ formatRelative(alert.raisedAt, now) }}</time>
          </span>
          <span
            v-if="location"
            class="meta-item"
          >
            <i
              class="pi pi-box"
              aria-hidden="true"
            />
            {{ location }}
          </span>
        </span>

        <span class="alert-actions">
          <pv-button
            :label="t('alerts.actions.viewDetails')"
            severity="secondary"
            size="small"
            :aria-describedby="titleId"
            :aria-expanded="selected"
            @click.stop="emit('select', $event.currentTarget)"
          />
          <pv-button
            v-if="alert.canBeAcknowledged"
            :label="t('alerts.actions.acknowledge')"
            :severity="actionSeverity"
            size="small"
            :loading="busy"
            :aria-describedby="titleId"
            @click.stop="emit('acknowledge', alert)"
          />
          <pv-button
            v-else-if="alert.isOpen"
            :label="t('alerts.actions.resolve')"
            :severity="actionSeverity"
            size="small"
            :disabled="busy"
            :aria-describedby="titleId"
            @click.stop="emit('resolve', alert)"
          />
          <span
            v-else
            class="resolved-note"
          >
            <i
              class="pi pi-check"
              aria-hidden="true"
            />
            {{ t('alerts.list.resolvedBy', { name: alert.resolvedBy ?? '—' }) }}
          </span>
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.alert-card {
  --tone: var(--cryo-status-info);
  --tone-bg: var(--cryo-status-info-bg);
  --tone-border: var(--cryo-status-info-border);

  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 14px;
  padding: 18px 18px 14px;
  background: var(--cryo-surface);
  border: 1px solid var(--cryo-border);
  border-radius: var(--cryo-radius-xl);
  box-shadow: var(--cryo-shadow-xs);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.severity-critical {
  --tone: var(--cryo-status-critical);
  --tone-bg: var(--cryo-status-critical-bg);
  --tone-border: var(--cryo-status-critical-border);
}

.severity-warning {
  --tone: var(--cryo-status-warning);
  --tone-bg: var(--cryo-status-warning-bg);
  --tone-border: var(--cryo-status-warning-border);
}

.alert-card:hover {
  border-color: var(--tone-border);
  box-shadow: var(--cryo-shadow-sm);
}

.alert-card.selected {
  border-color: var(--tone);
  box-shadow: 0 0 0 3px var(--tone-bg);
}

.alert-card.closed {
  background: var(--cryo-surface-alt);
}

.alert-icon {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  color: var(--tone);
  background: var(--tone-bg);
  border-radius: var(--cryo-radius-md);
  font-size: 16px;
}

.alert-card.closed .alert-icon {
  color: var(--cryo-status-ok);
  background: var(--cryo-status-ok-bg);
}

.alert-body {
  min-width: 0;
}

.alert-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
}

.alert-heading h3 {
  color: var(--cryo-text);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.35;
}

.alert-tags {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
}

.alert-tags :deep(.p-tag) {
  padding: 3px 8px !important;
  font-size: 11px !important;
}

.alert-message {
  display: -webkit-box;
  margin-top: 6px;
  overflow: hidden;
  color: var(--cryo-text-secondary);
  font-size: 13px;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.alert-message strong {
  color: var(--cryo-text);
  font-weight: 600;
}

.alert-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--cryo-border-subtle);
}

.alert-meta {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  color: var(--cryo-text-muted);
  font-size: 12px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.meta-item i {
  font-size: 12px;
}

.alert-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.resolved-note {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--cryo-status-ok-text);
  font-size: 12px;
  font-weight: 500;
}

.alert-card :deep(.p-button:focus-visible) {
  outline: 3px solid var(--cryo-primary);
  outline-offset: 2px;
}

@media (max-width: 560px) {
  .alert-card {
    grid-template-columns: 1fr;
    padding: 16px 14px 12px;
  }

  .alert-icon {
    display: none;
  }

  .alert-actions {
    width: 100%;
    margin-left: 0;
  }

  .alert-actions :deep(.p-button) {
    flex: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .alert-card {
    transition: none;
  }
}

/* Action colors with WCAG AA contrast for white text (palette #B45309; red-600). */
.alert-card :deep(.p-button.p-button-danger) {
  background: #dc2626 !important;
  border-color: #dc2626 !important;
}

.alert-card :deep(.p-button.p-button-danger:not(:disabled):hover) {
  background: #b91c1c !important;
  border-color: #b91c1c !important;
}

.alert-card :deep(.p-button.p-button-warn) {
  color: #fff !important;
  background: #b45309 !important;
  border-color: #b45309 !important;
}

.alert-card :deep(.p-button.p-button-warn:not(:disabled):hover) {
  background: #92400e !important;
  border-color: #92400e !important;
}
</style>
