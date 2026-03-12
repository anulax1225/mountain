<?php

use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Dusk\Browser;

test('gallery page lists public projects', function () {
    $owner = User::factory()->create(['password' => Hash::make('password')]);

    Project::factory()->public()->create([
        'name' => 'Visite Virtuelle Publique',
        'user_id' => $owner->id,
    ]);

    Project::factory()->private()->create([
        'name' => 'Projet Privé',
        'user_id' => $owner->id,
    ]);

    $this->browse(function (Browser $browser) {
        $browser->visit('/gallery')
            ->assertSee('Galerie')
            ->assertSee('Visite Virtuelle Publique')
            ->assertDontSee('Projet Privé');
    });
});

test('gallery shows project detail for public project', function () {
    $owner = User::factory()->create(['password' => Hash::make('password')]);

    $project = Project::factory()->public()->create([
        'name' => 'Panorama de la Ville',
        'description' => 'Une visite immersive du centre-ville.',
        'user_id' => $owner->id,
    ]);

    $this->browse(function (Browser $browser) use ($project) {
        $browser->visit('/gallery')
            ->assertSee('Panorama de la Ville')
            ->visit("/gallery/{$project->slug}")
            ->assertPathIs("/gallery/{$project->slug}");
    });
});
