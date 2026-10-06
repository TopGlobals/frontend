/**
 * Application service store for the Alerts bounded context.
 * It coordinates the alert feed use cases and keeps UI-facing state.
 *
 * @module useAlertsStore
 */
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { AlertsApi } from '../infrastructure/alerts-api.js';
import { AlertAssembler } from '../infrastructure/alert.assembler.js';
import { AlertSeverity } from '../domain/model/alert-severity.enum.js';
import { AlertTransitionError } from '../domain/model/alert.entity.js';

const alertsApi = new AlertsApi();

/**
 * Signed-in user that performs alert actions.
 * Replace with the IAM store's current user when IAM is implemented.
 */
const currentUser = Object.freeze({ fullName: 'Dr. Alex Vance' });

/**
 * Reactive store that exposes alert commands and queries.
 *
 * @returns {Object} Store state and actions.
 */
const useAlertsStore = defineStore('alerts', () => {
  /** @type {import('vue').Ref<import('../domain/model/alert.entity.js').Alert[]>} */
  const alerts = ref([]);
  /** @type {import('vue').Ref<Error[]>} */
  const errors = ref([]);
  /** Whether the alert feed has been loaded at least once. */
  const alertsLoaded = ref(false);
  /** Whether a fetch is in progress. */
  const loading = ref(false);
  /** @type {import('vue').Ref<?Date>} Time of the last successful fetch. */
  const lastUpdatedAt = ref(null);

  /** Alerts that have not been resolved. */
  const openAlerts = computed(() => alerts.value.filter((alert) => alert.isOpen));

  /** Number of open critical alerts, shown in the navigation badge. */
  const openCriticalCount = computed(
    () => openAlerts.value.filter((alert) => alert.severity === AlertSeverity.CRITICAL).length
  );

  /**
   * Loads the alert feed and replaces the local state.
   * @returns {Promise<boolean>} True when the feed was loaded.
   */
  function fetchAlerts() {
    loading.value = true;
    return alertsApi
      .getAlerts()
      .then((response) => {
        alerts.value = AlertAssembler.toEntitiesFromResponse(response);
        alertsLoaded.value = true;
        lastUpdatedAt.value = new Date();
        errors.value = [];
        return true;
      })
      .catch((error) => {
        errors.value.push(error);
        return false;
      })
      .finally(() => {
        loading.value = false;
      });
  }

  /**
   * Finds an alert entity by identifier.
   * @param {string|number} id - Alert identifier.
   * @returns {import('../domain/model/alert.entity.js').Alert|undefined} Matching alert.
   */
  function getAlertById(id) {
    return alerts.value.find((alert) => String(alert.id) === String(id));
  }

  /**
   * Replaces an alert in local state.
   * @param {import('../domain/model/alert.entity.js').Alert} alert - Updated alert.
   */
  function replaceAlert(alert) {
    const index = alerts.value.findIndex((item) => String(item.id) === String(alert.id));
    if (index !== -1) alerts.value[index] = alert;
  }

  /**
   * Reads the latest server copy of an alert so two people cannot act on it at once (US09).
   * @param {string|number} id - Alert identifier.
   * @returns {Promise<import('../domain/model/alert.entity.js').Alert>} Latest alert.
   */
  function fetchLatest(id) {
    return alertsApi.getAlertById(id).then((response) => {
      const latest = AlertAssembler.toEntityFromResource(response.data);
      replaceAlert(latest);
      return latest;
    });
  }

  /**
   * Persists an alert and synchronizes local state.
   * @param {import('../domain/model/alert.entity.js').Alert} alert - Alert to save.
   * @returns {Promise<import('../domain/model/alert.entity.js').Alert>} Saved alert.
   */
  function saveAlert(alert) {
    return alertsApi.updateAlert(AlertAssembler.toResourceFromEntity(alert)).then((response) => {
      const saved = AlertAssembler.toEntityFromResource(response.data);
      replaceAlert(saved);
      return saved;
    });
  }

  /**
   * Acknowledges an alert on behalf of the current user (US09, US26).
   * @param {string|number} id - Alert identifier.
   * @returns {Promise<import('../domain/model/alert.entity.js').Alert>} Acknowledged alert.
   * @throws {AlertTransitionError} When someone else already acknowledged it.
   */
  function acknowledgeAlert(id) {
    return fetchLatest(id).then((alert) => {
      alert.acknowledge(currentUser.fullName, new Date());
      return saveAlert(alert);
    });
  }

  /**
   * Resolves an alert and registers its corrective action (US17, US18, US27).
   * @param {string|number} id - Alert identifier.
   * @param {string} description - Corrective action or resolution note.
   * @returns {Promise<import('../domain/model/alert.entity.js').Alert>} Resolved alert.
   * @throws {AlertTransitionError} When the alert is closed or the description is not valid.
   */
  function resolveAlert(id, description) {
    return fetchLatest(id).then((alert) => {
      alert.resolve(description, currentUser.fullName, new Date());
      return saveAlert(alert);
    });
  }

  return {
    alerts,
    errors,
    alertsLoaded,
    loading,
    lastUpdatedAt,
    openAlerts,
    openCriticalCount,
    fetchAlerts,
    getAlertById,
    acknowledgeAlert,
    resolveAlert,
  };
});

export { AlertTransitionError };
export default useAlertsStore;
