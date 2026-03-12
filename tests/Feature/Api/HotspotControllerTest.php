<?php

use App\Models\Hotspot;
use App\Models\Image;
use App\Models\Project;
use App\Models\Scene;

// ===========================================================================
// index
// ===========================================================================

it('allows admin to list scene hotspots', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image1 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $image2 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    Hotspot::factory()->count(2)->create([
        'scene_id' => $scene->id,
        'from_image_id' => $image1->id,
        'to_image_id' => $image2->id,
    ]);

    $response = $this->actingAs($admin)
        ->getJson("/scenes/{$scene->slug}/hotspots");

    $response->assertSuccessful()
        ->assertJsonCount(2, 'data');
});

it('returns 403 for unassigned client on private project hotspot list', function () {
    $client = createClient();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($client)
        ->getJson("/scenes/{$scene->slug}/hotspots");

    $response->assertForbidden();
});

// ===========================================================================
// store
// ===========================================================================

it('allows admin to create a hotspot', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image1 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $image2 = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($admin)
        ->postJson("/scenes/{$scene->slug}/hotspots", [
            'from_image_id' => $image1->id,
            'to_image_id' => $image2->id,
            'position_x' => 100.5,
            'position_y' => -200.0,
            'position_z' => 50.25,
        ]);

    $response->assertSuccessful();
    $this->assertDatabaseHas('hotspots', [
        'scene_id' => $scene->id,
        'from_image_id' => $image1->id,
        'to_image_id' => $image2->id,
    ]);
});

it('returns 403 for viewer attempting to create a hotspot', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image1 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $image2 = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($viewer)
        ->postJson("/scenes/{$scene->slug}/hotspots", [
            'from_image_id' => $image1->id,
            'to_image_id' => $image2->id,
            'position_x' => 100.0,
            'position_y' => 0.0,
            'position_z' => 50.0,
        ]);

    $response->assertForbidden();
});

// ===========================================================================
// show
// ===========================================================================

it('allows admin to show a hotspot', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image1 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $image2 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $hotspot = Hotspot::factory()->create([
        'scene_id' => $scene->id,
        'from_image_id' => $image1->id,
        'to_image_id' => $image2->id,
    ]);

    $response = $this->actingAs($admin)
        ->getJson("/hotspots/{$hotspot->slug}");

    $response->assertSuccessful()
        ->assertJsonPath('slug', $hotspot->slug);
});

// ===========================================================================
// update
// ===========================================================================

it('allows admin to update a hotspot position', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image1 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $image2 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $hotspot = Hotspot::factory()->create([
        'scene_id' => $scene->id,
        'from_image_id' => $image1->id,
        'to_image_id' => $image2->id,
    ]);

    $response = $this->actingAs($admin)
        ->putJson("/hotspots/{$hotspot->slug}", [
            'position_x' => 300.0,
            'position_y' => 150.0,
            'position_z' => 75.0,
        ]);

    $response->assertSuccessful();
    $this->assertDatabaseHas('hotspots', [
        'id' => $hotspot->id,
        'position_x' => 300.0,
        'position_y' => 150.0,
        'position_z' => 75.0,
    ]);
});

it('returns 403 for viewer attempting to update a hotspot', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image1 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $image2 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $hotspot = Hotspot::factory()->create([
        'scene_id' => $scene->id,
        'from_image_id' => $image1->id,
        'to_image_id' => $image2->id,
    ]);

    $response = $this->actingAs($viewer)
        ->putJson("/hotspots/{$hotspot->slug}", [
            'position_x' => 999.0,
        ]);

    $response->assertForbidden();
});

// ===========================================================================
// destroy
// ===========================================================================

it('allows admin to delete a hotspot and returns 204', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image1 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $image2 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $hotspot = Hotspot::factory()->create([
        'scene_id' => $scene->id,
        'from_image_id' => $image1->id,
        'to_image_id' => $image2->id,
    ]);

    $response = $this->actingAs($admin)
        ->deleteJson("/hotspots/{$hotspot->slug}");

    $response->assertNoContent();
    $this->assertDatabaseMissing('hotspots', ['id' => $hotspot->id]);
});

it('returns 403 for viewer attempting to delete a hotspot', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image1 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $image2 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $hotspot = Hotspot::factory()->create([
        'scene_id' => $scene->id,
        'from_image_id' => $image1->id,
        'to_image_id' => $image2->id,
    ]);

    $response = $this->actingAs($viewer)
        ->deleteJson("/hotspots/{$hotspot->slug}");

    $response->assertForbidden();
    $this->assertDatabaseHas('hotspots', ['id' => $hotspot->id]);
});
