---
name: ContentOS
description: Deep-ink editorial studio for tracking posts and clipping YouTube into Shorts, Reels, and TikTok.
colors:
  ink: "#07090e"
  ink-2: "#0c1018"
  panel: "#10151f"
  panel-2: "#151c28"
  line: "#243042"
  fg: "#eef3f8"
  muted: "#8b97a8"
  lime: "#c8f542"
  lime-dim: "rgba(200, 245, 66, 0.14)"
  ink-on-lime: "#08100a"
  field-well: "#0a0f16"
  danger: "#ff8f9f"
typography:
  display:
    fontFamily: "Syne, Avenir Next, sans-serif"
    fontSize: "clamp(1.6rem, 2.4vw, 2.15rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Syne, Avenir Next, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Manrope, Segoe UI, sans-serif"
    fontSize: "0.92rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "normal"
  body:
    fontFamily: "Manrope, Segoe UI, sans-serif"
    fontSize: "0.88rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "0.04em"
  mono:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.72rem"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "normal"
rounded:
  sm: "10px"
  md: "12px"
  lg: "14px"
  xl: "16px"
  card: "20px"
  phone: "28px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "18px"
  lg: "24px"
  xl: "28px"
  section: "36px"
components:
  button-primary:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink-on-lime}"
    typography: "{typography.title}"
    rounded: "{rounded.sm}"
    padding: "11px 16px"
  button-primary-hover:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink-on-lime}"
    rounded: "{rounded.sm}"
  button-secondary:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.fg}"
    rounded: "{rounded.sm}"
    padding: "11px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
  input-field:
    backgroundColor: "{colors.field-well}"
    textColor: "{colors.fg}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
  panel-card:
    backgroundColor: "rgba(16, 21, 31, 0.88)"
    textColor: "{colors.fg}"
    rounded: "{rounded.xl}"
    padding: "18px"
  chip-pill:
    backgroundColor: "{colors.lime-dim}"
    textColor: "{colors.lime}"
    rounded: "{rounded.pill}"
    padding: "4px 9px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "42px"
  nav-link-active:
    backgroundColor: "{colors.lime-dim}"
    textColor: "{colors.lime}"
    rounded: "{rounded.sm}"
    height: "42px"
---

# Design System: ContentOS

## Overview

**Creative North Star: "The Deep-Ink Cutting Room"**

ContentOS is a night-shift editorial desk: almost-black ink, steel panel seams, and a single electric-lime marker. Surfaces are opaque instrument panels, not frosted glass. The lime is a cutting tool — brand mark, active nav, primary CTA, viral scores, Shorts highlight words — not a wash across the room.

Density is generous and operational. The authenticated shell is a 240px sticky rail plus a working canvas (`28px / 36px` padding). Login is a centered 440px card before any chrome exists. Motion is a short rise (`translateY(8px)` over ~480ms) and a 1px CTA lift on hover. The world rejects SaaS white, second accents (blue/purple/gold as brand), and filling large interiors with solid lime.

**Key Characteristics:**
- Near-black ink ground with a faint lime bloom (top-right) and a cool atmospheric wash (bottom-left) that is not a token
- Opaque ink panels with 1px `#243042` seams
- Syne for display titles, Manrope for the working voice, IBM Plex Mono for timecodes and metrics
- Lime as a marker: brand square, active states, primary CTA, score numerals
- Vertical Shorts phone stage as the signature artifact, not a marketing hero
- Desktop rail + mobile five-tab dock; no sidebar on small screens

## Colors

A single electric-lime accent on a deep-ink ground. Neutrals are cool steel, never pure gray.

### Primary
- **Electric Lime** (`#c8f542`): The marker. Brand square fill, active nav, primary CTA, viral scores, Shorts highlight words, focus rings. Keep it rare on any given panel.
- **Lime Veil** (`rgba(200, 245, 66, 0.14)`): Rest fill for pills, active nav, and selected SEO tabs. Never a large panel interior.
- **Ink on Lime** (`#08100a`): Text and icons sitting on the lime enamel.

### Neutral
- **Deep Ink** (`#07090e`): Page ground and `theme-color`.
- **Ink Well** (`#0c1018`): Darker nested wells and login card body.
- **Panel Steel** (`#10151f`): Default panel / user-chip fill.
- **Panel Lift** (`#151c28`): Secondary button fill and slightly brighter wells.
- **Seam** (`#243042`): Default 1px border.
- **Tissue** (`#eef3f8`): Primary text.
- **Steel Copy** (`#8b97a8`): Supporting copy, labels, inactive nav.
- **Field Well** (`#0a0f16`): Input, select, URL bar, and copy-block interiors.

### Tertiary
- **Rose Fault** (`#ff8f9f`): Form and load errors only. Not a fill.

### Named Rules
**The Lime Rarity Rule.** `#c8f542` is a marker. It belongs on the brand square, the one irreversible CTA on a pane, active nav, scores, and caption highlights. It does not fill large panel interiors.

**The Steel-Not-Gray Rule.** Text, borders, and muted copy stay in the cool steel family. Neutral gray and white cards are out of world.

## Typography

**Display Font:** Syne (with Avenir Next, sans-serif)
**Body Font:** Manrope (with Segoe UI, sans-serif)
**Label/Mono Font:** IBM Plex Mono (with ui-monospace)

**Character:** Syne is the masthead — tight tracking, geometric, used for product name, page titles, scores, and burned-in Shorts captions. Manrope is the working voice: nav, forms, notes, status. Mono is only for timecodes, view counts, and keyboard chips.

### Hierarchy
- **Display** (700, `clamp(1.6rem, 2.4vw, 2.15rem)`, 1.05, tracking `-0.045em`): Page titles in the top bar; login title at `2rem`.
- **Headline** (700, `1.05rem`, tracking `-0.03em`): Panel titles (`h2`).
- **Title** (700, `0.92rem`): Row titles, day-card titles, user name.
- **Body** (400, `0.82–0.88rem`, 1.45–1.5): Supporting copy, leads, moment reasons.
- **Label** (650–700, `0.72–0.75rem`, tracking `0.04–0.16em`, often uppercase): Field labels, copy-block headers, Shorts footer.
- **Mono** (400, `0.72rem`): Timeline meta, library metrics, `cos-kbd`.

### Named Rules
**The Two-Voice Rule.** Syne signs the room. Manrope does the work. Do not set body copy in Syne or headlines in a third face.

## Layout

The authenticated product is a two-column editorial desk, not a marketing stack.

- **Shell:** `240px` sticky rail + fluid main. Below `980px` the rail hides and a five-tab dock (`Studio / Library / Queue / Clip / Exports`) pins to the bottom with `backdrop-filter: blur(10px)`.
- **Auth gate:** centered `min(440px, 100%)` card, vertically centered, before any rail exists. Boot state is a centered brand mark on ink.
- **Page header:** title left, actions right; `28px 36px` (desktop), `18px` horizontal on small screens. Body padding `24px 36px 96px` (extra bottom for the dock).
- **Studio stats:** four equal columns, collapsing to one at `980px`.
- **Working splits:** library `1.15fr / 0.85fr`, clip hero `1.1fr / 0.9fr`, editor `1.2fr / 0.8fr`, week grid seven columns → two at `1100px` → one at `980px`.
- **Shorts stage:** phone mock `max-width: 340px`, 9:16 stage, centered. Landscape preview is 16:9; 1:1 caps at `480px`.

Spacing rhythm is 8 / 12 / 18 / 24 / 28 / 36.

## Elevation & Depth

Depth is tonal ink plus a single lime bloom, not stacked Material shadows. Panels are opaque (`rgba(16, 21, 31, 0.88)`) with a 1px seam. The page sits on two faint radial washes (lime at the top-right, cool blue at the bottom-left) that must stay atmospheric — they are not a second brand color.

### Shadow Vocabulary
- **Brand mark** (`0 0 0 1px rgba(200, 245, 66, 0.35), 0 10px 30px rgba(200, 245, 66, 0.18)`): Lime square only.
- **Primary CTA** (`0 8px 28px rgba(200, 245, 66, 0.18)`): Rest; hover is brightness + 1px lift, not a larger shadow.
- **Login card** (`0 30px 80px rgba(0, 0, 0, 0.45)`): The only large black cushion, because auth has no rail.
- **Phone chassis** (`0 24px 60px rgba(0, 0, 0, 0.45)`): Shorts mock only.
- **Focus bloom** (`0 0 0 3px rgba(200, 245, 66, 0.12)` plus lime seam at `0.55` opacity): Inputs and selects. Never a blue browser ring.
- **Active item** (inset `0 0 0 1px rgba(200, 245, 66, 0.15)` plus lime seam at `0.45`): Selected library row or “today” on the week grid.

### Named Rules
**The Opaque Desk Rule.** Panels are ink slabs with a seam. Do not restyle them into frosted glass or a flat `#111` rectangle “for contrast.”

**The One-Pixel Lift Rule.** Hover on primary CTAs is `translateY(-1px)` and `brightness(1.05)`. Anything larger leaves the cutting room.

## Shapes

The silhouette language is softly squared steel and a lime square mark — never sharp rectangles, never full-bleed pills except for chips.

- **Brand mark:** 10px radius at 34px; 14px at 48px (login / boot).
- **Buttons / nav / fields:** 10–11px.
- **User chip, rows, timeline track:** 12px.
- **Stats, library items, moments, calendar days:** 14px.
- **Panels, preview frames:** 16px.
- **Login card:** 20px.
- **Shorts phone chassis:** 28px outer, 18px inner stage, pill notch.
- **Pills / SEO tabs / rail icons on the phone:** `999px`.

Borders are 1px `#243042` at rest, lime at `0.45–0.55` when selected or focused. The drop/URL field is a filled well, not a dashed target.

## Components

### Buttons
- **Shape:** 11px radius, inline-flex, 8px icon gap, weight 700.
- **Primary:** lime enamel, ink-on-lime text (`#08100a`), 11×16 padding, lime bloom. Hover lifts 1px. Disabled at 55% opacity.
- **Secondary:** panel-lift fill, 1px seam, no bloom.
- **Ghost:** transparent, muted text, 10px radius. Hover shifts to tissue text and a brighter seam (`#3a4b63`).

### Chips
- **Status / export pills:** full pill, lime veil + lime text + 1px lime seam at 0.22. `.muted` uses steel veil and the default seam.
- **SEO tabs:** pill outline; `.active` uses lime veil.

### Cards / Containers
- **`.cos-panel`:** default working surface. 16px radius, 18px padding, 88% opaque panel steel.
- **`.cos-stat`:** 14px radius, 16×18 padding, vertical ink gradient, `cos-rise` entrance.
- **`.cos-login-card`:** 20px radius, 28px padding, large black cushion.
- **`.cos-day` / `.cos-moment` / `.cos-item`:** 14px, 1px seam; today / active get a lime inset.

### Inputs / Fields
- **Style:** 10px radius (URL bar 12px), field-well fill, 1px seam. Labels are uppercase steel.
- **Focus:** lime seam at ~0.55 plus 3px lime bloom. No default blue outline.
- **Error:** rose-fault copy under the field, not a red border takeover.

### Navigation
Desktop: sticky 240px rail, brand lockup, 42px nav rows (10px radius). Inactive is steel; hover is lime veil + tissue text; `.active` is lime text. Footer holds the user chip and a ghost sign-out.

Mobile: five-icon dock, 0.68rem labels, lime when active. Main content keeps 110px bottom padding so the dock does not cover actions.

### Shorts phone (signature)
A 340px chassis with a 9:16 stage, top notch, right-side circular rail, and burned-in captions. Captions are Syne extra-bold, uppercase, white with a 1.4px black stroke; `em` / `*word*` highlights render in lime. The 16:9 YouTube embed is scaled ~1.78 so the vertical crop holds. This is an operate tool, not a landing-page mock.

## Do's and Don'ts

### Do:
- **Do** build new panes from `.cos-panel` / `.cos-stat` / `.cos-login-card` and the radius steps (10 / 12 / 14 / 16 / 20 / 28).
- **Do** keep Syne on titles, scores, and Shorts captions; Manrope on body, forms, and nav; mono on timecodes.
- **Do** treat `#c8f542` as a marker: brand square, one primary CTA, active nav, scores, caption highlights.
- **Do** collapse the rail into the five-tab dock under 980px and keep 18px page gutters.
- **Do** keep hover to a 1px lift, a brighter seam, or lime veil — not a color swap into another world.
- **Do** keep Shorts captions uppercase Syne with a black stroke and lime on the punch word.

### Don't:
- **Don't** introduce opaque white or slate cards, Inter/system display faces, or a second accent (blue, purple, gold) as brand.
- **Don't** fill large surfaces with solid `#c8f542`.
- **Don't** restyle panels into glassmorphism or a marketing hero/kicker stack. This is an operate surface.
- **Don't** use hard offset drop shadows or default blue focus rings.
- **Don't** promote page-title eyebrows into a required system element — the live `.cos-kicker` is a defect to retire, not a pattern to copy.
- **Don't** expand Lucide glyph-icon language as identity; the brand square and lime marker already sign the room.
