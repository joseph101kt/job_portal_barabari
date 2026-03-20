// packages/features/src/ocr/tesseract-html.ts
//
// HTML string injected into the hidden WebView on native.
// This file is only imported by OcrEngine.native.tsx — never on web.
//
// Flow:
//   RN sends   → postMessage({ imageBase64 })
//   WebView runs Tesseract, then sends back:
//   WebView sends → postMessage({ status, text?, confidence?, error? })

export const TESSERACT_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <script src="https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js"></script>
</head>
<body>
<script>
  let worker = null;

  async function initWorker() {
    worker = await Tesseract.createWorker('eng');
    notify({ status: 'ready' });
  }

  async function runOCR(imageBase64) {
    try {
      if (!worker) await initWorker();
      notify({ status: 'processing' });

      const result = await worker.recognize(
        'data:image/jpeg;base64,' + imageBase64
      );

      notify({
        status:     'success',
        text:       result.data.text,
        confidence: result.data.confidence,
      });
    } catch (err) {
      notify({ status: 'error', error: err.message });
    }
  }

  function notify(payload) {
    window.ReactNativeWebView.postMessage(JSON.stringify(payload));
  }

  function onMessage(e) {
    try {
      const { imageBase64 } = JSON.parse(e.data);
      if (imageBase64) runOCR(imageBase64);
    } catch (_) {}
  }

  // Android uses document, iOS uses window
  document.addEventListener('message', onMessage);
  window.addEventListener('message', onMessage);

  initWorker();
</script>
</body>
</html>
`