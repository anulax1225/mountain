<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlurRegionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'image_id' => $this->image_id,
            'position_x' => $this->position_x,
            'position_y' => $this->position_y,
            'position_z' => $this->position_z,
            'radius' => $this->radius,
            'intensity' => $this->intensity,
            'type' => $this->type,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'image' => new ImageResource($this->whenLoaded('image')),
        ];
    }
}
