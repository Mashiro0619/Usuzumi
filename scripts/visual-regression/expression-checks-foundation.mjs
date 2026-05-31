export const visualExpressionFoundationChecks = `window.Usuzumi.applyLanguage(document.documentElement, 'zh');
await wait(80);

window.location.hash = '#component-tabs';
await wait(160);
const hashPanel = document.querySelector('#component-tabs');
const hashControl = document.querySelector('[data-uzu-panel-target="#component-tabs"]');
const hashNavigationOpenedPanel = Boolean(hashPanel && !hashPanel.hidden && hashControl?.getAttribute('aria-pressed') === 'true');

const toastPanel = await showComponent('#component-toast');
const toast = toastPanel.querySelector('.uzu-toast[data-uzu-toast]');
const toastBox = rect(toast);
const toastContentBox = rect(toast.querySelector('.uzu-toast-content'));
const toastCloseBox = rect(toast.querySelector('.uzu-toast-close'));

const fieldPanel = await showComponent('#component-input');
const field = fieldPanel.querySelector('.uzu-field');
const fieldLabelBox = rect(field.querySelector('.uzu-label'));
const fieldInputBox = rect(field.querySelector('.uzu-input'));

const segmentedPanel = await showComponent('#component-segmented');
const segmented = segmentedPanel.querySelector('[data-uzu-segmented]');
const activeSegment = segmented.querySelector('[aria-pressed="true"]');
const segmentedIndicator = getComputedStyle(segmented, '::before');
const segmentedIndicatorWidth = Number.parseFloat(segmentedIndicator.width);
const segmentedActiveWidth = activeSegment.getBoundingClientRect().width;
const footerIconBox = rect('.uzu-footer svg');
const docBrandFontSize = Number.parseFloat(getComputedStyle(document.querySelector('.uzu-doc-brand')).fontSize);

window.Usuzumi.applyLanguage(document.documentElement, 'en');
await wait(120);
const segmentedIndicatorAfterLanguage = getComputedStyle(segmented, '::before');
const segmentedIndicatorWidthAfterLanguage = Number.parseFloat(segmentedIndicatorAfterLanguage.width);
const segmentedActiveWidthAfterLanguage = activeSegment.getBoundingClientRect().width;

window.Usuzumi.applyLanguage(document.documentElement, 'zh');
await wait(80);
const tabsPanel = await showComponent('#component-tabs');
const tabs = tabsPanel.querySelector('.uzu-doc-preview [data-uzu-tabs]');
window.Usuzumi.applyLanguage(document.documentElement, 'en');
await wait(120);
const activeTab = tabs.querySelector('[aria-selected="true"]');
const tabsIndicatorAfterLanguage = getComputedStyle(tabs, '::after');
const tabsIndicatorWidthAfterLanguage = Number.parseFloat(tabsIndicatorAfterLanguage.width);
const tabsActiveWidthAfterLanguage = activeTab.getBoundingClientRect().width;
const tabsCodeControl = tabsPanel.querySelector('[data-uzu-tab-target="#component-tabs-code"]');
click(tabsCodeControl);
await wait(160);
const tabsCodePanel = tabsPanel.querySelector('#component-tabs-code');
const tabsCodeBlock = tabsCodePanel.querySelector('.uzu-code-block-body');
const tabsCodeText = tabsCodeBlock.textContent;
const tabsCodePanelBox = rect(tabsCodePanel);
const tabsCodeBlockBox = rect(tabsCodeBlock);
const componentMainBox = rect('.uzu-doc-main');
const codeSnippetHasRuntimeState = /data-uzu-(tabs|segmented)-(initialized|indicator|value)|role="tab(list)?"|tabindex=/.test(tabsCodeText);
const selectPanelRoot = await showComponent('#component-select');
const selectCodeControl = selectPanelRoot.querySelector('[data-uzu-tab-target="#component-select-code"]');
click(selectCodeControl);
await wait(160);
const selectCodeText = selectPanelRoot.querySelector('#component-select-code .uzu-code-block-body')?.textContent || '';
const selectSnippetHasRuntimeState = /data-uzu-select-(initialized|input|value)|id="uzu-select|aria-haspopup|aria-controls|aria-activedescendant|tabindex=/.test(selectCodeText);
const comboboxSnippetPanelRoot = await showComponent('#component-combobox');
const comboboxCodeControl = comboboxSnippetPanelRoot.querySelector('[data-uzu-tab-target="#component-combobox-code"]');
click(comboboxCodeControl);
await wait(160);
const comboboxCodeText = comboboxSnippetPanelRoot.querySelector('#component-combobox-code .uzu-code-block-body')?.textContent || '';
const comboboxSnippetHasRuntimeState = /data-uzu-combobox-(initialized|hidden)|id="uzu-combobox-(list|option)|aria-autocomplete|aria-expanded|aria-controls|aria-activedescendant|role="(combobox|listbox|option)"/.test(comboboxCodeText);
const jsonSnippetPanelRoot = await showComponent('#component-json-viewer');
const jsonCodeControl = jsonSnippetPanelRoot.querySelector('[data-uzu-tab-target="#component-json-viewer-code"]');
click(jsonCodeControl);
await wait(160);
const jsonCodeText = jsonSnippetPanelRoot.querySelector('#component-json-viewer-code .uzu-code-block-body')?.textContent || '';
const jsonSnippetPreservesSource = jsonCodeText.includes('"name": "Usuzumi"') && jsonCodeText.includes('data-uzu-json-viewer') && !jsonCodeText.includes('uzu-json-node');
const buttonPanel = await showComponent('#component-button');
const buttonInterfaceText = buttonPanel.querySelector('.uzu-doc-interface')?.textContent || '';
const buttonPresetExamplesComplete = ['.uzu-button-primary', '.uzu-button-ghost', '.uzu-button-danger', '.uzu-icon-button'].every((item) => buttonInterfaceText.includes(item))
  && buttonPanel.querySelectorAll('.uzu-doc-interface-example').length >= 4;
const defaultButtonBox = rect(buttonPanel.querySelector('.uzu-button'));
const pagePanelRoot = await showComponent('#component-page');
const pageInterfaceText = pagePanelRoot.querySelector('.uzu-doc-interface')?.textContent || '';
const pageInterfaceHasExampleParameters = pageInterfaceText.includes('--uzu-page-max-width: 1040px;')
  && pagePanelRoot.querySelectorAll('.uzu-doc-interface-example').length >= 2;
const interfaceExamplesDoNotInlineScroll = [...pagePanelRoot.querySelectorAll('.uzu-doc-interface-example')].every((item) => {
  const style = getComputedStyle(item);
  return style.overflowX !== 'auto' && item.scrollWidth <= item.clientWidth + 1;
});
const publicInterfaceCount = document.querySelectorAll('.uzu-doc-interface').length;
const guideCount = document.querySelectorAll('.uzu-doc-guidance').length;
const firstStageTargets = ['#component-form', '#component-input-group', '#component-search', '#component-password', '#component-file-upload', '#component-slider', '#component-stepper', '#component-layout-primitives'];
const newComponentPanelsAvailable = firstStageTargets.every((target) => Boolean(document.querySelector('[data-uzu-panel-target="' + target + '"]') && document.querySelector(target)));
const phaseTwoThreeTargets = ['#component-menu', '#component-menubar', '#component-command', '#component-sidebar', '#component-step-nav', '#component-list', '#component-tag', '#component-avatar', '#component-accordion', '#component-drawer', '#component-hover-card', '#component-alert-dialog', '#component-empty-error'];
const phaseTwoThreePanelsAvailable = phaseTwoThreeTargets.every((target) => Boolean(document.querySelector('[data-uzu-panel-target="' + target + '"]') && document.querySelector(target)));
const phaseFourTargets = ['#component-combobox', '#component-data-grid', '#component-tree', '#component-split-pane', '#component-resizable', '#component-json-viewer', '#component-diff-viewer', '#component-rich-editor', '#component-markdown-editor', '#component-code-editor', '#component-plain-editor', '#component-inline-editor'];
const phaseFourPanelsAvailable = phaseFourTargets.every((target) => Boolean(document.querySelector('[data-uzu-panel-target="' + target + '"]') && document.querySelector(target)));
const menuGuideText = document.querySelector('#component-menu .uzu-doc-guidance')?.textContent || '';
const guideHasUsageLabels = ['使用教程', '基本结构'].every((label) => menuGuideText.includes(label));`;
