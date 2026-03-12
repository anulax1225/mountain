<?php

namespace Database\Factories;

use App\Models\AnalyticsDailyStat;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AnalyticsDailyStat>
 */
class AnalyticsDailyStatFactory extends Factory
{
    protected $model = AnalyticsDailyStat::class;

    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'date' => fake()->dateTimeBetween('-30 days', 'now'),
            'total_views' => fake()->numberBetween(0, 500),
            'unique_visitors' => fake()->numberBetween(0, 200),
            'avg_duration_seconds' => fake()->numberBetween(10, 300),
            'total_image_views' => fake()->numberBetween(0, 1000),
            'total_hotspot_clicks' => fake()->numberBetween(0, 500),
        ];
    }
}
