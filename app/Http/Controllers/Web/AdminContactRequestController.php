<?php

namespace App\Http\Controllers\Web;

use App\Actions\Admin\DeleteContactRequest;
use App\Actions\Admin\UpdateContactRequest;
use App\Http\Controllers\Controller;
use App\Http\Resources\ContactRequestResource;
use App\Models\ContactRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminContactRequestController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', ContactRequest::class);

        $contactRequests = ContactRequest::orderByDesc('created_at')->get();

        return Inertia::render('dashboard/admin/ContactRequests', [
            'contactRequests' => ContactRequestResource::collection($contactRequests),
        ]);
    }

    public function update(Request $request, ContactRequest $contactRequest, UpdateContactRequest $updateContactRequest): RedirectResponse
    {
        $this->authorize('update', $contactRequest);

        $validated = $request->validate([
            'status' => 'required|in:received,in_process,refused,validated',
            'admin_notes' => 'nullable|string|max:5000',
        ]);

        $updateContactRequest($contactRequest, $validated);

        return back();
    }

    public function destroy(ContactRequest $contactRequest, DeleteContactRequest $deleteContactRequest): RedirectResponse
    {
        $this->authorize('delete', $contactRequest);

        $deleteContactRequest($contactRequest);

        return back();
    }
}
