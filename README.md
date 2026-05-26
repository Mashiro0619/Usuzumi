# Usuzumi

[中文](README.zh-CN.md)

Usuzumi is a zero-build web design system by Mashiro0619 for quiet editorial interfaces, personal homepages, app introduction pages, documentation pages, and small product tools.

It is built around a soft monochrome paper atmosphere: warm gray surfaces, charcoal ink, Georgia-based serif typography, low-contrast borders, restrained motion, and reusable `uzu-*` HTML/CSS/JS primitives.

## Preview

Open these files directly in a browser:

- [Design system catalog](https://github.com/Mashiro0619/Usuzumi/blob/main/example/preview.html)
- [Personal homepage example](https://github.com/Mashiro0619/Usuzumi/blob/main/example/index.html)
- [App introduction example](https://github.com/Mashiro0619/Usuzumi/blob/main/example/app-introduction.html)

No build step or development server is required.

## Quick Start

Link the bundled CSS and JavaScript:

```html
<link rel="stylesheet" href="ui/usuzumi.css">
<script src="ui/usuzumi.js" defer></script>
```

After installing from npm, projects with CSS import support can use:

```bash
npm install usuzumi
```

```js
import "usuzumi/usuzumi.css";
import "usuzumi/usuzumi.js";
```

For a full Usuzumi page:

```html
<!doctype html>
<html class="uzu-root" lang="en" data-theme="light" data-uzu-theme-key="site-theme">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>
    (function () {
      var root = document.documentElement;
      var key = root.dataset.uzuThemeKey || "";
      var mode = root.getAttribute("data-theme-mode") || "auto";
      try {
        mode = (key && window.localStorage.getItem(key)) || mode;
      } catch (_) {}
      if (!/^(auto|light|dark)$/.test(mode)) mode = "auto";
      var theme = mode === "auto" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : mode === "dark" ? "dark" : "light";
      root.setAttribute("data-theme-mode", mode);
      root.setAttribute("data-theme", theme);
      root.setAttribute("data-uzu-theme", theme);
    })();
  </script>
  <link rel="stylesheet" href="ui/usuzumi.css">
  <script src="ui/usuzumi.js" defer></script>
</head>
<body class="uzu-app">
  <main class="uzu-page">
    <section class="uzu-section">
      <div class="uzu-section-head">
        <p class="uzu-section-label">Overview</p>
        <h1 class="uzu-page-title">A quiet interface starts with good rhythm.</h1>
      </div>
    </section>
  </main>
</body>
</html>
```

For incremental migration inside an existing site:

```html
<section class="uzu-scope">
  <article class="uzu-card">
    <div class="uzu-title-pair">
      <h3>Scoped component</h3>
      <p>This area adopts Usuzumi without taking over the whole page.</p>
    </div>
  </article>
</section>
```

## What Is Included

- Design tokens for color, radius, typography, motion, borders, and dark mode.
- Layout primitives such as pages, sections, grids, top bars, hero splits, and footers.
- Components for buttons, text links, cards, fields, selects, tabs, segmented controls, badges, alerts, tables, overlays, and progress.
- Page patterns for personal homepages, app introduction pages, design catalogs, project lists, mockups, feature lists, and screen cards.
- Small framework-free JavaScript for theme toggles, language toggles, and custom select behavior.
- Examples that use only the public UI library.

## Repository Structure

```text
.
├── DESIGN.md
├── LICENSE
├── README.md
├── README.zh-CN.md
├── THIRD_PARTY_NOTICES.md
├── package.json
├── example/
│   ├── preview.html
│   ├── index.html
│   └── app-introduction.html
├── scripts/
│   └── validate.mjs
└── ui/
    ├── usuzumi.css
    ├── usuzumi.js
    ├── assets/
    │   └── Meddon-Regular.ttf
    └── css/
        ├── tokens.css
        ├── base.css
        ├── typography.css
        ├── components.css
        ├── layout.css
        ├── patterns.css
        ├── forced-colors.css
        └── utilities.css
```

Use `ui/usuzumi.css` as the public stylesheet entry. It imports the source CSS files in `ui/css/`.

## Validation

The runtime library has no dependencies. The repository includes one optional Node-based validation command for maintainers:

```bash
npm run validate
```

It checks JavaScript syntax, local file references, placeholder links, and design-system guardrails such as minimum radius, font sizing, and letter spacing.

## Design Principles

- Use paper-gray backgrounds instead of pure white.
- Use charcoal ink instead of pure black.
- Build hierarchy with spacing, borders, and type scale rather than heavy shadows or saturated color.
- Keep the minimum visible radius at `4px`.
- Use rectangular buttons for real actions and `.uzu-text-link` for ordinary navigation.
- Use `.uzu-title-pair` for title and subtitle rhythm.
- Keep page templates generic and reusable.

See [DESIGN.md](DESIGN.md) for the full specification.

## JavaScript Behaviors

`ui/usuzumi.js` is intentionally small and dependency-free.

It supports:

- `[data-uzu-theme-toggle]`
- `[data-uzu-language-toggle]`
- `[data-uzu-select]`
- `[data-uzu-switch]`

Theme mode is stored as `data-theme-mode="auto|light|dark"` and resolved to `data-theme="light|dark"`. Put `data-uzu-theme-key` on the themed root so the early head script and deferred toggle share the same storage key. The script can target either the document root or a scoped element through target attributes such as `data-uzu-theme-target`.

## Browser Notes

Usuzumi uses modern CSS features such as CSS custom properties, `color-mix()`, `:focus-visible`, and WebKit scrollbar pseudo-elements. It is intended for modern browsers.

The CSS entry file (`ui/usuzumi.css`) uses `@import` chains for modular development. For production deployment, consider concatenating the CSS files to avoid render-blocking sequential imports.
When installed through a package manager, use `usuzumi/usuzumi.css` for styles and `usuzumi/usuzumi.js` for behavior.

## License

Usuzumi code is released under the [MIT License](LICENSE).

The bundled Meddon font is redistributed under its own SIL Open Font License terms. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) before replacing, modifying, or redistributing bundled assets.
