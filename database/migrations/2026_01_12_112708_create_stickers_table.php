<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stickers', function (Blueprint $table) {
            $table->id();
            $table->uuid('slug')->unique();
            $table->foreignId('image_id')->constrained()->onDelete('cascade');
            $table->string('type'); // 'emoji', 'image', 'text'
            $table->text('content'); // emoji char, image path, or text content
            $table->float('position_x');
            $table->float('position_y');
            $table->float('position_z');
            $table->float('scale')->default(1.0);
            $table->float('rotation_x')->nullable();
            $table->float('rotation_y')->nullable();
            $table->float('rotation_z')->nullable();
            $table->string('font_family')->nullable();
            $table->integer('font_size')->nullable();
            $table->string('color')->nullable();
            $table->string('background_color')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stickers');
    }
};