// test-pipeline.ts  (run with: npx ts-node test-pipeline.ts)
//
// Simulates phases 1–8 with synthetic word data that mimics a medical report.
// No real image needed — we stub the Tesseract output.

import { extractWords  } from './extract'
import { cleanWords    } from './clean'
import { sortWords     } from './sort'
import { normalizeWords} from './normalize'
import { groupIntoLines} from './lines'
import type { TesseractResult } from './types'

// ── Synthetic Tesseract output ───────────────────────────────────────────────
// Mimics a simple medical report header section.
// Image size: 800×600 (we'll pretend this is the scan dimensions)

const IMAGE_W = 800
const IMAGE_H = 600

const mockTesseractResult: TesseractResult = {
  data: {
    text: '',
    words: [
      // Line 1: "MEDICAL REPORT" (header, top center — tall bbox)
      { text: 'MEDICAL', confidence: 95, bbox: { x0: 280, y0: 30, x1: 390, y1: 60 } },
      { text: 'REPORT',  confidence: 93, bbox: { x0: 400, y0: 30, x1: 510, y1: 60 } },

      // Line 2: "Patient: John Doe" (label + value)
      { text: 'Patient:', confidence: 88, bbox: { x0: 60,  y0: 90, x1: 150, y1: 110 } },
      { text: 'John',    confidence: 91, bbox: { x0: 160, y0: 90, x1: 210, y1: 110 } },
      { text: 'Doe',     confidence: 89, bbox: { x0: 215, y0: 90, x1: 265, y1: 110 } },

      // Line 3: "Age: 45" (label + value)
      { text: 'Age:',    confidence: 92, bbox: { x0: 60,  y0: 125, x1: 100, y1: 145 } },
      { text: '45',      confidence: 90, bbox: { x0: 110, y0: 125, x1: 140, y1: 145 } },

      // Line 4: noisy word that should be filtered (low confidence)
      { text: '~~~',     confidence: 12, bbox: { x0: 400, y0: 130, x1: 440, y1: 148 } },

      // Line 5: empty string that should be filtered
      { text: '   ',     confidence: 80, bbox: { x0: 200, y0: 160, x1: 250, y1: 178 } },

      // Line 6: "Diagnosis: Hypertension Stage 2"
      { text: 'Diagnosis:',    confidence: 87, bbox: { x0: 60, y0: 200, x1: 175, y1: 220 } },
      { text: 'Hypertension',  confidence: 85, bbox: { x0: 185, y0: 200, x1: 320, y1: 220 } },
      { text: 'Stage',         confidence: 88, bbox: { x0: 330, y0: 200, x1: 390, y1: 220 } },
      { text: '2',             confidence: 91, bbox: { x0: 400, y0: 200, x1: 420, y1: 220 } },

      // Zero-area bbox (should be filtered)
      { text: 'ghost', confidence: 70, bbox: { x0: 100, y0: 220, x1: 100, y1: 220 } },
    ],
  },
}

// ── Run pipeline ─────────────────────────────────────────────────────────────

console.log('='.repeat(60))
console.log('PHASE 1 — extract')
console.log('='.repeat(60))
const extracted = extractWords(mockTesseractResult)
console.log(`Extracted ${extracted.length} words`)

console.log('\n' + '='.repeat(60))
console.log('PHASE 2 — clean')
console.log('='.repeat(60))
const cleaned = cleanWords(extracted)
console.log(`After clean: ${cleaned.length} words (dropped ${extracted.length - cleaned.length})`)
const dropped = extracted.filter(w => !cleaned.some(c => c.text === w.text && c.confidence === w.confidence))
console.log('Dropped:', dropped.map(w => `"${w.text.trim()}" (conf:${w.confidence})`))

console.log('\n' + '='.repeat(60))
console.log('PHASE 3 — sort')
console.log('='.repeat(60))
const sorted = sortWords(cleaned)
console.log('Sort order:', sorted.map(w => `"${w.text}" y0:${w.bbox.y0}`).join(' | '))

console.log('\n' + '='.repeat(60))
console.log('PHASE 4 — normalize')
console.log('='.repeat(60))
const normalized = normalizeWords(sorted, IMAGE_W, IMAGE_H)
console.log('Sample normalized words:')
normalized.slice(0, 3).forEach(w => {
  console.log(`  "${w.text}" → norm: x=${w.norm.x} y=${w.norm.y} w=${w.norm.width} h=${w.norm.height}`)
})

console.log('\n' + '='.repeat(60))
console.log('PHASES 5–9 — group into lines')
console.log('='.repeat(60))
const lines = groupIntoLines(normalized)
console.log(`Grouped into ${lines.length} lines:\n`)
lines.forEach(line => {
  console.log(`  [${line.order}] "${line.text}"`)
  console.log(`       indent:${line.indent}  width:${line.width}  height:${line.height}  typeHint:${line.typeHint}`)
})

console.log('\n' + '='.repeat(60))
console.log('rawText preview')
console.log('='.repeat(60))
const rawText = lines.map(l => l.text).join('\n')
console.log(rawText)