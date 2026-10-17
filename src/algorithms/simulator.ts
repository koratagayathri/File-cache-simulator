import type {
  AlgorithmName,
  CacheStep,
  LatencyConfig,
  SimulationResult,
} from '@/types';

interface SimEntry {
  key: string;
  /** Insertion order index (FIFO queue order). */
  insertedAt: number;
  /** Last access tick (LRU recency). */
  lastUsedAt: number;
  /** Number of accesses (LFU frequency). */
  frequency: number;
}

export interface RunOptions {
  algorithm: AlgorithmName;
  capacity: number;
  sequence: string[];
  latency?: LatencyConfig;
}

/**
 * Run a single cache replacement algorithm over a sequence of file requests.
 * Returns per-step records so the UI can play back the simulation step by step,
 * and aggregate metrics for charts and tables.
 */
export function runSimulation(opts: RunOptions): SimulationResult {
  const { algorithm, capacity, sequence } = opts;
  const latency = opts.latency ?? { hitLatency: 1, missLatency: 10 };

  const cache = new Map<string, SimEntry>();
  const steps: CacheStep[] = [];

  let hits = 0;
  let misses = 0;
  let evictions = 0;
  let clock = 0;

  for (let i = 0; i < sequence.length; i++) {
    const request = sequence[i];
    const present = cache.has(request);

    let evicted: string | null = null;

    if (present) {
      hits++;
      const entry = cache.get(request)!;
      entry.lastUsedAt = clock;
      entry.frequency += 1;
    } else {
      misses++;
      if (cache.size >= capacity && capacity > 0) {
        evicted = evict(algorithm, cache);
        if (evicted !== null) {
          cache.delete(evicted);
          evictions++;
        }
      }
      if (cache.size < capacity) {
        cache.set(request, {
          key: request,
          insertedAt: clock,
          lastUsedAt: clock,
          frequency: 1,
        });
      }
    }

    clock++;

    const cacheState = [...cache.keys()];
    const cumulativeHits = hits;
    const cumulativeMisses = misses;
    const total = hits + misses;

    steps.push({
      step: i + 1,
      request,
      hit: present,
      cacheState,
      evicted,
      meta: snapshotMeta(algorithm, cache),
      cumulativeHits,
      cumulativeMisses,
      cumulativeEvictions: evictions,
      cumulativeHitRatio: total > 0 ? (hits / total) * 100 : 0,
    });
  }

  const totalRequests = sequence.length;
  const hitRatio = totalRequests > 0 ? (hits / totalRequests) * 100 : 0;
  const missRatio = totalRequests > 0 ? (misses / totalRequests) * 100 : 0;
  const averageAccessTime =
    totalRequests > 0
      ? (hits * latency.hitLatency + misses * latency.missLatency) / totalRequests
      : 0;

  return {
    algorithm,
    capacity,
    sequence,
    steps,
    totalRequests,
    hits,
    misses,
    evictions,
    hitRatio,
    missRatio,
    averageAccessTime,
  };
}

function evict(algorithm: AlgorithmName, cache: Map<string, SimEntry>): string | null {
  if (cache.size === 0) return null;

  if (algorithm === 'FIFO') {
    let oldest: SimEntry | null = null;
    for (const entry of cache.values()) {
      if (oldest === null || entry.insertedAt < oldest.insertedAt) {
        oldest = entry;
      }
    }
    return oldest ? oldest.key : null;
  }

  if (algorithm === 'LRU') {
    let lru: SimEntry | null = null;
    for (const entry of cache.values()) {
      if (lru === null || entry.lastUsedAt < lru.lastUsedAt) {
        lru = entry;
      }
    }
    return lru ? lru.key : null;
  }

  // LFU: lowest frequency, tie-break by least recently used.
  let lfu: SimEntry | null = null;
  for (const entry of cache.values()) {
    if (lfu === null) {
      lfu = entry;
      continue;
    }
    if (entry.frequency < lfu.frequency) {
      lfu = entry;
    } else if (entry.frequency === lfu.frequency && entry.lastUsedAt < lfu.lastUsedAt) {
      lfu = entry;
    }
  }
  return lfu ? lfu.key : null;
}

function snapshotMeta(algorithm: AlgorithmName, cache: Map<string, SimEntry>): Record<string, number[]> {
  const keys = [...cache.keys()];
  if (algorithm === 'FIFO') {
    return { insertedAt: keys.map((k) => cache.get(k)!.insertedAt) };
  }
  if (algorithm === 'LRU') {
    return { lastUsedAt: keys.map((k) => cache.get(k)!.lastUsedAt) };
  }
  return {
    frequency: keys.map((k) => cache.get(k)!.frequency),
    lastUsedAt: keys.map((k) => cache.get(k)!.lastUsedAt),
  };
}

export function runComparison(
  capacity: number,
  sequence: string[],
  latency?: LatencyConfig,
): SimulationResult[] {
  const algorithms: AlgorithmName[] = ['FIFO', 'LRU', 'LFU'];
  return algorithms.map((algorithm) =>
    runSimulation({ algorithm, capacity, sequence, latency }),
  );
}

export function bestAlgorithm(results: SimulationResult[]): SimulationResult[] {
  if (results.length === 0) return [];
  const max = Math.max(...results.map((r) => r.hitRatio));
  return results.filter((r) => r.hitRatio === max);
}
