# PDF Extractor

Extracts text from PDF files on both native and web.

## Files

| File | Purpose |
|---|---|
| `pdfjs-html.ts` | HTML string loaded into the WebView / iframe. Contains pdfjs from CDN + canvas rendering for image pages. Posts page-by-page messages back to the host. |
| `PdfEngine.native.tsx` | Hidden `<WebView>` that hosts `PDFJS_HTML`. Receives postMessage, fires `onEvent`. |
| `PdfEngine.web.tsx` | Hidden `<iframe srcdoc>` that hosts `PDFJS_HTML`. Runs Tesseract in the parent context for image pages since srcdoc iframes have null origin. |
| `PdfEngine.tsx` | TypeScript stub. TS resolves this; bundlers pick `.native` or `.web`. |
| `extractPdf.web.ts` | Stub only — PDF extraction on web goes through the `PdfEngine` iframe bridge, not a direct import. |

## Message protocol (iframe ↔ parent)

```
parent → iframe : { pdfBase64: string }
iframe → parent : { status: 'ready' }
iframe → parent : { status: 'extracting', message: string }
iframe → parent : { status: 'pageText', pageNumber, text, wordCount, totalPages }
iframe → parent : { status: 'pageNeedsOcr', pageNumber, imageData, totalPages }
iframe → parent : { status: 'done', totalPages }
iframe → parent : { status: 'error', error: string }
```

## Timeout behaviour

Each image page OCR attempt has a 15s timeout with 1 retry before skipping. Pages that time out contribute empty strings to the final text — the document still completes successfully.

## Usage

```tsx
const doc = useDocument()
const { pickAndExtract, pdfWebviewRef, pendingDocRef } = useDocumentExtractor({
  onEvent: doc.onDocumentEvent,
})

// Mount the engine unconditionally in the component tree
<PdfEngine
  webviewRef={pdfWebviewRef}
  filename={pendingDocRef.current?.filename}
  sizeBytes={pendingDocRef.current?.sizeBytes}
  onEvent={doc.onDocumentEvent}
/>
```