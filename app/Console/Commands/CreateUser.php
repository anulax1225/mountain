<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:create
                            {email : The email address of the user}
                            {--name= : The name of the user}
                            {--password= : The password (will be prompted if not provided)}
                            {--role=admin : The role to assign (admin or client)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new user with a specified role (admin by default)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $name = $this->option('name') ?? explode('@', $email)[0];
        $roleSlug = $this->option('role');

        // Check if user already exists
        if (User::where('email', $email)->exists()) {
            $this->error("A user with email '{$email}' already exists.");
            return 1;
        }

        // Get password
        $password = $this->option('password');
        if (!$password) {
            $password = $this->secret('Enter password for the user');
            if (!$password) {
                $this->error('Password is required.');
                return 1;
            }
            $confirmPassword = $this->secret('Confirm password');
            if ($password !== $confirmPassword) {
                $this->error('Passwords do not match.');
                return 1;
            }
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

        // Create user
        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
        ]);

        // Assign role
        $user->roles()->attach($role->id);

        $this->info("User created successfully:");
        $this->table(
            ['ID', 'Name', 'Email', 'Role'],
            [[$user->id, $user->name, $user->email, $role->name]]
        );

        return 0;
    }
}
