'use client';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../store/app';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../../lib/utils';
import {
  ArrowLeft,
  Radar,
  Flame,
  Zap,
  Sparkles,
  TrendingUp,
  Calendar,
  ArrowRight,
  Quote,
  RefreshCw,
} from 'lucide-react';
import GlitchText from '../animation/GlitchText';
import ScrollStack, { ScrollStackItem } from '../animation/ScrollStack';
import type { TrendItem } from '../../lib/types';

const FILTERS = [
  { key: 'all', label: 'All', icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { key: 'trending', label: 'Trending', icon: <Flame className="h-3.5 w-3.5" /> },
  { key: 'viral', label: 'Viral', icon: <Zap className="h-3.5 w-3.5" /> },
  { key: 'emerging', label: 'Emerging', icon: <Sparkles className="h-3.5 w-3.5" /> },
  { key: 'new', label: 'New AI Models', icon: <Radar className="h-3.5 w-3.5" /> },
] as const;

type FilterKey = typeof FILTERS[number]['key'];

interface ScanRouteState {
  category?: string;
  results?: TrendItem[];
  loading?: boolean;
  error?: string;
}

export default function ScanView() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const routeState = (location.state || {}) as ScanRouteState;
  const category = routeState.category || decodeURIComponent(params.category || '') || 'AI Related';
  const runScan = useAppStore((s) => s.runScan);

  const [results, setResults] = useState<TrendItem[]>(routeState.results || []);
  const [loading, setLoading] = useState<boolean>(routeState.loading ?? !routeState.results);
  const [error, setError] = useState<string | null>(routeState.error || null);
  const [filter, setFilter] = useState<FilterKey>('all');

  const doScan = async (cat: string) => {
    setLoading(true);
    setError(null);
    setResults([]);
    const r = await runScan(cat);
    if (r.ok && r.results) {
      setResults(r.results);
    } else {
      setError(r.error || 'Scan failed.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!routeState.results && !routeState.loading) {
      doScan(category);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const filtered = results.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'trending') return r.trending;
    if (filter === 'viral') return r.viral;
    if (filter === 'emerging') return r.emerging;
    if (filter === 'new') return /new|launch|model|release/i.test(r.title + ' ' + r.summary);
    return true;
  });

  const handleCreate = (t: TrendItem) => {
    navigate('/topic', { state: { topic: t } });
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button
            onClick={() => navigate('/')}
            className="mb-2 inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </button>
          <div className="text-[11px] uppercase tracking-[0.25em] text-amber-300/70">Category scan</div>
          <GlitchText speed={1.2} className="text-3xl font-black sm:text-4xl">{category}</GlitchText>
          <p className="mt-2 text-sm text-zinc-400">
            {loading ? 'Analyzing the latest trends...' : `${filtered.length} trend${filtered.length === 1 ? '' : 's'} found.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => doScan(category)}
            disabled={loading}
            className="h-10 rounded-xl premium-grad text-zinc-950 font-semibold hover:opacity-90"
          >
            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Radar className="mr-2 h-4 w-4" />}
            {loading ? 'Scanning...' : 'Rescan'}
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 py-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition',
              filter === f.key
                ? 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/40'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
            )}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {error && !loading && (
        <div className="my-6 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 text-center">
          <p className="font-semibold text-rose-200">Scan failed</p>
          <p className="mt-1 text-sm text-zinc-400">{error}</p>
          <Button onClick={() => doScan(category)} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" /> Try again
          </Button>
        </div>
      )}

      {loading && (
        <div className="grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-2xl border border-white/10 bg-zinc-900/40 p-5">
              <Skeleton className="h-4 w-1/3 bg-zinc-700" />
              <Skeleton className="h-6 w-3/4 bg-zinc-700" />
              <Skeleton className="h-16 w-full bg-zinc-700" />
              <Skeleton className="h-2 w-full bg-zinc-700" />
              <Skeleton className="h-8 w-1/2 bg-zinc-700" />
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="my-12 rounded-2xl border border-white/10 bg-zinc-900/40 p-12 text-center">
          <Radar className="mx-auto h-10 w-10 text-zinc-600" />
          <p className="mt-3 font-semibold text-zinc-200">No trends match this filter</p>
          <p className="mt-1 text-sm text-zinc-500">Try a different filter or rescan the category.</p>
          <Button onClick={() => setFilter('all')} variant="outline" className="mt-4">Show all</Button>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TrendCard key={t.id} item={t} onCreate={() => handleCreate(t)} />
          ))}
        </div>
      )}
    </div>
  );
}

function TrendCard({ item, onCreate }: { item: TrendItem; onCreate: () => void }) {
  const popularity = Math.max(0, Math.min(100, item.popularityScore));
  const popColor = popularity >= 75 ? 'bg-emerald-500' : popularity >= 50 ? 'bg-amber-500' : 'bg-zinc-500';

  return (
    <div className="flex h-full flex-col gap-3 rounded-[28px] border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-zinc-950/90 p-6 sm:p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.7)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {item.trending && (
            <Badge className="rounded-full bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/30 hover:bg-amber-500/20">
              <Flame className="mr-1 h-3 w-3" /> Trending
            </Badge>
          )}
          {item.viral && (
            <Badge className="rounded-full bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30 hover:bg-emerald-500/20">
              <Zap className="mr-1 h-3 w-3" /> Viral
            </Badge>
          )}
          {item.emerging && (
            <Badge className="rounded-full bg-fuchsia-500/15 text-fuchsia-200 ring-1 ring-fuchsia-400/30 hover:bg-fuchsia-500/20">
              <Sparkles className="mr-1 h-3 w-3" /> Emerging
            </Badge>
          )}
          <Badge variant="outline" className="rounded-full border-white/10 bg-white/5 text-zinc-300">
            {item.contentPotential} content potential
          </Badge>
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
          <Calendar className="h-3.5 w-3.5" /> {item.publishedAt}
        </span>
      </div>

      <h3 className="text-xl font-bold leading-snug text-zinc-50 sm:text-2xl">{item.title}</h3>

      <p className="text-sm leading-relaxed text-zinc-400">{item.summary}</p>

      {item.whyTrending && (
        <div className="rounded-xl border-l-2 border-amber-400/50 bg-amber-500/5 px-3 py-2 text-sm text-amber-100/90">
          <Quote className="mr-1 inline h-3.5 w-3.5 text-amber-400/80" />
          {item.whyTrending}
        </div>
      )}

      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] text-zinc-500">
          <span>Popularity / Buzz</span>
          <span className="font-mono font-semibold text-zinc-300">{popularity}/100</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <div className={cn('h-full rounded-full', popColor)} style={{ width: `${popularity}%` }} />
        </div>
      </div>

      <div className="mt-auto space-y-2 pt-2">
        {item.sources?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.sources.slice(0, 5).map((s, i) => (
              <span key={i} className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-400">{s}</span>
            ))}
          </div>
        )}
        {item.keywords?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.keywords.slice(0, 6).map((k, i) => (
              <span key={i} className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-200/90">#{k}</span>
            ))}
          </div>
        )}
      </div>

      <Button
        onClick={onCreate}
        className="mt-2 h-11 w-full rounded-xl premium-grad text-zinc-950 font-semibold hover:opacity-90"
      >
        Create content from this topic <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
