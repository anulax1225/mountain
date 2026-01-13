<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'description' => $this->description,
            'picture_path' => $this->picture_path,
            'photo' => $this->picture_path, // Alias for backward compatibility
            'is_public' => $this->is_public ?? false,
            'start_image_id' => $this->start_image_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user' => $this->whenLoaded('user'),
            'scenes' => SceneResource::collection($this->whenLoaded('scenes')),
            'start_image' => $this->whenLoaded('startImage'),
        ];
    }
}