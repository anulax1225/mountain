<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class Image extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'scene_id',
        'size',
        'name',
        'path',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($image) {
            if (empty($image->slug)) {
                $image->slug = (string) Str::uuid();
            }
        });

        static::deleting(function ($image) {
            // Delete the image file when the model is deleted
            if ($image->path && Storage::exists($image->path)) {
                Storage::delete($image->path);
            }

            // Delete related hotspots
            $image->hotspotsFrom()->delete();
            $image->hotspotsTo()->delete();
            
            // Delete related stickers
            $image->stickers()->delete();
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
        return $this->hasMany(Hotspot::class, 'from_image_id')->with('toImage');
    }

    public function hotspotsTo(): HasMany
    {
        return $this->hasMany(Hotspot::class, 'to_image_id')->with('fromImage');
    }

    public function stickers(): HasMany
    {
        return $this->hasMany(Sticker::class);
    }
}