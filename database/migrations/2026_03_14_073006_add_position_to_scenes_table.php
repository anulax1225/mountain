<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('scenes', function (Blueprint $table) {
            $table->unsignedInteger('position')->default(0)->after('name');
        });

        // Backfill existing scenes with sequential positions per project based on created_at
        DB::statement('
            UPDATE scenes
            JOIN (
                SELECT id, ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at) - 1 AS row_pos
                FROM scenes
            ) AS ranked ON scenes.id = ranked.id
            SET scenes.position = ranked.row_pos
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scenes', function (Blueprint $table) {
            $table->dropColumn('position');
        });
    }
};
