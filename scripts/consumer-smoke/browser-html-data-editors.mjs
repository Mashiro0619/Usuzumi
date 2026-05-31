export const consumerDataEditorsHtml = `    <ul class="uzu-list" id="consumer-list">
      <li class="uzu-list-item"><span>Design tokens</span><span class="uzu-list-meta">Ready</span><button class="uzu-button uzu-list-action" type="button">Open</button></li>
      <li class="uzu-list-item"><span>Runtime</span><span class="uzu-list-meta">Loaded</span></li>
    </ul>
    <div class="uzu-data-grid-wrap">
      <table class="uzu-data-grid" id="consumer-data-grid" data-uzu-data-grid>
        <thead><tr><th data-uzu-grid-sort>Name</th><th data-uzu-grid-sort>Count</th></tr></thead>
        <tbody>
          <tr data-uzu-grid-row="beta"><td>Beta</td><td>2</td></tr>
          <tr data-uzu-grid-row="alpha"><td>Alpha</td><td>1</td></tr>
        </tbody>
      </table>
    </div>
    <div class="uzu-data-grid-wrap">
      <table class="uzu-data-grid" id="consumer-data-grid-plain" data-uzu-data-grid>
        <thead><tr><th data-uzu-grid-sort>Plain name</th><th>State</th></tr></thead>
        <tbody>
          <tr><td>One</td><td>Ready</td></tr>
          <tr><td>Two</td><td>Queued</td></tr>
        </tbody>
      </table>
    </div>
    <ul class="uzu-tree" id="consumer-tree" data-uzu-tree aria-label="Consumer tree">
      <li class="uzu-tree-item is-open" data-uzu-tree-item data-uzu-tree-value="docs">
        <div class="uzu-tree-row"><button class="uzu-tree-toggle" type="button" data-uzu-tree-toggle aria-label="Toggle docs"></button><span class="uzu-tree-label" data-uzu-tree-label>docs</span></div>
        <ul class="uzu-tree-group">
          <li class="uzu-tree-item is-selected" data-uzu-tree-item data-uzu-tree-value="overview"><div class="uzu-tree-row"><span class="uzu-tree-label" data-uzu-tree-label>Overview</span></div></li>
        </ul>
      </li>
    </ul>
    <div class="uzu-split-pane" id="consumer-split-pane" data-uzu-split-pane data-uzu-split-size="40" data-uzu-split-min="20" data-uzu-split-max="80">
      <section class="uzu-split-panel">Left panel</section>
      <button class="uzu-split-resizer" type="button" data-uzu-split-resizer aria-label="Resize split pane"></button>
      <section class="uzu-split-panel">Right panel</section>
    </div>
    <div class="uzu-resizable" id="consumer-resizable" data-uzu-resizable data-uzu-resizable-width="260" data-uzu-resizable-height="140" data-uzu-resizable-min-width="180" data-uzu-resizable-min-height="100">
      <div class="uzu-resizable-content">Resizable content</div>
      <button class="uzu-resizable-handle" type="button" data-uzu-resizable-handle aria-label="Resize panel"></button>
    </div>
    <div class="uzu-json-viewer" id="consumer-json-viewer" data-uzu-json-viewer><script type="application/json">{"name":"Usuzumi","enabled":true,"count":2}</script></div>
    <pre class="uzu-diff-viewer" id="consumer-diff-viewer" data-uzu-diff-viewer>@@ file
- old
+ new</pre>
    <section class="uzu-editor" id="consumer-rich-editor" data-uzu-rich-editor>
      <div class="uzu-editor-toolbar" role="toolbar" aria-label="Editor tools"><button class="uzu-toolbar-button" type="button" data-uzu-editor-command="bold" data-uzu-editor-toggle>B</button></div>
      <div class="uzu-editor-surface" data-uzu-editor-surface contenteditable="true" role="textbox" aria-multiline="true">Editable text</div>
    </section>
    <section class="uzu-editor uzu-markdown-editor" id="consumer-markdown-editor" data-uzu-markdown-editor data-uzu-markdown-render>
      <textarea class="uzu-markdown-source" data-uzu-markdown-source># Editor markdown</textarea>
      <div class="uzu-markdown-preview" data-uzu-markdown-preview></div>
    </section>
    <section class="uzu-editor uzu-markdown-editor" id="consumer-markdown-editor-shell" data-uzu-markdown-editor>
      <textarea class="uzu-markdown-source" data-uzu-markdown-source># Shell only</textarea>
      <div class="uzu-markdown-preview" data-uzu-markdown-preview></div>
    </section>
    <span class="uzu-inline-editor" id="consumer-inline-editor" data-uzu-inline-editor data-placeholder="Untitled">Inline text</span>
    <span class="uzu-avatar" id="consumer-avatar" aria-label="Usuzumi">U</span>
    <aside class="uzu-sidebar" id="consumer-sidebar" aria-label="Consumer sidebar">
      <section class="uzu-sidebar-section">
        <p class="uzu-micro-label">Project</p>
        <ul class="uzu-sidebar-nav">
          <li><a href="#overview" aria-current="page">Overview</a></li>
          <li><button type="button">Settings</button></li>
        </ul>
      </section>
    </aside>`;
