<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }

    public function isAdmin(): bool
    {
        return $this->slug === 'admin';
    }

    public function isClient(): bool
    {
        return $this->slug === 'client';
    }

    public function isViewer(): bool
    {
        return $this->slug === 'viewer';
    }
}