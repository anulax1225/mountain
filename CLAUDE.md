Purpose & context
Anulax is developing a comprehensive 360° panoramic photo editor and virtual tour creation platform. Users create interactive virtual tours by compositing panoramic photos and adding navigation hotspots between images. The platform targets creative professionals and organizations needing immersive virtual tour capabilities, with a design aesthetic inspired by game studios and 3D asset marketplaces.

Tech stack:
- Backend: Laravel 12 with Inertia.js, Laravel Sanctum authentication, Laravel Scribe for API docs
- Frontend: Vue.js 3 (Composition API), Three.js for 3D rendering
- UI: shadcn/vue components (zinc theme), lucide-vue-next icons, Tailwind CSS
- API client: owl-sdk (all API calls MUST go through this - handles auth, errors, formatting)

Current state
Fully functional virtual tour editor with:
- Immersive full-viewport Three.js canvas with floating UI overlays
- Hotspot system with view mode (navigation) and edit mode (creation)
- Image thumbnails panel, hotspots management panel, zoom controls
- Complete dark mode support and French localization
- 36 reusable components extracted across 7 directories

Note: Some features are partially implemented and may need completion in future sessions.

3D Rendering Architecture
The editor uses a centralized, composable architecture for all Three.js operations to eliminate code duplication and ensure consistency:

Core utilities (resources/js/composables/ and resources/js/lib/):
- useThreeScene: Composable for Three.js scene, camera, renderer, and OrbitControls initialization. Handles animation loop, resize events, and automatic cleanup. ALWAYS use this for any new Three.js scene creation.
- usePanoramaLoader: Composable for loading 360° panoramic images with fade transitions. Handles texture loading, sphere mesh creation, and camera rotation application. Reuse this for all panorama loading needs.
- spatialMath: Utility for ALL 3D mathematical operations including:
  - Spherical ↔ Cartesian coordinate conversions
  - Camera rotation calculations (toward position, opposite position for bidirectional hotspots)
  - Vector operations (scaling, magnitude, normalization, inversion)
  - Position scaling for sprite placement inside sphere geometry
- spriteFactory: Factory for creating Three.js sprites with standardized appearance:
  - SpriteFactory.createHotspotSprite() - Creates hotspot markers (default white dots, custom colors, or custom images)
  - SpriteFactory.createStickerSprite() - Creates sticker sprites (emoji or text with optional backgrounds)
  - SpriteFactory.positionSprite() - Positions sprites with correct scaling for inside-sphere placement
  - SpriteManager class - Manages sprite lifecycle (add, remove, clear, memory cleanup)
- editorConstants: Centralized configuration for ALL magic numbers:
  - CAMERA: FOV, near/far planes, default distance (0.1)
  - SPHERE: Radius (500), segments, rings, scale factor
  - SPRITE: Position scale (0.95), hotspot/sticker base scales
  - CONTROLS: OrbitControls configuration
  - TRANSITION: Fade animation duration and step size
  - CANVAS: All canvas drawing dimensions for sprite textures
  - COLORS: Default colors for hotspots and stickers
  - TIMING: UI timing values (hover delays, dialog transitions)

CRITICAL: Never hardcode values like 500 (sphere radius), 0.95 (position scale), 0.1 (camera distance), or 100ms (timing). ALWAYS import and use the appropriate constant from editorConstants.

CRITICAL: Never duplicate 3D math calculations. All coordinate conversions, rotation calculations, and vector operations MUST use spatialMath utility functions.

CRITICAL: Never manually create Three.js scenes, cameras, or renderers. ALWAYS use useThreeScene composable which handles initialization, animation loops, resize events, and cleanup automatically.

Critical technical gotchas
- Three.js hotspot positioning: MUST multiply raycasted position by SPRITE.POSITION_SCALE (0.95) to place hotspots slightly inside sphere geometry - use spatialMath.scalePosition() or SpriteFactory.positionSprite()
- Laravel 11+: AuthorizesRequests trait removed from base Controller - manually add for policy authorization methods
- Three.js Sprites automatically face camera (billboarding behavior) - perfect for hotspot markers
- Spherical coordinate system: azimuthal (x/φ) is horizontal rotation, polar (y/θ) is vertical angle from +Y axis - use spatialMath conversion functions
- Camera rotation application: Use spatialMath.applyCameraRotation() or usePanoramaLoader's built-in rotation handling
- Bidirectional hotspots: Use spatialMath.calculateOppositePosition() to place return hotspot behind camera view

Development approach
- Component-first: Reusable Vue components with props-down/events-up pattern
- UI: Mobile-first responsive design using shadcn/vue components with Tailwind CSS and lucide-vue icons
- Database: UUID slug-based routing for all models with comprehensive Eloquent relationships
- API: Nested route structures with FormRequest validation and authorization policies
- 3D Rendering: Composable-based architecture using useThreeScene, usePanoramaLoader, spatialMath utilities, and spriteFactory for ALL Three.js operations
- Configuration: All magic numbers centralized in editorConstants - NEVER hardcode values

Data model hierarchy
The application follows a clear four-level hierarchy with UUID slug-based routing:
- Project (user-owned, can be public/private, has assigned collaborators with roles) → contains multiple Scenes
- Scene (organizational container for same physical location) → contains multiple Images + Hotspots
- Image (panoramic photo with 360° equirectangular format) → has hotspotsFrom (outgoing) and hotspotsTo (incoming)
- Hotspot (directional navigation link between two images with 3D position x/y/z and target camera rotation)
- Sticker (annotations/labels placed on images, separate from navigation hotspots)

Projects can define a start_image_id for the initial view when loading a tour. All models use UUID slugs for routing instead of numeric IDs. Cascade deletes are properly configured - deleting a project removes all scenes, images, hotspots, and associated files from storage.

Key component architecture
Editor components (resources/js/components/dashboard/editor/):
- EditorViewer: Root orchestrator managing all editor state, mode switching (view/edit), image navigation, and hotspot interactions. Single source of truth for currentImageIndex and mode. Handles props-down/events-up pattern with child components.
- EditorCanvas: Three.js rendering engine using useThreeScene and usePanoramaLoader composables. Handles panorama display, raycasting for 3D position detection, sprite rendering via SpriteFactory/SpriteManager, and click/hover event detection. Uses spatialMath for position scaling and editorConstants for all configuration values. Emits position selections and hotspot interactions upward.
- ImageThumbnailsPanel: Horizontal thumbnail strip for navigating between images in current project, shows all images across all scenes.
- HotspotTargetDialog: Modal for selecting target image when creating new hotspot after user clicks canvas position.
- HotspotOrientationDialog: Dialog with Three.js preview (using useThreeScene + usePanoramaLoader) for setting target camera rotation. Uses spatialMath.calculateOppositePosition() to compute bidirectional return hotspot placement.
- HotspotCustomizeDialog: Interface for customizing hotspot appearance (custom colors, images).
- HotspotsListPanel: Management panel showing all hotspots on current image in edit mode.
- HotspotPopover: Hover popover displaying target image thumbnail when user hovers over hotspot sprite.

Dashboard components (resources/js/components/dashboard/):
- SceneCard, CreateSceneCard: Scene management cards on project page
- SceneFormSheet: Sheet dialog for creating/editing scenes
- ImageCard, ImageListItem: Image display components with thumbnail/list views
- ImageDetailsSheet: Detailed image information and management panel

Common components (resources/js/components/common/):
- LoadingSpinner: Consistent loading state indicator
- EmptyState: Reusable empty state with icon and message

Layout components (resources/js/components/layout/):
- Sidebar: Main navigation sidebar with project context
- SidebarProjectContext: Project-specific navigation within sidebar
- UserMenu: User account dropdown menu

State management pattern
The application uses Vue 3 Composition API with a props-down/events-up architecture. EditorViewer maintains the single source of truth for editor state (currentImageIndex, mode, pending hotspot data). State flows down to child components via props, and user interactions flow up via emitted events. No Pinia/Vuex store is used - component-local reactive refs and computed properties manage state. The owl-sdk handles API communication with automatic auth token management.

API endpoint structure
All routes use slug-based routing (e.g., /projects/{project:slug}). Authorization policies verify ownership/collaboration access on every request. All API calls must go through owl-sdk which handles authentication, error handling, and request formatting.

Core endpoints:
- GET /projects - List user's projects
- POST /projects - Create new project
- GET /projects/{slug} - Get project with nested scenes.images.hotspotsFrom relationships
- PUT /projects/{slug} - Update project details
- DELETE /projects/{slug} - Delete project (cascades to scenes/images/hotspots)
- POST /projects/{slug}/make-public - Toggle project public visibility
- GET /projects/{slug}/images - Get all images across all scenes in project

Scene endpoints (nested under projects):
- GET /projects/{slug}/scenes - List project scenes
- POST /projects/{slug}/scenes - Create scene in project
- GET /scenes/{slug} - Get scene with images and hotspots
- PUT /scenes/{slug} - Update scene
- DELETE /scenes/{slug} - Delete scene

Image endpoints (nested under scenes):
- GET /scenes/{slug}/images - List scene images
- POST /scenes/{slug}/images - Upload panoramic image to scene
- GET /images/{slug} - Get image with hotspotsFrom and hotspotsTo
- POST /images/{slug} - Update image (uses POST for multipart file uploads)
- DELETE /images/{slug} - Delete image and file from storage
- GET /images/{slug}/download - Download original image file

Hotspot endpoints (nested under scenes):
- GET /scenes/{slug}/hotspots - List scene hotspots
- POST /scenes/{slug}/hotspots - Create hotspot with {from_image_id, to_image_id, position_x, position_y, position_z, target_rotation_x, target_rotation_y, target_rotation_z}
- GET /hotspots/{slug} - Get hotspot details
- PUT /hotspots/{slug} - Update hotspot position or target rotation
- DELETE /hotspots/{slug} - Delete hotspot

Sticker endpoints (nested under images):
- GET /images/{slug}/stickers - List image stickers
- POST /images/{slug}/stickers - Create sticker annotation
- GET /stickers/{slug} - Get sticker details
- PUT /stickers/{slug} - Update sticker
- DELETE /stickers/{slug} - Delete sticker

Common user flows
Creating a hotspot:
1. User enters edit mode in EditorViewer (mode.value = 'edit')
2. User clicks canvas → EditorCanvas raycaster detects 3D intersection point on sphere geometry
3. EditorCanvas scales position using SPRITE.POSITION_SCALE constant and emits 'hotspot-position-selected' event with {x, y, z} coordinates
4. EditorViewer stores position in pendingHotspotPosition and opens HotspotTargetDialog
5. User selects target image from dialog → HotspotOrientationDialog opens
6. HotspotOrientationDialog initializes Three.js preview using useThreeScene + usePanoramaLoader
7. User sets camera rotation → Dialog uses spatialMath.calculateOppositePosition() to compute bidirectional return position
8. User customizes hotspot appearance (optional) via HotspotCustomizeDialog
9. POST to /scenes/{slug}/hotspots via owl-sdk with position, rotation, and customization
10. Response received → EditorViewer updates currentImage.hotspotsFrom
11. EditorCanvas watches hotspotsFrom and creates new Sprite using SpriteFactory.createHotspotSprite() and SpriteFactory.positionSprite()
12. If bidirectional, return hotspot automatically created using spatialMath.calculateReturnRotation()

Navigating through hotspot:
1. User in view mode hovers over hotspot sprite → EditorCanvas detects hover via raycaster
2. EditorCanvas emits 'hotspot-hover' with hotspot data and screen position
3. EditorViewer shows HotspotPopover with target image thumbnail
4. User clicks hotspot → EditorCanvas emits 'hotspot-click'
5. EditorViewer finds target image index, calls editorCanvasRef.loadPanorama() with optional target rotation
6. EditorCanvas uses usePanoramaLoader to fade out current texture, load new texture, fade in (with spatialMath.applyCameraRotation if rotation provided)
7. SpriteManager clears old sprites, SpriteFactory creates new sprites for the loaded image
8. EditorViewer updates currentImageIndex to new image

File structure reference
```
app/
├── Http/Controllers/          # API controllers with authorization
│   ├── ProjectController.php  # Project CRUD
│   ├── SceneController.php    # Scene CRUD
│   ├── ImageController.php    # Image upload/management
│   ├── HotspotController.php  # Hotspot CRUD
│   └── StickerController.php  # Sticker CRUD
├── Models/                    # Eloquent models with UUID slugs
│   ├── Project.php            # User projects with scenes relationship
│   ├── Scene.php              # Organizational containers with images
│   ├── Image.php              # Panoramic photos with hotspots
│   ├── Hotspot.php            # Navigation links with 3D position
│   └── Sticker.php            # Image annotations
└── Policies/                  # Authorization policies for all models

resources/js/
├── pages/
│   ├── gallery/Show.vue       # Public gallery viewer
│   └── dashboard/             # Authenticated dashboard pages
├── components/
│   ├── dashboard/editor/      # All editor UI components
│   ├── dashboard/scene/       # Scene management components
│   ├── dashboard/settings/    # User settings components
│   ├── layout/                # Sidebar and navigation
│   ├── common/                # Reusable LoadingSpinner, EmptyState
│   └── ui/                    # shadcn/vue component library
├── composables/               # Vue 3 composables
│   ├── useThreeScene.js       # Three.js scene/camera/renderer initialization (ALWAYS use this)
│   ├── usePanoramaLoader.js   # Panorama loading with transitions (reuse for all 360° loading)
│   └── useTheme.js            # Dark mode theme management
├── lib/                       # Pure utility functions
│   ├── spatialMath.js         # ALL 3D math operations (coordinate conversions, rotations, vectors)
│   ├── spriteFactory.js       # Sprite creation (SpriteFactory + SpriteManager classes)
│   ├── editorConstants.js     # Centralized constants (NEVER hardcode these values)
│   └── utils.ts               # General utilities
├── owl-sdk.js                 # API client (all API calls MUST use this)
└── app.js                     # Inertia app bootstrap

routes/
├── web.php                    # Inertia pages + auth routes
└── api.php                    # (currently empty - all routes in web.php)
```

3D Development Best Practices
When working with Three.js and 3D features, follow these patterns:

Creating a new Three.js scene:
```javascript
import { useThreeScene } from '@/composables/useThreeScene.js'
import { CAMERA, CONTROLS } from '@/lib/editorConstants.js'

const containerRef = ref(null)
const { threeScene, camera, controls, init } = useThreeScene(containerRef, {
    // All options are optional - defaults come from editorConstants
    onReady: () => console.log('Scene ready')
})

onMounted(() => {
    init() // Automatically handles animation loop, resize, cleanup
})
```

Loading a panorama:
```javascript
import { usePanoramaLoader } from '@/composables/usePanoramaLoader.js'
import { applyCameraRotation } from '@/lib/spatialMath.js'

const { loadPanorama } = usePanoramaLoader(threeScene, textureLoader)

// Load with optional rotation and transition
await loadPanorama('/path/to/image.jpg', true, rotation, controls.value)
```

Creating and positioning sprites:
```javascript
import { SpriteFactory, SpriteManager } from '@/lib/spriteFactory.js'
import { SPRITE } from '@/lib/editorConstants.js'

const manager = new SpriteManager(threeScene.value)

// Create hotspot sprite
const sprite = SpriteFactory.createHotspotSprite(hotspot)
SpriteFactory.positionSprite(sprite, { x, y, z }, SPRITE.POSITION_SCALE)
manager.add(sprite, { hotspot })

// Cleanup when done
manager.clear() // Properly disposes all sprites
```

Performing 3D math calculations:
```javascript
import {
    sphericalToCartesian,
    calculateOppositePosition,
    calculateReturnRotation,
    scalePosition
} from '@/lib/spatialMath.js'
import { SPHERE, SPRITE } from '@/lib/editorConstants.js'

// Convert coordinates
const position = sphericalToCartesian(SPHERE.RADIUS, azimuthal, polar)

// Calculate bidirectional hotspot positions
const oppositePos = calculateOppositePosition(rotation, SPHERE.RADIUS, SPRITE.POSITION_SCALE)
const returnRot = calculateReturnRotation(hotspotPosition)

// Scale positions for inside-sphere placement
const scaledPos = scalePosition(rawPosition, SPRITE.POSITION_SCALE)
```

Using constants instead of magic numbers:
```javascript
import { SPRITE, TIMING, SPHERE, CAMERA } from '@/lib/editorConstants.js'

// ❌ NEVER do this:
point.multiplyScalar(0.95)
setTimeout(callback, 100)
const radius = 500

// ✅ ALWAYS do this:
point.multiplyScalar(SPRITE.POSITION_SCALE)
setTimeout(callback, TIMING.DIALOG_TRANSITION_DELAY_MS)
const radius = SPHERE.RADIUS
```

Development workflow
Build commands:
- npm run dev - Start Vite dev server with HMR
- npm run build - Production build
- php artisan serve - Start Laravel dev server
- php artisan scribe:generate - Regenerate API documentation at /docs

Test data:
- Manual testing via web application (no automated seeders)
- Upload equirectangular panoramic images (360° photos)
- Typical workflow: Create project → Create scene → Upload images → Add hotspots in editor
