<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Image extends Model
{
    /** @use HasFactory<\Database\Factories\ImageFactory> */
    use HasFactory;

    protected $fillable = [
        'slug',
        'path',
        'size',
        'scene_id',
    ];

    protected $casts = [
        'size' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($image) {
            if (empty($image->slug)) {
                $image->slug = (string) Str::uuid();
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

    public function hotspotsFrom(): HasMany
    {
        return $this->hasMany(Hotspot::class, 'from_image_id');
    }

    public function hotspotsTo(): HasMany
    {
        return $this->hasMany(Hotspot::class, 'to_image_id');
    }
}