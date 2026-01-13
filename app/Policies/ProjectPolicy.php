<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProjectPolicy
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
     */
    public function view(User $user, Project $project): bool
    {
        if ($project->is_public) {
            return true;
        }

        if ($user->isAdmin()) {
            return true;
        }

        if ($user->id === $project->user_id) {
            return true;
        }

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
     */
    public function update(User $user, Project $project): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->id === $project->user_id) {
            return true;
        }

        return $user->canAccessProject($project, 'update');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Project $project): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $project->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Project $project): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $project->user_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Project $project): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $project->user_id;
    }

    /**
     * Determine whether the user can assign other users to the project.
     */
    public function assignUsers(User $user, Project $project): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $project->user_id;
    }

    /**
     * Determine whether the user can make the project public.
     */
    public function makePublic(User $user, Project $project): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $project->user_id;
    }
}