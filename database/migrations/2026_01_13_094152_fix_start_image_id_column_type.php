<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            // Drop the existing foreign key
            $table->dropForeign(['start_image_id']);

            // Change the column type from uuid to unsignedBigInteger
            $table->unsignedBigInteger('start_image_id')->nullable()->change();

            // Re-add the foreign key constraint
            $table->foreign('start_image_id')
                ->references('id')
                ->on('images')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            // Drop the foreign key
            $table->dropForeign(['start_image_id']);

            // Change back to uuid
            $table->uuid('start_image_id')->nullable()->change();

            // Re-add the foreign key constraint
            $table->foreign('start_image_id')
                ->references('id')
                ->on('images')
                ->nullOnDelete();
        });
    }
};
