// Shared TypeScript types for the frontend.

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  role: 'admin' | 'user';
}

export interface TrendItem {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  trending: boolean;
  viral: boolean;
  emerging: boolean;
  whyTrending: string;
  popularityScore: number;
  sources: string[];
  keywords: string[];
  contentPotential: 'High' | 'Medium' | 'Low';
}

export type Platform =
  | 'Facebook'
  | 'Instagram'
  | 'LinkedIn'
  | 'Pinterest'
  | 'Threads'
  | 'Twitter/X'
  | 'Reddit'
  | 'Blog';

export interface GeneratedContent {
  data: Record<string, any>;
}

export interface PostingTimeResult {
  bestTime: string;
  bestDay: string;
  expectedEngagement: 'High' | 'Medium' | 'Low';
  potentialReach: 'High' | 'Medium' | 'Low';
  reason: string;
}

export interface ScanRecord {
  _id: string;
  category: string;
  results: TrendItem[];
  createdAt: string;
}

export interface ContentRecord {
  _id: string;
  topic: string;
  platform: Platform;
  data: Record<string, any>;
  postingTime?: PostingTimeResult;
  createdAt: string;
}

export interface ImageRecord {
  _id: string;
  prompt: string;
  image: string;
  alt: string;
  createdAt: string;
}

export interface CodeRecord {
  _id: string;
  prompt: string;
  language?: string;
  result: { code: string; language: string; explanation: string };
  createdAt: string;
}
