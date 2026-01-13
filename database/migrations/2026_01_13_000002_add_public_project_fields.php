<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->boolean('is_public')->default(false)->after('picture_path');
            $table->unsignedBigInteger('start_image_id')->nullable()->after('is_public');

            $table->foreign('start_image_id')
                ->references('id')
                ->on('images')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropForeign(['start_image_id']);
            $table->dropColumn(['is_public', 'start_image_id']);
        });
    }
};
