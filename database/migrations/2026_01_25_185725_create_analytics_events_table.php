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
        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('session_id', 64)->index(); // Anonymized session hash
            $table->enum('event_type', ['project_view', 'image_view', 'hotspot_click', 'session_end'])->index();
            $table->foreignId('image_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('hotspot_id')->nullable()->constrained()->nullOnDelete();
            $table->integer('duration_seconds')->nullable(); // For session_end events
            $table->string('referrer', 500)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->string('ip_hash', 64)->nullable(); // Anonymized IP
            $table->timestamp('created_at')->index();

            // Indexes for common queries
            $table->index(['project_id', 'created_at']);
            $table->index(['project_id', 'event_type', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_events');
    }
};
