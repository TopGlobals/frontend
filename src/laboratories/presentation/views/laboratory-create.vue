<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useLaboratoriesStore from '../../application/laboratories.store.js';

const { t } = useI18n();
const router = useRouter();
const laboratoriesStore = useLaboratoriesStore();
const sensors = [
  {
    key: 'temperature',
    icon: 'pi pi-thermometer',
    enabled: true,
  },
  {
    key: 'airQuality',
    icon: 'pi pi-wifi',
    enabled: true,
  },
  {
    key: 'aiDetection',
    icon: 'pi pi-microchip-ai',
    enabled: true,
  },
  {
    key: 'ventilation',
    icon: 'pi pi-sitemap',
    enabled: false,
  },
  {
    key: 'airConditioning',
    icon: 'pi pi-sun',
    enabled: false,
  },
  {
    key: 'vibration',
    icon: 'pi pi-wave-pulse',
    enabled: false,
  },
  {
    key: 'lighting',
    icon: 'pi pi-lightbulb',
    enabled: false,
  },
];

const form = reactive({
  name: '',
  code: '',
  building: '',
  floor: '',
  room: '',
  type: '',
  description: '',
  temperatureMin: 15,
  temperatureMax: 30,
  co2Max: 1000,
  gasSensitivity: 'lowGeneral',
  vibrationMax: 5,
  escalation: 'stopActivity',
});

const sensorStates = reactive(Object.fromEntries(sensors.map(({ key, enabled }) => [key, enabled])));
const notifications = reactive({ email: true, sms: true, push: false, criticalOnly: true });
const saved = ref(false);

const sensorName = (sensor) => t(`laboratories.create.sensors.${sensor.key}`);
const sensorDescription = (sensor) => t(`laboratories.create.sensors.${sensor.key}Description`);

async function saveLaboratory() {
  laboratoriesStore.addLaboratory({
    name: form.name.trim(),
    code: form.code.trim(),
    building: form.building,
    floor: form.floor,
    room: form.room.trim(),
    type: form.type,
    description: form.description.trim(),
    temperatureMin: form.temperatureMin,
    temperatureMax: form.temperatureMax,
    co2Max: form.co2Max,
    gasSensitivity: form.gasSensitivity,
    vibrationMax: form.vibrationMax,
    escalation: form.escalation,
    sensors: { ...sensorStates },
    notifications: { ...notifications },
  });
  await router.push('/laboratories');
}
</script>

<template>
  <form
    class="laboratory-form"
    @submit.prevent="saveLaboratory"
    @input="saved = false"
  >
    <div class="form-toolbar">
      <nav
        class="breadcrumb"
        aria-label="Breadcrumb"
      >
        <router-link to="/laboratories">
          {{ t('laboratories.create.breadcrumb') }}
        </router-link>
        <i
          class="pi pi-angle-right"
          aria-hidden="true"
        />
        <span>{{ t('laboratories.create.breadcrumbCurrent') }}</span>
      </nav>
      <div class="toolbar-actions">
        <button
          class="button button-secondary"
          type="button"
          @click="$router.push('/laboratories')"
        >
          <i
            class="pi pi-times"
            aria-hidden="true"
          />
          {{ t('laboratories.create.cancel') }}
        </button>
        <button
          class="button button-primary"
          type="submit"
        >
          <i
            class="pi pi-save"
            aria-hidden="true"
          />
          {{ t('laboratories.create.save') }}
        </button>
      </div>
    </div>

    <p
      v-if="saved"
      class="success-message"
      role="status"
    >
      {{ t('laboratories.create.saveSuccess') }}
    </p>

    <section class="panel">
      <header class="section-heading">
        <h2>{{ t('laboratories.create.basicTitle') }}</h2>
        <p>{{ t('laboratories.create.basicDescription') }}</p>
      </header>
      <div class="field-grid">
        <label class="field">
          <span>{{ t('laboratories.create.laboratoryName') }} <b>*</b></span>
          <input
            v-model="form.name"
            required
            :placeholder="t('laboratories.create.namePlaceholder')"
          >
        </label>
        <label class="field">
          <span>{{ t('laboratories.create.labCode') }} <b>*</b></span>
          <input
            v-model="form.code"
            required
            :placeholder="t('laboratories.create.codePlaceholder')"
          >
        </label>
        <label class="field">
          <span>{{ t('laboratories.create.building') }}</span>
          <select v-model="form.building">
            <option value="">{{ t('laboratories.create.selectBuilding') }}</option>
            <option value="research">{{ t('laboratories.create.researchBuilding') }}</option>
            <option value="clinical">{{ t('laboratories.create.clinicalSciences') }}</option>
            <option value="north">{{ t('laboratories.create.northCampus') }}</option>
          </select>
        </label>
        <label class="field">
          <span>{{ t('laboratories.create.floor') }}</span>
          <select v-model="form.floor">
            <option value="">{{ t('laboratories.create.selectFloor') }}</option>
            <option value="ground">{{ t('laboratories.create.groundFloor') }}</option>
            <option value="1">{{ t('laboratories.create.firstFloor') }}</option>
            <option value="2">{{ t('laboratories.create.secondFloor') }}</option>
            <option value="3">{{ t('laboratories.create.thirdFloor') }}</option>
          </select>
        </label>
        <label class="field">
          <span>{{ t('laboratories.create.room') }}</span>
          <input
            v-model="form.room"
            :placeholder="t('laboratories.create.roomPlaceholder')"
          >
        </label>
        <label class="field">
          <span>{{ t('laboratories.create.type') }} <b>*</b></span>
          <select
            v-model="form.type"
            required
          >
            <option value="">{{ t('laboratories.create.selectType') }}</option>
            <option value="bioSafety">{{ t('laboratories.create.bioSafety') }}</option>
            <option value="chemistry">{{ t('laboratories.create.chemistry') }}</option>
            <option value="clinical">{{ t('laboratories.create.clinical') }}</option>
            <option value="research">{{ t('laboratories.create.research') }}</option>
          </select>
        </label>
        <label class="field field-full">
          <span>{{ t('laboratories.create.description') }}</span>
          <textarea
            v-model="form.description"
            rows="3"
            :placeholder="t('laboratories.create.descriptionPlaceholder')"
          />
        </label>
      </div>
    </section>

    <section class="panel">
      <header class="section-heading">
        <h2>{{ t('laboratories.create.sensorsTitle') }}</h2>
        <p>{{ t('laboratories.create.sensorsDescription') }}</p>
      </header>
      <div class="sensor-grid">
        <article
          v-for="sensor in sensors"
          :key="sensor.key"
          class="sensor-card"
          :class="{ 'sensor-card-active': sensorStates[sensor.key] }"
        >
          <div class="sensor-card-top">
            <span
              class="icon-tile"
              :class="{ 'icon-tile-active': sensorStates[sensor.key] }"
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
                v-model="sensorStates[sensor.key]"
                type="checkbox"
              >
              <span />
            </label>
          </div>
          <h3>{{ sensorName(sensor) }}</h3>
          <p>{{ sensorDescription(sensor) }}</p>
          <span
            class="status-pill"
            :class="{ 'status-pill-active': sensorStates[sensor.key] }"
          >
            {{ sensorStates[sensor.key] ? t('laboratories.create.active') : t('laboratories.create.inactive') }}
          </span>
        </article>
      </div>
    </section>

    <section class="panel">
      <header class="section-heading section-heading-icon">
        <span class="section-icon section-icon-warning"><i
          class="pi pi-shield"
          aria-hidden="true"
        /></span>
        <div>
          <h2>{{ t('laboratories.create.thresholdsTitle') }}</h2>
          <p>{{ t('laboratories.create.thresholdsDescription') }}</p>
        </div>
      </header>
      <div class="threshold-grid">
        <article class="threshold-card threshold-temperature">
          <header class="threshold-title">
            <span class="threshold-icon"><i
              class="pi pi-thermometer"
              aria-hidden="true"
            /></span>
            <div>
              <h3>{{ t('laboratories.create.temperature') }}</h3>
              <p>{{ t('laboratories.create.celsius') }}</p>
            </div>
          </header>
          <label class="field">
            <span>{{ t('laboratories.create.minimum') }}</span>
            <span class="input-unit"><input
              v-model.number="form.temperatureMin"
              type="number"
            ><small>°C</small></span>
          </label>
          <label class="field">
            <span>{{ t('laboratories.create.maximum') }}</span>
            <span class="input-unit"><input
              v-model.number="form.temperatureMax"
              type="number"
            ><small>°C</small></span>
          </label>
          <p class="threshold-note">
            <i
              class="pi pi-exclamation-circle"
              aria-hidden="true"
            />
            {{ t('laboratories.create.outsideRange') }}
          </p>
        </article>

        <article class="threshold-card threshold-air">
          <header class="threshold-title">
            <span class="threshold-icon"><i
              class="pi pi-wifi"
              aria-hidden="true"
            /></span>
            <div>
              <h3>{{ t('laboratories.create.airQualityTitle') }}</h3>
              <p>{{ t('laboratories.create.gasLevels') }}</p>
            </div>
          </header>
          <label class="field">
            <span>{{ t('laboratories.create.maxCo2') }}</span>
            <span class="input-unit"><input
              v-model.number="form.co2Max"
              type="number"
            ><small>ppm</small></span>
          </label>
          <label class="field">
            <span>{{ t('laboratories.create.gasSensitivity') }}</span>
            <select v-model="form.gasSensitivity">
              <option value="lowGeneral">{{ t('laboratories.create.lowGeneral') }}</option>
              <option value="mediumEnhanced">{{ t('laboratories.create.mediumEnhanced') }}</option>
              <option value="highHazardous">{{ t('laboratories.create.highHazardous') }}</option>
            </select>
          </label>
          <p class="threshold-note">
            <i
              class="pi pi-info-circle"
              aria-hidden="true"
            />
            {{ t('laboratories.create.exceeded') }}
          </p>
        </article>

        <article class="threshold-card threshold-vibration">
          <header class="threshold-title">
            <span class="threshold-icon"><i
              class="pi pi-wave-pulse"
              aria-hidden="true"
            /></span>
            <div>
              <h3>{{ t('laboratories.create.vibrations') }}</h3>
              <p>{{ t('laboratories.create.mechanicalSeismic') }}</p>
            </div>
          </header>
          <label class="field">
            <span>{{ t('laboratories.create.maxLevel') }}</span>
            <span class="input-unit"><input
              v-model.number="form.vibrationMax"
              type="number"
              step="0.1"
            ><small>mm/s</small></span>
          </label>
          <label class="field">
            <span>{{ t('laboratories.create.escalation') }}</span>
            <select v-model="form.escalation">
              <option value="stopActivity">{{ t('laboratories.create.stopActivity') }}</option>
              <option value="notifySupervisor">{{ t('laboratories.create.notifySupervisor') }}</option>
              <option value="logReview">{{ t('laboratories.create.logReview') }}</option>
            </select>
          </label>
          <p class="threshold-note">
            <i
              class="pi pi-info-circle"
              aria-hidden="true"
            />
            {{ t('laboratories.create.exceeded') }}
          </p>
        </article>
      </div>
    </section>

    <section class="panel">
      <header class="section-heading section-heading-icon">
        <span class="section-icon section-icon-notification"><i
          class="pi pi-bell"
          aria-hidden="true"
        /></span>
        <div>
          <h2>{{ t('laboratories.create.notificationsTitle') }}</h2>
          <p>{{ t('laboratories.create.notificationsDescription') }}</p>
        </div>
      </header>
      <div class="notification-grid">
        <label class="notification-card">
          <input
            v-model="notifications.email"
            type="checkbox"
          >
          <span class="notification-icon icon-blue"><i
            class="pi pi-envelope"
            aria-hidden="true"
          /></span>
          <span>
            <strong>{{ t('laboratories.create.email') }}</strong>
            <small>{{ t('laboratories.create.emailDescription') }}</small>
          </span>
        </label>
        <label class="notification-card">
          <input
            v-model="notifications.sms"
            type="checkbox"
          >
          <span class="notification-icon icon-green"><i
            class="pi pi-comment"
            aria-hidden="true"
          /></span>
          <span>
            <strong>{{ t('laboratories.create.sms') }}</strong>
            <small>{{ t('laboratories.create.smsDescription') }}</small>
          </span>
        </label>
        <label class="notification-card">
          <input
            v-model="notifications.push"
            type="checkbox"
          >
          <span class="notification-icon icon-orange"><i
            class="pi pi-bell"
            aria-hidden="true"
          /></span>
          <span>
            <strong>{{ t('laboratories.create.push') }}</strong>
            <small>{{ t('laboratories.create.pushDescription') }}</small>
          </span>
        </label>
        <label class="notification-card critical-option">
          <input
            v-model="notifications.criticalOnly"
            type="checkbox"
          >
          <span class="notification-icon icon-warning"><i
            class="pi pi-exclamation-triangle"
            aria-hidden="true"
          /></span>
          <span>
            <strong>{{ t('laboratories.create.criticalOnly') }}</strong>
            <small>{{ t('laboratories.create.criticalOnlyDescription') }}</small>
          </span>
        </label>
      </div>
    </section>
  </form>
</template>

<style scoped>
.laboratory-form {
  display: grid;
  gap: 24px;
  max-width: 1440px;
  margin: 0 auto;
  color: #121d33;
}

.form-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 38px;
}

.breadcrumb,
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.breadcrumb {
  color: #15213a;
  font-weight: 600;
}

.breadcrumb a {
  color: #60748f;
  font-weight: 400;
  text-decoration: none;
}

.breadcrumb > i {
  color: #91a2ba;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 38px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 12px;
  font: inherit;
  font-weight: 600;
}

.button-secondary {
  color: #354762;
  background: #fff;
  border-color: #dce4ef;
}

.button-primary {
  color: #fff;
  background: #079d75;
}

.button-primary:hover {
  background: #078665;
}

.success-message {
  margin: -8px 0;
  padding: 10px 14px;
  color: #067451;
  background: #eafbf4;
  border: 1px solid #b6efd8;
  border-radius: 10px;
}

.panel {
  padding: 24px;
  background: #fff;
  border: 1px solid #e2e9f2;
  border-radius: 17px;
}

.section-heading {
  margin-bottom: 20px;
}

.section-heading h2 {
  margin: 0;
  font-size: 16px;
  line-height: 1.3;
}

.section-heading p {
  margin: 2px 0 0;
  color: #71839d;
  font-size: 12px;
}

.section-heading-icon {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  display: grid;
  width: 33px;
  height: 33px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid;
  border-radius: 12px;
}

.section-icon-warning {
  color: #f08a00;
  background: #fffbeb;
  border-color: #fde7a2;
}

.section-icon-notification {
  color: #f08a00;
  background: #fffbeb;
  border-color: #fde7a2;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 19px 20px;
}

.field {
  display: grid;
  min-width: 0;
  gap: 7px;
}

.field > span:first-child {
  color: #465873;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.035em;
  text-transform: uppercase;
}

.field b {
  color: #f0445f;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  min-width: 0;
  min-height: 42px;
  padding: 0 14px;
  color: #253650;
  background: #f8fafc;
  border: 1px solid #dce5f0;
  border-radius: 12px;
  outline: none;
  font: inherit;
  font-size: 13px;
}

.field textarea {
  min-height: 82px;
  padding-top: 10px;
  resize: vertical;
}

.field input::placeholder,
.field textarea::placeholder {
  color: #91a4bf;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: #079d75;
  box-shadow: 0 0 0 3px #079d751a;
}

.field-full {
  grid-column: 1 / -1;
}

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

.icon-tile,
.threshold-icon,
.notification-icon {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 12px;
}

.icon-tile {
  width: 36px;
  height: 36px;
  color: #6d809c;
  background: #f0f4f8;
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

.sensor-card h3,
.threshold-title h3 {
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

.threshold-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.threshold-card {
  display: grid;
  align-content: start;
  gap: 16px;
  padding: 20px;
  border: 1px solid;
  border-radius: 16px;
}

.threshold-temperature {
  background: #fffdfd;
  border-color: #ffdadf;
  --accent: #f43f5e;
  --tint: #fff5f6;
}

.threshold-air {
  background: #fcfeff;
  border-color: #d7edff;
  --accent: #0b9de5;
  --tint: #f3faff;
}

.threshold-vibration {
  background: #fefcff;
  border-color: #f0ddff;
  --accent: #9333ea;
  --tint: #fbf6ff;
}

.threshold-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.threshold-icon {
  width: 33px;
  height: 33px;
  color: white;
  background: var(--accent);
}

.threshold-title p {
  margin: 3px 0 0;
  color: #71839d;
  font-size: 11px;
}

.threshold-card .field {
  gap: 5px;
}

.threshold-card .field > span:first-child {
  font-size: 10px;
}

.threshold-card .field input,
.threshold-card .field select {
  min-height: 38px;
  padding: 0 12px;
  background-color: #fff;
}

.input-unit {
  position: relative;
}

.input-unit small {
  position: absolute;
  top: 50%;
  right: 12px;
  color: #91a4bf;
  transform: translateY(-50%);
}

.input-unit input {
  padding-right: 48px !important;
}

.threshold-note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 9px 10px;
  color: var(--accent);
  background: var(--tint);
  border-radius: 9px;
  font-size: 11px;
}

.notification-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.notification-card {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 88px;
  padding: 14px;
  border: 1px solid #dfe7f0;
  border-radius: 16px;
  cursor: pointer;
}

.notification-card > input {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  accent-color: #079d75;
}

.notification-card > span:last-child {
  display: grid;
  gap: 2px;
}

.notification-card strong {
  font-size: 13px;
  line-height: 1.2;
}

.notification-card small {
  color: #6d809b;
  font-size: 11px;
  line-height: 1.35;
}

.notification-icon {
  width: 34px;
  height: 34px;
}

.icon-blue {
  color: #2563eb;
  background: #eff6ff;
}

.icon-green {
  color: #059669;
  background: #ecfdf5;
}

.icon-orange {
  color: #f08a00;
  background: #fffbeb;
}

.critical-option {
  background: #fffdfa;
  border-color: #ffce52;
}

.icon-warning {
  color: #d97706;
  background: #fff3c4;
}

@media (max-width: 1180px) {
  .sensor-grid,
  .notification-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 850px) {
  .field-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .threshold-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .form-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .panel {
    padding: 18px;
  }

  .field-grid,
  .sensor-grid,
  .notification-grid {
    grid-template-columns: 1fr;
  }
}
</style>
