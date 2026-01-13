<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    public function projectAccess(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_user')
            ->withPivot('role_id')
            ->withTimestamps();
    }

    public function hasRole(string $roleName): bool
    {
        return $this->roles()->where('name', $roleName)->exists();
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('Admin');
    }

    public function isClient(): bool
    {
        return $this->hasRole('Client');
    }

    public function isViewer(): bool
    {
        return $this->hasRole('Viewer');
    }

    public function canAccessProject(Project $project, string $permission = 'view'): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        if ($project->user_id === $this->id) {
            return true;
        }

        $access = $this->projectAccess()
            ->where('project_id', $project->slug)
            ->first();

        if (!$access) {
            return false;
        }

        $roleId = $access->pivot->role_id;
        $role = Role::find($roleId);

        if (!$role) {
            return false;
        }

        if ($permission === 'view') {
            return in_array($role->name, ['Admin', 'Client', 'Viewer']);
        }

        if ($permission === 'update') {
            return in_array($role->name, ['Admin', 'Client']);
        }

        return false;
    }
}