(() => {
  const docs = window.UsuzumiComponentDocs = window.UsuzumiComponentDocs || {};
  const {
    componentInterfaces,
    interfaceDescriptions,
    interfaceExamples,
    interfaceLabels,
    utils
  } = docs;
  const {
    createDocText,
    stripCodeSyntax,
    textPair
  } = utils;
  const { descriptions, describeInterfaceItem } = interfaceDescriptions;
  const { buildInterfaceExample } = interfaceExamples;

  function uniqueInterfaceValues(values = [], used = new Set()) {
    const next = [];
    values.forEach((item) => {
      const key = stripCodeSyntax(item);
      if (!key || used.has(key)) return;
      used.add(key);
      next.push(item);
    });
    return next;
  }

  function createInterfaceExample(item, name, context) {
    const example = buildInterfaceExample(name, item, context);
    if (!example) return null;
    const code = document.createElement('code');
    code.className = 'uzu-code uzu-doc-interface-example';
    code.textContent = example;
    return code;
  }

  function createInterfaceGroup(name, label, values, context = {}) {
    if (!values || !values.length) return null;
    const group = document.createElement('div');
    group.className = 'uzu-doc-interface-group';
    const head = document.createElement('div');
    head.className = 'uzu-doc-interface-group-head';
    const title = document.createElement('p');
    title.className = 'uzu-doc-interface-label';
    title.append(textPair(label[0], label[1]));
    const description = createDocText(descriptions[name] || ['这些公开项可以直接在项目代码中使用。', 'These public items can be used directly in application code.'], 'uzu-doc-interface-description');
    head.append(title, description);

    const tableWrap = document.createElement('div');
    tableWrap.className = 'uzu-table-wrap uzu-doc-interface-table-wrap';
    const table = document.createElement('table');
    table.className = 'uzu-table uzu-doc-interface-table';
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    [
      ['接口', 'Interface'],
      ['作用', 'Purpose'],
      ['示例', 'Example']
    ].forEach(([zh, en]) => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.append(textPair(zh, en));
      headerRow.append(th);
    });
    thead.append(headerRow);

    const tbody = document.createElement('tbody');
    values.forEach((item) => {
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      const purposeCell = document.createElement('td');
      const exampleCell = document.createElement('td');
      const code = document.createElement('code');
      code.className = 'uzu-code uzu-doc-interface-name';
      code.textContent = item;
      const itemText = createDocText(describeInterfaceItem(name, item, context), 'uzu-doc-interface-item-text');
      const example = createInterfaceExample(item, name, context);
      nameCell.append(code);
      purposeCell.append(itemText);
      if (example) exampleCell.append(example);
      row.append(nameCell, purposeCell, exampleCell);
      tbody.append(row);
    });
    table.append(thead, tbody);
    tableWrap.append(table);
    group.append(head, tableWrap);
    return group;
  }

  function createInterface(info, key) {
    const details = componentInterfaces[key] || {};
    const panel = document.createElement('aside');
    panel.className = 'uzu-doc-interface';
    const title = document.createElement('h3');
    title.append(textPair('可配置项', 'Configurable Parts'));
    panel.append(title);
    const noteItems = info.classes || [];
    const baseItems = noteItems.filter((item) => !stripCodeSyntax(item).startsWith('--'));
    const variableItems = [
      ...noteItems.filter((item) => stripCodeSyntax(item).startsWith('--')),
      ...(details.variables || [])
    ];
    const groups = [
      ['base', baseItems],
      ['variables', variableItems],
      ['attributes', details.attributes],
      ['events', details.events],
      ['states', details.states],
      ['presets', details.presets],
      ['related', details.related],
      ['files', details.files],
      ['scope', details.scope]
    ];
    const used = new Set();
    groups.forEach(([name, values]) => {
      const groupValues = uniqueInterfaceValues(values, used);
      const group = createInterfaceGroup(name, interfaceLabels[name], groupValues, { info, details, classes: info.classes || [] });
      if (group) panel.append(group);
    });
    return panel;
  }

  docs.interfaceView = { createInterface };
})();
