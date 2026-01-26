<?php

namespace App\Http\Controllers;

use App\Models\ContactRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * @group Contact
 *
 * Public contact form submission
 */
class ContactRequestController extends Controller
{
    /**
     * Show the contact form
     */
    public function show(): InertiaResponse
    {
        return Inertia::render('Contact');
    }

    /**
     * Submit a contact request
     *
     * Public endpoint for submitting contact forms. No authentication required.
     *
     * @bodyParam name string required Contact person's name. Example: John Doe
     * @bodyParam email string required Contact email address. Example: john@example.com
     * @bodyParam phone string Phone number. Example: +33 6 12 34 56 78
     * @bodyParam company string Company name. Example: Acme Corp
     * @bodyParam message string required Message content. Example: I'm interested in your virtual tour services.
     *
     * @response 201 {
     *   "message": "Votre demande a été envoyée avec succès. Nous vous contacterons bientôt.",
     *   "slug": "550e8400-e29b-41d4-a716-446655440000"
     * }
     * @response 422 {"message": "The given data was invalid.", "errors": {"email": ["The email field is required."]}}
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'company' => 'nullable|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $contactRequest = ContactRequest::create($validated);

        return response()->json([
            'message' => 'Votre demande a été envoyée avec succès. Nous vous contacterons bientôt.',
            'slug' => $contactRequest->slug,
        ], 201);
    }
}
