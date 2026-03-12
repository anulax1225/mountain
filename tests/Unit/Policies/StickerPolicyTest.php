<?php

use App\Models\Image;
use App\Models\Project;
use App\Models\Scene;
use App\Models\Sticker;
use App\Models\User;
use App\Policies\StickerPolicy;

beforeEach(function () {
    seedRoles();
    $this->policy = new StickerPolicy;
});

it('allows viewing sticker in public project', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['is_public' => true]);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $sticker = Sticker::factory()->create(['image_id' => $image->id]);

    expect($this->policy->view($user, $sticker))->toBeTrue();
});

it('denies unassigned user viewing sticker in private project', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['is_public' => false]);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $sticker = Sticker::factory()->create(['image_id' => $image->id]);

    expect($this->policy->view($user, $sticker))->toBeFalse();
});

it('allows assigned owner to update sticker', function () {
    $project = Project::factory()->create();
    $owner = createProjectOwner($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $sticker = Sticker::factory()->create(['image_id' => $image->id]);

    expect($this->policy->update($owner, $sticker))->toBeTrue();
});

it('denies assigned viewer from updating sticker', function () {
    $project = Project::factory()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $sticker = Sticker::factory()->create(['image_id' => $image->id]);

    expect($this->policy->update($viewer, $sticker))->toBeFalse();
});

it('allows admin to delete sticker', function () {
    $admin = createAdmin();
    $sticker = Sticker::factory()->create();

    expect($this->policy->delete($admin, $sticker))->toBeTrue();
});

it('denies assigned viewer from deleting sticker', function () {
    $project = Project::factory()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $sticker = Sticker::factory()->create(['image_id' => $image->id]);

    expect($this->policy->delete($viewer, $sticker))->toBeFalse();
});
