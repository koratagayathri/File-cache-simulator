import { useState } from 'react';
import Sidebar, { type PageId } from '@/components/Sidebar';
import Header from '@/components/Header';
import ConfirmDialog from '@/components/ConfirmDialog';
import Dashboard from '@/pages/Dashboard';
import Simulation, { type SimConfig, defaultConfig } from '@/pages/Simulation';
import Comparison from '@/pages/Comparison';
import AccessPatterns from '@/pages/AccessPatterns';
import HistoryPage from '@/pages/History';
import About from '@/pages/About';
import VivaQuestions from '@/pages/VivaQuestions';
import { clearHistory } from '@/utils/storage';

export default function App() {
  const [page, setPage] = useState<PageId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reopenConfig, setReopenConfig] = useState<SimConfig | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleNavigate = (p: PageId) => {
    setPage(p);
    setSidebarOpen(false);
  };

  const handleReopen = (config: SimConfig) => {
    setReopenConfig(config);
    setPage('simulation');
  };

  const handleReset = () => {
    setConfirmReset(true);
  };

  const confirmResetAction = () => {
    clearHistory();
    setReopenConfig(defaultConfig());
    setPage('simulation');
    setConfirmReset(false);
  };

  const pageTitles: Record<PageId, string> = {
    dashboard: 'Dashboard',
    simulation: 'Run Simulation',
    comparison: 'Algorithm Comparison',
    patterns: 'Access Patterns',
    history: 'Simulation History',
    about: 'About Project',
    viva: 'Viva Questions',
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar
        current={page}
        onNavigate={handleNavigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(true)} onReset={handleReset} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            <div className="mb-4 lg:hidden">
              <h1 className="text-lg font-bold text-[#0f2557]">{pageTitles[page]}</h1>
            </div>
            {page === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
            {page === 'simulation' && <Simulation initialConfig={reopenConfig} onNavigate={handleNavigate} />}
            {page === 'comparison' && <Comparison initialConfig={reopenConfig} onNavigate={handleNavigate} />}
            {page === 'patterns' && <AccessPatterns />}
            {page === 'history' && <HistoryPage onReopen={handleReopen} />}
            {page === 'about' && <About />}
            {page === 'viva' && <VivaQuestions />}
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset Application?"
        message="This will clear all saved simulation history and reset the configuration to defaults. This cannot be undone."
        confirmLabel="Reset"
        onConfirm={confirmResetAction}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
