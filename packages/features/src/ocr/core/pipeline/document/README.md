# Document Core

Shared types, state, file picker, and orchestration layer used by both the PDF and DOCX extractors.

## Files

| File | Purpose |
|---|---|
| `types.ts` | `DocumentResult`, `PickedDocument`, `DocumentPage`, `DocumentConfidence` |
| `confidence.ts` | Scores extraction quality. `< 30 avg words/page = 'low'`. |
| `useDocument.ts` | React state hook: `idle → picking → extracting → success/error`. Exposes `progress` string for live status messages. |
| `pickDocument.web.ts` | `<input type="file">` accepting `.pdf` and `.docx`. Returns `ArrayBuffer`. |
| `pickDocument.native.ts` | `expo-document-picker` + `expo-file-system/legacy`. Returns `ArrayBuffer`. |
| `pickDocument.ts` | TypeScript stub for bundler resolution. |
| `extractDocument.ts` | Routes by file type. PDF on web/native both throw — PDF always goes through `PdfEngine` bridge via `useDocumentExtractor`. |
| `useDocumentExtractor.ts` | The hook screens call. Picks a file, detects type, routes to correct extractor or PDF bridge. |

## State machine

```
idle
 └─ pickAndExtract() called
     ├─ picking      (file picker open)
     ├─ extracting   (processing, progress string updates)
     ├─ success      (result available)
     └─ error        (message available — 'cancelled' silently returns to idle)
```

## DocumentResult shape

```ts
{
  text:       string           // full text, ready to send to AI
  pages:      DocumentPage[]   // per-page breakdown
  pageCount:  number
  source:     'pdf' | 'docx'
  confidence: 'high' | 'low'   // low = Gemini Vision fallback recommended
  meta: {
    filename:      string
    fileSizeBytes: number
    extractedAt:   string      // ISO timestamp
  }
}
```

## IMAGE_OCR prefix

Pages extracted from images (scanned PDF pages, embedded DOCX images) have their text prefixed with `IMAGE_OCR:`. The result card in the UI renders these with a distinct purple badge. Strip this prefix before sending to the AI — or keep it as a hint to the model about text provenance.