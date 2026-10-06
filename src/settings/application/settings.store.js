import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { MonitoringSensor } from '../domain/model/monitoring-sensor.js';
import { UserProfile } from '../domain/model/user-profile.js';
import settingsStorage from '../infrastructure/settings-storage.js';

const initialSettings = settingsStorage.load();

const useSettingsStore = defineStore('settings', () => {
  const profile = ref(initialSettings.profile);
  const general = ref(initialSettings.general);
  const notifications = ref(initialSettings.notifications);
  const security = ref(initialSettings.security);
  const sensors = ref(initialSettings.sensors);

  watch(
    [profile, general, notifications, security, sensors],
    () =>
      settingsStorage.save({
        profile: profile.value,
        general: general.value,
        notifications: notifications.value,
        security: security.value,
        sensors: sensors.value,
      }),
    { deep: true }
  );

  function updateProfile(details) {
    profile.value = UserProfile.fromJSON({ ...profile.value, ...details });
  }

  function addSensor(details) {
    const sensor = MonitoringSensor.fromJSON(details);
    sensors.value.unshift(sensor);
    return sensor;
  }

  function updateSensor(id, details) {
    const index = sensors.value.findIndex((sensor) => sensor.id === id);
    if (index === -1) throw new Error(`Sensor not found: ${id}`);
    sensors.value.splice(
      index,
      1,
      MonitoringSensor.fromJSON({ ...sensors.value[index], ...details, id })
    );
  }

  function removeSensor(id) {
    sensors.value = sensors.value.filter((sensor) => sensor.id !== id);
  }

  function calibrateSensor(id) {
    updateSensor(id, { status: 'active' });
  }

  return {
    profile,
    general,
    notifications,
    security,
    sensors,
    updateProfile,
    addSensor,
    updateSensor,
    removeSensor,
    calibrateSensor,
  };
});

export default useSettingsStore;
