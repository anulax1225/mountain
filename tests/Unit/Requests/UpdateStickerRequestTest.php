<?php

use App\Http\Requests\UpdateStickerRequest;

it('uses sometimes instead of required for fields', function () {
    $request = new UpdateStickerRequest;
    $rules = $request->rules();

    expect($rules['type'])->toContain('sometimes')
        ->and($rules['content'])->toContain('sometimes')
        ->and($rules['position_x'])->toContain('sometimes')
        ->and($rules['position_y'])->toContain('sometimes')
        ->and($rules['position_z'])->toContain('sometimes')
        ->and($rules['scale'])->toContain('sometimes');
});

it('validates font_size range', function () {
    $request = new UpdateStickerRequest;
    $rules = $request->rules();

    expect($rules['font_size'])->toContain('integer')
        ->and($rules['font_size'])->toContain('min:8')
        ->and($rules['font_size'])->toContain('max:200');
});
