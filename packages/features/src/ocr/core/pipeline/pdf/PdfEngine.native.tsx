// packages/features/src/ocr/core/pipeline/pdf/PdfEngine.native.tsx

import React from 'react'
import { StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { PDFJS_HTML }      from './pdfjs-html'
import { scoreConfidence } from '../document/confidence'
import type { DocumentPage } from '../document/types'
import type { DocumentEvent } from '../document/useDocument'

type WebViewMsg =
  | { status: 'ready' }
  | { status: 'extracting' }
  | { status: 'success'; pages: DocumentPage[]; pageCount: number }
  | { status: 'error';   error: string }

export type PdfEngineProps = {
  webviewRef?: React.RefObject<WebView>
  filename?:   string
  sizeBytes?:  number
  onEvent?:    (event: DocumentEvent) => void
}

export function PdfEngine({ webviewRef, filename = '', sizeBytes = 0, onEvent }: PdfEngineProps) {
  // React Compiler rule: no conditional/logical expressions inside try/catch.
  // Solution: parse outside the try, handle result after.
  function handleMessage(e: { nativeEvent: { data: string } }) {
    let msg: WebViewMsg | null = null

    // Parse-only try — no conditionals inside
    try {
      msg = JSON.parse(e.nativeEvent.data) as WebViewMsg
    } catch {
      return
    }

    // All branching happens outside the try block
    if (!msg) return

    if (msg.status === 'ready') {
      // 'ready' is internal to the WebView — not a DocumentEvent, just ignore
      return
    }

    if (msg.status === 'extracting') {
      onEvent?.({ status: 'extracting' })
      return
    }

    if (msg.status === 'success') {
      const pages    = msg.pages
      const text     = pages.map(p => p.text).join('\n\n')
      const result   = {
        text,
        pages,
        pageCount:  msg.pageCount,
        source:     'pdf' as const,
        confidence: scoreConfidence(pages),
        meta: {
          filename,
          fileSizeBytes: sizeBytes,
          extractedAt:   new Date().toISOString(),
        },
      }
      onEvent?.({ status: 'success', result })
      return
    }

    if (msg.status === 'error') {
      onEvent?.({ status: 'error', error: msg.error })
    }
  }

  return (
    <View style={styles.hidden}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html: PDFJS_HTML }}
        onMessage={handleMessage}
        javaScriptEnabled
        mixedContentMode="always"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  hidden: {
    position:      'absolute',
    width:         1,
    height:        1,
    opacity:       0,
    pointerEvents: 'none',
  },
})