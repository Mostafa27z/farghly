<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'monthly_videos_limit',
        'monthly_recording_minutes_limit',
        'monthly_minutes_limit',
        'price',
        'max_team_members',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'monthly_videos_limit' => 'integer',
        'monthly_recording_minutes_limit' => 'integer',
        'monthly_minutes_limit' => 'integer',
        'price' => 'decimal:2',
        'max_team_members' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
