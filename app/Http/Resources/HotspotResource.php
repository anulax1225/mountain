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
            'target_rotation_x' => $this->target_rotation_x,
            'target_rotation_y' => $this->target_rotation_y,
            'target_rotation_z' => $this->target_rotation_z,
            'from_image_id' => $this->from_image_id,
            'to_image_id' => $this->to_image_id,
            'custom_image' => $this->custom_image,
            'custom_color' => $this->custom_color,
            'from_image' => new ImageResource($this->whenLoaded('fromImage')),
            'to_image' => new ImageResource($this->whenLoaded('toImage')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}