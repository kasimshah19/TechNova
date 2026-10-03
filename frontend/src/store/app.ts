import { create } from 'zustand';
import type { Platform, TrendItem, ScanRecord, ContentRecord, ImageRecord, CodeRecord } from '../lib/types';
import { api } from '../lib/api';

interface AppState {
  // Filters
  scanFilter: 'all' | 'trending' | 'viral' | 'emerging' | 'new';
  setScanFilter: (f: AppState['scanFilter']) => void;

  // Image panel state
  imagePanelOpen: boolean;
  setImagePanelOpen: (open: boolean) => void;
  imagePromptDraft: string;
  setImagePromptDraft: (p: string) => void;

  // Code panel state
  codePanelOpen: boolean;
  setCodePanelOpen: (open: boolean) => void;

  // History (loaded from backend)
  scans: ScanRecord[];
  contents: ContentRecord[];
  images: ImageRecord[];
  codes: CodeRecord[];
  historyLoading: boolean;
  loadHistory: () => Promise<void>;

  // Quick actions
  runScan: (category: string) => Promise<{ ok: boolean; results?: TrendItem[]; error?: string }>;
  generateContent: (topic: string, summary: string, platform: Platform) => Promise<{ ok: boolean; data?: any; postingTime?: any; error?: string }>;
  generateImage: (prompt: string) => Promise<{ ok: boolean; image?: string; alt?: string; error?: string }>;
  generateCode: (prompt: string, language?: string) => Promise<{ ok: boolean; result?: any; error?: string }>;
}

export const useAppStore = create<AppState>((set, get) => ({
  scanFilter: 'all',
  setScanFilter: (f) => set({ scanFilter: f }),

  imagePanelOpen: false,
  setImagePanelOpen: (open) => set({ imagePanelOpen: open }),
  imagePromptDraft: '',
  setImagePromptDraft: (p) => set({ imagePromptDraft: p }),

  codePanelOpen: false,
  setCodePanelOpen: (open) => set({ codePanelOpen: open }),

  scans: [],
  contents: [],
  images: [],
  codes: [],
  historyLoading: false,

  loadHistory: async () => {
    set({ historyLoading: true });
    try {
      const r = await api<{ scans: ScanRecord[]; contents: ContentRecord[]; images: ImageRecord[]; codes: CodeRecord[] }>('/api/history?limit=30');
      set({ scans: r.scans, contents: r.contents, images: r.images, codes: r.codes, historyLoading: false });
    } catch (err) {
      set({ historyLoading: false });
    }
  },

  runScan: async (category) => {
    try {
      const r = await api<{ id: string; results: TrendItem[] }>('/api/gemini/scan', {
        method: 'POST',
        body: JSON.stringify({ category }),
      });
      return { ok: true, results: r.results };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Scan failed.' };
    }
  },

  generateContent: async (topic, summary, platform) => {
    try {
      const r = await api<{ id: string; data: any; postingTime?: any }>('/api/gemini/content', {
        method: 'POST',
        body: JSON.stringify({ topic, summary, platform }),
      });
      return { ok: true, data: r.data, postingTime: r.postingTime };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Content generation failed.' };
    }
  },

  generateImage: async (prompt) => {
    try {
      const r = await api<{ id: string; image: string; alt: string }>('/api/gemini/image', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
      return { ok: true, image: r.image, alt: r.alt };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Image generation failed.' };
    }
  },

  generateCode: async (prompt, language) => {
    try {
      const r = await api<{ id: string; result: any }>('/api/gemini/code', {
        method: 'POST',
        body: JSON.stringify({ prompt, language }),
      });
      return { ok: true, result: r.result };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Code generation failed.' };
    }
  },
}));

export const CATEGORIES = [
  { name: 'AI Related', description: 'AI research, models, and breakthroughs' },
  { name: 'Software', description: 'Programming, dev tools, frameworks' },
  { name: 'Cybersecurity', description: 'Threats, defenses, zero-day news' },
  { name: 'Mobile Technology', description: 'iOS, Android, foldables, 5G/6G' },
  { name: 'Cloud & DevOps', description: 'AWS, GCP, Azure, Kubernetes, CI/CD' },
  { name: 'Blockchain', description: 'Crypto, L2s, smart contracts, DeFi' },
  { name: 'Gaming Technology', description: 'Engines, GPUs, cloud gaming' },
  { name: 'Gaming', description: 'Game releases, esports, industry news' },
  { name: 'Hardware & Chips', description: 'CPUs, GPUs, silicon, devices' },
  { name: 'New AI Models / New AI Tools', description: 'Fresh AI releases, tools, launches' },
];

export const PLATFORMS: Platform[] = ['Facebook', 'Instagram', 'LinkedIn', 'Pinterest', 'Threads', 'Twitter/X', 'Reddit', 'Blog'];
