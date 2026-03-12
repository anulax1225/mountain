<?php

use App\Models\ContactRequest;

// ---------------------------------------------------------------------------
// list
// ---------------------------------------------------------------------------

it('admin can list contact requests and receives paginated JSON data', function () {
    $admin = createAdmin();
    ContactRequest::factory()->count(3)->create();

    $this->actingAs($admin)
        ->getJson('/admin/contact-requests')
        ->assertSuccessful()
        ->assertJsonStructure(['data', 'meta', 'links']);
});

it('client gets 403 on list contact requests', function () {
    $client = createClient();

    $this->actingAs($client)
        ->getJson('/admin/contact-requests')
        ->assertForbidden();
});

it('admin can filter contact requests by status', function () {
    $admin = createAdmin();
    ContactRequest::factory()->received()->create();
    ContactRequest::factory()->inProcess()->create();
    ContactRequest::factory()->validated()->create();

    $response = $this->actingAs($admin)
        ->getJson('/admin/contact-requests?status=received')
        ->assertSuccessful();

    $statuses = collect($response->json('data'))->pluck('status')->unique()->values()->toArray();
    expect($statuses)->toBe(['received']);
});

it('admin can search contact requests by name', function () {
    $admin = createAdmin();
    ContactRequest::factory()->create(['name' => 'Alice Dupont', 'email' => 'alice@example.com']);
    ContactRequest::factory()->create(['name' => 'Bob Martin', 'email' => 'bob@example.com']);

    $response = $this->actingAs($admin)
        ->getJson('/admin/contact-requests?search=Alice')
        ->assertSuccessful();

    $names = collect($response->json('data'))->pluck('name')->toArray();
    expect($names)->toContain('Alice Dupont');
    expect($names)->not->toContain('Bob Martin');
});

it('admin can search contact requests by email', function () {
    $admin = createAdmin();
    ContactRequest::factory()->create(['name' => 'Alice Dupont', 'email' => 'alice@example.com']);
    ContactRequest::factory()->create(['name' => 'Bob Martin', 'email' => 'bob@example.com']);

    $response = $this->actingAs($admin)
        ->getJson('/admin/contact-requests?search=alice@example.com')
        ->assertSuccessful();

    $emails = collect($response->json('data'))->pluck('email')->toArray();
    expect($emails)->toContain('alice@example.com');
    expect($emails)->not->toContain('bob@example.com');
});

// ---------------------------------------------------------------------------
// show
// ---------------------------------------------------------------------------

it('admin can show a single contact request', function () {
    $admin = createAdmin();
    $contactRequest = ContactRequest::factory()->received()->create();

    $this->actingAs($admin)
        ->getJson("/admin/contact-requests/{$contactRequest->slug}")
        ->assertSuccessful()
        ->assertJsonStructure(['id', 'slug', 'name', 'email', 'status', 'created_at']);
});

it('client gets 403 on show contact request', function () {
    $client = createClient();
    $contactRequest = ContactRequest::factory()->received()->create();

    $this->actingAs($client)
        ->getJson("/admin/contact-requests/{$contactRequest->slug}")
        ->assertForbidden();
});

// ---------------------------------------------------------------------------
// update
// ---------------------------------------------------------------------------

it('admin can update contact request status and receives updated resource', function () {
    $admin = createAdmin();
    $contactRequest = ContactRequest::factory()->received()->create();

    $this->actingAs($admin)
        ->putJson("/admin/contact-requests/{$contactRequest->slug}", [
            'status' => 'in_process',
            'admin_notes' => 'Looking into this.',
        ])
        ->assertSuccessful()
        ->assertJsonPath('status', 'in_process')
        ->assertJsonPath('admin_notes', 'Looking into this.');

    $this->assertDatabaseHas('contact_requests', [
        'id' => $contactRequest->id,
        'status' => 'in_process',
        'admin_notes' => 'Looking into this.',
    ]);
});

it('invalid status fails validation on update', function () {
    $admin = createAdmin();
    $contactRequest = ContactRequest::factory()->received()->create();

    $this->actingAs($admin)
        ->putJson("/admin/contact-requests/{$contactRequest->slug}", [
            'status' => 'invalid_status',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('status');
});

it('update requires status field', function () {
    $admin = createAdmin();
    $contactRequest = ContactRequest::factory()->received()->create();

    $this->actingAs($admin)
        ->putJson("/admin/contact-requests/{$contactRequest->slug}", [
            'admin_notes' => 'Some notes',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('status');
});

it('admin can update contact request with all valid statuses', function (string $status) {
    $admin = createAdmin();
    $contactRequest = ContactRequest::factory()->received()->create();

    $this->actingAs($admin)
        ->putJson("/admin/contact-requests/{$contactRequest->slug}", [
            'status' => $status,
        ])
        ->assertSuccessful()
        ->assertJsonPath('status', $status);
})->with(['received', 'in_process', 'refused', 'validated']);

it('client gets 403 on update contact request', function () {
    $client = createClient();
    $contactRequest = ContactRequest::factory()->received()->create();

    $this->actingAs($client)
        ->putJson("/admin/contact-requests/{$contactRequest->slug}", [
            'status' => 'validated',
        ])
        ->assertForbidden();

    $this->assertDatabaseHas('contact_requests', [
        'id' => $contactRequest->id,
        'status' => 'received',
    ]);
});

// ---------------------------------------------------------------------------
// destroy
// ---------------------------------------------------------------------------

it('admin can delete contact request and receives 204', function () {
    $admin = createAdmin();
    $contactRequest = ContactRequest::factory()->create();

    $this->actingAs($admin)
        ->deleteJson("/admin/contact-requests/{$contactRequest->slug}")
        ->assertNoContent();

    $this->assertDatabaseMissing('contact_requests', ['id' => $contactRequest->id]);
});

it('client gets 403 on delete contact request', function () {
    $client = createClient();
    $contactRequest = ContactRequest::factory()->create();

    $this->actingAs($client)
        ->deleteJson("/admin/contact-requests/{$contactRequest->slug}")
        ->assertForbidden();

    $this->assertDatabaseHas('contact_requests', ['id' => $contactRequest->id]);
});
