export const browserExpressionSetup = `
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const events = [];
let clipboardText = '';
try {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: async (value) => {
        clipboardText = value;
      }
    }
  });
} catch (_) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText = async (value) => {
      clipboardText = value;
    };
  }
}
if (!navigator.clipboard?.writeText) {
  navigator.clipboard = {
    writeText: async (value) => {
      clipboardText = value;
    }
  };
}
const originalExecCommand = document.execCommand?.bind(document);
document.execCommand = (command, ...args) => {
  if (String(command).toLowerCase() === 'copy') {
    const active = document.activeElement;
    clipboardText = active && 'value' in active ? active.value : String(window.getSelection?.() || '');
    return true;
  }
  return originalExecCommand ? originalExecCommand(command, ...args) : false;
};
const themeToggle = document.querySelector('#consumer-theme-toggle');
const pageWidthTarget = document.querySelector('#consumer-page-width');
const pageWidth = pageWidthTarget.getBoundingClientRect().width;
pageWidthTarget.style.setProperty('--uzu-page-max-width', '520px');
const pageWidthCustom = pageWidthTarget.getBoundingClientRect().width;
const tabs = document.querySelector('[data-uzu-tabs]');
const segmented = document.querySelector('[data-uzu-segmented]');
const paginationRoot = document.querySelector('#consumer-pagination');
const select = document.querySelector('[data-uzu-select]');
const selectTrigger = document.querySelector('[data-uzu-select-trigger]');
const selectMenu = document.querySelector('.uzu-select-menu');
const combobox = document.querySelector('#consumer-combobox');
const comboboxInput = combobox.querySelector('[data-uzu-combobox-input]');
const comboboxList = combobox.querySelector('[data-uzu-combobox-list]');
const dataGrid = document.querySelector('#consumer-data-grid');
const plainDataGrid = document.querySelector('#consumer-data-grid-plain');
const tree = document.querySelector('#consumer-tree');
const splitPane = document.querySelector('#consumer-split-pane');
const splitResizer = splitPane.querySelector('[data-uzu-split-resizer]');
const resizable = document.querySelector('#consumer-resizable');
const resizableHandle = resizable.querySelector('[data-uzu-resizable-handle]');
const jsonViewer = document.querySelector('#consumer-json-viewer');
const diffViewer = document.querySelector('#consumer-diff-viewer');
const richEditor = document.querySelector('#consumer-rich-editor');
const markdownEditor = document.querySelector('#consumer-markdown-editor');
const markdownEditorSource = markdownEditor.querySelector('[data-uzu-markdown-source]');
const markdownEditorPreview = markdownEditor.querySelector('[data-uzu-markdown-preview]');
const markdownEditorShell = document.querySelector('#consumer-markdown-editor-shell');
const markdownEditorShellSource = markdownEditorShell.querySelector('[data-uzu-markdown-source]');
const markdownEditorShellPreview = markdownEditorShell.querySelector('[data-uzu-markdown-preview]');
const inlineEditor = document.querySelector('#consumer-inline-editor');
const disclosure = document.querySelector('[data-uzu-disclosure]');
const disclosureTrigger = document.querySelector('[data-uzu-disclosure-trigger]');
const disclosurePanel = document.querySelector('[data-uzu-disclosure-panel]');
const search = document.querySelector('#consumer-search');
const searchInput = document.querySelector('#consumer-search-input');
const searchClear = search.querySelector('[data-uzu-search-clear]');
const password = document.querySelector('#consumer-password');
const passwordInput = document.querySelector('#consumer-password-input');
const passwordToggle = password.querySelector('[data-uzu-password-toggle]');
const stepper = document.querySelector('#consumer-stepper');
const stepperInput = document.querySelector('#consumer-stepper-input');
const stepperIncrement = stepper.querySelector('[data-uzu-stepper-increment]');
const newEvents = [];
const menu = document.querySelector('#consumer-menu');
const menuTrigger = menu.querySelector('[data-uzu-menu-trigger]');
const menuContent = menu.querySelector('[data-uzu-menu-content]');
const menuRename = menu.querySelector('[data-uzu-menu-value="rename"]');
const contextMenu = document.querySelector('#consumer-context-menu');
const contextTarget = document.querySelector('#consumer-context-target');
const contextContent = contextMenu.querySelector('[data-uzu-menu-content]');
const menubar = document.querySelector('#consumer-menubar');
const command = document.querySelector('#consumer-command');
const commandInput = command.querySelector('[data-uzu-command-input]');
const accordion = document.querySelector('#consumer-accordion');
const stepNav = document.querySelector('#consumer-step-nav');
const hoverCard = document.querySelector('#consumer-hover-card');
const tagSelectable = document.querySelector('#consumer-tag-selectable');
const tagCloseable = document.querySelector('#consumer-tag-closeable');
menu.addEventListener('uzu-menu-select', (event) => newEvents.push('menu:' + event.detail.value));
contextMenu.addEventListener('uzu-menu-select', (event) => newEvents.push('context:' + event.detail.value));
menubar.addEventListener('uzu-menubar-change', (event) => newEvents.push('menubar:' + event.detail.value));
command.addEventListener('uzu-command-filter', (event) => newEvents.push('command-filter:' + event.detail.visibleCount));
command.addEventListener('uzu-command-select', (event) => newEvents.push('command:' + event.detail.value));
combobox.addEventListener('uzu-combobox-change', (event) => newEvents.push('combobox:' + event.detail.value));
dataGrid.addEventListener('uzu-data-grid-sort', (event) => newEvents.push('grid-sort:' + event.detail.direction));
dataGrid.addEventListener('uzu-data-grid-select', (event) => newEvents.push('grid-select:' + event.detail.value));
plainDataGrid.addEventListener('uzu-data-grid-select', (event) => newEvents.push('plain-grid-select:' + event.detail.value));
tree.addEventListener('uzu-tree-toggle', (event) => newEvents.push('tree-toggle:' + event.detail.expanded));
splitPane.addEventListener('uzu-split-resize', (event) => newEvents.push('split:' + Math.round(event.detail.size)));
resizable.addEventListener('uzu-resizable-resize', () => newEvents.push('resizable'));
richEditor.addEventListener('uzu-editor-command', (event) => newEvents.push('editor:' + event.detail.command));
richEditor.addEventListener('uzu-editor-change', () => newEvents.push('editor-change'));
markdownEditor.addEventListener('uzu-markdown-editor-change', () => newEvents.push('markdown-editor-change'));
markdownEditor.addEventListener('uzu-markdown-editor-render', () => newEvents.push('markdown-editor'));
markdownEditorShell.addEventListener('uzu-markdown-editor-change', () => newEvents.push('markdown-shell-change'));
inlineEditor.addEventListener('uzu-inline-editor-change', () => newEvents.push('inline-editor'));
accordion.addEventListener('uzu-accordion-change', (event) => newEvents.push('accordion:' + event.detail.open));
stepNav.addEventListener('uzu-step-nav-change', (event) => newEvents.push('step-nav:' + event.detail.value));
hoverCard.addEventListener('uzu-hover-card-open', () => newEvents.push('hover:open'));
tagSelectable.addEventListener('uzu-tag-change', (event) => newEvents.push('tag:' + event.detail.selected));
tagCloseable.addEventListener('uzu-tag-close', (event) => newEvents.push('tag-close:' + event.detail.value));
tabs.addEventListener('uzu-tabs-change', (event) => events.push(event.detail.value));
segmented.addEventListener('uzu-segmented-change', (event) => events.push(event.detail.value));
paginationRoot.addEventListener('uzu-pagination-change', (event) => events.push('page:' + event.detail.value));
password.addEventListener('uzu-password-toggle', (event) => events.push('password:' + event.detail.visible));
stepper.addEventListener('uzu-stepper-change', (event) => events.push('stepper:' + event.detail.value));
`;
