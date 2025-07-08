console.log('[Prompt Inspector] Background script loaded.');

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Prompt Inspector] Extension installed.');
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'pdfUpload') return;

  console.log('[Prompt Inspector] Connection established with content script.');

  let fileName = null;
  let buffer = null;

  port.onMessage.addListener(async (msg) => {
    try {
      if (msg.type === 'fileMeta') {
        fileName = msg.fileName;
        console.log('[Prompt Inspector] Received filename:', fileName);
      }

      if (msg.type === 'fileBuffer') {
        if (!Array.isArray(msg.fileBuffer)) {
          throw new Error('Received fileBuffer is not an array.');
        }

        buffer = new Uint8Array(msg.fileBuffer).buffer;
        console.log('[Prompt Inspector] Received file buffer of size:', buffer.byteLength);

        if (!fileName || !buffer.byteLength) {
          port.postMessage({ status: 'error', error: 'Missing or empty file data.' });
          return;
        }

        const blob = new Blob([new Uint8Array(buffer)], { type: 'application/pdf' });
        const formData = new FormData();
        formData.append('file', blob, fileName);

        console.log('[Prompt Inspector] Sending formData to backend...');

        const response = await fetch('http://localhost:8000/inspect', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        console.log('[Prompt Inspector] Inspection response:', result);

        chrome.storage.local.set({ lastResult: result });
        chrome.runtime.sendMessage({ type: 'INSPECTION_RESULT', data: result }, () => {
          if (chrome.runtime.lastError) {
            console.warn('[Prompt Inspector] No listener for INSPECTION_RESULT:', chrome.runtime.lastError.message);
          }
        });

        port.postMessage({ status: 'done', result });
      }
    } catch (err) {
      console.error('[Prompt Inspector] Error during message handling:', err);
      port.postMessage({ status: 'error', error: err.message });
    }
  });
});
