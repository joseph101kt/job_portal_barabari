# DOCX Extractor

Extracts text and embedded images from `.docx` files using mammoth.js.

## Files

| File | Purpose |
|---|---|
| `extractDocx.web.ts` | Web implementation. Uses `mammoth.extractRawText` for body text and `mammoth.convertToHtml` to find embedded images. Images are OCR'd with Tesseract. |
| `extractDocx.native.ts` | Native implementation. Uses `mammoth.extractRawText` only (no image OCR on native — mammoth is pure JS so no bridge needed). |

## Why mammoth works without a bridge

mammoth.js is pure JavaScript with no native dependencies and no `import.meta`. Metro can bundle it directly, unlike pdfjs. No WebView or iframe needed.

## Embedded image OCR

On web, `convertToHtml` embeds images as `data:image/...;base64,...` URIs in the HTML output. These are parsed with `DOMParser`, filtered to confirmed data URIs, then each is passed through Tesseract. Extracted image text is prefixed `IMAGE_OCR:` so the UI can render it distinctly.

## Import rule

Both files import directly from `../document/types` and `../document/confidence` — **not** from `../document` barrel index. Importing from the barrel would create a require cycle:

```
extractDocx.native → document/index → useDocumentExtractor → extractDocx.native
```