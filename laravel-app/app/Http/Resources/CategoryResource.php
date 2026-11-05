<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
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
            'thumbnail' => $this->thumbnail ?? null,
            'icon' => $this->icon ?? null,
            'banner' => $this->banner ?? null,
            'description' => $isBn ? ($this->description_bn ?: $this->description) : ($this->description ?? ''),
            'tagline' => $this->tagline,
            'grain_detail' => $this->grain_detail,
            'popular_uses' => $this->popular_uses,
            'display_image' => $this->display_image,
            'image' => $this->display_image ? asset($this->display_image) : $this->thumbnail,
            'color_bg' => $this->color_bg,
            'product_count' => (int) $this->products()->where('is_active', true)->count(),
            'sub_categories' => SubCategoryResource::collection($this->subCategories ?? []),
        ];
    }
}
