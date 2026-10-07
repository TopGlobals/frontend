/**
 * Lifecycle states of an alert: Raised -> Acknowledged -> Closed.
 * Mirrors the AlertStatus enum of the Incident Management domain model.
 *
 * @readonly
 * @enum {string}
 */
export const AlertStatus = Object.freeze({
  RAISED: 'raised',
  ACKNOWLEDGED: 'acknowledged',
  CLOSED: 'closed',
});
