<?php

use App\Http\Requests\StoreStickerRequest;

it('requires type in emoji, image, or text', function () {
    $request = new StoreStickerRequest;
    $rules = $request->rules();

    expect($rules['type'])->toContain('required')
        ->and($rules['type'])->toContain('in:emoji,image,text');
});

it('requires content as string', function () {
    $request = new StoreStickerRequest;
    $rules = $request->rules();

    expect($rules['content'])->toContain('required')
        ->and($rules['content'])->toContain('string');
});

it('requires position fields as numeric', function () {
    $request = new StoreStickerRequest;
    $rules = $request->rules();

    expect($rules['position_x'])->toContain('required')
        ->and($rules['position_y'])->toContain('required')
        ->and($rules['position_z'])->toContain('required');
});

it('validates scale range', function () {
    $request = new StoreStickerRequest;
    $rules = $request->rules();

    expect($rules['scale'])->toContain('min:0.1')
        ->and($rules['scale'])->toContain('max:10');
});

it('validates font_size range', function () {
    $request = new StoreStickerRequest;
    $rules = $request->rules();

    expect($rules['font_size'])->toContain('integer')
        ->and($rules['font_size'])->toContain('min:8')
        ->and($rules['font_size'])->toContain('max:200');
});
