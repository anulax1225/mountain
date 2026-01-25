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
        Schema::create('analytics_daily_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->date('date')->index();
            $table->integer('total_views')->default(0);
            $table->integer('unique_visitors')->default(0);
            $table->integer('avg_duration_seconds')->default(0);
            $table->integer('total_image_views')->default(0);
            $table->integer('total_hotspot_clicks')->default(0);
            $table->timestamps();

            // Ensure one stat row per project per day
            $table->unique(['project_id', 'date']);
            $table->index(['project_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_daily_stats');
    }
};
