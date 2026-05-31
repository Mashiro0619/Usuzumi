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
    resizeListener = () => queueIndicatorRefresh();
    window.addEventListener('resize', resizeListener);
    document.documentElement.dataset.uzuGlobalListeners = 'true';
  }

  function initAutoInit(root = document) {
    if (typeof MutationObserver === 'undefined') return;
    queryAll(root, '[data-uzu-auto-init]').forEach((container) => {
      if (autoInitObservers.has(container)) return;
      const observer = new MutationObserver((records) => {
        const added = [];
        records.forEach((record) => {
          record.addedNodes.forEach((node) => {
            if (node instanceof Element) added.push(node);
          });
        });
        if (!added.length) return;
        window.requestAnimationFrame(() => {
          if (!container.isConnected) return;
          added.forEach((node) => {
            if (node.isConnected && container.contains(node)) init(node);
          });
        });
      });
      observer.observe(container, { childList: true, subtree: true });
      autoInitObservers.set(container, observer);
    });
  }

  function isWholeDocumentRoot(root) {
    return root === document || root === document.documentElement || root === document.body;
  }

  function rootContains(root, node) {
    return root === document || root === node || (root instanceof Element && root.contains(node));
  }

  function destroy(root = document) {
    queryAll(root, '[data-uzu-auto-init]').forEach((container) => {
      const observer = autoInitObservers.get(container);
      if (observer) {
        observer.disconnect();
        autoInitObservers.delete(container);
      }
    });
    queryAll(root, '[data-uzu-panel-nav]').forEach((nav) => {
      const listener = panelNavHashListeners.get(nav);
      if (!listener) return;
      window.removeEventListener('hashchange', listener);
      panelNavHashListeners.delete(nav);
    });
    queryAll(root, '[data-uzu-tooltip]').forEach((tooltip) => {
      const description = tooltipNodes.get(tooltip);
      if (description && description.parentNode) {
        description.remove();
      }
      if (description) {
        const describedBy = (tooltip.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
        const nextDescribedBy = describedBy.filter((id) => id !== description.id).join(' ');
        if (nextDescribedBy) {
          tooltip.setAttribute('aria-describedby', nextDescribedBy);
        } else {
          tooltip.removeAttribute('aria-describedby');
        }
      }
      tooltipNodes.delete(tooltip);
    });
    [...activePointerDrags].forEach(([handle, stop]) => {
      if (!rootContains(root, handle)) return;
      try { stop(); } catch (_) {}
      handle.removeEventListener('lostpointercapture', stop);
    });
    if (isWholeDocumentRoot(root) || (dialogIsolationState && rootContains(root, dialogIsolationState.dialog))) {
      restoreDialogIsolation();
    }
    if (activeDialog && rootContains(root, activeDialog)) {
      const timer = dialogCloseTimers.get(activeDialog);
      if (timer) {
        window.clearTimeout(timer);
        dialogCloseTimers.delete(activeDialog);
      }
      activeDialog = null;
      activeDialogTrigger = null;
    }
    const dialogNodes = new Set(queryAll(root, '[data-uzu-dialog-overlay], [data-uzu-dialog]'));
    queryAll(root, '[data-uzu-dialog]').forEach((dialog) => {
      const overlay = dialog.closest('[data-uzu-dialog-overlay]');
      if (overlay) dialogNodes.add(overlay);
    });
    dialogNodes.forEach((node) => {
      const timer = dialogCloseTimers.get(node);
      if (timer) {
        window.clearTimeout(timer);
        dialogCloseTimers.delete(node);
      }
      node.classList.remove('is-open');
      node.classList.remove('is-closing');
      node.hidden = true;
    });
    if (!isWholeDocumentRoot(root)) return;
    if (themeMediaQuery) {
      if (themeMediaQuery.removeEventListener) {
        themeMediaQuery.removeEventListener('change', handleThemePreferenceChange);
      } else if (themeMediaQuery.removeListener) {
        themeMediaQuery.removeListener(handleThemePreferenceChange);
      }
      themeMediaQuery = null;
    }
    if (resizeListener) {
      window.removeEventListener('resize', resizeListener);
      resizeListener = null;
    }
    document.removeEventListener('click', handleDocumentClick);
    document.removeEventListener('keydown', handleDocumentKeydown);
    document.removeEventListener('keydown', trapDialogFocus);
    delete document.documentElement.dataset.uzuGlobalListeners;
  }

  function init(root = document) {
    syncRootClass();
    initGlobalListeners();
    for (const fn of [initThemeToggles, initLanguageToggles, initSelects, initTabs, initSegmented, initPaginations, initSwitches, initSearches, initPasswords, initSteppers, initSliders, initMenus, initContextMenus, initMenubars, initCommands, initComboboxes, initDataGrids, initTrees, initDisclosures, initAccordions, initHoverCards, initTags, initSplitPanes, initResizables, initJsonViewers, initDiffViewers, initEditors, initDialogs, initToasts, initTooltips, initStepNavs, initPanelNavs, initMarkdown, initCodeCopy]) {
      try { fn(root); } catch (error) { console.error('[usuzumi]', error); }
    }
    initAutoInit(root);
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
    closeDialog,
    destroy
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init(), { once: true });
  } else {
    init();
  }
