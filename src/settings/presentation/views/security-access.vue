<script setup>
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const twoFactorEnabled = ref(false);
const feedback = ref('');
const confirmationOpen = ref(false);
const pendingAction = ref('');
const passwords = reactive({ current: '', next: '', confirm: '' });

function updatePassword() {
  if (passwords.next.length < 8) {
    feedback.value = t('settings.security.passwordTooShort');
    return;
  }
  if (passwords.next !== passwords.confirm) {
    feedback.value = t('settings.security.passwordMismatch');
    return;
  }
  pendingAction.value = 'password';
  confirmationOpen.value = true;
}

function toggleTwoFactor() {
  pendingAction.value = 'twoFactor';
  confirmationOpen.value = true;
}

function confirmAction() {
  if (pendingAction.value === 'password') {
    feedback.value = t('settings.security.passwordSaved');
    passwords.current = '';
    passwords.next = '';
    passwords.confirm = '';
  } else {
    twoFactorEnabled.value = !twoFactorEnabled.value;
    feedback.value = twoFactorEnabled.value
      ? t('settings.security.twoFactorEnabled')
      : t('settings.security.twoFactorDisabled');
  }
  confirmationOpen.value = false;
  pendingAction.value = '';
}
</script>

<template>
  <section class="security-page">
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
      <h2>{{ t('settings.sections.security.title') }}</h2>
      <p>{{ t('settings.security.subtitle') }}</p>
    </div>

    <div class="security-grid">
      <form
        class="panel password-panel"
        @submit.prevent="updatePassword"
      >
        <h3>{{ t('settings.security.changePassword') }}</h3>
        <label>
          {{ t('settings.security.currentPassword') }}
          <input
            v-model="passwords.current"
            type="password"
            autocomplete="current-password"
            required
          >
        </label>
        <label>
          {{ t('settings.security.newPassword') }}
          <input
            v-model="passwords.next"
            type="password"
            autocomplete="new-password"
            required
            minlength="8"
          >
          <small>{{ t('settings.security.passwordRequirement') }}</small>
        </label>
        <label>
          {{ t('settings.security.confirmPassword') }}
          <input
            v-model="passwords.confirm"
            type="password"
            autocomplete="new-password"
            required
            minlength="8"
          >
        </label>
        <div class="password-footer">
          <span
            v-if="feedback"
            role="status"
          >{{ feedback }}</span>
          <button
            class="primary-button"
            type="submit"
          >
            {{ t('settings.security.updatePassword') }}
          </button>
        </div>
      </form>

      <section class="panel two-factor-panel">
        <h3>{{ t('settings.security.twoFactorTitle') }}</h3>
        <div
          class="security-illustration"
          aria-hidden="true"
        >
          <span><i class="pi pi-shield" /></span>
          <i class="pi pi-mobile mobile-icon" />
        </div>
        <p>{{ t('settings.security.twoFactorDescription') }}</p>
        <div class="two-factor-footer">
          <button
            class="outline-button"
            type="button"
            :aria-pressed="twoFactorEnabled"
            @click="toggleTwoFactor"
          >
            {{ twoFactorEnabled ? t('settings.security.disableTwoFactor') : t('settings.security.enableTwoFactor') }}
          </button>
        </div>
      </section>
    </div>

    <div class="status-grid">
      <article class="panel status-card">
        <span class="icon-box"><i
          class="pi pi-history"
          aria-hidden="true"
        /></span>
        <div><h3>{{ t('settings.security.loginActivity') }}</h3><p>{{ t('settings.security.lastLogin') }}</p></div>
      </article>
      <article class="panel status-card">
        <span class="icon-box"><i
          class="pi pi-desktop"
          aria-hidden="true"
        /></span>
        <div><h3>{{ t('settings.security.activeSessions') }}</h3><p>{{ t('settings.security.connectedDevices') }}</p></div>
      </article>
      <article class="panel status-card">
        <span class="icon-box"><i
          class="pi pi-shield"
          aria-hidden="true"
        /></span>
        <div><h3>{{ t('settings.security.accountStatus') }}</h3><p>{{ t('settings.security.verifiedResearcher') }}</p></div>
      </article>
    </div>

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
        <p>{{ pendingAction === 'password' ? t('settings.security.confirmPasswordChange') : t('settings.security.confirmTwoFactor', { action: twoFactorEnabled ? t('settings.security.disableTwoFactor').toLowerCase() : t('settings.security.enableTwoFactor').toLowerCase() }) }}</p>
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
            @click="confirmAction"
          >
            {{ t('settings.confirm.confirm') }}
          </button>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.security-page { max-width: 1440px; margin: 0 auto; color: #18243a; }
.back-link { display: inline-flex; align-items: center; gap: 7px; margin-bottom: 10px; color: #687b95; font-size: 12px; }
.back-link:hover { color: #008b68; }
.page-heading { margin: 8px 0 22px; }
.page-heading h2 { margin: 0; font-size: 22px; }
.page-heading p { margin: 3px 0 0; color: #6a7d99; font-size: 13px; }
.security-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; align-items: start; }
.panel { background: #fff; border: 1px solid #e2e9f2; border-radius: 17px; box-shadow: 0 1px 2px #13233d08; }
.password-panel { padding: 24px; }
.password-panel h3, .two-factor-panel h3 { margin: 0 0 18px; font-size: 15px; }
.password-panel label { display: grid; gap: 7px; margin-top: 14px; color: #3d4f6a; font-size: 12px; font-weight: 600; }
.password-panel input { width: 100%; height: 42px; padding: 0 13px; color: #263650; background: #fbfcfe; border: 1px solid #dfe6ef; border-radius: 9px; font: inherit; }
.password-panel input:focus { border-color: #079d75; outline: 2px solid #079d7526; }
.password-panel label small { color: #91a2ba; font-size: 10px; font-weight: 400; }
.password-footer { display: flex; align-items: center; justify-content: flex-end; gap: 12px; min-height: 60px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #edf2f7; }
.password-footer > span { flex: 1; color: #078665; font-size: 11px; }
.primary-button, .outline-button { min-height: 38px; padding: 0 16px; border-radius: 9px; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.primary-button { color: #fff; background: #079d75; border: 1px solid #079d75; }
.primary-button:hover { background: #078665; }
.two-factor-panel { display: flex; min-height: 356px; flex-direction: column; padding: 24px; }
.security-illustration { position: relative; display: grid; width: 112px; height: 96px; place-items: center; align-self: center; margin: 8px 0 14px; color: #008b68; background: #effdf6; border: 1px solid #c4f6de; border-radius: 17px; }
.security-illustration > span { display: grid; width: 50px; height: 50px; place-items: center; color: white; background: #079d75; border-radius: 13px; font-size: 22px; }
.mobile-icon { position: absolute; right: -8px; bottom: -8px; display: grid; width: 30px; height: 30px; place-items: center; color: #079d75; background: white; border: 1px solid #e2e9f2; border-radius: 8px; box-shadow: 0 2px 5px #13233d18; }
.two-factor-panel > p { max-width: 370px; align-self: center; margin: 6px 0 24px; color: #536681; font-size: 12px; line-height: 1.65; text-align: center; }
.two-factor-footer { margin-top: auto; padding-top: 18px; border-top: 1px solid #edf2f7; }
.outline-button { width: 100%; color: #008b68; background: #fff; border: 1px solid #079d75; }
.outline-button:hover { background: #effdf6; }
.status-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; margin-top: 24px; }
.status-card { display: flex; align-items: center; gap: 14px; min-height: 78px; padding: 16px; }
.icon-box { display: grid; width: 44px; height: 44px; flex: 0 0 44px; place-items: center; color: #009b73; background: #edfcf5; border: 1px solid #c4f6de; border-radius: 12px; font-size: 17px; }
.status-card h3 { margin: 0; font-size: 12px; }
.status-card p { margin: 2px 0 0; color: #71839d; font-size: 11px; line-height: 1.4; }
.modal-backdrop { position: fixed; z-index: 200; inset: 0; display: grid; place-items: center; padding: 18px; background: #13233d66; }
.confirm-dialog { width: min(100%, 400px); padding: 24px; background: #fff; border: 1px solid #e2e9f2; border-radius: 16px; box-shadow: 0 20px 50px #13233d30; }
.confirm-dialog h3 { margin: 0; font-size: 17px; }
.confirm-dialog p { margin: 10px 0 20px; color: #536681; font-size: 13px; }
.dialog-actions { display: flex; justify-content: flex-end; gap: 10px; }
.cancel-button { min-height: 38px; padding: 0 16px; color: #263650; background: #fff; border: 1px solid #d5deea; border-radius: 9px; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
@media (max-width: 850px) { .security-grid { gap: 16px; }.status-grid { gap: 12px; }.status-card { padding: 12px; } }
@media (max-width: 650px) { .security-grid, .status-grid { grid-template-columns: 1fr; }.two-factor-panel { min-height: 320px; } }
</style>
