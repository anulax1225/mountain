<?php

use App\Http\Requests\AssignProjectUserRequest;

it('requires user_id as integer that exists', function () {
    $request = new AssignProjectUserRequest;
    $rules = $request->rules();

    expect($rules['user_id'])->toContain('required')
        ->and($rules['user_id'])->toContain('integer')
        ->and($rules['user_id'])->toContain('exists:users,id');
});

it('requires role_id as integer that exists', function () {
    $request = new AssignProjectUserRequest;
    $rules = $request->rules();

    expect($rules['role_id'])->toContain('required')
        ->and($rules['role_id'])->toContain('integer')
        ->and($rules['role_id'])->toContain('exists:roles,id');
});

it('has custom error messages', function () {
    $request = new AssignProjectUserRequest;
    $messages = $request->messages();

    expect($messages)->toHaveKey('user_id.required')
        ->and($messages)->toHaveKey('user_id.exists')
        ->and($messages)->toHaveKey('role_id.required')
        ->and($messages)->toHaveKey('role_id.exists');
});
