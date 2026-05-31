(() => {
  const docs = window.UsuzumiComponentDocs = window.UsuzumiComponentDocs || {};
  const { componentInterfaces, utils } = docs;
  const {
    createDocCodeBlock,
    createDocList,
    createDocText,
    firstAttributeToken,
    firstClassToken,
    firstScopeSelector,
    inlineList,
    pairValue,
    safePair,
    stripCodeSyntax,
    textPair,
    toAttributeSnippet,
    toClassName
  } = utils;

  function buildStructureCode(info, details) {
    if ((info.classes || []).includes('.uzu-json-viewer')) {
      return `<pre class="uzu-json-viewer" data-uzu-json-viewer>{
  "name": "Usuzumi",
  "modules": ["css", "runtime"]
}</pre>`;
    }
    const baseClass = firstClassToken(info.classes || []);
    const childClasses = (info.classes || []).filter((value) => String(value).startsWith('.') && value !== baseClass).slice(0, 2);
    const attr = toAttributeSnippet(firstAttributeToken([...(details.attributes || []), ...(info.classes || [])]));
    if (baseClass) {
      const base = toClassName(baseClass);
      const attrText = attr ? ` ${attr}` : '';
      if (childClasses.length) {
        const children = childClasses.map((item) => `  <div class="${toClassName(item)}"></div>`).join('\n');
        return `<div class="${base}"${attrText}>\n${children}\n</div>`;
      }
      return `<div class="${base}"${attrText}>\n  ...\n</div>`;
    }
    if (details.variables?.length) {
      return `:root {\n  ${details.variables[0]}: ...;\n}`;
    }
    return '';
  }

  function buildBehaviorCode(details) {
    const eventName = (details.events || []).find((event) => !String(event).includes('/')) || '';
    if (eventName) {
      return `element.addEventListener('${stripCodeSyntax(eventName)}', (event) => {\n  console.log(event.detail);\n});`;
    }
    const state = (details.states || []).find((item) => String(item).startsWith('.') || String(item).startsWith('aria-')) || '';
    if (state) {
      if (String(state).startsWith('.')) return `<div class="${toClassName(state)}">...</div>`;
      return `<button ${stripCodeSyntax(state)}="true">...</button>`;
    }
    return '';
  }

  function buildCustomizationCode(info, details) {
    if (details.variables?.length) {
      const scope = firstScopeSelector(details.scope || []) || firstClassToken(info.classes || []) || '.uzu-scope';
      const declarations = details.variables.slice(0, 3).map((variable) => `  ${variable}: ...;`).join('\n');
      return `${stripCodeSyntax(scope)} {\n${declarations}\n}`;
    }
    if (details.presets?.length) {
      const base = toClassName(firstClassToken(info.classes || []) || '.uzu-button');
      const preset = toClassName(firstClassToken(details.presets) || details.presets[0]);
      return `<button class="${base} ${preset}">...</button>`;
    }
    if (details.scope?.length) {
      const scope = firstScopeSelector(details.scope) || '.uzu-scope';
      return `${stripCodeSyntax(scope)} {\n  --uzu-example-token: ...;\n}`;
    }
    return '';
  }

  function buildStructureCopy(info) {
    const ownStructure = safePair(info.structure);
    if (ownStructure) return ownStructure;
    if (info.classes?.length) {
      const base = inlineList(info.classes, 1);
      const parts = inlineList(info.classes.slice(1), 3);
      return [
        parts ? `从 ${base} 开始，按完整示例组合 ${parts} 等子项。` : `从 ${base} 开始，完整示例展示可直接复制的 HTML 结构。`,
        parts ? `Start with ${base}, then compose child parts such as ${parts} from the complete example.` : `Start with ${base}; the complete example shows copy-ready HTML.`
      ];
    }
    return [
      '完整示例展示推荐 HTML 结构，外层负责语义和尺寸，内部子项负责具体内容。',
      'The complete example shows the recommended HTML: the wrapper handles semantics and sizing, and child parts hold the content.'
    ];
  }

  function buildBehaviorCopy(info, details) {
    const ownBehavior = safePair(info.behavior);
    if (ownBehavior) return ownBehavior;
    if (details.attributes?.length || details.events?.length) {
      const attribute = inlineList(details.attributes || [], 1);
      const event = inlineList(details.events || [], 2);
      return [
        `${attribute ? `添加 ${attribute} 后，` : ''}运行时会同步交互状态；${event ? `监听 ${event} 可以把变化接到项目逻辑里。` : '项目代码可以监听原生事件或更新公开状态。'}`,
        `${attribute ? `Add ${attribute}; ` : ''}the runtime syncs interaction state. ${event ? `Listen for ${event} to connect changes to application logic.` : 'Application code can listen for native events or update public states.'}`
      ];
    }
    if (details.states?.length) {
      const states = inlineList(details.states, 3);
      return [
        `状态通过 ${states} 表达，项目代码可以按这些公开状态同步界面。`,
        `State is expressed with ${states}, so application code can keep the interface in sync through public state hooks.`
      ];
    }
    return [
      '这个组件主要由 HTML 和 CSS 表达；项目代码通过公开类名、属性和原生事件同步状态。',
      'This component is mainly HTML and CSS; application code syncs state through public classes, attributes, and native events.'
    ];
  }

  function buildCustomizationCopy(info, details) {
    if (details.variables?.length) {
      const variables = inlineList(details.variables, 3);
      return [
        `把 ${variables} 写在组件外层、\`.uzu-scope\` 或 \`:root\` 上，可调整尺寸、间距、颜色或滚动范围。`,
        `Set ${variables} on the component wrapper, \`.uzu-scope\`, or \`:root\` to tune size, spacing, color, or scroll range.`
      ];
    }
    if (details.presets?.length) {
      const presets = inlineList(details.presets, 3);
      return [
        `${presets} 是可叠加的预设外观，和基础类一起使用即可切换常见变体。`,
        `${presets} are composable presets; combine them with the base class to switch common variants.`
      ];
    }
    if (details.related?.length) {
      const related = inlineList(details.related, 3);
      return [
        `${related} 是常见组合项，用来补齐内容结构、辅助文字或局部操作。`,
        `${related} are common companion parts for content structure, supporting copy, or local actions.`
      ];
    }
    return [
      '上方代码里的公开类名就是主要接入点；需要调整时优先在组件外层设置公开变量。',
      'The public classes in the example are the main integration points. Tune the component by setting public variables on the wrapper.'
    ];
  }

  function buildTutorialSections(info, key) {
    const details = componentInterfaces[key] || {};
    if (Array.isArray(info.tutorialSections) && info.tutorialSections.length) {
      return info.tutorialSections;
    }
    return [
      {
        title: ['基本结构', 'Basic Structure'],
        body: buildStructureCopy(info),
        code: buildStructureCode(info, details),
        language: 'html'
      },
      {
        title: ['交互与状态', 'Interaction And State'],
        body: buildBehaviorCopy(info, details),
        code: buildBehaviorCode(details),
        language: 'js'
      },
      {
        title: ['配置方式', 'Configuration'],
        body: buildCustomizationCopy(info, details),
        code: buildCustomizationCode(info, details),
        language: details.variables?.length || details.scope?.length ? 'css' : 'html'
      }
    ];
  }

  function createGuidance(info, key) {
    const guidance = document.createElement('aside');
    guidance.className = 'uzu-doc-guidance uzu-doc-tutorial';
    const title = document.createElement('h3');
    title.append(textPair('使用教程', 'Usage Guide'));
    guidance.append(title);
    buildTutorialSections(info, key).forEach((section) => {
      const article = document.createElement('section');
      article.className = 'uzu-doc-tutorial-section';
      const heading = document.createElement('h4');
      const sectionTitle = pairValue(section.title, '基本用法', 'Basic Usage');
      heading.append(textPair(sectionTitle[0], sectionTitle[1]));
      article.append(heading);
      if (section.body) article.append(createDocText(section.body));
      if (section.bullets?.length) article.append(createDocList(section.bullets));
      if (section.code) article.append(createDocCodeBlock(section.code, section.language));
      guidance.append(article);
    });
    return guidance;
  }

  docs.tutorial = { createGuidance };
})();