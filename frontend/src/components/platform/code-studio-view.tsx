'use client';
import { useAppStore } from '../../store/app';
import ImagePanel from './image-panel';
import CodePanel from './code-panel';

export default function CodeStudioView() {
  const setCodePanelOpen = useAppStore((s) => s.setCodePanelOpen);
  if (!useAppStore.getState().codePanelOpen) {
    setTimeout(() => setCodePanelOpen(true), 200);
  }
  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">AI Code Studio</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Describe what you want the code to do and Gemini will produce clean, production-ready code.
          The studio panel is open on the right.
        </p>
      </div>
      <ImagePanel />
      <CodePanel />
    </div>
  );
}
