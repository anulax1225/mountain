<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hotspots', function (Blueprint $table) {
            $table->float('position_x')->nullable()->after('to_image_id');
            $table->float('position_y')->nullable()->after('position_x');
            $table->float('position_z')->nullable()->after('position_y');
        });
    }

    public function down(): void
    {
        Schema::table('hotspots', function (Blueprint $table) {
            $table->dropColumn(['position_x', 'position_y', 'position_z']);
        });
    }
};