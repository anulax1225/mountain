import { shallowRef, watch } from 'vue'
import { SpriteFactory, SpriteManager } from '@/lib/spriteFactory.js'

/**
 * Composable for managing sprite display (hotspots, stickers, blur indicators) in the 360° editor
 *
 * @param {import('vue').Ref} sceneRef - Three.js scene ref
 * @param {object} interaction - Editor interaction composable instance
 */
export function useSpriteDisplay(sceneRef, interaction) {
    const hotspotManager = shallowRef(null)
    const stickerManager = shallowRef(null)
    const blurRegionManager = shallowRef(null)

    /**
     * Initialize sprite managers (call after scene is ready)
     */
    const init = (scene) => {
        hotspotManager.value = new SpriteManager(scene)
        stickerManager.value = new SpriteManager(scene)
        blurRegionManager.value = new SpriteManager(scene)
    }

    /**
     * Apply interaction scales to all sprites
     */
    const applyInteractionScales = () => {
        if (hotspotManager.value) {
            interaction.applyAllScales(hotspotManager.value, 'hotspot')
        }
        if (stickerManager.value) {
            interaction.applyAllScales(stickerManager.value, 'sticker')
        }
        if (blurRegionManager.value) {
            interaction.applyAllScales(blurRegionManager.value, 'blurRegion')
        }
    }

    /**
     * Display hotspot sprites from data
     * @param {Array} hotspots - Array of hotspot objects
     */
    const displayHotspots = (hotspots) => {
        if (!hotspotManager.value) return

        hotspotManager.value.clear()

        hotspots.forEach(hotspot => {
            const sprite = SpriteFactory.createHotspotSprite(hotspot)
            SpriteFactory.positionSprite(sprite, {
                x: hotspot.position_x,
                y: hotspot.position_y,
                z: hotspot.position_z
            })

            hotspotManager.value.add(sprite, { hotspot })
        })

        applyInteractionScales()
    }

    /**
     * Display sticker sprites from data
     * @param {Array} stickers - Array of sticker objects
     */
    const displayStickers = (stickers) => {
        if (!stickerManager.value) return

        stickerManager.value.clear()

        stickers.forEach(sticker => {
            const sprite = SpriteFactory.createStickerSprite(sticker)
            SpriteFactory.positionSprite(sprite, {
                x: sticker.position_x,
                y: sticker.position_y,
                z: sticker.position_z
            })

            stickerManager.value.add(sprite, { sticker })
        })

        applyInteractionScales()
    }

    /**
     * Display blur region indicator sprites from data (edit mode only)
     * @param {Array} blurRegions - Array of blur region objects
     */
    const displayBlurRegions = (blurRegions) => {
        if (!blurRegionManager.value) return

        blurRegionManager.value.clear()

        blurRegions.forEach(blurRegion => {
            const sprite = SpriteFactory.createBlurIndicatorSprite(blurRegion)
            SpriteFactory.positionSprite(sprite, {
                x: blurRegion.position_x,
                y: blurRegion.position_y,
                z: blurRegion.position_z
            })

            blurRegionManager.value.add(sprite, { blurRegion })
        })

        applyInteractionScales()
    }

    /**
     * Show/hide blur region indicators based on editor mode
     * @param {boolean} visible - Whether indicators should be visible
     */
    const setBlurIndicatorsVisible = (visible) => {
        if (!blurRegionManager.value) return
        blurRegionManager.value.getAll().forEach(sprite => {
            sprite.visible = visible
        })
    }

    /**
     * Clear all sprites
     */
    const clearAll = () => {
        if (hotspotManager.value) hotspotManager.value.clear()
        if (stickerManager.value) stickerManager.value.clear()
        if (blurRegionManager.value) blurRegionManager.value.clear()
    }

    // Watch interaction state changes to apply scales
    watch(
        [interaction.hoveredHotspotSlug, interaction.hoveredStickerSlug, interaction.selectedStickerSlug],
        () => {
            applyInteractionScales()
        }
    )

    return {
        hotspotManager,
        stickerManager,
        blurRegionManager,
        init,
        displayHotspots,
        displayStickers,
        displayBlurRegions,
        setBlurIndicatorsVisible,
        clearAll,
        applyInteractionScales,
    }
}
