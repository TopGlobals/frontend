import { HistoryEntity } from '../domain/model/history-entity.js';
import { BaseApi } from '../../shared/infrastructure/base-api.js';

const api = new BaseApi();

const today = new Date();
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);

const getIsoStringWithTime = (baseDate, hours, minutes) => {
  const d = new Date(baseDate);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

const mockHistoryData = [
  {
    id: 1,
    titleKey: 'history.events.event1.title',
    type: 'Resolved',
    messageKey: 'history.events.event1.message',
    severity_level: 'Success',
    location_name: 'Lab A - Biochemistry Wing',
    sensor_code: 'TH-04 (Cabinet C3)',
    is_resolved: true,
    actionsTakenKeys: [
      'history.events.event1.action1',
      'history.events.event1.action2',
      'history.events.event1.action3',
      'history.events.event1.action4',
    ],
    created_at: getIsoStringWithTime(today, 9, 47),
  },
  {
    id: 2,
    titleKey: 'history.events.event2.title',
    type: 'Alert',
    messageKey: 'history.events.event2.message',
    severity_level: 'Critical',
    location_name: 'Lab A - Biochemistry Wing',
    sensor_code: 'TH-04 (Cabinet C3)',
    is_resolved: false,
    actionsTakenKeys: ['history.events.event2.action1', 'history.events.event2.action2'],
    created_at: getIsoStringWithTime(today, 3, 52),
  },
  {
    id: 3,
    titleKey: 'history.events.event3.title',
    type: 'Automation',
    messageKey: 'history.events.event3.message',
    severity_level: 'Info',
    location_name: 'Lab A - Biochemistry Wing',
    sensor_code: 'TH-04 (Cabinet C3)',
    is_resolved: true,
    actionsTakenKeys: [],
    created_at: getIsoStringWithTime(today, 3, 53),
  },
  {
    id: 4,
    titleKey: 'history.events.event4.title',
    type: 'User Action',
    messageKey: 'history.events.event4.message',
    severity_level: 'Warning',
    location_name: 'Lab B - Molecular Research',
    sensor_code: 'CO2-01',
    is_resolved: true,
    actionsTakenKeys: [],
    created_at: getIsoStringWithTime(today, 2, 30),
  },
  {
    id: 5,
    titleKey: 'history.events.event5.title',
    type: 'Automation',
    messageKey: 'history.events.event5.message',
    severity_level: 'Info',
    location_name: 'Lab C - Clean Room',
    sensor_code: 'HVAC-02',
    is_resolved: true,
    actionsTakenKeys: [],
    created_at: getIsoStringWithTime(yesterday, 22, 15),
  },
];

export const HistoryApi = {
  async getEvents() {
    try {
      const response = await api.http.get('/history');
      const dataList = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.history;

      if (!dataList) throw new Error('No array data found');
      return dataList.map((resource) => HistoryEntity.fromResource(resource));
    } catch (error) {
      console.warn('History API no disponible. Cargando contenido localizado dinámicamente...');
      return mockHistoryData.map((resource) => HistoryEntity.fromResource(resource));
    }
  },
};