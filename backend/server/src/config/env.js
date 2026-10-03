// Load environment variables from .env files.
// Tries (in order):
//   1. process.env (already set by Vercel/host)
//   2. server/.env (used during `npm run dev:server`)
//   3. .env at project root (used during Vercel local build / monorepo)
//   4. .env.local at project root
// Existing process.env values always win — we only fill in the gaps.

import { config as loadDotenv } from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.resolve(__dirname, '..');
const rootDir = path.resolve(serverDir, '..');

const candidates = [
  path.join(serverDir, '.env'),
  path.join(rootDir, '.env'),
  path.join(rootDir, '.env.local'),
];

for (const file of candidates) {
  if (fs.existsSync(file)) {
    try {
      loadDotenv({ path: file });
    } catch {
      /* ignore malformed .env */
    }
  }
}

export {};
