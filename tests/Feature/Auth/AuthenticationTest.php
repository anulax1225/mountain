<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

it('can login via web with valid credentials', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password'),
    ]);

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    // webLogin uses Inertia::location which returns 409 for Inertia requests
    // or a redirect for standard requests
    $response->assertStatus(302)->assertRedirect('/dashboard');
});

it('fails web login with invalid credentials', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password'),
    ]);

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertSessionHasErrors('email');
});

it('can logout via web', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $response->assertRedirect('/');
    $this->assertGuest();
});

it('redirects unauthenticated users from dashboard', function () {
    $response = $this->get('/dashboard');

    $response->assertRedirect('/login');
});

it('shows invitation form with valid token', function () {
    $user = User::factory()->create([
        'invitation_token' => 'valid-token',
        'invitation_sent_at' => now(),
        'invitation_accepted_at' => null,
        'password' => Hash::make('temp'),
    ]);

    $response = $this->get('/register/invitation/valid-token');

    $response->assertStatus(200);
});

it('redirects invitation form with expired token', function () {
    $user = User::factory()->create([
        'invitation_token' => 'expired-token',
        'invitation_sent_at' => now()->subDays(8),
        'invitation_accepted_at' => null,
        'password' => Hash::make('temp'),
    ]);

    $response = $this->get('/register/invitation/expired-token');

    $response->assertRedirect('/login');
});

it('redirects invitation form with already-used token', function () {
    $user = User::factory()->create([
        'invitation_token' => 'used-token',
        'invitation_sent_at' => now(),
        'invitation_accepted_at' => now(),
        'password' => Hash::make('temp'),
    ]);

    $response = $this->get('/register/invitation/used-token');

    $response->assertRedirect('/login');
});

it('redirects invitation form with invalid token', function () {
    $response = $this->get('/register/invitation/nonexistent-token');

    $response->assertRedirect('/login');
});

it('completes invitation with valid data', function () {
    $user = User::factory()->create([
        'invitation_token' => 'valid-token',
        'invitation_sent_at' => now(),
        'invitation_accepted_at' => null,
        'password' => Hash::make('temp'),
    ]);

    $response = $this->post('/register/invitation/valid-token', [
        'name' => 'New Name',
        'password' => 'newpassword',
        'password_confirmation' => 'newpassword',
    ]);

    $response->assertStatus(302)->assertRedirect('/dashboard');

    $user->refresh();
    expect($user->invitation_accepted_at)->not->toBeNull()
        ->and($user->invitation_token)->toBeNull()
        ->and($user->name)->toBe('New Name');
});

it('fails completing invitation with expired token', function () {
    $user = User::factory()->create([
        'invitation_token' => 'expired-token',
        'invitation_sent_at' => now()->subDays(8),
        'invitation_accepted_at' => null,
        'password' => Hash::make('temp'),
    ]);

    $response = $this->post('/register/invitation/expired-token', [
        'name' => 'New Name',
        'password' => 'newpassword',
        'password_confirmation' => 'newpassword',
    ]);

    $response->assertSessionHasErrors('token');
});
