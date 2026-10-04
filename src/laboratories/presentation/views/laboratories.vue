<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useLaboratoriesStore from '../../application/laboratories.store.js';

const route = useRoute();
const { t } = useI18n();
const laboratoriesStore = useLaboratoriesStore();
const page = ref(1);
const pageSize = 9;
const statusFilter = ref('all');
const locationFilter = ref('all');
const viewMode = ref('grid');

const statusOptions = ['all', 'pending', 'ok', 'warning', 'critical'];
const statusLabel = (status) => t(`laboratories.panel.${status}`);
const labLocationKey = (lab) => `${lab.building || 'unspecified'}:${lab.floor || ''}`;
const labLocation = (lab) => {
  const building = lab.building
    ? t(`laboratories.create.buildingNames.${lab.building}`)
    : t('laboratories.panel.unspecifiedLocation');
  const floor = lab.floor ? t(`laboratories.create.floorNames.${lab.floor}`) : null;
  const room = lab.room ? `${t('laboratories.create.roomShort')} ${lab.room}` : null;
  return [building, floor, room].filter(Boolean).join(', ');
};
const labTemperature = (lab) =>
  lab.temperature ?? t('laboratories.panel.noData');
const labUpdated = (lab) =>
  lab.status === 'pending'
    ? t('laboratories.panel.awaitingData')
    : lab.updatedAt
      ? t('laboratories.panel.updatedNow')
      : '';

const searchTerm = computed(() => {
  const value = route.query.search;
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
});

const laboratories = computed(() => laboratoriesStore.laboratories);
const locations = computed(() => {
  const uniqueLocations = new Map();
  laboratories.value.forEach((lab) => {
    uniqueLocations.set(labLocationKey(lab), labLocation(lab));
  });
  return [...uniqueLocations].map(([key, label]) => ({ key, label }));
});

const filteredLaboratories = computed(() =>
  laboratories.value.filter((lab) => {
    const matchesSearch =
      !searchTerm.value ||
      `${lab.name} ${lab.code} ${labLocation(lab)}`.toLowerCase().includes(searchTerm.value);
    const matchesStatus = statusFilter.value === 'all' || lab.status === statusFilter.value;
    const matchesLocation = locationFilter.value === 'all' || labLocationKey(lab) === locationFilter.value;
    return matchesSearch && matchesStatus && matchesLocation;
  }),
);

const pageCount = computed(() => Math.max(1, Math.ceil(filteredLaboratories.value.length / pageSize)));
const visibleLaboratories = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredLaboratories.value.slice(start, start + pageSize);
});
const firstVisible = computed(() =>
  filteredLaboratories.value.length ? (page.value - 1) * pageSize + 1 : 0,
);
const lastVisible = computed(() => Math.min(page.value * pageSize, filteredLaboratories.value.length));

watch([statusFilter, locationFilter, searchTerm], () => {
  page.value = 1;
});

function setPage(nextPage) {
  page.value = Math.min(Math.max(nextPage, 1), pageCount.value);
}
</script>

<template>
  <section
    class="laboratories-page"
    :aria-label="t('laboratories.panel.title')"
  >
    <div class="toolbar">
      <strong class="lab-count">{{ t('laboratories.panel.count', { count: filteredLaboratories.length }) }}</strong>
      <div class="toolbar-controls">
        <label class="filter-select">
          <span class="sr-only">{{ t('laboratories.panel.filterStatus') }}</span>
          <select v-model="statusFilter">
            <option
              v-for="status in statusOptions"
              :key="status"
              :value="status"
            >
              {{ t('laboratories.panel.statusFilter', { status: statusLabel(status) }) }}
            </option>
          </select>
        </label>
        <label class="filter-select location-select">
          <span class="sr-only">{{ t('laboratories.panel.filterLocation') }}</span>
          <select v-model="locationFilter">
            <option value="all">
              {{ t('laboratories.panel.locationFilter', { location: t('laboratories.panel.all') }) }}
            </option>
            <option
              v-for="location in locations"
              :key="location.key"
              :value="location.key"
            >
              {{ location.label }}
            </option>
          </select>
        </label>
        <div
          class="view-switch"
          :aria-label="t('laboratories.panel.display')"
        >
          <button
            type="button"
            :class="{ selected: viewMode === 'grid' }"
            :aria-label="t('laboratories.panel.gridView')"
            :aria-pressed="viewMode === 'grid'"
            @click="viewMode = 'grid'"
          >
            <i
              class="pi pi-th-large"
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            :class="{ selected: viewMode === 'list' }"
            :aria-label="t('laboratories.panel.listView')"
            :aria-pressed="viewMode === 'list'"
            @click="viewMode = 'list'"
          >
            <i
              class="pi pi-bars"
              aria-hidden="true"
            />
          </button>
        </div>
        <router-link
          class="add-button"
          to="/laboratories/new"
        >
          <i
            class="pi pi-plus"
            aria-hidden="true"
          />
          {{ t('laboratories.panel.add') }}
        </router-link>
      </div>
    </div>

    <div
      v-if="visibleLaboratories.length"
      class="laboratory-grid"
      :class="`view-${viewMode}`"
    >
      <article
        v-for="lab in visibleLaboratories"
        :key="lab.id"
        class="laboratory-card"
        :class="`status-${lab.status.toLowerCase()}`"
      >
        <div class="card-heading">
          <div>
            <h2>{{ lab.name }}</h2>
            <p class="location">
              <i
                class="pi pi-map-marker"
                aria-hidden="true"
              /> {{ labLocation(lab) }}
            </p>
          </div>
          <span class="status-badge">
            <span class="status-dot" />
            {{ statusLabel(lab.status) }}
          </span>
        </div>

        <div class="metrics">
          <div
            class="metric"
            :class="{ 'metric-critical': lab.status === 'critical' }"
          >
            <span class="metric-label">{{ t('laboratories.panel.temp') }}</span>
            <strong>{{ labTemperature(lab) }}</strong>
            <span
              v-if="lab.temperature !== null"
              class="metric-bar"
            ><i /></span>
          </div>
          <div class="metric">
            <span class="metric-label">{{ t('laboratories.panel.airQuality') }}</span>
            <strong v-if="lab.airQuality !== null">{{ lab.airQuality }}<small> {{ t('laboratories.panel.aqi') }}</small></strong>
            <strong v-else>{{ t('laboratories.panel.noData') }}</strong>
            <svg
              v-if="lab.airQuality !== null"
              class="sparkline"
              viewBox="0 0 64 16"
              role="img"
              :aria-label="t('laboratories.panel.trend')"
            >
              <path d="M1 12 C10 12, 14 4, 23 6 S38 15, 47 10 S57 5, 63 7" />
            </svg>
          </div>
          <div class="metric">
            <span class="metric-label">{{ t('laboratories.panel.unknown') }}</span>
            <strong>{{ lab.unknown ?? t('laboratories.panel.noData') }}</strong>
            <span
              v-if="lab.unknown !== null"
              class="unknown-bars"
              :class="{ 'bars-warning': lab.unknown > 0 }"
            >
              <i
                v-for="bar in 3"
                :key="bar"
              />
            </span>
          </div>
        </div>

        <footer class="card-footer">
          <span :class="{ 'critical-message': lab.status === 'critical' }">{{ labUpdated(lab) }}</span>
          <details class="details-disclosure">
            <summary>{{ t('laboratories.panel.viewDetails') }} <span aria-hidden="true">→</span></summary>
            <p><strong>{{ t('laboratories.panel.laboratoryId') }}:</strong> {{ lab.code }}</p>
            <p>
              <strong>{{ t('laboratories.panel.airQualityDetails') }}:</strong> {{ lab.airQuality ?? t('laboratories.panel.noData') }}<template v-if="lab.airQuality !== null">
                {{ t('laboratories.panel.aqi') }}
              </template>
            </p>
            <p><strong>{{ t('laboratories.panel.unknownDetections') }}:</strong> {{ lab.unknown ?? t('laboratories.panel.noData') }}</p>
          </details>
        </footer>
      </article>
    </div>
    <section
      v-else
      class="empty-state"
    >
      <i
        class="pi pi-flask"
        aria-hidden="true"
      />
      <h2>{{ laboratories.length ? t('laboratories.panel.noMatchesTitle') : t('laboratories.panel.emptyTitle') }}</h2>
      <p>{{ laboratories.length ? t('laboratories.panel.empty') : t('laboratories.panel.emptyDescription') }}</p>
      <router-link
        v-if="!laboratories.length"
        class="add-button"
        to="/laboratories/new"
      >
        <i
          class="pi pi-plus"
          aria-hidden="true"
        />
        {{ t('laboratories.panel.addFirst') }}
      </router-link>
    </section>

    <footer
      v-if="filteredLaboratories.length"
      class="pagination"
    >
      <span>{{ t('laboratories.panel.showing', { first: firstVisible, last: lastVisible, count: filteredLaboratories.length }) }}</span>
      <nav :aria-label="t('laboratories.panel.pages')">
        <button
          type="button"
          :disabled="page === 1"
          @click="setPage(page - 1)"
        >
          {{ t('laboratories.panel.previous') }}
        </button>
        <button
          v-for="pageNumber in pageCount"
          :key="pageNumber"
          type="button"
          :class="{ current: pageNumber === page }"
          :aria-current="pageNumber === page ? 'page' : undefined"
          @click="setPage(pageNumber)"
        >
          {{ pageNumber }}
        </button>
        <button
          type="button"
          :disabled="page === pageCount"
          @click="setPage(page + 1)"
        >
          {{ t('laboratories.panel.next') }}
        </button>
      </nav>
    </footer>
  </section>
</template>

<style scoped>
.laboratories-page {
  max-width: 1440px;
  margin: 0 auto;
  color: #18243a;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin: 8px 0 24px;
}

.lab-count {
  font-size: 14px;
}

.toolbar-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-select select,
.pagination button {
  min-height: 34px;
  padding: 0 12px;
  color: #3d4f6a;
  background: #fff;
  border: 1px solid #dfe6ef;
  border-radius: 11px;
  font: inherit;
  font-size: 12px;
}

.filter-select select {
  max-width: 190px;
  cursor: pointer;
}

.view-switch {
  display: flex;
  padding: 3px;
  background: #fff;
  border: 1px solid #dfe6ef;
  border-radius: 10px;
}

.view-switch button {
  display: grid;
  width: 27px;
  height: 26px;
  place-items: center;
  color: #8798b1;
  background: transparent;
  border: 0;
  border-radius: 7px;
  cursor: pointer;
}

.view-switch button.selected {
  color: #008e6b;
  background: #eafbf4;
}

.add-button {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-height: 36px;
  padding: 0 16px;
  color: white;
  background: #079d75;
  border-radius: 11px;
  box-shadow: 0 3px 7px #079d7524;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.add-button:hover {
  color: white;
  background: #078665;
}

.laboratory-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.laboratory-card {
  position: relative;
  min-width: 0;
  padding: 22px 20px 0;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e4e9f0;
  border-radius: 17px;
  box-shadow: 0 1px 2px #13233d08;
}

.laboratory-card::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 4px;
  background: var(--status-color);
  content: '';
}

.status-ok {
  --status-color: #00b981;
  --status-soft: #e9fff6;
  --status-border: #91f2c9;
}

.status-warning {
  --status-color: #ff9d00;
  --status-soft: #fff9e9;
  --status-border: #ffda70;
}

.status-critical {
  --status-color: #ff405f;
  --status-soft: #fff1f3;
  --status-border: #ffc4cd;
}

.status-pending {
  --status-color: #64748b;
  --status-soft: #f1f5f9;
  --status-border: #d8e0ea;
}

.card-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  min-height: 62px;
}

.card-heading h2 {
  margin: 2px 0 4px;
  font-size: 16px;
  line-height: 1.2;
}

.location {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  color: #8b9db7;
  font-size: 11px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  color: var(--status-color);
  background: var(--status-soft);
  border: 1px solid var(--status-border);
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: var(--status-color);
  border-radius: 50%;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding: 2px 0 20px;
}

.metric {
  display: flex;
  min-width: 0;
  min-height: 76px;
  flex-direction: column;
  justify-content: space-between;
  padding: 11px 10px 8px;
  background: #f8fafc;
  border: 1px solid #f0f3f7;
  border-radius: 13px;
}

.metric-label {
  color: #8b9db7;
  font-size: 9px;
  font-weight: 700;
}

.metric strong {
  color: #1c2940;
  font-size: 14px;
  line-height: 1.2;
}

.metric strong small {
  color: #91a1b8;
  font-size: 9px;
  font-weight: 400;
}

.metric-bar {
  height: 6px;
  overflow: hidden;
  background: #cff8e7;
  border-radius: 999px;
}

.metric-bar i {
  display: block;
  width: 76%;
  height: 100%;
  background: #08b883;
  border-radius: inherit;
}

.metric-critical {
  background: #fff9fa;
  border-color: #ffdde2;
}

.metric-critical .metric-label,
.metric-critical strong {
  color: #f33253;
}

.metric-critical .metric-bar {
  background: #ffd1d8;
}

.metric-critical .metric-bar i {
  width: 82%;
  background: #fb3f5e;
}

.status-warning .metric:first-child strong {
  color: #ed8b00;
}

.status-warning .metric-bar {
  background: #ffefc2;
}

.status-warning .metric-bar i {
  width: 78%;
  background: #ff9d00;
}

.sparkline {
  width: 100%;
  height: 17px;
  overflow: visible;
}

.sparkline path {
  fill: none;
  stroke: #655cff;
  stroke-linecap: round;
  stroke-width: 1.7;
}

.unknown-bars {
  display: flex;
  align-items: end;
  gap: 3px;
  height: 14px;
}

.unknown-bars i {
  width: 5px;
  height: 5px;
  background: #dfe6ef;
  border-radius: 4px;
}

.unknown-bars i:nth-child(2) {
  height: 8px;
}

.unknown-bars i:nth-child(3) {
  height: 11px;
}

.unknown-bars.bars-warning i {
  background: #ff9d00;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 52px;
  border-top: 1px solid #f0f2f6;
  color: #93a3ba;
  font-size: 11px;
}

.card-footer .critical-message {
  color: #f33253;
}

.details-disclosure {
  position: relative;
  color: #008f6b;
}

.details-disclosure summary {
  cursor: pointer;
  font-weight: 600;
  list-style: none;
  white-space: nowrap;
}

.details-disclosure summary::-webkit-details-marker {
  display: none;
}

.details-disclosure[open] p {
  position: relative;
  z-index: 1;
  margin: 7px 0;
  color: #526681;
  font-size: 11px;
  white-space: nowrap;
}

.details-disclosure[open] {
  position: absolute;
  right: 16px;
  bottom: 48px;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #dfe6ef;
  border-radius: 10px;
  box-shadow: 0 8px 20px #14243a18;
}

.empty-state {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 64px 20px;
  color: #71839d;
  background: #fff;
  border: 1px solid #e2e9f2;
  border-radius: 16px;
  text-align: center;
}

.empty-state > i {
  color: #079d75;
  font-size: 26px;
}

.empty-state h2 {
  margin: 0;
  color: #1c2940;
  font-size: 17px;
}

.empty-state p {
  margin: 0 0 8px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5eaf1;
  color: #71839d;
  font-size: 11px;
}

.pagination nav {
  display: flex;
  gap: 6px;
}

.pagination button {
  min-width: 34px;
  min-height: 32px;
  cursor: pointer;
}

.pagination button:disabled {
  color: #a4b0c1;
  background: #f8fafc;
  cursor: not-allowed;
}

.pagination button.current {
  color: #fff;
  background: #079d75;
  border-color: #079d75;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  clip-path: inset(50%);
}

.view-list {
  grid-template-columns: 1fr;
  gap: 12px;
}

.view-list .laboratory-card {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(280px, 1.3fr) minmax(180px, 1fr);
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
}

.view-list .card-heading {
  min-height: auto;
}

.view-list .metrics {
  padding: 0;
}

.view-list .card-footer {
  min-height: auto;
  padding-left: 14px;
  border-top: 0;
}

@media (max-width: 1180px) {
  .laboratory-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .view-list .laboratory-card {
    grid-template-columns: minmax(150px, 1fr) minmax(240px, 1.3fr);
  }

  .view-list .card-footer {
    grid-column: 1 / -1;
    padding: 10px 0 0;
    border-top: 1px solid #f0f2f6;
  }
}

@media (max-width: 760px) {
  .toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .toolbar-controls {
    flex-wrap: wrap;
  }

  .laboratory-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .view-list .laboratory-card {
    grid-template-columns: 1fr;
  }

  .view-list .card-footer {
    grid-column: auto;
  }

  .pagination {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .location-select select {
    max-width: 145px;
  }

  .toolbar-controls {
    gap: 8px;
  }

  .pagination nav {
    flex-wrap: wrap;
  }
}
</style>
