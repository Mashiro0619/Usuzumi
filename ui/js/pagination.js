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
