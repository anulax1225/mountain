<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StickerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'image_id' => $this->image_id,
            'type' => $this->type,
            'content' => $this->content,
            'position_x' => $this->position_x,
            'position_y' => $this->position_y,
            'position_z' => $this->position_z,
            'scale' => $this->scale,
            'rotation_x' => $this->rotation_x,
            'rotation_y' => $this->rotation_y,
            'rotation_z' => $this->rotation_z,
            'font_family' => $this->font_family,
            'font_size' => $this->font_size,
            'color' => $this->color,
            'background_color' => $this->background_color,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'image' => new ImageResource($this->whenLoaded('image')),
        ];
    }
}