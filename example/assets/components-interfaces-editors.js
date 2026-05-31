window.UsuzumiComponentDocs = window.UsuzumiComponentDocs || {};
window.UsuzumiComponentDocs.componentInterfaces = Object.assign(
  window.UsuzumiComponentDocs.componentInterfaces || {},
{
  "rich-editor": {
    "variables": [
      "--uzu-editor-min-height"
    ],
    "attributes": [
      "data-uzu-rich-editor",
      "data-uzu-editor-surface",
      "data-uzu-editor-command",
      "data-uzu-editor-value",
      "data-uzu-editor-toggle"
    ],
    "events": [
      "uzu-editor-command",
      "uzu-editor-change"
    ],
    "states": [
      "aria-pressed",
      ".is-active",
      "contenteditable from editor engine",
      "role=\"textbox\" from editor engine"
    ],
    "related": [
      ".uzu-editor-toolbar",
      ".uzu-toolbar-button",
      "Tiptap",
      "ProseMirror"
    ]
  },
  "markdown-editor": {
    "variables": [
      "--uzu-editor-min-height"
    ],
    "attributes": [
      "data-uzu-markdown-editor",
      "data-uzu-markdown-source",
      "data-uzu-markdown-preview",
      "data-uzu-markdown-render"
    ],
    "events": [
      "uzu-markdown-editor-change",
      "uzu-markdown-editor-render"
    ],
    "related": [
      "CodeMirror 6",
      "markdown-it",
      "remark",
      "marked",
      "window.Usuzumi.renderMarkdown",
      ".uzu-code-block"
    ]
  },
  "code-editor": {
    "variables": [
      "--uzu-editor-min-height"
    ],
    "related": [
      "textarea.uzu-code-editor",
      ".uzu-editor"
    ],
    "states": [
      ":focus-visible",
      ":disabled",
      "spellcheck=\"false\" when appropriate"
    ]
  },
  "plain-editor": {
    "variables": [
      "--uzu-editor-min-height"
    ],
    "related": [
      "textarea.uzu-plain-editor",
      ".uzu-field"
    ],
    "states": [
      ":focus-visible",
      ":disabled",
      "aria-invalid"
    ]
  },
  "inline-editor": {
    "attributes": [
      "data-uzu-inline-editor",
      "data-placeholder"
    ],
    "events": [
      "uzu-inline-editor-change"
    ],
    "states": [
      "contenteditable",
      "role=\"textbox\"",
      ".is-empty",
      ":focus-visible"
    ]
  }
}
);
