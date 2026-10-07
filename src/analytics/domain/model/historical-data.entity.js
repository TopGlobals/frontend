export class HistoricalData {
  constructor({ id = null, timestamp = new Date(), value = 0 }) {
    this.id = id;
    this.timestamp = timestamp instanceof Date ? timestamp : new Date(timestamp);
    this.value = value;
  }
}
