<?php

use App\Models\ContactRequest;

it('auto-generates uuid slug on creation', function () {
    $cr = ContactRequest::factory()->create(['slug' => null]);

    expect($cr->slug)->not->toBeNull()
        ->and(Illuminate\Support\Str::isUuid($cr->slug))->toBeTrue();
});

it('does not overwrite slug if provided', function () {
    $cr = ContactRequest::factory()->create(['slug' => 'custom-slug']);

    expect($cr->slug)->toBe('custom-slug');
});

it('uses slug as route key name', function () {
    $cr = new ContactRequest;

    expect($cr->getRouteKeyName())->toBe('slug');
});

it('has correct fillable attributes', function () {
    $cr = new ContactRequest;

    expect($cr->getFillable())->toBe([
        'slug', 'name', 'email', 'phone', 'company', 'message', 'status', 'admin_notes',
    ]);
});

it('casts timestamps', function () {
    $cr = ContactRequest::factory()->create();

    expect($cr->created_at)->toBeInstanceOf(\Illuminate\Support\Carbon::class)
        ->and($cr->updated_at)->toBeInstanceOf(\Illuminate\Support\Carbon::class);
});
