export class Kpi {
  constructor({
    totalLaboratories = 0,
    activeAlerts = 0,
    systemsHealth = 0,
    upcomingMaintenance = 0,
  }) {
    this.totalLaboratories = totalLaboratories;
    this.activeAlerts = activeAlerts;
    this.systemsHealth = systemsHealth;
    this.upcomingMaintenance = upcomingMaintenance;
  }
}
