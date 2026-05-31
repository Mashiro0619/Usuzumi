window.UsuzumiComponentDocs = window.UsuzumiComponentDocs || {};
window.UsuzumiComponentDocs.componentNotes = Object.assign(
  window.UsuzumiComponentDocs.componentNotes || {},
{
  "page": {
    "classes": [
      ".uzu-page",
      ".uzu-page-narrow",
      ".uzu-section"
    ],
    "usage": [
      "页面外层用 .uzu-page，内容分组用 .uzu-section。",
      "Use .uzu-page for the outer container and .uzu-section for content groups."
    ]
  },
  "section-centered": {
    "classes": [
      ".uzu-section-centered",
      ".uzu-section-head",
      ".uzu-download-actions"
    ],
    "usage": [
      "用于短介绍、下载入口或空状态，让标题、说明和操作居中。",
      "Use it for short intros, download groups, or empty states."
    ]
  },
  "grid": {
    "classes": [
      ".uzu-grid",
      ".uzu-grid-2",
      ".uzu-grid-3"
    ],
    "usage": [
      "同等级内容并排展示时使用网格。",
      "Use grids for peer content."
    ]
  },
  "layout-primitives": {
    "classes": [
      ".uzu-stack",
      ".uzu-flex",
      ".uzu-spacer",
      ".uzu-aspect",
      ".uzu-scroll-area"
    ],
    "purpose": [
      "用于页面内部的小型排版骨架，用公开变量调整常见间距。",
      "Use these for small layout scaffolds inside a page with public variables for common spacing."
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
    "purpose": [
      "用于同一任务里的两个关联区域，例如列表 / 详情、编辑 / 预览。",
      "Use it for two related regions in one task, such as list/detail or editor/preview."
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
    "purpose": [
      "用于局部可调整区域，例如预览窗、控制台、小型编辑区。",
      "Use it for local adjustable regions such as previews, consoles, and compact editors."
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
    ],
    "usage": [
      "放品牌、全局导航和少量页面级链接。",
      "Place brand text, global navigation, and a few page-level links here."
    ]
  }
}
);
