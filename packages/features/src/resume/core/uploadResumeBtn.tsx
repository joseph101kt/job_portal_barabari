/**
 * app/uploadResumeBtn.tsx
 */

import React, { useState, useEffect, useRef } from 'react'
import { View, ActivityIndicator, Text, Alert } from 'react-native'
import {
  useDocumentExtractor,
  useDocument,
  PdfEngine,
  useAnalyzeDocument,
} from '@my-app/features'
import { upsertResume } from '@my-app/supabase'
import { Button, colors, Toast } from '../../../../ui/src'


// ── TYPES ──────────────────────────────────────────────────

type Props = {
  userId:     string
  hasResume?: boolean
  onSuccess?: (data: any) => void
  onError?:   (err: any) => void
  showStatus?: boolean
}

// ── HELPERS ─────────────────────────────────────────────────

function normalizeArrayFields(result: any): any {
  console.log('[Resume] Raw AI result:', result)
  const arrayFields = ['skills', 'experience', 'education', 'projects', 'certifications', 'strengths', 'gaps', 'suggestions']
  const out = { ...result }
  for (const field of arrayFields) {
    if (!Array.isArray(out[field])) {
      console.warn('[Resume] AI returned non-array for', field, '— defaulting to []')
      out[field] = []
    }
  }
  return out
}

// ── COMPONENT ────────────────────────────────────────────────

export function ResumeUploadButton({
  userId,
  hasResume   = false,
  onSuccess,
  onError,
  showStatus  = false,
}: Props) {

  const doc = useDocument()

  const { pickAndExtract, pdfWebviewRef, pendingDocRef } = useDocumentExtractor({
    onEvent: (event) => {
      doc.onDocumentEvent(event)
    },
  })

  const ai = useAnalyzeDocument()

  const [isProcessing,  setIsProcessing]  = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  // Prevent effect loops
  const hasAnalyzedRef = useRef(false)
  const hasSavedRef    = useRef(false)

  // ─────────────────────────────────────────────
  // STEP 1: Extraction complete → trigger AI
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (doc.status === 'success' && doc.result?.text && !hasAnalyzedRef.current) {
      hasAnalyzedRef.current = true
      console.log('[Resume] extraction success, word count:', doc.result.text.split(/\s+/).length)
      console.log('[Resume] extraction result:', doc.result.text)
      handleAnalyze(doc.result.text)
    }

if (doc.status === 'error') {
  if (doc.error === 'cancelled') {
    console.log('[Resume] user cancelled picker')
    resetAll()
    return
  }

  console.error('[Resume] extraction failed:', doc.error)
  Alert.alert('Extraction failed', doc.error ?? 'Could not read file.')
  resetAll()
  onError?.(new Error(doc.error ?? 'extraction failed'))
}
  }, [doc.status])

  // ─────────────────────────────────────────────
  // STEP 2: Trigger AI analysis
  // ─────────────────────────────────────────────

  async function handleAnalyze(text: string) {
    setStatusMessage('Analyzing with AI...')
    try {
      await ai.analyzeDocument({ type: 'resume', text })
    } catch (err) {
      console.error('[Resume] AI call threw:', err)
      Alert.alert('AI error', 'Failed to analyze resume. Please try again.')
      resetAll()
      onError?.(err)
    }
  }

  // ─────────────────────────────────────────────
  // STEP 3: AI complete → save to DB
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (ai.status === 'success' && ai.result?.data && !hasSavedRef.current) {
      hasSavedRef.current = true
      console.log('[Resume] AI success, saving...')
      console.log('[Resume] AI result:', ai.result.data)
      handleSave(ai.result.data)
    }

    if (ai.status === 'error') {
      console.error('[Resume] AI error:', ai.error)
      Alert.alert('Analysis failed', ai.error ?? 'AI could not parse the resume.')
      resetAll()
      onError?.(new Error(ai.error ?? 'AI failed'))
    }
  }, [ai.status])

  // ─────────────────────────────────────────────
  // STEP 4: Save to database
  // ─────────────────────────────────────────────

  async function handleSave(rawResult: any) {
    setStatusMessage('Saving to profile...')
    // Normalize all array fields — guards against AI returning null/undefined
    const result = normalizeArrayFields(rawResult)
    console.log('[Resume] saving result:', {
      name:        result.candidate?.name,
      skills:      result.skills?.length,
      experience:  result.experience?.length,
      education:   result.education?.length,
    })

    try {
      const success = await upsertResume(userId, result)

      if (!success) throw new Error('upsertResume returned false')

      console.log('[Resume] save success')
      Alert.alert('Resume uploaded', 'Your profile has been updated.')
      onSuccess?.(result)

    } catch (err: any) {
      console.error('[Resume] save error:', err?.message ?? err)
      Alert.alert('Save failed', 'Resume was analyzed but could not be saved. Please try again.')
      onError?.(err)
    } finally {
      resetAll()
    }
  }

  // ─────────────────────────────────────────────
  // RESET
  // ─────────────────────────────────────────────

  function resetAll() {
    setIsProcessing(false)
    setStatusMessage('')
    hasAnalyzedRef.current = false
    hasSavedRef.current    = false
    doc.reset()
    ai.reset()
    setStatusMessage('')
    setIsProcessing(false)
  }

  // ─────────────────────────────────────────────
  // STEP 0: Upload trigger
  // ─────────────────────────────────────────────

  async function handleUploadResume() {
    if (!userId) {
      Alert.alert('Not logged in', 'Please log in to upload your resume.')
      return
    }

    console.log('[Resume] upload triggered for user:', userId)

    resetAll()
    setIsProcessing(true)
    hasAnalyzedRef.current = false
    hasSavedRef.current    = false
    setStatusMessage('Opening file picker...')

    try {
      await pickAndExtract()
    } catch (err: any) {
      console.error('[Resume] pickAndExtract threw:', err?.message ?? err)
      Toast.showError(
        doc.error ?? 'Could not read file. Try a different PDF or DOCX.'
      )
      resetAll()
      onError?.(err)
    }
  }

  // ─────────────────────────────────────────────
  // STATUS LABEL
  // ─────────────────────────────────────────────

  function getStatusLabel(): string {
    if (doc.status === 'picking')    return 'Opening picker...'
    if (doc.status === 'extracting') return 'Extracting text...'
    if (ai.status === 'loading')     return 'Analyzing resume...'
    return statusMessage || 'Processing...'
  }

  // ─────────────────────────────────────────────
  // RENDER
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