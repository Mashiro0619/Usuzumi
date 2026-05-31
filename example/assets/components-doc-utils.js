(() => {
  const docs = window.UsuzumiComponentDocs = window.UsuzumiComponentDocs || {};

  function appendDocInline(parent, value) {
    const pattern = /(`[^`]+`)/g;
    String(value || '').split(pattern).forEach((part) => {
      if (!part) return;
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        const code = document.createElement('code');
        code.className = 'uzu-code uzu-doc-inline-code';
        code.textContent = part.slice(1, -1);
        parent.append(code);
        return;
      }
      parent.append(document.createTextNode(part));
    });
  }

  function textPair(zh, en) {
    const fragment = document.createDocumentFragment();
    const zhSpan = document.createElement('span');
    const enSpan = document.createElement('span');
    zhSpan.dataset.lang = 'zh';
    enSpan.dataset.lang = 'en';
    appendDocInline(zhSpan, zh);
    appendDocInline(enSpan, en);
    fragment.append(zhSpan, enSpan);
    return fragment;
  }

  function pairValue(value, fallbackZh = '', fallbackEn = '') {
    if (Array.isArray(value)) return [value[0] || fallbackZh, value[1] || value[0] || fallbackEn || fallbackZh];
    if (typeof value === 'string') return [value, value];
    return [fallbackZh, fallbackEn || fallbackZh];
  }

  function createDocText(value, className = 'uzu-text') {
    const paragraph = document.createElement('p');
    paragraph.className = className;
    const pair = pairValue(value);
    paragraph.append(textPair(pair[0], pair[1]));
    return paragraph;
  }

  function createDocList(items = []) {
    const list = document.createElement('ul');
    list.className = 'uzu-doc-tutorial-list';
    items.forEach((item) => {
      const li = document.createElement('li');
      const pair = pairValue(item);
      li.append(textPair(pair[0], pair[1]));
      list.append(li);
    });
    return list;
  }

  function safePair(value) {
    if (value == null) return null;
    const pair = pairValue(value);
    if (!pair.some((item) => String(item || '').trim())) return null;
    return pair;
  }

  function inlineList(values = [], limit = 3) {
    return values.slice(0, limit).map((value) => `\`${value}\``).join('、');
  }

  function stripCodeSyntax(value) {
    return String(value || '').replace(/^`|`$/g, '');
  }

  function firstClassToken(values = []) {
    return values.find((value) => String(value).startsWith('.')) || '';
  }

  function firstAttributeToken(values = []) {
    return values.find((value) => /^data-uzu-|^aria-|^role=/.test(String(value))) || '';
  }

  function firstScopeSelector(values = []) {
    return values.find((value) => /^(:root|\.[A-Za-z0-9_-]+)$/.test(String(value))) || '';
  }

  function toClassName(token) {
    return String(token || '').replace(/^\./, '').trim();
  }

  function toAttributeSnippet(token) {
    const value = stripCodeSyntax(token);
    if (!value) return '';
    if (value.startsWith('[') && value.endsWith(']')) return value.slice(1, -1);
    if (/^[\w:-]+="[^"]*"$/.test(value)) return value;
    if (/^data-uzu-|^aria-/.test(value)) return value;
    if (/^role=/.test(value)) return value;
    return '';
  }

  function createDocCodeBlock(codeText, language = '') {
    const shell = document.createElement('div');
    shell.className = 'uzu-code-block uzu-doc-tutorial-code';
    const pre = document.createElement('pre');
    pre.className = 'uzu-code-block-body uzu-scroll';
    const code = document.createElement('code');
    if (language) code.className = `language-${language}`;
    code.textContent = String(codeText || '').trim();
    pre.append(code);

    const button = document.createElement('button');
    button.className = 'uzu-icon-button uzu-code-block-copy';
    button.type = 'button';
    button.setAttribute('aria-label', 'Copy code');
    button.setAttribute('data-uzu-code-copy', '');
    button.dataset.uzuCopyText = 'Copy';
    button.dataset.uzuCopiedText = 'Copied';
    button.dataset.uzuCopyFailedText = 'Copy failed';
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><rect x="8" y="8" width="10" height="10" rx="1.8" stroke="currentColor" stroke-width="1.7"/><path d="M6 15H5.8A1.8 1.8 0 0 1 4 13.2V5.8A1.8 1.8 0 0 1 5.8 4h7.4A1.8 1.8 0 0 1 15 5.8V6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg><span data-uzu-code-copy-label>Copy</span>';
    shell.append(pre, button);
    return shell;
  }

  docs.utils = {
    appendDocInline,
    textPair,
    pairValue,
    createDocText,
    createDocList,
    safePair,
    inlineList,
    stripCodeSyntax,
    firstClassToken,
    firstAttributeToken,
    firstScopeSelector,
    toClassName,
    toAttributeSnippet,
    createDocCodeBlock
  };
})();