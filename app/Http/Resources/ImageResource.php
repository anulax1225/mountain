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
            'original_name' => $this->original_name,
            'path' => $this->path,
            'preview_path' => $this->preview_path,
            'size' => $this->size,
            'position' => $this->position,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'hotspots_from' => HotspotResource::collection($this->whenLoaded('hotspotsFrom')),
            'hotspots_to' => HotspotResource::collection($this->whenLoaded('hotspotsTo')),
            'stickers' => StickerResource::collection($this->whenLoaded('stickers')),
            'blur_regions' => BlurRegionResource::collection($this->whenLoaded('blurRegions')),
        ];
    }
}
