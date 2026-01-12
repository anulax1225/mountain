<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'path' => $this->path,
            'size' => $this->size,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'hotspots_from' => HotspotResource::collection($this->whenLoaded('hotspotsFrom')),
            'hotspots_to' => HotspotResource::collection($this->whenLoaded('hotspotsTo')),
        ];
    }
}