<?php

namespace App\Actions\Admin;

use App\Models\ContactRequest;

class UpdateContactRequest
{
    public function __invoke(ContactRequest $contactRequest, array $data): ContactRequest
    {
        $contactRequest->update($data);

        return $contactRequest;
    }
}
