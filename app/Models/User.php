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
        'invitation_token',
        'invitation_sent_at',
        'invitation_accepted_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'invitation_token',
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
            'invitation_sent_at' => 'datetime',
            'invitation_accepted_at' => 'datetime',
        ];
    }

    /**
     * Check if the user has a pending invitation.
     */
    public function hasPendingInvitation(): bool
    {
        return $this->invitation_token !== null && $this->invitation_accepted_at === null;
    }

    /**
     * Check if the user has completed registration.
     */
    public function hasCompletedRegistration(): bool
    {
        return $this->invitation_accepted_at !== null || $this->invitation_token === null;
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

    /**
     * Check if user can access a project with a specific permission.
     *
     * @param Project $project
     * @param string $permission 'view' or 'update'
     * @return bool
     */
    public function canAccessProject(Project $project, string $permission = 'view'): bool
    {
        // Global admins can access everything
        if ($this->isAdmin()) {
            return true;
        }

        // Project creator always has full access
        if ($project->user_id === $this->id) {
            return true;
        }

        // Check project-level assignment
        $access = $this->projectAccess()
            ->where('project_user.project_id', $project->id)
            ->first();

        if (!$access) {
            return false;
        }

        $role = Role::find($access->pivot->role_id);

        if (!$role) {
            return false;
        }

        // View permission: Owner or Viewer can view
        if ($permission === 'view') {
            return in_array($role->slug, ['owner', 'viewer']);
        }

        // Update permission: Only Owner can modify
        if ($permission === 'update') {
            return $role->slug === 'owner';
        }

        return false;
    }

    /**
     * Check if user is an Owner on a specific project.
     *
     * @param Project $project
     * @return bool
     */
    public function isProjectOwner(Project $project): bool
    {
        // Global admins are considered owners
        if ($this->isAdmin()) {
            return true;
        }

        // Project creator is always an owner
        if ($project->user_id === $this->id) {
            return true;
        }

        // Check project-level Owner role
        $access = $this->projectAccess()
            ->where('project_user.project_id', $project->id)
            ->first();

        if (!$access) {
            return false;
        }

        $role = Role::find($access->pivot->role_id);

        return $role && $role->slug === 'owner';
    }

    /**
     * Get all projects the user can view (own + assigned).
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function accessibleProjects()
    {
        // Global admins see all projects
        if ($this->isAdmin()) {
            return Project::all();
        }

        // Get own projects
        $ownProjectIds = $this->projects()->pluck('id');

        // Get assigned projects
        $assignedProjectIds = $this->projectAccess()->pluck('projects.id');

        // Merge and get unique
        $allProjectIds = $ownProjectIds->merge($assignedProjectIds)->unique();

        return Project::whereIn('id', $allProjectIds)->get();
    }
}