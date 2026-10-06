import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { AlertSeverity } from '../../domain/model/alert-severity.enum.js';
import { AlertSourceType } from '../../domain/model/alert-source-type.enum.js';
import { AlertStatus } from '../../domain/model/alert-status.enum.js';

/** Maps the app locale to the BCP 47 locale required by the project (en-US, es-419). */
const intlLocales = { en: 'en-US', es: 'es-419' };

const severityIcons = {
  [AlertSeverity.CRITICAL]: 'pi pi-exclamation-circle',
  [AlertSeverity.WARNING]: 'pi pi-exclamation-triangle',
  [AlertSeverity.INFO]: 'pi pi-info-circle',
};

const sourceIcons = {
  [AlertSourceType.THERMAL_EXCURSION]: 'pi pi-bolt',
  [AlertSourceType.PREVENTIVE_TREND]: 'pi pi-chart-line',
  [AlertSourceType.THERMAL_STATUS_NORMALIZED]: 'pi pi-check-circle',
  [AlertSourceType.CALIBRATION_DUE]: 'pi pi-wrench',
};

/** PrimeVue Tag severities styled by the CryoVigil design tokens in style.css. */
const severityTagTypes = {
  [AlertSeverity.CRITICAL]: 'danger',
  [AlertSeverity.WARNING]: 'warn',
  [AlertSeverity.INFO]: 'info',
};

const statusTagTypes = {
  [AlertStatus.RAISED]: 'danger',
  [AlertStatus.ACKNOWLEDGED]: 'warn',
  [AlertStatus.CLOSED]: 'success',
};

/**
 * Locale-aware formatting and presentation helpers for alert views.
 * @returns {Object} Formatting functions.
 */
export function useAlertFormatters() {
  const { t, locale } = useI18n();
  const intlLocale = computed(() => intlLocales[locale.value] ?? locale.value);

  /**
   * @param {?number} value - Temperature in Celsius.
   * @returns {string} Formatted temperature or a dash.
   */
  function formatTemperature(value) {
    if (value === null || value === undefined) return '—';
    const number = new Intl.NumberFormat(intlLocale.value, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value);
    return `${number} °C`;
  }

  /**
   * @param {?number} min - Lower bound.
   * @param {?number} max - Upper bound.
   * @returns {string} Formatted safe range.
   */
  function formatRange(min, max) {
    if (min === null && max === null) return '—';
    if (min === null) return t('alerts.details.rangeMax', { max: formatTemperature(max) });
    if (max === null) return t('alerts.details.rangeMin', { min: formatTemperature(min) });
    return t('alerts.details.range', { min: formatTemperature(min), max: formatTemperature(max) });
  }

  /**
   * @param {?Date} date - Date to describe.
   * @param {Date} now - Reference time.
   * @returns {string} Relative time such as "5 min ago".
   */
  function formatRelative(date, now) {
    if (!date) return '—';
    const minutes = Math.round((date - now) / 60000);
    if (Math.abs(minutes) < 1) return t('alerts.time.justNow');
    const formatter = new Intl.RelativeTimeFormat(intlLocale.value, {
      numeric: 'auto',
      style: 'short',
    });
    if (Math.abs(minutes) < 60) return formatter.format(minutes, 'minute');
    const hours = Math.round(minutes / 60);
    if (Math.abs(hours) < 24) return formatter.format(hours, 'hour');
    return formatter.format(Math.round(hours / 24), 'day');
  }

  /**
   * @param {?Date} date - Date to format.
   * @returns {string} Date and time in the current locale.
   */
  function formatDateTime(date) {
    if (!date) return '—';
    return new Intl.DateTimeFormat(intlLocale.value, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }

  /**
   * @param {?Date} date - Date to format.
   * @returns {string} Clock time in the current locale.
   */
  function formatClock(date) {
    if (!date) return '—';
    return new Intl.DateTimeFormat(intlLocale.value, { timeStyle: 'short' }).format(date);
  }

  /**
   * @param {number} totalMinutes - Duration in minutes.
   * @returns {string} Duration such as "1 h 20 min".
   */
  function formatDuration(totalMinutes) {
    if (totalMinutes < 1) return t('alerts.time.lessThanMinute');
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    if (days) return t('alerts.time.daysHours', { days, hours });
    if (hours) return t('alerts.time.hoursMinutes', { hours, minutes });
    return t('alerts.time.minutes', { minutes });
  }

  return {
    intlLocale,
    formatTemperature,
    formatRange,
    formatRelative,
    formatDateTime,
    formatClock,
    formatDuration,
    severityLabel: (severity) => t(`alerts.severity.${severity}`),
    statusLabel: (status) => t(`alerts.status.${status}`),
    sourceLabel: (sourceType) => t(`alerts.source.${sourceType}`),
    severityIcon: (severity) => severityIcons[severity] ?? 'pi pi-bell',
    sourceIcon: (alert) => sourceIcons[alert.sourceType] ?? severityIcons[alert.severity],
    severityTagType: (severity) => severityTagTypes[severity] ?? 'secondary',
    statusTagType: (status) => statusTagTypes[status] ?? 'secondary',
  };
}
