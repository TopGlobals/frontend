/**
 * Corrective action registered by laboratory staff to resolve an alert.
 * The description is part of the audit trail (US17, US27).
 *
 * @class CorrectiveAction
 */
export class CorrectiveAction {
  /** Minimum length of a valid technical justification (US27). */
  static MIN_DESCRIPTION_LENGTH = 10;

  /** Maximum length accepted for a description. */
  static MAX_DESCRIPTION_LENGTH = 500;

  /**
   * @param {Object} params - Value attributes.
   * @param {string} [params.description=''] - What was done to restore the safe condition.
   * @param {string} [params.technicianName=''] - Person who registered the action.
   * @param {?Date} [params.takenAt=null] - When the action was registered.
   */
  constructor({ description = '', technicianName = '', takenAt = null }) {
    this.description = description;
    this.technicianName = technicianName;
    this.takenAt = takenAt instanceof Date ? takenAt : null;
  }

  /**
   * Checks whether a description is long enough to be accepted in an audit.
   * @param {string} description - Text to validate.
   * @returns {boolean} True when the trimmed text has the minimum length.
   */
  static isValidDescription(description) {
    const length = (description ?? '').trim().length;
    return (
      length >= CorrectiveAction.MIN_DESCRIPTION_LENGTH &&
      length <= CorrectiveAction.MAX_DESCRIPTION_LENGTH
    );
  }
}
