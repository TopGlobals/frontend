export class RecentAlert {
  constructor({ id = 0, severity = 'info', time = new Date(), title = '', description = '' }) {
    this.id = id;
    this.severity = severity;
    this.time = time;
    this.title = title;
    this.description = description;
  }
}
