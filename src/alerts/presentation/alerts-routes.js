const alertsRoutes = [
  {
    path: '/alerts',
    name: 'Alerts',
    component: () => import('./views/alerts.vue'),
    meta: {
      title: 'Alerts & Notifications',
      titleKey: 'alerts.page.title',
      subtitleKey: 'alerts.page.subtitle',
    },
  },
];

export default alertsRoutes;
