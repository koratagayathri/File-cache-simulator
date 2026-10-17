import type { SimulationResult, LatencyConfig } from '@/types';

export interface MetricSummary {
  totalRequests: number;
  hits: number;
  misses: number;
  hitRatio: number;
  missRatio: number;
  evictions: number;
  averageAccessTime: number;
}

export function summarize(result: SimulationResult): MetricSummary {
  return {
    totalRequests: result.totalRequests,
    hits: result.hits,
    misses: result.misses,
    hitRatio: result.hitRatio,
    missRatio: result.missRatio,
    evictions: result.evictions,
    averageAccessTime: result.averageAccessTime,
  };
}

export function aggregate(results: SimulationResult[]): MetricSummary {
  const totalRequests = results.reduce((s, r) => s + r.totalRequests, 0);
  const hits = results.reduce((s, r) => s + r.hits, 0);
  const misses = results.reduce((s, r) => s + r.misses, 0);
  const evictions = results.reduce((s, r) => s + r.evictions, 0);
  const hitRatio = totalRequests > 0 ? (hits / totalRequests) * 100 : 0;
  const missRatio = totalRequests > 0 ? (misses / totalRequests) * 100 : 0;
  const averageAccessTime =
    totalRequests > 0
      ? (results.reduce((s, r) => s + r.hits * 1, 0) * 1 +
          results.reduce((s, r) => s + r.misses * 10, 0)) /
        totalRequests
      : 0;
  return {
    totalRequests,
    hits,
    misses,
    hitRatio,
    missRatio,
    evictions,
    averageAccessTime,
  };
}

export function cumulativeHitRatioSeries(
  results: SimulationResult[],
): { step: number; FIFO: number | null; LRU: number | null; LFU: number | null }[] {
  const maxLen = Math.max(...results.map((r) => r.steps.length), 0);
  const series: { step: number; FIFO: number | null; LRU: number | null; LFU: number | null }[] = [];
  for (let i = 0; i < maxLen; i++) {
    const point: { step: number; FIFO: number | null; LRU: number | null; LFU: number | null } = {
      step: i + 1,
      FIFO: null,
      LRU: null,
      LFU: null,
    };
    for (const r of results) {
      if (r.steps[i]) {
        point[r.algorithm] = r.steps[i].cumulativeHitRatio;
      }
    }
    series.push(point);
  }
  return series;
}

export function formatRatio(value: number): string {
  if (!Number.isFinite(value)) return '0.00%';
  return `${value.toFixed(2)}%`;
}

export function averageAccessTimeLabel(value: number): string {
  if (!Number.isFinite(value)) return '0.00 ms';
  return `${value.toFixed(2)} ms`;
}

export function defaultLatency(): LatencyConfig {
  return { hitLatency: 1, missLatency: 10 };
}
