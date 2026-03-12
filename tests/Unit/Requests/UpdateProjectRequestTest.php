<?php

use App\Http\Requests\UpdateProjectRequest;

it('allows name as sometimes', function () {
    $request = new UpdateProjectRequest;
    $rules = $request->rules();

    expect($rules['name'])->toContain('sometimes');
});

it('allows nullable description', function () {
    $request = new UpdateProjectRequest;
    $rules = $request->rules();

    expect($rules['description'])->toContain('nullable');
});

it('allows nullable photo with image validation', function () {
    $request = new UpdateProjectRequest;
    $rules = $request->rules();

    expect($rules['photo'])->toContain('nullable')
        ->and($rules['photo'])->toContain('image');
});
