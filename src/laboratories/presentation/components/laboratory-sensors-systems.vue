<script setup>
import { useI18n } from 'vue-i18n';
import LaboratoryFormSection from './laboratory-form-section.vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();

const sensors = [
  { key: 'temperature', icon: 'pi pi-gauge' },
  { key: 'airQuality', icon: 'pi pi-wifi' },
  { key: 'aiDetection', icon: 'pi pi-microchip-ai' },
  { key: 'airConditioning', icon: 'pi pi-sun' },
];

const sensorName = (sensor) => t(`laboratories.create.sensors.${sensor.key}`);
const sensorDescription = (sensor) => t(`laboratories.create.sensors.${sensor.key}Description`);

function setSensorState(key, enabled) {
  emit('update:modelValue', { ...props.modelValue, [key]: enabled });
}
</script>

<template>
  <LaboratoryFormSection
    :title="t('laboratories.create.sensorsTitle')"
    :description="t('laboratories.create.sensorsDescription')"
  >
    <div class="sensor-grid">
      <article
        v-for="sensor in sensors"
        :key="sensor.key"
        class="sensor-card"
        :class="{ 'sensor-card-active': modelValue[sensor.key] }"
      >
        <div class="sensor-card-top">
          <span
            class="icon-tile"
            :class="{ 'icon-tile-active': modelValue[sensor.key] }"
          >
            <i
              :class="sensor.icon"
              aria-hidden="true"
            />
          </span>
          <label
            class="switch"
            :aria-label="t('laboratories.create.enableSensor', { name: sensorName(sensor) })"
          >
            <input
              type="checkbox"
              :checked="modelValue[sensor.key]"
              @change="setSensorState(sensor.key, $event.target.checked)"
            >
            <span />
          </label>
        </div>
        <h3>{{ sensorName(sensor) }}</h3>
        <p>{{ sensorDescription(sensor) }}</p>
        <span
          class="status-pill"
          :class="{ 'status-pill-active': modelValue[sensor.key] }"
        >
          {{ modelValue[sensor.key] ? t('laboratories.create.active') : t('laboratories.create.inactive') }}
        </span>
      </article>
    </div>
  </LaboratoryFormSection>
</template>

<style scoped>
.sensor-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.sensor-card {
  min-height: 181px;
  padding: 16px;
  border: 1px solid #dfe7f0;
  border-radius: 16px;
}

.sensor-card-active {
  background: #fbfffd;
  border-color: #8aefc4;
}

.sensor-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.icon-tile {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  place-items: center;
  color: #6d809c;
  background: #f0f4f8;
  border-radius: 12px;
}

.icon-tile-active {
  color: #fff;
  background: #079d75;
}

.switch {
  position: relative;
  display: inline-flex;
  width: 44px;
  height: 24px;
}

.switch input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.switch span {
  width: 44px;
  height: 24px;
  background: #e1e7ef;
  border-radius: 999px;
  cursor: pointer;
}

.switch span::after {
  display: block;
  width: 20px;
  height: 20px;
  margin: 2px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 1px 2px #1b2c451f;
  content: '';
  transition: transform 0.15s ease;
}

.switch input:checked + span {
  background: #079d75;
}

.switch input:checked + span::after {
  transform: translateX(20px);
}

.switch input:focus-visible + span {
  outline: 3px solid #079d7540;
  outline-offset: 2px;
}

.sensor-card h3 {
  margin: 0;
  font-size: 14px;
}

.sensor-card > p {
  min-height: 36px;
  margin: 5px 0 12px;
  color: #6d809b;
  font-size: 12px;
  line-height: 1.4;
}

.status-pill {
  display: inline-flex;
  padding: 5px 11px;
  color: #627590;
  background: #f0f4f8;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.status-pill-active {
  color: #00805f;
  background: #d0f8e7;
}

@media (max-width: 1180px) {
  .sensor-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 580px) {
  .sensor-grid {
    grid-template-columns: 1fr;
  }
}
</style>
