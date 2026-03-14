<?php

use App\Models\Image;
use App\Models\Project;
use App\Models\Scene;

it('lists only public projects', function () {
    Project::factory()->create(['is_public' => true]);
    Project::factory()->create(['is_public' => true]);
    Project::factory()->create(['is_public' => false]);

    $response = $this->get('/gallery');

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('gallery/Index')
            ->has('projects.data', 2)
        );
});

it('shows public project in gallery', function () {
    $project = Project::factory()->create(['is_public' => true]);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $project->update(['start_image_id' => $image->id]);

    $response = $this->get('/gallery/'.$project->slug);

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('gallery/Show')
            ->has('project')
        );
});

it('returns 404 for private project in gallery', function () {
    $project = Project::factory()->create(['is_public' => false]);

    $response = $this->get('/gallery/'.$project->slug);

    $response->assertStatus(404);
});

it('shows embed page for public project', function () {
    $project = Project::factory()->create(['is_public' => true]);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $project->update(['start_image_id' => $image->id]);

    $response = $this->get('/gallery/'.$project->slug.'/embed');

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('gallery/Embed')
            ->has('project')
        );
});

it('returns 404 for private project on embed', function () {
    $project = Project::factory()->create(['is_public' => false]);

    $response = $this->get('/gallery/'.$project->slug.'/embed');

    $response->assertStatus(404);
});

it('removes x-frame-options header on gallery embed', function () {
    $project = Project::factory()->create(['is_public' => true]);

    $response = $this->get('/gallery/'.$project->slug.'/embed');

    $response->assertHeaderMissing('X-Frame-Options');
});
