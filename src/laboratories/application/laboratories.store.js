import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

const storageKey = 'cryovigil.laboratories';

function loadLaboratories() {
  const savedLaboratories = localStorage.getItem(storageKey);
  if (!savedLaboratories) return [];

  const parsedLaboratories = JSON.parse(savedLaboratories);
  if (!Array.isArray(parsedLaboratories)) {
    throw new TypeError('Saved laboratory data must be an array.');
  }
  return parsedLaboratories;
}

const useLaboratoriesStore = defineStore('laboratories', () => {
  const laboratories = ref(loadLaboratories());

  watch(
    laboratories,
    (value) => localStorage.setItem(storageKey, JSON.stringify(value)),
    { deep: true },
  );

  function addLaboratory(details) {
    const laboratory = {
      ...details,
      id: crypto.randomUUID(),
      status: 'pending',
      temperature: null,
      airQuality: null,
      unknown: null,
    };
    laboratories.value.unshift(laboratory);
    return laboratory;
  }

  function removeLaboratory(id) {
    laboratories.value = laboratories.value.filter((laboratory) => laboratory.id !== id);
  }

  return { laboratories, addLaboratory, removeLaboratory };
});

export default useLaboratoriesStore;
