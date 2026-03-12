<?php

use App\Models\Image;
use App\Models\Project;
use App\Models\Scene;
use Illuminate\Support\Facades\Storage;

// ===========================================================================
// index
// ===========================================================================

it('allows admin to list scene images', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    Image::factory()->fake()->count(3)->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($admin)
        ->getJson("/scenes/{$scene->slug}/images");

    $response->assertSuccessful()
        ->assertJsonCount(3, 'data');
});

it('returns 403 for unassigned client on private project image list', function () {
    $client = createClient();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($client)
        ->getJson("/scenes/{$scene->slug}/images");

    $response->assertForbidden();
});

// ===========================================================================
// store
// ===========================================================================

it('allows admin to store an image record from an S3 key', function () {
    Storage::fake('s3');

    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $key = 'uploads/test-panorama.jpg';
    Storage::disk('s3')->put($key, 'fake-image-content');

    $response = $this->actingAs($admin)
        ->postJson("/scenes/{$scene->slug}/images", [
            'key' => $key,
            'name' => 'Test Panorama',
            'size' => 1024000,
            'mime' => 'image/jpeg',
        ]);

    $response->assertSuccessful();
    $this->assertDatabaseHas('images', [
        'scene_id' => $scene->id,
        'name' => 'Test Panorama',
        'size' => 1024000,
    ]);
});

it('returns 403 for viewer attempting to store an image', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($viewer)
        ->postJson("/scenes/{$scene->slug}/images", [
            'key' => 'uploads/test.jpg',
            'name' => 'Test',
            'size' => 1024,
            'mime' => 'image/jpeg',
        ]);

    $response->assertForbidden();
});

// ===========================================================================
// show
// ===========================================================================

it('allows admin to show an image', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($admin)
        ->getJson("/images/{$image->slug}");

    $response->assertSuccessful()
        ->assertJsonPath('slug', $image->slug);
});

// ===========================================================================
// update
// ===========================================================================

it('allows admin to update image name', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($admin)
        ->postJson("/images/{$image->slug}", [
            'name' => 'Updated Image Name',
        ]);

    $response->assertSuccessful();
    $this->assertDatabaseHas('images', [
        'id' => $image->id,
        'name' => 'Updated Image Name',
    ]);
});

it('returns 403 for viewer attempting to update an image', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($viewer)
        ->postJson("/images/{$image->slug}", [
            'name' => 'Viewer Update Attempt',
        ]);

    $response->assertForbidden();
});

// ===========================================================================
// destroy
// ===========================================================================

it('allows admin to delete an image and returns 204', function () {
    Storage::fake('s3');

    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($admin)
        ->deleteJson("/images/{$image->slug}");

    $response->assertNoContent();
    $this->assertDatabaseMissing('images', ['id' => $image->id]);
});

it('returns 403 for viewer attempting to delete an image', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($viewer)
        ->deleteJson("/images/{$image->slug}");

    $response->assertForbidden();
    $this->assertDatabaseHas('images', ['id' => $image->id]);
});

// ===========================================================================
// unauthenticated
// ===========================================================================

it('redirects unauthenticated requests to login', function () {
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->get("/scenes/{$scene->slug}/images");

    $response->assertRedirect(route('login'));
});
