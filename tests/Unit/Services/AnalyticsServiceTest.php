<?php

use App\Models\AnalyticsDailyStat;
use App\Models\AnalyticsEvent;
use App\Models\Hotspot;
use App\Models\Image;
use App\Models\Project;
use App\Models\Scene;
use App\Services\AnalyticsService;
use Carbon\Carbon;

beforeEach(function () {
    $this->service = new AnalyticsService;
});

it('generates consistent session id for same ip and user agent on same day', function () {
    $id1 = $this->service->generateSessionId('192.168.1.1', 'Mozilla/5.0');
    $id2 = $this->service->generateSessionId('192.168.1.1', 'Mozilla/5.0');

    expect($id1)->toBe($id2);
});

it('generates different session id for different ips', function () {
    $id1 = $this->service->generateSessionId('192.168.1.1', 'Mozilla/5.0');
    $id2 = $this->service->generateSessionId('10.0.0.1', 'Mozilla/5.0');

    expect($id1)->not->toBe($id2);
});

it('anonymizes ip address consistently', function () {
    $hash1 = $this->service->anonymizeIp('192.168.1.1');
    $hash2 = $this->service->anonymizeIp('192.168.1.1');

    expect($hash1)->toBe($hash2)
        ->and($hash1)->not->toBe('192.168.1.1');
});

it('tracks an event', function () {
    $project = Project::factory()->create();

    $event = $this->service->trackEvent([
        'project_id' => $project->id,
        'session_id' => 'test-session',
        'event_type' => AnalyticsEvent::TYPE_PROJECT_VIEW,
        'user_agent' => 'TestAgent',
        'ip_hash' => 'hashed-ip',
    ]);

    expect($event)->toBeInstanceOf(AnalyticsEvent::class)
        ->and($event->project_id)->toBe($project->id)
        ->and($event->event_type)->toBe('project_view');
});

it('gets project overview with correct counts', function () {
    $project = Project::factory()->create();

    // Create events
    AnalyticsEvent::factory()->count(5)->create([
        'project_id' => $project->id,
        'event_type' => AnalyticsEvent::TYPE_PROJECT_VIEW,
        'session_id' => 'session-1',
    ]);
    AnalyticsEvent::factory()->count(3)->create([
        'project_id' => $project->id,
        'event_type' => AnalyticsEvent::TYPE_PROJECT_VIEW,
        'session_id' => 'session-2',
    ]);
    AnalyticsEvent::factory()->count(2)->create([
        'project_id' => $project->id,
        'event_type' => AnalyticsEvent::TYPE_IMAGE_VIEW,
    ]);
    AnalyticsEvent::factory()->create([
        'project_id' => $project->id,
        'event_type' => AnalyticsEvent::TYPE_HOTSPOT_CLICK,
    ]);

    $overview = $this->service->getProjectOverview($project, 30);

    expect($overview['total_views'])->toBe(8)
        ->and($overview['unique_visitors'])->toBe(2)
        ->and($overview['total_image_views'])->toBe(2)
        ->and($overview['total_hotspot_clicks'])->toBe(1)
        ->and($overview['period_days'])->toBe(30);
});

it('respects date range filtering in overview', function () {
    $project = Project::factory()->create();

    // Recent event
    AnalyticsEvent::factory()->create([
        'project_id' => $project->id,
        'event_type' => AnalyticsEvent::TYPE_PROJECT_VIEW,
        'created_at' => now()->subDays(5),
    ]);

    // Old event (beyond 7 days)
    AnalyticsEvent::factory()->create([
        'project_id' => $project->id,
        'event_type' => AnalyticsEvent::TYPE_PROJECT_VIEW,
        'created_at' => now()->subDays(10),
    ]);

    $overview = $this->service->getProjectOverview($project, 7);

    expect($overview['total_views'])->toBe(1);
});

it('gets views over time with zero-filled dates', function () {
    $project = Project::factory()->create();

    AnalyticsEvent::factory()->create([
        'project_id' => $project->id,
        'event_type' => AnalyticsEvent::TYPE_PROJECT_VIEW,
        'created_at' => now()->subDays(2),
    ]);

    $result = $this->service->getViewsOverTime($project, 7);

    expect($result)->toHaveCount(7)
        ->and(collect($result)->sum('views'))->toBe(1);
});

it('gets most viewed images ordered by count', function () {
    $project = Project::factory()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image1 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $image2 = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    AnalyticsEvent::factory()->count(5)->create([
        'project_id' => $project->id,
        'event_type' => AnalyticsEvent::TYPE_IMAGE_VIEW,
        'image_id' => $image1->id,
    ]);
    AnalyticsEvent::factory()->count(2)->create([
        'project_id' => $project->id,
        'event_type' => AnalyticsEvent::TYPE_IMAGE_VIEW,
        'image_id' => $image2->id,
    ]);

    $result = $this->service->getMostViewedImages($project);

    expect($result)->toHaveCount(2)
        ->and($result[0]['view_count'])->toBe(5)
        ->and($result[1]['view_count'])->toBe(2);
});

it('gets most clicked hotspots ordered by count', function () {
    $project = Project::factory()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image1 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $image2 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $hotspot = Hotspot::factory()->create([
        'scene_id' => $scene->id,
        'from_image_id' => $image1->id,
        'to_image_id' => $image2->id,
    ]);

    AnalyticsEvent::factory()->count(3)->create([
        'project_id' => $project->id,
        'event_type' => AnalyticsEvent::TYPE_HOTSPOT_CLICK,
        'hotspot_id' => $hotspot->id,
    ]);

    $result = $this->service->getMostClickedHotspots($project);

    expect($result)->toHaveCount(1)
        ->and($result[0]['click_count'])->toBe(3);
});

it('aggregates daily stats', function () {
    $project = Project::factory()->create();
    $yesterday = Carbon::yesterday();

    AnalyticsEvent::factory()->count(3)->create([
        'project_id' => $project->id,
        'event_type' => AnalyticsEvent::TYPE_PROJECT_VIEW,
        'session_id' => 'session-1',
        'created_at' => $yesterday,
    ]);
    AnalyticsEvent::factory()->create([
        'project_id' => $project->id,
        'event_type' => AnalyticsEvent::TYPE_SESSION_END,
        'duration_seconds' => 120,
        'created_at' => $yesterday,
    ]);

    $this->service->aggregateDailyStats($yesterday);

    $stat = AnalyticsDailyStat::where('project_id', $project->id)
        ->where('date', $yesterday->format('Y-m-d'))
        ->first();

    expect($stat)->not->toBeNull()
        ->and($stat->total_views)->toBe(3)
        ->and($stat->unique_visitors)->toBe(1);
});

it('deletes old events', function () {
    $project = Project::factory()->create();

    // Old event
    AnalyticsEvent::factory()->create([
        'project_id' => $project->id,
        'created_at' => now()->subDays(100),
    ]);

    // Recent event
    AnalyticsEvent::factory()->create([
        'project_id' => $project->id,
        'created_at' => now()->subDays(10),
    ]);

    $deleted = $this->service->deleteOldEvents(90);

    expect($deleted)->toBe(1)
        ->and(AnalyticsEvent::count())->toBe(1);
});
