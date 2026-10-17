import { describe, it, expect } from 'vitest';
import { runSimulation, runComparison, bestAlgorithm } from '@/algorithms/simulator';
import { runFifo } from '@/algorithms/fifo';
import { runLru } from '@/algorithms/lru';
import { runLfu } from '@/algorithms/lfu';
import type { AlgorithmName } from '@/types';

describe('Comparison and Step Restoration', () => {
  it('comparison uses identical input sequences', () => {
    const results = runComparison(3, ['A', 'B', 'C', 'A', 'D', 'A']);
    expect(results).toHaveLength(3);
    for (const r of results) {
      expect(r.sequence).toEqual(['A', 'B', 'C', 'A', 'D', 'A']);
      expect(r.capacity).toBe(3);
      expect(r.totalRequests).toBe(6);
    }
  });

  it('comparison produces all three algorithms', () => {
    const results = runComparison(2, ['A', 'B', 'A']);
    const names = results.map((r) => r.algorithm);
    expect(names).toContain('FIFO');
    expect(names).toContain('LRU');
    expect(names).toContain('LFU');
  });

  it('bestAlgorithm returns the highest hit ratio', () => {
    const results = runComparison(3, ['A', 'B', 'A', 'B', 'A', 'B']);
    // With repeated access and capacity >= 2, all should have same hit ratio
    const best = bestAlgorithm(results);
    expect(best.length).toBeGreaterThanOrEqual(1);
    for (const b of best) {
      expect(b.hitRatio).toBe(Math.max(...results.map((r) => r.hitRatio)));
    }
  });

  it('bestAlgorithm handles ties correctly', () => {
    const results = runComparison(3, ['A', 'B', 'A', 'B', 'A', 'B']);
    const best = bestAlgorithm(results);
    // All three should tie at the same hit ratio for this pattern
    expect(best.length).toBe(3);
  });

  it('step restoration: each step records exact cache state', () => {
    const r = runFifo(3, ['A', 'B', 'C', 'D']);
    expect(r.steps[0].cacheState).toEqual(['A']);
    expect(r.steps[1].cacheState).toEqual(['A', 'B']);
    expect(r.steps[2].cacheState).toEqual(['A', 'B', 'C']);
    expect(r.steps[3].cacheState).toEqual(['B', 'C', 'D']);
  });

  it('step restoration: cumulative counters are accurate per step', () => {
    const r = runLru(2, ['A', 'B', 'A', 'C']);
    expect(r.steps[0].cumulativeHits).toBe(0);
    expect(r.steps[0].cumulativeMisses).toBe(1);
    expect(r.steps[2].cumulativeHits).toBe(1);
    expect(r.steps[2].cumulativeMisses).toBe(2);
    expect(r.steps[3].cumulativeHits).toBe(1);
    expect(r.steps[3].cumulativeMisses).toBe(3);
    expect(r.steps[3].cumulativeEvictions).toBe(1);
  });

  it('previous step state can be restored from step records', () => {
    const r = runLfu(3, ['A', 'B', 'C', 'A', 'D']);
    // Step 4 (A hit) should show cache [A,B,C] with no eviction
    expect(r.steps[3].cacheState).toEqual(['A', 'B', 'C']);
    expect(r.steps[3].hit).toBe(true);
    expect(r.steps[3].evicted).toBeNull();
    // Step 5 (D miss) should show eviction
    expect(r.steps[4].hit).toBe(false);
    expect(r.steps[4].evicted).not.toBeNull();
    // Going back to step 4 should restore exact state
    const prevStep = r.steps[3];
    expect(prevStep.cacheState).toEqual(['A', 'B', 'C']);
    expect(prevStep.cumulativeHits).toBe(1);
  });

  it('cache capacity is never exceeded', () => {
    const algorithms: AlgorithmName[] = ['FIFO', 'LRU', 'LFU'];
    for (const algo of algorithms) {
      const r = runSimulation({ algorithm: algo, capacity: 3, sequence: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] });
      for (const step of r.steps) {
        expect(step.cacheState.length).toBeLessThanOrEqual(3);
      }
    }
  });

  it('division by zero is prevented', () => {
    const r = runFifo(3, []);
    expect(r.hitRatio).toBe(0);
    expect(r.missRatio).toBe(0);
    expect(r.averageAccessTime).toBe(0);
  });

  it('correct hit and miss ratios for known sequence', () => {
    const r = runFifo(3, ['A', 'B', 'C', 'A', 'D']);
    // 4 misses, 1 hit → 20% hit, 80% miss
    expect(r.hits).toBe(1);
    expect(r.misses).toBe(4);
    expect(r.hitRatio).toBeCloseTo(20, 0);
    expect(r.missRatio).toBeCloseTo(80, 0);
  });

  it('runSimulation matches individual algorithm functions', () => {
    const seq = ['A', 'B', 'C', 'A', 'D'];
    const direct = runFifo(3, seq);
    const sim = runSimulation({ algorithm: 'FIFO', capacity: 3, sequence: seq });
    expect(sim.hits).toBe(direct.hits);
    expect(sim.misses).toBe(direct.misses);
    expect(sim.evictions).toBe(direct.evictions);
  });
});
