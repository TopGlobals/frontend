import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const alertsEndpointPath = import.meta.env.VITE_ALERTS_ENDPOINT_PATH;

/**
 * Infrastructure gateway for the Alerts bounded-context endpoints.
 *
 * @class AlertsApi
 * @extends BaseApi
 */
export class AlertsApi extends BaseApi {
  /**
   * @type {BaseEndpoint}
   * @private
   */
  #alertsEndpoint;

  /** Creates the endpoint client for alerts. */
  constructor() {
    super();
    this.#alertsEndpoint = new BaseEndpoint(this, alertsEndpointPath);
  }

  /**
   * Fetches all alerts of the alert feed.
   * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the alerts response.
   */
  getAlerts() {
    return this.#alertsEndpoint.getAll();
  }

  /**
   * Fetches one alert by its identifier.
   * @param {string|number} id - Alert identifier.
   * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the alert response.
   */
  getAlertById(id) {
    return this.#alertsEndpoint.getById(id);
  }

  /**
   * Creates an alert resource.
   * @param {Object} resource - Alert resource payload without id.
   * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created alert.
   */
  createAlert(resource) {
    return this.#alertsEndpoint.create(resource);
  }

  /**
   * Updates an alert resource.
   * @param {Object} resource - Alert resource payload (must include id).
   * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated alert.
   */
  updateAlert(resource) {
    return this.#alertsEndpoint.update(resource.id, resource);
  }
}
