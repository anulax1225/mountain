<?php

namespace App\Actions\ProjectUser;

use App\Models\Project;

class AssignProjectUser
{
    /**
     * @return array{message: string, created: bool}
     */
    public function __invoke(Project $project, int $userId, int $roleId): array
    {
        $existingAssignment = $project->assignedUsers()
            ->where('user_id', $userId)
            ->first();

        if ($existingAssignment) {
            $project->assignedUsers()->updateExistingPivot($userId, [
                'role_id' => $roleId,
            ]);

            return [
                'message' => 'User role updated successfully',
                'created' => false,
            ];
        }

        $project->assignedUsers()->attach($userId, [
            'role_id' => $roleId,
        ]);

        return [
            'message' => 'User assigned to project successfully',
            'created' => true,
        ];
    }
}
