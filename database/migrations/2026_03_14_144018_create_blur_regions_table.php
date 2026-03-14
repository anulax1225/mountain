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
        Schema::create('blur_regions', function (Blueprint $table) {
            $table->id();
            $table->uuid('slug')->unique();
            $table->foreignId('image_id')->constrained()->cascadeOnDelete();
            $table->double('position_x');
            $table->double('position_y');
            $table->double('position_z');
            $table->double('radius')->default(0.05);
            $table->integer('intensity')->default(10);
            $table->string('type')->default('gaussian');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blur_regions');
    }
};
