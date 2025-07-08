console.log('[Prompt Inspector] Content script running.');

function sendPdfToBackground(file) {
  const reader = new FileReader();

  reader.onload = () => {
    try {
      const arrayBuffer = reader.result;

      if (!(arrayBuffer instanceof ArrayBuffer)) {
        console.error('[Prompt Inspector] Unexpected reader.result type:', typeof arrayBuffer);
        return;
      }

      if (typeof chrome === 'undefined' || !chrome.runtime?.connect) {
        console.error('[Prompt Inspector] chrome.runtime.connect is unavailable');
        return;
      }

      const port = chrome.runtime.connect({ name: 'pdfUpload' });
      console.log('[Prompt Inspector] Connected to background script');

      const byteArray = new Uint8Array(arrayBuffer);
      port.postMessage({ type: 'fileMeta', fileName: file.name });
      port.postMessage({ type: 'fileBuffer', fileBuffer: Array.from(byteArray) });

      port.onMessage.addListener((msg) => {
        if (msg.status === 'done') {
          console.log('[Prompt Inspector] ✅ Inspection result:', msg.result);
        } else if (msg.status === 'error') {
          console.error('[Prompt Inspector] ❌ Error from background:', msg.error);
        }
      });

    } catch (err) {
      console.error('[Prompt Inspector] reader.onload failed:', err);
    }
  };

  reader.onerror = (err) => {
    console.error('[Prompt Inspector] FileReader error:', err);
  };

  reader.readAsArrayBuffer(file);
}

const observer = new MutationObserver(() => {
  document.querySelectorAll('input[type="file"]').forEach(input => {
    if (!input._inspected) {
      input._inspected = true;
      input.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type === 'application/pdf') {
          console.log('[Prompt Inspector] PDF file selected:', file.name);
          sendPdfToBackground(file);
        }
      });
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });
