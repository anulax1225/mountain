<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Dusk\Browser;

test('admin can access admin users page', function () {
    Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin', 'description' => 'Global administrator']);

    $admin = User::factory()->create(['password' => Hash::make('password')]);
    $admin->roles()->attach(Role::where('slug', 'admin')->first());

    $this->browse(function (Browser $browser) use ($admin) {
        $browser->loginAs($admin)
            ->visit('/dashboard/admin/users')
            ->waitForText('Administration')
            ->assertPathIs('/dashboard/admin/users')
            ->assertSee('Administration');
    });
});

test('non-admin cannot access admin users page', function () {
    Role::firstOrCreate(['slug' => 'client'], ['name' => 'Client', 'description' => 'Global client']);

    $client = User::factory()->create(['password' => Hash::make('password')]);
    $client->roles()->attach(Role::where('slug', 'client')->first());

    $this->browse(function (Browser $browser) use ($client) {
        $browser->loginAs($client)
            ->visit('/dashboard/admin/users')
            // Non-admin gets a 403 Forbidden response
            ->assertSee('403');
    });
});
