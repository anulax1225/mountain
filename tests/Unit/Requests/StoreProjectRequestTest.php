<?php

use App\Http\Requests\StoreProjectRequest;

it('requires a name', function () {
    $request = new StoreProjectRequest;
    $rules = $request->rules();

    expect($rules['name'])->toContain('required');
});

it('validates name is a string with max 255', function () {
    $request = new StoreProjectRequest;
    $rules = $request->rules();

    expect($rules['name'])->toContain('string')
        ->and($rules['name'])->toContain('max:255');
});

it('allows nullable description', function () {
    $request = new StoreProjectRequest;
    $rules = $request->rules();

    expect($rules['description'])->toContain('nullable');
});

it('allows nullable photo with image validation', function () {
    $request = new StoreProjectRequest;
    $rules = $request->rules();

    expect($rules['photo'])->toContain('nullable')
        ->and($rules['photo'])->toContain('image');
});

it('authorizes all requests', function () {
    $request = new StoreProjectRequest;

    expect($request->authorize())->toBeTrue();
});
