<?php

use App\Models\Project;
use App\Models\Role;

// ---------------------------------------------------------------------------
// index
// ---------------------------------------------------------------------------

it('admin can list project users', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    createProjectOwner($project);
    createProjectViewer($project);

    $this->actingAs($admin)
        ->getJson("/projects/{$project->slug}/users")
        ->assertSuccessful()
        ->assertJsonStructure([
            ['id', 'name', 'email', 'role_id', 'assigned_at'],
        ]);
});

it('unassigned client gets 403 listing private project users', function () {
    $client = createClient();
    $project = Project::factory()->private()->create();

    $this->actingAs($client)
        ->getJson("/projects/{$project->slug}/users")
        ->assertForbidden();
});

it('assigned project owner can list project users', function () {
    $project = Project::factory()->private()->create();
    $owner = createProjectOwner($project);

    $this->actingAs($owner)
        ->getJson("/projects/{$project->slug}/users")
        ->assertSuccessful();
});

it('assigned project viewer can list project users', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);

    $this->actingAs($viewer)
        ->getJson("/projects/{$project->slug}/users")
        ->assertSuccessful();
});

// ---------------------------------------------------------------------------
// store
// ---------------------------------------------------------------------------

it('admin can assign user to project and receives 201', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $client = createClient();
    $ownerRole = Role::where('slug', 'owner')->first();

    $this->actingAs($admin)
        ->postJson("/projects/{$project->slug}/users", [
            'user_id' => $client->id,
            'role_id' => $ownerRole->id,
        ])
        ->assertCreated()
        ->assertJsonStructure(['message']);

    $this->assertDatabaseHas('project_user', [
        'project_id' => $project->id,
        'user_id' => $client->id,
        'role_id' => $ownerRole->id,
    ]);
});

it('assigning an already-assigned user updates role and returns 200', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $existingOwner = createProjectOwner($project);
    $viewerRole = Role::where('slug', 'viewer')->first();

    $this->actingAs($admin)
        ->postJson("/projects/{$project->slug}/users", [
            'user_id' => $existingOwner->id,
            'role_id' => $viewerRole->id,
        ])
        ->assertOk()
        ->assertJsonStructure(['message']);
});

it('viewer gets 403 on assign user to project', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);
    $client = createClient();
    $ownerRole = Role::where('slug', 'owner')->first();

    $this->actingAs($viewer)
        ->postJson("/projects/{$project->slug}/users", [
            'user_id' => $client->id,
            'role_id' => $ownerRole->id,
        ])
        ->assertForbidden();
});

it('validation fails when user_id is missing on store', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $ownerRole = Role::where('slug', 'owner')->first();

    $this->actingAs($admin)
        ->postJson("/projects/{$project->slug}/users", [
            'role_id' => $ownerRole->id,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('user_id');
});

it('validation fails when role_id is missing on store', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $client = createClient();

    $this->actingAs($admin)
        ->postJson("/projects/{$project->slug}/users", [
            'user_id' => $client->id,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('role_id');
});

// ---------------------------------------------------------------------------
// destroy
// ---------------------------------------------------------------------------

it('admin can remove user from project and receives 204', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();
    $owner = createProjectOwner($project);

    $this->actingAs($admin)
        ->deleteJson("/projects/{$project->slug}/users/{$owner->id}")
        ->assertNoContent();

    $this->assertDatabaseMissing('project_user', [
        'project_id' => $project->id,
        'user_id' => $owner->id,
    ]);
});

it('viewer gets 403 on remove user from project', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);
    $anotherViewer = createProjectViewer($project);

    $this->actingAs($viewer)
        ->deleteJson("/projects/{$project->slug}/users/{$anotherViewer->id}")
        ->assertForbidden();

    $this->assertDatabaseHas('project_user', [
        'project_id' => $project->id,
        'user_id' => $anotherViewer->id,
    ]);
});

it('project owner can remove user from project', function () {
    $project = Project::factory()->private()->create();
    $owner = createProjectOwner($project);
    $viewer = createProjectViewer($project);

    $this->actingAs($owner)
        ->deleteJson("/projects/{$project->slug}/users/{$viewer->id}")
        ->assertNoContent();
});

// ---------------------------------------------------------------------------
// availableUsers
// ---------------------------------------------------------------------------

it('available users endpoint returns non-admin users', function () {
    $admin = createAdmin();
    $client = createClient();
    $anotherAdmin = createAdmin();

    $response = $this->actingAs($admin)
        ->getJson('/available-users')
        ->assertSuccessful();

    $ids = collect($response->json())->pluck('id');
    expect($ids)->toContain($client->id);
    expect($ids)->not->toContain($anotherAdmin->id);
});

it('available users does not include the requesting admin', function () {
    $admin = createAdmin();

    $response = $this->actingAs($admin)
        ->getJson('/available-users')
        ->assertSuccessful();

    $ids = collect($response->json())->pluck('id');
    expect($ids)->not->toContain($admin->id);
});

// ---------------------------------------------------------------------------
// availableRoles
// ---------------------------------------------------------------------------

it('available roles returns owner and viewer roles only', function () {
    $admin = createAdmin();

    $response = $this->actingAs($admin)
        ->getJson('/available-roles')
        ->assertSuccessful();

    $names = collect($response->json())->pluck('name')->sort()->values()->toArray();
    expect($names)->toBe(['Owner', 'Viewer']);
    expect($response->json())->toHaveCount(2);
});

it('available roles response contains id, name, and description fields', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->getJson('/available-roles')
        ->assertSuccessful()
        ->assertJsonStructure([
            ['id', 'name', 'description'],
        ]);
});
