import { watch, toValue } from 'vue'
import * as THREE from 'three'
import { cartesianToUV, angularRadiusToPixels } from '@/lib/spatialMath.js'
import { BLUR } from '@/lib/editorConstants.js'

/**
 * Detect ctx.filter support once at module level.
 * Safari < 17.5 does not support CanvasRenderingContext2D.filter.
 */
const supportsCtxFilter = (() => {
    try {
        const c = document.createElement('canvas')
        c.width = 1
        c.height = 1
        const ctx = c.getContext('2d')
        return ctx && typeof ctx.filter === 'string'
    } catch {
        return false
    }
})()

/**
 * Composable for applying blur regions to the panorama texture
 *
 * Uses Canvas 2D pre-processing: draws the original image to an offscreen canvas,
 * applies circular blur regions using ctx.filter, then creates a CanvasTexture.
 * Re-renders only when blur regions change or the texture is swapped.
 *
 * Canvas dimensions are capped to mobile-safe limits to prevent tab crashes
 * on devices with restricted canvas memory budgets.
 *
 * @param {import('vue').Ref} currentMesh - Current panorama mesh ref
 * @param {import('vue').Ref|import('vue').ComputedRef} blurRegions - Reactive array of blur region data
 */
export function useBlurRegions(currentMesh, blurRegions) {
    // Reusable canvas elements to avoid repeated allocations
    let cachedCanvas = null
    let cachedCtx = null
    let cachedTempCanvas = null
    let cachedTempCtx = null

    function getCanvas(width, height) {
        if (!cachedCanvas) {
            cachedCanvas = document.createElement('canvas')
        }
        if (cachedCanvas.width !== width || cachedCanvas.height !== height) {
            cachedCanvas.width = width
            cachedCanvas.height = height
        }
        cachedCtx = cachedCanvas.getContext('2d')
        return { canvas: cachedCanvas, ctx: cachedCtx }
    }

    function getTempCanvas(width, height) {
        if (!cachedTempCanvas) {
            cachedTempCanvas = document.createElement('canvas')
        }
        if (cachedTempCanvas.width !== width || cachedTempCanvas.height !== height) {
            cachedTempCanvas.width = width
            cachedTempCanvas.height = height
        }
        cachedTempCtx = cachedTempCanvas.getContext('2d')
        return { canvas: cachedTempCanvas, ctx: cachedTempCtx }
    }

    /**
     * Compute mobile-safe canvas dimensions and scale factor
     */
    function computeCanvasDimensions(origWidth, origHeight) {
        let width = origWidth
        let height = origHeight
        let scale = 1

        if (width > BLUR.MAX_CANVAS_WIDTH) {
            scale = BLUR.MAX_CANVAS_WIDTH / width
            width = BLUR.MAX_CANVAS_WIDTH
            height = Math.round(origHeight * scale)
        }

        if (width * height > BLUR.MAX_CANVAS_PIXELS) {
            const pixelScale = Math.sqrt(BLUR.MAX_CANVAS_PIXELS / (width * height))
            scale *= pixelScale
            width = Math.round(width * pixelScale)
            height = Math.round(height * pixelScale)
        }

        return { width, height, scale }
    }

    /**
     * Apply blur regions to the mesh texture
     * Draws original image, then applies circular blur for each region
     */
    function applyBlurRegions() {
        const mesh = toValue(currentMesh)
        const regions = toValue(blurRegions)

        if (!mesh || !mesh.userData.originalImage) return

        const originalImage = mesh.userData.originalImage

        // No blur regions — restore original texture
        if (!regions || regions.length === 0) {
            const texture = new THREE.Texture(originalImage)
            texture.colorSpace = THREE.SRGBColorSpace
            texture.minFilter = THREE.LinearFilter
            texture.magFilter = THREE.LinearFilter
            texture.needsUpdate = true

            const oldTexture = mesh.material.map
            mesh.material.map = texture
            mesh.material.needsUpdate = true
            oldTexture?.dispose()
            return
        }

        try {
            const { width: canvasWidth, height: canvasHeight } = computeCanvasDimensions(
                originalImage.width,
                originalImage.height
            )

            const { canvas, ctx } = getCanvas(canvasWidth, canvasHeight)

            // Draw original image (downscaled if canvas is capped)
            ctx.drawImage(originalImage, 0, 0, canvasWidth, canvasHeight)

            // Apply each blur region
            for (const region of regions) {
                const { u, v } = cartesianToUV({
                    x: region.position_x,
                    y: region.position_y,
                    z: region.position_z,
                })

                const px = u * canvasWidth
                const py = v * canvasHeight
                const pr = angularRadiusToPixels(region.radius, canvasHeight)

                if (region.type === 'pixelate') {
                    applyPixelation(ctx, px, py, pr, canvasWidth, canvasHeight)
                } else {
                    applyGaussianBlur(ctx, px, py, pr, region.intensity)
                }
            }

            const newTexture = new THREE.CanvasTexture(canvas)
            newTexture.colorSpace = THREE.SRGBColorSpace
            newTexture.minFilter = THREE.LinearFilter
            newTexture.magFilter = THREE.LinearFilter

            const oldTexture = mesh.material.map
            mesh.material.map = newTexture
            mesh.material.needsUpdate = true
            oldTexture?.dispose()
        } catch (error) {
            console.error('[useBlurRegions] Failed to apply blur regions:', error)

            // Fallback: show original unblurred texture rather than crash
            try {
                const texture = new THREE.Texture(originalImage)
                texture.colorSpace = THREE.SRGBColorSpace
                texture.needsUpdate = true
                const old = mesh.material.map
                mesh.material.map = texture
                mesh.material.needsUpdate = true
                old?.dispose()
            } catch {
                // Last resort: do nothing
            }
        }
    }

    /**
     * Apply gaussian blur to a circular region
     *
     * Uses a temp canvas for the blur to avoid drawing the full-size image
     * through ctx.filter (browsers may silently drop very large filtered draws).
     * Falls back to downscale-upscale technique when ctx.filter is unsupported.
     */
    function applyGaussianBlur(ctx, px, py, pr, intensity) {
        const canvasW = ctx.canvas.width
        const canvasH = ctx.canvas.height

        // Expand region by blur intensity to capture blur sampling area
        const margin = intensity * 2
        const x1 = Math.max(0, Math.floor(px - pr - margin))
        const y1 = Math.max(0, Math.floor(py - pr - margin))
        const x2 = Math.min(canvasW, Math.ceil(px + pr + margin))
        const y2 = Math.min(canvasH, Math.ceil(py + pr + margin))
        const w = x2 - x1
        const h = y2 - y1
        if (w <= 0 || h <= 0) return

        const { canvas: tempCanvas, ctx: tempCtx } = getTempCanvas(w, h)

        if (supportsCtxFilter) {
            tempCtx.filter = `blur(${intensity}px)`
            tempCtx.drawImage(ctx.canvas, x1, y1, w, h, 0, 0, w, h)
            tempCtx.filter = 'none'
        } else {
            // Fallback: downscale then upscale (bilinear interpolation creates blur)
            const ds = BLUR.FALLBACK_BLUR_DOWNSCALE
            const smallW = Math.max(1, Math.round(w / ds))
            const smallH = Math.max(1, Math.round(h / ds))

            tempCtx.drawImage(ctx.canvas, x1, y1, w, h, 0, 0, smallW, smallH)
            tempCtx.drawImage(tempCanvas, 0, 0, smallW, smallH, 0, 0, w, h)
        }

        // Composite back onto main canvas with circular clip
        ctx.save()
        ctx.beginPath()
        ctx.arc(px, py, pr, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(tempCanvas, 0, 0, w, h, x1, y1, w, h)
        ctx.restore()
    }

    /**
     * Apply pixelation (mosaic) effect to a circular region
     */
    function applyPixelation(ctx, px, py, pr, canvasWidth, canvasHeight) {
        const blockSize = Math.max(4, Math.round(pr / 5))

        // Define the bounding box of the circular region
        const x1 = Math.max(0, Math.floor(px - pr))
        const y1 = Math.max(0, Math.floor(py - pr))
        const x2 = Math.min(canvasWidth, Math.ceil(px + pr))
        const y2 = Math.min(canvasHeight, Math.ceil(py + pr))

        // Get pixel data for the region
        const imageData = ctx.getImageData(x1, y1, x2 - x1, y2 - y1)
        const data = imageData.data
        const regionWidth = x2 - x1

        // Pixelate by averaging blocks within the circle
        for (let by = 0; by < y2 - y1; by += blockSize) {
            for (let bx = 0; bx < x2 - x1; bx += blockSize) {
                // Check if block center is within the circle
                const centerX = x1 + bx + blockSize / 2
                const centerY = y1 + by + blockSize / 2
                const dx = centerX - px
                const dy = centerY - py
                if (dx * dx + dy * dy > pr * pr) continue

                // Average the block
                let r = 0, g = 0, b = 0, count = 0
                const maxBY = Math.min(by + blockSize, y2 - y1)
                const maxBX = Math.min(bx + blockSize, x2 - x1)

                for (let iy = by; iy < maxBY; iy++) {
                    for (let ix = bx; ix < maxBX; ix++) {
                        const idx = (iy * regionWidth + ix) * 4
                        r += data[idx]
                        g += data[idx + 1]
                        b += data[idx + 2]
                        count++
                    }
                }

                r = Math.round(r / count)
                g = Math.round(g / count)
                b = Math.round(b / count)

                // Fill the block with the average color
                for (let iy = by; iy < maxBY; iy++) {
                    for (let ix = bx; ix < maxBX; ix++) {
                        const idx = (iy * regionWidth + ix) * 4
                        data[idx] = r
                        data[idx + 1] = g
                        data[idx + 2] = b
                    }
                }
            }
        }

        ctx.putImageData(imageData, x1, y1)
    }

    // Watch blur regions for changes and re-apply
    watch(
        () => toValue(blurRegions),
        () => applyBlurRegions(),
        { deep: true }
    )

    return {
        applyBlurRegions,
    }
}
