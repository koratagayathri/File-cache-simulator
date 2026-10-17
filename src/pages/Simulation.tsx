import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, FastForward, TrendingUp, Target, XCircle, Trash2 } from 'lucide-react';
import SimulationControls, { type SimConfig, parseSequence, defaultConfig } from '@/components/SimulationControls';
export type { SimConfig, SimConfig as SimConfigType };
export { defaultConfig };
import PlaybackControls from '@/components/PlaybackControls';
import CacheSlots from '@/components/CacheSlots';
import RequestHistoryTable from '@/components/RequestHistoryTable';
import MetricCard from '@/components/MetricCard';
import { runSimulation, runComparison } from '@/algorithms/simulator';
import { downloadCsv, downloadText, printReport } from '@/utils/export';
import { addHistoryEntry } from '@/utils/storage';
import type { SimulationResult, SimulationHistoryEntry, AlgorithmName } from '@/types';
import { ALGORITHM_DESCRIPTIONS } from '@/types';

interface SimulationPageProps {
  initialConfig?: SimConfig | null;
  onNavigate: (page: 'dashboard' | 'comparison' | 'history') => void;
}

export default function Simulation({ initialConfig, onNavigate }: SimulationPageProps) {
  const [config, setConfig] = useState<SimConfig>(initialConfig ?? defaultConfig());
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [comparison, setComparison] = useState<SimulationResult[] | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const validate = (cfg: SimConfig): string | null => {
    if (!Number.isFinite(cfg.capacity) || cfg.capacity < 1 || cfg.capacity > 20) {
      return 'Cache capacity must be an integer between 1 and 20.';
    }
    if (cfg.sequence.length === 0) {
      return 'Access sequence cannot be empty. Enter comma-separated file IDs.';
    }
    if (cfg.sequence.some((s) => s.length === 0)) {
      return 'Sequence contains empty values. Check for extra commas.';
    }
    return null;
  };

  const handleRun = () => {
    const err = validate(config);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setPlaying(false);

    if (config.algorithm === 'Compare All') {
      const results = runComparison(config.capacity, config.sequence);
      setComparison(results);
      setResult(results[0]);
      saveHistory(results, 'Compare All');
      onNavigate('comparison');
      return;
    }

    const res = runSimulation({
      algorithm: config.algorithm as AlgorithmName,
      capacity: config.capacity,
      sequence: config.sequence,
    });
    setResult(res);
    setComparison(null);
    setStepIndex(0);
    saveHistory([res], res.algorithm);
  };

  const saveHistory = (results: SimulationResult[], algoLabel: AlgorithmName | 'Compare All') => {
    const entry: SimulationHistoryEntry = {
      id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      capacity: config.capacity,
      sequence: config.sequence,
      algorithm: algoLabel,
      totalRequests: results[0].totalRequests,
      hits: results[0].hits,
      misses: results[0].misses,
      hitRatio: results[0].hitRatio,
      missRatio: results[0].missRatio,
      evictions: results[0].evictions,
      result: results[0],
      comparison: results.length > 1 ? results : undefined,
    };
    addHistoryEntry(entry);
  };

  const handleReset = () => {
    setConfig(defaultConfig());
    setError(null);
    setResult(null);
    setComparison(null);
    setStepIndex(0);
    setPlaying(false);
  };

  const totalSteps = result?.steps.length ?? 0;
  const currentStep = result?.steps[stepIndex - 1] ?? null;

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handlePlay = () => {
    if (!result || stepIndex >= totalSteps) return;
    setPlaying(true);
  };

  const handlePause = () => {
    setPlaying(false);
    stopTimer();
  };

  const handleNext = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, totalSteps));
  }, [totalSteps]);

  const handlePrev = () => {
    setPlaying(false);
    stopTimer();
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const handleRestart = () => {
    setPlaying(false);
    stopTimer();
    setStepIndex(0);
  };

  const handleRunFull = () => {
    if (!result) return;
    setPlaying(false);
    stopTimer();
    setStepIndex(totalSteps);
  };

  useEffect(() => {
    if (!playing || !result) return;
    if (stepIndex >= totalSteps) {
      setPlaying(false);
      stopTimer();
      return;
    }
    const delay = SPEED[config.speed];
    timerRef.current = setInterval(() => {
      setStepIndex((i) => {
        if (i >= totalSteps) {
          stopTimer();
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, delay);
    return () => stopTimer();
  }, [playing, result, totalSteps, config.speed, stepIndex, stopTimer]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
      <div className="space-y-6">
        <SimulationControls
          config={config}
          onChange={setConfig}
          onRun={handleRun}
          onReset={handleReset}
          error={error}
        />
        {result && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-2">
            <h4 className="text-sm font-bold text-[#0f2557]">Export</h4>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => downloadCsv(result)} className="px-2 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium border border-blue-200 transition-colors">CSV</button>
              <button onClick={() => downloadText(result, comparison ?? undefined)} className="px-2 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-medium border border-teal-200 transition-colors">Text Report</button>
              <button onClick={() => printReport(result, comparison ?? undefined)} className="px-2 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors">Print</button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {!result ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <Play className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#0f2557]">Ready to Simulate</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Configure your cache and access sequence on the left, then click Run Simulation to see the step-by-step visualization.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0f2557]">{result.algorithm} Simulation</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{ALGORITHM_DESCRIPTIONS[result.algorithm]}</p>
                </div>
                <div className="text-sm text-slate-600">
                  Step <span className="font-bold text-[#0f2557]">{stepIndex}</span> / {totalSteps}
                </div>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2 mb-5 overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all duration-300"
                  style={{ width: `${totalSteps > 0 ? (stepIndex / totalSteps) * 100 : 0}%` }}
                />
              </div>

              {currentStep ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  <InfoChip label="Request" value={currentStep.request} mono />
                  <InfoChip label="Result" value={currentStep.hit ? 'HIT' : 'MISS'} color={currentStep.hit ? 'teal' : 'rose'} />
                  <InfoChip label="Evicted" value={currentStep.evicted ?? '—'} mono color={currentStep.evicted ? 'rose' : undefined} />
                  <InfoChip label="Cache Size" value={`${currentStep.cacheState.length}/${result.capacity}`} />
                </div>
              ) : (
                <div className="text-sm text-slate-400 mb-5 text-center py-4">Press Play or Next Step to begin.</div>
              )}

              <CacheSlots capacity={result.capacity} step={currentStep} request={currentStep?.request ?? null} />
            </div>

            <PlaybackControls
              playing={playing}
              step={stepIndex}
              totalSteps={totalSteps}
              onPlay={handlePlay}
              onPause={handlePause}
              onNext={handleNext}
              onPrev={handlePrev}
              onRestart={handleRestart}
              onRunFull={handleRunFull}
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="Total Requests" value={result.totalRequests} icon={Target} accent="blue" />
              <MetricCard label="Cache Hits" value={result.hits} icon={TrendingUp} accent="teal" />
              <MetricCard label="Cache Misses" value={result.misses} icon={XCircle} accent="rose" />
              <MetricCard label="Evictions" value={result.evictions} icon={Trash2} accent="amber" />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-base font-bold text-[#0f2557] mb-3">Performance Metrics</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <StatBox label="Hit Ratio" value={`${result.hitRatio.toFixed(2)}%`} color="text-teal-600" />
                <StatBox label="Miss Ratio" value={`${result.missRatio.toFixed(2)}%`} color="text-rose-600" />
                <StatBox label="Avg Access Time" value={`${result.averageAccessTime.toFixed(2)} ms`} color="text-blue-600" />
                <StatBox label="Total Evictions" value={result.evictions} color="text-amber-600" />
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Note: latency values (hit = 1 ms, miss = 10 ms) are illustrative simulated examples, not real hardware measurements.
              </p>
            </div>

            <RequestHistoryTable steps={result.steps} currentStep={currentStep?.step} />
          </>
        )}
      </div>
    </div>
  );
}

const SPEED = { slow: 1200, medium: 700, fast: 300 };

function InfoChip({
  label,
  value,
  mono,
  color,
}: {
  label: string;
  value: string;
  mono?: boolean;
  color?: 'teal' | 'rose';
}) {
  const colorClass = color === 'teal' ? 'text-teal-600' : color === 'rose' ? 'text-rose-600' : 'text-[#0f2557]';
  return (
    <div className="bg-slate-50 rounded-xl p-3 text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-lg font-bold ${mono ? 'font-mono' : ''} ${colorClass}`}>{value}</p>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-xl font-bold ${color} mt-1`}>{value}</p>
    </div>
  );
}
