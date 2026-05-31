export function assertConsumerCloseEventResult(value) {
if (!value.dialogClosing || value.dialogHiddenWhileClosing || !value.overlayClosing) throw new Error('Browser consumer dialog did not stay visible while closing');
if (!value.secondDialogOpen || !value.focusedSecondDialog) throw new Error('Browser consumer second dialog did not open after the first dialog closed');
if (value.closeEventsBeforeAnimationEnd !== 0 || value.closeEventTriggerAfterAnimation !== 'first-trigger') throw new Error('Browser consumer dialog close event used the wrong trigger during overlapping dialog animation');
if (!value.destroyDialogHidden || !value.destroyOverlayHidden) throw new Error('Browser consumer destroy() should hide open dialogs and overlays');
if (JSON.stringify(value.events) !== JSON.stringify(['two', 'beta', 'page:2', 'password:true', 'stepper:3'])) throw new Error('Browser consumer events did not fire');
for (const expected of ['menu:rename', 'context:open', 'menubar:edit', 'command:theme', 'combobox:tree', 'grid-sort:ascending', 'grid-select:alpha', 'plain-grid-select:2', 'tree-toggle:false', 'split:58', 'resizable', 'editor:bold', 'editor-change', 'markdown-editor-change', 'markdown-editor', 'markdown-shell-change', 'inline-editor', 'accordion:true', 'step-nav:review', 'hover:open', 'tag:false', 'tag-close:filter']) {
  if (!value.newEvents.includes(expected)) throw new Error('Browser consumer new component event did not fire: ' + expected);
}
}
