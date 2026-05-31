  function getDialog(selector) {
    try {
      return selector ? document.querySelector(selector) : null;
    } catch (_) {
      return null;
    }
  }

  function getFocusable(dialog) {
    return queryAll(dialog, 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')
      .filter((element) => element.offsetParent !== null || element === document.activeElement);
  }

  function emitDialogEvent(dialog, name, trigger = activeDialogTrigger) {
    dialog.dispatchEvent(new CustomEvent(name, {
      bubbles: true,
      detail: {
        dialog,
        overlay: dialog.closest('[data-uzu-dialog-overlay]'),
        trigger
      }
    }));
  }

  function getDialogIsolationRoot(dialog) {
    return dialog.closest('[data-uzu-dialog-overlay]') || dialog;
  }

  function getDialogInertSiblings(root) {
    const siblings = new Set();
    let node = root;
    while (node && node !== document.body && node.parentElement) {
      [...node.parentElement.children].forEach((child) => {
        if (child !== node && !child.contains(root)) siblings.add(child);
      });
      node = node.parentElement;
    }
    return [...siblings];
  }

  function lockDialogScroll() {
    if (dialogScrollLockState || !document.body) return;
    const body = document.body;
    const root = document.documentElement;
    const scrollbarWidth = Math.max(0, window.innerWidth - root.clientWidth);
    const bodyPaddingRight = window.getComputedStyle(body).paddingRight;
    const bodyPaddingValue = Number.parseFloat(bodyPaddingRight) || 0;
    dialogScrollLockState = {
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
      rootOverflow: root.style.overflow
    };
    root.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${bodyPaddingValue + scrollbarWidth}px`;
  }

  function unlockDialogScroll() {
    if (!dialogScrollLockState || !document.body) return;
    const body = document.body;
    const root = document.documentElement;
    body.style.overflow = dialogScrollLockState.bodyOverflow;
    body.style.paddingRight = dialogScrollLockState.bodyPaddingRight;
    root.style.overflow = dialogScrollLockState.rootOverflow;
    dialogScrollLockState = null;
  }

  function applyDialogIsolation(dialog) {
    if (dialogIsolationState && dialogIsolationState.dialog === dialog) return;
    restoreDialogIsolation();
    const root = getDialogIsolationRoot(dialog);
    const entries = getDialogInertSiblings(root).map((element) => ({
      element,
      hadInert: element.hasAttribute('inert'),
      ariaHidden: element.getAttribute('aria-hidden')
    }));
    entries.forEach(({ element }) => {
      element.setAttribute('inert', '');
      element.setAttribute('aria-hidden', 'true');
    });
    dialogIsolationState = { dialog, entries };
    lockDialogScroll();
  }

  function restoreDialogIsolation(dialog = null) {
    if (!dialogIsolationState || (dialog && dialogIsolationState.dialog !== dialog)) return;
    dialogIsolationState.entries.forEach(({ element, hadInert, ariaHidden }) => {
      if (!hadInert) element.removeAttribute('inert');
      if (ariaHidden === null) {
        element.removeAttribute('aria-hidden');
      } else {
        element.setAttribute('aria-hidden', ariaHidden);
      }
    });
    dialogIsolationState = null;
    unlockDialogScroll();
  }

  function openDialog(dialog, trigger = null) {
    if (!dialog) return;
    if (activeDialog && activeDialog !== dialog && !activeDialog.hidden) {
      closeDialog(activeDialog);
    }
    const existingTimer = dialogCloseTimers.get(dialog);
    if (existingTimer) {
      window.clearTimeout(existingTimer);
      dialogCloseTimers.delete(dialog);
    }
    activeDialog = dialog;
    activeDialogTrigger = trigger;
    const overlay = dialog.closest('[data-uzu-dialog-overlay]');
    if (overlay) overlay.hidden = false;
    dialog.hidden = false;
    if (overlay) {
      overlay.classList.remove('is-closing');
      overlay.classList.add('is-open');
    }
    dialog.classList.remove('is-closing');
    dialog.classList.add('is-open');
    dialog.setAttribute('role', dialog.getAttribute('role') || 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    if (!dialog.hasAttribute('tabindex')) dialog.setAttribute('tabindex', '-1');
    applyDialogIsolation(dialog);
    const focusable = getFocusable(dialog);
    (focusable[0] || dialog).focus();
    emitDialogEvent(dialog, 'uzu-dialog-open');
  }

  function closeDialog(dialog) {
    if (!dialog || dialog.classList.contains('is-closing') || dialog.hidden) return;
    const overlay = dialog.closest('[data-uzu-dialog-overlay]');
    dialog.classList.remove('is-open');
    dialog.classList.add('is-closing');
    if (overlay) {
      overlay.classList.remove('is-open');
      overlay.classList.add('is-closing');
    }
    const trigger = activeDialogTrigger;
    const finish = () => {
      dialog.classList.remove('is-closing');
      dialog.hidden = true;
      if (overlay) {
        overlay.classList.remove('is-closing');
        overlay.hidden = true;
      }
      restoreDialogIsolation(dialog);
      emitDialogEvent(dialog, 'uzu-dialog-close', trigger);
      if (activeDialog === dialog) {
        if (trigger && typeof trigger.focus === 'function') trigger.focus();
        activeDialog = null;
        activeDialogTrigger = null;
      }
      dialogCloseTimers.delete(dialog);
    };
    const timer = scheduleAfterAnimation([dialog, overlay].filter(Boolean), finish);
    if (timer) dialogCloseTimers.set(dialog, timer);
  }

  function initDialogs(root = document) {
    queryAll(root, '[data-uzu-dialog-target]').forEach((trigger) => {
      if (!markInitialized(trigger, 'DialogTrigger')) return;
      trigger.addEventListener('click', () => {
        openDialog(getDialog(trigger.dataset.uzuDialogTarget), trigger);
      });
    });

    queryAll(root, '[data-uzu-dialog-close]').forEach((trigger) => {
      if (!markInitialized(trigger, 'DialogClose')) return;
      trigger.addEventListener('click', () => {
        closeDialog(trigger.closest('[data-uzu-dialog]'));
      });
    });

    queryAll(root, '[data-uzu-dialog-overlay]').forEach((overlay) => {
      if (!markInitialized(overlay, 'DialogOverlay')) return;
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) closeDialog(overlay.querySelector('[data-uzu-dialog]'));
      });
    });
  }
