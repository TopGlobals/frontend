const analyticsRoutes = [
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('./views/dashboard.vue'),
    meta: {
      titleKey: 'analytics.dashboard.title',
      subtitleKey: 'analytics.dashboard.subtitle',
    },
  },
  {
    path: '/analytics/reads',
    name: 'AnalyticsReads',
    component: () => import('./views/reads.vue'),
    meta: {
      titleKey: 'analytics.readings.title',
      subtitleKey: 'analytics.readings.subtitle',
    },
  },
];

export default analyticsRoutes;
