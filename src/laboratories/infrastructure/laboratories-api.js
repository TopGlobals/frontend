import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { LaboratoriesAssembler } from './laboratories-assembler.js';

const http = new BaseApi().http;
const collectionPath = '/laboratories';

const laboratoriesApi = {
  async getAll() {
    const response = await http.get(collectionPath);
    return LaboratoriesAssembler.toEntitiesFromResponse(response);
  },
  async getById(id) {
    const response = await http.get(`${collectionPath}/${encodeURIComponent(id)}`);
    return LaboratoriesAssembler.toEntityFromResponse(response);
  },
  async create(laboratory) {
    const response = await http.post(collectionPath, laboratory);
    return LaboratoriesAssembler.toEntityFromResponse(response);
  },
  async update(id, laboratory) {
    const response = await http.put(`${collectionPath}/${encodeURIComponent(id)}`, laboratory);
    return LaboratoriesAssembler.toEntityFromResponse(response);
  },
  async remove(id) {
    await http.delete(`${collectionPath}/${encodeURIComponent(id)}`);
  },
};

export default laboratoriesApi;
