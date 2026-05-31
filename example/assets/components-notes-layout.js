window.UsuzumiComponentDocs = window.UsuzumiComponentDocs || {};
window.UsuzumiComponentDocs.componentNotes = Object.assign(
  window.UsuzumiComponentDocs.componentNotes || {},
{
  "page": {
    "classes": [
      ".uzu-page",
      ".uzu-page-narrow",
      ".uzu-section"
    ],},
  "section-centered": {
    "classes": [
      ".uzu-section-centered",
      ".uzu-section-head",
      ".uzu-download-actions"
    ],},
  "grid": {
    "classes": [
      ".uzu-grid",
      ".uzu-grid-2",
      ".uzu-grid-3"
    ],},
  "layout-primitives": {
    "classes": [
      ".uzu-stack",
      ".uzu-flex",
      ".uzu-spacer",
      ".uzu-aspect",
      ".uzu-scroll-area"
    ],
    "structure": [
      "Stack 负责纵向间距，Flex 负责行内排列，Spacer 占据剩余空间，Aspect 保持固定比例，Scroll Area 限制局部滚动高度。",
      "Stack controls vertical gaps, Flex arranges inline content, Spacer takes remaining space, Aspect keeps a fixed ratio, and Scroll Area limits local scroll height."
    ],
    "behavior": [
      "布局原语没有脚本行为；用 CSS 变量 `--uzu-stack-gap`、`--uzu-flex-gap`、`--uzu-aspect-ratio`、`--uzu-scroll-area-max-height` 调整。",
      "Layout primitives have no script behavior; tune them with `--uzu-stack-gap`, `--uzu-flex-gap`, `--uzu-aspect-ratio`, and `--uzu-scroll-area-max-height`."
    ]
  },
  "split-pane": {
    "classes": [
      ".uzu-split-pane",
      ".uzu-split-panel",
      ".uzu-split-resizer"
    ],
    "structure": [
      "外层加 `data-uzu-split-pane`，两个 `.uzu-split-panel` 中间放一个 `data-uzu-split-resizer`。",
      "Add `data-uzu-split-pane` to the wrapper, place two `.uzu-split-panel` nodes around one `data-uzu-split-resizer`."
    ],
    "behavior": [
      "拖动分隔条会更新 `--uzu-split-primary-size`；分隔条获得焦点后支持方向键、Home 和 End。",
      "Dragging the divider updates `--uzu-split-primary-size`; focused dividers support arrow keys, Home, and End."
    ]
  },
  "resizable": {
    "classes": [
      ".uzu-resizable",
      ".uzu-resizable-content",
      ".uzu-resizable-handle"
    ],
    "structure": [
      "外层加 `data-uzu-resizable`，内容放进 `.uzu-resizable-content`，右下角按钮加 `data-uzu-resizable-handle`。",
      "Add `data-uzu-resizable` outside, place content in `.uzu-resizable-content`, and add a lower-right `data-uzu-resizable-handle` button."
    ],
    "behavior": [
      "拖拽或方向键会更新 `--uzu-resizable-width` 和 `--uzu-resizable-height`，并派发 `uzu-resizable-resize`。",
      "Dragging or arrow keys update `--uzu-resizable-width` and `--uzu-resizable-height`, then emit `uzu-resizable-resize`."
    ]
  },
  "topbar": {
    "classes": [
      ".uzu-topbar",
      ".uzu-brand-link",
      ".uzu-nav"
    ],}
}
);
