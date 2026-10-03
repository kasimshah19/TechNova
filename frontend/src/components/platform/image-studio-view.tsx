'use client';
import { useAppStore } from '../../store/app';
import ImagePanel from './image-panel';
import CodePanel from './code-panel';

export default function ImageStudioView() {
  const setImagePanelOpen = useAppStore((s) => s.setImagePanelOpen);
  // Open the floating panel on mount
  if (!useAppStore.getState().imagePanelOpen) {
    setTimeout(() => setImagePanelOpen(true), 200);
  }
  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">AI Image Studio</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Generate striking, premium-editorial images from a prompt using the Gemini image model.
          The studio panel is open on the right.
        </p>
      </div>
      <ImagePanel />
      <CodePanel />
    </div>
  );
}
