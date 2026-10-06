import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Laboratory } from '../domain/model/laboratory.js';
import laboratoriesApi from '../infrastructure/laboratories-api.js';

const useLaboratoriesStore = defineStore('laboratories', () => {
  const laboratories = ref([]);

  async function loadLaboratories() {
    laboratories.value = await laboratoriesApi.getAll();
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

  return { laboratories, loadLaboratories, addLaboratory, removeLaboratory };
});

export default useLaboratoriesStore;
