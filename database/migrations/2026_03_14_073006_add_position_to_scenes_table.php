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
        DB::table('scenes')
            ->select('id', 'project_id', 'created_at')
            ->orderBy('project_id')
            ->orderBy('created_at')
            ->get()
            ->groupBy('project_id')
            ->each(function ($scenes) {
                $scenes->values()->each(function ($scene, $index) {
                    DB::table('scenes')
                        ->where('id', $scene->id)
                        ->update(['position' => $index]);
                });
            });
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
