<?php

namespace App\Actions\Contact;

use App\Models\ContactRequest;

class SubmitContactRequest
{
    public function __invoke(array $data): ContactRequest
    {
        return ContactRequest::create($data);
    }
}
