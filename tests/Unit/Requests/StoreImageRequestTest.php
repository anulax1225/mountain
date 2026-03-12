<?php

use App\Http\Requests\StoreImageRequest;

it('requires key starting with uploads/', function () {
    $request = new StoreImageRequest;
    $rules = $request->rules();

    expect($rules['key'])->toBe(['required', 'string', 'starts_with:uploads/']);
});

it('allows nullable name', function () {
    $request = new StoreImageRequest;
    $rules = $request->rules();

    expect($rules['name'])->toBe(['nullable', 'string', 'max:255']);
});

it('requires size as integer min 1', function () {
    $request = new StoreImageRequest;
    $rules = $request->rules();

    expect($rules['size'])->toBe(['required', 'integer', 'min:1']);
});

it('requires mime in allowed types', function () {
    $request = new StoreImageRequest;
    $rules = $request->rules();

    expect($rules['mime'])->toBe(['required', 'string', 'in:image/jpeg,image/png,image/jpg,image/webp']);
});
