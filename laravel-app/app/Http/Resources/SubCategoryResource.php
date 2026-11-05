<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubCategoryResource extends JsonResource
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
            'id' => $this->id ?? null,
            'slug' => $this->slug ?? null,
            'name' => $isBn ? ($this->name_bn ?: $this->name) : ($this->name ?? null),
            'short_description' => $isBn ? ($this->short_description_bn ?: $this->short_description) : ($this->short_description ?? null),
            'thumbnail' => $this->thumbnail ?? null,
        ];
    }
}
