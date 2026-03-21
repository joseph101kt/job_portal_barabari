/// <reference lib="dom" />
// packages/features/src/ocr/core/pipeline/pdf/PdfEngine.web.tsx
//
// On web, pdfjs runs inside a hidden <iframe> via srcdoc — same bridge
// pattern as the native WebView. pdfjs is loaded from CDN inside the
// iframe so Metro never tries to bundle it (which is where import.meta dies).

import React, { useEffect, useRef } from 'react'
import { PDFJS_HTML } from './pdfjs-html'
import type { DocumentEvent } from '../document/useDocument'
import { scoreConfidence } from '../document/confidence'
import type { DocumentPage } from '../document/types'

export type PdfEngineProps = {
  webviewRef?: React.RefObject<unknown>  // unused on web — iframe is internal
  filename?:   string
  sizeBytes?:  number
  onEvent?:    (event: DocumentEvent) => void
}

// We expose a global postMessage function so useDocumentExtractor can
// trigger extraction the same way as native (webviewRef.current.postMessage).
// On web we attach a .postMessage method to the ref object instead.
export function PdfEngine({ webviewRef, filename = '', sizeBytes = 0, onEvent }: PdfEngineProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => {
    // Attach postMessage to the passed ref so useDocumentExtractor works
    // without knowing it's talking to an iframe instead of a WebView
    if (webviewRef && typeof webviewRef === 'object' && 'current' in webviewRef) {
      (webviewRef as React.MutableRefObject<unknown>).current = {
        postMessage: (data: string) => {
          iframeRef.current?.contentWindow?.postMessage(data, '*')
        },
      }
    }

    function handleMessage(e: MessageEvent) {
      if (e.source !== iframeRef.current?.contentWindow) return

      let msg: any
      try { msg = JSON.parse(e.data) } catch { return }

      if (!msg || msg.status === 'ready') return

      if (msg.status === 'extracting') {
        onEvent?.({ status: 'extracting', message: msg.message })
        return
      }

      if (msg.status === 'success') {
        const pages: DocumentPage[] = msg.pages
        const text = pages.map((p: DocumentPage) => p.text).join('\n\n')
        onEvent?.({
          status: 'success',
          result: {
            text,
            pages,
            pageCount:  msg.pageCount,
            source:     'pdf',
            confidence: scoreConfidence(pages),
            meta: { filename, fileSizeBytes: sizeBytes, extractedAt: new Date().toISOString() },
          },
        })
        return
      }

      if (msg.status === 'error') {
        onEvent?.({ status: 'error', error: msg.error })
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [webviewRef, filename, sizeBytes, onEvent])

  return (
    <iframe
      ref={iframeRef}
      srcDoc={PDFJS_HTML}
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: 'none',
        border: 'none',
      }}
      sandbox="allow-scripts"
      title="pdf-engine"
    />
  )
}