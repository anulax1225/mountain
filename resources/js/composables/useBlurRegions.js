import { watch, toValue } from 'vue'
import * as THREE from 'three'
import { cartesianToUV, angularRadiusToPixels } from '@/lib/spatialMath.js'
import { BLUR } from '@/lib/editorConstants.js'

/**
 * Composable for applying blur regions to the panorama texture
 *
 * Uses Canvas 2D pre-processing: draws the original image to an offscreen canvas,
 * applies circular blur regions using ctx.filter, then creates a CanvasTexture.
 * Re-renders only when blur regions change or the texture is swapped.
 *
 * @param {import('vue').Ref} currentMesh - Current panorama mesh ref
 * @param {import('vue').Ref|import('vue').ComputedRef} blurRegions - Reactive array of blur region data
 */
export function useBlurRegions(currentMesh, blurRegions) {

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

        const canvas = document.createElement('canvas')
        canvas.width = originalImage.width
        canvas.height = originalImage.height
        const ctx = canvas.getContext('2d')

        // Draw original image
        ctx.drawImage(originalImage, 0, 0)

        // Apply each blur region
        for (const region of regions) {
            const { u, v } = cartesianToUV({
                x: region.position_x,
                y: region.position_y,
                z: region.position_z,
            })

            const px = u * canvas.width
            const py = v * canvas.height
            const pr = angularRadiusToPixels(region.radius, canvas.height)

            if (region.type === 'pixelate') {
                applyPixelation(ctx, originalImage, px, py, pr, canvas.width, canvas.height)
            } else {
                applyGaussianBlur(ctx, originalImage, px, py, pr, region.intensity)
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
    }

    /**
     * Apply gaussian blur to a circular region
     */
    function applyGaussianBlur(ctx, image, px, py, pr, intensity) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(px, py, pr, 0, Math.PI * 2)
        ctx.clip()
        ctx.filter = `blur(${intensity}px)`
        ctx.drawImage(image, 0, 0)
        ctx.restore()
    }

    /**
     * Apply pixelation (mosaic) effect to a circular region
     */
    function applyPixelation(ctx, image, px, py, pr, canvasWidth, canvasHeight) {
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
