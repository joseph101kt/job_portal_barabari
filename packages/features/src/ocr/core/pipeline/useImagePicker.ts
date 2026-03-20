// packages/features/src/ocr/core/pipeline/useImagePicker.ts
// TypeScript resolution stub — Metro picks .native.ts, webpack picks .web.ts

import type { OcrEvent } from './useOcr'

export type PickedImage = {
  uri:    string
  base64: string
}

export declare function pickImageAsBase64(): Promise<PickedImage | null>

export declare function runTesseractWeb(
  imageBase64: string,
  onEvent: (e: OcrEvent) => void
): Promise<void>