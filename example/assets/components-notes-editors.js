window.UsuzumiComponentDocs = window.UsuzumiComponentDocs || {};
window.UsuzumiComponentDocs.componentNotes = Object.assign(
  window.UsuzumiComponentDocs.componentNotes || {},
{
  "rich-editor": {
    "classes": [
      ".uzu-editor",
      ".uzu-editor-toolbar",
      ".uzu-toolbar-button",
      ".uzu-editor-surface",
      "[data-uzu-rich-editor]"
    ],
    "structure": [
      "外层使用 `data-uzu-rich-editor`，工具栏按钮使用 `data-uzu-editor-command`；编辑区域使用 `data-uzu-editor-surface`。`contenteditable`、selection 和文档模型由外部编辑器实例接管。",
      "Use `data-uzu-rich-editor` on the wrapper, `data-uzu-editor-command` on toolbar buttons, and `data-uzu-editor-surface` for the editable mount. The external editor instance owns `contenteditable`, selection, and the document model."
    ],
    "behavior": [
      "按钮点击会派发 `uzu-editor-command`，内容区输入会派发 `uzu-editor-change`。把这两个事件接到 Tiptap 实例即可。",
      "Button clicks emit `uzu-editor-command`; surface input emits `uzu-editor-change`. Wire those events to a Tiptap instance."
    ],
    "tutorialSections": [
      {
        "title": [
          "结构",
          "Structure"
        ],
        "body": [
          "工具栏、按钮和内容区都使用 Usuzumi 类名；编辑器实例挂在 `data-uzu-editor-surface` 上。按钮上的 `data-uzu-editor-command` 是命令名，`data-uzu-editor-value` 是可选参数。",
          "Use Usuzumi classes for the toolbar, buttons, and surface. Mount the editor instance into `data-uzu-editor-surface`. `data-uzu-editor-command` is the command name, and `data-uzu-editor-value` is an optional parameter."
        ],
        "code": "<section class=\"uzu-editor\" data-uzu-rich-editor>\n  <div class=\"uzu-editor-toolbar\" role=\"toolbar\">\n    <button class=\"uzu-toolbar-button\" type=\"button\" data-uzu-editor-command=\"bold\" data-uzu-editor-toggle>B</button>\n    <button class=\"uzu-toolbar-button\" type=\"button\" data-uzu-editor-command=\"heading\" data-uzu-editor-value=\"2\">H2</button>\n  </div>\n  <div class=\"uzu-editor-surface\" data-uzu-editor-surface></div>\n</section>",
        "language": "html"
      },
      {
        "title": [
          "事件桥",
          "Event Bridge"
        ],
        "body": [
          "监听 `uzu-editor-command` 后读取 `event.detail.command`、`value` 和 `button`。命令执行成功后，同步按钮的 `aria-pressed` 和 `.is-active`，让视觉状态跟编辑器 selection 一致。",
          "Listen for `uzu-editor-command`, then read `event.detail.command`, `value`, and `button`. After the command runs, sync `aria-pressed` and `.is-active` so visual state follows the editor selection."
        ],
        "code": "shell.addEventListener('uzu-editor-command', (event) => {\n  const { button, command, value } = event.detail;\n  editor.commands[command]?.(value);\n  const active = editor.isActive(command, value ? { level: Number(value) } : undefined);\n  button.setAttribute('aria-pressed', active ? 'true' : 'false');\n  button.classList.toggle('is-active', active);\n});",
        "language": "js"
      },
      {
        "title": [
          "内容同步",
          "Content Sync"
        ],
        "body": [
          "外部编辑器更新内容时，可以派发 `uzu-editor-change`，把当前 HTML 或 JSON 文档交给表单、保存逻辑或预览逻辑。",
          "When the external editor updates content, emit `uzu-editor-change` with the current HTML or JSON document for forms, saving, or preview logic."
        ],
        "code": "editor.on('update', () => {\n  shell.dispatchEvent(new CustomEvent('uzu-editor-change', {\n    bubbles: true,\n    detail: { editor: shell, surface, value: editor.getHTML() }\n  }));\n});",
        "language": "js"
      }
    ]
  },
  "markdown-editor": {
    "classes": [
      ".uzu-markdown-editor",
      ".uzu-markdown-source",
      ".uzu-markdown-preview",
      "[data-uzu-markdown-editor]"
    ],
    "structure": [
      "外层使用 `data-uzu-markdown-editor`，源码区域使用 `data-uzu-markdown-source`，预览区域使用 `data-uzu-markdown-preview`。源码编辑和 Markdown 解析可以分别接给不同库。",
      "Use `data-uzu-markdown-editor` on the wrapper, `data-uzu-markdown-source` for source, and `data-uzu-markdown-preview` for preview. Source editing and Markdown parsing can be wired to separate libraries."
    ],
    "behavior": [
      "源码输入会派发 `uzu-markdown-editor-change`。`data-uzu-markdown-render` 会启用内置轻量预览；完整文档建议用 markdown-it 更新预览区。",
      "Source input emits `uzu-markdown-editor-change`. `data-uzu-markdown-render` enables the light built-in preview; complete documents can update the preview through markdown-it."
    ],
    "tutorialSections": [
      {
        "title": [
          "基础结构",
          "Base Structure"
        ],
        "body": [
          "保留源码区和预览区两个明确节点。CodeMirror 6 可以挂在源码区，markdown-it 负责写入预览区。",
          "Keep separate source and preview nodes. CodeMirror 6 can mount over the source area, while markdown-it writes into the preview area."
        ],
        "code": "<section class=\"uzu-editor uzu-markdown-editor\" data-uzu-markdown-editor>\n  <textarea class=\"uzu-markdown-source\" data-uzu-markdown-source># Draft</textarea>\n  <div class=\"uzu-markdown-preview uzu-prose\" data-uzu-markdown-preview></div>\n</section>",
        "language": "html"
      },
      {
        "title": [
          "预览渲染",
          "Preview Rendering"
        ],
        "body": [
          "监听 `uzu-markdown-editor-change`，把 `event.detail.value` 交给项目的 Markdown 解析器，再把结果写入 `data-uzu-markdown-preview`。渲染完成后派发 `uzu-markdown-editor-render`，其它逻辑就能感知预览已更新。",
          "Listen for `uzu-markdown-editor-change`, pass `event.detail.value` to your Markdown parser, then write the result into `data-uzu-markdown-preview`. Emit `uzu-markdown-editor-render` after rendering so other code can react to the updated preview."
        ],
        "code": "shell.addEventListener('uzu-markdown-editor-change', (event) => {\n  const value = event.detail.value;\n  preview.innerHTML = markdown.render(value);\n  shell.dispatchEvent(new CustomEvent('uzu-markdown-editor-render', {\n    bubbles: true,\n    detail: { editor: shell, source, preview, value }\n  }));\n});",
        "language": "js"
      },
      {
        "title": [
          "内置预览",
          "Built-in Preview"
        ],
        "body": [
          "给外层加 `data-uzu-markdown-render` 会启用 Usuzumi 的轻量预览辅助，支持标题、段落、无序列表、链接、行内代码和 fenced code。它适合小型说明和示例预览。",
          "Add `data-uzu-markdown-render` to enable Usuzumi’s light preview helper. It supports headings, paragraphs, unordered lists, links, inline code, and fenced code, which fits small notes and example previews."
        ],
        "code": "<section class=\"uzu-editor uzu-markdown-editor\" data-uzu-markdown-editor data-uzu-markdown-render>\n  <textarea class=\"uzu-markdown-source\" data-uzu-markdown-source># Preview</textarea>\n  <div class=\"uzu-markdown-preview\" data-uzu-markdown-preview></div>\n</section>",
        "language": "html"
      }
    ]
  },
  "code-editor": {
    "classes": [
      ".uzu-code-editor"
    ],
    "structure": [
      "把 `.uzu-code-editor` 加在 `textarea` 上；长代码或需要语言服务时，把 CodeMirror 6 挂进 `.uzu-editor` 外壳。",
      "Add `.uzu-code-editor` to a `textarea`; for long code or language services, mount CodeMirror 6 inside the `.uzu-editor` shell."
    ],
    "behavior": [
      "浏览器负责基础文本输入；项目代码可以监听 `input` / `change` 保存内容，或把外部编辑器的 update 事件转成项目自己的保存流程。",
      "The browser handles basic text input; application code can listen for `input` / `change` to save content, or map external editor updates into its own save flow."
    ],
    "tutorialSections": [
      {
        "title": [
          "短代码输入",
          "Short Code Input"
        ],
        "body": [
          "配置片段、模板变量和命令文本可以直接使用 `textarea.uzu-code-editor`。它保留表单提交能力，也能使用原生 `input` / `change` 事件。",
          "Configuration snippets, template variables, and command text can use `textarea.uzu-code-editor` directly. It keeps form submission and native `input` / `change` events."
        ],
        "code": "<textarea class=\"uzu-code-editor\" spellcheck=\"false\" name=\"config\">const theme = \"light\";</textarea>",
        "language": "html"
      },
      {
        "title": [
          "外部编辑器容器",
          "External Editor Container"
        ],
        "body": [
          "需要高亮、补全、诊断或大文件性能时，使用 `.uzu-editor` 提供边框、背景和尺寸，再把 CodeMirror 6 挂到内部节点。",
          "For highlighting, completion, diagnostics, or large-file performance, use `.uzu-editor` for border, background, and sizing, then mount CodeMirror 6 into an inner node."
        ],
        "code": "<section class=\"uzu-editor\" style=\"--uzu-editor-min-height: 320px\">\n  <div data-code-editor-mount></div>\n</section>",
        "language": "html"
      }
    ]
  },
  "plain-editor": {
    "classes": [
      ".uzu-plain-editor"
    ],
    "structure": [
      "把 `.uzu-plain-editor` 加在 `textarea` 上，并提供可见 label 或清楚的 `aria-label`。",
      "Add `.uzu-plain-editor` to a `textarea` and provide a visible label or a clear `aria-label`."
    ],
    "behavior": [
      "浏览器负责文本输入、选择、滚动和表单提交；项目代码可以接入验证、自动保存和字数统计。",
      "The browser handles text input, selection, scrolling, and form submission; application code can add validation, autosave, and word counts."
    ]
  },
  "inline-editor": {
    "classes": [
      ".uzu-inline-editor",
      "[data-uzu-inline-editor]"
    ],
    "structure": [
      "外层元素加 `.uzu-inline-editor` 和 `data-uzu-inline-editor`；空值提示可用 `data-placeholder`。",
      "Add `.uzu-inline-editor` and `data-uzu-inline-editor` to the element; use `data-placeholder` for empty text."
    ],
    "behavior": [
      "运行时会设置 `contenteditable` 和 `role=\"textbox\"`，输入时派发 `uzu-inline-editor-change`。",
      "The runtime sets `contenteditable` and `role=\"textbox\"`, then emits `uzu-inline-editor-change` on input."
    ]
  }
}
);
