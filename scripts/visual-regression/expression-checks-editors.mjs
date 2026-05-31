export const visualExpressionEditorChecks = `const richEditorPanelRoot = await showComponent('#component-rich-editor');
const richEditor = richEditorPanelRoot.querySelector('[data-uzu-rich-editor]');
const richEditorGuideText = richEditorPanelRoot.querySelector('.uzu-doc-guidance')?.textContent || '';
const richSurface = richEditor.querySelector('[data-uzu-editor-surface]');
const richCommand = richEditor.querySelector('[data-uzu-editor-command="bold"]');
let richEditorCommandFired = false;
let richEditorCommandDetailValid = false;
let richEditorChangeFired = false;
richEditor.addEventListener('uzu-editor-command', (event) => {
  richEditorCommandFired = true;
  richEditorCommandDetailValid = event.detail.editor === richEditor
    && event.detail.surface === richSurface
    && event.detail.button === richCommand
    && event.detail.command === 'bold'
    && event.detail.value === '';
}, { once: true });
richEditor.addEventListener('uzu-editor-change', () => { richEditorChangeFired = true; }, { once: true });
const richEditorHtmlBefore = richSurface.innerHTML;
click(richCommand);
richSurface.innerHTML = '<p>Changed by host editor.</p>';
richSurface.dispatchEvent(new Event('input', { bubbles: true }));
await wait(100);
const richEditorRole = richSurface.getAttribute('role');
const richEditorChanged = richSurface.innerHTML !== richEditorHtmlBefore;
const richCommandPressed = richCommand.hasAttribute('aria-pressed');

const markdownEditorPanelRoot = await showComponent('#component-markdown-editor');
const markdownEditor = markdownEditorPanelRoot.querySelector('[data-uzu-markdown-editor]');
const markdownEditorGuideText = markdownEditorPanelRoot.querySelector('.uzu-doc-guidance')?.textContent || '';
const markdownSource = markdownEditor.querySelector('[data-uzu-markdown-source]');
const markdownPreview = markdownEditor.querySelector('[data-uzu-markdown-preview]');
markdownSource.value = '## Updated';
markdownSource.dispatchEvent(new Event('input', { bubbles: true }));
await wait(100);
const markdownEditorHeading = markdownPreview.querySelector('h2')?.textContent.trim() || '';
const markdownFence = String.fromCharCode(96, 96, 96);
const markdownLineBreak = String.fromCharCode(10);
markdownSource.value = markdownFence + 'html' + markdownLineBreak + '<button class="uzu-button">Save</button>' + markdownLineBreak + markdownFence;
markdownSource.dispatchEvent(new Event('input', { bubbles: true }));
await wait(100);
const markdownEditorCopyInitialized = markdownPreview.querySelector('[data-uzu-code-copy]')?.dataset.uzuCodeCopyInitialized === 'true';
markdownSource.value = '  ' + markdownFence + 'js' + markdownLineBreak + 'const ready = true;' + markdownLineBreak + '  ' + markdownFence;
markdownSource.dispatchEvent(new Event('input', { bubbles: true }));
await wait(100);
const markdownIndentedCodeBlockReady = markdownPreview.querySelector('.uzu-code-block code')?.textContent.includes('const ready = true;') || false;
const codeEditorPanelRoot = await showComponent('#component-code-editor');
const codeEditorGuideText = codeEditorPanelRoot.querySelector('.uzu-doc-guidance')?.textContent || '';
const codeEditor = codeEditorPanelRoot.querySelector('.uzu-code-editor');
const codeEditorStyle = getComputedStyle(codeEditor);
const codeEditorUsesProjectMono = codeEditorStyle.fontFamily === getComputedStyle(document.querySelector('.uzu-code')).fontFamily;
const codeEditorWidth = rect(codeEditor).width;
const codeEditorPanelWidth = rect(codeEditorPanelRoot.querySelector('.uzu-doc-example')).width;

const plainEditorPanelRoot = await showComponent('#component-plain-editor');
const plainEditor = plainEditorPanelRoot.querySelector('.uzu-plain-editor');
const plainEditorStyle = getComputedStyle(plainEditor);
const plainEditorUsesSerif = plainEditorStyle.fontFamily.toLowerCase().includes('serif');

const inlineEditorPanelRoot = await showComponent('#component-inline-editor');
const inlineEditor = inlineEditorPanelRoot.querySelector('[data-uzu-inline-editor]');
let inlineEditorChangeFired = false;
inlineEditor.addEventListener('uzu-inline-editor-change', () => { inlineEditorChangeFired = true; }, { once: true });
inlineEditor.textContent = 'Renamed item';
inlineEditor.dispatchEvent(new Event('input', { bubbles: true }));
await wait(80);
const inlineEditorRole = inlineEditor.getAttribute('role');
const inlineEditorContentEditable = inlineEditor.getAttribute('contenteditable');
`;
