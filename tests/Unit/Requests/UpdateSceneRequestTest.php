<?php

use App\Http\Requests\UpdateSceneRequest;

it('allows nullable name as string with max 255', function () {
    $request = new UpdateSceneRequest;
    $rules = $request->rules();

    expect($rules['name'])->toBe(['nullable', 'string', 'max:255']);
});
