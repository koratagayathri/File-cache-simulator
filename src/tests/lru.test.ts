import { describe, it, expect } from 'vitest';
import { runLru } from '@/algorithms/lru';

describe('LRU Algorithm', () => {
  it('handles empty input', () => {
    const r = runLru(3, []);
    expect(r.totalRequests).toBe(0);
    expect(r.steps).toHaveLength(0);
  });

  it('handles cache capacity of one', () => {
    const r = runLru(1, ['A', 'A', 'B']);
    // A: miss [A], A: hit [A], B: miss evict A [B]
    expect(r.hits).toBe(1);
    expect(r.misses).toBe(2);
    expect(r.evictions).toBe(1);
    expect(r.steps[2].evicted).toBe('A');
  });

  it('updates recency on hits', () => {
    const r = runLru(3, ['A', 'B', 'C', 'A', 'D']);
    // A,B,C cached. A is hit → A now most recent. D evicts B (least recent)
    expect(r.steps[3].hit).toBe(true);
    expect(r.steps[4].evicted).toBe('B');
    // Cache state is in insertion order; A was re-inserted at its original position
    expect(r.steps[4].evicted).toBe('B');
    expect(r.steps[4].cacheState).toContain('D');
    expect(r.steps[4].cacheState).toContain('C');
    expect(r.steps[4].cacheState).toContain('A');
    expect(r.steps[4].cacheState).toHaveLength(3);
  });

  it('evicts least recently used', () => {
    const r = runLru(2, ['A', 'B', 'A', 'C']);
    // A: miss [A], B: miss [A,B], A: hit → A recent [B,A], C: miss evict B [A,C]
    expect(r.steps[3].evicted).toBe('B');
    expect(r.steps[3].cacheState).toEqual(['A', 'C']);
  });

  it('handles all unique file requests', () => {
    const r = runLru(3, ['A', 'B', 'C', 'D']);
    expect(r.steps[3].evicted).toBe('A');
    expect(r.evictions).toBe(1);
  });

  it('handles cache capacity larger than unique files', () => {
    const r = runLru(10, ['A', 'B', 'A', 'B']);
    expect(r.hits).toBe(2);
    expect(r.misses).toBe(2);
    expect(r.evictions).toBe(0);
  });

  it('computes correct hit and miss totals', () => {
    const r = runLru(3, ['A', 'B', 'C', 'A', 'D', 'A']);
    // A:miss, B:miss, C:miss, A:hit, D:miss(evict B), A:hit
    expect(r.hits).toBe(2);
    expect(r.misses).toBe(4);
    expect(r.evictions).toBe(1);
  });

  it('ratios sum to 100%', () => {
    const r = runLru(2, ['A', 'B', 'C']);
    expect(r.hitRatio + r.missRatio).toBeCloseTo(100, 5);
  });
});
