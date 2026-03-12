<?php

use App\Models\Project;
use App\Models\Role;
use App\Models\Scene;
use App\Models\User;

// ===========================================================================
// show
// ===========================================================================

it('allows admin to view project show page', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();

    $response = $this->actingAs($admin)
        ->get(route('dashboard.project', $project));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/ProjectShow')
            ->has('project')
            ->has('scenes')
        );
});

it('allows project creator to view project show page', function () {
    seedRoles();
    $creator = User::factory()->create();
    $project = Project::factory()->private()->create(['user_id' => $creator->id]);

    $response = $this->actingAs($creator)
        ->get(route('dashboard.project', $project));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/ProjectShow')
            ->has('project')
            ->has('scenes')
        );
});

it('allows project owner to view project show page', function () {
    $project = Project::factory()->private()->create();
    $owner = createProjectOwner($project);

    $response = $this->actingAs($owner)
        ->get(route('dashboard.project', $project));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/ProjectShow')
        );
});

it('allows project viewer to view project show page', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);

    $response = $this->actingAs($viewer)
        ->get(route('dashboard.project', $project));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/ProjectShow')
        );
});

it('forbids unassigned client from viewing project show page', function () {
    $project = Project::factory()->private()->create();
    $client = createClient();

    $response = $this->actingAs($client)
        ->get(route('dashboard.project', $project));

    $response->assertForbidden();
});

it('redirects unauthenticated user from project show page', function () {
    $project = Project::factory()->private()->create();

    $response = $this->get(route('dashboard.project', $project));

    $response->assertRedirect(route('login'));
});

it('show page includes correct project props', function () {
    seedRoles();
    $creator = User::factory()->create();
    $project = Project::factory()->private()->create(['user_id' => $creator->id]);
    Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($creator)
        ->get(route('dashboard.project', $project));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/ProjectShow')
            ->has('project')
            ->has('scenes')
            ->has('availableUsers')
            ->has('availableRoles')
        );
});

// ===========================================================================
// storeScene
// ===========================================================================

it('allows admin to create a scene', function () {
    $admin = createAdmin();
    $project = Project::factory()->create(['user_id' => $admin->id]);

    $response = $this->actingAs($admin)
        ->post(route('web.project.scenes.store', $project), [
            'name' => 'New Scene',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('scenes', [
        'name' => 'New Scene',
        'project_id' => $project->id,
    ]);
});

it('allows project creator to create a scene', function () {
    seedRoles();
    $creator = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $creator->id]);

    $response = $this->actingAs($creator)
        ->post(route('web.project.scenes.store', $project), [
            'name' => 'Creator Scene',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('scenes', [
        'name' => 'Creator Scene',
        'project_id' => $project->id,
    ]);
});

it('forbids project viewer from creating a scene', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);

    $response = $this->actingAs($viewer)
        ->post(route('web.project.scenes.store', $project), [
            'name' => 'Viewer Scene',
        ]);

    $response->assertForbidden();
});

it('allows creating a scene with no name', function () {
    seedRoles();
    $creator = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $creator->id]);

    $response = $this->actingAs($creator)
        ->post(route('web.project.scenes.store', $project), []);

    $response->assertRedirect();
    $this->assertDatabaseHas('scenes', ['project_id' => $project->id]);
});

// ===========================================================================
// updateScene
// ===========================================================================

it('allows admin to update a scene', function () {
    $admin = createAdmin();
    $project = Project::factory()->create(['user_id' => $admin->id]);
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($admin)
        ->post(route('web.scenes.update', $scene), [
            'name' => 'Updated Scene Name',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('scenes', [
        'id' => $scene->id,
        'name' => 'Updated Scene Name',
    ]);
});

it('allows project creator to update a scene', function () {
    seedRoles();
    $creator = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $creator->id]);
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($creator)
        ->post(route('web.scenes.update', $scene), [
            'name' => 'Creator Updated Scene',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('scenes', [
        'id' => $scene->id,
        'name' => 'Creator Updated Scene',
    ]);
});

it('forbids project viewer from updating a scene', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($viewer)
        ->post(route('web.scenes.update', $scene), [
            'name' => 'Viewer Attempted Update',
        ]);

    $response->assertForbidden();
});

// ===========================================================================
// destroyScene
// ===========================================================================

it('allows admin to delete a scene', function () {
    $admin = createAdmin();
    $project = Project::factory()->create(['user_id' => $admin->id]);
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($admin)
        ->delete(route('web.scenes.destroy', $scene));

    $response->assertRedirect();
    $this->assertDatabaseMissing('scenes', ['id' => $scene->id]);
});

it('allows project creator to delete a scene', function () {
    seedRoles();
    $creator = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $creator->id]);
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($creator)
        ->delete(route('web.scenes.destroy', $scene));

    $response->assertRedirect();
    $this->assertDatabaseMissing('scenes', ['id' => $scene->id]);
});

it('forbids project viewer from deleting a scene', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);
    $scene = Scene::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($viewer)
        ->delete(route('web.scenes.destroy', $scene));

    $response->assertForbidden();
    $this->assertDatabaseHas('scenes', ['id' => $scene->id]);
});

// ===========================================================================
// makePublic
// ===========================================================================

it('allows admin to make a project public', function () {
    $admin = createAdmin();
    $project = Project::factory()->private()->create();

    $response = $this->actingAs($admin)
        ->post(route('web.project.make-public', $project), [
            'is_public' => true,
            'start_image_id' => null,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('projects', [
        'id' => $project->id,
        'is_public' => true,
    ]);
});

it('allows project creator to make a project public', function () {
    seedRoles();
    $creator = User::factory()->create();
    $project = Project::factory()->private()->create(['user_id' => $creator->id]);

    $response = $this->actingAs($creator)
        ->post(route('web.project.make-public', $project), [
            'is_public' => true,
            'start_image_id' => null,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('projects', [
        'id' => $project->id,
        'is_public' => true,
    ]);
});

it('allows project creator to make a project private', function () {
    seedRoles();
    $creator = User::factory()->create();
    $project = Project::factory()->public()->create(['user_id' => $creator->id]);

    $response = $this->actingAs($creator)
        ->post(route('web.project.make-public', $project), [
            'is_public' => false,
            'start_image_id' => null,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('projects', [
        'id' => $project->id,
        'is_public' => false,
    ]);
});

it('forbids project viewer from toggling project visibility', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);

    $response = $this->actingAs($viewer)
        ->post(route('web.project.make-public', $project), [
            'is_public' => true,
        ]);

    $response->assertForbidden();
});

it('returns validation error when is_public is missing for makePublic', function () {
    seedRoles();
    $creator = User::factory()->create();
    $project = Project::factory()->private()->create(['user_id' => $creator->id]);

    $response = $this->actingAs($creator)
        ->post(route('web.project.make-public', $project), []);

    $response->assertSessionHasErrors('is_public');
});

// ===========================================================================
// update
// ===========================================================================

it('allows project creator to update project name', function () {
    seedRoles();
    $creator = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $creator->id]);

    $response = $this->actingAs($creator)
        ->post(route('web.project.update', $project), [
            'name' => 'Updated Project Name',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('projects', [
        'id' => $project->id,
        'name' => 'Updated Project Name',
    ]);
});

it('allows admin to update a project', function () {
    $admin = createAdmin();
    $project = Project::factory()->create();

    $response = $this->actingAs($admin)
        ->post(route('web.project.update', $project), [
            'name' => 'Admin Updated Project',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('projects', [
        'id' => $project->id,
        'name' => 'Admin Updated Project',
    ]);
});

it('forbids project viewer from updating a project', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);

    $response = $this->actingAs($viewer)
        ->post(route('web.project.update', $project), [
            'name' => 'Viewer Attempted Name',
        ]);

    $response->assertForbidden();
});

// ===========================================================================
// assignUser
// ===========================================================================

it('allows admin to assign a user to a project', function () {
    $admin = createAdmin();
    $project = Project::factory()->create(['user_id' => $admin->id]);
    $client = createClient();
    $ownerRole = Role::where('slug', 'owner')->first();

    $response = $this->actingAs($admin)
        ->post(route('web.project.users.store', $project), [
            'user_id' => $client->id,
            'role_id' => $ownerRole->id,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('project_user', [
        'project_id' => $project->id,
        'user_id' => $client->id,
        'role_id' => $ownerRole->id,
    ]);
});

it('allows project creator to assign a user to a project', function () {
    seedRoles();
    $creator = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $creator->id]);
    $client = createClient();
    $viewerRole = Role::where('slug', 'viewer')->first();

    $response = $this->actingAs($creator)
        ->post(route('web.project.users.store', $project), [
            'user_id' => $client->id,
            'role_id' => $viewerRole->id,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('project_user', [
        'project_id' => $project->id,
        'user_id' => $client->id,
        'role_id' => $viewerRole->id,
    ]);
});

it('forbids project viewer from assigning users', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);
    $client = createClient();
    $ownerRole = Role::where('slug', 'owner')->first();

    $response = $this->actingAs($viewer)
        ->post(route('web.project.users.store', $project), [
            'user_id' => $client->id,
            'role_id' => $ownerRole->id,
        ]);

    $response->assertForbidden();
});

it('returns validation error when user_id is missing for assignUser', function () {
    $admin = createAdmin();
    $project = Project::factory()->create(['user_id' => $admin->id]);
    $ownerRole = Role::where('slug', 'owner')->first();

    $response = $this->actingAs($admin)
        ->post(route('web.project.users.store', $project), [
            'role_id' => $ownerRole->id,
        ]);

    $response->assertSessionHasErrors('user_id');
});

it('returns validation error when role_id is missing for assignUser', function () {
    $admin = createAdmin();
    $project = Project::factory()->create(['user_id' => $admin->id]);
    $client = createClient();

    $response = $this->actingAs($admin)
        ->post(route('web.project.users.store', $project), [
            'user_id' => $client->id,
        ]);

    $response->assertSessionHasErrors('role_id');
});

// ===========================================================================
// removeUser
// ===========================================================================

it('allows admin to remove a user from a project', function () {
    $admin = createAdmin();
    $project = Project::factory()->create(['user_id' => $admin->id]);
    $owner = createProjectOwner($project);

    $response = $this->actingAs($admin)
        ->delete(route('web.project.users.destroy', [$project, $owner]));

    $response->assertRedirect();
    $this->assertDatabaseMissing('project_user', [
        'project_id' => $project->id,
        'user_id' => $owner->id,
    ]);
});

it('allows project creator to remove a user from a project', function () {
    seedRoles();
    $creator = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $creator->id]);
    $viewer = createProjectViewer($project);

    $response = $this->actingAs($creator)
        ->delete(route('web.project.users.destroy', [$project, $viewer]));

    $response->assertRedirect();
    $this->assertDatabaseMissing('project_user', [
        'project_id' => $project->id,
        'user_id' => $viewer->id,
    ]);
});

it('forbids project viewer from removing a user', function () {
    $project = Project::factory()->private()->create();
    $viewer = createProjectViewer($project);
    $anotherViewer = createProjectViewer($project);

    $response = $this->actingAs($viewer)
        ->delete(route('web.project.users.destroy', [$project, $anotherViewer]));

    $response->assertForbidden();
    $this->assertDatabaseHas('project_user', [
        'project_id' => $project->id,
        'user_id' => $anotherViewer->id,
    ]);
});
