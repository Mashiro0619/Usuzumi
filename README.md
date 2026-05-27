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

## Included

- Design tokens for color, typography, spacing, borders, radius, motion, and dark mode.
- Layout and component primitives for pages, sections, grids, buttons, cards, forms, tabs, badges, alerts, tables, overlays, progress, skeletons, toasts, dialogs, disclosures, and tooltips.
- Page patterns for personal homepages, app introduction pages, design catalogs, project lists, mockups, and feature sections.
- Small JavaScript helpers for theme toggles, language toggles, custom selects, switches, disclosures, dialogs, and toast dismissal.

## Runtime

The JavaScript runtime auto-initializes in browsers, is safe to import in SSR/Node contexts, and can be rerun for dynamic content:

```js
window.Usuzumi.init(container);
```

Custom events:

- `uzu-select-change`: `{ value, label, option, select }`
- `uzu-switch-change`: `{ checked, switch }`
- `uzu-disclosure-change`: `{ open, disclosure }`
- `uzu-toast-close`: `{ toast }`
- `uzu-dialog-open` / `uzu-dialog-close`: `{ dialog, overlay, trigger }`

Type declarations are included.

## Examples

- [Design system catalog](https://github.com/Mashiro0619/Usuzumi/blob/main/example/preview.html)
- [Personal homepage example](https://github.com/Mashiro0619/Usuzumi/blob/main/example/index.html)
- [App introduction example](https://github.com/Mashiro0619/Usuzumi/blob/main/example/app-introduction.html)

The examples can be opened directly in a browser. No build step or development server is required.

## Maintenance

```bash
npm run build:css
npm run validate
```

The runtime library has no dependencies. See [DESIGN.md](DESIGN.md) for the full design specification.

## License

Usuzumi code is released under the [MIT License](LICENSE).

The bundled Meddon font is redistributed under its own SIL Open Font License terms. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
