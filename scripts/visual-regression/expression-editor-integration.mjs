export const editorIntegrationExpression = `(() => {
const title = document.querySelector('h1')?.textContent || '';
const copyButtons = [...document.querySelectorAll('[data-uzu-code-copy]')];
const codeText = [...document.querySelectorAll('.uzu-code-block-body')].map((block) => block.textContent).join('\\n');
return {
  title,
  hasHorizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth > 1,
  copyButtonsInitialized: copyButtons.length >= 4 && copyButtons.every((button) => button.dataset.uzuCodeCopyInitialized === 'true'),
  hasRichBridge: codeText.includes('uzu-editor-command') && (codeText.includes('editor.commands') || codeText.includes('editor.chain')),
  hasMarkdownBridge: codeText.includes('uzu-markdown-editor-change') && (codeText.includes('markdown.render') || codeText.includes('markdownIt.render')),
  hasBoundaryTable: Boolean(document.querySelector('.uzu-guide-table'))
};
})()`;
