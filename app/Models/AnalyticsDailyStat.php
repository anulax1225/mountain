<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyticsDailyStat extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'date',
        'total_views',
        'unique_visitors',
        'avg_duration_seconds',
        'total_image_views',
        'total_hotspot_clicks',
    ];

    protected $casts = [
        'date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the project these stats belong to
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
