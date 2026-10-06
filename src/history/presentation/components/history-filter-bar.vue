<template>
  <div class="filter-bar">
    <div class="search-box">
      <input
        type="text"
        v-model="localFilters.search"
        :placeholder="$t('history.searchPlaceholder')"
        @input="emitFilters"
      />
    </div>
    <div class="dropdown-filters">
      <select v-model="localFilters.severity" @change="emitFilters">
        <option value="">{{ $t('history.severity') }}</option>
        <option value="critical">Critical</option>
        <option value="warning">Warning</option>
        <option value="success">Resolved</option>
        <option value="info">Info</option>
      </select>
      <button class="clear-btn" @click="clearFilters">
        {{ $t('history.clearFilters') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['filter-change']);
const { t } = useI18n();

const localFilters = ref({
  search: '',
  severity: '',
});

const emitFilters = () => {
  emit('filter-change', { ...localFilters.value });
};

const clearFilters = () => {
  localFilters.value = { search: '', severity: '' };
  emitFilters();
};
</script>

<style scoped>
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
}
.search-box input {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  width: 240px;
}
select {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background-color: #fff;
}
.clear-btn {
  background: none;
  border: none;
  color: #4f46e5;
  cursor: pointer;
  font-size: 0.875rem;
}
</style>
