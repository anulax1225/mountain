import * as THREE from 'three'
import { CANVAS, COLORS, SPRITE } from './editorConstants.js'

/**
 * Canvas drawing utilities for creating sprite textures
 */
const CanvasDrawer = {
    /**
     * Draw a circle on a canvas
     */
    drawCircle(ctx, x, y, radius, fillStyle, strokeStyle = null, lineWidth = 0) {
        ctx.fillStyle = fillStyle
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()

        if (strokeStyle && lineWidth > 0) {
            ctx.strokeStyle = strokeStyle
            ctx.lineWidth = lineWidth
            ctx.beginPath()
            ctx.arc(x, y, radius, 0, Math.PI * 2)
            ctx.stroke()
        }
    },

    /**
     * Draw emoji on a canvas
     */
    drawEmoji(ctx, emoji, x, y, fontSize = CANVAS.STICKER_EMOJI_FONT_SIZE) {
        ctx.font = `${fontSize}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(emoji, x, y)
    },

    /**
     * Draw text with optional background on a canvas
     */
    drawText(ctx, text, options = {}) {
        const {
            x,
            y,
            fontSize = CANVAS.STICKER_TEXT_DEFAULT_FONT_SIZE,
            fontFamily = CANVAS.STICKER_TEXT_DEFAULT_FONT_FAMILY,
            color = COLORS.STICKER_TEXT_DEFAULT,
            backgroundColor = null,
            canvasWidth,
            canvasHeight
        } = options

        // Draw background if provided
        if (backgroundColor) {
            ctx.fillStyle = backgroundColor
            ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        }

        // Draw text
        ctx.font = `${fontSize}px ${fontFamily}`
        ctx.fillStyle = color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(text, x, y)
    },

    /**
     * Measure text dimensions
     */
    measureText(text, fontSize = CANVAS.STICKER_TEXT_DEFAULT_FONT_SIZE, fontFamily = CANVAS.STICKER_TEXT_DEFAULT_FONT_FAMILY) {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        ctx.font = `${fontSize}px ${fontFamily}`
        const metrics = ctx.measureText(text)
        return {
            width: metrics.width,
            height: fontSize
        }
    }
}

/**
 * Sprite Factory - Creates Three.js sprites from canvas textures
 */
export const SpriteFactory = {
    /**
     * Create a hotspot sprite
     * @param {Object} hotspot - Hotspot data with optional custom_color or custom_image
     * @param {Object} options - Sprite options { scale: [x, y, z] }
     * @returns {THREE.Sprite}
     */
    createHotspotSprite(hotspot, options = {}) {
        const { scale = SPRITE.HOTSPOT_SCALE } = options
        let material

        // Custom image hotspot
        if (hotspot.custom_image) {
            const texture = new THREE.TextureLoader().load(`/hotspot-icons/${hotspot.custom_image}`)
            material = new THREE.SpriteMaterial({
                map: texture,
                sizeAttenuation: false
            })
        }
        // Custom color hotspot
        else if (hotspot.custom_color) {
            const canvas = document.createElement('canvas')
            canvas.width = CANVAS.HOTSPOT_SIZE
            canvas.height = CANVAS.HOTSPOT_SIZE
            const ctx = canvas.getContext('2d')

            // Draw colored circle with white border
            const center = CANVAS.HOTSPOT_SIZE / 2
            CanvasDrawer.drawCircle(
                ctx,
                center,
                center,
                CANVAS.HOTSPOT_CUSTOM_RADIUS,
                hotspot.custom_color,
                COLORS.HOTSPOT_CUSTOM_BORDER,
                CANVAS.HOTSPOT_CUSTOM_BORDER_WIDTH
            )

            const texture = new THREE.CanvasTexture(canvas)
            material = new THREE.SpriteMaterial({
                map: texture,
                sizeAttenuation: false
            })
        }
        // Default white dot hotspot
        else {
            const canvas = document.createElement('canvas')
            canvas.width = CANVAS.HOTSPOT_SIZE
            canvas.height = CANVAS.HOTSPOT_SIZE
            const ctx = canvas.getContext('2d')

            // Draw white circle with black border
            const center = CANVAS.HOTSPOT_SIZE / 2
            CanvasDrawer.drawCircle(
                ctx,
                center,
                center,
                CANVAS.HOTSPOT_DEFAULT_RADIUS,
                COLORS.HOTSPOT_DEFAULT_FILL,
                COLORS.HOTSPOT_DEFAULT_BORDER,
                CANVAS.HOTSPOT_DEFAULT_BORDER_WIDTH
            )

            const texture = new THREE.CanvasTexture(canvas)
            material = new THREE.SpriteMaterial({
                map: texture,
                sizeAttenuation: false
            })
        }

        const sprite = new THREE.Sprite(material)
        sprite.scale.set(...scale)

        return sprite
    },

    /**
     * Create a sticker sprite (emoji or text)
     * @param {Object} sticker - Sticker data { type, content, scale, font_size, font_family, color, background_color }
     * @param {Object} options - Sprite options
     * @returns {THREE.Sprite}
     */
    createStickerSprite(sticker, options = {}) {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (sticker.type === 'emoji') {
            // Emoji sticker
            canvas.width = CANVAS.STICKER_EMOJI_SIZE
            canvas.height = CANVAS.STICKER_EMOJI_SIZE

            const center = CANVAS.STICKER_EMOJI_SIZE / 2
            CanvasDrawer.drawEmoji(ctx, sticker.content, center, center, CANVAS.STICKER_EMOJI_FONT_SIZE)
        } else if (sticker.type === 'text') {
            // Text sticker - measure text first to size canvas
            const fontSize = sticker.font_size || CANVAS.STICKER_TEXT_DEFAULT_FONT_SIZE
            const fontFamily = sticker.font_family || CANVAS.STICKER_TEXT_DEFAULT_FONT_FAMILY
            const padding = CANVAS.STICKER_TEXT_PADDING

            const dimensions = CanvasDrawer.measureText(sticker.content, fontSize, fontFamily)
            canvas.width = dimensions.width + padding * 2
            canvas.height = fontSize + padding * 2

            CanvasDrawer.drawText(ctx, sticker.content, {
                x: canvas.width / 2,
                y: canvas.height / 2,
                fontSize,
                fontFamily,
                color: sticker.color || COLORS.STICKER_TEXT_DEFAULT,
                backgroundColor: sticker.background_color || null,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height
            })
        }

        const texture = new THREE.CanvasTexture(canvas)
        const material = new THREE.SpriteMaterial({
            map: texture,
            sizeAttenuation: false
        })

        const sprite = new THREE.Sprite(material)
        const scale = sticker.scale || 1.0
        sprite.scale.set(SPRITE.STICKER_BASE_SCALE * scale, SPRITE.STICKER_BASE_SCALE * scale, 1)

        return sprite
    },

    /**
     * Position a sprite at a 3D location (with optional scaling for inside sphere placement)
     * @param {THREE.Sprite} sprite - The sprite to position
     * @param {Object} position - Position {x, y, z}
     * @param {number} scale - Scale factor (default SPRITE.POSITION_SCALE for inside sphere)
     */
    positionSprite(sprite, position, scale = SPRITE.POSITION_SCALE) {
        const pos = new THREE.Vector3(position.x, position.y, position.z)
        pos.multiplyScalar(scale)
        sprite.position.copy(pos)
    }
}

/**
 * Sprite Manager - Manages collections of sprites in a scene
 */
export class SpriteManager {
    constructor(scene) {
        this.scene = scene
        this.sprites = []
    }

    /**
     * Add a sprite to the scene and track it
     */
    add(sprite, userData = {}) {
        sprite.userData = { ...sprite.userData, ...userData }
        this.scene.add(sprite)
        this.sprites.push(sprite)
        return sprite
    }

    /**
     * Remove and dispose all sprites
     */
    clear() {
        this.sprites.forEach(sprite => {
            this.scene.remove(sprite)
            sprite.material?.map?.dispose()
            sprite.material?.dispose()
        })
        this.sprites = []
    }

    /**
     * Get all sprites
     */
    getAll() {
        return this.sprites
    }

    /**
     * Find a sprite by user data property
     */
    find(predicate) {
        return this.sprites.find(sprite => predicate(sprite.userData))
    }

    /**
     * Remove a specific sprite
     */
    remove(sprite) {
        const index = this.sprites.indexOf(sprite)
        if (index > -1) {
            this.scene.remove(sprite)
            sprite.material?.map?.dispose()
            sprite.material?.dispose()
            this.sprites.splice(index, 1)
        }
    }
}
