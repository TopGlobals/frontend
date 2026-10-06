export class MonitoringSensor {
  constructor({
    id = crypto.randomUUID(),
    name = '',
    model = '',
    serial = '',
    type = '',
    location = '',
    status = 'active',
  } = {}) {
    this.id = id;
    this.name = name;
    this.model = model;
    this.serial = serial;
    this.type = type;
    this.location = location;
    this.status = status;
  }

  static fromJSON(data) {
    return new MonitoringSensor(data);
  }
}
