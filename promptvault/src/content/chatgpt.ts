chrome.runtime.onMessage.addListener((message: { type: string; prompt: string }) => {
  if (message.type !== 'INJECT_PROMPT') return;

  const input = (
    document.querySelector('#prompt-textarea') ||
    document.querySelector('[data-lexical-editor]') ||
    document.querySelector('div[contenteditable="true"].ProseMirror') ||
    document.querySelector('#composer-background [contenteditable="true"]')
  ) as HTMLElement | null;

  if (!input) return;

  input.focus();
  document.execCommand('selectAll', false);
  document.execCommand('insertText', false, message.prompt);
});
