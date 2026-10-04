'use client';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, useAppStore } from '../../store/app';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Sparkles,
  Rocket,
  Radar,
  ArrowRight,
  TrendingUp,
  Flame,
  Zap,
  Brain,
} from 'lucide-react';
import TextType from '../animation/TextType';
import MagicBento from '../animation/MagicBento';
import CircularGallery from '../animation/CircularGallery';

const TECH_GALLERY_ITEMS = Array.from({ length: 10 }, (_, i) => ({
  image: `https://picsum.photos/seed/tech-${i + 100}/800/600`,
  text: ['Neural Net', 'Silicon', 'Cloud', 'Cyber', 'Edge AI', 'GPU', 'Quantum', 'Robotics', 'Web3', 'DevOps'][i] || 'Tech',
}));

export default function DashboardView() {
  const navigate = useNavigate();
  const runScan = useAppStore((s) => s.runScan);

  const handleScan = async (category: string) => {
    navigate('/scan', { state: { category, loading: true, results: [] } });
    const r = await runScan(category);
    if (r.ok && r.results) {
      navigate('/scan', { state: { category, results: r.results, loading: false }, replace: true });
    } else {
      navigate('/scan', { state: { category, results: [], loading: false, error: r.error }, replace: true });
    }
  };

  const bentoCards = CATEGORIES.map((cat, i) => ({
    color: '#0c0c0e',
    label: cat.name.split(' / ')[0],
    title: cat.name.split(' / ')[0],
    description: cat.description,
    extra: (
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-widest text-zinc-500">
          {String(i + 1).padStart(2, '0')} / 10
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleScan(cat.name);
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 ring-1 ring-amber-400/30 transition hover:bg-amber-500/20"
        >
          Scan Trends <Radar className="h-3.5 w-3.5" />
        </button>
      </div>
    ),
  }));

  return (
    <div className="min-h-full space-y-10 pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-zinc-950/80 p-6 sm:p-10">
        <div className="pointer-events-none absolute -top-32 right-0 h-[420px] w-[420px] rounded-full bg-amber-500/15 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 left-0 h-[360px] w-[360px] rounded-full bg-emerald-500/10 blur-[100px]" />

        <div className="relative grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-5">
            <Badge variant="outline" className="rounded-full border-amber-400/30 bg-amber-500/10 text-amber-200">
              <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
              Live trend radar
            </Badge>
            <div className="text-3xl font-black leading-tight text-zinc-100 sm:text-4xl lg:text-5xl">
              <span className="block text-zinc-400 text-base sm:text-lg font-medium mb-2">Discover what's trending in</span>
              <TextType
                text={['AI Research', 'Cybersecurity', 'Cloud & DevOps', 'Hardware & Chips', 'New AI Models', 'Gaming Tech']}
                typingSpeed={70}
                deletingSpeed={35}
                pauseDuration={1400}
                className="text-grad-amber font-mono"
                cursorClassName="text-amber-300"
                showCursor
                variableSpeed={false}
                onSentenceComplete={() => {}}
              />
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              TechNova scans the tech world, finds what's trending right now, and turns each topic into humanized,
              platform-specific content your audience actually wants to read.
            </p>
            <div className="flex flex-wrap items-center gap-3 w-full">
              <Button
                onClick={() => handleScan(CATEGORIES[0].name)}
                className="h-11 rounded-xl premium-grad text-zinc-950 font-semibold hover:opacity-90 w-full sm:w-auto"
              >
                Scan AI Trends <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.hash = '#history')}
                className="h-11 rounded-xl border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10 w-full sm:w-auto"
              >
                <TrendingUp className="mr-2 h-4 w-4" /> View history
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 pt-2 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1.5"><Flame className="h-3.5 w-3.5 text-amber-400" /> 15-20 trends per scan</span>
              <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-emerald-400" /> 8 platforms supported</span>
              <span className="inline-flex items-center gap-1.5"><Brain className="h-3.5 w-3.5 text-amber-400" /> Gemini-powered analysis</span>
            </div>
          </div>

          <Card className="relative overflow-hidden rounded-2xl border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-zinc-900/60 to-emerald-500/5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.18),transparent_55%)]" />
            <CardContent className="relative space-y-4 p-6">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-amber-200">
                  <Rocket className="h-3 w-3" /> Just launched
                </span>
                <span className="text-[10px] uppercase tracking-widest text-zinc-500">Auto-curated</span>
              </div>
              <h3 className="text-xl font-bold leading-snug text-zinc-50">
                Discover newly launched AI models, tools, and technologies.
              </h3>
              <p className="text-xs leading-relaxed text-zinc-400">
                A dedicated radar for fresh model releases, new dev tools, and emerging capabilities. TechNova filters the noise and surfaces what's actually usable.
              </p>
              <Button
                onClick={() => handleScan(CATEGORIES[9].name)}
                className="h-10 w-full rounded-xl premium-grad text-zinc-950 font-semibold hover:opacity-90"
              >
                Explore new launches <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Category grid */}
      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100 sm:text-3xl">Tech Categories</h2>
            <p className="text-sm text-zinc-400">Pick a category and scan the 15-20 most relevant trends right now.</p>
          </div>
          <Badge variant="outline" className="rounded-full border-white/10 bg-white/5 text-zinc-300">
            10 categories
          </Badge>
        </div>

        <div className="[&_.bento-section]:grid [&_.bento-section]:grid-cols-1 [&_.bento-section]:gap-4 sm:[&_.bento-section]:grid-cols-2 lg:[&_.bento-section]:grid-cols-3 xl:[&_.bento-section]:grid-cols-4">
          <MagicBento
            cards={bentoCards}
            textAutoHide={false}
            enableStars={false}
            enableSpotlight={false}
            enableBorderGlow
            glowColor="245, 158, 11"
            clickEffect={false}
            enableMagnetism={false}
            onClick={() => {}}
          />
        </div>
      </section>

      {/* Decorative CircularGallery */}
      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100 sm:text-3xl">Latest in Tech Imagery</h2>
            <p className="text-sm text-zinc-400">A live carousel of tech imagery. Drag or use arrow keys to explore.</p>
          </div>
        </div>
        <div className="h-[420px] w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/40">
          <CircularGallery
            items={TECH_GALLERY_ITEMS}
            bend={3}
            textColor="#fbbf24"
            borderRadius={0.06}
            scrollSpeed={2}
            fontUrl=""
          />
        </div>
      </section>
    </div>
  );
}
