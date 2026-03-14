<?php

use App\Models\Image;
use App\Models\Project;
use App\Models\Scene;

// ===========================================================================
// reorder
// ===========================================================================

it('reorders images within a scene', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $imageA = Image::factory()->fake()->create(['scene_id' => $scene->id, 'position' => 0]);
    $imageB = Image::factory()->fake()->create(['scene_id' => $scene->id, 'position' => 1]);
    $imageC = Image::factory()->fake()->create(['scene_id' => $scene->id, 'position' => 2]);

    $response = $this->actingAs($admin)
        ->postJson("/scenes/{$scene->slug}/images/reorder", [
            'slugs' => [$imageC->slug, $imageB->slug, $imageA->slug],
        ]);

    $response->assertNoContent();

    $this->assertDatabaseHas('images', ['id' => $imageC->id, 'position' => 0]);
    $this->assertDatabaseHas('images', ['id' => $imageB->id, 'position' => 1]);
    $this->assertDatabaseHas('images', ['id' => $imageA->id, 'position' => 2]);
});

it('rejects reorder for unauthenticated users', function () {
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->post("/scenes/{$scene->slug}/images/reorder", [
        'slugs' => ['some-slug'],
    ]);

    $response->assertRedirect(route('login'));
});

it('rejects reorder for unauthorized users', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $imageA = Image::factory()->fake()->create(['scene_id' => $scene->id, 'position' => 0]);
    $imageB = Image::factory()->fake()->create(['scene_id' => $scene->id, 'position' => 1]);

    $response = $this->actingAs($viewer)
        ->postJson("/scenes/{$scene->slug}/images/reorder", [
            'slugs' => [$imageB->slug, $imageA->slug],
        ]);

    $response->assertForbidden();
});

it('validates that slugs are required', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($admin)
        ->postJson("/scenes/{$scene->slug}/images/reorder", []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors('slugs');
});

it('returns images ordered by position from the scene relationship', function () {
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $imageA = Image::factory()->fake()->create(['scene_id' => $scene->id, 'position' => 0]);
    $imageB = Image::factory()->fake()->create(['scene_id' => $scene->id, 'position' => 1]);
    $imageC = Image::factory()->fake()->create(['scene_id' => $scene->id, 'position' => 2]);

    $ordered = $scene->images()->pluck('id')->toArray();

    expect($ordered)->toBe([$imageA->id, $imageB->id, $imageC->id]);
});
