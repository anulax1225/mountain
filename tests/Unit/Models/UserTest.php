<?php

use App\Models\Project;
use App\Models\Role;
use App\Models\User;

it('has many projects', function () {
    $user = User::factory()->create();
    Project::factory()->count(2)->create(['user_id' => $user->id]);

    expect($user->projects)->toHaveCount(2);
});

it('has roles via belongs to many', function () {
    seedRoles();
    $user = User::factory()->create();
    $adminRole = Role::where('slug', 'admin')->first();
    $user->roles()->attach($adminRole);

    expect($user->roles)->toHaveCount(1)
        ->and($user->roles->first()->slug)->toBe('admin');
});

it('has project access via belongs to many with pivot', function () {
    seedRoles();
    $user = User::factory()->create();
    $project = Project::factory()->create();
    $ownerRole = Role::where('slug', 'owner')->first();
    $user->projectAccess()->attach($project->id, ['role_id' => $ownerRole->id]);

    expect($user->projectAccess)->toHaveCount(1)
        ->and($user->projectAccess->first()->pivot->role_id)->toBe($ownerRole->id);
});

it('detects pending invitation', function () {
    $user = User::factory()->create([
        'invitation_token' => 'some-token',
        'invitation_accepted_at' => null,
    ]);

    expect($user->hasPendingInvitation())->toBeTrue();
});

it('detects no pending invitation when accepted', function () {
    $user = User::factory()->create([
        'invitation_token' => 'some-token',
        'invitation_accepted_at' => now(),
    ]);

    expect($user->hasPendingInvitation())->toBeFalse();
});

it('detects no pending invitation when no token', function () {
    $user = User::factory()->create([
        'invitation_token' => null,
        'invitation_accepted_at' => null,
    ]);

    expect($user->hasPendingInvitation())->toBeFalse();
});

it('detects completed registration when accepted', function () {
    $user = User::factory()->create([
        'invitation_token' => 'some-token',
        'invitation_accepted_at' => now(),
    ]);

    expect($user->hasCompletedRegistration())->toBeTrue();
});

it('detects completed registration when no token', function () {
    $user = User::factory()->create([
        'invitation_token' => null,
        'invitation_accepted_at' => null,
    ]);

    expect($user->hasCompletedRegistration())->toBeTrue();
});

it('detects incomplete registration', function () {
    $user = User::factory()->create([
        'invitation_token' => 'some-token',
        'invitation_accepted_at' => null,
    ]);

    expect($user->hasCompletedRegistration())->toBeFalse();
});

it('checks hasRole by name', function () {
    seedRoles();
    $user = User::factory()->create();
    $user->roles()->attach(Role::where('slug', 'admin')->first());

    expect($user->hasRole('Admin'))->toBeTrue()
        ->and($user->hasRole('Client'))->toBeFalse();
});

it('identifies admin user', function () {
    $admin = createAdmin();

    expect($admin->isAdmin())->toBeTrue()
        ->and($admin->isClient())->toBeFalse();
});

it('identifies client user', function () {
    $client = createClient();

    expect($client->isClient())->toBeTrue()
        ->and($client->isAdmin())->toBeFalse();
});

// canAccessProject tests
it('allows admin to access any project', function () {
    $admin = createAdmin();
    $project = Project::factory()->create();

    expect($admin->canAccessProject($project, 'view'))->toBeTrue()
        ->and($admin->canAccessProject($project, 'update'))->toBeTrue();
});

it('allows project creator to access their project', function () {
    seedRoles();
    $user = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $user->id]);

    expect($user->canAccessProject($project, 'view'))->toBeTrue()
        ->and($user->canAccessProject($project, 'update'))->toBeTrue();
});

it('allows assigned owner to view and update', function () {
    $project = Project::factory()->create();
    $owner = createProjectOwner($project);

    expect($owner->canAccessProject($project, 'view'))->toBeTrue()
        ->and($owner->canAccessProject($project, 'update'))->toBeTrue();
});

it('allows assigned viewer to view but not update', function () {
    $project = Project::factory()->create();
    $viewer = createProjectViewer($project);

    expect($viewer->canAccessProject($project, 'view'))->toBeTrue()
        ->and($viewer->canAccessProject($project, 'update'))->toBeFalse();
});

it('denies unassigned user access', function () {
    seedRoles();
    $user = User::factory()->create();
    $project = Project::factory()->create();

    expect($user->canAccessProject($project, 'view'))->toBeFalse()
        ->and($user->canAccessProject($project, 'update'))->toBeFalse();
});

// isProjectOwner tests
it('admin is always project owner', function () {
    $admin = createAdmin();
    $project = Project::factory()->create();

    expect($admin->isProjectOwner($project))->toBeTrue();
});

it('project creator is always project owner', function () {
    seedRoles();
    $user = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $user->id]);

    expect($user->isProjectOwner($project))->toBeTrue();
});

it('assigned owner returns true for isProjectOwner', function () {
    $project = Project::factory()->create();
    $owner = createProjectOwner($project);

    expect($owner->isProjectOwner($project))->toBeTrue();
});

it('assigned viewer returns false for isProjectOwner', function () {
    $project = Project::factory()->create();
    $viewer = createProjectViewer($project);

    expect($viewer->isProjectOwner($project))->toBeFalse();
});

// accessibleProjects tests
it('admin sees all projects', function () {
    $admin = createAdmin();
    Project::factory()->count(3)->create();

    expect($admin->accessibleProjects())->toHaveCount(3);
});

it('client sees own and assigned projects', function () {
    $client = createClient();
    // Own project
    Project::factory()->create(['user_id' => $client->id]);
    // Assigned project
    $assignedProject = Project::factory()->create();
    $assignedProject->assignedUsers()->attach($client->id, [
        'role_id' => Role::where('slug', 'viewer')->first()->id,
    ]);
    // Other project (should not be visible)
    Project::factory()->create();

    expect($client->accessibleProjects())->toHaveCount(2);
});

it('hides password and tokens in serialization', function () {
    $user = User::factory()->create();
    $array = $user->toArray();

    expect($array)->not->toHaveKey('password')
        ->and($array)->not->toHaveKey('remember_token')
        ->and($array)->not->toHaveKey('invitation_token');
});
