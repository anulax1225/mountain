<?php

use App\Models\ContactRequest;

it('shows welcome page', function () {
    $this->get('/')->assertStatus(200);
});

it('shows login page', function () {
    $this->get('/login')->assertStatus(200);
});

it('shows pricing page', function () {
    $this->get('/pricing')->assertStatus(200);
});

it('shows contact page', function () {
    $this->get('/contact')->assertStatus(200);
});

it('creates contact request via web form', function () {
    $response = $this->post('/contact', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'message' => 'Hello, I have a question.',
    ]);

    $response->assertRedirect();
    expect(ContactRequest::where('email', 'john@example.com')->exists())->toBeTrue();
});

it('creates contact request via API', function () {
    $response = $this->postJson('/api/contact', [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'message' => 'I want to learn more.',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure(['message', 'slug']);

    expect(ContactRequest::where('email', 'jane@example.com')->exists())->toBeTrue();
});

it('validates contact form requires name email and message', function () {
    $response = $this->postJson('/api/contact', []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'email', 'message']);
});
