<?php

use App\Models\Hotspot;
use App\Models\Image;
use App\Models\Scene;

it('belongs to a scene', function () {
    $hotspot = Hotspot::factory()->create();

    expect($hotspot->scene)->toBeInstanceOf(Scene::class);
});

it('belongs to a from image', function () {
    $hotspot = Hotspot::factory()->create();

    expect($hotspot->fromImage)->toBeInstanceOf(Image::class)
        ->and($hotspot->fromImage->id)->toBe($hotspot->from_image_id);
});

it('belongs to a to image', function () {
    $hotspot = Hotspot::factory()->create();

    expect($hotspot->toImage)->toBeInstanceOf(Image::class)
        ->and($hotspot->toImage->id)->toBe($hotspot->to_image_id);
});

it('auto-generates uuid slug on creation', function () {
    $hotspot = Hotspot::factory()->create(['slug' => null]);

    expect($hotspot->slug)->not->toBeNull()
        ->and(Illuminate\Support\Str::isUuid($hotspot->slug))->toBeTrue();
});

it('does not overwrite slug if provided', function () {
    $hotspot = Hotspot::factory()->create(['slug' => 'custom-slug']);

    expect($hotspot->slug)->toBe('custom-slug');
});

it('uses slug as route key name', function () {
    expect((new Hotspot)->getRouteKeyName())->toBe('slug');
});

it('casts position fields to float', function () {
    $hotspot = Hotspot::factory()->create([
        'position_x' => '1.5',
        'position_y' => '2.5',
        'position_z' => '3.5',
    ]);

    expect($hotspot->position_x)->toBeFloat()
        ->and($hotspot->position_y)->toBeFloat()
        ->and($hotspot->position_z)->toBeFloat();
});

it('casts target rotation fields to float', function () {
    $hotspot = Hotspot::factory()->create([
        'target_rotation_x' => '0.5',
        'target_rotation_y' => '1.0',
        'target_rotation_z' => '-0.5',
    ]);

    expect($hotspot->target_rotation_x)->toBeFloat()
        ->and($hotspot->target_rotation_y)->toBeFloat()
        ->and($hotspot->target_rotation_z)->toBeFloat();
});
