const defaultSensors = Object.freeze({
  temperature: true,
  airQuality: true,
  aiDetection: true,
  airConditioning: false,
});

const defaultNotifications = Object.freeze({
  email: true,
  sms: true,
  push: false,
  criticalOnly: true,
});

export class Laboratory {
  constructor({
    id,
    name = '',
    code = '',
    building = '',
    floor = '',
    room = '',
    type = '',
    description = '',
    temperatureMin = 15,
    temperatureMax = 30,
    co2Max = 1000,
    gasSensitivity = 'lowGeneral',
    vibrationMax = 5,
    escalation = 'stopActivity',
    sensors = {},
    notifications = {},
    status = 'pending',
    temperature = null,
    airQuality = null,
    unknown = null,
    updatedAt = null,
  } = {}) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.building = building;
    this.floor = floor;
    this.room = room;
    this.type = type;
    this.description = description;
    this.temperatureMin = temperatureMin;
    this.temperatureMax = temperatureMax;
    this.co2Max = co2Max;
    this.gasSensitivity = gasSensitivity;
    this.vibrationMax = vibrationMax;
    this.escalation = escalation;
    this.sensors = { ...defaultSensors, ...sensors };
    this.notifications = { ...defaultNotifications, ...notifications };
    this.status = status;
    this.temperature = temperature;
    this.airQuality = airQuality;
    this.unknown = unknown;
    this.updatedAt = updatedAt;
  }

  static create(details, id = crypto.randomUUID()) {
    return new Laboratory({ ...details, id });
  }

  static fromJSON(data) {
    return new Laboratory(data);
  }

  static defaultSensors() {
    return { ...defaultSensors };
  }
}
