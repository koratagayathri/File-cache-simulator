import { useState, useEffect } from 'react';
import { History as HistoryIcon, Trash2, Eye, RefreshCw, X } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import { loadHistory, deleteHistoryEntry, clearHistory } from '@/utils/storage';
import type { SimulationHistoryEntry } from '@/types';
import { downloadCsv, downloadText, printReport } from '@/utils/export';
import type { SimConfig } from '@/components/SimulationControls';

interface HistoryPageProps {
  onReopen: (config: SimConfig) => void;
}

export default function HistoryPage({ onReopen }: HistoryPageProps) {
  const [entries, setEntries] = useState<SimulationHistoryEntry[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const [detail, setDetail] = useState<SimulationHistoryEntry | null>(null);

  useEffect(() => {
    setEntries(loadHistory());
  }, []);

  const handleDelete = (id: string) => {
    setEntries(deleteHistoryEntry(id));
  };

  const handleClear = () => {
    setEntries(clearHistory());
    setConfirmClear(false);
  };

  const handleReopen = (e: SimulationHistoryEntry) => {
    onReopen({
      capacity: e.capacity,
      sequence: e.sequence,
      algorithm: e.algorithm === 'Compare All' ? 'Compare All' : e.algorithm,
      speed: 'medium',
      patternIndex: -1,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#0f2557]">Simulation History</h2>
            <p className="text-sm text-slate-600 mt-1">
              Saved simulation summaries stored in your browser. View details, reopen configurations, or delete entries.
            </p>
          </div>
          {entries.length > 0 && (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-medium border border-rose-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          )}
        </div>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          title="No Saved Simulations"
          message="Completed simulations are saved here automatically. Run a simulation to see it in your history."
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left font-semibold">Date &amp; Time</th>
                  <th className="px-4 py-3 text-left font-semibold">Algorithm</th>
                  <th className="px-4 py-3 text-right font-semibold">Capacity</th>
                  <th className="px-4 py-3 text-left font-semibold">Sequence</th>
                  <th className="px-4 py-3 text-right font-semibold">Hits</th>
                  <th className="px-4 py-3 text-right font-semibold">Misses</th>
                  <th className="px-4 py-3 text-right font-semibold">Hit Ratio</th>
                  <th className="px-4 py-3 text-right font-semibold">Evictions</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {new Date(e.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#0f2557]">{e.algorithm}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{e.capacity}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 max-w-[200px] truncate">
                      {e.sequence.join(', ')}
                    </td>
                    <td className="px-4 py-3 text-right text-teal-600 font-medium">{e.hits}</td>
                    <td className="px-4 py-3 text-right text-rose-600 font-medium">{e.misses}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{e.hitRatio.toFixed(2)}%</td>
                    <td className="px-4 py-3 text-right text-slate-700">{e.evictions}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setDetail(e)}
                          title="View details"
                          className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReopen(e)}
                          title="Reopen configuration"
                          className="p-1.5 rounded-lg hover:bg-teal-100 text-teal-600 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(e.id)}
                          title="Delete"
                          className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400">
        Saved summaries are stored in your browser's LocalStorage. They persist across sessions but are not shared with other devices.
      </p>

      <ConfirmDialog
        open={confirmClear}
        title="Clear All History?"
        message="This will permanently delete all saved simulation summaries from your browser. This action cannot be undone."
        confirmLabel="Clear All"
        onConfirm={handleClear}
        onCancel={() => setConfirmClear(false)}
      />

      {detail && (
        <DetailModal entry={detail} onClose={() => setDetail(null)} />
      )}
    </div>
  );
}

function DetailModal({ entry, onClose }: { entry: SimulationHistoryEntry; onClose: () => void }) {
  const result = entry.result;
  const comparison = entry.comparison;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 animate-pop-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-[#0f2557]">Simulation Details</h3>
            <p className="text-xs text-slate-500">{new Date(entry.timestamp).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <Field label="Algorithm" value={entry.algorithm} />
          <Field label="Capacity" value={String(entry.capacity)} />
          <Field label="Requests" value={String(entry.totalRequests)} />
          <Field label="Evictions" value={String(entry.evictions)} />
          <Field label="Hits" value={String(entry.hits)} color="text-teal-600" />
          <Field label="Misses" value={String(entry.misses)} color="text-rose-600" />
          <Field label="Hit Ratio" value={`${entry.hitRatio.toFixed(2)}%`} />
          <Field label="Miss Ratio" value={`${entry.missRatio.toFixed(2)}%`} />
        </div>

        <div className="mb-4">
          <p className="text-xs text-slate-500 mb-1">Access Sequence</p>
          <p className="font-mono text-sm bg-slate-50 rounded-lg px-3 py-2 text-[#0f2557]">
            {entry.sequence.join(', ')}
          </p>
        </div>

        {result && (
          <div className="flex gap-2 mb-4">
            <button onClick={() => downloadCsv(result)} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200 hover:bg-blue-100">CSV</button>
            <button onClick={() => downloadText(result, comparison)} className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-xs font-medium border border-teal-200 hover:bg-teal-100">Text Report</button>
            <button onClick={() => printReport(result, comparison)} className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 hover:bg-slate-100">Print</button>
          </div>
        )}

        {result && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600">
                  <th className="px-3 py-2 text-left font-semibold">Step</th>
                  <th className="px-3 py-2 text-left font-semibold">Req</th>
                  <th className="px-3 py-2 text-left font-semibold">Result</th>
                  <th className="px-3 py-2 text-left font-semibold">Cache State</th>
                  <th className="px-3 py-2 text-left font-semibold">Evicted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.steps.map((s) => (
                  <tr key={s.step}>
                    <td className="px-3 py-1.5 text-slate-700">{s.step}</td>
                    <td className="px-3 py-1.5 font-mono font-bold text-[#0f2557]">{s.request}</td>
                    <td className="px-3 py-1.5">
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${s.hit ? 'bg-teal-100 text-teal-700' : 'bg-rose-100 text-rose-700'}`}>
                        {s.hit ? 'HIT' : 'MISS'}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 font-mono text-slate-600">[ {s.cacheState.join(', ')} ]</td>
                    <td className="px-3 py-1.5 font-mono text-rose-600">{s.evicted ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-base font-bold ${color ?? 'text-[#0f2557]'}`}>{value}</p>
    </div>
  );
}
