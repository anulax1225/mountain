<?php

use App\Models\Image;
use App\Models\Project;
use App\Models\Scene;
use Illuminate\Support\Facades\Storage;

// ---------------------------------------------------------------------------
// show
// ---------------------------------------------------------------------------

it('allows admin to view scene page', function () {
    $admin = createAdmin();
    $project = Project::factory()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($admin)
        ->get(route('dashboard.scene', $scene));

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/SceneShow')
            ->has('scene')
        );
});

it('allows project creator to view scene page', function () {
    $creator = createClient();
    $project = Project::factory()->create(['user_id' => $creator->id]);
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($creator)
        ->get(route('dashboard.scene', $scene));

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/SceneShow')
            ->has('scene')
        );
});

it('allows project owner to view scene page', function () {
    $project = Project::factory()->create();
    $owner = createProjectOwner($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($owner)
        ->get(route('dashboard.scene', $scene));

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/SceneShow')
            ->has('scene')
        );
});

it('allows project viewer to view scene page', function () {
    $project = Project::factory()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($viewer)
        ->get(route('dashboard.scene', $scene));

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/SceneShow')
            ->has('scene')
        );
});

it('returns 403 for client not assigned to project when viewing scene', function () {
    $client = createClient();
    $project = Project::factory()->private()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($client)
        ->get(route('dashboard.scene', $scene));

    $response->assertForbidden();
});

it('redirects unauthenticated user to login when viewing scene', function () {
    $project = Project::factory()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->get(route('dashboard.scene', $scene));

    $response->assertRedirect(route('login'));
});

// ---------------------------------------------------------------------------
// destroyImage
// ---------------------------------------------------------------------------

it('allows admin to delete an image', function () {
    Storage::fake('s3');

    $admin = createAdmin();
    $project = Project::factory()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($admin)
        ->delete(route('web.images.destroy', $image));

    $response->assertRedirect();
    $this->assertDatabaseMissing('images', ['id' => $image->id]);
});

it('allows project creator to delete an image', function () {
    Storage::fake('s3');

    $creator = createClient();
    $project = Project::factory()->create(['user_id' => $creator->id]);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($creator)
        ->delete(route('web.images.destroy', $image));

    $response->assertRedirect();
    $this->assertDatabaseMissing('images', ['id' => $image->id]);
});

it('allows project owner to delete an image', function () {
    Storage::fake('s3');

    $project = Project::factory()->create();
    $owner = createProjectOwner($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($owner)
        ->delete(route('web.images.destroy', $image));

    $response->assertRedirect();
    $this->assertDatabaseMissing('images', ['id' => $image->id]);
});

it('returns 403 for project viewer attempting to delete an image', function () {
    $project = Project::factory()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->actingAs($viewer)
        ->delete(route('web.images.destroy', $image));

    $response->assertForbidden();
    $this->assertDatabaseHas('images', ['id' => $image->id]);
});

it('redirects unauthenticated user to login when deleting an image', function () {
    $project = Project::factory()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $response = $this->delete(route('web.images.destroy', $image));

    $response->assertRedirect(route('login'));
});
