  function syncTabsState(tabsRoot, activeTab, emit = true) {
    const tabs = getScopedControls(tabsRoot, '.uzu-tab', '[data-uzu-tabs]');
    const enabled = getEnabledControls(tabs);
    const nextTab = activeTab && !isControlDisabled(activeTab) ? activeTab : enabled[0];
    if (!nextTab) return;
    const previousValue = tabsRoot.dataset.uzuTabsValue || '';
    const value = getControlValue(nextTab, 'uzuTabValue');
    let panel = null;

    if (!tabsRoot.hasAttribute('role')) tabsRoot.setAttribute('role', 'tablist');
    tabs.forEach((tab, index) => {
      const isActive = tab === nextTab;
      const tabPanel = getTabPanel(tab);
      if (tabPanel) {
        const panelId = tabPanel.id || ensureId(tabPanel, `${tabsRoot.id || 'uzu-tabs'}-panel-${index + 1}`);
        const tabId = tab.id || ensureId(tab, `${tabsRoot.id || 'uzu-tabs'}-tab-${index + 1}`);
        tab.setAttribute('aria-controls', panelId);
        tabPanel.setAttribute('role', 'tabpanel');
        tabPanel.setAttribute('aria-labelledby', tabId);
      }
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
