<?php

use App\Models\Image;
use App\Models\Project;
use App\Models\Scene;
use App\Models\Sticker;

// ===========================================================================
// index
// ===========================================================================

it('allows admin to list image stickers', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    Sticker::factory()->count(3)->create(['image_id' => $image->id]);

    $response = $this->actingAs($admin)
        ->getJson("/images/{$image->slug}/stickers");

    $response->assertSuccessful()
        ->assertJsonCount(3, 'data');
});

it('returns 403 for unassigned client on private project sticker list', function () {
    $client = createClient();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($client)
        ->getJson("/images/{$image->slug}/stickers");

    $response->assertForbidden();
});

// ===========================================================================
// store
// ===========================================================================

it('allows admin to create a sticker', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($admin)
        ->postJson("/images/{$image->slug}/stickers", [
            'type' => 'text',
            'content' => 'Welcome to this room',
            'position_x' => 100.0,
            'position_y' => -50.0,
            'position_z' => 200.0,
            'scale' => 1.0,
        ]);

    $response->assertSuccessful();
    $this->assertDatabaseHas('stickers', [
        'image_id' => $image->id,
        'type' => 'text',
        'content' => 'Welcome to this room',
    ]);
});

it('returns 403 for viewer attempting to create a sticker', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($viewer)
        ->postJson("/images/{$image->slug}/stickers", [
            'type' => 'emoji',
            'content' => '⭐',
            'position_x' => 0.0,
            'position_y' => 0.0,
            'position_z' => 0.0,
            'scale' => 1.0,
        ]);

    $response->assertForbidden();
});

// ===========================================================================
// show
// ===========================================================================

it('allows admin to show a sticker', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $sticker = Sticker::factory()->create(['image_id' => $image->id]);

    $response = $this->actingAs($admin)
        ->getJson("/stickers/{$sticker->slug}");

    $response->assertSuccessful()
        ->assertJsonPath('slug', $sticker->slug);
});

// ===========================================================================
// update
// ===========================================================================

it('allows admin to update sticker content', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $sticker = Sticker::factory()->text()->create(['image_id' => $image->id]);

    $response = $this->actingAs($admin)
        ->putJson("/stickers/{$sticker->slug}", [
            'content' => 'Updated sticker text',
        ]);

    $response->assertSuccessful();
    $this->assertDatabaseHas('stickers', [
        'id' => $sticker->id,
        'content' => 'Updated sticker text',
    ]);
});

it('returns 403 for viewer attempting to update a sticker', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $sticker = Sticker::factory()->create(['image_id' => $image->id]);

    $response = $this->actingAs($viewer)
        ->putJson("/stickers/{$sticker->slug}", [
            'content' => 'Viewer update attempt',
        ]);

    $response->assertForbidden();
});

// ===========================================================================
// destroy
// ===========================================================================

it('allows admin to delete a sticker and returns 204', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $sticker = Sticker::factory()->create(['image_id' => $image->id]);

    $response = $this->actingAs($admin)
        ->deleteJson("/stickers/{$sticker->slug}");

    $response->assertNoContent();
    $this->assertDatabaseMissing('stickers', ['id' => $sticker->id]);
});

it('returns 403 for viewer attempting to delete a sticker', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $sticker = Sticker::factory()->create(['image_id' => $image->id]);

    $response = $this->actingAs($viewer)
        ->deleteJson("/stickers/{$sticker->slug}");

    $response->assertForbidden();
    $this->assertDatabaseHas('stickers', ['id' => $sticker->id]);
});
