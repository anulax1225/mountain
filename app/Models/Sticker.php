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
        'text_color',
        'text_size',
        'text_font',
        'scale',
    ];

    protected $casts = [
        'position_x' => 'float',
        'position_y' => 'float',
        'position_z' => 'float',
        'text_size' => 'integer',
        'scale' => 'float',
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