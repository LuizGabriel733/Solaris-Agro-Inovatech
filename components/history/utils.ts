import { HistoryStats, UVPoint } from './types';

export function createLinePath(points: UVPoint[], chartWidth: number, chartHeight: number, maxValue: number): string {
  // [Implementacao por Arthur Junior] Gera o path do grafico de linha para qualquer conjunto de pontos.
  return points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * chartWidth;
      const y = chartHeight - (point.valor / maxValue) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');
}

export function calculateStats(data: UVPoint[]): HistoryStats {
  // [Implementacao por Arthur Junior] Centraliza as regras de calculo para facilitar futura integracao com API.
  const total = data.reduce((acc, item) => acc + item.valor, 0);
  const average = total / data.length;
  const peak = data.reduce((max, item) => (item.valor > max ? item.valor : max), 0);
  const criticalCount = data.filter((item) => item.valor >= 8).length;

  return {
    average: average.toFixed(1),
    peak: peak.toFixed(1),
    criticalCount,
  };
}
