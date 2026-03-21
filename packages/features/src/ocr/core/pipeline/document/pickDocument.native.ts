// packages/features/src/ocr/core/pipeline/document/pickDocument.native.ts

import * as DocumentPicker from 'expo-document-picker'
import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy'
import type { PickedDocument } from './types'

export async function pickDocumentAsBuffer(): Promise<PickedDocument | null> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    copyToCacheDirectory: true,
  })

  if (picked.canceled || !picked.assets[0]) return null

  const asset  = picked.assets[0]
  const base64 = await readAsStringAsync(asset.uri, { encoding: EncodingType.Base64 })

  // base64 → ArrayBuffer
  const binary = atob(base64)
  const buffer = new ArrayBuffer(binary.length)
  const view   = new Uint8Array(buffer)
  for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i)

  return {
    filename:  asset.name,
    mimeType:  asset.mimeType ?? '',
    buffer,
    sizeBytes: asset.size ?? buffer.byteLength,
  }
}