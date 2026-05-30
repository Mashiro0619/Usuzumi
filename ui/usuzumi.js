(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  let selectCounter = 0;
  let activeDialog = null;
  let activeDialogTrigger = null;
  const selectCloseTimers = new WeakMap();
  const disclosureCloseTimers = new WeakMap();
  const dialogCloseTimers = new WeakMap();
  const toastCloseTimers = new WeakMap();
  const menuCloseTimers = new WeakMap();
  const menuActiveTriggers = new WeakMap();
  const hoverCardCloseTimers = new WeakMap();
  const hoverCardOpenTimers = new WeakMap();
  const indicatorInstantTimers = new WeakMap();
  const codeCopyDefaultContent = new WeakMap();
  const comboboxSelectionInputs = new WeakSet();
  const richEditorSyncers = new WeakMap();
  let richEditorSelectionListenerInitialized = false;

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

  function setSearchClearState(search) {
    const input = search.querySelector('.uzu-search-input, input[type="search"], input[type="text"]');
    const clear = search.querySelector('[data-uzu-search-clear]');
    if (!input || !clear) return;
    clear.hidden = !input.value;
    clear.setAttribute('aria-hidden', input.value ? 'false' : 'true');
  }

  function initSearches(root = document) {
    queryAll(root, '[data-uzu-search]').forEach((search) => {
      const input = search.querySelector('.uzu-search-input, input[type="search"], input[type="text"]');
      const clear = search.querySelector('[data-uzu-search-clear]');
      if (!input || !clear) return;
      setSearchClearState(search);
      if (!markInitialized(search, 'Search')) return;
      input.addEventListener('input', () => setSearchClearState(search));
      clear.addEventListener('click', () => {
        if (input.disabled || input.readOnly) return;
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        setSearchClearState(search);
        input.focus();
      });
    });
  }

  function setPasswordVisible(password, visible, emit = true) {
    const input = password.querySelector('.uzu-password-input, input[type="password"], input[type="text"]');
    const toggle = password.querySelector('[data-uzu-password-toggle]');
    if (!input || !toggle) return;
    input.type = visible ? 'text' : 'password';
    password.classList.toggle('is-visible', visible);
    toggle.setAttribute('aria-pressed', visible ? 'true' : 'false');
    if (emit) {
      password.dispatchEvent(new CustomEvent('uzu-password-toggle', {
        bubbles: true,
        detail: { visible, password, input, toggle }
      }));
    }
  }

  function initPasswords(root = document) {
    queryAll(root, '[data-uzu-password]').forEach((password) => {
      const input = password.querySelector('.uzu-password-input, input[type="password"], input[type="text"]');
      const toggle = password.querySelector('[data-uzu-password-toggle]');
      if (!input || !toggle) return;
      setPasswordVisible(password, input.type === 'text', false);
      if (!markInitialized(password, 'Password')) return;
      toggle.addEventListener('click', () => {
        if (input.disabled || toggle.disabled || toggle.getAttribute('aria-disabled') === 'true') return;
        setPasswordVisible(password, input.type !== 'text');
      });
    });
  }

  function getStepperInput(stepper) {
    return stepper.querySelector('.uzu-stepper-input, input[type="number"]');
  }

  function getNumberAttribute(input, name, fallback) {
    const value = Number.parseFloat(input.getAttribute(name));
    return Number.isFinite(value) ? value : fallback;
  }

  function getInputNumber(input) {
    const value = Number.parseFloat(input.value);
    return Number.isFinite(value) ? value : 0;
  }

  function clampNumber(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getStepPrecision(step) {
    const text = String(step);
    if (/e/i.test(text)) {
      const fixed = Number(step).toFixed(12).replace(/0+$/, '');
      const fixedIndex = fixed.indexOf('.');
      return fixedIndex === -1 ? 0 : fixed.length - fixedIndex - 1;
    }
    const index = text.indexOf('.');
    return index === -1 ? 0 : text.length - index - 1;
  }

  function syncStepperDisabled(stepper) {
    const input = getStepperInput(stepper);
    if (!input) return;
    const min = getNumberAttribute(input, 'min', Number.NEGATIVE_INFINITY);
    const max = getNumberAttribute(input, 'max', Number.POSITIVE_INFINITY);
    const value = getInputNumber(input);
    queryAll(stepper, '[data-uzu-stepper-decrement]').forEach((button) => {
      button.disabled = input.disabled || value <= min;
    });
    queryAll(stepper, '[data-uzu-stepper-increment]').forEach((button) => {
      button.disabled = input.disabled || value >= max;
    });
  }

  function setStepperValue(stepper, nextValue, emit = true) {
    const input = getStepperInput(stepper);
    if (!input) return;
    const min = getNumberAttribute(input, 'min', Number.NEGATIVE_INFINITY);
    const max = getNumberAttribute(input, 'max', Number.POSITIVE_INFINITY);
    const step = Math.abs(getNumberAttribute(input, 'step', 1)) || 1;
    const precision = getStepPrecision(step);
    const clamped = clampNumber(nextValue, min, max);
    input.value = Number.isFinite(clamped) ? clamped.toFixed(precision).replace(/\.?0+$/, '') : String(nextValue);
    syncStepperDisabled(stepper);
    if (emit) {
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      stepper.dispatchEvent(new CustomEvent('uzu-stepper-change', {
        bubbles: true,
        detail: { value: input.value, number: getInputNumber(input), stepper, input }
      }));
    }
  }

  function stepStepper(stepper, direction) {
    const input = getStepperInput(stepper);
    if (!input || input.disabled || input.readOnly) return;
    const step = Math.abs(getNumberAttribute(input, 'step', 1)) || 1;
    setStepperValue(stepper, getInputNumber(input) + step * direction);
    input.focus();
  }

  function initSteppers(root = document) {
    queryAll(root, '[data-uzu-stepper]').forEach((stepper) => {
      const input = getStepperInput(stepper);
      if (!input) return;
      syncStepperDisabled(stepper);
      if (!markInitialized(stepper, 'Stepper')) return;
      queryAll(stepper, '[data-uzu-stepper-decrement]').forEach((button) => {
        button.addEventListener('click', () => stepStepper(stepper, -1));
      });
      queryAll(stepper, '[data-uzu-stepper-increment]').forEach((button) => {
        button.addEventListener('click', () => stepStepper(stepper, 1));
      });
      input.addEventListener('input', () => syncStepperDisabled(stepper));
      input.addEventListener('change', () => setStepperValue(stepper, getInputNumber(input), false));
    });
  }

  function syncSliderValue(slider) {
    if (!slider || !('value' in slider)) return;
    const min = Number.parseFloat(slider.min || '0');
    const max = Number.parseFloat(slider.max || '100');
    const value = Number.parseFloat(slider.value || '0');
    const range = max - min;
    const percent = range ? ((value - min) / range) * 100 : 0;
    slider.style.setProperty('--uzu-slider-value', `${Math.min(100, Math.max(0, percent))}%`);
  }

  function initSliders(root = document) {
    queryAll(root, '[data-uzu-slider], .uzu-slider').forEach((slider) => {
      if (!(slider instanceof HTMLInputElement) || slider.type !== 'range') return;
      syncSliderValue(slider);
      if (!markInitialized(slider, 'Slider')) return;
      slider.addEventListener('input', () => syncSliderValue(slider));
      slider.addEventListener('change', () => syncSliderValue(slider));
    });
  }

  function getMenuTrigger(menu) {
    return menu.querySelector('[data-uzu-menu-trigger], .uzu-menu-trigger');
  }

  function getMenuContent(menu) {
    return menu.querySelector('[data-uzu-menu-content], .uzu-menu-content');
  }

  function getMenuItems(menu) {
    return getScopedControls(menu, '.uzu-menu-item', '[data-uzu-menu], [data-uzu-context-menu]');
  }

  function emitMenuEvent(menu, name, trigger = getMenuTrigger(menu), extra = {}) {
    menu.dispatchEvent(new CustomEvent(name, {
      bubbles: true,
      detail: {
        menu,
        trigger,
        content: getMenuContent(menu),
        ...extra
      }
    }));
  }

  function emitMenuSelectEvent(menu, item) {
    emitMenuEvent(menu, 'uzu-menu-select', menuActiveTriggers.get(menu) || getMenuTrigger(menu), {
      item,
      value: getControlValue(item, 'uzuMenuValue')
    });
  }

  function setContextMenuPoint(menu, content, x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const rect = content.getBoundingClientRect();
    const inlineMargin = 8;
    const blockMargin = 8;
    const nextX = Math.max(inlineMargin, Math.min(x, window.innerWidth - rect.width - inlineMargin));
    const nextY = Math.max(blockMargin, Math.min(y, window.innerHeight - rect.height - blockMargin));
    menu.style.setProperty('--uzu-menu-x', `${nextX}px`);
    menu.style.setProperty('--uzu-menu-y', `${nextY}px`);
  }

  function focusMenuItem(menu, index) {
    const items = getEnabledControls(getMenuItems(menu));
    if (!items.length) return null;
    const nextIndex = (index + items.length) % items.length;
    items.forEach((item, itemIndex) => {
      item.classList.toggle('is-active', itemIndex === nextIndex);
      item.setAttribute('tabindex', itemIndex === nextIndex ? '0' : '-1');
    });
    items[nextIndex].focus();
    return items[nextIndex];
  }

  function openMenu(menu, options = {}) {
    const trigger = options.trigger || getMenuTrigger(menu);
    const content = getMenuContent(menu);
    if (!content) return;
    if (menu.classList.contains('is-open')) {
      if (Number.isFinite(options.x) && Number.isFinite(options.y)) {
        menu.classList.add('is-context');
        setContextMenuPoint(menu, content, options.x, options.y);
      }
      return;
    }
    const existingTimer = menuCloseTimers.get(menu);
    if (existingTimer) {
      window.clearTimeout(existingTimer);
      menuCloseTimers.delete(menu);
    }
    const isContextMenu = Number.isFinite(options.x) && Number.isFinite(options.y);
    if (isContextMenu) menu.classList.add('is-context');
    content.hidden = false;
    menu.classList.remove('is-closing');
    menu.classList.add('is-open');
    if (isContextMenu) setContextMenuPoint(menu, content, options.x, options.y);
    if (trigger) {
      trigger.setAttribute('aria-haspopup', trigger.getAttribute('aria-haspopup') || 'menu');
      trigger.setAttribute('aria-expanded', 'true');
    }
    menuActiveTriggers.set(menu, trigger || null);
    content.setAttribute('role', content.getAttribute('role') || 'menu');
    getMenuItems(menu).forEach((item) => {
      item.setAttribute('role', item.getAttribute('role') || 'menuitem');
      item.setAttribute('tabindex', '-1');
    });
    emitMenuEvent(menu, 'uzu-menu-open', trigger);
    if (options.focus !== false) focusMenuItem(menu, 0);
  }

  function closeMenu(menu, options = {}) {
    const content = getMenuContent(menu);
    if (!content || menu.classList.contains('is-closing') || (!menu.classList.contains('is-open') && content.hidden)) return;
    const trigger = options.trigger || menuActiveTriggers.get(menu) || getMenuTrigger(menu);
    const existingTimer = menuCloseTimers.get(menu);
    if (existingTimer) window.clearTimeout(existingTimer);
    menu.classList.remove('is-open');
    menu.classList.add('is-closing');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    getMenuItems(menu).forEach((item) => {
      item.classList.remove('is-active');
      item.setAttribute('tabindex', '-1');
    });
    const finish = () => {
      menu.classList.remove('is-closing', 'is-context');
      content.hidden = true;
      menuCloseTimers.delete(menu);
      menuActiveTriggers.delete(menu);
      emitMenuEvent(menu, 'uzu-menu-close', trigger);
      if (options.restoreFocus && trigger && typeof trigger.focus === 'function') trigger.focus();
    };
    const timer = scheduleAfterAnimation([content], finish);
    if (timer) menuCloseTimers.set(menu, timer);
  }

  function closeOpenMenus(except = null) {
    let count = 0;
    queryAll(document, '[data-uzu-menu].is-open, [data-uzu-context-menu].is-open').forEach((menu) => {
      if (menu !== except) {
        count += 1;
        closeMenu(menu);
      }
    });
    return count;
  }

  function handleMenuItemKeydown(event, menu, item) {
    const enabled = getEnabledControls(getMenuItems(menu));
    const index = Math.max(0, enabled.indexOf(item));
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusMenuItem(menu, index + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusMenuItem(menu, index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusMenuItem(menu, 0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusMenuItem(menu, enabled.length - 1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu(menu, { restoreFocus: true });
    } else if (event.key === 'Tab') {
      closeMenu(menu);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      item.click();
    }
  }

  function initMenus(root = document) {
    queryAll(root, '[data-uzu-menu]').forEach((menu) => {
      const trigger = getMenuTrigger(menu);
      const content = getMenuContent(menu);
      if (!trigger || !content) return;
      const contentId = ensureId(content, 'uzu-menu-content');
      trigger.setAttribute('aria-haspopup', 'menu');
      trigger.setAttribute('aria-expanded', menu.classList.contains('is-open') ? 'true' : 'false');
      trigger.setAttribute('aria-controls', contentId);
      if (!menu.classList.contains('is-open')) content.hidden = true;
      getMenuItems(menu).forEach((item) => {
        item.setAttribute('role', item.getAttribute('role') || 'menuitem');
        item.setAttribute('tabindex', '-1');
      });
      if (!markInitialized(menu, 'Menu')) return;
      trigger.addEventListener('click', (event) => {
        if (isControlDisabled(trigger)) return;
        event.preventDefault();
        if (menu.classList.contains('is-open')) {
          closeMenu(menu, { restoreFocus: true });
        } else {
          closeOpenMenus(menu);
          openMenu(menu, { trigger });
        }
      });
      trigger.addEventListener('keydown', (event) => {
        if (isControlDisabled(trigger)) return;
        if (['ArrowDown', 'Enter', ' '].includes(event.key)) {
          event.preventDefault();
          closeOpenMenus(menu);
          openMenu(menu, { trigger });
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          closeOpenMenus(menu);
          openMenu(menu, { trigger, focus: false });
          focusMenuItem(menu, getEnabledControls(getMenuItems(menu)).length - 1);
        }
      });
      menu.addEventListener('click', (event) => {
        const item = getScopedEventControl(event, '.uzu-menu-item', menu, '[data-uzu-menu], [data-uzu-context-menu]');
        if (!item || isControlDisabled(item)) return;
        emitMenuSelectEvent(menu, item);
        if (item.dataset.uzuMenuKeepOpen === 'true') return;
        closeMenu(menu, { restoreFocus: false });
      });
      menu.addEventListener('keydown', (event) => {
        const item = getScopedEventControl(event, '.uzu-menu-item', menu, '[data-uzu-menu], [data-uzu-context-menu]');
        if (!item) return;
        handleMenuItemKeydown(event, menu, item);
      });
      getMenuItems(menu).forEach((item) => {
        item.addEventListener('mouseenter', () => {
          const enabled = getEnabledControls(getMenuItems(menu));
          const index = enabled.indexOf(item);
          if (index >= 0) focusMenuItem(menu, index);
        });
      });
    });
  }

  function getContextMenuTrigger(contextMenu) {
    const selector = contextMenu.dataset.uzuContextMenuTrigger || '';
    if (!selector) return contextMenu;
    try {
      return document.querySelector(selector) || contextMenu;
    } catch (_) {
      return contextMenu;
    }
  }

  function getContextPoint(event, target) {
    if ('clientX' in event && event.clientX) {
      return { x: event.clientX, y: event.clientY };
    }
    const rect = target.getBoundingClientRect();
    return { x: rect.left, y: rect.bottom + 4 };
  }

  function initContextMenus(root = document) {
    queryAll(root, '[data-uzu-context-menu]').forEach((menu) => {
      const content = getMenuContent(menu);
      const trigger = getContextMenuTrigger(menu);
      if (!content || !trigger) return;
      const contentId = ensureId(content, 'uzu-context-menu-content');
      content.hidden = true;
      content.setAttribute('role', content.getAttribute('role') || 'menu');
      if (trigger !== menu) {
        trigger.setAttribute('aria-haspopup', 'menu');
        trigger.setAttribute('aria-controls', contentId);
        trigger.setAttribute('aria-expanded', 'false');
      }
      getMenuItems(menu).forEach((item) => {
        item.setAttribute('role', item.getAttribute('role') || 'menuitem');
        item.setAttribute('tabindex', '-1');
      });
      if (!markInitialized(menu, 'ContextMenu')) return;
      trigger.addEventListener('contextmenu', (event) => {
        if (isControlDisabled(trigger)) return;
        event.preventDefault();
        closeOpenMenus(menu);
        const point = getContextPoint(event, trigger);
        openMenu(menu, { trigger, x: point.x, y: point.y });
      });
      trigger.addEventListener('keydown', (event) => {
        if (isControlDisabled(trigger)) return;
        if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
          event.preventDefault();
          closeOpenMenus(menu);
          const point = getContextPoint(event, trigger);
          openMenu(menu, { trigger, x: point.x, y: point.y });
        }
      });
      menu.addEventListener('click', (event) => {
        const item = getScopedEventControl(event, '.uzu-menu-item', menu, '[data-uzu-menu], [data-uzu-context-menu]');
        if (!item || isControlDisabled(item)) return;
        emitMenuSelectEvent(menu, item);
        if (item.dataset.uzuMenuKeepOpen === 'true') return;
        closeMenu(menu);
      });
      menu.addEventListener('keydown', (event) => {
        const item = getScopedEventControl(event, '.uzu-menu-item', menu, '[data-uzu-menu], [data-uzu-context-menu]');
        if (!item) return;
        handleMenuItemKeydown(event, menu, item);
      });
    });
  }

  function initMenubars(root = document) {
    queryAll(root, '[data-uzu-menubar]').forEach((menubar) => {
      const items = getScopedControls(menubar, '.uzu-menubar-item', '[data-uzu-menubar]');
      if (!items.length) return;
      menubar.setAttribute('role', menubar.getAttribute('role') || 'menubar');
      items.forEach((item, index) => {
        item.setAttribute('role', item.getAttribute('role') || 'menuitem');
        item.setAttribute('tabindex', index === 0 ? '0' : '-1');
      });
      if (!markInitialized(menubar, 'Menubar')) return;
      menubar.addEventListener('click', (event) => {
        const item = getScopedEventControl(event, '.uzu-menubar-item', menubar, '[data-uzu-menubar]');
        if (!item || isControlDisabled(item)) return;
        items.forEach((control) => {
          const active = control === item;
          control.classList.toggle('is-active', active);
          control.setAttribute('tabindex', active ? '0' : '-1');
        });
        menubar.dispatchEvent(new CustomEvent('uzu-menubar-change', {
          bubbles: true,
          detail: { value: getControlValue(item, 'uzuMenubarValue'), item, menubar, index: items.indexOf(item) }
        }));
      });
      menubar.addEventListener('keydown', (event) => {
        const item = getScopedEventControl(event, '.uzu-menubar-item', menubar, '[data-uzu-menubar]');
        if (!item || isControlDisabled(item)) return;
        let next = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = moveActiveControl(items, item, 1);
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = moveActiveControl(items, item, -1);
        else if (event.key === 'Home') next = getEnabledControls(items)[0];
        else if (event.key === 'End') next = getEnabledControls(items).at(-1);
        if (next) {
          event.preventDefault();
          items.forEach((control) => control.setAttribute('tabindex', control === next ? '0' : '-1'));
          next.focus();
        }
      });
    });
  }

  function getCommandItems(command) {
    return getScopedControls(command, '.uzu-command-item', '[data-uzu-command]');
  }

  function getCommandInput(command) {
    return command.querySelector('.uzu-command-input, [data-uzu-command-input]');
  }

  function getCommandList(command) {
    return command.querySelector('.uzu-command-list, [data-uzu-command-list]');
  }

  function getCommandItemText(item) {
    return (item.dataset.uzuCommandText || item.textContent || '').trim().toLowerCase();
  }

  function getVisibleCommandItems(command) {
    return getEnabledControls(getCommandItems(command).filter((item) => !item.hidden));
  }

  function focusCommandItem(command, index, focus = true) {
    const items = getVisibleCommandItems(command);
    if (!items.length) return null;
    const nextIndex = (index + items.length) % items.length;
    items.forEach((item, itemIndex) => {
      item.classList.toggle('is-active', itemIndex === nextIndex);
      item.setAttribute('tabindex', itemIndex === nextIndex ? '0' : '-1');
    });
    const input = getCommandInput(command);
    if (input && items[nextIndex].id) input.setAttribute('aria-activedescendant', items[nextIndex].id);
    if (focus) items[nextIndex].focus();
    return items[nextIndex];
  }

  function filterCommand(command, focus = false) {
    const input = getCommandInput(command);
    const list = getCommandList(command);
    const query = (input?.value || '').trim().toLowerCase();
    let visibleCount = 0;
    getCommandItems(command).forEach((item, index) => {
      ensureId(item, `uzu-command-item-${index + 1}`);
      const visible = !query || getCommandItemText(item).includes(query);
      item.hidden = !visible;
      item.setAttribute('tabindex', '-1');
      item.classList.remove('is-active');
      if (visible) visibleCount += 1;
    });
    queryAll(command, '.uzu-command-empty').forEach((empty) => {
      empty.hidden = visibleCount > 0;
    });
    if (list) list.setAttribute('aria-busy', 'false');
    if (visibleCount) {
      const items = getVisibleCommandItems(command);
      items[0].classList.add('is-active');
      items[0].setAttribute('tabindex', '0');
      if (input && items[0].id) input.setAttribute('aria-activedescendant', items[0].id);
      if (focus) items[0].focus();
    } else if (input) {
      input.removeAttribute('aria-activedescendant');
    }
    command.dispatchEvent(new CustomEvent('uzu-command-filter', {
      bubbles: true,
      detail: { value: input?.value || '', command, visibleCount }
    }));
  }

  function initCommands(root = document) {
    queryAll(root, '[data-uzu-command]').forEach((command) => {
      const input = getCommandInput(command);
      const list = getCommandList(command);
      const items = getCommandItems(command);
      if (!input || !list || !items.length) return;
      list.setAttribute('role', list.getAttribute('role') || 'listbox');
      input.setAttribute('role', input.getAttribute('role') || 'combobox');
      input.setAttribute('aria-expanded', 'true');
      input.setAttribute('aria-controls', ensureId(list, 'uzu-command-list'));
      items.forEach((item, index) => {
        ensureId(item, `uzu-command-item-${index + 1}`);
        item.setAttribute('role', item.getAttribute('role') || 'option');
        item.setAttribute('tabindex', '-1');
      });
      filterCommand(command);
      if (!markInitialized(command, 'Command')) return;
      input.addEventListener('input', () => filterCommand(command));
      input.addEventListener('keydown', (event) => {
        const visible = getVisibleCommandItems(command);
        const active = visible.find((item) => item.classList.contains('is-active')) || visible[0];
        const index = Math.max(0, visible.indexOf(active));
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          focusCommandItem(command, index + 1, false);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          focusCommandItem(command, index - 1, false);
        } else if (event.key === 'Enter' && active) {
          event.preventDefault();
          active.click();
        }
      });
      command.addEventListener('click', (event) => {
        const item = getScopedEventControl(event, '.uzu-command-item', command, '[data-uzu-command]');
        if (!item || isControlDisabled(item)) return;
        command.dispatchEvent(new CustomEvent('uzu-command-select', {
          bubbles: true,
          detail: { value: getControlValue(item, 'uzuCommandValue'), item, command }
        }));
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

  function getComboboxInput(combobox) {
    return combobox.querySelector('[data-uzu-combobox-input], .uzu-combobox-input');
  }

  function getComboboxList(combobox) {
    return combobox.querySelector('[data-uzu-combobox-list], .uzu-combobox-list');
  }

  function getComboboxOptions(combobox) {
    return getScopedControls(combobox, '[data-uzu-combobox-option], .uzu-combobox-option', '[data-uzu-combobox]');
  }

  function getComboboxOptionText(option) {
    return (option.dataset.uzuComboboxText || option.textContent || '').trim();
  }

  function ensureComboboxHiddenInput(combobox) {
    const name = combobox.dataset.uzuComboboxName;
    if (!name) return null;
    let input = combobox.querySelector('input[type="hidden"][data-uzu-combobox-hidden]');
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.dataset.uzuComboboxHidden = '';
      combobox.append(input);
    }
    input.name = name;
    return input;
  }

  function getVisibleComboboxOptions(combobox) {
    return getEnabledControls(getComboboxOptions(combobox).filter((option) => !option.hidden));
  }

  function openCombobox(combobox) {
    const input = getComboboxInput(combobox);
    const list = getComboboxList(combobox);
    if (!input || !list) return;
    list.hidden = false;
    combobox.classList.add('is-open');
    input.setAttribute('aria-expanded', 'true');
    combobox.dispatchEvent(new CustomEvent('uzu-combobox-open', {
      bubbles: true,
      detail: { combobox, input, list }
    }));
  }

  function closeCombobox(combobox) {
    const input = getComboboxInput(combobox);
    const list = getComboboxList(combobox);
    if (!input || !list || list.hidden) return;
    combobox.classList.remove('is-open');
    input.setAttribute('aria-expanded', 'false');
    list.hidden = true;
    getComboboxOptions(combobox).forEach((option) => option.classList.remove('is-active'));
    input.removeAttribute('aria-activedescendant');
    combobox.dispatchEvent(new CustomEvent('uzu-combobox-close', {
      bubbles: true,
      detail: { combobox, input, list }
    }));
  }

  function focusComboboxOption(combobox, index) {
    const input = getComboboxInput(combobox);
    const options = getVisibleComboboxOptions(combobox);
    if (!options.length) return null;
    const nextIndex = (index + options.length) % options.length;
    options.forEach((option, optionIndex) => {
      option.classList.toggle('is-active', optionIndex === nextIndex);
    });
    if (input) input.setAttribute('aria-activedescendant', ensureId(options[nextIndex], 'uzu-combobox-option'));
    return options[nextIndex];
  }

  function filterCombobox(combobox) {
    const input = getComboboxInput(combobox);
    const query = (input?.value || '').trim().toLowerCase();
    let visibleCount = 0;
    getComboboxOptions(combobox).forEach((option, index) => {
      ensureId(option, `uzu-combobox-option-${index + 1}`);
      const visible = !query || getComboboxOptionText(option).toLowerCase().includes(query);
      option.hidden = !visible;
      option.classList.remove('is-active');
      if (visible) visibleCount += 1;
    });
    queryAll(combobox, '.uzu-combobox-empty').forEach((empty) => {
      empty.hidden = visibleCount > 0;
    });
    focusComboboxOption(combobox, 0);
    combobox.dispatchEvent(new CustomEvent('uzu-combobox-filter', {
      bubbles: true,
      detail: { value: input?.value || '', combobox, visibleCount }
    }));
  }

  function setComboboxValue(combobox, optionOrValue, emit = true) {
    const input = getComboboxInput(combobox);
    const hidden = ensureComboboxHiddenInput(combobox);
    const options = getComboboxOptions(combobox);
    const option = optionOrValue instanceof Element
      ? optionOrValue
      : options.find((item) => getControlValue(item, 'uzuComboboxValue') === String(optionOrValue));
    if (!input || !option || isControlDisabled(option)) return;
    const value = getControlValue(option, 'uzuComboboxValue');
    const label = getComboboxOptionText(option);
    input.value = label;
    if (hidden) hidden.value = value;
    combobox.dataset.uzuComboboxValue = value;
    options.forEach((item) => {
      const selected = item === option;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
    closeCombobox(combobox);
    if (emit) {
      comboboxSelectionInputs.add(input);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      comboboxSelectionInputs.delete(input);
      input.dispatchEvent(new Event('change', { bubbles: true }));
      combobox.dispatchEvent(new CustomEvent('uzu-combobox-change', {
        bubbles: true,
        detail: { value, label, option, combobox, input }
      }));
      combobox.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function initComboboxes(root = document) {
    queryAll(root, '[data-uzu-combobox]').forEach((combobox) => {
      const input = getComboboxInput(combobox);
      const list = getComboboxList(combobox);
      const options = getComboboxOptions(combobox);
      if (!input || !list || !options.length) return;
      const listId = ensureId(list, 'uzu-combobox-list');
      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-autocomplete', input.getAttribute('aria-autocomplete') || 'list');
      input.setAttribute('aria-expanded', 'false');
      input.setAttribute('aria-controls', listId);
      list.setAttribute('role', list.getAttribute('role') || 'listbox');
      ensureComboboxHiddenInput(combobox);
      options.forEach((option, index) => {
        ensureId(option, `uzu-combobox-option-${index + 1}`);
        option.setAttribute('role', option.getAttribute('role') || 'option');
        option.setAttribute('aria-selected', option.classList.contains('is-selected') ? 'true' : 'false');
      });
      const selected = options.find((option) => option.classList.contains('is-selected') || option.getAttribute('aria-selected') === 'true');
      if (selected) setComboboxValue(combobox, selected, false);
      else if (!input.value) {
        const hidden = ensureComboboxHiddenInput(combobox);
        if (hidden) hidden.value = '';
      }
      list.hidden = true;
      if (!markInitialized(combobox, 'Combobox')) return;
      input.addEventListener('focus', () => {
        filterCombobox(combobox);
        openCombobox(combobox);
      });
      input.addEventListener('input', () => {
        if (comboboxSelectionInputs.has(input)) return;
        filterCombobox(combobox);
        openCombobox(combobox);
      });
      input.addEventListener('keydown', (event) => {
        const visible = getVisibleComboboxOptions(combobox);
        const active = visible.find((option) => option.classList.contains('is-active'));
        const index = Math.max(0, visible.indexOf(active));
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          openCombobox(combobox);
          focusComboboxOption(combobox, index + 1);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          openCombobox(combobox);
          focusComboboxOption(combobox, index - 1);
        } else if (event.key === 'Enter' && active) {
          event.preventDefault();
          setComboboxValue(combobox, active);
        } else if (event.key === 'Escape') {
          event.preventDefault();
          closeCombobox(combobox);
        }
      });
      combobox.addEventListener('click', (event) => {
        const option = getScopedEventControl(event, '[data-uzu-combobox-option], .uzu-combobox-option', combobox, '[data-uzu-combobox]');
        if (option) {
          event.preventDefault();
          setComboboxValue(combobox, option);
        } else if (event.target === input) {
          openCombobox(combobox);
        }
      });
    });
  }

  function getDataGridRows(table) {
    return queryAll(table, 'tbody tr, [data-uzu-grid-row]').filter((row) => row.closest('table') === table);
  }

  function initDataGrids(root = document) {
    queryAll(root, '[data-uzu-data-grid]').forEach((grid) => {
      const table = grid.matches('table') ? grid : grid.querySelector('table');
      if (!table) return;
      const rows = () => getDataGridRows(table);
      rows().forEach((row, index) => {
        row.dataset.uzuGridRow = row.dataset.uzuGridRow || String(index + 1);
        row.setAttribute('tabindex', row.getAttribute('tabindex') || '0');
      });
      if (!markInitialized(grid, 'DataGrid')) return;
      queryAll(table, '[data-uzu-grid-sort]').forEach((header) => {
        header.setAttribute('tabindex', header.getAttribute('tabindex') || '0');
        header.setAttribute('aria-sort', header.getAttribute('aria-sort') || 'none');
        const sort = () => {
          const body = table.tBodies[0];
          if (!body) return;
          const headers = [...header.parentElement.children];
          const columnIndex = headers.indexOf(header);
          const current = header.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
          queryAll(table, '[data-uzu-grid-sort]').forEach((item) => item.setAttribute('aria-sort', item === header ? current : 'none'));
          const direction = current === 'ascending' ? 1 : -1;
          const sorted = [...body.rows].sort((a, b) => {
            const aText = (a.cells[columnIndex]?.textContent || '').trim();
            const bText = (b.cells[columnIndex]?.textContent || '').trim();
            const aNumber = Number(aText.replace(/[^\d.-]/g, ''));
            const bNumber = Number(bText.replace(/[^\d.-]/g, ''));
            if (Number.isFinite(aNumber) && Number.isFinite(bNumber) && /\d/.test(aText + bText)) {
              return (aNumber - bNumber) * direction;
            }
            return aText.localeCompare(bText, undefined, { numeric: true }) * direction;
          });
          sorted.forEach((row) => body.append(row));
          grid.dispatchEvent(new CustomEvent('uzu-data-grid-sort', {
            bubbles: true,
            detail: { grid, table, header, columnIndex, direction: current }
          }));
        };
        header.addEventListener('click', sort);
        header.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            sort();
          }
        });
      });
      grid.addEventListener('click', (event) => {
        const row = event.target instanceof Element ? event.target.closest('[data-uzu-grid-row], tbody tr') : null;
        if (!row || !table.contains(row) || event.target.closest('a, button, input, select, textarea')) return;
        const multi = grid.dataset.uzuDataGridMulti === 'true';
        if (!multi) rows().forEach((item) => {
          if (item !== row) {
            item.classList.remove('is-selected');
            item.setAttribute('aria-selected', 'false');
          }
        });
        const selected = !(row.classList.contains('is-selected') || row.getAttribute('aria-selected') === 'true');
        row.classList.toggle('is-selected', selected);
        row.setAttribute('aria-selected', selected ? 'true' : 'false');
        grid.dispatchEvent(new CustomEvent('uzu-data-grid-select', {
          bubbles: true,
          detail: { grid, table, row, selected, value: row.dataset.uzuGridRow || '' }
        }));
      });
      grid.addEventListener('keydown', (event) => {
        const row = event.target instanceof Element ? event.target.closest('[data-uzu-grid-row], tbody tr') : null;
        const list = rows();
        if (!row || !list.length) return;
        const index = list.indexOf(row);
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          list[(index + (event.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length].focus();
        } else if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          row.click();
        }
      });
    });
  }

  function getTreeItems(tree) {
    return getScopedControls(tree, '[data-uzu-tree-item], .uzu-tree-item', '[data-uzu-tree]');
  }

  function getTreeItemControl(item) {
    return item.querySelector('[data-uzu-tree-label], .uzu-tree-label') || item;
  }

  function getTreeItemGroup(item) {
    return item.querySelector(':scope > [role="group"], :scope > .uzu-tree-group');
  }

  function isTreeItemExpanded(item) {
    const group = getTreeItemGroup(item);
    return Boolean(group && !group.hidden);
  }

  function setTreeItemExpanded(item, expanded, emit = true) {
    const tree = item.closest('[data-uzu-tree]');
    const group = getTreeItemGroup(item);
    const toggle = item.querySelector('[data-uzu-tree-toggle], .uzu-tree-toggle');
    if (!group) return;
    group.hidden = !expanded;
    item.classList.toggle('is-open', expanded);
    item.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    if (toggle) toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    if (emit && tree) {
      tree.dispatchEvent(new CustomEvent('uzu-tree-toggle', {
        bubbles: true,
        detail: { tree, item, expanded, value: getControlValue(item, 'uzuTreeValue') }
      }));
    }
  }

  function getVisibleTreeItems(tree) {
    return getTreeItems(tree).filter((item) => {
      let parent = item.parentElement?.closest('[data-uzu-tree-item], .uzu-tree-item');
      while (parent && tree.contains(parent)) {
        if (!isTreeItemExpanded(parent)) return false;
        parent = parent.parentElement?.closest('[data-uzu-tree-item], .uzu-tree-item');
      }
      return true;
    });
  }

  function selectTreeItem(tree, item, emit = true) {
    getTreeItems(tree).forEach((control) => {
      const selected = control === item;
      control.classList.toggle('is-selected', selected);
      control.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
    tree.dataset.uzuTreeValue = getControlValue(item, 'uzuTreeValue');
    if (emit) {
      tree.dispatchEvent(new CustomEvent('uzu-tree-select', {
        bubbles: true,
        detail: { tree, item, value: tree.dataset.uzuTreeValue }
      }));
      tree.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function initTrees(root = document) {
    queryAll(root, '[data-uzu-tree]').forEach((tree) => {
      const items = getTreeItems(tree);
      if (!items.length) return;
      tree.setAttribute('role', tree.getAttribute('role') || 'tree');
      items.forEach((item) => {
        item.setAttribute('role', item.getAttribute('role') || 'treeitem');
        item.setAttribute('tabindex', item.classList.contains('is-selected') ? '0' : '-1');
        const group = getTreeItemGroup(item);
        if (group) {
          group.setAttribute('role', group.getAttribute('role') || 'group');
          if (!item.classList.contains('is-open') && item.getAttribute('aria-expanded') !== 'true') group.hidden = true;
          setTreeItemExpanded(item, !group.hidden, false);
        }
      });
      const selected = items.find((item) => item.classList.contains('is-selected')) || items[0];
      if (selected) {
        selected.setAttribute('tabindex', '0');
        selectTreeItem(tree, selected, false);
      }
      if (!markInitialized(tree, 'Tree')) return;
      tree.addEventListener('click', (event) => {
        const toggle = getScopedEventControl(event, '[data-uzu-tree-toggle], .uzu-tree-toggle', tree, '[data-uzu-tree]');
        const item = toggle ? toggle.closest('[data-uzu-tree-item], .uzu-tree-item') : getScopedEventControl(event, '[data-uzu-tree-item], .uzu-tree-item', tree, '[data-uzu-tree]');
        if (!item) return;
        if (toggle) {
          event.preventDefault();
          setTreeItemExpanded(item, !isTreeItemExpanded(item));
        } else {
          selectTreeItem(tree, item);
        }
      });
      tree.addEventListener('keydown', (event) => {
        const item = event.target instanceof Element ? event.target.closest('[data-uzu-tree-item], .uzu-tree-item') : null;
        if (!item || !tree.contains(item)) return;
        const visible = getVisibleTreeItems(tree);
        const index = visible.indexOf(item);
        let next = null;
        if (event.key === 'ArrowDown') next = visible[index + 1] || visible[0];
        else if (event.key === 'ArrowUp') next = visible[index - 1] || visible.at(-1);
        else if (event.key === 'ArrowRight') {
          if (getTreeItemGroup(item) && !isTreeItemExpanded(item)) setTreeItemExpanded(item, true);
          else next = getVisibleTreeItems(tree)[index + 1] || null;
        } else if (event.key === 'ArrowLeft') {
          if (getTreeItemGroup(item) && isTreeItemExpanded(item)) setTreeItemExpanded(item, false);
          else next = item.parentElement?.closest('[data-uzu-tree-item], .uzu-tree-item');
        } else if (event.key === 'Home') next = visible[0];
        else if (event.key === 'End') next = visible.at(-1);
        else if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectTreeItem(tree, item);
        }
        if (next) {
          event.preventDefault();
          getTreeItems(tree).forEach((control) => control.setAttribute('tabindex', control === next ? '0' : '-1'));
          next.focus();
        }
      });
    });
  }

  function initAccordions(root = document) {
    queryAll(root, '[data-uzu-accordion]').forEach((accordion) => {
      const disclosures = getScopedControls(accordion, '[data-uzu-disclosure]', '[data-uzu-accordion]');
      if (!disclosures.length) return;
      const allowMultiple = accordion.dataset.uzuAccordionMultiple === 'true';
      if (!allowMultiple) {
        let hasOpenDisclosure = false;
        disclosures.forEach((disclosure) => {
          if (!disclosure.classList.contains('is-open')) return;
          if (hasOpenDisclosure) setDisclosureState(disclosure, false, false);
          else hasOpenDisclosure = true;
        });
      }
      if (!markInitialized(accordion, 'Accordion')) return;
      disclosures.forEach((disclosure) => {
        disclosure.addEventListener('uzu-disclosure-change', (event) => {
          if (event.target !== disclosure) return;
          if (event.detail.open && !allowMultiple) {
            disclosures.forEach((item) => {
              if (item !== disclosure) setDisclosureState(item, false, false);
            });
          }
          accordion.dispatchEvent(new CustomEvent('uzu-accordion-change', {
            bubbles: true,
            detail: { accordion, disclosure, open: Boolean(event.detail.open) }
          }));
        });
      });
    });
  }

  function getHoverCardTrigger(card) {
    return card.querySelector('[data-uzu-hover-card-trigger], .uzu-hover-card-trigger');
  }

  function getHoverCardContent(card) {
    return card.querySelector('[data-uzu-hover-card-content], .uzu-hover-card-content');
  }

  function clearHoverCardTimer(card, store) {
    const timer = store.get(card);
    if (!timer) return;
    window.clearTimeout(timer);
    store.delete(card);
  }

  function setHoverCardState(card, open, emit = true) {
    const trigger = getHoverCardTrigger(card);
    const content = getHoverCardContent(card);
    if (!content) return;
    clearHoverCardTimer(card, hoverCardOpenTimers);
    clearHoverCardTimer(card, hoverCardCloseTimers);
    if (trigger) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      content.hidden = false;
      card.classList.remove('is-closing');
      card.classList.add('is-open');
    } else if (card.classList.contains('is-open')) {
      card.classList.remove('is-open');
      card.classList.add('is-closing');
      const finish = () => {
        card.classList.remove('is-closing');
        content.hidden = true;
        hoverCardCloseTimers.delete(card);
      };
      const timer = scheduleAfterAnimation([content], finish);
      if (timer) hoverCardCloseTimers.set(card, timer);
    } else {
      card.classList.remove('is-closing');
      content.hidden = true;
    }
    if (emit) {
      card.dispatchEvent(new CustomEvent(open ? 'uzu-hover-card-open' : 'uzu-hover-card-close', {
        bubbles: true,
        detail: { hoverCard: card, trigger, content }
      }));
    }
  }

  function initHoverCards(root = document) {
    queryAll(root, '[data-uzu-hover-card]').forEach((card) => {
      const trigger = getHoverCardTrigger(card);
      const content = getHoverCardContent(card);
      if (!trigger || !content) return;
      const contentId = ensureId(content, 'uzu-hover-card-content');
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.setAttribute('aria-expanded', card.classList.contains('is-open') ? 'true' : 'false');
      trigger.setAttribute('aria-controls', contentId);
      if (!card.classList.contains('is-open')) content.hidden = true;
      if (!markInitialized(card, 'HoverCard')) return;
      const openDelay = Number.isFinite(Number(card.dataset.uzuHoverCardDelay)) ? Number(card.dataset.uzuHoverCardDelay) : 120;
      const closeDelay = Number.isFinite(Number(card.dataset.uzuHoverCardCloseDelay)) ? Number(card.dataset.uzuHoverCardCloseDelay) : 120;
      const open = () => {
        clearHoverCardTimer(card, hoverCardCloseTimers);
        clearHoverCardTimer(card, hoverCardOpenTimers);
        const timer = window.setTimeout(() => setHoverCardState(card, true), openDelay);
        hoverCardOpenTimers.set(card, timer);
      };
      const close = () => {
        clearHoverCardTimer(card, hoverCardOpenTimers);
        clearHoverCardTimer(card, hoverCardCloseTimers);
        const timer = window.setTimeout(() => setHoverCardState(card, false), closeDelay);
        hoverCardCloseTimers.set(card, timer);
      };
      [trigger, content].forEach((element) => {
        element.addEventListener('mouseenter', open);
        element.addEventListener('mouseleave', close);
        element.addEventListener('focusin', open);
        element.addEventListener('focusout', close);
      });
      trigger.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          setHoverCardState(card, false);
          trigger.focus();
        }
      });
    });
  }

  function setTagSelected(tag, selected, emit = true) {
    const nextSelected = Boolean(selected);
    const previousSelected = tag.classList.contains('is-selected') || tag.getAttribute('aria-pressed') === 'true';
    tag.classList.toggle('is-selected', nextSelected);
    tag.setAttribute('aria-pressed', nextSelected ? 'true' : 'false');
    if (emit && nextSelected !== previousSelected) {
      tag.dispatchEvent(new CustomEvent('uzu-tag-change', {
        bubbles: true,
        detail: { selected: nextSelected, tag, value: getControlValue(tag, 'uzuTagValue') }
      }));
      tag.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function closeTag(tag, closeButton = null) {
    const event = new CustomEvent('uzu-tag-close', {
      bubbles: true,
      cancelable: true,
      detail: { tag, closeButton, value: getControlValue(tag, 'uzuTagValue') }
    });
    tag.dispatchEvent(event);
    if (!event.defaultPrevented) tag.hidden = true;
  }

  function isSelectableTag(tag) {
    return tag.dataset.uzuTagSelectable === 'true' || tag.hasAttribute('aria-pressed');
  }

  function initTags(root = document) {
    queryAll(root, '[data-uzu-tag]').forEach((tag) => {
      const selectable = isSelectableTag(tag);
      if (selectable) {
        if (!/^(A|BUTTON)$/i.test(tag.tagName)) {
          tag.setAttribute('role', tag.getAttribute('role') || 'button');
          tag.setAttribute('tabindex', tag.getAttribute('tabindex') || '0');
        }
        setTagSelected(tag, tag.classList.contains('is-selected') || tag.getAttribute('aria-pressed') === 'true', false);
      }
      queryAll(tag, '[data-uzu-tag-close], .uzu-tag-close').forEach((button) => {
        button.setAttribute('aria-label', button.getAttribute('aria-label') || 'Remove tag');
      });
      if (!markInitialized(tag, 'Tag')) return;
      tag.addEventListener('click', (event) => {
        const closeButton = getScopedEventControl(event, '[data-uzu-tag-close], .uzu-tag-close', tag, '[data-uzu-tag]');
        if (closeButton) {
          event.preventDefault();
          closeTag(tag, closeButton);
          return;
        }
        if (selectable && !isControlDisabled(tag)) {
          setTagSelected(tag, !(tag.classList.contains('is-selected') || tag.getAttribute('aria-pressed') === 'true'));
        }
      });
      tag.addEventListener('keydown', (event) => {
        if (!selectable || isControlDisabled(tag) || !['Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        setTagSelected(tag, !(tag.classList.contains('is-selected') || tag.getAttribute('aria-pressed') === 'true'));
      });
    });
  }

  function clampNumber(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function setSplitPaneSize(splitPane, size, emit = true) {
    const min = Number(splitPane.dataset.uzuSplitMin || 20);
    const max = Number(splitPane.dataset.uzuSplitMax || 80);
    const next = clampNumber(size, min, max);
    splitPane.style.setProperty('--uzu-split-primary-size', `${next}%`);
    splitPane.dataset.uzuSplitSize = String(next);
    const key = splitPane.dataset.uzuSplitKey;
    if (key) storage.set(`uzu-split:${key}`, String(next));
    queryAll(splitPane, '[data-uzu-split-resizer], .uzu-split-resizer').forEach((resizer) => {
      resizer.setAttribute('aria-valuenow', String(Math.round(next)));
    });
    if (emit) {
      splitPane.dispatchEvent(new CustomEvent('uzu-split-resize', {
        bubbles: true,
        detail: { splitPane, size: next }
      }));
    }
  }

  function initSplitPanes(root = document) {
    queryAll(root, '[data-uzu-split-pane]').forEach((splitPane) => {
      const resizer = splitPane.querySelector('[data-uzu-split-resizer], .uzu-split-resizer');
      if (!resizer) return;
      const orientation = splitPane.dataset.uzuSplitOrientation === 'vertical' ? 'vertical' : 'horizontal';
      splitPane.dataset.uzuSplitOrientation = orientation;
      resizer.setAttribute('role', 'separator');
      resizer.setAttribute('tabindex', resizer.getAttribute('tabindex') || '0');
      resizer.setAttribute('aria-orientation', orientation);
      const saved = splitPane.dataset.uzuSplitKey ? Number(storage.get(`uzu-split:${splitPane.dataset.uzuSplitKey}`)) : NaN;
      setSplitPaneSize(splitPane, Number.isFinite(saved) ? saved : Number(splitPane.dataset.uzuSplitSize || 50), false);
      if (!markInitialized(splitPane, 'SplitPane')) return;
      const getPointSize = (event) => {
        const rect = splitPane.getBoundingClientRect();
        const raw = orientation === 'vertical'
          ? ((event.clientY - rect.top) / rect.height) * 100
          : ((event.clientX - rect.left) / rect.width) * 100;
        return Number.isFinite(raw) ? raw : Number(splitPane.dataset.uzuSplitSize || 50);
      };
      const stopDrag = () => {
        splitPane.classList.remove('is-resizing');
        document.removeEventListener('pointermove', moveDrag);
        document.removeEventListener('pointerup', stopDrag);
      };
      const moveDrag = (event) => {
        event.preventDefault();
        setSplitPaneSize(splitPane, getPointSize(event));
      };
      resizer.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        splitPane.classList.add('is-resizing');
        document.addEventListener('pointermove', moveDrag);
        document.addEventListener('pointerup', stopDrag, { once: true });
      });
      resizer.addEventListener('keydown', (event) => {
        const keyMap = orientation === 'vertical'
          ? { ArrowUp: -2, ArrowDown: 2, Home: -100, End: 100 }
          : { ArrowLeft: -2, ArrowRight: 2, Home: -100, End: 100 };
        if (!(event.key in keyMap)) return;
        event.preventDefault();
        const current = Number(splitPane.dataset.uzuSplitSize || 50);
        const next = event.key === 'Home' ? Number(splitPane.dataset.uzuSplitMin || 20)
          : event.key === 'End' ? Number(splitPane.dataset.uzuSplitMax || 80)
            : current + keyMap[event.key];
        setSplitPaneSize(splitPane, next);
      });
    });
  }

  function setResizableSize(panel, width, height, emit = true) {
    const axis = panel.dataset.uzuResizableAxis || 'both';
    const minWidth = Number(panel.dataset.uzuResizableMinWidth || 160);
    const maxWidth = Number(panel.dataset.uzuResizableMaxWidth || 960);
    const minHeight = Number(panel.dataset.uzuResizableMinHeight || 100);
    const maxHeight = Number(panel.dataset.uzuResizableMaxHeight || 720);
    const nextWidth = clampNumber(width, minWidth, maxWidth);
    const nextHeight = clampNumber(height, minHeight, maxHeight);
    if (axis !== 'vertical') panel.style.setProperty('--uzu-resizable-width', `${nextWidth}px`);
    if (axis !== 'horizontal') panel.style.setProperty('--uzu-resizable-height', `${nextHeight}px`);
    panel.dataset.uzuResizableWidth = String(Math.round(nextWidth));
    panel.dataset.uzuResizableHeight = String(Math.round(nextHeight));
    const key = panel.dataset.uzuResizableKey;
    if (key) storage.set(`uzu-resizable:${key}`, `${Math.round(nextWidth)}:${Math.round(nextHeight)}`);
    if (emit) {
      panel.dispatchEvent(new CustomEvent('uzu-resizable-resize', {
        bubbles: true,
        detail: { resizable: panel, width: nextWidth, height: nextHeight }
      }));
    }
  }

  function initResizables(root = document) {
    queryAll(root, '[data-uzu-resizable]').forEach((panel) => {
      const handle = panel.querySelector('[data-uzu-resizable-handle], .uzu-resizable-handle');
      if (!handle) return;
      const rect = panel.getBoundingClientRect();
      const saved = panel.dataset.uzuResizableKey ? storage.get(`uzu-resizable:${panel.dataset.uzuResizableKey}`) : '';
      const [savedWidth, savedHeight] = String(saved || '').split(':').map(Number);
      setResizableSize(panel, Number.isFinite(savedWidth) ? savedWidth : Number(panel.dataset.uzuResizableWidth || rect.width || 320), Number.isFinite(savedHeight) ? savedHeight : Number(panel.dataset.uzuResizableHeight || rect.height || 180), false);
      handle.setAttribute('role', 'separator');
      handle.setAttribute('tabindex', handle.getAttribute('tabindex') || '0');
      if (!markInitialized(panel, 'Resizable')) return;
      let start = null;
      const move = (event) => {
        if (!start) return;
        event.preventDefault();
        setResizableSize(panel, start.width + event.clientX - start.x, start.height + event.clientY - start.y);
      };
      const stop = () => {
        panel.classList.remove('is-resizing');
        start = null;
        document.removeEventListener('pointermove', move);
      };
      handle.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        const bounds = panel.getBoundingClientRect();
        start = { x: event.clientX, y: event.clientY, width: bounds.width, height: bounds.height };
        panel.classList.add('is-resizing');
        document.addEventListener('pointermove', move);
        document.addEventListener('pointerup', stop, { once: true });
      });
      handle.addEventListener('keydown', (event) => {
        const currentWidth = Number(panel.dataset.uzuResizableWidth || panel.getBoundingClientRect().width);
        const currentHeight = Number(panel.dataset.uzuResizableHeight || panel.getBoundingClientRect().height);
        let width = currentWidth;
        let height = currentHeight;
        if (event.key === 'ArrowRight') width += 12;
        else if (event.key === 'ArrowLeft') width -= 12;
        else if (event.key === 'ArrowDown') height += 12;
        else if (event.key === 'ArrowUp') height -= 12;
        else return;
        event.preventDefault();
        setResizableSize(panel, width, height);
      });
    });
  }

  function createJsonNode(value, key = '') {
    const row = document.createElement('div');
    row.className = 'uzu-json-node';
    if (key) {
      const keyNode = document.createElement('span');
      keyNode.className = 'uzu-json-key';
      keyNode.textContent = `"${key}"`;
      row.append(keyNode, document.createTextNode(': '));
    }
    if (value && typeof value === 'object') {
      const isArray = Array.isArray(value);
      const entries = Object.entries(value);
      const toggle = document.createElement('button');
      toggle.className = 'uzu-json-toggle';
      toggle.type = 'button';
      toggle.textContent = isArray ? `[${entries.length}]` : `{${entries.length}}`;
      const children = document.createElement('div');
      children.className = 'uzu-json-children';
      children.dataset.uzuJsonChildren = '';
      entries.forEach(([childKey, childValue]) => children.append(createJsonNode(childValue, isArray ? '' : childKey)));
      toggle.addEventListener('click', () => {
        const collapsed = !children.hidden;
        children.hidden = collapsed;
        toggle.classList.toggle('is-collapsed', collapsed);
      });
      row.append(toggle, children);
      return row;
    }
    const valueNode = document.createElement('span');
    valueNode.className = `uzu-json-value uzu-json-${value === null ? 'null' : typeof value}`;
    valueNode.textContent = typeof value === 'string' ? `"${value}"` : String(value);
    row.append(valueNode);
    return row;
  }

  function renderJson(value) {
    const fragment = document.createDocumentFragment();
    fragment.append(createJsonNode(value));
    return fragment;
  }

  function initJsonViewers(root = document) {
    queryAll(root, '[data-uzu-json-viewer]').forEach((viewer) => {
      if (!markInitialized(viewer, 'JsonViewer')) return;
      const source = (viewer.querySelector('script[type="application/json"]')?.textContent || viewer.dataset.uzuJsonSource || viewer.textContent || '').trim();
      viewer.dataset.uzuJsonSource = source;
      try {
        const value = JSON.parse(source);
        viewer.replaceChildren(renderJson(value));
      } catch (_) {
        viewer.classList.add('is-invalid');
      }
    });
  }

  function initDiffViewers(root = document) {
    queryAll(root, '[data-uzu-diff-viewer]').forEach((viewer) => {
      if (!markInitialized(viewer, 'DiffViewer') || viewer.querySelector('.uzu-diff-line')) return;
      const source = String(viewer.textContent || '').replace(/\r\n?/g, '\n').trim();
      const lines = source.split('\n');
      viewer.replaceChildren();
      lines.forEach((line, index) => {
        const row = document.createElement('div');
        const type = line.startsWith('+') ? 'add' : line.startsWith('-') ? 'remove' : line.startsWith('@') ? 'meta' : 'context';
        row.className = `uzu-diff-line uzu-diff-line-${type}`;
        const gutter = document.createElement('span');
        gutter.className = 'uzu-diff-gutter';
        gutter.textContent = String(index + 1);
        const code = document.createElement('code');
        code.className = 'uzu-diff-code';
        code.textContent = line;
        row.append(gutter, code);
        viewer.append(row);
      });
    });
  }

  function initRichEditors(root = document) {
    queryAll(root, '[data-uzu-rich-editor]').forEach((editor) => {
      const surface = editor.querySelector('[data-uzu-editor-surface], .uzu-editor-surface');
      if (!surface) return;
      surface.setAttribute('contenteditable', surface.getAttribute('contenteditable') || 'true');
      surface.setAttribute('role', surface.getAttribute('role') || 'textbox');
      surface.setAttribute('aria-multiline', surface.getAttribute('aria-multiline') || 'true');
      if (!markInitialized(editor, 'RichEditor')) return;
      const syncToolbar = () => {
        const selection = document.getSelection();
        const selectedNode = selection?.anchorNode;
        const selectedElement = selectedNode instanceof Element ? selectedNode : selectedNode?.parentElement;
        if (!selectedElement || !surface.contains(selectedElement)) return;
        queryAll(editor, '[data-uzu-editor-command]').forEach((button) => {
          const command = button.dataset.uzuEditorCommand || '';
          const value = button.dataset.uzuEditorValue || '';
          let pressed = null;
          try {
            if (['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList'].includes(command)) {
              pressed = document.queryCommandState(command);
            } else if (command === 'formatBlock' && value) {
              pressed = String(document.queryCommandValue(command) || '').toLowerCase() === value.toLowerCase();
            }
          } catch (_) {
            pressed = null;
          }
          if (pressed === null) return;
          button.classList.toggle('is-active', pressed);
          button.setAttribute('aria-pressed', pressed ? 'true' : 'false');
        });
      };
      richEditorSyncers.set(editor, syncToolbar);
      queryAll(editor, '[data-uzu-editor-command]').forEach((button) => {
        const command = button.dataset.uzuEditorCommand || '';
        if (['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList', 'formatBlock'].includes(command)) {
          button.setAttribute('aria-pressed', button.getAttribute('aria-pressed') || 'false');
        }
        button.addEventListener('mousedown', (event) => event.preventDefault());
        button.addEventListener('click', () => {
          surface.focus();
          document.execCommand(command, false, button.dataset.uzuEditorValue || null);
          syncToolbar();
          editor.dispatchEvent(new CustomEvent('uzu-editor-change', {
            bubbles: true,
            detail: { editor, surface, value: surface.innerHTML }
          }));
          editor.dispatchEvent(new CustomEvent('uzu-editor-command', {
            bubbles: true,
            detail: { editor, surface, command, value: button.dataset.uzuEditorValue || '' }
          }));
        });
      });
      surface.addEventListener('input', () => {
        syncToolbar();
        editor.dispatchEvent(new CustomEvent('uzu-editor-change', {
          bubbles: true,
          detail: { editor, surface, value: surface.innerHTML }
        }));
      });
      surface.addEventListener('keyup', syncToolbar);
      surface.addEventListener('mouseup', syncToolbar);
      syncToolbar();
    });
  }

  function syncSelectedRichEditor() {
    const selection = document.getSelection();
    const selectedNode = selection?.anchorNode;
    const selectedElement = selectedNode instanceof Element ? selectedNode : selectedNode?.parentElement;
    const editor = selectedElement?.closest?.('[data-uzu-rich-editor]');
    const syncToolbar = editor ? richEditorSyncers.get(editor) : null;
    if (syncToolbar) syncToolbar();
  }

  function initRichEditorSelectionListener() {
    if (richEditorSelectionListenerInitialized) return;
    document.addEventListener('selectionchange', syncSelectedRichEditor);
    richEditorSelectionListenerInitialized = true;
  }

  function initMarkdownEditors(root = document) {
    queryAll(root, '[data-uzu-markdown-editor]').forEach((editor) => {
      const source = editor.querySelector('[data-uzu-markdown-source]');
      const preview = editor.querySelector('[data-uzu-markdown-preview]');
      if (!source || !preview) return;
      const render = () => {
        const sourceValue = 'value' in source ? source.value : source.textContent;
        preview.replaceChildren(renderMarkdown(sourceValue || ''));
        initCodeCopy(preview);
        editor.dispatchEvent(new CustomEvent('uzu-markdown-editor-render', {
          bubbles: true,
          detail: { editor, source, preview }
        }));
      };
      render();
      if (!markInitialized(editor, 'MarkdownEditor')) return;
      source.addEventListener('input', render);
    });
  }

  function initInlineEditors(root = document) {
    queryAll(root, '[data-uzu-inline-editor]').forEach((editor) => {
      editor.setAttribute('contenteditable', editor.getAttribute('contenteditable') || 'true');
      editor.setAttribute('role', editor.getAttribute('role') || 'textbox');
      const sync = (emit = true) => {
        editor.classList.toggle('is-empty', !editor.textContent.trim());
        if (emit) {
          editor.dispatchEvent(new CustomEvent('uzu-inline-editor-change', {
            bubbles: true,
            detail: { editor, value: editor.textContent }
          }));
        }
      };
      sync(false);
      if (!markInitialized(editor, 'InlineEditor')) return;
      editor.addEventListener('input', sync);
    });
  }

  function initEditors(root = document) {
    initRichEditors(root);
    initMarkdownEditors(root);
    initInlineEditors(root);
    initRichEditorSelectionListener();
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
      const fence = line.match(/^\s{0,3}```([\w-]*)\s*$/);
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
    queryAll(document, '[data-uzu-combobox].is-open').forEach((combobox) => {
      if (!combobox.contains(event.target)) closeCombobox(combobox);
    });
    queryAll(document, '[data-uzu-menu].is-open, [data-uzu-context-menu].is-open').forEach((menu) => {
      const trigger = getContextMenuTrigger(menu);
      if (!menu.contains(event.target) && !(trigger instanceof Element && trigger.contains(event.target))) closeMenu(menu);
    });
  }

  function handleDocumentKeydown(event) {
    if (event.key !== 'Escape') return;
    if (closeOpenMenus()) {
      event.preventDefault();
    } else if (activeDialog) {
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
    for (const fn of [initThemeToggles, initLanguageToggles, initSelects, initTabs, initSegmented, initPaginations, initSwitches, initSearches, initPasswords, initSteppers, initSliders, initMenus, initContextMenus, initMenubars, initCommands, initComboboxes, initDataGrids, initTrees, initDisclosures, initAccordions, initHoverCards, initTags, initSplitPanes, initResizables, initJsonViewers, initDiffViewers, initEditors, initDialogs, initToasts, initStepNavs, initPanelNavs, initMarkdown, initCodeCopy]) {
      try { fn(root); } catch (error) { console.error('[usuzumi]', error); }
    }
    queueIndicatorRefresh(root);
  }

  window.Usuzumi = {
    init,
    applyTheme,
    applyLanguage,
    setSwitchState,
    setPasswordVisible,
    setStepperValue,
    setComboboxValue,
    setTagSelected,
    setSplitPaneSize,
    setResizableSize,
    setTreeItemExpanded,
    renderJson,
    openMenu,
    closeMenu,
    setPaginationPage: syncPaginationState,
    setStepNavStep: syncStepNavState,
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
