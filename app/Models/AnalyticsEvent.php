<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyticsEvent extends Model
{
    use HasFactory;

    public const UPDATED_AT = null; // Events are immutable, only created_at is needed

    protected $fillable = [
        'project_id',
        'session_id',
        'event_type',
        'image_id',
        'hotspot_id',
        'duration_seconds',
        'referrer',
        'user_agent',
        'ip_hash',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    // Event types
    public const TYPE_PROJECT_VIEW = 'project_view';
    public const TYPE_IMAGE_VIEW = 'image_view';
    public const TYPE_HOTSPOT_CLICK = 'hotspot_click';
    public const TYPE_SESSION_END = 'session_end';

    /**
     * Get the project this event belongs to
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the image if this is an image view event
     */
    public function image(): BelongsTo
    {
        return $this->belongsTo(Image::class);
    }

    /**
     * Get the hotspot if this is a hotspot click event
     */
    public function hotspot(): BelongsTo
    {
        return $this->belongsTo(Hotspot::class);
    }
}
