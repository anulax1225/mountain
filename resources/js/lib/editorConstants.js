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
    NEAR: 0.1,
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
    ENABLE_DAMPING: true,
    DAMPING_FACTOR: 0.05,
    ENABLE_ZOOM: true,
    ENABLE_PAN: false,
    ROTATE_SPEED: -0.5,
    MIN_DISTANCE: 1,
    MAX_DISTANCE: 100,
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
}
