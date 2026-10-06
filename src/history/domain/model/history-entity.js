export class HistoryEntity {
  constructor({
    id,
    titleKey,
    type,
    messageKey,
    timestamp,
    severity,
    location,
    sensor,
    isResolved,
    actionsTakenKeys,
  }) {
    this.id = id;
    this.titleKey = titleKey;
    this.type = type;
    this.messageKey = messageKey;
    this.timestamp = new Date(timestamp);
    this.severity = severity;
    this.location = location;
    this.sensor = sensor;
    this.isResolved = isResolved;
    this.actionsTakenKeys = actionsTakenKeys || [];
  }

  static fromResource(resource) {
    return new HistoryEntity({
      id: resource.id,
      titleKey: resource.titleKey,
      type: resource.type,
      messageKey: resource.messageKey,
      timestamp: resource.created_at || resource.timestamp,
      severity: resource.severity_level || resource.severity,
      location: resource.location_name || resource.location,
      sensor: resource.sensor_code || resource.sensor,
      isResolved: resource.is_resolved || resource.isResolved,
      actionsTakenKeys: resource.actionsTakenKeys,
    });
  }
}
