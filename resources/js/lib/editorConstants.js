/**
 * Editor Constants
 * Centralized constants for the 360° panorama editor
 */

// Three.js Scene Configuration
export const SCENE = {
    BACKGROUND_COLOR: 0x000000,
}

// Camera Configuration
export const CAMERA = {
    FOV: 75,
    NEAR: 0.01,
    FAR: 1500,
    DISTANCE: 0.1, // Default camera distance from origin
}

// Sphere Geometry (Panorama Container)
export const SPHERE = {
    RADIUS: 500,
    SEGMENTS: 60,
    RINGS: 40,
    SCALE_INVERT: -1, // Scale X by -1 to invert sphere for inside viewing
}

// Sprite Positioning
export const SPRITE = {
    POSITION_SCALE: 0.95, // Scale factor to position sprites inside sphere surface
    HOTSPOT_SCALE: [0.05, 0.05, 1], // Default hotspot sprite scale [x, y, z]
    STICKER_BASE_SCALE: 0.1, // Base scale for sticker sprites (multiplied by sticker.scale)
}

// OrbitControls Configuration
export const CONTROLS = {
    ENABLE_DAMPING: false,
    DAMPING_FACTOR: 0.05,
    ENABLE_ZOOM: false, // Zoom handled via FOV, not OrbitControls distance
    ENABLE_PAN: false,
    ROTATE_SPEED: -0.5,
}

// Transition Effects
export const TRANSITION = {
    DURATION_MS: 16, // Milliseconds per animation frame
    FADE_STEP: 0.05, // Opacity change per frame (0.05 = 20 frames for full fade)
}

// Canvas Drawing (for sprite textures)
export const CANVAS = {
    // Hotspot canvas sizes
    HOTSPOT_SIZE: 64,
    HOTSPOT_CUSTOM_RADIUS: 28,
    HOTSPOT_CUSTOM_BORDER_WIDTH: 4,
    HOTSPOT_DEFAULT_RADIUS: 24,
    HOTSPOT_DEFAULT_BORDER_WIDTH: 2,

    // Sticker canvas sizes
    STICKER_EMOJI_SIZE: 128,
    STICKER_EMOJI_FONT_SIZE: 80,
    STICKER_TEXT_PADDING: 20,
    STICKER_TEXT_DEFAULT_FONT_SIZE: 48,
    STICKER_TEXT_DEFAULT_FONT_FAMILY: 'Arial',
}

// Colors
export const COLORS = {
    HOTSPOT_DEFAULT_FILL: '#ffffff',
    HOTSPOT_DEFAULT_BORDER: '#000000',
    HOTSPOT_CUSTOM_BORDER: '#ffffff',
    STICKER_TEXT_DEFAULT: '#ffffff',
}

// Timing
export const TIMING = {
    HOVER_HIDE_DELAY_MS: 100, // Delay before hiding hotspot hover popover
    DIALOG_TRANSITION_DELAY_MS: 100, // Delay between closing/opening sequential dialogs
    DRAG_FINISH_DELAY_MS: 500, // Delay after drag before re-enabling hover
}

// Interaction
export const INTERACTION = {
    HOVER_SCALE: 1.15, // Scale multiplier when hovering over sprite
    SELECTED_SCALE: 1.25, // Scale multiplier when sprite is selected
    DRAG_THRESHOLD_PX: 5, // Minimum pixels to move before drag starts
    HOVER_DISTANCE_PX: 40, // Max screen-space distance to maintain hover (leave threshold)
    HOVER_ENTER_DISTANCE_PX: 25, // Max screen-space distance to enter hover (enter threshold)
    PINCH_ZOOM_SPEED: 0.5, // FOV degrees per pixel of pinch distance change
}

// Zoom (FOV-based — camera stays at origin, field of view narrows/widens)
export const ZOOM = {
    MIN_FOV: 20, // Max zoom in (narrow FOV)
    MAX_FOV: 150, // Max zoom out (wide FOV)
    DEFAULT_FOV: 75, // Default field of view (matches CAMERA.FOV)
    WHEEL_STEP: 3, // Degrees per scroll tick
    BUTTON_STEP: 10, // Degrees per button click
}

export const PRELOAD = {
    MAX_CONCURRENT: 1, // Max simultaneous background preloads
}

// Blur Regions
export const BLUR = {
    DEFAULT_RADIUS: 0.05,        // Angular radius in radians (~3 degrees)
    MIN_RADIUS: 0.01,            // Minimum blur region radius
    MAX_RADIUS: 0.5,             // Maximum blur region radius
    DEFAULT_INTENSITY: 10,       // Default gaussian blur px
    MIN_INTENSITY: 1,
    MAX_INTENSITY: 50,
    INDICATOR_COLOR: '#ff4444',  // Color of blur region boundary in edit mode
    INDICATOR_OPACITY: 0.3,      // Opacity of blur region indicator
    INDICATOR_SIZE: 128,         // Canvas size for indicator sprite
    INDICATOR_SCALE: 0.06,       // Base scale for indicator sprite
    PIXELATE_BLOCK_SIZE: 0.005,  // UV block size for pixelation effect
}

export const UPLOAD = {
    CHUNK_SIZE: 10 * 1024 * 1024,        // 10MB per chunk
    CHUNKED_THRESHOLD: 50 * 1024 * 1024, // Use multipart above 50MB
    MAX_FILE_SIZE: 500 * 1024 * 1024,    // 500MB max
    MAX_RETRIES: 3,                       // Retry failed chunks
    MAX_CONCURRENT: 3,                    // Concurrent uploads
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
}

// Export a convenience object with all constants
export default {
    SCENE,
    CAMERA,
    SPHERE,
    SPRITE,
    CONTROLS,
    TRANSITION,
    CANVAS,
    COLORS,
    TIMING,
    INTERACTION,
    ZOOM,
    BLUR,
    UPLOAD,
}
