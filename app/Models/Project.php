<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
        'photo',
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
            // Delete project photo if exists
            if ($project->photo && Storage::exists($project->photo)) {
                Storage::delete($project->photo);
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
}