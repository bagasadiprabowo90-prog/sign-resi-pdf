import { PDFDocument } from 'pdf-lib';

export interface TapPosition {
  percX: number;
  percY: number;
}

export const SIG_W = 120;
export const SIG_H = 55;

export async function signPDF(
  pdfBuffer: Uint8Array,
  signatureDataUri: string,
  pos?: TapPosition,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];

  const sigImage = await pdfDoc.embedPng(signatureDataUri);
  const { width, height } = lastPage.getSize();

  let x: number, y: number;

  if (pos) {
    const tapPdfX = pos.percX * width;
    const tapPdfY = (1 - pos.percY) * height;
    x = tapPdfX - SIG_W / 2;
    y = tapPdfY - SIG_H / 2;
  } else {
    x = width - 160;
    y = 50;
  }

  x = Math.max(0, Math.min(x, width - SIG_W));
  y = Math.max(0, Math.min(y, height - SIG_H));

  lastPage.drawImage(sigImage, { x, y, width: SIG_W, height: SIG_H });

  return await pdfDoc.save({ useObjectStreams: false });
}

export async function handleSavePDF(
  file: File,
  signatureDataUrl: string,
  pos?: TapPosition,
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfBytes = new Uint8Array(arrayBuffer);
  const signedBytes = await signPDF(pdfBytes, signatureDataUrl, pos);

  const blob = new Blob([signedBytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `signed-${file.name}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return signedBytes;
}
