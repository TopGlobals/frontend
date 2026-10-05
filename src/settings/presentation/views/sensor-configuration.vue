<script setup>
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const typeFilter = ref('all');
const locationFilter = ref('all');
const message = ref('');
const sensors = ref([]);
const editorOpen = ref(false);
const confirmationOpen = ref(false);
const editingId = ref(null);
const pendingAction = ref('');
const sensorDraft = reactive({
  name: '',
  model: '',
  serial: '',
  type: '',
  location: '',
  status: 'active',
});

const visibleSensors = computed(() =>
  sensors.value.filter(
    (sensor) =>
      (typeFilter.value === 'all' || sensor.type === typeFilter.value) &&
      (locationFilter.value === 'all' || sensor.location === locationFilter.value),
  ),
);
const sensorTypes = computed(() => [...new Set(sensors.value.map((sensor) => sensor.type))]);
const activeCount = computed(() => sensors.value.filter((sensor) => sensor.status === 'active').length);
const compliancePercentage = computed(() =>
  sensors.value.length ? Math.round((activeCount.value / sensors.value.length) * 100) : 0,
);

function calibrate(sensor) {
  pendingAction.value = 'calibrate';
  editingId.value = sensor.id;
  confirmationOpen.value = true;
}

function requestDelete(sensor) {
  pendingAction.value = 'delete';
  editingId.value = sensor.id;
  confirmationOpen.value = true;
}

function addSensor() {
  editingId.value = null;
  Object.assign(sensorDraft, { name: '', model: '', serial: '', type: '', location: '', status: 'active' });
  editorOpen.value = true;
}

function editSensor(sensor) {
  editingId.value = sensor.id;
  Object.assign(sensorDraft, sensor);
  editorOpen.value = true;
}

function requestSensorSave() {
  pendingAction.value = editingId.value === null ? 'add' : 'edit';
  editorOpen.value = false;
  confirmationOpen.value = true;
}

function confirmAction() {
  const sensor = sensors.value.find((item) => item.id === editingId.value);
  if (pendingAction.value === 'add') {
    const nextId = Math.max(0, ...sensors.value.map((item) => item.id)) + 1;
    sensors.value.unshift({ ...sensorDraft, id: nextId });
    message.value = t('settings.sensors.sensorAdded');
  } else if (pendingAction.value === 'edit' && sensor) {
    Object.assign(sensor, sensorDraft);
    message.value = t('settings.sensors.sensorUpdated');
  } else if (pendingAction.value === 'calibrate' && sensor) {
    sensor.status = 'active';
    message.value = t('settings.sensors.calibrationScheduled', { name: sensor.name });
  } else if (pendingAction.value === 'delete' && sensor) {
    sensors.value = sensors.value.filter((item) => item.id !== sensor.id);
    message.value = t('settings.sensors.sensorDeleted', { name: sensor.name });
  }
  confirmationOpen.value = false;
  pendingAction.value = '';
}

function cancelConfirmation() {
  confirmationOpen.value = false;
  pendingAction.value = '';
}
</script>

<template>
  <section class="sensor-page">
    <router-link
      class="back-link"
      to="/settings"
    >
      <i
        class="pi pi-arrow-left"
        aria-hidden="true"
      /> {{ t('settings.back') }}
    </router-link>
    <div class="section-heading">
      <div>
        <h2>{{ t('settings.sections.sensors.title') }}</h2>
        <p>{{ t('settings.sensors.subtitle') }}</p>
      </div>
      <button
        class="primary-button"
        type="button"
        @click="addSensor"
      >
        <i
          class="pi pi-plus"
          aria-hidden="true"
        /> {{ t('settings.sensors.add') }}
      </button>
    </div>

    <div class="filter-bar">
      <span>{{ t('settings.sensors.filterBy') }}</span>
      <label>
        <span class="sr-only">{{ t('settings.sensors.sensorType') }}</span>
        <select v-model="typeFilter">
          <option value="all">{{ t('settings.sensors.allTypes') }}</option>
          <option
            v-for="type in sensorTypes"
            :key="type"
            :value="type"
          >
            {{ ['temperature', 'pressure', 'humidity', 'co2'].includes(type) ? t(`settings.sensors.types.${type}`) : type }}
          </option>
        </select>
      </label>
      <label>
        <span class="sr-only">{{ t('settings.sensors.location') }}</span>
        <select v-model="locationFilter">
          <option value="all">{{ t('settings.sensors.allLocations') }}</option>
          <option value="Cryo A">Cryo A</option>
          <option value="Airlock B">Airlock B</option>
          <option value="Incubator 7">Incubator 7</option>
        </select>
      </label>
      <span class="sensor-total"><i /> {{ t('settings.sensors.total', { count: sensors.length }) }}</span>
    </div>

    <p
      v-if="message"
      class="feedback"
      role="status"
    >
      {{ message }}
    </p>

    <div class="sensor-list">
      <article
        v-for="sensor in visibleSensors"
        :key="sensor.id"
        class="sensor-row"
      >
        <span
          class="sensor-icon"
          :class="`type-${sensor.type}`"
          aria-hidden="true"
        >
          <i :class="sensor.type === 'temperature' ? 'pi pi-bolt' : sensor.type === 'pressure' ? 'pi pi-exclamation-triangle' : sensor.type === 'humidity' ? 'pi pi-filter' : 'pi pi-chart-line'" />
        </span>
        <div class="sensor-details">
          <h3>{{ sensor.name }}</h3>
          <p>{{ t('settings.sensors.model') }} {{ sensor.model }} <span>|</span> {{ t('settings.sensors.serial') }} {{ sensor.serial }}</p>
        </div>
        <span
          class="status-label"
          :class="`status-${sensor.status}`"
        >
          <i />
          {{ t(`settings.sensors.status.${sensor.status}`) }}
        </span>
        <button
          class="small-primary"
          type="button"
          @click="calibrate(sensor)"
        >
          {{ t('settings.sensors.calibrate') }}
        </button>
        <button
          class="small-outline"
          type="button"
          @click="editSensor(sensor)"
        >
          {{ t('settings.sensors.edit') }}
        </button>
        <button
          class="small-delete"
          type="button"
          @click="requestDelete(sensor)"
        >
          {{ t('settings.sensors.delete') }}
        </button>
      </article>
      <div
        v-if="!visibleSensors.length"
        class="empty-state"
      >
        {{ t('settings.sensors.noSensors') }}
      </div>

      <div
        v-if="editorOpen"
        class="modal-backdrop"
        @click.self="editorOpen = false"
      >
        <form
          class="dialog-card"
          @submit.prevent="requestSensorSave"
        >
          <h3>{{ editingId === null ? t('settings.sensors.add') : t('settings.sensors.edit') }}</h3>
          <label>
            {{ t('settings.sensors.name') }}
            <input
              v-model.trim="sensorDraft.name"
              required
            >
          </label>
          <div class="form-grid">
            <label>
              {{ t('settings.sensors.sensorType') }}
              <input
                v-model.trim="sensorDraft.type"
                required
              >
            </label>
            <label>
              {{ t('settings.sensors.model') }}
              <input
                v-model.trim="sensorDraft.model"
                required
              >
            </label>
            <label>
              {{ t('settings.sensors.serial') }}
              <input
                v-model.trim="sensorDraft.serial"
                required
              >
            </label>
            <label>
              {{ t('settings.sensors.location') }}
              <input
                v-model.trim="sensorDraft.location"
                required
              >
            </label>
            <label>
              {{ t('settings.sensors.statusLabel') }}
              <select v-model="sensorDraft.status">
                <option value="active">{{ t('settings.sensors.status.active') }}</option>
                <option value="inactive">{{ t('settings.sensors.status.inactive') }}</option>
                <option value="calibration">{{ t('settings.sensors.status.calibration') }}</option>
              </select>
            </label>
          </div>
          <div class="dialog-actions">
            <button
              class="small-outline"
              type="button"
              @click="editorOpen = false"
            >
              {{ t('settings.confirm.cancel') }}
            </button>
            <button
              class="primary-button"
              type="submit"
            >
              {{ t('settings.confirm.continue') }}
            </button>
          </div>
        </form>
      </div>

      <div
        v-if="confirmationOpen"
        class="modal-backdrop confirm-backdrop"
      >
        <section
          class="dialog-card confirm-card"
          role="dialog"
          aria-modal="true"
        >
          <h3>{{ t('settings.confirm.title') }}</h3>
          <p>{{ pendingAction === 'add' ? t('settings.sensors.confirmAdd') : pendingAction === 'edit' ? t('settings.sensors.confirmEdit') : pendingAction === 'delete' ? t('settings.sensors.confirmDelete') : t('settings.sensors.confirmCalibrate') }}</p>
          <div class="dialog-actions">
            <button
              class="small-outline"
              type="button"
              @click="cancelConfirmation"
            >
              {{ t('settings.confirm.cancel') }}
            </button>
            <button
              class="primary-button"
              type="button"
              @click="confirmAction"
            >
              {{ t('settings.confirm.confirm') }}
            </button>
          </div>
        </section>
      </div>
    </div>

    <div class="bottom-grid">
      <section class="panel compliance">
        <div class="compliance-heading">
          <h3>{{ t('settings.sensors.complianceTitle') }}</h3>
          <span>{{ t('settings.sensors.nextAudit') }}</span>
        </div>
        <div class="compliance-metrics">
          <div><strong class="green">{{ compliancePercentage }}%</strong><span>{{ t('settings.sensors.calibrated') }}</span></div>
          <div><strong class="orange">{{ sensors.length ? 100 - compliancePercentage : 0 }}%</strong><span>{{ t('settings.sensors.pending') }}</span></div>
          <div><strong class="red">0%</strong><span>{{ t('settings.sensors.overdue') }}</span></div>
        </div>
        <p>{{ t('settings.sensors.complianceNote') }}</p>
      </section>
      <aside class="safety-card">
        <span class="safety-icon"><i
          class="pi pi-shield"
          aria-hidden="true"
        /></span>
        <h3>{{ t('settings.sensors.safetyTitle') }}</h3>
        <p>{{ t('settings.sensors.safetyDescription') }}</p>
        <button
          type="button"
          @click="message = t('settings.sensors.auditReady')"
        >
          {{ t('settings.sensors.auditReport') }}
        </button>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.sensor-page { max-width: 1440px; margin: 0 auto; color: #18243a; }
.back-link { display: inline-flex; align-items: center; gap: 7px; margin: 0 0 10px; color: #687b95; font-size: 12px; }
.back-link:hover { color: #008b68; }
.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin: 8px 0 20px; }
.section-heading h2 { margin: 0; font-size: 20px; }
.section-heading p { margin: 2px 0 0; color: #6a7d99; font-size: 12px; }
.primary-button, .small-primary, .small-outline { font: inherit; cursor: pointer; }
.primary-button { display: inline-flex; align-items: center; gap: 9px; min-height: 36px; padding: 0 16px; color: white; background: #079d75; border: 1px solid #079d75; border-radius: 11px; font-size: 12px; font-weight: 600; }
.primary-button:hover, .small-primary:hover { background: #078665; }
.filter-bar { display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 10px 16px; background: #fff; border: 1px solid #e2e9f2; border-radius: 14px; color: #526681; font-size: 12px; }
.filter-bar select { min-width: 150px; height: 36px; padding: 0 11px; color: #263650; background: #f9fbfd; border: 1px solid #dfe6ef; border-radius: 9px; font: inherit; cursor: pointer; }
.sensor-total { display: inline-flex; align-items: center; gap: 7px; margin-left: auto; color: #263650; white-space: nowrap; }
.sensor-total i, .status-label i { width: 8px; height: 8px; background: #00b981; border-radius: 50%; }
.feedback { margin: 12px 0 0; padding: 10px 12px; color: #087e64; background: #edfcf5; border: 1px solid #c4f6de; border-radius: 9px; font-size: 12px; }
.sensor-list { display: grid; gap: 12px; margin-top: 20px; }
.sensor-row { display: flex; align-items: center; gap: 14px; min-height: 82px; padding: 14px 20px; background: #fff; border: 1px solid #e2e9f2; border-radius: 17px; }
.sensor-icon, .safety-icon { display: grid; width: 44px; height: 44px; flex: 0 0 44px; place-items: center; color: #009b73; background: #edfcf5; border: 1px solid #c4f6de; border-radius: 12px; font-size: 17px; }
.sensor-icon.type-pressure { color: #ef9300; background: #fff9e9; border-color: #ffe7a8; }
.sensor-icon.type-humidity { color: #3479ed; background: #eff6ff; border-color: #cfe1ff; }
.sensor-icon.type-co2 { color: #009b73; }
.sensor-details { min-width: 0; flex: 1; }
.sensor-details h3 { margin: 0; font-size: 14px; }
.sensor-details p { margin: 3px 0 0; color: #91a2ba; font-family: var(--cryo-font-mono); font-size: 11px; }
.sensor-details p span { margin: 0 8px; }
.status-label { display: inline-flex; align-items: center; gap: 7px; min-width: 106px; color: #008b68; font-size: 11px; white-space: nowrap; }
.status-calibration { padding: 5px 10px; color: #b45309; background: #fffbeb; border: 1px solid #fde68a; border-radius: 999px; }
.status-calibration i { background: #f59e0b; }
.status-inactive { color: #91a2ba; }
.status-inactive i { background: #cbd5e1; }
.small-primary, .small-outline { min-height: 30px; padding: 0 12px; border-radius: 8px; font-size: 11px; font-weight: 600; }
.small-primary { color: white; background: #079d75; border: 1px solid #079d75; }
.small-outline { color: #263650; background: #fff; border: 1px solid #d5deea; }
.small-outline:hover { border-color: #079d75; }
.small-delete { min-height: 30px; padding: 0 10px; color: #dc3652; background: #fff; border: 1px solid #fecdd3; border-radius: 8px; font: inherit; font-size: 11px; font-weight: 600; cursor: pointer; }
.small-delete:hover { background: #fff1f2; }
.bottom-grid { display: grid; grid-template-columns: minmax(0, 2fr) minmax(230px, 1fr); gap: 24px; margin-top: 30px; }
.panel { padding: 24px; background: #fff; border: 1px solid #e2e9f2; border-radius: 17px; }
.compliance-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.compliance-heading h3, .safety-card h3 { margin: 0; font-size: 15px; }
.compliance-heading span { padding: 5px 10px; color: #008b68; background: #effdf6; border: 1px solid #c4f6de; border-radius: 8px; font-size: 11px; }
.compliance-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 18px 0; }
.compliance-metrics div { display: flex; min-height: 88px; flex-direction: column; align-items: center; justify-content: center; gap: 2px; background: #f8fafc; border: 1px solid #edf2f7; border-radius: 12px; }
.compliance-metrics strong { font-size: 27px; line-height: 1.2; }
.compliance-metrics span { color: #6a7d99; font-size: 11px; }
.green { color: #079d75; }.orange { color: #f59e0b; }.red { color: #f43f5e; }
.compliance > p { margin: 0; padding-top: 12px; color: #91a2ba; border-top: 1px solid #edf2f7; font-size: 11px; }
.safety-card { padding: 22px 24px; color: white; background: #079d75; border-radius: 17px; }
.safety-icon { color: white; background: #ffffff20; border: 0; }
.safety-card h3 { margin-top: 12px; font-size: 17px; }
.safety-card p { margin: 12px 0 18px; color: #e5fff6; font-size: 11px; line-height: 1.65; }
.safety-card button { width: 100%; min-height: 36px; color: #008b68; background: #fff; border: 0; border-radius: 9px; font: inherit; font-size: 11px; font-weight: 600; cursor: pointer; }
.empty-state { padding: 30px; color: #6a7d99; background: #fff; border: 1px solid #e2e9f2; border-radius: 14px; text-align: center; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; clip-path: inset(50%); }
.modal-backdrop { position: fixed; z-index: 200; inset: 0; display: grid; place-items: center; padding: 18px; background: #13233d66; }
.confirm-backdrop { z-index: 210; }
.dialog-card { width: min(100%, 480px); padding: 24px; background: #fff; border: 1px solid #e2e9f2; border-radius: 16px; box-shadow: 0 20px 50px #13233d30; }
.dialog-card h3 { margin: 0 0 16px; font-size: 17px; }
.dialog-card > p { margin: 0 0 18px; color: #536681; font-size: 13px; }
.dialog-card label { display: grid; gap: 6px; color: #3d4f6a; font-size: 12px; font-weight: 600; }
.dialog-card input, .dialog-card select { width: 100%; height: 38px; padding: 0 10px; color: #263650; background: #fff; border: 1px solid #dfe6ef; border-radius: 8px; font: inherit; font-weight: 400; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.dialog-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 22px; }
.dialog-actions .primary-button, .dialog-actions .small-outline { min-height: 36px; }
@media (max-width: 900px) { .sensor-row { flex-wrap: wrap; }.sensor-details { flex-basis: calc(100% - 60px); }.bottom-grid { grid-template-columns: 1fr; } }
@media (max-width: 600px) { .filter-bar { align-items: stretch; flex-wrap: wrap; }.filter-bar > span:first-child { width: 100%; }.filter-bar label { flex: 1; min-width: 130px; }.filter-bar select { width: 100%; min-width: 0; }.sensor-total { margin-left: 0; }.sensor-row { padding: 14px; gap: 9px; }.status-label { margin-left: 53px; }.sensor-details p { overflow-wrap: anywhere; }.section-heading { align-items: flex-start; flex-direction: column; }.compliance-metrics { gap: 7px; }.compliance-metrics strong { font-size: 22px; }.form-grid { grid-template-columns: 1fr; } }
</style>
