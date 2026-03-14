<?php

use App\Mail\UserInvitation;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

// ---------------------------------------------------------------------------
// index
// ---------------------------------------------------------------------------

it('admin can list users and receives JSON data array', function () {
    $admin = createAdmin();
    createClient();
    createClient();

    $this->actingAs($admin)
        ->getJson('/admin/users')
        ->assertSuccessful()
        ->assertJsonStructure(['data']);
});

it('client gets 403 on list users', function () {
    $client = createClient();

    $this->actingAs($client)
        ->getJson('/admin/users')
        ->assertForbidden();
});

// ---------------------------------------------------------------------------
// roles
// ---------------------------------------------------------------------------

it('admin can list roles and receives admin and client roles', function () {
    $admin = createAdmin();

    $response = $this->actingAs($admin)
        ->getJson('/admin/roles')
        ->assertSuccessful()
        ->assertJsonStructure(['data']);

    $slugs = collect($response->json('data'))->pluck('slug')->sort()->values()->toArray();
    expect($slugs)->toBe(['admin', 'client']);
});

it('client gets 403 on list roles', function () {
    $client = createClient();

    $this->actingAs($client)
        ->getJson('/admin/roles')
        ->assertForbidden();
});

// ---------------------------------------------------------------------------
// store
// ---------------------------------------------------------------------------

it('admin can create a user and receives 201 with invitation pending true', function () {
    Mail::fake();

    $admin = createAdmin();
    $role = Role::where('slug', 'client')->first();

    $this->actingAs($admin)
        ->postJson('/admin/users', [
            'email' => 'newuser@example.com',
            'role_id' => $role->id,
            'name' => 'New User',
        ])
        ->assertCreated()
        ->assertJsonPath('data.invitation_pending', true)
        ->assertJsonStructure(['data' => ['id', 'name', 'email', 'roles', 'invitation_pending'], 'message']);

    $this->assertDatabaseHas('users', ['email' => 'newuser@example.com']);
    Mail::assertSent(UserInvitation::class);
});

it('client gets 403 on create user and no mail is sent', function () {
    Mail::fake();

    $client = createClient();
    seedRoles();
    $role = Role::where('slug', 'client')->first();

    $this->actingAs($client)
        ->postJson('/admin/users', [
            'email' => 'blocked@example.com',
            'role_id' => $role->id,
        ])
        ->assertForbidden();

    $this->assertDatabaseMissing('users', ['email' => 'blocked@example.com']);
    Mail::assertNotSent(UserInvitation::class);
});

it('store validation fails when email is missing', function () {
    $admin = createAdmin();
    $role = Role::where('slug', 'client')->first();

    $this->actingAs($admin)
        ->postJson('/admin/users', [
            'role_id' => $role->id,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('email');
});

it('store allows creating user without role_id', function () {
    Mail::fake();
    $admin = createAdmin();

    $this->actingAs($admin)
        ->postJson('/admin/users', [
            'email' => 'test@example.com',
        ])
        ->assertCreated();

    $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    expect(\App\Models\User::where('email', 'test@example.com')->first()->roles)->toBeEmpty();
});

it('store validation fails for duplicate email', function () {
    Mail::fake();

    $admin = createAdmin();
    User::factory()->create(['email' => 'duplicate@example.com']);
    $role = Role::where('slug', 'client')->first();

    $this->actingAs($admin)
        ->postJson('/admin/users', [
            'email' => 'duplicate@example.com',
            'role_id' => $role->id,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('email');

    Mail::assertNotSent(UserInvitation::class);
});

// ---------------------------------------------------------------------------
// updateRole
// ---------------------------------------------------------------------------

it('admin can update a user role and receives JSON response', function () {
    $admin = createAdmin();
    $target = createClient();
    $adminRole = Role::where('slug', 'admin')->first();

    $this->actingAs($admin)
        ->putJson("/admin/users/{$target->id}/role", [
            'role_id' => $adminRole->id,
        ])
        ->assertSuccessful()
        ->assertJsonStructure(['data' => ['id', 'name', 'email', 'roles'], 'message']);
});

it('client gets 403 on update user role', function () {
    $client = createClient();
    $target = createClient();
    seedRoles();
    $adminRole = Role::where('slug', 'admin')->first();

    $this->actingAs($client)
        ->putJson("/admin/users/{$target->id}/role", [
            'role_id' => $adminRole->id,
        ])
        ->assertForbidden();
});

// ---------------------------------------------------------------------------
// resendInvitation
// ---------------------------------------------------------------------------

it('admin can resend invitation and mail is sent', function () {
    Mail::fake();

    $admin = createAdmin();
    $invited = User::factory()->create([
        'invitation_token' => 'some-token',
        'invitation_sent_at' => now()->subDay(),
        'invitation_accepted_at' => null,
    ]);

    $this->actingAs($admin)
        ->postJson("/admin/users/{$invited->id}/resend-invitation")
        ->assertSuccessful()
        ->assertJsonStructure(['message']);

    Mail::assertSent(UserInvitation::class);
});

it('client gets 403 on resend invitation', function () {
    Mail::fake();

    $client = createClient();
    $invited = User::factory()->create([
        'invitation_token' => 'some-token',
        'invitation_sent_at' => now()->subDay(),
        'invitation_accepted_at' => null,
    ]);

    $this->actingAs($client)
        ->postJson("/admin/users/{$invited->id}/resend-invitation")
        ->assertForbidden();

    Mail::assertNotSent(UserInvitation::class);
});

// ---------------------------------------------------------------------------
// destroy
// ---------------------------------------------------------------------------

it('admin can delete a user and receives 204', function () {
    $admin = createAdmin();
    $target = createClient();

    $this->actingAs($admin)
        ->deleteJson("/admin/users/{$target->id}")
        ->assertNoContent();

    $this->assertDatabaseMissing('users', ['id' => $target->id]);
});

it('client gets 403 on delete user', function () {
    $client = createClient();
    $target = createClient();

    $this->actingAs($client)
        ->deleteJson("/admin/users/{$target->id}")
        ->assertForbidden();

    $this->assertDatabaseHas('users', ['id' => $target->id]);
});
