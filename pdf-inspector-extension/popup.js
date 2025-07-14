const message = document.getElementById('message');

window.onload = () => {
  chrome.storage.local.get('lastResult', (res) => {
    if (res.lastResult) {
      const { text, color } = formatInspectionResult(res.lastResult);
      message.innerText = text;
      message.style.color = color;
    } else {
      message.innerText = 'No recent inspection.';
      message.style.color = '#444';
    }
  });
};

function formatInspectionResult(result) {
  const secrets = result.prompt?.findings?.Secrets || [];
  const violations = result.violations || [];

  if (secrets.length > 0) {
    const secretList = secrets.map(s => `${s.entity_type}: ${s.entity}`).join('\n');
    return { text: `Secrets Detected:\n${secretList}`, color: 'red' };
  } else if (violations.length > 0) {
    const violationList = violations.join('\n');
    return { text: `Violations:\n${violationList}`, color: 'orange' };
  }
  return { text: 'Clean. No secrets or violations.', color: 'green' };
}
