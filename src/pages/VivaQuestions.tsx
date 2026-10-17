import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface QA {
  q: string;
  a: string;
}

const QUESTIONS: QA[] = [
  {
    q: '1. What is caching?',
    a: 'Caching is a technique where frequently or recently accessed data is stored in a smaller, faster memory (the cache) so that future requests for that data can be served faster than retrieving it from the original, slower storage.',
  },
  {
    q: '2. Why is caching required?',
    a: 'Caching reduces the average access time for data, lowers the load on slower storage, and improves overall system performance. Without caching, every request would need to be fetched from the slower main storage, causing delays.',
  },
  {
    q: '3. What is a cache hit?',
    a: 'A cache hit occurs when the requested data is found in the cache. For example, if file A is already in the cache and a request for A arrives, it is a hit and is served quickly.',
  },
  {
    q: '4. What is a cache miss?',
    a: 'A cache miss occurs when the requested data is not in the cache. The data must be fetched from the slower storage and placed into the cache. If the cache is full, an existing entry must be evicted first.',
  },
  {
    q: '5. What is cache capacity?',
    a: 'Cache capacity is the maximum number of items the cache can hold simultaneously. In this simulator, it is the number of cache slots. A smaller capacity means more evictions and potentially more misses.',
  },
  {
    q: '6. What is a cache replacement algorithm?',
    a: 'A cache replacement algorithm decides which cached item to remove (evict) when the cache is full and a new item needs to be stored. Common algorithms include FIFO, LRU, and LFU.',
  },
  {
    q: '7. Explain FIFO.',
    a: 'FIFO (First In, First Out) evicts the item that entered the cache earliest, regardless of how often or recently it was accessed. It is simple to implement but does not consider access patterns. Example: if A, B, C are cached in that order and D is requested with capacity 3, A (the first in) is evicted.',
  },
  {
    q: '8. Explain LRU.',
    a: 'LRU (Least Recently Used) evicts the item that has not been accessed for the longest time. On every hit, the accessed item is marked as most recently used. Example: with cache [A, B, C] and a hit on A, A becomes most recent; if D is then requested, B (now least recent) is evicted.',
  },
  {
    q: '9. Explain LFU.',
    a: 'LFU (Least Frequently Used) evicts the item with the lowest access frequency. If two items have the same frequency, the least recently used among them is evicted. Example: if A was accessed 3 times and B once, B is evicted first when space is needed.',
  },
  {
    q: '10. What is locality of reference?',
    a: 'Locality of reference means that programs tend to access the same data or nearby data repeatedly within a short time window. There are two types: temporal locality (recently accessed data is likely to be accessed again) and spatial locality (data near recently accessed data is likely to be accessed). This is why caches are effective.',
  },
  {
    q: '11. What is cache hit ratio?',
    a: 'Cache hit ratio is the percentage of requests that result in a cache hit. Formula: (Cache Hits / Total Requests) × 100. A higher hit ratio means the cache is more effective.',
  },
  {
    q: '12. What is cache miss ratio?',
    a: 'Cache miss ratio is the percentage of requests that result in a cache miss. Formula: (Cache Misses / Total Requests) × 100. Hit ratio + Miss ratio = 100%.',
  },
  {
    q: '13. What is an eviction?',
    a: 'An eviction occurs when the cache is full and a new item needs to be inserted. The replacement algorithm selects an existing item to remove, making space for the new one. The number of evictions is an important performance metric.',
  },
  {
    q: '14. Why can different algorithms produce different results?',
    a: 'Different algorithms use different criteria to decide which item to evict. FIFO considers insertion order, LRU considers recency of access, and LFU considers frequency. Depending on the access pattern and cache capacity, these criteria lead to different eviction choices, resulting in different hit/miss outcomes.',
  },
  {
    q: '15. What are the limitations of this project?',
    a: 'This project models cache behaviour rather than accessing real operating-system file caches. It does not measure real disk or CPU performance. The latency values are simplified, configurable assumptions. Results depend on the selected workload and cache capacity, so they may not generalize to all real-world scenarios.',
  },
];

export default function VivaQuestions() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-5 h-5 text-teal-600" />
          <h2 className="text-xl font-bold text-[#0f2557]">Viva Questions &amp; Answers</h2>
        </div>
        <p className="text-sm text-slate-600">
          {QUESTIONS.length} beginner-friendly questions and answers to help you prepare for your viva examination.
          Click any question to expand or collapse its answer.
        </p>
      </div>

      <div className="space-y-2">
        {QUESTIONS.map((qa, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-semibold text-[#0f2557]">{qa.q}</span>
              {open === i ? (
                <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
              )}
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm text-slate-700 leading-relaxed animate-fade-in">
                {qa.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
