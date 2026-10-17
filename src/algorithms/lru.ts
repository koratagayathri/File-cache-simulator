import { runSimulation } from './simulator';
import type { SimulationResult } from '@/types';

/** Run the LRU replacement algorithm over the given sequence. */
export function runLru(capacity: number, sequence: string[]): SimulationResult {
  return runSimulation({ algorithm: 'LRU', capacity, sequence });
}
