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
