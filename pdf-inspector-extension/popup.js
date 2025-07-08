const message = document.getElementById('message');

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'INSPECTION_RESULT' && msg.data?.result?.violations?.includes("Secrets")) {
    if (sender?.tab?.id) {
      chrome.action.setBadgeText({ text: '!', tabId: sender.tab.id });
      chrome.action.setBadgeBackgroundColor({ color: 'red', tabId: sender.tab.id });
    } else {
      chrome.action.setBadgeText({ text: '!' });
      chrome.action.setBadgeBackgroundColor({ color: 'red' });
    }
  }
});


window.onload = () => {
  chrome.storage.local.get('lastResult', (res) => {
    if (res.lastResult) renderInspectionResult(res.lastResult);
  });
};

function renderInspectionResult(parsed) {
  try {
    const secrets = parsed.result?.prompt?.findings?.Secrets;
    if (parsed.result?.violations?.includes("Secrets") && secrets?.length > 0) {
      const findings = secrets
        .map((s) => `🔐 ${s.entity_type}: ${s.entity}`)
        .join('\n');
      message.innerText = `❌ Secrets Detected:\n${findings}`;
      message.style.color = 'red';
    } else {
      message.innerText = `✅ Clean – no secrets found`;
      message.style.color = 'green';
    }
  } catch (err) {
    message.innerText = '⚠️ Error parsing inspection result.';
    message.style.color = 'orange';
  }
}
