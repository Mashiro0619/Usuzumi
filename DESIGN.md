# Usuzumi Design System

Usuzumi is a direct-use CSS and JavaScript component library for personal sites, app introduction pages, documentation pages, and small product tools. It ships reusable HTML/CSS/JS patterns built around warm gray surfaces, charcoal text, serif typography, low-contrast borders, and motion for state changes.

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

Maintenance validation includes a consumer smoke test: `npm run validate` packs the library, installs it into a temporary external project, verifies package exports and type/CSS/runtime files from `node_modules/usuzumi`, and opens a browser page that loads `node_modules/usuzumi/ui/usuzumi.css` plus `node_modules/usuzumi/ui/usuzumi.js`.

The published `ui/usuzumi.css` file is generated from the maintainable source files. Edit source files in `ui/css/`, then run `npm run build:css`.

- `ui/css/tokens.css`: design tokens and dark mode tokens.
- `ui/css/fonts.css`: optional Meddon signature font face.
- `ui/css/base.css`: root behavior, focus, selection, scrollbar, forms, links.
- `ui/css/typography.css`: signature, titles, section labels, title pairs.
- `ui/css/components.css`: buttons, cards, fields, menus, command surfaces, select, tabs, feedback, callouts, tables, overlays, progress, skeletons, toasts, dialogs, disclosures, and tooltips.
- `ui/css/layout.css`: page containers, sections, top bars, grids, sidebars, hero split, footer.
- `ui/css/patterns.css`: reusable product sections, panel navigation, prose/code helpers, token specimens, type specimens, and small page patterns.
- `ui/css/utilities.css`: small utilities and language visibility helpers.
- `ui/css/forced-colors.css`: high-contrast mode visibility rules.
- `ui/usuzumi-signature.css`: optional signature font entry for `.uzu-signature` and signature specimens.
- `ui/usuzumi.js`: theme toggles, language toggles, custom selects, tabs, segmented controls, switches, search, password, steppers, menus, command filtering, tags, disclosures, accordions, hover cards, dialogs, step navigation, and toast dismissal.
- `ui/usuzumi.d.ts`: TypeScript declarations for the browser API and custom events.

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
- `.uzu-toolbar`, `.uzu-toolbar-group`, `.uzu-breadcrumb`, `.uzu-pagination`, `.uzu-page-button`
- `.uzu-card`, `.uzu-card-muted`, `.uzu-title-pair`, `.uzu-stat`, `.uzu-stat-label`, `.uzu-stat-value`, `.uzu-stat-note`
- `.uzu-list`, `.uzu-list-item`, `.uzu-list-meta`, `.uzu-list-action`, `.uzu-avatar`
- `.uzu-form`, `.uzu-fieldset`, `.uzu-form-message`, `.uzu-form-error`
- `.uzu-field`, `.uzu-label`, `.uzu-input`, `.uzu-textarea`, `.uzu-select`, `.uzu-input-group`, `.uzu-input-addon`, `.uzu-input-action`
- `.uzu-search`, `.uzu-search-input`, `.uzu-search-clear`, `.uzu-password`, `.uzu-password-input`, `.uzu-password-toggle`, `.uzu-file-upload`, `.uzu-file-input`, `.uzu-file-summary`, `.uzu-slider`, `.uzu-stepper`, `.uzu-stepper-input`, `.uzu-stepper-button`
- `.uzu-menu`, `.uzu-menu-trigger`, `.uzu-menu-content`, `.uzu-menu-item`, `.uzu-menubar`, `.uzu-menubar-item`, `.uzu-command`, `.uzu-command-input`, `.uzu-command-list`, `.uzu-command-item`
- `.uzu-tabs`, `.uzu-tab`, `.uzu-segmented`, `.uzu-segment`
- `.uzu-badge`, `.uzu-tag`, `.uzu-tag-close`, `.uzu-separator`, `.uzu-separator-vertical`, `.uzu-code`, `.uzu-kbd`, `.uzu-alert`, `.uzu-alert-info`, `.uzu-alert-success`, `.uzu-alert-warning`, `.uzu-alert-danger`, `.uzu-callout`, `.uzu-callout-title`, `.uzu-toast`, `.uzu-table`, `.uzu-popover`, `.uzu-modal`, `.uzu-alert-dialog`, `.uzu-dialog-overlay`, `.uzu-drawer`, `.uzu-sheet`
- `.uzu-progress`, `.uzu-progress-bar`, `.uzu-progress-indeterminate`, `.uzu-progress-circular`, `.uzu-spinner`, `.uzu-skeleton`
- `.uzu-activity`, `.uzu-activity-dot`, `.uzu-process`, `.uzu-process-step`, `.uzu-step-nav`, `.uzu-step-nav-item`, `.uzu-step-nav-button`
- `.uzu-disclosure`, `.uzu-disclosure-trigger`, `.uzu-disclosure-panel`, `.uzu-accordion`, `.uzu-hover-card`, `.uzu-hover-card-content`, `.uzu-tooltip`
- `.uzu-page`, `.uzu-section`, `.uzu-section-head`, `.uzu-grid`, `.uzu-stack`, `.uzu-flex`, `.uzu-spacer`, `.uzu-aspect`, `.uzu-scroll-area`, `.uzu-sidebar`, `.uzu-sidebar-section`, `.uzu-sidebar-nav`, `.uzu-hero-split`
- `.uzu-section-centered`, `.uzu-panel`
- `.uzu-panel-nav`, `.uzu-panel-nav-section`, `.uzu-panel-nav-title`, `.uzu-panel-nav-button`, `.uzu-panel-nav-meta`
- `.uzu-code-block`, `.uzu-code-block-body`, `.uzu-code-block-copy`, `.uzu-prose`
- `.uzu-download-actions`, `.uzu-app-hero-copy`, `.uzu-product-meta`, `.uzu-feature-list`, `.uzu-feature-item`, `.uzu-feature-index`, `.uzu-screen-grid`, `.uzu-screen-card`, `.uzu-screen-art`, `.uzu-screen-mark`
- `.uzu-type-list`, `.uzu-type-list-plain`, `.uzu-type-row`, `.uzu-type-sample`

### CSS Custom Property API

CSS custom properties are the public customization interface for project-specific sizing and rhythm. Consumers should set documented `--uzu-*` variables on `:root`, `.uzu-app`, `.uzu-scope`, or a local wrapper. Avoid high-specificity selector overrides unless the variable API cannot express the requirement.

Global customization:

```css
:root {
  --uzu-radius-standard: 10px;
  --uzu-motion-base: 220ms;
}
```

Scoped customization:

```css
.billing-panel {
  --uzu-card-block-gap: 16px;
  --uzu-field-gap: 8px;
  --uzu-alert-max-width: 640px;
  --uzu-alert-accent-color: #6b5855;
  --uzu-alert-bg: #f4eeeb;
  --uzu-toast-width: 420px;
  --uzu-disclosure-panel-block-end-padding: 24px;
}
```

Instance customization:

```html
<article class="uzu-toast" style="--uzu-toast-width: 420px; --uzu-toast-content-end-offset: 8px">
  ...
</article>
```

Stable global variables include:

- Color roles: `--uzu-bg`, `--uzu-surface`, `--uzu-surface-soft`, `--uzu-surface-muted`, `--uzu-surface-inset`, `--uzu-fg`, `--uzu-fg-strong`, `--uzu-muted`, `--uzu-subtle`, `--uzu-soft`, `--uzu-disabled`, `--uzu-border`, `--uzu-border-soft`, `--uzu-border-strong`, `--uzu-action-bg`, `--uzu-action-fg`
- Semantic roles: `--uzu-success`, `--uzu-success-bg`, `--uzu-warning`, `--uzu-warning-bg`, `--uzu-danger`, `--uzu-danger-bg`, `--uzu-info`, `--uzu-info-bg`
- Surface support: `--uzu-control-bg`, `--uzu-shadow-soft`, `--uzu-shadow-popover`, `--uzu-focus-ring`
- Font stacks: `--uzu-font-serif`, `--uzu-font-signature`, `--uzu-font-mono`
- Motion: `--uzu-motion-quick`, `--uzu-motion-base`, `--uzu-motion-slow`, `--uzu-ease-standard`
- Radius: `--uzu-radius-micro`, `--uzu-radius-standard`, `--uzu-radius-medium`, `--uzu-radius-large`, `--uzu-radius-pill`
- Spacing: `--uzu-space-1`, `--uzu-space-2`, `--uzu-space-3`, `--uzu-space-4`, `--uzu-space-5`, `--uzu-space-6`, `--uzu-space-8`, `--uzu-space-10`
- Layout, card, and form rhythm: `--uzu-page-max-width`, `--uzu-page-narrow-max-width`, `--uzu-card-title-size`, `--uzu-card-title-line`, `--uzu-card-subtitle-size`, `--uzu-card-subtitle-line`, `--uzu-card-title-gap`, `--uzu-card-block-gap`, `--uzu-field-gap`
- Local layout primitives: `--uzu-stack-gap`, `--uzu-flex-gap`, `--uzu-aspect-ratio`, `--uzu-scroll-area-max-height`

Stable component variables include:

- Alert sizing and colors: `--uzu-alert-max-width`, `--uzu-alert-border-color`, `--uzu-alert-accent-color`, `--uzu-alert-bg`, `--uzu-alert-title-color`, `--uzu-alert-text-color`
- Callout colors: `--uzu-callout-border-color`, `--uzu-callout-bg`, `--uzu-callout-title-color`, `--uzu-callout-text-color`
- Toast sizing: `--uzu-toast-width`, `--uzu-toast-inline-padding`, `--uzu-toast-content-end-offset`, `--uzu-toast-action-size`, `--uzu-toast-action-gap`
- Disclosure spacing: `--uzu-disclosure-panel-block-end-padding`
- Form and upload sizing: `--uzu-form-gap`, `--uzu-file-upload-min-height`
- Menu and command sizing: `--uzu-menu-min-width`, `--uzu-menu-offset`, `--uzu-menu-content-width`, `--uzu-command-max-height`
- Identity and navigation sizing: `--uzu-avatar-size`, `--uzu-sidebar-width`, `--uzu-step-nav-gap`
- Overlay sizing: `--uzu-hover-card-width`, `--uzu-alert-dialog-accent-color`, `--uzu-drawer-width`, `--uzu-sheet-width`
- Loading sizing: `--uzu-spinner-size`, `--uzu-spinner-stroke`

| Variable | Default | Applies to | Suggested scope |
| --- | --- | --- | --- |
| `--uzu-page-max-width` | `1120px` | `.uzu-page` width | `.uzu-app`, `.uzu-scope`, local page |
| `--uzu-page-narrow-max-width` | `960px` | `.uzu-page-narrow` width | `.uzu-app`, `.uzu-scope`, local page |
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
| `--uzu-menu-min-width` | `180px` | menu minimum width | local menu |
| `--uzu-menu-offset` | `4px` | menu distance from trigger | local menu |
| `--uzu-menu-content-width` | `max-content` | menu content width | local menu |
| `--uzu-command-max-height` | `260px` | command list height | local command menu |
| `--uzu-avatar-size` | `36px` | avatar size | local avatar or container |
| `--uzu-sidebar-width` | `240px` | sidebar width | local sidebar or layout |
| `--uzu-step-nav-gap` | `8px` | step navigation gap | local step nav |
| `--uzu-hover-card-width` | `260px` | hover card width | local hover card |
| `--uzu-combobox-list-max-height` | `240px` | combobox popup height | local combobox |
| `--uzu-split-primary-size` | `50%` | split pane primary panel size | local split pane |
| `--uzu-split-resizer-size` | `8px` | split pane divider size | local split pane |
| `--uzu-resizable-width` | `320px` | resizable panel width | local resizable |
| `--uzu-resizable-height` | `180px` | resizable panel height | local resizable |
| `--uzu-viewer-max-height` | `360px` | JSON / diff viewer height | local viewer |
| `--uzu-json-indent` | `18px` | JSON child indentation | local JSON viewer |
| `--uzu-editor-min-height` | `160px` | editor surface minimum height | local editor |
| `--uzu-alert-dialog-accent-color` | `var(--uzu-danger)` | alert dialog accent | local alert dialog |
| `--uzu-drawer-width` | `420px` | drawer width | local drawer |
| `--uzu-sheet-width` | `520px` | sheet width | local sheet |
| `--uzu-spinner-size` | `18px` | spinner size | local spinner |
| `--uzu-spinner-stroke` | `2px` | spinner stroke | local spinner |

Runtime-written variables such as `--uzu-tabs-indicator-x`, `--uzu-tabs-indicator-width`, `--uzu-segmented-indicator-x`, `--uzu-segmented-indicator-width`, and `--uzu-disclosure-panel-height` are internal state. They can appear in computed styles, but application code should not set them as customization hooks.

If a project repeatedly needs a size or behavior that is not covered here, add a small component variable to `ui/css/*.css`, rebuild `ui/usuzumi.css`, and document it in this section. Do not solve that gap with example-page CSS.

### State Contract

Every interactive component must define the states it exposes. Use native attributes where possible:

- Disabled: use `disabled` on buttons and form controls, or `aria-disabled="true"` when an element cannot use the native attribute.
- Busy: use `.is-loading` with `aria-busy="true"` for command buttons that are processing.
- Active/current: use `.is-active`, `aria-current`, `aria-selected`, or the native checked state depending on the component.
- Invalid: use `.is-invalid` on the field wrapper or control, plus `aria-invalid="true"` on the input-like element.
- Read-only: use `readonly` for text controls and keep the value readable.
- Empty: use `.uzu-empty-state` for empty panels, lists, and tables.
- Open/closed: use `.is-open` with `aria-expanded` for disclosures and dialogs.

Do not introduce a visual state without also defining the matching semantic attribute when one exists.

### Advanced Component Scope

The native runtime includes lightweight versions of the complex component families:

- Combobox handles local filtering, ARIA sync, keyboard selection, and optional hidden form values.
- Data grid keeps real table markup while adding sortable headers, row selection, and row keyboard navigation.
- Tree view manages hierarchical focus, selection, expand/collapse state, and matching ARIA attributes.
- Split pane and resizable panel support pointer and keyboard resizing. Optional persistence keys use local storage.
- JSON viewer parses JSON into a collapsible tree. Diff viewer renders unified-diff style text into readable rows.
- Editor surfaces provide shells, toolbar buttons, Markdown preview, plain/code text surfaces, and inline editing. They are not full editor engines; projects that need syntax services, collaboration, history, or large-file handling should attach a dedicated editor inside these shells.

## Visual Principles

Usuzumi should feel like a carefully typeset independent publication that can also support real application controls. It is not stark black and white minimalism, not beige notebook UI, and not a colorful SaaS dashboard.

- Use `#f4f3f0` as the default paper-gray page foundation.
- Use `#20201e` and `#333331` instead of pure black.
- Use `#fbfaf7`, `#efeee9`, `#ebeae6`, and `#e7e6e1` for layered surfaces.
- Use thin borders and spacing for hierarchy. Standard cards do not float.
- Use Georgia-based serif typography for almost everything.
- Use `Meddon Custom` only for signature identity marks, and load `usuzumi-signature.css` only when that role is needed.
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

Allowed transitions are limited to `transform`, `color`, `background`, `border-color`, `opacity`, `text-decoration-color`, and occasional overlay `box-shadow`. Hover and focus states may change color, border, background, opacity, or an internal indicator, but they must not move the whole control. Passive surfaces such as cards, rows, specimens, and empty states should not gain decorative hover motion.

Use animation for process states and state transitions: loading, syncing, indeterminate progress, skeleton content, active task steps, tab and segmented indicators, select menus, disclosures, dialogs, and toast dismissal. Popup surfaces such as menus, dialogs, tooltips, and toasts should fade without translating, scaling, or changing their visual geometry after they appear. Keep repeated animation localized to `.is-loading`, `.uzu-skeleton`, `.uzu-progress-indeterminate`, `.uzu-activity`, and `.uzu-process-step.is-active`. Avoid whole-page entrance animation, bounce, parallax, repeated decorative motion, or layout-shifting size transitions.

## Typography

| Role | Class | Size | Line Height | Notes |
|------|-------|------|-------------|-------|
| Signature | `.uzu-signature` | 124px desktop, 76px mobile, 42px ultra-narrow | 1.05 to 1.18 | Requires optional `usuzumi-signature.css` |
| Hero Title | `.uzu-hero-title` | 132px desktop, 82px mobile | 0.86 | Product or offer name |
| Page Title | `.uzu-page-title` | 56px desktop, 40px mobile | 1.02 | Documentation or catalog title |
| Section Title | `.uzu-section-title` | 44px desktop, 34px mobile | 1.08 | Major content sections |
| Body Large | `.uzu-body-large` | 18px | 1.65 | Hero copy and intros |
| Body | `.uzu-text` | 15px | 1.7 | Standard reading text |
| Card Title Pair | `.uzu-title-pair` | 18px + 13px | 1.25 + 1.55 | Fixed 6px gap |

Letter spacing is 0 by default. Section labels may be uppercase, but they should remain quiet and compact.

Use display-size classes only in their intended page context. `.uzu-signature` belongs in open identity areas such as a homepage hero, and `.uzu-hero-title` belongs in product or offer heroes. In design catalogs, use `.uzu-type-list`, `.uzu-type-row`, and `.uzu-type-sample` so type roles can be inspected in a quiet specimen list without oversized card containers. Use `.uzu-type-list-plain` when the same specimen rhythm is needed without row dividers.

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

Tabs and segmented controls are static visual primitives by default. Add `data-uzu-tabs` or `data-uzu-segmented` when the runtime should manage the active state, keyboard arrow navigation, ARIA state, animated active indicators, and change events.

```html
<div class="uzu-tabs" data-uzu-tabs>
  <button class="uzu-tab is-active" type="button" data-uzu-tab-value="overview" aria-selected="true">Overview</button>
  <button class="uzu-tab" type="button" data-uzu-tab-value="details" aria-selected="false">Details</button>
</div>

<div class="uzu-segmented" data-uzu-segmented>
  <button class="uzu-segment is-active" type="button" data-uzu-segment-value="today" aria-pressed="true">Today</button>
  <button class="uzu-segment" type="button" data-uzu-segment-value="plan" aria-pressed="false">Plan</button>
</div>
```

### Feedback

Badges, alerts, callouts, toasts, and validation use the muted semantic families. Do not use bright red or color alone to communicate state. Alerts provide `.uzu-alert-info`, `.uzu-alert-success`, `.uzu-alert-warning`, and `.uzu-alert-danger` presets. Alerts and callouts also expose color custom properties for project-specific tones; prefer those variables over selector overrides. Toasts use `.uzu-toast-stack` and `.uzu-toast`; close buttons use `data-uzu-toast-close`.

Use `.uzu-callout` for editorial notes, constraints, and secondary context that belongs in the reading flow. Callouts are not alerts: they should not announce urgent errors, destructive states, or time-sensitive feedback. Use `.uzu-callout-note`, `.uzu-callout-info`, or `.uzu-callout-warning` to adjust the tone while keeping the message text-led.

```html
<aside class="uzu-callout uzu-callout-note">
  <h3 class="uzu-callout-title">Context note</h3>
  <p>Use callouts for guidance that supports the surrounding content.</p>
</aside>
```

### Navigation And Tools

Use `.uzu-breadcrumb` for page hierarchy, `.uzu-toolbar` with `.uzu-toolbar-group` for local actions, and `.uzu-pagination` with `.uzu-page-button` for paged lists. Mark the current breadcrumb or page with `aria-current="page"`. Add `data-uzu-pagination` when the runtime should manage active page state, previous/next buttons, and optional `data-uzu-page-panel` content. Toolbars may use native buttons, links styled as `.uzu-button`, or icon buttons when the action has an accessible name.

Use `.uzu-panel-nav` with `data-uzu-panel-nav` for side navigation that switches `.uzu-panel` sections. Use `.uzu-code-block` for copyable code snippets and `.uzu-prose[data-uzu-markdown]` for the built-in Markdown subset. The Markdown renderer intentionally supports only headings, paragraphs, unordered lists, links, inline code, and fenced code blocks; full Markdown documents should still be generated by a dedicated documentation pipeline.

```html
<nav aria-label="Breadcrumb">
  <ol class="uzu-breadcrumb">
    <li><a href="/">Home</a></li>
    <li><span aria-current="page">Settings</span></li>
  </ol>
</nav>

<div class="uzu-toolbar" role="toolbar" aria-label="List actions">
  <div class="uzu-toolbar-group">
    <button class="uzu-button uzu-button-primary" type="button">New</button>
    <button class="uzu-button" type="button">Import</button>
  </div>
</div>

<div id="page-panels">
  <article class="uzu-page-panel" data-uzu-page-panel="1">Page one</article>
  <article class="uzu-page-panel" data-uzu-page-panel="2" hidden>Page two</article>
</div>

<nav aria-label="Pagination">
  <ol class="uzu-pagination" data-uzu-pagination data-uzu-pagination-target="#page-panels">
    <li><button class="uzu-page-button" type="button" data-uzu-page-prev>Previous</button></li>
    <li><button class="uzu-page-button" type="button" data-uzu-page="1" aria-current="page">1</button></li>
    <li><button class="uzu-page-button" type="button" data-uzu-page="2">2</button></li>
    <li><button class="uzu-page-button" type="button" data-uzu-page-next>Next</button></li>
  </ol>
</nav>
```

### Compact Data

Use `.uzu-stat` for small metric summaries. Use `.uzu-separator` or `.uzu-separator-vertical` for explicit divisions inside compact surfaces. Use `.uzu-code` for inline identifiers and `.uzu-kbd` for keyboard hints.

```html
<article class="uzu-stat">
  <p class="uzu-stat-label">Components</p>
  <p class="uzu-stat-value">42</p>
  <p class="uzu-stat-note">Public primitives.</p>
</article>

<p>Use <code class="uzu-code">.uzu-scope</code> and press <kbd class="uzu-kbd">Ctrl</kbd> <kbd class="uzu-kbd">K</kbd>.</p>
```

### Disclosure And Loading

Use disclosures for optional details, compact settings, and short documentation blocks. Runtime-managed disclosures keep the panel visible during close animation before applying `hidden`.

```html
<article class="uzu-disclosure" data-uzu-disclosure>
  <button class="uzu-disclosure-trigger" type="button" data-uzu-disclosure-trigger>Details</button>
  <div class="uzu-disclosure-panel" data-uzu-disclosure-panel>Optional content.</div>
</article>
```

Use `.uzu-skeleton`, `.uzu-skeleton-title`, `.uzu-skeleton-text`, and `.uzu-skeleton-block` for loading placeholders. Skeletons must preserve layout dimensions and must not replace useful status text when the wait is long.

### Data

Tables use `.uzu-table-wrap` and `.uzu-table`. Horizontal scrolling is acceptable on narrow screens. `.uzu-table-wrap` receives the same 6px system scrollbar treatment as `.uzu-scroll`; do not add local scrollbar overrides. Do not shrink table text below 12px.

### Overlays

Use `.uzu-popover` and `.uzu-modal` for overlay surfaces. Overlay shadows are allowed, but standard cards should remain flat. Dialog behavior uses `data-uzu-dialog-target`, `data-uzu-dialog-overlay`, `data-uzu-dialog`, and `data-uzu-dialog-close`. The runtime handles Escape, backdrop clicks, focus return, a small focus trap, and open/close animation timing.

Tooltips use `data-uzu-tooltip` for short supplemental labels. Do not put essential instructions only in tooltips.

### Progress

Linear progress uses `.uzu-progress` and `.uzu-progress-bar`. Use `.uzu-progress-indeterminate` on the track, or `.is-indeterminate` on the bar, when work is ongoing but the percentage is unknown. Circular progress uses `.uzu-progress-circular` with SVG rings.

Use `.uzu-activity` with three `.uzu-activity-dot` children for compact activity status, and `.uzu-process` with `.uzu-process-step` for short multi-step flows. Mark completed steps with `.is-complete`; mark the current step with `.is-active` and `aria-current="step"`.

```html
<div class="uzu-progress uzu-progress-indeterminate" role="progressbar" aria-label="Syncing changes">
  <span class="uzu-progress-bar"></span>
</div>

<ol class="uzu-process" aria-label="Publish progress">
  <li class="uzu-process-step is-complete">Validate tokens</li>
  <li class="uzu-process-step is-active" aria-current="step">Build CSS bundle</li>
  <li class="uzu-process-step">Package release</li>
</ol>
```

### Switches

Switches use `.uzu-switch` with `data-uzu-switch`, `role="switch"`, and `aria-checked`. The script keeps `.is-on` and `aria-checked` synchronized and dispatches both `change` and `uzu-switch-change` when the state changes.

```html
<button class="uzu-switch" type="button" data-uzu-switch aria-checked="false" aria-label="Sync"></button>
```

## JavaScript Behaviors

`ui/usuzumi.js` is intentionally small and framework-free.

It auto-initializes in browsers, is safe to import in SSR/Node environments, and can be rerun for dynamic content:

```js
window.Usuzumi.init(container);
```

Repeated `init()` calls do not rebind already-initialized controls.

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

The script supports click to open, click outside to close, Escape to close, ArrowUp/ArrowDown/Home/End navigation, Enter/Space selection, and option selection. It also assigns stable runtime ids, `aria-controls`, `aria-activedescendant`, and `aria-selected` state for the custom select pattern, and keeps the menu mounted during close animation. Selected values are exposed through `data-uzu-select-value`, an optional generated hidden input, `change`, and `uzu-select-change`.

### Tabs And Segmented Controls

```html
<div class="uzu-tabs" data-uzu-tabs>
  <button class="uzu-tab is-active" type="button" data-uzu-tab-value="foundation" aria-selected="true">Foundation</button>
  <button class="uzu-tab" type="button" data-uzu-tab-value="components" aria-selected="false">Components</button>
</div>
```

The script keeps `.is-active`, `aria-selected`, roving `tabindex`, and the animated underline indicator synchronized for tabs. It supports click, ArrowLeft/ArrowRight/ArrowUp/ArrowDown, Home, and End. If a tab has `data-uzu-tab-target` or `aria-controls`, the matching panel is shown and sibling tab panels are hidden.

Segmented controls use `data-uzu-segmented` and `.uzu-segment`. The script keeps `.is-active`, `aria-pressed`, and the animated selected backing synchronized, supports the same arrow-key navigation, and emits `uzu-segmented-change`.

### Runtime Pagination

Pagination uses `data-uzu-pagination` and page buttons with `data-uzu-page`. Previous and next controls use `data-uzu-page-prev` and `data-uzu-page-next`. When `data-uzu-pagination-target` points to a container, child panels with matching `data-uzu-page-panel` values are shown or hidden with the active page. The script keeps `.is-active`, `aria-current`, disabled previous/next state, and emits `uzu-pagination-change`.

### Custom Events

- `uzu-select-change`: `{ value, label, option, select }`
- `uzu-tabs-change`: `{ value, tab, tabs, index, panel }`
- `uzu-segmented-change`: `{ value, segment, segmented, index }`
- `uzu-pagination-change`: `{ value, page, pagination, index, panel }`
- `uzu-switch-change`: `{ checked, switch }`
- `uzu-password-toggle`: `{ visible, password, input, toggle }`
- `uzu-stepper-change`: `{ value, number, stepper, input }`
- `uzu-disclosure-change`: `{ open, disclosure }`
- `uzu-toast-close`: `{ toast }`
- `uzu-dialog-open` / `uzu-dialog-close`: `{ dialog, overlay, trigger }`

## Page Patterns

### Product Homepage

Build homepage introductions from `.uzu-page`, `.uzu-topbar`, `.uzu-section`, `.uzu-hero-split`, `.uzu-signature`, `.uzu-title-pair`, `.uzu-body-large`, `.uzu-download-actions`, `.uzu-feature-list`, and `.uzu-footer`. Project-specific hero composition, portfolio rows, or mockup artwork can live in the page itself while still using public buttons, links, cards, typography, and layout primitives.

Use this structure for a compact intro:

```html
<main class="uzu-page">
  <section class="uzu-hero-split">
    <div class="uzu-app-hero-copy">
      <p class="uzu-product-meta">CSS / Runtime / Components</p>
      <h1 class="uzu-signature">Usuzumi</h1>
      <p class="uzu-body-large">A quiet interface kit for small sites and product pages.</p>
      <div class="uzu-download-actions">
        <a class="uzu-button uzu-button-primary" href="components.html">Components</a>
        <a class="uzu-button" href="https://github.com/Mashiro0619/Usuzumi">GitHub</a>
      </div>
    </div>
  </section>
</main>
```

### App Introduction Page

Use a top bar, a hero with product name and short copy, download actions near the hero, a quiet product mockup, feature sections, screen sections, and optional bilingual content.

Use `.uzu-hero-split` with `.uzu-app-hero-copy`, `.uzu-product-meta`, and `.uzu-download-actions`. Download actions may be buttons because they are explicit actions. Keep icon labels short enough to fit at mobile widths.

Use `.uzu-feature-list` and `.uzu-feature-item` for explanatory product features. A feature list is preferred over three identical cards when the content is mostly text and needs editorial rhythm.

Use `.uzu-screen-grid` and `.uzu-screen-card` for screen previews. Screen cards may contain simulated interface art or real screenshots. The thumbnail, title, and subtitle must use stable spacing and should not rely on browser-default paragraph margins.

Use `.uzu-title-pair` for title and subtitle pairs inside feature items, cards, and screen cards.

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

- 6px scrollbars with hidden WebKit arrow buttons for the root viewport, `.uzu-scroll`, and `.uzu-table-wrap`.
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
- Keep example pages generic and component-focused.

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
