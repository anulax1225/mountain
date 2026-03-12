<?php

namespace Database\Factories;

use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Role>
 */
class RoleFactory extends Factory
{
    protected $model = Role::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
            'slug' => fake()->unique()->slug(1),
            'description' => fake()->sentence(),
        ];
    }

    public function admin(): static
    {
        return $this->state(fn () => [
            'name' => 'Admin',
            'slug' => 'admin',
            'description' => 'Global administrator',
        ]);
    }

    public function client(): static
    {
        return $this->state(fn () => [
            'name' => 'Client',
            'slug' => 'client',
            'description' => 'Global client',
        ]);
    }

    public function owner(): static
    {
        return $this->state(fn () => [
            'name' => 'Owner',
            'slug' => 'owner',
            'description' => 'Project owner',
        ]);
    }

    public function viewer(): static
    {
        return $this->state(fn () => [
            'name' => 'Viewer',
            'slug' => 'viewer',
            'description' => 'Project viewer',
        ]);
    }
}
