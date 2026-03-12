<?php

use App\Models\Hotspot;
use App\Models\Image;
use App\Models\Scene;
use App\Models\Sticker;
use Illuminate\Support\Facades\Storage;

it('belongs to a scene', function () {
    $image = Image::factory()->fake()->create();

    expect($image->scene)->toBeInstanceOf(Scene::class);
});

it('has many hotspots from', function () {
    $scene = Scene::factory()->create();
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $target = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    Hotspot::factory()->count(2)->create([
        'scene_id' => $scene->id,
        'from_image_id' => $image->id,
        'to_image_id' => $target->id,
    ]);

    expect($image->hotspotsFrom)->toHaveCount(2);
});

it('has many hotspots to', function () {
    $scene = Scene::factory()->create();
    $source = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    Hotspot::factory()->count(2)->create([
        'scene_id' => $scene->id,
        'from_image_id' => $source->id,
        'to_image_id' => $image->id,
    ]);

    expect($image->hotspotsTo)->toHaveCount(2);
});

it('has many stickers', function () {
    $image = Image::factory()->fake()->create();
    Sticker::factory()->count(3)->create(['image_id' => $image->id]);

    expect($image->stickers)->toHaveCount(3);
});

it('auto-generates uuid slug on creation', function () {
    $image = Image::factory()->fake()->create(['slug' => null]);

    expect($image->slug)->not->toBeNull()
        ->and(Illuminate\Support\Str::isUuid($image->slug))->toBeTrue();
});

it('does not overwrite slug if provided', function () {
    $image = Image::factory()->fake()->create(['slug' => 'custom-slug']);

    expect($image->slug)->toBe('custom-slug');
});

it('uses slug as route key name', function () {
    expect((new Image)->getRouteKeyName())->toBe('slug');
});

it('deletes s3 file on deletion', function () {
    Storage::fake('s3');
    $path = 'uploads/test-image.jpg';
    Storage::disk('s3')->put($path, 'fake content');

    $image = Image::factory()->fake()->create(['path' => $path]);
    $image->delete();

    Storage::disk('s3')->assertMissing($path);
});

it('cascade deletes hotspots and stickers on deletion', function () {
    Storage::fake('s3');

    $scene = Scene::factory()->create();
    $image = Image::factory()->fake()->create(['scene_id' => $scene->id]);
    $target = Image::factory()->fake()->create(['scene_id' => $scene->id]);

    Hotspot::factory()->create([
        'scene_id' => $scene->id,
        'from_image_id' => $image->id,
        'to_image_id' => $target->id,
    ]);
    Hotspot::factory()->create([
        'scene_id' => $scene->id,
        'from_image_id' => $target->id,
        'to_image_id' => $image->id,
    ]);
    Sticker::factory()->create(['image_id' => $image->id]);

    $image->delete();

    expect(Hotspot::where('from_image_id', $image->id)->count())->toBe(0)
        ->and(Hotspot::where('to_image_id', $image->id)->count())->toBe(0)
        ->and(Sticker::where('image_id', $image->id)->count())->toBe(0);
});
