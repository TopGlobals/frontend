/**
 * Severity levels of an alert within the Alerts bounded context.
 * Ordered from most to least urgent.
 *
 * @readonly
 * @enum {string}
 */
export const AlertSeverity = Object.freeze({
  CRITICAL: 'critical',
  WARNING: 'warning',
  INFO: 'info',
});

/**
 * Priority rank used to sort alerts (lower value means more urgent).
 * @type {Readonly<Record<string, number>>}
 */
export const AlertSeverityRank = Object.freeze({
  [AlertSeverity.CRITICAL]: 0,
  [AlertSeverity.WARNING]: 1,
  [AlertSeverity.INFO]: 2,
});
