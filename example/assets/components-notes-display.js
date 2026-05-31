window.UsuzumiComponentDocs = window.UsuzumiComponentDocs || {};
window.UsuzumiComponentDocs.componentNotes = Object.assign(
  window.UsuzumiComponentDocs.componentNotes || {},
{
  "card": {
    "classes": [
      ".uzu-card",
      ".uzu-card-muted"
    ],
    "usage": [
      "用于成组信息、重复项目或需要明确边界的局部内容。",
      "Use cards for grouped information, repeated items, or bounded local content."
    ]
  },
  "stat": {
    "classes": [
      ".uzu-stat",
      ".uzu-stat-value",
      ".uzu-stat-note"
    ],
    "usage": [
      "展示一个指标、一句标签和一行解释。",
      "Show one metric, one label, and one short note."
    ]
  },
  "table": {
    "classes": [
      ".uzu-table-wrap",
      ".uzu-table"
    ],
    "usage": [
      "结构化数据用 table，外层加 .uzu-table-wrap 处理横向滚动。",
      "Use table markup for structured data and wrap it with .uzu-table-wrap."
    ]
  },
  "data-grid": {
    "classes": [
      ".uzu-data-grid-wrap",
      ".uzu-data-grid",
      "[data-uzu-data-grid]"
    ],
    "purpose": [
      "用于轻量数据表的排序、选择和键盘浏览。",
      "Use it for sorting, selecting, and keyboard browsing in lightweight data tables."
    ],
    "structure": [
      "保留真实 `table` 结构；可排序表头加 `data-uzu-grid-sort`，可选择行加 `data-uzu-grid-row`。",
      "Keep real `table` markup; add `data-uzu-grid-sort` to sortable headers and `data-uzu-grid-row` to selectable rows."
    ],
    "behavior": [
      "点击表头切换升序 / 降序；点击行切换选择；行获得焦点后可用上下方向键移动。",
      "Click headers to toggle ascending/descending sort, click rows to select, and use Up/Down when a row has focus."
    ]
  },
  "tree": {
    "classes": [
      ".uzu-tree",
      ".uzu-tree-item",
      ".uzu-tree-group",
      ".uzu-tree-toggle",
      ".uzu-tree-label"
    ],
    "purpose": [
      "用于层级对象，例如文件、分类、页面树。",
      "Use it for hierarchical objects such as files, categories, and page trees."
    ],
    "structure": [
      "树根加 `data-uzu-tree`；每一项加 `data-uzu-tree-item`，子级放进 `.uzu-tree-group`。有子级的项需要一个 `data-uzu-tree-toggle`。",
      "Add `data-uzu-tree` to the root; each item uses `data-uzu-tree-item`, children live in `.uzu-tree-group`, and parent items need `data-uzu-tree-toggle`."
    ],
    "behavior": [
      "脚本同步 `role=tree/treeitem`、`aria-expanded`、`aria-selected` 和 roving tabindex。方向键可展开、收起、上下移动。",
      "The runtime syncs `role=tree/treeitem`, `aria-expanded`, `aria-selected`, and roving tabindex. Arrow keys expand, collapse, and move focus."
    ]
  },
  "separator": {
    "classes": [
      ".uzu-separator",
      ".uzu-separator-vertical"
    ],
    "usage": [
      "在紧凑表面内分隔相关内容。",
      "Divide related content inside compact surfaces."
    ]
  },
  "code": {
    "classes": [
      ".uzu-code",
      ".uzu-kbd"
    ],
    "usage": [
      "类名、变量名和快捷键提示使用内联代码样式。",
      "Use inline code styles for class names, variables, and keyboard hints."
    ]
  },
  "json-viewer": {
    "classes": [
      ".uzu-json-viewer",
      "[data-uzu-json-viewer]"
    ],
    "purpose": [
      "用于展示配置、响应体或调试数据，让嵌套对象可以折叠阅读。",
      "Use it for configuration, response bodies, or debug data with collapsible nested objects."
    ],
    "structure": [
      "源码里把 JSON 文本直接放在 `.uzu-json-viewer[data-uzu-json-viewer]` 中，也可以放进内部 `script type=\"application/json\"`。",
      "In source, place JSON text directly inside `.uzu-json-viewer[data-uzu-json-viewer]`, or place it in an inner `script type=\"application/json\"`."
    ],
    "behavior": [
      "初始化后会把源码 JSON 解析成 `.uzu-json-node` 树；Elements 面板看到的是运行后 DOM，原始文本保存在 `data-uzu-json-source`。",
      "Initialization parses the source JSON into a `.uzu-json-node` tree; DevTools Elements shows runtime DOM, while the source text is kept in `data-uzu-json-source`."
    ]
  },
  "diff-viewer": {
    "classes": [
      ".uzu-diff-viewer",
      "[data-uzu-diff-viewer]"
    ],
    "purpose": [
      "用于展示小段变更内容，让新增、删除和元信息更容易扫读。",
      "Use it for short change previews where additions, removals, and metadata need to scan clearly."
    ],
    "structure": [
      "把统一 diff 文本放进 `pre.uzu-diff-viewer[data-uzu-diff-viewer]`。",
      "Place unified diff text in `pre.uzu-diff-viewer[data-uzu-diff-viewer]`."
    ],
    "behavior": [
      "初始化后逐行包裹代码和行号，按 `+`、`-`、`@` 判断行类型。",
      "Initialization wraps each line with code and gutters, classifying rows by `+`, `-`, and `@`."
    ]
  },
  "list": {
    "classes": [
      ".uzu-list",
      ".uzu-list-item",
      ".uzu-list-meta",
      ".uzu-list-action"
    ],
    "purpose": [
      "用于展示同一类对象、记录或任务，每一项可以带说明和末尾操作。",
      "Use lists for related objects, records, or tasks with optional meta copy and trailing actions."
    ],
    "structure": [
      "外层使用 `.uzu-list`，每一项使用 `.uzu-list-item`；说明放进 `.uzu-list-meta`，末尾按钮放进 `.uzu-list-action`。",
      "Use `.uzu-list` outside and `.uzu-list-item` for each row; place supporting copy in `.uzu-list-meta` and trailing controls in `.uzu-list-action`."
    ],
    "behavior": [
      "列表保留静态 HTML 结构；项目代码可以在列表项里放链接、按钮和选中状态。",
      "Lists keep a static HTML structure; application code can place links, buttons, and selection states inside rows."
    ]
  },
  "avatar": {
    "classes": [
      ".uzu-avatar"
    ],
    "purpose": [
      "用于用户、团队或对象的紧凑身份标识，支持图片、缩写或占位字符。",
      "Use avatars as compact identity markers for users, teams, or objects, with an image, initials, or fallback text."
    ],
    "structure": [
      "在 `.uzu-avatar` 中放 `img` 或短文本；尺寸通过 `--uzu-avatar-size` 调整。",
      "Place an `img` or short text inside `.uzu-avatar`; tune size with `--uzu-avatar-size`."
    ],
    "behavior": [
      "头像使用静态内容表达身份；可访问名称可以来自相邻文本或 `aria-label`。",
      "Avatars express identity with static content; the accessible name can come from nearby text or `aria-label`."
    ]
  },
  "tag": {
    "classes": [
      ".uzu-tag",
      ".uzu-tag-close",
      "[data-uzu-tag]",
      "[data-uzu-tag-close]"
    ],
    "purpose": [
      "用于分类、已选筛选项或可移除的短标签，语义上不同于状态徽章。",
      "Use tags for categories, selected filters, or removable short labels, separate from status badges."
    ],
    "structure": [
      "静态标签只需要 `.uzu-tag`；可选择标签加 `data-uzu-tag-selectable=\"true\"`；可关闭标签内放 `.uzu-tag-close`。",
      "Static tags only need `.uzu-tag`; selectable tags add `data-uzu-tag-selectable=\"true\"`; removable tags include `.uzu-tag-close`."
    ],
    "behavior": [
      "运行时可切换 `aria-pressed` 和 `.is-selected`，关闭按钮派发 `uzu-tag-close`，选择变化派发 `uzu-tag-change`。",
      "The runtime can toggle `aria-pressed` and `.is-selected`; close buttons emit `uzu-tag-close` and selection changes emit `uzu-tag-change`."
    ]
  },
  "empty-error": {
    "classes": [
      ".uzu-empty-state",
      ".uzu-error-state"
    ],
    "purpose": [
      "用于内容缺失或加载失败时的占位说明。",
      "Use these for empty content or failed loading states."
    ],
    "structure": [
      "外层使用 `.uzu-empty-state` 或 `.uzu-error-state`，内部放标题、说明和可选操作。",
      "Use `.uzu-empty-state` or `.uzu-error-state` outside, with a title, message, and optional action inside."
    ],
    "behavior": [
      "空状态可以承载下一步操作；错误状态需要被读屏及时播报时添加 `role=\"alert\"`。",
      "Empty states can carry the next action; add `role=\"alert\"` when an error state should be announced immediately."
    ]
  }
}
);
