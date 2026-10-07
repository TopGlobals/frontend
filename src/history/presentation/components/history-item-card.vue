<template>
  <div class="event-card" :class="[event.severity.toLowerCase(), { 'active-card': isActive }]">
    <div class="card-side-indicator"></div>
    <div class="card-content">
      <div class="card-main-info">
        <div class="title-row">
          <span class="event-title">{{ $t(event.titleKey) }}</span>
          <span class="badge" :class="event.type.toLowerCase().replace(' ', '-')">{{
            typeLabel(event.type)
          }}</span>
        </div>
        <div class="location-row">
          <span class="location-text">
            <i class="pi pi-map-marker icon-spacing"></i>{{ event.location }}
          </span>
        </div>
        <p class="event-message" v-if="event.messageKey">{{ $t(event.messageKey) }}</p>
      </div>
      <div class="card-meta">
        <span class="event-time">{{ formattedTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  event: { type: Object, required: true },
  isActive: { type: Boolean, default: false },
});

const { t, locale } = useI18n();

const typeKeys = {
  Resolved: 'history.types.resolved',
  Alert: 'history.types.alert',
  Automation: 'history.types.automation',
  'User Action': 'history.types.userAction',
};

const typeLabel = (type) => (typeKeys[type] ? t(typeKeys[type]) : type);

const formattedTime = computed(() => {
  return props.event.timestamp.toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit' });
});
</script>

<style scoped>
.event-card {
  display: flex;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}
.event-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.active-card {
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}
.card-side-indicator {
  width: 4px;
  background-color: #cbd5e1;
}
.critical .card-side-indicator {
  background-color: #ef4444;
}
.warning .card-side-indicator {
  background-color: #f59e0b;
}
.success .card-side-indicator {
  background-color: #10b981;
}
.info .card-side-indicator {
  background-color: #3b82f6;
}

.card-content {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  width: 100%;
}
.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.event-title {
  font-weight: 600;
  color: #111827;
}
.badge {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 9999px;
  font-weight: 500;
}
.badge.alert {
  background: #fee2e2;
  color: #ef4444;
}
.badge.automation {
  background: #f3e8ff;
  color: #8b5cf6;
}
.badge.resolved {
  background: #d1fae5;
  color: #10b981;
}
.badge.user-action {
  background: #e0f2fe;
  color: #0284c7;
}
.location-row {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}
.icon-spacing {
  margin-right: 4px;
  color: #9ca3af;
  font-size: 0.85rem;
}
.event-message {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0;
}
.event-time {
  font-size: 0.85rem;
  color: #9ca3af;
}
</style>
