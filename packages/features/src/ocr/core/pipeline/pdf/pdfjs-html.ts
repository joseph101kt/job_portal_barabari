// packages/features/src/ocr/core/pipeline/pdf/pdfjs-html.ts

export const PDFJS_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/legacy/build/pdf.min.js"></script>
</head>
<body>
<script>
  pdfjsLib.GlobalWorkerOptions.workerSrc = false;
  var MIN_WORDS        = 30;
  var MIN_CANVAS_PX    = 100;   // skip canvas smaller than this in either dimension

  function notify(payload) {
    var msg = JSON.stringify(payload);
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(msg);
    } else {
      window.parent.postMessage(msg, '*');
    }
  }

  async function extractPdf(base64) {
    try {
      notify({ status: 'extracting', message: 'Parsing PDF…' });

      var binary = atob(base64);
      var bytes  = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      var pdf        = await pdfjsLib.getDocument({ data: bytes }).promise;
      var totalPages = pdf.numPages;

      for (var i = 1; i <= totalPages; i++) {
        notify({ status: 'extracting', message: 'Extracting page ' + i + ' of ' + totalPages + '…' });

        var page    = await pdf.getPage(i);
        var content = await page.getTextContent();
        var text    = content.items
          .filter(function(item) { return typeof item.str === 'string'; })
          .map(function(item)    { return item.str; })
          .join(' ')
          .replace(/\\s+/g, ' ')
          .trim();
        var wordCount = text.split(/\\s+/).filter(Boolean).length;

        if (wordCount >= MIN_WORDS) {
          notify({ status: 'pageText', pageNumber: i, text: text, wordCount: wordCount, totalPages: totalPages });
          continue;
        }

        // Sparse text — try canvas render
        notify({ status: 'extracting', message: 'Page ' + i + ' is image-based — rendering…' });
        try {
          var viewport = page.getViewport({ scale: 2.0 });

          // Skip pages that are too small to OCR usefully
          if (viewport.width < MIN_CANVAS_PX || viewport.height < MIN_CANVAS_PX) {
            notify({ status: 'pageText', pageNumber: i, text: '', wordCount: 0, totalPages: totalPages });
            continue;
          }

          var canvas   = document.createElement('canvas');
          canvas.width  = viewport.width;
          canvas.height = viewport.height;
          var ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport: viewport }).promise;
          var imageData = canvas.toDataURL('image/jpeg', 0.85);

          // Sanity check the data URL length — a blank page produces ~3KB
          if (imageData.length < 5000) {
            notify({ status: 'pageText', pageNumber: i, text: '', wordCount: 0, totalPages: totalPages });
            continue;
          }

          notify({ status: 'pageNeedsOcr', pageNumber: i, imageData: imageData, totalPages: totalPages });
        } catch (renderErr) {
          // Canvas failed — send empty
          notify({ status: 'pageText', pageNumber: i, text: '', wordCount: 0, totalPages: totalPages });
        }
      }

      notify({ status: 'done', totalPages: totalPages });

    } catch (err) {
      notify({ status: 'error', error: err.message });
    }
  }

  function onMessage(e) {
    try {
      var data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (data && data.pdfBase64) extractPdf(data.pdfBase64);
    } catch (_) {}
  }

  document.addEventListener('message', onMessage);
  window.addEventListener('message', onMessage);
  notify({ status: 'ready' });
</script>
</body>
</html>
`