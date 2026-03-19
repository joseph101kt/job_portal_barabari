import type { OCRResult } from './types';

// ─── PDF ─────────────────────────────────────────────────────────────────────
export async function parsePDF(file: File | string): Promise<OCRResult> {
  try {
    const pdfjsLib = await import('pdfjs-dist');

    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const source =
      typeof file === 'string'
        ? { url: file }
        : { data: await (file as File).arrayBuffer() };

    const pdf = await pdfjsLib.getDocument(source).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
      fullText += pageText + '\n';
    }

    const raw = fullText.trim();
    const lines = raw
      .split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    return { raw, lines, confidence: 100, status: 'done' };
  } catch (err) {
    return {
      raw: '', lines: [], confidence: 0, status: 'error',
      error: err instanceof Error ? err.message : 'PDF parse failed',
    };
  }
}

// ─── DOCX ────────────────────────────────────────────────────────────────────
export async function parseDOCX(file: File): Promise<OCRResult> {
  try {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    const raw = result.value.trim();
    const lines = raw
      .split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    return { raw, lines, confidence: 100, status: 'done' };
  } catch (err) {
    return {
      raw: '', lines: [], confidence: 0, status: 'error',
      error: err instanceof Error ? err.message : 'DOCX parse failed',
    };
  }
}