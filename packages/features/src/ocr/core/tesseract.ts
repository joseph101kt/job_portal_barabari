import Tesseract from 'tesseract.js';
import type { OCRResult } from './types';

export async function runOCR(
  imageSource: string, // URI or base64
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  try {
    const result = await Tesseract.recognize(imageSource, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100));
        }
      },
    });

    const raw = result.data.text.trim();
    const lines = raw
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    return {
      raw,
      lines,
      confidence: Math.round(result.data.confidence),
      status: 'done',
    };
  } catch (err) {
    return {
      raw: '',
      lines: [],
      confidence: 0,
      status: 'error',
      error: err instanceof Error ? err.message : 'OCR failed',
    };
  }
}