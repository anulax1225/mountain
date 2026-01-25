<?php

namespace App\Policies;

use App\Models\Scene;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ScenePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     * Allowed: public projects, Admin, project owner, or assigned users (Owner/Viewer).
     */
    public function view(User $user, Scene $scene): bool
    {
        $project = $scene->project;

        // Public projects are viewable by everyone
        if ($project->is_public) {
            return true;
        }

        // Global admins can view everything
        if ($user->isAdmin()) {
            return true;
        }

        // Project creator can always view
        if ($user->id === $project->user_id) {
            return true;
        }

        // Check project-level access (Owner or Viewer)
        return $user->canAccessProject($project, 'view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     * Allowed: Admin, project owner, or assigned as Owner.
     */
    public function update(User $user, Scene $scene): bool
    {
        $project = $scene->project;

        // Global admins can update everything
        if ($user->isAdmin()) {
            return true;
        }

        // Project creator can always update
        if ($user->id === $project->user_id) {
            return true;
        }

        // Check if user is a project Owner
        return $user->canAccessProject($project, 'update');
    }

    /**
     * Determine whether the user can delete the model.
     * Allowed: Admin, project owner, or assigned as Owner.
     */
    public function delete(User $user, Scene $scene): bool
    {
        $project = $scene->project;

        // Global admins can delete everything
        if ($user->isAdmin()) {
            return true;
        }

        // Project creator can always delete
        if ($user->id === $project->user_id) {
            return true;
        }

        // Check if user is a project Owner
        return $user->canAccessProject($project, 'update');
    }

    /**
     * Determine whether the user can restore the model.
     * Only Admin or project creator.
     */
    public function restore(User $user, Scene $scene): bool
    {
        $project = $scene->project;

        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $project->user_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     * Only Admin or project creator.
     */
    public function forceDelete(User $user, Scene $scene): bool
    {
        $project = $scene->project;

        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $project->user_id;
    }
}
