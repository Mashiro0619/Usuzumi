# Usuzumi

[中文](README.zh-CN.md)

Usuzumi is a zero-build web design system for quiet editorial interfaces, personal pages, app introductions, documentation, and small product tools.

It provides `uzu-*` CSS primitives, a soft monochrome visual language, optional signature typography, and a small dependency-free JavaScript runtime for common UI behavior.

## Install

```bash
npm install usuzumi
```

```js
import "usuzumi/usuzumi.css";
import "usuzumi/usuzumi.js";
```

Load the optional signature font only when using `.uzu-signature` or signature specimens:

```js
import "usuzumi/usuzumi-signature.css";
```

CDN usage:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/usuzumi/ui/usuzumi.css">
<script src="https://cdn.jsdelivr.net/npm/usuzumi/ui/usuzumi.js" defer></script>
```

## Usage

Use `uzu-root` and `uzu-app` for a full page:

```html
<html class="uzu-root" lang="en" data-theme="light">
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

Use `uzu-scope` when adopting Usuzumi inside an existing page:

```html
<section class="uzu-scope">
  <article class="uzu-card">
    <h3>Scoped component</h3>
    <p>This area adopts Usuzumi without taking over the whole page.</p>
  </article>
</section>
```

## Customization

Usuzumi is customized through CSS custom properties. Set documented `--uzu-*` variables on `:root`, `.uzu-app`, `.uzu-scope`, or a local wrapper before overriding component internals.

Global adjustments:

```css
:root {
  --uzu-radius-standard: 10px;
  --uzu-motion-base: 220ms;
}
```

Scoped adjustments:

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

Single-instance adjustments:

```html
<article class="uzu-toast" style="--uzu-toast-width: 420px; --uzu-toast-content-end-offset: 8px">
  ...
</article>
```

Documented variables cover color roles, radius, spacing, motion, card title rhythm, form field rhythm, feedback sizing and colors, toast sizing, and disclosure panel spacing.

| Variable | Default | Applies to | Suggested scope |
| --- | --- | --- | --- |
| `--uzu-card-title-size` | `18px` | `.uzu-title-pair` heading | `.uzu-app`, `.uzu-scope`, local card |
| `--uzu-card-title-line` | `1.25` | `.uzu-title-pair` heading | `.uzu-app`, `.uzu-scope`, local card |
| `--uzu-card-subtitle-size` | `13px` | `.uzu-title-pair` description | `.uzu-app`, `.uzu-scope`, local card |
| `--uzu-card-subtitle-line` | `1.55` | `.uzu-title-pair` description | `.uzu-app`, `.uzu-scope`, local card |
| `--uzu-card-title-gap` | `6px` | title/description rhythm | `.uzu-app`, `.uzu-scope`, local card |
| `--uzu-card-block-gap` | `12px` | repeated card content spacing | `.uzu-app`, `.uzu-scope`, local card |
| `--uzu-field-gap` | `5px` | label/input/help spacing | `.uzu-app`, `.uzu-scope`, local form |
| `--uzu-alert-max-width` | `520px` | alert width | local alert or container |
| `--uzu-alert-border-color` | `var(--uzu-border)` | alert border | local alert or container |
| `--uzu-alert-accent-color` | `var(--uzu-border-strong)` | alert left accent | local alert or container |
| `--uzu-alert-bg` | `var(--uzu-surface)` | alert background | local alert or container |
| `--uzu-alert-title-color` | `var(--uzu-fg-strong)` | alert title | local alert or container |
| `--uzu-alert-text-color` | `var(--uzu-muted)` | alert body text | local alert or container |
| `--uzu-callout-border-color` | `var(--uzu-border)` | callout border | local callout or container |
| `--uzu-callout-bg` | mixed soft surface | callout background | local callout or container |
| `--uzu-callout-title-color` | `var(--uzu-fg-strong)` | callout title | local callout or container |
| `--uzu-callout-text-color` | `var(--uzu-muted)` | callout body text | local callout or container |
| `--uzu-toast-width` | `360px` | toast width | local toast or toast stack |
| `--uzu-toast-inline-padding` | `16px` | toast side padding | local toast or toast stack |
| `--uzu-toast-content-end-offset` | `0px` | toast text/right action alignment | local toast |
| `--uzu-toast-action-size` | `28px` | toast close button size | local toast |
| `--uzu-toast-action-gap` | `12px` | gap reserved for toast action | local toast |
| `--uzu-disclosure-panel-block-end-padding` | `20px` | disclosure panel bottom spacing | local disclosure or container |

Runtime-written variables for tab indicators, segmented indicators, and measured disclosure height are internal state and should not be set by application code. If a repeated project need is not covered by the variable API, add a component variable to the library instead of depending on preview-only CSS.

## Included

- Design tokens for color, typography, spacing, borders, radius, motion, and dark mode.
- Layout and component primitives for pages, sections, grids, buttons, toolbars, breadcrumbs, pagination, cards, stats, forms, tabs, badges, separators, code, keyboard hints, alert presets, callouts, tables, overlays, progress, skeletons, toasts, dialogs, disclosures, and tooltips.
- Page patterns for personal homepages, app introduction pages, design catalogs, project lists, mockups, and feature sections.
- Small JavaScript helpers for theme toggles, language toggles, custom selects, tabs, segmented controls, pagination, switches, disclosures, dialogs, and toast dismissal.

## Runtime

The JavaScript runtime auto-initializes in browsers, is safe to import in SSR/Node contexts, and can be rerun for dynamic content:

```js
window.Usuzumi.init(container);
```

Custom events:

- `uzu-select-change`: `{ value, label, option, select }`
- `uzu-tabs-change`: `{ value, tab, tabs, index, panel }`
- `uzu-segmented-change`: `{ value, segment, segmented, index }`
- `uzu-pagination-change`: `{ value, page, pagination, index, panel }`
- `uzu-switch-change`: `{ checked, switch }`
- `uzu-disclosure-change`: `{ open, disclosure }`
- `uzu-toast-close`: `{ toast }`
- `uzu-dialog-open` / `uzu-dialog-close`: `{ dialog, overlay, trigger }`

Type declarations are included.

## Examples

- [Homepage and component showcase](https://github.com/Mashiro0619/Usuzumi/blob/main/example/index.html)
- [Personal homepage example](https://github.com/Mashiro0619/Usuzumi/blob/main/example/example-1.html)
- [App introduction example](https://github.com/Mashiro0619/Usuzumi/blob/main/example/example-2.html)

The examples can be opened directly in a browser. No build step or development server is required.

## Maintenance

Repository maintenance commands:

```bash
npm run build:css
npm run validate
```

`npm run validate` checks source guardrails, then packs the library and installs it into a temporary consumer project to verify package exports, CSS files, type declarations, CDN-style `ui/*` paths, browser runtime behavior, and site layout smoke checks.

The runtime library has no dependencies. See [DESIGN.md](DESIGN.md) for the full design specification.

## License

Usuzumi code is released under the [MIT License](LICENSE).

The bundled Meddon font is redistributed under its own SIL Open Font License terms. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
