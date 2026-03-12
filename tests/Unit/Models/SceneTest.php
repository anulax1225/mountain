<?php

use App\Models\Hotspot;
use App\Models\Image;
use App\Models\Project;
use App\Models\Scene;
use App\Models\Sticker;
use Illuminate\Support\Facades\Storage;

it('belongs to a project', function () {
    $scene = Scene::factory()->create();

    expect($scene->project)->toBeInstanceOf(Project::class);
});

it('has many images', function () {
    $scene = Scene::factory()->create();
    Image::factory()->fake()->count(3)->create(['scene_id' => $scene->id]);

    expect($scene->images)->toHaveCount(3);
});

it('has many hotspots', function () {
    $scene = Scene::factory()->create();
    $image1 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $image2 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    Hotspot::factory()->count(2)->create([
        'scene_id' => $scene->id,
        'from_image_id' => $image1->id,
        'to_image_id' => $image2->id,
    ]);

    expect($scene->hotspots)->toHaveCount(2);
});

it('auto-generates uuid slug on creation', function () {
    $scene = Scene::factory()->create(['slug' => null]);

    expect($scene->slug)->not->toBeNull()
        ->and(Illuminate\Support\Str::isUuid($scene->slug))->toBeTrue();
});

it('does not overwrite slug if provided', function () {
    $scene = Scene::factory()->create(['slug' => 'custom-slug']);

    expect($scene->slug)->toBe('custom-slug');
});

it('uses slug as route key name', function () {
    expect((new Scene)->getRouteKeyName())->toBe('slug');
});

it('cascade deletes images and hotspots on deletion', function () {
    Storage::fake('s3');

    $scene = Scene::factory()->create();
    $image1 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $image2 = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    Hotspot::factory()->create([
        'scene_id' => $scene->id,
        'from_image_id' => $image1->id,
        'to_image_id' => $image2->id,
    ]);
    Sticker::factory()->create(['image_id' => $image1->id]);

    $scene->delete();

    expect(Image::where('scene_id', $scene->id)->count())->toBe(0)
        ->and(Hotspot::where('scene_id', $scene->id)->count())->toBe(0)
        ->and(Sticker::where('image_id', $image1->id)->count())->toBe(0);
});
