export interface OCRResult {
  raw: string;
  lines: string[];
  confidence: number;
  status: 'idle' | 'processing' | 'done' | 'error';
  error?: string;
}