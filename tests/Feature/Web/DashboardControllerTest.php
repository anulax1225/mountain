<?php

use App\Models\Project;
use App\Models\User;

// ---------------------------------------------------------------------------
// Unauthenticated access
// ---------------------------------------------------------------------------

it('redirects unauthenticated users from dashboard index to login', function () {
    $this->get(route('dashboard'))
        ->assertRedirect(route('login'));
});

it('redirects unauthenticated users from dashboard settings to login', function () {
    $this->get(route('dashboard.settings'))
        ->assertRedirect(route('login'));
});

it('redirects unauthenticated users from store project to login', function () {
    $this->post(route('web.projects.store'), ['name' => 'Test'])
        ->assertRedirect(route('login'));
});

it('redirects unauthenticated users from update project to login', function () {
    $project = Project::factory()->create();

    $this->post(route('web.projects.update', $project->slug), ['name' => 'Updated'])
        ->assertRedirect(route('login'));
});

it('redirects unauthenticated users from destroy project to login', function () {
    $project = Project::factory()->create();

    $this->delete(route('web.projects.destroy', $project->slug))
        ->assertRedirect(route('login'));
});

// ---------------------------------------------------------------------------
// index
// ---------------------------------------------------------------------------

it('renders dashboard index with projects for admin', function () {
    $admin = createAdmin();
    Project::factory()->count(3)->create();

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/Index')
            ->has('projects')
        );
});

it('renders dashboard index with only own and assigned projects for client', function () {
    seedRoles();
    $client = createClient();
    $ownProject = Project::factory()->create(['user_id' => $client->id]);
    $assignedProject = Project::factory()->create();
    $viewerRole = \App\Models\Role::where('slug', 'viewer')->first();
    $assignedProject->assignedUsers()->attach($client->id, ['role_id' => $viewerRole->id]);
    Project::factory()->create(); // unrelated project

    $this->actingAs($client->fresh())
        ->get(route('dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/Index')
            ->has('projects')
        );
});

it('admin sees all projects on dashboard', function () {
    $admin = createAdmin();
    Project::factory()->count(3)->create();

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/Index')
            ->has('projects.data', 3)
        );
});

it('client only sees own projects on dashboard', function () {
    $client = createClient();
    Project::factory()->count(2)->create(['user_id' => $client->id]);
    Project::factory()->count(2)->create(); // other users' projects

    $this->actingAs($client)
        ->get(route('dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/Index')
            ->has('projects.data', 2)
        );
});

// ---------------------------------------------------------------------------
// settings
// ---------------------------------------------------------------------------

it('renders dashboard settings page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard.settings'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/Settings')
        );
});

// ---------------------------------------------------------------------------
// storeProject
// ---------------------------------------------------------------------------

it('admin can create a project', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('web.projects.store'), [
            'name' => 'New Project',
            'description' => 'A test project',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('projects', ['name' => 'New Project']);
});

it('client cannot create a project and receives 403', function () {
    $client = createClient();

    $this->actingAs($client)
        ->post(route('web.projects.store'), [
            'name' => 'Forbidden Project',
        ])
        ->assertForbidden();

    $this->assertDatabaseMissing('projects', ['name' => 'Forbidden Project']);
});

it('store project requires a name', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post(route('web.projects.store'), [
            'description' => 'No name given',
        ])
        ->assertSessionHasErrors('name');
});

// ---------------------------------------------------------------------------
// updateProject
// ---------------------------------------------------------------------------

it('project creator can update their project', function () {
    $user = createAdmin();
    $project = Project::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->post(route('web.projects.update', $project->slug), [
            'name' => 'Updated Name',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('projects', [
        'id' => $project->id,
        'name' => 'Updated Name',
    ]);
});

it('assigned project owner can update a project', function () {
    $project = Project::factory()->create();
    $owner = createProjectOwner($project);

    $this->actingAs($owner)
        ->post(route('web.projects.update', $project->slug), [
            'name' => 'Owner Updated',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('projects', [
        'id' => $project->id,
        'name' => 'Owner Updated',
    ]);
});

it('unauthorized user cannot update a project and receives 403', function () {
    $project = Project::factory()->create();
    $viewer = createProjectViewer($project);

    $this->actingAs($viewer)
        ->post(route('web.projects.update', $project->slug), [
            'name' => 'Should Not Update',
        ])
        ->assertForbidden();
});

it('unrelated user cannot update another users project and receives 403', function () {
    $project = Project::factory()->create();
    $unrelated = User::factory()->create();

    $this->actingAs($unrelated)
        ->post(route('web.projects.update', $project->slug), [
            'name' => 'Hacked Name',
        ])
        ->assertForbidden();
});

// ---------------------------------------------------------------------------
// destroyProject
// ---------------------------------------------------------------------------

it('project creator can delete their project and is redirected to dashboard', function () {
    $user = createAdmin();
    $project = Project::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->delete(route('web.projects.destroy', $project->slug))
        ->assertRedirect(route('dashboard'));

    $this->assertDatabaseMissing('projects', ['id' => $project->id]);
});

it('admin can delete any project and is redirected to dashboard', function () {
    $admin = createAdmin();
    $project = Project::factory()->create();

    $this->actingAs($admin)
        ->delete(route('web.projects.destroy', $project->slug))
        ->assertRedirect(route('dashboard'));

    $this->assertDatabaseMissing('projects', ['id' => $project->id]);
});

it('assigned project owner cannot delete a project and receives 403', function () {
    $project = Project::factory()->create();
    $owner = createProjectOwner($project);

    $this->actingAs($owner)
        ->delete(route('web.projects.destroy', $project->slug))
        ->assertForbidden();

    $this->assertDatabaseHas('projects', ['id' => $project->id]);
});

it('unrelated user cannot delete a project and receives 403', function () {
    $project = Project::factory()->create();
    $unrelated = User::factory()->create();

    $this->actingAs($unrelated)
        ->delete(route('web.projects.destroy', $project->slug))
        ->assertForbidden();

    $this->assertDatabaseHas('projects', ['id' => $project->id]);
});
