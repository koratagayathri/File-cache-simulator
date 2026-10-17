import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import MetricCard from '@/components/MetricCard';
import EmptyState from '@/components/EmptyState';
import {
  Database,
  Target,
  TrendingUp,
  XCircle,
  Trophy,
  Play,
  GitCompareArrows,
} from 'lucide-react';
import { loadHistory } from '@/utils/storage';
import type { SimulationHistoryEntry } from '@/types';
import { runComparison, bestAlgorithm } from '@/algorithms/simulator';
import type { PageId } from '@/components/Sidebar';

export default function Dashboard({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const [history, setHistory] = useState<SimulationHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const totalSims = history.length;
  const totalRequests = history.reduce((s, e) => s + e.totalRequests, 0);
  const totalHits = history.reduce((s, e) => s + e.hits, 0);
  const totalMisses = history.reduce((s, e) => s + e.misses, 0);
  const overallHitRatio = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;

  // Best algorithm from latest comparison entry
  let bestAlgo = '—';
  let bestRatio = 0;
  const latestComparison = history.find((e) => e.comparison && e.comparison.length > 1);
  if (latestComparison?.comparison) {
    const best = bestAlgorithm(latestComparison.comparison);
    if (best.length === 1) {
      bestAlgo = best[0].algorithm;
      bestRatio = best[0].hitRatio;
    } else if (best.length > 1) {
      bestAlgo = `Tie (${best.map((b) => b.algorithm).join(', ')})`;
      bestRatio = best[0].hitRatio;
    }
  }

  const hitMissData = [
    { name: 'Hits', value: totalHits },
    { name: 'Misses', value: totalMisses },
  ];

  // cumulative hit ratio across all history entries in order (oldest→newest)
  const cumulative = [...history].reverse().map((e, i) => {
    const slice = [...history].reverse().slice(0, i + 1);
    const reqs = slice.reduce((s, x) => s + x.totalRequests, 0);
    const hits = slice.reduce((s, x) => s + x.hits, 0);
    return { label: `#${i + 1}`, hitRatio: reqs > 0 ? Number(((hits / reqs) * 100).toFixed(2)) : 0 };
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-fade-in">
        <h2 className="text-xl font-bold text-[#0f2557]">Project Overview</h2>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl">
          The File Cache Performance Simulator is an educational tool that models file requests and
          cache replacement policies. It helps you understand caching behaviour through visual
          step-by-step simulation and performance comparisons of FIFO, LRU, and LFU algorithms under
          different access patterns and cache sizes.
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={() => onNavigate('simulation')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm transition-colors"
          >
            <Play className="w-4 h-4" /> Run New Simulation
          </button>
          <button
            onClick={() => onNavigate('comparison')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold shadow-sm transition-colors"
          >
            <GitCompareArrows className="w-4 h-4" /> Compare Algorithms
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard label="Simulations" value={totalSims} icon={Database} accent="blue" />
        <MetricCard label="File Requests" value={totalRequests} icon={Target} accent="slate" />
        <MetricCard label="Cache Hits" value={totalHits} icon={TrendingUp} accent="teal" />
        <MetricCard label="Cache Misses" value={totalMisses} icon={XCircle} accent="rose" />
        <MetricCard label="Hit Ratio" value={`${overallHitRatio.toFixed(2)}%`} icon={TrendingUp} accent="green" />
        <MetricCard label="Best Algorithm" value={bestAlgo} icon={Trophy} accent="amber" hint={bestRatio > 0 ? `${bestRatio.toFixed(2)}% hit ratio` : undefined} />
      </div>

      {totalSims === 0 ? (
        <EmptyState
          title="No Simulations Yet"
          message="Run your first simulation to populate this dashboard with real metrics and charts."
          action={
            <button
              onClick={() => onNavigate('simulation')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors"
            >
              <Play className="w-4 h-4" /> Start Simulation
            </button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-base font-bold text-[#0f2557] mb-4">Cache Hits vs Misses</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={hitMissData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#475569' }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Count" fill="#0f766e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-base font-bold text-[#0f2557] mb-4">Cumulative Hit Ratio</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={cumulative} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0f766e" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#0f766e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#475569' }} domain={[0, 100]} unit="%" />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Area type="monotone" dataKey="hitRatio" name="Hit Ratio" stroke="#0f766e" strokeWidth={2.5} fill="url(#hitGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <h3 className="text-base font-bold text-[#0f2557] px-5 pt-5">Recent Simulation History</h3>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                    <th className="px-4 py-3 text-left font-semibold">Algorithm</th>
                    <th className="px-4 py-3 text-right font-semibold">Capacity</th>
                    <th className="px-4 py-3 text-right font-semibold">Requests</th>
                    <th className="px-4 py-3 text-right font-semibold">Hits</th>
                    <th className="px-4 py-3 text-right font-semibold">Hit Ratio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.slice(0, 8).map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-slate-600">{new Date(e.timestamp).toLocaleDateString()}</td>
                      <td className="px-4 py-2.5 font-medium text-[#0f2557]">{e.algorithm}</td>
                      <td className="px-4 py-2.5 text-right text-slate-700">{e.capacity}</td>
                      <td className="px-4 py-2.5 text-right text-slate-700">{e.totalRequests}</td>
                      <td className="px-4 py-2.5 text-right text-teal-600 font-medium">{e.hits}</td>
                      <td className="px-4 py-2.5 text-right text-slate-700">{e.hitRatio.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
