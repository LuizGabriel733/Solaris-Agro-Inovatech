import { PeriodFilter, UVPoint } from './types';

export const TODAY_DATA: UVPoint[] = [
  { label: '06:00', value: 2.5 },
  { label: '09:00', value: 4.2 },
  { label: '12:00', value: 6.1 },
  { label: '14:00', value: 9.1, isCritical: true },
  { label: '16:00', value: 8.2, isCritical: true },
  { label: '18:00', value: 5.1 },
  { label: '20:00', value: 2.3 },
];

export const WEEK_DATA: UVPoint[] = [
  { label: 'Seg', value: 6.3 },
  { label: 'Ter', value: 7.2 },
  { label: 'Qua', value: 8.4, isCritical: true },
  { label: 'Qui', value: 6.8 },
  { label: 'Sex', value: 9.3, isCritical: true },
  { label: 'Sáb', value: 7.9 },
  { label: 'Dom', value: 5.8 },
];

export const MONTH_DATA: UVPoint[] = [
  { label: 'D1', value: 5.8 },
  { label: 'D5', value: 7.1 },
  { label: 'D10', value: 8.4, isCritical: true },
  { label: 'D15', value: 7.3 },
  { label: 'D20', value: 9.6, isCritical: true },
  { label: 'D25', value: 6.6 },
  { label: 'D30', value: 7.9 },
];

export function getDataByPeriod(period: PeriodFilter): UVPoint[] {
  if (period === 'today') return TODAY_DATA;
  if (period === '7d') return WEEK_DATA;
  return MONTH_DATA;
}

export function getPeriodLabel(period: PeriodFilter): string {
  if (period === 'today') return 'Hoje';
  if (period === '7d') return '7 dias';
  return '30 dias';
}
