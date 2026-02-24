# Theme Color Migration Guide

## Overview

This guide provides the correct mapping from hardcoded Tailwind colors to theme-aware CSS custom properties.

## Why This Matters

Your app uses an OKCH-based theme system with customizable hues, but many components use hardcoded zinc/gray colors that:
- Don't respect user theme customization
- Don't properly integrate with the primary/secondary hue system
- Make maintenance difficult across 40+ components

## Color Mapping Reference

### Background Colors

| Hardcoded (Wrong) | Theme-Aware (Correct) | Usage |
|-------------------|----------------------|-------|
| `bg-white` | `bg-background` | Main page backgrounds |
| `bg-white` | `bg-card` | Card/panel backgrounds |
| `bg-zinc-50` | `bg-background` | Light backgrounds |
| `bg-zinc-100` | `bg-muted` | Muted/subtle backgrounds |
| `bg-zinc-800` | `bg-card` | Dark mode cards |
| `bg-zinc-900` | `bg-background` | Dark mode main backgrounds |
| `bg-zinc-950` | `bg-background` | Very dark backgrounds |
| `bg-black` | `bg-background` | Dark backgrounds |

### Text Colors

| Hardcoded (Wrong) | Theme-Aware (Correct) | Usage |
|-------------------|----------------------|-------|
| `text-white` | `text-foreground` | Main text on dark backgrounds |
| `text-white` | `text-card-foreground` | Text on cards |
| `text-black` | `text-foreground` | Main text on light backgrounds |
| `text-zinc-900` | `text-foreground` | Dark text |
| `text-zinc-100` | `text-foreground` | Light text |
| `text-zinc-600` | `text-muted-foreground` | Secondary/muted text |
| `text-zinc-500` | `text-muted-foreground` | Placeholder text |
| `text-zinc-400` | `text-muted-foreground` | Disabled text |

### Border Colors

| Hardcoded (Wrong) | Theme-Aware (Correct) |
|-------------------|----------------------|
| `border-white` | `border-border` |
| `border-zinc-200` | `border-border` |
| `border-zinc-300` | `border-border` |
| `border-zinc-700` | `border-border` |
| `border-zinc-800` | `border-border` |

### Complex Patterns

#### Pattern 1: Card with Border
```vue
<!-- Before -->
<div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">

<!-- After -->
<div class="bg-card border border-border">
```

#### Pattern 2: Muted Background
```vue
<!-- Before -->
<div class="bg-zinc-100 dark:bg-zinc-800">

<!-- After -->
<div class="bg-muted">
```

#### Pattern 3: Hover States
```vue
<!-- Before -->
<button class="hover:bg-zinc-50 dark:hover:bg-zinc-800">

<!-- After -->
<button class="hover:bg-muted">
```

#### Pattern 4: Transparent Overlays
```vue
<!-- Before -->
<div class="bg-white/80 dark:bg-zinc-900/80">

<!-- After -->
<div class="bg-card/80">
```

#### Pattern 5: Backdrop Blur Navigation
```vue
<!-- Before -->
<nav class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">

<!-- After -->
<nav class="bg-card/80 backdrop-blur-md border-b border-border">
```

## Complete Theme Color Palette

All available theme colors defined in `app.css`:

### Backgrounds
- `bg-background` - Main page background
- `bg-card` - Card/panel background
- `bg-popover` - Popover/dropdown background
- `bg-muted` - Muted/subtle background
- `bg-accent` - Accent background (uses secondary hue)

### Foregrounds
- `text-foreground` - Primary text
- `text-card-foreground` - Text on cards
- `text-popover-foreground` - Text in popovers
- `text-muted-foreground` - Secondary/muted text
- `text-accent-foreground` - Text on accent backgrounds

### Interactive Elements
- `bg-primary` - Primary buttons/actions (uses primary hue)
- `text-primary-foreground` - Text on primary buttons
- `bg-secondary` - Secondary buttons (uses secondary hue)
- `text-secondary-foreground` - Text on secondary buttons
- `bg-destructive` - Delete/danger actions (red)

### Borders and Inputs
- `border-border` - All borders
- `bg-input` - Input field backgrounds
- `ring-ring` - Focus rings

## Special Cases

### 1. Inverted Buttons (Dark button on light background)

```vue
<!-- Before -->
<Button class="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900">

<!-- After - Use primary theme color -->
<Button variant="default">
  <!-- Or explicitly -->
<Button class="bg-primary hover:bg-primary/90 text-primary-foreground">
```

### 2. Subtle Info Boxes

```vue
<!-- Before -->
<div class="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">

<!-- After -->
<div class="bg-muted border border-border">
```

### 3. Video/Image Overlays

For purely functional dark overlays (not theme-dependent):
```vue
<!-- Acceptable to keep for image/video backgrounds -->
<div class="bg-black/50">
  <!-- This is for image masking, not theme -->
</div>

<!-- But prefer theme colors for UI overlays -->
<div class="bg-background/50 backdrop-blur">
  <p class="text-foreground">Overlay Text</p>
</div>
```

### 4. Skeleton Loaders

```vue
<!-- Before -->
<div class="bg-zinc-200 dark:bg-zinc-700 animate-pulse">

<!-- After -->
<div class="bg-muted animate-pulse">
```

## Migration Checklist

For each component:

1. [ ] Replace `bg-white` with `bg-background` or `bg-card`
2. [ ] Replace `bg-zinc-*` with appropriate theme color
3. [ ] Replace `text-zinc-*`, `text-black`, `text-white` with `text-foreground` or `text-muted-foreground`
4. [ ] Replace `border-zinc-*` with `border-border`
5. [ ] Remove all `dark:` variants for colors that now use theme variables
6. [ ] Test in both light and dark mode
7. [ ] Test with different primary/secondary hues

## Find and Replace Patterns

Use these regex patterns for bulk replacement:

```bash
# Backgrounds
bg-white\s+dark:bg-zinc-(?:900|950) → bg-background
bg-white(?!\s*dark:) → bg-card

# Borders
border-zinc-(?:200|300)\s+dark:border-zinc-(?:700|800) → border-border

# Text
text-white\s+dark:text-zinc-900 → text-foreground
text-zinc-(?:600|500|400)\s+dark:text-zinc-(?:400|300) → text-muted-foreground
```

## Verification

After migration, verify:

1. Component looks correct in light mode
2. Component looks correct in dark mode
3. Component responds to theme hue changes
4. No layout shifts or visual regressions
5. Interactive states (hover, focus, active) work correctly

## Priority Order

1. **Critical (Public-facing)**: Landing pages, pricing, public gallery
2. **High (Frequently used)**: Dashboard, editor, project management
3. **Medium (Admin/Settings)**: Admin panels, settings pages
4. **Low (Utility)**: Modals, dialogs, minor components
