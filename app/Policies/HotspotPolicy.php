<?php

namespace App\Policies;

use App\Models\Hotspot;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class HotspotPolicy
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
    public function view(User $user, Hotspot $hotspot): bool
    {
        $project = $hotspot->scene->project;

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
    public function update(User $user, Hotspot $hotspot): bool
    {
        $project = $hotspot->scene->project;

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
    public function delete(User $user, Hotspot $hotspot): bool
    {
        $project = $hotspot->scene->project;

        if ($user->isAdmin()) {
            return true;
        }

        if ($user->id === $project->user_id) {
            return true;
        }

        return $user->canAccessProject($project, 'update');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Hotspot $hotspot): bool
    {
        $project = $hotspot->scene->project;

        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $project->user_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Hotspot $hotspot): bool
    {
        $project = $hotspot->scene->project;

        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $project->user_id;
    }
}