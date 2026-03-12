<?php

use App\Models\Project;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

pest()->extend(Tests\TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature', 'Unit');

/**
 * Seed the 4 standard roles into the database.
 */
function seedRoles(): void
{
    Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin', 'description' => 'Global administrator']);
    Role::firstOrCreate(['slug' => 'client'], ['name' => 'Client', 'description' => 'Global client']);
    Role::firstOrCreate(['slug' => 'owner'], ['name' => 'Owner', 'description' => 'Project owner']);
    Role::firstOrCreate(['slug' => 'viewer'], ['name' => 'Viewer', 'description' => 'Project viewer']);
}

/**
 * Create a user with the Admin role.
 */
function createAdmin(array $attributes = []): User
{
    seedRoles();
    $user = User::factory()->create($attributes);
    $user->roles()->attach(Role::where('slug', 'admin')->first());

    return $user->fresh();
}

/**
 * Create a user with the Client role.
 */
function createClient(array $attributes = []): User
{
    seedRoles();
    $user = User::factory()->create($attributes);
    $user->roles()->attach(Role::where('slug', 'client')->first());

    return $user->fresh();
}

/**
 * Assign a user as project Owner via the project_user pivot.
 */
function createProjectOwner(Project $project, array $attributes = []): User
{
    seedRoles();
    $user = User::factory()->create($attributes);
    $project->assignedUsers()->attach($user->id, [
        'role_id' => Role::where('slug', 'owner')->first()->id,
    ]);

    return $user->fresh();
}

/**
 * Assign a user as project Viewer via the project_user pivot.
 */
function createProjectViewer(Project $project, array $attributes = []): User
{
    seedRoles();
    $user = User::factory()->create($attributes);
    $project->assignedUsers()->attach($user->id, [
        'role_id' => Role::where('slug', 'viewer')->first()->id,
    ]);

    return $user->fresh();
}
