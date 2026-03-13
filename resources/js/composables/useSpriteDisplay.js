import { shallowRef, watch } from 'vue'
import { SpriteFactory, SpriteManager } from '@/lib/spriteFactory.js'

/**
 * Composable for managing sprite display (hotspots and stickers) in the 360° editor
 *
 * @param {import('vue').Ref} sceneRef - Three.js scene ref
 * @param {object} interaction - Editor interaction composable instance
 */
export function useSpriteDisplay(sceneRef, interaction) {
    const hotspotManager = shallowRef(null)
    const stickerManager = shallowRef(null)

    /**
     * Initialize sprite managers (call after scene is ready)
     */
    const init = (scene) => {
        hotspotManager.value = new SpriteManager(scene)
        stickerManager.value = new SpriteManager(scene)
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
     * Clear all sprites
     */
    const clearAll = () => {
        if (hotspotManager.value) hotspotManager.value.clear()
        if (stickerManager.value) stickerManager.value.clear()
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
        init,
        displayHotspots,
        displayStickers,
        clearAll,
        applyInteractionScales,
    }
}
