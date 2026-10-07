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
import { Alert, AlertTransitionError } from '../domain/model/alert.entity.js';

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

  /**
   * Builds the next sequential alert code of the day (e.g. ALT-20261005-004).
   * @param {Date} now - Time of the report.
   * @returns {string} Unused alert code.
   */
  function nextAlertCode(now) {
    const day = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
      .map((part) => String(part).padStart(2, '0'))
      .join('');
    const prefix = `ALT-${day}-`;
    const lastNumber = alerts.value
      .filter((alert) => alert.code?.startsWith(prefix))
      .reduce((max, alert) => Math.max(max, Number(alert.code.slice(prefix.length)) || 0), 0);
    return `${prefix}${String(lastNumber + 1).padStart(3, '0')}`;
  }

  /**
   * Registers an alert reported manually by the current user.
   * @param {Object} draft - Title, message, severity, laboratoryName and ongoing flag.
   * @returns {Promise<import('../domain/model/alert.entity.js').Alert>} Created alert.
   * @throws {AlertTransitionError} When a resolved critical alert has no valid note.
   */
  function createAlert(draft) {
    const now = new Date();
    return Promise.resolve()
      .then(() => Alert.report({ ...draft, code: nextAlertCode(now) }, currentUser.fullName, now))
      .then((alert) => {
        const resource = AlertAssembler.toResourceFromEntity(alert);
        delete resource.id; // The server assigns the identifier.
        return alertsApi.createAlert(resource);
      })
      .then((response) => {
        const created = AlertAssembler.toEntityFromResource(response.data);
        alerts.value.push(created);
        return created;
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
    createAlert,
  };
});

export { AlertTransitionError };
export default useAlertsStore;
