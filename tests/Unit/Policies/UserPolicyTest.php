<?php

use App\Models\User;
use App\Policies\UserPolicy;

beforeEach(function () {
    seedRoles();
    $this->policy = new UserPolicy;
});

it('allows only admin to view any users', function () {
    $admin = createAdmin();
    $user = User::factory()->create();

    expect($this->policy->viewAny($admin))->toBeTrue()
        ->and($this->policy->viewAny($user))->toBeFalse();
});

it('allows admin to view any user', function () {
    $admin = createAdmin();
    $other = User::factory()->create();

    expect($this->policy->view($admin, $other))->toBeTrue();
});

it('allows user to view self', function () {
    $user = User::factory()->create();

    expect($this->policy->view($user, $user))->toBeTrue();
});

it('denies non-admin viewing other user', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    expect($this->policy->view($user, $other))->toBeFalse();
});

it('allows only admin to create users', function () {
    $admin = createAdmin();
    $user = User::factory()->create();

    expect($this->policy->create($admin))->toBeTrue()
        ->and($this->policy->create($user))->toBeFalse();
});

it('allows admin to update any user', function () {
    $admin = createAdmin();
    $other = User::factory()->create();

    expect($this->policy->update($admin, $other))->toBeTrue();
});

it('allows user to update self', function () {
    $user = User::factory()->create();

    expect($this->policy->update($user, $user))->toBeTrue();
});

it('denies non-admin updating other user', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    expect($this->policy->update($user, $other))->toBeFalse();
});

it('allows admin to delete other users', function () {
    $admin = createAdmin();
    $other = User::factory()->create();

    expect($this->policy->delete($admin, $other))->toBeTrue();
});

it('denies admin from deleting self', function () {
    $admin = createAdmin();

    expect($this->policy->delete($admin, $admin))->toBeFalse();
});

it('denies non-admin from deleting users', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    expect($this->policy->delete($user, $other))->toBeFalse();
});

it('allows only admin to manage roles', function () {
    $admin = createAdmin();
    $user = User::factory()->create();

    expect($this->policy->manageRoles($admin))->toBeTrue()
        ->and($this->policy->manageRoles($user))->toBeFalse();
});
