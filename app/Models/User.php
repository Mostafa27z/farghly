<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'current_tenant_id',
        'system_role',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Determine if user is a Super Admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->system_role === 'super_admin';
    }

    /**
     * Determine if user is a Sales agent.
     */
    public function isSales(): bool
    {
        return $this->system_role === 'sales';
    }

    /**
     * Determine if user is staff (super_admin or sales).
     */
    public function isStaff(): bool
    {
        return in_array($this->system_role, ['super_admin', 'sales']);
    }

    /**
     * Workspaces this user belongs to.
     */
    public function tenants()
    {
        return $this->belongsToMany(Tenant::class, 'tenant_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Currently active workspace.
     */
    public function currentTenant()
    {
        return $this->belongsTo(Tenant::class, 'current_tenant_id');
    }

    /**
     * Subscription transactions recorded by this sales agent.
     */
    public function salesTransactions()
    {
        return $this->hasMany(SubscriptionTransaction::class, 'sales_id');
    }

    /**
     * Tenants originally onboarded by this sales agent.
     */
    public function createdTenants()
    {
        return $this->hasMany(Tenant::class, 'created_by_sales_id');
    }

    /**
     * Get attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }
}
