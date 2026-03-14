<?php

namespace Database\Factories;

use App\Models\BlurRegion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BlurRegion>
 */
class BlurRegionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $radius = 500;
        $positionScale = 0.95;

        $azimuthal = fake()->randomFloat(4, -M_PI, M_PI);
        $polar = fake()->randomFloat(4, 0, M_PI);

        $x = $radius * sin($polar) * cos($azimuthal) * $positionScale;
        $y = $radius * cos($polar) * $positionScale;
        $z = $radius * sin($polar) * sin($azimuthal) * $positionScale;

        return [
            'image_id' => \App\Models\Image::factory()->fake(),
            'position_x' => $x,
            'position_y' => $y,
            'position_z' => $z,
            'radius' => fake()->randomFloat(3, 0.02, 0.15),
            'intensity' => fake()->numberBetween(5, 20),
            'type' => 'gaussian',
        ];
    }

    /**
     * Create a pixelated blur region.
     */
    public function pixelate(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'pixelate',
        ]);
    }

    /**
     * Create a blur region at a specific position.
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
     * Create a blur region with a specific radius.
     */
    public function withRadius(float $radius): static
    {
        return $this->state(fn (array $attributes) => [
            'radius' => $radius,
        ]);
    }
}
