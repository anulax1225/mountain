<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class BlurRegion extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'image_id',
        'position_x',
        'position_y',
        'position_z',
        'radius',
        'intensity',
        'type',
    ];

    protected $casts = [
        'position_x' => 'float',
        'position_y' => 'float',
        'position_z' => 'float',
        'radius' => 'float',
        'intensity' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($blurRegion) {
            if (empty($blurRegion->slug)) {
                $blurRegion->slug = (string) Str::uuid();
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
