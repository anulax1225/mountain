<?php

use App\Http\Requests\UpdateImageRequest;

it('allows image as sometimes with max 20MB', function () {
    $request = new UpdateImageRequest;
    $rules = $request->rules();

    expect($rules['image'])->toBe(['sometimes', 'required', 'image', 'max:20480']);
});

it('allows name as sometimes string', function () {
    $request = new UpdateImageRequest;
    $rules = $request->rules();

    expect($rules['name'])->toBe(['sometimes', 'string', 'max:255']);
});
