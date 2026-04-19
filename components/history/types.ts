export type PeriodFilter = 'today' | '7d' | '30d';

export type UVPoint = {
  label: string;
  value: number;
  isCritical?: boolean;
};

export type HistoryStats = {
  average: string;
  peak: string;
  criticalCount: number;
};
