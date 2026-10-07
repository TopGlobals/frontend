import { Alert } from '../domain/model/alert.entity.js';
import { CorrectiveAction } from '../domain/model/corrective-action.entity.js';

/**
 * Normalizes enum values coming from the API ('Critical', 'ThermalExcursion',
 * 'THERMAL_EXCURSION') into the kebab-case values used by the domain layer.
 * @param {?string} value - Raw enum value.
 * @returns {string} Normalized value.
 */
function toDomainEnum(value) {
  return String(value ?? '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

/**
 * @param {?string} value - ISO date string.
 * @returns {?Date} Parsed date or null.
 */
function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * @param {?number|string} value - Numeric value from the API.
 * @returns {?number} Parsed number or null.
 */
function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

/**
 * Maps alert resources into Alert entities and back (anti-corruption layer).
 *
 * @class AlertAssembler
 */
export class AlertAssembler {
  /**
   * @param {Object} resource - Alert resource payload.
   * @returns {Alert} Alert entity.
   */
  static toEntityFromResource(resource) {
    return new Alert({
      ...resource,
      severity: toDomainEnum(resource.severity),
      status: toDomainEnum(resource.status),
      sourceType: toDomainEnum(resource.sourceType),
      readingCelsius: toNumber(resource.readingCelsius),
      safeMinCelsius: toNumber(resource.safeMinCelsius),
      safeMaxCelsius: toNumber(resource.safeMaxCelsius),
      raisedAt: toDate(resource.raisedAt),
      acknowledgedAt: toDate(resource.acknowledgedAt),
      resolvedAt: toDate(resource.resolvedAt),
      correctiveActions: (resource.correctiveActions ?? []).map(
        (action) => new CorrectiveAction({ ...action, takenAt: toDate(action.takenAt) })
      ),
      readings: (resource.readings ?? [])
        .map((reading) => ({
          takenAt: toDate(reading.takenAt),
          valueCelsius: toNumber(reading.valueCelsius),
        }))
        .filter((reading) => reading.takenAt && reading.valueCelsius !== null)
        .sort((a, b) => a.takenAt - b.takenAt),
    });
  }

  /**
   * Parses alert resources from a response and maps them into entities.
   * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response.
   * @returns {Alert[]} Alert entities.
   */
  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status}, ${response.statusText}`);
      return [];
    }
    const resources = Array.isArray(response.data) ? response.data : response.data['alerts'];
    return (resources ?? []).map((resource) => this.toEntityFromResource(resource));
  }

  /**
   * @param {Alert} entity - Alert entity.
   * @returns {Object} Alert resource payload.
   */
  static toResourceFromEntity(entity) {
    return {
      id: entity.id,
      code: entity.code,
      title: entity.title,
      message: entity.message,
      severity: entity.severity,
      status: entity.status,
      sourceType: entity.sourceType,
      laboratoryName: entity.laboratoryName,
      storageUnitName: entity.storageUnitName,
      sensorCode: entity.sensorCode,
      readingCelsius: entity.readingCelsius,
      safeMinCelsius: entity.safeMinCelsius,
      safeMaxCelsius: entity.safeMaxCelsius,
      raisedAt: entity.raisedAt?.toISOString() ?? null,
      acknowledgedAt: entity.acknowledgedAt?.toISOString() ?? null,
      acknowledgedBy: entity.acknowledgedBy,
      resolvedAt: entity.resolvedAt?.toISOString() ?? null,
      resolvedBy: entity.resolvedBy,
      correctiveActions: entity.correctiveActions.map((action) => ({
        description: action.description,
        technicianName: action.technicianName,
        takenAt: action.takenAt?.toISOString() ?? null,
      })),
      readings: entity.readings.map((reading) => ({
        takenAt: reading.takenAt.toISOString(),
        valueCelsius: reading.valueCelsius,
      })),
    };
  }
}
