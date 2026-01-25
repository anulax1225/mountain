<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Sticker>
 */
class StickerFactory extends Factory
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

        $types = ['emoji', 'text'];
        $type = fake()->randomElement($types);

        $emojis = ['🎯', '⭐', '📍', '🏠', '🚪', '🪟', '🛋️', '🖼️', '💡', '🔑'];

        return [
            'image_id' => \App\Models\Image::factory(),
            'type' => $type,
            'content' => $type === 'emoji'
                ? fake()->randomElement($emojis)
                : fake()->words(2, true),
            'position_x' => $x,
            'position_y' => $y,
            'position_z' => $z,
            'scale' => fake()->randomFloat(2, 0.5, 2.0),
            'rotation_x' => 0,
            'rotation_y' => 0,
            'rotation_z' => 0,
            'font_family' => $type === 'text' ? fake()->randomElement(['Arial', 'Helvetica', 'Times New Roman', 'Courier']) : null,
            'font_size' => $type === 'text' ? fake()->numberBetween(12, 48) : null,
            'color' => fake()->hexColor(),
            'background_color' => fake()->optional(0.5)->hexColor(), // 50% chance of background
        ];
    }

    /**
     * Create an emoji sticker.
     *
     * @param string|null $emoji Specific emoji to use
     * @return static
     */
    public function emoji(?string $emoji = null): static
    {
        $emojis = ['🎯', '⭐', '📍', '🏠', '🚪', '🪟', '🛋️', '🖼️', '💡', '🔑'];

        return $this->state(fn (array $attributes) => [
            'type' => 'emoji',
            'content' => $emoji ?? fake()->randomElement($emojis),
            'font_family' => null,
            'font_size' => null,
        ]);
    }

    /**
     * Create a text sticker.
     *
     * @param string|null $text Specific text to use
     * @return static
     */
    public function text(?string $text = null): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'text',
            'content' => $text ?? fake()->words(2, true),
            'font_family' => fake()->randomElement(['Arial', 'Helvetica', 'Times New Roman', 'Courier']),
            'font_size' => fake()->numberBetween(12, 48),
        ]);
    }

    /**
     * Create a sticker at a specific position.
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
     * Create a sticker with a specific scale.
     *
     * @param float $scale Scale value
     * @return static
     */
    public function withScale(float $scale): static
    {
        return $this->state(fn (array $attributes) => [
            'scale' => $scale,
        ]);
    }
}
