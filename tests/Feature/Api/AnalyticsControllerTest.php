<?php

use App\Models\Image;
use App\Models\Project;
use App\Models\Scene;
use App\Services\AnalyticsService;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Stub the AnalyticsService so tests do not depend on real analytics data.
 */
function mockApiAnalyticsService(): void
{
    $mock = Mockery::mock(AnalyticsService::class);

    $mock->shouldReceive('generateSessionId')->andReturn('test-session-id');
    $mock->shouldReceive('anonymizeIp')->andReturn('hashed-ip');
    $mock->shouldReceive('trackEvent')->andReturn(new \App\Models\AnalyticsEvent);

    $mock->shouldReceive('getProjectOverview')
        ->andReturn(['total_views' => 0, 'unique_visitors' => 0]);

    $mock->shouldReceive('getViewsOverTime')
        ->andReturn([]);

    $mock->shouldReceive('getMostViewedImages')
        ->andReturn([]);

    $mock->shouldReceive('getMostClickedHotspots')
        ->andReturn([]);

    app()->instance(AnalyticsService::class, $mock);
}

// ===========================================================================
// POST /analytics/track
// ===========================================================================

it('tracks project_view event on a public project and returns success', function () {
    mockApiAnalyticsService();

    $project = Project::factory()->public()->create();

    $this->postJson('/analytics/track', [
        'project_slug' => $project->slug,
        'event_type' => 'project_view',
    ])->assertSuccessful()->assertJson(['success' => true]);
});

it('returns 404 when tracking event for non-existent project', function () {
    $this->postJson('/analytics/track', [
        'project_slug' => 'does-not-exist',
        'event_type' => 'project_view',
    ])->assertNotFound()->assertJson(['error' => 'Project not found or not public']);
});

it('returns 404 when tracking event for a private project', function () {
    $project = Project::factory()->private()->create();

    $this->postJson('/analytics/track', [
        'project_slug' => $project->slug,
        'event_type' => 'project_view',
    ])->assertNotFound()->assertJson(['error' => 'Project not found or not public']);
});

it('tracks image_view event with image_slug on a public project', function () {
    mockApiAnalyticsService();

    $project = Project::factory()->public()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $this->postJson('/analytics/track', [
        'project_slug' => $project->slug,
        'event_type' => 'image_view',
        'image_slug' => $image->slug,
    ])->assertSuccessful()->assertJson(['success' => true]);
});

it('tracks session_end event with duration_seconds on a public project', function () {
    mockApiAnalyticsService();

    $project = Project::factory()->public()->create();

    $this->postJson('/analytics/track', [
        'project_slug' => $project->slug,
        'event_type' => 'session_end',
        'duration_seconds' => 120,
    ])->assertSuccessful()->assertJson(['success' => true]);
});

it('fails validation when project_slug is missing', function () {
    $this->postJson('/analytics/track', [
        'event_type' => 'project_view',
    ])->assertUnprocessable()->assertJsonValidationErrors('project_slug');
});

it('fails validation when event_type is invalid', function () {
    $project = Project::factory()->public()->create();

    $this->postJson('/analytics/track', [
        'project_slug' => $project->slug,
        'event_type' => 'not_a_valid_type',
    ])->assertUnprocessable()->assertJsonValidationErrors('event_type');
});

// ===========================================================================
// GET /projects/{slug}/analytics
// ===========================================================================

it('admin can get analytics for a public project and response contains all four keys', function () {
    mockApiAnalyticsService();

    $admin = createAdmin();
    $project = Project::factory()->public()->create();

    $this->actingAs($admin)
        ->getJson("/projects/{$project->slug}/analytics")
        ->assertSuccessful()
        ->assertJsonStructure([
            'overview',
            'views_over_time',
            'most_viewed_images',
            'most_clicked_hotspots',
        ]);
});

it('returns 403 with error message when requesting analytics for a private project', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();

    $this->actingAs($admin)
        ->getJson("/projects/{$project->slug}/analytics")
        ->assertForbidden()
        ->assertJson(['error' => 'Analytics are only available for public projects']);
});

it('unassigned client gets 403 when viewing analytics for a private project', function () {
    $client = createClient();
    $project = Project::factory()->private()->create();

    $this->actingAs($client)
        ->getJson("/projects/{$project->slug}/analytics")
        ->assertForbidden();
});

it('uses custom days parameter when provided', function () {
    $mock = Mockery::mock(AnalyticsService::class);

    $mock->shouldReceive('getProjectOverview')
        ->withArgs(fn ($p, $days) => $days === 7)
        ->once()
        ->andReturn(['total_views' => 0, 'unique_visitors' => 0]);

    $mock->shouldReceive('getViewsOverTime')
        ->withArgs(fn ($p, $days) => $days === 7)
        ->once()
        ->andReturn([]);

    $mock->shouldReceive('getMostViewedImages')
        ->once()
        ->andReturn([]);

    $mock->shouldReceive('getMostClickedHotspots')
        ->once()
        ->andReturn([]);

    app()->instance(AnalyticsService::class, $mock);

    $admin = createAdmin();
    $project = Project::factory()->public()->create();

    $this->actingAs($admin)
        ->getJson("/projects/{$project->slug}/analytics?days=7")
        ->assertSuccessful();
});

it('redirects unauthenticated user requesting project analytics', function () {
    $project = Project::factory()->public()->create();

    $this->get("/projects/{$project->slug}/analytics")
        ->assertRedirect(route('login'));
});
