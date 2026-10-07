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
  {
    path: '/laboratories/:id/edit',
    name: 'LaboratoryEdit',
    component: () => import('./views/laboratory-create.vue'),
    meta: {
      titleKey: 'laboratories.create.editTitle',
      subtitleKey: 'laboratories.create.editSubtitle',
    },
  },
];

export default laboratoriesRoutes;
