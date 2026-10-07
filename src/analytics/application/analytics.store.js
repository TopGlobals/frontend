import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { Kpi } from '../domain/model/kpi.entity.js';
import { RecentAlert } from '../domain/model/recent-alert.entity.js';
import { RecentLaboratory } from '../domain/model/recent-laboratory.entity.js';
import { AnalyticsApi } from '../infrastructure/analytics-api.js';
import { HistoricalDataAssembler } from '../infrastructure/historical-data.assembler.js';

const analyticsApi = new AnalyticsApi();

const dashboardKpis = new Kpi({
  totalLaboratories: 24,
  activeAlerts: 3,
  systemsHealth: 98.2,
  upcomingMaintenance: 5,
});

const dashboardAlerts = [
  new RecentAlert({
    id: 1,
    severity: 'CRITICAL',
    time: '10 mins ago',
    title: 'Lab 01: High CO2 Level',
    description: 'Levels exceeded 1000ppm threshold in sector B.',
  }),
  new RecentAlert({
    id: 2,
    severity: 'WARNING',
    time: '45 mins ago',
    title: 'Lab 04: Temperature Fluctuation',
    description: 'Temp dropped 1.5°C below target range.',
  }),
  new RecentAlert({
    id: 3,
    severity: 'RESOLVED',
    time: '2 hours ago',
    title: 'Lab 07: Door Sensor Offline',
    description: 'Sensor reconnected automatically.',
  }),
];

const dashboardLaboratories = [
  new RecentLaboratory({
    id: 1,
    name: 'Lab 01',
    status: 'ALERT',
    type: 'Chemical Synthesis',
    temperature: 22.1,
  }),
  new RecentLaboratory({
    id: 2,
    name: 'Lab 02',
    status: 'NORMAL',
    type: 'Chemical Synthesis',
    temperature: 21.5,
  }),
  new RecentLaboratory({
    id: 3,
    name: 'Lab 03',
    status: 'NORMAL',
    type: 'Clean Room',
    temperature: 18.2,
  }),
  new RecentLaboratory({
    id: 4,
    name: 'Lab 04',
    status: 'WARNING',
    type: 'Biohazard Level 3',
    temperature: 12.6,
  }),
  new RecentLaboratory({
    id: 5,
    name: 'Lab 05',
    status: 'NORMAL',
    type: 'Cold Storage',
    temperature: 2.2,
  }),
];

function createChartData(historicalReadings = []) {
  return {
    labels: historicalReadings.map((reading) =>
      reading.timestamp.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
      })
    ),
    datasets: [
      {
        label: 'Temperature',
        data: historicalReadings.map((reading) => reading.value),
        borderColor: '#08b88c',
        backgroundColor: 'rgba(8, 184, 140, 0.12)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: true,
      },
    ],
  };
}

const useAnalyticsStore = defineStore('analytics', () => {
  const kpis = ref(dashboardKpis);
  const recentAlerts = ref([...dashboardAlerts]);
  const laboratories = ref([...dashboardLaboratories]);
  const historicalData = ref([]);
  const chartData = ref(createChartData());
  const chartTimeRange = ref('7d');
  const isLoading = ref(false);
  const error = ref(null);
  const readingsLoaded = ref(false);

  const systemsHealthFormatted = computed(() => `${kpis.value.systemsHealth}%`);
  const hasAlerts = computed(() => recentAlerts.value.length > 0);
  const hasLaboratories = computed(() => laboratories.value.length > 0);

  function updateChartData() {
    const rangeHours = { '24h': 24, '7d': 168, '30d': 720 };
    const readings = historicalData.value;
    const latestTimestamp = readings.at(-1)?.timestamp?.getTime();
    const cutoff = latestTimestamp - rangeHours[chartTimeRange.value] * 60 * 60 * 1000;
    const filteredReadings = readings.filter((reading) => reading.timestamp.getTime() >= cutoff);
    chartData.value = createChartData(filteredReadings);
  }

  async function fetchDashboardData() {
    isLoading.value = true;
    error.value = null;
    try {
      // Dashboard widgets are intentionally static until their APIs are available.
      kpis.value = new Kpi({ ...dashboardKpis });
      recentAlerts.value = [...dashboardAlerts];
      laboratories.value = [...dashboardLaboratories];
      await fetchReadings();
      updateChartData();
    } catch (err) {
      error.value = err;
      console.error('Failed to fetch historical data:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchReadings() {
    const response = await analyticsApi.getRecentData();
    historicalData.value = HistoricalDataAssembler.toEntitiesFromResponse(response);
    readingsLoaded.value = true;
    updateChartData();
  }

  async function createReading(reading) {
    await analyticsApi.createData(reading);
    await fetchReadings();
  }

  async function updateReading(reading) {
    await analyticsApi.updateData(reading);
    await fetchReadings();
  }

  async function deleteReading(id) {
    await analyticsApi.deleteData(id);
    await fetchReadings();
  }

  function fetchChartData(range = chartTimeRange.value) {
    chartTimeRange.value = range;
    updateChartData();
  }

  function reset() {
    kpis.value = new Kpi({ ...dashboardKpis });
    recentAlerts.value = [...dashboardAlerts];
    laboratories.value = [...dashboardLaboratories];
    historicalData.value = [];
    chartData.value = createChartData([]);
    chartTimeRange.value = '7d';
    error.value = null;
    readingsLoaded.value = false;
    isLoading.value = false;
  }

  return {
    kpis,
    recentAlerts,
    laboratories,
    historicalData,
    chartData,
    chartTimeRange,
    isLoading,
    error,
    systemsHealthFormatted,
    hasAlerts,
    hasLaboratories,
    fetchDashboardData,
    fetchChartData,
    fetchReadings,
    createReading,
    updateReading,
    deleteReading,
    readingsLoaded,
    reset,
  };
});

export default useAnalyticsStore;
