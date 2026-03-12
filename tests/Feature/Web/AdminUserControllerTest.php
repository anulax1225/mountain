<?php

use App\Mail\UserInvitation;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

// ---------------------------------------------------------------------------
// index
// ---------------------------------------------------------------------------

it('admin can view users page with AdminUsers component and users and roles props', function () {
    $admin = createAdmin();
    User::factory()->count(2)->create();

    $this->actingAs($admin)
        ->get(route('dashboard.admin.users'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/AdminUsers')
            ->has('users')
            ->has('roles')
        );
});

it('client gets 403 on users index', function () {
    $client = createClient();

    $this->actingAs($client)
        ->get(route('dashboard.admin.users'))
        ->assertForbidden();
});

it('unauthenticated user is redirected to login from users index', function () {
    $this->get(route('dashboard.admin.users'))
        ->assertRedirect(route('login'));
});

// ---------------------------------------------------------------------------
// store
// ---------------------------------------------------------------------------

it('admin can create a user and invitation email is sent', function () {
    Mail::fake();

    $admin = createAdmin();
    seedRoles();
    $role = Role::where('slug', 'client')->first();

    $this->actingAs($admin)
        ->post(route('web.admin.users.store'), [
            'email' => 'newuser@example.com',
            'role_id' => $role->id,
            'name' => 'New User',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('users', ['email' => 'newuser@example.com']);
    Mail::assertSent(UserInvitation::class);
});

it('client gets 403 on store', function () {
    Mail::fake();

    $client = createClient();
    seedRoles();
    $role = Role::where('slug', 'client')->first();

    $this->actingAs($client)
        ->post(route('web.admin.users.store'), [
            'email' => 'blocked@example.com',
            'role_id' => $role->id,
        ])
        ->assertForbidden();

    $this->assertDatabaseMissing('users', ['email' => 'blocked@example.com']);
    Mail::assertNotSent(UserInvitation::class);
});

it('store requires email', function () {
    $admin = createAdmin();
    seedRoles();
    $role = Role::where('slug', 'client')->first();

    $this->actingAs($admin)
        ->post(route('web.admin.users.store'), [
            'role_id' => $role->id,
        ])
        ->assertSessionHasErrors('email');
});

it('store requires a valid role_id', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('web.admin.users.store'), [
            'email' => 'test@example.com',
            'role_id' => 9999,
        ])
        ->assertSessionHasErrors('role_id');
});

it('store rejects duplicate email', function () {
    Mail::fake();

    $admin = createAdmin();
    $existing = User::factory()->create(['email' => 'duplicate@example.com']);
    seedRoles();
    $role = Role::where('slug', 'client')->first();

    $this->actingAs($admin)
        ->post(route('web.admin.users.store'), [
            'email' => 'duplicate@example.com',
            'role_id' => $role->id,
        ])
        ->assertSessionHasErrors('email');

    Mail::assertNotSent(UserInvitation::class);
});

// ---------------------------------------------------------------------------
// updateRole
// ---------------------------------------------------------------------------

it('admin can update a user role', function () {
    $admin = createAdmin();
    $target = createClient();
    seedRoles();
    $adminRole = Role::where('slug', 'admin')->first();

    $this->actingAs($admin)
        ->put(route('web.admin.users.update-role', $target->id), [
            'role_id' => $adminRole->id,
        ])
        ->assertRedirect();
});

it('client gets 403 on update role', function () {
    $client = createClient();
    $target = createClient();
    seedRoles();
    $adminRole = Role::where('slug', 'admin')->first();

    $this->actingAs($client)
        ->put(route('web.admin.users.update-role', $target->id), [
            'role_id' => $adminRole->id,
        ])
        ->assertForbidden();
});

it('update role requires a valid role_id', function () {
    $admin = createAdmin();
    $target = createClient();

    $this->actingAs($admin)
        ->put(route('web.admin.users.update-role', $target->id), [
            'role_id' => 9999,
        ])
        ->assertSessionHasErrors('role_id');
});

// ---------------------------------------------------------------------------
// resendInvitation
// ---------------------------------------------------------------------------

it('admin can resend an invitation', function () {
    Mail::fake();

    $admin = createAdmin();
    $invited = User::factory()->create([
        'invitation_token' => 'some-token',
        'invitation_sent_at' => now()->subDay(),
        'invitation_accepted_at' => null,
    ]);

    $this->actingAs($admin)
        ->post(route('web.admin.users.resend-invitation', $invited->id))
        ->assertRedirect();

    Mail::assertSent(UserInvitation::class);
});

it('client gets 403 on resend invitation for another user', function () {
    Mail::fake();

    $client = createClient();
    $invited = User::factory()->create([
        'invitation_token' => 'some-token',
        'invitation_sent_at' => now()->subDay(),
        'invitation_accepted_at' => null,
    ]);

    $this->actingAs($client)
        ->post(route('web.admin.users.resend-invitation', $invited->id))
        ->assertForbidden();

    Mail::assertNotSent(UserInvitation::class);
});

// ---------------------------------------------------------------------------
// destroy
// ---------------------------------------------------------------------------

it('admin can delete a user', function () {
    $admin = createAdmin();
    $target = createClient();

    $this->actingAs($admin)
        ->delete(route('web.admin.users.destroy', $target->id))
        ->assertRedirect();

    $this->assertDatabaseMissing('users', ['id' => $target->id]);
});

it('client gets 403 on delete', function () {
    $client = createClient();
    $target = User::factory()->create();

    $this->actingAs($client)
        ->delete(route('web.admin.users.destroy', $target->id))
        ->assertForbidden();

    $this->assertDatabaseHas('users', ['id' => $target->id]);
});

it('admin cannot delete themselves', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->delete(route('web.admin.users.destroy', $admin->id))
        ->assertForbidden();

    $this->assertDatabaseHas('users', ['id' => $admin->id]);
});
