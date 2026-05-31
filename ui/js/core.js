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
  const autoInitObservers = new WeakMap();
  const panelNavHashListeners = new WeakMap();
  const tooltipNodes = new WeakMap();
  const activePointerDrags = new Map();
  let themeMediaQuery = null;
  let resizeListener = null;
  let dialogIsolationState = null;
  let dialogScrollLockState = null;

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
    themeMediaQuery = media;
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
