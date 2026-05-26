(function () {
  let selectCounter = 0;

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
    document.querySelectorAll('[data-uzu-theme-toggle]').forEach((toggle) => {
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
    document.querySelectorAll('[data-uzu-theme-toggle]').forEach((toggle) => {
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

  function initThemeToggles() {
    document.querySelectorAll('[data-uzu-theme-toggle]').forEach((toggle) => {
      const root = getThemeRoot(toggle);
      const key = getThemeKey(root, toggle);
      if (root.hasAttribute('data-theme-mode')) {
        syncThemeToggles(root);
      } else {
        applyTheme(root, getInitialThemeMode(root, key), key);
      }
      toggle.addEventListener('click', () => {
        const current = getThemeMode(root.getAttribute('data-theme-mode')) || getResolvedTheme(root.getAttribute('data-theme')) || 'light';
        applyTheme(root, getNextThemeMode(current), key);
      });
    });
    initThemePreferenceListener();
  }

  function applyLanguage(root, language, key) {
    root.setAttribute('data-language', language);
    root.setAttribute('data-uzu-lang', language);
    root.setAttribute('lang', language === 'zh' ? 'zh-CN' : 'en');
    if (key) storage.set(key, language);
    document.querySelectorAll('[data-uzu-language-toggle]').forEach((toggle) => {
      const target = getLanguageRoot(toggle);
      if (target === root) {
        toggle.textContent = language === 'en' ? 'ZH' : 'EN';
        toggle.setAttribute('aria-label', language === 'en' ? 'Switch to Chinese' : 'Switch to English');
      }
    });
  }

  function getLanguageRoot(toggle) {
    try {
      return document.querySelector(toggle.dataset.uzuLanguageTarget) || document.documentElement;
    } catch (_) {
      return document.documentElement;
    }
  }

  function initLanguageToggles() {
    document.querySelectorAll('[data-uzu-language-toggle]').forEach((toggle) => {
      const root = getLanguageRoot(toggle);
      const key = toggle.dataset.uzuLanguageKey || 'usuzumi-language';
      applyLanguage(root, storage.get(key) || root.getAttribute('data-language') || 'zh', key);
      toggle.addEventListener('click', () => {
        const current = root.getAttribute('data-language') || 'zh';
        applyLanguage(root, current === 'zh' ? 'en' : 'zh', key);
      });
    });
  }

  function closeSelect(select) {
    select.classList.remove('is-open');
    select.querySelectorAll('[data-uzu-select-option]').forEach((option) => {
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
  }

  function ensureId(element, prefix) {
    if (!element.id) {
      selectCounter += 1;
      element.id = `${prefix}-${selectCounter}`;
    }
    return element.id;
  }

  function focusSelectOption(select, index) {
    const options = [...select.querySelectorAll('[data-uzu-select-option]')];
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
    const options = [...select.querySelectorAll('[data-uzu-select-option]')];
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
    const options = [...select.querySelectorAll('[data-uzu-select-option]')];
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

  function initSelects() {
    document.querySelectorAll('[data-uzu-select]').forEach((select) => {
      const trigger = select.querySelector('[data-uzu-select-trigger]');
      const options = [...select.querySelectorAll('[data-uzu-select-option]')];
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

      document.addEventListener('click', (event) => {
        if (!select.contains(event.target)) closeSelect(select);
      });

      select.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          closeSelect(select);
          trigger.focus();
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

  function initSwitches() {
    document.querySelectorAll('[data-uzu-switch]').forEach((control) => {
      const checked = control.getAttribute('aria-checked') === 'true' || control.classList.contains('is-on');
      setSwitchState(control, checked, false);
      control.addEventListener('click', () => toggleSwitch(control));
      control.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggleSwitch(control);
        }
      });
    });
  }

  function init() {
    syncRootClass();
    for (const fn of [initThemeToggles, initLanguageToggles, initSelects, initSwitches]) {
      try { fn(); } catch (e) { console.error("[usuzumi]", e); }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
