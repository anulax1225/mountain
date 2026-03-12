<?php

use App\Models\Project;
use App\Models\User;

// ===========================================================================
// index
// ===========================================================================

it('admin index sees all projects', function () {
    $admin = createAdmin();
    Project::factory()->count(3)->create();

    $response = $this->actingAs($admin)->getJson('/projects');

    $response->assertSuccessful();

    expect($response->json('data'))->toHaveCount(3);
});

it('client index sees only own and assigned projects', function () {
    $client = createClient();

    $ownProject = Project::factory()->private()->create(['user_id' => $client->id]);
    $assignedProject = Project::factory()->private()->create();
    createProjectOwner($assignedProject);
    $assignedProject->assignedUsers()->attach($client->id, [
        'role_id' => \App\Models\Role::where('slug', 'viewer')->first()->id,
    ]);

    // A project this client has no access to
    Project::factory()->private()->create();

    $response = $this->actingAs($client->fresh())->getJson('/projects');

    $response->assertSuccessful();

    $slugs = collect($response->json('data'))->pluck('slug');
    expect($slugs)->toContain($ownProject->slug)
        ->toContain($assignedProject->slug)
        ->toHaveCount(2);
});

// ===========================================================================
// store
// ===========================================================================

it('admin can store a project', function () {
    $admin = createAdmin();

    $response = $this->actingAs($admin)->postJson('/projects', [
        'name' => 'New API Project',
    ]);

    $response->assertSuccessful()
        ->assertJsonPath('slug', fn ($slug) => filled($slug));

    $this->assertDatabaseHas('projects', ['name' => 'New API Project']);
});

it('client gets 403 on store', function () {
    $client = createClient();

    $response = $this->actingAs($client)->postJson('/projects', [
        'name' => 'Unauthorized Project',
    ]);

    $response->assertForbidden();
    $this->assertDatabaseMissing('projects', ['name' => 'Unauthorized Project']);
});

// ===========================================================================
// show
// ===========================================================================

it('admin can show a project and response contains slug', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();

    $response = $this->actingAs($admin)->getJson("/projects/{$project->slug}");

    $response->assertSuccessful()
        ->assertJsonPath('slug', $project->slug);
});

it('creator can show own private project', function () {
    seedRoles();
    $creator = User::factory()->create();
    $project = Project::factory()->private()->create(['user_id' => $creator->id]);

    $response = $this->actingAs($creator)->getJson("/projects/{$project->slug}");

    $response->assertSuccessful()
        ->assertJsonPath('slug', $project->slug);
});

it('unassigned client gets 403 showing a private project', function () {
    $client = createClient();
    $project = Project::factory()->private()->create();

    $response = $this->actingAs($client)->getJson("/projects/{$project->slug}");

    $response->assertForbidden();
});

// ===========================================================================
// update
// ===========================================================================

it('admin can update a project name', function () {
    $admin = createAdmin();
    $project = Project::factory()->create();

    $response = $this->actingAs($admin)->putJson("/projects/{$project->slug}", [
        'name' => 'Updated Via API',
    ]);

    $response->assertSuccessful()
        ->assertJsonPath('name', 'Updated Via API');

    $this->assertDatabaseHas('projects', [
        'id' => $project->id,
        'name' => 'Updated Via API',
    ]);
});

it('viewer gets 403 on update', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);

    $response = $this->actingAs($viewer)->putJson("/projects/{$project->slug}", [
        'name' => 'Viewer Update Attempt',
    ]);

    $response->assertForbidden();
});

// ===========================================================================
// destroy
// ===========================================================================

it('admin can delete a project and gets 204', function () {
    $admin = createAdmin();
    $project = Project::factory()->create();

    $response = $this->actingAs($admin)->deleteJson("/projects/{$project->slug}");

    $response->assertNoContent();
    $this->assertDatabaseMissing('projects', ['id' => $project->id]);
});

it('owner gets 403 on delete', function () {
    $project = Project::factory()->private()->create();
    $owner = createProjectOwner($project);

    $response = $this->actingAs($owner)->deleteJson("/projects/{$project->slug}");

    $response->assertForbidden();
    $this->assertDatabaseHas('projects', ['id' => $project->id]);
});

// ===========================================================================
// makePublic
// ===========================================================================

it('admin can make a project public', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();

    $response = $this->actingAs($admin)->postJson("/projects/{$project->slug}/make-public", [
        'is_public' => true,
        'start_image_id' => null,
    ]);

    $response->assertSuccessful()
        ->assertJsonPath('is_public', true);

    $this->assertDatabaseHas('projects', [
        'id' => $project->id,
        'is_public' => true,
    ]);
});

it('viewer gets 403 on make-public', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);

    $response = $this->actingAs($viewer)->postJson("/projects/{$project->slug}/make-public", [
        'is_public' => true,
        'start_image_id' => null,
    ]);

    $response->assertForbidden();
});

// ===========================================================================
// getImages
// ===========================================================================

it('admin can get images for a project', function () {
    $admin = createAdmin();
    $project = Project::factory()->create();

    $response = $this->actingAs($admin)->getJson("/projects/{$project->slug}/images");

    $response->assertSuccessful()
        ->assertJsonStructure([]);
});

// ===========================================================================
// unauthenticated
// ===========================================================================

it('unauthenticated request to projects index returns a redirect', function () {
    $response = $this->getJson('/projects');

    $response->assertUnauthorized();
});
