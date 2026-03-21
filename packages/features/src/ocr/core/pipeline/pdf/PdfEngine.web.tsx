/// <reference lib="dom" />
// packages/features/src/ocr/core/pipeline/pdf/PdfEngine.web.tsx

import React, { useEffect, useRef } from 'react'
import { PDFJS_HTML }      from './pdfjs-html'
import { scoreConfidence } from '../document/confidence'
import type { DocumentPage } from '../document/types'
import type { DocumentEvent } from '../document/useDocument'

const OCR_TIMEOUT_MS = 15_000   // 15s per page
const OCR_RETRIES    = 1        // retry once before skipping

export type PdfEngineProps = {
  webviewRef?: React.RefObject<unknown>
  filename?:   string
  sizeBytes?:  number
  onEvent?:    (event: DocumentEvent) => void
}

// Wraps a promise with a timeout. Rejects with 'timeout' string on expiry.
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    ),
  ])
}

export function PdfEngine({ webviewRef, filename = '', sizeBytes = 0, onEvent }: PdfEngineProps) {
  const iframeRef   = useRef<HTMLIFrameElement | null>(null)
  const callbackRef = useRef({ onEvent, filename, sizeBytes })
  useEffect(() => { callbackRef.current = { onEvent, filename, sizeBytes } })

  useEffect(() => {
    console.log('[PdfEngine.web] mounting')

    if (webviewRef && typeof webviewRef === 'object' && 'current' in webviewRef) {
      ;(webviewRef as React.MutableRefObject<unknown>).current = {
        postMessage: (data: string) => {
          console.log('[PdfEngine.web] → iframe, data length:', data.length)
          if (!iframeRef.current?.contentWindow) {
            console.error('[PdfEngine.web] iframe contentWindow is null')
            return
          }
          iframeRef.current.contentWindow.postMessage(data, '*')
        },
      }
      console.log('[PdfEngine.web] shim attached ✓')
    }

    // Accumulator state — reset per extraction
    let pages:         DocumentPage[] = []
    let totalPages:    number         = 0
    let receivedPages: number         = 0
    let tesseractWorker: any          = null
    let workerReady: Promise<any>|null = null

    async function getWorker() {
      if (tesseractWorker) return tesseractWorker
      if (workerReady)     return workerReady
      console.log('[PdfEngine.web] initializing Tesseract worker')
      const Tesseract = await import('tesseract.js')
      workerReady = Tesseract.createWorker('eng').then(w => {
        tesseractWorker = w
        console.log('[PdfEngine.web] Tesseract worker ready ✓')
        return w
      })
      return workerReady
    }

    function checkDone() {
      if (totalPages <= 0 || receivedPages < totalPages) return

      console.log('[PdfEngine.web] all pages received — firing success')
      const sorted = [...pages].sort((a, b) => a.pageNumber - b.pageNumber)
      const text   = sorted.map(p => p.text).join('\n\n')

      const { onEvent: cb, filename: fn, sizeBytes: sz } = callbackRef.current
      cb?.({
        status: 'success',
        result: {
          text,
          pages:      sorted,
          pageCount:  totalPages,
          source:     'pdf',
          confidence: scoreConfidence(sorted),
          meta: { filename: fn, fileSizeBytes: sz, extractedAt: new Date().toISOString() },
        },
      })

      if (tesseractWorker) { tesseractWorker.terminate(); tesseractWorker = null; workerReady = null }
      pages = []; totalPages = 0; receivedPages = 0
    }

    // Attempt OCR with timeout + one retry
    async function ocrWithRetry(imageData: string, pageNumber: number): Promise<string> {
      for (let attempt = 1; attempt <= OCR_RETRIES + 1; attempt++) {
        try {
          const worker = await getWorker()
          const result = await withTimeout(worker.recognize(imageData), OCR_TIMEOUT_MS)
          return (result as any).data.text.trim()
        } catch (err: any) {
          const reason = err?.message === 'timeout' ? 'timed out' : String(err)
          if (attempt <= OCR_RETRIES) {
            console.warn(`[PdfEngine.web] page ${pageNumber} OCR ${reason} — retrying (${attempt}/${OCR_RETRIES})`)
          } else {
            console.warn(`[PdfEngine.web] page ${pageNumber} OCR ${reason} — skipping`)
          }
        }
      }
      return ''
    }

    async function handleMessage(e: MessageEvent) {
      if (e.source !== iframeRef.current?.contentWindow) return

      let msg: any
      try { msg = JSON.parse(e.data) } catch { return }
      if (!msg) return

      const { onEvent: cb } = callbackRef.current

      switch (msg.status) {
        case 'ready':
          console.log('[PdfEngine.web] iframe ready ✓')
          break

        case 'extracting':
          cb?.({ status: 'extracting', message: msg.message })
          break

        case 'pageText':
          if (msg.totalPages) totalPages = msg.totalPages
          console.log(`[PdfEngine.web] pageText p${msg.pageNumber} words:${msg.wordCount}`)
          pages.push({ pageNumber: msg.pageNumber, text: msg.text, wordCount: msg.wordCount })
          receivedPages++
          checkDone()
          break

        case 'pageNeedsOcr': {
          if (msg.totalPages) totalPages = msg.totalPages
          const pn = msg.pageNumber
          console.log(`[PdfEngine.web] OCR page ${pn}/${msg.totalPages}`)
          cb?.({ status: 'extracting', message: `OCR page ${pn} of ${msg.totalPages}…` })

          const ocrText   = await ocrWithRetry(msg.imageData, pn)
          const finalText = ocrText.length > 0 ? `IMAGE_OCR:${ocrText}` : ''
          console.log(`[PdfEngine.web] page ${pn} done — words: ${finalText.split(/\s+/).filter(Boolean).length}`)
          pages.push({ pageNumber: pn, text: finalText, wordCount: finalText.split(/\s+/).filter(Boolean).length })
          receivedPages++
          checkDone()
          break
        }

        case 'done':
          console.log('[PdfEngine.web] iframe done, totalPages:', msg.totalPages)
          totalPages = msg.totalPages
          checkDone()
          break

        case 'error':
          console.error('[PdfEngine.web] iframe error:', msg.error)
          cb?.({ status: 'error', error: msg.error })
          break
      }
    }

    window.addEventListener('message', handleMessage)
    console.log('[PdfEngine.web] listener attached ✓')

    return () => {
      window.removeEventListener('message', handleMessage)
      if (tesseractWorker) { tesseractWorker.terminate(); tesseractWorker = null }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <iframe
      ref={iframeRef}
      srcDoc={PDFJS_HTML}
      onLoad={() => console.log('[PdfEngine.web] iframe onLoad ✓')}
      style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none', border: 'none' }}
      sandbox="allow-scripts"
      title="pdf-engine"
    />
  )
}