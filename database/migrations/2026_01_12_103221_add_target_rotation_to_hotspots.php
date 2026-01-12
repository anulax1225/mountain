<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hotspots', function (Blueprint $table) {
            $table->float('target_rotation_x')->nullable()->after('position_z');
            $table->float('target_rotation_y')->nullable()->after('target_rotation_x');
            $table->float('target_rotation_z')->nullable()->after('target_rotation_y');
        });
    }

    public function down(): void
    {
        Schema::table('hotspots', function (Blueprint $table) {
            $table->dropColumn(['target_rotation_x', 'target_rotation_y', 'target_rotation_z']);
        });
    }
};