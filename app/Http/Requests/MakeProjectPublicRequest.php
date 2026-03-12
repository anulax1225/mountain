<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MakeProjectPublicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'is_public' => 'required|boolean',
            'start_image_id' => [
                'nullable',
                'string',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            // 'start_image_id.required_if' => 'You must select a start image when making the project public.',
            // 'start_image_id.exists' => 'The selected start image must belong to this project.',
        ];
    }
}
