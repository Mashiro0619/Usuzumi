window.UsuzumiComponentDocs = window.UsuzumiComponentDocs || {};
window.UsuzumiComponentDocs.componentNotes = Object.assign(
  window.UsuzumiComponentDocs.componentNotes || {},
{
  "button": {
    "classes": [
      ".uzu-button",
      ".uzu-button-primary",
      ".uzu-button-danger",
      ".uzu-icon-button"
    ],},
  "text-link": {
    "classes": [
      ".uzu-text-link"
    ],},
  "toolbar": {
    "classes": [
      ".uzu-toolbar",
      ".uzu-toolbar-group"
    ],},
  "breadcrumb": {
    "classes": [
      ".uzu-breadcrumb"
    ],},
  "pagination": {
    "classes": [
      ".uzu-pagination",
      "[data-uzu-pagination]",
      "[data-uzu-page]"
    ],},
  "tabs": {
    "classes": [
      ".uzu-tabs",
      ".uzu-tab",
      "[data-uzu-tabs]"
    ],},
  "segmented": {
    "classes": [
      ".uzu-segmented",
      ".uzu-segment",
      "[data-uzu-segmented]"
    ],},
  "menu": {
    "classes": [
      ".uzu-menu",
      ".uzu-menu-trigger",
      ".uzu-menu-content",
      ".uzu-menu-item",
      "[data-uzu-menu]",
      "[data-uzu-context-menu]"
    ],
    "structure": [
      "普通菜单使用 `data-uzu-menu`、`data-uzu-menu-trigger` 和 `data-uzu-menu-content`；右键菜单使用 `data-uzu-context-menu` 并指定触发目标。",
      "Use `data-uzu-menu`, `data-uzu-menu-trigger`, and `data-uzu-menu-content` for dropdowns; use `data-uzu-context-menu` with a trigger selector for context menus."
    ],
    "behavior": [
      "运行时同步 `aria-expanded`，支持外部点击、Esc、方向键、Enter/Space，并派发 open、close、select 事件。",
      "The runtime syncs `aria-expanded`, supports outside click, Escape, arrow keys, Enter/Space, and emits open, close, and select events."
    ]
  },
  "menubar": {
    "classes": [
      ".uzu-menubar",
      ".uzu-menubar-item",
      "[data-uzu-menubar]"
    ],
    "structure": [
      "外层使用 `.uzu-menubar` 和 `data-uzu-menubar`，子项使用 `.uzu-menubar-item`，可设置 `data-uzu-menubar-value`。",
      "Use `.uzu-menubar` with `data-uzu-menubar`; children use `.uzu-menubar-item` and can set `data-uzu-menubar-value`."
    ],
    "behavior": [
      "运行时设置 menubar/menuitem 角色，方向键移动焦点，点击派发 `uzu-menubar-change`。",
      "The runtime sets menubar/menuitem roles, moves focus with arrow keys, and emits `uzu-menubar-change` on click."
    ]
  },
  "command": {
    "classes": [
      ".uzu-command",
      ".uzu-command-input",
      ".uzu-command-list",
      ".uzu-command-item",
      "[data-uzu-command]"
    ],
    "structure": [
      "外层使用 `data-uzu-command`，输入框使用 `.uzu-command-input`，列表使用 `.uzu-command-list`，项目使用 `.uzu-command-item`。",
      "Use `data-uzu-command` outside, `.uzu-command-input` for the input, `.uzu-command-list` for results, and `.uzu-command-item` for options."
    ],
    "behavior": [
      "运行时按文本过滤本地项目，维护 active 项，支持方向键和 Enter，并派发 filter/select 事件。",
      "The runtime filters local items by text, maintains the active item, supports arrow keys and Enter, and emits filter/select events."
    ]
  },
  "sidebar": {
    "classes": [
      ".uzu-sidebar",
      ".uzu-sidebar-section",
      ".uzu-sidebar-nav"
    ],
    "structure": [
      "外层使用 `.uzu-sidebar`，分组使用 `.uzu-sidebar-section`，导航列表使用 `.uzu-sidebar-nav`。",
      "Use `.uzu-sidebar` outside, `.uzu-sidebar-section` for groups, and `.uzu-sidebar-nav` for the navigation list."
    ],
    "behavior": [
      "当前项用 `aria-current=\"page\"` 或 `.is-active` 标记；需要面板切换时可在内部按钮上配合 `data-uzu-panel-target`。",
      "Mark the current item with `aria-current=\"page\"` or `.is-active`; pair internal buttons with `data-uzu-panel-target` when the sidebar switches local panels."
    ]
  },
  "step-nav": {
    "classes": [
      ".uzu-step-nav",
      ".uzu-step-nav-item",
      ".uzu-step-nav-button",
      "[data-uzu-step-nav]"
    ],
    "structure": [
      "外层使用 `ol.uzu-step-nav[data-uzu-step-nav]`，每步按钮使用 `.uzu-step-nav-button` 和可选 `data-uzu-step-value`。",
      "Use `ol.uzu-step-nav[data-uzu-step-nav]`; each step button uses `.uzu-step-nav-button` and optional `data-uzu-step-value`."
    ],
    "behavior": [
      "运行时同步 `.is-active`、`.is-complete`、`aria-current=\"step\"`，点击或方向键切换并派发 `uzu-step-nav-change`。",
      "The runtime syncs `.is-active`, `.is-complete`, and `aria-current=\"step\"`, changes on click or arrow keys, and emits `uzu-step-nav-change`."
    ]
  }
}
);
