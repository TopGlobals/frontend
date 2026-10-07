<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { AlertSeverity } from '../../domain/model/alert-severity.enum.js';
import { AlertStatus } from '../../domain/model/alert-status.enum.js';

const props = defineProps({
  /** All alerts of the feed, without filters. */
  alerts: { type: Array, required: true },
  /** Reference time used for "today" and "last 24 h". */
  now: { type: Date, required: true },
  /** Shortcut currently applied to the filters, if any. */
  activeShortcut: { type: String, default: null },
});

const emit = defineEmits(['select']);

const { t } = useI18n();
const DAY_IN_MS = 86400000;

const isSameDay = (date, reference) => !!date && date.toDateString() === reference.toDateString();

const cards = computed(() => {
  const open = props.alerts.filter((alert) => alert.isOpen);
  const resolvedToday = props.alerts.filter(
    (alert) => alert.status === AlertStatus.CLOSED && isSameDay(alert.resolvedAt, props.now)
  ).length;
  const raisedLast24h = (severity) =>
    props.alerts.filter(
      (alert) =>
        alert.severity === severity && alert.raisedAt && props.now - alert.raisedAt < DAY_IN_MS
    ).length;
  const share = (count, total) => (total ? Math.round((count / total) * 100) : 0);

  const severityCards = [
    { key: AlertSeverity.CRITICAL, icon: 'pi pi-exclamation-circle' },
    { key: AlertSeverity.WARNING, icon: 'pi pi-exclamation-triangle' },
    { key: AlertSeverity.INFO, icon: 'pi pi-info-circle' },
  ].map(({ key, icon }) => {
    const count = open.filter((alert) => alert.severity === key).length;
    return {
      key,
      icon,
      count,
      label: t(`alerts.summary.${key}`),
      trend: t('alerts.summary.newLast24h', { count: raisedLast24h(key) }),
      share: share(count, open.length),
    };
  });

  return [
    ...severityCards,
    {
      key: 'resolved-today',
      icon: 'pi pi-check-circle',
      count: resolvedToday,
      label: t('alerts.summary.resolvedToday'),
      trend: t('alerts.summary.stillOpen', { count: open.length }),
      share: share(resolvedToday, resolvedToday + open.length),
    },
  ];
});
</script>

<template>
  <ul
    class="summary-cards"
    :aria-label="t('alerts.summary.label')"
  >
    <li
      v-for="card in cards"
      :key="card.key"
    >
      <button
        type="button"
        class="summary-card"
        :class="`summary-${card.key}`"
        :aria-pressed="activeShortcut === card.key"
        :aria-label="t('alerts.summary.filterBy', { count: card.count, label: card.label })"
        @click="emit('select', card.key)"
      >
        <span class="summary-top">
          <span class="summary-icon"><i
            :class="card.icon"
            aria-hidden="true"
          /></span>
          <span class="summary-trend">{{ card.trend }}</span>
        </span>
        <strong class="summary-count">{{ card.count }}</strong>
        <span class="summary-label">{{ card.label }}</span>
        <span
          class="summary-bar"
          aria-hidden="true"
        ><i :style="{ width: `${card.share}%` }" /></span>
      </button>
    </li>
  </ul>
</template>

<style scoped>
.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  margin: 0 0 20px;
  padding: 0;
  list-style: none;
}

.summary-card {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  gap: 4px;
  padding: 18px 20px 20px;
  color: var(--cryo-text);
  text-align: left;
  background: var(--cryo-surface);
  border: 1px solid var(--cryo-border);
  border-radius: var(--cryo-radius-xl);
  box-shadow: var(--cryo-shadow-xs);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.summary-card:hover {
  border-color: var(--tone-border);
  box-shadow: var(--cryo-shadow-sm);
}

.summary-card[aria-pressed='true'] {
  border-color: var(--tone);
  box-shadow: 0 0 0 3px var(--tone-bg);
}

.summary-card:focus-visible {
  outline: 3px solid var(--cryo-primary);
  outline-offset: 2px;
}

.summary-critical {
  --tone: var(--cryo-status-critical);
  --tone-bg: var(--cryo-status-critical-bg);
  --tone-border: var(--cryo-status-critical-border);
  --tone-text: var(--cryo-status-critical-text);
}

.summary-warning {
  --tone: var(--cryo-status-warning);
  --tone-bg: var(--cryo-status-warning-bg);
  --tone-border: var(--cryo-status-warning-border);
  --tone-text: var(--cryo-status-warning-text);
}

.summary-info {
  --tone: var(--cryo-status-info);
  --tone-bg: var(--cryo-status-info-bg);
  --tone-border: var(--cryo-status-info-border);
  --tone-text: var(--cryo-status-info-text);
}

.summary-resolved-today {
  --tone: var(--cryo-status-ok);
  --tone-bg: var(--cryo-status-ok-bg);
  --tone-border: var(--cryo-status-ok-border);
  --tone-text: var(--cryo-status-ok-text);
}

.summary-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.summary-icon {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  color: var(--tone);
  background: var(--tone-bg);
  border-radius: var(--cryo-radius-md);
  font-size: 16px;
}

.summary-trend {
  padding: 3px 8px;
  color: var(--tone-text);
  background: var(--tone-bg);
  border-radius: var(--cryo-radius-full);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.summary-count {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
}

.summary-label {
  color: var(--cryo-text-secondary);
  font-size: 13px;
  font-weight: 500;
}

.summary-bar {
  height: 5px;
  margin-top: 12px;
  overflow: hidden;
  background: var(--cryo-surface-muted);
  border-radius: var(--cryo-radius-full);
}

.summary-bar i {
  display: block;
  height: 100%;
  background: var(--tone);
  border-radius: inherit;
  transition: width 0.3s ease;
}

@media (max-width: 1100px) {
  .summary-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
}

@media (max-width: 420px) {
  .summary-card {
    padding: 14px;
  }

  .summary-trend {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .summary-card,
  .summary-bar i {
    transition: none;
  }
}
</style>
