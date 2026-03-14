<?php

use App\Models\Project;
use App\Models\Scene;

// ---------------------------------------------------------------------------
// show
// ---------------------------------------------------------------------------

it('allows admin to access the editor', function () {
    $admin = createAdmin();
    $project = Project::factory()->create();

    $response = $this->actingAs($admin)
        ->get(route('dashboard.editor', $project));

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/Editor')
            ->has('project')
            ->has('scenes')
        );
});

it('allows project creator to access the editor with correct props', function () {
    $creator = createClient();
    $project = Project::factory()->create(['user_id' => $creator->id]);
    Scene::factory()->count(2)->create(['project_id' => $project->id]);

    $response = $this->actingAs($creator)
        ->get(route('dashboard.editor', $project));

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/Editor')
            ->has('project')
            ->has('scenes', 2)
            ->where('canEdit', true)
        );
});

it('allows assigned project owner to access the editor', function () {
    $project = Project::factory()->create();
    $owner = createProjectOwner($project);

    $response = $this->actingAs($owner)
        ->get(route('dashboard.editor', $project));

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/Editor')
            ->has('project')
            ->has('scenes')
        );
});

it('allows project viewer to access the editor in view-only mode', function () {
    $project = Project::factory()->create();
    $viewer = createProjectViewer($project);

    $response = $this->actingAs($viewer)
        ->get(route('dashboard.editor', $project));

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/Editor')
            ->has('project')
            ->has('scenes')
            ->where('canEdit', false)
        );
});

it('returns 403 for client not assigned to project when accessing the editor', function () {
    $client = createClient();
    $project = Project::factory()->private()->create();

    $response = $this->actingAs($client)
        ->get(route('dashboard.editor', $project));

    $response->assertForbidden();
});

it('redirects unauthenticated user to login when accessing the editor', function () {
    $project = Project::factory()->create();

    $response = $this->get(route('dashboard.editor', $project));

    $response->assertRedirect(route('login'));
});
