<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import Chart from 'chart.js/auto';
import useAnalyticsStore from '../../application/analytics.store.js';
import KpiCard from '../components/kpi-card.vue';
import RecentAlertCard from '../components/recent-alert-card.vue';
import LabStatusCard from '../components/laboratory-status-card.vue';

const { t } = useI18n();
const router = useRouter();
const store = useAnalyticsStore();
const chartCanvas = ref(null);
let temperatureChart;

function renderChart() {
  if (!chartCanvas.value) return;
  temperatureChart?.destroy();

  temperatureChart = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels: store.chartData.labels,
      datasets: [
        {
          label: 'Temperature',
          data: store.chartData.datasets[0]?.data ?? [],
          borderColor: '#08b88c',
          backgroundColor: 'rgba(8, 184, 140, 0.12)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#9ca3af', maxTicksLimit: 10 },
        },
        y: {
          min: 0,
          max: 20,
          grid: { color: '#e5edf3' },
          ticks: {
            color: '#9ca3af',
            callback: (value) => `${value}°C`,
          },
        },
      },
    },
  });
}

onMounted(async () => {
  try {
    await store.fetchDashboardData();
    await nextTick();
    renderChart();
  } catch {
    // The dashboard still renders its static widgets when the mock API is offline.
  }
});

watch(
  () => [store.historicalData, store.chartData],
  async () => {
    await nextTick();
    renderChart();
  },
  { deep: true }
);

onBeforeUnmount(() => temperatureChart?.destroy());

function selectChartRange(range) {
  store.fetchChartData(range);
}

function goTo(path) {
  router.push(path);
}
</script>

<template>
  <div class="dashboard">
    <!-- Top KPI Row -->
    <section class="dashboard__kpi-grid">
      <KpiCard
        :title="t('analytics.dashboard.kpis.totalLaboratories')"
        :value="store.kpis.totalLaboratories"
        iconClass="pi pi-building"
        iconBgColor="#ecfdf5"
        iconColor="#10b981"
      />
      <KpiCard
        :title="t('analytics.dashboard.kpis.activeAlerts')"
        :value="store.kpis.activeAlerts"
        iconClass="pi pi-exclamation-triangle"
        iconBgColor="#fef2f2"
        iconColor="#ef4444"
      />
      <KpiCard
        :title="t('analytics.dashboard.kpis.systemsHealth')"
        :value="store.systemsHealthFormatted"
        iconClass="pi pi-heart"
        iconBgColor="#ecfdf5"
        iconColor="#10b981"
      />
      <KpiCard
        :title="t('analytics.dashboard.kpis.upcomingMaintenance')"
        :value="store.kpis.upcomingMaintenance"
        iconClass="pi pi-cog"
        iconBgColor="#eff6ff"
        iconColor="#3b82f6"
      />
    </section>
    <!-- Middle Row: Chart & Alerts -->
    <section class="dashboard__content-grid">
      <!-- Temperature Trends -->
      <div class="dashboard__chart-container dashboard-panel">
        <div class="dashboard-panel__header">
          <div>
            <h2 class="dashboard-panel__title">
              {{ t('analytics.dashboard.charts.temperatureTrends') }}
            </h2>
          </div>
          <div class="dashboard-panel__actions">
            <button
              v-for="range in ['24h', '7d', '30d']"
              :key="range"
              class="dashboard-panel__btn"
              :class="{ 'dashboard-panel__btn--active': store.chartTimeRange === range }"
              type="button"
              @click="selectChartRange(range)"
            >
              {{ t(`analytics.dashboard.chartRanges.${range}`) }}
            </button>
          </div>
        </div>
        <div class="dashboard__chart-wrapper">
          <canvas
            ref="chartCanvas"
            class="dashboard__chart"
            role="img"
            aria-label="Temperature trends"
          />
        </div>
        <button class="dashboard__readings-button" type="button" @click="goTo('/analytics/reads')">
          {{ t('analytics.dashboard.checkReadings') }}
        </button>
      </div>
      <!-- Recent Alerts -->
      <div class="dashboard__alerts-container dashboard-panel">
        <div class="dashboard-panel__header">
          <h2 class="dashboard-panel__title">{{ t('analytics.dashboard.alerts.title') }}</h2>
          <button class="dashboard-panel__link" type="button" @click="goTo('/alerts')">
            {{ t('analytics.dashboard.viewAll') }}
          </button>
        </div>

        <div class="dashboard__alerts-list">
          <RecentAlertCard
            v-for="alert in store.recentAlerts"
            :key="alert.id"
            :severity="alert.severity"
            :time="alert.time"
            :title="alert.title"
            :description="alert.description"
          />
        </div>
      </div>
    </section>
    <!-- Bottom Row: Laboratories -->
    <section class="dashboard__labs-container dashboard-panel">
      <div class="dashboard-panel__header">
        <div>
          <h2 class="dashboard-panel__title">{{ t('analytics.dashboard.labs.title') }}</h2>
          <p class="dashboard-panel__subtitle">{{ t('analytics.dashboard.labs.subtitle') }}</p>
        </div>
        <button class="dashboard-panel__link" type="button" @click="goTo('/laboratories')">
          {{ t('analytics.dashboard.viewAll') }}
        </button>
      </div>

      <div class="dashboard__labs-scroll">
        <LabStatusCard
          v-for="lab in store.laboratories"
          :key="lab.id"
          :name="lab.name"
          :status="lab.status"
          :type="lab.type"
          :temperature="lab.temperature"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}

/* KPI Grid */
.dashboard__kpi-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
}
@media (min-width: 768px) {
  .dashboard__kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .dashboard__kpi-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Content Grid */
.dashboard__content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}
@media (min-width: 1024px) {
  .dashboard__content-grid {
    grid-template-columns: 2fr 1fr;
  }
}

/* Reusable Panel Structure */
.dashboard-panel {
  background-color: #ffffff;
  border-radius: 1rem;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  width: 100%;
}
.dashboard-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}
.dashboard-panel__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}
.dashboard-panel__subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}
.dashboard-panel__link {
  background: transparent;
  border: 0;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #10b981;
  text-decoration: none;
}
.dashboard-panel__link:hover {
  text-decoration: underline;
}

/* Chart Specifics */
.dashboard__chart-wrapper {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: 340px;
  padding-bottom: 0.25rem;
}
.dashboard__chart {
  display: block;
  flex: 0 0 260px;
  width: 100%;
  height: 260px;
}
.dashboard__readings-button {
  display: block;
  align-self: flex-end;
  flex: 0 0 auto;
  margin: 0.75rem 0 0;
  padding: 0.55rem 1rem;
  color: #008b68;
  background: #eafbf4;
  border: 1px solid #c5f4df;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
}
.dashboard__chart-axis {
  display: flex;
  justify-content: space-between;
  color: #9ca3af;
  font-size: 0.75rem;
}
.dashboard-panel__actions {
  display: flex;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 0.25rem;
}
.dashboard-panel__btn {
  background: none;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
}
.dashboard-panel__btn--active {
  background-color: #ffffff;
  color: #059669;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Alerts List */
.dashboard__alerts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
}

/* Labs Carousel */
.dashboard__labs-scroll {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
}
.dashboard__labs-scroll::-webkit-scrollbar {
  height: 6px;
}
.dashboard__labs-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.dashboard__labs-scroll::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
</style>
