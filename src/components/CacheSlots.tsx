import type { CacheStep } from '@/types';

interface CacheSlotsProps {
  capacity: number;
  step: CacheStep | null;
  request: string | null;
}

export default function CacheSlots({ capacity, step, request }: CacheSlotsProps) {
  const state = step?.cacheState ?? [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-[#0f2557]">Cache Memory</h3>
        <span className="text-xs text-slate-500">Capacity: {capacity}</span>
      </div>

      <div className="flex flex-wrap gap-3 justify-center min-h-[88px] items-center">
        {Array.from({ length: capacity }).map((_, i) => {
          const file = state[i];
          const isNewest = step && file === step.request && !step.hit;
          const isHit = step && file === step.request && step.hit;
          return (
            <div
              key={i}
              className={`w-16 h-16 rounded-xl flex items-center justify-center text-lg font-bold border-2 transition-all ${
                file
                  ? isHit
                    ? 'bg-teal-500 text-white border-teal-600 animate-pulse-ring'
                    : isNewest
                      ? 'bg-blue-500 text-white border-blue-600 animate-pop-in'
                      : 'bg-slate-100 text-[#0f2557] border-slate-300'
                  : 'bg-slate-50 text-slate-300 border-dashed border-slate-200'
              }`}
            >
              {file ?? '—'}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-teal-500" /> Hit
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-500" /> Newly inserted
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-200" /> Cached
        </span>
      </div>
    </div>
  );
}
