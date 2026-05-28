# AthletiCap Design System

## Color Strategy
**Restrained + Data Accent.** Tinted neutrals (light theme) with electric blue as the primary action and data highlight. No multi-color palette; one saturated accent carries intent.

### Color Palette (OKLCH)
- **Background (Primary):** #FAFAF8 (okl 0.988 0.002 150 — off-white with warmth)
- **Background (Secondary):** #F4F3EF (okl 0.958 0.004 88 — slightly warmer card bg)
- **Background (Elevated):** #FFFFFF (okl 1.0 0.0 0 — pure white for emphasis)
- **Text (Primary):** #1A1916 (okl 0.115 0.008 72 — dark with warmth, not pure black)
- **Text (Secondary):** #5C5A54 (okl 0.387 0.006 87 — muted, readable)
- **Text (Muted):** #8A8783 (okl 0.555 0.005 93 — disabled, hints)
- **Border:** #D8D5CC (okl 0.852 0.007 96 — subtle divider)
- **Primary Action/Data:** #1A56DB (okl 0.466 0.194 262 — electric blue, saturated)
- **Semantic / Data:**
  - Success: #2DD09A (okl 0.736 0.119 162 — green)
  - Warning: #F59E0B (okl 0.708 0.147 61 — orange)
  - Destructive: #C0392B (okl 0.392 0.157 30 — red)
  - Info: #5BA5D9 (okl 0.603 0.105 264 — light blue, secondary data)

### Usage
- **Primary action buttons, focus rings, highlights, data point emphasis:** #1A56DB
- **Card backgrounds, grouped containers:** #F4F3EF
- **Borders, dividers, subtle structure:** #D8D5CC
- **Elevated surfaces (modals, popovers, top-level overlays):** #FFFFFF
- **Body text:** #1A1916
- **Supporting text, labels:** #5C5A54
- **Disabled, placeholder:** #8A8783
- **Charts/data viz:** Use primary (#1A56DB), success (#2DD09A), warning (#F59E0B), destructive (#C0392B) for series

## Typography
- **Font Stack (Sans):** DM Sans, system-ui, sans-serif
- **Font Stack (Serif):** DM Serif Display, serif (headings, emphasis)
- **Font Stack (Mono):** DM Mono, monospace (technical, numbers in charts)

### Scale & Weights
| Role | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| Display | 36px / 2.25rem | 700 (serif) | 40px | Page titles, hero sections |
| H1 | 30px / 1.875rem | 700 (serif) | 36px | Section headings |
| H2 | 24px / 1.5rem | 700 (serif) | 32px | Subsections |
| H3 | 20px / 1.25rem | 600 (sans) | 28px | Card titles, minor headings |
| Body Large | 18px / 1.125rem | 400 (sans) | 28px | Large body text, emphasis |
| Body | 16px / 1rem | 400 (sans) | 24px | Default body |
| Body Small | 14px / 0.875rem | 400 (sans) | 20px | Secondary text, labels |
| Label/Technical | 12px / 0.75rem | 500 (mono) | 16px | Badges, field labels, technical |

**Hierarchy via scale + weight.** Every jump ≥1.25×. No 13px or 15px; steps are deliberate.

## Elevation & Depth
**No shadows by default.** Depth through color and borders only.

| Level | Background | Border | Use Case |
|-------|------------|--------|----------|
| Base | #FAFAF8 | none | Page background |
| 1 | #F4F3EF | 1px #D8D5CC | Cards, panels, grouped content |
| 2 | #FFFFFF | 1px #D8D5CC | Modals, popovers, overlays, form inputs |
| 3 | #FFFFFF + 1px #1A56DB | 2px #1A56DB | Active focus state, input focus, selected |

**Animation:** Transitions use `ease-out-expo` (exponential easing). No bounce, no elastic. 200ms–300ms for UI changes.

## Spacing Scale
```
0: 0
1: 4px
2: 8px
3: 12px
4: 16px
5: 24px
6: 32px
7: 48px
8: 64px
9: 96px
10: 128px
```

**Rhythm:** Alternate between related spacing values. Don't use 4px + 4px + 4px everywhere. Use 4px + 8px + 12px for variation.

## Component System

### Button
- **Primary:** bg #1A56DB, text white, rounded 2px, padding 8px 16px
- **Secondary:** bg #FFFFFF, border 1px #D8D5CC, text #1A1916, rounded 2px, padding 8px 16px
- **Tertiary (Ghost):** no bg, no border, text #1A56DB, rounded 2px, padding 8px 16px
- **Disabled:** bg #F4F3EF, text #8A8783, cursor not-allowed
- **Focus ring:** 2px solid #1A56DB, offset 2px
- **Hover:** Opacity 90% (no color shift), 200ms ease-out-expo

### Input / Form Field
- **Background:** #FFFFFF
- **Border:** 1px #D8D5CC
- **Border (focus):** 2px #1A56DB
- **Padding:** 8px 12px
- **Rounded:** 2px
- **Font:** 16px / 1rem, DM Sans
- **Placeholder color:** #8A8783
- **Error:** Border 2px #C0392B, error text below in #C0392B

### Card / Panel
- **Background:** #F4F3EF
- **Border:** 1px #D8D5CC
- **Padding:** 16px–24px (variable based on content density)
- **Rounded:** 2px
- **Spacing between cards:** 16px–24px (not nested)

### Badge
- **Background:** #E0E8FF (light blue, okl 0.906 0.055 264)
- **Text:** #1A56DB
- **Padding:** 4px 8px
- **Border-radius:** 2px
- **Font:** 12px, 500 weight, DM Mono
- **Variants:** success (bg #D4EDDA, text #0E7C50), warning (bg #FFF3CD, text #B45309), destructive (bg #FCE0E0, text #C0392B)

### Data Visualization (Charts)
- **Primary Series:** #1A56DB
- **Secondary Series:** #5BA5D9 (lighter blue)
- **Accent:** #2DD09A (success green)
- **Negative:** #C0392B (red)
- **Neutral:** #D8D5CC (border reference)
- **Axis/Grid:** 1px #D8D5CC, text #5C5A54
- **Legend:** 12px / 14px DM Sans, color #5C5A54

## Layout Patterns

### Dashboard (Primary View)
- **Header:** Page title (Display, serif), optional subtitle (14px secondary)
- **KPI Row:** 3–4 metric cards in responsive grid (mobile: stacked, tablet: 2 cols, desktop: 3–4 cols)
- **Main Content:** 2–column grid (2/3 primary content, 1/3 sidebar) on desktop; stacked on mobile
- **Metrics cards:** 48–64px number (24px semi-bold mono), 12px label (secondary), optional trend sparkline (8–16px height, #1A56DB stroke)
- **Charts:** Full-width, 300–400px height, margins 16px
- **Lists:** No identical cards. Cards vary by data richness; some are dense tables, others are rich previews

### Form Layout
- **Vertical stacking:** Field + label (above field, 12px, 500 weight)
- **Helper text:** 12px secondary, below field, 4px gap
- **Error text:** Same as helper, color #C0392B
- **Input width:** Full width in narrow containers, 50% in wide (with label on left on desktop)
- **Spacing between fields:** 16px–24px

### Modals & Overlays
- **Background:** Transparent (40% #1A1916 overlay)
- **Modal bg:** #FFFFFF
- **Modal padding:** 24px–32px
- **Border:** None (shadow effect from overlay)
- **Close button:** Top-right, 24px icon button, styled as Ghost
- **Actions:** Aligned bottom, flex row with gap 8px, secondary button left, primary right

## Responsive Design
- **Mobile:** <480px (single column, full-width buttons, stacked sections)
- **Tablet:** 480px–1024px (2-column grids, side-by-side forms)
- **Desktop:** ≥1024px (3+ column grids, sidebar layouts, dense tables)
- **Max content width:** 1280px (centered)

## Dark Mode
**Not supported.** Light theme only. User preference does not trigger dark mode.

## Accessibility
- **Color contrast:** All text meets WCAG AA (4.5:1 for body, 3:1 for large text)
- **Focus indicators:** Always visible, 2px #1A56DB, offset 2px
- **Keyboard nav:** Tab order logical, all interactive elements keyboard-accessible
- **Semantic HTML:** Use `<button>`, `<input>`, `<label>`, `<nav>`, `<main>`, etc.
- **ARIA:** Use `aria-label` for icon buttons, `aria-describedby` for form errors

## Animation Guidelines
- **Page transitions:** 200ms fade-in, ease-out-expo
- **Button hover/active:** 200ms opacity shift, no color change
- **Modal enter:** 300ms slide-up, ease-out-expo
- **List item enter:** 300ms fade-in, staggered 30ms between items
- **Sparkline trend:** 400ms draw animation if available (else static)

## Avoid
- **Side-stripe borders** (no colored left/right borders on cards)
- **Gradient text** (single solid color only)
- **Glassmorphism** (solid backgrounds, 1px borders)
- **Identical card grids** (vary content density and data richness)
- **Nested cards** (one level of nesting max)
- **Excessive shadows** (none by default)
- **Drop caps, stylized lists** (clean, standard formatting)
