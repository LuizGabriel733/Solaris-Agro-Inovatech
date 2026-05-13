import { PeriodFilter, UVPoint } from './types';

export const TODAY_DATA: UVPoint[] = [
  { label: '06:00', valor: 2.5 },
  { label: '09:00', valor: 4.2 },
  { label: '12:00', valor: 6.1 },
  { label: '14:00', valor: 9.1, isCritical: true },
  { label: '16:00', valor: 8.2, isCritical: true },
  { label: '18:00', valor: 5.1 },
  { label: '20:00', valor: 2.3 },
];

export const WEEK_DATA: UVPoint[] = [
  { label: 'Seg', valor: 6.3 },
  { label: 'Ter', valor: 7.2 },
  { label: 'Qua', valor: 8.4, isCritical: true },
  { label: 'Qui', valor: 6.8 },
  { label: 'Sex', valor: 9.3, isCritical: true },
  { label: 'Sáb', valor: 7.9 },
  { label: 'Dom', valor: 5.8 },
];

export const MONTH_DATA: UVPoint[] = [
  { label: 'D1', valor: 5.8 },
  { label: 'D5', valor: 7.1 },
  { label: 'D10', valor: 8.4, isCritical: true },
  { label: 'D15', valor: 7.3 },
  { label: 'D20', valor: 9.6, isCritical: true },
  { label: 'D25', valor: 6.6 },
  { label: 'D30', valor: 7.9 },
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
