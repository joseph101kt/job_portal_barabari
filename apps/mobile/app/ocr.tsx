/**
 * apps/mobile/app/ocr.tsx
 */
import React, { useRef, useState, useEffect } from 'react'
import {
  View, Text, Image, ActivityIndicator,
  Platform, ScrollView, Pressable,
} from 'react-native'
import { WebView } from 'react-native-webview'
import { useRouter } from 'expo-router'
import { Button, Card, Badge, PageLayout, Divider, colors } from '@my-app/ui'
import {
  useOcr, OcrEngine, pickImageAsBase64, runTesseractWeb,
  useDocument, useDocumentExtractor, PdfEngine,
} from '@my-app/features'

type Tab = 'image' | 'document'

export default function OcrScreen() {
  const router      = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('image')

  // ── OCR ──────────────────────────────────────────────────────────────────
  const ocr        = useOcr()
  const webviewRef = useRef<WebView>(null)
  const [imageUri, setImageUri] = useState<string | null>(null)

  async function handleRunOCR() {
    ocr.reset()
    setImageUri(null)
    const img = await pickImageAsBase64()
    if (!img) return
    setImageUri(img.uri)
    if (Platform.OS === 'web') {
      await runTesseractWeb(img.base64, ocr.onOcrEvent)
    } else {
      webviewRef.current?.postMessage(JSON.stringify({ imageBase64: img.base64 }))
    }
  }

  // ── Document ──────────────────────────────────────────────────────────────
  const doc = useDocument()
  const { pickAndExtract, pdfWebviewRef, pendingDocRef } = useDocumentExtractor({
    onEvent: doc.onDocumentEvent,
  })

  // Debug: log ref state on every render
  useEffect(() => {
    console.log('[OcrScreen] mounted/updated')
    console.log('[OcrScreen] pdfWebviewRef.current:', pdfWebviewRef.current ? 'exists ✓' : 'null ✗')
  })

  return (
    <PageLayout header={{ title: 'Document Intelligence', subtitle: 'OCR · PDF · DOCX' }}>

      {/*
        CRITICAL: These must be rendered unconditionally (not inside a tab check)
        so they mount immediately and the refs are populated before the user
        presses any button.
      */}
      <OcrEngine webviewRef={webviewRef} onEvent={ocr.onOcrEvent} />
      <PdfEngine
        webviewRef={pdfWebviewRef as React.RefObject<unknown>}
        filename={pendingDocRef.current?.filename}
        sizeBytes={pendingDocRef.current?.sizeBytes}
        onEvent={doc.onDocumentEvent}
      />

      {/* ── Tab switcher ── */}
      <View className="flex-row bg-gray-100 rounded-xl p-1">
        <TabButton
          label="Image OCR"
          active={activeTab === 'image'}
          onPress={() => setActiveTab('image')}
        />
        <TabButton
          label="PDF / DOCX"
          active={activeTab === 'document'}
          onPress={() => setActiveTab('document')}
        />
      </View>

      <Divider />

      {/* ── Image OCR tab ── */}
      {activeTab === 'image' && (
        <View className="gap-4">
          <Text className="text-sm text-gray-500">
            Pick any photo or screenshot — Tesseract will extract the text.
          </Text>

          <Button
            label={ocr.status === 'processing' ? 'Running OCR…' : 'Pick Image & Run OCR'}
            variant="primary"
            onPress={handleRunOCR}
            loading={ocr.status === 'processing'}
            disabled={ocr.status === 'processing'}
            fullWidth
          />

          {ocr.status !== 'idle' && (
            <Button label="Clear" variant="ghost" size="sm" onPress={ocr.reset} />
          )}

          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              className="w-full h-48 rounded-xl bg-gray-100"
              resizeMode="contain"
            />
          )}

          {ocr.status !== 'idle' && (
            <View className="flex-row flex-wrap gap-2">
              <Badge
                label={
                  ocr.status === 'ready'      ? 'Engine ready' :
                  ocr.status === 'processing' ? 'Running OCR…' :
                  ocr.status === 'success'    ? 'Done'          :
                  ocr.status === 'error'      ? 'Failed'        : ocr.status
                }
                variant={
                  ocr.status === 'success'    ? 'success' :
                  ocr.status === 'error'      ? 'error'   :
                  ocr.status === 'processing' ? 'warning' : 'info'
                }
                dot
              />
              {ocr.status === 'success' && ocr.result && (
                <Badge
                  label={`${ocr.result.confidence.toFixed(0)}% confidence`}
                  variant="neutral"
                />
              )}
            </View>
          )}

          {ocr.status === 'processing' && (
            <ProgressRow
              message={
                Platform.OS === 'web'
                  ? 'First run downloads ~4MB language data — 10–20s'
                  : 'Extracting via WebView bridge…'
              }
            />
          )}

          {ocr.status === 'success' && ocr.result && (
            <ResultCard
              text={ocr.result.text}
              meta={`${ocr.result.confidence.toFixed(0)}% confidence`}
            />
          )}

          {ocr.status === 'error' && ocr.error && (
            <ErrorCard message={ocr.error} onRetry={handleRunOCR} />
          )}
        </View>
      )}

      {/* ── Document tab ── */}
      {activeTab === 'document' && (
        <View className="gap-4">
          <Text className="text-sm text-gray-500">
            Upload a PDF or DOCX. Text is extracted directly — images inside
            are automatically OCR'd.
          </Text>

          <Button
            label={
              doc.status === 'picking'    ? 'Picking file…'   :
              doc.status === 'extracting' ? 'Extracting…'     :
              'Pick PDF or DOCX'
            }
            variant="primary"
            onPress={pickAndExtract}
            loading={doc.status === 'picking' || doc.status === 'extracting'}
            disabled={doc.status === 'picking' || doc.status === 'extracting'}
            fullWidth
          />

          {doc.status !== 'idle' && (
            <Button label="Clear" variant="ghost" size="sm" onPress={doc.reset} />
          )}

          {doc.status !== 'idle' && (
            <View className="flex-row flex-wrap gap-2">
              <Badge
                label={
                  doc.status === 'picking'    ? 'Picking…'    :
                  doc.status === 'extracting' ? 'Extracting…' :
                  doc.status === 'success'    ? 'Done'         :
                  doc.status === 'error'      ? 'Failed'       : doc.status
                }
                variant={
                  doc.status === 'success'                                      ? 'success' :
                  doc.status === 'error'                                        ? 'error'   :
                  doc.status === 'picking' || doc.status === 'extracting'       ? 'warning' : 'info'
                }
                dot
              />
              {doc.result && (
                <>
                  <Badge label={doc.result.source.toUpperCase()} variant="info" />
                  <Badge
                    label={`${doc.result.pageCount} page${doc.result.pageCount !== 1 ? 's' : ''}`}
                    variant="neutral"
                  />
                  <Badge
                    label={`${doc.result.text.split(/\s+/).filter(Boolean).length} words`}
                    variant="neutral"
                  />
                </>
              )}
            </View>
          )}

          {(doc.status === 'picking' || doc.status === 'extracting') && (
            <ProgressRow
              message={
                doc.progress ??
                (doc.status === 'picking' ? 'Opening file picker…' : 'Extracting…')
              }
            />
          )}

          {doc.status === 'success' && doc.result && (
            <ResultCard
              text={doc.result.text}
              meta={`${doc.result.source.toUpperCase()} · ${doc.result.pageCount} page${doc.result.pageCount !== 1 ? 's' : ''} · ${doc.result.text.split(/\s+/).filter(Boolean).length} words`}
            />
          )}

          {doc.status === 'error' && doc.error && (
            <ErrorCard message={doc.error} onRetry={pickAndExtract} />
          )}
        </View>
      )}

    </PageLayout>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabButton({
  label, active, onPress,
}: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 py-2 px-3 rounded-lg items-center ${active ? 'bg-white shadow-sm' : ''}`}
    >
      <Text className={`text-sm font-medium ${active ? 'text-gray-900' : 'text-gray-500'}`}>
        {label}
      </Text>
    </Pressable>
  )
}

function ProgressRow({ message }: { message: string }) {
  return (
    <View className="flex-row items-center gap-3 p-3 bg-amber-50 rounded-xl">
      <ActivityIndicator color={colors.warning} />
      <Text className="text-sm text-amber-700 flex-1">{message}</Text>
    </View>
  )
}

// Drop-in replacement for ResultCard in apps/mobile/app/ocr.tsx
// Renders IMAGE_OCR: prefixed paragraphs with a distinct badge.
// Paste this over the existing ResultCard function.


const IMAGE_OCR_PREFIX = 'IMAGE_OCR:'

function ResultCard({ text, meta }: { text: string; meta: string }) {
  // Split full text into paragraphs — pages are joined by \n\n
  const paragraphs = text.split('\n\n').filter(Boolean)

  return (
    <Card elevation="flat">
      <Text className="text-xs uppercase tracking-widest text-gray-400 mb-2">{meta}</Text>
      <ScrollView className="max-h-72">
        <View className="gap-3">
          {paragraphs.map((para, idx) => {
            const isImageOcr = para.startsWith(IMAGE_OCR_PREFIX)
            const content    = isImageOcr ? para.slice(IMAGE_OCR_PREFIX.length).trim() : para

            return (
              <View key={idx}>
                {isImageOcr && (
                  <View className="flex-row mb-1">
                    <View className="bg-purple-100 px-2 py-0.5 rounded">
                      <Text className="text-xs text-purple-700 font-medium">
                        Image OCR
                      </Text>
                    </View>
                  </View>
                )}
                <Text className={`text-sm leading-relaxed ${
                  isImageOcr ? 'text-purple-900 bg-purple-50 p-2 rounded-lg' : 'text-gray-800'
                }`}>
                  {content}
                </Text>
              </View>
            )
          })}
        </View>
      </ScrollView>
    </Card>
  )
}


function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card elevation="flat">
      <Text className="text-sm text-red-500 mb-3">{message}</Text>
      <Button label="Try again" variant="outline" size="sm" onPress={onRetry} />
    </Card>
  )
}