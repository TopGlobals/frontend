import { defineStore } from 'pinia';
import { HistoryApi } from '../infrastructure/history-api.js';

export const useHistoryStore = defineStore('history', {
  state: () => ({
    events: [],
    selectedEvent: null,
    loading: false,
    filters: {
      search: '',
      severity: '',
    },
  }),
  actions: {
    async fetchEvents() {
      this.loading = true;
      try {
        const data = await HistoryApi.getEvents();
        this.events = data;
        if (data.length > 0) {
          this.selectedEvent = data[1];
        }
      } catch (error) {
        console.error('Error fetching history events:', error);
      } finally {
        this.loading = false;
      }
    },
    selectEvent(event) {
      this.selectedEvent = event;
    },
    updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters };
    },
  },
});
