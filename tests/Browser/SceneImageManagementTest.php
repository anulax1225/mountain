<?php

use App\Models\Project;
use App\Models\Role;
use App\Models\Scene;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Dusk\Browser;
use Tests\Browser\Pages\ProjectShowPage;

test('navigate from project list to project scenes page', function () {
    Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin', 'description' => 'Global administrator']);

    $admin = User::factory()->create(['password' => Hash::make('password')]);
    $admin->roles()->attach(Role::where('slug', 'admin')->first());

    $project = Project::factory()->create([
        'name' => 'Projet Navigation',
        'user_id' => $admin->id,
    ]);

    Scene::factory()->create([
        'name' => 'Scène Principale',
        'project_id' => $project->id,
    ]);

    $this->browse(function (Browser $browser) use ($admin, $project) {
        $browser->loginAs($admin)
            ->visit(new ProjectShowPage($project->slug))
            ->assertSee('Scènes')
            ->assertSeeScene('Scène Principale');
    });
});

test('create a new scene in a project', function () {
    Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin', 'description' => 'Global administrator']);

    $admin = User::factory()->create(['password' => Hash::make('password')]);
    $admin->roles()->attach(Role::where('slug', 'admin')->first());

    $project = Project::factory()->create([
        'name' => 'Projet Scènes',
        'user_id' => $admin->id,
    ]);

    $this->browse(function (Browser $browser) use ($admin, $project) {
        $browser->loginAs($admin)
            ->visit(new ProjectShowPage($project->slug))
            ->assertSee('Scènes')
            // Click the dashed "Créer une scène" card
            ->click('.border-dashed')
            ->waitForText('Nouvelle scène')
            ->type('input[id="scene-name"]', 'Salon')
            ->press('Créer la scène')
            ->waitForText('Salon')
            ->assertSee('Salon');
    });
});
