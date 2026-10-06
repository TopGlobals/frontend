import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { Laboratory } from '../domain/model/laboratory.js';

const http = new BaseApi().http;
const collectionPath = '/laboratories';

const laboratoriesApi = {
  async getAll() {
    const { data } = await http.get(collectionPath);
    if (!Array.isArray(data)) {
      throw new TypeError('Laboratory API response must be an array.');
    }
    return data.map((laboratory) => Laboratory.fromJSON(laboratory));
  },
  async create(laboratory) {
    const { data } = await http.post(collectionPath, laboratory);
    return Laboratory.fromJSON(data);
  },
  async remove(id) {
    await http.delete(`${collectionPath}/${encodeURIComponent(id)}`);
  },
};

export default laboratoriesApi;
