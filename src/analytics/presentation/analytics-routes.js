const analyticsRoutes = [
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('./views/dashboard.vue'),
  },
  {
    path: '/analytics/reads',
    name: 'AnalyticsReads',
    component: () => import('./views/reads.vue'),
  },
];

export default analyticsRoutes;
