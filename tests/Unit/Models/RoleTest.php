<?php

use App\Models\Role;
use App\Models\User;

beforeEach(function () {
    seedRoles();
});

it('has users relationship', function () {
    $role = Role::where('slug', 'admin')->first();
    $user = User::factory()->create();
    $role->users()->attach($user);

    expect($role->users)->toHaveCount(1)
        ->and($role->users->first()->id)->toBe($user->id);
});

it('identifies admin role', function () {
    $role = Role::where('slug', 'admin')->first();

    expect($role->isAdmin())->toBeTrue()
        ->and($role->isClient())->toBeFalse()
        ->and($role->isOwner())->toBeFalse()
        ->and($role->isViewer())->toBeFalse();
});

it('identifies client role', function () {
    $role = Role::where('slug', 'client')->first();

    expect($role->isClient())->toBeTrue()
        ->and($role->isAdmin())->toBeFalse();
});

it('identifies owner role', function () {
    $role = Role::where('slug', 'owner')->first();

    expect($role->isOwner())->toBeTrue()
        ->and($role->isAdmin())->toBeFalse();
});

it('identifies viewer role', function () {
    $role = Role::where('slug', 'viewer')->first();

    expect($role->isViewer())->toBeTrue()
        ->and($role->isAdmin())->toBeFalse();
});

it('identifies global roles', function () {
    $admin = Role::where('slug', 'admin')->first();
    $client = Role::where('slug', 'client')->first();
    $owner = Role::where('slug', 'owner')->first();
    $viewer = Role::where('slug', 'viewer')->first();

    expect($admin->isGlobalRole())->toBeTrue()
        ->and($client->isGlobalRole())->toBeTrue()
        ->and($owner->isGlobalRole())->toBeFalse()
        ->and($viewer->isGlobalRole())->toBeFalse();
});

it('identifies project roles', function () {
    $admin = Role::where('slug', 'admin')->first();
    $client = Role::where('slug', 'client')->first();
    $owner = Role::where('slug', 'owner')->first();
    $viewer = Role::where('slug', 'viewer')->first();

    expect($owner->isProjectRole())->toBeTrue()
        ->and($viewer->isProjectRole())->toBeTrue()
        ->and($admin->isProjectRole())->toBeFalse()
        ->and($client->isProjectRole())->toBeFalse();
});
