<?php

use App\Http\Requests\StoreSceneRequest;

it('allows nullable name as string with max 255', function () {
    $request = new StoreSceneRequest;
    $rules = $request->rules();

    expect($rules['name'])->toBe(['nullable', 'string', 'max:255']);
});
