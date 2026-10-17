import { Menu, RotateCcw, Database } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onReset: () => void;
}

export default function Header({ onToggleSidebar, onReset }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={onToggleSidebar}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-600" />
            <div>
              <h1 className="text-lg font-bold text-[#0f2557] leading-tight">
                File Cache Performance Simulator
              </h1>
              <p className="text-xs text-slate-500 leading-tight">
                Visualize and compare FIFO, LRU &amp; LFU cache replacement algorithms
              </p>
            </div>
          </div>
          <h1 className="sm:hidden text-base font-bold text-[#0f2557]">Cache Simulator</h1>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Reset App</span>
        </button>
      </div>
    </header>
  );
}
