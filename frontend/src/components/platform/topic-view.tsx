'use client';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { PLATFORMS, useAppStore } from '../../store/app';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  Flame,
  Zap,
  Sparkles,
  Clock,
  TrendingUp,
  Hash,
  Key,
  ArrowRight,
  Image as ImageIcon,
  RefreshCw,
  Copy,
  Check,
  Tag,
} from 'lucide-react';
import GlitchText from '../animation/GlitchText';
import PillNav from '../animation/PillNav';
import type { Platform, TrendItem, PostingTimeResult } from '../../lib/types';

interface TopicRouteState {
  topic?: TrendItem;
  category?: string;
}

export default function TopicView() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = (location.state || {}) as TopicRouteState;
  const topic = routeState.topic;
  const generateContent = useAppStore((s) => s.generateContent);
  const setImagePanelOpen = useAppStore((s) => s.setImagePanelOpen);
  const setImagePromptDraft = useAppStore((s) => s.setImagePromptDraft);

  const [platform, setPlatform] = useState<Platform>('Instagram');
  const [content, setContent] = useState<any>(null);
  const [postingTime, setPostingTime] = useState<PostingTimeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doGenerate = async (p: Platform) => {
    if (!topic) return;
    setLoading(true);
    setError(null);
    setContent(null);
    setPostingTime(null);
    const r = await generateContent(topic.title, topic.summary, p);
    if (r.ok) {
      setContent(r.data);
      if (r.postingTime) setPostingTime(r.postingTime);
    } else {
      setError(r.error || 'Generation failed.');
      toast.error(r.error || 'Generation failed.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (topic) {
      const t = setTimeout(() => doGenerate('Instagram'), 200);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic?.title]);

  if (!topic) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-center">
        <div>
          <p className="text-zinc-400">No topic selected.</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  const pillItems = PLATFORMS.map((p) => ({
    label: p,
    href: '#',
    ariaLabel: `Generate ${p} content`,
  }));

  const handlePlatformSelect = (item: { label?: string }) => {
    const p = item.label as Platform;
    if (p && PLATFORMS.includes(p)) {
      setPlatform(p);
      doGenerate(p);
    }
  };

  const openImageStudio = () => {
    setImagePromptDraft(`A striking, modern editorial illustration about: ${topic.title}. Concept: ${topic.summary.slice(0, 240)}. Style: cinematic, tech-forward, premium SaaS aesthetic.`);
    setImagePanelOpen(true);
    toast.success('Image studio opened with a topic-aware prompt.');
  };

  return (
    <div className="flex flex-col gap-6 pb-16">
      <Link to="/scan" className="inline-flex w-fit items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-300">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to trends
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="glass-card overflow-hidden rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap gap-1.5">
              {topic.trending && <Badge className="rounded-full bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/30"><Flame className="mr-1 h-3 w-3" /> Trending</Badge>}
              {topic.viral && <Badge className="rounded-full bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30"><Zap className="mr-1 h-3 w-3" /> Viral</Badge>}
              {topic.emerging && <Badge className="rounded-full bg-fuchsia-500/15 text-fuchsia-200 ring-1 ring-fuchsia-400/30"><Sparkles className="mr-1 h-3 w-3" /> Emerging</Badge>}
              <Badge variant="outline" className="rounded-full border-white/10 bg-white/5 text-zinc-300">{topic.contentPotential} potential</Badge>
              <Badge variant="outline" className="rounded-full border-white/10 bg-white/5 text-zinc-400">
                <Calendar className="mr-1 h-3 w-3" /> {topic.publishedAt}
              </Badge>
            </div>
            <CardTitle className="pt-2">
              <GlitchText speed={1.1} className="text-2xl font-black leading-tight sm:text-3xl">{topic.title}</GlitchText>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-zinc-300">{topic.summary}</p>
            {topic.whyTrending && (
              <div className="rounded-xl border-l-2 border-amber-400/50 bg-amber-500/5 px-3 py-2 text-sm text-amber-100/90">
                <span className="font-semibold text-amber-300">Why it's trending: </span>{topic.whyTrending}
              </div>
            )}
            {topic.keywords?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {topic.keywords.map((k, i) => (
                  <span key={i} className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-200/90">#{k}</span>
                ))}
              </div>
            )}
            {topic.sources?.length > 0 && (
              <div>
                <div className="mb-1 text-[11px] uppercase tracking-widest text-zinc-500">Sources</div>
                <div className="flex flex-wrap gap-1">
                  {topic.sources.map((s, i) => (
                    <span key={i} className="rounded-md bg-white/5 px-1.5 py-0.5 text-xs text-zinc-400">{s}</span>
                  ))}
                </div>
              </div>
            )}
            <Button onClick={openImageStudio} className="h-11 w-full rounded-xl premium-grad text-zinc-950 font-semibold hover:opacity-90">
              <ImageIcon className="mr-2 h-4 w-4" /> Open Image Studio with topic-aware prompt
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-amber-300" /> Best Posting Time & Reach
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full bg-zinc-700" />
                <Skeleton className="h-24 w-full bg-zinc-700" />
              </div>
            ) : postingTime ? (
              <PostingTimeCard result={postingTime} platform={platform} />
            ) : (
              <p className="text-sm text-zinc-500">Run a content generation to see timing recommendations.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Pick a platform to generate content for</CardTitle>
          <p className="text-xs text-zinc-400">Auto-generates humanized, platform-optimized content on selection.</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto no-scrollbar py-2">
            <PillNav
              logo="/logo.svg"
              items={pillItems}
              activeHref={'#'}
              baseColor="#fafafa"
              pillColor="#0c0c0e"
              hoveredPillTextColor="#0c0c0e"
              pillTextColor="#a1a1aa"
              ease="power3.easeOut"
              onSelect={handlePlatformSelect}
              initialLoadAnimation={false}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card overflow-hidden rounded-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-amber-500/15 text-amber-300 text-xs font-bold">
                  {platform.charAt(0)}
                </span>
                Generated content for {platform}
              </CardTitle>
            </div>
            <Button
              onClick={() => doGenerate(platform)}
              disabled={loading}
              variant="outline"
              className="h-9 rounded-lg border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10"
            >
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-2/3 bg-zinc-700" />
              <Skeleton className="h-24 w-full bg-zinc-700" />
              <Skeleton className="h-6 w-1/3 bg-zinc-700" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-6 text-center">
              <p className="font-semibold text-rose-200">Generation failed</p>
              <p className="mt-1 text-sm text-zinc-400">{error}</p>
              <Button onClick={() => doGenerate(platform)} className="mt-3">Retry</Button>
            </div>
          ) : content ? (
            <ContentRenderer platform={platform} content={content} />
          ) : (
            <p className="text-sm text-zinc-500">Select a platform to generate content.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PostingTimeCard({ result, platform }: { result: PostingTimeResult; platform: Platform }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-3">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">Best time</div>
          <div className="mt-1 font-mono text-xl font-bold text-amber-300">{result.bestTime}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-3">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">Best day</div>
          <div className="mt-1 font-mono text-xl font-bold text-emerald-300">{result.bestDay}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-3">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">Engagement</div>
          <div className={`mt-1 text-xl font-bold ${result.expectedEngagement === 'High' ? 'text-emerald-300' : result.expectedEngagement === 'Medium' ? 'text-amber-300' : 'text-zinc-400'}`}>{result.expectedEngagement}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-3">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">Reach</div>
          <div className={`mt-1 text-xl font-bold ${result.potentialReach === 'High' ? 'text-emerald-300' : result.potentialReach === 'Medium' ? 'text-amber-300' : 'text-zinc-400'}`}>{result.potentialReach}</div>
        </div>
      </div>
      <div>
        <div className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-zinc-500">
          <TrendingUp className="h-3 w-3" /> Why this timing on {platform}
        </div>
        <p className="rounded-xl bg-white/5 p-3 text-sm leading-relaxed text-zinc-300">{result.reason}</p>
      </div>
    </div>
  );
}

function ContentRenderer({ platform, content }: { platform: Platform; content: any }) {
  return (
    <Tabs defaultValue="content" className="w-full">
      <TabsList className="bg-zinc-900/60">
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="seo">SEO & Hashtags</TabsTrigger>
        <TabsTrigger value="cta">CTA</TabsTrigger>
      </TabsList>

      <TabsContent value="content" className="space-y-3">
        <ContentBody platform={platform} data={content} />
      </TabsContent>
      <TabsContent value="seo" className="space-y-4">
        <SeoSection platform={platform} data={content} />
      </TabsContent>
      <TabsContent value="cta" className="space-y-3">
        <CtaSection platform={platform} data={content} />
      </TabsContent>
    </Tabs>
  );
}

function ContentBody({ platform, data }: { platform: Platform; data: any }) {
  const fields: { label: string; value: string; mono?: boolean }[] = [];
  switch (platform) {
    case 'Instagram':
      fields.push({ label: 'Hook', value: data.hook });
      fields.push({ label: 'Caption', value: data.caption });
      break;
    case 'LinkedIn':
      fields.push({ label: 'Opening hook', value: data.openingHook });
      fields.push({ label: 'Body', value: data.body });
      break;
    case 'Pinterest':
      fields.push({ label: 'Title', value: data.title });
      fields.push({ label: 'Description', value: data.description });
      break;
    case 'Twitter/X':
      fields.push({ label: 'Tweet', value: data.text });
      break;
    case 'Reddit':
      fields.push({ label: 'Title', value: data.title });
      fields.push({ label: 'Subreddit', value: data.subreddit, mono: true });
      fields.push({ label: 'Body', value: data.body });
      break;
    case 'Facebook':
      fields.push({ label: 'Text', value: data.text });
      break;
    case 'Threads':
      fields.push({ label: 'Text', value: data.text });
      break;
    case 'Blog':
      fields.push({ label: 'Title', value: data.title });
      fields.push({ label: 'Meta description', value: data.metaDescription });
      fields.push({ label: 'Headings', value: (data.headings || []).map((h: string) => `- ${h}`).join('\n'), mono: true });
      fields.push({ label: 'Body (markdown)', value: data.body, mono: true });
      if (data.faqs?.length) {
        fields.push({ label: 'FAQs', value: data.faqs.map((f: any) => `Q: ${f.q}\nA: ${f.a}`).join('\n\n') });
      }
      break;
  }
  return (
    <div className="space-y-3">
      {fields.filter(f => f.value).map((f, i) => (
        <CopyBlock key={i} label={f.label} value={f.value} mono={f.mono} />
      ))}
    </div>
  );
}

function SeoSection({ platform, data }: { platform: Platform; data: any }) {
  const items: { icon: React.ReactNode; label: string; values: string[] }[] = [];
  if (data.hashtags?.length) items.push({ icon: <Hash className="h-3.5 w-3.5 text-amber-300" />, label: 'Hashtags', values: data.hashtags });
  if (data.seoKeywords?.length) items.push({ icon: <Key className="h-3.5 w-3.5 text-emerald-300" />, label: 'SEO keywords', values: data.seoKeywords });
  if (data.keywords?.length) items.push({ icon: <Tag className="h-3.5 w-3.5 text-amber-300" />, label: 'Keywords', values: data.keywords });
  if (data.tags?.length) items.push({ icon: <Tag className="h-3.5 w-3.5 text-emerald-300" />, label: 'Tags', values: data.tags });
  if (data.primaryKeyword) items.push({ icon: <Key className="h-3.5 w-3.5 text-amber-300" />, label: 'Primary keyword', values: [data.primaryKeyword] });
  if (data.secondaryKeywords?.length) items.push({ icon: <Key className="h-3.5 w-3.5 text-emerald-300" />, label: 'Secondary keywords', values: data.secondaryKeywords });

  if (items.length === 0) {
    return <p className="text-sm text-zinc-500">No SEO/hashtag info for this platform.</p>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-zinc-400">
            {it.icon} {it.label}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {it.values.map((v, j) => (
              <span key={j} className="rounded-md bg-white/5 px-2 py-1 text-xs text-zinc-300">{v}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CtaSection({ platform, data }: { platform: Platform; data: any }) {
  const cta = data.cta;
  if (!cta) {
    return (
      <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
        <p className="text-sm text-zinc-500">No explicit CTA generated for {platform}. The post body already includes a closing hook.</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-4">
      <div className="mb-1 text-[11px] uppercase tracking-widest text-amber-300/80">Call to action</div>
      <CopyBlock label="" value={cta} />
    </div>
  );
}

function CopyBlock({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value || '');
      setCopied(true);
      toast.success('Copied to clipboard.');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Copy failed.');
    }
  };
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/40 p-4">
      {label && <div className="mb-1.5 text-[11px] uppercase tracking-widest text-zinc-400">{label}</div>}
      <div className="flex items-start gap-2">
        <pre className={mono ? 'flex-1 whitespace-pre-wrap break-words font-mono text-sm text-zinc-200' : 'flex-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-200'}>
          {value}
        </pre>
        <button
          onClick={onCopy}
          className="shrink-0 rounded-md bg-white/5 p-1.5 text-zinc-300 hover:bg-white/10 hover:text-amber-300"
          aria-label="Copy"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
