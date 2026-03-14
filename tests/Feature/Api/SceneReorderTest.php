<?php

use App\Models\Project;
use App\Models\Scene;

// ===========================================================================
// reorder
// ===========================================================================

it('reorders scenes within a project', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();

    $sceneA = Scene::factory()->create(['project_id' => $project->id, 'position' => 0]);
    $sceneB = Scene::factory()->create(['project_id' => $project->id, 'position' => 1]);
    $sceneC = Scene::factory()->create(['project_id' => $project->id, 'position' => 2]);

    $response = $this->actingAs($admin)
        ->postJson("/projects/{$project->slug}/scenes/reorder", [
            'slugs' => [$sceneC->slug, $sceneB->slug, $sceneA->slug],
        ]);

    $response->assertNoContent();

    $this->assertDatabaseHas('scenes', ['id' => $sceneC->id, 'position' => 0]);
    $this->assertDatabaseHas('scenes', ['id' => $sceneB->id, 'position' => 1]);
    $this->assertDatabaseHas('scenes', ['id' => $sceneA->id, 'position' => 2]);
});

it('rejects reorder for unauthenticated users', function () {
    $project = Project::factory()->private()->create();

    $response = $this->post("/projects/{$project->slug}/scenes/reorder", [
        'slugs' => ['some-slug'],
    ]);

    $response->assertRedirect(route('login'));
});

it('rejects reorder for unauthorized users', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);

    $sceneA = Scene::factory()->create(['project_id' => $project->id, 'position' => 0]);
    $sceneB = Scene::factory()->create(['project_id' => $project->id, 'position' => 1]);

    $response = $this->actingAs($viewer)
        ->postJson("/projects/{$project->slug}/scenes/reorder", [
            'slugs' => [$sceneB->slug, $sceneA->slug],
        ]);

    $response->assertForbidden();
});

it('validates that slugs are required', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();

    $response = $this->actingAs($admin)
        ->postJson("/projects/{$project->slug}/scenes/reorder", []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors('slugs');
});

it('returns scenes ordered by position from the project relationship', function () {
    $project = Project::factory()->private()->create();

    $sceneA = Scene::factory()->create(['project_id' => $project->id, 'position' => 0]);
    $sceneB = Scene::factory()->create(['project_id' => $project->id, 'position' => 1]);
    $sceneC = Scene::factory()->create(['project_id' => $project->id, 'position' => 2]);

    $ordered = $project->scenes()->pluck('id')->toArray();

    expect($ordered)->toBe([$sceneA->id, $sceneB->id, $sceneC->id]);
});
