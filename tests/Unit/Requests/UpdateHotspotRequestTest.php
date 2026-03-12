<?php

use App\Http\Requests\UpdateHotspotRequest;

it('uses sometimes instead of required for fields', function () {
    $request = new UpdateHotspotRequest;
    $rules = $request->rules();

    expect($rules['from_image_id'])->toContain('sometimes')
        ->and($rules['to_image_id'])->toContain('sometimes')
        ->and($rules['position_x'])->toContain('sometimes')
        ->and($rules['position_y'])->toContain('sometimes')
        ->and($rules['position_z'])->toContain('sometimes');
});

it('validates custom_color as hex format', function () {
    $request = new UpdateHotspotRequest;
    $rules = $request->rules();

    expect($rules['custom_color'])->toContain('regex:/^#[0-9A-Fa-f]{6}$/');
});
