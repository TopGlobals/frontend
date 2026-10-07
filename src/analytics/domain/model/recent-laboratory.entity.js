export class RecentLaboratory {
  constructor({ id = 0, name = '', status = '', type = '', temperature = 0 }) {
    this.id = id;
    this.name = name;
    this.status = status;
    this.type = type;
    this.temperature = temperature;
  }
}
