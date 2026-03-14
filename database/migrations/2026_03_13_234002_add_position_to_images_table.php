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
        Schema::table('images', function (Blueprint $table) {
            $table->unsignedInteger('position')->default(0)->after('preview_path');
        });

        // Backfill existing images with sequential positions per scene based on created_at
        DB::statement('
            UPDATE images
            JOIN (
                SELECT id, ROW_NUMBER() OVER (PARTITION BY scene_id ORDER BY created_at) - 1 AS row_pos
                FROM images
            ) AS ranked ON images.id = ranked.id
            SET images.position = ranked.row_pos
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('images', function (Blueprint $table) {
            $table->dropColumn('position');
        });
    }
};
