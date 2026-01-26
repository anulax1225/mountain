<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Scene extends Model
{
    /** @use HasFactory<\Database\Factories\SceneFactory> */
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'project_id',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($scene) {
            if (empty($scene->slug)) {
                $scene->slug = (string) Str::uuid();
            }
        });

        static::deleting(function ($scene) {
            // Cascade delete images (which will cascade delete hotspots and stickers)
            $scene->images()->each(fn ($image) => $image->delete());
            // Delete scene-level hotspots
            $scene->hotspots()->delete();
        });
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(Image::class);
    }

    public function hotspots(): HasMany
    {
        return $this->hasMany(Hotspot::class);
    }
}