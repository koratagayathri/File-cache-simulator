export type AlgorithmName = 'FIFO' | 'LRU' | 'LFU';

export interface CacheStep {
  step: number;
  request: string;
  hit: boolean;
  cacheState: string[];
  evicted: string | null;
  /** Algorithm-specific metadata snapshot for accurate previous-step restoration. */
  meta: Record<string, number[]>;
  cumulativeHits: number;
  cumulativeMisses: number;
  cumulativeEvictions: number;
  cumulativeHitRatio: number;
}

export interface SimulationResult {
  algorithm: AlgorithmName;
  capacity: number;
  sequence: string[];
  steps: CacheStep[];
  totalRequests: number;
  hits: number;
  misses: number;
  evictions: number;
  hitRatio: number;
  missRatio: number;
  averageAccessTime: number;
}

export interface LatencyConfig {
  hitLatency: number;
  missLatency: number;
}

export interface SimulationHistoryEntry {
  id: string;
  timestamp: string;
  capacity: number;
  sequence: string[];
  algorithm: AlgorithmName | 'Compare All';
  totalRequests: number;
  hits: number;
  misses: number;
  hitRatio: number;
  missRatio: number;
  evictions: number;
  result?: SimulationResult;
  comparison?: SimulationResult[];
}

export interface AccessPattern {
  name: string;
  description: string;
  sequence: string[];
}

export const ACCESS_PATTERNS: AccessPattern[] = [
  {
    name: 'Repeated Access',
    description:
      'Two files are requested alternately. With a cache of at least 2, every request after the first two should be a hit.',
    sequence: ['A', 'B', 'A', 'B', 'A', 'B'],
  },
  {
    name: 'Sequential Access',
    description:
      'Each file is requested once in order. This pattern causes many misses because files are never revisited.',
    sequence: ['A', 'B', 'C', 'D', 'E', 'F'],
  },
  {
    name: 'Mixed Access',
    description:
      'A blend of repeated and new requests. Shows how a mix of hits and misses occurs under realistic workloads.',
    sequence: ['A', 'B', 'C', 'A', 'D', 'B', 'E', 'A'],
  },
  {
    name: 'Locality of Reference',
    description:
      'A file is accessed several times in a short window before the working set shifts. This pattern favours recency- and frequency-based algorithms.',
    sequence: ['A', 'B', 'C', 'A', 'B', 'A', 'D', 'A', 'B', 'C'],
  },
];

export const ALGORITHM_DESCRIPTIONS: Record<AlgorithmName, string> = {
  FIFO:
    'First In, First Out. The file that entered the cache earliest is evicted when the cache is full. A cache hit does not change insertion order.',
  LRU:
    'Least Recently Used. The file that has not been accessed for the longest time is evicted. Recency is updated on every hit.',
  LFU:
    'Least Frequently Used. The file with the lowest access frequency is evicted. Ties are broken by evicting the least recently used among the tied files.',
};

export type PlaybackSpeed = 'slow' | 'medium' | 'fast';

export const SPEED_MS: Record<PlaybackSpeed, number> = {
  slow: 1200,
  medium: 700,
  fast: 300,
};
