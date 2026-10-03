'use client';
import { useState } from 'react';
import { useAppStore } from '../../store/app';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Skeleton } from '../ui/skeleton';
import { toast } from 'sonner';
import {
  X,
  Sparkles,
  Download,
  RefreshCw,
  Dice5,
  Wand2,
  Image as ImageIcon,
  History as HistoryIcon,
  Copy,
} from 'lucide-react';

export default function ImagePanel() {
  const imagePanelOpen = useAppStore((s) => s.imagePanelOpen);
  const setImagePanelOpen = useAppStore((s) => s.setImagePanelOpen);
  const promptDraft = useAppStore((s) => s.imagePromptDraft);
  const setImagePromptDraft = useAppStore((s) => s.setImagePromptDraft);
  const generateImage = useAppStore((s) => s.generateImage);

  const [prompt, setPrompt] = useState(promptDraft || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<{ image: string; alt: string } | null>(null);
  const [seed, setSeed] = useState(0);
  const [history, setHistory] = useState<{ id: string; prompt: string; image: string; alt: string }[]>([]);

  // Sync promptDraft into local prompt when the panel opens (if local prompt is empty)
  if (promptDraft && !prompt && !current) {
    setPrompt(promptDraft);
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first.');
      return;
    }
    setLoading(true);
    setError(null);
    const decorated = `${prompt.trim()}${seed > 0 ? ` (variation ${seed})` : ''}. High detail, sharp focus, premium editorial aesthetic, no text overlay.`;
    const r = await generateImage(decorated);
    setLoading(false);
    if (r.ok && r.image) {
      setCurrent({ image: r.image, alt: r.alt || 'Generated image' });
      setHistory((h) => [{ id: `img-${Date.now()}`, prompt: prompt.trim(), image: r.image!, alt: r.alt! }, ...h].slice(0, 6));
      toast.success('Image generated.');
    } else {
      setError(r.error || 'Image generation failed.');
      toast.error(r.error || 'Image generation failed.');
    }
  };

  const handleVariation = () => {
    setSeed((s) => s + 1);
    handleGenerate();
  };

  return (
    <>
      <button
        onClick={() => setImagePanelOpen(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 px-4 py-3 text-sm font-semibold text-zinc-950 shadow-[0_8px_30px_-5px_rgba(245,158,11,0.5)] transition hover:scale-105"
        aria-label="Open AI Image Studio"
      >
        <Wand2 className="h-4 w-4" />
        <span className="hidden sm:inline">Image Studio</span>
      </button>

      {imagePanelOpen && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setImagePanelOpen(false)} />
          <aside className="relative flex h-full w-full max-w-md flex-col border-l border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-2xl">
            <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl premium-grad text-zinc-950">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">AI Image Studio</h3>
                  <p className="text-[11px] text-zinc-500">Powered by Gemini image model</p>
                </div>
              </div>
              <button
                onClick={() => setImagePanelOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-amber-300"
                aria-label="Close panel"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto nice-scroll px-5 py-5">
              <div className="space-y-3">
                <label className="text-[11px] uppercase tracking-widest text-zinc-500">Prompt</label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  rows={4}
                  className="resize-none bg-zinc-900/60 border-white/10 focus-visible:border-amber-400/50"
                />
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="flex-1 h-10 rounded-xl premium-grad text-zinc-950 font-semibold hover:opacity-90"
                  >
                    {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    {loading ? 'Generating...' : 'Generate'}
                  </Button>
                  <Button
                    onClick={handleVariation}
                    disabled={loading}
                    variant="outline"
                    className="h-10 rounded-xl border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10"
                    title="Roll a new seed and regenerate"
                  >
                    <Dice5 className="h-4 w-4" />
                  </Button>
                </div>
                {seed > 0 && (
                  <p className="text-[11px] text-zinc-500">Variation seed: {seed}. Click dice again for more variations.</p>
                )}
              </div>

              <div className="mt-6 space-y-3">
                <div className="text-[11px] uppercase tracking-widest text-zinc-500">Preview</div>
                <div className="aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40">
                  {loading ? (
                    <div className="grid h-full place-items-center">
                      <Skeleton className="h-full w-full bg-zinc-700" />
                    </div>
                  ) : current ? (
                    <img src={current.image} alt={current.alt} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-center">
                      <div className="px-6">
                        <ImageIcon className="mx-auto h-10 w-10 text-zinc-700" />
                        <p className="mt-2 text-sm text-zinc-500">Your generated image will appear here.</p>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-rose-200">
                    {error}
                  </div>
                )}

                {current && !loading && (
                  <div className="flex items-center gap-2">
                    <a
                      href={current.image}
                      download={`technova-image-${Date.now()}.png`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-200 ring-1 ring-emerald-400/30 hover:bg-emerald-500/20"
                    >
                      <Download className="h-4 w-4" /> Download PNG
                    </a>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(current.image);
                          toast.success('Image data URL copied.');
                        } catch {
                          toast.error('Copy failed.');
                        }
                      }}
                      className="rounded-xl bg-white/5 p-2 text-zinc-300 hover:bg-white/10 hover:text-amber-300"
                      title="Copy data URL"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-zinc-500">
                  <HistoryIcon className="h-3 w-3" /> Recent generations
                </div>
                {history.length === 0 ? (
                  <p className="text-sm text-zinc-600">No history yet. Generate an image to start building it.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {history.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => { setCurrent({ image: h.image, alt: h.alt }); setPrompt(h.prompt); }}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-zinc-900/40"
                        title={h.prompt}
                      >
                        <img src={h.image} alt={h.alt} className="h-full w-full object-cover transition group-hover:scale-110" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
