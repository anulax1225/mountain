<?php

namespace App\Http\Controllers;

use App\Actions\Admin\DeleteContactRequest;
use App\Actions\Admin\ListContactRequests;
use App\Actions\Admin\UpdateContactRequest;
use App\Http\Resources\ContactRequestResource;
use App\Models\ContactRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * @group Admin - Contact Requests
 *
 * Admin endpoints for managing contact requests
 */
class AdminContactRequestController extends Controller
{
    /**
     * Show contact requests page
     *
     * @authenticated
     */
    public function index(): InertiaResponse
    {
        $this->authorize('viewAny', ContactRequest::class);

        return Inertia::render('dashboard/admin/ContactRequests');
    }

    /**
     * List all contact requests
     *
     * @authenticated
     *
     * @apiResourceCollection App\Http\Resources\ContactRequestResource
     *
     * @apiResourceModel App\Models\ContactRequest
     */
    public function list(Request $request, ListContactRequests $listContactRequests): AnonymousResourceCollection
    {
        $this->authorize('viewAny', ContactRequest::class);

        $contactRequests = $listContactRequests(
            $request->input('status'),
            $request->input('search'),
            (int) $request->input('per_page', 15),
        );

        return ContactRequestResource::collection($contactRequests);
    }

    /**
     * Get a single contact request
     *
     * @authenticated
     *
     * @apiResource App\Http\Resources\ContactRequestResource
     *
     * @apiResourceModel App\Models\ContactRequest
     */
    public function show(ContactRequest $contactRequest): ContactRequestResource
    {
        $this->authorize('view', $contactRequest);

        return new ContactRequestResource($contactRequest);
    }

    /**
     * Update contact request status
     *
     * @authenticated
     *
     * @apiResource App\Http\Resources\ContactRequestResource
     *
     * @apiResourceModel App\Models\ContactRequest
     */
    public function update(Request $request, ContactRequest $contactRequest, UpdateContactRequest $updateContactRequest): ContactRequestResource
    {
        $this->authorize('update', $contactRequest);

        $validated = $request->validate([
            'status' => 'required|in:received,in_process,refused,validated',
            'admin_notes' => 'nullable|string|max:5000',
        ]);

        $contactRequest = $updateContactRequest($contactRequest, $validated);

        return new ContactRequestResource($contactRequest);
    }

    /**
     * Delete a contact request
     *
     * @authenticated
     *
     * @response 204
     */
    public function destroy(ContactRequest $contactRequest, DeleteContactRequest $deleteContactRequest): Response
    {
        $this->authorize('delete', $contactRequest);

        $deleteContactRequest($contactRequest);

        return response()->noContent();
    }
}
