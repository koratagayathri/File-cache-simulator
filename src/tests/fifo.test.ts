import { describe, it, expect } from 'vitest';
import { runFifo } from '@/algorithms/fifo';

describe('FIFO Algorithm', () => {
  it('handles empty input', () => {
    const r = runFifo(3, []);
    expect(r.totalRequests).toBe(0);
    expect(r.hits).toBe(0);
    expect(r.misses).toBe(0);
    expect(r.hitRatio).toBe(0);
    expect(r.steps).toHaveLength(0);
  });

  it('handles cache capacity of one', () => {
    const r = runFifo(1, ['A', 'B', 'A', 'C']);
    // A: miss [A], B: miss evict A [B], A: miss evict B [A], C: miss evict A [C]
    expect(r.hits).toBe(0);
    expect(r.misses).toBe(4);
    expect(r.evictions).toBe(3);
    expect(r.steps[1].evicted).toBe('A');
    expect(r.steps[2].cacheState).toEqual(['A']);
  });

  it('handles repeated file requests (hits do not change order)', () => {
    const r = runFifo(2, ['A', 'B', 'A', 'A', 'B']);
    // A: miss [A], B: miss [A,B], A: hit [A,B], A: hit [A,B], B: hit [A,B]
    expect(r.hits).toBe(3);
    expect(r.misses).toBe(2);
    expect(r.evictions).toBe(0);
    // FIFO: hit does not change insertion order
    expect(r.steps[2].cacheState).toEqual(['A', 'B']);
  });

  it('handles all unique file requests', () => {
    const r = runFifo(3, ['A', 'B', 'C']);
    expect(r.hits).toBe(0);
    expect(r.misses).toBe(3);
    expect(r.evictions).toBe(0);
    expect(r.steps[2].cacheState).toEqual(['A', 'B', 'C']);
  });

  it('handles cache capacity larger than unique files', () => {
    const r = runFifo(10, ['A', 'B', 'A', 'B']);
    expect(r.hits).toBe(2);
    expect(r.misses).toBe(2);
    expect(r.evictions).toBe(0);
  });

  it('maintains FIFO insertion and eviction order', () => {
    const r = runFifo(3, ['A', 'B', 'C', 'D', 'E']);
    // D evicts A (first in), E evicts B (next first in)
    expect(r.steps[3].evicted).toBe('A');
    expect(r.steps[4].evicted).toBe('B');
    expect(r.steps[4].cacheState).toEqual(['C', 'D', 'E']);
    expect(r.evictions).toBe(2);
  });

  it('FIFO hit does not change eviction order', () => {
    const r = runFifo(3, ['A', 'B', 'C', 'A', 'D']);
    // A,B,C cached. A is hit (doesn't change order). D evicts A (still first in)
    expect(r.steps[3].hit).toBe(true);
    expect(r.steps[4].evicted).toBe('A');
    expect(r.steps[4].cacheState).toEqual(['B', 'C', 'D']);
  });

  it('computes correct hit and miss ratios', () => {
    const r = runFifo(2, ['A', 'B', 'A']);
    // 2 misses, 1 hit → hit ratio 33.33%
    expect(r.hitRatio).toBeCloseTo(33.33, 1);
    expect(r.missRatio).toBeCloseTo(66.67, 1);
    expect(r.hitRatio + r.missRatio).toBeCloseTo(100, 1);
  });

  it('computes average access time', () => {
    const r = runFifo(2, ['A', 'B', 'A']);
    // 1 hit × 1ms + 2 misses × 10ms = 21 / 3 = 7 ms
    expect(r.averageAccessTime).toBeCloseTo(7, 1);
  });
});
