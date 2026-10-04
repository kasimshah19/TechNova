import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  History,
  Image as ImageIcon,
  Code2,
  Sparkles,
  Radar,
  Settings,
} from 'lucide-react';
import GlitchText from '../animation/GlitchText';

export interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  desc: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: <LayoutDashboard className="h-4 w-4" />, desc: 'Categories & trends' },
  { label: 'Scan History', to: '/history', icon: <History className="h-4 w-4" />, desc: 'Past scans & content' },
  { label: 'Image Studio', to: '/image', icon: <ImageIcon className="h-4 w-4" />, desc: 'Generate AI images' },
  { label: 'Code Studio', to: '/code', icon: <Code2 className="h-4 w-4" />, desc: 'Generate code' },
];

export const STAGGER_ITEMS = NAV_ITEMS.map((n) => ({ label: n.label, link: n.to, ariaLabel: n.label }));

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();



  const isActive = (to: string) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <>
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/10 bg-zinc-950/60 backdrop-blur-xl sticky top-0 h-screen">
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <Link to="/" className="grid h-9 w-9 place-items-center rounded-xl premium-grad text-zinc-950">
            <Sparkles className="h-4 w-4" />
          </Link>
          <div>
            <GlitchText speed={1.4} className="text-xl font-black leading-none">TECHNOVA</GlitchText>
            <p className="text-[10px] uppercase tracking-[0.25em] text-amber-300/70 mt-1">Tech Intelligence</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto nice-scroll px-3 py-5">
          <div className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Workspace</div>
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all',
                      active
                        ? 'bg-gradient-to-r from-amber-500/15 to-emerald-500/5 text-amber-200 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.25)]'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                    )}
                  >
                    <span className={cn('grid h-8 w-8 place-items-center rounded-lg', active ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-zinc-400 group-hover:text-amber-300')}>
                      {item.icon}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-medium">{item.label}</span>
                      <span className="block text-[11px] text-zinc-500">{item.desc}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="px-2 mt-6 mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Quick Tools</div>
          <ul className="space-y-1">
            <li>
              <Link to="/scan" className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-zinc-400 hover:bg-white/5 hover:text-zinc-200">
                <Radar className="h-4 w-4" /> Rescan trends
              </Link>
            </li>
            <li>
              <Link to="/" className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-zinc-400 hover:bg-white/5 hover:text-zinc-200">
                <Settings className="h-4 w-4" /> Settings
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
