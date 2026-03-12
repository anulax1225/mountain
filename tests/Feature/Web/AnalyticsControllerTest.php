<?php

use App\Models\Project;
use App\Services\AnalyticsService;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Stub the AnalyticsService so tests do not depend on real analytics data.
 */
function mockAnalyticsService(): void
{
    $mock = Mockery::mock(AnalyticsService::class);

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

// ---------------------------------------------------------------------------
// Authorization
// ---------------------------------------------------------------------------

it('admin can view analytics page for any project', function () {
    mockAnalyticsService();

    $admin = createAdmin();
    $project = Project::factory()->public()->create();

    $this->actingAs($admin)
        ->get(route('dashboard.project.analytics', $project->slug))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/ProjectAnalytics')
            ->has('project')
            ->has('analytics')
            ->has('selectedPeriod')
        );
});

it('project creator can view analytics page', function () {
    mockAnalyticsService();

    $creator = createClient();
    $project = Project::factory()->public()->create(['user_id' => $creator->id]);

    $this->actingAs($creator)
        ->get(route('dashboard.project.analytics', $project->slug))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/ProjectAnalytics')
        );
});

it('viewer can view analytics page', function () {
    mockAnalyticsService();

    $project = Project::factory()->public()->create();
    $viewer = createProjectViewer($project);

    $this->actingAs($viewer)
        ->get(route('dashboard.project.analytics', $project->slug))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/ProjectAnalytics')
        );
});

it('unassigned client gets 403 on private project analytics', function () {
    $client = createClient();
    $project = Project::factory()->private()->create();

    $this->actingAs($client)
        ->get(route('dashboard.project.analytics', $project->slug))
        ->assertForbidden();
});

it('unauthenticated user is redirected to login from analytics', function () {
    $project = Project::factory()->create();

    $this->get(route('dashboard.project.analytics', $project->slug))
        ->assertRedirect(route('login'));
});

// ---------------------------------------------------------------------------
// Public vs private analytics prop
// ---------------------------------------------------------------------------

it('analytics prop is populated for a public project', function () {
    mockAnalyticsService();

    $admin = createAdmin();
    $project = Project::factory()->public()->create();

    $this->actingAs($admin)
        ->get(route('dashboard.project.analytics', $project->slug))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/ProjectAnalytics')
            ->whereNot('analytics', null)
            ->has('analytics.overview')
            ->has('analytics.views_over_time')
            ->has('analytics.most_viewed_images')
            ->has('analytics.most_clicked_hotspots')
        );
});

it('analytics prop is null for a private project', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();

    $this->actingAs($admin)
        ->get(route('dashboard.project.analytics', $project->slug))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/ProjectAnalytics')
            ->where('analytics', null)
        );
});

// ---------------------------------------------------------------------------
// selectedPeriod / days parameter
// ---------------------------------------------------------------------------

it('defaults to 30 days when no days parameter is provided', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();

    $this->actingAs($admin)
        ->get(route('dashboard.project.analytics', $project->slug))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('selectedPeriod', 30)
        );
});

it('uses custom days parameter when provided', function () {
    mockAnalyticsService();

    $admin = createAdmin();
    $project = Project::factory()->public()->create();

    $this->actingAs($admin)
        ->get(route('dashboard.project.analytics', $project->slug).'?days=7')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('selectedPeriod', 7)
        );
});

it('clamps days below 1 to 1', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();

    $this->actingAs($admin)
        ->get(route('dashboard.project.analytics', $project->slug).'?days=0')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('selectedPeriod', 1)
        );
});

it('clamps days above 365 to 365', function () {
    mockAnalyticsService();

    $admin = createAdmin();
    $project = Project::factory()->public()->create();

    $this->actingAs($admin)
        ->get(route('dashboard.project.analytics', $project->slug).'?days=999')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('selectedPeriod', 365)
        );
});

it('accepts exactly 365 days without clamping', function () {
    mockAnalyticsService();

    $admin = createAdmin();
    $project = Project::factory()->public()->create();

    $this->actingAs($admin)
        ->get(route('dashboard.project.analytics', $project->slug).'?days=365')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('selectedPeriod', 365)
        );
});
