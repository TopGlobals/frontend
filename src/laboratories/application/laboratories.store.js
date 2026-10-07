import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Laboratory } from '../domain/model/laboratory.js';
import laboratoriesApi from '../infrastructure/laboratories-api.js';

const useLaboratoriesStore = defineStore('laboratories', () => {
  const laboratories = ref([]);

  async function loadLaboratories() {
    laboratories.value = await laboratoriesApi.getAll();
  }

  async function getLaboratory(id) {
    const laboratory = await laboratoriesApi.getById(id);
    const index = laboratories.value.findIndex((item) => String(item.id) === String(id));
    if (index === -1) laboratories.value.push(laboratory);
    else laboratories.value.splice(index, 1, laboratory);
    return laboratory;
  }

  async function addLaboratory(details) {
    const laboratory = Laboratory.create(details);
    const savedLaboratory = await laboratoriesApi.create(laboratory);
    laboratories.value.unshift(savedLaboratory);
    return savedLaboratory;
  }

  async function removeLaboratory(id) {
    await laboratoriesApi.remove(id);
    laboratories.value = laboratories.value.filter((laboratory) => laboratory.id !== id);
  }

  async function updateLaboratory(id, details) {
    const currentLaboratory = laboratories.value.find((laboratory) => String(laboratory.id) === String(id));
    const laboratory = Laboratory.create({ ...currentLaboratory, ...details }, id);
    const savedLaboratory = await laboratoriesApi.update(id, laboratory);
    const index = laboratories.value.findIndex((item) => String(item.id) === String(id));
    if (index !== -1) laboratories.value.splice(index, 1, savedLaboratory);
    return savedLaboratory;
  }

  return {
    laboratories,
    loadLaboratories,
    getLaboratory,
    addLaboratory,
    updateLaboratory,
    removeLaboratory,
  };
});

export default useLaboratoriesStore;
