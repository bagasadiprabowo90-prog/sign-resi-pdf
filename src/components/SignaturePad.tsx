import { useRef, useState, useEffect, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => Promise<void>;
}

export default function SignaturePad({ onSave }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isSigning) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isSigning]);

  const handleClear = useCallback(() => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (sigCanvas.current?.isEmpty()) {
      return;
    }
    setIsProcessing(true);
    try {
      const dataUrl = sigCanvas.current!.toDataURL('image/png');
      await onSave(dataUrl);
    } finally {
      setIsProcessing(false);
    }
  }, [onSave]);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="text-center">
        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Tanda tangan di kotak bawah ini
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative w-full border-2 border-dashed border-[hsl(var(--border))] rounded-2xl bg-white shadow-sm overflow-hidden"
        style={{ aspectRatio: '3 / 1.4', touchAction: 'none' }}
      >
        <SignatureCanvas
          ref={sigCanvas}
          penColor="#1e293b"
          minWidth={1.5}
          maxWidth={4}
          velocityFilterWeight={0.7}
          canvasProps={{
            className: 'w-full h-full absolute inset-0',
            style: { touchAction: 'none' },
          }}
          onBegin={() => {
            setIsSigning(true);
            setIsEmpty(false);
          }}
          onEnd={() => setIsSigning(false)}
        />

        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm text-[hsl(var(--muted-foreground))] opacity-60 select-none">
              ✏️ Gores tanda tangan di sini
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isEmpty || isProcessing}
          className="w-full py-4 text-base font-semibold text-white rounded-2xl shadow-md transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: isEmpty || isProcessing
              ? 'hsl(var(--muted))'
              : 'hsl(var(--primary))',
            color: isEmpty || isProcessing ? 'hsl(var(--muted-foreground))' : 'white',
          }}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Memproses PDF…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Simpan & Unduh PDF
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={handleClear}
          disabled={isProcessing || isEmpty}
          className="w-full py-3 text-sm font-medium rounded-2xl transition-all active:scale-[0.98] disabled:opacity-40"
          style={{
            background: 'hsl(var(--secondary))',
            color: 'hsl(var(--secondary-foreground))',
          }}
        >
          Hapus / Ulangi
        </button>
      </div>
    </div>
  );
}
