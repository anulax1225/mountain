<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ContactRequest extends Model
{
    use HasFactory;
    protected $fillable = [
        'slug',
        'name',
        'email',
        'phone',
        'company',
        'message',
        'status',
        'admin_notes',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Boot the model and generate slug
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($contactRequest) {
            if (empty($contactRequest->slug)) {
                $contactRequest->slug = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
