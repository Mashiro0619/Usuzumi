(() => {
  const docs = window.UsuzumiComponentDocs = window.UsuzumiComponentDocs || {};
  const { firstClassToken, stripCodeSyntax } = docs.utils;

  const descriptions = {
    base: ['这些类名是组件的入口和子结构。外层类决定组件类型，子项类决定内容、操作和辅助区域。', 'These classes are the component entry and child structure. The wrapper class defines the component, while child classes define content, actions, and supporting areas.'],
    variables: ['CSS 变量写在组件外层、作用域容器或 :root 上，用来调整尺寸、间距、颜色和滚动范围。', 'Set CSS variables on the wrapper, scoped container, or :root to tune size, spacing, color, and scroll range.'],
    attributes: ['data-uzu-* 启用运行时行为；ARIA 与原生属性表达当前值、展开状态和可访问语义。', 'data-uzu-* enables runtime behavior; ARIA and native attributes express current value, expansion state, and accessible semantics.'],
    events: ['这些事件把选择、打开、关闭、输入和渲染结果交给项目代码处理。', 'These events pass selection, open, close, input, and render results to application code.'],
    states: ['这些状态会出现在 DOM 或计算样式中，可用于调试，也可让项目代码读取当前状态。', 'These states appear in the DOM or computed styles for debugging and for application code that needs to read current state.'],
    presets: ['预设类用于常见视觉变体，和基础类叠加即可切换外观。', 'Preset classes cover common visual variants and compose with the base class.'],
    related: ['这些组合项通常和主组件一起出现，用来补齐布局、说明、按钮或局部内容。', 'These related parts commonly appear with the component to provide layout, copy, buttons, or local content.'],
    files: ['按需引入这些文件；主样式和可选字体资源可以分开加载。', 'Load these files as needed; the main styles and optional font assets can be included separately.'],
    scope: ['作用域决定覆盖范围。把变量放在更小的容器上，可以只影响局部示例或某一块界面。', 'Scope controls reach. Put variables on a smaller wrapper to affect only a local demo or one interface region.']
  };

  function describeVariable(item) {
    const token = stripCodeSyntax(item);
    const lower = token.toLowerCase();
    if (lower.includes('max-width')) return ['控制最大宽度，常写在页面或组件外层。', 'Controls max width, usually set on the page or component wrapper.'];
    if (lower.includes('width')) return ['控制宽度或可视区域宽度。', 'Controls width or visible area width.'];
    if (lower.includes('height')) return ['控制高度、最大高度或可调整区域高度。', 'Controls height, max height, or resizable area height.'];
    if (lower.includes('gap') || lower.includes('space')) return ['控制元素之间的间距。', 'Controls spacing between elements.'];
    if (lower.includes('radius')) return ['控制圆角大小。', 'Controls corner radius.'];
    if (lower.includes('font')) return ['控制字体族或字体资源。', 'Controls the font family or font resource.'];
    if (lower.includes('motion') || lower.includes('ease')) return ['控制状态切换和过程动画的速度或缓动。', 'Controls timing or easing for state transitions and process motion.'];
    if (lower.includes('bg') || lower.includes('surface') || lower.includes('color') || lower.includes('border') || lower.includes('danger') || lower.includes('warning') || lower.includes('success') || lower.includes('info')) return ['控制背景、边框或语义色。', 'Controls background, border, or semantic color.'];
    if (lower.includes('padding')) return ['控制内部留白。', 'Controls internal padding.'];
    if (lower.includes('size')) return ['控制组件或图形标记的尺寸。', 'Controls component or marker size.'];
    if (lower.includes('value')) return ['表达当前数值，通常由项目代码或运行时更新。', 'Represents the current value, usually updated by app code or the runtime.'];
    return ['可在组件外层、作用域容器或 :root 上覆盖。', 'Can be overridden on the component wrapper, scoped container, or :root.'];
  }

  function describeInterfaceItem(name, item, context = {}) {
    const value = stripCodeSyntax(item);
    const baseClass = firstClassToken(context.classes || []);
    if (name === 'variables') return describeVariable(value);
    if (name === 'scope') {
      if (value === ':root') return ['设置全站默认值，适合主题级颜色、字体和运动参数。', 'Sets site-wide defaults for theme colors, fonts, and motion.'];
      if (value === '.uzu-app') return ['限制在完整 Usuzumi 应用外层内生效。', 'Applies within a full Usuzumi application wrapper.'];
      if (value === '.uzu-scope') return ['限制在局部迁移或嵌入区域内生效。', 'Applies within a scoped migration or embedded region.'];
      if (/local wrapper/i.test(value)) return ['写在任意局部容器上，只影响该容器里的组件。', 'Set it on any local wrapper to affect only components inside that wrapper.'];
      return ['决定覆盖范围，适合把变量或状态限制在局部界面。', 'Defines the reach of variables or state for a local interface region.'];
    }
    if (name === 'base') {
      if (value.startsWith('--')) return describeVariable(value);
      if (value === baseClass) return ['组件外层入口类，决定主要布局、边框、背景和状态范围。', 'The wrapper entry class; it defines layout, border, background, and state scope.'];
      if (value.startsWith('.')) return ['组件子结构类，用来承载内容、辅助文字或局部操作。', 'A child structure class for content, supporting text, or local actions.'];
      if (value.startsWith('[')) return ['运行时入口属性，写在外层或控制元素上启用行为。', 'Runtime entry attribute; set it on the wrapper or control to enable behavior.'];
      return ['公开接口项，可直接写在 HTML 或 CSS 中。', 'A public interface item that can be used directly in HTML or CSS.'];
    }
    if (name === 'attributes') {
      if (value.startsWith('data-uzu-')) return ['启用或配置 Usuzumi 运行时行为。', 'Enables or configures Usuzumi runtime behavior.'];
      if (value.startsWith('aria-')) return ['表达可访问状态，让辅助技术读取当前值或关系。', 'Expresses accessible state so assistive technology can read value or relationship.'];
      if (value.startsWith('role=')) return ['声明语义角色，补齐自定义结构的可访问含义。', 'Declares semantic role for custom structures.'];
      return ['原生属性或 ARIA 属性，用来传递值、约束或语义。', 'A native or ARIA attribute for value, constraints, or semantics.'];
    }
    if (name === 'events') {
      if (value.startsWith('uzu-')) return ['Usuzumi 自定义事件，可从 event.detail 读取组件状态。', 'A Usuzumi custom event; read component state from event.detail.'];
      return ['浏览器原生事件，可按普通表单或控件逻辑监听。', 'A native browser event that can be handled with normal form or control logic.'];
    }
    if (name === 'states') {
      if (value.startsWith('.')) return ['状态类，由组件或项目代码切换，用于视觉状态和调试。', 'A state class toggled by the component or app code for visual state and debugging.'];
      if (value.startsWith('aria-')) return ['可访问状态属性，和视觉状态保持同步。', 'An accessible state attribute kept in sync with visual state.'];
      if (value.startsWith(':')) return ['浏览器伪类状态，来自焦点、悬浮、禁用或选中等交互。', 'A browser pseudo-class state from focus, hover, disabled, or selection.'];
      return ['公开状态值，可被样式、测试或项目代码读取。', 'A public state value readable by styles, tests, or app code.'];
    }
    if (name === 'presets') return ['和基础类叠加使用，快速切换常见外观。', 'Compose it with the base class to switch a common visual variant.'];
    if (name === 'related') return ['常和主组件一起使用，补齐布局、内容或操作。', 'Commonly used with the main component for layout, content, or actions.'];
    if (name === 'files') return ['按需加载的文件入口。', 'A file entry to load as needed.'];
    return ['公开项，可直接在项目代码中使用。', 'A public item that can be used directly in application code.'];
  }

  docs.interfaceDescriptions = {
    descriptions,
    describeInterfaceItem
  };
})();
