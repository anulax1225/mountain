<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Scene>
 */
class SceneFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $locations = [
            'Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Hallway', 'Office',
            'Garden', 'Balcony', 'Garage', 'Basement', 'Attic', 'Dining Room',
            'Lobby', 'Conference Room', 'Reception', 'Showroom', 'Gallery',
            'Main Entrance', 'Back Entrance', 'Rooftop', 'Terrace', 'Studio'
        ];

        return [
            'name' => fake()->randomElement($locations),
            'project_id' => \App\Models\Project::factory(),
        ];
    }
}
