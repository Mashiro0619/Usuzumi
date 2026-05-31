window.UsuzumiComponentDocs = window.UsuzumiComponentDocs || {};
window.UsuzumiComponentDocs.componentInterfaces = Object.assign(
  window.UsuzumiComponentDocs.componentInterfaces || {},
{
  "page": {
    "variables": [
      "--uzu-page-max-width",
      "--uzu-page-narrow-max-width"
    ],
    "scope": [
      ".uzu-page",
      ".uzu-page-narrow"
    ]
  },
  "section-centered": {
    "scope": [
      ".uzu-section-centered on .uzu-section"
    ],
    "related": [
      ".uzu-section-head",
      ".uzu-download-actions"
    ]
  },
  "grid": {
    "presets": [
      ".uzu-grid-2",
      ".uzu-grid-3"
    ],
    "scope": [
      "override grid-template-columns on .uzu-grid"
    ]
  },
  "layout-primitives": {
    "variables": [
      "--uzu-stack-gap",
      "--uzu-flex-gap",
      "--uzu-aspect-ratio",
      "--uzu-scroll-area-max-height"
    ],
    "presets": [
      ".uzu-stack-tight",
      ".uzu-stack-loose",
      ".uzu-flex-between"
    ],
    "related": [
      ".uzu-stack",
      ".uzu-flex",
      ".uzu-spacer",
      ".uzu-aspect",
      ".uzu-scroll-area"
    ]
  },
  "split-pane": {
    "variables": [
      "--uzu-split-primary-size",
      "--uzu-split-resizer-size"
    ],
    "attributes": [
      "data-uzu-split-pane",
      "data-uzu-split-resizer",
      "data-uzu-split-size",
      "data-uzu-split-min",
      "data-uzu-split-max",
      "data-uzu-split-orientation",
      "data-uzu-split-key"
    ],
    "events": [
      "uzu-split-resize"
    ],
    "states": [
      ".is-resizing",
      "aria-valuenow",
      "aria-orientation"
    ]
  },
  "resizable": {
    "variables": [
      "--uzu-resizable-width",
      "--uzu-resizable-height"
    ],
    "attributes": [
      "data-uzu-resizable",
      "data-uzu-resizable-handle",
      "data-uzu-resizable-axis",
      "data-uzu-resizable-min-width",
      "data-uzu-resizable-min-height",
      "data-uzu-resizable-key"
    ],
    "events": [
      "uzu-resizable-resize"
    ],
    "states": [
      ".is-resizing"
    ]
  },
  "topbar": {
    "related": [
      ".uzu-brand-link",
      ".uzu-nav"
    ],
    "states": [
      "aria-current=\"page\""
    ]
  }
}
);
