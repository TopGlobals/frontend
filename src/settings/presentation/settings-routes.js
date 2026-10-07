const settingsRoutes = [
  {
    path: '',
    name: 'Settings',
    component: () => import('./views/settings-home.vue'),
    meta: {
      titleKey: 'settings.title',
      subtitleKey: 'settings.subtitle',
    },
  },
  {
    path: 'sensors',
    name: 'SensorConfiguration',
    component: () => import('./views/sensor-configuration.vue'),
    meta: {
      titleKey: 'settings.title',
      subtitleKey: 'settings.subtitle',
    },
  },
  {
    path: 'notifications',
    name: 'AlertNotificationSettings',
    component: () => import('./views/alerts-notifications.vue'),
    meta: {
      titleKey: 'settings.title',
      subtitleKey: 'settings.subtitle',
    },
  },
  {
    path: 'security',
    name: 'SecurityAccessSettings',
    component: () => import('./views/security-access.vue'),
    meta: {
      titleKey: 'settings.title',
      subtitleKey: 'settings.subtitle',
    },
  },
];

export default settingsRoutes;
