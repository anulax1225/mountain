<?php

use App\Models\Hotspot;
use App\Models\Image;
use App\Models\Project;
use App\Models\Scene;
use App\Models\User;
use App\Policies\HotspotPolicy;

beforeEach(function () {
    seedRoles();
    $this->policy = new HotspotPolicy;
});

it('allows viewing hotspot in public project', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['is_public' => true]);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image1 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $image2 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $hotspot = Hotspot::factory()->create([
        'scene_id' => $scene->id,
        'from_image_id' => $image1->id,
        'to_image_id' => $image2->id,
    ]);

    expect($this->policy->view($user, $hotspot))->toBeTrue();
});

it('denies unassigned user viewing hotspot in private project', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['is_public' => false]);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image1 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $image2 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $hotspot = Hotspot::factory()->create([
        'scene_id' => $scene->id,
        'from_image_id' => $image1->id,
        'to_image_id' => $image2->id,
    ]);

    expect($this->policy->view($user, $hotspot))->toBeFalse();
});

it('allows admin to update hotspot', function () {
    $admin = createAdmin();
    $hotspot = Hotspot::factory()->create();

    expect($this->policy->update($admin, $hotspot))->toBeTrue();
});

it('allows assigned owner to update hotspot', function () {
    $project = Project::factory()->create();
    $owner = createProjectOwner($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image1 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $image2 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $hotspot = Hotspot::factory()->create([
        'scene_id' => $scene->id,
        'from_image_id' => $image1->id,
        'to_image_id' => $image2->id,
    ]);

    expect($this->policy->update($owner, $hotspot))->toBeTrue();
});

it('denies assigned viewer from updating hotspot', function () {
    $project = Project::factory()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image1 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $image2 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $hotspot = Hotspot::factory()->create([
        'scene_id' => $scene->id,
        'from_image_id' => $image1->id,
        'to_image_id' => $image2->id,
    ]);

    expect($this->policy->update($viewer, $hotspot))->toBeFalse();
});

it('allows admin to delete hotspot', function () {
    $admin = createAdmin();
    $hotspot = Hotspot::factory()->create();

    expect($this->policy->delete($admin, $hotspot))->toBeTrue();
});
