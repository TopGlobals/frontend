import { BaseApi } from '../../shared/infrastructure/base-api.js';

const http = new BaseApi().http;
const collectionPath = '/settings';

let settingsId;
let saveQueue = Promise.resolve();

async function persist(settings) {
  if (!settingsId) {
    const response = await http.get(collectionPath);
    const savedSettings = response.data.find((item) => item.key === 'global');
    settingsId = savedSettings?.id;
  }

  const resource = { ...settings, key: 'global' };
  if (settingsId) {
    await http.put(`${collectionPath}/${encodeURIComponent(settingsId)}`, {
      ...resource,
      id: settingsId,
    });
    return;
  }

  const response = await http.post(collectionPath, resource);
  settingsId = response.data.id;
}

const settingsApi = {
  save(settings) {
    const operation = saveQueue.catch(() => {}).then(() => persist(settings));
    saveQueue = operation;
    return operation;
  },
};

export default settingsApi;
