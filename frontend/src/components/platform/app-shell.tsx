import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { useAppStore } from '../../store/app';
import Sidebar from './sidebar';
import DashboardView from './dashboard-view';
import ScanView from './scan-view';
import TopicView from './topic-view';
import ImageStudioView from './image-studio-view';
import CodeStudioView from './code-studio-view';
import HistoryView from './history-view';
import ImagePanel from './image-panel';
import CodePanel from './code-panel';
import { Button } from '../ui/button';
import {
  LayoutDashboard,
  Radar,
  ChevronRight,
} from 'lucide-react';

const VIEW_META: Record<string, { label: string; icon: React.ReactNode; crumb: string }> = {
  dashboard: { label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, crumb: 'Dashboard' },
  scan: { label: 'Scan Trends', icon: <Radar className="h-4 w-4" />, crumb: 'Scan' },
  topic: { label: 'Topic Detail', icon: <Radar className="h-4 w-4" />, crumb: 'Topic' },
  image: { label: 'Image Studio', icon: <Radar className="h-4 w-4" />, crumb: 'Image Studio' },
  code: { label: 'Code Studio', icon: <Radar className="h-4 w-4" />, crumb: 'Code Studio' },
  history: { label: 'History', icon: <Radar className="h-4 w-4" />, crumb: 'History' },
};

export default function AppShell() {
  const location = useLocation();
  const runScan = useAppStore((s) => s.runScan);

  // Crumb logic
  let crumb = 'Dashboard';
  if (location.pathname === '/') crumb = 'Dashboard';
  else if (location.pathname.startsWith('/scan')) crumb = 'Scan';
  else if (location.pathname.startsWith('/topic')) crumb = 'Topic';
  else if (location.pathname.startsWith('/image')) crumb = 'Image Studio';
  else if (location.pathname.startsWith('/code')) crumb = 'Code Studio';
  else if (location.pathname.startsWith('/history')) crumb = 'History';

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col min-w-0">
        <header className="hidden lg:flex h-16 items-center justify-between gap-4 border-b border-white/10 bg-zinc-950/60 backdrop-blur-xl px-6 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-zinc-400 hover:text-amber-300">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
            <span className="text-zinc-200">{crumb}</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={async () => {
                const r = await runScan('AI Related');
                if (r.ok) {
                  // Navigate to scan view
                  window.location.hash = '#scan';
                }
              }}
              variant="outline"
              className="h-9 rounded-lg border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10"
            >
              <Radar className="mr-1.5 h-3.5 w-3.5" /> Quick scan
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Routes>
              <Route path="/" element={<DashboardView />} />
              <Route path="/scan" element={<ScanView />} />
              <Route path="/scan/:category" element={<ScanView />} />
              <Route path="/topic" element={<TopicView />} />
              <Route path="/image" element={<ImageStudioView />} />
              <Route path="/code" element={<CodeStudioView />} />
              <Route path="/history" element={<HistoryView />} />
              <Route path="*" element={<DashboardView />} />
            </Routes>
          </div>
        </main>

        <footer className="mt-auto border-t border-white/10 bg-zinc-950/60 px-6 py-4 text-center text-[11px] text-zinc-500">
          TechNova — AI Tech News & Content Generation Platform. Built with React, Express, MongoDB Atlas, and the Gemini API.
        </footer>
      </div>

      <ImagePanel />
      <CodePanel />
    </div>
  );
}
