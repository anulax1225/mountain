<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Hotspot extends Model
{
    /** @use HasFactory<\Database\Factories\HotspotFactory> */
    use HasFactory;

    protected $fillable = [
        'slug',
        'scene_id',
        'from_image_id',
        'to_image_id',
        'position_x',
        'position_y',
        'position_z',
        'target_rotation_x',
        'target_rotation_y',
        'target_rotation_z',
    ];

    protected $casts = [
        'position_x' => 'float',
        'position_y' => 'float',
        'position_z' => 'float',
        'target_rotation_x' => 'float',
        'target_rotation_y' => 'float',
        'target_rotation_z' => 'float',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($hotspot) {
            if (empty($hotspot->slug)) {
                $hotspot->slug = (string) Str::uuid();
            }
        });
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }

    public function scene(): BelongsTo
    {
        return $this->belongsTo(Scene::class);
    }

    public function fromImage(): BelongsTo
    {
        return $this->belongsTo(Image::class, 'from_image_id');
    }

    public function toImage(): BelongsTo
    {
        return $this->belongsTo(Image::class, 'to_image_id');
    }
}