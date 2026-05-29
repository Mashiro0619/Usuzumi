(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  let selectCounter = 0;
  let activeDialog = null;
  let activeDialogTrigger = null;
  const selectCloseTimers = new WeakMap();
  const disclosureCloseTimers = new WeakMap();
  const dialogCloseTimers = new WeakMap();
  const toastCloseTimers = new WeakMap();
  const indicatorInstantTimers = new WeakMap();
  const codeCopyDefaultContent = new WeakMap();

  const storage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (_) {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (_) {
        /* localStorage can be unavailable in embedded previews. */
      }
    }
  };

  function fallbackCopyText(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.append(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return Promise.resolve();
    } finally {
      textarea.remove();
    }
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(() => fallbackCopyText(text));
    }
    return fallbackCopyText(text);
  }

  function queryAll(root, selector) {
    const scope = root || document;
    const matchesRoot = scope instanceof Element && scope.matches(selector) ? [scope] : [];
    return [...matchesRoot, ...scope.querySelectorAll(selector)];
  }

  function markInitialized(element, key) {
    const flag = `uzu${key}Initialized`;
    if (element.dataset[flag] === 'true') return false;
    element.dataset[flag] = 'true';
    return true;
  }

  function syncRootClass() {
    document.documentElement.classList.toggle('uzu-root', document.body && document.body.classList.contains('uzu-app'));
  }

  function getThemeRoot(trigger) {
    try {
      return document.querySelector(trigger.dataset.uzuThemeTarget) || document.documentElement;
    } catch (_) {
      return document.documentElement;
    }
  }

  function getThemeKey(root, trigger) {
    return root.dataset.uzuThemeKey || trigger?.dataset.uzuThemeKey || document.documentElement.dataset.uzuThemeKey || '';
  }

  function getThemeMode(value) {
    return ['auto', 'light', 'dark'].includes(value) ? value : '';
  }

  function getResolvedTheme(value) {
    return ['light', 'dark'].includes(value) ? value : '';
  }

  function getPreferredTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function resolveTheme(mode) {
    return mode === 'auto' ? getPreferredTheme() : mode;
  }

  function syncThemeToggles(root) {
    const mode = getThemeMode(root.getAttribute('data-theme-mode')) || getResolvedTheme(root.getAttribute('data-theme')) || 'light';
    const theme = getResolvedTheme(root.getAttribute('data-theme')) || resolveTheme(mode);
    queryAll(document, '[data-uzu-theme-toggle]').forEach((toggle) => {
      const target = getThemeRoot(toggle);
      if (target === root) {
        toggle.classList.toggle('is-auto', mode === 'auto');
        toggle.classList.toggle('is-dark', theme === 'dark');
        toggle.setAttribute('aria-label', `Theme: ${mode}, currently ${theme}`);
      }
    });
  }

  function applyTheme(root, mode, key, persist = true) {
    const themeMode = getThemeMode(mode) || 'light';
    const theme = resolveTheme(themeMode);
    root.setAttribute('data-theme-mode', themeMode);
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-uzu-theme', theme);
    if (persist && key) storage.set(key, themeMode);
    syncThemeToggles(root);
  }

  function getInitialThemeMode(root, key) {
    const saved = getThemeMode(key ? storage.get(key) : '');
    if (saved) return saved;
    const currentMode = getThemeMode(root.getAttribute('data-theme-mode'));
    if (currentMode) return currentMode;
    if (root.dataset.uzuThemeKey) return 'auto';
    return getResolvedTheme(root.getAttribute('data-theme')) || getPreferredTheme();
  }

  function getNextThemeMode(mode) {
    if (mode === 'light') return 'dark';
    if (mode === 'dark') return 'auto';
    return 'light';
  }

  function handleThemePreferenceChange() {
    const roots = new Set([document.documentElement]);
    queryAll(document, '[data-uzu-theme-toggle]').forEach((toggle) => {
      roots.add(getThemeRoot(toggle));
    });
    roots.forEach((root) => {
      if (getThemeMode(root.getAttribute('data-theme-mode')) === 'auto') {
        applyTheme(root, 'auto', getThemeKey(root), false);
      }
    });
  }

  function initThemePreferenceListener() {
    const media = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    if (!media || document.documentElement.dataset.uzuThemeMediaListener === 'true') return;
    if (media.addEventListener) {
      media.addEventListener('change', handleThemePreferenceChange);
    } else if (media.addListener) {
      media.addListener(handleThemePreferenceChange);
    }
    document.documentElement.dataset.uzuThemeMediaListener = 'true';
  }

  function initThemeToggles(root = document) {
    queryAll(root, '[data-uzu-theme-toggle]').forEach((toggle) => {
      const themeRoot = getThemeRoot(toggle);
      const key = getThemeKey(themeRoot, toggle);
      const savedMode = getThemeMode(key ? storage.get(key) : '');
      if (savedMode) {
        applyTheme(themeRoot, savedMode, key, false);
      } else if (themeRoot.hasAttribute('data-theme-mode')) {
        syncThemeToggles(themeRoot);
      } else {
        applyTheme(themeRoot, getInitialThemeMode(themeRoot, key), key);
      }
      if (!markInitialized(toggle, 'ThemeToggle')) return;
      toggle.addEventListener('click', () => {
        const current = getThemeMode(themeRoot.getAttribute('data-theme-mode')) || getResolvedTheme(themeRoot.getAttribute('data-theme')) || 'light';
        applyTheme(themeRoot, getNextThemeMode(current), key);
      });
    });
    initThemePreferenceListener();
  }

  function getLanguageRoot(toggle) {
    try {
      return document.querySelector(toggle.dataset.uzuLanguageTarget) || document.documentElement;
    } catch (_) {
      return document.documentElement;
    }
  }

  function applyLanguage(root, language, key) {
    root.setAttribute('data-language', language);
    root.setAttribute('data-uzu-lang', language);
    root.setAttribute('lang', language === 'zh' ? 'zh-CN' : 'en');
    if (key) storage.set(key, language);
    queryAll(document, '[data-uzu-language-toggle]').forEach((toggle) => {
      const target = getLanguageRoot(toggle);
      if (target === root) {
        toggle.textContent = language === 'en' ? 'ZH' : 'EN';
        toggle.setAttribute('aria-label', language === 'en' ? 'Switch to Chinese' : 'Switch to English');
      }
    });
    refreshStateIndicators(root, true);
    queueIndicatorRefresh(root, true);
  }

  function initLanguageToggles(root = document) {
    queryAll(root, '[data-uzu-language-toggle]').forEach((toggle) => {
      const languageRoot = getLanguageRoot(toggle);
      const key = toggle.dataset.uzuLanguageKey || 'usuzumi-language';
      applyLanguage(languageRoot, storage.get(key) || languageRoot.getAttribute('data-language') || 'zh', key);
      if (!markInitialized(toggle, 'LanguageToggle')) return;
      toggle.addEventListener('click', () => {
        const current = languageRoot.getAttribute('data-language') || 'zh';
        applyLanguage(languageRoot, current === 'zh' ? 'en' : 'zh', key);
      });
    });
  }

  function closeSelect(select) {
    if (select.classList.contains('is-closing') || !select.classList.contains('is-open')) return;
    select.classList.remove('is-open');
    select.classList.add('is-closing');
    queryAll(select, '[data-uzu-select-option]').forEach((option) => {
      option.classList.remove('is-active');
      option.setAttribute('tabindex', '-1');
    });
    const trigger = select.querySelector('[data-uzu-select-trigger]');
    if (trigger) {
      const selected = select.querySelector('[data-uzu-select-option].is-selected');
      trigger.setAttribute('aria-expanded', 'false');
      if (selected && selected.id) {
        trigger.setAttribute('aria-activedescendant', selected.id);
      } else {
        trigger.removeAttribute('aria-activedescendant');
      }
    }
    const menu = select.querySelector('[role="listbox"]');
    const finish = () => {
      select.classList.remove('is-closing');
      selectCloseTimers.delete(select);
    };
    const timer = scheduleAfterAnimation([menu].filter(Boolean), finish);
    if (timer) selectCloseTimers.set(select, timer);
  }

  function ensureId(element, prefix) {
    if (!element.id) {
      selectCounter += 1;
      element.id = `${prefix}-${selectCounter}`;
    }
    return element.id;
  }

  function focusSelectOption(select, index) {
    const options = queryAll(select, '[data-uzu-select-option]');
    const trigger = select.querySelector('[data-uzu-select-trigger]');
    if (!options.length) return;
    const nextIndex = (index + options.length) % options.length;
    options.forEach((option, optionIndex) => {
      const isActive = optionIndex === nextIndex;
      option.classList.toggle('is-active', isActive);
      option.setAttribute('tabindex', isActive ? '0' : '-1');
    });
    if (trigger && options[nextIndex].id) {
      trigger.setAttribute('aria-activedescendant', options[nextIndex].id);
    }
    options[nextIndex].focus();
  }

  function openSelect(select, focusIndex) {
    const trigger = select.querySelector('[data-uzu-select-trigger]');
    const options = queryAll(select, '[data-uzu-select-option]');
    const existingTimer = selectCloseTimers.get(select);
    if (existingTimer) {
      window.clearTimeout(existingTimer);
      selectCloseTimers.delete(select);
    }
    select.classList.remove('is-closing');
    select.classList.add('is-open');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    const selectedIndex = options.findIndex((option) => option.classList.contains('is-selected'));
    focusSelectOption(select, focusIndex ?? (selectedIndex >= 0 ? selectedIndex : 0));
  }

  function getSelectOptionLabelNodes(option) {
    const nodes = [...option.childNodes].filter((node) => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent.trim();
      return node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('data-lang');
    });
    return nodes.length ? nodes : [document.createTextNode(option.textContent.trim())];
  }

  function syncSelectTriggerLabel(trigger, option) {
    const labelRoot = trigger.querySelector('[data-uzu-select-label]') || trigger;
    labelRoot.replaceChildren(...getSelectOptionLabelNodes(option).map((node) => node.cloneNode(true)));
  }

  function getSelectOptionValue(option) {
    return option.dataset.uzuSelectValue ?? option.dataset.value ?? option.textContent.trim();
  }

  function getSelectOptionLabel(option) {
    return option.textContent.trim();
  }

  function getSelectInput(select) {
    let input = select.querySelector('input[type="hidden"][data-uzu-select-input]');
    const name = select.dataset.uzuSelectName || select.getAttribute('name') || input?.name || '';
    if (!input && name) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.setAttribute('data-uzu-select-input', '');
      select.append(input);
    }
    if (input && name) input.name = name;
    return input;
  }

  function syncSelectValue(select, option) {
    const value = getSelectOptionValue(option);
    const trigger = select.querySelector('[data-uzu-select-trigger]');
    const input = getSelectInput(select);
    select.dataset.uzuSelectValue = value;
    if (trigger) trigger.dataset.uzuSelectValue = value;
    if (input) input.value = value;
    return value;
  }

  function emitSelectChange(select, option, value) {
    select.dispatchEvent(new CustomEvent('uzu-select-change', {
      bubbles: true,
      detail: {
        value,
        label: getSelectOptionLabel(option),
        option,
        select
      }
    }));
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function chooseSelectOption(select, option) {
    const trigger = select.querySelector('[data-uzu-select-trigger]');
    const options = queryAll(select, '[data-uzu-select-option]');
    const previousValue = select.dataset.uzuSelectValue || getSelectInput(select)?.value || '';
    options.forEach((item) => {
      item.classList.remove('is-selected');
      item.setAttribute('aria-selected', 'false');
    });
    option.classList.add('is-selected');
    option.setAttribute('aria-selected', 'true');
    const value = syncSelectValue(select, option);
    if (trigger) {
      syncSelectTriggerLabel(trigger, option);
      closeSelect(select);
      trigger.focus();
    }
    if (value !== previousValue) emitSelectChange(select, option, value);
  }

  function initSelects(root = document) {
    queryAll(root, '[data-uzu-select]').forEach((select) => {
      const trigger = select.querySelector('[data-uzu-select-trigger]');
      const options = queryAll(select, '[data-uzu-select-option]');
      const menu = select.querySelector('[role="listbox"]');
      if (!trigger || !options.length) return;

      const selectId = ensureId(select, 'uzu-select');
      const menuId = menu ? ensureId(menu, `${selectId}-menu`) : '';
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');
      if (menuId) trigger.setAttribute('aria-controls', menuId);
      options.forEach((option, index) => {
        ensureId(option, `${selectId}-option-${index + 1}`);
        option.setAttribute('tabindex', '-1');
        option.setAttribute('aria-selected', option.classList.contains('is-selected') ? 'true' : 'false');
      });
      const selected = options.find((option) => option.classList.contains('is-selected'));
      if (selected) {
        trigger.setAttribute('aria-activedescendant', selected.id);
        syncSelectValue(select, selected);
      }

      if (!markInitialized(select, 'Select')) return;

      trigger.addEventListener('click', () => {
        if (trigger.disabled || trigger.getAttribute('aria-disabled') === 'true') return;
        if (select.classList.contains('is-open')) {
          closeSelect(select);
        } else {
          const selectedIndex = options.findIndex((option) => option.classList.contains('is-selected'));
          openSelect(select, selectedIndex >= 0 ? selectedIndex : 0);
        }
      });

      trigger.addEventListener('keydown', (event) => {
        if (trigger.disabled || trigger.getAttribute('aria-disabled') === 'true') return;
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
          event.preventDefault();
          const selectedIndex = options.findIndex((option) => option.classList.contains('is-selected'));
          const startIndex = event.key === 'ArrowUp' ? (selectedIndex >= 0 ? selectedIndex - 1 : options.length - 1) : (selectedIndex >= 0 ? selectedIndex : 0);
          openSelect(select, startIndex);
        }
      });

      options.forEach((option) => {
        option.addEventListener('mouseenter', () => {
          focusSelectOption(select, options.indexOf(option));
        });

        option.addEventListener('click', () => {
          chooseSelectOption(select, option);
        });

        option.addEventListener('keydown', (event) => {
          const currentIndex = options.indexOf(option);
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            focusSelectOption(select, currentIndex + 1);
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            focusSelectOption(select, currentIndex - 1);
          } else if (event.key === 'Home') {
            event.preventDefault();
            focusSelectOption(select, 0);
          } else if (event.key === 'End') {
            event.preventDefault();
            focusSelectOption(select, options.length - 1);
          } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            chooseSelectOption(select, option);
          } else if (event.key === 'Escape') {
            event.preventDefault();
            closeSelect(select);
            trigger.focus();
          }
        });
      });

      select.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          closeSelect(select);
          trigger.focus();
        }
      });
    });
  }

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

  function syncTabsState(tabsRoot, activeTab, emit = true) {
    const tabs = getScopedControls(tabsRoot, '.uzu-tab', '[data-uzu-tabs]');
    const enabled = getEnabledControls(tabs);
    const nextTab = activeTab && !isControlDisabled(activeTab) ? activeTab : enabled[0];
    if (!nextTab) return;
    const previousValue = tabsRoot.dataset.uzuTabsValue || '';
    const value = getControlValue(nextTab, 'uzuTabValue');
    let panel = null;

    if (!tabsRoot.hasAttribute('role')) tabsRoot.setAttribute('role', 'tablist');
    tabs.forEach((tab) => {
      const isActive = tab === nextTab;
      const tabPanel = getTabPanel(tab);
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.setAttribute('tabindex', isActive && !isControlDisabled(tab) ? '0' : '-1');
      if (tabPanel) tabPanel.hidden = !isActive;
      if (isActive) panel = tabPanel;
    });
    tabsRoot.dataset.uzuTabsValue = value;
    setControlIndicator(tabsRoot, nextTab, 'tabs');
    if (panel) queueIndicatorRefresh(panel, true);

    if (emit && value !== previousValue) {
      tabsRoot.dispatchEvent(new CustomEvent('uzu-tabs-change', {
        bubbles: true,
        detail: {
          value,
          tab: nextTab,
          tabs: tabsRoot,
          index: tabs.indexOf(nextTab),
          panel
        }
      }));
      tabsRoot.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function initTabs(root = document) {
    queryAll(root, '[data-uzu-tabs]').forEach((tabsRoot) => {
      const tabs = getScopedControls(tabsRoot, '.uzu-tab', '[data-uzu-tabs]');
      if (!tabs.length) return;
      const activeTab = tabs.find((tab) => tab.classList.contains('is-active') || tab.getAttribute('aria-selected') === 'true');
      syncTabsState(tabsRoot, activeTab, false);

      if (!markInitialized(tabsRoot, 'Tabs')) return;

      tabsRoot.addEventListener('click', (event) => {
        const tab = getScopedEventControl(event, '.uzu-tab', tabsRoot, '[data-uzu-tabs]');
        if (!tab || isControlDisabled(tab)) return;
        syncTabsState(tabsRoot, tab);
      });

      tabsRoot.addEventListener('keydown', (event) => {
        const tab = getScopedEventControl(event, '.uzu-tab', tabsRoot, '[data-uzu-tabs]');
        if (!tab || isControlDisabled(tab)) return;
        const currentTabs = getScopedControls(tabsRoot, '.uzu-tab', '[data-uzu-tabs]');
        let nextTab = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          nextTab = moveActiveControl(currentTabs, tab, 1);
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          nextTab = moveActiveControl(currentTabs, tab, -1);
        } else if (event.key === 'Home') {
          nextTab = getEnabledControls(currentTabs)[0];
        } else if (event.key === 'End') {
          const enabled = getEnabledControls(currentTabs);
          nextTab = enabled[enabled.length - 1];
        }
        if (nextTab) {
          event.preventDefault();
          syncTabsState(tabsRoot, nextTab);
          nextTab.focus();
        }
      });
    });
  }

  function syncSegmentedState(segmented, activeSegment, emit = true) {
    const segments = getScopedControls(segmented, '.uzu-segment', '[data-uzu-segmented]');
    const enabled = getEnabledControls(segments);
    const nextSegment = activeSegment && !isControlDisabled(activeSegment) ? activeSegment : enabled[0];
    if (!nextSegment) return;
    const previousValue = segmented.dataset.uzuSegmentedValue || '';
    const value = getControlValue(nextSegment, 'uzuSegmentValue');

    if (!segmented.hasAttribute('role')) segmented.setAttribute('role', 'group');
    segments.forEach((segment) => {
      const isActive = segment === nextSegment;
      segment.classList.toggle('is-active', isActive);
      segment.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    segmented.dataset.uzuSegmentedValue = value;
    setControlIndicator(segmented, nextSegment, 'segmented');

    if (emit && value !== previousValue) {
      segmented.dispatchEvent(new CustomEvent('uzu-segmented-change', {
        bubbles: true,
        detail: {
          value,
          segment: nextSegment,
          segmented,
          index: segments.indexOf(nextSegment)
        }
      }));
      segmented.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function initSegmented(root = document) {
    queryAll(root, '[data-uzu-segmented]').forEach((segmented) => {
      const segments = getScopedControls(segmented, '.uzu-segment', '[data-uzu-segmented]');
      if (!segments.length) return;
      const activeSegment = segments.find((segment) => segment.classList.contains('is-active') || segment.getAttribute('aria-pressed') === 'true');
      syncSegmentedState(segmented, activeSegment, false);

      if (!markInitialized(segmented, 'Segmented')) return;

      segmented.addEventListener('click', (event) => {
        const segment = getScopedEventControl(event, '.uzu-segment', segmented, '[data-uzu-segmented]');
        if (!segment || isControlDisabled(segment)) return;
        syncSegmentedState(segmented, segment);
      });

      segmented.addEventListener('keydown', (event) => {
        const segment = getScopedEventControl(event, '.uzu-segment', segmented, '[data-uzu-segmented]');
        if (!segment || isControlDisabled(segment)) return;
        const currentSegments = getScopedControls(segmented, '.uzu-segment', '[data-uzu-segmented]');
        let nextSegment = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          nextSegment = moveActiveControl(currentSegments, segment, 1);
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          nextSegment = moveActiveControl(currentSegments, segment, -1);
        } else if (event.key === 'Home') {
          nextSegment = getEnabledControls(currentSegments)[0];
        } else if (event.key === 'End') {
          const enabled = getEnabledControls(currentSegments);
          nextSegment = enabled[enabled.length - 1];
        }
        if (nextSegment) {
          event.preventDefault();
          syncSegmentedState(segmented, nextSegment);
          nextSegment.focus();
        }
      });
    });
  }

  function getPaginationPageValue(control) {
    return control.dataset.uzuPage ?? control.dataset.page ?? '';
  }

  function getPaginationPageControls(pagination) {
    return getScopedControls(pagination, '.uzu-page-button', '[data-uzu-pagination]')
      .filter((control) => getPaginationPageValue(control));
  }

  function getActivePaginationPage(pagination) {
    const pages = getPaginationPageControls(pagination);
    return pages.find((page) => page.classList.contains('is-active') || page.getAttribute('aria-current') === 'page')
      || pages.find((page) => getPaginationPageValue(page) === pagination.dataset.uzuPaginationPage)
      || pages.find((page) => !isControlDisabled(page));
  }

  function getPaginationPanelRoot(pagination) {
    const target = pagination.dataset.uzuPaginationTarget;
    if (!target) return null;
    try {
      return document.querySelector(target);
    } catch (_) {
      return null;
    }
  }

  function setPaginationControlDisabled(control, disabled) {
    control.classList.toggle('is-disabled', disabled);
    if ('disabled' in control) control.disabled = disabled;
    if (disabled) {
      control.setAttribute('aria-disabled', 'true');
      control.setAttribute('tabindex', '-1');
    } else {
      control.removeAttribute('aria-disabled');
      control.removeAttribute('tabindex');
    }
  }

  function syncPaginationPanels(pagination, value) {
    const panelRoot = getPaginationPanelRoot(pagination);
    if (!panelRoot) return null;
    let activePanel = null;
    [...panelRoot.children].filter((panel) => panel.hasAttribute('data-uzu-page-panel')).forEach((panel) => {
      const isActive = (panel.dataset.uzuPagePanel ?? panel.dataset.page ?? '') === value;
      panel.hidden = !isActive;
      if (isActive) activePanel = panel;
    });
    return activePanel;
  }

  function syncPaginationState(pagination, activePage, emit = true) {
    const pages = getPaginationPageControls(pagination);
    const enabledPages = getEnabledControls(pages);
    const requestedValue = typeof activePage === 'string' ? activePage : getPaginationPageValue(activePage || getActivePaginationPage(pagination));
    const nextPage = enabledPages.find((page) => getPaginationPageValue(page) === requestedValue) || enabledPages[0];
    if (!nextPage) return;

    const previousValue = pagination.dataset.uzuPaginationPage || '';
    const value = getPaginationPageValue(nextPage);
    const pageIndex = pages.indexOf(nextPage);
    const enabledPageIndex = enabledPages.indexOf(nextPage);
    pages.forEach((page) => {
      const isActive = page === nextPage;
      page.classList.toggle('is-active', isActive);
      if (isActive) page.setAttribute('aria-current', 'page');
      else page.removeAttribute('aria-current');
    });

    const controls = getScopedControls(pagination, '.uzu-page-button', '[data-uzu-pagination]');
    controls
      .filter((control) => control.hasAttribute('data-uzu-page-prev'))
      .forEach((control) => setPaginationControlDisabled(control, enabledPageIndex <= 0));
    controls
      .filter((control) => control.hasAttribute('data-uzu-page-next'))
      .forEach((control) => setPaginationControlDisabled(control, enabledPageIndex >= enabledPages.length - 1));

    pagination.dataset.uzuPaginationPage = value;
    const panel = syncPaginationPanels(pagination, value);

    if (emit && value !== previousValue) {
      pagination.dispatchEvent(new CustomEvent('uzu-pagination-change', {
        bubbles: true,
        detail: {
          value,
          page: nextPage,
          pagination,
          index: pageIndex,
          panel
        }
      }));
      pagination.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function getRelativePaginationPage(pagination, direction) {
    const pages = getEnabledControls(getPaginationPageControls(pagination));
    const active = getActivePaginationPage(pagination);
    const index = Math.max(0, pages.indexOf(active));
    return pages[index + direction] || null;
  }

  function initPaginations(root = document) {
    queryAll(root, '[data-uzu-pagination]').forEach((pagination) => {
      const pages = getPaginationPageControls(pagination);
      if (!pages.length) return;
      syncPaginationState(pagination, getActivePaginationPage(pagination), false);

      if (!markInitialized(pagination, 'Pagination')) return;

      pagination.addEventListener('click', (event) => {
        const control = getScopedEventControl(event, '.uzu-page-button', pagination, '[data-uzu-pagination]');
        if (!control || isControlDisabled(control)) return;
        let nextPage = null;
        if (control.hasAttribute('data-uzu-page-prev')) {
          nextPage = getRelativePaginationPage(pagination, -1);
        } else if (control.hasAttribute('data-uzu-page-next')) {
          nextPage = getRelativePaginationPage(pagination, 1);
        } else if (getPaginationPageValue(control)) {
          nextPage = control;
        }
        if (!nextPage) return;
        event.preventDefault();
        syncPaginationState(pagination, nextPage);
        if (typeof nextPage.focus === 'function') nextPage.focus({ preventScroll: true });
      });

      pagination.addEventListener('keydown', (event) => {
        const control = getScopedEventControl(event, '.uzu-page-button', pagination, '[data-uzu-pagination]');
        if (!control || isControlDisabled(control)) return;
        const pages = getEnabledControls(getPaginationPageControls(pagination));
        const active = getActivePaginationPage(pagination);
        let nextPage = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          nextPage = pages[Math.min(pages.length - 1, Math.max(0, pages.indexOf(active)) + 1)];
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          nextPage = pages[Math.max(0, Math.max(0, pages.indexOf(active)) - 1)];
        } else if (event.key === 'Home') {
          nextPage = pages[0];
        } else if (event.key === 'End') {
          nextPage = pages[pages.length - 1];
        }
        if (nextPage) {
          event.preventDefault();
          syncPaginationState(pagination, nextPage);
          nextPage.focus();
        }
      });
    });
  }

  function setSwitchState(control, checked, emit = true) {
    control.classList.toggle('is-on', checked);
    control.setAttribute('role', 'switch');
    control.setAttribute('aria-checked', checked ? 'true' : 'false');
    if (!control.hasAttribute('tabindex') && control.tagName !== 'BUTTON') {
      control.setAttribute('tabindex', '0');
    }
    if (emit) {
      control.dispatchEvent(new CustomEvent('uzu-switch-change', {
        bubbles: true,
        detail: { checked, switch: control }
      }));
      control.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function toggleSwitch(control) {
    if (control.getAttribute('aria-disabled') === 'true' || control.classList.contains('is-disabled') || control.disabled) return;
    setSwitchState(control, control.getAttribute('aria-checked') !== 'true');
  }

  function initSwitches(root = document) {
    queryAll(root, '[data-uzu-switch]').forEach((control) => {
      const checked = control.getAttribute('aria-checked') === 'true' || control.classList.contains('is-on');
      setSwitchState(control, checked, false);
      if (!markInitialized(control, 'Switch')) return;
      control.addEventListener('click', () => toggleSwitch(control));
      control.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggleSwitch(control);
        }
      });
    });
  }

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

  function openDialog(dialog, trigger = null) {
    if (!dialog) return;
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
    emitDialogEvent(dialog, 'uzu-dialog-open');
    const focusable = getFocusable(dialog);
    (focusable[0] || dialog).focus();
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

  function closeToast(toast) {
    if (!toast || toast.classList.contains('is-dismissed')) return;
    toast.classList.add('is-dismissed');
    toast.dispatchEvent(new CustomEvent('uzu-toast-close', {
      bubbles: true,
      detail: { toast }
    }));
    const timer = scheduleAfterAnimation([toast], () => {
      toast.remove();
      toastCloseTimers.delete(toast);
    });
    if (timer) toastCloseTimers.set(toast, timer);
  }

  function initToasts(root = document) {
    queryAll(root, '[data-uzu-toast]').forEach((toast) => {
      if (!markInitialized(toast, 'Toast')) return;
      const timeout = Number(toast.dataset.uzuToastTimeout || 0);
      queryAll(toast, '[data-uzu-toast-close]').forEach((close) => {
        close.addEventListener('click', () => closeToast(toast));
      });
      if (timeout > 0) window.setTimeout(() => closeToast(toast), timeout);
    });
  }

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
    const selector = root.dataset.uzuPanelSelector || '.uzu-doc-panel';
    const scope = root.closest(root.dataset.uzuPanelScope || '.uzu-doc-layout, .uzu-scope, main, body') || root.parentElement || document;
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
        window.addEventListener('hashchange', () => showPanelNavFromHash(nav));
      }
    });
  }

  function isSafeMarkdownHref(value) {
    const href = String(value || '').trim();
    if (!href) return false;
    if (href.startsWith('#') || href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) return true;
    try {
      return ['http:', 'https:', 'mailto:', 'tel:'].includes(new URL(href, window.location.href).protocol);
    } catch (_) {
      return false;
    }
  }

  function appendInlineMarkdown(parent, text) {
    const pattern = /(`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
    String(text).split(pattern).forEach((part) => {
      if (!part) return;
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        const code = document.createElement('code');
        code.className = 'uzu-code';
        code.textContent = part.slice(1, -1);
        parent.append(code);
        return;
      }
      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        if (!isSafeMarkdownHref(link[2])) {
          parent.append(document.createTextNode(link[1]));
          return;
        }
        const anchor = document.createElement('a');
        anchor.href = link[2].trim();
        anchor.textContent = link[1];
        parent.append(anchor);
        return;
      }
      parent.append(document.createTextNode(part));
    });
  }

  function createMarkdownBlock(type, content) {
    const element = document.createElement(type);
    appendInlineMarkdown(element, content);
    return element;
  }

  function createCodeBlock(codeText, language = '') {
    const shell = document.createElement('div');
    shell.className = 'uzu-code-block';
    const pre = document.createElement('pre');
    pre.className = 'uzu-code-block-body uzu-scroll';
    const code = document.createElement('code');
    if (language) code.className = `language-${language}`;
    code.textContent = codeText.replace(/\n$/, '');
    pre.append(code);
    const button = document.createElement('button');
    button.className = 'uzu-icon-button uzu-code-block-copy';
    button.type = 'button';
    button.setAttribute('aria-label', 'Copy code');
    button.setAttribute('data-uzu-code-copy', '');
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><rect x="8" y="8" width="10" height="10" rx="1.8" stroke="currentColor" stroke-width="1.7"/><path d="M6 15H5.8A1.8 1.8 0 0 1 4 13.2V5.8A1.8 1.8 0 0 1 5.8 4h7.4A1.8 1.8 0 0 1 15 5.8V6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg><span data-uzu-code-copy-label>Copy</span>';
    shell.append(pre, button);
    return shell;
  }

  function renderMarkdown(markdown) {
    const fragment = document.createDocumentFragment();
    const lines = String(markdown).replace(/\r\n?/g, '\n').split('\n');
    let paragraph = [];
    let list = null;
    let inFence = false;
    let fenceLanguage = '';
    let fenceLines = [];

    const flushParagraph = () => {
      if (!paragraph.length) return;
      fragment.append(createMarkdownBlock('p', paragraph.join(' ')));
      paragraph = [];
    };
    const flushList = () => {
      if (!list) return;
      fragment.append(list);
      list = null;
    };

    lines.forEach((line) => {
      const fence = line.match(/^```([\w-]*)\s*$/);
      if (fence) {
        if (inFence) {
          fragment.append(createCodeBlock(fenceLines.join('\n'), fenceLanguage));
          inFence = false;
          fenceLanguage = '';
          fenceLines = [];
        } else {
          flushParagraph();
          flushList();
          inFence = true;
          fenceLanguage = fence[1] || '';
        }
        return;
      }
      if (inFence) {
        fenceLines.push(line);
        return;
      }

      if (!line.trim()) {
        flushParagraph();
        flushList();
        return;
      }

      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      if (heading) {
        flushParagraph();
        flushList();
        fragment.append(createMarkdownBlock(`h${heading[1].length}`, heading[2]));
        return;
      }

      const item = line.match(/^\s*[-*]\s+(.+)$/);
      if (item) {
        flushParagraph();
        if (!list) list = document.createElement('ul');
        const li = document.createElement('li');
        appendInlineMarkdown(li, item[1]);
        list.append(li);
        return;
      }

      paragraph.push(line.trim());
    });

    if (inFence) fragment.append(createCodeBlock(fenceLines.join('\n'), fenceLanguage));
    flushParagraph();
    flushList();
    return fragment;
  }

  function initMarkdown(root = document) {
    queryAll(root, '[data-uzu-markdown]').forEach((element) => {
      if (markInitialized(element, 'Markdown')) {
        const source = element.tagName === 'TEXTAREA' ? element.value : element.textContent;
        element.replaceChildren(renderMarkdown(source));
      }
      initCodeCopy(element);
    });
  }

  function getCodeCopyLabelText(button, label, key, fallback) {
    return label?.dataset[key] || button.dataset[key] || fallback;
  }

  function getCodeCopyLabels(button) {
    return queryAll(button, '[data-uzu-code-copy-label]');
  }

  function setCodeCopyLabel(button, key, fallback) {
    const labels = getCodeCopyLabels(button);
    const nextLabel = button.dataset[key] || fallback;
    button.setAttribute('aria-label', nextLabel);
    if (labels.length) {
      labels.forEach((label) => {
        label.textContent = getCodeCopyLabelText(button, label, key, fallback);
      });
      return;
    }
    button.textContent = nextLabel;
  }

  function restoreCodeCopyLabel(button) {
    const labels = getCodeCopyLabels(button);
    if (labels.length) {
      button.setAttribute('aria-label', button.dataset.uzuCopyText || 'Copy code');
      labels.forEach((label) => {
        label.textContent = getCodeCopyLabelText(button, label, 'uzuCopyText', label.dataset.uzuCodeCopyDefault || 'Copy');
      });
      return;
    }
    const defaultContent = codeCopyDefaultContent.get(button);
    if (defaultContent) {
      button.replaceChildren(...defaultContent.map((node) => node.cloneNode(true)));
      button.setAttribute('aria-label', button.dataset.uzuCopyText || 'Copy code');
      return;
    }
    button.setAttribute('aria-label', button.dataset.uzuCopyText || 'Copy code');
    button.textContent = button.dataset.uzuCopyText || 'Copy';
  }

  function initCodeCopy(root = document) {
    queryAll(root, '[data-uzu-code-copy]').forEach((button) => {
      if (!markInitialized(button, 'CodeCopy')) return;
      const labels = getCodeCopyLabels(button);
      labels.forEach((label) => {
        if (!label.dataset.uzuCodeCopyDefault) label.dataset.uzuCodeCopyDefault = label.textContent.trim();
      });
      if (!labels.length && !codeCopyDefaultContent.has(button)) {
        codeCopyDefaultContent.set(button, [...button.childNodes].map((node) => node.cloneNode(true)));
      }
      button.addEventListener('click', () => {
        const block = button.closest('.uzu-code-block');
        const code = block?.querySelector('pre code, pre')?.textContent || '';
        copyText(code).then(() => {
          setCodeCopyLabel(button, 'uzuCopiedText', 'Copied');
          window.setTimeout(() => {
            restoreCodeCopyLabel(button);
          }, 1400);
        }).catch(() => {
          setCodeCopyLabel(button, 'uzuCopyFailedText', 'Copy failed');
          window.setTimeout(() => {
            restoreCodeCopyLabel(button);
          }, 1800);
        });
      });
    });
  }

  function handleDocumentClick(event) {
    queryAll(document, '[data-uzu-select].is-open').forEach((select) => {
      if (!select.contains(event.target)) closeSelect(select);
    });
  }

  function handleDocumentKeydown(event) {
    if (event.key !== 'Escape') return;
    if (activeDialog) {
      event.preventDefault();
      closeDialog(activeDialog);
    }
  }

  function trapDialogFocus(event) {
    if (event.key !== 'Tab' || !activeDialog) return;
    const focusable = getFocusable(activeDialog);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function initGlobalListeners() {
    if (document.documentElement.dataset.uzuGlobalListeners === 'true') return;
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleDocumentKeydown);
    document.addEventListener('keydown', trapDialogFocus);
    window.addEventListener('resize', () => queueIndicatorRefresh());
    document.documentElement.dataset.uzuGlobalListeners = 'true';
  }

  function init(root = document) {
    syncRootClass();
    initGlobalListeners();
    for (const fn of [initThemeToggles, initLanguageToggles, initSelects, initTabs, initSegmented, initPaginations, initSwitches, initDisclosures, initDialogs, initToasts, initPanelNavs, initMarkdown, initCodeCopy]) {
      try { fn(root); } catch (error) { console.error('[usuzumi]', error); }
    }
    queueIndicatorRefresh(root);
  }

  window.Usuzumi = {
    init,
    applyTheme,
    applyLanguage,
    setSwitchState,
    setPaginationPage: syncPaginationState,
    renderMarkdown,
    initCodeCopy,
    openDialog,
    closeDialog
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init(), { once: true });
  } else {
    init();
  }
})();
