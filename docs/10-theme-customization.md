# Theme Customization Guide

## OKCH Color System

The application uses the OKCH (Oklch) color space for theming, which provides perceptually uniform colors and better color manipulation than traditional RGB or HSL.

## Customizable Hues

You can customize the primary and secondary colors of your application by changing their hue values (0-360 degrees).

### Default Hues

- **Primary Hue**: 286 (purple/violet)
- **Secondary Hue**: 286 (purple/violet)

### Using the Theme Composable

```javascript
import { useTheme } from '@/composables/useTheme';

const {
  primaryHue,
  secondaryHue,
  setPrimaryHue,
  setSecondaryHue
} = useTheme();

// Set primary hue to blue (around 230)
setPrimaryHue(230);

// Set secondary hue to orange (around 40)
setSecondaryHue(40);

// Get current hue values
console.log(primaryHue.value); // 230
console.log(secondaryHue.value); // 40
```

### Popular Hue Values

| Color | Hue Range |
|-------|-----------|
| Red | 0-30 |
| Orange | 30-60 |
| Yellow | 60-90 |
| Green | 90-180 |
| Cyan | 180-210 |
| Blue | 210-270 |
| Purple/Violet | 270-330 |
| Magenta | 330-360 |

### Example: Creating a Theme Picker

```vue
<script setup>
import { useTheme } from '@/composables/useTheme';

const { primaryHue, secondaryHue, setPrimaryHue, setSecondaryHue } = useTheme();
</script>

<template>
  <div class="space-y-4">
    <div>
      <label>Primary Hue: {{ primaryHue }}</label>
      <input
        type="range"
        min="0"
        max="360"
        :value="primaryHue"
        @input="setPrimaryHue($event.target.value)"
      />
    </div>

    <div>
      <label>Secondary Hue: {{ secondaryHue }}</label>
      <input
        type="range"
        min="0"
        max="360"
        :value="secondaryHue"
        @input="setSecondaryHue($event.target.value)"
      />
    </div>

    <!-- Preview -->
    <div class="space-x-2">
      <button class="bg-primary text-primary-foreground px-4 py-2 rounded">
        Primary Button
      </button>
      <button class="bg-secondary text-secondary-foreground px-4 py-2 rounded">
        Secondary Button
      </button>
    </div>
  </div>
</template>
```

### Manual CSS Customization

You can also set the hue values directly in CSS:

```css
:root {
  --primary-hue: 230;    /* Blue */
  --secondary-hue: 40;   /* Orange */
}
```

### Colors Affected by Hue Changes

#### Primary Hue Controls:
- Background tints
- Foreground colors
- Card backgrounds
- Borders and inputs
- Primary buttons
- Sidebar colors
- Focus rings

#### Secondary Hue Controls:
- Secondary buttons
- Accent colors
- Hover states

### Persistence

Theme settings (including hue values) are automatically saved to localStorage and persist across sessions:

- Theme mode: `localStorage.getItem('theme')`
- Primary hue: `localStorage.getItem('primaryHue')`
- Secondary hue: `localStorage.getItem('secondaryHue')`

## OKCH Format

The OKCH format is: `oklch(lightness chroma hue)`

- **Lightness**: 0 (black) to 1 (white)
- **Chroma**: 0 (gray) to ~0.4 (saturated)
- **Hue**: 0-360 degrees

Example:
```css
--primary: oklch(0.21 0.006 var(--primary-hue));
```

This creates a dark color with low saturation using the customizable primary hue.
