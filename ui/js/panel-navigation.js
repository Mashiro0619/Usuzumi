  function getPanelNavTarget(control) {
    return control.dataset.uzuPanelTarget || '';
  }

  function getPanelNavControl(root, target) {
    return getScopedControls(root, '[data-uzu-panel-target]', '[data-uzu-panel-nav]')
      .find((control) => getPanelNavTarget(control) === target);
  }

  function getPanelNavPanel(target) {
    if (!target) return null;
    try {
      return document.querySelector(target);
    } catch (_) {
      return null;
    }
  }

  function getPanelNavPanels(root, panel) {
    const panels = getScopedControls(root, '[data-uzu-panel-target]', '[data-uzu-panel-nav]')
      .map((item) => getPanelNavPanel(getPanelNavTarget(item)))
      .filter(Boolean);
    if (panels.length) return [...new Set(panels)];
    const selector = root.dataset.uzuPanelSelector || '.uzu-panel';
    const scope = root.closest(root.dataset.uzuPanelScope || '.uzu-scope, main, body') || root.parentElement || document;
    return queryAll(scope, selector).filter((item) => item === panel || item.parentElement === panel.parentElement);
  }

  function showPanelNavTarget(root, control, options = {}) {
    const target = getPanelNavTarget(control);
    if (!target || isControlDisabled(control)) return null;
    const panel = getPanelNavPanel(target);
    if (!panel) return null;
    const controls = getScopedControls(root, '[data-uzu-panel-target]', '[data-uzu-panel-nav]');
    controls.forEach((item) => {
      const isActive = item === control;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    getPanelNavPanels(root, panel).forEach((item) => {
      item.hidden = item !== panel;
    });
    if (options.updateHash && window.location.hash !== target) {
      window.history.pushState(null, '', target);
    }
    root.dispatchEvent(new CustomEvent('uzu-panel-nav-change', {
      bubbles: true,
      detail: { target, control, panel, nav: root }
    }));
    panel.dispatchEvent(new CustomEvent('uzu-panel-show', {
      bubbles: true,
      detail: { target, control, panel, nav: root }
    }));
    queueIndicatorRefresh(panel, true);
    return panel;
  }

  function syncStepNavState(stepNav, activeButton, emit = true) {
    const buttons = getScopedControls(stepNav, '.uzu-step-nav-button', '[data-uzu-step-nav]');
    const enabled = getEnabledControls(buttons);
    const nextButton = activeButton && !isControlDisabled(activeButton) ? activeButton : enabled[0];
    if (!nextButton) return;
    const previousValue = stepNav.dataset.uzuStepNavValue || '';
    const value = getControlValue(nextButton, 'uzuStepValue');
    let reachedActive = false;
    buttons.forEach((button) => {
      const isActive = button === nextButton;
      if (isActive) reachedActive = true;
      button.classList.toggle('is-active', isActive);
      button.classList.toggle('is-complete', !reachedActive && !isControlDisabled(button));
      if (isActive) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    stepNav.dataset.uzuStepNavValue = value;
    if (emit && value !== previousValue) {
      stepNav.dispatchEvent(new CustomEvent('uzu-step-nav-change', {
        bubbles: true,
        detail: { value, step: nextButton, stepNav, index: buttons.indexOf(nextButton) }
      }));
      stepNav.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function initStepNavs(root = document) {
    queryAll(root, '[data-uzu-step-nav]').forEach((stepNav) => {
      const buttons = getScopedControls(stepNav, '.uzu-step-nav-button', '[data-uzu-step-nav]');
      if (!buttons.length) return;
      const active = buttons.find((button) => button.classList.contains('is-active') || button.getAttribute('aria-current') === 'step');
      syncStepNavState(stepNav, active, false);
      if (!markInitialized(stepNav, 'StepNav')) return;
      stepNav.addEventListener('click', (event) => {
        const button = getScopedEventControl(event, '.uzu-step-nav-button', stepNav, '[data-uzu-step-nav]');
        if (!button || isControlDisabled(button)) return;
        syncStepNavState(stepNav, button);
      });
      stepNav.addEventListener('keydown', (event) => {
        const button = getScopedEventControl(event, '.uzu-step-nav-button', stepNav, '[data-uzu-step-nav]');
        if (!button || isControlDisabled(button)) return;
        let next = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = moveActiveControl(buttons, button, 1);
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = moveActiveControl(buttons, button, -1);
        else if (event.key === 'Home') next = getEnabledControls(buttons)[0];
        else if (event.key === 'End') next = getEnabledControls(buttons).at(-1);
        if (next) {
          event.preventDefault();
          syncStepNavState(stepNav, next);
          next.focus();
        }
      });
    });
  }

  function showPanelNavFromHash(root) {
    const target = window.location.hash;
    if (!target) return false;
    const control = getPanelNavControl(root, target);
    if (!control) return false;
    showPanelNavTarget(root, control);
    return true;
  }

  function initPanelNavs(root = document) {
    queryAll(root, '[data-uzu-panel-nav]').forEach((nav) => {
      const controls = getScopedControls(nav, '[data-uzu-panel-target]', '[data-uzu-panel-nav]');
      if (!controls.length) return;
      const openedFromHash = nav.dataset.uzuPanelHash === 'true' && showPanelNavFromHash(nav);
      if (!openedFromHash) {
        const active = controls.find((control) => control.classList.contains('is-active') || control.getAttribute('aria-pressed') === 'true') || controls[0];
        showPanelNavTarget(nav, active);
      }

      if (!markInitialized(nav, 'PanelNav')) return;
      nav.addEventListener('click', (event) => {
        const control = getScopedEventControl(event, '[data-uzu-panel-target]', nav, '[data-uzu-panel-nav]');
        if (!control) return;
        showPanelNavTarget(nav, control, { updateHash: nav.dataset.uzuPanelHash === 'true' });
      });
      if (nav.dataset.uzuPanelHash === 'true') {
        const listener = () => showPanelNavFromHash(nav);
        panelNavHashListeners.set(nav, listener);
        window.addEventListener('hashchange', listener);
      }
    });
  }
