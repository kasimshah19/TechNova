'use client';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../store/app';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar, Flame, Zap, Sparkles, Radar, Code2, Image as ImageIcon, FileText } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import type { TrendItem, Platform } from '../../lib/types';

export default function HistoryView() {
  const { scans, contents, images, codes, historyLoading, loadHistory } = useAppStore();
  const [activeTab, setActiveTab] = useState('scans');

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Scan & Generation History</h1>
        <p className="mt-2 text-sm text-zinc-400">Everything you've scanned and generated, pulled from MongoDB Atlas.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-zinc-900/60">
          <TabsTrigger value="scans">Scans ({scans.length})</TabsTrigger>
          <TabsTrigger value="contents">Content ({contents.length})</TabsTrigger>
          <TabsTrigger value="images">Images ({images.length})</TabsTrigger>
          <TabsTrigger value="codes">Code ({codes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="scans">
          {historyLoading ? (
            <Skeleton className="h-32 w-full bg-zinc-700" />
          ) : scans.length === 0 ? (
            <p className="text-sm text-zinc-500">No scans yet. Go to the dashboard and pick a category.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {scans.map((s) => (
                <Card key={s._id} className="glass-card rounded-2xl">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="rounded-full border-white/10 bg-white/5 text-amber-200">
                        <Radar className="mr-1 h-3 w-3" /> {s.category}
                      </Badge>
                      <span className="text-[11px] text-zinc-500">{formatDate(s.createdAt)}</span>
                    </div>
                    <CardTitle className="text-sm">{s.results.length} trends found</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {s.results.slice(0, 3).map((t: TrendItem) => (
                      <Link
                        key={t.id}
                        to="/topic"
                        state={{ topic: t, category: s.category }}
                        className="block rounded-lg bg-white/5 px-3 py-2 text-xs text-zinc-300 hover:bg-white/10 hover:text-amber-200"
                      >
                        {t.title}
                      </Link>
                    ))}
                    {s.results.length > 3 && (
                      <Button variant="ghost" size="sm" className="h-7 w-full text-xs text-zinc-400 hover:text-amber-200">
                        View all {s.results.length}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="contents">
          {historyLoading ? (
            <Skeleton className="h-32 w-full bg-zinc-700" />
          ) : contents.length === 0 ? (
            <p className="text-sm text-zinc-500">No content generated yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {contents.map((c) => (
                <Card key={c._id} className="glass-card rounded-2xl">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="rounded-full border-white/10 bg-white/5 text-amber-200">
                        <FileText className="mr-1 h-3 w-3" /> {c.platform}
                      </Badge>
                      <span className="text-[11px] text-zinc-500">{formatDate(c.createdAt)}</span>
                    </div>
                    <CardTitle className="text-sm line-clamp-2">{c.topic}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-zinc-400 line-clamp-3">
                      {typeof c.data?.caption === 'string' ? c.data.caption : typeof c.data?.text === 'string' ? c.data.text : c.data?.title || 'Generated content'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="images">
          {historyLoading ? (
            <Skeleton className="h-32 w-full bg-zinc-700" />
          ) : images.length === 0 ? (
            <p className="text-sm text-zinc-500">No images generated yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((im) => (
                <div key={im._id} className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900/40">
                  <img src={im.image} alt={im.alt} className="aspect-square w-full object-cover" />
                  <div className="p-2">
                    <p className="text-[11px] text-zinc-400 line-clamp-1">{im.prompt}</p>
                    <p className="text-[10px] text-zinc-500">{formatDate(im.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="codes">
          {historyLoading ? (
            <Skeleton className="h-32 w-full bg-zinc-700" />
          ) : codes.length === 0 ? (
            <p className="text-sm text-zinc-500">No code generated yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {codes.map((c) => (
                <Card key={c._id} className="glass-card rounded-2xl">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="rounded-full border-white/10 bg-white/5 text-emerald-200">
                        <Code2 className="mr-1 h-3 w-3" /> {c.result?.language || c.language || 'unknown'}
                      </Badge>
                      <span className="text-[11px] text-zinc-500">{formatDate(c.createdAt)}</span>
                    </div>
                    <CardTitle className="text-sm line-clamp-2">{c.prompt}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-zinc-400 line-clamp-3">{c.result?.explanation}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
