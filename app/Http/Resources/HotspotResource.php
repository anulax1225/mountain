<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HotspotResource extends JsonResource
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
            'from_image' => new ImageResource($this->whenLoaded('fromImage')),
            'to_image' => new ImageResource($this->whenLoaded('toImage')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}