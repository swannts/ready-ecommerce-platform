<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BrandResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $isBn = $request->attributes->get('api_locale', 'en') === 'bn';

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $isBn ? ($this->name_bn ?: $this->name) : $this->name,
            'thumbnail' => $this->thumbnail,
            'product_count' => $this->whenCounted('products'),
        ];
    }
}
