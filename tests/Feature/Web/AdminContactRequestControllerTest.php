<?php

use App\Models\ContactRequest;

// ---------------------------------------------------------------------------
// index
// ---------------------------------------------------------------------------

it('admin sees contact requests index with ContactRequests component and prop', function () {
    $admin = createAdmin();
    ContactRequest::factory()->count(3)->create();

    $this->actingAs($admin)
        ->get(route('dashboard.admin.contact-requests'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/admin/ContactRequests')
            ->has('contactRequests')
        );
});

it('client gets 403 on contact requests index', function () {
    $client = createClient();

    $this->actingAs($client)
        ->get(route('dashboard.admin.contact-requests'))
        ->assertForbidden();
});

it('unauthenticated user is redirected to login from contact requests index', function () {
    $this->get(route('dashboard.admin.contact-requests'))
        ->assertRedirect(route('login'));
});

// ---------------------------------------------------------------------------
// update
// ---------------------------------------------------------------------------

it('admin can update contact request status', function () {
    $admin = createAdmin();
    $contactRequest = ContactRequest::factory()->received()->create();

    $this->actingAs($admin)
        ->put(route('web.admin.contact-requests.update', $contactRequest->slug), [
            'status' => 'in_process',
            'admin_notes' => 'Looking into this.',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('contact_requests', [
        'id' => $contactRequest->id,
        'status' => 'in_process',
        'admin_notes' => 'Looking into this.',
    ]);
});

it('client gets 403 on contact request update', function () {
    $client = createClient();
    $contactRequest = ContactRequest::factory()->received()->create();

    $this->actingAs($client)
        ->put(route('web.admin.contact-requests.update', $contactRequest->slug), [
            'status' => 'validated',
        ])
        ->assertForbidden();

    $this->assertDatabaseHas('contact_requests', [
        'id' => $contactRequest->id,
        'status' => 'received',
    ]);
});

it('invalid status fails validation on update', function () {
    $admin = createAdmin();
    $contactRequest = ContactRequest::factory()->received()->create();

    $this->actingAs($admin)
        ->put(route('web.admin.contact-requests.update', $contactRequest->slug), [
            'status' => 'invalid_status',
        ])
        ->assertSessionHasErrors('status');
});

it('update requires status', function () {
    $admin = createAdmin();
    $contactRequest = ContactRequest::factory()->received()->create();

    $this->actingAs($admin)
        ->put(route('web.admin.contact-requests.update', $contactRequest->slug), [
            'admin_notes' => 'Some notes',
        ])
        ->assertSessionHasErrors('status');
});

it('admin can update contact request with all valid statuses', function (string $status) {
    $admin = createAdmin();
    $contactRequest = ContactRequest::factory()->received()->create();

    $this->actingAs($admin)
        ->put(route('web.admin.contact-requests.update', $contactRequest->slug), [
            'status' => $status,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('contact_requests', [
        'id' => $contactRequest->id,
        'status' => $status,
    ]);
})->with(['received', 'in_process', 'refused', 'validated']);

// ---------------------------------------------------------------------------
// destroy
// ---------------------------------------------------------------------------

it('admin can delete a contact request', function () {
    $admin = createAdmin();
    $contactRequest = ContactRequest::factory()->create();

    $this->actingAs($admin)
        ->delete(route('web.admin.contact-requests.destroy', $contactRequest->slug))
        ->assertRedirect();

    $this->assertDatabaseMissing('contact_requests', ['id' => $contactRequest->id]);
});

it('client gets 403 on contact request destroy', function () {
    $client = createClient();
    $contactRequest = ContactRequest::factory()->create();

    $this->actingAs($client)
        ->delete(route('web.admin.contact-requests.destroy', $contactRequest->slug))
        ->assertForbidden();

    $this->assertDatabaseHas('contact_requests', ['id' => $contactRequest->id]);
});

it('unauthenticated user is redirected to login from contact request destroy', function () {
    $contactRequest = ContactRequest::factory()->create();

    $this->delete(route('web.admin.contact-requests.destroy', $contactRequest->slug))
        ->assertRedirect(route('login'));
});
