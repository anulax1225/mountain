<?php

use App\Actions\Image\DeleteImage;
use App\Actions\Scene\DeleteScene;
use App\Models\Image;
use App\Models\Project;
use App\Models\Scene;
use Illuminate\Support\Facades\Storage;

// ===========================================================================
// DeleteImage
// ===========================================================================

it('sets project to private when start image is deleted', function () {
    Storage::fake('s3');

    $project = Project::factory()->public()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $startImage = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $otherImage = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $project->update(['start_image_id' => $startImage->id]);

    app(DeleteImage::class)($startImage);

    $project->refresh();

    expect($project->is_public)->toBeFalse()
        ->and($project->start_image_id)->toBeNull();
});

it('sets project to private when last image is deleted', function () {
    Storage::fake('s3');

    $project = Project::factory()->public()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $startImage = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $project->update(['start_image_id' => $startImage->id]);

    app(DeleteImage::class)($startImage);

    $project->refresh();

    expect($project->is_public)->toBeFalse()
        ->and($project->start_image_id)->toBeNull();
});

it('does not affect project when non-start image is deleted', function () {
    Storage::fake('s3');

    $project = Project::factory()->public()->create();
    $scene = Scene::factory()->create(['project_id' => $project->id]);
    $startImage = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $otherImage = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    $project->update(['start_image_id' => $startImage->id]);

    app(DeleteImage::class)($otherImage);

    $project->refresh();

    expect($project->is_public)->toBeTrue()
        ->and($project->start_image_id)->toBe($startImage->id);
});

// ===========================================================================
// DeleteScene
// ===========================================================================

it('sets project to private when scene containing start image is deleted', function () {
    Storage::fake('s3');

    $project = Project::factory()->public()->create();
    $scene1 = Scene::factory()->create(['project_id' => $project->id]);
    $scene2 = Scene::factory()->create(['project_id' => $project->id]);
    $startImage = Image::factory()->fake()->create(['scene_id' => $scene1->id]);

    $project->update(['start_image_id' => $startImage->id]);

    app(DeleteScene::class)($scene1);

    $project->refresh();

    expect($project->is_public)->toBeFalse()
        ->and($project->start_image_id)->toBeNull();
});

it('does not affect project when scene without start image is deleted', function () {
    Storage::fake('s3');

    $project = Project::factory()->public()->create();
    $scene1 = Scene::factory()->create(['project_id' => $project->id]);
    $scene2 = Scene::factory()->create(['project_id' => $project->id]);
    $startImage = Image::factory()->fake()->create(['scene_id' => $scene1->id]);
    Image::factory()->fake()->create(['scene_id' => $scene2->id]);

    $project->update(['start_image_id' => $startImage->id]);

    app(DeleteScene::class)($scene2);

    $project->refresh();

    expect($project->is_public)->toBeTrue()
        ->and($project->start_image_id)->toBe($startImage->id);
});
