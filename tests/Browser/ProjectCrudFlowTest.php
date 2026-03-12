<?php

use App\Models\Project;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Dusk\Browser;
use Tests\Browser\Pages\DashboardPage;

test('admin can create a project from dashboard', function () {
    Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin', 'description' => 'Global administrator']);

    $admin = User::factory()->create(['password' => Hash::make('password')]);
    $admin->roles()->attach(Role::where('slug', 'admin')->first());

    $this->browse(function (Browser $browser) use ($admin) {
        $browser->loginAs($admin)
            ->visit(new DashboardPage)
            // Click the dashed "Créer un nouveau projet" card
            ->click('.border-dashed')
            ->waitForText('Nouveau projet')
            ->type('input[id="name"]', 'Mon Projet E2E')
            ->press('Créer le projet')
            ->waitForText('Mon Projet E2E')
            ->assertSee('Mon Projet E2E');
    });
});

test('admin can see project in list after creation', function () {
    Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin', 'description' => 'Global administrator']);

    $admin = User::factory()->create(['password' => Hash::make('password')]);
    $admin->roles()->attach(Role::where('slug', 'admin')->first());

    Project::factory()->create([
        'name' => 'Projet Visible',
        'user_id' => $admin->id,
    ]);

    $this->browse(function (Browser $browser) use ($admin) {
        $browser->loginAs($admin)
            ->visit(new DashboardPage)
            ->assertSee('Projet Visible');
    });
});

test('admin can delete a project', function () {
    Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin', 'description' => 'Global administrator']);

    $admin = User::factory()->create(['password' => Hash::make('password')]);
    $admin->roles()->attach(Role::where('slug', 'admin')->first());

    Project::factory()->create([
        'name' => 'Projet À Supprimer',
        'user_id' => $admin->id,
    ]);

    $this->browse(function (Browser $browser) use ($admin) {
        $browser->loginAs($admin)
            ->visit(new DashboardPage)
            ->assertSee('Projet À Supprimer')
            // Hover to reveal the dropdown trigger (opacity-0 → opacity-100)
            ->mouseover('.group')
            ->pause(300)
            // Click the dropdown trigger button inside the card
            ->click('.group .opacity-0, .group .group-hover\\:opacity-100')
            ->waitForText('Supprimer')
            ->click('[role="menuitem"]:last-child')
            // Confirm dialog: "Confirmer la suppression" with "Supprimer" button
            ->waitForText('Confirmer la suppression')
            ->press('Supprimer')
            ->pause(1000)
            ->assertDontSee('Projet À Supprimer');
    });
});
