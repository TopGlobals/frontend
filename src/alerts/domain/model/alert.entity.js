import { AlertSeverity, AlertSeverityRank } from './alert-severity.enum.js';
import { AlertStatus } from './alert-status.enum.js';
import { CorrectiveAction } from './corrective-action.entity.js';

/** Minutes a critical alert may stay unacknowledged before escalation (US26). */
export const ESCALATION_LIMIT_MINUTES = 15;

const MILLISECONDS_PER_MINUTE = 60000;

/**
 * Error thrown when a lifecycle transition is not allowed for an alert.
 *
 * @class AlertTransitionError
 * @extends Error
 */
export class AlertTransitionError extends Error {
  /**
   * @param {string} reason - Machine-readable reason (e.g. 'already-acknowledged').
   * @param {Object} [details={}] - Extra data used to build user-facing messages.
   */
  constructor(reason, details = {}) {
    super(reason);
    this.name = 'AlertTransitionError';
    this.reason = reason;
    this.details = details;
  }
}

/**
 * Alert aggregate of the Alerts bounded context (Incident Management in the report).
 * Holds the alert data shown in the alert feed and enforces its lifecycle rules.
 *
 * @class Alert
 */
export class Alert {
  /**
   * @param {Object} params - Entity attributes.
   * @param {?string} [params.id=null] - Alert identifier.
   * @param {string} [params.code=''] - Human-readable code (e.g. ALT-20261005-001).
   * @param {string} [params.title=''] - Short summary of the alert.
   * @param {string} [params.message=''] - Full description of what was detected.
   * @param {string} [params.severity] - One of AlertSeverity.
   * @param {string} [params.status] - One of AlertStatus.
   * @param {string} [params.sourceType=''] - One of AlertSourceType.
   * @param {string} [params.laboratoryName=''] - Laboratory where the alert was raised.
   * @param {string} [params.storageUnitName=''] - Affected storage unit.
   * @param {string} [params.sensorCode=''] - Sensor that reported the reading.
   * @param {?number} [params.readingCelsius=null] - Reading that triggered the alert.
   * @param {?number} [params.safeMinCelsius=null] - Lower bound of the safe range.
   * @param {?number} [params.safeMaxCelsius=null] - Upper bound of the safe range.
   * @param {?Date} [params.raisedAt=null] - When the alert was raised.
   * @param {?Date} [params.acknowledgedAt=null] - When the alert was acknowledged.
   * @param {?string} [params.acknowledgedBy=null] - Who acknowledged the alert.
   * @param {?Date} [params.resolvedAt=null] - When the alert was resolved.
   * @param {?string} [params.resolvedBy=null] - Who resolved the alert.
   * @param {CorrectiveAction[]} [params.correctiveActions=[]] - Registered corrective actions.
   * @param {Array<{takenAt: Date, valueCelsius: number}>} [params.readings=[]] - Recent readings.
   */
  constructor({
    id = null,
    code = '',
    title = '',
    message = '',
    severity = AlertSeverity.INFO,
    status = AlertStatus.RAISED,
    sourceType = '',
    laboratoryName = '',
    storageUnitName = '',
    sensorCode = '',
    readingCelsius = null,
    safeMinCelsius = null,
    safeMaxCelsius = null,
    raisedAt = null,
    acknowledgedAt = null,
    acknowledgedBy = null,
    resolvedAt = null,
    resolvedBy = null,
    correctiveActions = [],
    readings = [],
  }) {
    this.id = id;
    this.code = code;
    this.title = title;
    this.message = message;
    this.severity = severity;
    this.status = status;
    this.sourceType = sourceType;
    this.laboratoryName = laboratoryName;
    this.storageUnitName = storageUnitName;
    this.sensorCode = sensorCode;
    this.readingCelsius = readingCelsius;
    this.safeMinCelsius = safeMinCelsius;
    this.safeMaxCelsius = safeMaxCelsius;
    this.raisedAt = raisedAt;
    this.acknowledgedAt = acknowledgedAt;
    this.acknowledgedBy = acknowledgedBy;
    this.resolvedAt = resolvedAt;
    this.resolvedBy = resolvedBy;
    this.correctiveActions = correctiveActions.filter(
      (action) => action instanceof CorrectiveAction
    );
    this.readings = readings;
  }

  /** @returns {boolean} True while the alert has not been resolved. */
  get isOpen() {
    return this.status !== AlertStatus.CLOSED;
  }

  /** @returns {boolean} True when nobody has responded to the alert yet. */
  get canBeAcknowledged() {
    return this.status === AlertStatus.RAISED;
  }

  /** @returns {boolean} Critical alerts open an incident that needs a corrective action. */
  get requiresCorrectiveAction() {
    return this.severity === AlertSeverity.CRITICAL;
  }

  /** @returns {number} Sort rank of the severity (0 is the most urgent). */
  get severityRank() {
    return AlertSeverityRank[this.severity] ?? Number.MAX_SAFE_INTEGER;
  }

  /** @returns {boolean} True when the triggering reading is outside the safe range. */
  get isReadingOutOfRange() {
    if (this.readingCelsius === null) return false;
    const belowMin = this.safeMinCelsius !== null && this.readingCelsius < this.safeMinCelsius;
    const aboveMax = this.safeMaxCelsius !== null && this.readingCelsius > this.safeMaxCelsius;
    return belowMin || aboveMax;
  }

  /**
   * Minutes the alert has been open, or took to be resolved.
   * @param {Date} now - Reference time.
   * @returns {number} Elapsed whole minutes.
   */
  durationMinutes(now) {
    if (!this.raisedAt) return 0;
    const end = this.resolvedAt ?? now;
    return Math.max(0, Math.floor((end - this.raisedAt) / MILLISECONDS_PER_MINUTE));
  }

  /**
   * A critical alert is unattended when nobody acknowledged it within the limit (US08, US26).
   * @param {Date} now - Reference time.
   * @param {number} [limitMinutes=ESCALATION_LIMIT_MINUTES] - Allowed response time.
   * @returns {boolean} True when the alert must be escalated.
   */
  isUnattended(now, limitMinutes = ESCALATION_LIMIT_MINUTES) {
    return (
      this.severity === AlertSeverity.CRITICAL &&
      this.status === AlertStatus.RAISED &&
      this.durationMinutes(now) >= limitMinutes
    );
  }

  /**
   * Marks the alert as being handled by a staff member (US09).
   * @param {string} userName - Person taking control of the alert.
   * @param {Date} now - Time of the acknowledgment.
   * @throws {AlertTransitionError} When the alert was already acknowledged or closed.
   */
  acknowledge(userName, now) {
    if (!this.canBeAcknowledged) {
      throw new AlertTransitionError('already-acknowledged', {
        acknowledgedBy: this.acknowledgedBy,
      });
    }
    this.status = AlertStatus.ACKNOWLEDGED;
    this.acknowledgedBy = userName;
    this.acknowledgedAt = now;
  }

  /**
   * Closes the alert and records the corrective action taken (US17, US18, US27).
   * @param {string} description - Corrective action or resolution note.
   * @param {string} userName - Person resolving the alert.
   * @param {Date} now - Time of the resolution.
   * @throws {AlertTransitionError} When the alert is closed or the description is not valid.
   */
  resolve(description, userName, now) {
    if (!this.isOpen) {
      throw new AlertTransitionError('already-closed', { resolvedBy: this.resolvedBy });
    }
    const note = (description ?? '').trim();
    if (this.requiresCorrectiveAction && !CorrectiveAction.isValidDescription(note)) {
      throw new AlertTransitionError('corrective-action-required');
    }
    if (note) {
      this.correctiveActions.push(
        new CorrectiveAction({ description: note, technicianName: userName, takenAt: now })
      );
    }
    if (this.status === AlertStatus.RAISED) {
      this.acknowledgedBy = userName;
      this.acknowledgedAt = now;
    }
    this.status = AlertStatus.CLOSED;
    this.resolvedBy = userName;
    this.resolvedAt = now;
  }
}
