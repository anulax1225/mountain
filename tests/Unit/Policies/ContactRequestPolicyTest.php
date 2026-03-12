<?php

use App\Models\ContactRequest;
use App\Models\User;
use App\Policies\ContactRequestPolicy;

beforeEach(function () {
    seedRoles();
    $this->policy = new ContactRequestPolicy;
});

it('allows only admin to view any contact requests', function () {
    $admin = createAdmin();
    $user = User::factory()->create();

    expect($this->policy->viewAny($admin))->toBeTrue()
        ->and($this->policy->viewAny($user))->toBeFalse();
});

it('allows only admin to view a contact request', function () {
    $admin = createAdmin();
    $user = User::factory()->create();
    $cr = ContactRequest::factory()->create();

    expect($this->policy->view($admin, $cr))->toBeTrue()
        ->and($this->policy->view($user, $cr))->toBeFalse();
});

it('allows anyone to create a contact request', function () {
    $user = User::factory()->create();

    expect($this->policy->create($user))->toBeTrue();
});

it('allows guest to create a contact request', function () {
    expect($this->policy->create(null))->toBeTrue();
});

it('allows only admin to update contact requests', function () {
    $admin = createAdmin();
    $user = User::factory()->create();
    $cr = ContactRequest::factory()->create();

    expect($this->policy->update($admin, $cr))->toBeTrue()
        ->and($this->policy->update($user, $cr))->toBeFalse();
});

it('allows only admin to delete contact requests', function () {
    $admin = createAdmin();
    $user = User::factory()->create();
    $cr = ContactRequest::factory()->create();

    expect($this->policy->delete($admin, $cr))->toBeTrue()
        ->and($this->policy->delete($user, $cr))->toBeFalse();
});
