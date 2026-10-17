import type { CacheStep } from '@/types';

interface RequestHistoryTableProps {
  steps: CacheStep[];
  currentStep?: number;
  maxRows?: number;
}

export default function RequestHistoryTable({
  steps,
  currentStep,
  maxRows = 50,
}: RequestHistoryTableProps) {
  if (steps.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center text-sm text-slate-500">
        No requests yet. Run a simulation to see the request history.
      </div>
    );
  }

  const rows = steps.slice(0, maxRows);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <th className="px-4 py-3 text-left font-semibold">Step</th>
              <th className="px-4 py-3 text-left font-semibold">Request</th>
              <th className="px-4 py-3 text-left font-semibold">Result</th>
              <th className="px-4 py-3 text-left font-semibold">Cache State</th>
              <th className="px-4 py-3 text-left font-semibold">Evicted</th>
              <th className="px-4 py-3 text-right font-semibold">Hits</th>
              <th className="px-4 py-3 text-right font-semibold">Misses</th>
              <th className="px-4 py-3 text-right font-semibold">Hit Ratio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((s) => {
              const active = currentStep === s.step;
              return (
                <tr
                  key={s.step}
                  className={`transition-colors ${active ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                >
                  <td className="px-4 py-2.5 text-slate-700 font-medium">{s.step}</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-[#0f2557]">{s.request}</td>
                  <td className="px-4 py-2.5">
                    {s.hit ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
                        HIT
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                        MISS
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-600">
                    [ {s.cacheState.join(', ')} ]
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-rose-600">
                    {s.evicted ?? '-'}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-700">{s.cumulativeHits}</td>
                  <td className="px-4 py-2.5 text-right text-slate-700">{s.cumulativeMisses}</td>
                  <td className="px-4 py-2.5 text-right text-slate-700">
                    {s.cumulativeHitRatio.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {steps.length > maxRows && (
        <div className="px-4 py-2 text-xs text-slate-400 text-center">
          Showing first {maxRows} of {steps.length} requests.
        </div>
      )}
    </div>
  );
}
