// packages/features/src/ocr/core/pipeline/ocrEngine.native.tsx

import React from 'react'
import { StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { TESSERACT_HTML } from './tesseract-html'
import type { OcrEvent } from './useOcr'

type Props = {
  webviewRef?: React.RefObject<WebView>
  onEvent?:    (event: OcrEvent) => void
}

export function OcrEngine({ webviewRef, onEvent }: Props) {
  function handleMessage(e: { nativeEvent: { data: string } }) {
    try {
      const payload: OcrEvent = JSON.parse(e.nativeEvent.data)
      onEvent?.(payload)
    } catch (_) {}
  }

  return (
    // position: absolute + opacity 0 keeps the WebView fully initialized
    // but invisible. height/width of 0 prevents WebView from mounting
    // on some Android versions, which silently kills the bridge.
    <View style={styles.hidden}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html: TESSERACT_HTML }}
        onMessage={handleMessage}
        javaScriptEnabled
        mixedContentMode="always"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    pointerEvents: 'none',
  },
})