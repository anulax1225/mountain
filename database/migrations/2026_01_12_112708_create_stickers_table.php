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
            $table->uuid('slug');
            $table->foreignIdFor(\App\Models\Image::class);
            
            // Sticker type: 'emoji', 'image', 'text'
            $table->enum('type', ['emoji', 'image', 'text']);
            
            // Content based on type
            $table->text('content'); // emoji char, image path, or text content
            
            // Position in 3D space
            $table->float('position_x');
            $table->float('position_y');
            $table->float('position_z');
            
            // Optional styling for text stickers
            $table->string('text_color')->nullable();
            $table->integer('text_size')->nullable();
            $table->string('text_font')->nullable();
            
            // Optional sizing for all sticker types
            $table->float('scale')->default(1.0);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stickers');
    }
};