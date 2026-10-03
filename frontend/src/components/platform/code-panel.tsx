'use client';
import { useState } from 'react';
import { useAppStore } from '../../store/app';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Skeleton } from '../ui/skeleton';
import { toast } from 'sonner';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  X,
  Sparkles,
  Code2,
  Wand2,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';

const LANGUAGES = ['', 'javascript', 'typescript', 'python', 'go', 'rust', 'java', 'csharp', 'cpp', 'sql', 'html', 'css', 'bash'];

export default function CodePanel() {
  const codePanelOpen = useAppStore((s) => s.codePanelOpen);
  const setCodePanelOpen = useAppStore((s) => s.setCodePanelOpen);
  const generateCode = useAppStore((s) => s.generateCode);

  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ code: string; language: string; explanation: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    const r = await generateCode(prompt, language);
    setLoading(false);
    if (r.ok && r.result) {
      setResult(r.result);
      toast.success('Code generated.');
    } else {
      setError(r.error || 'Code generation failed.');
      toast.error(r.error || 'Code generation failed.');
    }
  };

  const onCopy = async () => {
    if (!result?.code) return;
    try {
      await navigator.clipboard.writeText(result.code);
      setCopied(true);
      toast.success('Code copied.');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Copy failed.');
    }
  };

  return (
    <>
      <button
        onClick={() => setCodePanelOpen(true)}
        className="fixed bottom-24 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 px-4 py-3 text-sm font-semibold text-zinc-950 shadow-[0_8px_30px_-5px_rgba(16,185,129,0.5)] transition hover:scale-105"
        aria-label="Open AI Code Studio"
      >
        <Wand2 className="h-4 w-4" />
        <span className="hidden sm:inline">Code Studio</span>
      </button>

      {codePanelOpen && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCodePanelOpen(false)} />
          <aside className="relative flex h-full w-full max-w-md flex-col border-l border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-2xl">
            <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl premium-grad text-zinc-950">
                  <Code2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">AI Code Studio</h3>
                  <p className="text-[11px] text-zinc-500">Powered by Gemini</p>
                </div>
              </div>
              <button
                onClick={() => setCodePanelOpen(false)}
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
                  placeholder="Describe what you want the code to do..."
                  rows={4}
                  className="resize-none bg-zinc-900/60 border-white/10 focus-visible:border-amber-400/50"
                />

                <label className="text-[11px] uppercase tracking-widest text-zinc-500">Language (optional)</label>
                <Select value={language || 'auto'} onValueChange={(v) => setLanguage(v === 'auto' ? '' : v)}>
                  <SelectTrigger className="bg-zinc-900/60 border-white/10">
                    <SelectValue placeholder="Auto" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 max-h-72">
                    <SelectItem value="auto">Auto-detect</SelectItem>
                    {LANGUAGES.slice(1).map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full h-10 rounded-xl premium-grad text-zinc-950 font-semibold hover:opacity-90"
                >
                  {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {loading ? 'Generating...' : 'Generate'}
                </Button>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-rose-200">
                  {error}
                </div>
              )}

              {loading && (
                <div className="mt-6 space-y-2">
                  <Skeleton className="h-4 w-1/3 bg-zinc-700" />
                  <Skeleton className="h-40 w-full bg-zinc-700" />
                </div>
              )}

              {result && !loading && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-emerald-500/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-emerald-200">
                      {result.language || 'unknown'}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button onClick={handleGenerate} variant="outline" size="sm" className="h-8 rounded-lg border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10">
                        <RefreshCw className="mr-1.5 h-3 w-3" /> Improve
                      </Button>
                      <button
                        onClick={onCopy}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-amber-300"
                        aria-label="Copy"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-white/10">
                    <SyntaxHighlighter
                      language={result.language || 'text'}
                      style={oneDark}
                      customStyle={{ margin: 0, padding: '1rem', fontSize: '12px', background: 'rgb(24 24 27)' }}
                    >
                      {result.code}
                    </SyntaxHighlighter>
                  </div>

                  {result.explanation && (
                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-3">
                      <div className="mb-1 text-[11px] uppercase tracking-widest text-zinc-500">Explanation</div>
                      <p className="text-sm leading-relaxed text-zinc-300">{result.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
