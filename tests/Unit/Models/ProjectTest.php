<?php

use App\Models\Image;
use App\Models\Project;
use App\Models\Scene;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

it('belongs to a user', function () {
    $project = Project::factory()->create();

    expect($project->user)->toBeInstanceOf(User::class);
});

it('has many scenes', function () {
    $project = Project::factory()->create();
    Scene::factory()->count(3)->create(['project_id' => $project->id]);

    expect($project->scenes)->toHaveCount(3);
});

it('belongs to a start image', function () {
    $project = Project::factory()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $project->update(['start_image_id' => $image->id]);

    expect($project->fresh()->startImage)->toBeInstanceOf(Image::class)
        ->and($project->fresh()->startImage->id)->toBe($image->id);
});

it('has many assigned users', function () {
    seedRoles();
    $project = Project::factory()->create();
    $user = User::factory()->create();
    $role = \App\Models\Role::where('slug', 'owner')->first();
    $project->assignedUsers()->attach($user->id, ['role_id' => $role->id]);

    expect($project->assignedUsers)->toHaveCount(1)
        ->and($project->assignedUsers->first()->id)->toBe($user->id);
});

it('auto-generates uuid slug on creation', function () {
    $project = Project::factory()->create(['slug' => null]);

    expect($project->slug)->not->toBeNull()
        ->and(Illuminate\Support\Str::isUuid($project->slug))->toBeTrue();
});

it('does not overwrite slug if provided', function () {
    $project = Project::factory()->create(['slug' => 'custom-slug']);

    expect($project->slug)->toBe('custom-slug');
});

it('uses slug as route key name', function () {
    expect((new Project)->getRouteKeyName())->toBe('slug');
});

it('casts is_public to boolean', function () {
    $project = Project::factory()->create(['is_public' => 1]);

    expect($project->is_public)->toBeBool()->toBeTrue();
});

it('cascade deletes scenes on deletion', function () {
    Storage::fake('s3');

    $project = Project::factory()->create();
    Scene::factory()->count(2)->create(['project_id' => $project->id]);

    $project->delete();

    expect(Scene::where('project_id', $project->id)->count())->toBe(0);
});

it('deletes picture file from storage on deletion', function () {
    Storage::fake('public');
    $path = 'project-pictures/test.jpg';
    Storage::disk('public')->put($path, 'fake content');

    $project = Project::factory()->create(['picture_path' => $path]);
    $project->delete();

    Storage::disk('public')->assertMissing($path);
});
