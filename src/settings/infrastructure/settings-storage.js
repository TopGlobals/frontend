import { MonitoringSensor } from '../domain/model/monitoring-sensor.js';
import { UserProfile } from '../domain/model/user-profile.js';

const storageKey = 'cryovigil.settings';

function createDefaultSettings() {
  return {
    profile: new UserProfile(),
    general: {
      region: 'Europe/Zurich',
      temperatureUnit: 'Celsius',
    },
    notifications: {
      email: true,
      inApp: false,
      dailySummary: false,
      weeklyReport: false,
      instantAlerts: true,
      warningThreshold: '2',
      criticalThreshold: '5',
    },
    security: {
      twoFactorEnabled: false,
    },
    sensors: [],
  };
}

function load() {
  const serialized = localStorage.getItem(storageKey);
  if (!serialized) return createDefaultSettings();

  const saved = JSON.parse(serialized);
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) {
    throw new TypeError('Saved settings must be an object.');
  }

  const defaults = createDefaultSettings();
  return {
    profile: UserProfile.fromJSON(saved.profile ?? defaults.profile),
    general: { ...defaults.general, ...saved.general },
    notifications: { ...defaults.notifications, ...saved.notifications },
    security: { ...defaults.security, ...saved.security },
    sensors: Array.isArray(saved.sensors)
      ? saved.sensors.map((sensor) => MonitoringSensor.fromJSON(sensor))
      : defaults.sensors,
  };
}

const settingsStorage = {
  load,
  save(settings) {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  },
};

export default settingsStorage;
