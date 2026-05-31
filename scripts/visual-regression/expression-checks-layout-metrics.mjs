export const visualExpressionLayoutMetricChecks = `const toolbarPanel = await showComponent('#component-toolbar');
const toolbar = toolbarPanel.querySelector('.uzu-toolbar');
const toolbarButtonBox = rect(toolbar.querySelector('.uzu-button'));

const paginationPanel = await showComponent('#component-pagination');
const pagination = paginationPanel.querySelector('.uzu-pagination');
const pageButtonBox = rect(pagination.querySelector('.uzu-page-button[aria-current="page"]'));
const paginationPageTwo = pagination.querySelector('[data-uzu-page="2"]');

const statPanel = await showComponent('#component-stat');
const statStyle = getComputedStyle(statPanel.querySelector('.uzu-stat'));
const statValueStyle = getComputedStyle(statPanel.querySelector('.uzu-stat-value'));

const separatorPanel = await showComponent('#component-separator');
const separatorBox = rect(separatorPanel.querySelector('.uzu-separator'));
const verticalSeparatorBox = rect(separatorPanel.querySelector('.uzu-separator-vertical'));

const codePanel = await showComponent('#component-code');
const kbdBox = rect(codePanel.querySelector('.uzu-kbd'));

const disclosurePanelRoot = await showComponent('#component-disclosure');
const disclosure = disclosurePanelRoot.querySelector('[data-uzu-disclosure]');
const disclosureTrigger = disclosure.querySelector('[data-uzu-disclosure-trigger]');
const disclosurePanel = disclosure.querySelector('[data-uzu-disclosure-panel]');
const disclosureClosedHeight = rect(disclosure).height;

click(disclosureTrigger);
await wait(120);
const disclosureOpenHeight = rect(disclosure).height;
click(disclosureTrigger);
await wait(320);

click(paginationPageTwo);
await wait(80);
const paginationPanelTwo = paginationPanel.querySelector('[data-uzu-page-panel="2"]');
const paginationEventValue = pagination.dataset.uzuPaginationPage;

await showComponent('#component-dialog');
const dialogTrigger = document.querySelector('[data-uzu-dialog-target="#site-dialog"]');
const dialog = document.querySelector('#site-dialog');
click(dialogTrigger);
await wait(80);
const dialogOpenAnimation = getComputedStyle(dialog).animationName;
const dialogOpenTransform = getComputedStyle(dialog).transform;
click(dialog.querySelector('[data-uzu-dialog-close]'));
await wait(40);
const dialogCloseAnimation = getComputedStyle(dialog).animationName;
const dialogCloseTransform = getComputedStyle(dialog).transform;
const activeDocPanel = document.querySelector('.uzu-doc-panel:not([hidden])');
const activePanelBox = rect(activeDocPanel);
const docSidebarBox = rect('.uzu-doc-sidebar');
const activeDemoBox = rect(activeDocPanel?.querySelector('.uzu-doc-demo'));
const activeGuideBox = rect(activeDocPanel?.querySelector('.uzu-doc-guidance-block'));
const activeGuideInnerBox = rect(activeDocPanel?.querySelector('.uzu-doc-guidance'));
const activeInterfaceBox = rect(activeDocPanel?.querySelector('.uzu-doc-interface'));
const activeInterfaceTableWrapBox = rect(activeDocPanel?.querySelector('.uzu-doc-interface-table-wrap'));
const activeInterfaceTableBox = rect(activeDocPanel?.querySelector('.uzu-doc-interface-table'));
const demoBeforeGuide = Boolean(activeDemoBox && activeGuideBox && activeDemoBox.top < activeGuideBox.top);
const guideBeforeInterface = Boolean(activeGuideInnerBox && activeInterfaceBox && activeGuideInnerBox.bottom <= activeInterfaceBox.top);
const interfaceUsesTable = Boolean(activeDocPanel?.querySelector('.uzu-doc-interface-table th') && activeDocPanel?.querySelector('.uzu-doc-interface-table td'));
const interfaceTableContained = Boolean(
  activeInterfaceTableWrapBox
  && activeInterfaceTableBox
  && activeInterfaceTableWrapBox.right <= activePanelBox.right + 1
  && activeInterfaceTableWrapBox.width <= activePanelBox.width + 1
);
const floatingControlBox = rect('.uzu-floating-controls');
const topNavBox = rect('.uzu-doc-topbar .uzu-nav');
const floatingControlGap = floatingControlBox && topNavBox ? floatingControlBox.left - topNavBox.right : 999;
`;
