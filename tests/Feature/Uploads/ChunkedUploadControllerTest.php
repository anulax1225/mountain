<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;

// ---------------------------------------------------------------------------
// Unauthenticated access
// ---------------------------------------------------------------------------

it('redirects unauthenticated request to direct upload', function () {
    $this->post('/uploads/direct')
        ->assertRedirect(route('login'));
});

it('redirects unauthenticated request to initiate', function () {
    $this->post('/uploads/initiate')
        ->assertRedirect(route('login'));
});

it('redirects unauthenticated request to upload part', function () {
    $this->post('/uploads/part')
        ->assertRedirect(route('login'));
});

it('redirects unauthenticated request to complete', function () {
    $this->post('/uploads/complete')
        ->assertRedirect(route('login'));
});

it('redirects unauthenticated request to abort', function () {
    $this->post('/uploads/abort')
        ->assertRedirect(route('login'));
});

// ---------------------------------------------------------------------------
// Validation – direct upload
// ---------------------------------------------------------------------------

it('direct upload requires file field', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/uploads/direct', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('file');
});

// ---------------------------------------------------------------------------
// Validation – initiate
// ---------------------------------------------------------------------------

it('initiate requires filename', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/uploads/initiate', ['content_type' => 'image/jpeg'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('filename');
});

it('initiate requires content_type', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/uploads/initiate', ['filename' => 'photo.jpg'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('content_type');
});

it('initiate requires both filename and content_type', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/uploads/initiate', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['filename', 'content_type']);
});

// ---------------------------------------------------------------------------
// Validation – upload part
// ---------------------------------------------------------------------------

it('upload part requires upload_id', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/uploads/part', [
            'key' => 'uploads/some-key',
            'part_number' => 1,
            'chunk' => UploadedFile::fake()->create('chunk.bin', 10),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('upload_id');
});

it('upload part requires key', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/uploads/part', [
            'upload_id' => 'some-upload-id',
            'part_number' => 1,
            'chunk' => UploadedFile::fake()->create('chunk.bin', 10),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('key');
});

it('upload part requires part_number', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/uploads/part', [
            'upload_id' => 'some-upload-id',
            'key' => 'uploads/some-key',
            'chunk' => UploadedFile::fake()->create('chunk.bin', 10),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('part_number');
});

it('upload part requires chunk file', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/uploads/part', [
            'upload_id' => 'some-upload-id',
            'key' => 'uploads/some-key',
            'part_number' => 1,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('chunk');
});

// ---------------------------------------------------------------------------
// Validation – complete
// ---------------------------------------------------------------------------

it('complete requires upload_id', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/uploads/complete', [
            'key' => 'uploads/some-key',
            'parts' => [['PartNumber' => 1, 'ETag' => '"abc123"']],
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('upload_id');
});

it('complete requires key', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/uploads/complete', [
            'upload_id' => 'some-upload-id',
            'parts' => [['PartNumber' => 1, 'ETag' => '"abc123"']],
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('key');
});

it('complete requires parts array', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/uploads/complete', [
            'upload_id' => 'some-upload-id',
            'key' => 'uploads/some-key',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('parts');
});

it('complete requires all fields', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/uploads/complete', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['upload_id', 'key', 'parts']);
});
