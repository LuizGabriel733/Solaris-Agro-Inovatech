export type PeriodFilter = 'today' | '7d' | '30d';

export type UVPoint = {
  label: string;
  valor: number; // Alterado de value para valor para bater com o backend
  isCritical?: boolean;
};

export type HistoryStats = {
  average: string;
  peak: string;
  criticalCount: number;
};
