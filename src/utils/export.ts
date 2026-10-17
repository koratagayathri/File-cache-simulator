import type {
  AlgorithmName,
  SimulationResult,
} from '@/types';
import { ALGORITHM_DESCRIPTIONS } from '@/types';

function csvEscape(value: string | number): string {
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function buildCsv(result: SimulationResult): string {
  const header = [
    'Step',
    'Request',
    'Hit',
    'Cache State',
    'Evicted',
    'Cumulative Hits',
    'Cumulative Misses',
    'Cumulative Evictions',
    'Cumulative Hit Ratio %',
  ];
  const rows = result.steps.map((s) =>
    [
      s.step,
      s.request,
      s.hit ? 'HIT' : 'MISS',
      s.cacheState.join(' | '),
      s.evicted ?? '',
      s.cumulativeHits,
      s.cumulativeMisses,
      s.cumulativeEvictions,
      s.cumulativeHitRatio.toFixed(2),
    ]
      .map(csvEscape)
      .join(','),
  );
  return [header.join(','), ...rows].join('\n');
}

export function buildTextReport(
  result: SimulationResult,
  comparison?: SimulationResult[],
): string {
  const lines: string[] = [];
  lines.push('FILE CACHE PERFORMANCE SIMULATOR — REPORT');
  lines.push('='.repeat(50));
  lines.push(`Simulation Date: ${new Date().toLocaleString()}`);
  lines.push(`Algorithm: ${result.algorithm}`);
  lines.push(`Cache Capacity: ${result.capacity}`);
  lines.push(`Access Sequence: ${result.sequence.join(', ')}`);
  lines.push('');
  lines.push('Algorithm Description:');
  lines.push(ALGORITHM_DESCRIPTIONS[result.algorithm as AlgorithmName]);
  lines.push('');
  lines.push('Request-by-Request Cache State:');
  lines.push('-'.repeat(50));
  lines.push(
    'Step | Request | Result | Cache State        | Evicted | Hits | Misses | Hit Ratio',
  );
  for (const s of result.steps) {
    lines.push(
      `  ${String(s.step).padStart(2)}  |   ${s.request.padEnd(2)}    | ${s.hit ? 'HIT ' : 'MISS'} | ${s.cacheState.join(', ').padEnd(18)} | ${s.evicted ?? '-'.padEnd(6)} | ${String(s.cumulativeHits).padStart(4)} | ${String(s.cumulativeMisses).padStart(6)} | ${s.cumulativeHitRatio.toFixed(2)}%`,
    );
  }
  lines.push('-'.repeat(50));
  lines.push('');
  lines.push('Performance Metrics:');
  lines.push(`  Total Requests: ${result.totalRequests}`);
  lines.push(`  Cache Hits: ${result.hits}`);
  lines.push(`  Cache Misses: ${result.misses}`);
  lines.push(`  Hit Ratio: ${result.hitRatio.toFixed(2)}%`);
  lines.push(`  Miss Ratio: ${result.missRatio.toFixed(2)}%`);
  lines.push(`  Evictions: ${result.evictions}`);
  lines.push(`  Average Simulated Access Time: ${result.averageAccessTime.toFixed(2)} ms`);

  if (comparison && comparison.length > 1) {
    lines.push('');
    lines.push('Algorithm Comparison:');
    lines.push('-'.repeat(50));
    lines.push(
      'Algorithm | Requests | Hits | Misses | Hit Ratio | Miss Ratio | Evictions | Avg Time',
    );
    for (const r of comparison) {
      lines.push(
        `  ${r.algorithm.padEnd(6)} | ${String(r.totalRequests).padStart(7)} | ${String(r.hits).padStart(4)} | ${String(r.misses).padStart(6)} | ${r.hitRatio.toFixed(2).padStart(9)}% | ${r.missRatio.toFixed(2).padStart(10)}% | ${String(r.evictions).padStart(8)} | ${r.averageAccessTime.toFixed(2)} ms`,
      );
    }
    const best = comparison.filter(
      (r) => r.hitRatio === Math.max(...comparison.map((x) => x.hitRatio)),
    );
    if (best.length === 1) {
      lines.push(`Best Algorithm: ${best[0].algorithm}`);
    } else {
      lines.push(`Best Algorithm: Tie (${best.map((b) => b.algorithm).join(', ')})`);
    }
  }

  lines.push('');
  lines.push('Conclusion:');
  if (comparison && comparison.length > 1) {
    const best = comparison.filter(
      (r) => r.hitRatio === Math.max(...comparison.map((x) => x.hitRatio)),
    );
    if (best.length === 1) {
      lines.push(
        `Based on the given access pattern and cache capacity of ${result.capacity}, ${best[0].algorithm} achieved the highest hit ratio of ${best[0].hitRatio.toFixed(2)}%.`,
      );
    } else {
      lines.push(
        `Based on the given access pattern and cache capacity of ${result.capacity}, the algorithms (${best.map((b) => b.algorithm).join(', ')}) tied with a hit ratio of ${best[0].hitRatio.toFixed(2)}%.`,
      );
    }
    lines.push(
      'Note: the best algorithm depends on the access pattern and cache capacity — no algorithm is guaranteed best in every situation.',
    );
  } else {
    lines.push(
      `The ${result.algorithm} algorithm achieved a hit ratio of ${result.hitRatio.toFixed(2)}% for the given workload.`,
    );
  }
  lines.push('');
  lines.push('Note: latency values are illustrative simulated examples, not real hardware measurements.');
  return lines.join('\n');
}

function download(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCsv(result: SimulationResult): void {
  download(`cache-${result.algorithm.toLowerCase()}-${Date.now()}.csv`, buildCsv(result), 'text/csv');
}

export function downloadText(result: SimulationResult, comparison?: SimulationResult[]): void {
  download(`cache-report-${Date.now()}.txt`, buildTextReport(result, comparison), 'text/plain');
}

export function printReport(result: SimulationResult, comparison?: SimulationResult[]): void {
  const w = window.open('', '_blank');
  if (!w) return;
  const esc = (s: string) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const rows = result.steps
    .map(
      (s) =>
        `<tr><td>${s.step}</td><td>${esc(s.request)}</td><td>${s.hit ? 'HIT' : 'MISS'}</td><td>${esc(s.cacheState.join(', '))}</td><td>${s.evicted ? esc(s.evicted) : '-'}</td><td>${s.cumulativeHits}</td><td>${s.cumulativeMisses}</td><td>${s.cumulativeHitRatio.toFixed(2)}%</td></tr>`,
    )
    .join('');
  const compRows =
    comparison && comparison.length > 1
      ? comparison
          .map(
            (r) =>
              `<tr><td>${r.algorithm}</td><td>${r.totalRequests}</td><td>${r.hits}</td><td>${r.misses}</td><td>${r.hitRatio.toFixed(2)}%</td><td>${r.evictions}</td><td>${r.averageAccessTime.toFixed(2)} ms</td></tr>`,
          )
          .join('')
      : '';
  w.document.write(`<!doctype html><html><head><title>Cache Simulation Report</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;padding:32px;color:#0f172a}
    h1{color:#1e3a8a}h2{color:#0f766e;border-bottom:2px solid #e2e8f0;padding-bottom:4px}
    table{border-collapse:collapse;width:100%;margin:12px 0}
    th,td{border:1px solid #cbd5e1;padding:6px 10px;text-align:left;font-size:13px}
    th{background:#f1f5f9}
    .muted{color:#64748b;font-size:12px}
  </style></head><body>
  <h1>File Cache Performance Simulator — Report</h1>
  <p class="muted">${new Date().toLocaleString()}</p>
  <h2>Configuration</h2>
  <p><strong>Algorithm:</strong> ${result.algorithm}<br/>
  <strong>Cache Capacity:</strong> ${result.capacity}<br/>
  <strong>Access Sequence:</strong> ${esc(result.sequence.join(', '))}</p>
  <p class="muted">${esc(ALGORITHM_DESCRIPTIONS[result.algorithm as AlgorithmName])}</p>
  <h2>Request-by-Request Cache State</h2>
  <table><thead><tr><th>Step</th><th>Request</th><th>Result</th><th>Cache State</th><th>Evicted</th><th>Hits</th><th>Misses</th><th>Hit Ratio</th></tr></thead>
  <tbody>${rows}</tbody></table>
  <h2>Performance Metrics</h2>
  <p>Hits: ${result.hits} | Misses: ${result.misses} | Hit Ratio: ${result.hitRatio.toFixed(2)}% | Miss Ratio: ${result.missRatio.toFixed(2)}% | Evictions: ${result.evictions} | Avg Access Time: ${result.averageAccessTime.toFixed(2)} ms</p>
  ${comparison && comparison.length > 1 ? `<h2>Algorithm Comparison</h2><table><thead><tr><th>Algorithm</th><th>Requests</th><th>Hits</th><th>Misses</th><th>Hit Ratio</th><th>Evictions</th><th>Avg Time</th></tr></thead><tbody>${compRows}</tbody></table>` : ''}
  <p class="muted">Latency values are illustrative simulated examples, not real hardware measurements.</p>
  <script>window.print()</script>
  </body></html>`);
  w.document.close();
}
