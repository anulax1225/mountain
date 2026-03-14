<?php

use App\Models\BlurRegion;
use App\Models\Image;
use App\Models\Project;
use App\Models\Scene;

// ===========================================================================
// index
// ===========================================================================

it('allows admin to list blur regions for an image', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    BlurRegion::factory()->count(3)->create(['image_id' => $image->id]);

    $response = $this->actingAs($admin)
        ->getJson("/images/{$image->slug}/blur-regions");

    $response->assertSuccessful()
        ->assertJsonCount(3, 'data');
});

it('allows project owner to list blur regions for an image', function () {
    $project = Project::factory()->private()->create();
    $owner = createProjectOwner($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    BlurRegion::factory()->count(2)->create(['image_id' => $image->id]);

    $response = $this->actingAs($owner)
        ->getJson("/images/{$image->slug}/blur-regions");

    $response->assertSuccessful()
        ->assertJsonCount(2, 'data');
});

it('allows project viewer to list blur regions for an image', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    BlurRegion::factory()->count(2)->create(['image_id' => $image->id]);

    $response = $this->actingAs($viewer)
        ->getJson("/images/{$image->slug}/blur-regions");

    $response->assertSuccessful()
        ->assertJsonCount(2, 'data');
});

it('returns 403 for unassigned client on private project blur region list', function () {
    $client = createClient();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($client)
        ->getJson("/images/{$image->slug}/blur-regions");

    $response->assertForbidden();
});

it('redirects unauthenticated user to login when listing blur regions', function () {
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->getJson("/images/{$image->slug}/blur-regions");

    $response->assertUnauthorized();
});

// ===========================================================================
// store
// ===========================================================================

it('allows admin to create a blur region', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($admin)
        ->postJson("/images/{$image->slug}/blur-regions", [
            'position_x' => 100.0,
            'position_y' => -50.0,
            'position_z' => 200.0,
        ]);

    $response->assertSuccessful();
    $this->assertDatabaseHas('blur_regions', [
        'image_id' => $image->id,
        'position_x' => 100.0,
        'position_y' => -50.0,
        'position_z' => 200.0,
    ]);
});

it('allows project owner to create a blur region', function () {
    $project = Project::factory()->private()->create();
    $owner = createProjectOwner($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($owner)
        ->postJson("/images/{$image->slug}/blur-regions", [
            'position_x' => 50.0,
            'position_y' => 0.0,
            'position_z' => 75.0,
        ]);

    $response->assertSuccessful();
    $this->assertDatabaseHas('blur_regions', [
        'image_id' => $image->id,
        'position_x' => 50.0,
    ]);
});

it('stores null for optional fields when not provided on create', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($admin)
        ->postJson("/images/{$image->slug}/blur-regions", [
            'position_x' => 1.0,
            'position_y' => 2.0,
            'position_z' => 3.0,
        ]);

    $response->assertSuccessful()
        ->assertJsonPath('radius', null)
        ->assertJsonPath('intensity', null)
        ->assertJsonPath('type', null);
});

it('allows creating a blur region with all optional fields', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($admin)
        ->postJson("/images/{$image->slug}/blur-regions", [
            'position_x' => 1.0,
            'position_y' => 2.0,
            'position_z' => 3.0,
            'radius' => 0.1,
            'intensity' => 25,
            'type' => 'pixelate',
        ]);

    $response->assertSuccessful();
    $this->assertDatabaseHas('blur_regions', [
        'image_id' => $image->id,
        'radius' => 0.1,
        'intensity' => 25,
        'type' => 'pixelate',
    ]);
});

it('returns 403 for viewer attempting to create a blur region', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($viewer)
        ->postJson("/images/{$image->slug}/blur-regions", [
            'position_x' => 1.0,
            'position_y' => 2.0,
            'position_z' => 3.0,
        ]);

    $response->assertForbidden();
});

it('returns 403 for unassigned client attempting to create a blur region', function () {
    $client = createClient();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($client)
        ->postJson("/images/{$image->slug}/blur-regions", [
            'position_x' => 1.0,
            'position_y' => 2.0,
            'position_z' => 3.0,
        ]);

    $response->assertForbidden();
});

it('returns 422 when position_x is missing on store', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($admin)
        ->postJson("/images/{$image->slug}/blur-regions", [
            'position_y' => 2.0,
            'position_z' => 3.0,
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['position_x']);
});

it('returns 422 when position_y is missing on store', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($admin)
        ->postJson("/images/{$image->slug}/blur-regions", [
            'position_x' => 1.0,
            'position_z' => 3.0,
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['position_y']);
});

it('returns 422 when position_z is missing on store', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($admin)
        ->postJson("/images/{$image->slug}/blur-regions", [
            'position_x' => 1.0,
            'position_y' => 2.0,
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['position_z']);
});

it('returns 422 when radius is below minimum on store', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($admin)
        ->postJson("/images/{$image->slug}/blur-regions", [
            'position_x' => 1.0,
            'position_y' => 2.0,
            'position_z' => 3.0,
            'radius' => 0.005,
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['radius']);
});

it('returns 422 when radius exceeds maximum on store', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($admin)
        ->postJson("/images/{$image->slug}/blur-regions", [
            'position_x' => 1.0,
            'position_y' => 2.0,
            'position_z' => 3.0,
            'radius' => 0.6,
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['radius']);
});

it('returns 422 when intensity is out of range on store', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($admin)
        ->postJson("/images/{$image->slug}/blur-regions", [
            'position_x' => 1.0,
            'position_y' => 2.0,
            'position_z' => 3.0,
            'intensity' => 100,
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['intensity']);
});

it('returns 422 when type is invalid on store', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($admin)
        ->postJson("/images/{$image->slug}/blur-regions", [
            'position_x' => 1.0,
            'position_y' => 2.0,
            'position_z' => 3.0,
            'type' => 'invalid_type',
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['type']);
});

// ===========================================================================
// show
// ===========================================================================

it('allows admin to show a blur region', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $blurRegion = BlurRegion::factory()->create(['image_id' => $image->id]);

    $response = $this->actingAs($admin)
        ->getJson("/blur-regions/{$blurRegion->slug}");

    $response->assertSuccessful()
        ->assertJsonPath('slug', $blurRegion->slug);
});

it('allows project owner to show a blur region', function () {
    $project = Project::factory()->private()->create();
    $owner = createProjectOwner($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $blurRegion = BlurRegion::factory()->create(['image_id' => $image->id]);

    $response = $this->actingAs($owner)
        ->getJson("/blur-regions/{$blurRegion->slug}");

    $response->assertSuccessful()
        ->assertJsonPath('slug', $blurRegion->slug);
});

it('allows project viewer to show a blur region', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $blurRegion = BlurRegion::factory()->create(['image_id' => $image->id]);

    $response = $this->actingAs($viewer)
        ->getJson("/blur-regions/{$blurRegion->slug}");

    $response->assertSuccessful()
        ->assertJsonPath('slug', $blurRegion->slug);
});

it('returns 403 for unassigned client attempting to show a blur region', function () {
    $client = createClient();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $blurRegion = BlurRegion::factory()->create(['image_id' => $image->id]);

    $response = $this->actingAs($client)
        ->getJson("/blur-regions/{$blurRegion->slug}");

    $response->assertForbidden();
});

it('returns the correct blur region resource fields on show', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $blurRegion = BlurRegion::factory()->atPosition(10.0, 20.0, 30.0)->withRadius(0.1)->create(['image_id' => $image->id]);

    $response = $this->actingAs($admin)
        ->getJson("/blur-regions/{$blurRegion->slug}");

    $response->assertSuccessful()
        ->assertJsonStructure(['id', 'slug', 'image_id', 'position_x', 'position_y', 'position_z', 'radius', 'intensity', 'type'])
        ->assertJsonPath('position_x', 10)
        ->assertJsonPath('position_y', 20)
        ->assertJsonPath('position_z', 30)
        ->assertJsonPath('radius', 0.1);
});

// ===========================================================================
// update
// ===========================================================================

it('allows admin to update a blur region', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $blurRegion = BlurRegion::factory()->create(['image_id' => $image->id]);

    $response = $this->actingAs($admin)
        ->putJson("/blur-regions/{$blurRegion->slug}", [
            'position_x' => 99.0,
            'position_y' => -99.0,
            'position_z' => 50.0,
        ]);

    $response->assertSuccessful();
    $this->assertDatabaseHas('blur_regions', [
        'id' => $blurRegion->id,
        'position_x' => 99.0,
        'position_y' => -99.0,
        'position_z' => 50.0,
    ]);
});

it('allows project owner to update a blur region', function () {
    $project = Project::factory()->private()->create();
    $owner = createProjectOwner($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $blurRegion = BlurRegion::factory()->create(['image_id' => $image->id]);

    $response = $this->actingAs($owner)
        ->putJson("/blur-regions/{$blurRegion->slug}", [
            'radius' => 0.2,
        ]);

    $response->assertSuccessful();
    $this->assertDatabaseHas('blur_regions', [
        'id' => $blurRegion->id,
        'radius' => 0.2,
    ]);
});

it('allows partial update via patch', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $blurRegion = BlurRegion::factory()->create(['image_id' => $image->id]);

    $response = $this->actingAs($admin)
        ->patchJson("/blur-regions/{$blurRegion->slug}", [
            'type' => 'pixelate',
            'intensity' => 30,
        ]);

    $response->assertSuccessful();
    $this->assertDatabaseHas('blur_regions', [
        'id' => $blurRegion->id,
        'type' => 'pixelate',
        'intensity' => 30,
    ]);
});

it('returns 403 for viewer attempting to update a blur region', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $blurRegion = BlurRegion::factory()->create(['image_id' => $image->id]);

    $response = $this->actingAs($viewer)
        ->putJson("/blur-regions/{$blurRegion->slug}", [
            'radius' => 0.3,
        ]);

    $response->assertForbidden();
});

it('returns 403 for unassigned client attempting to update a blur region', function () {
    $client = createClient();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $blurRegion = BlurRegion::factory()->create(['image_id' => $image->id]);

    $response = $this->actingAs($client)
        ->putJson("/blur-regions/{$blurRegion->slug}", [
            'radius' => 0.3,
        ]);

    $response->assertForbidden();
});

it('returns 422 when radius is invalid on update', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $blurRegion = BlurRegion::factory()->create(['image_id' => $image->id]);

    $response = $this->actingAs($admin)
        ->putJson("/blur-regions/{$blurRegion->slug}", [
            'radius' => 1.5,
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['radius']);
});

it('returns 422 when intensity is below minimum on update', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $blurRegion = BlurRegion::factory()->create(['image_id' => $image->id]);

    $response = $this->actingAs($admin)
        ->putJson("/blur-regions/{$blurRegion->slug}", [
            'intensity' => 0,
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['intensity']);
});

it('returns 422 when type is invalid on update', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $blurRegion = BlurRegion::factory()->create(['image_id' => $image->id]);

    $response = $this->actingAs($admin)
        ->putJson("/blur-regions/{$blurRegion->slug}", [
            'type' => 'blur_hard',
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['type']);
});

// ===========================================================================
// destroy
// ===========================================================================

it('allows admin to delete a blur region and returns 204', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $blurRegion = BlurRegion::factory()->create(['image_id' => $image->id]);

    $response = $this->actingAs($admin)
        ->deleteJson("/blur-regions/{$blurRegion->slug}");

    $response->assertNoContent();
    $this->assertDatabaseMissing('blur_regions', ['id' => $blurRegion->id]);
});

it('allows project owner to delete a blur region', function () {
    $project = Project::factory()->private()->create();
    $owner = createProjectOwner($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $blurRegion = BlurRegion::factory()->create(['image_id' => $image->id]);

    $response = $this->actingAs($owner)
        ->deleteJson("/blur-regions/{$blurRegion->slug}");

    $response->assertNoContent();
    $this->assertDatabaseMissing('blur_regions', ['id' => $blurRegion->id]);
});

it('returns 403 for viewer attempting to delete a blur region', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $blurRegion = BlurRegion::factory()->create(['image_id' => $image->id]);

    $response = $this->actingAs($viewer)
        ->deleteJson("/blur-regions/{$blurRegion->slug}");

    $response->assertForbidden();
    $this->assertDatabaseHas('blur_regions', ['id' => $blurRegion->id]);
});

it('returns 403 for unassigned client attempting to delete a blur region', function () {
    $client = createClient();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $blurRegion = BlurRegion::factory()->create(['image_id' => $image->id]);

    $response = $this->actingAs($client)
        ->deleteJson("/blur-regions/{$blurRegion->slug}");

    $response->assertForbidden();
    $this->assertDatabaseHas('blur_regions', ['id' => $blurRegion->id]);
});

it('redirects unauthenticated user to login when deleting a blur region', function () {
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $blurRegion = BlurRegion::factory()->create(['image_id' => $image->id]);

    $response = $this->deleteJson("/blur-regions/{$blurRegion->slug}");

    $response->assertUnauthorized();
});
