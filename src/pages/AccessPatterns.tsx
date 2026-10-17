import { useState } from 'react';
import { Boxes, Play, Info } from 'lucide-react';
import { ACCESS_PATTERNS } from '@/types';
import { runComparison, bestAlgorithm } from '@/algorithms/simulator';
import ComparisonCharts from '@/components/ComparisonCharts';
import EmptyState from '@/components/EmptyState';

export default function AccessPatterns() {
  const [selected, setSelected] = useState<number>(-1);
  const [capacity, setCapacity] = useState(3);
  const [results, setResults] = useState<ReturnType<typeof runComparison> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = () => {
    if (selected < 0) {
      setError('Select an access pattern to run.');
      return;
    }
    if (capacity < 1 || capacity > 20) {
      setError('Cache capacity must be between 1 and 20.');
      return;
    }
    setError(null);
    setResults(runComparison(capacity, ACCESS_PATTERNS[selected].sequence));
  };

  const best = results ? bestAlgorithm(results) : [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-[#0f2557]">Access Pattern Experiments</h2>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl">
          Explore how different file access patterns affect cache performance. Each pattern represents
          a real-world workload scenario. Run FIFO, LRU, and LFU on each pattern and compare the results.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {ACCESS_PATTERNS.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setSelected(i)}
            className={`text-left p-5 rounded-2xl border transition-all ${
              selected === i
                ? 'bg-teal-50 border-teal-400 ring-2 ring-teal-100'
                : 'bg-white border-slate-200 hover:border-teal-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Boxes className={`w-5 h-5 ${selected === i ? 'text-teal-600' : 'text-slate-400'}`} />
              <h3 className="text-base font-bold text-[#0f2557]">{p.name}</h3>
            </div>
            <p className="text-sm text-slate-600 mb-2">{p.description}</p>
            <p className="text-xs font-mono text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
              {p.sequence.join(', ')}
            </p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">Cache Capacity (1–20)</label>
          <input
            type="number"
            min={1}
            max={20}
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 0)}
            className="w-28 px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm"
          />
        </div>
        <button
          onClick={handleRun}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm transition-colors"
        >
          <Play className="w-4 h-4" /> Run Experiment
        </button>
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>

      {!results ? (
        <EmptyState
          title="No Experiment Run Yet"
          message="Select an access pattern above and click Run Experiment to compare FIFO, LRU, and LFU on that pattern."
        />
      ) : (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700">
              <strong>Why access patterns matter:</strong> Different patterns exercise different
              aspects of cache algorithms. Repeated access favours algorithms that retain frequently
              used files. Sequential access causes many misses regardless of algorithm. Locality of
              reference rewards recency- and frequency-based policies like LRU and LFU.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-base font-bold text-[#0f2557] mb-3">
              Results{selected >= 0 ? ` — ${ACCESS_PATTERNS[selected].name}` : ''}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 text-left font-semibold">Algorithm</th>
                    <th className="px-4 py-3 text-right font-semibold">Hits</th>
                    <th className="px-4 py-3 text-right font-semibold">Misses</th>
                    <th className="px-4 py-3 text-right font-semibold">Hit Ratio</th>
                    <th className="px-4 py-3 text-right font-semibold">Evictions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((r) => (
                    <tr key={r.algorithm} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-bold text-[#0f2557]">{r.algorithm}</td>
                      <td className="px-4 py-2.5 text-right text-teal-600 font-medium">{r.hits}</td>
                      <td className="px-4 py-2.5 text-right text-rose-600 font-medium">{r.misses}</td>
                      <td className="px-4 py-2.5 text-right text-slate-700">{r.hitRatio.toFixed(2)}%</td>
                      <td className="px-4 py-2.5 text-right text-slate-700">{r.evictions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-slate-600 mt-3">
              <strong>Best:</strong>{' '}
              {best.length === 1
                ? `${best[0].algorithm} (${best[0].hitRatio.toFixed(2)}%)`
                : `Tie — ${best.map((b) => b.algorithm).join(', ')} (${best[0].hitRatio.toFixed(2)}%)`}
            </p>
          </div>

          <ComparisonCharts results={results} />
        </>
      )}
    </div>
  );
}
