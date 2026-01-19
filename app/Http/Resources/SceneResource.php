<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\MissingValue;

class SceneResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'name' => $this->name,
            'images' => ImageResource::collection($this->whenLoaded('images')),
            'hotspots' => HotspotResource::collection($this->whenLoaded('hotspots')),
            'project' => new ProjectResource($this->whenLoaded('project')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}