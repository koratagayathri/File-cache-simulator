import {
  Play,
  RotateCcw,
  Sparkles,
  FileText,
  Settings2,
  AlertCircle,
  Dice5,
  Layers,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { AlgorithmName, PlaybackSpeed } from '@/types';
import { ACCESS_PATTERNS, SPEED_MS } from '@/types';

export interface SimConfig {
  capacity: number;
  sequence: string[];
  algorithm: AlgorithmName | 'Compare All';
  speed: PlaybackSpeed;
  patternIndex: number;
}

interface SimulationControlsProps {
  config: SimConfig;
  onChange: (config: SimConfig) => void;
  onRun: () => void;
  onReset: () => void;
  runLabel?: string;
  error?: string | null;
}

const DEFAULT_SEQUENCE = ['A', 'B', 'C', 'A', 'B', 'D', 'A', 'C', 'D', 'B'];

export function parseSequence(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function defaultConfig(): SimConfig {
  return {
    capacity: 3,
    sequence: DEFAULT_SEQUENCE,
    algorithm: 'FIFO',
    speed: 'medium',
    patternIndex: -1,
  };
}

export default function SimulationControls({
  config,
  onChange,
  onRun,
  onReset,
  runLabel = 'Run Simulation',
  error,
}: SimulationControlsProps) {
  const [seqText, setSeqText] = useState(config.sequence.join(', '));
  const [capacityText, setCapacityText] = useState(String(config.capacity));

  useEffect(() => {
    setSeqText(config.sequence.join(', '));
  }, [config.sequence]);
  useEffect(() => {
    setCapacityText(String(config.capacity));
  }, [config.capacity]);

  const commitSequence = (raw: string) => {
    setSeqText(raw);
    onChange({ ...config, sequence: parseSequence(raw), patternIndex: -1 });
  };

  const commitCapacity = (raw: string) => {
    setCapacityText(raw);
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n)) onChange({ ...config, capacity: n });
    else onChange({ ...config, capacity: 0 });
  };

  const loadSample = () => {
    onChange({ ...config, sequence: DEFAULT_SEQUENCE, patternIndex: -1 });
  };

  const generateRandom = () => {
    const pool = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const len = 8 + Math.floor(Math.random() * 6);
    const seq = Array.from({ length: len }, () => pool[Math.floor(Math.random() * pool.length)]);
    onChange({ ...config, sequence: seq, patternIndex: -1 });
  };

  const selectPattern = (idx: number) => {
    if (idx < 0 || idx >= ACCESS_PATTERNS.length) return;
    onChange({
      ...config,
      sequence: ACCESS_PATTERNS[idx].sequence,
      patternIndex: idx,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Settings2 className="w-5 h-5 text-teal-600" />
        <h3 className="text-base font-bold text-[#0f2557]">Configuration</h3>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">Cache Capacity (1–20)</label>
          <input
            type="number"
            min={1}
            max={20}
            value={capacityText}
            onChange={(e) => commitCapacity(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">Algorithm</label>
          <select
            value={config.algorithm}
            onChange={(e) => onChange({ ...config, algorithm: e.target.value as SimConfig['algorithm'] })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm bg-white"
          >
            <option value="FIFO">FIFO</option>
            <option value="LRU">LRU</option>
            <option value="LFU">LFU</option>
            <option value="Compare All">Compare All</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1.5">
          File Access Sequence (comma-separated, case-sensitive)
        </label>
        <input
          type="text"
          value={seqText}
          onChange={(e) => commitSequence(e.target.value)}
          placeholder="A, B, C, A, B, D..."
          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm font-mono"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1.5">Predefined Access Pattern</label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {ACCESS_PATTERNS.map((p, i) => (
            <button
              key={p.name}
              onClick={() => selectPattern(i)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                config.patternIndex === i
                  ? 'bg-teal-500 text-white border-teal-600'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-teal-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">Playback Speed</label>
          <div className="flex gap-1.5">
            {(['slow', 'medium', 'fast'] as PlaybackSpeed[]).map((s) => (
              <button
                key={s}
                onClick={() => onChange({ ...config, speed: s })}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium capitalize border transition-all ${
                  config.speed === s
                    ? 'bg-blue-500 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={generateRandom}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium border border-amber-200 transition-colors"
          >
            <Dice5 className="w-4 h-4" /> Random
          </button>
          <button
            onClick={loadSample}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200 transition-colors"
          >
            <FileText className="w-4 h-4" /> Sample
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onRun}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm transition-colors"
        >
          <Play className="w-4 h-4" /> {runLabel}
        </button>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>

      <p className="text-xs text-slate-400 flex items-center gap-1">
        <Sparkles className="w-3 h-3" /> Speed: {SPEED_MS[config.speed]}ms per step
      </p>
    </div>
  );
}
