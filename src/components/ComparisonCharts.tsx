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
} from 'recharts';
import type { SimulationResult } from '@/types';
import { cumulativeHitRatioSeries } from '@/utils/metrics';

interface ComparisonChartsProps {
  results: SimulationResult[];
}

const COLORS: Record<string, string> = {
  FIFO: '#2563eb',
  LRU: '#0f766e',
  LFU: '#d97706',
};

export default function ComparisonCharts({ results }: ComparisonChartsProps) {
  if (results.length === 0) return null;

  const barData = results.map((r) => ({
    name: r.algorithm,
    Hits: r.hits,
    Misses: r.misses,
  }));

  const ratioData = results.map((r) => ({
    name: r.algorithm,
    HitRatio: Number(r.hitRatio.toFixed(2)),
    MissRatio: Number(r.missRatio.toFixed(2)),
  }));

  const cumulativeData = cumulativeHitRatioSeries(results);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Cache Hits vs Misses" subtitle="Grouped comparison across algorithms">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 12, fill: '#475569' }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Hits" fill="#0f766e" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Misses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Hit &amp; Miss Ratio" subtitle="Percentage of total requests">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ratioData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 12, fill: '#475569' }} domain={[0, 100]} unit="%" />
              <Tooltip formatter={(v) => `${v}%`} />
              <Legend />
              <Bar dataKey="HitRatio" name="Hit Ratio" fill="#0f766e" radius={[6, 6, 0, 0]} />
              <Bar dataKey="MissRatio" name="Miss Ratio" fill="#f43f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard
        title="Cumulative Hit Ratio Over Requests"
        subtitle="How each algorithm's hit ratio evolves request by request"
      >
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={cumulativeData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="step" tick={{ fontSize: 12, fill: '#475569' }} label={{ value: 'Request #', position: 'insideBottom', offset: -2, fontSize: 12, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 12, fill: '#475569' }} domain={[0, 100]} unit="%" />
            <Tooltip formatter={(v) => `${Number(v).toFixed(2)}%`} />
            <Legend />
            {results.map((r) => (
              <Line
                key={r.algorithm}
                type="monotone"
                dataKey={r.algorithm}
                stroke={COLORS[r.algorithm]}
                strokeWidth={2.5}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <h3 className="text-base font-bold text-[#0f2557]" dangerouslySetInnerHTML={{ __html: title }} />
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      <div className={subtitle ? '' : 'mt-4'}>{children}</div>
    </div>
  );
}
