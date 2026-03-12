<?php

namespace App\Http\Controllers;

use App\Actions\Contact\SubmitContactRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
     * @bodyParam message string required Message content.
     *
     * @response 201 {"message": "...", "slug": "..."}
     */
    public function store(Request $request, SubmitContactRequest $submitContactRequest): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'company' => 'nullable|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $contactRequest = $submitContactRequest($validated);

        return response()->json([
            'message' => 'Votre demande a été envoyée avec succès. Nous vous contacterons bientôt.',
            'slug' => $contactRequest->slug,
        ], 201);
    }

    /**
     * Submit a contact request (web form)
     */
    public function webStore(Request $request, SubmitContactRequest $submitContactRequest): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'company' => 'nullable|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $submitContactRequest($validated);

        return back();
    }
}
