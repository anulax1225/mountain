<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBlurRegionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'position_x' => 'sometimes|numeric',
            'position_y' => 'sometimes|numeric',
            'position_z' => 'sometimes|numeric',
            'radius' => 'sometimes|numeric|min:0.01|max:0.5',
            'intensity' => 'sometimes|integer|min:1|max:50',
            'type' => 'sometimes|string|in:gaussian,pixelate',
        ];
    }
}
