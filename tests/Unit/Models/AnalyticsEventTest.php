<?php

use App\Models\AnalyticsEvent;
use App\Models\Hotspot;
use App\Models\Image;
use App\Models\Project;

it('belongs to a project', function () {
    $event = AnalyticsEvent::factory()->projectView()->create();

    expect($event->project)->toBeInstanceOf(Project::class);
});

it('belongs to an image when image view', function () {
    $image = Image::factory()->fake()->create();
    $event = AnalyticsEvent::factory()->create([
        'event_type' => AnalyticsEvent::TYPE_IMAGE_VIEW,
        'project_id' => $image->scene->project_id,
        'image_id' => $image->id,
    ]);

    expect($event->image)->toBeInstanceOf(Image::class)
        ->and($event->image->id)->toBe($image->id);
});

it('belongs to a hotspot when hotspot click', function () {
    $hotspot = Hotspot::factory()->create();
    $event = AnalyticsEvent::factory()->create([
        'event_type' => AnalyticsEvent::TYPE_HOTSPOT_CLICK,
        'project_id' => $hotspot->scene->project_id,
        'hotspot_id' => $hotspot->id,
    ]);

    expect($event->hotspot)->toBeInstanceOf(Hotspot::class)
        ->and($event->hotspot->id)->toBe($hotspot->id);
});

it('is immutable (UPDATED_AT is null)', function () {
    expect(AnalyticsEvent::UPDATED_AT)->toBeNull();
});

it('has correct event type constants', function () {
    expect(AnalyticsEvent::TYPE_PROJECT_VIEW)->toBe('project_view')
        ->and(AnalyticsEvent::TYPE_IMAGE_VIEW)->toBe('image_view')
        ->and(AnalyticsEvent::TYPE_HOTSPOT_CLICK)->toBe('hotspot_click')
        ->and(AnalyticsEvent::TYPE_SESSION_END)->toBe('session_end');
});

it('casts created_at to datetime', function () {
    $event = AnalyticsEvent::factory()->projectView()->create();

    expect($event->created_at)->toBeInstanceOf(\Illuminate\Support\Carbon::class);
});
