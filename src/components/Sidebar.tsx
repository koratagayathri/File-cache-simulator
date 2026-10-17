import {
  LayoutDashboard,
  Play,
  GitCompareArrows,
  Boxes,
  History,
  Info,
  HelpCircle,
  Database,
  X,
} from 'lucide-react';

export type PageId =
  | 'dashboard'
  | 'simulation'
  | 'comparison'
  | 'patterns'
  | 'history'
  | 'about'
  | 'viva';

interface SidebarProps {
  current: PageId;
  onNavigate: (page: PageId) => void;
  open: boolean;
  onClose: () => void;
}

const NAV: { id: PageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'simulation', label: 'Run Simulation', icon: Play },
  { id: 'comparison', label: 'Algorithm Comparison', icon: GitCompareArrows },
  { id: 'patterns', label: 'Access Patterns', icon: Boxes },
  { id: 'history', label: 'Simulation History', icon: History },
  { id: 'about', label: 'About Project', icon: Info },
  { id: 'viva', label: 'Viva Questions', icon: HelpCircle },
];

export default function Sidebar({ current, onNavigate, open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`fixed lg:static z-40 inset-y-0 left-0 w-72 bg-[#0f2557] text-slate-100 flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">File Cache</p>
              <p className="text-xs text-slate-300 leading-tight">Performance Simulator</p>
            </div>
          </div>
          <button className="lg:hidden text-slate-300" onClick={onClose} aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-teal-500 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-white/10 text-xs text-slate-400">
          College CS Project • Educational Tool
        </div>
      </aside>
    </>
  );
}
