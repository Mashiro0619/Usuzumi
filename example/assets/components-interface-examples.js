(() => {
  const docs = window.UsuzumiComponentDocs = window.UsuzumiComponentDocs || {};
  const {
    firstClassToken,
    stripCodeSyntax,
    toClassName
  } = docs.utils;

  function sampleCssValue(variable) {
    const token = stripCodeSyntax(variable).toLowerCase();
    if (token.includes('font-serif')) return '"Iowan Old Style", Georgia, serif';
    if (token.includes('font-signature')) return 'Meddon, cursive';
    if (token.includes('font-mono')) return 'ui-monospace, SFMono-Regular, monospace';
    if (token.includes('ease')) return 'cubic-bezier(.2, 0, 0, 1)';
    if (token.includes('motion-quick')) return '120ms';
    if (token.includes('motion-slow')) return '320ms';
    if (token.includes('motion')) return '180ms';
    if (token.includes('max-width')) return '1040px';
    if (token.includes('width')) return '320px';
    if (token.includes('min-height') || token.includes('height')) return '180px';
    if (token.includes('gap')) return '12px';
    if (token.includes('space')) return '16px';
    if (token.includes('radius')) return '10px';
    if (token.includes('padding')) return '16px';
    if (token.includes('stroke')) return '2px';
    if (token.includes('size')) return '36px';
    if (token.includes('value')) return '64%';
    if (token.includes('indent')) return '20px';
    if (token.includes('danger')) return '#7f3730';
    if (token.includes('warning')) return '#7a5a1e';
    if (token.includes('success')) return '#3f6f4a';
    if (token.includes('info')) return '#46616f';
    if (token.includes('border')) return '#d8d6ce';
    if (token.includes('surface') || token.includes('bg')) return '#f4f3f0';
    if (token.includes('muted') || token.includes('subtle') || token.includes('soft')) return '#686866';
    return 'var(--uzu-fg)';
  }

  function sampleAttributeValue(attribute) {
    const value = stripCodeSyntax(attribute);
    if (value.includes('=')) return value;
    if (value === 'script[type="application/json"]') return '<script type="application/json">{"name":"Usuzumi"}<\/script>';
    if (value === 'input[type="range"]') return '<input class="uzu-slider" type="range" min="0" max="100" value="64">';
    if (value === 'type="checkbox"' || value === 'type="radio"') return `<input ${value}>`;
    if (/name for radio groups/i.test(value)) return 'name="density"';
    if (value.endsWith('-target') || value.includes('dialog-target') || value.includes('pagination-target')) return `${value}="#panel-id"`;
    if (value.endsWith('-name')) return `${value}="fieldName"`;
    if (value.endsWith('-value') || value.endsWith('-row') || value.endsWith('-page')) return `${value}="value"`;
    if (value.endsWith('-key')) return `${value}="local-storage-key"`;
    if (value.endsWith('-min')) return `${value}="20"`;
    if (value.endsWith('-max')) return `${value}="80"`;
    if (value.endsWith('-size')) return `${value}="48"`;
    if (value.endsWith('-axis')) return `${value}="both"`;
    if (value.endsWith('-orientation')) return `${value}="horizontal"`;
    if (value.endsWith('-delay') || value.endsWith('-close-delay') || value.endsWith('-timeout')) return `${value}="120"`;
    if (value.startsWith('aria-')) return `${value}="true"`;
    if (value.startsWith('role')) return value;
    if (value.startsWith('data-uzu-')) return value;
    return value;
  }

  function sampleStateValue(state, context = {}) {
    const value = stripCodeSyntax(state);
    const base = toClassName(firstClassToken(context.classes || []) || '.uzu-button');
    if (value.startsWith('.')) return `<div class="${base} ${toClassName(value)}">...</div>`;
    if (value.startsWith(':disabled')) return '<button class="uzu-button" disabled>...</button>';
    if (value.startsWith(':checked')) return '<input type="checkbox" checked>';
    if (value.startsWith(':focus-visible')) return 'element.focus()';
    if (value.startsWith('[hidden]')) return '<div hidden>...</div>';
    if (value.startsWith('aria-')) return `<button ${value}="true">...</button>`;
    if (value.includes('=')) return `<button ${value}>...</button>`;
    if (/min|max|step/.test(value)) return '<input type="number" min="1" max="9" step="1">';
    if (/contenteditable/.test(value)) return '<div contenteditable="true" role="textbox"></div>';
    if (/horizontal scroll/i.test(value)) return '<div class="uzu-table-wrap">...</div>';
    return value;
  }

  function buildInterfaceExample(name, item, context = {}) {
    const value = stripCodeSyntax(item);
    const base = toClassName(firstClassToken(context.classes || []) || '.uzu-button');
    if (name === 'variables') return `${value}: ${sampleCssValue(value)};`;
    if (name === 'scope') {
      if (value === ':root') return ':root { --uzu-motion-base: 180ms; }';
      if (value === '.uzu-app') return '.uzu-app { --uzu-page-max-width: 1080px; }';
      if (value === '.uzu-scope') return '.uzu-scope { --uzu-card-block-gap: 12px; }';
      if (/local wrapper/i.test(value)) return '.settings-panel { --uzu-field-gap: 6px; }';
      if (value.includes('.uzu-section-centered')) return '<section class="uzu-section uzu-section-centered">...</section>';
      if (value.includes('grid-template-columns')) return '.uzu-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }';
      if (value.startsWith('.')) return `${value} { --uzu-example-token: 12px; }`;
      return value;
    }
    if (name === 'base') {
      if (value.startsWith('--')) return `${value}: ${sampleCssValue(value)};`;
      if (value.startsWith('.')) return `<div class="${toClassName(value)}">...</div>`;
      if (value.startsWith('[')) return `<div ${value.slice(1, -1)}></div>`;
      return value;
    }
    if (name === 'attributes') return sampleAttributeValue(value);
    if (name === 'events') return `element.addEventListener('${value}', (event) => {\n  console.log(event.detail);\n});`;
    if (name === 'states') return sampleStateValue(value, context);
    if (name === 'presets') {
      const preset = toClassName(value);
      if (value === '.uzu-icon-button') return '<button class="uzu-icon-button" aria-label="Search">...</button>';
      if (value === '.uzu-activity') return '<span class="uzu-activity" role="status">Syncing</span>';
      if (value === '.uzu-separator') return '<hr class="uzu-separator">';
      if (value === '.uzu-separator-vertical') return '<span class="uzu-separator-vertical" aria-hidden="true"></span>';
      return `<div class="${base} ${preset}">...</div>`;
    }
    if (name === 'related') {
      if (value.startsWith('.')) return `<div class="${toClassName(value)}">...</div>`;
      if (value.includes('>')) return `<${value.split(' ')[0].replace(/[>.].*$/, '')}>...</${value.split(' ')[0].replace(/[>.].*$/, '')}>`;
      return value;
    }
    if (name === 'files') {
      if (value.endsWith('.css')) return `<link rel="stylesheet" href="${value}">`;
      if (value.endsWith('.js')) return `<script src="${value}"><\/script>`;
      return value;
    }
    return value;
  }

  docs.interfaceExamples = { buildInterfaceExample };
})();
