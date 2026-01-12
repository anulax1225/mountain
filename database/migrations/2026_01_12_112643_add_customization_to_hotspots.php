<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hotspots', function (Blueprint $table) {
            $table->string('custom_image')->nullable()->after('target_rotation_z');
            $table->string('custom_color')->nullable()->after('custom_image');
        });
    }

    public function down(): void
    {
        Schema::table('hotspots', function (Blueprint $table) {
            $table->dropColumn(['custom_image', 'custom_color']);
        });
    }
};