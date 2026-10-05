<script setup>
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const saved = ref(false);
const confirmationOpen = ref(false);
const preferences = reactive({
  email: true,
  inApp: false,
  dailySummary: false,
  weeklyReport: false,
  instantAlerts: true,
  warningThreshold: '2',
  criticalThreshold: '5',
});

function savePreferences() {
  confirmationOpen.value = true;
}

function confirmSave() {
  saved.value = true;
  confirmationOpen.value = false;
}
</script>

<template>
  <section class="notifications-page">
    <router-link
      class="back-link"
      to="/settings"
    >
      <i
        class="pi pi-arrow-left"
        aria-hidden="true"
      /> {{ t('settings.back') }}
    </router-link>
    <div class="page-heading">
      <h2>{{ t('settings.sections.notifications.title') }}</h2>
      <p>{{ t('settings.notifications.subtitle') }}</p>
    </div>

    <form
      class="settings-panel"
      @submit.prevent="savePreferences"
    >
      <section class="form-section">
        <h3>{{ t('settings.notifications.channels') }}</h3>
        <div class="channel-grid">
          <label class="channel-row">
            <span><strong>{{ t('settings.notifications.email') }}</strong><small>{{ t('settings.notifications.emailDescription') }}</small></span>
            <input
              v-model="preferences.email"
              type="checkbox"
            >
          </label>
          <label class="channel-row">
            <span><strong>{{ t('settings.notifications.inApp') }}</strong><small>{{ t('settings.notifications.inAppDescription') }}</small></span>
            <input
              v-model="preferences.inApp"
              type="checkbox"
            >
          </label>
        </div>
      </section>

      <section class="form-section">
        <h3>{{ t('settings.notifications.thresholds') }}</h3>
        <div class="threshold-card">
          <h4>
            <span class="temperature-icon"><i
              class="pi pi-bolt"
              aria-hidden="true"
            /></span>{{ t('settings.notifications.temperatureAlerts') }}
          </h4>
          <div class="threshold-grid">
            <label>
              {{ t('settings.notifications.warningLevel') }}
              <select v-model="preferences.warningThreshold">
                <option value="1">1°C {{ t('settings.notifications.deviation') }}</option>
                <option value="2">2°C {{ t('settings.notifications.deviation') }}</option>
                <option value="3">3°C {{ t('settings.notifications.deviation') }}</option>
              </select>
              <small class="warning-note"><i /> {{ t('settings.notifications.warningNote') }}</small>
            </label>
            <label>
              {{ t('settings.notifications.criticalLevel') }}
              <select v-model="preferences.criticalThreshold">
                <option value="3">3°C {{ t('settings.notifications.deviation') }}</option>
                <option value="5">5°C {{ t('settings.notifications.deviation') }}</option>
                <option value="8">8°C {{ t('settings.notifications.deviation') }}</option>
              </select>
              <small class="critical-note"><i /> {{ t('settings.notifications.criticalNote') }}</small>
            </label>
          </div>
        </div>
      </section>

      <section class="form-section activity-section">
        <h3>{{ t('settings.notifications.activitySummary') }}</h3>
        <label class="check-row">
          <input
            v-model="preferences.dailySummary"
            type="checkbox"
          >
          <span><strong>{{ t('settings.notifications.daily') }}</strong><small>{{ t('settings.notifications.dailyDescription') }}</small></span>
        </label>
        <label class="check-row">
          <input
            v-model="preferences.weeklyReport"
            type="checkbox"
          >
          <span><strong>{{ t('settings.notifications.weekly') }}</strong><small>{{ t('settings.notifications.weeklyDescription') }}</small></span>
        </label>
        <label class="check-row">
          <input
            v-model="preferences.instantAlerts"
            type="checkbox"
          >
          <span><strong>{{ t('settings.notifications.instant') }}</strong><small>{{ t('settings.notifications.instantDescription') }}</small></span>
        </label>
      </section>

      <div class="form-footer">
        <span
          v-if="saved"
          class="saved-message"
          role="status"
        >{{ t('settings.notifications.saved') }}</span>
        <button
          class="primary-button"
          type="submit"
        >
          {{ t('settings.notifications.save') }}
        </button>
      </div>
    </form>

    <div
      v-if="confirmationOpen"
      class="modal-backdrop"
    >
      <section
        class="confirm-dialog"
        role="dialog"
        aria-modal="true"
      >
        <h3>{{ t('settings.confirm.title') }}</h3>
        <p>{{ t('settings.notifications.confirmSave') }}</p>
        <div class="dialog-actions">
          <button
            class="cancel-button"
            type="button"
            @click="confirmationOpen = false"
          >
            {{ t('settings.confirm.cancel') }}
          </button>
          <button
            class="primary-button"
            type="button"
            @click="confirmSave"
          >
            {{ t('settings.confirm.confirm') }}
          </button>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.notifications-page { max-width: 1440px; margin: 0 auto; color: #18243a; }
.back-link { display: inline-flex; align-items: center; gap: 7px; margin-bottom: 10px; color: #687b95; font-size: 12px; }
.back-link:hover { color: #008b68; }
.page-heading { margin: 8px 0 22px; }
.page-heading h2 { margin: 0; font-size: 22px; }
.page-heading p { margin: 3px 0 0; color: #6a7d99; font-size: 13px; }
.settings-panel { padding: 28px 32px 24px; background: #fff; border: 1px solid #e2e9f2; border-radius: 17px; box-shadow: 0 1px 2px #13233d08; }
.form-section { margin-bottom: 30px; }
.form-section h3 { margin: 0 0 14px; padding-bottom: 9px; border-bottom: 1px solid #edf2f7; font-size: 15px; }
.channel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.channel-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 72px; padding: 14px 16px; background: #fbfcfe; border: 1px solid #e2e9f2; border-radius: 13px; cursor: pointer; }
.channel-row span, .check-row span { display: grid; gap: 2px; }
.channel-row strong, .check-row strong { color: #25344d; font-size: 13px; font-weight: 600; }
.channel-row small, .check-row small { color: #71839d; font-size: 11px; line-height: 1.5; }
.channel-row input { position: relative; width: 44px; height: 24px; flex: 0 0 44px; appearance: none; background: #cbd5e1; border: 0; border-radius: 999px; cursor: pointer; transition: background .15s ease; }
.channel-row input::after { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; background: #fff; border-radius: 50%; box-shadow: 0 1px 3px #13233d33; content: ''; transition: transform .15s ease; }
.channel-row input:checked { background: #079d75; }
.channel-row input:checked::after { transform: translateX(20px); }
.threshold-card { padding: 20px 24px; background: #fbfcfe; border: 1px solid #dfe6ef; border-radius: 13px; }
.threshold-card h4 { display: flex; align-items: center; gap: 10px; margin: 0 0 20px; font-size: 13px; }
.temperature-icon { display: grid; width: 32px; height: 32px; place-items: center; color: #008e6b; background: #e6fbf1; border-radius: 9px; }
.threshold-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
.threshold-grid label { display: grid; gap: 8px; color: #3d4f6a; font-size: 12px; }
.threshold-grid select { width: 100%; height: 39px; padding: 0 12px; color: #263650; background: #fff; border: 1px solid #d9e2ee; border-radius: 9px; font: inherit; }
.threshold-grid small { display: flex; align-items: center; gap: 6px; font-size: 10px; }
.threshold-grid small i { width: 6px; height: 6px; border-radius: 50%; }
.warning-note { color: #ea7500; }.warning-note i { background: #f59e0b; }
.critical-note { color: #ed3153; }.critical-note i { background: #f43f5e; }
.activity-section { margin-bottom: 22px; }
.check-row { display: flex; align-items: flex-start; gap: 13px; padding: 7px 0; cursor: pointer; }
.check-row input { width: 16px; height: 16px; margin-top: 2px; accent-color: #079d75; }
.form-footer { display: flex; justify-content: flex-end; align-items: center; gap: 14px; padding-top: 20px; border-top: 1px solid #edf2f7; }
.primary-button { min-height: 40px; padding: 0 20px; color: #fff; background: #079d75; border: 1px solid #079d75; border-radius: 10px; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.primary-button:hover { background: #078665; }
.saved-message { color: #078665; font-size: 12px; }
.modal-backdrop { position: fixed; z-index: 200; inset: 0; display: grid; place-items: center; padding: 18px; background: #13233d66; }
.confirm-dialog { width: min(100%, 400px); padding: 24px; background: #fff; border: 1px solid #e2e9f2; border-radius: 16px; box-shadow: 0 20px 50px #13233d30; }
.confirm-dialog h3 { margin: 0; font-size: 17px; }
.confirm-dialog p { margin: 10px 0 20px; color: #536681; font-size: 13px; }
.dialog-actions { display: flex; justify-content: flex-end; gap: 10px; }
.primary-button, .cancel-button { min-height: 38px; padding: 0 16px; border-radius: 9px; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.cancel-button { color: #263650; background: #fff; border: 1px solid #d5deea; }
@media (max-width: 700px) { .settings-panel { padding: 20px 16px; }.channel-grid, .threshold-grid { grid-template-columns: 1fr; gap: 12px; }.form-section { margin-bottom: 24px; }.threshold-card { padding: 16px; } }
</style>
