<?php

namespace Database\Factories;

use App\Models\AnalyticsEvent;
use App\Models\Hotspot;
use App\Models\Image;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AnalyticsEvent>
 */
class AnalyticsEventFactory extends Factory
{
    protected $model = AnalyticsEvent::class;

    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'session_id' => fake()->sha256(),
            'event_type' => fake()->randomElement([
                AnalyticsEvent::TYPE_PROJECT_VIEW,
                AnalyticsEvent::TYPE_IMAGE_VIEW,
                AnalyticsEvent::TYPE_HOTSPOT_CLICK,
                AnalyticsEvent::TYPE_SESSION_END,
            ]),
            'image_id' => null,
            'hotspot_id' => null,
            'duration_seconds' => null,
            'referrer' => fake()->optional(0.3)->url(),
            'user_agent' => fake()->userAgent(),
            'ip_hash' => fake()->sha256(),
        ];
    }

    public function projectView(): static
    {
        return $this->state(fn () => [
            'event_type' => AnalyticsEvent::TYPE_PROJECT_VIEW,
        ]);
    }

    public function imageView(): static
    {
        return $this->state(fn () => [
            'event_type' => AnalyticsEvent::TYPE_IMAGE_VIEW,
            'image_id' => Image::factory(),
        ]);
    }

    public function hotspotClick(): static
    {
        return $this->state(fn () => [
            'event_type' => AnalyticsEvent::TYPE_HOTSPOT_CLICK,
            'hotspot_id' => Hotspot::factory(),
        ]);
    }

    public function sessionEnd(): static
    {
        return $this->state(fn () => [
            'event_type' => AnalyticsEvent::TYPE_SESSION_END,
            'duration_seconds' => fake()->numberBetween(10, 600),
        ]);
    }
}
