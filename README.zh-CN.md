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

## 自定义样式接口

Usuzumi 通过 CSS 自定义属性提供样式接口。项目应优先在 `:root`、`.uzu-app`、`.uzu-scope` 或局部容器上覆盖已文档化的 `--uzu-*` 变量，而不是直接覆盖组件内部选择器。

全局调整：

```css
:root {
  --uzu-radius-standard: 10px;
  --uzu-motion-base: 220ms;
}
```

局部调整：

```css
.settings-panel {
  --uzu-card-block-gap: 16px;
  --uzu-field-gap: 8px;
  --uzu-alert-max-width: 640px;
  --uzu-alert-accent-color: #6b5855;
  --uzu-alert-bg: #f4eeeb;
  --uzu-toast-width: 420px;
  --uzu-disclosure-panel-block-end-padding: 24px;
}
```

单个实例也可以直接设置变量：

```html
<article class="uzu-toast" style="--uzu-toast-width: 420px; --uzu-toast-content-end-offset: 8px">
  ...
</article>
```

已文档化的变量覆盖颜色角色、圆角、间距、动效、卡片标题节奏、表单字段间距、反馈卡片尺寸与颜色、Toast 尺寸和 Disclosure 内容边距。

| 变量 | 默认值 | 作用范围 | 建议设置位置 |
| --- | --- | --- | --- |
| `--uzu-card-title-size` | `18px` | `.uzu-title-pair` 标题 | `.uzu-app`、`.uzu-scope`、局部卡片 |
| `--uzu-card-title-line` | `1.25` | `.uzu-title-pair` 标题行高 | `.uzu-app`、`.uzu-scope`、局部卡片 |
| `--uzu-card-subtitle-size` | `13px` | `.uzu-title-pair` 说明文字 | `.uzu-app`、`.uzu-scope`、局部卡片 |
| `--uzu-card-subtitle-line` | `1.55` | `.uzu-title-pair` 说明文字行高 | `.uzu-app`、`.uzu-scope`、局部卡片 |
| `--uzu-card-title-gap` | `6px` | 标题和说明之间的距离 | `.uzu-app`、`.uzu-scope`、局部卡片 |
| `--uzu-card-block-gap` | `12px` | 卡片内重复内容间距 | `.uzu-app`、`.uzu-scope`、局部卡片 |
| `--uzu-field-gap` | `5px` | label、输入框、帮助文字间距 | `.uzu-app`、`.uzu-scope`、局部表单 |
| `--uzu-alert-max-width` | `520px` | Alert 最大宽度 | 局部 Alert 或外层容器 |
| `--uzu-alert-border-color` | `var(--uzu-border)` | Alert 边框 | 局部 Alert 或外层容器 |
| `--uzu-alert-accent-color` | `var(--uzu-border-strong)` | Alert 左侧强调线 | 局部 Alert 或外层容器 |
| `--uzu-alert-bg` | `var(--uzu-surface)` | Alert 背景 | 局部 Alert 或外层容器 |
| `--uzu-alert-title-color` | `var(--uzu-fg-strong)` | Alert 标题 | 局部 Alert 或外层容器 |
| `--uzu-alert-text-color` | `var(--uzu-muted)` | Alert 正文 | 局部 Alert 或外层容器 |
| `--uzu-callout-border-color` | `var(--uzu-border)` | Callout 边框 | 局部 Callout 或外层容器 |
| `--uzu-callout-bg` | 混合弱化表面色 | Callout 背景 | 局部 Callout 或外层容器 |
| `--uzu-callout-title-color` | `var(--uzu-fg-strong)` | Callout 标题 | 局部 Callout 或外层容器 |
| `--uzu-callout-text-color` | `var(--uzu-muted)` | Callout 正文 | 局部 Callout 或外层容器 |
| `--uzu-toast-width` | `360px` | Toast 宽度 | 局部 Toast 或 Toast stack |
| `--uzu-toast-inline-padding` | `16px` | Toast 左右内边距 | 局部 Toast 或 Toast stack |
| `--uzu-toast-content-end-offset` | `0px` | Toast 正文右边界和关闭按钮对齐 | 局部 Toast |
| `--uzu-toast-action-size` | `28px` | Toast 关闭按钮尺寸 | 局部 Toast |
| `--uzu-toast-action-gap` | `12px` | Toast 为关闭按钮预留的距离 | 局部 Toast |
| `--uzu-disclosure-panel-block-end-padding` | `20px` | Disclosure 面板底部间距 | 局部 Disclosure 或外层容器 |

Tabs 指示条、Segmented 指示条、Disclosure 实测高度等由运行时写入的变量属于内部状态，不建议在项目代码中手动设置。如果项目反复需要某个新尺寸，应在库里新增组件变量，而不是依赖 preview 专用 CSS。

## 包含内容

- 颜色、字体、间距、边框、圆角、动效和暗色模式等设计 token。
- 页面、章节、网格、按钮、工具栏、面包屑、分页、卡片、指标、表单、标签页、徽章、分割线、代码、快捷键提示、Alert 预设、callout、表格、浮层、进度、骨架屏、toast、dialog、disclosure 和 tooltip 等布局与组件原语。
- 个人主页、应用介绍页、设计目录、项目列表、产品 mockup 和功能区块等页面模式。
- 主题切换、语言切换、自定义 select、标签页、分段控件、分页、switch、disclosure、dialog 和 toast 关闭等小型 JavaScript 行为。

## 运行时

JavaScript 会在浏览器中自动初始化，也可以安全地在 SSR/Node 环境中 import。动态插入内容后可手动初始化：

```js
window.Usuzumi.init(container);
```

自定义事件：

- `uzu-select-change`：`{ value, label, option, select }`
- `uzu-tabs-change`：`{ value, tab, tabs, index, panel }`
- `uzu-segmented-change`：`{ value, segment, segmented, index }`
- `uzu-pagination-change`：`{ value, page, pagination, index, panel }`
- `uzu-switch-change`：`{ checked, switch }`
- `uzu-disclosure-change`：`{ open, disclosure }`
- `uzu-toast-close`：`{ toast }`
- `uzu-dialog-open` / `uzu-dialog-close`：`{ dialog, overlay, trigger }`

项目内置 TypeScript 类型声明。

## 示例

- [官网与组件展示](https://github.com/Mashiro0619/Usuzumi/blob/main/example/index.html)
- [个人主页示例](https://github.com/Mashiro0619/Usuzumi/blob/main/example/example-1.html)
- [应用介绍页示例](https://github.com/Mashiro0619/Usuzumi/blob/main/example/example-2.html)

示例文件可以直接在浏览器中打开，不需要构建步骤或开发服务器。

## 维护

仓库维护命令：

```bash
npm run build:css
npm run validate
```

`npm run validate` 会先检查源码约束，然后将库打包并安装到临时外部项目中，验证 package exports、CSS 文件、类型声明、CDN 风格的 `ui/*` 路径、浏览器运行时行为和官网布局 smoke check。

运行时库没有依赖。完整设计规范见 [DESIGN.md](DESIGN.md)。

## 许可证

Usuzumi 代码使用 [MIT License](LICENSE) 发布。

内置的 Meddon 字体按其自身的 SIL Open Font License 条款再分发，详见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
