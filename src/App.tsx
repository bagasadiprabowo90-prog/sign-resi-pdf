import { useState, useCallback } from 'react';
import { handleSavePDF, type TapPosition } from '@/lib/signPdf';
import PDFViewer from '@/components/PDFViewer';
import SignaturePad from '@/components/SignaturePad';

type Step = 'upload' | 'preview' | 'sign' | 'done';

const STEPS = ['Upload', 'Preview', 'Tanda Tangan', 'Selesai'];
const STEP_INDEX: Record<Step, number> = { upload: 0, preview: 1, sign: 2, done: 3 };

function StepIndicator({ current }: { current: Step }) {
  const idx = STEP_INDEX[current];
  return (
    <div className="flex items-center justify-between w-full max-w-sm mx-auto mb-6">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
              style={{
                background: i < idx
                  ? 'hsl(var(--success))'
                  : i === idx
                  ? 'hsl(var(--primary))'
                  : 'hsl(var(--muted))',
                color: i <= idx ? 'white' : 'hsl(var(--muted-foreground))',
              }}
            >
              {i < idx ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className="text-[10px] mt-1 font-medium whitespace-nowrap"
              style={{ color: i === idx ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className="h-0.5 flex-1 mx-1 mb-4 transition-all duration-300"
              style={{ background: i < idx ? 'hsl(var(--success))' : 'hsl(var(--border))' }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pos, setPos] = useState<TapPosition | null>(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (f: File) => {
    if (f.type === 'application/pdf') {
      setFile(f);
      setStep('preview');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileSelect(f);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileSelect(f);
  };

  const handlePositionPick = useCallback((p: TapPosition) => {
    setPos(p);
  }, []);

  const handleNext = () => {
    if (pos) setStep('sign');
  };

  const handleSignatureSave = useCallback(
    async (signatureDataUrl: string) => {
      if (!file || !pos) return;
      setStatusMsg('Memproses PDF…');
      try {
        await handleSavePDF(file, signatureDataUrl, pos);
        setStatusMsg('');
        setStep('done');
      } catch (err) {
        setStatusMsg('❌ Gagal: ' + (err as Error).message);
      }
    },
    [file, pos],
  );

  const handleReset = () => {
    setFile(null);
    setPos(null);
    setStep('upload');
    setStatusMsg('');
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'hsl(var(--background))' }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: 'hsl(var(--primary))',
          borderColor: 'transparent',
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">Sign Resi</h1>
            <p className="text-xs text-white/70">Tanda Tangan Surat Jalan</p>
          </div>
          {file && step !== 'upload' && (
            <div className="ml-auto max-w-[120px]">
              <p className="text-xs text-white/80 truncate">{file.name}</p>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col px-4 py-5 max-w-md mx-auto w-full">
        <StepIndicator current={step} />

        {/* ── STEP 1: Upload ──────────────────────────────────────── */}
        {step === 'upload' && (
          <div className="flex flex-col gap-4">
            <div className="text-center mb-2">
              <h2 className="text-lg font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                Pilih PDF Surat Jalan
              </h2>
              <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Dari folder HP atau WhatsApp
              </p>
            </div>

            <label
              className="flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 py-12 gap-4"
              style={{
                borderColor: dragOver ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                background: dragOver ? 'hsl(var(--accent))' : 'hsl(var(--card))',
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'hsl(var(--accent))' }}
              >
                <svg className="w-8 h-8" style={{ color: 'hsl(var(--primary))' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-base font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                  Ketuk untuk pilih PDF
                </p>
                <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  atau seret file ke sini
                </p>
              </div>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Info box */}
            <div
              className="rounded-2xl p-4 flex gap-3"
              style={{ background: 'hsl(var(--accent))' }}
            >
              <svg className="w-5 h-5 mt-0.5 shrink-0" style={{ color: 'hsl(var(--accent-foreground))' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--accent-foreground))' }}>
                Aplikasi ini bekerja <strong>offline</strong>. PDF ditandatangani langsung di HP, tidak perlu koneksi internet.
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 2: Preview & Pick Position ─────────────────────── */}
        {step === 'preview' && file && (
          <div className="flex flex-col gap-4">
            <PDFViewer file={file} onPositionPick={handlePositionPick} />

            <div className="flex gap-3">
              <button
                onClick={() => { setFile(null); setPos(null); setStep('upload'); }}
                className="flex-1 py-3.5 text-sm font-medium rounded-2xl transition-all active:scale-[0.98]"
                style={{
                  background: 'hsl(var(--secondary))',
                  color: 'hsl(var(--secondary-foreground))',
                }}
              >
                ← Ganti PDF
              </button>
              <button
                onClick={handleNext}
                disabled={!pos}
                className="flex-[2] py-3.5 text-sm font-semibold rounded-2xl transition-all active:scale-[0.98] disabled:opacity-40 shadow-md"
                style={{
                  background: pos ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                  color: pos ? 'white' : 'hsl(var(--muted-foreground))',
                }}
              >
                {pos ? 'Lanjut Tanda Tangan →' : 'Tap posisi dulu'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Tanda Tangan ─────────────────────────────────── */}
        {step === 'sign' && (
          <div className="flex flex-col gap-4">
            <SignaturePad onSave={handleSignatureSave} />

            <button
              onClick={() => setStep('preview')}
              className="py-2 text-sm font-medium transition-all"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              ← Ubah Posisi TTD
            </button>

            {statusMsg && (
              <div
                className="rounded-2xl p-4 text-center"
                style={{ background: 'hsl(var(--accent))' }}
              >
                <p className="text-sm" style={{ color: 'hsl(var(--accent-foreground))' }}>
                  {statusMsg}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 4: Selesai ──────────────────────────────────────── */}
        {step === 'done' && (
          <div className="flex flex-col items-center gap-6 py-4 text-center">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg"
              style={{ background: 'hsl(var(--success))' }}
            >
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                Berhasil!
              </h2>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
                PDF sudah ditandatangani dan otomatis terunduh ke HP kamu.
              </p>
            </div>

            <div
              className="w-full rounded-2xl p-4 flex gap-3 items-start text-left"
              style={{ background: 'hsl(var(--accent))' }}
            >
              <svg className="w-5 h-5 mt-0.5 shrink-0" style={{ color: 'hsl(var(--accent-foreground))' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--accent-foreground))' }}>
                File <strong>signed-{file?.name}</strong> sudah tersimpan di folder unduhan HP kamu.
              </p>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-4 text-base font-semibold rounded-2xl shadow-md transition-all active:scale-[0.98]"
              style={{ background: 'hsl(var(--primary))', color: 'white' }}
            >
              Proses Surat Jalan Berikutnya
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
          v2.0 · BLP Sign Resi · Offline PWA
        </p>
      </footer>
    </div>
  );
}
