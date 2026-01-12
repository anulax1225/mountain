<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHotspotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('hotspot'));
    }

    public function rules(): array
    {
        return [
            'from_image_id' => ['sometimes', 'required', 'exists:images,id'],
            'to_image_id' => ['sometimes', 'required', 'exists:images,id', 'different:from_image_id'],
            'position_x' => ['sometimes', 'required', 'numeric'],
            'position_y' => ['sometimes', 'required', 'numeric'],
            'position_z' => ['sometimes', 'required', 'numeric'],
        ];
    }
}