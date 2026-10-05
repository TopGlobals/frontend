const laboratoriesRoutes = [
  {
    path: '/laboratories',
    name: 'LaboratoriesPanel',
    component: () => import('./views/laboratories.vue'),
    meta: {
      titleKey: 'laboratories.panel.title',
      subtitleKey: 'laboratories.panel.subtitle',
    },
  },
  {
    path: '/laboratories/new',
    name: 'LaboratoryCreate',
    component: () => import('./views/laboratory-create.vue'),
    meta: {
      titleKey: 'laboratories.create.title',
      subtitleKey: 'laboratories.create.subtitle',
    },
  },
];

export default laboratoriesRoutes;
