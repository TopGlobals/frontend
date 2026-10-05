<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const showGeneralSettings = ref(false);
const showProfileEditor = ref(false);
const region = ref('Europe/Zurich');
const temperatureUnit = ref('Celsius');
const profileName = ref('Dr. Alex Vance');
const profileEmail = ref('alex.vance@topglobals.com');

const settingsCards = [
  { key: 'sensors', icon: 'pi pi-wifi', to: '/settings/sensors' },
  { key: 'notifications', icon: 'pi pi-bell', to: '/settings/notifications' },
  { key: 'security', icon: 'pi pi-lock', to: '/settings/security' },
];
</script>

<template>
  <section class="settings-home">
    <div class="overview-grid">
      <article class="panel general-card">
        <div class="card-title">
          <span class="icon-box"><i
            class="pi pi-cog"
            aria-hidden="true"
          /></span>
          <h2>{{ t('settings.general.title') }}</h2>
          <span class="scope-badge">{{ t('settings.general.scope') }}</span>
        </div>
        <p>{{ t('settings.general.description') }}</p>
        <button
          class="primary-button details-button"
          type="button"
          @click="showGeneralSettings = true"
        >
          {{ t('settings.general.viewDetails') }}
        </button>
      </article>

      <article class="panel profile-card">
        <div
          class="profile-avatar"
          aria-hidden="true"
        >
          AV
        </div>
        <h2>Dr. Alex Vance</h2>
        <strong>{{ t('settings.profile.role') }}</strong>
        <p>{{ t('settings.profile.description') }}</p>
        <button
          class="outline-button"
          type="button"
          @click="showProfileEditor = true"
        >
          {{ t('settings.profile.edit') }}
        </button>
      </article>
    </div>

    <div class="settings-card-grid">
      <router-link
        v-for="card in settingsCards"
        :key="card.key"
        class="panel settings-card"
        :to="card.to"
      >
        <div class="card-title">
          <span class="icon-box"><i
            :class="card.icon"
            aria-hidden="true"
          /></span>
          <h2>{{ t(`settings.sections.${card.key}.title`) }}</h2>
        </div>
        <p>{{ t(`settings.sections.${card.key}.description`) }}</p>
        <span
          class="card-action"
          :class="{ 'primary-button': card.key === 'sensors', 'outline-button': card.key !== 'sensors' }"
        >
          {{ t(`settings.sections.${card.key}.action`) }}
        </span>
      </router-link>
    </div>

    <div
      v-if="showGeneralSettings"
      class="modal-backdrop"
      @click.self="showGeneralSettings = false"
    >
      <section
        class="general-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="t('settings.general.title')"
      >
        <div class="modal-heading">
          <h2>{{ t('settings.general.title') }}</h2>
          <button
            class="close-button"
            type="button"
            :aria-label="t('settings.general.close')"
            @click="showGeneralSettings = false"
          >
            ×
          </button>
        </div>
        <p>{{ t('settings.general.description') }}</p>
        <label>
          {{ t('settings.general.region') }}
          <select v-model="region">
            <option>Europe/Zurich</option>
            <option>America/New_York</option>
            <option>Asia/Tokyo</option>
          </select>
        </label>
        <label>
          {{ t('settings.general.temperatureUnit') }}
          <select v-model="temperatureUnit">
            <option>Celsius</option>
            <option>Fahrenheit</option>
          </select>
        </label>
        <button
          class="primary-button modal-save"
          type="button"
          @click="showGeneralSettings = false"
        >
          {{ t('settings.general.done') }}
        </button>
      </section>
    </div>

    <div
      v-if="showProfileEditor"
      class="modal-backdrop"
      @click.self="showProfileEditor = false"
    >
      <form
        class="general-modal"
        @submit.prevent="showProfileEditor = false"
      >
        <div class="modal-heading">
          <h2>{{ t('settings.profile.edit') }}</h2>
          <button
            class="close-button"
            type="button"
            :aria-label="t('settings.general.close')"
            @click="showProfileEditor = false"
          >
            ×
          </button>
        </div>
        <label>
          {{ t('settings.profile.name') }}
          <input
            v-model="profileName"
            type="text"
          >
        </label>
        <label>
          {{ t('settings.profile.email') }}
          <input
            v-model="profileEmail"
            type="email"
          >
        </label>
        <button
          class="primary-button modal-save"
          type="submit"
        >
          {{ t('settings.profile.save') }}
        </button>
      </form>
    </div>
  </section>
</template>

<style scoped>
.settings-home {
  max-width: 1440px;
  margin: 0 auto;
  color: #18243a;
}

.overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(260px, 1.05fr);
  gap: 24px;
  align-items: stretch;
}

.panel {
  background: #fff;
  border: 1px solid #e2e9f2;
  border-radius: 17px;
  box-shadow: 0 1px 2px #13233d08;
}

.general-card {
  position: relative;
  min-height: 254px;
  padding: 28px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title h2 {
  margin: 0;
  color: #172238;
  font-size: 16px;
}

.icon-box {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  place-items: center;
  color: #00976e;
  background: #edfcf5;
  border: 1px solid #c4f6de;
  border-radius: 12px;
  font-size: 17px;
}

.general-card .card-title {
  padding-right: 100px;
}

.scope-badge {
  position: absolute;
  top: 28px;
  right: 28px;
  padding: 5px 11px;
  color: #008b68;
  background: #effdf6;
  border: 1px solid #a7f3d0;
  border-radius: 999px;
  font-size: 11px;
  white-space: nowrap;
}

.general-card > p {
  max-width: 560px;
  margin: 16px 0 56px;
  color: #536681;
  font-size: 13px;
  line-height: 1.7;
}

.primary-button,
.outline-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 39px;
  padding: 0 18px;
  border-radius: 11px;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}

.primary-button {
  color: #fff;
  background: #079d75;
  border: 1px solid #079d75;
}

.primary-button:hover {
  color: #fff;
  background: #078665;
}

.outline-button {
  color: #263650;
  background: #fff;
  border: 1px solid #cbd7e6;
}

.outline-button:hover {
  color: #008b68;
  border-color: #00a879;
}

.details-button {
  position: absolute;
  right: 28px;
  bottom: 27px;
  min-width: 120px;
}

.profile-card {
  display: flex;
  min-height: 254px;
  flex-direction: column;
  align-items: center;
  padding: 28px 24px;
  text-align: center;
}

.profile-avatar {
  display: grid;
  width: 72px;
  height: 72px;
  place-items: center;
  color: #078b69;
  background: linear-gradient(145deg, #dcf8eb, #b6ead4);
  border: 4px solid #e8fcf3;
  border-radius: 19px;
  font-size: 20px;
  font-weight: 700;
}

.profile-card h2 {
  margin: 9px 0 0;
  font-size: 15px;
}

.profile-card > strong {
  margin-top: 2px;
  color: #009c73;
  font-size: 12px;
  font-weight: 500;
}

.profile-card p {
  max-width: 350px;
  margin: 9px 0 14px;
  color: #6d809b;
  font-size: 11px;
  line-height: 1.6;
}

.profile-card .outline-button {
  width: 100%;
  min-height: 38px;
}

.settings-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.settings-card {
  display: flex;
  min-height: 227px;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
  color: inherit;
  text-decoration: none;
}

.settings-card:hover {
  border-color: #b8e9d7;
  box-shadow: 0 5px 16px #13233d0c;
}

.settings-card .card-title {
  gap: 12px;
}

.settings-card .card-title h2 {
  font-size: 14px;
}

.settings-card > p {
  flex: 1;
  margin: 15px 0 20px;
  color: #536681;
  font-size: 11px;
  line-height: 1.7;
}

.settings-card .card-action {
  width: 100%;
  min-height: 38px;
}

.modal-backdrop {
  position: fixed;
  z-index: 200;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: #13233d66;
}

.general-modal {
  width: min(100%, 460px);
  padding: 24px;
  background: #fff;
  border: 1px solid #e2e9f2;
  border-radius: 16px;
  box-shadow: 0 20px 50px #13233d30;
}

.modal-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-heading h2 {
  font-size: 17px;
}

.close-button {
  color: #687b95;
  background: none;
  border: 0;
  font-size: 24px;
}

.general-modal > p {
  margin: 10px 0 20px;
  color: #687b95;
  font-size: 12px;
}

.general-modal label {
  display: grid;
  gap: 7px;
  margin-top: 15px;
  color: #3d4f6a;
  font-size: 12px;
  font-weight: 600;
}

.general-modal select {
  width: 100%;
  height: 40px;
  padding: 0 11px;
  color: #263650;
  background: #fff;
  border: 1px solid #dfe6ef;
  border-radius: 9px;
  font: inherit;
  font-weight: 400;
}

.general-modal input {
  width: 100%;
  height: 40px;
  padding: 0 11px;
  color: #263650;
  background: #fff;
  border: 1px solid #dfe6ef;
  border-radius: 9px;
  font: inherit;
  font-weight: 400;
}

.modal-save {
  width: 100%;
  margin-top: 22px;
}

@media (max-width: 900px) {
  .overview-grid {
    grid-template-columns: 1fr 1fr;
  }
  .settings-card-grid {
    gap: 14px;
  }
  .settings-card {
    padding: 18px;
  }
}

@media (max-width: 680px) {
  .overview-grid,
  .settings-card-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .general-card {
    min-height: 260px;
    padding: 20px;
  }
  .scope-badge {
    top: 20px;
    right: 20px;
  }
  .general-card .card-title {
    padding-right: 88px;
  }
  .general-card > p {
    margin-bottom: 64px;
  }
}
</style>
