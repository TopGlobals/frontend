import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const analyticsEndpointPath = import.meta.env.VITE_ANALYTICS_ENDPOINT_PATH;

export class AnalyticsApi extends BaseApi {
  #analyticsEndpoint;

  constructor() {
    super();
    this.#analyticsEndpoint = new BaseEndpoint(this, analyticsEndpointPath);
  }

  createData(resource) {
    return this.#analyticsEndpoint.create(resource);
  }

  getRecentData() {
    return this.#analyticsEndpoint.getAll();
  }

  updateData(resource) {
    return this.#analyticsEndpoint.update(resource.id, resource);
  }

  deleteData(id) {
    return this.#analyticsEndpoint.delete(id);
  }
}
