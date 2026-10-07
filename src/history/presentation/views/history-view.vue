<template>
  <div class="history-context-container">
    <div class="main-content-layout">
      <div class="page-title-section">
        <h1>{{ $t('history.title') }}</h1>
        <p>{{ $t('history.subtitle') }}</p>
      </div>
      <HistoryKpiSummary />

      <HistoryFilterBar @filter-change="handleFilterChange" />

      <div v-if="store.loading && filteredEvents.length === 0" class="loading-state">
        {{ $t('history.loading') }}
      </div>

      <HistoryList
        v-else
        :events="filteredEvents"
        :selected-event-id="store.selectedEvent?.id"
        @select-event="store.selectEvent"
      />
    </div>

    <HistoryDetailsPanel
      v-if="store.selectedEvent"
      :event="store.selectedEvent"
      @close="store.selectEvent(null)"
    />
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHistoryStore } from '../../application/history-store.js';
import HistoryKpiSummary from '../components/history-kpi-summary.vue';
import HistoryFilterBar from '../components/history-filter-bar.vue';
import HistoryList from '../components/history-list.vue';
import HistoryDetailsPanel from '../components/history-details-panel.vue';

const store = useHistoryStore();
const { t } = useI18n();

onMounted(() => {
  store.fetchEvents();
});

const handleFilterChange = (newFilters) => {
  store.updateFilters(newFilters);
};

const filteredEvents = computed(() => {
  return store.events.filter((event) => {
    const translatedTitle = event.titleKey ? t(event.titleKey).toLowerCase() : '';
    const translatedMessage = event.messageKey ? t(event.messageKey).toLowerCase() : '';
    const searchString = store.filters.search ? store.filters.search.toLowerCase() : '';

    const matchesSearch =
      translatedTitle.includes(searchString) || translatedMessage.includes(searchString);

    const matchesSeverity =
      store.filters.severity === '' ||
      (event.severity && event.severity.toLowerCase() === store.filters.severity.toLowerCase());

    return matchesSearch && matchesSeverity;
  });
});
</script>

<style scoped>
.history-context-container {
  display: flex;
  height: 100vh;
  background-color: #f9fafb;
}
.main-content-layout {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
.page-title-section h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #111827;
}
.page-title-section p {
  margin: 0 0 24px 0;
  color: #6b7280;
}
.loading-state {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}
</style>
