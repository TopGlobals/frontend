import HistoryView from './views/history-view.vue';
export const historyRoutes = [
  {
    path: '/history',
    name: 'history-view',
    component: HistoryView,
    meta: {
      titleKey: 'history.title',
      subtitleKey: 'history.subtitle',
    },
  },
];
