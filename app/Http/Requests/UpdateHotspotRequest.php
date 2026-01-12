<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHotspotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'from_image_id' => 'sometimes|exists:images,id',
            'to_image_id' => 'sometimes|exists:images,id',
            'position_x' => 'sometimes|numeric',
            'position_y' => 'sometimes|numeric',
            'position_z' => 'sometimes|numeric',
            'target_rotation_x' => 'nullable|numeric',
            'target_rotation_y' => 'nullable|numeric',
            'target_rotation_z' => 'nullable|numeric',
            'custom_image' => 'nullable|string|max:255',
            'custom_color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ];
    }

    public function messages(): array
    {
        return [
            'custom_color.regex' => 'La couleur doit être au format hexadécimal (#RRGGBB)',
        ];
    }
}