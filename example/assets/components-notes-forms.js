window.UsuzumiComponentDocs = window.UsuzumiComponentDocs || {};
window.UsuzumiComponentDocs.componentNotes = Object.assign(
  window.UsuzumiComponentDocs.componentNotes || {},
{
  "select": {
    "classes": [
      ".uzu-select",
      "[data-uzu-select]",
      "[data-uzu-select-option]"
    ],
    "usage": [
      "自定义选择器需要 trigger、menu 和 option，并可设置 data-uzu-select-name。",
      "Custom selects need trigger, menu, option, and can set data-uzu-select-name."
    ]
  },
  "combobox": {
    "classes": [
      ".uzu-combobox",
      ".uzu-combobox-input",
      ".uzu-combobox-list",
      ".uzu-combobox-option"
    ],
    "purpose": [
      "用于可搜索的单选值，例如组件名、成员、标签或项目。",
      "Use it for searchable single-value choices such as components, members, tags, or projects."
    ],
    "structure": [
      "外层加 `data-uzu-combobox`；输入框加 `data-uzu-combobox-input`；列表加 `data-uzu-combobox-list`；每个选项加 `data-uzu-combobox-option` 和值。",
      "Add `data-uzu-combobox` outside, `data-uzu-combobox-input` to the input, `data-uzu-combobox-list` to the list, and `data-uzu-combobox-option` plus a value to each option."
    ],
    "behavior": [
      "输入时会本地过滤选项；上下方向键移动高亮，Enter 选择，Esc 关闭；设置 `data-uzu-combobox-name` 会生成隐藏 input。",
      "Typing filters local options; Up/Down moves the active option, Enter selects, Escape closes, and `data-uzu-combobox-name` creates a hidden input."
    ]
  },
  "switch": {
    "classes": [
      ".uzu-switch",
      "[data-uzu-switch]"
    ],
    "usage": [
      "立即生效的二元设置用开关。",
      "Use switches for binary settings that apply immediately."
    ]
  },
  "input": {
    "classes": [
      ".uzu-field",
      ".uzu-label",
      ".uzu-input",
      ".uzu-textarea",
      ".uzu-help"
    ],
    "usage": [
      "字段用 .uzu-field 包住 label、输入控件和帮助文字。",
      "Wrap labels, controls, and helper text in .uzu-field."
    ]
  },
  "form": {
    "classes": [
      ".uzu-form",
      ".uzu-fieldset",
      ".uzu-form-message",
      ".uzu-form-error"
    ],
    "purpose": [
      "用于真实提交区、设置页和短表单，把字段组、说明和错误消息放在同一套间距里。",
      "Use it for real submit areas, settings pages, and short forms with shared spacing for fieldsets, messages, and errors."
    ],
    "structure": [
      "外层使用 `.uzu-form`，分组使用 `fieldset.uzu-fieldset`，字段仍然使用现有 `.uzu-field`。",
      "Use `.uzu-form` outside, `fieldset.uzu-fieldset` for groups, and keep `.uzu-field` for individual controls."
    ],
    "behavior": [
      "表单结构没有脚本行为；验证状态仍由项目代码设置 `.is-invalid`、`aria-invalid` 和错误消息。",
      "Form structure has no script behavior; application code still sets `.is-invalid`, `aria-invalid`, and error messages."
    ]
  },
  "input-group": {
    "classes": [
      ".uzu-input-group",
      ".uzu-input-addon",
      ".uzu-input-action"
    ],
    "purpose": [
      "用于单位、固定前缀或与输入值绑定的局部动作。",
      "Use it for units, fixed prefixes, or local actions tied to the input value."
    ],
    "structure": [
      "把 `.uzu-input`、`.uzu-input-addon` 和可选按钮放进 `.uzu-input-group`，首尾圆角由容器处理。",
      "Place `.uzu-input`, `.uzu-input-addon`, and optional buttons inside `.uzu-input-group`; the group handles edge radius."
    ],
    "behavior": [
      "输入组合没有脚本行为；按钮仍按普通 `.uzu-button` 处理。",
      "Input groups have no script behavior; buttons behave as normal `.uzu-button` controls."
    ]
  },
  "search": {
    "classes": [
      ".uzu-search",
      ".uzu-search-input",
      ".uzu-search-clear",
      "[data-uzu-search]",
      "[data-uzu-search-clear]"
    ],
    "purpose": [
      "用于列表、表格或命令区的短文本过滤。",
      "Use it for short text filtering in lists, tables, or command surfaces."
    ],
    "structure": [
      "外层加 `.uzu-search` 和 `data-uzu-search`，输入使用 `.uzu-search-input`，清空按钮加 `data-uzu-search-clear`。",
      "Add `.uzu-search` and `data-uzu-search` to the wrapper, use `.uzu-search-input` for the input, and add `data-uzu-search-clear` to the clear button."
    ],
    "behavior": [
      "清空按钮会在有值时显示；点击后清空输入并派发 `input` 与 `change`。",
      "The clear button appears when a value exists; clicking it clears the input and emits `input` and `change`."
    ]
  },
  "password": {
    "classes": [
      ".uzu-password",
      ".uzu-password-input",
      ".uzu-password-toggle",
      "[data-uzu-password]",
      "[data-uzu-password-toggle]"
    ],
    "purpose": [
      "用于需要临时查看输入内容的密码字段。",
      "Use it for password fields where the value may need to be revealed temporarily."
    ],
    "structure": [
      "外层加 `.uzu-password` 和 `data-uzu-password`，输入使用 `.uzu-password-input`，按钮加 `data-uzu-password-toggle`。",
      "Add `.uzu-password` and `data-uzu-password` to the wrapper, use `.uzu-password-input` for the input, and add `data-uzu-password-toggle` to the button."
    ],
    "behavior": [
      "切换按钮会在 `password` 与 `text` 之间切换，并同步 `aria-pressed`，派发 `uzu-password-toggle`。",
      "The toggle switches between `password` and `text`, syncs `aria-pressed`, and emits `uzu-password-toggle`."
    ]
  },
  "file-upload": {
    "classes": [
      ".uzu-file-upload",
      ".uzu-file-input",
      ".uzu-file-summary"
    ],
    "purpose": [
      "用于文件选择入口，保留浏览器原生选择体验。",
      "Use it for file selection while keeping the browser-native picker."
    ],
    "structure": [
      "`.uzu-file-upload` 可以包住 `.uzu-file-input` 和 `.uzu-file-summary`，也可以作为独立选择区域。",
      "`.uzu-file-upload` can wrap `.uzu-file-input` and `.uzu-file-summary`, or act as a standalone selection surface."
    ],
    "behavior": [
      "组件负责选择入口和说明文字；项目代码负责读取文件、展示上传进度和保存结果。",
      "The component covers the picker surface and helper copy; application code reads files, shows upload progress, and saves results."
    ]
  },
  "slider": {
    "classes": [
      ".uzu-slider",
      "input[type=\"range\"]"
    ],
    "purpose": [
      "用于连续范围值，例如密度、透明度、音量。",
      "Use it for continuous ranges such as density, opacity, or volume."
    ],
    "structure": [
      "把 `.uzu-slider` 加在原生 `input[type=\"range\"]` 上，并用 label 描述数值含义。",
      "Add `.uzu-slider` to a native `input[type=\"range\"]` and label what the value means."
    ],
    "behavior": [
      "滑块使用浏览器原生行为；项目需要自己显示当前值或同步 `aria-valuetext`。",
      "The slider uses native browser behavior; application code should show the current value or sync `aria-valuetext`."
    ]
  },
  "stepper": {
    "classes": [
      ".uzu-stepper",
      ".uzu-stepper-input",
      ".uzu-stepper-button",
      "[data-uzu-stepper]"
    ],
    "purpose": [
      "用于小范围数字调整，例如成员数量、份数、间距倍率。",
      "Use it for small numeric ranges such as members, quantity, or spacing scale."
    ],
    "structure": [
      "外层加 `data-uzu-stepper`，输入使用 `.uzu-stepper-input`，加减按钮分别使用 `data-uzu-stepper-decrement` 和 `data-uzu-stepper-increment`。",
      "Add `data-uzu-stepper` to the wrapper, use `.uzu-stepper-input`, and mark buttons with `data-uzu-stepper-decrement` and `data-uzu-stepper-increment`."
    ],
    "behavior": [
      "脚本读取 `min`、`max`、`step`，更新禁用态，并派发 `uzu-stepper-change`。",
      "The script reads `min`, `max`, and `step`, updates disabled states, and emits `uzu-stepper-change`."
    ]
  },
  "checkbox-radio": {
    "classes": [
      ".uzu-check-row",
      "input[type=\"checkbox\"]",
      "input[type=\"radio\"]"
    ],
    "usage": [
      "多选用 checkbox，互斥选择用 radio。",
      "Use checkboxes for multiple choices and radios for mutually exclusive choices."
    ]
  }
}
);
