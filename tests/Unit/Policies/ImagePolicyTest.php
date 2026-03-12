<?php

use App\Models\Image;
use App\Models\Project;
use App\Models\Scene;
use App\Models\User;
use App\Policies\ImagePolicy;

beforeEach(function () {
    seedRoles();
    $this->policy = new ImagePolicy;
});

it('allows viewing image in public project', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['is_public' => true]);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    expect($this->policy->view($user, $image))->toBeTrue();
});

it('allows admin to view any image', function () {
    $admin = createAdmin();
    $image = Image::factory()->fake()->create();

    expect($this->policy->view($admin, $image))->toBeTrue();
});

it('denies unassigned user viewing image in private project', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['is_public' => false]);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    expect($this->policy->view($user, $image))->toBeFalse();
});

it('allows assigned owner to update image', function () {
    $project = Project::factory()->create();
    $owner = createProjectOwner($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    expect($this->policy->update($owner, $image))->toBeTrue();
});

it('denies assigned viewer from updating image', function () {
    $project = Project::factory()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    expect($this->policy->update($viewer, $image))->toBeFalse();
});

it('allows admin to delete image', function () {
    $admin = createAdmin();
    $image = Image::factory()->fake()->create();

    expect($this->policy->delete($admin, $image))->toBeTrue();
});

it('denies assigned viewer from deleting image', function () {
    $project = Project::factory()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    expect($this->policy->delete($viewer, $image))->toBeFalse();
});
