'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { TapPosition, SIG_W, SIG_H } from '@/lib/signPdf';

interface PDFViewerProps {
  file: File;
  onPositionPick: (pos: TapPosition) => void;
}

export default function PDFViewer({ file, onPositionPick }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ghostPos, setGhostPos] = useState<{ left: string; top: string } | null>(null);
  const [pageSize, setPageSize] = useState<{ w: number; h: number } | null>(null);
  const [tapped, setTapped] = useState(false);

  const renderPage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString();

      const data = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data }).promise;
      const page = await pdf.getPage(pdf.numPages);

      const containerW = wrapRef.current?.clientWidth || 360;
      const base = page.getViewport({ scale: 1 });
      const scale = containerW / base.width;
      const viewport = page.getViewport({ scale });
      setPageSize({ w: base.width, h: base.height });

      const cvs = canvasRef.current!;
      cvs.width = viewport.width;
      cvs.height = viewport.height;

      await page.render({ canvasContext: cvs.getContext('2d')!, viewport }).promise;
    } catch (e) {
      setError('Gagal memuat PDF: ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [file]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  const handleTap = (e: React.PointerEvent<HTMLDivElement>) => {
    if (loading || error) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pixelX = e.clientX - rect.left;
    const pixelY = e.clientY - rect.top;
    const percX = pixelX / rect.width;
    const percY = pixelY / rect.height;

    setGhostPos({ left: `${percX * 100}%`, top: `${percY * 100}%` });
    setTapped(true);
    onPositionPick({ percX, percY });
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="text-center">
        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Tap di posisi tempat tanda tangan
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div
        ref={wrapRef}
        onPointerDown={handleTap}
        className="relative w-full border-2 border-[hsl(var(--border))] rounded-2xl overflow-hidden bg-white shadow-md cursor-crosshair"
        style={{ touchAction: 'none', minHeight: loading ? 260 : undefined }}
      >
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white">
            <div className="w-9 h-9 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[hsl(var(--muted-foreground))]">Memuat halaman terakhir…</span>
          </div>
        )}

        <canvas ref={canvasRef} className="block w-full h-auto" />

        {ghostPos && pageSize && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: ghostPos.left,
              top: ghostPos.top,
              transform: 'translate(-50%, -50%)',
              width: `${(SIG_W / pageSize.w) * 100}%`,
              height: `${(SIG_H / pageSize.h) * 100}%`,
            }}
          >
            <div className="w-full h-full border-2 border-dashed border-[hsl(var(--primary))] bg-[hsl(var(--accent))] bg-opacity-40 rounded-lg flex items-center justify-center">
              <span className="text-xs font-semibold text-[hsl(var(--accent-foreground))]">TTD</span>
            </div>
          </div>
        )}
      </div>

      {tapped && !loading && (
        <div className="flex items-center gap-2 bg-[hsl(var(--accent))] rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-[hsl(var(--accent-foreground))] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm font-medium text-[hsl(var(--accent-foreground))]">
            Posisi ditandai. Lanjut ke tanda tangan ↓
          </p>
        </div>
      )}
    </div>
  );
}
