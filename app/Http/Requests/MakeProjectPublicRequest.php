<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MakeProjectPublicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $project = $this->route('project');

        return [
            'is_public' => 'required|boolean',
            'start_image_id' => [
                'string',
                // Rule::exists('images', 'slug')->where(function ($query) use ($project) {
                //     $query->whereHas('scene', function ($q) use ($project) {
                //         $q->where('project_id', $project->id);
                //     });
                // }),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            //'start_image_id.required_if' => 'You must select a start image when making the project public.',
            //'start_image_id.exists' => 'The selected start image must belong to this project.',
        ];
    }
}
