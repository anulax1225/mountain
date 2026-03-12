<?php

use App\Models\User;

// ---------------------------------------------------------------------------
// Auth shared data
// ---------------------------------------------------------------------------

it('shares auth user data for an authenticated user', function () {
    $user = createClient();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('auth.user')
            ->where('auth.user.id', $user->id)
            ->where('auth.user.name', $user->name)
            ->where('auth.user.email', $user->email)
            ->has('auth.user.is_admin')
            ->has('auth.user.can_create_projects')
        );
});

it('shares is_admin true and can_create_projects true for admin user', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('auth.user.is_admin', true)
            ->where('auth.user.can_create_projects', true)
        );
});

it('shares is_admin false and can_create_projects false for client user', function () {
    $client = createClient();

    $this->actingAs($client)
        ->get(route('dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('auth.user.is_admin', false)
            ->where('auth.user.can_create_projects', false)
        );
});

it('shares auth user as null for unauthenticated guest', function () {
    $this->get('/')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('auth.user', null)
        );
});

it('shares app name in inertia props', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('name', config('app.name'))
        );
});

it('shares quote data with message and author keys', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('quote.message')
            ->has('quote.author')
        );
});
