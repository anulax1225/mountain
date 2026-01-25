<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Hotspot>
 */
class HotspotFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Generate random spherical coordinates and convert to Cartesian
        $radius = 500; // Sphere radius from editorConstants
        $positionScale = 0.95; // Position scale from editorConstants

        // Random spherical coordinates
        $azimuthal = fake()->randomFloat(4, -M_PI, M_PI); // -π to π
        $polar = fake()->randomFloat(4, 0, M_PI); // 0 to π

        // Convert to Cartesian coordinates
        $x = $radius * sin($polar) * cos($azimuthal);
        $y = $radius * cos($polar);
        $z = $radius * sin($polar) * sin($azimuthal);

        // Scale position to be inside sphere
        $x *= $positionScale;
        $y *= $positionScale;
        $z *= $positionScale;

        // Generate random target rotation
        $targetRotationX = fake()->randomFloat(4, -M_PI, M_PI);
        $targetRotationY = fake()->randomFloat(4, -M_PI / 2, M_PI / 2);
        $targetRotationZ = 0; // Usually 0 for camera rotation

        return [
            'scene_id' => \App\Models\Scene::factory(),
            'from_image_id' => \App\Models\Image::factory(),
            'to_image_id' => \App\Models\Image::factory(),
            'position_x' => $x,
            'position_y' => $y,
            'position_z' => $z,
            'target_rotation_x' => $targetRotationX,
            'target_rotation_y' => $targetRotationY,
            'target_rotation_z' => $targetRotationZ,
            'custom_color' => fake()->optional(0.2)->hexColor(), // 20% chance of custom color
            'custom_image' => null, // Can be set via state method
        ];
    }

    /**
     * Create a hotspot with a specific 3D position.
     *
     * @param float $x X coordinate
     * @param float $y Y coordinate
     * @param float $z Z coordinate
     * @return static
     */
    public function atPosition(float $x, float $y, float $z): static
    {
        return $this->state(fn (array $attributes) => [
            'position_x' => $x,
            'position_y' => $y,
            'position_z' => $z,
        ]);
    }

    /**
     * Create a hotspot with a specific target rotation.
     *
     * @param float $x Rotation X
     * @param float $y Rotation Y
     * @param float $z Rotation Z
     * @return static
     */
    public function withTargetRotation(float $x, float $y, float $z = 0): static
    {
        return $this->state(fn (array $attributes) => [
            'target_rotation_x' => $x,
            'target_rotation_y' => $y,
            'target_rotation_z' => $z,
        ]);
    }

    /**
     * Create a hotspot with a custom color.
     *
     * @param string $color Hex color code
     * @return static
     */
    public function withColor(string $color): static
    {
        return $this->state(fn (array $attributes) => [
            'custom_color' => $color,
        ]);
    }
}
