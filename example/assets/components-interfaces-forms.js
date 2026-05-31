window.UsuzumiComponentDocs = window.UsuzumiComponentDocs || {};
window.UsuzumiComponentDocs.componentInterfaces = Object.assign(
  window.UsuzumiComponentDocs.componentInterfaces || {},
{
  "select": {
    "attributes": [
      "data-uzu-select",
      "data-uzu-select-trigger",
      "data-uzu-select-option",
      "data-uzu-select-name"
    ],
    "events": [
      "change",
      "uzu-select-change"
    ],
    "states": [
      "aria-expanded",
      "aria-selected",
      "data-uzu-select-value"
    ]
  },
  "combobox": {
    "variables": [
      "--uzu-combobox-list-max-height"
    ],
    "attributes": [
      "data-uzu-combobox",
      "data-uzu-combobox-input",
      "data-uzu-combobox-list",
      "data-uzu-combobox-option",
      "data-uzu-combobox-value",
      "data-uzu-combobox-name"
    ],
    "events": [
      "uzu-combobox-open",
      "uzu-combobox-close",
      "uzu-combobox-filter",
      "uzu-combobox-change"
    ],
    "states": [
      "aria-expanded",
      "aria-selected",
      "aria-activedescendant",
      ".is-open",
      ".is-active",
      ".is-selected"
    ]
  },
  "switch": {
    "attributes": [
      "data-uzu-switch"
    ],
    "events": [
      "uzu-switch-change"
    ],
    "states": [
      "aria-checked",
      ".is-on"
    ]
  },
  "input": {
    "variables": [
      "--uzu-field-gap"
    ],
    "states": [
      ".is-invalid",
      "aria-invalid",
      ":disabled"
    ],
    "related": [
      ".uzu-help"
    ]
  },
  "form": {
    "variables": [
      "--uzu-form-gap"
    ],
    "related": [
      ".uzu-form",
      ".uzu-fieldset",
      ".uzu-form-message",
      ".uzu-form-error",
      ".uzu-field"
    ],
    "states": [
      ".is-invalid",
      "aria-invalid",
      "role=\"alert\""
    ]
  },
  "input-group": {
    "related": [
      ".uzu-input",
      ".uzu-input-addon",
      ".uzu-input-action",
      ".uzu-button"
    ],
    "states": [
      ":disabled on child controls"
    ]
  },
  "search": {
    "attributes": [
      "data-uzu-search",
      "data-uzu-search-clear"
    ],
    "events": [
      "input",
      "change"
    ],
    "states": [
      "[hidden] on clear button"
    ]
  },
  "password": {
    "attributes": [
      "data-uzu-password",
      "data-uzu-password-toggle"
    ],
    "events": [
      "uzu-password-toggle"
    ],
    "states": [
      "aria-pressed",
      ".is-visible"
    ]
  },
  "file-upload": {
    "variables": [
      "--uzu-file-upload-min-height"
    ],
    "related": [
      "input[type=\"file\"]",
      ".uzu-file-summary"
    ],
    "states": [
      ".is-dragging",
      ":disabled on input"
    ]
  },
  "slider": {
    "related": [
      "input[type=\"range\"]"
    ],
    "states": [
      ":disabled",
      "aria-valuetext"
    ]
  },
  "stepper": {
    "attributes": [
      "data-uzu-stepper",
      "data-uzu-stepper-decrement",
      "data-uzu-stepper-increment"
    ],
    "events": [
      "uzu-stepper-change",
      "input",
      "change"
    ],
    "states": [
      ":disabled on buttons",
      "min",
      "max",
      "step"
    ]
  },
  "checkbox-radio": {
    "attributes": [
      "type=\"checkbox\"",
      "type=\"radio\"",
      "name for radio groups"
    ],
    "states": [
      ":checked",
      ":disabled"
    ]
  }
}
);
