window.UsuzumiComponentDocs = window.UsuzumiComponentDocs || {};
window.UsuzumiComponentDocs.componentNotes = Object.assign(
  window.UsuzumiComponentDocs.componentNotes || {},
{
  "badge": {
    "classes": [
      ".uzu-badge",
      ".uzu-badge-success",
      ".uzu-badge-warning"
    ],
    "usage": [
      "短状态、计数或标签使用 badge。",
      "Use badges for short status, counts, or tags."
    ]
  },
  "alert": {
    "classes": [
      ".uzu-alert",
      ".uzu-alert-info",
      ".uzu-alert-danger"
    ],
    "usage": [
      "页面内消息使用 alert。",
      "Use alerts for in-page messages."
    ]
  },
  "callout": {
    "classes": [
      ".uzu-callout",
      ".uzu-callout-note",
      ".uzu-callout-compact"
    ],
    "usage": [
      "阅读流里的补充说明、限制或建议使用 callout。",
      "Use callouts for context, constraints, or advice in the reading flow."
    ]
  },
  "progress": {
    "classes": [
      ".uzu-progress",
      ".uzu-progress-circular",
      ".uzu-activity"
    ],
    "usage": [
      "已知进度设置 --uzu-progress-value，未知进度使用 indeterminate，短后台状态可用 activity。",
      "Set --uzu-progress-value for known progress, use indeterminate for unknown progress, and activity for brief background work."
    ]
  },
  "skeleton": {
    "classes": [
      ".uzu-skeleton",
      ".uzu-skeleton-title",
      ".uzu-skeleton-text"
    ],
    "usage": [
      "加载真实内容前使用骨架占位。",
      "Use skeletons before real content is available."
    ]
  },
  "process": {
    "classes": [
      ".uzu-process",
      ".uzu-process-step",
      ".is-active"
    ],
    "usage": [
      "多步骤任务展示完成、当前和未完成状态。",
      "Show complete, current, and pending states for multi-step work."
    ]
  },
  "toast": {
    "classes": [
      ".uzu-toast",
      "[data-uzu-toast]",
      "[data-uzu-toast-close]"
    ],
    "usage": [
      "短反馈消息使用 toast，关闭按钮加 data-uzu-toast-close；脚本会补齐默认 live region 语义。",
      "Use toast for short feedback; add data-uzu-toast-close to the close button. The script fills default live region semantics."
    ]
  },
  "disclosure": {
    "classes": [
      ".uzu-disclosure",
      "[data-uzu-disclosure]",
      "[data-uzu-disclosure-panel]"
    ],
    "usage": [
      "默认隐藏的补充内容使用 disclosure。",
      "Use disclosures for supporting content hidden by default."
    ]
  },
  "dialog": {
    "classes": [
      ".uzu-dialog-overlay",
      ".uzu-modal",
      "[data-uzu-dialog]"
    ],
    "usage": [
      "需要临时阻塞用户处理的任务使用 dialog；打开时背景会进入 inert 状态并锁定滚动。",
      "Use dialogs for temporary tasks that need user attention. Opening one makes the background inert and locks page scroll."
    ]
  },
  "popover": {
    "classes": [
      ".uzu-popover"
    ],
    "usage": [
      "短说明、局部菜单或少量设置使用 popover。",
      "Use popovers for short notes, local menus, or a small set of settings."
    ]
  },
  "accordion": {
    "classes": [
      ".uzu-accordion",
      "[data-uzu-accordion]",
      "[data-uzu-accordion-multiple]"
    ],
    "purpose": [
      "用于把多个 disclosure 组成一组，减少长页面里的同时展开内容。",
      "Use accordions to group several disclosures and reduce simultaneous open content on long pages."
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
    "purpose": [
      "用于危险、破坏性或不可轻易撤销的确认流程。",
      "Use alert dialogs for dangerous, destructive, or hard-to-undo confirmations."
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
    "purpose": [
      "用于临时设置、筛选、详情或较短的侧向任务面板。",
      "Use drawers and sheets for temporary settings, filters, details, or short side tasks."
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
    "purpose": [
      "用于悬浮或聚焦时展示少量补充信息。",
      "Use hover cards for small supporting information on hover or focus."
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
    ],
    "usage": [
      "短标签或补充解释使用 tooltip。",
      "Use tooltips for short labels or explanations."
    ]
  }
}
);
