// packages/features/src/ocr/core/pipeline/ocrEngine.tsx
//
// TypeScript resolution stub.
// Declares the component signature inline — no imports from .web or .native files.
// Metro picks up .native.tsx, webpack picks up .web.tsx at bundle time.
// This file is only ever used by the type checker.

import type React from 'react'
import type { OcrEvent } from './useOcr'

// Widest possible prop type — covers both platforms.
// Native needs webviewRef + onEvent; web renders null so props are optional.
export type OcrEngineProps = {
  webviewRef?: React.RefObject<unknown>
  onEvent?:    (event: OcrEvent) => void
}

export declare function OcrEngine(props: OcrEngineProps): React.ReactElement | null