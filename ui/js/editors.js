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
      if (!markInitialized(editor, 'RichEditor')) return;
      queryAll(editor, '[data-uzu-editor-command]').forEach((button) => {
        const command = button.dataset.uzuEditorCommand || '';
        const value = button.dataset.uzuEditorValue || '';
        if (button.hasAttribute('data-uzu-editor-toggle') && !button.hasAttribute('aria-pressed')) {
          button.setAttribute('aria-pressed', button.getAttribute('aria-pressed') || 'false');
        }
        button.addEventListener('click', () => {
          if (surface && typeof surface.focus === 'function') surface.focus({ preventScroll: true });
          editor.dispatchEvent(new CustomEvent('uzu-editor-command', {
            bubbles: true,
            detail: { editor, surface, button, command, value }
          }));
        });
      });
      if (surface) {
        surface.addEventListener('input', () => {
          const value = 'value' in surface ? surface.value : surface.innerHTML;
          editor.dispatchEvent(new CustomEvent('uzu-editor-change', {
            bubbles: true,
            detail: { editor, surface, value }
          }));
        });
      }
    });
  }

  function shouldRenderMarkdownEditor(editor) {
    const value = editor.getAttribute('data-uzu-markdown-render');
    return value !== null && value !== 'false';
  }

  function initMarkdownEditors(root = document) {
    queryAll(root, '[data-uzu-markdown-editor]').forEach((editor) => {
      const source = editor.querySelector('[data-uzu-markdown-source]');
      const preview = editor.querySelector('[data-uzu-markdown-preview]');
      if (!source) return;
      const getSourceValue = () => {
        return 'value' in source ? source.value : source.textContent;
      };
      const render = (sourceValue = getSourceValue()) => {
        if (!preview) return;
        const value = sourceValue || '';
        editor.dataset.uzuMarkdownValue = value;
        preview.replaceChildren(renderMarkdown(value));
        initCodeCopy(preview);
        editor.dispatchEvent(new CustomEvent('uzu-markdown-editor-render', {
          bubbles: true,
          detail: { editor, source, preview, value }
        }));
      };
      if (shouldRenderMarkdownEditor(editor)) render();
      if (!markInitialized(editor, 'MarkdownEditor')) return;
      source.addEventListener('input', () => {
        const value = getSourceValue() || '';
        editor.dataset.uzuMarkdownValue = value;
        editor.dispatchEvent(new CustomEvent('uzu-markdown-editor-change', {
          bubbles: true,
          detail: { editor, source, preview, value }
        }));
        if (shouldRenderMarkdownEditor(editor)) render(value);
      });
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
  }
