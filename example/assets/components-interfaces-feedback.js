window.UsuzumiComponentDocs = window.UsuzumiComponentDocs || {};
window.UsuzumiComponentDocs.componentInterfaces = Object.assign(
  window.UsuzumiComponentDocs.componentInterfaces || {},
{
  "badge": {
    "presets": [
      ".uzu-badge-success",
      ".uzu-badge-warning",
      ".uzu-badge-danger"
    ],
    "variables": [
      "--uzu-success",
      "--uzu-success-bg",
      "--uzu-warning",
      "--uzu-warning-bg",
      "--uzu-danger",
      "--uzu-danger-bg"
    ]
  },
  "alert": {
    "presets": [
      ".uzu-alert-info",
      ".uzu-alert-success",
      ".uzu-alert-warning",
      ".uzu-alert-danger"
    ],
    "variables": [
      "--uzu-alert-max-width",
      "--uzu-alert-border-color",
      "--uzu-alert-accent-color",
      "--uzu-alert-bg",
      "--uzu-alert-title-color",
      "--uzu-alert-text-color"
    ]
  },
  "callout": {
    "presets": [
      ".uzu-callout-note",
      ".uzu-callout-compact",
      ".uzu-callout-muted",
      ".uzu-callout-warning"
    ],
    "variables": [
      "--uzu-callout-border-color",
      "--uzu-callout-bg",
      "--uzu-callout-title-color",
      "--uzu-callout-text-color"
    ]
  },
  "progress": {
    "variables": [
      "--uzu-progress-value"
    ],
    "presets": [
      ".uzu-progress-indeterminate",
      ".uzu-progress-circular",
      ".uzu-activity"
    ],
    "attributes": [
      "role=\"progressbar\"",
      "aria-valuenow",
      "role=\"status\""
    ]
  },
  "skeleton": {
    "presets": [
      ".uzu-skeleton-title",
      ".uzu-skeleton-text",
      ".uzu-skeleton-short"
    ],
    "states": [
      "aria-busy on loading region"
    ]
  },
  "process": {
    "states": [
      ".is-complete",
      ".is-active",
      "aria-current=\"step\""
    ],
    "related": [
      "ol.uzu-process",
      "li.uzu-process-step"
    ]
  },
  "toast": {
    "variables": [
      "--uzu-toast-width",
      "--uzu-toast-inline-padding",
      "--uzu-toast-content-end-offset",
      "--uzu-toast-action-size",
      "--uzu-toast-action-gap"
    ],
    "attributes": [
      "data-uzu-toast",
      "data-uzu-toast-close",
      "data-uzu-toast-timeout",
      "role=\"status\"",
      "aria-live=\"polite\"",
      "aria-atomic=\"true\""
    ],
    "events": [
      "uzu-toast-close"
    ]
  },
  "disclosure": {
    "variables": [
      "--uzu-disclosure-panel-block-end-padding"
    ],
    "attributes": [
      "data-uzu-disclosure",
      "data-uzu-disclosure-trigger",
      "data-uzu-disclosure-panel"
    ],
    "states": [
      "aria-expanded",
      "[hidden]"
    ]
  },
  "dialog": {
    "attributes": [
      "data-uzu-dialog-target",
      "data-uzu-dialog",
      "data-uzu-dialog-close",
      "data-uzu-dialog-overlay"
    ],
    "events": [
      "uzu-dialog-open",
      "uzu-dialog-close"
    ],
    "states": [
      "aria-modal",
      "background inert",
      "scroll locked",
      "[hidden]",
      ".is-open",
      ".is-closing"
    ]
  },
  "popover": {
    "related": [
      ".uzu-popover"
    ],
    "variables": [
      "--uzu-shadow-popover"
    ],
    "states": [
      "visible near its trigger"
    ]
  },
  "accordion": {
    "attributes": [
      "data-uzu-accordion",
      "data-uzu-accordion-multiple",
      "data-uzu-disclosure"
    ],
    "events": [
      "uzu-accordion-change",
      "uzu-disclosure-change"
    ],
    "states": [
      "single-open default",
      "multiple-open opt-in"
    ]
  },
  "alert-dialog": {
    "variables": [
      "--uzu-alert-dialog-accent-color"
    ],
    "attributes": [
      "role=\"alertdialog\"",
      "aria-labelledby",
      "aria-describedby",
      "data-uzu-dialog"
    ],
    "events": [
      "uzu-dialog-open",
      "uzu-dialog-close"
    ],
    "states": [
      ".is-open",
      ".is-closing",
      "[hidden]"
    ]
  },
  "drawer": {
    "variables": [
      "--uzu-drawer-width",
      "--uzu-sheet-width"
    ],
    "presets": [
      ".uzu-drawer-start",
      ".uzu-drawer-end",
      ".uzu-sheet"
    ],
    "attributes": [
      "data-uzu-dialog",
      "data-uzu-dialog-target",
      "data-uzu-dialog-close"
    ],
    "events": [
      "uzu-dialog-open",
      "uzu-dialog-close"
    ]
  },
  "hover-card": {
    "variables": [
      "--uzu-hover-card-width"
    ],
    "attributes": [
      "data-uzu-hover-card",
      "data-uzu-hover-card-trigger",
      "data-uzu-hover-card-content",
      "data-uzu-hover-card-delay",
      "data-uzu-hover-card-close-delay"
    ],
    "events": [
      "uzu-hover-card-open",
      "uzu-hover-card-close"
    ],
    "states": [
      "aria-expanded",
      ".is-open",
      ".is-closing",
      "[hidden]"
    ]
  },
  "tooltip": {
    "attributes": [
      "data-uzu-tooltip",
      "aria-label"
    ],
    "related": [
      ".uzu-tooltip"
    ],
    "states": [
      ":hover",
      ":focus-visible"
    ]
  }
}
);
