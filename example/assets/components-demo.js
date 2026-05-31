(() => {
  const docs = window.UsuzumiComponentDocs = window.UsuzumiComponentDocs || {};
  const { componentNotes, interfaceView, tutorial, utils } = docs;
  const { textPair } = utils;
  const { createGuidance } = tutorial;
  const { createInterface } = interfaceView;

  const categoryLabels = {
    Foundation: ['基础', 'Foundation'],
    Layout: ['布局', 'Layout'],
    Display: ['展示', 'Display'],
    Actions: ['操作', 'Actions'],
    Controls: ['控件', 'Controls'],
    Form: ['表单', 'Form'],
    Editing: ['编辑', 'Editing'],
    Feedback: ['反馈', 'Feedback'],
    Overlay: ['浮层', 'Overlay']
  };

  function slug(value) {
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
  }

  function getTextForLanguage(root, language) {
    const specific = root.querySelector(`[data-lang="${language}"]`);
    if (specific) return specific.textContent.trim();
    return root.textContent.trim();
  }

  function getPanelMeta(panel) {
    const label = panel.querySelector('.uzu-section-label')?.textContent.trim() || 'Components';
    const heading = panel.querySelector('.uzu-section-title, .uzu-page-title, h2, h1');
    const zh = heading ? getTextForLanguage(heading, 'zh') : panel.id.replace(/^component-/, '');
    const en = heading ? getTextForLanguage(heading, 'en') : zh;
    return { category: label, zh, en };
  }

  function appendNavSection(nav, category, panels) {
    const section = document.createElement('section');
    section.className = 'uzu-panel-nav-section';
    const titleId = `nav-${slug(category)}`;
    section.setAttribute('aria-labelledby', titleId);

    const title = document.createElement('p');
    title.className = 'uzu-panel-nav-title';
    title.id = titleId;
    const labelPair = categoryLabels[category] || [category, category];
    title.append(textPair(labelPair[0], labelPair[1]));
    section.append(title);

    panels.forEach(({ panel, meta }, index) => {
      const button = document.createElement('button');
      const target = `#${panel.id}`;
      const isActive = index === 0 && !nav.querySelector('[data-uzu-panel-target]');
      button.className = `uzu-panel-nav-button${isActive ? ' is-active' : ''}`;
      button.id = `component-tab-${panel.id.replace(/^component-/, '')}`;
      button.type = 'button';
      button.dataset.uzuPanelTarget = target;
      button.setAttribute('aria-controls', panel.id);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      button.append(textPair(meta.zh, meta.en));

      const metaLabel = document.createElement('span');
      metaLabel.className = 'uzu-panel-nav-meta';
      metaLabel.textContent = meta.en.replace(/\b(and|And)\b/g, '/').replace(/\s+/g, ' ');
      button.append(metaLabel);
      section.append(button);
    });

    nav.append(section);
  }

  function buildComponentNavigation() {
    const nav = document.querySelector('[data-uzu-component-nav]');
    if (!nav) return;
    const groups = new Map();
    document.querySelectorAll('.uzu-doc-panel').forEach((panel) => {
      const meta = getPanelMeta(panel);
      if (!groups.has(meta.category)) groups.set(meta.category, []);
      groups.get(meta.category).push({ panel, meta });
    });
    nav.replaceChildren();
    groups.forEach((panels, category) => appendNavSection(nav, category, panels));
  }

  function cleanupClone(root) {
    if (!(root instanceof Element)) return root;
    [root, ...root.querySelectorAll('[data-uzu-json-viewer]')].forEach((viewer) => {
      if (!viewer.matches('[data-uzu-json-viewer]')) return;
      const source = viewer.querySelector('script[type="application/json"]')?.textContent || viewer.dataset.uzuJsonSource;
      if (source) viewer.textContent = source.trim();
    });
    [root, ...root.querySelectorAll('*')].forEach((node) => {
      [...node.attributes].forEach((attribute) => {
        if (/^data-uzu-.*-initialized$/.test(attribute.name)) node.removeAttribute(attribute.name);
        if (/^data-uzu-(tabs|segmented)-(indicator|value)$/.test(attribute.name)) node.removeAttribute(attribute.name);
        if (attribute.name === 'role' && (attribute.value === 'tablist' || attribute.value === 'tab')) node.removeAttribute(attribute.name);
        if (attribute.name === 'tabindex' && node.classList.contains('uzu-tab')) node.removeAttribute(attribute.name);
        if (attribute.name === 'style' && /--uzu-(tabs|segmented)-indicator/.test(attribute.value)) node.removeAttribute(attribute.name);
      });
    });
    return root;
  }

  function snippetFrom(preview, extraNodes = []) {
    const container = document.createElement('div');
    [...preview.childNodes, ...extraNodes].forEach((node) => container.append(cleanupClone(node.cloneNode(true))));
    return container.innerHTML.trim().replace(/\n\s*\n/g, '\n');
  }

  function buildCodePanel(panel, preview, codeText) {
    const name = panel.id.replace('component-', '');
    const previewTabId = `${panel.id}-preview-tab`;
    const codeTabId = `${panel.id}-code-tab`;
    const demo = document.createElement('div');
    demo.className = 'uzu-doc-demo';

    const tabs = document.createElement('div');
    tabs.className = 'uzu-tabs uzu-doc-demo-tabs';
    tabs.setAttribute('data-uzu-tabs', '');
    tabs.setAttribute('aria-label', 'Preview and code');

    const previewTab = document.createElement('button');
    previewTab.className = 'uzu-tab is-active';
    previewTab.id = previewTabId;
    previewTab.type = 'button';
    previewTab.dataset.uzuTabValue = 'preview';
    previewTab.dataset.uzuTabTarget = `#${panel.id}-preview`;
    previewTab.setAttribute('aria-controls', `${panel.id}-preview`);
    previewTab.setAttribute('aria-selected', 'true');
    previewTab.append(textPair('预览', 'Preview'));

    const codeTab = document.createElement('button');
    codeTab.className = 'uzu-tab';
    codeTab.id = codeTabId;
    codeTab.type = 'button';
    codeTab.dataset.uzuTabValue = 'code';
    codeTab.dataset.uzuTabTarget = `#${panel.id}-code`;
    codeTab.setAttribute('aria-controls', `${panel.id}-code`);
    codeTab.setAttribute('aria-selected', 'false');
    codeTab.append(textPair('代码', 'Code'));

    tabs.append(previewTab, codeTab);

    const previewPanel = document.createElement('div');
    previewPanel.className = 'uzu-doc-preview';
    previewPanel.id = `${panel.id}-preview`;
    previewPanel.setAttribute('role', 'tabpanel');
    previewPanel.setAttribute('aria-labelledby', previewTabId);
    previewPanel.append(preview);

    const codePanel = document.createElement('div');
    codePanel.className = 'uzu-doc-code-panel';
    codePanel.id = `${panel.id}-code`;
    codePanel.setAttribute('role', 'tabpanel');
    codePanel.setAttribute('aria-labelledby', codeTabId);
    codePanel.hidden = true;
    const pre = document.createElement('pre');
    pre.className = 'uzu-code-block-body uzu-scroll';
    const code = document.createElement('code');
    code.textContent = codeText || `<!-- ${name} -->`;
    pre.append(code);

    const codeShell = document.createElement('div');
    codeShell.className = 'uzu-code-block';
    const copyButton = document.createElement('button');
    copyButton.className = 'uzu-icon-button uzu-code-block-copy';
    copyButton.type = 'button';
    copyButton.setAttribute('aria-label', 'Copy code');
    copyButton.setAttribute('data-uzu-code-copy', '');
    copyButton.dataset.uzuCopyText = 'Copy';
    copyButton.dataset.uzuCopiedText = 'Copied';
    copyButton.dataset.uzuCopyFailedText = 'Copy failed';
    copyButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><rect x="8" y="8" width="10" height="10" rx="1.8" stroke="currentColor" stroke-width="1.7"/><path d="M6 15H5.8A1.8 1.8 0 0 1 4 13.2V5.8A1.8 1.8 0 0 1 5.8 4h7.4A1.8 1.8 0 0 1 15 5.8V6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
    const copyZh = document.createElement('span');
    const copyEn = document.createElement('span');
    copyZh.dataset.lang = 'zh';
    copyZh.dataset.uzuCodeCopyLabel = '';
    copyZh.dataset.uzuCopyText = '复制';
    copyZh.dataset.uzuCopiedText = '已复制';
    copyZh.dataset.uzuCopyFailedText = '复制失败';
    copyZh.textContent = '复制';
    copyEn.dataset.lang = 'en';
    copyEn.dataset.uzuCodeCopyLabel = '';
    copyEn.dataset.uzuCopyText = 'Copy';
    copyEn.dataset.uzuCopiedText = 'Copied';
    copyEn.dataset.uzuCopyFailedText = 'Copy failed';
    copyEn.textContent = 'Copy';
    copyButton.append(copyZh, copyEn);
    codeShell.append(pre, copyButton);
    codePanel.append(codeShell);

    demo.append(tabs, previewPanel, codePanel);
    return demo;
  }

  function enhancePanel(panel) {
    const key = panel.id.replace('component-', '');
    const info = componentNotes[key];
    const heading = panel.querySelector('.uzu-section-head');
    const preview = panel.querySelector(':scope > .uzu-doc-example, :scope > .uzu-callout, :scope > .uzu-popover, :scope > .uzu-type-list');
    let demo = null;
    if (preview) {
      const extraNodes = ['dialog', 'alert-dialog', 'drawer'].includes(key) ? [...panel.querySelectorAll(':scope > .uzu-dialog-overlay')] : [];
      const codeText = snippetFrom(preview, extraNodes);
      const placeholder = document.createComment(`${panel.id}-demo`);
      preview.before(placeholder);
      demo = buildCodePanel(panel, preview, codeText);
      placeholder.replaceWith(demo);
    }
    if (info && heading) {
      const block = document.createElement('div');
      block.className = 'uzu-doc-guidance-block';
      block.append(createGuidance(info, key), createInterface(info, key));
      (demo || heading).after(block);
    }
  }

  function applyInitialHash() {
    const target = window.location.hash;
    if (!target) return;
    let panel = null;
    try {
      panel = document.querySelector(target);
    } catch (_) {
      panel = null;
    }
    const control = document.querySelector(`[data-uzu-panel-target="${target}"]`);
    if (!panel || !control) return;
    document.querySelectorAll('.uzu-doc-panel').forEach((item) => {
      item.hidden = item !== panel;
    });
    document.querySelectorAll('[data-uzu-panel-target^="#component-"]').forEach((item) => {
      const active = item === control;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function enhanceComponentDocs() {
    buildComponentNavigation();
    document.querySelectorAll('.uzu-doc-panel').forEach(enhancePanel);
    applyInitialHash();
    if (window.Usuzumi) window.Usuzumi.init(document);
  }

  docs.demo = {
    buildComponentNavigation,
    enhancePanel,
    applyInitialHash,
    enhanceComponentDocs
  };
})();
