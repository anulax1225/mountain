<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HotspotResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'position_x' => $this->position_x,
            'position_y' => $this->position_y,
            'position_z' => $this->position_z,
            'from_image' => new ImageResource($this->whenLoaded('fromImage')),
            'to_image' => new ImageResource($this->whenLoaded('toImage')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}