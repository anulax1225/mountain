<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'user_id',
        'name',
        'description',
        'picture_path',
        'is_public',
        'start_image_id',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($project) {
            if (empty($project->slug)) {
                $project->slug = (string) Str::uuid();
            }
        });

        static::deleting(function ($project) {
            // Delete project picture if exists
            if ($project->picture_path && Storage::disk('public')->exists($project->picture_path)) {
                Storage::disk('public')->delete($project->picture_path);
            }

            // Delete all related scenes (which will cascade delete images and hotspots)
            $project->scenes()->delete();
        });
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scenes(): HasMany
    {
        return $this->hasMany(Scene::class);
    }

    public function startImage(): BelongsTo
    {
        return $this->belongsTo(Image::class, 'start_image_id');
    }

    public function assignedUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_user')
            ->withPivot('role_id')
            ->withTimestamps();
    }

    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
        ];
    }
}