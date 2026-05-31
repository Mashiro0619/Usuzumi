window.UsuzumiComponentDocs = window.UsuzumiComponentDocs || {};
window.UsuzumiComponentDocs.componentInterfaces = Object.assign(
  window.UsuzumiComponentDocs.componentInterfaces || {},
{
  "button": {
    "presets": [
      ".uzu-button-primary",
      ".uzu-button-ghost",
      ".uzu-button-danger",
      ".uzu-icon-button"
    ],
    "states": [
      ":disabled",
      "[aria-disabled=\"true\"]",
      ".is-disabled",
      ".is-loading",
      "[aria-busy=\"true\"]"
    ]
  },
  "text-link": {
    "states": [
      ":hover",
      ":focus-visible"
    ],
    "variables": [
      "--uzu-muted",
      "--uzu-fg-strong",
      "--uzu-soft"
    ]
  },
  "toolbar": {
    "related": [
      ".uzu-toolbar-group",
      ".uzu-button",
      ".uzu-icon-button"
    ],
    "attributes": [
      "role=\"toolbar\"",
      "aria-label"
    ]
  },
  "breadcrumb": {
    "related": [
      "ol.uzu-breadcrumb > li"
    ],
    "states": [
      "aria-current=\"page\""
    ]
  },
  "pagination": {
    "attributes": [
      "data-uzu-pagination",
      "data-uzu-page",
      "data-uzu-page-prev",
      "data-uzu-page-next",
      "data-uzu-pagination-target"
    ],
    "events": [
      "uzu-pagination-change"
    ],
    "states": [
      "aria-current=\"page\"",
      "[hidden] on .uzu-page-panel"
    ]
  },
  "tabs": {
    "attributes": [
      "data-uzu-tabs",
      "data-uzu-tab-value",
      "data-uzu-tab-target"
    ],
    "events": [
      "uzu-tabs-change"
    ],
    "states": [
      "aria-selected",
      "role=\"tablist\"",
      "role=\"tab\""
    ]
  },
  "segmented": {
    "attributes": [
      "data-uzu-segmented",
      "data-uzu-segment-value"
    ],
    "events": [
      "uzu-segmented-change"
    ],
    "states": [
      "aria-pressed",
      ".is-active"
    ]
  },
  "menu": {
    "variables": [
      "--uzu-menu-min-width",
      "--uzu-menu-offset",
      "--uzu-menu-content-width"
    ],
    "attributes": [
      "data-uzu-menu",
      "data-uzu-menu-trigger",
      "data-uzu-menu-content",
      "data-uzu-context-menu",
      "data-uzu-context-menu-trigger",
      "data-uzu-menu-value"
    ],
    "events": [
      "uzu-menu-open",
      "uzu-menu-close",
      "uzu-menu-select"
    ],
    "states": [
      "aria-expanded",
      ".is-open",
      ".is-closing",
      ".is-active"
    ]
  },
  "menubar": {
    "attributes": [
      "data-uzu-menubar",
      "data-uzu-menubar-value"
    ],
    "events": [
      "uzu-menubar-change"
    ],
    "states": [
      "role=\"menubar\"",
      "role=\"menuitem\"",
      ".is-active",
      "tabindex"
    ]
  },
  "command": {
    "variables": [
      "--uzu-command-max-height"
    ],
    "attributes": [
      "data-uzu-command",
      "data-uzu-command-input",
      "data-uzu-command-list",
      "data-uzu-command-value",
      "data-uzu-command-text"
    ],
    "events": [
      "uzu-command-filter",
      "uzu-command-select"
    ],
    "states": [
      "aria-activedescendant",
      "[hidden] on filtered items",
      ".is-active"
    ]
  },
  "sidebar": {
    "variables": [
      "--uzu-sidebar-width"
    ],
    "related": [
      ".uzu-sidebar-section",
      ".uzu-sidebar-nav"
    ],
    "states": [
      "aria-current=\"page\"",
      ".is-active"
    ]
  },
  "step-nav": {
    "variables": [
      "--uzu-step-nav-gap"
    ],
    "attributes": [
      "data-uzu-step-nav",
      "data-uzu-step-value"
    ],
    "events": [
      "uzu-step-nav-change"
    ],
    "states": [
      ".is-active",
      ".is-complete",
      "aria-current=\"step\""
    ]
  }
}
);
