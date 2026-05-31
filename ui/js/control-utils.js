  function isControlDisabled(control) {
    return control.disabled || control.getAttribute('aria-disabled') === 'true' || control.classList.contains('is-disabled');
  }

  function getControlValue(control, datasetKey) {
    return control.dataset[datasetKey] ?? control.dataset.value ?? control.textContent.trim();
  }

  function getTabPanel(tab) {
    const target = tab.dataset.uzuTabTarget;
    if (target) {
      try {
        return document.querySelector(target);
      } catch (_) {
        return null;
      }
    }
    const panelId = tab.getAttribute('aria-controls');
    return panelId ? document.getElementById(panelId) : null;
  }

  function getEnabledControls(controls) {
    return controls.filter((control) => !isControlDisabled(control));
  }

  function getScopedControls(root, controlSelector, rootSelector) {
    return [...root.querySelectorAll(controlSelector)].filter((control) => control.closest(rootSelector) === root);
  }

  function getScopedEventControl(event, controlSelector, root, rootSelector) {
    if (!(event.target instanceof Element)) return null;
    const control = event.target.closest(controlSelector);
    return control && control.closest(rootSelector) === root ? control : null;
  }

  function moveActiveControl(controls, current, direction) {
    const enabled = getEnabledControls(controls);
    if (!enabled.length) return null;
    const currentIndex = Math.max(0, enabled.indexOf(current));
    return enabled[(currentIndex + direction + enabled.length) % enabled.length];
  }

  function parseTimeValue(value) {
    const item = String(value || '').trim();
    if (!item || item === '0s') return 0;
    return item.endsWith('ms') ? Number.parseFloat(item) : Number.parseFloat(item) * 1000;
  }

  function getAnimationDuration(element) {
    if (!element) return 0;
    const style = window.getComputedStyle(element);
    const durations = style.animationDuration.split(',').map(parseTimeValue);
    const delays = style.animationDelay.split(',').map(parseTimeValue);
    return Math.max(0, ...durations.map((duration, index) => duration + (delays[index] || 0)));
  }

  function scheduleAfterAnimation(elements, callback) {
    const duration = Math.max(0, ...elements.map(getAnimationDuration));
    if (!duration) {
      callback();
      return null;
    }
    return window.setTimeout(callback, duration + 30);
  }

  function holdIndicatorInstant(root) {
    root.dataset.uzuIndicatorInstant = 'true';
    if (indicatorInstantTimers.has(root)) window.clearTimeout(indicatorInstantTimers.get(root));
    indicatorInstantTimers.set(root, window.setTimeout(() => {
      delete root.dataset.uzuIndicatorInstant;
      indicatorInstantTimers.delete(root);
    }, 120));
  }

  function setControlIndicator(root, control, prefix, instant = false) {
    if (!control || !root.isConnected || control.offsetWidth <= 0 || control.offsetHeight <= 0) {
      root.dataset[prefix === 'tabs' ? 'uzuTabsIndicator' : 'uzuSegmentedIndicator'] = 'false';
      return;
    }
    if (instant) holdIndicatorInstant(root);
    const cssPrefix = prefix === 'tabs' ? 'uzu-tabs' : 'uzu-segmented';
    root.style.setProperty(`--${cssPrefix}-indicator-x`, `${control.offsetLeft}px`);
    root.style.setProperty(`--${cssPrefix}-indicator-width`, `${control.offsetWidth}px`);
    root.style.setProperty(`--${cssPrefix}-indicator-opacity`, '1');
    if (prefix === 'tabs') {
      root.style.setProperty('--uzu-tabs-indicator-y', `${control.offsetTop + control.offsetHeight - 1}px`);
      root.dataset.uzuTabsIndicator = 'true';
    } else {
      root.style.setProperty('--uzu-segmented-indicator-y', `${control.offsetTop}px`);
      root.style.setProperty('--uzu-segmented-indicator-height', `${control.offsetHeight}px`);
      root.dataset.uzuSegmentedIndicator = 'true';
    }
  }

  function refreshStateIndicators(root = document, instant = false) {
    queryAll(root, '[data-uzu-tabs]').forEach((tabsRoot) => {
      const activeTab = getScopedControls(tabsRoot, '.uzu-tab', '[data-uzu-tabs]')
        .find((tab) => tab.classList.contains('is-active') || tab.getAttribute('aria-selected') === 'true');
      if (activeTab) setControlIndicator(tabsRoot, activeTab, 'tabs', instant);
    });
    queryAll(root, '[data-uzu-segmented]').forEach((segmented) => {
      const activeSegment = getScopedControls(segmented, '.uzu-segment', '[data-uzu-segmented]')
        .find((segment) => segment.classList.contains('is-active') || segment.getAttribute('aria-pressed') === 'true');
      if (activeSegment) setControlIndicator(segmented, activeSegment, 'segmented', instant);
    });
  }

  function queueIndicatorRefresh(root = document, instant = false) {
    window.requestAnimationFrame(() => refreshStateIndicators(root, instant));
  }
