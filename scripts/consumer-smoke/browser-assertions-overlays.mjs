export function assertConsumerOverlayResult(value) {
if (value.dialogOpenAnimation !== 'uzu-dialog-surface-in') throw new Error('Browser consumer dialog did not animate on open');
if (value.dialogCloseAnimation !== 'uzu-dialog-surface-out') throw new Error('Browser consumer dialog did not animate on close');
if (value.dialogOpenTransform !== 'none' || value.dialogCloseTransform !== 'none') throw new Error('Browser consumer dialog should not shift or scale while opening or closing');
if (!value.dialogBackgroundIsolated) throw new Error('Browser consumer dialog did not isolate background content');
if (!value.dialogOverlayInteractive) throw new Error('Browser consumer dialog isolated its own overlay');
if (!value.dialogScrollLocked) throw new Error('Browser consumer dialog did not lock page scroll');
if (!value.dialogIsolationRestored) throw new Error('Browser consumer dialog did not restore background content and scroll state');
if (value.drawerOpenAnimation !== 'uzu-dialog-surface-in' || value.drawerOpenTransform !== 'none' || value.drawerWidth !== 420) throw new Error('Browser consumer drawer behavior or width is wrong');
if (value.alertDialogRole !== 'alertdialog' || value.alertDialogBorderLeftWidth !== 6 || value.alertDialogAccentColor !== 'rgb(122, 77, 74)') throw new Error('Browser consumer alert dialog semantics or accent styling is wrong');
if (value.toastRole !== 'status' || value.toastLive !== 'polite' || value.toastAtomic !== 'true') throw new Error('Browser consumer toast live region attributes were not initialized');
if (Math.round(value.toastWidthDefault) !== 360) throw new Error('Browser consumer toast should use the default compact width');
if (Math.abs(value.toastContentRightDefault - value.toastCloseRightDefault) > 1) throw new Error('Browser consumer toast close button should align to the content boundary');
if (Math.abs((value.toastContentLeftDefault - value.toastLeftDefault) - (value.toastRightDefault - value.toastContentRightDefault)) > 1) throw new Error('Browser consumer toast should keep balanced left and right padding by default');
if (Math.abs(value.toastContentRightCustom - value.toastCloseRightCustom) > 1) throw new Error('Browser consumer toast custom boundary should keep the close button aligned');
if (value.toastContentRightDefault - value.toastContentRightCustom < 7) throw new Error('Browser consumer toast custom boundary variable did not change the content edge');
if (Math.round(value.toastCloseWidth) !== 28 || value.toastTitlePaddingRight < 40) throw new Error('Browser consumer toast close affordance should keep title text clear');
if (value.toastOpenTransform !== 'none' || value.toastCloseTransform !== 'none') throw new Error('Browser consumer toast should not shift or scale while opening or closing');
if (!value.tooltipTransform.startsWith('matrix(1, 0, 0, 1,') || !value.tooltipTransform.endsWith(', 0)')) throw new Error('Browser consumer tooltip should only keep its static centering transform');
if (!(value.tooltipZhWidth > value.tooltipZhHeight)) throw new Error('Browser consumer Chinese tooltip should render horizontally');
if (value.tooltipCustomDescription !== 'consumer-tooltip-custom-help' || !value.tooltipCustomHelpExists) throw new Error('Browser consumer tooltip with author-describedby did not preserve its external description');
if (!value.generatedDestroyDescriptionCreated || !value.generatedDestroyDescriptionRemoved || !value.generatedDestroyTooltipCleared) throw new Error('Browser consumer destroy() did not remove generated tooltip description state');
if (value.customDestroyTooltipDescription !== 'consumer-tooltip-external-destroy-help') throw new Error('Browser consumer destroy() removed an author-provided tooltip description');
if (!(value.gridTallCardHeight - value.gridToastHeight > 40)) throw new Error('Browser consumer toast should not stretch to match a tall grid sibling');
}
