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

    /**
     * Check if this is the global Admin role.
     */
    public function isAdmin(): bool
    {
        return $this->slug === 'admin';
    }

    /**
     * Check if this is the global Client role.
     */
    public function isClient(): bool
    {
        return $this->slug === 'client';
    }

    /**
     * Check if this is the project-level Owner role.
     */
    public function isOwner(): bool
    {
        return $this->slug === 'owner';
    }

    /**
     * Check if this is the Viewer role (used for project-level access).
     */
    public function isViewer(): bool
    {
        return $this->slug === 'viewer';
    }

    /**
     * Check if this role is a global role (Admin or Client).
     */
    public function isGlobalRole(): bool
    {
        return in_array($this->slug, ['admin', 'client']);
    }

    /**
     * Check if this role is a project-level role (Owner or Viewer).
     */
    public function isProjectRole(): bool
    {
        return in_array($this->slug, ['owner', 'viewer']);
    }
}