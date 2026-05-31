window.UsuzumiComponentDocs = window.UsuzumiComponentDocs || {};
window.UsuzumiComponentDocs.componentNotes = Object.assign(
  window.UsuzumiComponentDocs.componentNotes || {},
{
  "badge": {
    "classes": [
      ".uzu-badge",
      ".uzu-badge-success",
      ".uzu-badge-warning"
    ],},
  "alert": {
    "classes": [
      ".uzu-alert",
      ".uzu-alert-info",
      ".uzu-alert-danger"
    ],},
  "callout": {
    "classes": [
      ".uzu-callout",
      ".uzu-callout-note",
      ".uzu-callout-compact"
    ],},
  "progress": {
    "classes": [
      ".uzu-progress",
      ".uzu-progress-circular",
      ".uzu-activity"
    ],},
  "skeleton": {
    "classes": [
      ".uzu-skeleton",
      ".uzu-skeleton-title",
      ".uzu-skeleton-text"
    ],},
  "process": {
    "classes": [
      ".uzu-process",
      ".uzu-process-step",
      ".is-active"
    ],},
  "toast": {
    "classes": [
      ".uzu-toast",
      "[data-uzu-toast]",
      "[data-uzu-toast-close]"
    ],},
  "disclosure": {
    "classes": [
      ".uzu-disclosure",
      "[data-uzu-disclosure]",
      "[data-uzu-disclosure-panel]"
    ],},
  "dialog": {
    "classes": [
      ".uzu-dialog-overlay",
      ".uzu-modal",
      "[data-uzu-dialog]"
    ],},
  "popover": {
    "classes": [
      ".uzu-popover"
    ],},
  "accordion": {
    "classes": [
      ".uzu-accordion",
      "[data-uzu-accordion]",
      "[data-uzu-accordion-multiple]"
    ],
    "structure": [
      "外层使用 `.uzu-accordion[data-uzu-accordion]`，内部放多个 `data-uzu-disclosure`。",
      "Use `.uzu-accordion[data-uzu-accordion]` outside and place several `data-uzu-disclosure` items inside."
    ],
    "behavior": [
      "默认同一时间只打开一个面板；设置 `data-uzu-accordion-multiple=\"true\"` 可允许多开，并派发 `uzu-accordion-change`。",
      "By default only one panel stays open; set `data-uzu-accordion-multiple=\"true\"` to allow multiple open panels and emit `uzu-accordion-change`."
    ]
  },
  "alert-dialog": {
    "classes": [
      ".uzu-alert-dialog",
      "role=\"alertdialog\"",
      "[data-uzu-dialog]"
    ],
    "structure": [
      "在 `.uzu-modal` 上加 `.uzu-alert-dialog`，使用 `role=\"alertdialog\"`，并提供 `aria-labelledby` 和 `aria-describedby`。",
      "Add `.uzu-alert-dialog` to `.uzu-modal`, use `role=\"alertdialog\"`, and provide `aria-labelledby` plus `aria-describedby`."
    ],
    "behavior": [
      "它复用 dialog 运行时：触发器、关闭按钮、Esc、遮罩点击和焦点返回都相同。",
      "It reuses the dialog runtime: trigger, close buttons, Escape, backdrop click, and focus return work the same way."
    ]
  },
  "drawer": {
    "classes": [
      ".uzu-drawer",
      ".uzu-drawer-start",
      ".uzu-drawer-end",
      ".uzu-sheet",
      "[data-uzu-dialog]"
    ],
    "structure": [
      "把 `.uzu-drawer` 或 `.uzu-sheet` 放进 `.uzu-dialog-overlay`，并继续使用 `data-uzu-dialog`。",
      "Place `.uzu-drawer` or `.uzu-sheet` inside `.uzu-dialog-overlay` and keep using `data-uzu-dialog`."
    ],
    "behavior": [
      "运行时完全复用 dialog 的打开、关闭、焦点管理和事件。",
      "The runtime reuses dialog opening, closing, focus management, and events."
    ]
  },
  "hover-card": {
    "classes": [
      ".uzu-hover-card",
      ".uzu-hover-card-content",
      "[data-uzu-hover-card]"
    ],
    "structure": [
      "外层使用 `data-uzu-hover-card`，触发器使用 `data-uzu-hover-card-trigger`，内容使用 `data-uzu-hover-card-content`。",
      "Use `data-uzu-hover-card` outside, `data-uzu-hover-card-trigger` for the trigger, and `data-uzu-hover-card-content` for the content."
    ],
    "behavior": [
      "运行时处理打开、关闭、延迟、焦点和 Esc，并派发 open/close 事件。",
      "The runtime handles open, close, delay, focus, Escape, and emits open/close events."
    ]
  },
  "tooltip": {
    "classes": [
      "[data-uzu-tooltip]",
      ".uzu-tooltip"
    ],}
}
);
