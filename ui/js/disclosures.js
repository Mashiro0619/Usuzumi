  function parseLengthValue(value) {
    return Number.parseFloat(value) || 0;
  }

  function syncDisclosurePanelHeight(panel) {
    if (!panel) return;
    const style = window.getComputedStyle(panel);
    const targetPadding = parseLengthValue(style.getPropertyValue('--uzu-disclosure-panel-block-end-padding'));
    const currentPadding = parseLengthValue(style.paddingBottom);
    panel.style.setProperty('--uzu-disclosure-panel-height', `${panel.scrollHeight + Math.max(0, targetPadding - currentPadding)}px`);
  }

  function setDisclosureState(disclosure, open, emit = true) {
    const trigger = disclosure.querySelector('[data-uzu-disclosure-trigger]');
    const panel = disclosure.querySelector('[data-uzu-disclosure-panel]');
    const existingTimer = disclosureCloseTimers.get(disclosure);
    if (existingTimer) {
      window.clearTimeout(existingTimer);
      disclosureCloseTimers.delete(disclosure);
    }
    if (trigger) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      disclosure.classList.remove('is-closing');
      if (panel) panel.hidden = false;
      syncDisclosurePanelHeight(panel);
      disclosure.classList.add('is-open');
    } else {
      if (disclosure.classList.contains('is-open')) {
        syncDisclosurePanelHeight(panel);
        disclosure.classList.remove('is-open');
        disclosure.classList.add('is-closing');
        const finish = () => {
          disclosure.classList.remove('is-closing');
          if (panel) panel.hidden = true;
          disclosureCloseTimers.delete(disclosure);
        };
        const timer = scheduleAfterAnimation([panel].filter(Boolean), finish);
        if (timer) disclosureCloseTimers.set(disclosure, timer);
      } else {
        disclosure.classList.remove('is-closing');
        if (panel) panel.hidden = true;
      }
    }
    if (emit) {
      disclosure.dispatchEvent(new CustomEvent('uzu-disclosure-change', {
        bubbles: true,
        detail: { open, disclosure }
      }));
      disclosure.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function initDisclosures(root = document) {
    queryAll(root, '[data-uzu-disclosure]').forEach((disclosure) => {
      const trigger = disclosure.querySelector('[data-uzu-disclosure-trigger]');
      const panel = disclosure.querySelector('[data-uzu-disclosure-panel]');
      if (!trigger || !panel) return;
      const panelId = ensureId(panel, 'uzu-disclosure-panel');
      trigger.setAttribute('aria-controls', panelId);
      setDisclosureState(disclosure, disclosure.classList.contains('is-open') || trigger.getAttribute('aria-expanded') === 'true', false);
      if (!markInitialized(disclosure, 'Disclosure')) return;
      trigger.addEventListener('click', () => {
        setDisclosureState(disclosure, !disclosure.classList.contains('is-open'));
      });
    });
  }
