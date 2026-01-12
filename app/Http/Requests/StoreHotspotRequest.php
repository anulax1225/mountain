<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreHotspotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Hotspot::class);
    }

    public function rules(): array
    {
        return [
            'from_image_id' => ['required', 'exists:images,id'],
            'to_image_id' => ['required', 'exists:images,id', 'different:from_image_id'],
            'position_x' => ['required', 'numeric'],
            'position_y' => ['required', 'numeric'],
            'position_z' => ['required', 'numeric'],
            'target_rotation_x' => ['nullable', 'numeric'],
            'target_rotation_y' => ['nullable', 'numeric'],
            'target_rotation_z' => ['nullable', 'numeric'],
        ];
    }
}