import { useState, useEffect } from 'react';
import {
  BarChart3,
  Trophy,
  Info,
  Download,
  FileText,
  Printer,
  Play,
} from 'lucide-react';
import SimulationControls, { type SimConfig, parseSequence, defaultConfig } from '@/components/SimulationControls';
import ComparisonCharts from '@/components/ComparisonCharts';
import EmptyState from '@/components/EmptyState';
import { runComparison, bestAlgorithm } from '@/algorithms/simulator';
import { downloadCsv, downloadText, printReport } from '@/utils/export';
import { addHistoryEntry } from '@/utils/storage';
import type { SimulationResult, SimulationHistoryEntry } from '@/types';
import type { PageId } from '@/components/Sidebar';

export default function Comparison({ initialConfig, onNavigate }: { initialConfig?: SimConfig | null; onNavigate: (page: PageId) => void }) {
  const [config, setConfig] = useState<SimConfig>(() => {
    const d = defaultConfig();
    d.algorithm = 'Compare All';
    return d;
  });
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SimulationResult[] | null>(null);
  const [detailAlgo, setDetailAlgo] = useState<SimulationResult | null>(null);

  useEffect(() => {
    if (initialConfig) {
      const c = { ...initialConfig, algorithm: 'Compare All' as const };
      setConfig(c);
    }
  }, [initialConfig]);

  const handleRun = () => {
    if (!Number.isFinite(config.capacity) || config.capacity < 1 || config.capacity > 20) {
      setError('Cache capacity must be an integer between 1 and 20.');
      return;
    }
    if (config.sequence.length === 0) {
      setError('Access sequence cannot be empty.');
      return;
    }
    setError(null);
    const res = runComparison(config.capacity, config.sequence);
    setResults(res);
    setDetailAlgo(res[0]);

    const entry: SimulationHistoryEntry = {
      id: `cmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      capacity: config.capacity,
      sequence: config.sequence,
      algorithm: 'Compare All',
      totalRequests: res[0].totalRequests,
      hits: res[0].hits,
      misses: res[0].misses,
      hitRatio: res[0].hitRatio,
      missRatio: res[0].missRatio,
      evictions: res[0].evictions,
      result: res[0],
      comparison: res,
    };
    addHistoryEntry(entry);
  };

  const handleReset = () => {
    const d = defaultConfig();
    d.algorithm = 'Compare All';
    setConfig(d);
    setResults(null);
    setError(null);
    setDetailAlgo(null);
  };

  const best = results ? bestAlgorithm(results) : [];
  const isTie = best.length > 1;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-[#0f2557]">Algorithm Comparison</h2>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl">
          Run FIFO, LRU, and LFU on the exact same access sequence and cache capacity, then compare
          their performance side by side. The best algorithm depends on the access pattern and cache
          capacity — no algorithm is guaranteed best in every situation.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <SimulationControls
          config={config}
          onChange={setConfig}
          onRun={handleRun}
          onReset={handleReset}
          error={error}
          runLabel="Compare All"
        />

        <div className="space-y-6">
          {!results ? (
            <EmptyState
              title="No Comparison Run Yet"
              message="Configure the cache and access sequence, then click Compare All to see FIFO, LRU, and LFU results side by side."
              action={
                <button
                  onClick={handleRun}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors"
                >
                  <Play className="w-4 h-4" /> Run Comparison
                </button>
              }
            />
          ) : (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-teal-600" />
                  <h3 className="text-base font-bold text-[#0f2557]">Comparison Table</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                        <th className="px-4 py-3 text-left font-semibold">Algorithm</th>
                        <th className="px-4 py-3 text-right font-semibold">Requests</th>
                        <th className="px-4 py-3 text-right font-semibold">Hits</th>
                        <th className="px-4 py-3 text-right font-semibold">Misses</th>
                        <th className="px-4 py-3 text-right font-semibold">Hit Ratio</th>
                        <th className="px-4 py-3 text-right font-semibold">Miss Ratio</th>
                        <th className="px-4 py-3 text-right font-semibold">Evictions</th>
                        <th className="px-4 py-3 text-right font-semibold">Avg Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {results.map((r) => (
                        <tr
                          key={r.algorithm}
                          className={`hover:bg-slate-50 cursor-pointer ${detailAlgo?.algorithm === r.algorithm ? 'bg-blue-50' : ''}`}
                          onClick={() => setDetailAlgo(r)}
                        >
                          <td className="px-4 py-2.5 font-bold text-[#0f2557]">{r.algorithm}</td>
                          <td className="px-4 py-2.5 text-right text-slate-700">{r.totalRequests}</td>
                          <td className="px-4 py-2.5 text-right text-teal-600 font-medium">{r.hits}</td>
                          <td className="px-4 py-2.5 text-right text-rose-600 font-medium">{r.misses}</td>
                          <td className="px-4 py-2.5 text-right text-slate-700">{r.hitRatio.toFixed(2)}%</td>
                          <td className="px-4 py-2.5 text-right text-slate-700">{r.missRatio.toFixed(2)}%</td>
                          <td className="px-4 py-2.5 text-right text-slate-700">{r.evictions}</td>
                          <td className="px-4 py-2.5 text-right text-slate-700">{r.averageAccessTime.toFixed(2)} ms</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={`rounded-2xl border p-5 ${isTie ? 'bg-amber-50 border-amber-200' : 'bg-teal-50 border-teal-200'}`}>
                <div className="flex items-center gap-3">
                  {isTie ? <Info className="w-6 h-6 text-amber-600" /> : <Trophy className="w-6 h-6 text-teal-600" />}
                  <div>
                    <p className="text-sm font-bold text-[#0f2557]">
                      {isTie
                        ? `Tie: ${best.map((b) => b.algorithm).join(', ')} all achieved ${best[0].hitRatio.toFixed(2)}% hit ratio`
                        : `Best Algorithm: ${best[0].algorithm} (${best[0].hitRatio.toFixed(2)}% hit ratio)`}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      The best algorithm depends on the access pattern and cache capacity. No algorithm is guaranteed to perform best in every situation.
                    </p>
                  </div>
                </div>
              </div>

              <ComparisonCharts results={results} />

              {detailAlgo && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-[#0f2557]">
                      Detailed Request History — {detailAlgo.algorithm}
                    </h3>
                    <div className="flex gap-2">
                      <button onClick={() => downloadCsv(detailAlgo)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium border border-blue-200 transition-colors">
                        <Download className="w-3.5 h-3.5" /> CSV
                      </button>
                      <button onClick={() => downloadText(detailAlgo, results)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-medium border border-teal-200 transition-colors">
                        <FileText className="w-3.5 h-3.5" /> Report
                      </button>
                      <button onClick={() => printReport(detailAlgo, results)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors">
                        <Printer className="w-3.5 h-3.5" /> Print
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600">
                          <th className="px-3 py-2 text-left font-semibold">Step</th>
                          <th className="px-3 py-2 text-left font-semibold">Req</th>
                          <th className="px-3 py-2 text-left font-semibold">Result</th>
                          <th className="px-3 py-2 text-left font-semibold">Cache State</th>
                          <th className="px-3 py-2 text-left font-semibold">Evicted</th>
                          <th className="px-3 py-2 text-right font-semibold">Hit Ratio</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {detailAlgo.steps.map((s) => (
                          <tr key={s.step} className="hover:bg-slate-50">
                            <td className="px-3 py-1.5 text-slate-700">{s.step}</td>
                            <td className="px-3 py-1.5 font-mono font-bold text-[#0f2557]">{s.request}</td>
                            <td className="px-3 py-1.5">
                              <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${s.hit ? 'bg-teal-100 text-teal-700' : 'bg-rose-100 text-rose-700'}`}>
                                {s.hit ? 'HIT' : 'MISS'}
                              </span>
                            </td>
                            <td className="px-3 py-1.5 font-mono text-slate-600">[ {s.cacheState.join(', ')} ]</td>
                            <td className="px-3 py-1.5 font-mono text-rose-600">{s.evicted ?? '-'}</td>
                            <td className="px-3 py-1.5 text-right text-slate-700">{s.cumulativeHitRatio.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
