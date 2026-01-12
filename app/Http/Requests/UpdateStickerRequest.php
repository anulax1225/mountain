<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStickerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'sometimes|string|in:emoji,image,text',
            'content' => 'sometimes|string',
            'position_x' => 'sometimes|numeric',
            'position_y' => 'sometimes|numeric',
            'position_z' => 'sometimes|numeric',
            'scale' => 'sometimes|numeric|min:0.1|max:10',
            'rotation_x' => 'nullable|numeric',
            'rotation_y' => 'nullable|numeric',
            'rotation_z' => 'nullable|numeric',
            'font_family' => 'nullable|string|max:255',
            'font_size' => 'nullable|integer|min:8|max:200',
            'color' => 'nullable|string|max:50',
            'background_color' => 'nullable|string|max:50',
        ];
    }
}