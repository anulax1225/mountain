<?php

use App\Models\Image;
use App\Models\Project;
use App\Models\Scene;

// ---------------------------------------------------------------------------
// Gallery embed (allow-iframe middleware applied)
// ---------------------------------------------------------------------------

it('gallery embed response does not have x-frame-options header', function () {
    $project = Project::factory()->public()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $project->update(['start_image_id' => $image->id]);

    $this->get(route('gallery.embed', $project->slug))
        ->assertSuccessful()
        ->assertHeaderMissing('X-Frame-Options');
});

it('gallery embed response has content-security-policy header with frame-ancestors wildcard', function () {
    $project = Project::factory()->public()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $project->update(['start_image_id' => $image->id]);

    $this->get(route('gallery.embed', $project->slug))
        ->assertSuccessful()
        ->assertHeader('Content-Security-Policy', 'frame-ancestors *');
});

// ---------------------------------------------------------------------------
// Gallery show (allow-iframe middleware NOT applied)
// ---------------------------------------------------------------------------

it('gallery show response does not have frame-ancestors wildcard csp header', function () {
    $project = Project::factory()->public()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $project->update(['start_image_id' => $image->id]);

    $this->get(route('gallery.show', $project->slug))
        ->assertSuccessful()
        ->assertHeaderMissing('Content-Security-Policy');
});

// ---------------------------------------------------------------------------
// Normal page (allow-iframe middleware NOT applied)
// ---------------------------------------------------------------------------

it('welcome page does not have frame-ancestors wildcard csp header', function () {
    $this->get('/')
        ->assertSuccessful()
        ->assertHeaderMissing('Content-Security-Policy');
});
