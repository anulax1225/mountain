# 3D Rendering (Three.js)

This document defines the standard patterns for Three.js 3D rendering in the Owlaround editor.

## Table of Contents

- [Core Architecture](#core-architecture)
- [Constants (editorConstants)](#constants-editorconstants)
- [Spatial Math (spatialMath)](#spatial-math-spatialmath)
- [Sprite Factory (spriteFactory)](#sprite-factory-spritefactory)
- [Composables](#composables)
- [Common Patterns](#common-patterns)

---

## Core Architecture

The 3D editor uses a centralized, composable architecture:

```
┌─────────────────────────────────────────────────┐
│                  EditorViewer.vue               │
│         (State orchestrator, event handling)    │
└────────────────────────┬────────────────────────┘
                         │
┌────────────────────────┴────────────────────────┐
│                  EditorCanvas.vue               │
│            (Three.js scene, rendering)          │
├─────────────────────────────────────────────────┤
│  Uses:                                          │
│  ├── useThreeScene (scene setup)                │
│  ├── usePanoramaLoader (image loading)          │
│  ├── SpriteFactory (sprite creation)            │
│  ├── SpriteManager (sprite lifecycle)           │
│  └── spatialMath (3D calculations)              │
└─────────────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────┐
│               editorConstants.js                │
│            (All magic numbers)                  │
└─────────────────────────────────────────────────┘
```

**Key Rules:**

1. **Never hardcode values** - Use `editorConstants`
2. **Never duplicate 3D math** - Use `spatialMath`
3. **Never manually create scenes** - Use `useThreeScene`
4. **Never manually create sprites** - Use `SpriteFactory`

---

## Constants (editorConstants)

All magic numbers are centralized in `lib/editorConstants.js`.

### Available Constants

```javascript
import {
  CAMERA,
  SPHERE,
  SPRITE,
  CONTROLS,
  TRANSITION,
  CANVAS,
  COLORS,
  TIMING,
} from '@/lib/editorConstants'
```

### CAMERA

```javascript
CAMERA = {
  FOV: 75,           // Field of view
  NEAR: 0.1,         // Near clipping plane
  FAR: 1000,         // Far clipping plane
  DEFAULT_DISTANCE: 0.1,  // Camera distance from center
}
```

### SPHERE

```javascript
SPHERE = {
  RADIUS: 500,       // Panorama sphere radius
  SEGMENTS: 60,      // Horizontal segments
  RINGS: 40,         // Vertical rings
  SCALE: -1,         // Flip inside-out for interior viewing
}
```

### SPRITE

```javascript
SPRITE = {
  POSITION_SCALE: 0.95,  // Position sprites inside sphere
  HOTSPOT: {
    BASE_SCALE: 15,      // Hotspot default size
    HOVER_SCALE: 1.1,    // Hover scale multiplier
  },
  STICKER: {
    BASE_SCALE: 20,      // Sticker default size
    EMOJI_SCALE: 25,     // Emoji sticker size
  },
}
```

### CONTROLS

```javascript
CONTROLS = {
  ENABLE_DAMPING: true,
  DAMPING_FACTOR: 0.05,
  ROTATE_SPEED: -0.5,
  ZOOM_SPEED: 1.0,
  MIN_DISTANCE: 0.1,
  MAX_DISTANCE: 100,
  MIN_POLAR_ANGLE: 0.1,
  MAX_POLAR_ANGLE: Math.PI - 0.1,
}
```

### TRANSITION

```javascript
TRANSITION = {
  FADE_DURATION_MS: 500,
  FADE_STEP: 0.05,
}
```

### CANVAS

```javascript
CANVAS = {
  HOTSPOT: {
    SIZE: 64,
    CIRCLE_RADIUS: 24,
  },
  STICKER: {
    SIZE: 128,
    FONT_SIZE: 64,
  },
}
```

### COLORS

```javascript
COLORS = {
  HOTSPOT_DEFAULT: '#ffffff',
  STICKER_BACKGROUND: 'rgba(0, 0, 0, 0.7)',
  STICKER_TEXT: '#ffffff',
}
```

### TIMING

```javascript
TIMING = {
  HOVER_DELAY_MS: 100,
  DIALOG_TRANSITION_DELAY_MS: 150,
  DEBOUNCE_MS: 16,
}
```

### Usage

```javascript
// CORRECT - Use constants
import { SPHERE, SPRITE } from '@/lib/editorConstants'

const geometry = new THREE.SphereGeometry(
  SPHERE.RADIUS,
  SPHERE.SEGMENTS,
  SPHERE.RINGS
)

point.multiplyScalar(SPRITE.POSITION_SCALE)

// INCORRECT - Never hardcode
const geometry = new THREE.SphereGeometry(500, 60, 40)  // ❌
point.multiplyScalar(0.95)  // ❌
```

---

## Spatial Math (spatialMath)

All 3D mathematical operations are in `lib/spatialMath.js`.

### Coordinate Conversions

```javascript
import {
  sphericalToCartesian,
  cartesianToSpherical,
} from '@/lib/spatialMath'

// Convert spherical (radius, azimuthal, polar) to Cartesian (x, y, z)
const position = sphericalToCartesian(
  SPHERE.RADIUS,  // radius
  1.5,            // azimuthal angle (horizontal, radians)
  0.8             // polar angle (vertical from +Y, radians)
)
// → { x: ..., y: ..., z: ... }

// Convert Cartesian to spherical
const spherical = cartesianToSpherical(x, y, z)
// → { radius: ..., azimuthal: ..., polar: ... }
```

### Position Scaling

```javascript
import { scalePosition } from '@/lib/spatialMath'

// Scale position for inside-sphere placement
const scaledPos = scalePosition(
  { x: 100, y: 50, z: -200 },
  SPRITE.POSITION_SCALE  // 0.95
)
// Positions sprite slightly inside the sphere to avoid z-fighting
```

### Camera Rotation

```javascript
import {
  calculateCameraRotation,
  calculateOppositePosition,
  calculateReturnRotation,
  applyCameraRotation,
} from '@/lib/spatialMath'

// Calculate rotation to look at a position
const rotation = calculateCameraRotation(targetPosition)
// → { x: ..., y: ..., z: ... }

// Calculate opposite position (for bidirectional hotspots)
const oppositePos = calculateOppositePosition(
  cameraRotation,
  SPHERE.RADIUS,
  SPRITE.POSITION_SCALE
)
// Returns position behind the camera

// Calculate return rotation for bidirectional hotspot
const returnRotation = calculateReturnRotation(hotspotPosition)

// Apply rotation to OrbitControls
applyCameraRotation(controls, rotation)
```

### Vector Operations

```javascript
import {
  magnitude,
  normalize,
  invert,
  dotProduct,
} from '@/lib/spatialMath'

const mag = magnitude({ x: 3, y: 4, z: 0 })  // 5
const norm = normalize({ x: 3, y: 4, z: 0 }) // unit vector
const inv = invert({ x: 1, y: 2, z: 3 })     // { x: -1, y: -2, z: -3 }
```

---

## Sprite Factory (spriteFactory)

Sprites are created using `lib/spriteFactory.js`.

### SpriteFactory

```javascript
import { SpriteFactory } from '@/lib/spriteFactory'
import { SPRITE } from '@/lib/editorConstants'

// Create hotspot sprite
const hotspotSprite = SpriteFactory.createHotspotSprite(hotspot, {
  color: hotspot.custom_color || COLORS.HOTSPOT_DEFAULT,
  image: hotspot.custom_image,
})

// Create sticker sprite
const stickerSprite = SpriteFactory.createStickerSprite(sticker, {
  type: sticker.type,  // 'emoji' | 'text'
  content: sticker.content,
  fontSize: sticker.font_size,
  fontColor: sticker.font_color,
  backgroundColor: sticker.background_color,
})

// Position sprite
SpriteFactory.positionSprite(
  sprite,
  { x: position.x, y: position.y, z: position.z },
  SPRITE.POSITION_SCALE
)
```

### SpriteManager

```javascript
import { SpriteManager } from '@/lib/spriteFactory'

// Create manager for a scene
const manager = new SpriteManager(threeScene.value)

// Add sprite with metadata
manager.add(sprite, {
  hotspot: hotspotData,
  type: 'hotspot',
})

// Get sprite by metadata
const sprite = manager.getBySlug(hotspot.slug)

// Remove specific sprite
manager.remove(sprite)

// Clear all sprites (with proper disposal)
manager.clear()

// Get all sprites
const allSprites = manager.getAll()
```

### Complete Example

```javascript
import { SpriteFactory, SpriteManager } from '@/lib/spriteFactory'
import { SPRITE } from '@/lib/editorConstants'

// In EditorCanvas.vue
const spriteManager = new SpriteManager(threeScene.value)

// Create hotspot sprites for current image
const createHotspotSprites = (image) => {
  // Clear existing
  spriteManager.clear()

  // Create new sprites
  image.hotspots_from?.forEach(hotspot => {
    const sprite = SpriteFactory.createHotspotSprite(hotspot)

    SpriteFactory.positionSprite(
      sprite,
      {
        x: hotspot.position_x,
        y: hotspot.position_y,
        z: hotspot.position_z,
      },
      SPRITE.POSITION_SCALE
    )

    spriteManager.add(sprite, { hotspot, type: 'hotspot' })
  })
}

// Cleanup on unmount
onUnmounted(() => {
  spriteManager.clear()
})
```

---

## Composables

### useThreeScene

Initialize Three.js scene with automatic lifecycle management.

```javascript
import { useThreeScene } from '@/composables/useThreeScene'

const containerRef = ref(null)

const {
  threeScene,
  camera,
  renderer,
  controls,
  init,
  dispose,
} = useThreeScene(containerRef, {
  onReady: () => {
    console.log('Scene initialized')
    loadInitialPanorama()
  },
  onAnimate: (delta) => {
    // Called each frame
    updateSprites(delta)
  },
})

onMounted(() => {
  init()
})

onUnmounted(() => {
  dispose()
})
```

**Features:**

- Automatic animation loop
- Resize handling
- OrbitControls setup
- Resource cleanup

### usePanoramaLoader

Load 360° panoramic images with transitions.

```javascript
import { usePanoramaLoader } from '@/composables/usePanoramaLoader'

const {
  loadPanorama,
  isLoading,
  currentTexture,
} = usePanoramaLoader(threeScene, textureLoader)

// Load with fade transition
await loadPanorama(
  imageUrl,
  true,  // enableTransition
  { x: 0.5, y: 0.3, z: 0 },  // targetRotation (optional)
  controls.value  // OrbitControls instance
)

// Load without transition
await loadPanorama(imageUrl, false)
```

**Features:**

- Texture loading
- Sphere mesh creation
- Fade transitions
- Camera rotation application

### useEditorInteraction

Manage editor interaction state by slug (not object reference).

```javascript
import { useEditorInteraction } from '@/composables'

const interaction = useEditorInteraction()

// State (reactive refs)
interaction.hoveredHotspotSlug.value   // string | null
interaction.hoveredStickerSlug.value   // string | null
interaction.selectedStickerSlug.value  // string | null

// Setters
interaction.setHoveredHotspot(slug)
interaction.setHoveredSticker(slug)
interaction.setSelectedSticker(slug)

// Clear
interaction.clearHoverStates()
interaction.clearAllStates()
```

**Key Principle:** Track by slug, not object reference. This prevents stale reference issues when sprites are recreated.

---

## Common Patterns

### Raycasting for Click Detection

```javascript
import * as THREE from 'three'

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

const handleCanvasClick = (event) => {
  // Calculate mouse position in normalized device coordinates
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  // Update raycaster
  raycaster.setFromCamera(mouse, camera)

  // Check sprite intersections
  const sprites = spriteManager.getAll()
  const intersects = raycaster.intersectObjects(sprites)

  if (intersects.length > 0) {
    const sprite = intersects[0].object
    const metadata = spriteManager.getMetadata(sprite)

    if (metadata.type === 'hotspot') {
      emit('hotspot-click', metadata.hotspot)
    }
  }
}
```

### Sphere Click for Position Selection

```javascript
const handleSphereClick = (event) => {
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)

  // Intersect with panorama sphere
  const intersects = raycaster.intersectObject(sphereMesh)

  if (intersects.length > 0) {
    const point = intersects[0].point.clone()

    // Scale position for inside-sphere placement
    point.multiplyScalar(SPRITE.POSITION_SCALE)

    emit('position-selected', {
      x: point.x,
      y: point.y,
      z: point.z,
    })
  }
}
```

### Hover Detection with Screen Position

```javascript
const handleMouseMove = (event) => {
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)

  const sprites = spriteManager.getAll()
  const intersects = raycaster.intersectObjects(sprites)

  if (intersects.length > 0) {
    const sprite = intersects[0].object
    const metadata = spriteManager.getMetadata(sprite)

    // Calculate screen position for popover
    const screenPos = getScreenPosition(sprite.position)

    emit('sprite-hover-start', {
      slug: metadata.hotspot?.slug || metadata.sticker?.slug,
      position: screenPos,
      data: metadata,
    })
  } else {
    emit('sprite-hover-end')
  }
}

const getScreenPosition = (worldPosition) => {
  const vector = worldPosition.clone()
  vector.project(camera)

  const rect = renderer.domElement.getBoundingClientRect()

  return {
    x: ((vector.x + 1) / 2) * rect.width + rect.left,
    y: ((-vector.y + 1) / 2) * rect.height + rect.top,
  }
}
```

### Bidirectional Hotspot Creation

```javascript
import { calculateOppositePosition, calculateReturnRotation } from '@/lib/spatialMath'

const createBidirectionalHotspot = async (
  fromImage,
  toImage,
  position,
  rotation
) => {
  // Create forward hotspot
  await owl.hotspots.create(sceneSlug, {
    from_image_id: fromImage.id,
    to_image_id: toImage.id,
    position_x: position.x,
    position_y: position.y,
    position_z: position.z,
    target_rotation_x: rotation.x,
    target_rotation_y: rotation.y,
    target_rotation_z: rotation.z,
  })

  // Calculate return position and rotation
  const returnPosition = calculateOppositePosition(
    rotation,
    SPHERE.RADIUS,
    SPRITE.POSITION_SCALE
  )

  const returnRotation = calculateReturnRotation(position)

  // Create return hotspot
  await owl.hotspots.create(sceneSlug, {
    from_image_id: toImage.id,
    to_image_id: fromImage.id,
    position_x: returnPosition.x,
    position_y: returnPosition.y,
    position_z: returnPosition.z,
    target_rotation_x: returnRotation.x,
    target_rotation_y: returnRotation.y,
    target_rotation_z: returnRotation.z,
  })
}
```

### Sprite Scale Animation (Hover Effect)

```javascript
// Track base scales separately (avoid accumulation errors)
const baseScales = new Map()

const setHoverState = (sprite, isHovered) => {
  // Store base scale on first interaction
  if (!baseScales.has(sprite.uuid)) {
    baseScales.set(sprite.uuid, sprite.scale.x)
  }

  const baseScale = baseScales.get(sprite.uuid)
  const targetScale = isHovered
    ? baseScale * SPRITE.HOTSPOT.HOVER_SCALE
    : baseScale

  // Apply scale directly (idempotent)
  sprite.scale.setScalar(targetScale)
}
```

---

## Quick Reference

### File Locations

| File | Purpose |
|------|---------|
| `lib/editorConstants.js` | All magic numbers |
| `lib/spatialMath.js` | 3D math functions |
| `lib/spriteFactory.js` | Sprite creation |
| `composables/useThreeScene.js` | Scene initialization |
| `composables/usePanoramaLoader.js` | Panorama loading |
| `composables/useEditorInteraction.js` | Interaction state |

### Never Do

```javascript
// ❌ Hardcode values
point.multiplyScalar(0.95)
new THREE.SphereGeometry(500, 60, 40)
setTimeout(fn, 100)

// ❌ Track by object reference
hoveredSprite.value = sprite  // Becomes stale after recreate

// ❌ Accumulate scale changes
sprite.scale.multiplyScalar(1.2)  // Called twice = 1.44x

// ❌ Manually create scenes
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(...)
```

### Always Do

```javascript
// ✅ Use constants
point.multiplyScalar(SPRITE.POSITION_SCALE)
new THREE.SphereGeometry(SPHERE.RADIUS, SPHERE.SEGMENTS, SPHERE.RINGS)
setTimeout(fn, TIMING.DIALOG_TRANSITION_DELAY_MS)

// ✅ Track by slug
hoveredHotspotSlug.value = hotspot.slug

// ✅ Set scale directly
sprite.scale.setScalar(baseScale * SPRITE.HOTSPOT.HOVER_SCALE)

// ✅ Use composables
const { threeScene, camera, init } = useThreeScene(containerRef)
```
