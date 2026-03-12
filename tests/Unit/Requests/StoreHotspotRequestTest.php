<?php

use App\Http\Requests\StoreHotspotRequest;

it('requires from_image_id and to_image_id', function () {
    $request = new StoreHotspotRequest;
    $rules = $request->rules();

    expect($rules['from_image_id'])->toContain('required')
        ->and($rules['to_image_id'])->toContain('required');
});

it('requires position fields as numeric', function () {
    $request = new StoreHotspotRequest;
    $rules = $request->rules();

    expect($rules['position_x'])->toContain('required')
        ->and($rules['position_x'])->toContain('numeric')
        ->and($rules['position_y'])->toContain('required')
        ->and($rules['position_z'])->toContain('required');
});

it('allows nullable target rotation', function () {
    $request = new StoreHotspotRequest;
    $rules = $request->rules();

    expect($rules['target_rotation_x'])->toContain('nullable')
        ->and($rules['target_rotation_y'])->toContain('nullable')
        ->and($rules['target_rotation_z'])->toContain('nullable');
});

it('validates custom_color as hex format', function () {
    $request = new StoreHotspotRequest;
    $rules = $request->rules();

    expect($rules['custom_color'])->toContain('regex:/^#[0-9A-Fa-f]{6}$/');
});

it('has custom color validation message', function () {
    $request = new StoreHotspotRequest;
    $messages = $request->messages();

    expect($messages)->toHaveKey('custom_color.regex');
});
