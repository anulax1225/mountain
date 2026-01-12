<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Sticker extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'image_id',
        'type',
        'content',
        'position_x',
        'position_y',
        'position_z',
        'scale',
        'rotation_x',
        'rotation_y',
        'rotation_z',
        'font_family',
        'font_size',
        'color',
        'background_color',
    ];

    protected $casts = [
        'position_x' => 'float',
        'position_y' => 'float',
        'position_z' => 'float',
        'scale' => 'float',
        'rotation_x' => 'float',
        'rotation_y' => 'float',
        'rotation_z' => 'float',
        'font_size' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($sticker) {
            if (empty($sticker->slug)) {
                $sticker->slug = (string) Str::uuid();
            }
        });
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }

    public function image(): BelongsTo
    {
        return $this->belongsTo(Image::class);
    }
}