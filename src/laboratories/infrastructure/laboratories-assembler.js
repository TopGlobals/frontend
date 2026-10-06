import { Laboratory } from '../domain/model/laboratory.js';

export class LaboratoriesAssembler {
  static toEntityFromResource(resource) {
    if (!resource || typeof resource !== 'object' || Array.isArray(resource)) {
      throw new TypeError('Laboratory resource must be an object.');
    }
    return Laboratory.fromJSON(resource);
  }

  static toEntityFromResponse(response) {
    this.assertSuccessfulResponse(response);
    return this.toEntityFromResource(response.data);
  }

  static toEntitiesFromResponse(response) {
    this.assertSuccessfulResponse(response);
    const resources = Array.isArray(response.data) ? response.data : response.data?.laboratories;
    if (!Array.isArray(resources)) {
      throw new TypeError('Laboratories API response must contain an array.');
    }
    return resources.map((resource) => this.toEntityFromResource(resource));
  }

  static assertSuccessfulResponse(response) {
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Laboratories API request failed: ${response.status} ${response.statusText}`);
    }
  }
}
