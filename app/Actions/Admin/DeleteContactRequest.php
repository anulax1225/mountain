<?php

namespace App\Actions\Admin;

use App\Models\ContactRequest;

class DeleteContactRequest
{
    public function __invoke(ContactRequest $contactRequest): void
    {
        $contactRequest->delete();
    }
}
