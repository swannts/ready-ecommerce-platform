<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductShopResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $lastOnline = $this->last_online >= now() ? true : false;

        $isBn = $request->attributes->get('api_locale', 'en') === 'bn';

        return [
            'id' => $this->id,
            'name' => $isBn ? ($this->name_bn ?: $this->name) : $this->name,
            'address' => $this->address,
            'logo' => $this->logo,
            'rating' => (float) ($this->supplier_rating ?? (($this->averageRating > 0) ? $this->averageRating : 5.0)),
            'estimated_delivery_time' => (string) ($this->estimated_delivery_time ?? '2-3 days'),
            'delivery_charge' => (float) getDeliveryCharge(1),
            'last_online' => $lastOnline,
            'slug' => $this->supplier_slug,
            'supplier_id' => $this->supplier_code,
            'banner_image' => $this->banner,
            'avatar_image' => $this->logo,
            'type' => $this->supplier_type,
            'location' => $this->address,
            'country' => $this->country,
            'verified' => (bool) $this->supplier_verified,
            'established_year' => $this->established_year,
            'review_count' => (int) $this->supplier_review_count,
            'capacity_metric_tons_monthly' => $this->capacity_metric_tons_monthly,
            'certifications' => $this->certifications ?? [],
        ];
    }
}
