window.UsuzumiComponentDocs = window.UsuzumiComponentDocs || {};
window.UsuzumiComponentDocs.componentInterfaces = Object.assign(
  window.UsuzumiComponentDocs.componentInterfaces || {},
{
  "card": {
    "variables": [
      "--uzu-card-title-size",
      "--uzu-card-title-line",
      "--uzu-card-subtitle-size",
      "--uzu-card-subtitle-line",
      "--uzu-card-title-gap",
      "--uzu-card-block-gap"
    ],
    "presets": [
      ".uzu-card-muted"
    ]
  },
  "stat": {
    "related": [
      ".uzu-stat-label",
      ".uzu-stat-value",
      ".uzu-stat-note"
    ],
    "variables": [
      "--uzu-fg-strong",
      "--uzu-muted",
      "--uzu-subtle"
    ]
  },
  "table": {
    "related": [
      ".uzu-table-wrap"
    ],
    "states": [
      "horizontal scroll in .uzu-table-wrap"
    ]
  },
  "data-grid": {
    "attributes": [
      "data-uzu-data-grid",
      "data-uzu-grid-sort",
      "data-uzu-grid-row",
      "data-uzu-data-grid-multi"
    ],
    "events": [
      "uzu-data-grid-sort",
      "uzu-data-grid-select"
    ],
    "states": [
      "aria-sort",
      "aria-selected",
      ".is-selected",
      "tabindex on rows"
    ]
  },
  "tree": {
    "attributes": [
      "data-uzu-tree",
      "data-uzu-tree-item",
      "data-uzu-tree-toggle",
      "data-uzu-tree-label",
      "data-uzu-tree-value"
    ],
    "events": [
      "uzu-tree-toggle",
      "uzu-tree-select",
      "change"
    ],
    "states": [
      "aria-expanded",
      "aria-selected",
      ".is-open",
      ".is-selected",
      "roving tabindex"
    ]
  },
  "separator": {
    "presets": [
      ".uzu-separator",
      ".uzu-separator-vertical"
    ],
    "variables": [
      "--uzu-border-soft",
      "--uzu-space-1"
    ]
  },
  "code": {
    "related": [
      ".uzu-code",
      ".uzu-kbd"
    ],
    "variables": [
      "--uzu-font-mono"
    ]
  },
  "json-viewer": {
    "variables": [
      "--uzu-viewer-max-height",
      "--uzu-json-indent"
    ],
    "attributes": [
      "data-uzu-json-viewer",
      "data-uzu-json-source",
      "script[type=\"application/json\"]"
    ],
    "states": [
      ".is-invalid",
      ".is-collapsed",
      ".uzu-json-node"
    ]
  },
  "diff-viewer": {
    "variables": [
      "--uzu-viewer-max-height"
    ],
    "attributes": [
      "data-uzu-diff-viewer"
    ],
    "states": [
      ".uzu-diff-line-add",
      ".uzu-diff-line-remove",
      ".uzu-diff-line-meta"
    ]
  },
  "list": {
    "related": [
      ".uzu-list-item",
      ".uzu-list-meta",
      ".uzu-list-action"
    ],
    "states": [
      "links and buttons keep native states"
    ]
  },
  "avatar": {
    "variables": [
      "--uzu-avatar-size"
    ],
    "related": [
      "img inside .uzu-avatar",
      "text fallback"
    ]
  },
  "tag": {
    "attributes": [
      "data-uzu-tag",
      "data-uzu-tag-selectable",
      "data-uzu-tag-value",
      "data-uzu-tag-close"
    ],
    "events": [
      "uzu-tag-change",
      "uzu-tag-close"
    ],
    "states": [
      ".is-selected",
      "aria-pressed",
      "[hidden] after default close"
    ]
  },
  "empty-error": {
    "related": [
      ".uzu-empty-state",
      ".uzu-error-state"
    ],
    "states": [
      "role=\"alert\" when the error should be announced"
    ]
  }
}
);
