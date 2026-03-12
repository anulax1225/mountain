<?php

use App\Models\Project;
use App\Models\Scene;
use App\Models\User;
use App\Policies\ScenePolicy;

beforeEach(function () {
    seedRoles();
    $this->policy = new ScenePolicy;
});

it('allows any user to view any scenes', function () {
    $user = User::factory()->create();

    expect($this->policy->viewAny($user))->toBeTrue();
});

it('allows viewing scene in public project', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['is_public' => true]);
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    expect($this->policy->view($user, $scene))->toBeTrue();
});

it('allows admin to view any scene', function () {
    $admin = createAdmin();
    $scene = Scene::factory()->create();

    expect($this->policy->view($admin, $scene))->toBeTrue();
});

it('allows project creator to view scene', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $user->id]);
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    expect($this->policy->view($user, $scene))->toBeTrue();
});

it('allows assigned viewer to view scene', function () {
    $project = Project::factory()->create(['is_public' => false]);
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    expect($this->policy->view($viewer, $scene))->toBeTrue();
});

it('denies unassigned user viewing scene in private project', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['is_public' => false]);
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    expect($this->policy->view($user, $scene))->toBeFalse();
});

it('allows any user to create scenes', function () {
    $user = User::factory()->create();

    expect($this->policy->create($user))->toBeTrue();
});

it('allows admin to update scene', function () {
    $admin = createAdmin();
    $scene = Scene::factory()->create();

    expect($this->policy->update($admin, $scene))->toBeTrue();
});

it('allows project creator to update scene', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $user->id]);
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    expect($this->policy->update($user, $scene))->toBeTrue();
});

it('allows assigned owner to update scene', function () {
    $project = Project::factory()->create();
    $owner = createProjectOwner($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    expect($this->policy->update($owner, $scene))->toBeTrue();
});

it('denies assigned viewer from updating scene', function () {
    $project = Project::factory()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    expect($this->policy->update($viewer, $scene))->toBeFalse();
});

it('allows admin to delete scene', function () {
    $admin = createAdmin();
    $scene = Scene::factory()->create();

    expect($this->policy->delete($admin, $scene))->toBeTrue();
});

it('allows project creator to delete scene', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $user->id]);
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    expect($this->policy->delete($user, $scene))->toBeTrue();
});

it('allows assigned owner to delete scene', function () {
    $project = Project::factory()->create();
    $owner = createProjectOwner($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    expect($this->policy->delete($owner, $scene))->toBeTrue();
});

it('denies assigned viewer from deleting scene', function () {
    $project = Project::factory()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    expect($this->policy->delete($viewer, $scene))->toBeFalse();
});
