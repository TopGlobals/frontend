import { HistoricalData } from '../domain/model/historical-data.entity.js';

export class HistoricalDataAssembler {
  static toEntityFromResource(resource) {
    return new HistoricalData({ ...resource });
  }

  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status}, ${response.statusText}`);
      return [];
    }
    let resources =
      response.data instanceof Array ? response.data : response.data['historical-data'];
    return resources.map((resource) => this.toEntityFromResource(resource));
  }
}
