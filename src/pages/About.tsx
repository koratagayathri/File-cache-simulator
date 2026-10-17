import {
  Info,
  Target,
  ListChecks,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Rocket,
  Cpu,
} from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-teal-600" />
          <h2 className="text-xl font-bold text-[#0f2557]">About the Project</h2>
        </div>
        <Section title="Project Abstract">
          The File Cache Performance Simulator is an educational tool that models file requests and
          cache replacement policies. It helps users understand caching behaviour through visual
          simulation and performance comparisons of FIFO, LRU, and LFU algorithms under different
          access patterns and cache sizes.
        </Section>

        <Section title="Problem Statement">
          Understanding how cache replacement algorithms affect performance can be difficult without
          visual examples. This project provides an interactive way to experiment with different file
          access patterns and cache sizes, making the abstract concepts of caching concrete and
          observable.
        </Section>

        <Section title="Objectives">
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            <li>Simulate file access and cache storage</li>
            <li>Demonstrate cache hits and misses</li>
            <li>Implement FIFO, LRU, and LFU replacement algorithms</li>
            <li>Calculate cache performance metrics</li>
            <li>Compare algorithms using identical workloads</li>
            <li>Visualize results through charts and tables</li>
          </ul>
        </Section>

        <Section title="Existing System">
          Manual calculations and static textbook examples make it difficult to compare multiple
          algorithms and access sequences. Students must work through each step by hand, which is
          time-consuming and error-prone.
        </Section>

        <Section title="Proposed System">
          The application automates cache simulation, provides step-by-step visualization, calculates
          performance metrics, and compares algorithms interactively — all in the browser with no
          backend required.
        </Section>

        <Section title="System Modules" icon={Layers}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              'Input Configuration Module',
              'Cache Simulation Engine',
              'Replacement Algorithm Module',
              'Performance Analysis Module',
              'Visualization Module',
              'History and Export Module',
            ].map((m) => (
              <div key={m} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-700">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {m[0]}
                </span>
                {m}
              </div>
            ))}
          </div>
        </Section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-emerald-800">Advantages</h4>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
              <li>Easy to understand</li>
              <li>Interactive visualization</li>
              <li>Accurate, repeatable experiments</li>
              <li>Comparison of multiple algorithms</li>
              <li>No external database required</li>
              <li>Useful for learning OS and architecture concepts</li>
            </ul>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h4 className="font-bold text-amber-800">Limitations</h4>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
              <li>Models cache behaviour, not real OS file caches</li>
              <li>Does not measure real disk or CPU performance</li>
              <li>Uses simplified, configurable latency assumptions</li>
              <li>Results depend on the selected workload and cache capacity</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-blue-800">Future Enhancements</h4>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
            <li>Real file metadata experiments</li>
            <li>Additional replacement algorithms (Optimal, ARC, Clock)</li>
            <li>Advanced workload generation</li>
            <li>More performance metrics</li>
            <li>Persistent cloud-based history</li>
          </ul>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-5 h-5 text-slate-600" />
            <h4 className="font-bold text-[#0f2557]">Technology Stack</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Lucide React', 'Recharts', 'Vitest'].map((t) => (
              <span key={t} className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: typeof Target;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1.5">
        {Icon && <Icon className="w-4 h-4 text-teal-600" />}
        <h3 className="text-sm font-bold text-[#0f2557] uppercase tracking-wide">{title}</h3>
      </div>
      <div className="text-sm text-slate-700 leading-relaxed pl-6">{children}</div>
    </div>
  );
}
