<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentTheme extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'type',
        'logo_path',
        'logo_base64',
        'colors',
        'font_family',
        'header_text',
        'footer_text',
        'custom_html',
        'is_default',
    ];

    protected $casts = [
        'colors' => 'array',
        'is_default' => 'boolean',
    ];

    /**
     * Tenant workspace owning this theme.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get logo for embedding (prefers base64 for standalone printable documents).
     */
    public function getEmbeddableLogo(): ?string
    {
        if (!empty($this->logo_base64)) {
            return $this->logo_base64;
        }

        if (!empty($this->logo_path)) {
            $path = storage_path('app/public/' . $this->logo_path);
            if (file_exists($path)) {
                $mime = mime_content_type($path) ?: 'image/png';
                $data = file_get_contents($path);
                return 'data:' . $mime . ';base64,' . base64_encode($data);
            }
            return asset('storage/' . $this->logo_path);
        }

        return null;
    }
}
