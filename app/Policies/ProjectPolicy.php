<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProjectPolicy
{
    /**
     * Determine whether the user can view any models.
     * Admin sees all projects, Client sees only own + assigned.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     * Allowed: public projects, Admin, project owner, or assigned users (Owner/Viewer).
     */
    public function view(User $user, Project $project): bool
    {
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
     * Only Admin can create projects.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the model.
     * Allowed: Admin, project owner, or assigned as Owner.
     */
    public function update(User $user, Project $project): bool
    {
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
     * Only Admin or project creator can delete (not collaborators).
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
     * Only Admin or project creator.
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
     * Only Admin or project creator.
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
     * Allowed: Admin, project owner, or assigned as Owner.
     */
    public function assignUsers(User $user, Project $project): bool
    {
        // Global admins can manage users on any project
        if ($user->isAdmin()) {
            return true;
        }

        // Project creator can always manage users
        if ($user->id === $project->user_id) {
            return true;
        }

        // Project Owners can manage collaborators
        return $user->isProjectOwner($project);
    }

    /**
     * Determine whether the user can make the project public.
     * Only Admin or project creator.
     */
    public function makePublic(User $user, Project $project): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $project->user_id;
    }
}
