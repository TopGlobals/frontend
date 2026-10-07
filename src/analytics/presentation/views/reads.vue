<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue';
import useAnalyticsStore from '../../application/analytics.store.js';

const { t } = useI18n();
const confirm = useConfirm();
const store = useAnalyticsStore();
const showForm = ref(false);
const editingReading = ref(null);
const form = ref({ timestamp: '', value: 0 });

function openCreate() {
  editingReading.value = null;
  form.value = { timestamp: new Date().toISOString().slice(0, 16), value: 0 };
  showForm.value = true;
}

function openEdit(reading) {
  editingReading.value = reading;
  form.value = {
    timestamp: new Date(reading.timestamp).toISOString().slice(0, 16),
    value: reading.value,
  };
  showForm.value = true;
}

async function saveReading() {
  const reading = {
    id: editingReading.value?.id,
    timestamp: new Date(form.value.timestamp).toISOString(),
    value: Number(form.value.value),
  };
  if (editingReading.value) await store.updateReading(reading);
  else await store.createReading(reading);
  showForm.value = false;
}

function confirmDelete(reading) {
  confirm.require({
    message: t('analytics.readings.confirmDelete'),
    header: t('analytics.readings.deleteTitle'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => store.deleteReading(reading.id),
  });
}

onMounted(() => {
  if (!store.readingsLoaded) store.fetchReadings();
});
</script>

<template>
  <div class="readings-page">
    <div class="readings-toolbar">
      <h2>{{ t('analytics.readings.tableTitle') }}</h2>
      <pv-button :label="t('analytics.readings.new')" icon="pi pi-plus" @click="openCreate" />
    </div>
    <pv-data-table
      :value="store.historicalData"
      :loading="!store.readingsLoaded"
      paginator
      :rows="10"
      :rows-per-page-options="[10, 25, 50]"
      striped-rows
      table-style="min-width: 40rem"
    >
      <pv-column :header="t('analytics.readings.id')" field="id" sortable />
      <pv-column :header="t('analytics.readings.timestamp')" field="timestamp" sortable>
        <template #body="{ data }">{{ new Date(data.timestamp).toLocaleString() }}</template>
      </pv-column>
      <pv-column :header="t('analytics.readings.value')" field="value" sortable>
        <template #body="{ data }">{{ data.value }}°C</template>
      </pv-column>
      <pv-column :header="t('analytics.readings.actions')">
        <template #body="{ data }">
          <pv-button icon="pi pi-pencil" rounded text @click="openEdit(data)" />
          <pv-button
            icon="pi pi-trash"
            rounded
            severity="danger"
            text
            @click="confirmDelete(data)"
          />
        </template>
      </pv-column>
    </pv-data-table>

    <pv-dialog
      v-model:visible="showForm"
      modal
      :header="editingReading ? t('analytics.readings.edit') : t('analytics.readings.new')"
    >
      <form class="reading-form" @submit.prevent="saveReading">
        <label for="reading-timestamp">{{ t('analytics.readings.timestamp') }}</label>
        <input id="reading-timestamp" v-model="form.timestamp" type="datetime-local" required />
        <label for="reading-value">{{ t('analytics.readings.value') }}</label>
        <input id="reading-value" v-model.number="form.value" type="number" step="0.1" required />
        <div class="reading-form__actions">
          <pv-button type="submit" :label="t('analytics.readings.save')" />
          <pv-button
            type="button"
            severity="secondary"
            :label="t('analytics.readings.cancel')"
            @click="showForm = false"
          />
        </div>
      </form>
    </pv-dialog>
    <pv-confirm-dialog />
  </div>
</template>

<style scoped>
.readings-page {
  padding: 1.5rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
}
.readings-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.reading-form {
  display: grid;
  gap: 0.5rem;
  min-width: 22rem;
}
.reading-form input {
  padding: 0.6rem;
  border: 1px solid #dfe6ef;
  border-radius: 0.5rem;
}
.reading-form__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}
</style>
