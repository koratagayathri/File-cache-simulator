import { runSimulation } from './simulator';
import type { SimulationResult } from '@/types';

/** Run the FIFO replacement algorithm over the given sequence. */
export function runFifo(capacity: number, sequence: string[]): SimulationResult {
  return runSimulation({ algorithm: 'FIFO', capacity, sequence });
}
