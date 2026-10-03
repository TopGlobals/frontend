<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LanguageSwitcher from './language-switcher.vue';
import { useI18n } from 'vue-i18n';

/*
// IAM and Profile Stores - Commented out until implementation
import { useProfileStore } from "../../../profiles/application/profile.store.js";
import { useIamStore } from "../../../iam/application/iam.store.js";

const profileStore = useProfileStore();
const iamStore = useIamStore();
const currentUser = computed(() => iamStore.currentUser);
*/

const { t } = useI18n();
const route = useRoute();

// Mapped directly to the provided router.js paths
const mainMenuItems = [
  { label: 'layout.menu.items.analytics', to: '/analytics', icon: 'pi pi-th-large' },
  { label: 'layout.menu.items.laboratories', to: '/laboratories', icon: 'pi pi-desktop' },
  { label: 'layout.menu.items.history', to: '/history', icon: 'pi pi-history' },
  { label: 'layout.menu.items.alerts', to: '/alerts', icon: 'pi pi-bell' },
  { label: 'layout.menu.items.reports', to: '/reports', icon: 'pi pi-chart-line' },
];

const systemMenuItems = [
  { label: 'layout.menu.items.profiles', to: '/profiles', icon: 'pi pi-cog' },
];

// Dynamically extracts the title from the current route
const pageTitle = computed(() => {
  const routeName = String(route.name).toLowerCase();
  return t(`layout.menu.items.${routeName}`);
});

const handleLogout = () => {
  /*
	// Execute IAM sign out when implemented
	iamStore.signOut();
	*/
};
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar-container">
      <div class="sidebar-top">
        <div class="brand-wrapper">
          <div class="brand-logo-placeholder">
            <i class="pi pi-box brand-icon" />
          </div>
          <div class="brand-text">
            {{ t('layout.brand.name') }}<br /><span class="brand-subtext">{{
              t('layout.brand.subtext')
            }}</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <p class="nav-section-title">{{ t('layout.menu.sections.main') }}</p>
          <ul class="nav-list">
            <li v-for="item in mainMenuItems" :key="item.to">
              <router-link :to="item.to" class="nav-item" active-class="nav-item-active">
                <div class="nav-item-content">
                  <i :class="item.icon" class="nav-icon"></i>
                  <span>{{ t(item.label) }}</span>
                </div>
              </router-link>
            </li>
          </ul>

          <p class="nav-section-title system-title">{{ t('layout.menu.sections.system') }}</p>
          <ul class="nav-list">
            <li v-for="item in systemMenuItems" :key="item.to">
              <router-link :to="item.to" class="nav-item" active-class="nav-item-active">
                <div class="nav-item-content">
                  <i :class="item.icon" class="nav-icon"></i>
                  <span>{{ t(item.label) }}</span>
                </div>
              </router-link>
            </li>
          </ul>
        </nav>
      </div>

      <div class="sidebar-bottom">
        <!-- Hardcoded User Profile for layout testing -->
        <div class="user-profile">
          <div class="user-info">
            <img
              src="https://via.placeholder.com/40x40/10B981/FFFFFF?text=AV"
              alt="Dr. Alex Vance"
              class="user-avatar"
            />
            <div class="user-details">
              <span class="user-name">Dr. Alex Vance</span>
              <span class="user-role">{{ t('layout.profile.role') }}</span>
            </div>
          </div>
          <pv-button
            icon="pi pi-sign-out"
            class="logout-btn"
            text
            rounded
            @click="handleLogout"
            aria-label="Logout"
          />
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="main-wrapper">
      <header class="top-bar">
        <div class="header-titles">
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>

        <div class="header-actions">
          <LanguageSwitcher />
        </div>
      </header>

      <main class="content-area">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* App Layout Container */
.app-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: #f9fafb;
  font-family: var(
    --font-family,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Helvetica,
    Arial,
    sans-serif
  );
}

/* Sidebar Structural Styles */
.sidebar-container {
  width: 280px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #ffffff;
  border-right: 1px solid #e5e7eb;
}

.sidebar-top {
  display: flex;
  flex-direction: column;
}

.brand-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
}

.brand-logo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: #10b981;
  border-radius: 6px;
  color: white;
}

.brand-icon {
  font-size: 1.2rem;
}

.brand-text {
  font-weight: 700;
  font-size: 1.125rem;
  line-height: 1.2;
  color: #111827;
}

.brand-subtext {
  font-size: 0.65rem;
  color: #10b981;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Navigation Styles */
.sidebar-nav {
  padding: 0 1rem;
}

.nav-section-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  margin-top: 1rem;
  padding-left: 0.75rem;
}

.system-title {
  margin-top: 1.5rem;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-radius: 0.5rem;
  text-decoration: none;
  color: #4b5563;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background-color: #ecfdf5;
  color: #059669;
}

.nav-item-active {
  background-color: #ecfdf5;
  color: #059669;
  font-weight: 600;
}

.nav-item-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-icon {
  font-size: 1.125rem;
}

.nav-badge {
  background-color: #fee2e2;
  color: #dc2626;
  border-radius: 9999px;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
}

/* Bottom Sidebar Styles */
.sidebar-bottom {
  padding: 1rem;
}

.support-card {
  background-color: #059669;
  color: #ffffff;
  padding: 1rem;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.support-title {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 700;
}

.support-desc {
  margin: 0 0 1rem 0;
  font-size: 0.75rem;
  opacity: 0.9;
  line-height: 1.4;
}

.support-btn {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
  border: none !important;
  padding: 0.5rem !important;
  font-size: 0.875rem !important;
  transition: background-color 0.2s !important;
}

.support-btn:hover {
  background-color: rgba(255, 255, 255, 0.3) !important;
}

.user-profile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
}

.user-profile:hover {
  background-color: #f3f4f6;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: #111827;
}

.user-role {
  font-size: 0.75rem;
  color: #6b7280;
}

.logout-btn {
  color: #ef4444 !important;
}

.logout-btn:hover {
  background-color: #fee2e2 !important;
}

/* Main Content Wrapper */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Top Bar Styles */
.top-bar {
  height: 80px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.page-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Content Area */
.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

/* Router Transitions */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
