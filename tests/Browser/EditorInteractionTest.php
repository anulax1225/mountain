<?php

use App\Models\Project;
use App\Models\Role;
use App\Models\Scene;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Dusk\Browser;
use Tests\Browser\Pages\EditorPage;

test('editor page loads for authorized user', function () {
    Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin', 'description' => 'Global administrator']);

    $admin = User::factory()->create(['password' => Hash::make('password')]);
    $admin->roles()->attach(Role::where('slug', 'admin')->first());

    $project = Project::factory()->create([
        'name' => 'Projet Éditeur',
        'user_id' => $admin->id,
    ]);

    $this->browse(function (Browser $browser) use ($admin, $project) {
        $browser->loginAs($admin)
            ->visit(new EditorPage($project->slug))
            ->waitForText('Éditeur 360°')
            ->assertSee('PROJET ÉDITEUR');
    });
});

test('editor renders empty state when project has no images', function () {
    Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin', 'description' => 'Global administrator']);

    $admin = User::factory()->create(['password' => Hash::make('password')]);
    $admin->roles()->attach(Role::where('slug', 'admin')->first());

    $project = Project::factory()->create([
        'name' => 'Projet Avec Scènes',
        'user_id' => $admin->id,
    ]);

    Scene::factory()->create([
        'name' => 'Entrée',
        'project_id' => $project->id,
    ]);

    $this->browse(function (Browser $browser) use ($admin, $project) {
        $browser->loginAs($admin)
            ->visit("/dashboard/editor/{$project->slug}")
            ->waitForText('Éditeur 360°')
            ->assertPathIs("/dashboard/editor/{$project->slug}")
            ->assertSee('Aucune image dans ce projet');
    });
});
