<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubscriptionTransaction extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'sales_id',
        'tenant_id',
        'action_type',
        'plan_name',
        'duration_days',
        'minutes_added',
        'previous_expires_at',
        'new_expires_at',
        'amount_collected',
        'notes',
        'created_at',
    ];

    protected $casts = [
        'duration_days' => 'integer',
        'minutes_added' => 'integer',
        'amount_collected' => 'decimal:2',
        'previous_expires_at' => 'datetime',
        'new_expires_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    /**
     * The sales agent who performed this subscription action.
     */
    public function salesAgent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sales_id');
    }

    /**
     * The tenant workspace affected by this subscription transaction.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
