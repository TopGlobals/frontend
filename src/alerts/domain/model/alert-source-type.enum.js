/**
 * Domain events that can originate an alert.
 *
 * @readonly
 * @enum {string}
 */
export const AlertSourceType = Object.freeze({
  THERMAL_EXCURSION: 'thermal-excursion',
  PREVENTIVE_TREND: 'preventive-trend',
  THERMAL_STATUS_NORMALIZED: 'thermal-status-normalized',
  CALIBRATION_DUE: 'calibration-due',
});
