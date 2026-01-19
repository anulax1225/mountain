/**
 * Spatial Mathematics Utility
 * Handles 3D position, rotation, and spherical coordinate conversions
 * for the 360° panorama editor
 */

/**
 * Convert spherical coordinates to Cartesian coordinates
 * @param {number} radius - Distance from origin
 * @param {number} azimuthal - Azimuthal angle (φ) in radians (horizontal rotation around Y axis)
 * @param {number} polar - Polar angle (θ) in radians (vertical angle from +Y axis)
 * @returns {Object} Cartesian coordinates {x, y, z}
 */
export function sphericalToCartesian(radius, azimuthal, polar) {
    return {
        x: radius * Math.sin(polar) * Math.sin(azimuthal),
        y: radius * Math.cos(polar),
        z: radius * Math.sin(polar) * Math.cos(azimuthal)
    }
}

/**
 * Convert Cartesian coordinates to spherical coordinates
 * @param {Object} position - Cartesian position {x, y, z}
 * @returns {Object} Spherical coordinates {radius, azimuthal, polar}
 */
export function cartesianToSpherical(position) {
    const { x, y, z } = position

    // Calculate radius (distance from origin)
    const radius = Math.sqrt(x * x + y * y + z * z)

    // Calculate azimuthal angle (φ) - horizontal rotation around Y axis
    // atan2(x, z) gives the angle in the XZ plane
    const azimuthal = Math.atan2(x, z)

    // Calculate polar angle (θ) - vertical angle from +Y axis
    // acos(y / r) gives the angle from the positive Y axis
    const polar = Math.acos(y / radius)

    return {
        radius,
        azimuthal,
        polar
    }
}

/**
 * Calculate the camera rotation needed to look toward a position
 * Used for calculating return hotspot rotations
 * @param {Object} position - Target position {x, y, z}
 * @returns {Object} Rotation angles {x: azimuthal, y: polar, z: 0}
 */
export function calculateRotationTowardPosition(position) {
    const spherical = cartesianToSpherical(position)

    return {
        x: spherical.azimuthal,
        y: spherical.polar,
        z: 0
    }
}

/**
 * Calculate the opposite position on a sphere
 * Given a camera rotation, find where the return hotspot should be placed
 * (behind the camera, in the opposite direction)
 * @param {Object} rotation - Camera rotation {x: azimuthal, y: polar, z}
 * @param {number} sphereRadius - Radius of the sphere (default: 500)
 * @param {number} scale - Scale factor for inside placement (default: 0.95)
 * @returns {Object} Opposite position {x, y, z}
 */
export function calculateOppositePosition(rotation, sphereRadius = 500, scale = 0.95) {
    const radius = sphereRadius * scale
    const azimuthal = rotation.x
    const polar = rotation.y

    // Calculate the forward direction vector (where camera is looking)
    const forward = sphericalToCartesian(radius, azimuthal, polar)

    // Return the opposite position (invert all coordinates)
    return {
        x: -forward.x,
        y: -forward.y,
        z: -forward.z
    }
}

/**
 * Calculate return hotspot data for bidirectional navigation
 * Given the original hotspot position and forward rotation,
 * calculate the rotation for the return journey
 * @param {Object} hotspotPosition - Original hotspot position {x, y, z}
 * @param {Object} forwardRotation - Forward camera rotation (not used in current implementation)
 * @returns {Object} Return rotation {x: azimuthal, y: polar, z: 0}
 */
export function calculateReturnRotation(hotspotPosition, forwardRotation = null) {
    // Calculate spherical angles to look toward the hotspot position
    // This makes the return camera look toward where we came from
    return calculateRotationTowardPosition(hotspotPosition)
}

/**
 * Scale a position vector (commonly used for placing sprites inside sphere)
 * @param {Object} position - Position {x, y, z}
 * @param {number} scale - Scale factor (default: 0.95 for inside sphere placement)
 * @returns {Object} Scaled position {x, y, z}
 */
export function scalePosition(position, scale = 0.95) {
    return {
        x: position.x * scale,
        y: position.y * scale,
        z: position.z * scale
    }
}

/**
 * Calculate the magnitude (length) of a vector
 * @param {Object} vector - Vector {x, y, z}
 * @returns {number} Magnitude
 */
export function vectorMagnitude(vector) {
    return Math.sqrt(
        vector.x * vector.x +
        vector.y * vector.y +
        vector.z * vector.z
    )
}

/**
 * Normalize a vector (make it unit length)
 * @param {Object} vector - Vector {x, y, z}
 * @returns {Object} Normalized vector {x, y, z}
 */
export function normalizeVector(vector) {
    const magnitude = vectorMagnitude(vector)
    if (magnitude === 0) return { x: 0, y: 0, z: 0 }

    return {
        x: vector.x / magnitude,
        y: vector.y / magnitude,
        z: vector.z / magnitude
    }
}

/**
 * Invert a vector (negate all components)
 * @param {Object} vector - Vector {x, y, z}
 * @returns {Object} Inverted vector {x, y, z}
 */
export function invertVector(vector) {
    return {
        x: -vector.x,
        y: -vector.y,
        z: -vector.z
    }
}

/**
 * Apply camera rotation using spherical coordinates to OrbitControls
 * @param {OrbitControls} controls - Three.js OrbitControls instance
 * @param {Object} rotation - Rotation {x: azimuthal, y: polar, z}
 * @param {number} cameraDistance - Distance from origin (default: 0.1)
 */
export function applyCameraRotation(controls, rotation, cameraDistance = 0.1) {
    if (!controls || !controls.object) return

    const camera = controls.object

    // Convert spherical coordinates to Cartesian for camera position
    const position = sphericalToCartesian(cameraDistance, rotation.x, rotation.y)

    camera.position.set(position.x, position.y, position.z)
    camera.lookAt(0, 0, 0)
    controls.update()
}
