import type { SimulationHistoryEntry } from '@/types';

const HISTORY_KEY = 'fcps_history_v1';
const PREFS_KEY = 'fcps_prefs_v1';

export function loadHistory(): SimulationHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidEntry);
  } catch {
    return [];
  }
}

export function saveHistory(entries: SimulationHistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export function addHistoryEntry(entry: SimulationHistoryEntry): SimulationHistoryEntry[] {
  const entries = loadHistory();
  const next = [entry, ...entries].slice(0, 100);
  saveHistory(next);
  return next;
}

export function deleteHistoryEntry(id: string): SimulationHistoryEntry[] {
  const entries = loadHistory().filter((e) => e.id !== id);
  saveHistory(entries);
  return entries;
}

export function clearHistory(): SimulationHistoryEntry[] {
  saveHistory([]);
  return [];
}

function isValidEntry(v: unknown): v is SimulationHistoryEntry {
  if (!v || typeof v !== 'object') return false;
  const e = v as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.timestamp === 'string' &&
    typeof e.capacity === 'number' &&
    Array.isArray(e.sequence) &&
    typeof e.algorithm === 'string' &&
    typeof e.totalRequests === 'number' &&
    typeof e.hits === 'number' &&
    typeof e.misses === 'number' &&
    typeof e.hitRatio === 'number' &&
    typeof e.missRatio === 'number' &&
    typeof e.evictions === 'number'
  );
}

export interface Prefs {
  speed: 'slow' | 'medium' | 'fast';
  hitLatency: number;
  missLatency: number;
}

const DEFAULT_PREFS: Prefs = { speed: 'medium', hitLatency: 1, missLatency: 10 };

export function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: Prefs): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}
