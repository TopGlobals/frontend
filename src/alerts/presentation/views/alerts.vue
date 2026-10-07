<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue';
import { storeToRefs } from 'pinia';
import useAlertsStore from '../../application/alerts.store.js';
import { AlertTransitionError } from '../../domain/model/alert.entity.js';
import { AlertStatus } from '../../domain/model/alert-status.enum.js';
import { useAlertFormatters } from '../composables/use-alert-formatters.js';
import AlertSummaryCards from '../components/alert-summary-cards.vue';
import AlertFiltersBar from '../components/alert-filters-bar.vue';
import AlertCard from '../components/alert-card.vue';
import AlertDetailPanel from '../components/alert-detail-panel.vue';
import ResolveAlertDialog from '../components/resolve-alert-dialog.vue';
import CreateAlertDialog from '../components/create-alert-dialog.vue';

const REFRESH_INTERVAL_MS = 30000;
const DAY_IN_MS = 86400000;
const WIDE_LAYOUT_QUERY = '(min-width: 1200px)';
const TOAST_GROUP = 'alerts';
const defaultFilters = Object.freeze({
  severity: 'all',
  laboratory: 'all',
  status: 'all',
  period: 'all',
});

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const store = useAlertsStore();
const { alerts, errors, alertsLoaded, loading, lastUpdatedAt } = storeToRefs(store);
const { formatClock } = useAlertFormatters();

const now = ref(new Date());
const filters = ref({ ...defaultFilters });
const selectedId = ref(null);
const drawerVisible = ref(false);
const busyId = ref(null);
const resolveTarget = ref(null);
const resolveVisible = ref(false);
const resolving = ref(false);
const createVisible = ref(false);
const creating = ref(false);
const detailPanel = ref(null);
const isWide = ref(true);
let lastTrigger = null;
let initialSelectionDone = false;
let refreshTimer = null;
let mediaQuery = null;

/* ---------- Filtering (US34) ---------- */

const searchTerm = computed(() => {
  const value = route.query.search;
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
});

const laboratories = computed(() =>
  [...new Set(alerts.value.map((alert) => alert.laboratoryName).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  )
);

const periodStart = computed(() => {
  const reference = now.value;
  if (filters.value.period === 'today') {
    const start = new Date(reference);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  if (filters.value.period === '7d') return new Date(reference - 7 * DAY_IN_MS);
  if (filters.value.period === '30d') return new Date(reference - 30 * DAY_IN_MS);
  return null;
});

/**
 * @param {import('../../domain/model/alert.entity.js').Alert} alert - Alert to test.
 * @returns {boolean} True when the alert matches the status filter.
 */
const matchesStatus = (alert) => {
  const { status } = filters.value;
  if (status === 'all') return true;
  if (status === 'open') return alert.isOpen;
  return alert.status === status;
};

/**
 * Date the period filter applies to: resolved alerts are matched by resolution date.
 * @param {import('../../domain/model/alert.entity.js').Alert} alert - Alert to test.
 * @returns {?Date} Relevant date.
 */
const relevantDate = (alert) =>
  filters.value.status === AlertStatus.CLOSED ? alert.resolvedAt : alert.raisedAt;

const filteredAlerts = computed(() =>
  alerts.value
    .filter((alert) => {
      const { severity, laboratory } = filters.value;
      const haystack = [
        alert.title,
        alert.message,
        alert.code,
        alert.laboratoryName,
        alert.storageUnitName,
        alert.sensorCode,
      ]
        .join(' ')
        .toLowerCase();
      return (
        (!searchTerm.value || haystack.includes(searchTerm.value)) &&
        (severity === 'all' || alert.severity === severity) &&
        (laboratory === 'all' || alert.laboratoryName === laboratory) &&
        matchesStatus(alert) &&
        (!periodStart.value || (relevantDate(alert) ?? 0) >= periodStart.value)
      );
    })
    .sort(
      (a, b) =>
        Number(b.isOpen) - Number(a.isOpen) ||
        a.severityRank - b.severityRank ||
        (b.raisedAt ?? 0) - (a.raisedAt ?? 0)
    )
);

const hasActiveFilters = computed(
  () =>
    !!searchTerm.value ||
    Object.keys(defaultFilters).some((key) => filters.value[key] !== defaultFilters[key])
);

/** Summary card whose shortcut matches the current filters exactly, if any. */
const activeShortcut = computed(() => {
  const { severity, laboratory, status, period } = filters.value;
  if (laboratory !== 'all') return null;
  if (status === 'open' && period === 'all' && severity !== 'all') return severity;
  if (status === AlertStatus.CLOSED && period === 'today' && severity === 'all') {
    return 'resolved-today';
  }
  return null;
});

/**
 * Applies the filter shortcut of a summary card, or removes it when it is already applied.
 * @param {string} key - Severity key or 'resolved-today'.
 */
function applyShortcut(key) {
  if (activeShortcut.value === key) {
    filters.value = { ...defaultFilters };
    return;
  }
  filters.value =
    key === 'resolved-today'
      ? { ...defaultFilters, status: AlertStatus.CLOSED, period: 'today' }
      : { ...defaultFilters, severity: key, status: 'open' };
}

/** Clears every filter, including the search term of the top bar (US34, scenario 2). */
function clearFilters() {
  filters.value = { ...defaultFilters };
  if (route.query.search) {
    router.replace({ query: { ...route.query, search: undefined } });
  }
}

/* ---------- Selection and detail panel (US35) ---------- */

const selectedAlert = computed(() =>
  selectedId.value === null ? null : (store.getAlertById(selectedId.value) ?? null)
);

/**
 * Opens the detail panel for an alert.
 * @param {import('../../domain/model/alert.entity.js').Alert} alert - Alert to show.
 * @param {?HTMLElement} trigger - Element that opened the panel, focused again on close.
 */
async function openDetails(alert, trigger = null) {
  lastTrigger = trigger;
  selectedId.value = alert.id;
  if (!isWide.value) {
    drawerVisible.value = true;
    return;
  }
  await nextTick();
  detailPanel.value?.focusHeading();
}

/** Closes the detail panel and returns focus to the element that opened it. */
function closeDetails() {
  drawerVisible.value = false;
  selectedId.value = null;
  const trigger = lastTrigger;
  lastTrigger = null;
  nextTick(() => trigger?.focus?.());
}

watch(drawerVisible, (visible) => {
  if (!visible && !isWide.value && selectedId.value !== null) closeDetails();
});

/* ---------- Commands (US09, US17, US18, US26, US27, US39) ---------- */

/**
 * @param {string} severity - PrimeVue toast severity.
 * @param {string} summary - Toast title.
 * @param {string} detail - Toast message.
 */
const notify = (severity, summary, detail) =>
  toast.add({ group: TOAST_GROUP, severity, summary, detail, life: 5000 });

/**
 * Shows a clear error message for a failed command.
 * @param {Error} error - Error raised by the store or the API.
 */
function notifyError(error) {
  if (error instanceof AlertTransitionError) {
    const name = error.details.acknowledgedBy ?? error.details.resolvedBy ?? '—';
    notify('warn', t('alerts.toast.notUpdatedTitle'), t(`alerts.toast.${error.reason}`, { name }));
    return;
  }
  notify('error', t('alerts.toast.notUpdatedTitle'), t('alerts.toast.networkError'));
}

/**
 * Acknowledges an alert so its escalation stops.
 * @param {import('../../domain/model/alert.entity.js').Alert} alert - Alert to acknowledge.
 */
function acknowledge(alert) {
  busyId.value = alert.id;
  store
    .acknowledgeAlert(alert.id)
    .then((saved) =>
      notify(
        'success',
        t('alerts.toast.acknowledgedTitle'),
        t('alerts.toast.acknowledgedDetail', { title: saved.title })
      )
    )
    .catch(notifyError)
    .finally(() => {
      busyId.value = null;
    });
}

/**
 * Opens the resolution dialog for an alert.
 * @param {import('../../domain/model/alert.entity.js').Alert} alert - Alert to resolve.
 */
function openResolve(alert) {
  resolveTarget.value = alert;
  resolveVisible.value = true;
}

/**
 * Resolves the alert with the corrective action entered in the dialog.
 * @param {string} description - Corrective action or resolution note.
 */
function confirmResolve(description) {
  const alert = resolveTarget.value;
  if (!alert) return;
  resolving.value = true;
  busyId.value = alert.id;
  store
    .resolveAlert(alert.id, description)
    .then((saved) => {
      resolveVisible.value = false;
      notify(
        'success',
        t('alerts.toast.resolvedTitle'),
        t('alerts.toast.resolvedDetail', { title: saved.title })
      );
    })
    .catch(notifyError)
    .finally(() => {
      resolving.value = false;
      busyId.value = null;
    });
}

/**
 * Registers an alert reported manually from the creation dialog.
 * @param {Object} draft - Title, message, severity, laboratoryName and ongoing flag.
 */
function confirmCreate(draft) {
  creating.value = true;
  store
    .createAlert(draft)
    .then((created) => {
      createVisible.value = false;
      notify(
        'success',
        t('alerts.toast.createdTitle'),
        t('alerts.toast.createdDetail', { title: created.title })
      );
    })
    .catch(() =>
      notify('error', t('alerts.toast.notCreatedTitle'), t('alerts.toast.networkError'))
    )
    .finally(() => {
      creating.value = false;
    });
}

/* ---------- Loading and live refresh ---------- */

/** Reloads the feed; on wide screens selects the most urgent alert the first time. */
function refresh() {
  now.value = new Date();
  return store.fetchAlerts().then((loaded) => {
    if (!loaded || initialSelectionDone) return;
    initialSelectionDone = true;
    if (isWide.value && selectedId.value === null) {
      const firstOpen = filteredAlerts.value.find((alert) => alert.isOpen);
      if (firstOpen) selectedId.value = firstOpen.id;
    }
  });
}

const refreshFailed = computed(() => alertsLoaded.value && errors.value.length > 0);
const loadFailed = computed(() => !alertsLoaded.value && !loading.value && errors.value.length > 0);
const showingText = computed(() =>
  t(
    'alerts.list.showing',
    { shown: filteredAlerts.value.length, total: alerts.value.length },
    alerts.value.length
  )
);

/** @param {MediaQueryListEvent|MediaQueryList} event - Media query state. */
function onLayoutChange(event) {
  isWide.value = event.matches;
  if (isWide.value) drawerVisible.value = false;
  else if (selectedId.value !== null) drawerVisible.value = true;
}

onMounted(() => {
  mediaQuery = window.matchMedia(WIDE_LAYOUT_QUERY);
  isWide.value = mediaQuery.matches;
  mediaQuery.addEventListener('change', onLayoutChange);
  refresh();
  refreshTimer = window.setInterval(refresh, REFRESH_INTERVAL_MS);
});

onBeforeUnmount(() => {
  window.clearInterval(refreshTimer);
  mediaQuery?.removeEventListener('change', onLayoutChange);
});
</script>

<template>
  <section
    class="alerts-page"
    :aria-busy="loading && !alertsLoaded"
  >
    <alert-summary-cards
      :alerts="alerts"
      :now="now"
      :active-shortcut="activeShortcut"
      @select="applyShortcut"
    />

    <alert-filters-bar
      v-model:filters="filters"
      :laboratories="laboratories"
      :has-active-filters="hasActiveFilters"
      @clear="clearFilters"
    />

    <div class="list-header">
      <p
        class="results"
        aria-live="polite"
      >
        <strong>{{ showingText }}</strong>
        <span v-if="searchTerm">
          {{ t('alerts.list.searchingFor', { term: route.query.search }) }}
        </span>
      </p>
      <div class="list-tools">
        <p class="sync">
          <span
            v-if="refreshFailed"
            class="sync-warning"
            role="status"
          >
            <i
              class="pi pi-exclamation-triangle"
              aria-hidden="true"
            />
            {{ t('alerts.list.refreshFailed', { time: formatClock(lastUpdatedAt) }) }}
          </span>
          <span v-else-if="lastUpdatedAt">
            {{ t('alerts.list.updatedAt', { time: formatClock(lastUpdatedAt) }) }}
          </span>
          <pv-button
            icon="pi pi-refresh"
            severity="secondary"
            text
            rounded
            size="small"
            :loading="loading && alertsLoaded"
            :aria-label="t('alerts.list.refresh')"
            @click="refresh"
          />
        </p>
        <pv-button
          :label="t('alerts.actions.addAlert')"
          icon="pi pi-plus"
          size="small"
          @click="createVisible = true"
        />
      </div>
    </div>

    <div
      class="alerts-layout"
      :class="{ 'with-panel': isWide && selectedAlert }"
    >
      <div class="list-column">
        <h2 class="sr-only">
          {{ t('alerts.list.heading') }}
        </h2>

        <div
          v-if="loading && !alertsLoaded"
          class="skeleton-list"
          :aria-label="t('alerts.list.loading')"
          role="status"
        >
          <span
            v-for="row in 4"
            :key="row"
            class="skeleton-card"
          />
        </div>

        <section
          v-else-if="loadFailed"
          class="state-box state-error"
          role="alert"
        >
          <i
            class="pi pi-wifi"
            aria-hidden="true"
          />
          <h3>{{ t('alerts.list.errorTitle') }}</h3>
          <p>{{ t('alerts.list.errorDescription') }}</p>
          <pv-button
            :label="t('alerts.list.retry')"
            icon="pi pi-refresh"
            @click="refresh"
          />
        </section>

        <ul
          v-else-if="filteredAlerts.length"
          class="alert-list"
        >
          <li
            v-for="alert in filteredAlerts"
            :key="alert.id"
          >
            <alert-card
              :alert="alert"
              :now="now"
              :selected="selectedId === alert.id"
              :busy="busyId === alert.id"
              @select="(trigger) => openDetails(alert, trigger)"
              @acknowledge="acknowledge"
              @resolve="openResolve"
            />
          </li>
        </ul>

        <section
          v-else
          class="state-box"
        >
          <i
            :class="alerts.length ? 'pi pi-filter-slash' : 'pi pi-check-circle'"
            aria-hidden="true"
          />
          <h3>
            {{ alerts.length ? t('alerts.list.noMatchesTitle') : t('alerts.list.emptyTitle') }}
          </h3>
          <p>
            {{
              alerts.length
                ? t('alerts.list.noMatchesDescription')
                : t('alerts.list.emptyDescription')
            }}
          </p>
          <pv-button
            v-if="alerts.length"
            :label="t('alerts.filters.clear')"
            icon="pi pi-filter-slash"
            severity="secondary"
            @click="clearFilters"
          />
        </section>
      </div>

      <aside
        v-if="isWide && selectedAlert"
        class="detail-column"
      >
        <alert-detail-panel
          ref="detailPanel"
          :alert="selectedAlert"
          :now="now"
          :busy="busyId === selectedAlert.id"
          @close="closeDetails"
          @acknowledge="acknowledge"
          @resolve="openResolve"
        />
      </aside>
    </div>

    <pv-drawer
      v-if="!isWide"
      v-model:visible="drawerVisible"
      position="right"
      class="alert-drawer"
      :aria-label="t('alerts.details.title')"
    >
      <template #container="{ closeCallback }">
        <alert-detail-panel
          v-if="selectedAlert"
          :alert="selectedAlert"
          :now="now"
          :busy="busyId === selectedAlert.id"
          @close="closeCallback"
          @acknowledge="acknowledge"
          @resolve="openResolve"
        />
      </template>
    </pv-drawer>

    <resolve-alert-dialog
      v-model:visible="resolveVisible"
      :alert="resolveTarget"
      :submitting="resolving"
      @confirm="confirmResolve"
    />
    <create-alert-dialog
      v-model:visible="createVisible"
      :laboratories="laboratories"
      :submitting="creating"
      @confirm="confirmCreate"
    />
    <pv-toast
      :group="TOAST_GROUP"
      position="top-right"
    />
  </section>
</template>

<style scoped>
.alerts-page {
  max-width: 1440px;
  margin: 0 auto;
  color: var(--cryo-text);
}

.list-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  margin-bottom: 12px;
}

.results {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  color: var(--cryo-text-secondary);
  font-size: 13px;
}

.results strong {
  color: var(--cryo-text);
  font-weight: 600;
}

.list-tools {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}

.sync {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--cryo-text-muted);
  font-size: 12px;
}

.sync-warning {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--cryo-status-warning-text);
}

.alerts-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  gap: 20px;
}

.alerts-layout.with-panel {
  grid-template-columns: minmax(0, 1.35fr) minmax(360px, 1fr);
}

.alert-list {
  display: grid;
  gap: 12px;
  padding: 0;
  list-style: none;
}

.detail-column {
  position: sticky;
  top: 104px;
  max-height: calc(100vh - 128px);
  overflow-y: auto;
  background: var(--cryo-surface);
  border: 1px solid var(--cryo-border);
  border-radius: var(--cryo-radius-xl);
  box-shadow: var(--cryo-shadow-sm);
}

.state-box {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 56px 20px;
  color: var(--cryo-text-secondary);
  text-align: center;
  background: var(--cryo-surface);
  border: 1px solid var(--cryo-border);
  border-radius: var(--cryo-radius-xl);
}

.state-box > i {
  color: var(--cryo-primary);
  font-size: 26px;
}

.state-error > i {
  color: var(--cryo-status-critical);
}

.state-box h3 {
  color: var(--cryo-text);
  font-size: 17px;
}

.state-box p {
  max-width: 46ch;
  margin-bottom: 6px;
  font-size: 13px;
}

.skeleton-list {
  display: grid;
  gap: 12px;
}

.skeleton-card {
  display: block;
  height: 132px;
  background: linear-gradient(
    90deg,
    var(--cryo-surface) 0%,
    var(--cryo-surface-muted) 50%,
    var(--cryo-surface) 100%
  );
  background-size: 200% 100%;
  border: 1px solid var(--cryo-border);
  border-radius: var(--cryo-radius-xl);
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  from {
    background-position: 100% 0;
  }

  to {
    background-position: -100% 0;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (max-width: 1400px) {
  .alerts-layout.with-panel {
    grid-template-columns: minmax(0, 1fr) minmax(340px, 400px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-card {
    animation: none;
  }
}
</style>

<style>
.p-drawer.alert-drawer {
  width: min(440px, 100vw) !important;
}

.p-drawer.alert-drawer .detail-panel {
  height: 100%;
  overflow-y: auto;
}
</style>
