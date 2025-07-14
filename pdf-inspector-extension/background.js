chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'UPLOAD_PDF') {
    (async () => {
      try {
        const fileName = msg.fileName;
        // Directly use msg.fileBuffer which is already an ArrayBuffer
        const buffer = new Uint8Array(msg.fileBuffer);

        const file = new File([buffer], fileName, { type: 'application/pdf' });
        const formData = new FormData();
        formData.append('file', file);


        const response = await fetch('http://localhost:8000/inspect', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}\n${errText}`);
        }

        const result = await response.json();

        chrome.storage.local.set({ lastResult: result });
        // Ensure this sendMessage has its own error handling if it goes to a UI script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'INSPECTION_RESULT', data: result });
            }
        });

//        chrome.runtime.sendMessage({ type: 'INSPECTION_RESULT', data: result });

        sendResponse({ status: 'done', result });
      } catch (err) {
        console.error('[Prompt Inspector] Background script error during PDF upload:', err);
        sendResponse({ status: 'error', error: err.message });
      }
    })();

    return true; // keep async channel open
  }
});