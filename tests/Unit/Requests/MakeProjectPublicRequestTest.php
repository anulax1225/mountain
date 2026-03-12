<?php

use App\Http\Requests\MakeProjectPublicRequest;

it('requires is_public as boolean', function () {
    $request = new MakeProjectPublicRequest;
    $rules = $request->rules();

    expect($rules['is_public'])->toContain('required')
        ->and($rules['is_public'])->toContain('boolean');
});

it('allows nullable start_image_id as string', function () {
    $request = new MakeProjectPublicRequest;
    $rules = $request->rules();

    expect($rules['start_image_id'])->toBe(['nullable', 'string']);
});
