# Soft Monochrome Design System

## 1. Visual Theme & Atmosphere

The design system is built around a soft monochrome paper atmosphere. It is not stark black-and-white minimalism, and it is not a warm beige notebook aesthetic. The system sits between editorial paper, ink, and quiet product interface design. The page foundation uses a low-saturation paper gray (`#f4f3f0`) that feels calmer than pure white, more neutral than cream, and warmer than cold interface gray. The intended mood is restrained, personal, and production-ready: like a carefully typeset independent publication that can also support real application controls.

The system's defining quality is tonal restraint. It does not rely on blue, brown, purple, orange, or saturated brand accents. Instead, hierarchy is created through a narrow gray scale from soft charcoal (`#20201e`) to paper surface (`#fbfaf7`). Text is never pure black. Backgrounds are never pure white. Borders are not mechanical neutral gray; they carry a slightly aged-paper quality through values like `#dad9d5` and `#e5e4e0`. This makes personal homepages, app landing pages, lightweight tools, documentation pages, and small dashboards feel related without looking like copies of the same page.

The script-style `Meddon Custom` typeface is reserved for signature identity moments only. It must not become a general display font. Product and documentation pages use large Georgia-based serif headings instead, with names and page titles set oversized, left-aligned, and carefully spaced. The rest of the interface — body text, buttons, navigation, form labels, tables, and cards — uses the same Georgia-based serif stack. This keeps the product language editorial and human rather than corporate, geometric, or SaaS-like.

Interaction should feel light and tactile. Buttons shift by only one pixel on hover. Borders deepen subtly. Floating controls such as theme and language toggles use small circular icon buttons. Dark mode is not pitch black; it uses soft charcoal (`#181817`) and warm off-white text. The system should always avoid sharpness, neon contrast, aggressive gradients, heavy shadows, generic emoji decoration, and overdesigned application chrome.

**Key Characteristics:**
- Soft paper-gray background (`#f4f3f0`) — neither pure white, beige, brown, nor blue-gray
- Charcoal text palette (`#20201e`, `#333331`) instead of pure black
- Serif-first interface typography using Georgia-based stacks
- Script identity typeface (`Meddon Custom`) reserved only for signature identity marks
- Low-contrast border system: `#dad9d5` for default boundaries and `#e5e4e0` for internal dividers
- Quiet button geometry: 7px radius for rectangular buttons, not full pills
- Download buttons arranged in a single row on desktop, with 13px labels, 13–14px icons, and 7px icon-label spacing
- Small circular icon controls for theme and language toggles, using 38px containers and 17px icons
- Soft dark mode using `#181817`, not pure black
- Bilingual content handled through a language toggle, never by showing both languages at once
- Structure created through spacing, thin lines, and tonal contrast rather than shadows or color blocks

## 2. Color Palette & Roles

### Primary

- **Paper Gray** (`#f4f3f0`): Primary page background. The system foundation. It should be used for body backgrounds, major page areas, and quiet editorial layouts.
- **Surface White** (`#fbfaf7`): Primary card, panel, modal, popover, and mockup surface. It is brighter than the page background but still not pure white.
- **Soft Surface** (`#efeee9`): Secondary surfaces, subtle controls, muted panels, and input backgrounds.
- **Muted Surface** (`#ebeae6`): Placeholder previews, nested application panels, screenshot placeholders, and secondary cards.
- **Surface Inset** (`#e7e6e1`): Recessed areas, phone notches, low-emphasis dividers, and subtle embedded interface zones.
- **Strong Ink** (`#20201e`): Main headings, product names, key values, primary text accents, and high-emphasis controls.
- **Body Ink** (`#333331`): Standard body copy and default readable text.
- **Off Paper** (`#f7f6f1`): Text on dark buttons or charcoal surfaces.

### Neutral Scale

The system should use a narrow, warm grayscale rather than arbitrary neutral values.

- **Strong Ink** (`#20201e`): Primary headings, product names, active states, high-emphasis labels.
- **Body Ink** (`#333331`): Paragraph text and default interface text.
- **Soft Ink** (`#575753`): Secondary body text and list subtitles.
- **Muted Text** (`#686866`): Descriptions, metadata, footer links, inactive navigation.
- **Soft Text** (`#999995`): Section labels, quiet captions, inactive dividers, subtle UI hints.
- **Disabled Text** (`#b9b8b2`): Disabled controls, unavailable actions, and inactive states.
- **Charcoal Accent** (`#2f2f2c`): Primary action background when a filled button is required.

### Surface & Border

- **Default Border** (`#dad9d5`): Card borders, button borders, input borders, section dividers, modal boundaries.
- **Soft Border** (`#e5e4e0`): Internal dividers, table row lines, nested card boundaries, list item separators.
- **Strong Border** (`#aaa9a2`): Focused controls, stronger hover states, selected elements.
- **Surface White** (`#fbfaf7`): Main component surface.
- **Soft Surface** (`#efeee9`): Subtle control backgrounds and low-emphasis panels.
- **Muted Surface** (`#ebeae6`): Preview blocks and nested surfaces.

### Semantic

Semantic colors are intentionally desaturated and gray-balanced. They should never feel like generic dashboard red, green, yellow, or blue.

- **Success Text** (`#4e6655`): Successful saves, synced states, completed tasks.
- **Success Background** (`#e6ede7`): Success badges, success alerts, subtle success panels.
- **Warning Text** (`#7b6842`): Pending states, missing setup, unconfirmed actions.
- **Warning Background** (`#f0eadc`): Warning badges and low-emphasis caution panels.
- **Danger Text** (`#7a4d4a`): Destructive actions, validation errors, failed states.
- **Danger Background** (`#efe3e1`): Error states and danger alerts.
- **Info Text** (`#56606a`): Neutral informational messages.
- **Info Background** (`#e5e7e8`): Informational alert backgrounds.

Danger and error UI must use the same danger family everywhere. Do not create a second red for buttons, alerts, badges, or preview examples. In visual specimens, a danger button, danger alert, error badge, and validation error should read as one calm low-saturation family, not as unrelated reds.

### Dark Mode

Dark mode should preserve the same paper-like softness. It should not become high-contrast black UI.

- **Dark Background** (`#181817`): Primary dark page background.
- **Dark Elevated Background** (`#20201e`): Primary dark card and panel surface.
- **Dark Soft Surface** (`#242421`): Secondary dark panels and controls.
- **Dark Muted Surface** (`#292824`): Nested dark panels and placeholders.
- **Dark Inset Surface** (`#141413`): Deep recessed surfaces.
- **Dark Strong Text** (`#f4f2ec`): Main headings and high-emphasis text.
- **Dark Body Text** (`#e5e3de`): Standard readable text.
- **Dark Soft Text** (`#cbc7bd`): Secondary text.
- **Dark Muted Text** (`#bbb7ad`): Metadata and muted labels.
- **Dark Border** (`#383733`): Main dark borders.
- **Dark Soft Border** (`#292824`): Internal dark dividers.
- **Dark Strong Border** (`#5c5952`): Focus and hover border states.

## 3. Typography Rules

### Font Family

- **Identity Typeface**: `Meddon Custom`, fallback `cursive`
- **Primary Interface Typeface**: `Georgia, 'Times New Roman', 'Noto Serif SC', 'Source Han Serif CN', serif`
- **Monospace Typeface**: `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`

The identity typeface is only for signature-level identity moments. It must not be used for body copy, buttons, navigation, form labels, tables, cards, or product UI.

The primary interface typeface is a Georgia-based serif stack. It should be used for product titles, page headings, body text, navigation, buttons, form controls, cards, metadata, and footer content. This is a deliberate choice: the interface should feel editorial and personal, not geometric or corporate.

The monospace stack should be reserved for code, design tokens, version numbers, short technical identifiers, and compact data labels. It should not be used as a decorative body typeface.

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Identity Logo | Meddon Custom | 78px–132px | 400 | 1.05 | 0 | Signature identity only |
| Product Hero | Georgia Serif | 84px–150px | 400 | 0.86–0.90 | -0.055em | Oversized product or offer name |
| Page H1 | Georgia Serif | 48px–92px | 400 | 0.96–1.05 | -0.05em | Long-form page title or system title |
| Section Heading | Georgia Serif | 30px–52px | 400 | 1.08 | 0 | Major content sections |
| Sub-heading | Georgia Serif | 20px–24px | 400 | 1.25 | normal | Card headings and module titles |
| Body Large | Georgia Serif | 18px–20px | 400 | 1.65 | normal | Hero descriptions and section intros |
| Body | Georgia Serif | 15px–16px | 400 | 1.65–1.70 | normal | Standard reading text |
| UI Label | Georgia Serif | 12px–13px | 400 | 1.40 | 0.10em–0.15em | Section labels, metadata, small uppercase labels |
| Button | Georgia Serif | 13px | 400 | 1.00 | 0.005em | Button labels |
| Caption | Georgia Serif | 12px–13px | 400 | 1.50 | normal | Hints, helper text, footer text |

### Principles

- **Identity type is not a display type system**: `Meddon Custom` is a signature. Use it sparingly and only for identity marks. Do not use it for product names, content headings, or UI labels.
- **Hierarchy comes from scale and spacing, not weight**: Most headings use weight 400. The system should feel composed through size, line-height, letter-spacing, and whitespace rather than boldness.
- **Product names should feel editorial**: Product names may be extremely large, lowercase, tightly tracked, and left-aligned. They should not feel like centered marketing slogans.
- **Body text must remain comfortable**: Standard reading text should use generous line-height around 1.65–1.70, especially when content may include mixed-language strings.
- **Uppercase labels should be rare and quiet**: Labels such as `FEATURES`, `SCREENS`, `TODAY`, or `DOWNLOAD` may use 0.14em–0.15em letter-spacing, but the page should not be overloaded with uppercase microcopy.
- **Section title groups stay together**: A section label, short rule, and section heading form one compact left-aligned title group. Do not split labels and headings into far-apart columns, and do not use negative letter-spacing on section headings.
- **Avoid geometric sans-serif defaults**: Do not switch the system to Inter, Roboto, Arial, or similar sans-serif typefaces unless the product explicitly requires a different brand direction.

## 4. Component Stylings

### Buttons

Buttons are one of the most sensitive components in this system. They must feel clickable but not commercial, sharp, or overdesigned.

**Default Button**
- Height: 42px–44px
- Padding: 10px 13px 11px
- Radius: 7px
- Border: `1px solid color-mix(in srgb, var(--border) 86%, var(--fg-strong))`
- Background: `color-mix(in srgb, var(--surface) 72%, transparent)`
- Text: `#20201e`
- Font: Georgia Serif, 13px, weight 400, line-height 1
- Icon: 13px–14px
- Icon-label gap: 7px
- Hover: subtle border darkening and `translateY(-1px)`
- Use: default actions, secondary downloads, neutral controls

**Primary Button**
- Background: `#2f2f2c` or `#20201e`
- Text: `#f7f6f1`
- Border: same as background
- Radius: 7px
- Hover: slightly softened charcoal, no dramatic color flip
- Use: primary confirmation, main download action, publish action
- Constraint: Do not overuse. Most pages should have one clear primary action at most.

**Ghost Button**
- Background: transparent
- Text: `#686866`
- Border: transparent
- Hover: `var(--surface-subtle)` or subtle border
- Use: cancel actions, secondary navigation, low-emphasis controls

**Danger Button**
- Text: `#7a4d4a`
- Background: `#efe3e1`
- Border: low-saturation danger border
- Use: delete, remove, destructive actions
- Constraint: Avoid saturated red.

**Download Button Group**
- Desktop layout: three buttons in one row
- Mobile layout: single-column stack
- Button height: 44px
- Radius: 7px
- Font size: 13px
- Icon size: 13px–14px
- Icon-label gap: 7px
- No arrow symbols
- Labels: `Google Play`, `GitHub`, `Direct Download`
- Use: app introduction pages, placed near the hero copy rather than at the bottom of the page

**Icon Button**
- Size: 38px by 38px
- Radius: 999px
- Border: `1px solid var(--border)`
- Background: translucent surface, typically `rgba(244, 243, 240, 0.78)` in light mode
- Backdrop filter: `blur(10px)` allowed
- Icon: 17px
- Use: theme toggle, language toggle, small global controls
- Constraint: Full-pill radius is reserved for icon controls and compact pills, not standard rectangular buttons.

### Cards & Containers

**Standard Card**
- Background: `#fbfaf7`
- Border: `1px solid #dad9d5`
- Radius: 4px Micro–10px depending on density
- Padding: 16px–22px
- Shadow: none by default
- Use: content grouping, settings panels, documentation blocks, project summaries
- Constraint: never use 0px or 1px corner radius. The system minimum is 4px Micro.

**Card Title Pair**
- Title: 18px Georgia Serif, `#20201e`, line-height 1.25, weight 400
- Subtitle / description: 13px Georgia Serif, `#686866`, line-height 1.55
- Title-to-subtitle gap: 6px fixed
- Media, badges, actions, and other blocks should be separated from the title pair by 12px
- The title must be visibly stronger than the subtitle through color, size, and line-height. Do not let title and subtitle look like the same text tier.
- Avoid combining parent `gap` with child title margins; use one spacing source so card rhythm stays consistent.

**Muted Card**
- Background: `#efeee9`
- Border: `1px solid #e5e4e0`
- Padding: 16px–20px
- Use: secondary content, nested panels, helper content, low-emphasis cards

**Metric Card**
- Background: `#efeee9`
- Border: `1px solid #e5e4e0`
- Label: 11px uppercase, `#999995`, 0.14em letter-spacing
- Value: 30px–34px, `#20201e`, line-height 1
- Note: 13px, `#686866`
- Use: lightweight dashboard metrics, app mockup data, progress summaries

**Preview Block**
- Background: `#ebeae6`
- Border: optional internal `1px solid #dad9d5`
- Aspect ratio: usually 16:10 or 4:5
- Decorative detail: one quiet internal line or frame is acceptable
- Constraint: Do not use colorful gradients, emoji, fake screenshots, or generic illustrations unless real assets are provided.

### Inputs & Forms

**Text Input**
- Height: 42px
- Padding: 9px 11px
- Radius: 7px
- Border: `1px solid #dad9d5`
- Background: `#fbfaf7` or `#efeee9`
- Text: `#333331`
- Placeholder: `#999995`
- Focus: `#aaa9a2` border with a 3px soft ring using the same tone at low opacity

**Textarea**
- Minimum height: 100px
- Same style as text input
- Resize: vertical only
- Use: descriptions, notes, long-form settings

**Select**
- Same baseline style as text input
- Closed trigger follows text input sizing, border, radius, focus ring, and typography
- Open menu uses `#fbfaf7` background, `1px solid #dad9d5` border, 7px radius, and a soft popover shadow
- Menu options use 34px minimum height, 4px radius, Georgia Serif at 15px, and 4px vertical gap between options.
- Hover option: `#efeee9` background with Strong Ink text
- Selected option: `#20201e` background with `#f7f6f1` text
- Selected and hovered option backgrounds must never touch; keep the menu as a grid or column with an explicit 4px gap.
- The menu should feel like a compact popover, not a browser-default dropdown. Remove native blue highlights in custom visual previews.
- Avoid exposing browser-default blue selected states in visual previews or custom product surfaces
- Avoid heavy custom dropdown styling beyond matching the system tokens.
- Use when options are limited and known

**Checkbox / Radio**
- Prefer native controls where possible
- Accent color: `#2f2f2c`
- Label font: Georgia Serif, 14px
- Label color: `#333331`
- Use generous spacing between control and label

**Validation**
- Error border: low-saturation danger tone
- Error background: mix of `#efe3e1` and surface
- Error text: `#7a4d4a`
- Do not use bright red outlines or alert icons for minor validation errors.

**Switch / Toggle**
- Track size: 36×20px (default), 42×24px (large)
- Track radius: 999px
- Off track: `#efeee9` with `1px solid #dad9d5`
- On track: `#2f2f2c` with matching border
- Knob: 16px diameter (default) or 20px (large), `#fbfaf7`, no shadow
- Knob inset: 2px from track edge; knob slides via `transform`
- Transition: `transform var(--motion-base) var(--ease-standard)`, `background-color var(--motion-base) var(--ease-standard)`
- Disabled: track at 50% opacity, knob unchanged
- Use: binary settings (dark mode, notifications, sync on/off)
- Constraint: Always pair with a text label. Do not use Switch where Checkbox is more appropriate (multi-select lists, form consent).

**Date Picker**
- Trigger: standard text input style, optional 14px calendar glyph on the right
- Popover width: 280px
- Popover background: `#fbfaf7`, border `1px solid #dad9d5`, radius 10px, soft popover shadow
- Header: month + year, 14px Georgia Serif, `#20201e`, with prev/next 28px icon buttons
- Weekday row: 12px uppercase, `#999995`, 0.10em letter-spacing
- Day cell: 36×36px, 13px Georgia Serif, `#333331`
- Today: underlined, no background fill
- Selected day: `#20201e` background, `#f7f6f1` text, radius 7px
- Range (if supported): `#efeee9` background between endpoints, no border
- Disabled day: `#b9b8b2` text, no hover
- Hover (enabled day): `#efeee9` background
- Use: date fields, schedule entry, single-date pickers

**Time Picker**
- Layout: two 56×42px inputs separated by a 13px `:` glyph
- Format: 24-hour by default (`HH:MM`); 12-hour optional with a small `AM/PM` segmented control to the right
- Input style: same as Text Input (`#fbfaf7` background, `#dad9d5` border, 7px radius)
- Text alignment: center, 16px Georgia Serif
- Step buttons: omitted by default; rely on keyboard arrows and direct typing
- Use: meeting times, reminder times, schedule entries
- Constraint: Do not use a native rotating wheel picker on desktop. Keep the input editable from the keyboard.

### Navigation

**Top Navigation**
- Left: signature mark or product mark
- Right: text links and optional CTA
- Link font: 13px–14px Georgia Serif
- Link color: `#686866`
- Hover color: `#20201e`
- Spacing: 20px–24px between links
- No heavy underline by default

**Sidebar Navigation**
- Width: 220px–244px
- Position: sticky on desktop
- Background: translucent `#fbfaf7`
- Border: `1px solid #dad9d5`
- Link size: 13px
- Hover background: `#efeee9`
- Use: documentation, design system pages, long settings areas

**Tabs**
- Border bottom: `1px solid #dad9d5`
- Active tab: `#20201e` with a thin bottom line
- Inactive tab: `#686866`
- Padding: 10px bottom
- Use: switching sections within the same context

**Segmented Control**
- Container background: `#efeee9`
- Container border: `1px solid #dad9d5`
- Container radius: 10px
- Active segment background: `#fbfaf7`
- Active text: `#20201e`
- Inactive text: `#686866`
- Use: small view switches such as `Today / Plan / Review`

### Status & Feedback

**Badge**
- Height: 26px
- Radius: 999px
- Padding: 4px 8px
- Font: 12px
- Border: semantic color mixed with default border
- Optional dot: 6px circle
- Use: `Draft`, `Live`, `Synced`, `Pending`, `Failed`

**Alert**
- Layout: 8px vertical color bar + content
- Background: semantic background token
- Border: semantic border mixed with default border
- Title: 18px, `#20201e`, line-height 1.25, weight 400
- Description: 13px, `#686866`, line-height 1.55
- Title-to-description gap: 6px
- Use: page-level or form-level feedback
- Constraint: Avoid loud alert icons and saturated colors. In feedback grids, align alerts to content height; do not stretch them to match taller neighboring toasts or cards.

**Toast**
- Background: `#fbfaf7`
- Border: `1px solid #dad9d5`
- Shadow: soft only
- Title: 18px, line-height 1.25
- Description: 13px, line-height 1.55
- Title-to-description gap: 6px
- Position: top-right or bottom-right
- Use: copied links, saved changes, lightweight confirmations

**Progress (Linear)**
- Track height: 4px
- Track background: `#efeee9`
- Fill: `#20201e`
- Track radius: 4px Micro (minimum surface radius — match scrollbar thumb)
- Transition: `width var(--motion-slow) var(--ease-standard)`
- Optional label: 12px Georgia Serif, `#686866`, placed above-right
- Use: upload, sync, export progress

**Progress (Circular)**
- Sizes: 40px (inline), 64px (default), 96px (hero)
- Stroke width: 2px at 40/64px, 3px at 96px
- Track stroke: `#dad9d5`
- Fill stroke: `#20201e`
- Linecap: `butt` — never `round`
- Direction: start at 12 o'clock, sweep clockwise
- Use: in-button spinners (40px), inline waiting states (64px), full-page loading (96px)
- Constraint: Do not add a percentage number inside the circle unless the determinate state is at least 64px.

### Tables & Lists

**Table**
- Background: `#fbfaf7`
- Border: `1px solid #dad9d5`
- Header text: 12px–13px, uppercase, `#999995`, 0.11em letter-spacing
- Cell text: 13px–14px, `#333331`
- Row divider: `1px solid #e5e4e0`
- Cell padding: 12px 14px
- No zebra striping
- No heavy header background

**List Item**
- Layout: avatar/icon + content + status/action
- Padding: 13px 14px
- Divider: `1px solid #e5e4e0`
- Avatar size: 34px
- Avatar radius: 999px
- Avatar background: `#efeee9`
- Use: project indexes, changelogs, recent activity, lightweight settings lists

### Modals & Overlays

**Modal**
- Width: 420px–520px
- Background: `#fbfaf7`
- Border: `1px solid #dad9d5`
- Shadow: `0 20px 70px rgba(25,25,22,0.11)`
- Padding: 20px–24px
- Radius: 4px Micro–10px
- Actions: right-aligned
- Use: confirmation dialogs, publish flows, destructive confirmations
- Constraint: Avoid large rounded SaaS-style modals.

**Popover**
- Background: `#fbfaf7`
- Border: `1px solid #dad9d5`
- Shadow: soft popover shadow
- Padding: 10px–14px
- Radius: 4px Micro–10px
- Use: small menus, contextual controls, compact settings

**Tooltip**
- Background: `#20201e`
- Text: `#f7f6f1`, 12px Georgia Serif, line-height 1.4
- Padding: 6px 10px
- Radius: 4px
- Max width: 220px
- Shadow: none (the dark background already separates it from the surface)
- Arrow: optional 6px triangle in the same `#20201e` tone; omit when the tooltip is anchored to a clearly aligned trigger
- Show delay: 400–500ms (avoid accidental triggers); hide on `mouseleave` or `blur` with no delay
- Transition: `opacity var(--motion-quick) var(--ease-standard)`
- Use: clarifying icon-only controls, abbreviation expansion, brief contextual hints
- Constraint: Tooltips are not a replacement for visible labels. Never put primary actions or required information inside a tooltip. Keep text under one sentence.

**Empty State**
- Background: `#fbfaf7`
- Border: `1px solid #dad9d5`
- Icon container: circular, soft surface
- Copy: direct and useful
- CTA: optional default button
- Constraint: Do not use generic illustration scenes or emoji.

## 5. Layout Principles

### Spacing System

- Base unit: 8px
- Compact internal spacing: 6px, 8px, 10px, 12px
- Standard component spacing: 14px, 16px, 18px, 20px, 22px, 24px
- Section spacing: 54px, 68px, 72px, 76px
- Spacing-scale preview cards use a 96px minimum column, 10px card padding, and a 72px maximum sample so the largest square never overflows at breakpoint edges.
- Spacing, radius, elevation, and color sample blocks must be centered within their preview cards and remain centered across all breakpoint ranges.
- Hero spacing: 42px–92px gap between content and preview
- Page padding: 22px–24px mobile, 36px–40px desktop

### Grid & Container

- Personal homepage max width: 960px
- Product page max width: 1120px
- Documentation or design system max width: 1280px
- Product hero columns: `minmax(0, 0.92fr) minmax(360px, 1.08fr)`
- Product hero gap: `clamp(42px, 7vw, 92px)`
- Card grids: 3 columns on desktop, 1 column on mobile
- Download buttons: 3 columns on desktop, 1 column on mobile

### Whitespace Philosophy

- Whitespace should create structure, not emptiness.
- Internal component spacing should remain tight and functional.
- Section spacing should be generous enough to feel editorial.
- Thin borders should separate major content groups.
- Do not fill every open area with cards, icons, or decorative copy.
- A page should feel like a composed paper layout before it feels like an app screen.

### Page Patterns

**Personal Homepage**
- Large left-aligned signature identity mark
- No avatar by default
- No subtitle unless explicitly requested
- Project index near the top
- Compact footer with copyright, email, and GitHub
- Avoid skills sections, blogs, or bios unless the user explicitly wants them

**App Introduction Page**
- Top navigation with product or identity link and section anchors
- Hero: product name, short description, download buttons
- Download buttons must appear near the hero, not at the bottom
- Product mockup appears to the right on desktop and below on mobile
- Feature and screen sections follow the hero
- Language toggle controls bilingual content

**Documentation / System Page**
- Sidebar navigation on desktop
- Main content uses compact left-aligned section title groups: quiet uppercase label, short inline rule, and large serif heading
- Do not split section labels and headings into distant columns
- Component examples can be included, but the file should remain a specification, not a portfolio showcase

**Design Preview / Catalog Page**
- The preview page is a professional design-system specimen, not a product page.
- Do not include concrete project names, app names, file names, or handoff artifacts inside preview copy.
- Show the complete component and system surface covered by this document: colors, typography, buttons, cards, forms, navigation, feedback, data, overlays, layout, spacing, radius, elevation, motion, focus, accessibility, system defaults, controls, and progress.
- Section headers use one compact left-aligned title group: 12px uppercase label, short inline rule, then the large serif section heading. Do not place the label and heading in separated columns.
- Cards that include a title and subtitle must use the Card Title Pair rule exactly: 18px title, 13px subtitle, 6px title-to-subtitle gap, and 12px gap before other content.
- Repeated preview grids must stay responsive at breakpoint edges; examples must not overflow, stretch unrelated items, or shift because a sample is too large.
- A design preview should avoid redundant decorative wrappers. Use cards only for individual examples, controls, and framed component samples.

### Border Radius Scale

- **Micro** (`4px`): Tiny controls, dense UI fragments
- **Standard** (`7px`): Buttons, inputs, compact controls
- **Medium** (`10px`): Segmented controls, cards, popovers
- **Large** (`14px`): Larger panels only when needed
- **Full Pill** (`999px`): Icon buttons, badges, small pills only

The system minimum visible radius is 4px Micro. Do not use 0px or 1px radius for cards, controls, panels, popovers, progress tracks, previews, or modal surfaces.

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Level 0 | `#f4f3f0` background | Page foundation |
| Level 1 | `#fbfaf7` surface + `#dad9d5` border | Cards, panels, forms |
| Level 2 | `#efeee9` or `#ebeae6` surface + soft border | Nested cards, inputs, mockup interiors |
| Level 3 | Soft shadow + border | Modals, popovers, floating feedback |
| Interactive | Border darkening + `translateY(-1px)` | Buttons, cards, selectable controls |

**Shadow Philosophy**: The system is intentionally shallow. Cards should not float. Most hierarchy should come from tone, border, and spacing. Shadows are reserved for overlays, popovers, floating controls, and occasional feedback components. Even then, the shadow should feel diffused and quiet, not dramatic.

### Recommended Shadows

```css
--shadow-soft: 0 18px 50px rgba(25, 25, 22, 0.045);
--shadow-popover: 0 20px 70px rgba(25, 25, 22, 0.11);
```

### Dark Mode Shadows

```css
--shadow-soft: none;
--shadow-popover: 0 24px 80px rgba(0, 0, 0, 0.36);
```

### Elevation Rules

- Use no shadow on standard cards.
- Use borders for containment.
- Use soft shadow only for modal, toast, popover, or fixed controls.
- Avoid glassmorphism except for small floating theme/language controls.
- Never use large SaaS-style drop shadows on every card.

## 7. Motion & Transitions

### Philosophy

Motion exists only to confirm interaction. No entrance animations, no scroll-triggered effects, no parallax. Transitions should feel like ink absorbing into paper — quiet, quick, never bouncy. If a transition draws attention to itself, it is wrong for this system.

### Duration Tiers

- `--motion-quick: 160ms` — hover, focus, segment toggle, small feedback
- `--motion-base: 180ms` — button border-color, card hover, link decoration
- `--motion-slow: 280ms` — theme switch, language switch, large surface re-tint

### Easing

- `--ease-standard: cubic-bezier(.2, .8, .2, 1)`

Used for every transition in the system. Do not introduce `ease-in-out`, bounce, or elastic curves. The standard curve is gently decelerated; that consistency is what holds the motion language together.

### Properties Allowed to Transition

- `transform` (translateY only, max ±1px on hover)
- `color`
- `background` / `background-color`
- `border-color`
- `opacity`
- `text-decoration-color`
- `box-shadow` (sparingly — modal / popover entry only)

### Hover Behavior (consolidated)

- **Default Button**: `translateY(-1px)` + border-color darken
- **Primary Button**: `translateY(-1px)` + slight background softening (no color flip)
- **Card** (interactive only): `translateY(-1px)` + border-color darken
- **Icon Button**: `translateY(-1px)` + color and border darken
- **Link**: `text-decoration-color` shift from `--soft` → `--fg-strong`

### What NOT to Animate

- Layout-affecting properties (`width`, `height`, `padding`, `margin`)
- Page transitions or route changes
- Scroll-linked effects, parallax, sticky reveals
- Component entrance (fade-in, slide-in, stagger)

### Reduced Motion

Respect `@media (prefers-reduced-motion: reduce)`:

- All non-essential transitions: `0ms` (instant)
- Keep focus ring visibility — just remove its transition
- Hover `translateY` disabled; only color and border changes remain

## 8. Focus & Accessibility

### Focus Visibility

- Use `:focus-visible` (not `:focus`) so the ring shows for keyboard users but not mouse clicks.
- Tokenize the focus ring:
  - `--focus-ring: 0 0 0 3px color-mix(in srgb, var(--fg-strong) 14%, transparent)`
  - `--focus-offset: 2px`
- Apply via `box-shadow` (not `outline`) so the ring composes with the element's existing border.
- Never use `outline: none` without providing the ring above.
- Focus ring stays visible under `prefers-reduced-motion` (only its transition is removed).

### Color Contrast (WCAG AA baseline)

| Target | Minimum |
|--------|---------|
| Body text vs background | ≥ 4.5 : 1 |
| Large text (≥ 18px, or bold ≥ 14px) | ≥ 3 : 1 |
| UI control borders vs surface | ≥ 3 : 1 (see soft-border note below) |
| Focus indicator vs background | ≥ 3 : 1 |

**Token audit — light mode (against page background `#f4f3f0`):**

| Token | Hex | Contrast | Verdict |
|-------|-----|----------|---------|
| Strong Ink | `#20201e` | 14.71 : 1 | ✓ AAA |
| Body Ink | `#333331` | 11.41 : 1 | ✓ AAA |
| Soft Ink | `#575753` | 6.54 : 1 | ✓ AA |
| Muted Text | `#686866` | 5.03 : 1 | ✓ AA |
| Soft Text | `#999995` | 2.58 : 1 | ✗ decorative only — never primary content |
| Disabled | `#b9b8b2` | 1.79 : 1 | ✗ disabled state (acceptable by convention) |
| Charcoal Accent | `#2f2f2c` | 12.10 : 1 | ✓ AAA |

**Token audit — dark mode (against dark background `#181817`):**

| Token | Hex | Contrast | Verdict |
|-------|-----|----------|---------|
| Dark Strong | `#f4f2ec` | 15.87 : 1 | ✓ AAA |
| Dark Body | `#e5e3de` | 13.85 : 1 | ✓ AAA |
| Dark Soft | `#cbc7bd` | 10.53 : 1 | ✓ AAA |
| Dark Muted | `#bbb7ad` | 8.88 : 1 | ✓ AAA |

**Soft-border note.** The system's default and soft borders intentionally sit below the 3 : 1 threshold for the paper aesthetic:

- `#dad9d5` (Default Border) on `#f4f3f0` → 1.27 : 1
- `#e5e4e0` (Soft Border) on `#f4f3f0` → 1.15 : 1
- `#aaa9a2` (Strong Border) on `#f4f3f0` → 2.12 : 1

Because of this, **never rely on a border alone to signal an interactive boundary**. Every interactive control must carry its own readable affordance — visible label text, icon, or filled surface that itself meets 3 : 1 against adjacent background. Strong Border (`#aaa9a2`) may be used on focused or selected controls where extra emphasis is needed, but it is still below WCAG; pair it with the `--focus-ring` token defined above.

### Color Independence

Never use color alone to convey meaning. Always pair color with another channel:

- Status badges include text label, not just color.
- Form validation includes error text, not just a red border tint.
- Charts (if any are introduced) use patterns or legends, not just hue.

### Keyboard Navigation

- Every interactive element is reachable via Tab in source order.
- Theme and language toggles must be focusable; do not skip them with `tabindex="-1"`.
- Modal and popover containers trap focus inside; Escape closes and returns focus to the trigger.
- Long documentation pages should provide a "Skip to content" link, visible on focus only.

### Forced Colors / High Contrast

- Respect `@media (forced-colors: active)`.
- Do not override system colors with `!important`.
- Keep border-based hierarchy intact so the UI remains structured under forced colors.

### Reduced Motion

Cross-reference §7 Motion & Transitions — Reduced Motion.

### Touch Targets

Cross-reference §11 Responsive Behavior — Touch Targets.

## 9. System Defaults

These rules establish how text, scrolling, pointers, and form placeholders behave by default across every system surface. They are baseline browser overrides — apply once at the root and don't repeat per-component.

### Text Selection

```css
::selection {
  background: color-mix(in srgb, var(--fg-strong) 18%, transparent);
  color: var(--fg-strong);
}
```

- The selection wash is the only place where ink-tinted background is acceptable outside cards / badges.
- Override the system blue/orange default explicitly. Do not leave it to the OS.
- The same rule works in dark mode because `--fg-strong` flips.

### Scrollbars

Thin, paper-toned, never pill-shaped, no platform stylization.

```css
/* Firefox only */
@supports (-moz-appearance: none) {
  html {
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }
}

/* WebKit / Chromium */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-button {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent !important;
  -webkit-appearance: none;
}
::-webkit-scrollbar-button:single-button,
::-webkit-scrollbar-button:double-button,
::-webkit-scrollbar-button:start:decrement,
::-webkit-scrollbar-button:start:increment,
::-webkit-scrollbar-button:end:decrement,
::-webkit-scrollbar-button:end:increment,
::-webkit-scrollbar-button:vertical:decrement,
::-webkit-scrollbar-button:vertical:increment,
::-webkit-scrollbar-button:vertical:start:decrement,
::-webkit-scrollbar-button:vertical:start:increment,
::-webkit-scrollbar-button:vertical:end:decrement,
::-webkit-scrollbar-button:vertical:end:increment,
::-webkit-scrollbar-button:horizontal:decrement,
::-webkit-scrollbar-button:horizontal:increment,
::-webkit-scrollbar-button:horizontal:start:decrement,
::-webkit-scrollbar-button:horizontal:start:increment,
::-webkit-scrollbar-button:horizontal:end:decrement,
::-webkit-scrollbar-button:horizontal:end:increment {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent !important;
  -webkit-appearance: none;
}
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--soft);
}
```

- 6px on both axes.
- Hide WebKit scrollbar buttons so no top / bottom arrow controls appear.
- In Chromium / Edge, do not set standard `scrollbar-width`; let the `::-webkit-scrollbar` rules own the rendering so platform arrow buttons stay hidden.
- Thumb radius 4px Micro — consistent with the minimum surface radius.
- Track is transparent. Never tinted.

### Cursor Affordances

| State / Element | Cursor |
|-----------------|--------|
| Default body and static text | (browser default — do **not** force `default`) |
| Buttons, links, segmented controls | `pointer` |
| Text inputs, textareas | `text` (browser default) |
| Disabled controls | `not-allowed` |
| Resizable element | `ew-resize` / `ns-resize` / `move` |
| Drag handle (only if drag-and-drop exists) | `grab`; `grabbing` while held |

- Do not use `cursor: pointer` on non-interactive elements (badges, plain text).
- Never use animated or custom cursor images.

### Placeholder

```css
::placeholder {
  color: var(--soft);
  opacity: 1;
}
```

- Use the Soft Text token directly — never fade with `opacity`.
- Do not italicize placeholder text; match the input's body weight and style.
- Placeholders are hints, not labels. Always pair an input with a real `<label>`.

### Caret

```css
input, textarea {
  caret-color: var(--fg-strong);
}
```

- The caret uses Strong Ink for visibility against the soft-paper backgrounds.
- Dark mode flips automatically because `--fg-strong` flips.

## 10. Do's and Don'ts

### Do

- Use `#f4f3f0` as the default page background.
- Use `#20201e` or `#333331` instead of pure black.
- Keep the interface mostly monochrome, but warm and soft.
- Use Georgia-based serif typography throughout the interface.
- Use `Meddon Custom` only for signature identity marks.
- Keep rectangular buttons gently rounded with a 7px radius.
- Keep button icons around 13px–14px and labels around 13px.
- Use 7px icon-label spacing inside buttons.
- Place app download actions near the top of product pages.
- Use a language toggle for bilingual content.
- Use subtle borders instead of heavy shadows.
- Make dark mode soft and readable, not pitch black.
- Use low-saturation semantic colors for status feedback.
- Keep hover states lightweight and tactile.
- Keep every title/subtitle pair visually tiered with fixed 6px title-to-subtitle spacing.
- Keep design preview pages generic, complete, and free of concrete project names.

### Don't

- Don't use pure white as the page background.
- Don't introduce blue, brown, orange, purple, or saturated accent systems.
- Don't use emoji feature icons.
- Don't make rectangular buttons full-pill unless they are icon-only controls or badges.
- Don't add arrow symbols to every CTA.
- Don't use heavy card shadows or SaaS-style elevation.
- Don't center a signature wordmark like a generic title.
- Don't use `Meddon Custom` for body text or UI controls.
- Don't switch to sans-serif as the default UI typeface.
- Don't show Chinese and English copy at the same time unless the content is explicitly comparative.
- Don't invent new gray values when the token system already covers the use case.
- Don't overdecorate empty states with illustrations or visual metaphors.
- Don't use 0px or 1px corner radius; 4px Micro is the minimum.
- Don't split section labels and headings into distant columns.
- Don't let selected and hovered select-menu options touch each other.

## 11. Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile Small | <430px | Single column, full-width buttons, reduced hero scale |
| Mobile | 430px–640px | Stacked download buttons, simplified navigation, app preview below copy |
| Tablet | 640px–920px | One-column hero, selective two-column card layouts |
| Desktop Small | 920px–1120px | Two-column hero allowed, reduced grid density |
| Desktop | 1120px–1280px | Full product layout, three-column download buttons |
| Large Desktop | 1280px+ | Maximum content width, generous margins, documentation sidebar |

### Touch Targets

- Buttons: minimum 42px height
- Icon buttons: 36px–38px square
- List rows: minimum 44px height
- Tabs and segmented controls: minimum 38px height
- Form inputs: minimum 42px height

### Collapsing Strategy

- Product hero: two columns collapse into one column below 920px.
- Download buttons: three columns collapse into one column below 640px.
- Feature grids: three columns collapse into one column below 920px.
- Documentation sidebar: sticky sidebar becomes a normal top block below 980px.
- Tables: horizontal scrolling is acceptable; do not shrink table text below 12px.
- Footer: single-line layout may wrap naturally; keep separators visible only when spacing allows.
- Theme and language controls remain fixed top-right.

### Image and Mockup Behavior

- Product mockups should move below hero text on mobile.
- Mockup frame borders and surface tones should remain consistent across breakpoints.
- Placeholder previews should maintain aspect ratio.
- Do not scale complex desktop layouts down into unusable mobile screenshots.
- Mobile app previews should prioritize simplified content and touch-scale spacing.

## 12. Agent Prompt Guide

### Quick Color Reference

- Page background: Paper Gray (`#f4f3f0`)
- Main surface: Surface White (`#fbfaf7`)
- Secondary surface: Soft Surface (`#efeee9`)
- Preview surface: Muted Surface (`#ebeae6`)
- Main heading text: Strong Ink (`#20201e`)
- Body text: Body Ink (`#333331`)
- Muted text: Muted Text (`#686866`)
- Soft labels: Soft Text (`#999995`)
- Default border: `#dad9d5`
- Internal border: `#e5e4e0`
- Primary action background: `#2f2f2c`
- Primary action text: `#f7f6f1`
- Button radius: 7px
- Minimum radius: 4px Micro
- Icon button radius: 999px
- Default font: Georgia-based serif stack
- Identity font: `Meddon Custom` only for signature identity marks

### Example Component Prompts

- "Build a professional design-system preview page using this document. Keep all copy generic; do not include concrete project names, app names, file names, or handoff notes. Show colors, typography, buttons, cards, forms, navigation, feedback, data, overlays, layout, spacing, radius, elevation, motion, focus, accessibility, system defaults, controls, and progress. Use compact left-aligned section title groups, fixed Card Title Pair spacing, custom select menus with 4px option gaps, 6px scrollbars with hidden WebKit buttons, and a 4px minimum corner radius."

- "Create a product hero on a soft paper-gray background (`#f4f3f0`). Use a Georgia-based serif stack. Set the product name in lowercase at 120px, weight 400, line-height 0.88, letter-spacing -0.055em, color `#20201e`. Place a 20px description below with line-height 1.65 and color `#333331`. Add three download buttons in one row. Buttons should be 44px tall, 7px radius, 13px text, 13–14px icons, 7px icon-label gap, and no arrows. Place a quiet product mockup on the right using thin borders and soft gray surfaces."

- "Create a personal homepage with a large left-aligned `Meddon Custom` signature mark. Use `#f4f3f0` as the page background and `#20201e` for the mark. Show project entries as quiet preview blocks with `#ebeae6` placeholders and `#dad9d5` borders. Keep the footer to one line with copyright, email, and source links. Do not add an avatar, subtitle, skills section, or blog."

- "Design a settings form in this design system. Use `#fbfaf7` surfaces, `#dad9d5` borders, 42px inputs, 7px radius, Georgia serif labels at 13px, and muted helper text at 12px. Focus states should use a soft 3px ring based on `#aaa9a2`. Validation errors should use low-saturation danger colors, not bright red."

- "Create a quiet dashboard using the system tokens. Use metric cards with `#efeee9` backgrounds, `#e5e4e0` borders, uppercase 11px labels, 34px serif values, and 13px muted notes. Status badges should use low-saturation semantic colors. Avoid saturated charts, heavy shadows, and colorful iconography."

- "Build a documentation page using this system. Use a sticky 244px sidebar on desktop with `#fbfaf7` background and `#dad9d5` border. Main content should use compact left-aligned section title groups, generous 68px vertical section spacing, and thin dividers. Collapse the sidebar into a top block on tablet and mobile."

### Iteration Guide

1. Start with the paper-gray palette; never begin from a generic white page.
2. Bind the design tokens first before writing component-specific styles.
3. Use the Georgia-based serif stack for the interface unless a specific product brand overrides it.
4. Keep headings large but usually weight 400.
5. Use borders, surfaces, and spacing for hierarchy instead of shadows.
6. Treat buttons as quiet controls, not aggressive marketing CTAs.
7. Keep rectangular button radius at 7px.
8. Use full-pill radius only for badges, icon buttons, and compact pills.
9. Keep button icons visually aligned at 13px–14px.
10. Place app download options near the hero, not at the bottom of the page.
11. Use a language toggle for bilingual content instead of showing both languages simultaneously.
12. Use dark mode values that remain soft and warm, not pure black.
13. Keep semantic colors muted and gray-balanced.
14. Avoid emoji, decorative illustrations, saturated accents, and heavy SaaS shadows.
15. When uncertain, remove decoration and rely on typography, spacing, and thin borders.
