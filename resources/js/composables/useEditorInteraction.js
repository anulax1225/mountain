import { ref, computed, provide, inject } from 'vue'

const EDITOR_INTERACTION_KEY = Symbol('editor-interaction')

/**
 * Composable for managing sprite interaction state in the 360° editor
 *
 * Key principles:
 * 1. Track by slug (string), not sprite object reference
 * 2. Store base scales and compute display scale idempotently
 * 3. Calculate screen positions on-demand (not cached)
 * 4. Single source of truth for all interaction state
 */
export function useEditorInteraction() {
    // Interaction state tracked by slug (not object reference)
    const hoveredHotspotSlug = ref(null)
    const hoveredStickerSlug = ref(null)
    const selectedStickerSlug = ref(null)
    const draggedSpriteSlug = ref(null)
    const draggedSpriteType = ref(null) // 'hotspot' | 'sticker'

    // Popover state
    const activePopover = ref(null) // { type: 'hotspot' | 'sticker', slug: string }

    // Hotspot hover position (screen coordinates for popover placement)
    const hotspotHoverPosition = ref(null)

    // Whether the popover itself is being hovered (prevents closing on mouse leave)
    const isPopoverHovered = ref(false)

    // Scale multipliers - idempotent values for computing display scale
    const HOVER_SCALE = 1.15
    const SELECTED_SCALE = 1.25

    /**
     * Get the display scale multiplier for a sprite
     * This is IDEMPOTENT - calling it multiple times returns same value
     * @param {string} type - 'hotspot' or 'sticker'
     * @param {string} slug - The sprite's slug identifier
     * @returns {number} The scale multiplier to apply
     */
    const getScaleMultiplier = (type, slug) => {
        let multiplier = 1.0

        if (type === 'sticker') {
            if (slug === selectedStickerSlug.value) {
                multiplier = SELECTED_SCALE
            } else if (slug === hoveredStickerSlug.value) {
                multiplier = HOVER_SCALE
            }
        } else if (type === 'hotspot') {
            if (slug === hoveredHotspotSlug.value) {
                multiplier = HOVER_SCALE
            }
        }

        return multiplier
    }

    /**
     * Apply correct scale to a sprite based on current interaction state
     * Safe to call multiple times - uses stored baseScale from userData
     * @param {THREE.Sprite} sprite - The sprite to scale
     * @param {string} type - 'hotspot' or 'sticker'
     */
    const applyScale = (sprite, type) => {
        if (!sprite || !sprite.userData) return

        const slug = type === 'sticker'
            ? sprite.userData.sticker?.slug
            : sprite.userData.hotspot?.slug

        if (!slug) return

        // Use stored base scale (should be set during sprite creation)
        const baseScale = sprite.userData.baseScale
        if (!baseScale) {
            // Fallback: store current scale as base if not already stored
            sprite.userData.baseScale = sprite.scale.clone()
            return
        }

        const multiplier = getScaleMultiplier(type, slug)

        sprite.scale.set(
            baseScale.x * multiplier,
            baseScale.y * multiplier,
            baseScale.z * multiplier
        )
    }

    /**
     * Apply scales to all sprites in a manager
     * @param {SpriteManager} manager - The sprite manager
     * @param {string} type - 'hotspot' or 'sticker'
     */
    const applyAllScales = (manager, type) => {
        if (!manager) return
        manager.getAll().forEach(sprite => applyScale(sprite, type))
    }

    /**
     * Calculate screen position for a sprite (fresh calculation, not cached)
     * @param {THREE.Sprite} sprite - The sprite
     * @param {THREE.Camera} camera - The Three.js camera
     * @param {HTMLElement} container - The container element
     * @returns {{ x: number, y: number } | null}
     */
    const getScreenPosition = (sprite, camera, container) => {
        if (!sprite || !camera || !container) return null

        const position = sprite.position.clone()
        position.project(camera)

        const rect = container.getBoundingClientRect()
        return {
            x: (position.x * 0.5 + 0.5) * rect.width,
            y: (position.y * -0.5 + 0.5) * rect.height
        }
    }

    /**
     * Find a sprite by slug in a manager
     * @param {SpriteManager} manager - The sprite manager
     * @param {string} type - 'hotspot' or 'sticker'
     * @param {string} slug - The slug to find
     * @returns {THREE.Sprite | undefined}
     */
    const findSpriteBySlug = (manager, type, slug) => {
        if (!manager || !slug) return undefined
        return manager.find(userData => {
            const spriteSlug = type === 'sticker'
                ? userData.sticker?.slug
                : userData.hotspot?.slug
            return spriteSlug === slug
        })
    }

    // State setters
    const setHoveredHotspot = (slug) => {
        hoveredHotspotSlug.value = slug
    }

    const setHoveredSticker = (slug) => {
        hoveredStickerSlug.value = slug
    }

    const setSelectedSticker = (slug) => {
        selectedStickerSlug.value = slug
    }

    const setDraggedSprite = (slug, type) => {
        draggedSpriteSlug.value = slug
        draggedSpriteType.value = type
    }

    /**
     * Clear all hover states (call on camera move)
     */
    const clearHoverStates = () => {
        hoveredHotspotSlug.value = null
        hoveredStickerSlug.value = null
        hotspotHoverPosition.value = null
        isPopoverHovered.value = false
    }

    /**
     * Clear all interaction states (call on mode change or image change)
     */
    const clearAllStates = () => {
        hoveredHotspotSlug.value = null
        hoveredStickerSlug.value = null
        selectedStickerSlug.value = null
        draggedSpriteSlug.value = null
        draggedSpriteType.value = null
        activePopover.value = null
        hotspotHoverPosition.value = null
        isPopoverHovered.value = false
    }

    /**
     * Open a popover for a sprite
     */
    const openPopover = (type, slug) => {
        activePopover.value = { type, slug }
    }

    const closePopover = () => {
        activePopover.value = null
    }

    /**
     * Set hovered hotspot with screen position (for popover placement)
     */
    const setHoveredHotspotWithPosition = (slug, position) => {
        hoveredHotspotSlug.value = slug
        hotspotHoverPosition.value = position
    }

    /**
     * Handle popover mouse enter (prevents hover state from clearing)
     */
    const handlePopoverMouseEnter = () => {
        isPopoverHovered.value = true
    }

    /**
     * Handle popover mouse leave (clears hover state)
     */
    const handlePopoverMouseLeave = () => {
        isPopoverHovered.value = false
        hoveredHotspotSlug.value = null
        hotspotHoverPosition.value = null
    }

    /**
     * Clear hotspot hover only if popover is not hovered
     */
    const clearHotspotHoverIfNotPopover = () => {
        if (!isPopoverHovered.value) {
            hoveredHotspotSlug.value = null
            hotspotHoverPosition.value = null
        }
    }

    // Computed helpers
    const isHotspotHovered = computed(() => hoveredHotspotSlug.value !== null)
    const isStickerHovered = computed(() => hoveredStickerSlug.value !== null)
    const isStickerSelected = computed(() => selectedStickerSlug.value !== null)
    const isDragging = computed(() => draggedSpriteSlug.value !== null)

    return {
        // State
        hoveredHotspotSlug,
        hoveredStickerSlug,
        selectedStickerSlug,
        draggedSpriteSlug,
        draggedSpriteType,
        activePopover,
        hotspotHoverPosition,
        isPopoverHovered,

        // Computed
        isHotspotHovered,
        isStickerHovered,
        isStickerSelected,
        isDragging,

        // Constants
        HOVER_SCALE,
        SELECTED_SCALE,

        // Scale helpers
        getScaleMultiplier,
        applyScale,
        applyAllScales,

        // Position helpers
        getScreenPosition,
        findSpriteBySlug,

        // State setters
        setHoveredHotspot,
        setHoveredSticker,
        setSelectedSticker,
        setDraggedSprite,
        setHoveredHotspotWithPosition,
        clearHoverStates,
        clearAllStates,
        clearHotspotHoverIfNotPopover,

        // Popover helpers
        openPopover,
        closePopover,
        handlePopoverMouseEnter,
        handlePopoverMouseLeave
    }
}

/**
 * Provide an editor interaction instance to descendant components
 * Call this in the top-level component (Editor.vue or EditorViewer.vue)
 */
export function provideEditorInteraction(instance = null) {
    const interaction = instance || useEditorInteraction()
    provide(EDITOR_INTERACTION_KEY, interaction)
    return interaction
}

/**
 * Inject the editor interaction instance from a parent component
 * Call this in child components (EditorCanvas.vue, etc.)
 */
export function useInjectedEditorInteraction() {
    const interaction = inject(EDITOR_INTERACTION_KEY)
    if (!interaction) {
        throw new Error('useInjectedEditorInteraction must be used within a component that calls provideEditorInteraction')
    }
    return interaction
}
