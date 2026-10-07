<script setup>
import { computed, ref, useId, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { CorrectiveAction } from '../../domain/model/corrective-action.entity.js';

/** Controls the dialog visibility. */
const visible = defineModel('visible', { type: Boolean, default: false });

const props = defineProps({
  /** Alert being resolved. */
  alert: { type: Object, default: null },
  /** Whether the resolution is being saved. */
  submitting: { type: Boolean, default: false },
});

const emit = defineEmits(['confirm']);

const { t } = useI18n();
const fieldId = useId();
const hintId = useId();
const errorId = useId();
const counterId = useId();

const description = ref('');
const attempted = ref(false);

const isRequired = computed(() => !!props.alert?.requiresCorrectiveAction);
const length = computed(() => description.value.trim().length);
const isValid = computed(() =>
  isRequired.value
    ? CorrectiveAction.isValidDescription(description.value)
    : length.value <= CorrectiveAction.MAX_DESCRIPTION_LENGTH
);
const showError = computed(() => attempted.value && !isValid.value);
const describedBy = computed(() =>
  [hintId, counterId, showError.value ? errorId : null].filter(Boolean).join(' ')
);

watch(visible, (isVisible) => {
  if (isVisible) {
    description.value = '';
    attempted.value = false;
  }
});

/** Validates the form and emits the corrective action description. */
function submit() {
  attempted.value = true;
  if (!isValid.value) return;
  emit('confirm', description.value.trim());
}
</script>

<template>
  <pv-dialog
    v-model:visible="visible"
    modal
    :header="t('alerts.resolveDialog.title')"
    :draggable="false"
    :closable="!submitting"
    :style="{ width: '34rem' }"
    :breakpoints="{ '640px': '94vw' }"
    class="resolve-dialog"
  >
    <form
      v-if="alert"
      novalidate
      @submit.prevent="submit"
    >
      <div class="alert-summary">
        <strong>{{ alert.title }}</strong>
        <span>{{ alert.laboratoryName }} · {{ alert.storageUnitName }}</span>
      </div>

      <label
        :for="fieldId"
        class="field-label"
      >
        {{ t('alerts.resolveDialog.label') }}
        <span class="field-requirement">
          {{ isRequired ? t('alerts.resolveDialog.required') : t('alerts.resolveDialog.optional') }}
        </span>
      </label>
      <pv-textarea
        :id="fieldId"
        v-model="description"
        rows="5"
        auto-resize
        :maxlength="CorrectiveAction.MAX_DESCRIPTION_LENGTH"
        :placeholder="t('alerts.resolveDialog.placeholder')"
        :invalid="showError"
        :aria-required="isRequired"
        :aria-invalid="showError"
        :aria-describedby="describedBy"
        class="field-input"
        :disabled="submitting"
      />
      <div class="field-footer">
        <p :id="hintId">
          {{
            isRequired
              ? t('alerts.resolveDialog.hintRequired', {
                min: CorrectiveAction.MIN_DESCRIPTION_LENGTH,
              })
              : t('alerts.resolveDialog.hintOptional')
          }}
        </p>
        <span
          :id="counterId"
          class="counter"
        >{{
          t('alerts.resolveDialog.counter', {
            count: length,
            max: CorrectiveAction.MAX_DESCRIPTION_LENGTH,
          })
        }}</span>
      </div>
      <p
        v-if="showError"
        :id="errorId"
        class="field-error"
        role="alert"
      >
        <i
          class="pi pi-exclamation-circle"
          aria-hidden="true"
        />
        {{ t('alerts.resolveDialog.error', { min: CorrectiveAction.MIN_DESCRIPTION_LENGTH }) }}
      </p>
      <p class="audit-note">
        <i
          class="pi pi-shield"
          aria-hidden="true"
        />
        {{ t('alerts.resolveDialog.auditNote') }}
      </p>

      <div class="dialog-actions">
        <pv-button
          type="button"
          :label="t('alerts.resolveDialog.cancel')"
          severity="secondary"
          :disabled="submitting"
          @click="visible = false"
        />
        <pv-button
          type="submit"
          :label="t('alerts.resolveDialog.confirm')"
          icon="pi pi-check"
          :loading="submitting"
        />
      </div>
    </form>
  </pv-dialog>
</template>

<style scoped>
.alert-summary {
  display: grid;
  gap: 2px;
  margin-bottom: 18px;
  padding: 12px 14px;
  background: var(--cryo-surface-alt);
  border: 1px solid var(--cryo-border-subtle);
  border-radius: var(--cryo-radius-md);
}

.alert-summary strong {
  color: var(--cryo-text);
  font-size: 14px;
}

.alert-summary span {
  color: var(--cryo-text-secondary);
  font-size: 12px;
}

.field-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  color: var(--cryo-text);
  font-size: 13px;
  font-weight: 600;
}

.field-requirement {
  color: var(--cryo-text-muted);
  font-size: 12px;
  font-weight: 500;
}

.field-input {
  width: 100%;
}

.field-input.p-invalid {
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 3px var(--cryo-status-critical-bg) !important;
}

.field-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 6px;
  color: var(--cryo-text-muted);
  font-size: 12px;
}

.counter {
  white-space: nowrap;
}

.field-error {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  color: var(--cryo-status-critical-text);
  font-size: 12px;
  font-weight: 500;
}

.audit-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 14px;
  color: var(--cryo-text-secondary);
  font-size: 12px;
}

.audit-note i {
  margin-top: 2px;
  color: var(--cryo-primary);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
