function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function checkPageChromeMetrics(metrics, label) {
assert(!metrics.hasHorizontalOverflow, `${label}: page has horizontal overflow`);
assert(metrics.demoBeforeGuide, `${label}: component demo should appear before the tutorial/configuration block`);
if (metrics.viewportWidth <= 520) {
  assert(metrics.docSidebarHeight <= 72, `${label}: component navigation takes too much vertical space`);
  assert(metrics.activePanelTop < metrics.viewportHeight * 0.56, `${label}: active component content starts too low on small screens`);
} else {
  assert(metrics.floatingControlGap >= 8, `${label}: floating controls overlap the top navigation`);
}
assert(metrics.hashNavigationOpenedPanel, `${label}: component hash navigation did not open the requested panel`);
assert(metrics.toastWidth <= Math.min(362, metrics.viewportWidth - 32), `${label}: toast is too wide`);
assert(Math.abs(metrics.toastCloseRight - metrics.toastContentRight) <= 1, `${label}: toast close button is not aligned to content`);
assert(metrics.toastPaddingBalance <= 1, `${label}: toast horizontal padding is unbalanced`);
assert(metrics.fieldLabelToInputGap >= 4 && metrics.fieldLabelToInputGap <= 8, `${label}: label/input gap is outside the expected range`);
assert(Math.abs(metrics.segmentedIndicatorWidth - metrics.segmentedActiveWidth) <= 1, `${label}: segmented indicator does not match the active item`);
assert(Math.abs(metrics.segmentedIndicatorWidthAfterLanguage - metrics.segmentedActiveWidthAfterLanguage) <= 1, `${label}: segmented indicator did not refresh after language change`);
assert(Math.abs(metrics.tabsIndicatorWidthAfterLanguage - metrics.tabsActiveWidthAfterLanguage) <= 1, `${label}: tabs indicator did not refresh after language change`);
assert(metrics.footerIconWidth >= 13 && metrics.footerIconHeight >= 13, `${label}: GitHub icon is too small`);
assert(Math.abs(metrics.footerIconWidth - metrics.footerIconHeight) <= 1, `${label}: GitHub icon is distorted`);
assert(metrics.docBrandFontSize >= 16 && metrics.docBrandFontSize <= 20, `${label}: component-page brand size is outside the compact override range`);
assert(metrics.publicInterfaceCount >= 1, `${label}: component details do not expose public interface sections`);
assert(metrics.guideCount >= metrics.publicInterfaceCount, `${label}: component details do not expose guide sections`);
assert(metrics.guideBeforeInterface, `${label}: component guide and configuration should be stacked vertically`);
assert(metrics.interfaceUsesTable, `${label}: configurable parts should render as a table`);
assert(metrics.interfaceTableContained, `${label}: configurable table should stay inside its scroll container`);
assert(metrics.interfaceExamplesDoNotInlineScroll, `${label}: configurable examples should wrap instead of showing inline scrollbars`);
assert(metrics.buttonPresetExamplesComplete, `${label}: configurable presets should show every preset with examples`);
assert(metrics.pageInterfaceHasExampleParameters, `${label}: configurable variables/scopes should show example parameters`);
assert(metrics.newComponentPanelsAvailable, `${label}: first-stage component panels are missing`);
assert(metrics.phaseTwoThreePanelsAvailable, `${label}: second/third-stage component panels are missing`);
assert(metrics.phaseFourPanelsAvailable, `${label}: fourth-stage component panels are missing`);
assert(metrics.guideHasUsageLabels, `${label}: component guide does not expose usage labels`);
}

function checkComponentInteractionMetrics(metrics, label) {
assert(metrics.comboboxValue === 'tree' && metrics.comboboxVisibleCount === 1 && metrics.comboboxClosedAfterSelect, `${label}: combobox demo did not filter/select/close`);
assert(metrics.dataGridFirstCell === 'Draft' && metrics.dataGridSelectedValue === 'draft', `${label}: data grid demo did not sort/select`);
assert(metrics.treeClosed && metrics.treeOpened && metrics.treeKeyboardFocusValue === 'tokens', `${label}: tree demo did not expand/collapse/focus`);
assert(metrics.splitPaneSize === '58' && metrics.resizableWidth >= 300, `${label}: split/resizable demos did not resize`);
assert(metrics.jsonCollapsed && metrics.diffRowsReady, `${label}: JSON or diff viewer demo did not render`);
}

function checkEditorDemoMetrics(metrics, label) {
assert(metrics.richEditorRole === 'textbox' && metrics.richEditorCommandFired && metrics.richEditorCommandDetailValid && metrics.richEditorChangeFired && metrics.richEditorChanged && metrics.richCommandPressed, `${label}: rich text editor shell did not emit command/change events`);
assert(metrics.richEditorGuideHasBridgeCode, `${label}: rich text editor guide is missing external editor bridge code`);
assert(metrics.markdownEditorHeading === 'Updated' && metrics.markdownEditorCopyInitialized && metrics.markdownIndentedCodeBlockReady, `${label}: markdown editor demo did not render code blocks correctly`);
assert(metrics.markdownEditorGuideHasParserCode, `${label}: markdown editor guide is missing external parser wiring`);
assert(metrics.codeEditorUsesProjectMono && metrics.codeEditorWidth <= metrics.codeEditorPanelWidth, `${label}: code editor demo is missing code styling or overflows`);
assert(metrics.codeEditorGuideHasExternalContainer, `${label}: code editor guide is missing external editor container guidance`);
assert(metrics.plainEditorUsesSerif, `${label}: plain text editor demo is missing plain prose styling`);
assert(metrics.inlineEditorRole === 'textbox' && metrics.inlineEditorContentEditable === 'true' && metrics.inlineEditorChangeFired, `${label}: inline editor demo did not initialize or emit changes`);
}

function checkFormNavigationFeedbackMetrics(metrics, label) {
assert(metrics.passwordTypeAfterToggle === 'text' && metrics.passwordPressedAfterToggle === 'true', `${label}: password demo did not toggle visibility`);
assert(metrics.stepperValueAfterIncrement === '4', `${label}: stepper demo did not increment`);
assert(metrics.stepperInputAppearance !== 'auto', `${label}: stepper input is still using the native number spinner appearance`);
assert(metrics.sliderInitialValue === '64%' && metrics.sliderValueAfterInput === '20%', `${label}: slider did not expose/update its filled track value`);
assert(metrics.skeletonDarkContrast >= 24 && metrics.skeletonHasShimmer, `${label}: skeleton is too subtle in dark mode`);
assert(metrics.sidebarPanelEvent === '#sidebar-demo-notes' && metrics.sidebarNotesVisible && metrics.sidebarHashBefore === metrics.sidebarHashAfter && !metrics.sidebarHasDocumentLink, `${label}: sidebar demo should switch in place without document links`);
assert(metrics.searchValueAfterClear === '' && metrics.searchClearHiddenAfterClear, `${label}: search demo did not clear`);
assert(metrics.menuOpenAnimation === 'uzu-menu-in' && metrics.menuSelectEventFired, `${label}: menu demo did not open/select`);
assert(metrics.commandVisibleCount === 1 && metrics.commandSelectEventFired, `${label}: command demo did not filter/select`);
assert(metrics.stepNavValue === 'finish' && metrics.stepNavCurrent === 'step', `${label}: step nav demo did not change`);
assert(!metrics.accordionFirstOpen && metrics.accordionSecondOpen, `${label}: accordion demo did not close the sibling panel`);
assert(metrics.drawerOpenAnimation === 'uzu-dialog-surface-in' && metrics.drawerOpenTransform === 'none', `${label}: drawer demo did not open correctly`);
assert(metrics.alertDialogRole === 'alertdialog' && metrics.alertDialogBorderLeftWidth === 6, `${label}: alert dialog demo is not wired correctly`);
assert(metrics.hoverCardOpen, `${label}: hover card demo did not open on focus`);
assert(metrics.tagChanged && metrics.tagClosed, `${label}: tag demo did not toggle and close`);
assert(metrics.spinnerAnimation === 'uzu-spin', `${label}: spinner animation is missing`);
assert(metrics.buttonInterfaceHasIconButton, `${label}: button detail is missing icon button interface coverage`);
assert(metrics.pageInterfaceHasWidthVariable, `${label}: page detail is missing page width variables`);
}

function checkLayoutRuntimeMetrics(metrics, label) {
assert(metrics.disclosureClosedHeight < metrics.disclosureOpenHeight - 16, `${label}: disclosure does not reduce height when collapsed`);
assert(metrics.disclosurePanelHiddenAfterClose, `${label}: disclosure panel is not hidden after closing`);
assert(metrics.dialogOpenAnimation === 'uzu-dialog-surface-in', `${label}: dialog open animation is missing`);
assert(metrics.dialogCloseAnimation === 'uzu-dialog-surface-out', `${label}: dialog close animation is missing`);
assert(metrics.dialogOpenTransform === 'none' && metrics.dialogCloseTransform === 'none', `${label}: dialog should not shift or scale while animating`);
assert(metrics.toolbarDisplay === 'flex', `${label}: toolbar layout is not active`);
assert(metrics.defaultButtonWidth > 60 && metrics.defaultButtonWidth < Math.min(180, metrics.viewportWidth - 32), `${label}: default button should keep intrinsic width`);
assert(metrics.toolbarButtonWidth > 40 && metrics.toolbarButtonWidth < Math.min(180, metrics.viewportWidth - 32), `${label}: toolbar button width is unstable`);
assert(metrics.paginationDisplay === 'flex', `${label}: pagination layout is not active`);
assert(metrics.pageButtonWidth >= 36 && metrics.pageButtonWidth < 80, `${label}: page button width is unstable`);
assert(metrics.paginationPage === '2' && metrics.paginationActiveText === '2', `${label}: pagination did not update active page`);
assert(metrics.paginationPanelTwoVisible, `${label}: pagination did not show the requested panel`);
assert(metrics.statDisplay === 'grid' && metrics.statValueFontSize === '34px', `${label}: stat styles are not active`);
assert(metrics.separatorHeight === 1, `${label}: separator height is wrong`);
assert(metrics.verticalSeparatorWidth === 1 && metrics.verticalSeparatorHeight === 24, `${label}: vertical separator geometry is wrong`);
assert(metrics.kbdHeight >= 24, `${label}: keyboard hint height is too small`);
assert(metrics.codeBlockWidth <= metrics.codePanelWidth + 1, `${label}: code block overflows its panel`);
assert(metrics.codePanelRight <= metrics.mainRight + 1, `${label}: code panel extends past the content column`);
assert(metrics.codeSnippetHasRuntimeState === false, `${label}: code snippet leaks runtime-only state`);
assert(metrics.selectSnippetHasRuntimeState === false, `${label}: select code snippet leaks runtime-only state`);
assert(metrics.comboboxSnippetHasRuntimeState === false, `${label}: combobox code snippet leaks runtime-only state`);
assert(metrics.jsonSnippetPreservesSource, `${label}: JSON viewer code snippet should show source JSON, not rendered DOM`);
}

export function checkMetrics(metrics, label) {
  checkPageChromeMetrics(metrics, label);
  checkComponentInteractionMetrics(metrics, label);
  checkEditorDemoMetrics(metrics, label);
  checkFormNavigationFeedbackMetrics(metrics, label);
  checkLayoutRuntimeMetrics(metrics, label);
}

export function checkEditorIntegrationMetrics(metrics, label) {
  assert(metrics.title.includes('外部编辑器接入指南') || metrics.title.includes('External Editor Integration'), `${label}: editor integration page title is missing`);
  assert(!metrics.hasHorizontalOverflow, `${label}: editor integration page has horizontal overflow`);
  assert(metrics.copyButtonsInitialized, `${label}: editor integration code copy buttons are not initialized`);
  assert(metrics.hasRichBridge, `${label}: editor integration page is missing rich editor bridge guidance`);
  assert(metrics.hasMarkdownBridge, `${label}: editor integration page is missing markdown bridge guidance`);
  assert(metrics.hasBoundaryTable, `${label}: editor integration page is missing the ownership table`);
}
