<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add Owner role for project-level permissions (if not exists)
        if (!DB::table('roles')->where('slug', 'owner')->exists()) {
            DB::table('roles')->insert([
                'name' => 'Owner',
                'slug' => 'owner',
                'description' => 'Can modify project and manage collaborators',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // For SQLite: recreate project_user table with correct column type
        // First, backup existing data
        $existingData = DB::table('project_user')->get();

        // Drop the old table
        Schema::dropIfExists('project_user');

        // Recreate with correct column type
        Schema::create('project_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['project_id', 'user_id']);
        });

        // Restore data (if any existed)
        foreach ($existingData as $row) {
            DB::table('project_user')->insert([
                'project_id' => $row->project_id,
                'user_id' => $row->user_id,
                'role_id' => $row->role_id,
                'created_at' => $row->created_at,
                'updated_at' => $row->updated_at,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove Owner role
        DB::table('roles')->where('slug', 'owner')->delete();

        // Backup existing data
        $existingData = DB::table('project_user')->get();

        // Drop the table
        Schema::dropIfExists('project_user');

        // Recreate with original uuid column type
        Schema::create('project_user', function (Blueprint $table) {
            $table->id();
            $table->uuid('project_id');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->foreign('project_id')
                ->references('id')
                ->on('projects')
                ->cascadeOnDelete();

            $table->unique(['project_id', 'user_id']);
        });

        // Restore data (if any existed)
        foreach ($existingData as $row) {
            DB::table('project_user')->insert([
                'project_id' => $row->project_id,
                'user_id' => $row->user_id,
                'role_id' => $row->role_id,
                'created_at' => $row->created_at,
                'updated_at' => $row->updated_at,
            ]);
        }
    }
};
