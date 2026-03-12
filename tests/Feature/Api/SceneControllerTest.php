<?php

use App\Models\Project;
use App\Models\Scene;
use App\Models\User;

// ===========================================================================
// index
// ===========================================================================

it('admin can list project scenes and response contains data array', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    Scene::factory()->count(2)->create(['project_id' => $project->id]);

    $response = $this->actingAs($admin)->getJson("/projects/{$project->slug}/scenes");

    $response->assertSuccessful()
        ->assertJsonStructure(['data']);

    expect($response->json('data'))->toHaveCount(2);
});

it('creator can list project scenes', function () {
    seedRoles();
    $creator = User::factory()->create();
    $project = Project::factory()->private()->create(['user_id' => $creator->id]);
    Scene::factory()->count(2)->create(['project_id' => $project->id]);

    $response = $this->actingAs($creator)->getJson("/projects/{$project->slug}/scenes");

    $response->assertSuccessful();
    expect($response->json('data'))->toHaveCount(2);
});

it('unassigned client gets 403 on private project scenes', function () {
    $client = createClient();
    $project = Project::factory()->private()->create();
    Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($client)->getJson("/projects/{$project->slug}/scenes");

    $response->assertForbidden();
});

// ===========================================================================
// store
// ===========================================================================

it('admin can create a scene', function () {
    $admin = createAdmin();
    $project = Project::factory()->create();

    $response = $this->actingAs($admin)->postJson("/projects/{$project->slug}/scenes", [
        'name' => 'New API Scene',
    ]);

    $response->assertSuccessful()
        ->assertJsonPath('name', 'New API Scene');

    $this->assertDatabaseHas('scenes', [
        'name' => 'New API Scene',
        'project_id' => $project->id,
    ]);
});

it('viewer gets 403 on scene create', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);

    $response = $this->actingAs($viewer)->postJson("/projects/{$project->slug}/scenes", [
        'name' => 'Viewer Scene Attempt',
    ]);

    $response->assertForbidden();
    $this->assertDatabaseMissing('scenes', ['name' => 'Viewer Scene Attempt']);
});

// ===========================================================================
// show
// ===========================================================================

it('admin can view a scene with project and images loaded', function () {
    $admin = createAdmin();
    $project = Project::factory()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($admin)->getJson("/scenes/{$scene->slug}");

    $response->assertSuccessful()
        ->assertJsonPath('slug', $scene->slug)
        ->assertJsonStructure(['project', 'images']);
});

// ===========================================================================
// update
// ===========================================================================

it('admin can update a scene name', function () {
    $admin = createAdmin();
    $project = Project::factory()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($admin)->putJson("/scenes/{$scene->slug}", [
        'name' => 'Updated Scene Name',
    ]);

    $response->assertSuccessful()
        ->assertJsonPath('name', 'Updated Scene Name');

    $this->assertDatabaseHas('scenes', [
        'id' => $scene->id,
        'name' => 'Updated Scene Name',
    ]);
});

it('viewer gets 403 on scene update', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($viewer)->putJson("/scenes/{$scene->slug}", [
        'name' => 'Viewer Update Attempt',
    ]);

    $response->assertForbidden();
});

// ===========================================================================
// destroy
// ===========================================================================

it('admin can delete a scene and gets 204', function () {
    $admin = createAdmin();
    $project = Project::factory()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($admin)->deleteJson("/scenes/{$scene->slug}");

    $response->assertNoContent();
    $this->assertDatabaseMissing('scenes', ['id' => $scene->id]);
});

it('viewer gets 403 on scene delete', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($viewer)->deleteJson("/scenes/{$scene->slug}");

    $response->assertForbidden();
    $this->assertDatabaseHas('scenes', ['id' => $scene->id]);
});

// ===========================================================================
// unauthenticated
// ===========================================================================

it('unauthenticated request to scenes index returns unauthorized', function () {
    $project = Project::factory()->create();

    $response = $this->getJson("/projects/{$project->slug}/scenes");

    $response->assertUnauthorized();
});
