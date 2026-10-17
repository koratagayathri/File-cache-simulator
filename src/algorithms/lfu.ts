import { runSimulation } from './simulator';
import type { SimulationResult } from '@/types';

/** Run the LFU replacement algorithm over the given sequence. */
export function runLfu(capacity: number, sequence: string[]): SimulationResult {
  return runSimulation({ algorithm: 'LFU', capacity, sequence });
}
