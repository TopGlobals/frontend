import { RecentLaboratory } from '../domain/model/recent-laboratory.entity.js';

export class RecentLaboratoryAssembler {
  static toEntityFromResource(resource) {
    return new RecentLaboratory({ ...resource });
  }

  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status}, ${response.statusText}`);
      return [];
    }
    let resources =
      response.data instanceof Array ? response.data : response.data['recent-laboratories'];
    return resources.map((resource) => this.toEntityFromResource(resource));
  }
}
