<?php

use App\Models\Project;
use App\Models\User;
use App\Policies\ProjectPolicy;

beforeEach(function () {
    seedRoles();
    $this->policy = new ProjectPolicy;
});

it('allows any user to view any projects', function () {
    $user = User::factory()->create();

    expect($this->policy->viewAny($user))->toBeTrue();
});

it('allows viewing public projects', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['is_public' => true]);

    expect($this->policy->view($user, $project))->toBeTrue();
});

it('allows admin to view any project', function () {
    $admin = createAdmin();
    $project = Project::factory()->create(['is_public' => false]);

    expect($this->policy->view($admin, $project))->toBeTrue();
});

it('allows project creator to view their project', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $user->id, 'is_public' => false]);

    expect($this->policy->view($user, $project))->toBeTrue();
});

it('allows assigned owner to view private project', function () {
    $project = Project::factory()->create(['is_public' => false]);
    $owner = createProjectOwner($project);

    expect($this->policy->view($owner, $project))->toBeTrue();
});

it('allows assigned viewer to view private project', function () {
    $project = Project::factory()->create(['is_public' => false]);
    $viewer = createProjectViewer($project);

    expect($this->policy->view($viewer, $project))->toBeTrue();
});

it('denies unassigned user viewing private project', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['is_public' => false]);

    expect($this->policy->view($user, $project))->toBeFalse();
});

it('allows only admin to create projects', function () {
    $admin = createAdmin();
    $client = createClient();

    expect($this->policy->create($admin))->toBeTrue()
        ->and($this->policy->create($client))->toBeFalse();
});

it('allows admin to update any project', function () {
    $admin = createAdmin();
    $project = Project::factory()->create();

    expect($this->policy->update($admin, $project))->toBeTrue();
});

it('allows project creator to update', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $user->id]);

    expect($this->policy->update($user, $project))->toBeTrue();
});

it('allows assigned owner to update', function () {
    $project = Project::factory()->create();
    $owner = createProjectOwner($project);

    expect($this->policy->update($owner, $project))->toBeTrue();
});

it('denies assigned viewer from updating', function () {
    $project = Project::factory()->create();
    $viewer = createProjectViewer($project);

    expect($this->policy->update($viewer, $project))->toBeFalse();
});

it('allows admin to delete any project', function () {
    $admin = createAdmin();
    $project = Project::factory()->create();

    expect($this->policy->delete($admin, $project))->toBeTrue();
});

it('allows project creator to delete', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $user->id]);

    expect($this->policy->delete($user, $project))->toBeTrue();
});

it('denies assigned owner from deleting', function () {
    $project = Project::factory()->create();
    $owner = createProjectOwner($project);

    expect($this->policy->delete($owner, $project))->toBeFalse();
});

it('allows admin to assign users', function () {
    $admin = createAdmin();
    $project = Project::factory()->create();

    expect($this->policy->assignUsers($admin, $project))->toBeTrue();
});

it('allows project creator to assign users', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $user->id]);

    expect($this->policy->assignUsers($user, $project))->toBeTrue();
});

it('allows assigned owner to assign users', function () {
    $project = Project::factory()->create();
    $owner = createProjectOwner($project);

    expect($this->policy->assignUsers($owner, $project))->toBeTrue();
});

it('allows admin to make project public', function () {
    $admin = createAdmin();
    $project = Project::factory()->create();

    expect($this->policy->makePublic($admin, $project))->toBeTrue();
});

it('allows project creator to make public', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $user->id]);

    expect($this->policy->makePublic($user, $project))->toBeTrue();
});

it('denies assigned owner from making project public', function () {
    $project = Project::factory()->create();
    $owner = createProjectOwner($project);

    expect($this->policy->makePublic($owner, $project))->toBeFalse();
});
