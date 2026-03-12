<?php

use App\Models\Image;
use App\Models\Sticker;

it('belongs to an image', function () {
    $sticker = Sticker::factory()->create();

    expect($sticker->image)->toBeInstanceOf(Image::class);
});

it('auto-generates uuid slug on creation', function () {
    $sticker = Sticker::factory()->create(['slug' => null]);

    expect($sticker->slug)->not->toBeNull()
        ->and(Illuminate\Support\Str::isUuid($sticker->slug))->toBeTrue();
});

it('does not overwrite slug if provided', function () {
    $sticker = Sticker::factory()->create(['slug' => 'custom-slug']);

    expect($sticker->slug)->toBe('custom-slug');
});

it('uses slug as route key name', function () {
    expect((new Sticker)->getRouteKeyName())->toBe('slug');
});

it('casts position fields to float', function () {
    $sticker = Sticker::factory()->create([
        'position_x' => '1.5',
        'position_y' => '2.5',
        'position_z' => '3.5',
    ]);

    expect($sticker->position_x)->toBeFloat()
        ->and($sticker->position_y)->toBeFloat()
        ->and($sticker->position_z)->toBeFloat();
});

it('casts scale to float', function () {
    $sticker = Sticker::factory()->create(['scale' => '1.5']);

    expect($sticker->scale)->toBeFloat();
});

it('casts rotation fields to float', function () {
    $sticker = Sticker::factory()->create([
        'rotation_x' => '0.5',
        'rotation_y' => '1.0',
        'rotation_z' => '-0.5',
    ]);

    expect($sticker->rotation_x)->toBeFloat()
        ->and($sticker->rotation_y)->toBeFloat()
        ->and($sticker->rotation_z)->toBeFloat();
});

it('casts font_size to integer', function () {
    $sticker = Sticker::factory()->create(['font_size' => '16']);

    expect($sticker->font_size)->toBeInt();
});
