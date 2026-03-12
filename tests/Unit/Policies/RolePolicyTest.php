<?php

use App\Models\Role;
use App\Models\User;
use App\Policies\RolePolicy;

beforeEach(function () {
    seedRoles();
    $this->policy = new RolePolicy;
});

it('allows only admin to view any roles', function () {
    $admin = createAdmin();
    $user = User::factory()->create();

    expect($this->policy->viewAny($admin))->toBeTrue()
        ->and($this->policy->viewAny($user))->toBeFalse();
});

it('allows only admin to view a role', function () {
    $admin = createAdmin();
    $user = User::factory()->create();
    $role = Role::where('slug', 'client')->first();

    expect($this->policy->view($admin, $role))->toBeTrue()
        ->and($this->policy->view($user, $role))->toBeFalse();
});

it('allows only admin to create roles', function () {
    $admin = createAdmin();
    $user = User::factory()->create();

    expect($this->policy->create($admin))->toBeTrue()
        ->and($this->policy->create($user))->toBeFalse();
});

it('allows only admin to update roles', function () {
    $admin = createAdmin();
    $user = User::factory()->create();
    $role = Role::where('slug', 'client')->first();

    expect($this->policy->update($admin, $role))->toBeTrue()
        ->and($this->policy->update($user, $role))->toBeFalse();
});

it('allows only admin to delete roles', function () {
    $admin = createAdmin();
    $user = User::factory()->create();
    $role = Role::where('slug', 'client')->first();

    expect($this->policy->delete($admin, $role))->toBeTrue()
        ->and($this->policy->delete($user, $role))->toBeFalse();
});

it('allows only admin to assign roles', function () {
    $admin = createAdmin();
    $user = User::factory()->create();

    expect($this->policy->assign($admin))->toBeTrue()
        ->and($this->policy->assign($user))->toBeFalse();
});
