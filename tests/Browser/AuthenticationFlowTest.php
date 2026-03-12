<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Dusk\Browser;
use Tests\Browser\Pages\LoginPage;

afterEach(function () {
    static::closeAll();
});

test('login with valid credentials redirects to dashboard', function () {
    $user = User::factory()->create([
        'email' => 'valid@example.com',
        'password' => Hash::make('password'),
    ]);

    $this->browse(function (Browser $browser) use ($user) {
        $browser->visit(new LoginPage)
            ->loginWithCredentials($user->email, 'password')
            ->waitForLocation('/dashboard')
            ->assertPathIs('/dashboard')
            ->assertSee('Projets');
    });
});

test('login with invalid credentials shows error', function () {
    User::factory()->create([
        'email' => 'user@example.com',
        'password' => Hash::make('correct-password'),
    ]);

    $this->browse(function (Browser $browser) {
        $browser->visit(new LoginPage)
            ->loginWithCredentials('user@example.com', 'wrong-password')
            ->waitForText('credentials do not match')
            ->assertSee('credentials do not match');
    });
});

test('logout redirects to home', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password'),
    ]);

    $this->browse(function (Browser $browser) use ($user) {
        $browser->loginAs($user)
            ->visit('/dashboard')
            ->waitForText('Projets')
            ->pause(500)
            // Open user menu dropdown
            ->click('.p-3.border-t button')
            ->waitForText('Se déconnecter')
            // Logout is an Inertia Link rendered as <button>, use press()
            ->press('Se déconnecter')
            ->waitForLocation('/')
            ->assertPathIs('/');
    });
});

test('unauthenticated user is redirected to login', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/dashboard')
            ->waitForLocation('/login')
            ->assertPathIs('/login');
    });
});
