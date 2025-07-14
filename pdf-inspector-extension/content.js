console.log('[Prompt Inspector] Content script running.');

function showPopupMessage(text) {
  const existing = document.getElementById('prompt-inspector-popup');
  if (existing) existing.remove(); // avoid duplicates

  const div = document.createElement('div');
  div.id = 'prompt-inspector-popup';
  div.textContent = text;
  div.style.position = 'fixed';
  div.style.top = '20px';
  div.style.right = '20px';
  div.style.backgroundColor = '#fff';
  div.style.border = '1px solid #ccc';
  div.style.padding = '12px 16px';
  div.style.borderRadius = '8px';
  div.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
  div.style.zIndex = '9999';
  div.style.maxWidth = '300px';
  div.style.whiteSpace = 'pre-wrap';
  div.style.fontFamily = 'sans-serif';
  div.style.fontSize = '14px';

  document.body.appendChild(div);

  // Auto-dismiss after 6 seconds
  setTimeout(() => {
    div.remove();
  }, 6000);
}

function sendPdfToBackground(file) {
  const reader = new FileReader();

  reader.onload = () => {
    const arrayBuffer = reader.result;

    if (!(arrayBuffer instanceof ArrayBuffer)) {
      console.error('[Prompt Inspector] Unexpected reader.result type');
      return;
    }

    const byteArray = Array.from(new Uint8Array(arrayBuffer)); // ✅ serialize properly


    // Try to send the message. Add error handling for sendMessage itself.
    // However, if context is invalidated, this entire block won't run.
    try {
  if (typeof chrome !== 'undefined' && chrome.runtime?.id && chrome.runtime?.sendMessage) {
    chrome.runtime.sendMessage({
      type: 'UPLOAD_PDF',
      fileName: file.name,
      fileBuffer: byteArray
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[Prompt Inspector] Error sending message:', chrome.runtime.lastError.message);
      } else if (response?.status === 'error') {
        console.error('[Prompt Inspector] Background script error:', response.error);
      } else {
        console.log('[Prompt Inspector] ✅ PDF upload message sent successfully.');
      }
    });
  } else {
    console.warn('[Prompt Inspector] Extension context is invalid or not available');
  }
} catch (e) {
  console.error('[Prompt Inspector] Failed to send message (likely context invalidated):', e);
}
  };

  reader.onerror = (e) => {
    console.error('[Prompt Inspector] FileReader error:', e);
  };

  reader.readAsArrayBuffer(file);
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'INSPECTION_RESULT') {
    const result = msg.data?.result;
    if (!result) return;

    const secrets = result.prompt?.findings?.Secrets || [];
    const violations = result.violations || [];

    let messageText = '';

    if (secrets.length > 0) {
      const list = secrets.map(s => `Secret: ${s.entity_type} - ${s.entity}`).join('\n');
      messageText = `Secrets Detected:\n${list}`;
    } else if (violations.length > 0) {
      const list = violations.join('\n');
      messageText = `Violations:\n${list}`;
    } else {
      messageText = `Clean. No secrets or violations.`;
    }

    showPopupMessage(messageText); // ✅ in-page popup
  }
});

const observer = new MutationObserver(() => {
  document.querySelectorAll('input[type="file"]').forEach((input) => {
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
