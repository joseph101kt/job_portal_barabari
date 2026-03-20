// packages/features/src/ocr/core/pipeline/useImagePicker.native.ts

import * as ImagePicker from 'expo-image-picker'
import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy'
import type { OcrEvent } from './useOcr'

export type PickedImage = {
  uri:    string
  base64: string
}

export async function pickImageAsBase64(): Promise<PickedImage | null> {
  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality:    0.8,
    base64:     true,
  })

  if (picked.canceled || !picked.assets[0]) return null

  const asset  = picked.assets[0]
  const base64 = asset.base64
    ?? await readAsStringAsync(asset.uri, { encoding: EncodingType.Base64 })

  return { uri: asset.uri, base64 }
}

// No-op on native — web only. Exists so the import resolves on both platforms.
export async function runTesseractWeb(
  _imageBase64: string,
  _onEvent: (e: OcrEvent) => void
): Promise<void> {}