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
