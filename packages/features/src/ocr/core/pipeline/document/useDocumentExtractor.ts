// packages/features/src/ocr/core/pipeline/document/useDocumentExtractor.ts

import { useRef, useCallback } from 'react'
import { Platform } from 'react-native'
import { pickDocumentAsBuffer } from './pickDocument'
import { extractDocxWeb }    from '../docx/extractDocx.web'
import { extractDocxNative } from '../docx/extractDocx.native'
import type { DocumentEvent } from './useDocument'
import type { PickedDocument } from './types'

type Bridge = { postMessage: (data: string) => void }
type Props  = { onEvent: (event: DocumentEvent) => void }

export function useDocumentExtractor({ onEvent }: Props) {
  const pdfWebviewRef = useRef<Bridge | null>(null)
  const pendingDocRef = useRef<PickedDocument | null>(null)

  const onProgress = useCallback((message: string) => {
    console.log('[useDocumentExtractor] progress:', message)
    onEvent({ status: 'extracting', message })
  }, [onEvent])

  const pickAndExtract = useCallback(async () => {
    console.log('[useDocumentExtractor] pickAndExtract called')
    console.log('[useDocumentExtractor] Platform.OS:', Platform.OS)
    console.log('[useDocumentExtractor] pdfWebviewRef.current:', pdfWebviewRef.current ? 'exists ✓' : 'NULL ✗')

    onEvent({ status: 'picking' })

    const doc = await pickDocumentAsBuffer()
    if (!doc) {
      console.log('[useDocumentExtractor] file picker cancelled')
      onEvent({ status: 'error', error: 'cancelled' })
      return
    }

    console.log('[useDocumentExtractor] file picked:', doc.filename, doc.mimeType, doc.sizeBytes, 'bytes')

    const isDocx = doc.filename.toLowerCase().endsWith('.docx') ||
      doc.mimeType.includes('wordprocessingml')
    const isPdf  = doc.filename.toLowerCase().endsWith('.pdf') ||
      doc.mimeType === 'application/pdf'

    console.log('[useDocumentExtractor] isDocx:', isDocx, '| isPdf:', isPdf)

    onEvent({ status: 'extracting', message: 'Starting extraction…' })

    // DOCX: direct extraction on both platforms
    if (isDocx) {
      try {
        console.log('[useDocumentExtractor] extracting DOCX...')
        const result = Platform.OS === 'web'
          ? await extractDocxWeb(doc.buffer, doc.filename, onProgress)
          : await extractDocxNative(doc.buffer, doc.filename)
        console.log('[useDocumentExtractor] DOCX done, words:', result.text.split(/\s+/).length)
        onEvent({ status: 'success', result })
      } catch (err: unknown) {
        console.error('[useDocumentExtractor] DOCX extraction failed:', err)
        onEvent({
          status: 'error',
          error:  err instanceof Error ? err.message : 'DOCX extraction failed',
        })
      }
      return
    }

    // PDF: goes through bridge ref (WebView on native, iframe on web)
    if (isPdf) {
      console.log('[useDocumentExtractor] PDF detected — checking bridge ref...')
      console.log('[useDocumentExtractor] pdfWebviewRef.current:', pdfWebviewRef.current ? 'exists ✓' : 'NULL ✗')

      if (!pdfWebviewRef.current) {
        console.error(
          '[useDocumentExtractor] pdfWebviewRef.current is null.\n' +
          '  Likely causes:\n' +
          '  1. <PdfEngine> is not mounted in the component tree\n' +
          '  2. <PdfEngine> rendered after pickAndExtract was called (timing)\n' +
          '  3. The webviewRef prop was not passed to <PdfEngine>\n' +
          '  4. PdfEngine.web useEffect has not run yet\n' +
          '  Fix: make sure <PdfEngine webviewRef={pdfWebviewRef} .../> is in JSX unconditionally'
        )
        onEvent({ status: 'error', error: 'PDF engine not ready — check console for details' })
        return
      }

      pendingDocRef.current = doc

      // ArrayBuffer → base64 in chunks to avoid call stack overflow
      console.log('[useDocumentExtractor] encoding PDF to base64, buffer size:', doc.buffer.byteLength)
      const bytes  = new Uint8Array(doc.buffer)
      const chunks: string[] = []
      for (let i = 0; i < bytes.length; i += 8192) {
        chunks.push(String.fromCharCode(...bytes.subarray(i, i + 8192)))
      }
      const base64 = btoa(chunks.join(''))
      console.log('[useDocumentExtractor] base64 length:', base64.length, '— posting to bridge...')

      pdfWebviewRef.current.postMessage(JSON.stringify({ pdfBase64: base64 }))
      console.log('[useDocumentExtractor] message posted to PDF bridge ✓')
      return
    }

    console.error('[useDocumentExtractor] unknown file type:', doc.filename, doc.mimeType)
    onEvent({ status: 'error', error: `Unsupported file type: ${doc.filename}` })
  }, [onEvent, onProgress])

  return { pickAndExtract, pdfWebviewRef, pendingDocRef }
}