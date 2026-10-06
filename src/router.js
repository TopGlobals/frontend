import { createRouter, createWebHistory } from 'vue-router';
import alertsRoutes from './alerts/presentation/alerts-routes.js';
import analyticsRoutes from './analytics/presentation/analytics-routes.js';
import { historyRoutes } from './history/presentation/history-routes.js';
import laboratoriesRoutes from './laboratories/presentation/laboratories-routes.js';
import profilesRoutes from './profiles/presentation/profiles-routes.js';
import reportsRoutes from './reports/presentation/reports-routes.js';
import settingsRoutes from './settings/presentation/settings-routes.js';

/*
import iamRoutes from "./iam/presentation/iam-routes.js";
import {authenticationGuard} from "./iam/infrastructure/authentication.guard.js";
*/
const pageNotFound = () => import('./shared/presentation/views/page-not-found.vue');

const routes = [
  { path: '/alerts', name: 'alerts', children: alertsRoutes },
  { path: '/analytics', name: 'analytics', children: analyticsRoutes },
  { path: '/history', name: 'history', children: historyRoutes },
  { path: '/laboratories', name: 'laboratories', children: laboratoriesRoutes },
  { path: '/profiles', name: 'profiles', children: profilesRoutes },
  { path: '/reports', name: 'reports', children: reportsRoutes },
  { path: '/settings', name: 'settings', children: settingsRoutes },
  /*{ path: '/iam',             name: 'iam',        children: iamRoutes },*/
  { path: '/', redirect: '/analytics' },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: pageNotFound,
    meta: { title: 'Page Not Found' },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

router.beforeEach((to, from) => {
  console.log(`Navigating from ${from.name} to ${to.name}`);
  let baseTitle = 'CryoVigil';
  document.title = `${baseTitle} - ${to.meta['title']}`;

  return true;
});

export default router;
