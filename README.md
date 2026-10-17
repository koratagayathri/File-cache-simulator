# File Cache Performance Simulator

An interactive educational tool for visualizing and comparing cache replacement algorithms (FIFO, LRU, LFU) under different file access patterns and cache sizes. Built as a college computer science project.

## Project Overview

The File Cache Performance Simulator models file requests and cache replacement policies, helping users understand caching behavior through visual step-by-step simulation and performance comparisons. It runs entirely in the browser — no backend, database, or API keys required.

## Problem Statement

Understanding how cache replacement algorithms affect performance can be difficult without visual examples. This project provides an interactive way to experiment with different file access patterns and cache sizes, making abstract caching concepts concrete and observable.

## Objectives

- Simulate file access and cache storage
- Demonstrate cache hits and misses
- Implement FIFO, LRU, and LFU replacement algorithms
- Calculate cache performance metrics
- Compare algorithms using identical workloads
- Visualize results through charts and tables

## Features

- **Dashboard** with live metrics, charts, and recent history
- **Step-by-step simulation** with play, pause, next, previous, restart, and full-run controls
- **Algorithm comparison** — run FIFO, LRU, and LFU side by side with grouped bar charts, ratio charts, and cumulative hit ratio line charts
- **Access pattern experiments** — Repeated, Sequential, Mixed, and Locality of Reference patterns
- **Simulation history** saved to LocalStorage with view, delete, clear, and reopen actions
- **Export** — CSV (request-by-request), plain-text report, and print-friendly report
- **About page** with abstract, objectives, modules, advantages, limitations, and future enhancements
- **Viva questions** — 15+ Q&A pairs for exam preparation
- **Input validation** with clear error messages
- **Responsive design** for desktop, tablet, and mobile

## Technology Stack

- React 18
- TypeScript 5
- Vite 5
- Tailwind CSS 3
- Lucide React (icons)
- Recharts (data visualization)
- Vitest (unit testing)
- Browser LocalStorage (persistence)

## Folder Structure

```
src/
  algorithms/
    fifo.ts          # FIFO implementation
    lru.ts           # LRU implementation
    lfu.ts           # LFU implementation
    simulator.ts     # Core simulation engine + comparison runner
  components/
    Sidebar.tsx
    Header.tsx
    MetricCard.tsx
    CacheSlots.tsx
    SimulationControls.tsx
    PlaybackControls.tsx
    RequestHistoryTable.tsx
    ComparisonCharts.tsx
    ConfirmDialog.tsx
    EmptyState.tsx
  pages/
    Dashboard.tsx
    Simulation.tsx
    Comparison.tsx
    AccessPatterns.tsx
    History.tsx
    About.tsx
    VivaQuestions.tsx
  utils/
    metrics.ts       # Metric calculations and formatting
    export.ts        # CSV, text report, and print export
    storage.ts       # LocalStorage history and preferences
  types/
    index.ts         # Shared types and constants
  tests/
    fifo.test.ts
    lru.test.ts
    lfu.test.ts
    simulator.test.ts
  App.tsx
  main.tsx
```

## Cache Algorithm Explanations

### FIFO — First In, First Out
Evicts the file that entered the cache earliest, regardless of how often or recently it was accessed. A cache hit does not change the insertion order. Simple but does not consider access patterns.

### LRU — Least Recently Used
Evicts the file that has not been accessed for the longest time. On every cache hit, the accessed file's recency is updated. Performs well when workloads exhibit temporal locality.

### LFU — Least Frequently Used
Evicts the file with the lowest access frequency. When two or more files have equal frequencies, the least recently used among them is evicted. Effective when some files are consistently more popular.

## Performance Formulas

- **Cache Hit Ratio** = (Cache Hits / Total Requests) × 100
- **Cache Miss Ratio** = (Cache Misses / Total Requests) × 100
- **Average Simulated Access Time** = (Hits × Hit Latency + Misses × Miss Latency) / Total Requests
- Default latencies: Hit = 1 ms, Miss = 10 ms (illustrative values, not real hardware measurements)

## Installation

```bash
npm install
```

## Running the Project Locally

```bash
npm run dev
```

The development server starts automatically and the app opens in your browser.

## Running Unit Tests

```bash
npm run test
```

To run tests in watch mode:

```bash
npm run test:watch
```

## Building for Production

```bash
npm run build
```

The built files are placed in the `dist/` directory.

## Type Checking

```bash
npm run typecheck
```

## Example Experiments

### Example 1: Repeated Access
- **Sequence:** A, B, A, B, A, B
- **Capacity:** 2
- **Expected:** With capacity ≥ 2, every request after the first two is a hit. All three algorithms achieve the same hit ratio.

### Example 2: Sequential Access
- **Sequence:** A, B, C, D, E, F
- **Capacity:** 3
- **Expected:** Every request is a miss (no file is ever revisited). All algorithms produce 0% hit ratio.

### Example 3: Locality of Reference
- **Sequence:** A, B, C, A, B, A, D, A, B, C
- **Capacity:** 3
- **Expected:** LRU and LFU typically outperform FIFO because they retain frequently and recently used files.

### Example 4: Compare All
- **Sequence:** A, B, C, A, B, D, A, C, D, B
- **Capacity:** 3
- **Expected:** Different algorithms produce different hit/miss counts. The comparison view shows which performs best for this specific workload.

## Expected Results

Results are computed live by the simulation engine — no values are hardcoded. The best algorithm depends on the access pattern and cache capacity; no algorithm is guaranteed to perform best in every situation.

## Limitations

- Models cache behavior rather than accessing real operating-system file caches
- Does not measure real disk or CPU performance
- Uses simplified, configurable latency assumptions
- Results depend on the selected workload and cache capacity

## Future Enhancements

- Real file metadata experiments
- Additional replacement algorithms (Optimal, ARC, Clock)
- Advanced workload generation
- More performance metrics
- Persistent cloud-based history
