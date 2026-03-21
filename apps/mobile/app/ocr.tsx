/**
 * apps/mobile/app/ocr.tsx
 */
import React, { useRef, useState } from 'react'
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
  useAnalyzeDocument,
} from '@my-app/features'
import type { AnalysisType } from '@my-app/features'

type Tab = 'image' | 'document'

const ANALYSIS_TYPES: { label: string; value: AnalysisType }[] = [
  { label: 'Medical Report', value: 'medical_report' },
  { label: 'Resume',         value: 'resume'         },
  { label: 'Summarize',      value: 'summarize'      },
]

export default function OcrScreen() {
  const router      = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('image')
  const [analysisType, setAnalysisType] = useState<AnalysisType>('summarize')

  // ── OCR ──────────────────────────────────────────────────────────────────
  const ocr        = useOcr()
  const webviewRef = useRef<WebView>(null)
  const [imageUri, setImageUri] = useState<string | null>(null)

  async function handleRunOCR() {
    ocr.reset()
    ai.reset()
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
    onEvent: (event) => {
      ai.reset()
      doc.onDocumentEvent(event)
    },
  })

  // ── AI ────────────────────────────────────────────────────────────────────
  const ai = useAnalyzeDocument()

  // The text to analyze — comes from whichever tab is active
  const extractedText = activeTab === 'image'
    ? ocr.result?.text ?? null
    : doc.result?.text ?? null

  async function handleAnalyze() {
    if (!extractedText) return
    await ai.analyzeDocument({ type: analysisType, text: extractedText })
  }

  return (
    <PageLayout header={{ title: 'Document Intelligence', subtitle: 'OCR · PDF · DOCX · AI' }}>

      {/* Hidden engines — must be outside tab checks so refs are always mounted */}
      <OcrEngine webviewRef={webviewRef} onEvent={ocr.onOcrEvent} />
      <PdfEngine
        webviewRef={pdfWebviewRef as React.RefObject<unknown>}
        filename={pendingDocRef.current?.filename}
        sizeBytes={pendingDocRef.current?.sizeBytes}
        onEvent={doc.onDocumentEvent}
      />

      {/* ── Tab switcher ── */}
      <View className="flex-row bg-gray-100 rounded-xl p-1">
        <TabButton label="Image OCR"  active={activeTab === 'image'}    onPress={() => { setActiveTab('image');    ocr.reset(); ai.reset() }} />
        <TabButton label="PDF / DOCX" active={activeTab === 'document'} onPress={() => { setActiveTab('document'); doc.reset(); ai.reset() }} />
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
            <Button label="Clear" variant="ghost" size="sm" onPress={() => { ocr.reset(); ai.reset(); setImageUri(null) }} />
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
                <Badge label={`${ocr.result.confidence.toFixed(0)}% confidence`} variant="neutral" />
              )}
            </View>
          )}

          {ocr.status === 'processing' && (
            <ProgressRow message={
              Platform.OS === 'web'
                ? 'First run downloads ~4MB language data — 10–20s'
                : 'Extracting via WebView bridge…'
            }/>
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
            Upload a PDF or DOCX — text is extracted directly from the file.
          </Text>

          <Button
            label={
              doc.status === 'picking'    ? 'Picking file…' :
              doc.status === 'extracting' ? 'Extracting…'   :
              'Pick PDF or DOCX'
            }
            variant="primary"
            onPress={pickAndExtract}
            loading={doc.status === 'picking' || doc.status === 'extracting'}
            disabled={doc.status === 'picking' || doc.status === 'extracting'}
            fullWidth
          />

          {doc.status !== 'idle' && (
            <Button label="Clear" variant="ghost" size="sm" onPress={() => { doc.reset(); ai.reset() }} />
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
                  doc.status === 'success'                                ? 'success' :
                  doc.status === 'error'                                  ? 'error'   :
                  doc.status === 'picking' || doc.status === 'extracting' ? 'warning' : 'info'
                }
                dot
              />
              {doc.result && (
                <>
                  <Badge label={doc.result.source.toUpperCase()} variant="info" />
                  <Badge label={`${doc.result.pageCount} page${doc.result.pageCount !== 1 ? 's' : ''}`} variant="neutral" />
                  <Badge label={`${doc.result.text.split(/\s+/).filter(Boolean).length} words`} variant="neutral" />
                  {doc.result.confidence === 'low' && (
                    <Badge label="Low quality" variant="warning" />
                  )}
                </>
              )}
            </View>
          )}

          {(doc.status === 'picking' || doc.status === 'extracting') && (
            <ProgressRow message={
              doc.status === 'picking' ? 'Opening file picker…' : 'Extracting text…'
            }/>
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

      {/* ── AI Analysis — shown once text is available on either tab ── */}
      {extractedText && (
        <>
          <Divider />

          <Section title="AI Analysis">
            {/* Analysis type picker */}
            <View className="flex-row gap-2 flex-wrap">
              {ANALYSIS_TYPES.map(({ label, value }) => (
                <Pressable
                  key={value}
                  onPress={() => { setAnalysisType(value); ai.reset() }}
                  className={`px-3 py-1.5 rounded-full border ${
                    analysisType === value
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    analysisType === value ? 'text-white' : 'text-gray-600'
                  }`}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Button
              label={ai.status === 'loading' ? 'Analyzing…' : `Analyze as ${ANALYSIS_TYPES.find(t => t.value === analysisType)?.label}`}
              variant="primary"
              onPress={handleAnalyze}
              loading={ai.status === 'loading'}
              disabled={ai.status === 'loading'}
              fullWidth
            />

            {ai.status === 'loading' && (
              <ProgressRow message="Sending to Gemini AI…" />
            )}

            {ai.status === 'error' && ai.error && (
              <ErrorCard message={ai.error} onRetry={handleAnalyze} />
            )}

            {ai.status === 'success' && ai.result && (
              <AiResultCard result={ai.result} />
            )}
          </Section>
        </>
      )}

    </PageLayout>
  )
}

// ─── AI Result Card ────────────────────────────────────────────────────────────

function AiResultCard({ result }: { result: NonNullable<ReturnType<typeof useAnalyzeDocument>['result']> }) {
  if (result.type === 'summarize') {
    return (
      <View className="gap-3">
        <Card elevation="flat">
          <Text className="text-xs uppercase tracking-widest text-gray-400 mb-1">Summary</Text>
          <Text className="text-base text-gray-800">{result.data.summary}</Text>
        </Card>
        <Card elevation="flat">
          <Text className="text-xs uppercase tracking-widest text-gray-400 mb-2">Key points</Text>
          {result.data.keyPoints.map((p: string, i: number) => (
            <Text key={i} className="text-sm text-gray-700 mb-1">• {p}</Text>
          ))}
          <Text className="text-xs text-gray-400 mt-2">{result.data.wordCount} words in original</Text>
        </Card>
      </View>
    )
  }

  if (result.type === 'medical_report') {
    const d = result.data
    return (
      <View className="gap-3">
        {/* Risk banner */}
        <View className={`p-3 rounded-xl flex-row items-center gap-2 ${
          d.riskLevel === 'high'   ? 'bg-red-50'    :
          d.riskLevel === 'medium' ? 'bg-amber-50'  : 'bg-green-50'
        }`}>
          <Badge
            label={`${d.riskLevel.toUpperCase()} RISK`}
            variant={d.riskLevel === 'high' ? 'error' : d.riskLevel === 'medium' ? 'warning' : 'success'}
            dot
          />
          <Text className={`text-sm flex-1 ${
            d.riskLevel === 'high' ? 'text-red-700' : d.riskLevel === 'medium' ? 'text-amber-700' : 'text-green-700'
          }`}>
            {d.summary}
          </Text>
        </View>

        {/* Patient info */}
        {Object.values(d.patientInfo).some(Boolean) && (
          <Card elevation="flat">
            <Text className="text-xs uppercase tracking-widest text-gray-400 mb-2">Patient info</Text>
            {Object.entries(d.patientInfo).filter(([, v]) => v).map(([k, v]) => (
              <View key={k} className="flex-row justify-between py-1.5 border-b border-gray-100">
                <Text className="text-sm text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}</Text>
                <Text className="text-sm text-gray-800 font-medium">{v as string}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Vitals */}
        {Object.values(d.vitals).some(Boolean) && (
          <Card elevation="flat">
            <Text className="text-xs uppercase tracking-widest text-gray-400 mb-2">Vitals</Text>
            {Object.entries(d.vitals).filter(([, v]) => v).map(([k, v]) => (
              <View key={k} className="flex-row justify-between py-1.5 border-b border-gray-100">
                <Text className="text-sm text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}</Text>
                <Text className="text-sm text-gray-800 font-medium">{v as string}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Conditions */}
        {d.conditions.length > 0 && (
          <Card elevation="flat">
            <Text className="text-xs uppercase tracking-widest text-gray-400 mb-2">Conditions</Text>
            {d.conditions.map((c: { name: string; date: string; notes: string }, i: number) => (
              <View key={i} className="mb-2 pb-2 border-b border-gray-100">
                <Text className="text-sm font-medium text-gray-800">{c.name}</Text>
                {!!c.date  && <Text className="text-xs text-gray-400 mt-0.5">{c.date}</Text>}
                {!!c.notes && <Text className="text-xs text-gray-500 mt-0.5">{c.notes}</Text>}
              </View>
            ))}
          </Card>
        )}

        {/* Risk factors */}
        {d.riskFactors.length > 0 && (
          <Card elevation="flat">
            <Text className="text-xs uppercase tracking-widest text-gray-400 mb-2">Risk factors</Text>
            {d.riskFactors.map((f: string, i: number) => (
              <Text key={i} className="text-sm text-gray-700 mb-1">• {f}</Text>
            ))}
          </Card>
        )}

        {/* Family history */}
        {d.familyHistory.length > 0 && (
          <Card elevation="flat">
            <Text className="text-xs uppercase tracking-widest text-gray-400 mb-2">Family history</Text>
            {d.familyHistory.map((f: { relation: string; age: string; status: string; cause: string }, i: number) => (
              <View key={i} className="flex-row justify-between py-1.5 border-b border-gray-100">
                <Text className="text-sm text-gray-500 capitalize">{f.relation}</Text>
                <Text className="text-sm text-gray-700">{f.age} · {f.status}{f.cause ? ` · ${f.cause}` : ''}</Text>
              </View>
            ))}
          </Card>
        )}
      </View>
    )
  }

  if (result.type === 'resume') {
    const d = result.data
    return (
      <View className="gap-3">
        {/* Candidate header */}
        <Card elevation="flat">
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">{d.candidate.name || 'Unknown'}</Text>
              {!!d.candidate.email    && <Text className="text-sm text-gray-500">{d.candidate.email}</Text>}
              {!!d.candidate.location && <Text className="text-sm text-gray-500">{d.candidate.location}</Text>}
            </View>
            <View className="gap-1 items-end">
              <Badge
                label={d.experienceLevel}
                variant={
                  d.experienceLevel === 'lead'   ? 'error'   :
                  d.experienceLevel === 'senior' ? 'warning' :
                  d.experienceLevel === 'mid'    ? 'info'    : 'neutral'
                }
              />
              <Text className="text-xs text-gray-400">{d.yearsExperience} yrs exp</Text>
            </View>
          </View>
          <Text className="text-sm text-gray-600">{d.summary}</Text>
        </Card>

        {/* Skills */}
        {d.skills.length > 0 && (
          <Card elevation="flat">
            <Text className="text-xs uppercase tracking-widest text-gray-400 mb-2">Skills</Text>
            <View className="flex-row flex-wrap gap-1.5">
              {d.skills.map((s: string, i: number) => (
                <View key={i} className="bg-blue-50 px-2 py-1 rounded-lg">
                  <Text className="text-xs text-blue-700">{s}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Strengths */}
        {d.strengths.length > 0 && (
          <Card elevation="flat">
            <Text className="text-xs uppercase tracking-widest text-gray-400 mb-2">Strengths</Text>
            {d.strengths.map((s: string, i: number) => (
              <Text key={i} className="text-sm text-gray-700 mb-1">✓ {s}</Text>
            ))}
          </Card>
        )}

        {/* Suggestions */}
        {d.suggestions.length > 0 && (
          <Card elevation="flat">
            <Text className="text-xs uppercase tracking-widest text-gray-400 mb-2">Suggestions</Text>
            {d.suggestions.map((s: string, i: number) => (
              <Text key={i} className="text-sm text-gray-700 mb-1">→ {s}</Text>
            ))}
          </Card>
        )}

        {/* Experience */}
        {d.experience.length > 0 && (
          <Card elevation="flat">
            <Text className="text-xs uppercase tracking-widest text-gray-400 mb-2">Experience</Text>
            {d.experience.map((e: { company: string; role: string; duration: string; highlights: string[] }, i: number) => (
              <View key={i} className="mb-3 pb-3 border-b border-gray-100">
                <Text className="text-sm font-medium text-gray-800">{e.role}</Text>
                <Text className="text-xs text-gray-500">{e.company} · {e.duration}</Text>
                {e.highlights.map((h: string, j: number) => (
                  <Text key={j} className="text-xs text-gray-600 mt-0.5">• {h}</Text>
                ))}
              </View>
            ))}
          </Card>
        )}
      </View>
    )
  }

  return null
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-xs font-semibold uppercase tracking-widest text-gray-400">{title}</Text>
      <View className="gap-2">{children}</View>
    </View>
  )
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
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

function ResultCard({ text, meta }: { text: string; meta: string }) {
  const paragraphs = text.split('\n\n').filter(Boolean)
  return (
    <Card elevation="flat">
      <Text className="text-xs uppercase tracking-widest text-gray-400 mb-2">{meta}</Text>
      <ScrollView className="max-h-72">
        <View className="gap-3">
          {paragraphs.map((para, idx) => (
            <Text key={idx} className="text-sm leading-relaxed text-gray-800">{para}</Text>
          ))}
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