import { describe, it, expect } from 'vitest';
import { runLfu } from '@/algorithms/lfu';

describe('LFU Algorithm', () => {
  it('handles empty input', () => {
    const r = runLfu(3, []);
    expect(r.totalRequests).toBe(0);
    expect(r.steps).toHaveLength(0);
  });

  it('handles cache capacity of one', () => {
    const r = runLfu(1, ['A', 'A', 'B']);
    expect(r.hits).toBe(1);
    expect(r.misses).toBe(2);
    expect(r.steps[2].evicted).toBe('A');
  });

  it('updates frequency on hits', () => {
    const r = runLfu(3, ['A', 'A', 'B', 'C', 'D']);
    // A freq=2, B freq=1, C freq=1. D needs eviction → B and C have freq 1, B is less recent → evict B
    expect(r.steps[4].evicted).toBe('B');
    expect(r.steps[4].cacheState).toEqual(['A', 'C', 'D']);
  });

  it('evicts least frequently used', () => {
    const r = runLfu(2, ['A', 'A', 'B', 'C']);
    // A freq=2, B freq=1. C needs eviction → B has lower freq → evict B
    expect(r.steps[3].evicted).toBe('B');
    expect(r.steps[3].cacheState).toEqual(['A', 'C']);
  });

  it('breaks ties by least recently used', () => {
    const r = runLfu(3, ['A', 'B', 'C', 'D']);
    // All freq=1. A is least recently used (inserted first, never accessed since)
    expect(r.steps[3].evicted).toBe('A');
    expect(r.steps[3].cacheState).toEqual(['B', 'C', 'D']);
  });

  it('LFU tie-break: evicts LRU among tied frequencies', () => {
    // A,B,C all freq 1. Access B (hit, freq 2). Access A (hit, freq 2).
    // Now C has freq 1 → C evicted on next miss
    const r = runLfu(3, ['A', 'B', 'C', 'B', 'A', 'D']);
    expect(r.steps[3].hit).toBe(true); // B hit
    expect(r.steps[4].hit).toBe(true); // A hit
    expect(r.steps[5].evicted).toBe('C'); // C has lowest freq
  });

  it('handles all unique file requests', () => {
    const r = runLfu(3, ['A', 'B', 'C', 'D', 'E']);
    expect(r.evictions).toBe(2);
    expect(r.steps[3].evicted).toBe('A');
    expect(r.steps[4].evicted).toBe('B');
  });

  it('handles cache capacity larger than unique files', () => {
    const r = runLfu(10, ['A', 'B', 'A', 'B']);
    expect(r.hits).toBe(2);
    expect(r.evictions).toBe(0);
  });

  it('computes correct hit and miss totals', () => {
    const r = runLfu(2, ['A', 'A', 'B', 'A', 'C']);
    // A:miss, A:hit, B:miss, A:hit, C:miss evict B (freq 1 < A freq 3)
    expect(r.hits).toBe(2);
    expect(r.misses).toBe(3);
    expect(r.evictions).toBe(1);
    expect(r.steps[4].evicted).toBe('B');
  });

  it('ratios sum to 100%', () => {
    const r = runLfu(2, ['A', 'B', 'C', 'D']);
    expect(r.hitRatio + r.missRatio).toBeCloseTo(100, 5);
  });
});
