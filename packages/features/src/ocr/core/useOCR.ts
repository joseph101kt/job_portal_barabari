import { useState, useCallback } from 'react';
import { runOCR } from './tesseract';
import { parsePDF, parseDOCX } from './documentParser';
import type { OCRResult } from './types';

const initial: OCRResult = { raw: '', lines: [], confidence: 0, status: 'idle' };

export type InputSource =
  | { type: 'image'; uri: string }
  | { type: 'pdf'; file: File | string }
  | { type: 'docx'; file: File };

export function useOCR() {
  const [result, setResult] = useState<OCRResult>(initial);
  const [progress, setProgress] = useState(0);

  const process = useCallback(async (source: InputSource) => {
    setResult(r => ({ ...r, status: 'processing' }));
    setProgress(0);

    let res: OCRResult;

    if (source.type === 'image') {
      res = await runOCR(source.uri, setProgress);
    } else if (source.type === 'pdf') {
      res = await parsePDF(source.file);
      setProgress(100);
    } else {
      res = await parseDOCX(source.file);
      setProgress(100);
    }

    setResult(res);
  }, []);

  const reset = useCallback(() => {
    setResult(initial);
    setProgress(0);
  }, []);

  return {
    result, progress, process, reset,
    isProcessing: result.status === 'processing',
    isDone: result.status === 'done',
  };
}