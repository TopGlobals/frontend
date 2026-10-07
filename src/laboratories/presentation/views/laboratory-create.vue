<script setup>
import { reactive, ref } from 'vue';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Laboratory } from '../../domain/model/laboratory.js';
import LaboratoryFormSection from '../components/laboratory-form-section.vue';
import LaboratorySensorsSystems from '../components/laboratory-sensors-systems.vue';
import useLaboratoriesStore from '../../application/laboratories.store.js';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const laboratoriesStore = useLaboratoriesStore();
const laboratoryId = typeof route.params.id === 'string' ? route.params.id : null;
const loading = ref(false);
const laboratoryLoaded = ref(!laboratoryId);
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

const sensorStates = ref(Laboratory.defaultSensors());
const notifications = reactive({ email: true, sms: true, push: false, criticalOnly: true });
const saveError = ref(false);
const loadError = ref(false);

function populateForm(laboratory) {
  form.name = laboratory.name;
  form.code = laboratory.code;
  form.building = laboratory.building;
  form.floor = laboratory.floor;
  form.room = laboratory.room;
  form.type = laboratory.type;
  form.description = laboratory.description;
  form.temperatureMin = laboratory.temperatureMin;
  form.temperatureMax = laboratory.temperatureMax;
  form.co2Max = laboratory.co2Max;
  form.gasSensitivity = laboratory.gasSensitivity;
  form.vibrationMax = laboratory.vibrationMax;
  form.escalation = laboratory.escalation;
  sensorStates.value = { ...laboratory.sensors };
  notifications.email = laboratory.notifications.email;
  notifications.sms = laboratory.notifications.sms;
  notifications.push = laboratory.notifications.push;
  notifications.criticalOnly = laboratory.notifications.criticalOnly;
}

onMounted(async () => {
  if (!laboratoryId) return;
  loading.value = true;
  try {
    const laboratory = await laboratoriesStore.getLaboratory(laboratoryId);
    populateForm(laboratory);
    laboratoryLoaded.value = true;
  } catch {
    loadError.value = true;
  } finally {
    loading.value = false;
  }
});

async function saveLaboratory() {
  saveError.value = false;
  try {
    const details = {
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
      sensors: { ...sensorStates.value },
      notifications: { ...notifications },
    };
    if (laboratoryId) {
      await laboratoriesStore.updateLaboratory(laboratoryId, details);
    } else {
      await laboratoriesStore.addLaboratory(details);
    }
    await router.push('/laboratories');
  } catch {
    saveError.value = true;
  }
}
</script>

<template>
  <form
    class="laboratory-form"
    @submit.prevent="saveLaboratory"
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
        <span>{{ t(laboratoryId ? 'laboratories.create.editBreadcrumbCurrent' : 'laboratories.create.breadcrumbCurrent') }}</span>
      </nav>
      <div class="toolbar-actions">
        <button
          class="cryo-button cryo-button-secondary cryo-button-compact"
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
          class="cryo-button cryo-button-primary cryo-button-compact"
          type="submit"
          :disabled="loading || !laboratoryLoaded"
        >
          <i
            class="pi pi-save"
            aria-hidden="true"
          />
          {{ t(laboratoryId ? 'laboratories.create.update' : 'laboratories.create.save') }}
        </button>
      </div>
    </div>

    <p
      v-if="loadError"
      class="error-message"
      role="alert"
    >
      {{ t('laboratories.create.loadError') }}
    </p>

    <p
      v-if="saveError"
      class="error-message"
      role="alert"
    >
      {{ t('laboratories.create.saveError') }}
    </p>

    <LaboratoryFormSection
      :title="t('laboratories.create.basicTitle')"
      :description="t('laboratories.create.basicDescription')"
    >
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
    </LaboratoryFormSection>

    <LaboratorySensorsSystems v-model="sensorStates" />

    <LaboratoryFormSection
      :title="t('laboratories.create.thresholdsTitle')"
      :description="t('laboratories.create.thresholdsDescription')"
      icon="pi pi-shield"
      icon-class="section-icon-warning"
    >
      <div class="threshold-grid">
        <article class="threshold-card threshold-temperature">
          <header class="threshold-title">
            <span class="threshold-icon"><i
              class="pi pi-gauge"
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
    </LaboratoryFormSection>

    <LaboratoryFormSection
      :title="t('laboratories.create.notificationsTitle')"
      :description="t('laboratories.create.notificationsDescription')"
      icon="pi pi-bell"
      icon-class="section-icon-notification"
    >
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
        <label class="notification-card">
          <input
            v-model="notifications.criticalOnly"
            type="checkbox"
          >
          <span class="notification-icon icon-blue"><i
            class="pi pi-exclamation-triangle"
            aria-hidden="true"
          /></span>
          <span>
            <strong>{{ t('laboratories.create.criticalOnly') }}</strong>
            <small>{{ t('laboratories.create.criticalOnlyDescription') }}</small>
          </span>
        </label>
      </div>
    </LaboratoryFormSection>
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

.error-message {
  margin: 0 0 16px;
  padding: 10px 14px;
  color: #a12d35;
  background: #fff1f1;
  border: 1px solid #f3c3c6;
  border-radius: 10px;
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

.threshold-icon,
.notification-icon {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 12px;
}

.threshold-title h3 {
  margin: 0;
  font-size: 14px;
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

@media (max-width: 1180px) {
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

  .field-grid,
  .notification-grid {
    grid-template-columns: 1fr;
  }
}
</style>
