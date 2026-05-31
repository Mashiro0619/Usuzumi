export const consumerFoundationHtml = `    <section id="consumer-page-width" class="uzu-page" style="--uzu-page-max-width: 640px">Scoped page width</section>
    <section id="consumer-theme-root" class="uzu-scope" data-theme="light" data-uzu-theme-key="consumer-theme">
      <button id="consumer-theme-toggle" class="uzu-icon-button" type="button" data-uzu-theme-toggle data-uzu-theme-target="#consumer-theme-root" aria-label="Theme">T</button>
    </section>
    <button id="consumer-button" class="uzu-button" type="button">Hover target</button>
    <button id="consumer-primary" class="uzu-button uzu-button-primary" type="button">Primary</button>
    <a id="consumer-ghost" class="uzu-button uzu-button-ghost" href="#ghost">Ghost</a>
    <a id="consumer-danger" class="uzu-button uzu-button-danger" href="#danger">Danger</a>
    <button class="uzu-icon-button" type="button" data-uzu-tooltip="Tooltip text" aria-label="Tooltip target">?</button>
    <button id="consumer-tooltip-zh" class="uzu-icon-button" type="button" data-uzu-tooltip="短提示" aria-label="Chinese tooltip target">?</button>
    <button id="consumer-tooltip-custom" class="uzu-icon-button" type="button" data-uzu-tooltip="Custom tooltip" aria-describedby="consumer-tooltip-custom-help" aria-label="Custom tooltip target">?</button>
    <span id="consumer-tooltip-custom-help" class="uzu-sr-only">External description</span>
    <nav aria-label="Consumer breadcrumb">
      <ol class="uzu-breadcrumb" id="consumer-breadcrumb">
        <li><a href="#home">Home</a></li>
        <li><span aria-current="page">Components</span></li>
      </ol>
    </nav>
    <div class="uzu-toolbar" id="consumer-toolbar" role="toolbar" aria-label="Consumer actions">
      <div class="uzu-toolbar-group">
        <button class="uzu-button uzu-button-primary" id="consumer-toolbar-button" type="button">New</button>
        <button class="uzu-button" type="button">Import</button>
      </div>
      <div class="uzu-toolbar-group">
        <button class="uzu-icon-button" type="button" aria-label="List view">≡</button>
      </div>
    </div>
    <article class="uzu-stat" id="consumer-stat">
      <p class="uzu-stat-label">Components</p>
      <p class="uzu-stat-value">42</p>
      <p class="uzu-stat-note">Public primitives.</p>
    </article>
    <p><code class="uzu-code" id="consumer-code">.uzu-scope</code> <kbd class="uzu-kbd" id="consumer-kbd">Ctrl</kbd></p>
    <p id="consumer-plain-backticks">Plain \`raw\` text should stay untouched.</p>
    <div class="uzu-code-block" id="consumer-code-block">
      <pre class="uzu-code-block-body uzu-scroll"><code>const label = 'Usuzumi';</code></pre>
      <button class="uzu-icon-button uzu-code-block-copy" type="button" data-uzu-code-copy aria-label="Copy code">
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><rect x="8" y="8" width="10" height="10" rx="1.8" stroke="currentColor" stroke-width="1.7"/><path d="M6 15H5.8A1.8 1.8 0 0 1 4 13.2V5.8A1.8 1.8 0 0 1 5.8 4h7.4A1.8 1.8 0 0 1 15 5.8V6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
        <span data-uzu-code-copy-label>Copy</span>
      </button>
    </div>
    <div class="consumer-panel-layout" id="consumer-panel-layout">
      <nav class="uzu-panel-nav" id="consumer-panel-nav" data-uzu-panel-nav data-uzu-panel-selector=".consumer-panel" aria-label="Consumer panels">
        <section class="uzu-panel-nav-section" aria-labelledby="consumer-panel-nav-title">
          <p class="uzu-panel-nav-title" id="consumer-panel-nav-title">Docs</p>
          <button class="uzu-panel-nav-button is-active" type="button" data-uzu-panel-target="#consumer-panel-one" aria-pressed="true">One<span class="uzu-panel-nav-meta">Intro</span></button>
          <button class="uzu-panel-nav-button" type="button" data-uzu-panel-target="#consumer-panel-two" aria-pressed="false">Two<span class="uzu-panel-nav-meta">API</span></button>
        </section>
      </nav>
      <div>
        <section class="uzu-panel consumer-panel" id="consumer-panel-one">Panel one</section>
        <section class="uzu-panel consumer-panel" id="consumer-panel-two" hidden>Panel two</section>
      </div>
    </div>
    <div id="consumer-auto-init" data-uzu-auto-init></div>
    <div class="consumer-panel-layout" id="consumer-panel-layout-secondary">
      <nav class="uzu-panel-nav" id="consumer-panel-nav-secondary" data-uzu-panel-nav data-uzu-panel-selector=".consumer-panel-secondary" aria-label="Secondary consumer panels">
        <section class="uzu-panel-nav-section" aria-labelledby="consumer-panel-nav-title-secondary">
          <p class="uzu-panel-nav-title" id="consumer-panel-nav-title-secondary">More docs</p>
          <button class="uzu-panel-nav-button is-active" type="button" data-uzu-panel-target="#consumer-panel-three" aria-pressed="true">Three</button>
          <button class="uzu-panel-nav-button" type="button" data-uzu-panel-target="#consumer-panel-four" aria-pressed="false">Four</button>
        </section>
      </nav>
      <div>
        <section class="uzu-panel consumer-panel-secondary" id="consumer-panel-three">Panel three</section>
        <section class="uzu-panel consumer-panel-secondary" id="consumer-panel-four" hidden>Panel four</section>
      </div>
    </div>
    <div class="consumer-panel-layout" id="consumer-panel-layout-hash">
      <nav class="uzu-panel-nav" id="consumer-panel-nav-hash" data-uzu-panel-nav data-uzu-panel-hash="true" data-uzu-panel-selector=".consumer-panel-hash" aria-label="Hash consumer panels">
        <section class="uzu-panel-nav-section" aria-labelledby="consumer-panel-nav-title-hash">
          <p class="uzu-panel-nav-title" id="consumer-panel-nav-title-hash">Hash docs</p>
          <button class="uzu-panel-nav-button is-active" type="button" data-uzu-panel-target="#consumer-panel-hash-one" aria-pressed="true">Default</button>
          <button class="uzu-panel-nav-button" type="button" data-uzu-panel-target="#consumer-panel-hash-two" aria-pressed="false">Hash target</button>
        </section>
      </nav>
      <div>
        <section class="uzu-panel consumer-panel-hash" id="consumer-panel-hash-one">Default hash panel</section>
        <section class="uzu-panel consumer-panel-hash" id="consumer-panel-hash-two" hidden>Hash target panel</section>
      </div>
    </div>
    <div class="uzu-prose" id="consumer-markdown" data-uzu-markdown>
# Rendered

Use \`.uzu-code\` inside copy.

[Safe link](https://example.com) [Bad link](javascript:alert(1))

- First
- Second

\`\`\`html
<button class="uzu-button">Save</button>
\`\`\`
    </div>
    <hr class="uzu-separator" id="consumer-separator">
    <span class="uzu-separator-vertical" id="consumer-separator-vertical" aria-hidden="true"></span>
    <nav aria-label="Consumer pagination">
      <ol class="uzu-pagination" id="consumer-pagination" data-uzu-pagination data-uzu-pagination-target="#consumer-page-panels">
        <li><button class="uzu-page-button" type="button" data-uzu-page-prev aria-label="Previous page">‹</button></li>
        <li><button class="uzu-page-button" type="button" data-uzu-page="1" aria-current="page">1</button></li>
        <li><button class="uzu-page-button" type="button" data-uzu-page="2">2</button></li>
        <li><button class="uzu-page-button" type="button" data-uzu-page-next aria-label="Next page">›</button></li>
      </ol>
    </nav>
    <div id="consumer-page-panels">
      <article class="uzu-page-panel" data-uzu-page-panel="1">
        First page
        <div data-uzu-page-panel="nested">Nested panel should stay visible.</div>
      </article>
      <article class="uzu-page-panel" data-uzu-page-panel="2" hidden>Second page</article>
    </div>
    <a class="uzu-page-button" id="consumer-page-link" href="#linked-page">Linked page</a>
    <nav aria-label="Disabled page pagination">
      <ol class="uzu-pagination" id="consumer-disabled-pagination" data-uzu-pagination>
        <li><button class="uzu-page-button" type="button" data-uzu-page-prev aria-label="Previous page">‹</button></li>
        <li><button class="uzu-page-button" type="button" data-uzu-page="1" aria-current="page">1</button></li>
        <li><button class="uzu-page-button is-disabled" type="button" data-uzu-page="2" aria-disabled="true">2</button></li>
        <li><button class="uzu-page-button" type="button" data-uzu-page="3">3</button></li>
        <li><button class="uzu-page-button" type="button" data-uzu-page-next aria-label="Next page">›</button></li>
      </ol>
    </nav>
    <div class="uzu-tabs" data-uzu-tabs>
      <button class="uzu-tab is-active" type="button" data-uzu-tab-value="one" aria-selected="true"><span data-lang="zh">一</span><span data-lang="en">One</span></button>
      <button class="uzu-tab" type="button" data-uzu-tab-value="two" aria-selected="false"><span data-lang="zh">第二项</span><span data-lang="en">Two</span></button>
    </div>
    <div class="uzu-segmented" data-uzu-segmented>
      <button class="uzu-segment is-active" type="button" data-uzu-segment-value="alpha" aria-pressed="true"><span data-lang="zh">今天</span><span data-lang="en">Today</span></button>
      <button class="uzu-segment" type="button" data-uzu-segment-value="beta" aria-pressed="false"><span data-lang="zh">计划</span><span data-lang="en">Planning</span></button>
    </div>`;
