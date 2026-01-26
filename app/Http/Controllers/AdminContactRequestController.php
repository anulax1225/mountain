<?php

namespace App\Http\Controllers;

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
     * Get a paginated list of all contact requests. Admin only.
     *
     * @authenticated
     *
     * @queryParam status string Filter by status (received, in_process, refused, validated). Example: received
     * @queryParam search string Search by name, email, or company. Example: john
     * @queryParam per_page integer Items per page. Example: 20
     *
     * @apiResourceCollection App\Http\Resources\ContactRequestResource
     * @apiResourceModel App\Models\ContactRequest
     */
    public function list(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', ContactRequest::class);

        $query = ContactRequest::query()->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status') && in_array($request->status, ['received', 'in_process', 'refused', 'validated'])) {
            $query->where('status', $request->status);
        }

        // Search by name, email, or company
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%");
            });
        }

        $perPage = $request->input('per_page', 15);
        $contactRequests = $query->paginate($perPage);

        return ContactRequestResource::collection($contactRequests);
    }

    /**
     * Get a single contact request
     *
     * @authenticated
     *
     * @urlParam slug string required The contact request slug. Example: 550e8400-e29b-41d4-a716-446655440000
     *
     * @apiResource App\Http\Resources\ContactRequestResource
     * @apiResourceModel App\Models\ContactRequest
     */
    public function show(ContactRequest $contactRequest)
    {
        $this->authorize('view', $contactRequest);

        return new ContactRequestResource($contactRequest);
    }

    /**
     * Update contact request status
     *
     * @authenticated
     *
     * @urlParam slug string required The contact request slug. Example: 550e8400-e29b-41d4-a716-446655440000
     * @bodyParam status string required New status (received, in_process, refused, validated). Example: in_process
     * @bodyParam admin_notes string Admin notes about this request. Example: Called the client, waiting for more details.
     *
     * @apiResource App\Http\Resources\ContactRequestResource
     * @apiResourceModel App\Models\ContactRequest
     */
    public function update(Request $request, ContactRequest $contactRequest)
    {
        $this->authorize('update', $contactRequest);

        $validated = $request->validate([
            'status' => 'required|in:received,in_process,refused,validated',
            'admin_notes' => 'nullable|string|max:5000',
        ]);

        $contactRequest->update($validated);

        return new ContactRequestResource($contactRequest);
    }

    /**
     * Delete a contact request
     *
     * @authenticated
     *
     * @urlParam slug string required The contact request slug. Example: 550e8400-e29b-41d4-a716-446655440000
     *
     * @response 204
     */
    public function destroy(ContactRequest $contactRequest): Response
    {
        $this->authorize('delete', $contactRequest);

        $contactRequest->delete();

        return response()->noContent();
    }
}
