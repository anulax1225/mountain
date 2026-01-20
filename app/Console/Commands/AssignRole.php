<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\User;
use Illuminate\Console\Command;

class AssignRole extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:assign-role
                            {email : The email address of the user}
                            {role : The role to assign (admin or client)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assign a global role to an existing user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $roleSlug = $this->argument('role');

        // Find user
        $user = User::where('email', $email)->first();
        if (!$user) {
            $this->error("User with email '{$email}' not found.");
            return 1;
        }

        // Validate role
        $role = Role::where('slug', $roleSlug)->first();
        if (!$role) {
            $this->error("Role '{$roleSlug}' not found. Available roles: admin, client");
            return 1;
        }

        if (!$role->isGlobalRole()) {
            $this->error("Only global roles (admin, client) can be assigned. '{$roleSlug}' is a project-level role.");
            return 1;
        }

        // Remove existing global roles
        $globalRoleIds = Role::whereIn('slug', ['admin', 'client'])->pluck('id');
        $user->roles()->detach($globalRoleIds);

        // Assign new role
        $user->roles()->attach($role->id);

        $this->info("Role assigned successfully:");
        $this->table(
            ['ID', 'Name', 'Email', 'Role'],
            [[$user->id, $user->name, $user->email, $role->name]]
        );

        return 0;
    }
}
