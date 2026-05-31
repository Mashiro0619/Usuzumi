export const visualExpressionDataLayoutChecks = `const menuPanelRoot = await showComponent('#component-menu');
const menu = menuPanelRoot.querySelector('[data-uzu-menu]');
const menuTrigger = menu.querySelector('[data-uzu-menu-trigger]');
const menuContent = menu.querySelector('[data-uzu-menu-content]');
let menuSelectEventFired = false;
menu.addEventListener('uzu-menu-select', () => { menuSelectEventFired = true; }, { once: true });
click(menuTrigger);
await wait(80);
const menuOpenAnimation = getComputedStyle(menuContent).animationName;
click(menu.querySelector('.uzu-menu-item'));
await wait(80);

const commandPanelRoot = await showComponent('#component-command');
const command = commandPanelRoot.querySelector('[data-uzu-command]');
const commandInput = command.querySelector('[data-uzu-command-input]');
let commandSelectEventFired = false;
command.addEventListener('uzu-command-select', () => { commandSelectEventFired = true; }, { once: true });
commandInput.value = 'theme';
commandInput.dispatchEvent(new Event('input', { bubbles: true }));
await wait(80);
const commandVisibleCount = [...command.querySelectorAll('.uzu-command-item')].filter((item) => !item.hidden).length;
click(command.querySelector('[data-uzu-command-value="theme"]'));

const sidebarPanelRoot = await showComponent('#component-sidebar');
const sidebarNav = sidebarPanelRoot.querySelector('.uzu-sidebar [data-uzu-panel-nav]');
const sidebarNotesButton = sidebarPanelRoot.querySelector('[data-uzu-panel-target="#sidebar-demo-notes"]');
let sidebarPanelEvent = '';
sidebarNav.addEventListener('uzu-panel-nav-change', (event) => { sidebarPanelEvent = event.detail.target; }, { once: true });
const sidebarHashBefore = window.location.hash;
click(sidebarNotesButton);
await wait(80);
const sidebarHashAfter = window.location.hash;
const sidebarNotesVisible = !sidebarPanelRoot.querySelector('#sidebar-demo-notes').hidden;
const sidebarHasDocumentLink = Boolean(sidebarPanelRoot.querySelector('a[href$=".md"], a[href*=".md#"]'));

const comboboxPanelRoot = await showComponent('#component-combobox');
const combobox = comboboxPanelRoot.querySelector('[data-uzu-combobox]');
const comboboxInput = combobox.querySelector('[data-uzu-combobox-input]');
comboboxInput.value = 'tree';
comboboxInput.dispatchEvent(new Event('input', { bubbles: true }));
await wait(80);
const comboboxVisibleCount = [...combobox.querySelectorAll('[data-uzu-combobox-option]')].filter((item) => !item.hidden).length;
click(combobox.querySelector('[data-uzu-combobox-value="tree"]'));
await wait(80);
const comboboxValue = combobox.dataset.uzuComboboxValue;
const comboboxList = combobox.querySelector('[data-uzu-combobox-list]');
const comboboxClosedAfterSelect = comboboxList.hidden && !combobox.classList.contains('is-open') && comboboxInput.getAttribute('aria-expanded') === 'false';

const dataGridPanelRoot = await showComponent('#component-data-grid');
const dataGrid = dataGridPanelRoot.querySelector('[data-uzu-data-grid]');
click(dataGrid.querySelector('[data-uzu-grid-sort]'));
await wait(80);
const dataGridFirstCell = dataGrid.tBodies[0].rows[0].cells[0].textContent.trim();
click(dataGrid.querySelector('[data-uzu-grid-row="draft"]'));
const dataGridSelectedValue = dataGrid.querySelector('[aria-selected="true"]')?.dataset.uzuGridRow || '';

const treePanelRoot = await showComponent('#component-tree');
const tree = treePanelRoot.querySelector('[data-uzu-tree]');
const treeToggle = tree.querySelector('[data-uzu-tree-toggle]');
click(treeToggle);
await wait(80);
const treeClosed = tree.querySelector('.uzu-tree-group').hidden;
click(treeToggle);
await wait(80);
const treeOpened = !tree.querySelector('.uzu-tree-group').hidden;
const treeSelected = tree.querySelector('[data-uzu-tree-value="overview"]');
treeSelected.focus();
treeSelected.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
const treeKeyboardFocusValue = document.activeElement?.dataset.uzuTreeValue || '';

const splitPanePanelRoot = await showComponent('#component-split-pane');
const splitPane = splitPanePanelRoot.querySelector('[data-uzu-split-pane]');
window.Usuzumi.setSplitPaneSize(splitPane, 58);
const splitPaneSize = splitPane.dataset.uzuSplitSize;

const resizablePanelRoot = await showComponent('#component-resizable');
const resizable = resizablePanelRoot.querySelector('[data-uzu-resizable]');
window.Usuzumi.setResizableSize(resizable, 300, 150);
const resizableWidth = Math.round(resizable.getBoundingClientRect().width);

const jsonPanelRoot = await showComponent('#component-json-viewer');
const jsonToggle = jsonPanelRoot.querySelector('.uzu-json-toggle');
click(jsonToggle);
await wait(80);
const jsonCollapsed = jsonToggle.classList.contains('is-collapsed');

const diffPanelRoot = await showComponent('#component-diff-viewer');
const diffRowsReady = diffPanelRoot.querySelectorAll('.uzu-diff-line-add').length === 1 && diffPanelRoot.querySelectorAll('.uzu-diff-line-remove').length === 1;
`;
