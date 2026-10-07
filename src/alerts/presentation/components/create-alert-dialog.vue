<script setup>
import { computed, nextTick, ref, useId, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Alert, ESCALATION_LIMIT_MINUTES } from '../../domain/model/alert.entity.js';
import { AlertSeverity } from '../../domain/model/alert-severity.enum.js';
import { AlertStatus } from '../../domain/model/alert-status.enum.js';
import { useAlertFormatters } from '../composables/use-alert-formatters.js';

/** Generic laboratories always offered, so an alert can be registered with an empty feed. */
const DEFAULT_LABORATORIES = Object.freeze(['Lab 1', 'Lab 2', 'Lab 3']);

/** Controls the dialog visibility. */
const visible = defineModel('visible', { type: Boolean, default: false });

const props = defineProps({
  /** Known laboratories offered as options. */
  laboratories: { type: Array, default: () => [] },
  /** Whether the alert is being saved. */
  submitting: { type: Boolean, default: false },
});

const emit = defineEmits(['confirm']);

const { t } = useI18n();
const { severityLabel, statusLabel } = useAlertFormatters();
const ids = {
  title: useId(),
  severity: useId(),
  laboratory: useId(),
  message: useId(),
  ongoing: useId(),
};

const emptyDraft = () => ({
  title: '',
  severity: null,
  laboratoryName: '',
  message: '',
  ongoing: true,
});
const draft = ref(emptyDraft());
const attempted = ref(false);

const laboratoryOptions = computed(() =>
  [...new Set([...DEFAULT_LABORATORIES, ...props.laboratories])].sort((a, b) =>
    a.localeCompare(b)
  )
);
const severityOptions = computed(() =>
  Object.values(AlertSeverity).map((value) => ({ value, label: severityLabel(value) }))
);
const ongoingOptions = computed(() => [
  { value: true, label: statusLabel(AlertStatus.RAISED) },
  { value: false, label: statusLabel(AlertStatus.CLOSED) },
]);

const messageLength = computed(() => draft.value.message.trim().length);
const invalid = computed(() => ({
  title: !draft.value.title.trim(),
  severity: !draft.value.severity,
  laboratory: !(draft.value.laboratoryName ?? '').trim(),
  message: messageLength.value < Alert.MIN_MESSAGE_LENGTH,
}));

/**
 * @param {string} field - Field key.
 * @returns {boolean} True when the field error must be shown.
 */
const showError = (field) => attempted.value && invalid.value[field];

const severityDescribedBy = computed(() =>
  showError('severity') || draft.value.severity ? `${ids.severity}-hint` : undefined
);
const messageDescribedBy = computed(() =>
  [`${ids.message}-counter`, showError('message') ? `${ids.message}-error` : null]
    .filter(Boolean)
    .join(' ')
);

watch(visible, (isVisible) => {
  if (isVisible) {
    draft.value = emptyDraft();
    attempted.value = false;
  }
});

/** Validates the form, focusing the first invalid field, and emits the new alert data. */
function submit() {
  attempted.value = true;
  const firstInvalid = Object.keys(invalid.value).find((field) => invalid.value[field]);
  if (firstInvalid) {
    nextTick(() => document.getElementById(ids[firstInvalid])?.focus());
    return;
  }
  emit('confirm', { ...draft.value });
}
</script>

<template>
  <pv-dialog
    v-model:visible="visible"
    modal
    :header="t('alerts.createDialog.title')"
    :draggable="false"
    :closable="!submitting"
    :style="{ width: '34rem' }"
    :breakpoints="{ '640px': '94vw' }"
    class="create-alert-dialog"
  >
    <form
      novalidate
      class="create-form"
      @submit.prevent="submit"
    >
      <div class="form-field">
        <label
          :for="ids.title"
          class="field-label"
        >{{ t('alerts.createDialog.titleLabel') }}</label>
        <pv-input-text
          :id="ids.title"
          v-model="draft.title"
          :maxlength="Alert.MAX_TITLE_LENGTH"
          :placeholder="t('alerts.createDialog.titlePlaceholder')"
          :invalid="showError('title')"
          :aria-invalid="showError('title')"
          :aria-describedby="showError('title') ? `${ids.title}-error` : undefined"
          :disabled="submitting"
          class="field-input"
        />
        <p
          v-if="showError('title')"
          :id="`${ids.title}-error`"
          class="field-error"
        >
          <i
            class="pi pi-exclamation-circle"
            aria-hidden="true"
          />
          {{ t('alerts.createDialog.titleError') }}
        </p>
      </div>

      <div class="form-field">
        <label
          :for="ids.severity"
          class="field-label"
        >{{ t('alerts.createDialog.severityLabel') }}</label>
        <pv-select
          v-model="draft.severity"
          :input-id="ids.severity"
          :options="severityOptions"
          option-label="label"
          option-value="value"
          :placeholder="t('alerts.createDialog.severityPlaceholder')"
          :invalid="showError('severity')"
          :aria-describedby="severityDescribedBy"
          :disabled="submitting"
          class="field-input"
        >
          <template #value="{ value, placeholder }">
            <span
              v-if="value"
              class="severity-option"
            >
              <span
                class="severity-dot"
                :class="`dot-${value}`"
                aria-hidden="true"
              />
              {{ severityLabel(value) }}
            </span>
            <span v-else>{{ placeholder }}</span>
          </template>
          <template #option="{ option }">
            <span class="severity-option">
              <span
                class="severity-dot"
                :class="`dot-${option.value}`"
                aria-hidden="true"
              />
              {{ option.label }}
            </span>
          </template>
        </pv-select>
        <p
          v-if="showError('severity')"
          :id="`${ids.severity}-hint`"
          class="field-error"
        >
          <i
            class="pi pi-exclamation-circle"
            aria-hidden="true"
          />
          {{ t('alerts.createDialog.severityError') }}
        </p>
        <p
          v-else-if="draft.severity"
          :id="`${ids.severity}-hint`"
          class="field-hint"
        >
          {{
            t(`alerts.createDialog.severityHint.${draft.severity}`, {
              minutes: ESCALATION_LIMIT_MINUTES,
            })
          }}
        </p>
      </div>

      <div class="form-field">
        <label
          :for="ids.laboratory"
          class="field-label"
        >{{ t('alerts.createDialog.laboratoryLabel') }}</label>
        <pv-select
          v-model="draft.laboratoryName"
          :input-id="ids.laboratory"
          :options="laboratoryOptions"
          editable
          :placeholder="t('alerts.createDialog.laboratoryPlaceholder')"
          :invalid="showError('laboratory')"
          :aria-describedby="showError('laboratory') ? `${ids.laboratory}-error` : undefined"
          :disabled="submitting"
          class="field-input"
        />
        <p
          v-if="showError('laboratory')"
          :id="`${ids.laboratory}-error`"
          class="field-error"
        >
          <i
            class="pi pi-exclamation-circle"
            aria-hidden="true"
          />
          {{ t('alerts.createDialog.laboratoryError') }}
        </p>
      </div>

      <div class="form-field">
        <label
          :for="ids.message"
          class="field-label"
        >{{ t('alerts.createDialog.messageLabel') }}</label>
        <pv-textarea
          :id="ids.message"
          v-model="draft.message"
          rows="3"
          auto-resize
          :maxlength="Alert.MAX_MESSAGE_LENGTH"
          :placeholder="t('alerts.createDialog.messagePlaceholder')"
          :invalid="showError('message')"
          :aria-invalid="showError('message')"
          :aria-describedby="messageDescribedBy"
          :disabled="submitting"
          class="field-input"
        />
        <div class="field-footer">
          <p
            v-if="showError('message')"
            :id="`${ids.message}-error`"
            class="field-error"
          >
            <i
              class="pi pi-exclamation-circle"
              aria-hidden="true"
            />
            {{ t('alerts.createDialog.messageError', { min: Alert.MIN_MESSAGE_LENGTH }) }}
          </p>
          <span
            :id="`${ids.message}-counter`"
            class="counter"
          >{{
            t('alerts.createDialog.counter', {
              count: messageLength,
              max: Alert.MAX_MESSAGE_LENGTH,
            })
          }}</span>
        </div>
      </div>

      <div class="form-field">
        <span
          :id="ids.ongoing"
          class="field-label"
        >{{ t('alerts.createDialog.ongoingLabel') }}</span>
        <pv-select-button
          v-model="draft.ongoing"
          :options="ongoingOptions"
          option-label="label"
          option-value="value"
          :allow-empty="false"
          :aria-labelledby="ids.ongoing"
          :disabled="submitting"
        />
        <p
          v-if="!draft.ongoing"
          class="field-hint resolved-hint"
        >
          <i
            class="pi pi-info-circle"
            aria-hidden="true"
          />
          {{ t('alerts.createDialog.resolvedHint') }}
        </p>
      </div>

      <div class="dialog-actions">
        <pv-button
          type="button"
          :label="t('alerts.createDialog.cancel')"
          severity="secondary"
          :disabled="submitting"
          @click="visible = false"
        />
        <pv-button
          type="submit"
          :label="t('alerts.createDialog.confirm')"
          icon="pi pi-plus"
          :loading="submitting"
        />
      </div>
    </form>
  </pv-dialog>
</template>

<style scoped>
.create-form {
  display: grid;
  gap: 16px;
}

.form-field {
  display: grid;
  gap: 6px;
}

.field-label {
  color: var(--cryo-text);
  font-size: 13px;
  font-weight: 600;
}

.field-input {
  width: 100%;
}

.field-input :deep(.p-select-label) {
  padding: 0 !important;
  font-size: inherit;
}

.field-input.p-invalid {
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 3px var(--cryo-status-critical-bg) !important;
}

.field-hint {
  color: var(--cryo-text-muted);
  font-size: 12px;
}

.resolved-hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--cryo-text-secondary);
}

.resolved-hint i {
  margin-top: 2px;
  color: var(--cryo-primary);
}

.field-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.counter {
  margin-left: auto;
  color: var(--cryo-text-muted);
  font-size: 12px;
  white-space: nowrap;
}

.field-error {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--cryo-status-critical-text);
  font-size: 12px;
  font-weight: 500;
}

.severity-option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.severity-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--cryo-radius-full);
}

.dot-critical {
  background: var(--cryo-status-critical);
}

.dot-warning {
  background: var(--cryo-status-warning);
}

.dot-info {
  background: var(--cryo-status-info);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}
</style>
