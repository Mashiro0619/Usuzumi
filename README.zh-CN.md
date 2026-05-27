# Usuzumi

[English](README.md)

Usuzumi 是一套零构建网页设计系统，适用于安静、克制的编辑型界面、个人页面、应用介绍页、文档页面和小型产品工具。

它提供 `uzu-*` CSS 原语、柔和的单色视觉语言、可选的签名字体，以及少量无依赖 JavaScript，用于常见 UI 行为。

## 安装

```bash
npm install usuzumi
```

```js
import "usuzumi/usuzumi.css";
import "usuzumi/usuzumi.js";
```

只有在使用 `.uzu-signature` 或签名字体样张时，才需要额外引入：

```js
import "usuzumi/usuzumi-signature.css";
```

CDN 用法：

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/usuzumi/ui/usuzumi.css">
<script src="https://cdn.jsdelivr.net/npm/usuzumi/ui/usuzumi.js" defer></script>
```

## 使用

完整页面可以使用 `uzu-root` 和 `uzu-app`：

```html
<html class="uzu-root" lang="zh-CN" data-theme="light">
  <body class="uzu-app">
    <main class="uzu-page">
      <section class="uzu-section">
        <div class="uzu-section-head">
          <p class="uzu-section-label">Overview</p>
          <h1 class="uzu-page-title">A quiet interface starts with good rhythm.</h1>
        </div>
        <button class="uzu-button uzu-button-primary">Continue</button>
      </section>
    </main>
  </body>
</html>
```

如果只想在现有页面中局部使用，可以包一层 `uzu-scope`：

```html
<section class="uzu-scope">
  <article class="uzu-card">
    <h3>Scoped component</h3>
    <p>This area adopts Usuzumi without taking over the whole page.</p>
  </article>
</section>
```

## 包含内容

- 颜色、字体、间距、边框、圆角、动效和暗色模式等设计 token。
- 页面、章节、网格、按钮、卡片、表单、标签页、徽章、提示、表格、浮层、进度、骨架屏、toast、dialog、disclosure 和 tooltip 等布局与组件原语。
- 个人主页、应用介绍页、设计目录、项目列表、产品 mockup 和功能区块等页面模式。
- 主题切换、语言切换、自定义 select、switch、disclosure、dialog 和 toast 关闭等小型 JavaScript 行为。

## 运行时

JavaScript 会在浏览器中自动初始化，也可以安全地在 SSR/Node 环境中 import。动态插入内容后可手动初始化：

```js
window.Usuzumi.init(container);
```

自定义事件：

- `uzu-select-change`：`{ value, label, option, select }`
- `uzu-switch-change`：`{ checked, switch }`
- `uzu-disclosure-change`：`{ open, disclosure }`
- `uzu-toast-close`：`{ toast }`
- `uzu-dialog-open` / `uzu-dialog-close`：`{ dialog, overlay, trigger }`

项目内置 TypeScript 类型声明。

## 示例

- [设计系统目录](https://github.com/Mashiro0619/Usuzumi/blob/main/example/preview.html)
- [个人主页示例](https://github.com/Mashiro0619/Usuzumi/blob/main/example/index.html)
- [应用介绍页示例](https://github.com/Mashiro0619/Usuzumi/blob/main/example/app-introduction.html)

示例文件可以直接在浏览器中打开，不需要构建步骤或开发服务器。

## 维护

```bash
npm run build:css
npm run validate
```

运行时库没有依赖。完整设计规范见 [DESIGN.md](DESIGN.md)。

## 许可证

Usuzumi 代码使用 [MIT License](LICENSE) 发布。

内置的 Meddon 字体按其自身的 SIL Open Font License 条款再分发，详见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
