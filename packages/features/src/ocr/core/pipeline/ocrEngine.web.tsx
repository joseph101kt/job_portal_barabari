// packages/features/src/ocr/OcrEngine.web.tsx
//
// Web platform: Tesseract.js runs directly in the browser — no WebView needed.
// This component is a no-op renderer. The actual OCR logic lives in
// useImagePicker.web.ts which calls runTesseractWeb() directly.
//
// We still export OcrEngine so import paths are identical across platforms.
// The bundler (Next.js webpack / Vite) resolves .web.tsx automatically.

export function OcrEngine() {
  return null
}