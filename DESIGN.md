# Usuzumi Design System

Usuzumi is a professional, zero-build web design system by Mashiro0619 for quiet editorial interfaces, personal sites, app introduction pages, documentation pages, and small product tools. It is built around a soft monochrome paper atmosphere: warm gray surfaces, charcoal ink, serif typography, low-contrast borders, restrained motion, and a small set of reusable HTML/CSS/JS primitives.

The system has two goals:

- New web projects can adopt the full visual language by adding `class="uzu-app"` and linking the UI library.
- Existing web projects can migrate safely by wrapping selected areas in `.uzu-scope` or using `.uzu-*` component classes incrementally.

## Library Files

Use the single entry files in normal pages:

```html
<link rel="stylesheet" href="ui/usuzumi.css">
<script src="ui/usuzumi.js" defer></script>
```

Package consumers can import the stylesheet as `usuzumi/usuzumi.css` and the behavior script as `usuzumi/usuzumi.js`.

The entry CSS imports the maintainable source files:

- `ui/css/tokens.css`: design tokens, dark mode tokens, font face.
- `ui/css/base.css`: root behavior, focus, selection, scrollbar, forms, links.
- `ui/css/typography.css`: signature, titles, section labels, title pairs.
- `ui/css/components.css`: buttons, cards, fields, select, tabs, feedback, tables, overlays, progress.
- `ui/css/layout.css`: page containers, sections, top bars, grids, hero split, footer.
- `ui/css/patterns.css`: homepage, app intro, catalog, mockups, token specimens.
- `ui/css/utilities.css`: small utilities and language visibility helpers.
- `ui/css/forced-colors.css`: high-contrast mode visibility rules.
- `ui/usuzumi.js`: theme toggles, language toggles, custom select behavior, switch behavior.

## Adoption Modes

### Full Application

Use this for new pages where Usuzumi owns the design surface.

```html
<html class="uzu-root" lang="en" data-theme="light" data-uzu-theme-key="site-theme">
<body class="uzu-app">
  ...
</body>
</html>
```

`ui/usuzumi.js` also adds `uzu-root` automatically when it detects `body.uzu-app`, but adding the class in markup gives the viewport scrollbar styling an immediate CSS hook before JavaScript runs.

### Scoped Migration

Use this for existing projects where only one area should adopt the system.

```html
<section class="uzu-scope">
  ...
</section>
```

### Component Class API

All public component classes use the `uzu-` prefix. Do not rely on internal file names or implementation details. Use stable classes such as:

- `.uzu-button`, `.uzu-button-primary`, `.uzu-button-ghost`, `.uzu-button-danger`
- `.uzu-text-link`
- `.uzu-icon-button`, `.uzu-theme-toggle`, `.uzu-floating-controls`
- `.uzu-card`, `.uzu-card-muted`, `.uzu-title-pair`
- `.uzu-field`, `.uzu-label`, `.uzu-input`, `.uzu-textarea`, `.uzu-select`
- `.uzu-tabs`, `.uzu-tab`, `.uzu-segmented`, `.uzu-segment`
- `.uzu-badge`, `.uzu-alert`, `.uzu-table`, `.uzu-popover`, `.uzu-modal`
- `.uzu-progress`, `.uzu-progress-bar`, `.uzu-progress-circular`
- `.uzu-page`, `.uzu-section`, `.uzu-section-head`, `.uzu-grid`, `.uzu-hero-split`
- `.uzu-home-hero`, `.uzu-home-summary`, `.uzu-project-list`, `.uzu-project-row`, `.uzu-project-preview`
- `.uzu-app-preview`, `.uzu-download-actions`, `.uzu-feature-list`, `.uzu-feature-item`, `.uzu-screen-grid`, `.uzu-screen-card`
- `.uzu-type-list`, `.uzu-type-row`, `.uzu-type-sample`

### State Contract

Every interactive component must define the states it exposes. Use native attributes where possible:

- Disabled: use `disabled` on buttons and form controls, or `aria-disabled="true"` when an element cannot use the native attribute.
- Busy: use `.is-loading` with `aria-busy="true"` for command buttons that are processing.
- Active/current: use `.is-active`, `aria-current`, `aria-selected`, or the native checked state depending on the component.
- Invalid: use `.is-invalid` on the field wrapper or control, plus `aria-invalid="true"` on the input-like element.
- Read-only: use `readonly` for text controls and keep the value readable.
- Empty: use `.uzu-empty-state` for empty panels, lists, and tables.

Do not introduce a visual state without also defining the matching semantic attribute when one exists.

## Visual Principles

Usuzumi should feel like a carefully typeset independent publication that can also support real application controls. It is not stark black and white minimalism, not beige notebook UI, and not a colorful SaaS dashboard.

- Use `#f4f3f0` as the default paper-gray page foundation.
- Use `#20201e` and `#333331` instead of pure black.
- Use `#fbfaf7`, `#efeee9`, `#ebeae6`, and `#e7e6e1` for layered surfaces.
- Use thin borders and spacing for hierarchy. Standard cards do not float.
- Use Georgia-based serif typography for almost everything.
- Use `Meddon Custom` only for signature identity marks.
- Keep rectangular buttons at 7px radius.
- Keep the minimum visible radius at 4px.
- Keep motion quiet: no page entrances, no bouncy easing, no parallax.
- Avoid saturated accent systems, emoji decoration, heavy shadows, glass panels, and decorative blobs.

## Tokens

### Core Color Roles

| Role | Token | Hex | Use |
|------|-------|-----|-----|
| Paper Gray | `--uzu-bg` | `#f4f3f0` | Page background |
| Surface | `--uzu-surface` | `#fbfaf7` | Cards, panels, popovers |
| Soft Surface | `--uzu-surface-soft` | `#efeee9` | Inputs, secondary cards |
| Muted Surface | `--uzu-surface-muted` | `#ebeae6` | Preview blocks, nested panels |
| Inset Surface | `--uzu-surface-inset` | `#e7e6e1` | Recessed UI areas |
| Strong Ink | `--uzu-fg-strong` | `#20201e` | Titles, active states |
| Body Ink | `--uzu-fg` | `#333331` | Body text |
| Muted Text | `--uzu-muted` | `#686866` | Descriptions |
| Subtle Text | `--uzu-subtle` | `#6d6c68` | Help text, metadata, footer text |
| Soft Text | `--uzu-soft` | `#8a8a85` | Decorative captions, section labels. Not for long-form readable text |
| Default Border | `--uzu-border` | `#dad9d5` | Cards, controls, dividers |
| Soft Border | `--uzu-border-soft` | `#e5e4e0` | Internal dividers |
| Strong Border | `--uzu-border-strong` | `#aaa9a2` | Focus and hover support |
| Primary Action | `--uzu-action-bg` | `#2f2f2c` | Filled primary action |
| Action Text | `--uzu-action-fg` | `#f7f6f1` | Text on charcoal action |

### Semantic Colors

Semantic colors are muted and gray-balanced. They must never read as generic bright red, green, yellow, or blue.

| Role | Text | Background |
|------|------|------------|
| Success | `#4e6655` | `#e6ede7` |
| Warning | `#7b6842` | `#f0eadc` |
| Danger | `#7a4d4a` | `#efe3e1` |
| Info | `#56606a` | `#e5e7e8` |

### Radius

- Micro: `4px`
- Standard: `7px`
- Medium: `10px`
- Large: `14px`
- Full Pill: `999px`

Never use visible 0px, 1px, 2px, or 3px corner radius for cards, controls, previews, popovers, progress tracks, or modal surfaces.

### Motion

- Quick: `160ms`
- Base: `180ms`
- Slow: `280ms`
- Easing: `cubic-bezier(.2, .8, .2, 1)`

Allowed transitions are limited to `transform`, `color`, `background`, `border-color`, `opacity`, `text-decoration-color`, and occasional overlay `box-shadow`. Hover translation must not exceed `translateY(-1px)`.

## Typography

| Role | Class | Size | Line Height | Notes |
|------|-------|------|-------------|-------|
| Signature | `.uzu-signature` | 124px desktop, 76px mobile, 42px ultra-narrow | 1.05 to 1.18 | Uses `Meddon Custom` only |
| Hero Title | `.uzu-hero-title` | 132px desktop, 82px mobile | 0.86 | Product or offer name |
| Page Title | `.uzu-page-title` | 56px desktop, 40px mobile | 1.02 | Documentation or catalog title |
| Section Title | `.uzu-section-title` | 44px desktop, 34px mobile | 1.08 | Major content sections |
| Body Large | `.uzu-body-large` | 18px | 1.65 | Hero copy and intros |
| Body | `.uzu-text` | 15px | 1.7 | Standard reading text |
| Card Title Pair | `.uzu-title-pair` | 18px + 13px | 1.25 + 1.55 | Fixed 6px gap |

Letter spacing is 0 by default. Section labels may be uppercase, but they should remain quiet and compact.

Use display-size classes only in their intended page context. `.uzu-signature` belongs in open identity areas such as a homepage hero, and `.uzu-hero-title` belongs in product or offer heroes. In design catalogs, use `.uzu-type-list`, `.uzu-type-row`, and `.uzu-type-sample` so type roles can be inspected in a quiet specimen list without oversized card containers.

## Components

### Buttons

Buttons are tactile but calm. Use one primary button per decision area. Rectangular buttons use 7px radius and 13px labels. Icon-label spacing is 7px.

```html
<a class="uzu-button uzu-button-primary" href="download.html">Primary</a>
<button class="uzu-button" type="button">Default</button>
<button class="uzu-button uzu-button-ghost" type="button">Ghost</button>
<button class="uzu-button uzu-button-danger" type="button">Danger</button>
<button class="uzu-button" type="button" disabled>Disabled</button>
<button class="uzu-button is-loading" type="button" aria-busy="true">Saving</button>
```

Use `.uzu-text-link` for low-pressure navigation such as opening a project, viewing a page, or moving to documentation. Do not turn every page link into a rectangular button. Buttons are for explicit actions: download, submit, confirm, save, delete, or start.

### Cards

Cards use surfaces, borders, and spacing. They do not use default shadows.

```html
<article class="uzu-card">
  <div class="uzu-title-pair">
    <h3>Card title</h3>
    <p>Muted description with fixed rhythm.</p>
  </div>
</article>
```

Cards are for repeated bounded objects, compact summaries, controls, static overlay content, and screen thumbnails. Do not use cards as the default wrapper for every section. If the content is primarily a list of projects or feature explanations, use the relevant page pattern instead of a card grid.

### Forms

Fields must have real labels. Placeholders are hints, not labels.

```html
<label class="uzu-field">
  <span class="uzu-label">Project name</span>
  <input class="uzu-input" placeholder="Untitled">
</label>
```

Custom selects use `.uzu-select` plus `data-uzu-select`. Add `data-uzu-select-name` to generate a hidden input for form submission. Use `data-value` or `data-uzu-select-value` on options when the submitted value should differ from the visible label. The script dispatches both `change` and `uzu-select-change` when the value changes.

Validation belongs to the field, not just the message:

```html
<label class="uzu-field is-invalid">
  <span class="uzu-label">Email</span>
  <input class="uzu-input" aria-invalid="true" value="name">
  <span class="uzu-help">Enter a complete email address.</span>
</label>
```

Use `disabled` and `readonly` attributes for non-editable controls. Disabled controls reduce contrast and remove pointer affordance; read-only controls remain readable.

### Navigation

Top navigation uses `.uzu-topbar` and `.uzu-nav`. Use `.uzu-tabs` for peer sections and `.uzu-segmented` for compact mode switches.

### Feedback

Badges, alerts, and validation use the muted semantic families. Do not use bright red or color alone to communicate state.

### Data

Tables use `.uzu-table-wrap` and `.uzu-table`. Horizontal scrolling is acceptable on narrow screens. `.uzu-table-wrap` receives the same 6px system scrollbar treatment as `.uzu-scroll`; do not add local scrollbar overrides. Do not shrink table text below 12px.

### Overlays

Use `.uzu-popover` and `.uzu-modal` for static overlay surfaces. Overlay shadows are allowed, but standard cards should remain flat.

### Progress

Linear progress uses `.uzu-progress` and `.uzu-progress-bar`. Circular progress uses `.uzu-progress-circular` with SVG rings.

### Switches

Switches use `.uzu-switch` with `data-uzu-switch`, `role="switch"`, and `aria-checked`. The script keeps `.is-on` and `aria-checked` synchronized and dispatches both `change` and `uzu-switch-change` when the state changes.

```html
<button class="uzu-switch" type="button" data-uzu-switch aria-checked="false" aria-label="Sync"></button>
```

## JavaScript Behaviors

`ui/usuzumi.js` is intentionally small and framework-free.

### Theme Toggle

```html
<html class="uzu-root" lang="en" data-theme="light" data-uzu-theme-key="site-theme">
...
<button class="uzu-icon-button uzu-theme-toggle" data-uzu-theme-toggle>
  ...
</button>
```

Place the inline theme boot script before the stylesheet so it can resolve the persisted `data-theme-mode` (`auto`, `light`, or `dark`) into `data-theme` / `data-uzu-theme` (`light` or `dark`) before CSS loads. The deferred script cycles `light -> dark -> auto -> light` and persists the mode under the root `data-uzu-theme-key`. Use `data-uzu-theme-target` to target a scoped element. If omitted, the document root is used. Toggle icon state is synchronized through `.is-dark` and `.is-auto`, so scoped toggles do not inherit the visual state of an unrelated dark ancestor.

### Language Toggle

```html
<button class="uzu-icon-button uzu-language-toggle" data-uzu-language-toggle>EN</button>
```

The script toggles `data-language` and `data-uzu-lang`. Content can be marked with `data-lang="zh"` and `data-lang="en"`.

### Custom Select

```html
<div class="uzu-select" data-uzu-select data-uzu-select-name="density">
  <button class="uzu-select-trigger" data-uzu-select-trigger aria-expanded="false">Balanced</button>
  <div class="uzu-select-menu" role="listbox">
    <div class="uzu-select-option is-selected" data-uzu-select-option data-value="balanced" role="option">Balanced</div>
  </div>
</div>
```

The script supports click to open, click outside to close, Escape to close, ArrowUp/ArrowDown/Home/End navigation, Enter/Space selection, and option selection. It also assigns stable runtime ids, `aria-controls`, `aria-activedescendant`, and `aria-selected` state for the custom select pattern. Selected values are exposed through `data-uzu-select-value`, an optional generated hidden input, `change`, and `uzu-select-change`.

## Page Patterns

### Personal Homepage

Use `.uzu-home-hero` with a large left-aligned `.uzu-signature`, optional `.uzu-home-summary`, a project index, and a compact footer. Do not add an avatar, generic biography block, skills grid, or blog unless the project specifically needs them.

Use this structure for project rows:

```html
<div class="uzu-project-list">
  <article class="uzu-project-row">
    <div class="uzu-project-media">
      <div class="uzu-project-preview uzu-project-preview-app" aria-label="Project preview"></div>
    </div>
    <div class="uzu-project-copy">
      <div class="uzu-title-pair">
        <h3>Project title</h3>
        <p>Short role, scope, or outcome.</p>
      </div>
    </div>
    <a class="uzu-text-link uzu-project-action" href="project.html">View page</a>
  </article>
</div>
```

Homepage project rows should read like an index, not like a dashboard. Use text links for project navigation. Use buttons only when the project row itself performs an action such as download or submit.

### App Introduction Page

Use a top bar, a hero with product name and short copy, download actions near the hero, a quiet product mockup, feature sections, screen sections, and optional bilingual content.

Use `.uzu-hero-split` with `.uzu-app-hero-copy`, `.uzu-product-meta`, `.uzu-download-actions`, and `.uzu-app-preview`. Download actions may be buttons because they are explicit actions. Keep icon labels short enough to fit at mobile widths.

Use `.uzu-feature-list` and `.uzu-feature-item` for explanatory product features. A feature list is preferred over three identical cards when the content is mostly text and needs editorial rhythm.

Use `.uzu-screen-grid` and `.uzu-screen-card` for screen previews. Screen cards may contain simulated interface art or real screenshots. The thumbnail, title, and subtitle must use stable spacing and should not rely on browser-default paragraph margins.

Use `.uzu-title-pair` for every title and subtitle pair inside feature items, project rows, cards, mockups, and screen cards. Do not hand-place headings and paragraphs with ad hoc margins.

### Design Catalog Page

Use the catalog page to show the complete system surface: colors, typography, buttons, cards, forms, navigation, feedback, data, overlays, layout, spacing, radius, elevation, motion, focus, accessibility, system defaults, controls, and progress.

The catalog page should demonstrate generic system primitives only. It must not include specific product names or project-branded language except for the design-system identity itself.

### Choosing The Right Surface

Use sections for major page bands. Use cards for individual repeated objects. Use lists for editorial indexes and text-first explanations. Use previews only when a visual artifact is being represented. Do not nest cards inside cards.

Action hierarchy:

- Primary button: one main action in a decision area.
- Default button: secondary action with real command weight.
- Ghost button: utility action inside a dense control area.
- Text link: navigation to another page, project, document, or external reference.
- Icon button: compact tool action with an accessible label.

Example pages in `example/` are canonical usage examples for the UI library. If a new template needs local CSS to fix spacing, hierarchy, title/subtitle rhythm, or responsive behavior, first consider whether the missing rule belongs in `ui/css/patterns.css`, `ui/css/layout.css`, or `ui/css/components.css`.

## Accessibility

- Use `:focus-visible` rings from the system. Never remove outlines without replacement.
- Every interactive element must be reachable by keyboard.
- Color must not be the only meaning channel.
- Forms need visible labels.
- Theme and language toggles must remain focusable.
- Respect `prefers-reduced-motion`.
- Respect `forced-colors` where possible.
- Soft borders are aesthetic and not sufficient as the only interactive affordance.

## System Defaults

Usuzumi defines:

- 6px scrollbars with hidden WebKit arrow buttons for the root viewport, `.uzu-scroll`, `.uzu-table-wrap`, and `.uzu-catalog-body`.
- Paper-toned scrollbar thumbs.
- Ink-tinted text selection.
- Serif link treatment with subtle underline color changes.
- Strong caret color for text inputs.
- Placeholder text using the soft text token at full opacity.

## Do

- Build from tokens before writing page-specific overrides.
- Use `.uzu-app` for new projects and `.uzu-scope` for migrations.
- Use `.uzu-title-pair` for every title and subtitle pair.
- Use `.uzu-text-link` for ordinary page navigation.
- Use page patterns before inventing page-specific layout CSS.
- Prefer borders, surfaces, and spacing over shadows.
- Keep button hover states subtle.
- Keep preview pages generic and component-focused.

## Browser Support

Usuzumi targets modern browsers. Minimum requirements:

| Feature | Browsers |
|---------|----------|
| CSS `color-mix()` | Chrome 111+, Firefox 113+, Safari 16.2+ |
| CSS `:has()` | Chrome 105+, Firefox 121+, Safari 15.4+ |
| CSS `:focus-visible` | Chrome 86+, Firefox 85+, Safari 15.4+ |
| CSS Custom Properties | Chrome 49+, Firefox 52+, Safari 10+ |

In older browsers, `color-mix()` falls back to the raw base color (no hover or state tinting), and `:has()`-based parent styling is omitted. The system remains usable but some visual refinements are lost.

## Do Not

- Do not use pure white page backgrounds.
- Do not introduce saturated accent systems.
- Do not use emoji as feature icons.
- Do not use full-pill radius for rectangular buttons.
- Do not use rectangular buttons for ordinary project-list navigation.
- Do not add decorative blobs, orbs, or generic visual metaphors.
- Do not split section labels and headings into distant columns.
- Do not let select option backgrounds touch.
- Do not use card grids for text-first feature explanations when a feature list would scan better.
- Do not duplicate the token block in every page.
