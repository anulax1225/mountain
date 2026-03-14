<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBlurRegionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'position_x' => 'required|numeric',
            'position_y' => 'required|numeric',
            'position_z' => 'required|numeric',
            'radius' => 'nullable|numeric|min:0.01|max:0.5',
            'intensity' => 'nullable|integer|min:1|max:50',
            'type' => 'nullable|string|in:gaussian,pixelate',
        ];
    }
}
