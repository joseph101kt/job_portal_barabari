// packages/features/src/components/uploadResumeBtn.tsx

import React, { useState, useEffect, useRef } from 'react'
import { View, ActivityIndicator, Text, Alert } from 'react-native'
import { Button, colors, Toast } from '../../../../ui/src'
import { PdfEngine, useDocument, useDocumentExtractor } from '../../ocr'
import { useAnalyzeDocument } from '../../ai'
import { upsertResume } from '@my-app/supabase'

type Props = {
  userId: string
  hasResume?: boolean
  onUploadStart?: () => void
  onSuccess?: (data: any) => void
  onCancel?: () => void
  onError?: (err: any) => void
  showStatus?: boolean
}

function normalizeArrayFields(result: any): any {
  const arrayFields = [
    'skills','experience','education','projects',
    'certifications','strengths','gaps','suggestions',
  ]
  const out = { ...result }
  for (const field of arrayFields) {
    if (!Array.isArray(out[field])) {
      out[field] = []
    }
  }
  return out
}

export function ResumeUploadButton({
  userId,
  hasResume = false,
  onUploadStart,
  onSuccess,
  onCancel,
  onError,
  showStatus = false,
}: Props) {
  const doc = useDocument()

  const { pickAndExtract, pdfWebviewRef, pendingDocRef } =
    useDocumentExtractor({
      onEvent: (event) => {
        doc.onDocumentEvent(event)
      },
    })

  const ai = useAnalyzeDocument()

  const [isProcessing, setIsProcessing] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const hasAnalyzedRef = useRef(false)
  const hasSavedRef = useRef(false)
  const hasNotifiedStartRef = useRef(false)

  const statusRef = useRef(doc.status)

  useEffect(() => {
    statusRef.current = doc.status
  }, [doc.status])

  // ✅ Detect silent cancel (picker closed)
useEffect(() => {
  if (doc.status === 'picking') {
    const timeout = setTimeout(() => {
      if (statusRef.current === 'picking') {
        console.log('[Resume] picker closed without selection')
        resetAll()
        onCancel?.()
        setStatusMessage('')
      }
    }, 3000)

    return () => clearTimeout(timeout)
  }
}, [doc.status])

  // ─────────────────────────────────────────────
  // STEP 1: Watch doc status
  // ─────────────────────────────────────────────

  useEffect(() => {
    // ✅ ONLY start processing when file is actually selected
    if (doc.status === 'extracting' && !hasNotifiedStartRef.current) {
      hasNotifiedStartRef.current = true
      setIsProcessing(true)
      setStatusMessage('Extracting text...')
      onUploadStart?.()
    }

    if (doc.status === 'success' && doc.result?.text && !hasAnalyzedRef.current) {
      hasAnalyzedRef.current = true
      handleAnalyze(doc.result.text)
    }

    if (doc.status === 'error') {
      if (doc.error === 'cancelled') {
        resetAll()
        onCancel?.()
        setStatusMessage('')
        return
      }

      Alert.alert('Extraction failed', doc.error ?? 'Could not read file.')
      resetAll()
      onError?.(new Error(doc.error ?? 'extraction failed'))
    }
  }, [doc.status])

  // ─────────────────────────────────────────────

  async function handleAnalyze(text: string) {
    setStatusMessage('Analyzing with AI...')
    try {
      await ai.analyzeDocument({ type: 'resume', text })
    } catch (err) {
      Alert.alert('AI error', 'Failed to analyze resume.')
      resetAll()
      onError?.(err)
    }
  }

  // ─────────────────────────────────────────────

  useEffect(() => {
    if (ai.status === 'success' && ai.result?.data && !hasSavedRef.current) {
      hasSavedRef.current = true
      handleSave(ai.result.data)
    }

    if (ai.status === 'error') {
      Alert.alert('Analysis failed', ai.error ?? 'AI failed.')
      resetAll()
      onError?.(new Error(ai.error ?? 'AI failed'))
    }
  }, [ai.status])

  // ─────────────────────────────────────────────

  async function handleSave(rawResult: any) {
    setStatusMessage('Saving to profile...')
    const result = normalizeArrayFields(rawResult)

    try {
      const success = await upsertResume(userId, result)
      if (!success) throw new Error()

      Alert.alert('Resume uploaded', 'Your profile has been updated.')
      onSuccess?.(result)
    } catch (err) {
      Alert.alert('Save failed', 'Could not save resume.')
      onError?.(err)
    } finally {
      resetAll()
    }
  }

  // ─────────────────────────────────────────────

  function resetAll() {
    setIsProcessing(false)
    setStatusMessage('')
    hasAnalyzedRef.current = false
    hasSavedRef.current = false
    hasNotifiedStartRef.current = false
    doc.reset()
    ai.reset()
  }

  // ─────────────────────────────────────────────

  async function handleUploadResume() {
    if (!userId) {
      Alert.alert('Not logged in')
      return
    }

    resetAll()
    setStatusMessage('Opening file picker...')

    try {
      await pickAndExtract()
    } catch (err: any) {
      Toast.showError('Could not read file.')
      resetAll()
      onError?.(err)
    }
  }

  // ─────────────────────────────────────────────

  function getStatusLabel(): string {
    if (doc.status === 'picking') return 'Opening picker...'
    if (doc.status === 'extracting') return 'Extracting text...'
    if (ai.status === 'loading') return 'Analyzing resume...'
    return statusMessage || 'Processing...'
  }

  // ─────────────────────────────────────────────

  return (
    <View className="gap-3">
      <PdfEngine
        webviewRef={pdfWebviewRef as React.RefObject<unknown>}
        filename={pendingDocRef.current?.filename}
        sizeBytes={pendingDocRef.current?.sizeBytes}
        onEvent={doc.onDocumentEvent}
      />

      <Button
        label={
          isProcessing
            ? 'Processing...'
            : hasResume
              ? 'Update Resume'
              : 'Upload Resume'
        }
        variant="primary"
        onPress={handleUploadResume}
        loading={isProcessing}
        disabled={isProcessing}
        fullWidth
      />

      {showStatus && isProcessing && (
        <View className="flex-row items-center gap-3 p-3 bg-amber-50 rounded-xl">
          <ActivityIndicator color={colors.warning} />
          <Text className="text-sm text-amber-700 flex-1">
            {getStatusLabel()}
          </Text>
        </View>
      )}
    </View>
  )
}